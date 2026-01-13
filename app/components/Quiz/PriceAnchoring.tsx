"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { kits } from "./data"
import { DiscountProgressBar } from "./ui"
import { Check } from "lucide-react"

interface PriceAnchoringProps {
  correctAnswers: number
  onBuyClick?: (selectedKit: string, options?: unknown) => void
}

export default function PriceAnchoring({ onBuyClick }: PriceAnchoringProps) {
  const [selectedKit] = useState<string>("barca-home-kit")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // State for Add-ons
  const [personalization] = useState(false)
  const [selectedBadge] = useState<"none" | "laliga" | "ucl" | "supercopa">("none")

  const selectedKitData = kits.find(kit => kit.id === selectedKit) || kits[0]
  
  // Calculate Final Price
  const basePrice = selectedKitData.price
  const personalizationPrice = personalization ? 20 : 0
  const badgePrice = selectedBadge === "laliga" ? 15 : selectedBadge === "ucl" ? 15 : selectedBadge === "supercopa" ? 30 : 0
  
  const finalPrice = basePrice + personalizationPrice + badgePrice
  const totalOriginalPrice = selectedKitData.originalPrice + personalizationPrice + badgePrice

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
            
      <div className="flex p-4 flex-col md:flex-row gap-6 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
        
        {/* Left Column - Product Image */}
        <div className="w-full md:w-1/2 relative bg-gray-50 rounded-xl overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
              <span className="text-white bg-[#181733] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm">
                En Stock
              </span>
          </div>
          <div className="relative aspect-square">
            <Image
              src={selectedKitData.images[currentImageIndex]}
              alt={selectedKitData.name}
              fill
              className="object-cover transition-opacity duration-500 hover:scale-105 transform transition-transform"
              priority
            />
            
            {/* Image Navigation Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {selectedKitData.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-[#181733] w-4" : "bg-gray-300"
                  }`}
                  aria-label={`Ver imagen ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="w-full md:w-1/2 flex flex-col">
             
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#181733] mb-2 leading-tight">
              ¡Felicidades! <br/>Has desbloqueado el precio de campeón.
            </h2>
            
            <h1 className="text-base font-medium text-gray-900 mb-4 leading-tight border-b border-gray-100 pb-2">
              {selectedKitData.name}<br/>
              <span className="text-sm font-normal text-gray-500 mt-1 block">
                {selectedKitData.description}
              </span>
            </h1>

            {/* Final Price Display */}
            <div className="flex items-end justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Precio Total</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-medium text-gray-400 line-through decoration-red-500">{totalOriginalPrice.toFixed(2)}€</span>
                <span className="text-4xl font-black text-[#181733]">{finalPrice.toFixed(2)}€</span>
              </div>
            </div>

          <button
            onClick={() => onBuyClick?.(selectedKit, { personalization, badge: selectedBadge })}
            className="w-full bg-gradient-to-r from-[#181733] to-[#003055] hover:from-[#A50044] hover:to-[#800033] text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span>COMPRAR AHORA</span>
            <Image src="/images/header/aspire-icon-aspire-cart-iconcopy.svg" alt="Cart" className="" width={20} height={20} />
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> Garantía de 30 Días • Envío Rápido a España
          </p>

          <div className="mt-4">
             <DiscountProgressBar correctAnswers={5} /> 
          </div>
        </div>
      </div>
    </div>
  )
}
