"use client";

import { useState } from 'react';
import { Truck, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import SizeSelector from './SizeSelector';
import CustomiseModal from './CustomiseModal';
import WinnersBadgeCarousel from './WinnersBadgeCarousel';
import { useCart, CartItem } from '../context/CartContext';
import * as fpixel from "../lib/fpixel";

const AccordionItem = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-400 px-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left group hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-sm"
      >
        <span className="font-bold text-[#1b1b1b] text-xl">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-black" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-black" />
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-[#1b1b1b] text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function ProductInfo() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [error, setError] = useState('');
  const [isCustomiseOpen, setIsCustomiseOpen] = useState(false);

  const BASE_PRICE = 49.99;
  const ORIGINAL_BASE_PRICE = 140.00;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Veuillez sélectionner une taille');
      return;
    }
    setError('');
    
    addToCart({
      id: '202333090',
      name: 'PSG Nike Dri-FIT ADV Home Match Shirt 2025-26',
      price: BASE_PRICE,
      originalPrice: ORIGINAL_BASE_PRICE,
      image: '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-1.jpg',
      size: selectedSize,
    });

    fpixel.event("AddToCart", {
      content_name: 'PSG Nike Dri-FIT ADV Home Match Shirt 2025-26',
      content_ids: ['202333090'],
      content_type: 'product',
      value: BASE_PRICE,
      currency: 'EUR',
    });
  };

  const handleCustomAddToCart = (customization: NonNullable<CartItem['customization']> & { price: number }) => {
    // Calculate the difference between base prices to maintain the same discount margin on the total
    const priceDifference = ORIGINAL_BASE_PRICE - BASE_PRICE;
    const originalPrice = customization.price + priceDifference;

    addToCart({
      id: `202333090-custom-${Date.now()}`,
      name: `PSG Nike Home Match 25/26`,
      price: customization.price,
      originalPrice: originalPrice,
      image: '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-1.jpg',
      size: selectedSize!,
      customization: customization,
    });

    fpixel.event("AddToCart", {
      content_name: `PSG Nike Home Match 25/26 - Custom`,
      content_ids: [`202333090-custom`],
      content_type: 'product',
      value: customization.price,
      currency: 'EUR',
    });
  };

  const openCustomise = () => {
    if (!selectedSize) {
      setError('Veuillez sélectionner une taille à personnaliser');
      return;
    }
    setError('');
    setIsCustomiseOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
     <div className="p-4">
      <CustomiseModal 
        isOpen={isCustomiseOpen} 
        onClose={() => setIsCustomiseOpen(false)}
        productName="PSG Nike Dri-FIT ADV Home Match Shirt 2025-26"
        selectedSize={selectedSize}
        basePrice={BASE_PRICE}
        onAddToCart={handleCustomAddToCart}
      />

      {/* Size Selector */}
      <SizeSelector selectedSize={selectedSize} onSelectSize={(size) => { setSelectedSize(size); setError(''); }} />
      {error && <p className="text-red-600 text-sm font-bold -mt-6 mb-4 animate-pulse">{error}</p>}

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <button 
          onClick={openCustomise}
          className="w-full bg-white border border-gray-300 text-[#1b1b1b] h-14 rounded-sm font-bold hover:bg-gray-50 transition-colors tracking-wider text-sm cursor-pointer"
        >
          Personnaliser
        </button>
        <button className="w-full bg-primary text-white h-14 rounded-sm font-bold hover:bg-[#003055] transition-colors flex items-center justify-center gap-2 tracking-wider text-sm shadow-sm cursor-pointer" onClick={handleAddToCart}>
          Ajouter au panier
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded border border-gray-100">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold text-gray-700 uppercase">Livraison Rapide</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold text-gray-700 uppercase">Produit Officiel</span>
        </div>
      </div>
      <WinnersBadgeCarousel />
      </div>
      {/* Accordions */}
      <div className="">
        <AccordionItem title="Description" defaultOpen={true}>
          <p>
            More legendary than ever, Paris Saint-Germain&apos;s iconic home kit is reimagined with a midnight blue base, vibrant red and white accents, and a lattice-inspired graphic that pays tribute to the city&apos;s architectural heritage. This design embodies the club&apos;s Parisian identity and legacy. From the streets of Greater Paris to the stands of Parc des Princes, this jersey is more than just a kit: it&apos;s the uniform of a generation that embraces football as both culture and commitment.
          </p>
        </AccordionItem>

        <AccordionItem title="Détails">
          <ul className="list-disc list-outside ml-4 space-y-1 marker:text-gray-500">
            <li>Product ID: 202333090</li>
            <li>Brand: Nike</li>
            <li>Country of origin: Thailand</li>
            <li>Machine wash</li>
            <li>Slim fit</li>
            <li>Identical to the shirts worn by Paris Saint-Germain players during matches</li>
            <li>Interior neck detail</li>
            <li>Silicone badge</li>
            <li>V-neck</li>
            <li>Nike Dri-FIT ADV technology combines sweat-wicking fabric with advanced innovations</li>
            <li>The SNIPES back of jersey sponsor is included with the Players or Custom Ligue 1 print flocking option</li>
            <li>Material: 100% Polyester Knitted</li>
            <li>Short sleeve</li>
            <li>Officially licensed</li>
            <li>Customised items are final sale and cannot be cancelled, changed, returned or refunded after order has been placed</li>
          </ul>
        </AccordionItem>

        <AccordionItem title="Livraison">
          <ul className="list-disc list-outside ml-4 space-y-1 marker:text-gray-500">
            <li>
              This item usually ships within 2 business day. Items with name and number personalisation ship within 5 business days. Please proceed to checkout for shipping options and additional transit times.
            </li>
          </ul>
        </AccordionItem>
      </div>
    </div>
  );
}
