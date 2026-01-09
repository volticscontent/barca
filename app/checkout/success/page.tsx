"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import * as fpixel from "../../lib/fpixel";

export default function SuccessPage() {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (tracked) return;

    const trackPurchase = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentClientSecret = urlParams.get("payment_intent_client_secret");
      const paymentIntentId = urlParams.get("payment_intent");

      if (paymentIntentClientSecret || paymentIntentId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) return;

        let amount = 0;
        let currency = 'EUR';

        if (paymentIntentClientSecret) {
           const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
           if (paymentIntent && paymentIntent.status === 'succeeded') {
             amount = paymentIntent.amount / 100; // Stripe amount is in cents
             currency = paymentIntent.currency.toUpperCase();
           }
        }
        
        // Fallback or additional check if needed. 
        // Note: retrievePaymentIntent needs the client secret (usually). 
        // If only payment_intent ID is present (some flows), we might not be able to fetch details client-side securely without a backend call.
        // But Stripe return_url usually includes client_secret.
        
        if (amount > 0) {
            // Retrieve User Data & Event ID for Deduplication/Matching
            const eventID = sessionStorage.getItem('purchase_event_id') || undefined;
            const email = sessionStorage.getItem('user_email') || undefined;
            const phone = sessionStorage.getItem('user_phone') || undefined;
            
            const userData = fpixel.normalizeData({
                email,
                phone
            });

            fpixel.event("Purchase", {
              value: amount,
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
