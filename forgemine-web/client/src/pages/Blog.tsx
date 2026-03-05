/**
 * Blog Page - FORGEMINE CHILE SpA
 * Technical blog about mining bucket repair, welding, and shielding
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Clock, Tag, ArrowRight, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  soldadura: "Soldadura",
  blindaje: "Blindaje",
  reparacion: "Reparación",
  equipos: "Equipos",
  seguridad: "Seguridad",
  normativas: "Normativas",
};

const categoryColors: Record<string, string> = {
  soldadura: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  blindaje: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reparacion: "bg-green-500/20 text-green-400 border-green-500/30",
  equipos: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  seguridad: "bg-red-500/20 text-red-400 border-red-500/30",
  normativas: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const { data: articles, isLoading } = trpc.blog.published.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Set page title and meta description
  useEffect(() => {
    document.title = "Blog Técnico | Soldadura y Reparación de Baldes Mineros - FORGEMINE";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Artículos técnicos sobre reparación de baldes mineros, soldadura AWS D1.1, blindaje heavy duty y normativas de seguridad en minería. Blog de FORGEMINE Chile.");
    }
  }, []);

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch =
      !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = articles
    ? Array.from(new Set(articles.map((a) => a.category)))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 backdrop-blur-sm rounded-full border border-border mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Blog Técnico</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">CONOCIMIENTO</span>{" "}
              <span className="text-primary">TÉCNICO</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Artículos especializados sobre soldadura, reparación de baldes mineros,
              blindaje heavy duty y normativas de seguridad en minería.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-primary text-primary-foreground" : ""}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-primary text-primary-foreground" : ""}
              >
                {categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-20">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          ) : filteredArticles && filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group"
                >
                  <article className="bg-card border border-border rounded-lg overflow-hidden h-full hover:border-primary/50 transition-colors">
                    {/* Cover Image */}
                    {article.coverImage && (
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
                      </div>
                    )}

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[article.category] || "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {categoryLabels[article.category] || article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readTimeMinutes} min lectura
                        </span>
                      </div>

                      {/* Read More */}
                      <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                        Leer artículo
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {searchTerm || selectedCategory
                  ? "No se encontraron artículos"
                  : "Próximamente"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || selectedCategory
                  ? "Intenta con otros términos de búsqueda o categoría."
                  : "Estamos preparando contenido técnico de alta calidad. ¡Vuelve pronto!"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/20 border-t border-border">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            ¿Necesitas asesoría técnica?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nuestro equipo de ingenieros especialistas en soldadura y reparación de baldes mineros
            está disponible para resolver tus consultas técnicas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/#contacto">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider">
                Solicitar Cotización
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <a
              href="https://wa.me/56992779872?text=Hola%2C%20necesito%20asesoría%20técnica"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="font-display tracking-wider">
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
