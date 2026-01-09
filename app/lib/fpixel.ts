export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: any;
  }
}

interface UserData {
  em?: string; // Email (lowercase)
  ph?: string; // Phone (numbers only)
  fn?: string; // First Name (lowercase)
  ln?: string; // Last Name (lowercase)
  ct?: string; // City (lowercase)
  st?: string; // State (lowercase)
  zp?: string; // Zip (lowercase)
  country?: string; // Country (lowercase)
  external_id?: string;
  [key: string]: string | undefined;
}

export const pageview = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "PageView");
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options = {}, eventID?: string, userData?: UserData) => {
  if (typeof window.fbq !== "undefined") {
    const params = eventID ? { ...options, eventID } : options;
    
    if (userData) {
        // Advanced Matching (init is usually done globally, but we can pass data in init or use setUserData if supported by specific libs, 
        // but standard fbq('init', id, userData) is common. 
        // However, for individual events, we might need to rely on the init's user data or call init again?
        // Actually, fbq('init', 'ID', { ...userData }) is the standard way to set it.
        // If we want to update it later, we might call init again or just rely on what was set.
        // BUT, for standard events, we can just track.
        
        // Strategy: We will re-init or assume init was called. 
        // Better: We can pass userData to 'init' if we have it on load.
        // Since we are SPA, we can call fbq('init', FB_PIXEL_ID, userData) again before tracking?
        // Facebook docs say: "You can call the init function multiple times..."
        
        window.fbq('init', FB_PIXEL_ID, userData);
    }

    window.fbq("track", name, params);
  }
};

// Helper to normalize data for Advanced Matching
export const normalizeData = (data: { 
    email?: string; 
    phone?: string; 
    firstName?: string; 
    lastName?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}) => {
    const normalized: UserData = {};
    
    if (data.email) {
        normalized.em = data.email.trim().toLowerCase();
    }
    
    if (data.phone) {
        // Remove all non-numeric characters
        normalized.ph = data.phone.replace(/\D/g, '');
    }

    if (data.firstName) normalized.fn = data.firstName.trim().toLowerCase();
    if (data.lastName) normalized.ln = data.lastName.trim().toLowerCase();
    if (data.city) normalized.ct = data.city.trim().toLowerCase();
    if (data.state) normalized.st = data.state.trim().toLowerCase();
    if (data.zip) normalized.zp = data.zip.trim().toLowerCase();
    if (data.country) normalized.country = data.country.trim().toLowerCase();

    return normalized;
};
