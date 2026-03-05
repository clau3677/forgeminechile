/**
 * CONFIGURACION DEL SITIO
 * ========================
 * Edita este archivo para personalizar el sitio con los datos de tu empresa.
 * Estos son los valores por defecto. Si configuras el panel admin, esos valores
 * toman prioridad sobre los de aqui.
 */
export const siteConfig = {
  company: {
    name: "FORGEMINE CHILE",
    legalName: "FORGEMINE CHILE SpA",
    tagline: "Forjando el Futuro",
    phone: "+56992779872",
    phoneFormatted: "+56 9 9277 9872",
    email: "contacto@forgeminechile.com",
    address: "Santiago de Chile",
    website: "https://www.forgeminechile.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/forgemine-chile",
    facebook: "https://www.facebook.com/forgeminechile",
    instagram: "https://www.instagram.com/forgeminechile",
    whatsapp: "56992779872",
  },
  seo: {
    title: "Reparación de Baldes Mineros Chile | FORGEMINE",
    description:
      "Especialistas en reparación, blindaje y reconstrucción de baldes mineros. Soldadura AWS D1.1, certificación ISO 9001. Respuesta en 4-8h. Cobertura nacional.",
    ogImage: "https://www.forgeminechile.com/og-image.jpg",
    twitterHandle: "@forgeminechile",
  },
};

export type SiteConfig = typeof siteConfig;
