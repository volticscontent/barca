import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendToUtmify, UtmifyPayload } from '../../lib/utmify';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_key', {
  typescript: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    const customerDetails = session.customer_details;
    const metadata = session.metadata || {};

    // Prepare Utmify Payload
    if (session.status === 'complete') {
        try {
            const lineItems = session.line_items?.data || [];
            const products = lineItems.map(item => ({
                id: item.price?.product as string || 'unknown',
                name: item.description || 'Product',
                planId: item.price?.product as string || 'unknown',
                planName: item.description || 'Product',
                quantity: item.quantity || 1,
                priceInCents: item.amount_total,
                size: item.description?.match(/Taille: (.*?)(?: -|$)/)?.[1] || 'N/A'
            }));

            const payload: UtmifyPayload = {
                orderId: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent as Stripe.PaymentIntent)?.id || session.id,
                platform: 'Stripe', 
                paymentMethod: 'credit_card', 
                status: 'paid',
                createdAt: new Date(session.created * 1000).toISOString().replace('T', ' ').substring(0, 19),
                approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                customer: {
                    name: customerDetails?.name || 'Customer',
                    email: customerDetails?.email || 'customer@example.com',
                    phone: customerDetails?.phone || '', 
                    document: null,
                    firstName: customerDetails?.name?.split(' ')[0] || 'Customer', 
                    lastName: customerDetails?.name?.split(' ').slice(1).join(' ') || '',
                    address: {
                        street: customerDetails?.address?.line1 || '',
                        number: '',
                        neighborhood: '',
                        city: customerDetails?.address?.city || '',
                        state: customerDetails?.address?.state || '',
                        country: customerDetails?.address?.country || '',
                        zipCode: customerDetails?.address?.postal_code || ''
                    }
                },
                products: products,
                trackingParameters: {
                    src: metadata.src || null,
                    sck: metadata.sck || null,
                    utm_source: metadata.utm_source || null,
                    utm_medium: metadata.utm_medium || null,
                    utm_campaign: metadata.utm_campaign || null,
                    utm_term: metadata.utm_term || null,
                    utm_content: metadata.utm_content || null,
                },
                commission: {
                    totalPriceInCents: session.amount_total || 0,
                    gatewayFeeInCents: 0,
                    userCommissionInCents: session.amount_total || 0,
                    currency: session.currency ? session.currency.toUpperCase() : 'EUR'
                }
            };

            await sendToUtmify(payload);

        } catch (err) {
            console.error('Error sending Utmify payload:', err);
        }
    }

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      customer_details: session.customer_details, // Return full details for Meta CAPI/Pixel
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      line_items: session.line_items?.data
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: 'Error retrieving session' },
      { status: 500 }
    );
  }
}
