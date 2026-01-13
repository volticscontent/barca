"use client";

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import SizeChartModal from './SizeChartModal';

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function SizeSelector({ selectedSize, onSelectSize }: { selectedSize: string | null, onSelectSize: (size: string) => void }) {
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  return (
    <div className="mb-8">
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-[#1b1b1b] uppercase">SIZE</span>
        <button 
          onClick={() => setIsSizeChartOpen(true)}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black transition-colors"
        >
          <Ruler className="w-3 h-3" />
          Size guide
        </button>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onSelectSize(size)}
            className={`
              h-8 w-[56px] flex items-center justify-center rounded-full text-xs font-medium transition-all duration-200
              ${selectedSize === size 
                ? 'bg-[#165fce] text-white shadow-md' 
                : 'bg-blue-100 border border-gray-200 text-[#181733] hover:border-[#154284]'}
            `}
          >
            {size}
          </button>
        ))}
      </div>
      
      {selectedSize && (
        <p className="mt-2 text-sm text-primary font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Size {selectedSize} selected
        </p>
      )}
    </div>
  );
}
