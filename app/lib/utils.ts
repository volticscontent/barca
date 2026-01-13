import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
    };
  }
}

export function trackQuizStep(step: string, questionNumber?: number, isCorrect?: boolean) {
  if (typeof window === 'undefined') return;

  const eventName = `Quiz_${step}`;
  const params = {
    step,
    question_number: questionNumber,
    is_correct: isCorrect,
    timestamp: new Date().toISOString()
  };

  // Log for debugging
  // console.log(`[Analytics] ${eventName}`, params);

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, params);
  }
}

