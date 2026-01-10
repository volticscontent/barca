import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_key', {
  typescript: true,
});

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
  }

  try {
    const { cartItems, utmParams } = await request.json();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Map cart items to Stripe line items
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image.startsWith('http') ? item.image : `${origin}${item.image}`] : [],
          metadata: {
            id: String(item.id),
            size: item.size,
            customization: item.customization ? JSON.stringify(item.customization).substring(0, 450) : null
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Metadata to track order details
    const metadata = {
        ...utmParams,
        // Store simple cart summary in metadata just in case
        cart_summary: JSON.stringify(cartItems.map((i: any) => ({id: i.id, q: i.quantity, s: i.size}))).substring(0, 450)
    };

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: line_items,
      mode: 'payment',
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      // automatic_tax: { enabled: true }, // Disabled to prevent configuration errors
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'IT', 'ES', 'PT', 'NL', 'AT'],
      },
      phone_number_collection: {
        enabled: true,
      },
      locale: 'fr',
      metadata: metadata,
      custom_text: {
        submit: {
            message: 'Paiement sécurisé par Stripe'
        }
      }
    });

    console.log('Session created:', session.id);
    console.log('Session mode:', session.mode);
    console.log('Session ui_mode:', session.ui_mode);
    console.log('Session client_secret:', session.client_secret ? 'Present' : 'Missing');

    if (!session.client_secret) {
        console.error('Session created but client_secret is missing. Full session:', JSON.stringify(session, null, 2));
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
