// Utilitário para preservar parâmetros UTM em navegações internas

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
  [key: string]: string | undefined;
}

// Função para capturar e salvar UTMs da URL atual
export function captureUTMParams() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = getUTMParams(); // Mantém os existentes
  let hasNewUTM = false;

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck'].forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
      hasNewUTM = true;
    }
  });

  if (hasNewUTM) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}

// Função para obter parâmetros UTM do sessionStorage
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  try {
    const utmData = sessionStorage.getItem('utm_params');
    return utmData ? JSON.parse(utmData) : {};
  } catch {
    return {};
  }
}

// Função para adicionar UTM a uma URL
export function addUTMToUrl(url: string, utmParams?: UTMParams): string {
  const params = utmParams || getUTMParams();
  
  if (Object.keys(params).length === 0) {
    return url;
  }

  try {
    const urlObj = new URL(url, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value);
      }
    });
    
    return urlObj.pathname + urlObj.search + urlObj.hash;
  } catch {
    // Se falhar ao criar URL, retorna a URL original
    return url;
  }
}

// Função para criar href com UTM preservado
export function createUTMHref(href: string): string {
  return addUTMToUrl(href);
}

// Hook para navegação com UTM preservado
export function useUTMNavigation() {
  const utmParams = getUTMParams();
  
  const navigateWithUTM = (href: string) => {
    const urlWithUTM = addUTMToUrl(href, utmParams);
    window.location.href = urlWithUTM;
  };
  
  const createHrefWithUTM = (href: string) => {
    return addUTMToUrl(href, utmParams);
  };
  
  return {
    navigateWithUTM,
    createHrefWithUTM,
    utmParams
  };
}
