"use client";

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BADGE_IMAGES = [
  '/images/contentProduct/winners_b1.webp',
  '/images/contentProduct/winners_b2.webp',
  '/images/contentProduct/winners_b3.avif',
];

export default function WinnersBadgeCarousel() {
  return (
    <div className="mt-5 border-t border-gray-200">
      <div className="flex items-center justify-between my-6">
        <h2 className="text-xl font-bold text-[#1b1b1b]">
          Personnalisez votre maillot 25/26 avec le badge des champions intercontinentaux
        </h2>
        <div className="hidden lg:flex gap-2">
          <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#1b1b1b] hover:border-[#1b1b1b] transition-colors disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#1b1b1b] hover:border-[#1b1b1b] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        {BADGE_IMAGES.map((src, index) => (
          <div key={index} className="flex-shrink-0 w-[280px] group cursor-pointer">
            <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden mb-3">
              <Image
                src={src}
                alt="Badge des Champions"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Scrollbar Indicator (Visual Only) */}
      <div className="h-1 bg-gray-100 mt-2 rounded-full overflow-hidden w-full lg:w-48 hidden lg:block">
        <div className="h-full bg-[#1b1b1b] w-1/3 rounded-full"></div>
      </div>
    </div>
  );
}
