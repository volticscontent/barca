"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCT_IMAGES = [
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-1.jpg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-2.jpg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-3.jpg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-4.jpeg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-5.jpeg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-6.jpeg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-7.jpeg',
  '/images/contentProduct/psg-nike-dri-fit-adv-home-matc-9.jpg',
];

export default function ProductGallery() {
  const [mainImage, setMainImage] = useState(PRODUCT_IMAGES[0]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const nextImage = () => {
    const currentIndex = PRODUCT_IMAGES.indexOf(mainImage);
    const nextIndex = (currentIndex + 1) % PRODUCT_IMAGES.length;
    setMainImage(PRODUCT_IMAGES[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = PRODUCT_IMAGES.indexOf(mainImage);
    const prevIndex = (currentIndex - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length;
    setMainImage(PRODUCT_IMAGES[prevIndex]);
  };

  return (
    <>
      <div className="flex flex-row gap-3 lg:gap-4 p-0 lg:p-2 h-[500px] lg:h-[700px]">
        
        {/* Thumbnails (Vertical List - Responsive) */}
        <div 
          className="flex flex-col gap-3 h-full overflow-y-auto w-16 lg:w-24 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1"
        >
          {PRODUCT_IMAGES.map((src, index) => (
            <button 
              key={index} 
              onClick={() => setMainImage(src)}
              className={`relative w-full aspect-[4/5] flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all ${mainImage === src ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image 
                src={src} 
                alt={`Miniature ${index + 1}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 64px, 96px"
              />
            </button>
          ))}
        </div>

        {/* Main Image (Responsive) */}
        <div className="relative flex-1 bg-gray-100 rounded-sm overflow-hidden h-full cursor-zoom-in group" onClick={() => setIsZoomOpen(true)}>
          <Image 
            src={mainImage} 
            alt="Vue principale du kit domicile PSG"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1024px) 800px, 100vw"
            priority
          />
          {/* Zoom Icon Hint */}
          <button className="absolute bottom-4 right-4 bg-white/90 p-2 lg:p-3 rounded-full hover:bg-white transition-colors shadow-sm">
             <ZoomIn className="w-4 h-4 lg:w-5 lg:h-5 text-[#1b1b1b]" />
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10"
          >
            <X className="w-8 h-8 text-[#1b1b1b]" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-100 rounded-full hidden lg:block"
          >
            <ChevronLeft className="w-8 h-8 text-[#1b1b1b]" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-100 rounded-full hidden lg:block"
          >
            <ChevronRight className="w-8 h-8 text-[#1b1b1b]" />
          </button>

          <div className="relative w-full h-full lg:w-[90vw] lg:h-[90vh] p-4">
            <Image 
              src={mainImage} 
              alt="Vue zoomée" 
              fill 
              className="object-contain" 
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
}