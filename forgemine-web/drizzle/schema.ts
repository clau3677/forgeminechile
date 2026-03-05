import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Quotes table for storing quote requests from the website form
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Contact Information
  contactName: varchar("contactName", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  position: varchar("position", { length: 255 }),
  
  // Equipment Information
  brand: varchar("brand", { length: 100 }).notNull(),
  equipmentType: varchar("equipmentType", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }),
  hoursOperation: varchar("hoursOperation", { length: 50 }),
  
  // Service Details
  selectedServices: json("selectedServices").$type<string[]>().notNull(),
  problemDescription: text("problemDescription").notNull(),
  urgency: mysqlEnum("urgency", ["normal", "priority", "urgent", "emergency"]).default("normal").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  preferredDate: varchar("preferredDate", { length: 50 }),
  additionalNotes: text("additionalNotes"),
  
  // Images (stored as JSON array of URLs or file references)
  images: json("images").$type<string[]>(),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "reviewing", "quoted", "accepted", "rejected", "completed"]).default("pending").notNull(),
  
  // Admin notes
  adminNotes: text("adminNotes"),
  quotedPrice: varchar("quotedPrice", { length: 50 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Cost parameters table for storing base costs used in quotation calculations
 */
export const costParameters = mysqlTable("costParameters", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 50 }).notNull(), // 'labor', 'materials', 'equipment', 'operational'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unitCost: int("unitCost").notNull(), // Cost in CLP
  unit: varchar("unit", { length: 50 }).notNull(), // 'day', 'kg', 'unit', 'cylinder', 'global'
  supplier: varchar("supplier", { length: 255 }),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CostParameter = typeof costParameters.$inferSelect;
export type InsertCostParameter = typeof costParameters.$inferInsert;

/**
 * Generated quotations table for storing formal quotations created for clients
 */
export const generatedQuotations = mysqlTable("generatedQuotations", {
  id: int("id").autoincrement().primaryKey(),
  quotationNumber: varchar("quotationNumber", { length: 50 }).notNull().unique(),
  
  // Client Information
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientRut: varchar("clientRut", { length: 20 }),
  clientAddress: varchar("clientAddress", { length: 500 }),
  clientCity: varchar("clientCity", { length: 100 }),
  clientContact: varchar("clientContact", { length: 255 }),
  clientPhone: varchar("clientPhone", { length: 50 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  
  // Equipment Information
  equipmentType: varchar("equipmentType", { length: 100 }).notNull(),
  equipmentBrand: varchar("equipmentBrand", { length: 100 }).notNull(),
  equipmentModel: varchar("equipmentModel", { length: 100 }).notNull(),
  equipmentSerial: varchar("equipmentSerial", { length: 100 }),
  equipmentCapacity: varchar("equipmentCapacity", { length: 50 }),
  equipmentLocation: varchar("equipmentLocation", { length: 255 }),
  
  // Service Details
  serviceType: mysqlEnum("serviceType", ["repair", "shielding", "reconstruction"]).notNull(),
  durationDays: int("durationDays").notNull(),
  
  // Cost Configuration
  materialsProvider: mysqlEnum("materialsProvider", ["forgemine", "client"]).default("forgemine").notNull(),
  equipmentProvider: mysqlEnum("equipmentProvider", ["forgemine", "client"]).default("forgemine").notNull(),
  operationalProvider: mysqlEnum("operationalProvider", ["forgemine", "client"]).default("forgemine").notNull(),
  
  // Original Costs (never change, used to restore when provider changes to FORGEMINE)
  originalMaterialsCost: int("originalMaterialsCost"),
  originalEquipmentCost: int("originalEquipmentCost"),
  originalOperationalCost: int("originalOperationalCost"),
  
  // Calculated Costs (stored in CLP, may be 0 if provider is client)
  laborCost: int("laborCost").notNull(),
  materialsCost: int("materialsCost").notNull(),
  equipmentCost: int("equipmentCost").notNull(),
  operationalCost: int("operationalCost").notNull(),
  subtotalCost: int("subtotalCost").notNull(),
  profitMargin: int("profitMargin").notNull(), // Percentage (e.g., 50 for 50%)
  profitAmount: int("profitAmount").notNull(),
  netPrice: int("netPrice").notNull(),
  ivaAmount: int("ivaAmount").notNull(),
  totalPrice: int("totalPrice").notNull(),
  
  // Cost breakdown (JSON for detailed items)
  costBreakdown: json("costBreakdown").$type<{
    labor: Array<{name: string, quantity: number, unitCost: number, total: number}>;
    materials: Array<{name: string, quantity: number, unitCost: number, total: number}>;
    equipment: Array<{name: string, quantity: number, unitCost: number, total: number}>;
    operational: Array<{name: string, quantity: number, unitCost: number, total: number}>;
  }>(),
  
  // Commercial Terms
  validityDays: int("validityDays").default(30).notNull(),
  paymentTerms: varchar("paymentTerms", { length: 255 }).default("50% anticipo / 50% entrega").notNull(),
  warrantyTerms: varchar("warrantyTerms", { length: 255 }),
  additionalNotes: text("additionalNotes"),
  
  // Status
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
  
  // PDF Storage
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  
  // Linked quote request (optional)
  linkedQuoteId: int("linkedQuoteId"),
  
  // Created by
  createdById: int("createdById"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type GeneratedQuotation = typeof generatedQuotations.$inferSelect;
export type InsertGeneratedQuotation = typeof generatedQuotations.$inferInsert;

/**
 * Blog articles table for technical content and SEO
 */
export const blogArticles = mysqlTable("blogArticles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: varchar("coverImage", { length: 500 }),
  category: mysqlEnum("category", ["soldadura", "blindaje", "reparacion", "equipos", "seguridad", "normativas"]).notNull(),
  tags: json("tags").$type<string[]>(),
  metaTitle: varchar("metaTitle", { length: 70 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  author: varchar("author", { length: 255 }).default("Equipo Técnico FORGEMINE").notNull(),
  isPublished: mysqlEnum("isPublished", ["yes", "no"]).default("no").notNull(),
  readTimeMinutes: int("readTimeMinutes").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type BlogArticle = typeof blogArticles.$inferSelect;
export type InsertBlogArticle = typeof blogArticles.$inferInsert;

/**
 * Site settings table — key/value store for admin-configurable site data
 * Keys: logo_url, company_name, company_legal_name, tagline, phone,
 *       email, address, social_linkedin, social_facebook, social_instagram,
 *       social_whatsapp, seo_title, seo_description, seo_og_image
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
