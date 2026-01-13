"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as fpixel from "../../lib/fpixel";

interface StripeLineItem {
  id: string;
  description: string;
  quantity: number;
  price?: {
    product: string;
  };
}

interface StripeSessionResponse {
  status: string;
  amount_total: number;
  currency: string;
  line_items?: StripeLineItem[];
  customer_details?: {
    email?: string;
    phone?: string;
    name?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    };
  };
  customer_email?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [tracked, setTracked] = useState(false);
  const [orderItems, setOrderItems] = useState<{ id: string, name: string, qty: number, size?: string }[]>([]);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (tracked) return;

    const trackPurchase = async () => {
      // Use useSearchParams hook
      const sessionId = searchParams.get("session_id");

      if (sessionId) {
          // Handle Checkout Session (Embedded/Hosted)
          fetch(`/api/retrieve-checkout-session?session_id=${sessionId}`)
              .then(res => res.json())
              .then((data: StripeSessionResponse) => {
                  if (data.status === 'complete' || data.status === 'open') { // Open might be async payment pending
                       setAmount(data.amount_total / 100);
                       
                       // Populate order items if available
                       if (data.line_items && Array.isArray(data.line_items)) {
                           const items = data.line_items.map((item) => ({
                               id: item.price?.product || item.id,
                               name: item.description,
                               qty: item.quantity,
                               size: item.description?.match(/Taille: (.*?)(?: -|$)/)?.[1] || '' // Attempt to extract size from description if present
                           }));
                           setOrderItems(items);
                       }
                       
                       // Pixel Tracking
                       const eventID = sessionStorage.getItem('purchase_event_id') || '';
                       const details = data.customer_details || {};
                       const email = details.email || sessionStorage.getItem('user_email') || '';
                       const name = details.name || '';
                       const firstName = name.split(' ')[0] || '';
                       const lastName = name.split(' ').slice(1).join(' ') || '';
                       
                       const userData = fpixel.normalizeData({
                            email: email,
                            phone: details.phone,
                            firstName: firstName,
                            lastName: lastName,
                            city: details.address?.city,
                            state: details.address?.state,
                            country: details.address?.country,
                            zip: details.address?.postal_code
                       });

                       fpixel.event("Purchase", {
                            value: data.amount_total / 100,
                            currency: (data.currency || 'eur').toUpperCase(),
                            content_type: "product",
                            contents: data.line_items?.map((item) => ({
                                id: item.price?.product,
                                quantity: item.quantity
                            }))
                       }, eventID, userData);
                       
                       setTracked(true);
                  }
              })
              .catch(err => console.error("Error retrieving session", err));
      }
    };

    trackPurchase();
  }, [tracked, searchParams]);

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

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
