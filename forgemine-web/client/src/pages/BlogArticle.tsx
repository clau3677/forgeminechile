/**
 * Blog Article Detail Page - FORGEMINE CHILE SpA
 * Renders individual blog articles with SEO meta tags
 */

import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Clock, Tag, ArrowLeft, User, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import { trackConversion } from "@/lib/tracking";

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
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-8" />
      <Skeleton className="h-64 w-full rounded-lg mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = trpc.blog.bySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  // Track blog read conversion
  useEffect(() => {
    if (article) {
      trackConversion({
        event_name: 'blog_read',
        event_category: 'content',
        event_label: article.title,
      });
    }
  }, [article]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {article && (
        <SEOHead
          title={article.metaTitle || article.title}
          description={article.metaDescription || article.excerpt}
          image={article.coverImage || undefined}
          url={`/blog/${params.slug}`}
          type="article"
          article={{
            author: "FORGEMINE CHILE SpA",
            publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
            section: article.category || "Minería",
            tags: ["reparación baldes mineros", "soldadura AWS", article.category || "minería"],
          }}
        />
      )}
      <Header />

      <main className="py-12 md:py-20">
        <div className="container">
          {isLoading ? (
            <ArticleSkeleton />
          ) : error || !article ? (
            <div className="text-center py-20">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Artículo no encontrado
              </h2>
              <p className="text-muted-foreground mb-8">
                El artículo que buscas no existe o ha sido removido.
              </p>
              <Link href="/blog">
                <Button className="bg-primary text-primary-foreground">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Volver al Blog
                </Button>
              </Link>
            </div>
          ) : (
            <article className="max-w-4xl mx-auto">
              {/* Back Link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Blog
              </Link>

              {/* Article Header */}
              <header className="mb-8">
                {/* Category */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      categoryColors[article.category] || "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    {categoryLabels[article.category] || article.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* Excerpt */}
                <p className="text-lg text-muted-foreground mb-6">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {article.readTimeMinutes} min de lectura
                  </span>
                  <SocialShare
                    url={`/blog/${params.slug}`}
                    title={article.title}
                    description={article.metaDescription || article.excerpt}
                    variant="compact"
                    className="ml-auto"
                  />
                </div>
              </header>

              {/* Cover Image */}
              {article.coverImage && (
                <div className="mb-10 rounded-lg overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                    width={800}
                    height={400}
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-invert prose-lg max-w-none
                prose-headings:font-display prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                prose-table:text-muted-foreground
                prose-th:text-foreground prose-th:bg-secondary/50 prose-th:px-4 prose-th:py-2
                prose-td:px-4 prose-td:py-2 prose-td:border-border
                prose-code:text-primary prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-img:rounded-lg
              ">
                <Streamdown>{article.content}</Streamdown>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Etiquetas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-secondary/50 text-muted-foreground text-sm rounded-full border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share */}
              <div className="mt-10 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Comparte este artículo:
                  </h3>
                  <SocialShare
                    url={`/blog/${params.slug}`}
                    title={article.title}
                    description={article.metaDescription || article.excerpt}
                    variant="horizontal"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 bg-secondary/20 border border-border rounded-lg text-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  ¿Necesitas este servicio?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Nuestro equipo de ingenieros especialistas está disponible para
                  evaluar tu equipo y entregarte una cotización sin compromiso.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href="/#contacto">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider">
                      Solicitar Cotización
                    </Button>
                  </a>
                  <a
                    href="https://wa.me/56992779872"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="font-display tracking-wider">
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
