import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, quotes, InsertQuote, Quote, costParameters, InsertCostParameter, CostParameter, generatedQuotations, InsertGeneratedQuotation, GeneratedQuotation, blogArticles, InsertBlogArticle, BlogArticle, siteSettings, SiteSetting } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Quote Management Functions
// ============================================

export async function createQuote(quoteData: Omit<InsertQuote, "id" | "createdAt" | "updatedAt" | "status" | "adminNotes" | "quotedPrice">): Promise<Quote | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create quote: database not available");
    return null;
  }

  try {
    const result = await db.insert(quotes).values({
      ...quoteData,
      status: "pending",
    });
    
    // Get the inserted quote
    const insertedId = result[0].insertId;
    const inserted = await db.select().from(quotes).where(eq(quotes.id, insertedId)).limit(1);
    return inserted[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create quote:", error);
    throw error;
  }
}

export async function getAllQuotes(): Promise<Quote[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotes: database not available");
    return [];
  }

  try {
    const result = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get quotes:", error);
    throw error;
  }
}

export async function getQuoteById(id: number): Promise<Quote | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quote: database not available");
    return null;
  }

  try {
    const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get quote:", error);
    throw error;
  }
}

export async function updateQuoteStatus(id: number, status: Quote["status"]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update quote status: database not available");
    return;
  }

  try {
    await db.update(quotes).set({ status }).where(eq(quotes.id, id));
  } catch (error) {
    console.error("[Database] Failed to update quote status:", error);
    throw error;
  }
}

export async function updateQuoteNotes(id: number, adminNotes?: string, quotedPrice?: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update quote notes: database not available");
    return;
  }

  try {
    const updateData: Partial<Quote> = {};
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (quotedPrice !== undefined) updateData.quotedPrice = quotedPrice;
    
    await db.update(quotes).set(updateData).where(eq(quotes.id, id));
  } catch (error) {
    console.error("[Database] Failed to update quote notes:", error);
    throw error;
  }
}

// ============================================
// Cost Parameters Functions
// ============================================

export async function getAllCostParameters(): Promise<CostParameter[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cost parameters: database not available");
    return [];
  }

  try {
    const result = await db.select().from(costParameters).orderBy(costParameters.category, costParameters.name);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get cost parameters:", error);
    throw error;
  }
}

export async function getCostParametersByCategory(category: string): Promise<CostParameter[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cost parameters: database not available");
    return [];
  }

  try {
    const result = await db.select().from(costParameters).where(eq(costParameters.category, category));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get cost parameters by category:", error);
    throw error;
  }
}

export async function createCostParameter(data: Omit<InsertCostParameter, "id" | "createdAt" | "updatedAt">): Promise<CostParameter | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create cost parameter: database not available");
    return null;
  }

  try {
    const result = await db.insert(costParameters).values(data);
    const insertedId = result[0].insertId;
    const inserted = await db.select().from(costParameters).where(eq(costParameters.id, insertedId)).limit(1);
    return inserted[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create cost parameter:", error);
    throw error;
  }
}

export async function updateCostParameter(id: number, data: Partial<Omit<InsertCostParameter, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update cost parameter: database not available");
    return;
  }

  try {
    await db.update(costParameters).set(data).where(eq(costParameters.id, id));
  } catch (error) {
    console.error("[Database] Failed to update cost parameter:", error);
    throw error;
  }
}

export async function deleteCostParameter(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete cost parameter: database not available");
    return;
  }

  try {
    await db.delete(costParameters).where(eq(costParameters.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete cost parameter:", error);
    throw error;
  }
}

export async function seedDefaultCostParameters(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed cost parameters: database not available");
    return;
  }

  // Check if parameters already exist
  const existing = await db.select().from(costParameters).limit(1);
  if (existing.length > 0) {
    return; // Already seeded
  }

  const defaultParams: Omit<InsertCostParameter, "id" | "createdAt" | "updatedAt">[] = [
    // Labor
    { category: "labor", name: "Soldador Certificado AWS", unitCost: 120000, unit: "día", description: "Tarifa diaria por soldador certificado" },
    { category: "labor", name: "Armador/Maestro", unitCost: 100000, unit: "día", description: "Tarifa diaria" },
    { category: "labor", name: "Ayudante", unitCost: 60000, unit: "día", description: "Tarifa diaria" },
    { category: "labor", name: "Supervisor", unitCost: 150000, unit: "día", description: "Tarifa diaria" },
    { category: "labor", name: "Técnico NDT", unitCost: 180000, unit: "día", description: "Tarifa diaria" },
    // Materials
    { category: "materials", name: "Alambre ESAB Dual Shield II 110 (15kg)", unitCost: 163104, unit: "rollo", supplier: "Otero Industrial" },
    { category: "materials", name: "Alambre ESAB Dual Shield II 80-Ni1 (15kg)", unitCost: 148890, unit: "rollo", supplier: "Prodalam" },
    { category: "materials", name: "Plancha 450 Brinell", unitCost: 3500, unit: "kg", supplier: "MultiAceros" },
    { category: "materials", name: "Plancha S690Q", unitCost: 4500, unit: "kg", supplier: "SSAB Chile" },
    { category: "materials", name: "Gas Mezcla 75%Ar/25%CO2 (50L)", unitCost: 85000, unit: "cilindro", supplier: "INDURA" },
    { category: "materials", name: "Gas CO2 Industrial (50L)", unitCost: 45000, unit: "cilindro", supplier: "INDURA" },
    { category: "materials", name: "Gas Propano (45kg)", unitCost: 62000, unit: "cilindro", supplier: "Gasco" },
    { category: "materials", name: "Oxígeno Industrial (50L)", unitCost: 55000, unit: "cilindro", supplier: "INDURA" },
    { category: "materials", name: "Wear Button Laminite Ø90mm", unitCost: 30000, unit: "unidad", supplier: "CR Mining" },
    { category: "materials", name: "Wear Button Laminite Ø40mm", unitCost: 7500, unit: "unidad", supplier: "CR Mining" },
    { category: "materials", name: "Heel Shroud", unitCost: 270000, unit: "unidad", supplier: "CR Mining" },
    { category: "materials", name: "Discos corte 7\"", unitCost: 2400, unit: "unidad", supplier: "Chrisco" },
    { category: "materials", name: "Discos desbaste 7\"", unitCost: 3400, unit: "unidad", supplier: "Chrisco" },
    { category: "materials", name: "Discos flap 7\"", unitCost: 4000, unit: "unidad", supplier: "Abrasmel" },
    // Equipment
    { category: "equipment", name: "Arriendo Máquina de Soldar", unitCost: 35000, unit: "día", description: "Por máquina" },
    { category: "equipment", name: "Arriendo Grúa Horquilla", unitCost: 80000, unit: "día", description: "Incluye operador" },
    { category: "equipment", name: "Arriendo Equipo Oxicorte", unitCost: 25000, unit: "día", description: "Set completo" },
    { category: "equipment", name: "Arriendo Generador Eléctrico", unitCost: 120000, unit: "día", description: "100 KVA" },
    { category: "equipment", name: "Arriendo Equipo NDT", unitCost: 150000, unit: "día", description: "Ultrasonido" },
    { category: "equipment", name: "Herramientas Menores", unitCost: 50000, unit: "global", description: "Por proyecto" },
    // Operational
    { category: "operational", name: "Hospedaje (persona/noche)", unitCost: 45000, unit: "noche", description: "Hotel estándar" },
    { category: "operational", name: "Alimentación (persona/día)", unitCost: 25000, unit: "día", description: "Almuerzo + cena + colaciones" },
    { category: "operational", name: "Transporte/Combustible", unitCost: 150000, unit: "global", description: "Por proyecto" },
    { category: "operational", name: "EPP y Seguridad", unitCost: 200000, unit: "global", description: "Por proyecto" },
    { category: "operational", name: "Movilización/Desmovilización", unitCost: 300000, unit: "global", description: "Ida y vuelta" },
  ];

  try {
    for (const param of defaultParams) {
      await db.insert(costParameters).values(param);
    }
    console.log("[Database] Default cost parameters seeded successfully");
  } catch (error) {
    console.error("[Database] Failed to seed cost parameters:", error);
    throw error;
  }
}

// ============================================
// Generated Quotations Functions
// ============================================

export async function createGeneratedQuotation(data: Omit<InsertGeneratedQuotation, "id" | "createdAt" | "updatedAt">): Promise<GeneratedQuotation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create quotation: database not available");
    return null;
  }

  try {
    const result = await db.insert(generatedQuotations).values(data);
    const insertedId = result[0].insertId;
    const inserted = await db.select().from(generatedQuotations).where(eq(generatedQuotations.id, insertedId)).limit(1);
    return inserted[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create quotation:", error);
    throw error;
  }
}

export async function getAllGeneratedQuotations(): Promise<GeneratedQuotation[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotations: database not available");
    return [];
  }

  try {
    const result = await db.select().from(generatedQuotations).orderBy(desc(generatedQuotations.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get quotations:", error);
    throw error;
  }
}

export async function getGeneratedQuotationById(id: number): Promise<GeneratedQuotation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotation: database not available");
    return null;
  }

  try {
    const result = await db.select().from(generatedQuotations).where(eq(generatedQuotations.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get quotation:", error);
    throw error;
  }
}

export async function updateGeneratedQuotation(id: number, data: Partial<Omit<InsertGeneratedQuotation, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update quotation: database not available");
    return;
  }

  try {
    await db.update(generatedQuotations).set(data).where(eq(generatedQuotations.id, id));
  } catch (error) {
    console.error("[Database] Failed to update quotation:", error);
    throw error;
  }
}

export async function deleteGeneratedQuotation(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete quotation: database not available");
    return;
  }

  try {
    await db.delete(generatedQuotations).where(eq(generatedQuotations.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete quotation:", error);
    throw error;
  }
}

export async function getNextQuotationNumber(): Promise<string> {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    return `COT-${now.getFullYear()}-001`;
  }

  try {
    const year = new Date().getFullYear();
    const result = await db.select().from(generatedQuotations)
      .where(sql`${generatedQuotations.quotationNumber} LIKE ${`COT-${year}-%`}`)
      .orderBy(desc(generatedQuotations.id))
      .limit(1);
    
    if (result.length === 0) {
      return `COT-${year}-001`;
    }
    
    const lastNumber = result[0].quotationNumber;
    const match = lastNumber.match(/COT-\d{4}-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `COT-${year}-${nextNum.toString().padStart(3, '0')}`;
    }
    
    return `COT-${year}-001`;
  } catch (error) {
    console.error("[Database] Failed to get next quotation number:", error);
    const now = new Date();
    return `COT-${now.getFullYear()}-001`;
  }
}

export async function getQuoteStats(): Promise<{
  total: number;
  pending: number;
  reviewing: number;
  quoted: number;
  accepted: number;
  completed: number;
  rejected: number;
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quote stats: database not available");
    return { total: 0, pending: 0, reviewing: 0, quoted: 0, accepted: 0, completed: 0, rejected: 0 };
  }

  try {
    const allQuotes = await db.select().from(quotes);
    
    return {
      total: allQuotes.length,
      pending: allQuotes.filter(q => q.status === "pending").length,
      reviewing: allQuotes.filter(q => q.status === "reviewing").length,
      quoted: allQuotes.filter(q => q.status === "quoted").length,
      accepted: allQuotes.filter(q => q.status === "accepted").length,
      completed: allQuotes.filter(q => q.status === "completed").length,
      rejected: allQuotes.filter(q => q.status === "rejected").length,
    };
  } catch (error) {
    console.error("[Database] Failed to get quote stats:", error);
    throw error;
  }
}


export async function getGeneratedQuotationByNumber(quotationNumber: string): Promise<GeneratedQuotation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotation: database not available");
    return null;
  }

  try {
    const result = await db.select().from(generatedQuotations).where(eq(generatedQuotations.quotationNumber, quotationNumber)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get quotation by number:", error);
    throw error;
  }
}


// ============================================
// Blog Articles Functions
// ============================================

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(blogArticles)
      .where(eq(blogArticles.isPublished, "yes"))
      .orderBy(desc(blogArticles.publishedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get published articles:", error);
    throw error;
  }
}

export async function getAllArticles(): Promise<BlogArticle[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(blogArticles)
      .orderBy(desc(blogArticles.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all articles:", error);
    throw error;
  }
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(blogArticles)
      .where(eq(blogArticles.slug, slug))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get article by slug:", error);
    throw error;
  }
}

export async function getArticleById(id: number): Promise<BlogArticle | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(blogArticles)
      .where(eq(blogArticles.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get article by id:", error);
    throw error;
  }
}

export async function createArticle(data: Omit<InsertBlogArticle, "id" | "createdAt" | "updatedAt">): Promise<BlogArticle | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(blogArticles).values(data);
    const insertedId = result[0].insertId;
    const inserted = await db.select().from(blogArticles).where(eq(blogArticles.id, insertedId)).limit(1);
    return inserted[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create article:", error);
    throw error;
  }
}

export async function updateArticle(id: number, data: Partial<Omit<InsertBlogArticle, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(blogArticles).set(data).where(eq(blogArticles.id, id));
  } catch (error) {
    console.error("[Database] Failed to update article:", error);
    throw error;
  }
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.delete(blogArticles).where(eq(blogArticles.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete article:", error);
    throw error;
  }
}

export async function getArticlesByCategory(category: string): Promise<BlogArticle[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(blogArticles)
      .where(eq(blogArticles.category, category as BlogArticle["category"]))
      .orderBy(desc(blogArticles.publishedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get articles by category:", error);
    throw error;
  }
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};

  try {
    const rows = await db.select().from(siteSettings);
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  } catch (error) {
    console.error("[Database] Failed to get site settings:", error);
    return {};
  }
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    return rows[0]?.value ?? null;
  } catch (error) {
    console.error("[Database] Failed to get site setting:", error);
    return null;
  }
}

export async function upsertSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert site setting: database not available");
    return;
  }

  try {
    await db.insert(siteSettings)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
  } catch (error) {
    console.error("[Database] Failed to upsert site setting:", error);
    throw error;
  }
}

export async function upsertSiteSettings(settings: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await upsertSiteSetting(key, value);
  }
}
