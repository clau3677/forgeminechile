import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, Calculator, FileText, Save, Download } from "lucide-react";

type CostParameter = {
  id: number;
  category: string;
  name: string;
  description: string | null;
  unitCost: number;
  unit: string;
  supplier: string | null;
};

type CostItem = {
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
};

const serviceConfigs = {
  repair: { label: "Reparación Menor", days: 14 },
  shielding: { label: "Blindaje Heavy Duty", days: 42 },
  reconstruction: { label: "Reconstrucción Total", days: 71 },
};

const equipmentBrands = ["Komatsu", "Caterpillar", "Liebherr", "Hitachi"];
const equipmentModels: Record<string, string[]> = {
  Komatsu: ["PC4000", "PC5500", "PC7000", "PC8000"],
  Caterpillar: ["CAT 6040", "CAT 6050", "CAT 6060"],
  Liebherr: ["R9400", "R9800"],
  Hitachi: ["EX5600", "EX8000"],
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function QuotationGenerator() {
  const [, setLocation] = useLocation();
  const { data: costParameters, isLoading: loadingParams } = trpc.costParameters.list.useQuery();
  const { data: nextNumber } = trpc.quotations.getNextNumber.useQuery();
  
  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: async (data) => {
      toast.success(`Cotización ${data?.quotationNumber} creada correctamente`);
      // PDF is now generated automatically during creation
      // No need to call generatePdf separately
      setLocation("/admin/cotizaciones");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const generatePdfMutation = trpc.quotations.generatePdf.useMutation();

  // Form state
  const [clientData, setClientData] = useState({
    clientName: "",
    clientRut: "",
    clientAddress: "",
    clientCity: "",
    clientContact: "",
    clientPhone: "",
    clientEmail: "",
  });

  const [equipmentData, setEquipmentData] = useState({
    equipmentType: "Pala Hidráulica",
    equipmentBrand: "Komatsu",
    equipmentModel: "PC7000",
    equipmentSerial: "",
    equipmentCapacity: "",
    equipmentLocation: "",
  });

  const [serviceType, setServiceType] = useState<"repair" | "shielding" | "reconstruction">("repair");
  const [durationDays, setDurationDays] = useState(14);
  
  const [providers, setProviders] = useState({
    materials: true, // true = FORGEMINE, false = CLIENT
    equipment: true,
    operational: true,
  });

  const [profitMargin, setProfitMargin] = useState(50);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Update duration when service type changes
  useEffect(() => {
    setDurationDays(serviceConfigs[serviceType].days);
  }, [serviceType]);

  // Calculate costs based on parameters and service type
  const costs = useMemo(() => {
    if (!costParameters) {
      return {
        labor: [] as CostItem[],
        materials: [] as CostItem[],
        equipment: [] as CostItem[],
        operational: [] as CostItem[],
        laborTotal: 0,
        materialsTotal: 0,
        equipmentTotal: 0,
        operationalTotal: 0,
        subtotal: 0,
        profitAmount: 0,
        netPrice: 0,
        ivaAmount: 0,
        totalPrice: 0,
      };
    }

    const laborParams = costParameters.filter((p) => p.category === "labor");
    const materialsParams = costParameters.filter((p) => p.category === "materials");
    const equipmentParams = costParameters.filter((p) => p.category === "equipment");
    const operationalParams = costParameters.filter((p) => p.category === "operational");

    // Define quantities based on service type
    const laborQuantities: Record<string, Record<string, number>> = {
      repair: {
        "Soldador Certificado AWS": 6 * durationDays,
        "Armador/Maestro": 1 * durationDays,
        "Ayudante": 2 * durationDays,
        "Supervisor": 2 * durationDays,
        "Técnico NDT": 3,
      },
      shielding: {
        "Soldador Certificado AWS": 6 * durationDays,
        "Armador/Maestro": 1 * durationDays,
        "Ayudante": 2 * durationDays,
        "Supervisor": 2 * durationDays,
        "Técnico NDT": 5,
      },
      reconstruction: {
        "Soldador Certificado AWS": 6 * durationDays,
        "Armador/Maestro": 1 * durationDays,
        "Ayudante": 2 * durationDays,
        "Supervisor": 2 * durationDays,
        "Técnico NDT": 8,
      },
    };

    const materialQuantities: Record<string, Record<string, number>> = {
      repair: {
        "Alambre ESAB Dual Shield II 110 (15kg)": 8,
        "Gas Mezcla 75%Ar/25%CO2 (50L)": 4,
        "Discos corte 7\"": 20,
        "Discos desbaste 7\"": 30,
      },
      shielding: {
        "Alambre ESAB Dual Shield II 110 (15kg)": 25,
        "Alambre ESAB Dual Shield II 80-Ni1 (15kg)": 15,
        "Plancha 450 Brinell": 1688,
        "Gas Mezcla 75%Ar/25%CO2 (50L)": 12,
        "Gas CO2 Industrial (50L)": 8,
        "Wear Button Laminite Ø90mm": 48,
        "Wear Button Laminite Ø40mm": 72,
        "Heel Shroud": 4,
        "Discos corte 7\"": 60,
        "Discos desbaste 7\"": 80,
        "Discos flap 7\"": 40,
      },
      reconstruction: {
        "Alambre ESAB Dual Shield II 110 (15kg)": 40,
        "Alambre ESAB Dual Shield II 80-Ni1 (15kg)": 20,
        "Plancha 450 Brinell": 1688,
        "Plancha S690Q": 3224,
        "Gas Mezcla 75%Ar/25%CO2 (50L)": 20,
        "Gas CO2 Industrial (50L)": 12,
        "Gas Propano (45kg)": 6,
        "Oxígeno Industrial (50L)": 8,
        "Wear Button Laminite Ø90mm": 48,
        "Wear Button Laminite Ø40mm": 72,
        "Heel Shroud": 4,
        "Discos corte 7\"": 100,
        "Discos desbaste 7\"": 120,
        "Discos flap 7\"": 60,
      },
    };

    const equipmentQuantities: Record<string, Record<string, number>> = {
      repair: {
        "Arriendo Máquina de Soldar": 6 * durationDays,
        "Arriendo Grúa Horquilla": 5,
        "Arriendo Equipo Oxicorte": durationDays,
        "Arriendo Equipo NDT": 3,
        "Herramientas Menores": 1,
      },
      shielding: {
        "Arriendo Máquina de Soldar": 6 * durationDays,
        "Arriendo Grúa Horquilla": 10,
        "Arriendo Equipo Oxicorte": durationDays,
        "Arriendo Equipo NDT": 5,
        "Herramientas Menores": 1,
      },
      reconstruction: {
        "Arriendo Máquina de Soldar": 6 * durationDays,
        "Arriendo Grúa Horquilla": 15,
        "Arriendo Equipo Oxicorte": durationDays,
        "Arriendo Generador Eléctrico": 20,
        "Arriendo Equipo NDT": 8,
        "Herramientas Menores": 1,
      },
    };

    const operationalQuantities: Record<string, Record<string, number>> = {
      repair: {
        "Hospedaje (persona/noche)": 12 * durationDays,
        "Alimentación (persona/día)": 12 * durationDays,
        "Transporte/Combustible": 1,
        "EPP y Seguridad": 1,
        "Movilización/Desmovilización": 1,
      },
      shielding: {
        "Hospedaje (persona/noche)": 12 * durationDays,
        "Alimentación (persona/día)": 12 * durationDays,
        "Transporte/Combustible": 1,
        "EPP y Seguridad": 1,
        "Movilización/Desmovilización": 1,
      },
      reconstruction: {
        "Hospedaje (persona/noche)": 12 * durationDays,
        "Alimentación (persona/día)": 12 * durationDays,
        "Transporte/Combustible": 1,
        "EPP y Seguridad": 1,
        "Movilización/Desmovilización": 1,
      },
    };

    const calculateItems = (params: CostParameter[], quantities: Record<string, number>): CostItem[] => {
      return params
        .filter((p) => quantities[p.name] !== undefined)
        .map((p) => ({
          name: p.name,
          quantity: quantities[p.name],
          unitCost: p.unitCost,
          total: quantities[p.name] * p.unitCost,
        }));
    };

    const laborItems = calculateItems(laborParams, laborQuantities[serviceType]);
    const materialsItems = calculateItems(materialsParams, materialQuantities[serviceType]);
    const equipmentItems = calculateItems(equipmentParams, equipmentQuantities[serviceType]);
    const operationalItems = calculateItems(operationalParams, operationalQuantities[serviceType]);

    const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);
    const materialsTotal = providers.materials ? materialsItems.reduce((sum, item) => sum + item.total, 0) : 0;
    const equipmentTotal = providers.equipment ? equipmentItems.reduce((sum, item) => sum + item.total, 0) : 0;
    const operationalTotal = providers.operational ? operationalItems.reduce((sum, item) => sum + item.total, 0) : 0;

    const subtotal = laborTotal + materialsTotal + equipmentTotal + operationalTotal;
    const profitAmount = Math.round(subtotal * (profitMargin / 100));
    const netPrice = subtotal + profitAmount;
    const ivaAmount = Math.round(netPrice * 0.19);
    const totalPrice = netPrice + ivaAmount;

    return {
      labor: laborItems,
      materials: materialsItems,
      equipment: equipmentItems,
      operational: operationalItems,
      laborTotal,
      materialsTotal,
      equipmentTotal,
      operationalTotal,
      subtotal,
      profitAmount,
      netPrice,
      ivaAmount,
      totalPrice,
    };
  }, [costParameters, serviceType, durationDays, providers, profitMargin]);

  const handleSubmit = () => {
    if (!clientData.clientName) {
      toast.error("Por favor ingrese el nombre del cliente");
      return;
    }

    createMutation.mutate({
      ...clientData,
      ...equipmentData,
      serviceType,
      durationDays,
      materialsProvider: providers.materials ? "forgemine" : "client",
      equipmentProvider: providers.equipment ? "forgemine" : "client",
      operationalProvider: providers.operational ? "forgemine" : "client",
      laborCost: costs.laborTotal,
      materialsCost: costs.materialsTotal,
      equipmentCost: costs.equipmentTotal,
      operationalCost: costs.operationalTotal,
      subtotalCost: costs.subtotal,
      profitMargin,
      profitAmount: costs.profitAmount,
      netPrice: costs.netPrice,
      ivaAmount: costs.ivaAmount,
      totalPrice: costs.totalPrice,
      costBreakdown: {
        labor: costs.labor,
        materials: costs.materials,
        equipment: costs.equipment,
        operational: costs.operational,
      },
      additionalNotes: additionalNotes || undefined,
    });
  };

  if (loadingParams) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/cotizaciones")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nueva Cotización</h1>
            <p className="text-muted-foreground mt-1">
              N° {nextNumber || "Cargando..."}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Razón Social *</Label>
                  <Input
                    value={clientData.clientName}
                    onChange={(e) => setClientData({ ...clientData, clientName: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>RUT</Label>
                  <Input
                    value={clientData.clientRut}
                    onChange={(e) => setClientData({ ...clientData, clientRut: e.target.value })}
                    placeholder="12.345.678-9"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={clientData.clientAddress}
                    onChange={(e) => setClientData({ ...clientData, clientAddress: e.target.value })}
                    placeholder="Dirección completa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ciudad</Label>
                  <Input
                    value={clientData.clientCity}
                    onChange={(e) => setClientData({ ...clientData, clientCity: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contacto</Label>
                  <Input
                    value={clientData.clientContact}
                    onChange={(e) => setClientData({ ...clientData, clientContact: e.target.value })}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={clientData.clientPhone}
                    onChange={(e) => setClientData({ ...clientData, clientPhone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientData.clientEmail}
                    onChange={(e) => setClientData({ ...clientData, clientEmail: e.target.value })}
                    placeholder="email@empresa.cl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Equipment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Equipo</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo de Equipo</Label>
                  <Input
                    value={equipmentData.equipmentType}
                    onChange={(e) => setEquipmentData({ ...equipmentData, equipmentType: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Marca</Label>
                  <Select
                    value={equipmentData.equipmentBrand}
                    onValueChange={(value) => setEquipmentData({ 
                      ...equipmentData, 
                      equipmentBrand: value,
                      equipmentModel: equipmentModels[value]?.[0] || ""
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Modelo</Label>
                  <Select
                    value={equipmentData.equipmentModel}
                    onValueChange={(value) => setEquipmentData({ ...equipmentData, equipmentModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(equipmentModels[equipmentData.equipmentBrand] || []).map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>N° de Serie</Label>
                  <Input
                    value={equipmentData.equipmentSerial}
                    onChange={(e) => setEquipmentData({ ...equipmentData, equipmentSerial: e.target.value })}
                    placeholder="Número de serie"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Capacidad</Label>
                  <Input
                    value={equipmentData.equipmentCapacity}
                    onChange={(e) => setEquipmentData({ ...equipmentData, equipmentCapacity: e.target.value })}
                    placeholder="Ej: 42 m³"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ubicación</Label>
                  <Input
                    value={equipmentData.equipmentLocation}
                    onChange={(e) => setEquipmentData({ ...equipmentData, equipmentLocation: e.target.value })}
                    placeholder="Faena o ubicación"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Servicio</Label>
                    <Select
                      value={serviceType}
                      onValueChange={(value: "repair" | "shielding" | "reconstruction") => setServiceType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Reparación Menor</SelectItem>
                        <SelectItem value="shielding">Blindaje Heavy Duty</SelectItem>
                        <SelectItem value="reconstruction">Reconstrucción Total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Duración (días)</Label>
                    <Input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">¿Quién aporta?</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Indique si FORGEMINE o el CLIENTE aporta cada categoría
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Materiales y Consumibles</Label>
                        <p className="text-sm text-muted-foreground">Alambre, planchas, gases, discos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={!providers.materials ? "text-primary font-medium" : "text-muted-foreground"}>Cliente</span>
                        <Switch
                          checked={providers.materials}
                          onCheckedChange={(checked) => setProviders({ ...providers, materials: checked })}
                        />
                        <span className={providers.materials ? "text-primary font-medium" : "text-muted-foreground"}>FORGEMINE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Equipos y Arriendos</Label>
                        <p className="text-sm text-muted-foreground">Máquinas de soldar, grúa, generador</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={!providers.equipment ? "text-primary font-medium" : "text-muted-foreground"}>Cliente</span>
                        <Switch
                          checked={providers.equipment}
                          onCheckedChange={(checked) => setProviders({ ...providers, equipment: checked })}
                        />
                        <span className={providers.equipment ? "text-primary font-medium" : "text-muted-foreground"}>FORGEMINE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Gastos Operacionales</Label>
                        <p className="text-sm text-muted-foreground">Hospedaje, alimentación, transporte</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={!providers.operational ? "text-primary font-medium" : "text-muted-foreground"}>Cliente</span>
                        <Switch
                          checked={providers.operational}
                          onCheckedChange={(checked) => setProviders({ ...providers, operational: checked })}
                        />
                        <span className={providers.operational ? "text-primary font-medium" : "text-muted-foreground"}>FORGEMINE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label>Margen de Ganancia (%)</Label>
                  <Input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Notas Adicionales</Label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Observaciones o condiciones especiales"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Resumen de Costos
                </CardTitle>
                <CardDescription>
                  {serviceConfigs[serviceType].label} - {durationDays} días
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mano de Obra</span>
                    <span className="font-mono">{formatCurrency(costs.laborTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Materiales {!providers.materials && "(Cliente)"}</span>
                    <span className="font-mono">{formatCurrency(costs.materialsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equipos {!providers.equipment && "(Cliente)"}</span>
                    <span className="font-mono">{formatCurrency(costs.equipmentTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Operacionales {!providers.operational && "(Cliente)"}</span>
                    <span className="font-mono">{formatCurrency(costs.operationalTotal)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal Costo</span>
                    <span className="font-mono">{formatCurrency(costs.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Margen ({profitMargin}%)</span>
                    <span className="font-mono">+{formatCurrency(costs.profitAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Precio Neto</span>
                    <span className="font-mono">{formatCurrency(costs.netPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (19%)</span>
                    <span className="font-mono">{formatCurrency(costs.ivaAmount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span className="font-mono text-primary">{formatCurrency(costs.totalPrice)}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Guardando..." : "Guardar Cotización"}
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Generar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
