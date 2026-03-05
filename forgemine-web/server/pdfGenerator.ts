// PDF Generator for Quotations
// This file generates HTML content for quotation PDFs

type CostItem = {
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
};

type CostBreakdown = {
  labor: CostItem[];
  materials: CostItem[];
  equipment: CostItem[];
  operational: CostItem[];
};

type GeneratedQuotation = {
  id: number;
  quotationNumber: string;
  clientName: string;
  clientRut: string | null;
  clientAddress: string | null;
  clientCity: string | null;
  clientContact: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  equipmentType: string;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentSerial: string | null;
  equipmentCapacity: string | null;
  equipmentLocation: string | null;
  serviceType: "repair" | "shielding" | "reconstruction";
  durationDays: number;
  materialsProvider: "forgemine" | "client";
  equipmentProvider: "forgemine" | "client";
  operationalProvider: "forgemine" | "client";
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
  costBreakdown: CostBreakdown | null;
  validityDays: number;
  paymentTerms: string | null;
  warrantyTerms: string | null;
  additionalNotes: string | null;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdAt: Date;
};

const serviceLabels: Record<string, string> = {
  repair: "Reparación Menor",
  shielding: "Blindaje Heavy Duty",
  reconstruction: "Reconstrucción Total",
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
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function generateCostTable(items: CostItem[], title: string, profitMargin: number): string {
  if (!items || items.length === 0) return "";
  
  const marginMultiplier = 1 + (profitMargin / 100);
  
  const rows = items.map(item => {
    const unitCostWithMargin = Math.round(item.unitCost * marginMultiplier);
    const totalWithMargin = Math.round(item.total * marginMultiplier);
    return `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace;">${formatCurrency(unitCostWithMargin)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace;">${formatCurrency(totalWithMargin)}</td>
    </tr>
  `;
  }).join("");

  const total = items.reduce((sum, item) => sum + Math.round(item.total * marginMultiplier), 0);

  return `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f97316;">${title}</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 8px; text-align: left; font-weight: 600;">Descripción</th>
            <th style="padding: 8px; text-align: center; font-weight: 600;">Cantidad</th>
            <th style="padding: 8px; text-align: right; font-weight: 600;">P. Unitario</th>
            <th style="padding: 8px; text-align: right; font-weight: 600;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background-color: #f9fafb; font-weight: 600;">
            <td colspan="3" style="padding: 8px; text-align: right;">Subtotal ${title}:</td>
            <td style="padding: 8px; text-align: right; font-family: monospace;">${formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export function generateQuotationPdfHtml(quotation: GeneratedQuotation): string {
  const costBreakdown = quotation.costBreakdown as CostBreakdown | null;
  
  const validUntil = new Date(quotation.createdAt);
  validUntil.setDate(validUntil.getDate() + quotation.validityDays);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización ${quotation.quotationNumber} - FORGEMINE CHILE SpA</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1f2937;
      margin: 0;
      padding: 20px;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f97316;">
    <div>
      <h1 style="font-size: 28px; font-weight: 700; color: #f97316; margin: 0;">FORGEMINE</h1>
      <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">CHILE SpA</p>
      <p style="font-size: 10px; color: #9ca3af; margin: 2px 0 0 0;">Especialistas en Reparación de Baldes Mineros</p>
    </div>
    <div style="text-align: right;">
      <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0;">COTIZACIÓN DE SERVICIOS</h2>
      <p style="font-size: 16px; font-weight: 700; color: #f97316; margin: 8px 0 0 0;">N° ${quotation.quotationNumber}</p>
      <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">Fecha: ${formatDate(quotation.createdAt)}</p>
      <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;">Válida hasta: ${formatDate(validUntil)}</p>
    </div>
  </div>

  <!-- Client and Equipment Info -->
  <div style="display: flex; gap: 24px; margin-bottom: 30px;">
    <!-- Client Info -->
    <div style="flex: 1; background-color: #f9fafb; padding: 16px; border-radius: 8px;">
      <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f97316;">DATOS DEL CLIENTE</h3>
      <table style="font-size: 12px;">
        <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Razón Social:</td><td style="font-weight: 500;">${quotation.clientName}</td></tr>
        ${quotation.clientRut ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">RUT:</td><td>${quotation.clientRut}</td></tr>` : ""}
        ${quotation.clientAddress ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Dirección:</td><td>${quotation.clientAddress}</td></tr>` : ""}
        ${quotation.clientCity ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Ciudad:</td><td>${quotation.clientCity}</td></tr>` : ""}
        ${quotation.clientContact ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Contacto:</td><td>${quotation.clientContact}</td></tr>` : ""}
        ${quotation.clientPhone ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Teléfono:</td><td>${quotation.clientPhone}</td></tr>` : ""}
        ${quotation.clientEmail ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Email:</td><td>${quotation.clientEmail}</td></tr>` : ""}
      </table>
    </div>
    <!-- Equipment Info -->
    <div style="flex: 1; background-color: #f9fafb; padding: 16px; border-radius: 8px;">
      <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f97316;">DATOS DEL EQUIPO</h3>
      <table style="font-size: 12px;">
        <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Tipo:</td><td style="font-weight: 500;">${quotation.equipmentType}</td></tr>
        <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Marca:</td><td>${quotation.equipmentBrand}</td></tr>
        <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Modelo:</td><td style="font-weight: 600; color: #f97316;">${quotation.equipmentModel}</td></tr>
        ${quotation.equipmentSerial ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">N° Serie:</td><td>${quotation.equipmentSerial}</td></tr>` : ""}
        ${quotation.equipmentCapacity ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Capacidad:</td><td>${quotation.equipmentCapacity}</td></tr>` : ""}
        ${quotation.equipmentLocation ? `<tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Ubicación:</td><td>${quotation.equipmentLocation}</td></tr>` : ""}
      </table>
    </div>
  </div>

  <!-- Service Info -->
  <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f97316;">
    <h3 style="font-size: 16px; font-weight: 600; color: #92400e; margin: 0 0 8px 0;">SERVICIO: ${serviceLabels[quotation.serviceType]}</h3>
    <p style="font-size: 12px; color: #78350f; margin: 0;">
      Duración estimada: <strong>${quotation.durationDays} días</strong> | 
      Materiales: <strong>${quotation.materialsProvider === "forgemine" ? "FORGEMINE" : "CLIENTE"}</strong> | 
      Equipos: <strong>${quotation.equipmentProvider === "forgemine" ? "FORGEMINE" : "CLIENTE"}</strong> | 
      Operacionales: <strong>${quotation.operationalProvider === "forgemine" ? "FORGEMINE" : "CLIENTE"}</strong>
    </p>
  </div>

  <!-- Cost Breakdown -->
  ${costBreakdown ? `
    ${generateCostTable(costBreakdown.labor, "MANO DE OBRA", quotation.profitMargin)}
    ${quotation.materialsProvider === "forgemine" ? generateCostTable(costBreakdown.materials, "MATERIALES Y CONSUMIBLES", quotation.profitMargin) : ""}
    ${quotation.equipmentProvider === "forgemine" ? generateCostTable(costBreakdown.equipment, "EQUIPOS Y ARRIENDOS", quotation.profitMargin) : ""}
    ${quotation.operationalProvider === "forgemine" ? generateCostTable(costBreakdown.operational, "GASTOS OPERACIONALES", quotation.profitMargin) : ""}
  ` : ""}

  <!-- Totals -->
  <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-top: 30px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-weight: 600;">Precio Neto:</span>
      <span style="font-family: monospace; font-weight: 600;">${formatCurrency(quotation.netPrice)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
      <span>IVA (19%):</span>
      <span style="font-family: monospace;">${formatCurrency(quotation.ivaAmount)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #f97316; font-size: 18px; font-weight: 700;">
      <span>TOTAL COTIZACIÓN:</span>
      <span style="font-family: monospace; color: #f97316;">${formatCurrency(quotation.totalPrice)}</span>
    </div>
  </div>

  <!-- Terms and Conditions -->
  <div class="page-break"></div>
  
  <div style="margin-top: 30px;">
    <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f97316;">CONDICIONES COMERCIALES</h3>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px;">
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
        <strong style="color: #374151;">Validez:</strong>
        <p style="margin: 4px 0 0 0; color: #6b7280;">${quotation.validityDays} días desde la fecha de emisión</p>
      </div>
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
        <strong style="color: #374151;">Forma de Pago:</strong>
        <p style="margin: 4px 0 0 0; color: #6b7280;">${quotation.paymentTerms || "50% anticipo, 50% contra entrega"}</p>
      </div>
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
        <strong style="color: #374151;">Garantía:</strong>
        <p style="margin: 4px 0 0 0; color: #6b7280;">${quotation.warrantyTerms || "12 meses sobre mano de obra y materiales"}</p>
      </div>
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
        <strong style="color: #374151;">Tiempo de Entrega:</strong>
        <p style="margin: 4px 0 0 0; color: #6b7280;">${quotation.durationDays} días hábiles desde aprobación</p>
      </div>
    </div>

    ${quotation.additionalNotes ? `
      <div style="margin-top: 20px; background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f97316;">
        <strong style="color: #92400e;">Notas Adicionales:</strong>
        <p style="margin: 4px 0 0 0; color: #78350f;">${quotation.additionalNotes}</p>
      </div>
    ` : ""}
  </div>

  <!-- Alcance del Servicio -->
  <div style="margin-top: 30px;">
    <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f97316;">ALCANCE DEL SERVICIO</h3>
    
    <div style="font-size: 12px; color: #4b5563;">
      <p><strong>Incluye:</strong></p>
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li>Personal técnico certificado AWS D1.1</li>
        <li>Inspección NDT (Ultrasonido, Líquidos Penetrantes)</li>
        <li>Precalentamiento controlado según Tabla 7 del manual AH08507D</li>
        <li>Soldadura FCAW con alambre ESAB Dual Shield II 110</li>
        <li>Informe técnico y Data Book de la reparación</li>
        ${quotation.serviceType === "shielding" || quotation.serviceType === "reconstruction" ? `
          <li>Instalación de blindaje 450 Brinell según PSG NEWS 25-003/004</li>
          <li>Wear Buttons Laminite Ø90mm y Ø40mm</li>
          <li>Heel Shrouds para protección de esquinas</li>
        ` : ""}
        ${quotation.serviceType === "reconstruction" ? `
          <li>Evaluación estructural completa</li>
          <li>Reparación de fisuras en acero S690Q</li>
          <li>Actualización a configuración Heavy Duty</li>
        ` : ""}
      </ul>
      
      <p><strong>No Incluye:</strong></p>
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li>Transporte del balde (a menos que se indique)</li>
        <li>Trabajos adicionales no especificados</li>
        <li>Reparaciones por daños ocultos descubiertos durante el proceso</li>
      </ul>
    </div>
  </div>

  <!-- Signatures -->
  <div style="margin-top: 50px; display: flex; justify-content: space-between;">
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 60px;">
        <p style="font-weight: 600; margin: 0;">FORGEMINE CHILE SpA</p>
        <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">Representante Legal</p>
      </div>
    </div>
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 60px;">
        <p style="font-weight: 600; margin: 0;">${quotation.clientName}</p>
        <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">Representante Cliente</p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af;">
    <p style="margin: 0;">FORGEMINE CHILE SpA | contacto@forgeminechile.com | +56 9 9277 9872</p>
    <p style="margin: 4px 0 0 0;">Santiago, Chile | www.forgeminechile.com</p>
  </div>
</body>
</html>
  `;
}
