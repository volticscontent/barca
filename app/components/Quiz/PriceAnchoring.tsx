"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { kits } from "./data"
import { DiscountProgressBar } from "./ui"

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
    <div className="bg-white overflow-x-hidden">
            
      <div className="flex p-4 flex-col md:flex-row gap-2 bg-white rounded-xl overflow-hidden shadow-lg">
        <div className="">
             
            <h2 className="text-3xl font-extrabold text-center underline decoration-[#863535] text-gray-800 mb-4 leading-tight">
              Super, vous avez <br></br>débloqué votre réduction !
            </h2>

            
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-sm font-medium uppercase text-gray-900 mb-4 leading-tight pt-1 border-t border-gray-200">
              {selectedKitData.name}<br></br>
              <span className="text-xs font-medium text-gray-500">
                {selectedKitData.description}
              </span>
              </h1>
              <div className="flex flex-col items-end">
                <div className="flex items-right">
                  <span className="bg-[#0d3650] text-white border border-[#a11c1c] text-xs font-bold px-1 py-1 rounded-l uppercase tracking-wider">Offre</span>
               <span className="bg-[#a11c1c] text-white border-x border-[#a11c1c] text-xs font-bold px-0.5 py-[0.8300rem] uppercase tracking-wider"></span> 
               <span className="bg-[#0d3650] text-white border border-[#a11c1c] text-xs font-bold px-1 py-1 rounded-r uppercase tracking-wider">Limitée</span>  
                </div>
                <span className="text-3xl font-bold text-gray-800 line-through">{selectedKitData.originalPrice.toFixed(2)}€</span>
                <span className="text-lg text-gray-900">{finalPrice.toFixed(2)}€</span>
                 <span className="text-sm font-medium rounded-l-full border-r-2 border-[#358659] text-green-600 bg-green-100 pr-3 py-1.5 text-right">
                  Économisez {selectedKitData.savings.toFixed(2)}€
                 </span>
              </div>
            </div>
          </div>

        {/* Left Column - Product Image */}
        <div className="w-full md:w-1/2 relative bg-gray-10">
          <div className="flex items-center mb-2">
              <span className="text-green-600 bg-green-50 p-2 text-xs font-medium uppercase tracking-wider">
                En Stock
              </span>
          </div>
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
        <div className="w-full md:w-1/2 flex flex-col justify-center">

          <DiscountProgressBar correctAnswers={5} />        

          <button
            onClick={() => onBuyClick?.(selectedKit)}
            className="w-full bg-linear-to-r from-[#036b40] to-green-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Aller au magasin</span>
            <Image src="/images/header/aspire-icon-aspire-cart-icon copy.svg" alt="PSG STORE" className="text-white" width={20} height={20} />
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-4">
            Garantie de 30 Jours • Livraison Gratuite
          </p>
        </div>
      </div>
    </div>
  )
}
