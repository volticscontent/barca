"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cartCount, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-sans">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu & Logo Area */}
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full lg:hidden">
              <Image src="/images/header/aspire-icon-aspire-hamburger-icon.svg" alt="Menu" width={24} height={24} />
            </button>
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-32 h-10 relative flex items-center justify-start">
                 <Image src="/images/svgs/logo.svg" alt="PSG Official Store" width={128} height={40} className="object-contain object-left" priority />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 items-center">
            <Link href="#" className="text-base font-black text-[#1b1b1b] hover:text-primary uppercase tracking-wide transition-colors">JORDAN</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">Kits</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">Training</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">More</Link>
          </nav>

          {/* Icons Area */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Image src="/images/header/aspire-icon-aspire-search-icon.svg" alt="Search" width={24} height={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Image src="/images/header/aspire-icon-aspire-account-icon.svg" alt="Account" width={24} height={24} />
            </button>
            <button 
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <Image src="/images/header/aspire-icon-aspire-cart-icon.svg" alt="Cart" width={24} height={24} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-primary text-white text-[10px] font-bold px-2 py-0.1 rounded-full animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Promo Bar (White/Gray) */}
      <div className="border-y border-[#b4b4b4] text-[#1b1b1b] text-center text-[14px] py-2 flex items-center justify-center gap-2">
        <Image src="/images/header/svgpromo.png" alt="Promo" width={24} height={24} />
        <span>Up to 66,67 % Off Selected Lines</span>
      </div>
      <div className="text-[#ebebeb] bg-[#163d61] text-center text-[16px] py-2 flex items-center justify-center gap-2">
        <span>PROMOTION DES CHAMPIONS 2026</span>
      </div>
    </header>
  );
}
