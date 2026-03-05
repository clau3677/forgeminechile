/**
 * SEOHead Component - Dynamic Meta Tags for Social Media Sharing
 * Updates document head with Open Graph, Twitter Card, and other meta tags
 * Optimized for Facebook, Instagram, LinkedIn, TikTok, and Google Ads
 */

import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
}

const OG_IMAGE_DEFAULT = "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/hzGeXrvpMdGQXKtT.jpg";
const SITE_NAME = "FORGEMINE CHILE";
const SITE_URL = "https://www.forgeminechile.com";

function setMetaTag(property: string, content: string, isName = false): void {
  const attr = isName ? "name" : "property";
  let element = document.querySelector(`meta[${attr}="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, property);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMetaTag(property: string, isName = false): void {
  const attr = isName ? "name" : "property";
  const element = document.querySelector(`meta[${attr}="${property}"]`);
  if (element) element.remove();
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  article,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | FORGEMINE Chile`
      : "Reparación de Baldes Mineros Chile | FORGEMINE";
    const fullDescription =
      description ||
      "Reparación y blindaje de baldes mineros en Chile. Soldadura AWS D1.1 para Komatsu, CAT, Liebherr. Servicio en Santiago, Antofagasta y Calama. Cotiza ahora.";
    const fullImage = image || OG_IMAGE_DEFAULT;
    const fullUrl = url ? `${SITE_URL}${url}` : window.location.href;

    // Page title
    document.title = fullTitle;

    // Basic meta
    setMetaTag("description", fullDescription, true);

    // Robots
    if (noindex) {
      setMetaTag("robots", "noindex, nofollow", true);
    } else {
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", true);
    }

    // ==========================================
    // Open Graph (Facebook, Instagram, LinkedIn)
    // ==========================================
    setMetaTag("og:type", type);
    setMetaTag("og:url", fullUrl);
    setMetaTag("og:title", fullTitle);
    setMetaTag("og:description", fullDescription);
    setMetaTag("og:image", fullImage);
    setMetaTag("og:image:width", "1200");
    setMetaTag("og:image:height", "630");
    setMetaTag("og:image:type", "image/jpeg");
    setMetaTag("og:image:alt", title || "FORGEMINE Chile - Reparación de Baldes Mineros");
    setMetaTag("og:locale", "es_CL");
    setMetaTag("og:site_name", SITE_NAME);

    // ==========================================
    // Twitter Card (also used by other platforms)
    // ==========================================
    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", fullTitle, true);
    setMetaTag("twitter:description", fullDescription, true);
    setMetaTag("twitter:image", fullImage, true);
    setMetaTag("twitter:image:alt", title || "FORGEMINE Chile - Reparación de Baldes Mineros", true);

    // ==========================================
    // Article-specific tags (for blog posts)
    // ==========================================
    if (type === "article" && article) {
      if (article.author) setMetaTag("article:author", article.author);
      if (article.publishedTime) setMetaTag("article:published_time", article.publishedTime);
      if (article.modifiedTime) setMetaTag("article:modified_time", article.modifiedTime);
      if (article.section) setMetaTag("article:section", article.section);
      if (article.tags) {
        article.tags.forEach((tag) => {
          setMetaTag("article:tag", tag);
        });
      }
    } else {
      // Clean up article tags if not article type
      removeMetaTag("article:author");
      removeMetaTag("article:published_time");
      removeMetaTag("article:modified_time");
      removeMetaTag("article:section");
      removeMetaTag("article:tag");
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = "Reparación de Baldes Mineros Chile | FORGEMINE";
      setMetaTag("description", "Reparación y blindaje de baldes mineros en Chile. Soldadura AWS D1.1 para Komatsu, CAT, Liebherr. Servicio en Santiago, Antofagasta y Calama. Cotiza ahora.", true);
      setMetaTag("og:title", "Reparación de Baldes Mineros Chile | FORGEMINE");
      setMetaTag("og:description", "Reparación y blindaje de baldes mineros en Chile. Soldadura AWS D1.1 para Komatsu, CAT, Liebherr. Servicio en Santiago, Antofagasta y Calama.");
      setMetaTag("og:image", OG_IMAGE_DEFAULT);
      setMetaTag("og:url", SITE_URL);
      setMetaTag("og:type", "website");
      removeMetaTag("article:author");
      removeMetaTag("article:published_time");
      removeMetaTag("article:modified_time");
      removeMetaTag("article:section");
      removeMetaTag("article:tag");
    };
  }, [title, description, image, url, type, article, noindex]);

  return null;
}
