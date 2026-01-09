"use client";

import { X } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1b1b1b]">Men&apos;s Tops Size Chart</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-gray-600 mb-6">
            Use this chart to find your perfect fit. If you&apos;re on the borderline between two sizes, order the smaller size for a tighter fit or the larger size for a looser fit.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-bold">Size</th>
                  <th className="px-4 py-3 font-bold">Chest (cm)</th>
                  <th className="px-4 py-3 font-bold">Waist (cm)</th>
                  <th className="px-4 py-3 font-bold">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">S</td>
                  <td className="px-4 py-3 text-gray-600">88 - 96</td>
                  <td className="px-4 py-3 text-gray-600">73 - 81</td>
                  <td className="px-4 py-3 text-gray-600">88 - 96</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">M</td>
                  <td className="px-4 py-3 text-gray-600">96 - 104</td>
                  <td className="px-4 py-3 text-gray-600">81 - 89</td>
                  <td className="px-4 py-3 text-gray-600">96 - 104</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">L</td>
                  <td className="px-4 py-3 text-gray-600">104 - 112</td>
                  <td className="px-4 py-3 text-gray-600">89 - 97</td>
                  <td className="px-4 py-3 text-gray-600">104 - 112</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">XL</td>
                  <td className="px-4 py-3 text-gray-600">112 - 124</td>
                  <td className="px-4 py-3 text-gray-600">97 - 109</td>
                  <td className="px-4 py-3 text-gray-600">112 - 120</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">2XL</td>
                  <td className="px-4 py-3 text-gray-600">124 - 136</td>
                  <td className="px-4 py-3 text-gray-600">109 - 121</td>
                  <td className="px-4 py-3 text-gray-600">120 - 128</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#1b1b1b]">3XL</td>
                  <td className="px-4 py-3 text-gray-600">136 - 148</td>
                  <td className="px-4 py-3 text-gray-600">121 - 133</td>
                  <td className="px-4 py-3 text-gray-600">128 - 136</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-sm">
             <h3 className="font-bold text-sm mb-2">How to Measure</h3>
             <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
               <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
               <li><strong>Waist:</strong> Measure around the narrowest part (typically where your body bends side to side), keeping the tape horizontal.</li>
               <li><strong>Hips:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
