/**
 * Header Component
 * Design: Industrial Forge Aesthetic - Dark with amber accents
 */

import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Contacto", href: "#contacto" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const config = useSiteConfig();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
      setIsMobileMenuOpen(false);
      return;
    }
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[oklch(0.1_0.01_250)] border-b border-border py-2 hidden md:block">
        <div className="container flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href={`tel:${config.company.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span>{config.company.phoneFormatted}</span>
            </a>
            <a href={`mailto:${config.company.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <span>{config.company.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{config.company.address}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#inicio");
              }}
              aria-label={`${config.company.name} - Ir al inicio`}
              className="flex items-center gap-3 group"
            >
              {config.company.logoUrl ? (
                <img
                  src={config.company.logoUrl}
                  alt={`Logo ${config.company.name}`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center group-hover:shadow-[0_0_20px_oklch(0.75_0.18_70/0.5)] transition-all">
                  <span className="font-display text-xl font-bold text-primary-foreground">
                    {config.company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-wider text-foreground">
                  {config.company.name}
                </span>
                <span className="text-[10px] text-primary tracking-[0.3em] uppercase">
                  {config.company.tagline}
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Button
                onClick={() => scrollToSection("#contacto")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider shadow-[0_0_20px_oklch(0.75_0.18_70/0.3)] hover:shadow-[0_0_30px_oklch(0.75_0.18_70/0.5)]"
              >
                Cotizar Ahora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t border-border"
            >
              <div className="container py-4 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors font-display"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => scrollToSection("#contacto")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
                >
                  Cotizar Ahora
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
