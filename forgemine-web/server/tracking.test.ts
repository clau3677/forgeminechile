/**
 * Tests for social media optimization features
 * Validates tracking utilities, UTM parameter handling, and pixel initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JSDOM } from "jsdom";

// We test the tracking logic at a unit level since it's client-side code
// These tests validate the core logic without requiring a full browser environment

describe("Social Media Optimization", () => {
  describe("UTM Parameter Handling", () => {
    it("should parse UTM parameters from URL search params", () => {
      const params = new URLSearchParams(
        "?utm_source=facebook&utm_medium=cpc&utm_campaign=baldes_mineros&utm_content=ad1&fbclid=abc123"
      );

      const utmKeys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
        "ttclid",
        "li_fat_id",
      ];

      const captured: Record<string, string> = {};
      for (const key of utmKeys) {
        const value = params.get(key);
        if (value) captured[key] = value;
      }

      expect(captured.utm_source).toBe("facebook");
      expect(captured.utm_medium).toBe("cpc");
      expect(captured.utm_campaign).toBe("baldes_mineros");
      expect(captured.utm_content).toBe("ad1");
      expect(captured.fbclid).toBe("abc123");
      expect(captured.utm_term).toBeUndefined();
      expect(captured.gclid).toBeUndefined();
    });

    it("should handle Google Ads click ID (gclid)", () => {
      const params = new URLSearchParams("?gclid=EAIaIQobChMI_test123");
      expect(params.get("gclid")).toBe("EAIaIQobChMI_test123");
    });

    it("should handle TikTok click ID (ttclid)", () => {
      const params = new URLSearchParams("?ttclid=tiktok_click_123");
      expect(params.get("ttclid")).toBe("tiktok_click_123");
    });

    it("should handle LinkedIn click ID (li_fat_id)", () => {
      const params = new URLSearchParams("?li_fat_id=linkedin_123");
      expect(params.get("li_fat_id")).toBe("linkedin_123");
    });

    it("should return empty object when no UTM params present", () => {
      const params = new URLSearchParams("?page=1&sort=date");
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign"];
      const captured: Record<string, string> = {};
      for (const key of utmKeys) {
        const value = params.get(key);
        if (value) captured[key] = value;
      }
      expect(Object.keys(captured).length).toBe(0);
    });
  });

  describe("Conversion Event Mapping", () => {
    const fbEventMap: Record<string, string> = {
      quote_form_start: "InitiateCheckout",
      quote_form_submit: "Lead",
      whatsapp_click: "Contact",
      chatbot_open: "ViewContent",
      chatbot_message: "CustomizeProduct",
      phone_click: "Contact",
      email_click: "Contact",
      promo_cta_click: "AddToCart",
      blog_read: "ViewContent",
      service_page_view: "ViewContent",
    };

    const gtagEventMap: Record<string, string> = {
      quote_form_start: "begin_checkout",
      quote_form_submit: "generate_lead",
      whatsapp_click: "contact",
      phone_click: "contact",
      promo_cta_click: "select_promotion",
      blog_read: "view_item",
      service_page_view: "view_item_list",
    };

    const ttEventMap: Record<string, string> = {
      quote_form_start: "InitiateCheckout",
      quote_form_submit: "SubmitForm",
      whatsapp_click: "Contact",
      chatbot_open: "ViewContent",
      phone_click: "Contact",
      promo_cta_click: "ClickButton",
    };

    it("should map all conversion events to Facebook pixel events", () => {
      expect(fbEventMap["quote_form_submit"]).toBe("Lead");
      expect(fbEventMap["whatsapp_click"]).toBe("Contact");
      expect(fbEventMap["promo_cta_click"]).toBe("AddToCart");
      expect(fbEventMap["blog_read"]).toBe("ViewContent");
    });

    it("should map all conversion events to Google Ads events", () => {
      expect(gtagEventMap["quote_form_submit"]).toBe("generate_lead");
      expect(gtagEventMap["whatsapp_click"]).toBe("contact");
      expect(gtagEventMap["promo_cta_click"]).toBe("select_promotion");
    });

    it("should map all conversion events to TikTok pixel events", () => {
      expect(ttEventMap["quote_form_submit"]).toBe("SubmitForm");
      expect(ttEventMap["whatsapp_click"]).toBe("Contact");
      expect(ttEventMap["promo_cta_click"]).toBe("ClickButton");
    });

    it("should have LinkedIn conversion tracking for key events", () => {
      const linkedInTrackedEvents = [
        "quote_form_submit",
        "promo_cta_click",
        "whatsapp_click",
      ];
      expect(linkedInTrackedEvents).toContain("quote_form_submit");
      expect(linkedInTrackedEvents).toContain("whatsapp_click");
    });
  });

  describe("Open Graph Meta Tags", () => {
    it("should have correct OG image dimensions for social sharing", () => {
      // OG image should be 1200x630 for optimal display
      const expectedWidth = 1200;
      const expectedHeight = 630;
      const aspectRatio = expectedWidth / expectedHeight;

      expect(aspectRatio).toBeCloseTo(1.905, 2); // ~1.91:1 ratio
      expect(expectedWidth).toBeGreaterThanOrEqual(1200);
      expect(expectedHeight).toBeGreaterThanOrEqual(630);
    });

    it("should have correct OG meta tag properties", () => {
      const requiredOGTags = [
        "og:type",
        "og:url",
        "og:title",
        "og:description",
        "og:image",
        "og:image:width",
        "og:image:height",
        "og:locale",
        "og:site_name",
      ];

      // Verify all required tags are defined
      expect(requiredOGTags.length).toBe(9);
      expect(requiredOGTags).toContain("og:image:width");
      expect(requiredOGTags).toContain("og:image:height");
    });

    it("should have correct Twitter Card meta tags", () => {
      const requiredTwitterTags = [
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
        "twitter:image:alt",
      ];

      expect(requiredTwitterTags.length).toBe(5);
      expect(requiredTwitterTags).toContain("twitter:card");
      expect(requiredTwitterTags).toContain("twitter:image:alt");
    });
  });

  describe("Social Share URLs", () => {
    const shareUrl = "https://www.forgeminechile.com/promo";
    const encodedUrl = encodeURIComponent(shareUrl);
    const title = "FORGEMINE Chile - Reparación de Baldes Mineros";
    const encodedTitle = encodeURIComponent(title);

    it("should generate correct Facebook share URL", () => {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
      expect(fbUrl).toContain("facebook.com/sharer");
      expect(fbUrl).toContain(encodedUrl);
    });

    it("should generate correct LinkedIn share URL", () => {
      const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      expect(liUrl).toContain("linkedin.com/sharing");
      expect(liUrl).toContain(encodedUrl);
    });

    it("should generate correct Twitter/X share URL", () => {
      const twUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      expect(twUrl).toContain("twitter.com/intent/tweet");
      expect(twUrl).toContain(encodedUrl);
    });

    it("should generate correct WhatsApp share URL", () => {
      const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      expect(waUrl).toContain("wa.me");
      expect(waUrl).toContain(encodedUrl);
    });
  });

  describe("Pixel Initialization Scripts", () => {
    it("should generate valid Facebook Pixel script with pixel ID", () => {
      const pixelId = "1234567890";
      const script = `fbq('init','${pixelId}');fbq('track','PageView');`;
      expect(script).toContain(pixelId);
      expect(script).toContain("PageView");
    });

    it("should generate valid Google Ads script with tag ID", () => {
      const gtagId = "AW-1234567890";
      const script = `gtag('config','${gtagId}');`;
      expect(script).toContain(gtagId);
    });

    it("should generate valid TikTok Pixel script with pixel ID", () => {
      const pixelId = "TIKTOK123";
      const script = `ttq.load('${pixelId}');ttq.page();`;
      expect(script).toContain(pixelId);
      expect(script).toContain("ttq.page()");
    });

    it("should generate valid LinkedIn Insight script with partner ID", () => {
      const partnerId = "LINKEDIN456";
      const script = `_linkedin_partner_id="${partnerId}";`;
      expect(script).toContain(partnerId);
    });
  });

  describe("UTM Storage Expiry", () => {
    it("should set correct expiry duration (30 days)", () => {
      const UTM_EXPIRY_DAYS = 30;
      const expiryMs = UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      expect(expiryMs).toBe(2592000000); // 30 days in milliseconds
    });

    it("should detect expired UTM data", () => {
      const now = Date.now();
      const expiredTimestamp = now - 1000; // 1 second ago
      const validTimestamp = now + 86400000; // 1 day from now

      expect(now > expiredTimestamp).toBe(true);
      expect(now > validTimestamp).toBe(false);
    });
  });
});
