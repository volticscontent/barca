"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { kits } from "./data"

interface PriceAnchoringProps {
  correctAnswers: number
  onBuyClick?: (selectedKit: string) => void
}

export default function PriceAnchoring({ onBuyClick }: PriceAnchoringProps) {
  const [selectedKit] = useState<string>("psg-home-kit")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const selectedKitData = kits.find(kit => kit.id === selectedKit) || kits[0]
  const finalPrice = selectedKitData.price // Use the kit's specific price

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedKitData.images.length
      )
    }, 3000)
    
    return () => clearInterval(interval)
  }, [selectedKitData.images.length])

  // Reset image index when kit changes
  useEffect(() => {
    const timer = setTimeout(() => setCurrentImageIndex(0), 0)
    return () => clearTimeout(timer)
  }, [selectedKit])

  return (
    <div className="bg-white pt-4 overflow-x-hidden">
      <h1 className="text-center text-[#2c2c2c] text-2xl font-bold font-sans mb-4">Le PSG Champion du Trophée des Champions 2026</h1>
      <div className="flex justify-center mb-6"><span className="text-sm text-wrap text-center text-gray-500">Test de Fidélité : Seuls les vrais supporters qui réussissent le quiz débloquent le prix promotionnel du maillot officiel 2026.</span></div>

      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
        {/* Left Column - Product Image */}
        <div className="w-full md:w-1/2 relative bg-gray-50">
          <div className="relative aspect-square">
            <Image
              src={selectedKitData.images[currentImageIndex]}
              alt={selectedKitData.name}
              fill
              className="object-cover transition-opacity duration-500"
              priority
            />
            
            {/* Image Navigation Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {selectedKitData.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-black w-4" : "bg-gray-300"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <div className="">
            <div className="flex items-center mb-2">
              <span className="bg-[#1c4ba1] text-white border border-[#a11c1c] text-xs font-bold px-1 py-1 rounded-l uppercase tracking-wider">Offre</span>
               <span className="bg-[#a11c1c] text-white border-x border-[#a11c1c] text-xs font-bold px-1 py-[0.9rem] rounded uppercase tracking-wider"></span> 
               <span className="bg-[#1c4ba1] text-white border border-[#a11c1c] text-xs font-bold px-1 py-1 rounded-r mr-2 uppercase tracking-wider">Limitée</span>  
              <span className="text-green-600 text-xs font-medium uppercase tracking-wider">
                En Stock
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {selectedKitData.name}
            </h2>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">€{finalPrice.toFixed(2)}</span>
              <span className="text-lg text-gray-400 line-through">€{selectedKitData.originalPrice.toFixed(2)}</span>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Économisez €{selectedKitData.savings.toFixed(2)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">
              {selectedKitData.description}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {selectedKitData.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onBuyClick?.(selectedKit)}
            className="w-full bg-linear-to-r from-[#036b40] to-green-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>PROFITER DE L&apos;OFFRE MAINTENANT</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-4">
            Garantie de 30 Jours • Livraison Gratuite
          </p>
        </div>
      </div>
    </div>
  )
}
