/**
 * Footer Component
 * Design: Industrial Forge Aesthetic - Dark with amber accents
 */

import { Phone, Mail, MapPin, Linkedin, Facebook, Instagram } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const certifications = [
  { name: "AWS D1.1", desc: "Soldadura Estructural" },
  { name: "ISO 9001", desc: "Gestión de Calidad" },
  { name: "ISO 3834-2", desc: "Soldadura por Fusión" },
];

const services = [
  { name: "Reparación de Baldes", href: "/reparacion-baldes-palas-hidraulicas" },
  { name: "Blindaje Heavy Duty", href: "/blindaje-baldes-mineros" },
  { name: "Reconstrucción Total", href: "/#servicios" },
  { name: "Servicio en Terreno", href: "/#servicios" },
  { name: "Control de Calidad", href: "/#nosotros" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const config = useSiteConfig();

  return (
    <footer className="bg-[oklch(0.1_0.01_250)] border-t border-border" role="contentinfo" aria-label={`Pie de página ${config.company.name}`}>
      {/* Main footer content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {config.company.logoUrl ? (
                <img
                  src={config.company.logoUrl}
                  alt={`Logo ${config.company.name}`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                  <span className="font-display text-xl font-bold text-primary-foreground">
                    {config.company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-display text-lg font-bold tracking-wider">{config.company.name}</h3>
                <p className="text-xs text-muted-foreground">{config.company.legalName.replace(config.company.name, "").trim()}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {config.company.tagline}. Especialistas en reparación, reconstrucción y blindaje de baldes para equipos pesados de minería.
            </p>
            <div className="flex gap-3">
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${config.company.name} en LinkedIn`}
                className="w-9 h-9 bg-secondary rounded flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${config.company.name} en Facebook`}
                className="w-9 h-9 bg-secondary rounded flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${config.company.name} en Instagram`}
                className="w-9 h-9 bg-secondary rounded flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-primary">SERVICIOS</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <a href={service.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-primary">CERTIFICACIONES</h4>
            <ul className="space-y-3">
              {certifications.map((cert) => (
                <li key={cert.name} className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-primary">CONTACTO</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${config.company.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{config.company.phoneFormatted}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${config.company.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{config.company.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{config.company.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} {config.company.legalName}. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="/politica-de-privacidad" className="hover:text-foreground transition-colors">Política de Privacidad</a>
            <a href="/terminos-de-servicio" className="hover:text-foreground transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
