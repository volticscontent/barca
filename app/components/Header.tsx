"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cartCount, toggleCart } = useCart();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#181733] font-sans shadow-md">
      {/* Promo Bar (White/Gray) */}
      <div className="text-[#ebebeb] font-bold bg-[linear-gradient(175deg,#c00030_7%,#0044cc_88%)] text-center text-[16px] py-2 flex items-center justify-center gap-2">
        <span>Promotion des champions 2026</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu & Logo Area */}
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full lg:hidden invert">
              <Image src="/images/header/aspire-icon-aspire-hamburger-icon.svg" alt="Menu" width={24} height={24} />
            </button>
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-32 h-10 relative flex items-center justify-start">
                 <Image src="/images/svgs/logo.svg" alt="FCB Official Store" width={128} height={40} className="object-contain object-left" priority />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 items-center">
            <Link href="#" className="text-base font-black text-[#1b1b1b] hover:text-primary uppercase tracking-wide transition-colors">JORDAN</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">Maillots</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">Entraînement</Link>
            <Link href="#" className="text-base font-bold text-[#1b1b1b] hover:text-primary transition-colors">Plus</Link>
          </nav>

          {/* Icons Area */}
          <div className="flex items-center gap-2 invert">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Image src="/images/header/aspire-icon-aspire-search-icon.svg" alt="Recherche" width={24} height={24} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Image src="/images/header/aspire-icon-aspire-account-icon.svg" alt="Compte" width={24} height={24} />
            </button>
            <button 
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <Image src="/images/header/aspire-icon-aspire-cart-icon.svg" alt="Panier" width={24} height={24} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-primary text-white text-[10px] font-bold px-2 py-0.1 rounded-full animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
