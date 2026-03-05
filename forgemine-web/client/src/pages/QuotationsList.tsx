import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Plus, RefreshCw, FileText, Download, Eye, Send, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

type GeneratedQuotation = {
  id: number;
  quotationNumber: string;
  clientName: string;
  clientRut: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientContact: string | null;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentSerial: string | null;
  serviceType: "repair" | "shielding" | "reconstruction";
  laborCost: number;
  materialsCost: number;
  equipmentCost: number;
  operationalCost: number;
  subtotalCost: number;
  profitMargin: number;
  profitAmount: number;
  netPrice: number;
  ivaAmount: number;
  totalPrice: number;
  materialsProvider: string;
  equipmentProvider: string;
  operationalProvider: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdAt: Date;
  pdfUrl: string | null;
};

const serviceLabels: Record<string, string> = {
  repair: "Reparación Menor",
  shielding: "Blindaje HD",
  reconstruction: "Reconstrucción Total",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Expirada",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-yellow-500",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function QuotationsList() {
  const { data: quotations, isLoading, refetch } = trpc.quotations.list.useQuery();
  const updateStatusMutation = trpc.quotations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado correctamente");
      refetch();
      setSelectedQuotation(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar estado: " + error.message);
    },
  });

  const deleteMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => {
      toast.success("Cotización eliminada correctamente");
      refetch();
      setSelectedQuotation(null);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Error al eliminar cotización: " + error.message);
    },
  });

  const [selectedQuotation, setSelectedQuotation] = useState<GeneratedQuotation | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const getStats = () => {
    if (!quotations) return { total: 0, draft: 0, sent: 0, accepted: 0 };
    return {
      total: quotations.length,
      draft: quotations.filter((q) => q.status === "draft").length,
      sent: quotations.filter((q) => q.status === "sent").length,
      accepted: quotations.filter((q) => q.status === "accepted").length,
    };
  };

  const stats = getStats();

  const handleViewDetails = (quotation: GeneratedQuotation) => {
    setSelectedQuotation(quotation);
    setViewDialogOpen(true);
  };

  const handleDownloadPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleSendQuotation = (quotation: GeneratedQuotation) => {
    setSelectedQuotation(quotation);
    setNewStatus("sent");
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedQuotation && newStatus) {
      updateStatusMutation.mutate({
        id: selectedQuotation.id,
        status: newStatus as "draft" | "sent" | "accepted" | "rejected" | "expired",
      });
      setStatusDialogOpen(false);
    }
  };

  const handleOpenPdfInNewTab = async (quotation: GeneratedQuotation) => {
    try {
      toast.info("Abriendo PDF...");
      // Use the server endpoint that generates PDF dynamically
      window.open(`/api/pdf/${quotation.quotationNumber}`, "_blank");
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      toast.error("Error al abrir el PDF. Intente nuevamente.");
    }
  };

  const generatePdfMutation = trpc.quotations.generatePdf.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);

  const handleDownloadPdfDirectly = async (quotation: GeneratedQuotation) => {
    try {
      setGeneratingPdfId(quotation.id);
      
      // First, ensure the PDF exists by generating it if needed
      if (!quotation.pdfUrl) {
        toast.info("Generando PDF...");
        await generatePdfMutation.mutateAsync({ id: quotation.id });
      }
      
      toast.info("Descargando PDF...");
      
      // Use the server endpoint to download the PDF (handles S3 authentication)
      const response = await fetch(`/api/pdf/${quotation.quotationNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quotation.quotationNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`PDF ${quotation.quotationNumber} descargado`);
    } catch (error) {
      console.error('Error generando/descargando PDF:', error);
      toast.error("Error al generar el PDF. Intente nuevamente.");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDeleteClick = (quotation: GeneratedQuotation) => {
    setSelectedQuotation(quotation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedQuotation) {
      deleteMutation.mutate({ id: selectedQuotation.id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cotizaciones Generadas</h1>
            <p className="text-muted-foreground mt-1">
              Gestione las cotizaciones formales para sus clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link href="/admin/cotizaciones/nueva">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Borradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aceptadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quotations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Cotizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !quotations || quotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay cotizaciones generadas aún.</p>
                <Link href="/admin/cotizaciones/nueva">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Cotización
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Cotización</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-mono font-medium">
                        {quotation.quotationNumber}
                      </TableCell>
                      <TableCell>{quotation.clientName}</TableCell>
                      <TableCell>{quotation.equipmentModel}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {serviceLabels[quotation.serviceType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(quotation.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[quotation.status]}>
                          {statusLabels[quotation.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(quotation.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver detalles"
                            onClick={() => handleViewDetails(quotation as GeneratedQuotation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={quotation.pdfUrl ? "Descargar PDF" : "Generar y Descargar PDF"}
                            onClick={() => handleDownloadPdfDirectly(quotation as GeneratedQuotation)}
                            className={quotation.pdfUrl ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-primary"}
                            disabled={generatingPdfId === quotation.id}
                          >
                            {generatingPdfId === quotation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                          <Link href={`/admin/cotizaciones/editar/${quotation.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar cotización"
                              className="text-amber-500 hover:text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          {quotation.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Marcar como Enviada"
                              onClick={() => handleSendQuotation(quotation as GeneratedQuotation)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Eliminar cotización"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(quotation as GeneratedQuotation)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización {selectedQuotation?.quotationNumber}</DialogTitle>
            <DialogDescription>
              Información completa de la cotización
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">DATOS DEL CLIENTE</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Razón Social:</span> {selectedQuotation.clientName}</p>
                    <p><span className="text-muted-foreground">RUT:</span> {selectedQuotation.clientRut || "N/A"}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedQuotation.clientEmail || "N/A"}</p>
                    <p><span className="text-muted-foreground">Teléfono:</span> {selectedQuotation.clientPhone || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">DATOS DEL EQUIPO</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Marca:</span> {selectedQuotation.equipmentBrand}</p>
                    <p><span className="text-muted-foreground">Modelo:</span> {selectedQuotation.equipmentModel}</p>
                    <p><span className="text-muted-foreground">Serie:</span> {selectedQuotation.equipmentSerial || "N/A"}</p>
                    <p><span className="text-muted-foreground">Servicio:</span> {serviceLabels[selectedQuotation.serviceType]}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">DESGLOSE DE PRECIOS</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  {(() => {
                    const margin = 1 + (selectedQuotation.profitMargin / 100);
                    const laborWithMargin = Math.round(selectedQuotation.laborCost * margin);
                    const materialsWithMargin = Math.round(selectedQuotation.materialsCost * margin);
                    const equipmentWithMargin = Math.round(selectedQuotation.equipmentCost * margin);
                    const operationalWithMargin = Math.round(selectedQuotation.operationalCost * margin);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Mano de Obra:</span>
                          <span className="font-mono">{formatCurrency(laborWithMargin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Materiales ({selectedQuotation.materialsProvider}):</span>
                          <span className="font-mono">{formatCurrency(materialsWithMargin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipos ({selectedQuotation.equipmentProvider}):</span>
                          <span className="font-mono">{formatCurrency(equipmentWithMargin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gastos Operacionales ({selectedQuotation.operationalProvider}):</span>
                          <span className="font-mono">{formatCurrency(operationalWithMargin)}</span>
                        </div>
                      </>
                    );
                  })()}
                  <hr className="border-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Precio Neto:</span>
                    <span className="font-mono">{formatCurrency(selectedQuotation.netPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span className="font-mono">{formatCurrency(selectedQuotation.ivaAmount)}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>TOTAL:</span>
                    <span className="font-mono">{formatCurrency(selectedQuotation.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge className={statusColors[selectedQuotation.status]}>
                    {statusLabels[selectedQuotation.status]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenPdfInNewTab(selectedQuotation)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewStatus(selectedQuotation.status);
                      setViewDialogOpen(false);
                      setStatusDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Cambiar Estado
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Cotización</DialogTitle>
            <DialogDescription>
              Actualizar el estado de la cotización {selectedQuotation?.quotationNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="accepted">Aceptada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Eliminar Cotización</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar la cotización{" "}
              <span className="font-mono font-semibold">{selectedQuotation?.quotationNumber}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedQuotation && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Cliente:</span> {selectedQuotation.clientName}</p>
                <p><span className="text-muted-foreground">Equipo:</span> {selectedQuotation.equipmentBrand} {selectedQuotation.equipmentModel}</p>
                <p><span className="text-muted-foreground">Total:</span> {formatCurrency(selectedQuotation.totalPrice)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar Cotización"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
