import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";
import { createQuote, getAllQuotes, getQuoteById, updateQuoteStatus, updateQuoteNotes, getQuoteStats, getAllCostParameters, getCostParametersByCategory, createCostParameter, updateCostParameter, deleteCostParameter, seedDefaultCostParameters, createGeneratedQuotation, getAllGeneratedQuotations, getGeneratedQuotationById, updateGeneratedQuotation, deleteGeneratedQuotation, getNextQuotationNumber, getPublishedArticles, getAllArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle, getArticlesByCategory, getAllSiteSettings, upsertSiteSetting, upsertSiteSettings } from "./db";
import { htmlToPdf } from "./pdfHelper";
import { storagePut, storageGet } from "./storage";
import { generateQuotationPdfHtml } from "./pdfGenerator";
import { invokeLLM } from "./_core/llm";

// Helper to generate unique file keys
function generateFileKey(originalName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
  return `quotes/${timestamp}-${randomSuffix}-${safeName}.${extension}`;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    loginWithPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const expectedEmail = ENV.adminEmail;
        const expectedHash = ENV.adminPasswordHash;

        if (!expectedEmail || !expectedHash) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "ADMIN_EMAIL y ADMIN_PASSWORD_HASH no estan configurados en .env",
          });
        }

        if (input.email !== expectedEmail) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciales incorrectas" });
        }

        const valid = await bcrypt.compare(input.password, expectedHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciales incorrectas" });
        }

        const secret = new TextEncoder().encode(ENV.jwtSecret);
        const jwtToken = await new SignJWT({ email: input.email, role: "admin" })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("365d")
          .sign(secret);

        const token = "own." + jwtToken;
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
  }),

  // Storage router for file uploads
  storage: router({
    // Public: Upload an image for quote requests
    uploadImage: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded image data
        contentType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        try {
          // Decode base64 to buffer
          const buffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file key
          const fileKey = generateFileKey(input.fileName);
          
          // Upload to S3
          const result = await storagePut(fileKey, buffer, input.contentType);
          
          return {
            success: true,
            url: result.url,
            key: result.key,
          };
        } catch (error) {
          console.error("[Storage] Upload failed:", error);
          throw new Error("Failed to upload image");
        }
      }),

    // Public: Upload multiple images
    uploadMultipleImages: publicProcedure
      .input(z.object({
        images: z.array(z.object({
          fileName: z.string(),
          fileData: z.string(), // Base64 encoded
          contentType: z.string().default("image/jpeg"),
        })),
      }))
      .mutation(async ({ input }) => {
        const results: { url: string; key: string; fileName: string }[] = [];
        const errors: string[] = [];

        for (const image of input.images) {
          try {
            const buffer = Buffer.from(image.fileData, 'base64');
            const fileKey = generateFileKey(image.fileName);
            const result = await storagePut(fileKey, buffer, image.contentType);
            results.push({
              url: result.url,
              key: result.key,
              fileName: image.fileName,
            });
          } catch (error) {
            console.error(`[Storage] Failed to upload ${image.fileName}:`, error);
            errors.push(image.fileName);
          }
        }

        return {
          success: errors.length === 0,
          uploaded: results,
          failed: errors,
        };
      }),
  }),

  // Quotes router for managing quote requests
  quotes: router({
    // Public: Create a new quote request (from website form)
    // Automatically generates a quotation based on the selected services
    create: publicProcedure
      .input(z.object({
        contactName: z.string().min(1),
        company: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        position: z.string().optional(),
        brand: z.string().min(1),
        equipmentType: z.string().min(1),
        model: z.string().min(1),
        serialNumber: z.string().optional(),
        hoursOperation: z.string().optional(),
        selectedServices: z.array(z.string()),
        problemDescription: z.string().min(1),
        urgency: z.enum(["normal", "priority", "urgent", "emergency"]),
        location: z.string().min(1),
        preferredDate: z.string().optional(),
        additionalNotes: z.string().optional(),
        images: z.array(z.string()).optional(), // Now stores S3 URLs
      }))
      .mutation(async ({ input }) => {
        // Create the quote request first
        const quote = await createQuote(input);
        
        if (!quote) {
          return { success: false, quoteId: null, quotationId: null };
        }

        // Auto-generate quotation based on selected services
        try {
          // Map selected services to service type
          const serviceMapping: Record<string, string> = {
            "repair": "repair",
            "shielding": "shielding",
            "reconstruction": "reconstruction",
            "reparacion": "repair",
            "blindaje": "shielding",
            "reconstruccion": "reconstruction",
          };

          // Determine service type from selected services
          let serviceType: "repair" | "shielding" | "reconstruction" = "repair";
          for (const service of input.selectedServices) {
            const normalizedService = service.toLowerCase();
            if (normalizedService.includes("reconstrucci") || normalizedService.includes("reconstruction")) {
              serviceType = "reconstruction";
              break;
            } else if (normalizedService.includes("blindaje") || normalizedService.includes("shielding") || normalizedService.includes("heavy")) {
              serviceType = "shielding";
            } else if (normalizedService.includes("reparaci") || normalizedService.includes("repair")) {
              if (serviceType !== "shielding") serviceType = "repair";
            }
          }

          // Get all cost parameters
          const allParams = await getAllCostParameters();
          const laborParams = allParams.filter(p => p.category === "labor" && p.isActive === "yes");
          const materialsParams = allParams.filter(p => p.category === "materials" && p.isActive === "yes");
          const equipmentParams = allParams.filter(p => p.category === "equipment" && p.isActive === "yes");
          const operationalParams = allParams.filter(p => p.category === "operational" && p.isActive === "yes");

          // Service configurations
          const serviceConfigs = {
            repair: { days: 21 },
            shielding: { days: 42 },
            reconstruction: { days: 71 },
          };

          const durationDays = serviceConfigs[serviceType].days;

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

          // Calculate items and costs
          type CostItem = { name: string; quantity: number; unitCost: number; total: number };
          const calculateItems = (params: typeof allParams, quantities: Record<string, number>): CostItem[] => {
            return params
              .filter(p => quantities[p.name] !== undefined)
              .map(p => ({
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
          const materialsTotal = materialsItems.reduce((sum, item) => sum + item.total, 0);
          const equipmentTotal = equipmentItems.reduce((sum, item) => sum + item.total, 0);
          const operationalTotal = operationalItems.reduce((sum, item) => sum + item.total, 0);

          const subtotal = laborTotal + materialsTotal + equipmentTotal + operationalTotal;
          const profitMargin = 50; // 50% default
          const profitAmount = Math.round(subtotal * (profitMargin / 100));
          const netPrice = subtotal + profitAmount;
          const ivaAmount = Math.round(netPrice * 0.19);
          const totalPrice = netPrice + ivaAmount;

          // Get next quotation number
          const quotationNumber = await getNextQuotationNumber();

          // Create the auto-generated quotation
          const quotation = await createGeneratedQuotation({
            quotationNumber,
            clientName: input.company,
            clientContact: input.contactName,
            clientPhone: input.phone,
            clientEmail: input.email,
            clientCity: input.location,
            equipmentType: input.equipmentType,
            equipmentBrand: input.brand,
            equipmentModel: input.model,
            equipmentSerial: input.serialNumber || null,
            serviceType,
            durationDays,
            materialsProvider: "forgemine",
            equipmentProvider: "forgemine",
            operationalProvider: "forgemine",
            // Store original costs for restoration when provider changes
            originalMaterialsCost: materialsTotal,
            originalEquipmentCost: equipmentTotal,
            originalOperationalCost: operationalTotal,
            laborCost: laborTotal,
            materialsCost: materialsTotal,
            equipmentCost: equipmentTotal,
            operationalCost: operationalTotal,
            subtotalCost: subtotal,
            profitMargin,
            profitAmount,
            netPrice,
            ivaAmount,
            totalPrice,
            costBreakdown: {
              labor: laborItems,
              materials: materialsItems,
              equipment: equipmentItems,
              operational: operationalItems,
            },
            additionalNotes: input.problemDescription + (input.additionalNotes ? "\n" + input.additionalNotes : ""),
            linkedQuoteId: quote.id,
            status: "draft",
          });

          console.log(`[Auto-Quotation] Generated ${quotationNumber} for quote request #${quote.id}`);

          return { success: true, quoteId: quote.id, quotationId: quotation?.id, quotationNumber };
        } catch (autoQuoteError) {
          console.error("[Auto-Quotation] Error generating automatic quotation:", autoQuoteError);
          // Still return success for the quote request, even if auto-quotation failed
          return { success: true, quoteId: quote.id, quotationId: null };
        }
      }),

    // Protected: Get all quotes (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAllQuotes();
    }),

    // Protected: Get a single quote by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return getQuoteById(input.id);
      }),

    // Protected: Update quote status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewing", "quoted", "accepted", "rejected", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await updateQuoteStatus(input.id, input.status);
        return { success: true };
      }),

    // Protected: Update quote admin notes and price
    updateNotes: protectedProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string().optional(),
        quotedPrice: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await updateQuoteNotes(input.id, input.adminNotes, input.quotedPrice);
        return { success: true };
      }),

    // Protected: Get quote statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getQuoteStats();
    }),
  }),

  // Cost Parameters router for managing cost configuration
  costParameters: router({
    // Protected: Get all cost parameters
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAllCostParameters();
    }),

    // Protected: Get cost parameters by category
    byCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return getCostParametersByCategory(input.category);
      }),

    // Protected: Create a new cost parameter
    create: protectedProcedure
      .input(z.object({
        category: z.string(),
        name: z.string(),
        description: z.string().optional(),
        unitCost: z.number(),
        unit: z.string(),
        supplier: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return createCostParameter(input);
      }),

    // Protected: Update a cost parameter
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        category: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        unitCost: z.number().optional(),
        unit: z.string().optional(),
        supplier: z.string().optional(),
        isActive: z.enum(["yes", "no"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { id, ...data } = input;
        await updateCostParameter(id, data);
        return { success: true };
      }),

    // Protected: Delete a cost parameter
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await deleteCostParameter(input.id);
        return { success: true };
      }),

    // Protected: Seed default cost parameters
    seedDefaults: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await seedDefaultCostParameters();
        return { success: true };
      }),
  }),

  // Generated Quotations router
  quotations: router({
    // Protected: Get all generated quotations
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAllGeneratedQuotations();
    }),

    // Protected: Get a single quotation by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return getGeneratedQuotationById(input.id);
      }),

    // Protected: Get next quotation number
    getNextNumber: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getNextQuotationNumber();
    }),

    // Protected: Create a new quotation
    create: protectedProcedure
      .input(z.object({
        // Client info
        clientName: z.string(),
        clientRut: z.string().optional(),
        clientAddress: z.string().optional(),
        clientCity: z.string().optional(),
        clientContact: z.string().optional(),
        clientPhone: z.string().optional(),
        clientEmail: z.string().optional(),
        // Equipment info
        equipmentType: z.string(),
        equipmentBrand: z.string(),
        equipmentModel: z.string(),
        equipmentSerial: z.string().optional(),
        equipmentCapacity: z.string().optional(),
        equipmentLocation: z.string().optional(),
        // Service details
        serviceType: z.enum(["repair", "shielding", "reconstruction"]),
        durationDays: z.number(),
        // Cost configuration
        materialsProvider: z.enum(["forgemine", "client"]),
        equipmentProvider: z.enum(["forgemine", "client"]),
        operationalProvider: z.enum(["forgemine", "client"]),
        // Calculated costs
        laborCost: z.number(),
        materialsCost: z.number(),
        equipmentCost: z.number(),
        operationalCost: z.number(),
        subtotalCost: z.number(),
        profitMargin: z.number(),
        profitAmount: z.number(),
        netPrice: z.number(),
        ivaAmount: z.number(),
        totalPrice: z.number(),
        // Cost breakdown
        costBreakdown: z.object({
          labor: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          materials: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          equipment: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          operational: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
        }),
        // Commercial terms
        validityDays: z.number().optional(),
        paymentTerms: z.string().optional(),
        warrantyTerms: z.string().optional(),
        additionalNotes: z.string().optional(),
        // Linked quote
        linkedQuoteId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const quotationNumber = await getNextQuotationNumber();
        
        // Create the quotation first
        const quotation = await createGeneratedQuotation({
          ...input,
          quotationNumber,
          createdById: ctx.user.id,
          status: "draft",
        });
        
        // Generate PDF automatically if quotation was created successfully
        if (quotation) {
          try {
            // Generate PDF HTML content
            const pdfHtml = generateQuotationPdfHtml(quotation);
            
            // Convert HTML to real PDF using Puppeteer
            const pdfBuffer = await htmlToPdf(pdfHtml);
            
            // Upload PDF to S3 and get the public URL
            const pdfKey = `quotations/${quotationNumber}.pdf`;
            const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');
            
            // Update quotation with the uploaded URL
            await updateGeneratedQuotation(quotation.id, { pdfUrl });
            
            // Return quotation with PDF URL
            return { ...quotation, pdfUrl };
          } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            // Return quotation without PDF if generation fails
            return quotation;
          }
        }
        
        return quotation;
      }),

    // Protected: Update quotation status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await updateGeneratedQuotation(input.id, { status: input.status });
        return { success: true };
      }),

    // Protected: Update quotation PDF URL
    updatePdfUrl: protectedProcedure
      .input(z.object({
        id: z.number(),
        pdfUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await updateGeneratedQuotation(input.id, { pdfUrl: input.pdfUrl });
        return { success: true };
      }),

    // Protected: Generate PDF for a quotation
    generatePdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const quotation = await getGeneratedQuotationById(input.id);
        if (!quotation) {
          throw new Error("Quotation not found");
        }
        
        try {
          // Import pdf-lib generator dynamically
          const { generatePdfWithPdfLib } = await import("./pdfLibGenerator");
          
          // Generate PDF using pdf-lib (no browser dependencies)
          console.log(`[PDF] Generating PDF for quotation ${quotation.quotationNumber}...`);
          const pdfBuffer = await generatePdfWithPdfLib({
            quotationNumber: quotation.quotationNumber,
            clientName: quotation.clientName,
            clientRut: quotation.clientRut,
            clientEmail: quotation.clientEmail,
            clientPhone: quotation.clientPhone,
            clientContact: quotation.clientContact,
            clientAddress: quotation.clientAddress,
            clientCity: quotation.clientCity,
            equipmentBrand: quotation.equipmentBrand,
            equipmentModel: quotation.equipmentModel,
            equipmentSerial: quotation.equipmentSerial,
            equipmentType: quotation.equipmentType,
            equipmentCapacity: quotation.equipmentCapacity,
            equipmentLocation: quotation.equipmentLocation,
            serviceType: quotation.serviceType,
            laborCost: quotation.laborCost,
            materialsCost: quotation.materialsCost,
            equipmentCost: quotation.equipmentCost,
            operationalCost: quotation.operationalCost,
            subtotalCost: quotation.subtotalCost,
            profitMargin: quotation.profitMargin,
            profitAmount: quotation.profitAmount,
            netPrice: quotation.netPrice,
            ivaAmount: quotation.ivaAmount,
            totalPrice: quotation.totalPrice,
            materialsProvider: quotation.materialsProvider,
            equipmentProvider: quotation.equipmentProvider,
            operationalProvider: quotation.operationalProvider,
            estimatedDays: quotation.durationDays,
            createdAt: quotation.createdAt,
          });
          console.log(`[PDF] PDF generated, size: ${pdfBuffer.length} bytes`);
          
          // Upload PDF to S3
          const pdfKey = `quotations/${quotation.quotationNumber}.pdf`;
          const { url: uploadedUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');
          console.log(`[PDF] PDF uploaded to: ${uploadedUrl}`);
          
          // Get presigned download URL (the upload URL is not publicly accessible)
          const { url: presignedUrl } = await storageGet(pdfKey);
          console.log(`[PDF] Presigned URL: ${presignedUrl}`);
          
          // Store the presigned URL for download
          await updateGeneratedQuotation(quotation.id, { pdfUrl: presignedUrl });
          
          // Return the presigned URL for immediate download
          return { pdfUrl: presignedUrl, quotation };
        } catch (error) {
          console.error(`[PDF] Error generating PDF for quotation ${quotation.quotationNumber}:`, error);
          throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }),

    // Protected: Delete a quotation
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await deleteGeneratedQuotation(input.id);
        return { success: true };
      }),

    // Protected: Create quotation automatically from a quote request
    createFromRequest: protectedProcedure
      .input(z.object({
        quoteRequestId: z.number(),
        clientName: z.string(),
        clientContact: z.string().optional(),
        clientPhone: z.string().optional(),
        clientEmail: z.string().optional(),
        clientCity: z.string().optional(),
        equipmentBrand: z.string(),
        equipmentModel: z.string(),
        equipmentType: z.string(),
        equipmentSerial: z.string().optional(),
        serviceType: z.enum(["repair", "shielding", "reconstruction"]),
        problemDescription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        // Get cost parameters to calculate costs
        const allParams = await getAllCostParameters();
        const laborParams = allParams.filter(p => p.category === "labor");
        const materialsParams = allParams.filter(p => p.category === "materials");
        const equipmentParams = allParams.filter(p => p.category === "equipment");
        const operationalParams = allParams.filter(p => p.category === "operational");

        // Define service configurations
        const serviceConfigs = {
          repair: { days: 14 },
          shielding: { days: 42 },
          reconstruction: { days: 71 },
        };

        const durationDays = serviceConfigs[input.serviceType].days;

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

        // Calculate items and costs
        type CostItem = { name: string; quantity: number; unitCost: number; total: number };
        const calculateItems = (params: typeof allParams, quantities: Record<string, number>): CostItem[] => {
          return params
            .filter(p => quantities[p.name] !== undefined)
            .map(p => ({
              name: p.name,
              quantity: quantities[p.name],
              unitCost: p.unitCost,
              total: quantities[p.name] * p.unitCost,
            }));
        };

        const laborItems = calculateItems(laborParams, laborQuantities[input.serviceType]);
        const materialsItems = calculateItems(materialsParams, materialQuantities[input.serviceType]);
        const equipmentItems = calculateItems(equipmentParams, equipmentQuantities[input.serviceType]);
        const operationalItems = calculateItems(operationalParams, operationalQuantities[input.serviceType]);

        const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);
        const materialsTotal = materialsItems.reduce((sum, item) => sum + item.total, 0);
        const equipmentTotal = equipmentItems.reduce((sum, item) => sum + item.total, 0);
        const operationalTotal = operationalItems.reduce((sum, item) => sum + item.total, 0);

        const subtotal = laborTotal + materialsTotal + equipmentTotal + operationalTotal;
        const profitMargin = 50; // 50% default
        const profitAmount = Math.round(subtotal * (profitMargin / 100));
        const netPrice = subtotal + profitAmount;
        const ivaAmount = Math.round(netPrice * 0.19);
        const totalPrice = netPrice + ivaAmount;

        // Get next quotation number
        const quotationNumber = await getNextQuotationNumber();

        // Create the quotation
        const quotation = await createGeneratedQuotation({
          quotationNumber,
          clientName: input.clientName,
          clientContact: input.clientContact,
          clientPhone: input.clientPhone,
          clientEmail: input.clientEmail,
          clientCity: input.clientCity,
          equipmentType: input.equipmentType,
          equipmentBrand: input.equipmentBrand,
          equipmentModel: input.equipmentModel,
          equipmentSerial: input.equipmentSerial,
          serviceType: input.serviceType,
          durationDays,
          materialsProvider: "forgemine",
          equipmentProvider: "forgemine",
          operationalProvider: "forgemine",
          laborCost: laborTotal,
          materialsCost: materialsTotal,
          equipmentCost: equipmentTotal,
          operationalCost: operationalTotal,
          subtotalCost: subtotal,
          profitMargin,
          profitAmount,
          netPrice,
          ivaAmount,
          totalPrice,
          costBreakdown: {
            labor: laborItems,
            materials: materialsItems,
            equipment: equipmentItems,
            operational: operationalItems,
          },
          additionalNotes: input.problemDescription,
          linkedQuoteId: input.quoteRequestId,
          createdById: ctx.user.id,
          status: "draft",
        });

        // Generate PDF automatically
        if (quotation) {
          try {
            const pdfHtml = generateQuotationPdfHtml(quotation);
            const pdfBuffer = await htmlToPdf(pdfHtml);
            const pdfKey = `quotations/${quotationNumber}.pdf`;
            
            // Upload PDF to S3 and get the public URL
            const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');
            await updateGeneratedQuotation(quotation.id, { pdfUrl });
            
            // Update the original quote request status to "quoted"
            await updateQuoteStatus(input.quoteRequestId, "quoted");
            
            return { ...quotation, pdfUrl };
          } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            return quotation;
          }
        }

        return quotation;
      }),
    // Protected: Update a quotation (full edit)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        // Client info
        clientName: z.string().optional(),
        clientRut: z.string().optional().nullable(),
        clientAddress: z.string().optional().nullable(),
        clientCity: z.string().optional().nullable(),
        clientContact: z.string().optional().nullable(),
        clientPhone: z.string().optional().nullable(),
        clientEmail: z.string().optional().nullable(),
        // Equipment info
        equipmentType: z.string().optional(),
        equipmentBrand: z.string().optional(),
        equipmentModel: z.string().optional(),
        equipmentSerial: z.string().optional().nullable(),
        equipmentCapacity: z.string().optional().nullable(),
        equipmentLocation: z.string().optional().nullable(),
        // Service details
        serviceType: z.enum(["repair", "shielding", "reconstruction"]).optional(),
        durationDays: z.number().optional(),
        // Cost configuration
        materialsProvider: z.enum(["forgemine", "client"]).optional(),
        equipmentProvider: z.enum(["forgemine", "client"]).optional(),
        operationalProvider: z.enum(["forgemine", "client"]).optional(),
        // Original costs (for restoration when switching providers)
        originalMaterialsCost: z.number().optional().nullable(),
        originalEquipmentCost: z.number().optional().nullable(),
        originalOperationalCost: z.number().optional().nullable(),
        // Calculated costs
        laborCost: z.number().optional(),
        materialsCost: z.number().optional(),
        equipmentCost: z.number().optional(),
        operationalCost: z.number().optional(),
        subtotalCost: z.number().optional(),
        profitMargin: z.number().optional(),
        profitAmount: z.number().optional(),
        netPrice: z.number().optional(),
        ivaAmount: z.number().optional(),
        totalPrice: z.number().optional(),
        // Cost breakdown
        costBreakdown: z.object({
          labor: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          materials: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          equipment: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
          operational: z.array(z.object({ name: z.string(), quantity: z.number(), unitCost: z.number(), total: z.number() })),
        }).optional(),
        // Commercial terms
        validityDays: z.number().optional(),
        paymentTerms: z.string().optional(),
        warrantyTerms: z.string().optional().nullable(),
        additionalNotes: z.string().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { id, ...data } = input;
        
        // Remove undefined values to avoid overwriting with null
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        
        await updateGeneratedQuotation(id, cleanData);
        
        // Clear PDF URL since data changed (will regenerate on next download)
        await updateGeneratedQuotation(id, { pdfUrl: null });
        
        return { success: true };
      }),
  }),

  // Chatbot IA - Asesor Técnico-Comercial
  chatbot: router({
    chat: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Eres el Asesor Técnico-Comercial de FORGEMINE CHILE SpA, una empresa líder en reparación, blindaje y reconstrucción de baldes mineros en Chile.

Tu personalidad:
- Eres experto, confiable y directo
- Hablas siempre en español chileno profesional
- Eres apasionado por la calidad y la seguridad en minería
- Tu objetivo principal es CONVENCER al cliente de que reparar y blindar sus baldes con FORGEMINE es SIEMPRE la mejor decisión económica y técnica

Información de FORGEMINE:
- Especialistas en reparación de baldes de palas hidráulicas Komatsu (PC5500, PC7000, PC8000), Caterpillar (6040, 6050, 6060), Liebherr (R9800, R9400) y Hitachi (EX5600, EX8000)
- Soldadura certificada AWS D1.1 y AWS D14.3
- Certificaciones: ISO 9001, ISO 3834-2
- Más de 15 años de experiencia, +73 baldes reparados
- Soporte 24/7 con respuesta en 4-8 horas
- Servicio en todo Chile: Santiago, Antofagasta, Calama, Copiapó
- Contacto: +56 9 9277 9872 (WhatsApp), contacto@forgeminechile.com

Servicios principales:
1. REPARACIÓN DE BALDES MINEROS: Soldadura certificada AWS D1.1 para fisuras y grietas estructurales. Precalentamiento controlado según tipo de acero (S355, S690Q, HB400). Inspección por ultrasonido y ensayos no destructivos (END).
2. BLINDAJE HEAVY DUTY: Conversión de baldes estándar a Heavy Duty según boletines PSG 25-003/004. Planchas 450 Brinell para flejes de piso y laterales. Wear Buttons Laminite de 90mm y 40mm. Heel Shrouds para protección de esquinas. Kit completo aprox. 1.568 kg.
3. RECONSTRUCCIÓN TOTAL (OVERHAUL): Evaluación estructural completa, reemplazo de labios, actualización de sistema GET, ingeniería inversa para componentes descontinuados.
4. SERVICIO EN FAENA: Reparación en terreno 24/7, equipos autónomos, personal certificado.

Argumentos de venta clave (SIEMPRE usa estos para convencer):
- Un balde nuevo puede costar entre USD $800.000 y $2.000.000. La reparación cuesta una FRACCIÓN de eso (15-30% del valor de uno nuevo).
- El tiempo de reparación (30-60 días) es MUCHO menor que el tiempo de espera de un balde nuevo (6-12 meses de fabricación + envío).
- La reparación con blindaje Heavy Duty EXTIENDE la vida útil del balde en 2-3 veces más.
- Nuestros soldadores están calificados con proceso FCAW y electrodos E81T1-Ni2C, específicos para aceros de alta resistencia.
- Cada reparación incluye inspección NDT (ultrasonido, partículas magnéticas) que garantiza la integridad estructural.
- El downtime de una pala hidráulica cuesta entre USD $50.000 y $150.000 POR DÍA. Reparar rápido = ahorrar millones.

Reglas de comportamiento:
- Si el cliente pregunta por precios, NO des cifras exactas. Di que depende del estado del balde y ofrece una evaluación gratuita. Invita a solicitar cotización.
- Si el cliente duda entre reparar o comprar nuevo, SIEMPRE argumenta a favor de la reparación con datos concretos de ahorro.
- Si el cliente pregunta algo fuera de tu área (no relacionado con baldes o minería), redirige amablemente la conversación hacia los servicios de FORGEMINE.
- Siempre termina ofreciendo ayuda adicional o invitando a solicitar una cotización.
- Si el cliente quiere contacto directo, proporciona el WhatsApp: +56 9 9277 9872
- Mantén respuestas concisas (máximo 3-4 párrafos) pero informativas.
- Usa negritas (**texto**) para resaltar datos importantes.
- NO inventes datos técnicos que no conozcas. Si no sabes algo específico, ofrece conectar al cliente con un ingeniero especialista.`;

        // Build messages array with system prompt
        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.filter(m => m.role !== "system").map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        try {
          const result = await invokeLLM({
            messages: llmMessages,
            maxTokens: 1024,
          });

          const assistantMessage = result.choices[0]?.message?.content;
          if (!assistantMessage || typeof assistantMessage !== 'string') {
            throw new Error('No response from AI');
          }

          return { response: assistantMessage };
        } catch (error) {
          console.error('Chatbot error:', error);
          return { 
            response: 'Disculpa, estoy teniendo problemas técnicos en este momento. Por favor, contáctanos directamente por WhatsApp al **+56 9 9277 9872** o escríbenos a **contacto@forgeminechile.com**. ¡Estaremos encantados de ayudarte!' 
          };
        }
      }),
  }),

  // Blog Articles router
  blog: router({
    // Public: Get all published articles
    published: publicProcedure.query(async () => {
      return getPublishedArticles();
    }),

    // Public: Get article by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getArticleBySlug(input.slug);
      }),

    // Public: Get articles by category
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getArticlesByCategory(input.category);
      }),

    // Admin: Get all articles (including drafts)
    all: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      return getAllArticles();
    }),

    // Admin: Get article by ID
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return getArticleById(input.id);
      }),

    // Admin: Create article
    create: protectedProcedure
      .input(z.object({
        slug: z.string().min(3).max(255),
        title: z.string().min(3).max(255),
        excerpt: z.string().min(10),
        content: z.string().min(50),
        coverImage: z.string().optional(),
        category: z.enum(["soldadura", "blindaje", "reparacion", "equipos", "seguridad", "normativas"]),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        author: z.string().optional(),
        isPublished: z.enum(["yes", "no"]).optional(),
        readTimeMinutes: z.number().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return createArticle({
          ...input,
          publishedAt: input.isPublished === "yes" ? (input.publishedAt || new Date()) : undefined,
        });
      }),

    // Admin: Update article
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().min(3).max(255).optional(),
        title: z.string().min(3).max(255).optional(),
        excerpt: z.string().min(10).optional(),
        content: z.string().min(50).optional(),
        coverImage: z.string().optional().nullable(),
        category: z.enum(["soldadura", "blindaje", "reparacion", "equipos", "seguridad", "normativas"]).optional(),
        tags: z.array(z.string()).optional(),
        metaTitle: z.string().max(70).optional().nullable(),
        metaDescription: z.string().max(160).optional().nullable(),
        author: z.string().optional(),
        isPublished: z.enum(["yes", "no"]).optional(),
        readTimeMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { id, ...data } = input;
        // If publishing for the first time, set publishedAt
        if (data.isPublished === "yes") {
          const existing = await getArticleById(id);
          if (existing && !existing.publishedAt) {
            (data as any).publishedAt = new Date();
          }
        }
        await updateArticle(id, data);
        return { success: true };
      }),

    // Admin: Delete article
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await deleteArticle(input.id);
        return { success: true };
      }),
  }),

  // Site Settings router — brand configuration
  siteSettings: router({
    // Public: get all settings as key/value map
    get: publicProcedure.query(async () => {
      return getAllSiteSettings();
    }),

    // Admin: update a single setting
    update: protectedProcedure
      .input(z.object({ key: z.string().min(1), value: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await upsertSiteSetting(input.key, input.value);
        return { success: true };
      }),

    // Admin: update multiple settings at once
    updateMany: protectedProcedure
      .input(z.object({ settings: z.record(z.string(), z.string()) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        await upsertSiteSettings(input.settings);
        return { success: true };
      }),

    // Admin: upload logo — stores image in S3 and saves URL as logo_url setting
    uploadLogo: protectedProcedure
      .input(z.object({
        fileData: z.string(),
        fileName: z.string().default("logo"),
        contentType: z.string().default("image/png"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.contentType.split("/")[1] || "png";
        const result = await storagePut(`brand/logo.${ext}`, buffer, input.contentType);
        await upsertSiteSetting("logo_url", result.url);
        return { url: result.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
