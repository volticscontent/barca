'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Lock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { CartItem } from "../context/CartContext";
import { StripeAddressElementChangeEvent } from "@stripe/stripe-js";
import * as fpixel from "../lib/fpixel";

interface CheckoutFormProps {
  amount: number;
  cartItems: CartItem[];
}

export default function CheckoutForm({ amount, cartItems }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // User Data State for Matching
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const hasTrackedIC = useRef(false);

  useEffect(() => {
    // Generate a unique Event ID for this checkout session if not exists
    let eid = sessionStorage.getItem('purchase_event_id');
    if (!eid) {
      eid = `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('purchase_event_id', eid);
    }
  }, []);

  // Track InitiateCheckout once Email and Phone are provided
  useEffect(() => {
    if (!hasTrackedIC.current && email && phone && email.includes('@') && phone.length > 8) {
        const eid = sessionStorage.getItem('purchase_event_id');
        
        const userData = fpixel.normalizeData({
            email: email,
            phone: phone,
        });

        fpixel.event("InitiateCheckout", {
            content_ids: cartItems.map(item => item.id),
            content_type: "product",
            value: amount,
            currency: "EUR",
            num_items: cartItems.length,
        }, eid || undefined, userData);

        hasTrackedIC.current = true;
    }
  }, [email, phone, cartItems, amount]);

  const handleUserDataChange = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') setEmail(value);
    if (type === 'phone') setPhone(value);
    
    // Persist for Success Page
    sessionStorage.setItem(`user_${type}`, value);
  };

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    if (event.value.address) {
      const { city, state, postal_code, country, line1, line2 } = event.value.address;
      const { name } = event.value;

      // Save to session storage even if incomplete to avoid losing data on re-renders
      // and ensure we capture clearing of fields (empty strings)
      sessionStorage.setItem('user_city', city || '');
      sessionStorage.setItem('user_state', state || '');
      sessionStorage.setItem('user_zip', postal_code || '');
      sessionStorage.setItem('user_country', country || '');
      sessionStorage.setItem('user_line1', line1 || '');
      sessionStorage.setItem('user_line2', line2 || '');
      
      // Attempt to split name into First/Last if provided
      if (name) {
          const nameParts = name.trim().split(' ');
          if (nameParts.length > 0) {
              sessionStorage.setItem('user_first_name', nameParts[0]);
              if (nameParts.length > 1) {
                  sessionStorage.setItem('user_last_name', nameParts.slice(1).join(' '));
              } else {
                  sessionStorage.removeItem('user_last_name');
              }
          }
      }
    }
  };

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    // Track AddPaymentInfo with user data before submitting
    const eid = sessionStorage.getItem('purchase_event_id');
    const userData = fpixel.normalizeData({
        email: email,
        phone: phone,
        firstName: sessionStorage.getItem('user_first_name') || '',
        lastName: sessionStorage.getItem('user_last_name') || '',
    });
    
    // Add address info if available
    const city = sessionStorage.getItem('user_city');
    const state = sessionStorage.getItem('user_state');
    const zip = sessionStorage.getItem('user_zip');
    const country = sessionStorage.getItem('user_country');
    
    if (city) userData.ct = city.trim().toLowerCase();
    if (state) userData.st = state.trim().toLowerCase();
    if (zip) userData.zp = zip.trim().toLowerCase();
    if (country) userData.country = country.trim().toLowerCase();

    fpixel.event("AddPaymentInfo", {
      content_ids: cartItems.map(item => item.id),
      content_type: "product",
      currency: "EUR",
      value: amount,
      num_items: cartItems.length,
    }, eid || undefined, userData);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
        payment_method_data: {
            billing_details: {
                email: email,
                phone: phone,
                name: sessionStorage.getItem('user_first_name') ? 
                      `${sessionStorage.getItem('user_first_name')} ${sessionStorage.getItem('user_last_name') || ''}`.trim() 
                      : undefined,
                address: {
                    city: sessionStorage.getItem('user_city') || undefined,
                    country: sessionStorage.getItem('user_country') || undefined,
                    line1: sessionStorage.getItem('user_line1') || '',
                    line2: sessionStorage.getItem('user_line2') || undefined,
                    postal_code: sessionStorage.getItem('user_zip') || undefined,
                    state: sessionStorage.getItem('user_state') || undefined,
              }
            }
        },
        shipping: {  
          name: sessionStorage.getItem('user_first_name') ? 
                `${sessionStorage.getItem('user_first_name')} ${sessionStorage.getItem('user_last_name') || ''}`.trim() 
                : 'Client',
          phone: phone,
          address: {
            city: sessionStorage.getItem('user_city') || undefined,
            country: sessionStorage.getItem('user_country') || undefined,
            line1: sessionStorage.getItem('user_line1') || '',
            line2: sessionStorage.getItem('user_line2') || undefined,
            postal_code: sessionStorage.getItem('user_zip') || undefined,
            state: sessionStorage.getItem('user_state') || undefined,
          }
        }
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full bg-white rounded-lg px-4 py-2 sm:px-8 sm:py-4">
      <Image
        src="images/svgs/logo.svg"
        alt="Logo"
        className="w-36 h-16 mb-4 items-center justify-center flex sm:mb-6"
        priority={true}
        width={32}
        height={32}
      />
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Vos coordonnées</h3>
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => handleUserDataChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:border-gray-400 text-sm text-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Téléphone</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => handleUserDataChange('phone', e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary focus:border-primary text-sm text-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Adresse de livraison</h3>
        <AddressElement 
            options={{mode: 'shipping', fields: {phone: 'never'}}} 
            onChange={handleAddressChange}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Paiement</h3>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-[#00940c] text-white h-14 rounded-sm font-bold text-lg hover:bg-[#002035] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {isLoading ? (
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Traitement...</span>
            </div>
        ) : (
            <>
                <Lock className="w-5 h-5" />
                <span>Payer €{amount.toFixed(2)}</span>
            </>
        )}
      </button>
      
      {message && (
        <div id="payment-message" className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md text-center">
            {message}
        </div>
      )}
      
      <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
         {/* Simple visual trust indicators could be SVGs here, but omitted for brevity/asset dependencies */}
         
      </div>
    </form>
  );
}
