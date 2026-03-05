/**
 * Home Page - FORGEMINE CHILE SpA
 * Design: Industrial Forge Aesthetic - Dark with amber/orange accents
 * Specialized in mining bucket repair and reconstruction
 */

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, useInView } from "framer-motion";
import { 
  Wrench, Shield, RefreshCw, Truck, Award, CheckCircle2, 
  Phone, Mail, MapPin, ArrowRight, Clock, Users, ThumbsUp,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { BookOpen } from "lucide-react";
import { trackConversion } from "@/lib/tracking";

// Lazy load heavy components for better initial load
const FloatingChatbot = lazy(() => import("@/components/FloatingChatbot"));

// Animated counter component
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Services data - Optimizado para SEO "reparación de baldes mineros en chile"
const services = [
  {
    icon: Wrench,
    title: "Reparación de Baldes Mineros",
    description: "Reparación de baldes mineros en Chile con soldadura certificada AWS D1.1. Especialistas en fisuras y grietas estructurales de palas hidráulicas.",
    features: ["Soldadura certificada AWS", "Precalentamiento controlado", "Inspección por ultrasonido"],
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/MlZEhdcitBwlNArr.jpg"
  },
  {
    icon: Shield,
    title: "Blindaje de Baldes Mineros",
    description: "Blindaje heavy duty para baldes mineros con planchas 450 Brinell, Wear Buttons Laminite y Heel Shrouds. Servicio en todo Chile.",
    features: ["Flejes de piso y laterales", "Wear Buttons Laminite", "Protección de esquinas"],
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/JLXoGSBhQrEiSJkF.jpg"
  },
  {
    icon: RefreshCw,
    title: "Reconstrucción de Baldes",
    description: "Reconstrucción total de baldes mineros en Chile. Overhaul completo con actualización a configuración Heavy Duty para mayor durabilidad.",
    features: ["Evaluación estructural", "Reemplazo de labios", "Actualización GET"],
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/bHmFArCoCqdQeIek.jpg"
  },
  {
    icon: Truck,
    title: "Reparación en Faena Minera",
    description: "Servicio de reparación de baldes mineros en terreno. Atención de emergencias 24/7 en faenas mineras de todo Chile.",
    features: ["Respuesta en 4-8 horas", "Equipos autónomos", "Personal certificado"],
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/yCPpDFMMzRGOSjxm.jpg"
  },
];

// Projects data
const projects = [
  {
    client: "Minera Escondida",
    title: "Blindaje PC7000 Heavy Duty",
    description: "Conversión de balde estándar a Heavy Duty con instalación completa de blindaje según PSG 25-003.",
    stats: "1,568 kg de blindaje | 45 días",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/MlZEhdcitBwlNArr.jpg"
  },
  {
    client: "Codelco Norte",
    title: "Reparación Estructural PC5500",
    description: "Reparación de fisuras críticas en estructura principal con soldadura certificada y control NDT.",
    stats: "Acero S690Q | 30 días",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/JLXoGSBhQrEiSJkF.jpg"
  },
  {
    client: "Antofagasta Minerals",
    title: "Overhaul Balde CAT 6060",
    description: "Reconstrucción total incluyendo reemplazo de labio, laterales y sistema GET completo.",
    stats: "Capacidad 52m³ | 60 días",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/89514103/kZvuIHoSxaomAVqK.jpg"
  },
];

// Brands data
const brands = [
  { name: "Komatsu", models: "PC5500, PC7000, PC8000" },
  { name: "Caterpillar", models: "6040, 6050, 6060" },
  { name: "Liebherr", models: "R9800, R9400" },
  { name: "Hitachi", models: "EX5600, EX8000" },
];

// Certifications
const certifications = ["AWS D1.1", "ISO 9001", "ISO 3834-2"];

// Ubicaciones de servicio en Chile
const ubicaciones = [
  { ciudad: "Santiago", descripcion: "Sede principal - Región Metropolitana", cobertura: "RM y zona central" },
  { ciudad: "Antofagasta", descripcion: "Servicio en La Negra y zona industrial", cobertura: "Región de Antofagasta" },
  { ciudad: "Calama", descripcion: "Cobertura Chuquicamata, El Abra, Spence", cobertura: "Zona minera norte" },
  { ciudad: "Copiapó", descripcion: "Servicio en Región de Atacama", cobertura: "Candelaria, Caserones" },
];

// Términos técnicos para SEO
const terminosTecnicos = [
  "Disponibilidad operacional",
  "Continuidad operacional",
  "Ensayos no destructivos (END)",
  "Ingeniería inversa",
  "Granallado industrial",
  "Aceros de alta calidad",
  "Soldadores calificados",
  "Overhaul de baldes",
];

// Blog Highlight Section for Home page
function BlogHighlightSection() {
  const { data: allArticles, isLoading } = trpc.blog.published.useQuery();
  const articles = allArticles?.slice(0, 3);

  if (isLoading || !articles || articles.length === 0) return null;

  const categoryLabels: Record<string, string> = {
    soldadura: "Soldadura",
    blindaje: "Blindaje",
    reparacion: "Reparación",
    normativas: "Normativas",
    seguridad: "Seguridad",
  };

  const categoryColors: Record<string, string> = {
    soldadura: "bg-orange-500/20 text-orange-400",
    blindaje: "bg-blue-500/20 text-blue-400",
    reparacion: "bg-green-500/20 text-green-400",
    normativas: "bg-purple-500/20 text-purple-400",
    seguridad: "bg-red-500/20 text-red-400",
  };

  return (
    <section className="py-20 md:py-28 bg-secondary/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Conocimiento Técnico</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            BLOG TÉCNICO
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Artículos especializados en <strong>reparación de baldes mineros</strong>, soldadura de aceros de alta resistencia, blindaje y normativas AWS.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article: any, index: number) => (
            <motion.a
              key={article.id}
              href={`/blog/${article.slug}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="bg-card border-border overflow-hidden group-hover:border-primary/50 transition-colors h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={400}
                    height={192}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${categoryColors[article.category] || 'bg-primary/20 text-primary'}`}>
                      {categoryLabels[article.category] || article.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    <span>{article.readTimeMinutes} min de lectura</span>
                  </div>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => window.location.href = '/blog'}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 font-display tracking-wider"
          >
            Ver Todos los Artículos
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensaje enviado correctamente. Nos pondremos en contacto pronto.");
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Header />

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/89514103/JLXoGSBhQrEiSJkF.jpg"
            alt="Soldadura industrial de baldes mineros en Chile - FORGEMINE especialistas en reparación con certificación AWS D1.1"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        </div>

        {/* Content */}
        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-full border border-border mb-6">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Especialistas en Minería</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">REPARACIÓN DE</span>
              <br />
              <span className="text-primary">BALDES MINEROS</span>
              <br />
              <span className="text-foreground">EN CHILE</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Especialistas en <strong>reparación de baldes mineros en Chile</strong>. Blindaje, reconstrucción y soldadura certificada AWS D1.1 para palas hidráulicas Komatsu, CAT, Liebherr y Hitachi.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => scrollToSection("#contacto")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider shadow-[0_0_30px_oklch(0.75_0.18_70/0.4)] hover:shadow-[0_0_40px_oklch(0.75_0.18_70/0.6)]"
              >
                Solicitar Cotización
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => scrollToSection("#servicios")}
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary font-display tracking-wider"
              >
                Ver Servicios
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating sparks animation */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-ping opacity-40" />
        <div className="absolute bottom-1/4 right-1/5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse opacity-50" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary/30 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 73, suffix: "+", label: "Baldes Reparados" },
              { value: 15, suffix: "+", label: "Años de Experiencia" },
              { value: 98, suffix: "%", label: "Clientes Satisfechos" },
              { value: 24, suffix: "/7", label: "Soporte Disponible" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Servicios de Reparación</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              REPARACIÓN DE BALDES MINEROS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Servicios especializados de <strong>reparación de baldes mineros en Chile</strong>. Blindaje heavy duty, reconstrucción total y soldadura certificada AWS D1.1 para equipos de minería.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-colors h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={`${service.title} en Chile - FORGEMINE servicio especializado`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold mb-3 text-foreground uppercase tracking-wide">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 md:py-28 bg-secondary/20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Sobre Nosotros</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
                EXPERTOS EN SOLDADURA MINERA
              </h2>
              <p className="text-muted-foreground mb-6">
                FORGEMINE CHILE SpA nace de la necesidad de contar con servicios especializados de alta calidad 
                para la <strong>reparación integral de baldes mineros en Chile</strong>. Nuestro equipo de <strong>soldadores calificados</strong> y 
                certificados AWS D1.1 cuenta con amplia experiencia en aceros de alta resistencia como S690Q y HB400.
              </p>
              <p className="text-muted-foreground mb-6">
                Garantizamos la <strong>disponibilidad operacional</strong> y <strong>continuidad operacional</strong> de su flota mediante 
                procesos estandarizados que incluyen <strong>ensayos no destructivos (END)</strong>, <strong>ingeniería inversa</strong> para 
                componentes descontinuados y <strong>granallado industrial</strong> con acabado profesional.
              </p>
              <p className="text-muted-foreground mb-8">
                Ofrecemos servicios de <strong>overhaul de baldes</strong>, mantención y recuperación de componentes mineros 
                cumpliendo con las especificaciones técnicas de los principales fabricantes OEM.
              </p>

              {/* Brands */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {brands.map((brand, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-4">
                    <h4 className="font-display font-bold text-foreground">{brand.name}</h4>
                    <p className="text-xs text-muted-foreground">{brand.models}</p>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full"
                  >
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/89514103/bHmFArCoCqdQeIek.jpg"
                  alt="Equipo de soldadores calificados FORGEMINE Chile - Taller de reparación de baldes mineros"
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              {/* Experience badge */}
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-xl">
                <div className="font-display text-4xl font-bold">15+</div>
                <div className="text-sm">Años de Experiencia</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="proyectos" className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Portafolio</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              PROYECTOS DESTACADOS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conoce algunos de nuestros trabajos más recientes para las principales operaciones mineras de Chile.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-colors h-full">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.image}
                      alt={`${project.title} - Proyecto FORGEMINE reparación baldes mineros Chile`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        {project.client}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-bold mb-2 text-foreground uppercase">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                    <p className="text-xs text-primary font-medium">{project.stats}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicaciones Section - SEO */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Cobertura Nacional</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              REPARACIÓN DE BALDES MINEROS EN CHILE
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Servicio de <strong>reparación de baldes mineros</strong> en las principales zonas mineras de Chile. 
              Cobertura en Santiago, Antofagasta, Calama y Copiapó con atención de emergencias 24/7.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ubicaciones.map((ubicacion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 text-foreground">{ubicacion.ciudad}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{ubicacion.descripcion}</p>
                    <p className="text-xs text-primary">{ubicacion.cobertura}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Términos técnicos para SEO */}
          <div className="mt-12 p-6 bg-card border border-border rounded-lg">
            <h3 className="font-display text-lg font-bold mb-4 text-center">Nuestras Capacidades Técnicas</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {terminosTecnicos.map((termino, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-secondary text-muted-foreground text-sm rounded-full border border-border"
                >
                  {termino}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-y border-border">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿NECESITA REPARAR SU BALDE?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Contáctenos hoy para una evaluación gratuita. Nuestro equipo de expertos está listo 
            para ayudarle a extender la vida útil de sus equipos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => scrollToSection("#contacto")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider"
            >
              Contactar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-wider"
              asChild
            >
              <a href="mailto:contacto@forgeminechile.com">Enviar Correo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogHighlightSection />

      {/* Quote Form Section */}
      <section id="contacto" className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Cotización</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
                SOLICITE SU PRESUPUESTO
              </h2>
              <p className="text-muted-foreground mb-8">
                Complete el formulario con los detalles de su equipo y servicio requerido. 
                Nuestro equipo técnico le enviará una cotización detallada en menos de 24 horas.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground uppercase text-sm mb-1">Teléfono</h4>
                    <a href="tel:+56992779872" className="text-muted-foreground hover:text-primary transition-colors">
                      +56 9 9277 9872
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground uppercase text-sm mb-1">Email</h4>
                    <a href="mailto:contacto@forgeminechile.com" className="text-muted-foreground hover:text-primary transition-colors">
                      contacto@forgeminechile.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground uppercase text-sm mb-1">Ubicación</h4>
                    <p className="text-muted-foreground">
                      Santiago de Chile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground uppercase text-sm mb-1">Horario</h4>
                    <p className="text-muted-foreground">
                      Lunes a Viernes: 08:00 - 18:00<br />
                      Emergencias: 24/7
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Certificaciones:</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">AWS D1.1</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">ISO 9001</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">ISO 3834-2</span>
                </div>
              </div>
            </motion.div>

            {/* Quote Form - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <QuoteForm />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Chatbot IA - Lazy loaded */}
      <Suspense fallback={null}>
        <FloatingChatbot />
      </Suspense>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/56992779872"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
