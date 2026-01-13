"use client";

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import TrackViewContent from "./components/TrackViewContent";

export default function Home() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TrackViewContent
        contentName="PSG Nike Dri-FIT ADV Home Match Shirt 2025-26"
        contentIds={["202333090"]}
        contentType="product"
        value={149.99}
        currency="EUR"
      />
      <Header />
      
      <main className="flex-1 pb-12 pt-[104px] lg:pt-[120px]">
        <div className="max-w-[1400px] sm:px-4 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Gallery (7 cols) */}
            <div className="lg:col-span-7 mb-2 lg:mb-0">
              <ProductGallery selectedBadge={selectedBadge} />
            </div>

            {/* Right Column: Info (5 cols) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ProductInfo selectedBadge={selectedBadge} onBadgeChange={setSelectedBadge} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
