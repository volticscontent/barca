import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/app/lib/db';
import { MAIN_PRODUCT, RELATED_PRODUCTS, BADGES, PLAYERS } from '@/app/data/products';

// Initialize Stripe without explicit apiVersion to use the installed SDK's default
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_key', {
  typescript: true,
});

function getSku(id: string | number): string {
    const idStr = String(id);
    
    // Check Main Product
    if (idStr === MAIN_PRODUCT.id || idStr.startsWith(`${MAIN_PRODUCT.id}-`)) {
        return MAIN_PRODUCT.sku;
    }
    
    // Check Related Products
    const related = RELATED_PRODUCTS.find(p => idStr === p.id || idStr.startsWith(`${p.id}-`));
    if (related && related.sku) return related.sku;

    // Check Badges
    const badge = BADGES.find(b => idStr === b.id || idStr.startsWith(`${b.id}-`));
    if (badge && badge.sku) return badge.sku;

    return 'UNKNOWN-SKU';
}

function getBadgeCode(id: string): string {
    const badge = BADGES.find(b => b.id === id || b.sku === id);
    return badge ? badge.code : 'B-UNK';
}

function getPlayerCode(name: string, number: string): string | null {
    if (!name || !number) return null;
    const player = PLAYERS.find(p => 
        p.name.toUpperCase() === name.toUpperCase() && 
        p.number === number
    );
    return player ? player.code : null;
}

interface Badge {
    id?: string | number;
    sku?: string;
}

interface Details {
    name?: string;
    number?: number;
}

interface Customization {
    details?: Details;
    badge?: Badge | null;
    badges?: Badge[];
}

interface CartItem {
    id: string | number;
    name: string;
    price: number;
    quantity?: number;
    size?: string;
    customization?: Customization | null;
}

interface MinMetadata {
    sku: string;
    size: string | null;
    pCode?: string;
    cName?: string;
    cNum?: number;
    bCodes?: string;
    [key: string]: string | number | null | undefined;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
  }

  try {
    const { cartItems, utmParams } = await request.json();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 1. Create Order in DB (Pending)
    const client = await pool.connect();
    let orderId;
    let totalAmount = 0;

    try {
        await client.query('BEGIN');

        // Calculate total
        cartItems.forEach((item: { id: string | number, price: number, quantity?: number }) => {
            totalAmount += item.price * (item.quantity || 1);
        });

        const orderRes = await client.query(`
            INSERT INTO orders (
                status, 
                amount_total, 
                utm_source, 
                utm_medium, 
                utm_campaign, 
                utm_term, 
                utm_content
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [
            'pending', 
            totalAmount, 
            utmParams?.utm_source || null, 
            utmParams?.utm_medium || null, 
            utmParams?.utm_campaign || null, 
            utmParams?.utm_term || null, 
            utmParams?.utm_content || null
        ]);
        
        orderId = orderRes.rows[0].id;

        for (const item of cartItems) {
            const sku = getSku(item.id);
            await client.query(`
                INSERT INTO order_items (order_id, sku, product_name, quantity, size, customization, price)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                orderId, 
                sku, 
                item.name, // Internal name for reference
                item.quantity || 1, 
                item.size || null, 
                item.customization ? JSON.stringify(item.customization) : null, 
                item.price
            ]);
        }
        await client.query('COMMIT');
    } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('Database transaction failed:', dbError);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    } finally {
        client.release();
    }

    // 2. Create Stripe Session with minimal info
    const line_items = cartItems.map((item: CartItem) => {
      const sku = getSku(item.id);
      
      // Construct description for Stripe (visible to user and admin)
      const descParts = [];
      if (item.size) descParts.push(`Size: ${item.size}`);
      
      let playerCode = null;
      const badgeCodes: string[] = [];

      if (item.customization) {
          const { details, badge } = item.customization;
          const cName = details?.name;
          const cNum = details?.number;

          // Check for player code
          if (cName && cNum) {
               playerCode = getPlayerCode(cName, String(cNum));
          }

          if (playerCode) {
               descParts.push(`Player: ${playerCode}`);
          } else {
              if (cName) descParts.push(`Name: ${cName}`);
              if (cNum) descParts.push(`Num: ${cNum}`);
          }

          // Handle single badge (from CartContext type) or badges array (legacy/robustness)
          if (badge) {
               const bCode = getBadgeCode(String(badge.id || badge.sku || ''));
               badgeCodes.push(bCode);
               descParts.push(`Badge: ${bCode}`);
          } else if (item.customization.badges && Array.isArray(item.customization.badges)) {
               // Fallback if structure changes to array
               const codes = item.customization.badges.map((b: Badge) => getBadgeCode(String(b.id || b.sku)));
               badgeCodes.push(...codes);
               descParts.push(`Badges: ${codes.join(', ')}`);
          }
      }
      const description = descParts.length > 0 ? descParts.join(' | ') : undefined;
      
      // Minimized metadata
      const minMetadata: MinMetadata = {
          sku: sku,
          size: item.size || null,
      };
      
      if (playerCode) minMetadata.pCode = playerCode;
      else if (item.customization?.details) {
          if (item.customization.details.name) minMetadata.cName = item.customization.details.name;
          if (item.customization.details.number) minMetadata.cNum = item.customization.details.number;
      }
      
      if (badgeCodes.length > 0) minMetadata.bCodes = badgeCodes.join(',');

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: sku, // Only SKU sent to Stripe
            description: description ? description.substring(0, 1000) : undefined,
            // No images
            metadata: minMetadata
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      ui_mode: 'embedded',
      line_items: line_items,
      mode: 'payment',
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      shipping_address_collection: {
        allowed_countries: ['ES'],
      },
      phone_number_collection: {
        enabled: true,
      },
      locale: 'es',
      metadata: {
        order_id: orderId.toString(),
        ...utmParams
      },
      custom_text: {
        submit: {
            message: 'Pago seguro con Stripe'
        }
      },
      payment_method_options: {
        card: {
          installments: {
            enabled: false,
          },
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 3. Update Order with Stripe Session ID
    await pool.query('UPDATE orders SET stripe_session_id = $1 WHERE id = $2', [session.id, orderId]);

    if (!session.client_secret) {
        return NextResponse.json({ error: 'Failed to generate client_secret' }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
    });

  } catch (error) {
    console.error('Internal Error in create-checkout-session:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
