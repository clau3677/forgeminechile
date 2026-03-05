import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const serviceLabels: Record<string, string> = {
  repair: "Reparación Menor",
  shielding: "Blindaje HD",
  reconstruction: "Reconstrucción Total",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function EditQuotation() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const quotationId = parseInt(params.id || "0");

  const { data: quotation, isLoading } = trpc.quotations.getById.useQuery(
    { id: quotationId },
    { enabled: quotationId > 0 }
  );

  const updateMutation = trpc.quotations.update.useMutation({
    onSuccess: () => {
      toast.success("Cotización actualizada correctamente");
      navigate("/admin/cotizaciones");
    },
    onError: (error) => {
      toast.error("Error al actualizar: " + error.message);
    },
  });

  // Original costs (to restore when switching back to FORGEMINE)
  const [originalCosts, setOriginalCosts] = useState({
    materialsCost: 0,
    equipmentCost: 0,
    operationalCost: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    // Client info
    clientName: "",
    clientRut: "",
    clientAddress: "",
    clientCity: "",
    clientContact: "",
    clientPhone: "",
    clientEmail: "",
    // Equipment info
    equipmentType: "",
    equipmentBrand: "",
    equipmentModel: "",
    equipmentSerial: "",
    equipmentCapacity: "",
    equipmentLocation: "",
    // Service details
    serviceType: "repair" as "repair" | "shielding" | "reconstruction",
    durationDays: 14,
    // Costs
    laborCost: 0,
    materialsCost: 0,
    equipmentCost: 0,
    operationalCost: 0,
    profitMargin: 50,
    // Provider configuration
    materialsProvider: "forgemine" as "forgemine" | "client",
    equipmentProvider: "forgemine" as "forgemine" | "client",
    operationalProvider: "forgemine" as "forgemine" | "client",
    // Commercial terms
    validityDays: 30,
    paymentTerms: "50% anticipo / 50% entrega",
    warrantyTerms: "",
    additionalNotes: "",
  });

  // Load quotation data into form
  useEffect(() => {
    if (quotation) {
      console.log('[EditQuotation] Loading quotation data:', quotation);
      console.log('[EditQuotation] serviceType from DB:', quotation.serviceType);
      
      // Use original costs from database if available, otherwise use current costs
      const origMaterials = (quotation as any).originalMaterialsCost ?? quotation.materialsCost;
      const origEquipment = (quotation as any).originalEquipmentCost ?? quotation.equipmentCost;
      const origOperational = (quotation as any).originalOperationalCost ?? quotation.operationalCost;
      
      console.log('[EditQuotation] Original costs from DB:', { origMaterials, origEquipment, origOperational });
      console.log('[EditQuotation] Current costs from DB:', { 
        materialsCost: quotation.materialsCost, 
        equipmentCost: quotation.equipmentCost, 
        operationalCost: quotation.operationalCost 
      });
      
      setFormData({
        clientName: quotation.clientName || "",
        clientRut: quotation.clientRut || "",
        clientAddress: quotation.clientAddress || "",
        clientCity: quotation.clientCity || "",
        clientContact: quotation.clientContact || "",
        clientPhone: quotation.clientPhone || "",
        clientEmail: quotation.clientEmail || "",
        equipmentType: quotation.equipmentType || "",
        equipmentBrand: quotation.equipmentBrand || "",
        equipmentModel: quotation.equipmentModel || "",
        equipmentSerial: quotation.equipmentSerial || "",
        equipmentCapacity: quotation.equipmentCapacity || "",
        equipmentLocation: quotation.equipmentLocation || "",
        serviceType: quotation.serviceType || "repair",
        durationDays: quotation.durationDays,
        laborCost: quotation.laborCost,
        materialsCost: quotation.materialsCost,
        equipmentCost: quotation.equipmentCost,
        operationalCost: quotation.operationalCost,
        profitMargin: quotation.profitMargin,
        materialsProvider: quotation.materialsProvider || "forgemine",
        equipmentProvider: quotation.equipmentProvider || "forgemine",
        operationalProvider: quotation.operationalProvider || "forgemine",
        validityDays: quotation.validityDays,
        paymentTerms: quotation.paymentTerms || "50% anticipo / 50% entrega",
        warrantyTerms: quotation.warrantyTerms || "",
        additionalNotes: quotation.additionalNotes || "",
      });
      
      // Store original costs from database for restoration when switching providers
      // These are the "true" original costs that never change
      setOriginalCosts({
        materialsCost: origMaterials,
        equipmentCost: origEquipment,
        operationalCost: origOperational,
      });
      console.log('[EditQuotation] Original costs set to:', { origMaterials, origEquipment, origOperational });
      console.log('[EditQuotation] formData.serviceType set to:', quotation.serviceType);
    }
  }, [quotation]);

  // Calculate totals
  const subtotalCost = formData.laborCost + formData.materialsCost + formData.equipmentCost + formData.operationalCost;
  const profitAmount = Math.round(subtotalCost * (formData.profitMargin / 100));
  const netPrice = subtotalCost + profitAmount;
  const ivaAmount = Math.round(netPrice * 0.19);
  const totalPrice = netPrice + ivaAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      id: quotationId,
      ...formData,
      clientRut: formData.clientRut || null,
      clientAddress: formData.clientAddress || null,
      clientCity: formData.clientCity || null,
      clientContact: formData.clientContact || null,
      clientPhone: formData.clientPhone || null,
      clientEmail: formData.clientEmail || null,
      equipmentSerial: formData.equipmentSerial || null,
      equipmentCapacity: formData.equipmentCapacity || null,
      equipmentLocation: formData.equipmentLocation || null,
      warrantyTerms: formData.warrantyTerms || null,
      additionalNotes: formData.additionalNotes || null,
      subtotalCost,
      profitAmount,
      netPrice,
      ivaAmount,
      totalPrice,
      // Always save the original costs so they can be restored when switching providers
      originalMaterialsCost: originalCosts.materialsCost,
      originalEquipmentCost: originalCosts.equipmentCost,
      originalOperationalCost: originalCosts.operationalCost,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quotation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cotización no encontrada</p>
          <Button onClick={() => navigate("/admin/cotizaciones")} className="mt-4">
            Volver a Cotizaciones
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/cotizaciones")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Editar Cotización {quotation.quotationNumber}
              </h1>
              <p className="text-muted-foreground mt-1">
                Modifique los datos de la cotización según lo solicitado por el cliente
              </p>
            </div>
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
              <CardDescription>Información de contacto y facturación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="clientName">Razón Social *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientRut">RUT</Label>
                  <Input
                    id="clientRut"
                    value={formData.clientRut}
                    onChange={(e) => setFormData({ ...formData, clientRut: e.target.value })}
                    placeholder="12.345.678-9"
                  />
                </div>
                <div>
                  <Label htmlFor="clientContact">Contacto</Label>
                  <Input
                    id="clientContact"
                    value={formData.clientContact}
                    onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Teléfono</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="clientAddress">Dirección</Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="clientCity">Ciudad</Label>
                  <Input
                    id="clientCity"
                    value={formData.clientCity}
                    onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Equipo</CardTitle>
              <CardDescription>Información del equipo a reparar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentBrand">Marca *</Label>
                  <Input
                    id="equipmentBrand"
                    value={formData.equipmentBrand}
                    onChange={(e) => setFormData({ ...formData, equipmentBrand: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentModel">Modelo *</Label>
                  <Input
                    id="equipmentModel"
                    value={formData.equipmentModel}
                    onChange={(e) => setFormData({ ...formData, equipmentModel: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentType">Tipo de Equipo *</Label>
                  <Input
                    id="equipmentType"
                    value={formData.equipmentType}
                    onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentSerial">N° Serie</Label>
                  <Input
                    id="equipmentSerial"
                    value={formData.equipmentSerial}
                    onChange={(e) => setFormData({ ...formData, equipmentSerial: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentCapacity">Capacidad</Label>
                  <Input
                    id="equipmentCapacity"
                    value={formData.equipmentCapacity}
                    onChange={(e) => setFormData({ ...formData, equipmentCapacity: e.target.value })}
                    placeholder="ej: 52 m³"
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentLocation">Ubicación</Label>
                  <Input
                    id="equipmentLocation"
                    value={formData.equipmentLocation}
                    onChange={(e) => setFormData({ ...formData, equipmentLocation: e.target.value })}
                    placeholder="ej: Faena Escondida"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Servicio</CardTitle>
              <CardDescription>Tipo de servicio y duración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Tipo de Servicio *</Label>
                  <Select
                    key={`serviceType-${formData.serviceType}`}
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value as "repair" | "shielding" | "reconstruction" })}
                  >
                    <SelectTrigger>
                      <span className="flex-1 text-left">
                        {formData.serviceType === "repair" ? "Reparación Menor" : 
                         formData.serviceType === "shielding" ? "Blindaje HD" : 
                         formData.serviceType === "reconstruction" ? "Reconstrucción Total" : 
                         "Seleccione tipo de servicio"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair">Reparación Menor</SelectItem>
                      <SelectItem value="shielding">Blindaje HD</SelectItem>
                      <SelectItem value="reconstruction">Reconstrucción Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="durationDays">Duración (días) *</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>
              {/* Provider Switches */}
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-2">¿Quién aporta?</h4>
                <p className="text-sm text-muted-foreground mb-4">Indique si FORGEMINE o el CLIENTE aporta cada categoría</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Materiales y Consumibles</p>
                      <p className="text-xs text-muted-foreground">Alambre, planchas, gases, discos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${formData.materialsProvider === 'client' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Cliente</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newProvider = formData.materialsProvider === 'forgemine' ? 'client' : 'forgemine';
                          if (newProvider === 'client') {
                            // Save current cost to originalCosts ONLY if it's not already 0 (meaning it hasn't been saved yet)
                            if (formData.materialsCost > 0) {
                              setOriginalCosts(prev => ({ ...prev, materialsCost: formData.materialsCost }));
                            }
                            setFormData({ ...formData, materialsProvider: newProvider, materialsCost: 0 });
                          } else {
                            // Restore original cost from the stored originalCosts
                            console.log('[Switch] Restoring materialsCost to:', originalCosts.materialsCost);
                            setFormData({ ...formData, materialsProvider: newProvider, materialsCost: originalCosts.materialsCost });
                          }
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.materialsProvider === 'forgemine' ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.materialsProvider === 'forgemine' ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className={`text-xs ${formData.materialsProvider === 'forgemine' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>FORGEMINE</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Equipos y Arriendos</p>
                      <p className="text-xs text-muted-foreground">Máquinas de soldar, grúa, generador</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${formData.equipmentProvider === 'client' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Cliente</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newProvider = formData.equipmentProvider === 'forgemine' ? 'client' : 'forgemine';
                          if (newProvider === 'client') {
                            // Save current cost to originalCosts ONLY if it's not already 0
                            if (formData.equipmentCost > 0) {
                              setOriginalCosts(prev => ({ ...prev, equipmentCost: formData.equipmentCost }));
                            }
                            setFormData({ ...formData, equipmentProvider: newProvider, equipmentCost: 0 });
                          } else {
                            // Restore original cost from the stored originalCosts
                            console.log('[Switch] Restoring equipmentCost to:', originalCosts.equipmentCost);
                            setFormData({ ...formData, equipmentProvider: newProvider, equipmentCost: originalCosts.equipmentCost });
                          }
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.equipmentProvider === 'forgemine' ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.equipmentProvider === 'forgemine' ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className={`text-xs ${formData.equipmentProvider === 'forgemine' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>FORGEMINE</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Gastos Operacionales</p>
                      <p className="text-xs text-muted-foreground">Hospedaje, alimentación, transporte</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${formData.operationalProvider === 'client' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Cliente</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newProvider = formData.operationalProvider === 'forgemine' ? 'client' : 'forgemine';
                          if (newProvider === 'client') {
                            // Save current cost to originalCosts ONLY if it's not already 0
                            if (formData.operationalCost > 0) {
                              setOriginalCosts(prev => ({ ...prev, operationalCost: formData.operationalCost }));
                            }
                            setFormData({ ...formData, operationalProvider: newProvider, operationalCost: 0 });
                          } else {
                            // Restore original cost from the stored originalCosts
                            console.log('[Switch] Restoring operationalCost to:', originalCosts.operationalCost);
                            setFormData({ ...formData, operationalProvider: newProvider, operationalCost: originalCosts.operationalCost });
                          }
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.operationalProvider === 'forgemine' ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.operationalProvider === 'forgemine' ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className={`text-xs ${formData.operationalProvider === 'forgemine' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>FORGEMINE</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Costos</CardTitle>
              <CardDescription>Desglose de costos base (sin margen)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="laborCost">Mano de Obra (CLP)</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    min="0"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="materialsCost">Materiales (CLP)</Label>
                  <Input
                    id="materialsCost"
                    type="number"
                    min="0"
                    value={formData.materialsCost}
                    onChange={(e) => setFormData({ ...formData, materialsCost: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentCost">Equipos (CLP)</Label>
                  <Input
                    id="equipmentCost"
                    type="number"
                    min="0"
                    value={formData.equipmentCost}
                    onChange={(e) => setFormData({ ...formData, equipmentCost: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="operationalCost">Gastos Operacionales (CLP)</Label>
                  <Input
                    id="operationalCost"
                    type="number"
                    min="0"
                    value={formData.operationalCost}
                    onChange={(e) => setFormData({ ...formData, operationalCost: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="profitMargin">Margen de Ganancia (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.profitMargin}
                    onChange={(e) => setFormData({ ...formData, profitMargin: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Separator />

              {/* Calculated Totals */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (costos base):</span>
                  <span className="font-mono">{formatCurrency(subtotalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Margen ({formData.profitMargin}%):</span>
                  <span className="font-mono">{formatCurrency(profitAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Precio Neto:</span>
                  <span className="font-mono">{formatCurrency(netPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span className="font-mono">{formatCurrency(ivaAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>TOTAL:</span>
                  <span className="font-mono">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Términos Comerciales</CardTitle>
              <CardDescription>Condiciones de la cotización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="validityDays">Validez (días)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    min="1"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="paymentTerms">Forma de Pago</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="warrantyTerms">Garantía</Label>
                <Input
                  id="warrantyTerms"
                  value={formData.warrantyTerms}
                  onChange={(e) => setFormData({ ...formData, warrantyTerms: e.target.value })}
                  placeholder="ej: 6 meses de garantía en soldaduras"
                />
              </div>
              <div>
                <Label htmlFor="additionalNotes">Notas Adicionales</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={3}
                  placeholder="Observaciones o condiciones especiales..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </DashboardLayout>
  );
}
