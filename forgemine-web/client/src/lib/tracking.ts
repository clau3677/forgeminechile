/**
 * Tracking & Analytics Utilities for FORGEMINE
 * Handles UTM parameter capture, conversion events, and pixel tracking
 */

// ==========================================
// UTM Parameter Capture
// ==========================================

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;       // Google Ads click ID
  fbclid?: string;      // Facebook click ID
  ttclid?: string;      // TikTok click ID
  li_fat_id?: string;   // LinkedIn click ID
}

const UTM_STORAGE_KEY = 'forgemine_utm_params';
const UTM_EXPIRY_KEY = 'forgemine_utm_expiry';
const UTM_EXPIRY_DAYS = 30;

/**
 * Capture UTM parameters from URL and store in sessionStorage + localStorage
 * Call this on app initialization
 */
export function captureUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utmKeys: (keyof UTMParams)[] = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'ttclid', 'li_fat_id'
  ];
  
  const captured: UTMParams = {};
  let hasUTM = false;
  
  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) {
      captured[key] = value;
      hasUTM = true;
    }
  }
  
  if (hasUTM) {
    // Store with expiry
    const expiry = Date.now() + (UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    try {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
      localStorage.setItem(UTM_EXPIRY_KEY, expiry.toString());
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
    } catch {
      // Storage might be full or disabled
    }
  }
  
  return captured;
}

/**
 * Get stored UTM parameters (from session first, then localStorage)
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  try {
    // Try session first (most recent visit)
    const sessionData = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (sessionData) return JSON.parse(sessionData);
    
    // Fall back to localStorage (within expiry)
    const expiry = localStorage.getItem(UTM_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      localStorage.removeItem(UTM_EXPIRY_KEY);
      return {};
    }
    
    const localData = localStorage.getItem(UTM_STORAGE_KEY);
    if (localData) return JSON.parse(localData);
  } catch {
    // Parse error
  }
  
  return {};
}

/**
 * Get UTM params as a flat object for form submission
 */
export function getUTMForSubmission(): Record<string, string> {
  const params = getStoredUTMParams();
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) result[key] = value;
  }
  return result;
}

// ==========================================
// Conversion Event Tracking
// ==========================================

type ConversionEventName = 
  | 'quote_form_start'
  | 'quote_form_submit'
  | 'whatsapp_click'
  | 'chatbot_open'
  | 'chatbot_message'
  | 'phone_click'
  | 'email_click'
  | 'promo_cta_click'
  | 'blog_read'
  | 'service_page_view';

interface ConversionEventData {
  event_name: ConversionEventName;
  event_category?: string;
  event_label?: string;
  event_value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track a conversion event across all configured pixels
 */
export function trackConversion(event: ConversionEventData): void {
  if (typeof window === 'undefined') return;
  
  const { event_name, event_category, event_label, event_value, ...customData } = event;
  
  // 1. Facebook Pixel (Meta Pixel)
  trackFacebookEvent(event_name, { event_category, event_label, event_value, ...customData });
  
  // 2. Google Ads / gtag
  trackGoogleEvent(event_name, { event_category, event_label, event_value, ...customData });
  
  // 3. TikTok Pixel
  trackTikTokEvent(event_name, customData);
  
  // 4. LinkedIn Insight Tag
  trackLinkedInEvent(event_name, customData);
  
  // 5. Console log for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('[FORGEMINE Tracking]', event_name, { event_category, event_label, event_value, ...customData });
  }
}

// ==========================================
// Facebook Pixel (Meta Pixel)
// ==========================================

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    ttq?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      page: () => void;
      load: (pixelId: string) => void;
    };
    lintrk?: (action: string, data?: Record<string, unknown>) => void;
    _linkedin_partner_id?: string;
  }
}

function trackFacebookEvent(eventName: string, data: Record<string, unknown>): void {
  if (!window.fbq) return;
  
  const fbEventMap: Record<string, string> = {
    'quote_form_start': 'InitiateCheckout',
    'quote_form_submit': 'Lead',
    'whatsapp_click': 'Contact',
    'chatbot_open': 'ViewContent',
    'chatbot_message': 'CustomizeProduct',
    'phone_click': 'Contact',
    'email_click': 'Contact',
    'promo_cta_click': 'AddToCart',
    'blog_read': 'ViewContent',
    'service_page_view': 'ViewContent',
  };
  
  const fbEvent = fbEventMap[eventName];
  if (fbEvent) {
    window.fbq('track', fbEvent, {
      content_name: data.event_label || eventName,
      content_category: data.event_category || 'general',
      value: data.event_value || 0,
      currency: 'USD',
    });
  } else {
    window.fbq('trackCustom', eventName, data);
  }
}

// ==========================================
// Google Ads / gtag.js
// ==========================================

function trackGoogleEvent(eventName: string, data: Record<string, unknown>): void {
  if (!window.gtag) return;
  
  const gtagEventMap: Record<string, string> = {
    'quote_form_start': 'begin_checkout',
    'quote_form_submit': 'generate_lead',
    'whatsapp_click': 'contact',
    'chatbot_open': 'view_item',
    'chatbot_message': 'add_to_cart',
    'phone_click': 'contact',
    'email_click': 'contact',
    'promo_cta_click': 'select_promotion',
    'blog_read': 'view_item',
    'service_page_view': 'view_item_list',
  };
  
  window.gtag('event', gtagEventMap[eventName] || eventName, {
    event_category: data.event_category || 'engagement',
    event_label: data.event_label || eventName,
    value: data.event_value || 0,
  });
}

// ==========================================
// TikTok Pixel
// ==========================================

function trackTikTokEvent(eventName: string, data: Record<string, unknown>): void {
  if (!window.ttq) return;
  
  const ttEventMap: Record<string, string> = {
    'quote_form_start': 'InitiateCheckout',
    'quote_form_submit': 'SubmitForm',
    'whatsapp_click': 'Contact',
    'chatbot_open': 'ViewContent',
    'phone_click': 'Contact',
    'promo_cta_click': 'ClickButton',
  };
  
  const ttEvent = ttEventMap[eventName];
  if (ttEvent) {
    window.ttq.track(ttEvent, { content_name: data.event_label || eventName });
  }
}

// ==========================================
// LinkedIn Insight Tag
// ==========================================

function trackLinkedInEvent(eventName: string, data: Record<string, unknown>): void {
  if (!window.lintrk) return;
  
  // LinkedIn uses conversion IDs configured in Campaign Manager
  // We fire a generic conversion event
  if (['quote_form_submit', 'promo_cta_click', 'whatsapp_click'].includes(eventName)) {
    window.lintrk('track', { conversion_id: data.event_label || eventName });
  }
}

// ==========================================
// Pixel Initialization Scripts
// ==========================================

/**
 * Generate the Facebook Pixel initialization script
 * @param pixelId - Facebook Pixel ID (e.g., "1234567890")
 */
export function getFacebookPixelScript(pixelId: string): string {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
}

/**
 * Generate the Google Ads/gtag initialization script
 * @param gtagId - Google Ads Tag ID (e.g., "AW-1234567890")
 */
export function getGoogleAdsScript(gtagId: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gtagId}');
  `;
}

/**
 * Generate the TikTok Pixel initialization script
 * @param pixelId - TikTok Pixel ID
 */
export function getTikTokPixelScript(pixelId: string): string {
  return `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `;
}

/**
 * Generate the LinkedIn Insight Tag initialization script
 * @param partnerId - LinkedIn Partner ID
 */
export function getLinkedInInsightScript(partnerId: string): string {
  return `
    _linkedin_partner_id = "${partnerId}";
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    (function(l) {
      if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);})(window.lintrk);
  `;
}
