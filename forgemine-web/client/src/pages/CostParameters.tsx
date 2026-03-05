import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, Database, DollarSign, Wrench, Truck, Users } from "lucide-react";

type CostParameter = {
  id: number;
  category: string;
  name: string;
  description: string | null;
  unitCost: number;
  unit: string;
  supplier: string | null;
  isActive: "yes" | "no";
};

const categoryIcons: Record<string, React.ReactNode> = {
  labor: <Users className="w-5 h-5" />,
  materials: <Wrench className="w-5 h-5" />,
  equipment: <Truck className="w-5 h-5" />,
  operational: <DollarSign className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  labor: "Mano de Obra",
  materials: "Materiales",
  equipment: "Equipos y Arriendos",
  operational: "Gastos Operacionales",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function CostParameters() {
  const [activeTab, setActiveTab] = useState("labor");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<CostParameter | null>(null);
  const [formData, setFormData] = useState({
    category: "labor",
    name: "",
    description: "",
    unitCost: 0,
    unit: "",
    supplier: "",
  });

  const { data: parameters, isLoading, refetch } = trpc.costParameters.list.useQuery();
  const createMutation = trpc.costParameters.create.useMutation({
    onSuccess: () => {
      toast.success("Parámetro creado correctamente");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const updateMutation = trpc.costParameters.update.useMutation({
    onSuccess: () => {
      toast.success("Parámetro actualizado correctamente");
      setIsEditDialogOpen(false);
      setEditingParam(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const deleteMutation = trpc.costParameters.delete.useMutation({
    onSuccess: () => {
      toast.success("Parámetro eliminado correctamente");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  const seedMutation = trpc.costParameters.seedDefaults.useMutation({
    onSuccess: () => {
      toast.success("Parámetros por defecto cargados correctamente");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      category: activeTab,
      name: "",
      description: "",
      unitCost: 0,
      unit: "",
      supplier: "",
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.unit || formData.unitCost <= 0) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }
    createMutation.mutate({
      category: formData.category,
      name: formData.name,
      description: formData.description || undefined,
      unitCost: formData.unitCost,
      unit: formData.unit,
      supplier: formData.supplier || undefined,
    });
  };

  const handleEdit = (param: CostParameter) => {
    setEditingParam(param);
    setFormData({
      category: param.category,
      name: param.name,
      description: param.description || "",
      unitCost: param.unitCost,
      unit: param.unit,
      supplier: param.supplier || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingParam) return;
    updateMutation.mutate({
      id: editingParam.id,
      name: formData.name,
      description: formData.description || undefined,
      unitCost: formData.unitCost,
      unit: formData.unit,
      supplier: formData.supplier || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de eliminar este parámetro?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredParams = parameters?.filter((p) => p.category === activeTab) || [];

  const getCategoryTotal = (category: string) => {
    return parameters?.filter((p) => p.category === category).length || 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parámetros de Costos</h1>
            <p className="text-muted-foreground mt-1">
              Configure los costos base para generar cotizaciones
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              <Database className="w-4 h-4 mr-2" />
              Cargar Valores por Defecto
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Card key={key} className={activeTab === key ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  {categoryIcons[key]}
                  {label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryTotal(key)}</div>
                <p className="text-xs text-muted-foreground">parámetros</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Configuración de Costos</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setFormData(prev => ({ ...prev, category: activeTab })); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Parámetro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Parámetro</DialogTitle>
                    <DialogDescription>
                      Ingrese los datos del nuevo parámetro de costo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Nombre *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Soldador Certificado AWS"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción opcional"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Costo Unitario (CLP) *</Label>
                        <Input
                          type="number"
                          value={formData.unitCost}
                          onChange={(e) => setFormData({ ...formData, unitCost: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Unidad *</Label>
                        <Input
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          placeholder="Ej: día, kg, unidad"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Proveedor</Label>
                      <Input
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Nombre del proveedor"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAdd} disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                    {categoryIcons[key]}
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(categoryLabels).map((category) => (
                <TabsContent key={category} value={category}>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredParams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay parámetros configurados en esta categoría.</p>
                      <p className="text-sm mt-2">
                        Haga clic en "Cargar Valores por Defecto" para iniciar con valores predeterminados.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Costo Unitario</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParams.map((param) => (
                          <TableRow key={param.id}>
                            <TableCell className="font-medium">{param.name}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {param.description || "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(param.unitCost)}
                            </TableCell>
                            <TableCell>{param.unit}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {param.supplier || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(param)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(param.id)}
                                  className="text-destructive hover:text-destructive"
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
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Parámetro</DialogTitle>
              <DialogDescription>
                Modifique los datos del parámetro de costo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Costo Unitario (CLP) *</Label>
                  <Input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unidad *</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Proveedor</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
