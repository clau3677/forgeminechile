import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { siteConfig } from "@/site.config";

/**
 * Returns the merged site configuration.
 * Values from the database (admin panel) override the defaults in site.config.ts.
 * Falls back to site.config.ts values when DB is unavailable or a key is not set.
 */
export function useSiteConfig() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return useMemo(() => {
    const get = (key: string, fallback: string): string =>
      (settings && settings[key]) ? settings[key] : fallback;

    return {
      company: {
        name: get("company_name", siteConfig.company.name),
        legalName: get("company_legal_name", siteConfig.company.legalName),
        tagline: get("tagline", siteConfig.company.tagline),
        phone: get("phone", siteConfig.company.phone),
        phoneFormatted: get("phone_formatted", siteConfig.company.phoneFormatted),
        email: get("email", siteConfig.company.email),
        address: get("address", siteConfig.company.address),
        website: get("website", siteConfig.company.website),
        logoUrl: get("logo_url", ""),
      },
      social: {
        linkedin: get("social_linkedin", siteConfig.social.linkedin),
        facebook: get("social_facebook", siteConfig.social.facebook),
        instagram: get("social_instagram", siteConfig.social.instagram),
        whatsapp: get("social_whatsapp", siteConfig.social.whatsapp),
      },
      seo: {
        title: get("seo_title", siteConfig.seo.title),
        description: get("seo_description", siteConfig.seo.description),
        ogImage: get("seo_og_image", siteConfig.seo.ogImage),
      },
    };
  }, [settings]);
}
