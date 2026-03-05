/**
 * Promo Landing Page - FORGEMINE CHILE SpA
 * Optimized for social media ads (Facebook, Instagram, TikTok, LinkedIn, Google Ads)
 * Mobile-first design with strong CTAs and conversion tracking
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Shield,
  Wrench,
  Clock,
  Award,
  MessageCircle,
  Flame,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import { trackConversion, getStoredUTMParams } from "@/lib/tracking";

const benefits = [
  {
    icon: Shield,
    title: "Soldadura Certificada AWS D1.1",
    desc: "Procesos calificados según normas internacionales",
  },
  {
    icon: Clock,
    title: "Respuesta en 24-48 hrs",
    desc: "Cotización sin compromiso en tiempo récord",
  },
  {
    icon: Award,
    title: "15+ Años de Experiencia",
    desc: "Especialistas en minería de gran escala",
  },
  {
    icon: Wrench,
    title: "Todas las Marcas",
    desc: "Komatsu, CAT, Liebherr, Hitachi y más",
  },
];

const testimonials = [
  {
    text: "FORGEMINE nos entregó el balde en tiempo récord y con una calidad impecable. La soldadura pasó todos los ensayos no destructivos.",
    author: "Jefe de Mantención",
    company: "Minera del Norte",
    rating: 5,
  },
  {
    text: "El blindaje Heavy Duty que instalaron ha duplicado la vida útil de nuestros baldes. Excelente relación costo-beneficio.",
    author: "Superintendente de Equipos",
    company: "Operaciones Mineras S.A.",
    rating: 5,
  },
];

const services = [
  "Reparación de Fisuras",
  "Blindaje Heavy Duty",
  "Reconstrucción Total (Overhaul)",
  "Servicio en Terreno",
  "Inspección y Diagnóstico",
];

export default function Promo() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track promo page view
  useEffect(() => {
    const utm = getStoredUTMParams();
    trackConversion({
      event_name: "service_page_view",
      event_category: "promo_landing",
      event_label: utm.utm_campaign || "direct",
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    });
  }, []);

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      console.log("Promo lead saved");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Por favor ingresa tu nombre y teléfono");
      return;
    }

    setIsSubmitting(true);

    // Track conversion
    trackConversion({
      event_name: "quote_form_submit",
      event_category: "promo_landing",
      event_label: formData.service || "general",
      event_value: 1,
    });

    try {
      // Save to database
      await createQuoteMutation.mutateAsync({
        contactName: formData.name,
        company: formData.company || "No especificada",
        email: formData.email || "no-email@promo.forgeminechile.com",
        phone: formData.phone,
        brand: "Por definir",
        equipmentType: "Por definir",
        model: "Por definir",
        selectedServices: [formData.service || "Consulta general"],
        problemDescription: formData.message || `Lead desde landing de promoción. Servicio: ${formData.service || "General"}`,
        urgency: "normal",
        location: "Chile",
      });

      // Open WhatsApp
      const whatsappMsg = encodeURIComponent(
        `Hola FORGEMINE! Soy ${formData.name}${formData.company ? ` de ${formData.company}` : ""}. Me interesa el servicio de ${formData.service || "reparación de baldes"}. ${formData.message || "¿Pueden enviarme una cotización?"}`
      );

      trackConversion({
        event_name: "whatsapp_click",
        event_category: "promo_landing",
        event_label: "promo_form_whatsapp",
        event_value: 1,
      });

      window.open(`https://wa.me/56992779872?text=${whatsappMsg}`, "_blank");
      setIsSubmitted(true);
      toast.success("¡Solicitud enviada! Te contactaremos pronto.");
    } catch {
      // Even on error, redirect to WhatsApp
      const whatsappMsg = encodeURIComponent(
        `Hola FORGEMINE! Soy ${formData.name}. Me interesa el servicio de ${formData.service || "reparación de baldes"}.`
      );
      window.open(`https://wa.me/56992779872?text=${whatsappMsg}`, "_blank");
      setIsSubmitted(true);
      toast.success("Redirigiendo a WhatsApp...");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = () => {
    trackConversion({
      event_name: "phone_click",
      event_category: "promo_landing",
      event_label: "hero_phone",
    });
  };

  const handleWhatsAppCTA = () => {
    trackConversion({
      event_name: "whatsapp_click",
      event_category: "promo_landing",
      event_label: "hero_whatsapp",
    });
    window.open(
      "https://wa.me/56992779872?text=Hola%20FORGEMINE!%20Vi%20su%20anuncio%20y%20me%20interesa%20una%20cotizaci%C3%B3n%20para%20reparaci%C3%B3n%20de%20baldes.",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.02_250)]">
      <SEOHead
        title="Cotiza Reparación de Baldes Mineros"
        description="Cotiza ahora la reparación de tu balde minero. Soldadura AWS D1.1, blindaje Heavy Duty. Respuesta en 24 hrs. Servicio en todo Chile."
        url="/promo"
      />

      {/* Top Bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-2">
        <div className="container flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="w-4 h-4" />
            <span className="font-medium">Promoción Especial - Cotización Gratis</span>
          </div>
          <a
            href="tel:+56992779872"
            onClick={handlePhoneClick}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+56 9 9277 9872</span>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.12_0.02_250)] via-[oklch(0.14_0.03_40)] to-[oklch(0.12_0.02_250)]" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-[120px]" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Certificados AWS D1.1
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-foreground">REPARA TU</span>
                <br />
                <span className="text-primary">BALDE MINERO</span>
                <br />
                <span className="text-foreground text-3xl md:text-4xl">
                  AHORRA HASTA UN 70%
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Reparar es siempre mejor que comprar nuevo. Soldadura certificada,
                blindaje Heavy Duty y servicio en todo Chile.{" "}
                <strong className="text-foreground">Cotización sin compromiso.</strong>
              </p>

              {/* Quick CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  onClick={handleWhatsAppCTA}
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-display tracking-wider gap-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Ahora
                </Button>
                <a href="tel:+56992779872" onClick={handlePhoneClick}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border font-display tracking-wider gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Llamar Ahora
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                {["AWS D1.1", "ISO 9001", "ISO 3834-2"].map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {cert}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Lead Capture Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      ¡Solicitud Recibida!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Te contactaremos en menos de 24 horas con tu cotización.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: "",
                          company: "",
                          phone: "",
                          email: "",
                          service: "",
                          message: "",
                        });
                      }}
                      variant="outline"
                    >
                      Enviar otra solicitud
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                        Cotiza GRATIS Ahora
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Respuesta garantizada en menos de 24 horas
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="Nombre *"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="bg-secondary/50 border-border"
                            required
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Empresa"
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="Teléfono *"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="bg-secondary/50 border-border"
                            required
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                      </div>

                      <Select
                        value={formData.service}
                        onValueChange={(value) =>
                          setFormData({ ...formData, service: value })
                        }
                      >
                        <SelectTrigger className="bg-secondary/50 border-border">
                          <SelectValue placeholder="¿Qué servicio necesitas?" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Describe brevemente tu necesidad (opcional)"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="bg-secondary/50 border-border min-h-[80px]"
                        rows={3}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider text-lg py-6 shadow-[0_0_30px_oklch(0.75_0.18_70/0.3)]"
                      >
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            Solicitar Cotización Gratis
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Sin compromiso. Respuesta en menos de 24 hrs.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-[oklch(0.1_0.01_250)]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-1 uppercase tracking-wide">
                  {benefit.title}
                </h3>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Repair Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿POR QUÉ REPARAR?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Reparar un balde minero cuesta entre un 30% y 50% del valor de uno
              nuevo, con la misma garantía de rendimiento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Ahorro de 50-70%",
                desc: "vs. comprar un balde nuevo. Misma calidad, menor inversión.",
                highlight: "50-70%",
              },
              {
                title: "Entrega en 30-45 días",
                desc: "Un balde nuevo puede tardar 6-12 meses. Nosotros lo reparamos en semanas.",
                highlight: "30-45 días",
              },
              {
                title: "Garantía Total",
                desc: "Soldadura certificada AWS D1.1 con ensayos no destructivos incluidos.",
                highlight: "AWS D1.1",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6 bg-card/50 border border-border rounded-lg"
              >
                <div className="font-display text-3xl font-bold text-primary mb-2">
                  {item.highlight}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-[oklch(0.1_0.01_250)]">
        <div className="container">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 bg-card/50 border border-border rounded-lg"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-primary fill-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm italic mb-4">
                  "{t.text}"
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿LISTO PARA COTIZAR?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Contáctanos ahora y recibe tu cotización sin compromiso en menos de
            24 horas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              onClick={handleWhatsAppCTA}
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-display tracking-wider gap-2 shadow-lg text-lg px-8"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Button>
            <a href="tel:+56992779872" onClick={handlePhoneClick}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider gap-2 text-lg px-8"
              >
                <Phone className="w-5 h-5" />
                +56 9 9277 9872
              </Button>
            </a>
          </div>

          <SocialShare
            title="FORGEMINE Chile - Reparación de Baldes Mineros"
            description="Ahorra hasta 70% reparando tu balde minero. Soldadura certificada AWS D1.1. Cotiza gratis."
            variant="horizontal"
            className="justify-center"
          />
        </div>
      </section>

      {/* Footer Mini */}
      <footer className="py-6 border-t border-border bg-[oklch(0.08_0.01_250)]">
        <div className="container text-center text-xs text-muted-foreground">
          <p className="mb-2">
            © {new Date().getFullYear()} FORGEMINE CHILE SpA. Todos los derechos
            reservados.
          </p>
          <p>
            <a href="/" className="hover:text-primary transition-colors">
              Ir al sitio principal
            </a>
            {" · "}
            <a href="/blog" className="hover:text-primary transition-colors">
              Blog Técnico
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
