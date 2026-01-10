"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import { useCart } from "../context/CartContext";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getUTMParams } from "../lib/utmNavigation";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey, { locale: 'fr' }) : null;

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const { cartItems } = useCart();

  // Calculate total amount
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const totalOriginalAmount = cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) * (item.quantity || 1)), 0);
  const totalSavings = totalOriginalAmount - totalAmount;

  useEffect(() => {
    // Generate a unique Event ID for this checkout session if not exists
    let eventID = sessionStorage.getItem('purchase_event_id');
    if (!eventID) {
      eventID = `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('purchase_event_id', eventID);
    }
  }, []);

  useEffect(() => {
    if (!publishableKey) {
      console.error("Stripe Publishable Key is missing. Please check your .env file.");
      return;
    }

    // Create PaymentIntent as soon as the page loads if cart is not empty
    if (totalAmount > 0 && !clientSecret) {
      const utmParams = getUTMParams();
      
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: totalAmount,
          cartItems: cartItems,
          utmParams
        }),
      })
        .then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                console.error("API Error Status:", res.status);
                console.error("API Error Body:", errorText);
                try {
                    return JSON.parse(errorText);
                } catch {
                    throw new Error(`API failed with status ${res.status}: ${errorText}`);
                }
            }
            return res.json();
        })
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error("No clientSecret returned in data:", data);
          }
        })
        .catch((err) => {
           console.error("Error creating payment intent:", err);
        });
    }
  }, [totalAmount, clientSecret, cartItems]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#003055',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '2px',
    },
  };
  
  const options = {
    clientSecret,
    appearance,
    locale: 'fr' as const,
  };

  if (cartItems.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4 text-[#1b1b1b]">Votre panier est vide</h1>
            <Link href="/" className="text-primary hover:underline font-bold flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retourner à la boutique
            </Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simple */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center gap-2 text-[#1b1b1b]">
                <span className="font-light text-sm uppercase tracking-wide">Paiement Sécurisé</span>
                <Lock className="w-4 h-4" />
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            
            {/* Left Column: Order Summary */}
            <div className="lg:col-span-5 lg:order-2 lg:mb-0">
                <div className="bg-gray-100 rounded-lg border border-gray-100 px-6 pt-6 sticky top-8">
                    <h2 className="text-lg font-medium text-[#1b1b1b] mb-4 border-b border-gray-100 pb-4">Récapitulatif de la commande</h2>
                    
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                <div className="relative w-35 h-35 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover object-center"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold font-sans-serif text-[#1b1b1b] line-clamp-3">{item.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Taille: <span className="font-medium">{item.size}</span> | Qty: {item.quantity}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm font-bold text-[#1b1b1b]">€{(item.price * item.quantity).toFixed(2)}</p>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                €{(item.originalPrice * item.quantity).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {item.customization && (
                                        <div className="mt-1 text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded-sm">
                                            {item.customization.details.name && <span>{item.customization.details.name} #{item.customization.details.number}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-400 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Sous-total</span>
                            <span>€{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Livraison</span>
                            <span className="text-green-600 font-medium">Gratuite</span>
                        </div>
                        {totalSavings > 0 && (
                            <div className="flex justify-between text-x1 line-through text-gray-500 font-medium">
                                <span>Économisé</span>
                                <span>-€{totalSavings.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl pb-8 font-medium font-sans-serif text-[#1b1b1b] pt-2 border-t border-gray-100 mt-2">
                            <span className="font-bold">Total</span>
                            <span>€{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="lg:col-span-7 lg:order-1">

                {clientSecret && stripePromise ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm amount={totalAmount} cartItems={cartItems} />
                    </Elements>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Initialisation du module de paiement...</p>
                    </div>
                )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
