/**
 * SocialShare Component - Share buttons for social media platforms
 * Optimized for Facebook, LinkedIn, Twitter/X, and WhatsApp
 */

import { Facebook, Linkedin, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackConversion } from "@/lib/tracking";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "horizontal" | "vertical" | "compact";
  className?: string;
}

// X (Twitter) icon as inline SVG
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function SocialShare({
  url,
  title = "FORGEMINE Chile - Reparación de Baldes Mineros",
  description = "Especialistas en reparación y blindaje de baldes mineros en Chile. Soldadura certificada AWS D1.1.",
  variant = "horizontal",
  className = "",
}: SocialShareProps) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://www.forgeminechile.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: "hover:bg-[#1877F2] hover:text-white",
      trackEvent: "facebook" as const,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-[#0A66C2] hover:text-white",
      trackEvent: "linkedin" as const,
    },
    {
      name: "X",
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-black hover:text-white",
      trackEvent: "twitter" as const,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366] hover:text-white",
      trackEvent: "whatsapp" as const,
    },
  ];

  const handleShare = (platform: string, shareLink: string) => {
    trackConversion({
      event_name: "promo_cta_click",
      event_category: "social_share",
      event_label: platform,
    });
    window.open(shareLink, "_blank", "width=600,height=400,noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Enlace copiado");
    }
  };

  const isVertical = variant === "vertical";
  const isCompact = variant === "compact";

  return (
    <div
      className={`flex ${isVertical ? "flex-col" : "flex-row"} ${isCompact ? "gap-1" : "gap-2"} items-center ${className}`}
    >
      {!isCompact && (
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-1">
          Compartir
        </span>
      )}
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size={isCompact ? "sm" : "icon"}
          className={`${isCompact ? "w-8 h-8 p-0" : "w-9 h-9"} border-border bg-transparent ${link.color} transition-all duration-200`}
          onClick={() => handleShare(link.trackEvent, link.url)}
          title={`Compartir en ${link.name}`}
        >
          <link.icon className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </Button>
      ))}
      <Button
        variant="outline"
        size={isCompact ? "sm" : "icon"}
        className={`${isCompact ? "w-8 h-8 p-0" : "w-9 h-9"} border-border bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-200`}
        onClick={handleCopyLink}
        title="Copiar enlace"
      >
        <Share2 className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </Button>
    </div>
  );
}
