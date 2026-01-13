import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import pool from '../../lib/db';
import { sendToUtmify, UtmifyPayload } from '../../lib/utmify';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_build_key', {
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe Secret Key missing');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!webhookSecret || !signature) {
        console.warn('Webhook secret or signature missing');
        return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${(err as Error).message}`);
      return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout Session completed: ${session.id}`);
        await saveOrderFromSession(session);
        break;

      case 'checkout.session.async_payment_succeeded':
        const asyncSession = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Async Payment succeeded: ${asyncSession.id}`);
        await saveOrderFromSession(asyncSession);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntentFailed.last_payment_error?.message}`);
        break;

      default:
        // console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook handler failed: ${(err as Error).message}`);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function saveOrderFromSession(session: Stripe.Checkout.Session) {
    try {
        // Retrieve session with line_items to get product details
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items']
        });

        const metadata = expandedSession.metadata || {};
        const customerDetails = expandedSession.customer_details;
        const lineItems = expandedSession.line_items?.data || [];

        // Prepare products for DB and UTMify
        const products = lineItems.map(item => ({
            id: item.price?.product as string || 'unknown',
            name: item.description || 'Product',
            planId: item.price?.product as string || 'unknown',
            planName: item.description || 'Product',
            quantity: item.quantity || 1,
            priceInCents: item.amount_total,
            size: item.description?.match(/Taille: (.*?)(?: -|$)/)?.[1] || 'N/A'
        }));

        const productsJson = JSON.stringify(products);

        // Save to DB
        // Check for duplicates
        // We use session.id or payment_intent as unique key.
        // leads table uses payment_intent_id. session.payment_intent can be string or object.
        const paymentIntentId = typeof expandedSession.payment_intent === 'string' 
            ? expandedSession.payment_intent 
            : (expandedSession.payment_intent as Stripe.PaymentIntent)?.id;

        if (paymentIntentId) {
            const existingOrder = await pool.query('SELECT id FROM leads WHERE payment_intent_id = $1', [paymentIntentId]);
            
            if (existingOrder.rows.length === 0) {
                 const query = `
                    INSERT INTO leads (
                        customer_email,
                        customer_name,
                        customer_phone,
                        status,
                        amount,
                        currency,
                        payment_intent_id,
                        payment_method,
                        products,
                        utm_source,
                        utm_medium,
                        utm_campaign,
                        utm_term,
                        utm_content,
                        src,
                        sck
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    RETURNING id
                `;
                
                const values = [
                    customerDetails?.email || 'unknown@example.com',
                    customerDetails?.name || 'Customer',
                    customerDetails?.phone || '',
                    expandedSession.payment_status,
                    (expandedSession.amount_total || 0) / 100,
                    (expandedSession.currency || 'eur').toUpperCase(),
                    paymentIntentId,
                    'credit_card', // Simplified
                    productsJson,
                    metadata.utm_source || '',
                    metadata.utm_medium || '',
                    metadata.utm_campaign || '',
                    metadata.utm_term || '',
                    metadata.utm_content || '',
                    metadata.src || '',
                    metadata.sck || ''
                ];

                await pool.query(query, values);
                console.log(`Order ${paymentIntentId} saved to DB from Webhook.`);
            } else {
                console.log(`Order ${paymentIntentId} already exists in DB.`);
            }
        }

        // Send to UTMify
        const payload: UtmifyPayload = {
            orderId: paymentIntentId || session.id,
            platform: 'Stripe', 
            paymentMethod: 'credit_card', 
            status: 'paid',
            createdAt: new Date(expandedSession.created * 1000).toISOString().replace('T', ' ').substring(0, 19),
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
                totalPriceInCents: expandedSession.amount_total || 0,
                gatewayFeeInCents: 0,
                userCommissionInCents: 0,
                currency: expandedSession.currency ? expandedSession.currency.toUpperCase() : 'EUR'
            }
        };

        await sendToUtmify(payload);

    } catch (err) {
        console.error('Error in saveOrderFromSession:', err);
    }
}
