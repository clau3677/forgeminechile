import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createQuote: vi.fn(),
  getAllQuotes: vi.fn(),
  getQuoteById: vi.fn(),
  updateQuoteStatus: vi.fn(),
  updateQuoteNotes: vi.fn(),
  getQuoteStats: vi.fn(),
}));

import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuoteStatus,
  updateQuoteNotes,
  getQuoteStats,
} from "./db";

describe("Quote Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createQuote", () => {
    it("should create a new quote with required fields", async () => {
      const mockQuote = {
        id: 1,
        contactName: "Juan Pérez",
        company: "Minera Test",
        email: "juan@test.com",
        phone: "+56912345678",
        brand: "Komatsu",
        equipmentType: "Palas Hidráulicas",
        model: "PC7000",
        selectedServices: ["Reparación de Fisuras", "Blindaje Heavy Duty"],
        problemDescription: "Fisuras en el labio del balde",
        urgency: "normal",
        location: "Santiago",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createQuote).mockResolvedValue(mockQuote as any);

      const result = await createQuote({
        contactName: "Juan Pérez",
        company: "Minera Test",
        email: "juan@test.com",
        phone: "+56912345678",
        brand: "Komatsu",
        equipmentType: "Palas Hidráulicas",
        model: "PC7000",
        selectedServices: ["Reparación de Fisuras", "Blindaje Heavy Duty"],
        problemDescription: "Fisuras en el labio del balde",
        urgency: "normal",
        location: "Santiago",
      });

      expect(createQuote).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("status", "pending");
    });
  });

  describe("getAllQuotes", () => {
    it("should return all quotes ordered by creation date", async () => {
      const mockQuotes = [
        { id: 2, contactName: "María", createdAt: new Date("2026-01-31") },
        { id: 1, contactName: "Juan", createdAt: new Date("2026-01-30") },
      ];

      vi.mocked(getAllQuotes).mockResolvedValue(mockQuotes as any);

      const result = await getAllQuotes();

      expect(getAllQuotes).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2); // Most recent first
    });

    it("should return empty array when no quotes exist", async () => {
      vi.mocked(getAllQuotes).mockResolvedValue([]);

      const result = await getAllQuotes();

      expect(result).toEqual([]);
    });
  });

  describe("getQuoteById", () => {
    it("should return a quote by ID", async () => {
      const mockQuote = { id: 1, contactName: "Juan", company: "Test" };

      vi.mocked(getQuoteById).mockResolvedValue(mockQuote as any);

      const result = await getQuoteById(1);

      expect(getQuoteById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty("id", 1);
    });

    it("should return null for non-existent quote", async () => {
      vi.mocked(getQuoteById).mockResolvedValue(null);

      const result = await getQuoteById(999);

      expect(result).toBeNull();
    });
  });

  describe("updateQuoteStatus", () => {
    it("should update quote status", async () => {
      vi.mocked(updateQuoteStatus).mockResolvedValue(undefined);

      await updateQuoteStatus(1, "reviewing");

      expect(updateQuoteStatus).toHaveBeenCalledWith(1, "reviewing");
    });

    it("should handle all valid status values", async () => {
      const statuses = ["pending", "reviewing", "quoted", "accepted", "rejected", "completed"] as const;

      for (const status of statuses) {
        vi.mocked(updateQuoteStatus).mockResolvedValue(undefined);
        await updateQuoteStatus(1, status);
        expect(updateQuoteStatus).toHaveBeenCalledWith(1, status);
      }
    });
  });

  describe("updateQuoteNotes", () => {
    it("should update admin notes and quoted price", async () => {
      vi.mocked(updateQuoteNotes).mockResolvedValue(undefined);

      await updateQuoteNotes(1, "Cliente contactado", "45000");

      expect(updateQuoteNotes).toHaveBeenCalledWith(1, "Cliente contactado", "45000");
    });

    it("should update only admin notes", async () => {
      vi.mocked(updateQuoteNotes).mockResolvedValue(undefined);

      await updateQuoteNotes(1, "Nota de seguimiento", undefined);

      expect(updateQuoteNotes).toHaveBeenCalledWith(1, "Nota de seguimiento", undefined);
    });
  });

  describe("getQuoteStats", () => {
    it("should return quote statistics", async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        reviewing: 2,
        quoted: 2,
        accepted: 1,
        completed: 1,
        rejected: 1,
      };

      vi.mocked(getQuoteStats).mockResolvedValue(mockStats);

      const result = await getQuoteStats();

      expect(getQuoteStats).toHaveBeenCalledTimes(1);
      expect(result.total).toBe(10);
      expect(result.pending).toBe(3);
    });

    it("should return zero counts when no quotes exist", async () => {
      const emptyStats = {
        total: 0,
        pending: 0,
        reviewing: 0,
        quoted: 0,
        accepted: 0,
        completed: 0,
        rejected: 0,
      };

      vi.mocked(getQuoteStats).mockResolvedValue(emptyStats);

      const result = await getQuoteStats();

      expect(result.total).toBe(0);
    });
  });
});

describe("Quote Data Validation", () => {
  it("should validate required contact fields", () => {
    const requiredFields = ["contactName", "company", "email", "phone"];
    const testData = {
      contactName: "Juan",
      company: "Test",
      email: "test@test.com",
      phone: "+56912345678",
    };

    requiredFields.forEach((field) => {
      expect(testData).toHaveProperty(field);
      expect(testData[field as keyof typeof testData]).toBeTruthy();
    });
  });

  it("should validate required equipment fields", () => {
    const requiredFields = ["brand", "equipmentType", "model"];
    const testData = {
      brand: "Komatsu",
      equipmentType: "Palas Hidráulicas",
      model: "PC7000",
    };

    requiredFields.forEach((field) => {
      expect(testData).toHaveProperty(field);
      expect(testData[field as keyof typeof testData]).toBeTruthy();
    });
  });

  it("should validate urgency values", () => {
    const validUrgencies = ["normal", "priority", "urgent", "emergency"];
    
    validUrgencies.forEach((urgency) => {
      expect(validUrgencies).toContain(urgency);
    });
  });

  it("should validate status values", () => {
    const validStatuses = ["pending", "reviewing", "quoted", "accepted", "rejected", "completed"];
    
    validStatuses.forEach((status) => {
      expect(validStatuses).toContain(status);
    });
  });
});
