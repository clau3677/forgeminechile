/**
 * TrackingPixels Component - Initializes all advertising pixels
 * Supports: Facebook Pixel, Google Ads, TikTok Pixel, LinkedIn Insight Tag
 * 
 * Pixel IDs are configured via environment variables:
 * - VITE_FB_PIXEL_ID: Facebook/Meta Pixel ID
 * - VITE_GOOGLE_ADS_ID: Google Ads Tag ID (e.g., AW-1234567890)
 * - VITE_TIKTOK_PIXEL_ID: TikTok Pixel ID
 * - VITE_LINKEDIN_PARTNER_ID: LinkedIn Partner ID
 */

import { useEffect } from "react";
import { captureUTMParams } from "@/lib/tracking";

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function injectInlineScript(code: string, id: string): void {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.innerHTML = code;
  document.head.appendChild(script);
}

function injectNoscriptPixel(src: string, id: string): void {
  if (document.getElementById(id)) return;
  const noscript = document.createElement("noscript");
  noscript.id = id;
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = src;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
}

export default function TrackingPixels() {
  useEffect(() => {
    // Capture UTM parameters on page load
    captureUTMParams();

    const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
    const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
    const tiktokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;
    const linkedinPartnerId = import.meta.env.VITE_LINKEDIN_PARTNER_ID;

    // ==========================================
    // Facebook Pixel (Meta Pixel)
    // ==========================================
    if (fbPixelId) {
      injectInlineScript(
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`,
        "fb-pixel-init"
      );
      injectNoscriptPixel(
        `https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`,
        "fb-pixel-noscript"
      );
    }

    // ==========================================
    // Google Ads / gtag.js
    // ==========================================
    if (googleAdsId) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`, "gtag-script")
        .then(() => {
          injectInlineScript(
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAdsId}');`,
            "gtag-config"
          );
        })
        .catch(() => {
          // Script blocked by ad blocker
        });
    }

    // ==========================================
    // TikTok Pixel
    // ==========================================
    if (tiktokPixelId) {
      injectInlineScript(
        `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page()}(window,document,'ttq');`,
        "tiktok-pixel-init"
      );
    }

    // ==========================================
    // LinkedIn Insight Tag
    // ==========================================
    if (linkedinPartnerId) {
      injectInlineScript(
        `_linkedin_partner_id="${linkedinPartnerId}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);`,
        "linkedin-insight-init"
      );
      injectNoscriptPixel(
        `https://px.ads.linkedin.com/collect/?pid=${linkedinPartnerId}&fmt=gif`,
        "linkedin-insight-noscript"
      );
    }
  }, []);

  return null;
}
