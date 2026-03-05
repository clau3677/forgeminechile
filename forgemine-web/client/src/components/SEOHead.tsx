/**
 * SEOHead Component - Dynamic Meta Tags for Social Media Sharing
 * Updates document head with Open Graph, Twitter Card, and other meta tags
 * Optimized for Facebook, Instagram, LinkedIn, TikTok, and Google Ads
 */

import { useEffect } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

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
  const config = useSiteConfig();

  useEffect(() => {
    const siteName = config.company.name;
    const fullTitle = title
      ? `${title} | ${siteName}`
      : config.seo.title;
    const fullDescription = description || config.seo.description;
    const fullImage = image || config.seo.ogImage;
    const fullUrl = url ? `${SITE_URL}${url}` : window.location.href;

    document.title = fullTitle;

    setMetaTag("description", fullDescription, true);

    if (noindex) {
      setMetaTag("robots", "noindex, nofollow", true);
    } else {
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", true);
    }

    setMetaTag("og:type", type);
    setMetaTag("og:url", fullUrl);
    setMetaTag("og:title", fullTitle);
    setMetaTag("og:description", fullDescription);
    setMetaTag("og:image", fullImage);
    setMetaTag("og:image:width", "1200");
    setMetaTag("og:image:height", "630");
    setMetaTag("og:image:type", "image/jpeg");
    setMetaTag("og:image:alt", title || `${siteName} - Reparación de Baldes Mineros`);
    setMetaTag("og:locale", "es_CL");
    setMetaTag("og:site_name", siteName);

    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", fullTitle, true);
    setMetaTag("twitter:description", fullDescription, true);
    setMetaTag("twitter:image", fullImage, true);
    setMetaTag("twitter:image:alt", title || `${siteName} - Reparación de Baldes Mineros`, true);

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
      removeMetaTag("article:author");
      removeMetaTag("article:published_time");
      removeMetaTag("article:modified_time");
      removeMetaTag("article:section");
      removeMetaTag("article:tag");
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    return () => {
      document.title = config.seo.title;
      setMetaTag("description", config.seo.description, true);
      setMetaTag("og:title", config.seo.title);
      setMetaTag("og:description", config.seo.description);
      setMetaTag("og:image", config.seo.ogImage);
      setMetaTag("og:url", SITE_URL);
      setMetaTag("og:type", "website");
      removeMetaTag("article:author");
      removeMetaTag("article:published_time");
      removeMetaTag("article:modified_time");
      removeMetaTag("article:section");
      removeMetaTag("article:tag");
    };
  }, [title, description, image, url, type, article, noindex, config]);

  return null;
}
