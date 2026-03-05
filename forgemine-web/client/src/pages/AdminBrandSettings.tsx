/**
 * Admin Brand Settings — Logo, company info, contact, social links
 * Accessible from /admin/configuracion
 */

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Upload, Building2, Phone, Mail, MapPin, Globe, Linkedin, Facebook, Instagram, Search, Save, ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminBrandSettings() {
  const { user } = useAuth();
  const config = useSiteConfig();
  const utils = trpc.useUtils();

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    company_name: "",
    company_legal_name: "",
    tagline: "",
    phone: "",
    phone_formatted: "",
    email: "",
    address: "",
    website: "",
    social_linkedin: "",
    social_facebook: "",
    social_instagram: "",
    social_whatsapp: "",
    seo_title: "",
    seo_description: "",
  });

  const [initialized, setInitialized] = useState(false);
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    onSuccess: (data) => {
      if (initialized) return;
      setInitialized(true);
      setForm({
        company_name: data.company_name || config.company.name,
        company_legal_name: data.company_legal_name || config.company.legalName,
        tagline: data.tagline || config.company.tagline,
        phone: data.phone || config.company.phone,
        phone_formatted: data.phone_formatted || config.company.phoneFormatted,
        email: data.email || config.company.email,
        address: data.address || config.company.address,
        website: data.website || config.company.website,
        social_linkedin: data.social_linkedin || config.social.linkedin,
        social_facebook: data.social_facebook || config.social.facebook,
        social_instagram: data.social_instagram || config.social.instagram,
        social_whatsapp: data.social_whatsapp || config.social.whatsapp,
        seo_title: data.seo_title || config.seo.title,
        seo_description: data.seo_description || config.seo.description,
      });
      if (data.logo_url) setLogoPreview(data.logo_url);
    },
  });

  const uploadLogo = trpc.siteSettings.uploadLogo.useMutation({
    onSuccess: (data) => {
      setLogoPreview(data.url);
      utils.siteSettings.get.invalidate();
      toast.success("Logo subido correctamente");
      setIsUploadingLogo(false);
    },
    onError: (error) => {
      toast.error("Error al subir el logo: " + error.message);
      setIsUploadingLogo(false);
    },
  });

  const updateMany = trpc.siteSettings.updateMany.useMutation({
    onSuccess: () => {
      utils.siteSettings.get.invalidate();
      toast.success("Configuración guardada correctamente");
    },
    onError: (error) => {
      toast.error("Error al guardar: " + error.message);
    },
  });

  const handleLogoFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen (PNG, JPG, SVG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no puede superar los 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setLogoPreview(e.target?.result as string);
      setIsUploadingLogo(true);
      uploadLogo.mutate({
        fileData: base64,
        fileName: file.name,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, [uploadLogo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  }, [handleLogoFile]);

  const handleSave = () => {
    const cleanForm = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v.trim() !== "")
    );
    updateMany.mutate({ settings: cleanForm });
  };

  if (!user) return null;

  const currentLogo = logoPreview || config.company.logoUrl;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración del Sitio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Personaliza el logo, datos de tu empresa, contacto y redes sociales. Los cambios se reflejan en el sitio de inmediato.
          </p>
        </div>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Logo de la empresa
            </CardTitle>
            <CardDescription>
              Sube tu logo en PNG, SVG o WEBP (fondo transparente recomendado). Máximo 5 MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {currentLogo ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={currentLogo}
                    alt="Logo actual"
                    className="h-20 w-auto object-contain"
                  />
                  <p className="text-sm text-muted-foreground">
                    Haz clic o arrastra para cambiar el logo
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Arrastra tu logo aquí</p>
                    <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoFile(file);
                }}
              />
            </div>
            {isUploadingLogo && (
              <p className="text-sm text-primary animate-pulse">Subiendo logo...</p>
            )}
          </CardContent>
        </Card>

        {/* Datos de la empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Datos de la empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la empresa</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Ej: ACERO MINERO CHILE"
              />
            </div>
            <div className="space-y-2">
              <Label>Razón social</Label>
              <Input
                value={form.company_legal_name}
                onChange={(e) => setForm({ ...form, company_legal_name: e.target.value })}
                placeholder="Ej: ACERO MINERO CHILE SpA"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Eslogan / Tagline</Label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Ej: Forjando el Futuro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Información de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Teléfono (para enlace tel:)
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej: +56992779872"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono (formato visible)</Label>
              <Input
                value={form.phone_formatted}
                onChange={(e) => setForm({ ...form, phone_formatted: e.target.value })}
                placeholder="Ej: +56 9 9277 9872"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ej: contacto@tuempresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Dirección / Ciudad
              </Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: Antofagasta, Chile"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Sitio web
              </Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="Ej: https://www.tuempresa.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Redes sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Redes sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" /> LinkedIn URL
              </Label>
              <Input
                value={form.social_linkedin}
                onChange={(e) => setForm({ ...form, social_linkedin: e.target.value })}
                placeholder="https://www.linkedin.com/company/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Facebook className="w-3 h-3" /> Facebook URL
              </Label>
              <Input
                value={form.social_facebook}
                onChange={(e) => setForm({ ...form, social_facebook: e.target.value })}
                placeholder="https://www.facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Instagram className="w-3 h-3" /> Instagram URL
              </Label>
              <Input
                value={form.social_instagram}
                onChange={(e) => setForm({ ...form, social_instagram: e.target.value })}
                placeholder="https://www.instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (solo número, sin +)</Label>
              <Input
                value={form.social_whatsapp}
                onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })}
                placeholder="Ej: 56992779872"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              SEO — Título y descripción
            </CardTitle>
            <CardDescription>
              Estos textos aparecen en Google y en redes sociales al compartir el sitio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título SEO (máx. 60 caracteres)</Label>
              <Input
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                placeholder="Ej: Reparación de Baldes Mineros | TU EMPRESA"
                maxLength={70}
              />
              <p className="text-xs text-muted-foreground">{form.seo_title.length}/60 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label>Descripción SEO (máx. 160 caracteres)</Label>
              <Input
                value={form.seo_description}
                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                placeholder="Ej: Especialistas en reparación de baldes mineros en Chile..."
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{form.seo_description.length}/160 caracteres</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMany.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wider px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMany.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
