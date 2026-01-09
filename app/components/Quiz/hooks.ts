import { useState, useEffect, useRef, useCallback } from "react"
import { trackQuizStep, useTikTokClickIdCapture } from "../../lib/utils"
import { useUTMNavigation } from "../../lib/utmNavigation"
import { questions } from "./data"

// Hook para controlar o carregamento dos pixels - simplificado
export const usePixelLoader = () => {
  const [isPixelsReady, setPixelsReady] = useState(false);
  const pixelsInitialized = useRef(false);

  useEffect(() => {
    if (pixelsInitialized.current) {
      const timer = setTimeout(() => setPixelsReady(true), 0);
      return () => clearTimeout(timer);
    }

    // Verifica se os pixels estão carregados (Facebook no layout global)
    const checkPixels = () => {
      const win = window as unknown as { fbq: unknown; ttq: unknown };
      return typeof win.fbq === 'function' && typeof win.ttq !== 'undefined' && win.ttq;
    };

    // Função que verifica os pixels
    const checkAll = () => {
      if (checkPixels()) {
        setPixelsReady(true);
        pixelsInitialized.current = true;
        clearInterval(checkInterval);
      }
    };

    // Inicia verificação periódica
    const checkInterval = setInterval(checkAll, 500);

    // Timeout de segurança após 5 segundos
    const timeoutId = setTimeout(() => {
      setPixelsReady(true);
      pixelsInitialized.current = true;
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  return isPixelsReady;
};

// Rastrear visualização da VSL apenas uma vez globalmente
export const useTrackVSLView = () => {
  useEffect(() => {
    setTimeout(() => {
      trackQuizStep('vsl_view'); // Rastrear visualização do vídeo
    }, 1000);
  }, []);
};

export const useAudioSystem = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAudio = () => {
      try {
        if (!audioRef.current) {
          const audio = new Audio("https://cdn.shopify.com/s/files/1/0946/2290/8699/files/notifica_o-venda.mp3?v=1749150271");
          audio.preload = "auto";
          audio.volume = 1;
          audioRef.current = audio;

          // Inicializa o contexto de áudio para dispositivos móveis
          const AudioContext = (window as unknown as { AudioContext: new () => AudioContext }).AudioContext || (window as unknown as { webkitAudioContext: new () => AudioContext }).webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            if (audioContext.state === "suspended") {
              audioContext.resume();
            }
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Inicializa na primeira interação
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, []);

  return { playSound, isInitialized };
};

export const useQuizLogic = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUSPPanel, setShowUSPPanel] = useState(false);
  
  const { playSound } = useAudioSystem();
  const { navigateWithUTM } = useUTMNavigation();

  // Initialize TikTok capture
  useTikTokClickIdCapture();
  
  // Track VSL View
  useTrackVSLView();

  // Track final page view
  useEffect(() => {
    if (quizCompleted) {
      trackQuizStep('final_page_viewed');
    }
  }, [quizCompleted]);

  const handleStartQuiz = useCallback(() => {
    setIsLoading(true);
    trackQuizStep('quiz_start');
    
    setTimeout(() => {
      setGameStarted(true);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  }, []);

  const handleAnswer = useCallback(() => {
    if (isSubmitting) return;
    
    if (currentQuestion < 0 || currentQuestion >= questions.length) {
      console.error('Current question index out of bounds');
      return;
    }

    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData) {
      console.error('Question data not found');
      return;
    }
    
    if (selectedAnswer === '' || selectedAnswer === null) {
      return;
    }
    
    setIsSubmitting(true);
    const isCorrect = Number.parseInt(selectedAnswer) === currentQuestionData.correct;
    const questionNumber = currentQuestion + 1;

    setCorrectAnswers(prev => prev + 1);
    trackQuizStep('question_answered', questionNumber, isCorrect);
    setShowNotification(true);
    playSound();

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setQuizCompleted(true);
        trackQuizStep('quiz_completed');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsSubmitting(false);
    }, 600);
  }, [currentQuestion, isSubmitting, selectedAnswer, playSound]);

  const handleRestart = useCallback(() => {
    trackQuizStep('quiz_restart');
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setCorrectAnswers(0);
    setQuizCompleted(false);
    setShowNotification(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBuyNowClick = useCallback((selectedKit: string) => {
    trackQuizStep('go_to_store');
    
    const internalRoutes = {
      "luxury-perfumes": "/",
      "john-cena": "/collections/mens",
    };
    
    const route = internalRoutes[selectedKit as keyof typeof internalRoutes] || "/";
    navigateWithUTM(route);
  }, [navigateWithUTM]);

  const handleUSPClick = useCallback(() => setShowUSPPanel(true), []);
  const handleUSPClose = useCallback(() => setShowUSPPanel(false), []);

  return {
    state: {
      gameStarted,
      currentQuestion,
      selectedAnswer,
      correctAnswers,
      quizCompleted,
      showNotification,
      isLoading,
      isSubmitting,
      showUSPPanel
    },
    actions: {
      setGameStarted,
      setCurrentQuestion,
      setSelectedAnswer,
      setCorrectAnswers,
      setQuizCompleted,
      setShowNotification,
      setIsLoading,
      setIsSubmitting,
      setShowUSPPanel,
      handleStartQuiz,
      handleAnswer,
      handleRestart,
      handleBuyNowClick,
      handleUSPClick,
      handleUSPClose
    }
  };
};

export const useQuizTimer = (gameStarted: boolean, quizCompleted: boolean, currentQuestion: number, onTimeout: () => void) => {
  const [progressValue, setProgressValue] = useState(100);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    if (gameStarted && !quizCompleted) {
      progressTimer.current = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (progressTimer.current) {
              clearInterval(progressTimer.current);
            }
            onTimeout();
            return 100;
          }
          return newValue;
        });
      }, 100);
    }
    
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [gameStarted, quizCompleted, currentQuestion, onTimeout]);

  // Reset progress when question changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(prev => prev === 100 ? prev : 100);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentQuestion]);

  return progressValue;
};
