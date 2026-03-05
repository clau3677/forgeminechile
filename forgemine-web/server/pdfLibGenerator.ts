// PDF Generation using pdf-lib (works in any Node.js environment without browser dependencies)
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type QuotationData = {
  quotationNumber: string;
  clientName: string;
  clientRut: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientContact: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  equipmentBrand: string;
  equipmentModel: string;
  equipmentSerial: string | null;
  equipmentType?: string | null;
  equipmentCapacity?: string | null;
  equipmentLocation?: string | null;
  serviceType: string;
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
  estimatedDays?: number | null;
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

export async function generatePdfWithPdfLib(quotation: QuotationData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const primaryColor = rgb(0.85, 0.47, 0.02); // Orange #D97706
  const darkColor = rgb(0.1, 0.1, 0.1);
  const grayColor = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.95, 0.95, 0.95);
  
  // Page dimensions
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  
  // Add first page
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  
  // Helper function to draw text
  const drawText = (text: string, x: number, yPos: number, options: {
    font?: typeof helvetica;
    size?: number;
    color?: typeof darkColor;
  } = {}) => {
    const { font = helvetica, size = 10, color = darkColor } = options;
    page.drawText(text, { x, y: yPos, font, size, color });
  };
  
  // Helper function to draw a line
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = lightGray) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color,
    });
  };
  
  // Helper function to draw a rectangle
  const drawRect = (x: number, yPos: number, width: number, height: number, color = lightGray) => {
    page.drawRectangle({
      x,
      y: yPos,
      width,
      height,
      color,
    });
  };
  
  // === HEADER ===
  drawText("FORGEMINE", margin, y, { font: helveticaBold, size: 24, color: primaryColor });
  y -= 18;
  drawText("CHILE SpA", margin, y, { font: helveticaBold, size: 12, color: grayColor });
  y -= 14;
  drawText("Especialistas en Reparación de Baldes Mineros", margin, y, { font: helvetica, size: 9, color: grayColor });
  
  // Right side - Quotation info
  const rightX = pageWidth - margin - 180;
  drawText("COTIZACIÓN DE SERVICIOS", rightX, pageHeight - margin, { font: helveticaBold, size: 12, color: darkColor });
  drawText(`N° ${quotation.quotationNumber}`, rightX, pageHeight - margin - 18, { font: helveticaBold, size: 14, color: primaryColor });
  drawText(`Fecha: ${formatDate(quotation.createdAt)}`, rightX, pageHeight - margin - 36, { font: helvetica, size: 9, color: grayColor });
  
  // Calculate validity date (30 days from creation)
  const validityDate = new Date(quotation.createdAt);
  validityDate.setDate(validityDate.getDate() + 30);
  drawText(`Válida hasta: ${formatDate(validityDate)}`, rightX, pageHeight - margin - 50, { font: helvetica, size: 9, color: grayColor });
  
  y -= 50;
  
  // === SEPARATOR LINE ===
  drawLine(margin, y, pageWidth - margin, y, primaryColor);
  y -= 30;
  
  // === CLIENT DATA BOX ===
  drawRect(margin, y - 100, contentWidth / 2 - 10, 100, lightGray);
  drawText("DATOS DEL CLIENTE", margin + 10, y - 15, { font: helveticaBold, size: 10, color: darkColor });
  
  let clientY = y - 35;
  drawText("Razón Social:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.clientName || "N/A", margin + 80, clientY, { font: helvetica, size: 9 });
  clientY -= 14;
  drawText("RUT:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.clientRut || "N/A", margin + 80, clientY, { font: helvetica, size: 9 });
  clientY -= 14;
  if (quotation.clientAddress) {
    drawText("Dirección:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.clientAddress, margin + 80, clientY, { font: helvetica, size: 9 });
    clientY -= 14;
  }
  if (quotation.clientCity) {
    drawText("Ciudad:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.clientCity, margin + 80, clientY, { font: helvetica, size: 9 });
    clientY -= 14;
  }
  if (quotation.clientContact) {
    drawText("Contacto:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.clientContact, margin + 80, clientY, { font: helvetica, size: 9 });
    clientY -= 14;
  }
  drawText("Teléfono:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.clientPhone || "N/A", margin + 80, clientY, { font: helvetica, size: 9 });
  clientY -= 14;
  drawText("Email:", margin + 10, clientY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.clientEmail || "N/A", margin + 80, clientY, { font: helvetica, size: 9 });
  
  // === EQUIPMENT DATA BOX ===
  const equipX = margin + contentWidth / 2 + 10;
  drawRect(equipX, y - 100, contentWidth / 2 - 10, 100, lightGray);
  drawText("DATOS DEL EQUIPO", equipX + 10, y - 15, { font: helveticaBold, size: 10, color: darkColor });
  
  let equipY = y - 35;
  if (quotation.equipmentType) {
    drawText("Tipo:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.equipmentType, equipX + 70, equipY, { font: helvetica, size: 9 });
    equipY -= 14;
  }
  drawText("Marca:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.equipmentBrand, equipX + 70, equipY, { font: helvetica, size: 9 });
  equipY -= 14;
  drawText("Modelo:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.equipmentModel, equipX + 70, equipY, { font: helvetica, size: 9, color: primaryColor });
  equipY -= 14;
  if (quotation.equipmentCapacity) {
    drawText("Capacidad:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.equipmentCapacity, equipX + 70, equipY, { font: helvetica, size: 9 });
    equipY -= 14;
  }
  drawText("N° Serie:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
  drawText(quotation.equipmentSerial || "N/A", equipX + 70, equipY, { font: helvetica, size: 9 });
  equipY -= 14;
  if (quotation.equipmentLocation) {
    drawText("Ubicación:", equipX + 10, equipY, { font: helveticaBold, size: 9, color: grayColor });
    drawText(quotation.equipmentLocation, equipX + 70, equipY, { font: helvetica, size: 9 });
  }
  
  y -= 130;
  
  // === SERVICE TYPE BOX ===
  drawRect(margin, y - 40, contentWidth, 40, rgb(1, 0.95, 0.9)); // Light orange background
  page.drawRectangle({
    x: margin,
    y: y - 40,
    width: 4,
    height: 40,
    color: primaryColor,
  });
  
  const serviceLabel = serviceLabels[quotation.serviceType] || quotation.serviceType;
  drawText(`SERVICIO: ${serviceLabel}`, margin + 15, y - 18, { font: helveticaBold, size: 12, color: primaryColor });
  
  let serviceInfo = `Duración estimada: ${quotation.estimatedDays || 'Por definir'} días`;
  serviceInfo += ` | Materiales: ${quotation.materialsProvider.toUpperCase()}`;
  serviceInfo += ` | Equipos: ${quotation.equipmentProvider.toUpperCase()}`;
  serviceInfo += ` | Operacionales: ${quotation.operationalProvider.toUpperCase()}`;
  drawText(serviceInfo, margin + 15, y - 32, { font: helvetica, size: 8, color: grayColor });
  
  y -= 60;
  
  // === COST BREAKDOWN ===
  drawText("DESGLOSE DE COSTOS", margin, y, { font: helveticaBold, size: 12, color: darkColor });
  y -= 25;
  
  // Table header
  drawRect(margin, y - 20, contentWidth, 20, rgb(0.2, 0.2, 0.2));
  drawText("Concepto", margin + 10, y - 14, { font: helveticaBold, size: 9, color: rgb(1, 1, 1) });
  drawText("Aporte", margin + 280, y - 14, { font: helveticaBold, size: 9, color: rgb(1, 1, 1) });
  drawText("Monto", margin + 420, y - 14, { font: helveticaBold, size: 9, color: rgb(1, 1, 1) });
  y -= 20;
  
  // Cost rows - The costs in the database already have the margin applied
  // We need to distribute the netPrice proportionally to each cost item
  // so that the sum of displayed amounts equals netPrice
  const totalBaseCost = quotation.laborCost + quotation.materialsCost + quotation.equipmentCost + quotation.operationalCost;
  
  // Calculate proportional amounts that sum to netPrice
  let laborDisplay = 0;
  let materialsDisplay = 0;
  let equipmentDisplay = 0;
  let operationalDisplay = 0;
  
  if (totalBaseCost > 0) {
    laborDisplay = Math.round((quotation.laborCost / totalBaseCost) * quotation.netPrice);
    materialsDisplay = Math.round((quotation.materialsCost / totalBaseCost) * quotation.netPrice);
    equipmentDisplay = Math.round((quotation.equipmentCost / totalBaseCost) * quotation.netPrice);
    operationalDisplay = Math.round((quotation.operationalCost / totalBaseCost) * quotation.netPrice);
    
    // Adjust for rounding errors - add difference to the largest non-zero item
    const displaySum = laborDisplay + materialsDisplay + equipmentDisplay + operationalDisplay;
    const diff = quotation.netPrice - displaySum;
    if (diff !== 0) {
      // Add the difference to labor (always FORGEMINE)
      laborDisplay += diff;
    }
  }
  
  const costs = [
    { label: "Mano de Obra", provider: "FORGEMINE", amount: laborDisplay },
    { label: "Materiales y Consumibles", provider: quotation.materialsProvider.toUpperCase(), amount: materialsDisplay },
    { label: "Equipos y Herramientas", provider: quotation.equipmentProvider.toUpperCase(), amount: equipmentDisplay },
    { label: "Gastos Operacionales", provider: quotation.operationalProvider.toUpperCase(), amount: operationalDisplay },
  ];
  
  let rowIndex = 0;
  for (const cost of costs) {
    const rowColor = rowIndex % 2 === 0 ? lightGray : rgb(1, 1, 1);
    drawRect(margin, y - 18, contentWidth, 18, rowColor);
    drawText(cost.label, margin + 10, y - 12, { font: helvetica, size: 9 });
    drawText(cost.provider, margin + 280, y - 12, { font: helvetica, size: 9 });
    drawText(formatCurrency(cost.amount), margin + 420, y - 12, { font: helvetica, size: 9 });
    y -= 18;
    rowIndex++;
  }
  
  // Separator
  drawLine(margin, y, pageWidth - margin, y, grayColor);
  y -= 25;
  
  // === TOTALS ===
  const totalsX = margin + 280;
  
  drawText("Precio Neto:", totalsX, y, { font: helveticaBold, size: 10 });
  drawText(formatCurrency(quotation.netPrice), totalsX + 140, y, { font: helveticaBold, size: 10 });
  y -= 18;
  
  drawText("IVA (19%):", totalsX, y, { font: helvetica, size: 10, color: grayColor });
  drawText(formatCurrency(quotation.ivaAmount), totalsX + 140, y, { font: helvetica, size: 10, color: grayColor });
  y -= 25;
  
  // Total box
  drawRect(totalsX - 10, y - 25, 220, 30, primaryColor);
  drawText("TOTAL:", totalsX, y - 10, { font: helveticaBold, size: 14, color: rgb(1, 1, 1) });
  drawText(formatCurrency(quotation.totalPrice), totalsX + 100, y - 10, { font: helveticaBold, size: 14, color: rgb(1, 1, 1) });
  
  y -= 60;
  
  // === TERMS AND CONDITIONS ===
  if (y < 200) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  
  drawText("TÉRMINOS Y CONDICIONES", margin, y, { font: helveticaBold, size: 11, color: darkColor });
  y -= 20;
  
  const terms = [
    "1. Esta cotización tiene una validez de 30 días desde su fecha de emisión.",
    "2. Los precios están expresados en pesos chilenos (CLP) e incluyen IVA.",
    "3. El plazo de ejecución se cuenta desde la recepción del equipo en nuestras instalaciones.",
    "4. Forma de pago: 50% anticipo, 50% contra entrega.",
    "5. FORGEMINE garantiza sus trabajos por un período de 6 meses.",
    "6. Los materiales y repuestos son de primera calidad y cuentan con certificación.",
  ];
  
  for (const term of terms) {
    drawText(term, margin, y, { font: helvetica, size: 8, color: grayColor });
    y -= 14;
  }
  
  y -= 20;
  
  // === FOOTER ===
  drawLine(margin, y, pageWidth - margin, y, lightGray);
  y -= 20;
  
  drawText("FORGEMINE CHILE SpA", margin, y, { font: helveticaBold, size: 9, color: darkColor });
  drawText("contacto@forgeminechile.com | +56 9 9277 9872", margin, y - 12, { font: helvetica, size: 8, color: grayColor });
  drawText("Santa Margarita #0190, San Bernardo, Santiago", margin, y - 24, { font: helvetica, size: 8, color: grayColor });
  
  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
