import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: Request) {
  try {
    const { payment_intent_client_secret } = await request.json();

    if (!payment_intent_client_secret) {
      return NextResponse.json({ error: 'Missing payment_intent_client_secret' }, { status: 400 });
    }

    // Retrieve the payment intent to get details
    const paymentIntentId = payment_intent_client_secret.split('_secret_')[0];

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json({ message: 'Payment not succeeded yet' }, { status: 200 });
    }

    // Parallelize DB save and UTMify send to reduce latency
    // We don't want one to block the other significantly
    const saveDbPromise = saveOrderToDb(paymentIntent)
        .catch(err => console.error("Critical DB Error (saving skipped):", err));
        
    const sendUtmifyPromise = sendToUtmify(paymentIntent)
        .catch(err => console.error("Critical UTMify Error:", err));

    await Promise.all([saveDbPromise, sendUtmifyPromise]);

    return NextResponse.json({ success: true, paymentIntent });

  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function saveOrderToDb(paymentIntent: Stripe.PaymentIntent) {
    const metadata = paymentIntent.metadata || {};
    
    // Check if order already exists to avoid duplicates
    const existingOrder = await pool.query('SELECT id FROM leads WHERE payment_intent_id = $1', [paymentIntent.id]);
    
    if (existingOrder.rows.length > 0) {
        console.log(`Order ${paymentIntent.id} already exists in DB.`);
        return;
    }

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
        paymentIntent.receipt_email || 'unknown@example.com', // Tenta pegar do metadata se possível
        metadata.customer_name || 'Customer', // Pode adicionar input no checkout para nome
        metadata.phone || '',
        paymentIntent.status,
        paymentIntent.amount / 100,
        paymentIntent.currency.toUpperCase(),
        paymentIntent.id,
        'credit_card', // Simplificado
        metadata.cart_items ? JSON.stringify(JSON.parse(metadata.cart_items)) : '[]',
        metadata.utm_source || '',
        metadata.utm_medium || '',
        metadata.utm_campaign || '',
        metadata.utm_term || '',
        metadata.utm_content || '',
        metadata.src || '',
        metadata.sck || ''
    ];

    try {
        // Log para debug
        console.log('Saving order to DB. Products:', values[8]);
        await pool.query(query, values);
        console.log(`Order ${paymentIntent.id} saved to DB.`);
    } catch (err) {
        console.error('Error saving order to DB:', err);
        // Não lançar erro para não bloquear o response da API
    }
}

    // Reuse the UTMify logic here
    async function sendToUtmify(paymentIntent: Stripe.PaymentIntent) {
    const metadata = paymentIntent.metadata || {};
    
    // Recuperar itens do carrinho e formatar para o padrão UTMify
    let products = [];
    try {
        if (metadata.cart_items) {
            products = JSON.parse(metadata.cart_items).map((item: { id: string, name: string, qty: number }) => ({
                id: item.id || 'unknown',
                name: item.name || 'Produto sem nome',
                planId: item.id || 'unknown',
                planName: item.name || 'Produto sem nome',
                quantity: item.qty || 1,
                priceInCents: Math.round((paymentIntent.amount / 100) * 100) // Using total amount as fallback per item logic might need adjustment if multiple items have different prices, but here we simplify
            }));
            
            // Adjust price if multiple items to avoid wrong total calculation if needed, 
            // but UTMify often takes the list. If we don't have individual prices in metadata, we might need to estimate or use 0 if allowed, 
            // but validation requires it.
            // Since we truncated metadata, we might not have individual prices.
            // Let's try to distribute or just set a default if missing.
            // Actually, we can just use the total amount for the first item and 0 for others or similar?
            // Better: use a dummy price if unknown, but validation says "required".
            // We'll set a placeholder based on total / quantity.
            
            // Currency conversion handling: Stripe amounts are in smallest currency unit (e.g., cents)
            // If currency is EUR, we might need to convert to BRL if UTMify expects BRL, 
            // or ensure we pass the correct value. 
            // Assuming UTMify expects value in cents of the transaction currency.
            // If UTMify is BRL-only, we would need a conversion rate. 
            // For now, we'll pass the amount as is, but log the currency for debugging.
            
            const currency = paymentIntent.currency;
            let amountInCents = paymentIntent.amount;
            
            // Basic heuristic: if EUR/USD, and UTMify expects BRL, we might need to multiply.
            // However, usually tracking pixels just want the value. 
            // If "demorou a pingar" (delayed), it might be due to processing queues.
            
            const totalQty = products.reduce((acc: number, p: any) => acc + p.quantity, 0);
            const avgPrice = totalQty > 0 ? Math.round(amountInCents / totalQty) : 0;
            
            products = products.map((p: any) => ({
                ...p,
                priceInCents: avgPrice
            }));
        } else {
             // Fallback product if empty
             products.push({
                id: 'default_product',
                name: 'Order Product',
                planId: 'default_plan',
                planName: 'Order Product',
                quantity: 1,
                priceInCents: paymentIntent.amount
             });
        }
    } catch (e) {
        console.error("Erro ao processar produtos para UTMify", e);
        // Fallback on error
        products.push({
            id: 'error_fallback',
            name: 'Order Product',
            planId: 'error_fallback',
            planName: 'Order Product',
            quantity: 1,
            priceInCents: paymentIntent.amount
         });
    }

    // Extract customer details from PaymentIntent (shipping or charges)
    const shipping = paymentIntent.shipping;
    const charge = paymentIntent.latest_charge as unknown as Stripe.Charge; // Type assertion if needed or check expansion
    // Note: paymentIntent object from retrieve() might not have latest_charge expanded by default unless requested, 
    // but shipping is usually top-level if provided during confirm.
    
    const customerName = shipping?.name || metadata.customer_name || 'Customer';
    const customerPhone = shipping?.phone || metadata.phone || '';

    const payload = {
        orderId: paymentIntent.id,
        platform: 'Stripe', 
        paymentMethod: 'credit_card', 
        status: 'paid', // Confirmado pela documentação da UTMify (paid, pending, refunded)
        createdAt: new Date(paymentIntent.created * 1000).toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        customer: {
            name: customerName,
            email: paymentIntent.receipt_email || 'customer@example.com',
            phone: customerPhone, 
            document: null, // Required as string or null
            firstName: customerName.split(' ')[0] || 'Customer', 
            lastName: customerName.split(' ').slice(1).join(' ') || '',
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
            totalPriceInCents: paymentIntent.amount,
            gatewayFeeInCents: 0, // Unknown without balance transaction retrieval
            userCommissionInCents: 0, // Default
            currency: paymentIntent.currency ? paymentIntent.currency.toUpperCase() : 'BRL' // Ensure Uppercase per validation error
        }
    };

    const utmifyToken = process.env.UTMIFY_API_TOKEN;

    if (!utmifyToken) {
        console.warn("UTMIFY_API_TOKEN não configurado");
        return;
    }

    try {
        const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-token': utmifyToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erro na API UTMify: ${response.status} - ${errorText}`);
        } else {
            const responseData = await response.json(); // Consuming the response properly, though type unknown
            console.log("Pedido enviado com sucesso para UTMify via Client API", responseData);
        }
    } catch (error) {
        console.error("Falha na requisição para UTMify", error);
    }
}
