import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!webhookSecret || !signature) {
        // Se não houver segredo ou assinatura, não podemos verificar, então apenas logamos (ou retornamos erro em prod)
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
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);
        console.log(`💰 PaymentIntent ID: ${paymentIntent.id}`);
        
        // Logica principal de sucesso:
        // - Enviar email de confirmação
        // - Atualizar banco de dados
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntentFailed.last_payment_error?.message}`);
        // Logica de falha:
        // - Enviar email de recuperação de carrinho
        // - Notificar suporte se for erro sistêmico
        break;

      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        console.log(`✅ Charge succeeded: ${charge.id}`);
        // Útil para gerar recibos ou notas fiscais
        break;

      case 'charge.refunded':
        const chargeRefunded = event.data.object as Stripe.Charge;
        console.log(`💸 Charge refunded: ${chargeRefunded.id}`);
        // Atualizar status do pedido para "Reembolsado"
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`⚠️ Dispute created: ${dispute.id}`);
        // ALERTA CRÍTICO: Bloquear conta do usuário, notificar equipe financeira
        break;

      default:
        // Unexpected event type
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
