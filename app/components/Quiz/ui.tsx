import React, { useState, useEffect, useRef } from "react"
import { DollarSign } from "lucide-react"
import Image from "next/image"
import styles from '../../styles/animations.module.css'
import PriceAnchoring from "./PriceAnchoring"
import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { Trophy } from "lucide-react"
import { Question } from "./data"

// Enhanced notification component with better animations
export const SuccessNotification = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (show) {
      const visibilityTimer = setTimeout(() => setIsVisible(true), 0)
      const progressTimer = setTimeout(() => setProgress(100), 0)
      
      // Update progress every 100ms for smoother animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return prev - 2 // Decrease 2% every 100ms = 5 seconds total
        })
      }, 100)
      
      const exitTimer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            onClose()
            setIsExiting(false)
            setProgress(100) // Reset progress
          }, 500) // Increased exit animation time
        }, 200)
      }, 5000) // Increased display time to 5 seconds

      return () => {
        clearTimeout(visibilityTimer)
        clearTimeout(progressTimer)
        clearTimeout(exitTimer)
        clearInterval(progressInterval)
      }
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-700 transform ${
        isVisible && !isExiting 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className="bg-gradient-to-r from-[#181733] to-[#A50044] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-blue-400 backdrop-blur-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-[#181733] animate-bounce" />
        </div>        <div>
          <p className="font-bold text-lg">¡Felicidades! 🎉</p>
          <p className="text-sm opacity-90">¡Has desbloqueado más descuento!</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 rounded-b-xl" style={{ 
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}></div>
      </div>
    </div>
  )
}

// Falling soccer ball component
export const FallingSoccerBall = ({ delay }: { delay: number }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    // Math.random is impure, so we run it in an effect
    const timer = setTimeout(() => setLeft(Math.random() * 100), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute text-[#181733] text-2xl pointer-events-none ${styles.fall}`}
      style={{
        left: `${left}%`,
        top: '-50px',
        animationDelay: `${delay}ms`
      }}
    >
      ⚽
    </div>
  )
}

// Loading component for better UX
export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#181733] border-t-transparent`}></div>
  )
}

// Componente de vídeo simplificado
export const VideoPlayer = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const forcePlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {
            console.log("Unable to start video automatically");
          });
        });
      }
    };

    forcePlay();
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('loadeddata', forcePlay);
    setTimeout(forcePlay, 1000);

    return () => {
      video.removeEventListener('canplay', forcePlay);
      video.removeEventListener('loadeddata', forcePlay);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted) {
        // If unmuted, hide button after small delay
        setTimeout(() => {
          setShowMuteButton(false);
        }, 500);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
      <video
        ref={videoRef}
        suppressHydrationWarning
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '25px'
        }}
        autoPlay
        playsInline
        controls={false}
        preload="auto"
        src="/vsl.mp4"
      />
      {showMuteButton && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isMuted ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

// Componente do painel USP - versão minimalista
export const USPPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-20 flex items-start justify-center">
      <div className="bg-white w-full max-w-4xl mt-12 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-black">FC Barcelona</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-px bg-gray-100">
          {/* History */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Desde 1899</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
            Més que
          </div>
            <div className="text-xs text-gray-500">
              un Club
            </div>
          </div>

          {/* Achievements */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Leyenda</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Johan Cruyff
            </div>
            <div className="text-xs text-gray-500">
              Inspiración
            </div>
          </div>

          {/* Legacy */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Talento</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              La Masia
            </div>
            <div className="text-xs text-gray-500">
              Futuro
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">El Mejor Club del Mundo</div>
        </div>
      </div>
    </div>
  )
}

// Modificar o CompleteHeader
export const CompleteHeader = () => {
  return (
    <header data-auto-id="header" className="bg-white font-size-12 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* USP Bar */}
      <div className="w-full bg-[#ffffff] border-b border-gray-100 py-3">
        <div className="flex justify-between items-center px-4">
          <a href="#" aria-label="Homepage" className="flex items-center hover:opacity-80 transition-opacity duration-200" data-auto-id="logo">
             {/* Usando um placeholder de texto se a logo não estiver disponível, ou a logo svg */}
             <Image src="/images/svgs/logo.svg" alt="FC BARCELONA" width={70} height={60} />
          </a>
          <Image src="/images/contentProduct/nike.png" alt="NIKE" className="bg-black" width={50} height={50} />

        </div>
        
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-[1200px] bg-[#181733] px-4">
          <div className="flex justify-center items-center">
           <span className="text-[12px] text-white font-bold uppercase py-3">
            Responde a todas las preguntas y ahorra 100€.
           </span>
          </div>
        </div>
      </div>

    </header>
  );
};

// Discount progress bar component
export const DiscountProgressBar = ({ correctAnswers }: { correctAnswers: number }) => {
  const discount = Math.min(correctAnswers * 20, 100).toFixed(2); // Aproximadamente 100 no final
  const maxDiscount = 100;
  const progressPercentage = (parseFloat(discount) / maxDiscount) * 100;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 font-medium">Progreso del Descuento:</span>
        <div>
        <span className="font-semibold text-gray-900">€{discount} /</span>
        <span className="font-semibold text-[#32a11c]">€{maxDiscount}</span>
        </div>
      </div>
      <div 
        aria-valuemax={100} 
        aria-valuemin={0} 
        aria-valuenow={progressPercentage}
        role="progressbar" 
        className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div 
          className={`h-full transition-all duration-500 ease-out ${styles.discountProgressBar}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

// Quiz Screens
interface QuizStartScreenProps {
  onStart: () => void;
  isLoading: boolean;
  showUSPPanel: boolean;
  onUSPClose: () => void;
}

export const QuizStartScreen = ({ onStart, isLoading, showUSPPanel, onUSPClose }: QuizStartScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
    <CompleteHeader />
    <USPPanel isOpen={showUSPPanel} onClose={onUSPClose} />
    <div className="flex-grow">
      <div className="container mx-auto pt-15 gap-10">
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-semibold font-product-sans text-gray-900">Mensaje Especial</h1>
        </div>
        
        <div className="space-y-[5rem] px-2">
          <div className="animate-scaleIn">
            <VideoPlayer />
          </div>

          <div className="bg-[#181733] px-10 mx-4 font-product-sans border-[2px] rounded-[12px] border-[#A50044] p-3 shadow-sm animate-slideIn animated-border">
            <blockquote className="text-xl md:text-lg text-[#ffffff] text-center leading-relaxed">
              &quot;Responde 5 preguntas sobre el Barça y gana 100€ de descuento en la nueva camiseta.&quot;
            </blockquote>
          </div>

          <Button
            onClick={onStart}
            disabled={isLoading}
            className="mx-auto px-20 bg-[#181733] border-[#A50044] hover:border-[#EDBB00] hover:bg-[#003055] text-white hover:text-white text-xl py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-4"
            size="lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="md"  />
                Iniciando...
              </>
            ) : (
              <>
                <Trophy className="h-6 w-6" />
                Empezar Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

interface QuizQuestionScreenProps {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  progressValue: number;
  correctAnswers: number;
  showNotification: boolean;
  onNotificationClose: () => void;
  showUSPPanel: boolean;
  onUSPClose: () => void;
}

export const QuizQuestionScreen = ({
  question,
  selectedAnswer,
  onAnswerChange,
  onConfirm,
  isSubmitting,
  progressValue,
  correctAnswers,
  showNotification,
  onNotificationClose,
  showUSPPanel,
  onUSPClose
}: QuizQuestionScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
    <CompleteHeader />
    <USPPanel isOpen={showUSPPanel} onClose={onUSPClose} />
    <div className="flex-grow container mx-auto px-1 py-4">
      <SuccessNotification show={showNotification} onClose={onNotificationClose} />

      <div className="w-full max-w-2xl mx-auto space-y-18">
        <div className="mb-6 animate-fadeIn">
            <DiscountProgressBar correctAnswers={correctAnswers} />
        </div>
        
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progressValue}%`, backgroundColor: '#181733' }}
          />
        </div>
        
        <div className="space-y-8">
          <div className="animate-slideIn">
            <div className="bg-white p-6 border border-[#181733] shadow-sm transition-all duration-300 hover:shadow-md mb-4">
              <h3 className="text-xl font-semibold mb-6 text-[#181733] text-center">{question.question}</h3>

              <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange} className="space-y-3">
                {question.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index.toString();
                  return (
                    <div
                      key={index}
                      onClick={() => onAnswerChange(index.toString())}
                      className={`relative flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer border-2 overflow-hidden group ${
                        isSelected 
                          ? 'bg-[#181733] border-[#181733] shadow-lg scale-[1.02]' 
                          : 'bg-white border-gray-200 hover:border-[#181733]/50 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Indicator */}
                      <div className={`flex-shrink-0 mr-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                        isSelected ? 'border-white bg-white' : 'border-gray-300 group-hover:border-[#181733]'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#181733]" />}
                      </div>

                      <RadioGroupItem value={index.toString()} id={`option-${index}`} className="sr-only" />
                      
                      <Label 
                        htmlFor={`option-${index}`} 
                        className={`flex-1 cursor-pointer text-lg font-medium transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-gray-700 group-hover:text-[#181733]'
                        }`}
                      >
                        {option}
                      </Label>

                      {/* Highlight Effect */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <Button
              onClick={onConfirm}
              disabled={!selectedAnswer || isSubmitting}
              className={`w-full py-4 mt-3 text-white transition-all duration-200 transform hover:scale-105 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#181733] hover:bg-[#003055] hover:shadow-lg'
              }`}
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm"/>
                  Procesando...
                </div>
              ) : (
                "Confirmar Respuesta"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface QuizCompletedScreenProps {
  correctAnswers: number;
  onBuyClick: (selectedKit: string, options?: unknown) => void;
  showUSPPanel: boolean;
  onUSPClose: () => void;
}

export const QuizCompletedScreen = ({
  correctAnswers,
  onBuyClick,
  showUSPPanel,
  onUSPClose
}: QuizCompletedScreenProps) => (
  <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
    <CompleteHeader />
    <USPPanel isOpen={showUSPPanel} onClose={onUSPClose} />
    <div className="flex-grow container mx-auto">
      <div className="space-y-4">
        <div className="transform transition-all duration-500">
          <PriceAnchoring correctAnswers={correctAnswers} onBuyClick={onBuyClick} />
        </div>
      </div>
    </div>
  </div>
);
