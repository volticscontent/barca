import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect } from "react"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Configurações dos pixels usando variáveis de ambiente NEXT_PUBLIC_ (seguras para frontend)
export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
export const UTMIFY_PIXEL_ID = process.env.NEXT_PUBLIC_UTMIFY_PIXEL_ID

// Webhook do n8n para captura do ttclid
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.landcriativa.com/webhook/quiz"
const N8N_WEBHOOK_KEY = process.env.NEXT_PUBLIC_N8N_WEBHOOK_KEY || "XBEHgtft1SvVT75xtvvogD95ExDXCqekgF2emRXDPR4KBx7QLKBfxps3tWfpBHAV"

// Controle global de eventos já disparados
const trackedEvents = new Set<string>()

// Função para capturar ttclid e enviar para n8n
export async function captureTikTokClickId() {
  if (typeof window === 'undefined') return

  try {
    const urlParams = new URLSearchParams(window.location.search)
    let ttclid = urlParams.get('ttclid')

    // Se não há ttclid na URL, tentar pegar do localStorage
    if (!ttclid) {
      ttclid = localStorage.getItem('captured_ttclid')
    } else {
      // Se há ttclid na URL, salvar no localStorage
      localStorage.setItem('captured_ttclid', ttclid)
    }

    if (ttclid) {
      // Capturar email parcial se disponível
      const email = localStorage.getItem('lead_email') || ''
      
      // Dados para enviar ao webhook
      const payload = {
        ttclid,
        email,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer || '',
        user_agent: navigator.userAgent
      }

      try {
        const response = await axios.post(N8N_WEBHOOK_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': N8N_WEBHOOK_KEY
          },
          timeout: 5000 // Reduced timeout for faster failure
        })

        if (response.status >= 200 && response.status < 300) {
          console.log('[TikTok Click ID] Successfully sent to n8n')
          return response.data
        } else {
          console.warn('[TikTok Click ID] Unexpected response status:', response.status)
        }
      } catch (error: unknown) {
        const networkError = error as Error;
        // Handle CORS and network errors gracefully without breaking the app
        console.warn('[TikTok Click ID] Network/CORS error (non-critical):', networkError.message || networkError)
        // Store the data locally as fallback
        localStorage.setItem('pending_ttclid_data', JSON.stringify(payload))
      }
    }
  } catch (error) {
    console.warn('[TikTok Click ID] General error (non-critical):', error)
  }
}

// Hook para executar captura do ttclid automaticamente
export function useTikTokClickIdCapture() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get('ttclid');
      
      if (clickId) {
        localStorage.setItem('ttclid', clickId);
        
        const ttq = (window as unknown as { ttq: { instance: (id: string) => { track: (event: string, params?: Record<string, unknown>) => void } } }).ttq;
        if (typeof ttq !== 'undefined' && ttq) {
          // Tenta associar o click ID ao pixel configurado
          if (TIKTOK_PIXEL_ID) {
             ttq.instance(TIKTOK_PIXEL_ID).track('Identify', { click_id: clickId });
          }
        }
      }
    }
  }, []);
}

interface WindowWithPixels extends Window {
  ttq?: {
    track: (eventName: string, params?: Record<string, unknown>) => void;
  };
  utmify?: {
    track: (eventName: string, params?: Record<string, unknown>) => void;
  };
}

export function trackEvent(eventName: string, parameters?: Record<string, unknown>, allowDuplicates: boolean = true) {
  // Se o evento já foi disparado e não permite duplicatas, não dispara novamente
  if (!allowDuplicates && trackedEvents.has(eventName)) {
    console.log(`[Pixel Tracking] Event already tracked:`, eventName)
    return
  }

  if (typeof window !== 'undefined') {
    const win = window as unknown as WindowWithPixels;
    
    // Facebook Pixels usando track simples
    if (win.fbq) {
      try {
        win.fbq('track', eventName, parameters)
        console.log(`[Meta Pixels] Tracked event:`, eventName, parameters)
      } catch (error) {
        console.error('[Meta Pixel] Error tracking event:', error)
      }
    }

    // TikTok Pixel
    if (typeof win.ttq !== 'undefined' && win.ttq && typeof win.ttq.track === 'function' && TIKTOK_PIXEL_ID) {
      try {
        win.ttq.track(eventName, parameters)
        console.log(`[TikTok Pixel ${TIKTOK_PIXEL_ID}] Tracked event:`, eventName, parameters)
      } catch (error) {
        console.error('[TikTok Pixel] Error tracking event:', error)
      }
    } else if (TIKTOK_PIXEL_ID) {
      console.warn('[TikTok Pixel] ttq not available or not loaded yet')
    }

    // UTMify Pixel (se disponível)
    if (win.utmify && typeof win.utmify.track === 'function') {
      try {
        win.utmify.track(eventName, parameters)
        console.log(`[UTMify Pixel] Tracked event:`, eventName, parameters)
      } catch (error) {
        console.error('[UTMify Pixel] Error tracking event:', error)
      }
    }

    // Marca o evento como disparado
    if (!allowDuplicates) {
      trackedEvents.add(eventName)
    }
  }
}

// Função específica para rastrear steps do quiz
export function trackQuizStep(step: string, value?: number | string, isCorrect?: boolean) {
  if (typeof window !== 'undefined') {
    // Facebook Pixel
    if (typeof (window as unknown as { fbq: (action: string, event: string, params?: Record<string, unknown>) => void }).fbq === 'function') {
      const params: Record<string, unknown> = {};
      if (value !== undefined) params.value = value;
      if (isCorrect !== undefined) params.isCorrect = isCorrect;
      
      (window as unknown as { fbq: (action: string, event: string, params?: Record<string, unknown>) => void }).fbq('trackCustom', step, params);
    }
    
    // TikTok Pixel
    const ttq = (window as unknown as { ttq: { track: (event: string, params?: Record<string, unknown>) => void } }).ttq;
    if (typeof ttq !== 'undefined' && ttq) {
      const params: Record<string, unknown> = {};
      if (value !== undefined) params.value = value;
      if (isCorrect !== undefined) params.isCorrect = isCorrect;

      ttq.track(step, params);
    }
  }
}
