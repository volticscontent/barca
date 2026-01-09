"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import * as fpixel from "../../lib/fpixel";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [tracked, setTracked] = useState(false);
  const [orderItems, setOrderItems] = useState<{ id: string, name: string, qty: number, size?: string }[]>([]);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (tracked) return;

    const trackPurchase = async () => {
      // Use useSearchParams hook
      const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");
      const paymentIntentId = searchParams.get("payment_intent");

      if (paymentIntentClientSecret) {
         // 1. Call Backend API immediately (Critical for UTMify/DB)
         // We don't wait for Stripe client-side retrieval to ensure this fires ASAP.
         // 'keepalive: true' ensures request completes even if user closes tab.
         fetch('/api/process-payment-success', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ payment_intent_client_secret: paymentIntentClientSecret }),
             keepalive: true
         }).then(res => res.json())
           .then(data => console.log('UTMify Processed:', data))
           .catch(err => console.error('UTMify Error:', err));

        // 2. Load Stripe for UI and Client-side Pixel
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) return;

        let retrievedAmount = 0;
        let currency = 'EUR';
        let items = [];

        const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
        if (paymentIntent && paymentIntent.status === 'succeeded') {
             retrievedAmount = paymentIntent.amount / 100; // Stripe amount is in cents
             currency = paymentIntent.currency.toUpperCase();

             if ((paymentIntent as any).metadata && (paymentIntent as any).metadata.cart_items) {
                try {
                    items = JSON.parse((paymentIntent as any).metadata.cart_items);
                    setOrderItems(items);
                    setAmount(retrievedAmount);
                } catch (e) {
                    console.error("Error parsing cart items metadata", e);
                }
             }
        }
        
        // ... (rest of pixel logic)
        
        // Fallback or additional check if needed. 
        // Note: retrievePaymentIntent needs the client secret (usually). 
        // If only payment_intent ID is present (some flows), we might not be able to fetch details client-side securely without a backend call.
        // But Stripe return_url usually includes client_secret.
        
        if (retrievedAmount > 0) {
            // Retrieve User Data & Event ID for Deduplication/Matching
            const eventID = sessionStorage.getItem('purchase_event_id') || '';
            const email = sessionStorage.getItem('user_email') || '';
            const phone = sessionStorage.getItem('user_phone') || '';
            
            const userData = fpixel.normalizeData({
                email,
                phone
            });

            fpixel.event("Purchase", {
              value: retrievedAmount,
              currency: currency,
              content_type: "product",
            }, eventID, userData);
            
            // Clear session storage after tracking to prevent double fire on reload (though 'tracked' state handles this component-wise)
            // sessionStorage.removeItem('purchase_event_id'); 
            // Keeping it might be useful if user refreshes immediately, but typically we want unique events. 
            // Better to rely on the 'tracked' state.
            
            setTracked(true);
        }
      }
    };

    trackPurchase();
  }, [tracked]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1b1b1b] mb-2">Paiement Réussi !</h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
        </p>
        
        {orderItems.length > 0 && (
            <div className="bg-gray-50 rounded p-4 mb-6 text-left">
                <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-200 pb-2">Détails de la commande</h3>
                <ul className="space-y-2">
                    {orderItems.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between">
                            <span>{item.qty}x {item.name} ({item.size})</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>€{amount.toFixed(2)}</span>
                </div>
            </div>
        )}

        <Link 
          href="/" 
          className="inline-block w-full bg-primary text-white py-3 px-4 rounded-sm font-bold hover:bg-[#003055] transition-colors uppercase tracking-wide"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
