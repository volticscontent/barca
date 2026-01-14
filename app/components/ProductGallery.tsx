"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MAIN_PRODUCT } from '@/app/data/products';

export default function ProductGallery() {
  const [mainImage, setMainImage] = useState(MAIN_PRODUCT.images[0]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Touch state for swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const nextImage = () => {
    const currentIndex = MAIN_PRODUCT.images.indexOf(mainImage);
    if (currentIndex === -1) {
      setMainImage(MAIN_PRODUCT.images[0]);
    } else {
      const nextIndex = (currentIndex + 1) % MAIN_PRODUCT.images.length;
      setMainImage(MAIN_PRODUCT.images[nextIndex]);
    }
  };

  const prevImage = () => {
    const currentIndex = MAIN_PRODUCT.images.indexOf(mainImage);
    if (currentIndex === -1) {
      setMainImage(MAIN_PRODUCT.images[MAIN_PRODUCT.images.length - 1]);
    } else {
      const prevIndex = (currentIndex - 1 + MAIN_PRODUCT.images.length) % MAIN_PRODUCT.images.length;
      setMainImage(MAIN_PRODUCT.images[prevIndex]);
    }
  };

  return (
    <>
      <div className="flex flex-row gap-3 lg:gap-4 lg:p-2 h-[555px] lg:h-[700px]">

        {/* Thumbnails (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 overflow-y-auto scrollbar-hide w-20 h-full">
          {MAIN_PRODUCT.images.map((img, index) => (
            <div 
              key={index} 
              className={`relative w-full aspect-[3/4] cursor-pointer border-2 transition-all ${mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
              onClick={() => setMainImage(img)}
            >
              <Image 
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                fill 
                className="object-cover"
                sizes="80px"
              />
            </div>
          ))}
        </div>

        {/* Main Image (Responsive) */}
        <div 
          className="relative flex-1 bg-gray-100 overflow-hidden h-full cursor-zoom-in group touch-pan-y" 
          onClick={() => setIsZoomOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image 
            src={mainImage} 
            alt="FCB Home Kit Main View"
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            sizes="(min-width: 1080px) 800px, 100vw"
            priority
          />

          {/* Navigation Arrows */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          {/* Dots Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
            {MAIN_PRODUCT.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setMainImage(img)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  mainImage === img ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>

          {/* Zoom Icon Hint */}
          <button className="absolute bottom-4 right-4 bg-white/90 p-2 lg:p-3 rounded-full hover:bg-white transition-colors shadow-sm z-10">
             <ZoomIn className="w-4 h-4 lg:w-5 lg:h-5 text-[#1b1b1b]" />
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center animate-in fade-in duration-200 touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
              alt="Zoom View" 
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
