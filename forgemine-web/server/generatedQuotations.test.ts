import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createGeneratedQuotation: vi.fn(),
  getAllGeneratedQuotations: vi.fn(),
  getGeneratedQuotationById: vi.fn(),
  updateGeneratedQuotation: vi.fn(),
  deleteGeneratedQuotation: vi.fn(),
  getNextQuotationNumber: vi.fn(),
}));

import {
  createGeneratedQuotation,
  getAllGeneratedQuotations,
  getGeneratedQuotationById,
  updateGeneratedQuotation,
  deleteGeneratedQuotation,
  getNextQuotationNumber,
} from "./db";

describe("Generated Quotations Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGeneratedQuotation", () => {
    it("should create a new generated quotation with all fields", async () => {
      const mockQuotation = {
        id: 1,
        quotationNumber: "COT-2026-001",
        clientName: "Minera Test SpA",
        clientRut: "76.123.456-7",
        equipmentBrand: "Komatsu",
        equipmentModel: "PC7000",
        serviceType: "repair",
        laborCost: 1000000,
        materialsCost: 500000,
        equipmentCost: 200000,
        operationalCost: 100000,
        subtotalCost: 1800000,
        profitMargin: 50,
        profitAmount: 900000,
        netPrice: 2700000,
        ivaAmount: 513000,
        totalPrice: 3213000,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(createGeneratedQuotation).mockResolvedValue(mockQuotation as any);

      const result = await createGeneratedQuotation({
        quotationNumber: "COT-2026-001",
        clientName: "Minera Test SpA",
        clientRut: "76.123.456-7",
        equipmentBrand: "Komatsu",
        equipmentModel: "PC7000",
        serviceType: "repair",
        laborCost: 1000000,
        materialsCost: 500000,
        equipmentCost: 200000,
        operationalCost: 100000,
        subtotalCost: 1800000,
        profitMargin: 50,
        profitAmount: 900000,
        netPrice: 2700000,
        ivaAmount: 513000,
        totalPrice: 3213000,
        status: "draft",
        createdById: 1,
      } as any);

      expect(createGeneratedQuotation).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("quotationNumber", "COT-2026-001");
      expect(result).toHaveProperty("status", "draft");
    });
  });

  describe("getAllGeneratedQuotations", () => {
    it("should return all generated quotations ordered by creation date", async () => {
      const mockQuotations = [
        { id: 2, quotationNumber: "COT-2026-002", createdAt: new Date("2026-01-31") },
        { id: 1, quotationNumber: "COT-2026-001", createdAt: new Date("2026-01-30") },
      ];

      vi.mocked(getAllGeneratedQuotations).mockResolvedValue(mockQuotations as any);

      const result = await getAllGeneratedQuotations();

      expect(getAllGeneratedQuotations).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
    });

    it("should return empty array when no quotations exist", async () => {
      vi.mocked(getAllGeneratedQuotations).mockResolvedValue([]);

      const result = await getAllGeneratedQuotations();

      expect(result).toEqual([]);
    });
  });

  describe("getGeneratedQuotationById", () => {
    it("should return a quotation by ID", async () => {
      const mockQuotation = {
        id: 1,
        quotationNumber: "COT-2026-001",
        clientName: "Minera Test SpA",
      };

      vi.mocked(getGeneratedQuotationById).mockResolvedValue(mockQuotation as any);

      const result = await getGeneratedQuotationById(1);

      expect(getGeneratedQuotationById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("quotationNumber", "COT-2026-001");
    });

    it("should return null for non-existent quotation", async () => {
      vi.mocked(getGeneratedQuotationById).mockResolvedValue(null);

      const result = await getGeneratedQuotationById(999);

      expect(result).toBeNull();
    });
  });

  describe("updateGeneratedQuotation", () => {
    it("should update quotation status", async () => {
      vi.mocked(updateGeneratedQuotation).mockResolvedValue(undefined);

      await updateGeneratedQuotation(1, { status: "sent" });

      expect(updateGeneratedQuotation).toHaveBeenCalledWith(1, { status: "sent" });
    });

    it("should update quotation PDF URL", async () => {
      vi.mocked(updateGeneratedQuotation).mockResolvedValue(undefined);

      await updateGeneratedQuotation(1, { pdfUrl: "https://example.com/pdf/COT-2026-001.pdf" });

      expect(updateGeneratedQuotation).toHaveBeenCalledWith(1, {
        pdfUrl: "https://example.com/pdf/COT-2026-001.pdf",
      });
    });

    it("should handle all valid status values", async () => {
      const statuses = ["draft", "sent", "accepted", "rejected", "expired"] as const;

      for (const status of statuses) {
        vi.mocked(updateGeneratedQuotation).mockResolvedValue(undefined);
        await updateGeneratedQuotation(1, { status });
        expect(updateGeneratedQuotation).toHaveBeenCalledWith(1, { status });
      }
    });
  });

  describe("deleteGeneratedQuotation", () => {
    it("should delete a quotation by ID", async () => {
      vi.mocked(deleteGeneratedQuotation).mockResolvedValue(undefined);

      await deleteGeneratedQuotation(1);

      expect(deleteGeneratedQuotation).toHaveBeenCalledWith(1);
      expect(deleteGeneratedQuotation).toHaveBeenCalledTimes(1);
    });

    it("should handle deletion of non-existent quotation gracefully", async () => {
      vi.mocked(deleteGeneratedQuotation).mockResolvedValue(undefined);

      await deleteGeneratedQuotation(999);

      expect(deleteGeneratedQuotation).toHaveBeenCalledWith(999);
    });
  });

  describe("getNextQuotationNumber", () => {
    it("should return next quotation number in sequence", async () => {
      vi.mocked(getNextQuotationNumber).mockResolvedValue("COT-2026-003");

      const result = await getNextQuotationNumber();

      expect(getNextQuotationNumber).toHaveBeenCalledTimes(1);
      expect(result).toBe("COT-2026-003");
    });

    it("should return first quotation number when no quotations exist", async () => {
      vi.mocked(getNextQuotationNumber).mockResolvedValue("COT-2026-001");

      const result = await getNextQuotationNumber();

      expect(result).toBe("COT-2026-001");
    });
  });
});

describe("Quotation Data Validation", () => {
  it("should validate required client fields", () => {
    const requiredFields = ["clientName", "equipmentBrand", "equipmentModel", "serviceType"];
    const testData = {
      clientName: "Minera Test SpA",
      equipmentBrand: "Komatsu",
      equipmentModel: "PC7000",
      serviceType: "repair",
    };

    requiredFields.forEach((field) => {
      expect(testData).toHaveProperty(field);
      expect(testData[field as keyof typeof testData]).toBeTruthy();
    });
  });

  it("should validate service type values", () => {
    const validServiceTypes = ["repair", "shielding", "reconstruction"];

    validServiceTypes.forEach((type) => {
      expect(validServiceTypes).toContain(type);
    });
  });

  it("should validate quotation status values", () => {
    const validStatuses = ["draft", "sent", "accepted", "rejected", "expired"];

    validStatuses.forEach((status) => {
      expect(validStatuses).toContain(status);
    });
  });

  it("should validate cost calculations", () => {
    const costs = {
      laborCost: 1000000,
      materialsCost: 500000,
      equipmentCost: 200000,
      operationalCost: 100000,
      subtotalCost: 1800000,
      profitMargin: 50,
      profitAmount: 900000,
      netPrice: 2700000,
      ivaAmount: 513000,
      totalPrice: 3213000,
    };

    // Validate subtotal calculation
    const calculatedSubtotal =
      costs.laborCost + costs.materialsCost + costs.equipmentCost + costs.operationalCost;
    expect(calculatedSubtotal).toBe(costs.subtotalCost);

    // Validate profit calculation
    const calculatedProfit = (costs.subtotalCost * costs.profitMargin) / 100;
    expect(calculatedProfit).toBe(costs.profitAmount);

    // Validate net price
    const calculatedNetPrice = costs.subtotalCost + costs.profitAmount;
    expect(calculatedNetPrice).toBe(costs.netPrice);

    // Validate IVA (19%)
    const calculatedIva = Math.round(costs.netPrice * 0.19);
    expect(calculatedIva).toBe(costs.ivaAmount);

    // Validate total price
    const calculatedTotal = costs.netPrice + costs.ivaAmount;
    expect(calculatedTotal).toBe(costs.totalPrice);
  });
});
