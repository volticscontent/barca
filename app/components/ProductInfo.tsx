"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SizeSelector from './SizeSelector';
import KitCustomization from './KitCustomization';
import { useCart } from '../context/CartContext';
import * as fpixel from "../lib/fpixel";
import Image from 'next/image';
import { MAIN_PRODUCT, RELATED_PRODUCTS, Product } from '@/app/data/products';

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

const CompleteTheLook = () => {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    if (size) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    if (!size) {
      setErrors(prev => ({ ...prev, [product.id]: "Don&apos;t forget to select your size!" }));
      return;
    }

    addToCart({ 
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
    });
    
    // Optional: Add some visual feedback or pixel event here
  };

  return (
    <div className="mt-4 mb-8 px-4">
      <h3 className="text-lg font-bold text-[#1b1b1b] mb-4 uppercase">Complete the Look</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {RELATED_PRODUCTS.map((product) => (
          <div key={product.id} className="flex-none w-[200px] flex flex-col">
            <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-sm bg-gray-100">
              <Image 
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <a href="#" className="block mb-2">
              <h3 className="text-sm font-normal text-[#1b1b1b] hover:underline line-clamp-2 min-h-[40px] font-['Assistant',sans-serif]">
                {product.name}
              </h3>
            </a>
            <div className="mb-3">
              <span className="text-sm font-bold text-[#1b1b1b] font-['Assistant',sans-serif]">
                €{product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="mt-auto space-y-2">
              <div className="relative">
                 <select 
                   className={`w-full appearance-none bg-white border ${errors[product.id] ? 'border-red-500' : 'border-gray-300'} rounded-sm py-2 px-3 text-sm text-[#1b1b1b] focus:outline-none focus:border-[#1b1b1b]`}
                   value={selectedSizes[product.id] || ''}
                   onChange={(e) => handleSizeChange(product.id, e.target.value)}
                 >
                   <option value="">Select size</option>
                   {product.sizes.map(size => (
                     <option key={size} value={size}>{size}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                   <ChevronDown className="h-4 w-4" />
                 </div>
              </div>
              
              {errors[product.id] && (
                <div className="text-red-500 text-xs font-bold">
                  {errors[product.id]}
                </div>
              )}

              <button 
                className="w-full bg-yellow-400 text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white transition-colors py-2 px-4 rounded-sm flex items-center justify-center gap-2 text-sm font-bold uppercase"
                onClick={() => handleAddToCart(product)}
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                 Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductInfo({ selectedBadge, onBadgeChange }: { selectedBadge: string | null, onBadgeChange: (id: string | null) => void }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [error, setError] = useState('');
  const [customizationData, setCustomizationData] = useState<{ type: 'player' | 'custom' | null, name: string, number: string }>({ type: null, name: '', number: '' });

  const BASE_PRICE = MAIN_PRODUCT.price;
  const CUSTOMIZATION_PRICE = MAIN_PRODUCT.customizationPrice || 20.00;
  const ORIGINAL_BASE_PRICE = MAIN_PRODUCT.originalPrice || 140.00;
  const PRODUCT_NAME = MAIN_PRODUCT.name;

  const handleCustomizationChange = (data: { type: 'player' | 'custom' | null, name: string, number: string }) => {
    setCustomizationData(data);
  };

  const hasCustomization = customizationData.name || customizationData.number;
  const badgeData = selectedBadge ? MAIN_PRODUCT.badges?.find(b => b.id === selectedBadge) : null;
  const badgePrice = badgeData ? badgeData.price : 0;
  
  const finalPrice = (hasCustomization ? BASE_PRICE + CUSTOMIZATION_PRICE : BASE_PRICE) + badgePrice;
  const finalOriginalPrice = (hasCustomization ? ORIGINAL_BASE_PRICE + CUSTOMIZATION_PRICE : ORIGINAL_BASE_PRICE) + badgePrice;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Veuillez sélectionner une taille');
      return;
    }
    setError('');
    
    // Include customization object if there is customization OR a badge
    const shouldAddCustomization = hasCustomization || selectedBadge;

    const customization = shouldAddCustomization ? {
      type: (customizationData.type || 'custom') as 'player' | 'custom',
      printingType: 'league' as const,
      details: {
        name: customizationData.name || '',
        number: customizationData.number || ''
      },
      badge: badgeData ? {
        id: badgeData.id,
        label: badgeData.label,
        price: badgeData.price
      } : undefined
    } : undefined;

    addToCart({
      id: `202333090-${selectedSize}${hasCustomization ? '-custom' : ''}${selectedBadge ? `-${selectedBadge}` : ''}`,
      name: `${PRODUCT_NAME}${hasCustomization ? ' - Custom' : ''}${badgeData ? ` + ${badgeData.label}` : ''}`,
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      image: MAIN_PRODUCT.image,
      size: selectedSize,
      customization: customization,
    });

    fpixel.event("AddToCart", {
      content_name: `${PRODUCT_NAME}${hasCustomization ? ' - Custom' : ''}${badgeData ? ` + ${badgeData.label}` : ''}`,
      content_ids: [`202333090-${selectedSize}${hasCustomization ? '-custom' : ''}${selectedBadge ? `-${selectedBadge}` : ''}`],
      content_type: 'product',
      value: finalPrice,
      currency: 'EUR',
    });
  };

  return (
    <div className="flex flex-col h-full">
     <div className="p-4">
      {/* Product Title & Price */}
      <div className="mb-6 flex justify-between items-start gap-4">
        <h1 className="text-[15px] font-bold text-[#181733] uppercase leading-tight mb-2 font-['Assistant',sans-serif]">
          {PRODUCT_NAME}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[16px] font-bold text-[#181733] font-['Assistant',sans-serif]">
            €{finalPrice.toFixed(2)}
          </span>
          {hasCustomization && (
            <span className="text-sm text-gray-500 line-through font-['Assistant',sans-serif]">
              €{finalOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      {/* Size Selector */}
      <SizeSelector selectedSize={selectedSize} onSelectSize={(size) => { setSelectedSize(size); setError(''); }} />
      {error && <p className="text-red-600 text-sm font-bold -mt-6 mb-4 animate-pulse">{error}</p>}

      {/* Kit Customization */}
      <KitCustomization onCustomizationChange={handleCustomizationChange} players={MAIN_PRODUCT.players || []} price={CUSTOMIZATION_PRICE} />

      {/* Back Image with Badges - Replaces Carousel */}
      <div className="mt-8 mb-8">
        <div className="relative rounded-lg overflow-hidden mb-6">
           <Image 
            src={badgeData?.productImage || MAIN_PRODUCT.images[1] || MAIN_PRODUCT.image} 
            alt="Back of shirt" 
            width={1200}
            height={1200}
            className="w-full h-auto object-contain mix-blend-multiply"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#181733] text-base font-bold uppercase font-['Assistant',sans-serif]">Add a competition badge</h2>
            <div className="flex items-center text-[#181733] font-bold text-base font-['Assistant',sans-serif]">
              <span>+</span>
              <span>€{MAIN_PRODUCT.badgePrice?.toFixed(2) || '30.00'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MAIN_PRODUCT.badges?.map((badge) => (
              <label 
                key={badge.id}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-full border cursor-pointer transition-all
                  ${selectedBadge === badge.id 
                    ? 'bg-[#0068ff] border-[#0068ff] text-white shadow-md' 
                    : 'bg-white border-gray-200 text-[#181733] hover:border-gray-300'}
                `}
                onClick={() => onBadgeChange(selectedBadge === badge.id ? null : badge.id)}
          >
            <div className="shrink-0 flex items-center justify-center">
                  {badge.image ? (
                    <div className="relative w-6 h-6">
                      <Image
                        src={badge.image}
                        alt={badge.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="transform scale-90">
                      {badge.svg}
                    </div>
                  )}
                </div>
                <span className="text-xs font-['Assistant',sans-serif] font-normal uppercase tracking-wide">
                  {badge.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <button 
          className="w-full bg-[#fdc52c] text-[#181733] h-12 rounded font-bold hover:bg-[#e0af25] transition-colors flex items-center justify-center gap-3 tracking-wider text-base shadow-sm cursor-pointer uppercase" 
          onClick={handleAddToCart}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#181733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="#181733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="#181733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          ADD TO CART
        </button>
      </div>

      </div>

      <CompleteTheLook />

      {/* Accordions */}
      <div className="border-b-2 border-gray-200">
        {MAIN_PRODUCT.details?.map((detail, index) => (
          <AccordionItem key={index} title={detail.title} defaultOpen={index === 0}>
            {detail.content}
          </AccordionItem>
        ))}
      </div>

      {/* Sticky Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-whit shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden flex gap-4 items-center">
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-[#fdc52c] text-[#181733] h-12 rounded-sm font-bold hover:bg-[#e0af25] transition-colors flex items-center justify-center uppercase text-sm tracking-wider"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
