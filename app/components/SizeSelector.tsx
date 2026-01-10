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
        <span className="text-sm font-bold text-[#1b1b1b]">Taille</span>
        <button 
          onClick={() => setIsSizeChartOpen(true)}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary underline underline-offset-2 transition-colors"
        >
          <Ruler className="w-3 h-3" />
          Guide des tailles
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onSelectSize(size)}
            className={`
              h-12 flex items-center justify-center rounded-sm border text-sm font-bold transition-all duration-200
              ${selectedSize === size 
                ? 'border-primary bg-primary text-white shadow-md transform scale-[1.02]' 
                : 'border-gray-400 bg-gray-100 text-[#1b1b1b] hover:border-primary hover:bg-gray-50 hover:shadow-sm'}
            `}
          >
            {size}
          </button>
        ))}
      </div>
      
      {selectedSize && (
        <p className="mt-2 text-sm text-primary font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Taille {selectedSize} sélectionnée
        </p>
      )}
    </div>
  );
}
