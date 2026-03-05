import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { compressImage, formatFileSize as formatSize, type CompressionResult } from "@/lib/imageCompression";
import { 
  FileText, 
  Truck, 
  Wrench, 
  Shield, 
  Settings, 
  MapPin,
  Calendar,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  User,
  Image,
  X,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trackConversion, getUTMForSubmission } from "@/lib/tracking";

// Equipment brands and models
const equipmentData = {
  "Komatsu": {
    "Palas Hidráulicas": ["PC3000", "PC4000", "PC5500", "PC7000", "PC8000"],
    "Cargadores Frontales": ["WA800", "WA900", "WA1200", "WE1350", "WE1850", "WE2350"]
  },
  "Caterpillar": {
    "Palas Hidráulicas": ["6030", "6040", "6050", "6060"],
    "Cargadores Frontales": ["992K", "993K", "994K"]
  },
  "Liebherr": {
    "Palas Hidráulicas": ["R9100", "R9150", "R9200", "R9250", "R9350", "R9400", "R9800"],
    "Cargadores Frontales": ["L566", "L580", "L586"]
  },
  "Hitachi": {
    "Palas Hidráulicas": ["EX1200", "EX1900", "EX2500", "EX3600", "EX5600", "EX8000"],
    "Cargadores Frontales": ["ZW310", "ZW370"]
  },
  "P&H": {
    "Palas Eléctricas": ["2800XPC", "4100XPC", "4800XPC"]
  },
  "Bucyrus": {
    "Palas Eléctricas": ["495HR", "495HF"]
  }
};

const services = [
  { id: "fisuras", label: "Reparación de Fisuras", icon: Wrench },
  { id: "blindaje", label: "Blindaje Heavy Duty", icon: Shield },
  { id: "reconstruccion", label: "Reconstrucción Total", icon: Settings },
  { id: "terreno", label: "Servicio en Terreno", icon: Truck },
  { id: "inspeccion", label: "Inspección y Diagnóstico", icon: FileText },
];

const urgencyOptions = [
  { value: "normal", label: "Normal (30-45 días)", color: "text-green-500" },
  { value: "prioritario", label: "Prioritario (15-20 días)", color: "text-yellow-500" },
  { value: "urgente", label: "Urgente (7-10 días)", color: "text-orange-500" },
  { value: "emergencia", label: "Emergencia (24-72 hrs)", color: "text-red-500" },
];

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
  originalSize: string;
  compressed: boolean;
  compressionRatio: number;
  compressedData?: CompressionResult;
}

interface FormData {
  // Step 1: Contact Info
  contactName: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  
  // Step 2: Equipment Info
  brand: string;
  equipmentType: string;
  model: string;
  serialNumber: string;
  hoursOperation: string;
  
  // Step 3: Service Details
  selectedServices: string[];
  problemDescription: string;
  urgency: string;
  preferredDate: string;
  location: string;
  
  // Step 4: Additional Info
  additionalNotes: string;
  howDidYouHear: string;
}

const initialFormData: FormData = {
  contactName: "",
  company: "",
  email: "",
  phone: "",
  position: "",
  brand: "",
  equipmentType: "",
  model: "",
  serialNumber: "",
  hoursOperation: "",
  selectedServices: [],
  problemDescription: "",
  urgency: "normal",
  preferredDate: "",
  location: "",
  additionalNotes: "",
  howDidYouHear: "",
};

export default function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
  const maxImages = 10;
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const updateFormData = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(s => s !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const getAvailableTypes = () => {
    if (!formData.brand) return [];
    return Object.keys(equipmentData[formData.brand as keyof typeof equipmentData] || {});
  };

  const getAvailableModels = () => {
    if (!formData.brand || !formData.equipmentType) return [];
    const brandData = equipmentData[formData.brand as keyof typeof equipmentData];
    if (!brandData) return [];
    return brandData[formData.equipmentType as keyof typeof brandData] || [];
  };

  // Image upload functions
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // State for compression progress
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState("");

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - uploadedImages.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`Solo puede subir ${remainingSlots} imagen(es) más. Máximo ${maxImages} imágenes.`);
      return;
    }

    // Filter valid image files first
    const validImageFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" no es una imagen válida`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`"${file.name}" excede el tamaño máximo de 10MB`);
        return false;
      }
      return true;
    });

    if (validImageFiles.length === 0) return;

    setIsCompressing(true);
    const processedImages: UploadedImage[] = [];

    for (let i = 0; i < validImageFiles.length; i++) {
      const file = validImageFiles[i];
      setCompressionProgress(`Comprimiendo ${i + 1}/${validImageFiles.length}: ${file.name}`);

      try {
        // Compress the image
        const compressionResult = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          maxSizeMB: 2,
        });

        // Create preview from compressed blob
        const preview = URL.createObjectURL(compressionResult.blob);
        
        processedImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file: new File([compressionResult.blob], file.name, { type: file.type }),
          preview,
          name: file.name,
          size: formatFileSize(compressionResult.compressedSize),
          originalSize: formatFileSize(compressionResult.originalSize),
          compressed: compressionResult.compressionRatio > 0,
          compressionRatio: Math.round(compressionResult.compressionRatio),
          compressedData: compressionResult,
        });
      } catch (error) {
        console.error(`Error compressing ${file.name}:`, error);
        // If compression fails, use original file
        const preview = URL.createObjectURL(file);
        processedImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name,
          size: formatFileSize(file.size),
          originalSize: formatFileSize(file.size),
          compressed: false,
          compressionRatio: 0,
        });
      }
    }

    setIsCompressing(false);
    setCompressionProgress("");

    if (processedImages.length > 0) {
      setUploadedImages(prev => [...prev, ...processedImages]);
      
      // Calculate total savings
      const totalOriginal = processedImages.reduce((sum, img) => sum + (img.compressedData?.originalSize || 0), 0);
      const totalCompressed = processedImages.reduce((sum, img) => sum + (img.compressedData?.compressedSize || 0), 0);
      const totalSavings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;
      
      if (totalSavings > 0) {
        toast.success(`${processedImages.length} imagen(es) agregada(s). Ahorro: ${totalSavings}% (${formatFileSize(totalOriginal - totalCompressed)})`);
      } else {
        toast.success(`${processedImages.length} imagen(es) agregada(s)`);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
    toast.success("Imagen eliminada");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.contactName && formData.company && formData.email && formData.phone);
      case 2:
        return !!(formData.brand && formData.equipmentType && formData.model);
      case 3:
        return !!(formData.selectedServices.length > 0 && formData.problemDescription && formData.location);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Por favor complete todos los campos requeridos");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Función para generar el mensaje de WhatsApp
  const generateWhatsAppMessage = (): string => {
    const selectedServiceNames = formData.selectedServices
      .map(id => services.find(s => s.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    
    const urgencyLabel = urgencyOptions.find(u => u.value === formData.urgency)?.label || formData.urgency;
    
    const message = `
📩 *SOLICITUD DE COTIZACIÓN - FORGEMINE CHILE*

👤 *DATOS DE CONTACTO*
• Nombre: ${formData.contactName}
• Empresa: ${formData.company}
• Email: ${formData.email}
• Teléfono: ${formData.phone}
${formData.position ? `• Cargo: ${formData.position}` : ""}

🚜 *INFORMACIÓN DEL EQUIPO*
• Marca: ${formData.brand}
• Tipo: ${formData.equipmentType}
• Modelo: ${formData.model}
${formData.serialNumber ? `• Nº Serie: ${formData.serialNumber}` : ""}
${formData.hoursOperation ? `• Horas operación: ${formData.hoursOperation}` : ""}

🛠️ *SERVICIOS REQUERIDOS*
${selectedServiceNames}

📝 *DESCRIPCIÓN DEL PROBLEMA*
${formData.problemDescription}

⏰ *URGENCIA*: ${urgencyLabel}
📍 *UBICACIÓN*: ${formData.location}
${formData.preferredDate ? `📅 *Fecha preferida*: ${formData.preferredDate}` : ""}
${formData.additionalNotes ? `
💬 *NOTAS ADICIONALES*
${formData.additionalNotes}` : ""}
${uploadedImages.length > 0 ? `
📷 *Imágenes adjuntas*: ${uploadedImages.length} foto(s)` : ""}

---
_Enviado desde formulario web FORGEMINE_
    `.trim();
    
    return encodeURIComponent(message);
  };

  // tRPC mutation for creating quotes
  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: (data) => {
      console.log("Quote saved with ID:", data.quoteId);
    },
    onError: (error) => {
      console.error("Error saving quote:", error);
    },
  });

  // tRPC mutation for uploading images to S3
  const uploadImagesMutation = trpc.storage.uploadMultipleImages.useMutation({
    onSuccess: (data) => {
      console.log("Images uploaded:", data.uploaded.length);
      if (data.failed.length > 0) {
        console.warn("Failed to upload:", data.failed);
      }
    },
    onError: (error) => {
      console.error("Error uploading images:", error);
    },
  });

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // State for tracking upload progress
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress("");
    
    // Track form submission conversion event
    trackConversion({
      event_name: 'quote_form_submit',
      event_category: 'lead_generation',
      event_label: formData.selectedServices.join(', '),
      event_value: 1,
    });
    
    try {
      // Map urgency value to match backend enum
      const urgencyMap: Record<string, "normal" | "priority" | "urgent" | "emergency"> = {
        "normal": "normal",
        "prioritario": "priority",
        "urgente": "urgent",
        "emergencia": "emergency",
      };
      
      // Get service labels instead of IDs
      const selectedServiceLabels = formData.selectedServices
        .map(id => services.find(s => s.id === id)?.label)
        .filter((label): label is string => Boolean(label));
      
      // Upload images to S3 if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        setUploadProgress(`Subiendo ${uploadedImages.length} imagen(es) comprimida(s) a la nube...`);
        
        try {
          // Use pre-compressed data if available, otherwise convert to base64
          const imageDataPromises = uploadedImages.map(async (img) => {
            // If we have compressed data, use it directly
            if (img.compressedData?.base64) {
              return {
                fileName: img.name,
                fileData: img.compressedData.base64,
                contentType: img.file.type || "image/jpeg",
              };
            }
            // Fallback to converting file to base64
            return {
              fileName: img.name,
              fileData: await fileToBase64(img.file),
              contentType: img.file.type || "image/jpeg",
            };
          });
          
          const imageData = await Promise.all(imageDataPromises);
          
          // Upload to S3
          const uploadResult = await uploadImagesMutation.mutateAsync({
            images: imageData,
          });
          
          // Get the URLs of successfully uploaded images
          imageUrls = uploadResult.uploaded.map(img => img.url);
          
          if (uploadResult.failed.length > 0) {
            toast.warning(`${uploadResult.failed.length} imagen(es) no se pudieron subir`);
          }
          
          // Calculate total savings for the toast message
          const totalOriginal = uploadedImages.reduce((sum, img) => sum + (img.compressedData?.originalSize || 0), 0);
          const totalCompressed = uploadedImages.reduce((sum, img) => sum + (img.compressedData?.compressedSize || 0), 0);
          const savedBytes = totalOriginal - totalCompressed;
          
          if (savedBytes > 0) {
            setUploadProgress(`${imageUrls.length} imagen(es) subida(s). Ahorro: ${formatFileSize(savedBytes)}`);
          } else {
            setUploadProgress(`${imageUrls.length} imagen(es) subida(s) correctamente`);
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          toast.warning("Las imágenes no se pudieron subir, pero la cotización se guardará");
        }
      }
      
      setUploadProgress("Guardando cotización...");
      
      // Save to database with S3 URLs
      await createQuoteMutation.mutateAsync({
        contactName: formData.contactName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        position: formData.position || undefined,
        brand: formData.brand,
        equipmentType: formData.equipmentType,
        model: formData.model,
        serialNumber: formData.serialNumber || undefined,
        hoursOperation: formData.hoursOperation || undefined,
        selectedServices: selectedServiceLabels,
        problemDescription: formData.problemDescription,
        urgency: urgencyMap[formData.urgency] || "normal",
        location: formData.location,
        preferredDate: formData.preferredDate || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      
      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappNumber = "56992779872"; // +56 9 9277 9872 sin espacios ni símbolos
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
      
      // Track WhatsApp click conversion
      trackConversion({
        event_name: 'whatsapp_click',
        event_category: 'lead_generation',
        event_label: 'quote_form_whatsapp',
        event_value: 1,
      });
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, "_blank");
      
      setIsSubmitted(true);
      toast.success("¡Cotización guardada y redirigiendo a WhatsApp!");
    } catch (error) {
      console.error("Error submitting quote:", error);
      // Even if database save fails, still open WhatsApp
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappNumber = "56992779872";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
      window.open(whatsappUrl, "_blank");
      
      setIsSubmitted(true);
      toast.warning("Redirigiendo a WhatsApp. La cotización se enviará manualmente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    // Clean up image previews
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">
          ¡Cotización Lista para Enviar!
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Se ha abierto WhatsApp con su solicitud de cotización. Por favor presione <strong>"Enviar"</strong> en WhatsApp 
          para completar el envío. Si tiene imágenes, puede adjuntarlas directamente en la conversación.
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-2">Resumen de su solicitud:</p>
          <p className="text-foreground"><strong>Equipo:</strong> {formData.brand} {formData.model}</p>
          <p className="text-foreground"><strong>Servicios:</strong> {formData.selectedServices.length} seleccionados</p>
          <p className="text-foreground"><strong>Imágenes:</strong> {uploadedImages.length} adjuntadas</p>
          <p className="text-foreground"><strong>Urgencia:</strong> {urgencyOptions.find(u => u.value === formData.urgency)?.label}</p>
        </div>
        <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
          Enviar Otra Cotización
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-secondary/30 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Solicitar Cotización</h3>
          <span className="text-sm text-muted-foreground">Paso {currentStep} de {totalSteps}</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Contacto</span>
          <span>Equipo</span>
          <span>Servicio</span>
          <span>Confirmar</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold text-foreground">Información de Contacto</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nombre Completo *</Label>
                  <Input
                    id="contactName"
                    placeholder="Juan Pérez"
                    value={formData.contactName}
                    onChange={(e) => updateFormData("contactName", e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    placeholder="Jefe de Mantenimiento"
                    value={formData.position}
                    onChange={(e) => updateFormData("position", e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa / Faena *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Minera Ejemplo S.A."
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    className="bg-secondary/50 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@empresa.cl"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="bg-secondary/50 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+56 9 1234 5678"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="bg-secondary/50 pl-10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Equipment Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold text-foreground">Información del Equipo</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marca del Equipo *</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => {
                      updateFormData("brand", value);
                      updateFormData("equipmentType", "");
                      updateFormData("model", "");
                    }}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Seleccione marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(equipmentData).map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Equipo *</Label>
                  <Select
                    value={formData.equipmentType}
                    onValueChange={(value) => {
                      updateFormData("equipmentType", value);
                      updateFormData("model", "");
                    }}
                    disabled={!formData.brand}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTypes().map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modelo *</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => updateFormData("model", value)}
                    disabled={!formData.equipmentType}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Seleccione modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableModels().map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Serie</Label>
                  <Input
                    id="serialNumber"
                    placeholder="Ej: 12345"
                    value={formData.serialNumber}
                    onChange={(e) => updateFormData("serialNumber", e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursOperation">Horas de Operación</Label>
                <Input
                  id="hoursOperation"
                  placeholder="Ej: 25,000 hrs"
                  value={formData.hoursOperation}
                  onChange={(e) => updateFormData("hoursOperation", e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              {formData.brand && formData.model && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-primary">
                    <strong>Equipo seleccionado:</strong> {formData.brand} {formData.model}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Service Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <Wrench className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold text-foreground">Detalles del Servicio</h4>
              </div>

              <div className="space-y-2">
                <Label>Servicios Requeridos *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    const isSelected = formData.selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{service.label}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemDescription">Descripción del Problema *</Label>
                <Textarea
                  id="problemDescription"
                  placeholder="Describa el estado actual del balde, tipo de daños, fisuras detectadas, zonas afectadas, etc."
                  value={formData.problemDescription}
                  onChange={(e) => updateFormData("problemDescription", e.target.value)}
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Fotos del Balde Dañado
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {uploadedImages.length}/{maxImages} imágenes
                  </span>
                </div>
                
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-secondary/30"
                  } ${uploadedImages.length >= maxImages ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadedImages.length >= maxImages}
                  />
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDragging ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isDragging ? "Suelte las imágenes aquí" : "Arrastre imágenes o haga clic para seleccionar"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WEBP • Máx. 10MB por imagen • Hasta {maxImages} imágenes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-primary">{compressionProgress}</span>
                  </div>
                )}

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {uploadedImages.map((image) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30"
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Compression badge */}
                        {image.compressed && image.compressionRatio > 0 && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500/90 text-white text-[10px] font-medium rounded">
                            -{image.compressionRatio}%
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                          <p className="text-xs text-white text-center truncate w-full">{image.name}</p>
                          <p className="text-xs text-white/70">{image.size}</p>
                          {image.compressed && (
                            <p className="text-[10px] text-green-400 mt-1">
                              Original: {image.originalSize}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Incluya fotos de las fisuras, zonas de desgaste, labio, laterales y cualquier área dañada para una evaluación más precisa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Urgencia del Trabajo</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => updateFormData("urgency", value)}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className={option.color}>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Fecha Preferida de Inicio</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => updateFormData("preferredDate", e.target.value)}
                      className="bg-secondary/50 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación del Equipo *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Ej: Faena Escondida, Antofagasta"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    className="bg-secondary/50 pl-10"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold text-foreground">Confirmar Solicitud</h4>
              </div>

              {/* Summary */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contacto</p>
                    <p className="text-foreground font-medium">{formData.contactName}</p>
                    <p className="text-muted-foreground text-xs">{formData.company}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Equipo</p>
                    <p className="text-foreground font-medium">{formData.brand} {formData.model}</p>
                    <p className="text-muted-foreground text-xs">{formData.equipmentType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Servicios</p>
                    <p className="text-foreground font-medium">
                      {formData.selectedServices.map(s => 
                        services.find(srv => srv.id === s)?.label
                      ).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ubicación</p>
                    <p className="text-foreground font-medium">{formData.location}</p>
                  </div>
                </div>

                {/* Image Summary */}
                {uploadedImages.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {uploadedImages.length} imagen(es) adjuntada(s)
                      </p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {uploadedImages.map((image) => (
                        <img
                          key={image.id}
                          src={image.preview}
                          alt={image.name}
                          className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Notas Adicionales</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Información adicional que considere relevante..."
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData("additionalNotes", e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>¿Cómo nos conoció?</Label>
                <Select
                  value={formData.howDidYouHear}
                  onValueChange={(value) => updateFormData("howDidYouHear", value)}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Búsqueda en Google</SelectItem>
                    <SelectItem value="referido">Referido por cliente</SelectItem>
                    <SelectItem value="redes">Redes Sociales</SelectItem>
                    <SelectItem value="feria">Feria o Evento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-foreground font-medium">Tiempo de Respuesta</p>
                  <p className="text-muted-foreground">
                    Nuestro equipo técnico revisará su solicitud y le contactará dentro de las 
                    próximas 24 horas hábiles con una cotización detallada.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep} className="gap-2 bg-primary hover:bg-primary/90">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Enviar Cotización
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
