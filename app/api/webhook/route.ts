import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import pool from '@/app/lib/db';
import { sendToUtmify, UtmifyPayload } from '@/app/lib/utmify';

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
      case 'checkout.session.async_payment_succeeded':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Checkout Session completed: ${session.id}`);
        await updateOrder(session);
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

async function updateOrder(session: Stripe.Checkout.Session) {
    try {
        // Retrieve session
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items']
        });

        const customerDetails = expandedSession.customer_details;
        const paymentIntentId = typeof expandedSession.payment_intent === 'string' 
            ? expandedSession.payment_intent 
            : (expandedSession.payment_intent as Stripe.PaymentIntent)?.id;
        
        const orderId = expandedSession.metadata?.order_id;

        // Update Order in DB
        // We update status to 'paid' and fill in customer details
        const updateResult = await pool.query(`
            UPDATE orders 
            SET 
                status = 'paid',
                customer_email = $1,
                customer_name = $2,
                customer_phone = $3,
                payment_intent_id = $4,
                updated_at = NOW()
            WHERE stripe_session_id = $5 OR (id = $6 AND $6 IS NOT NULL)
            RETURNING *
        `, [
            customerDetails?.email || 'unknown@example.com',
            customerDetails?.name || 'Customer',
            customerDetails?.phone || '',
            paymentIntentId,
            session.id,
            orderId ? parseInt(orderId) : null
        ]);

        if (updateResult.rowCount === 0) {
            console.error(`Order not found for session ${session.id} (Order ID: ${orderId}). This might be a legacy order or race condition.`);
            return; 
        }

        const order = updateResult.rows[0];
        console.log(`Order ${order.id} updated to paid.`);

        // Send to UTMify
        // Fetch items from DB to get internal product names and details
        const dbItems = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        
        const productsForUtmify = dbItems.rows.map(item => ({
            id: item.sku,
            name: item.product_name || item.sku, 
            planId: item.sku,
            planName: item.product_name || item.sku,
            quantity: item.quantity,
            priceInCents: Math.round(Number(item.price) * 100),
            size: item.size || 'N/A'
        }));

        const payload: UtmifyPayload = {
            orderId: paymentIntentId || session.id,
            platform: 'Stripe', 
            paymentMethod: 'credit_card', 
            status: 'paid',
            createdAt: new Date(order.created_at).toISOString().replace('T', ' ').substring(0, 19),
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
            products: productsForUtmify,
            trackingParameters: {
                src: order.utm_content || null, 
                sck: null,
                utm_source: order.utm_source || null,
                utm_medium: order.utm_medium || null,
                utm_campaign: order.utm_campaign || null,
                utm_term: order.utm_term || null,
                utm_content: order.utm_content || null,
            },
            commission: {
                totalPriceInCents: expandedSession.amount_total || 0,
                gatewayFeeInCents: 0,
                userCommissionInCents: expandedSession.amount_total || 0,
                currency: expandedSession.currency ? expandedSession.currency.toUpperCase() : 'EUR'
            }
        };

        await sendToUtmify(payload);
        console.log(`Order ${order.id} sent to UTMify.`);

    } catch (err) {
        console.error('Error in updateOrder:', err);
    }
}
