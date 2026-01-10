"use client";

import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

import { useUTMNavigation } from '../lib/utmNavigation';

export default function CartDrawer() {
  const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { navigateWithUTM } = useUTMNavigation();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] animate-in fade-in duration-200 backdrop-blur-sm"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-[#1b1b1b]">Votre Panier</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length} articles
            </span>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <p className="font-medium">Votre panier est vide</p>
              <button 
                onClick={toggleCart}
                className="text-primary font-bold hover:underline"
              >
                Commencer vos achats
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-gray-100 pb-4">
                {/* Image */}
                <div className="relative w-20 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1b1b1b] line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Taille: <span className="font-bold">{item.size}</span></p>
                    
                    {item.customization && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-sm border border-gray-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-gray-800">Impression:</span>
                          <span>
                            {item.customization.printingType === 'women' 
                              ? "Féminine" 
                              : item.customization.printingType === 'cup' 
                                ? "Coupe" 
                                : "Ligue 1"}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-gray-800">Détails:</span>
                          <span className="font-mono uppercase">{item.customization.details.name} #{item.customization.details.number}</span>
                        </div>
                        {item.customization.badge && item.customization.badge.id !== 'none' && (
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-gray-800 whitespace-nowrap">Badge:</span>
                            <span className="text-right leading-tight">{item.customization.badge.label}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-1 hover:bg-gray-50 text-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-black w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-1 hover:bg-gray-50 text-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-gray-400 line-through">
                            €{(item.originalPrice * item.quantity).toFixed(2)}
                            </span>
                        )}
                        <span className="text-sm font-bold text-[#1b1b1b]">
                            €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Sous-total</span>
              <span className="text-lg font-bold text-[#1b1b1b]">€{cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Frais de port et taxes calculés lors du paiement.
            </p>
            <button 
              onClick={() => {
                toggleCart();
                navigateWithUTM('/checkout');
              }}
              className="w-full bg-primary text-white h-12 rounded-sm font-bold hover:bg-[#003055] transition-colors shadow-sm uppercase tracking-wide"
            >
              Paiement
            </button>
          </div>
        )}
      </div>
    </>
  );
}
