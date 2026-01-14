import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { BADGES, PLAYERS } from '@/app/data/products';

// Initialize Stripe without explicit apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_key', {
  typescript: true,
});

function getPlayerFromCode(code: string) {
    const p = PLAYERS.find(pl => pl.code === code);
    return p ? { name: p.name, number: p.number } : null;
}

function getBadgeFromCode(code: string) {
    const b = BADGES.find(bg => bg.code === code);
    return b ? { name: b.label, sku: b.sku } : null;
}

interface Customization {
    name?: string;
    number?: string;
    badges?: { sku: string; name: string }[];
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');

  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing in environment variables');
      return NextResponse.json({ error: 'Server misconfiguration: Missing Stripe Key' }, { status: 500 });
  }

  try {
    // Fetch sessions directly from Stripe
    // Note: We cannot expand 'line_items.data.price.product' in list() because it exceeds 4 levels of depth.
    // So we list first, then retrieve each session individually to get full product metadata.
    console.log('Fetching Stripe sessions list...');
    const sessionsList = await stripe.checkout.sessions.list({
        limit: 50,
        expand: ['data.payment_intent']
    });
    console.log(`Fetched ${sessionsList.data.length} sessions (summary). Retrieving details...`);

    // Fetch full details for each session in parallel to get deep expansion
    const detailedSessions = await Promise.all(
        sessionsList.data.map(async (session) => {
            try {
                return await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items.data.price.product']
                });
            } catch (e) {
                console.error(`Failed to retrieve details for session ${session.id}`, e);
                return null;
            }
        })
    );

    const validSessions = detailedSessions.filter((s): s is Stripe.Response<Stripe.Checkout.Session> => s !== null);

    const orders = validSessions.map(session => {
        try {
            const lineItems = session.line_items?.data || [];
            
            const items = lineItems.map(item => {
                 let sku = 'UNKNOWN';
                 let customization: Customization = {};
                 let size = null;
    
                 // Attempt to extract from product object if expanded
                 const product = item.price?.product as Stripe.Product | string | null;
                 
                 if (product && typeof product === 'object' && product.metadata) {
                     sku = product.metadata.sku || product.name;
                     size = product.metadata.size || null;
                     
                     // 1. Check for coded player
                     if (product.metadata.pCode) {
                         const p = getPlayerFromCode(product.metadata.pCode);
                         if (p) {
                             customization.name = p.name;
                             customization.number = p.number;
                         } else {
                             customization.name = 'Unknown Code: ' + product.metadata.pCode;
                         }
                     } else {
                         // 2. Check for explicit custom name/num
                         if (product.metadata.cName) customization.name = product.metadata.cName;
                         if (product.metadata.cNum) customization.number = product.metadata.cNum;
                     }
    
                     // 3. Check for badges
                     if (product.metadata.bCodes) {
                         const codes = product.metadata.bCodes.split(',');
                         customization.badges = codes.map((c: string) => {
                             const b = getBadgeFromCode(c);
                             return b ? { sku: b.sku, name: b.name } : { sku: c, name: 'Unknown' };
                         });
                     }
    
                     // 4. Legacy fallback
                     if (!customization.name && product.metadata.customization) {
                         try {
                             const oldCust = JSON.parse(product.metadata.customization);
                             // Merge carefully
                             customization = { ...oldCust, ...customization };
                         } catch (e) {
                             console.error('Error parsing legacy customization JSON', e);
                         }
                     }
                 } else {
                     // Fallback to description parsing or item name
                     sku = item.description || 'Product';
                 }
    
                 return {
                     sku: (product && typeof product === 'object') ? product.name : sku,
                     product_name: item.description, // Description contains details
                     quantity: item.quantity,
                     size: size,
                     customization: customization,
                     price: (item.amount_total / 100).toFixed(2)
                 };
            });
    
            return {
                id: session.id, // String ID
                created_at: new Date(session.created * 1000).toISOString(),
                customer_email: session.customer_details?.email || session.customer_email || 'N/A',
                customer_name: session.customer_details?.name || 'N/A',
                amount_total: (session.amount_total ? session.amount_total / 100 : 0).toFixed(2),
                status: session.payment_status,
                items: items,
                utm_source: session.metadata?.utm_source || '',
                payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
            };
        } catch (innerError) {
            console.error('Error processing session:', session.id, innerError);
            return null; // Skip malformed sessions
        }
    }).filter(order => order !== null); // Remove nulls

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching leads from Stripe:', error);
    return NextResponse.json({ error: `Stripe Error: ${(error as Error).message}` }, { status: 500 });
  }
}
