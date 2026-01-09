import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion is omitted to use the default version pinned by the SDK types
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { amount, cartItems, utmParams } = await request.json();

    // Simplify cart items to fit within Stripe metadata limit (500 chars)
    // Only keep essential info: id, name, qty
    const simplifiedItems = cartItems.map((item: any) => ({
      id: item.id,
      name: item.name.substring(0, 20), // Truncate name
      qty: item.quantity || item.qty
    }));

    let cartItemsString = JSON.stringify(simplifiedItems);
    
    // If still too long, truncate safely
    if (cartItemsString.length > 490) {
        cartItemsString = cartItemsString.substring(0, 490) + "...";
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        cart_items: cartItemsString,
        ...utmParams
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Internal Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
