/**
 * Admin Dashboard - Quote Management
 * Protected page for managing quote requests
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  Building2,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Image,
  ExternalLink,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Status configuration
const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
  reviewing: { label: "En Revisión", color: "bg-blue-500/20 text-blue-500", icon: Eye },
  quoted: { label: "Cotizado", color: "bg-purple-500/20 text-purple-500", icon: DollarSign },
  accepted: { label: "Aceptado", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  rejected: { label: "Rechazado", color: "bg-red-500/20 text-red-500", icon: XCircle },
  completed: { label: "Completado", color: "bg-emerald-500/20 text-emerald-500", icon: CheckCircle },
};

const urgencyConfig = {
  normal: { label: "Normal", color: "bg-gray-500/20 text-gray-400" },
  priority: { label: "Prioritario", color: "bg-yellow-500/20 text-yellow-500" },
  urgent: { label: "Urgente", color: "bg-orange-500/20 text-orange-500" },
  emergency: { label: "Emergencia", color: "bg-red-500/20 text-red-500" },
};

// Mapear servicios seleccionados a tipo de servicio para cotización
function mapServiceType(services: string[]): "repair" | "shielding" | "reconstruction" {
  const servicesLower = services.map(s => s.toLowerCase());
  if (servicesLower.some(s => s.includes("reconstrucción") || s.includes("overhaul"))) {
    return "reconstruction";
  }
  if (servicesLower.some(s => s.includes("blindaje") || s.includes("heavy duty"))) {
    return "shielding";
  }
  return "repair";
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [creatingQuotation, setCreatingQuotation] = useState<number | null>(null);

  // Fetch quotes
  const { data: quotes, isLoading: quotesLoading, refetch } = trpc.quotes.list.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  // Fetch stats
  const { data: stats } = trpc.quotes.stats.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  // Mutations
  const updateStatusMutation = trpc.quotes.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado correctamente");
      refetch();
    },
    onError: (error) => {
      toast.error("Error al actualizar: " + error.message);
    },
  });

  const updateNotesMutation = trpc.quotes.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("Notas guardadas correctamente");
      refetch();
    },
    onError: (error) => {
      toast.error("Error al guardar: " + error.message);
    },
  });

  // Mutation para crear cotización automática desde solicitud
  const createQuotationMutation = trpc.quotations.createFromRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Cotización ${data?.quotationNumber} creada automáticamente`);
      setCreatingQuotation(null);
      // Actualizar estado de la solicitud a "quoted"
      refetch();
      // Redirigir a la cotización generada
      setLocation("/admin/cotizaciones");
    },
    onError: (error) => {
      toast.error("Error al crear cotización: " + error.message);
      setCreatingQuotation(null);
    },
  });

  const handleCreateQuotation = (quote: any) => {
    setCreatingQuotation(quote.id);
    createQuotationMutation.mutate({
      quoteRequestId: quote.id,
      clientName: quote.company,
      clientContact: quote.contactName,
      clientPhone: quote.phone,
      clientEmail: quote.email,
      clientCity: quote.location,
      equipmentBrand: quote.brand,
      equipmentModel: quote.model,
      equipmentType: quote.equipmentType,
      equipmentSerial: quote.serialNumber || "",
      serviceType: mapServiceType(quote.selectedServices as string[]),
      problemDescription: quote.problemDescription,
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso Requerido</h2>
            <p className="text-muted-foreground mb-4">
              Debe iniciar sesión para acceder al panel de administración.
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-4">
              No tiene permisos de administrador para acceder a esta sección.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter quotes
  const filteredQuotes = quotes?.filter(
    (q) => filterStatus === "all" || q.status === filterStatus
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Panel de Cotizaciones</h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona las solicitudes de cotización
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Badge variant="outline" className="text-xs">
                {user.name || user.email}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats?.reviewing || 0}</div>
              <div className="text-xs text-muted-foreground">En Revisión</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{stats?.quoted || 0}</div>
              <div className="text-xs text-muted-foreground">Cotizados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{stats?.accepted || 0}</div>
              <div className="text-xs text-muted-foreground">Aceptados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">{stats?.completed || 0}</div>
              <div className="text-xs text-muted-foreground">Completados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{stats?.rejected || 0}</div>
              <div className="text-xs text-muted-foreground">Rechazados</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="reviewing">En Revisión</SelectItem>
              <SelectItem value="quoted">Cotizados</SelectItem>
              <SelectItem value="accepted">Aceptados</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredQuotes.length} cotización(es)
          </span>
        </div>

        {/* Quotes List */}
        {quotesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay cotizaciones</h3>
              <p className="text-muted-foreground">
                Las solicitudes de cotización aparecerán aquí cuando los clientes las envíen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const status = statusConfig[quote.status as keyof typeof statusConfig];
              const urgency = urgencyConfig[quote.urgency as keyof typeof urgencyConfig];
              const StatusIcon = status.icon;

              return (
                <Card key={quote.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Main Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-foreground">
                                {quote.contactName}
                              </h3>
                              <Badge className={urgency.color}>{urgency.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {quote.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {quote.location}
                              </span>
                            </div>
                          </div>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <a
                            href={`mailto:${quote.email}`}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                          >
                            <Mail className="w-4 h-4" />
                            {quote.email}
                          </a>
                          <a
                            href={`tel:${quote.phone}`}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                          >
                            <Phone className="w-4 h-4" />
                            {quote.phone}
                          </a>
                        </div>

                        {/* Equipment Info */}
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {quote.brand} {quote.model}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {quote.equipmentType}
                            {quote.serialNumber && ` | S/N: ${quote.serialNumber}`}
                            {quote.hoursOperation && ` | ${quote.hoursOperation} hrs`}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(quote.selectedServices as string[]).map((service, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Problem Description */}
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {quote.problemDescription}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="text-xs text-muted-foreground">
                          Recibido: {new Date(quote.createdAt).toLocaleString("es-CL")}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-48">
                        <Select
                          value={quote.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({
                              id: quote.id,
                              status: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="reviewing">En Revisión</SelectItem>
                            <SelectItem value="quoted">Cotizado</SelectItem>
                            <SelectItem value="accepted">Aceptado</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalle de Cotización #{quote.id}</DialogTitle>
                            </DialogHeader>
                            <QuoteDetailView
                              quote={quote}
                              onUpdateNotes={(notes, price) =>
                                updateNotesMutation.mutate({
                                  id: quote.id,
                                  adminNotes: notes,
                                  quotedPrice: price,
                                })
                              }
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${quote.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hola ${quote.contactName}, gracias por contactar a FORGEMINE CHILE. Hemos recibido su solicitud de cotización para ${quote.brand} ${quote.model}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            WhatsApp
                          </a>
                        </Button>

                        {/* Botón para crear cotización automática */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              disabled={creatingQuotation === quote.id || quote.status === "quoted"}
                            >
                              {creatingQuotation === quote.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creando...
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 mr-2" />
                                  {quote.status === "quoted" ? "Cotizado" : "Crear Cotización"}
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Crear Cotización Automática</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se creará una cotización formal para <strong>{quote.company}</strong> basada en esta solicitud.
                                <br /><br />
                                <strong>Equipo:</strong> {quote.brand} {quote.model}<br />
                                <strong>Servicio detectado:</strong> {mapServiceType(quote.selectedServices as string[]) === "reconstruction" ? "Reconstrucción Total" : mapServiceType(quote.selectedServices as string[]) === "shielding" ? "Blindaje HD" : "Reparación Menor"}
                                <br /><br />
                                Los costos se calcularán automáticamente según los parámetros configurados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCreateQuotation(quote)}>
                                Crear Cotización
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Quote Detail View Component
function QuoteDetailView({
  quote,
  onUpdateNotes,
}: {
  quote: any;
  onUpdateNotes: (notes: string, price: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes || "");
  const [quotedPrice, setQuotedPrice] = useState(quote.quotedPrice || "");

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Información de Contacto</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nombre:</span>
            <p className="font-medium">{quote.contactName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Empresa:</span>
            <p className="font-medium">{quote.company}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium">{quote.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Teléfono:</span>
            <p className="font-medium">{quote.phone}</p>
          </div>
          {quote.position && (
            <div>
              <span className="text-muted-foreground">Cargo:</span>
              <p className="font-medium">{quote.position}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Ubicación:</span>
            <p className="font-medium">{quote.location}</p>
          </div>
        </div>
      </div>

      {/* Equipment Information */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Información del Equipo</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Marca:</span>
            <p className="font-medium">{quote.brand}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <p className="font-medium">{quote.equipmentType}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Modelo:</span>
            <p className="font-medium">{quote.model}</p>
          </div>
          {quote.serialNumber && (
            <div>
              <span className="text-muted-foreground">Nº Serie:</span>
              <p className="font-medium">{quote.serialNumber}</p>
            </div>
          )}
          {quote.hoursOperation && (
            <div>
              <span className="text-muted-foreground">Horas Operación:</span>
              <p className="font-medium">{quote.hoursOperation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Servicios Solicitados</h4>
        <div className="flex flex-wrap gap-2">
          {(quote.selectedServices as string[]).map((service, i) => (
            <Badge key={i} variant="secondary">
              {service}
            </Badge>
          ))}
        </div>
      </div>

      {/* Problem Description */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Descripción del Problema</h4>
        <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">
          {quote.problemDescription}
        </p>
      </div>

      {/* Additional Notes */}
      {quote.additionalNotes && (
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Notas Adicionales del Cliente</h4>
          <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg">
            {quote.additionalNotes}
          </p>
        </div>
      )}

      {/* Images Section */}
      {quote.images && (quote.images as string[]).length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            Imágenes Adjuntas ({(quote.images as string[]).length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(quote.images as string[]).map((imageUrl, index) => (
              <div key={index} className="relative group">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary/30 border border-border hover:border-primary/50 transition-colors">
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.svg';
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </a>
                <p className="text-xs text-muted-foreground mt-1 text-center truncate">
                  Imagen {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Section */}
      <div className="border-t border-border pt-6">
        <h4 className="font-semibold mb-3 text-foreground">Notas Internas (Admin)</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Precio Cotizado (USD)
            </label>
            <Input
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="Ej: 45,000"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Notas del Administrador
            </label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Agregar notas internas sobre esta cotización..."
              rows={4}
            />
          </div>
          <Button onClick={() => onUpdateNotes(adminNotes, quotedPrice)}>
            Guardar Notas
          </Button>
        </div>
      </div>
    </div>
  );
}
