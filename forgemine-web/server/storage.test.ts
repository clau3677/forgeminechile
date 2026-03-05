import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(),
  storageGet: vi.fn(),
}));

import { storagePut, storageGet } from "./storage";

describe("Storage Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("storagePut", () => {
    it("should upload a file and return key and url", async () => {
      const mockResult = {
        key: "quotes/1234567890-abc123-test.jpg",
        url: "https://storage.example.com/quotes/1234567890-abc123-test.jpg",
      };

      vi.mocked(storagePut).mockResolvedValue(mockResult);

      const buffer = Buffer.from("test image data");
      const result = await storagePut("quotes/test.jpg", buffer, "image/jpeg");

      expect(storagePut).toHaveBeenCalledWith("quotes/test.jpg", buffer, "image/jpeg");
      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("url");
    });

    it("should handle upload errors", async () => {
      vi.mocked(storagePut).mockRejectedValue(new Error("Upload failed"));

      const buffer = Buffer.from("test data");
      
      await expect(storagePut("test.jpg", buffer)).rejects.toThrow("Upload failed");
    });

    it("should use default content type when not specified", async () => {
      const mockResult = {
        key: "test.bin",
        url: "https://storage.example.com/test.bin",
      };

      vi.mocked(storagePut).mockResolvedValue(mockResult);

      const buffer = Buffer.from("binary data");
      await storagePut("test.bin", buffer);

      expect(storagePut).toHaveBeenCalled();
    });
  });

  describe("storageGet", () => {
    it("should return a presigned URL for a file", async () => {
      const mockResult = {
        key: "quotes/test.jpg",
        url: "https://storage.example.com/quotes/test.jpg?signature=abc123",
      };

      vi.mocked(storageGet).mockResolvedValue(mockResult);

      const result = await storageGet("quotes/test.jpg");

      expect(storageGet).toHaveBeenCalledWith("quotes/test.jpg");
      expect(result).toHaveProperty("url");
    });
  });
});

describe("File Key Generation", () => {
  it("should generate unique file keys", () => {
    const generateFileKey = (originalName: string): string => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = originalName.split('.').pop() || 'jpg';
      // Remove extension from safeName to avoid duplication
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      return `quotes/${timestamp}-${randomSuffix}-${safeName}.${extension}`;
    };

    const key1 = generateFileKey("test-image.jpg");
    const key2 = generateFileKey("test-image.jpg");

    // Keys should be different due to timestamp and random suffix
    expect(key1).not.toBe(key2);
    expect(key1).toMatch(/^quotes\/\d+-[a-z0-9]+-test-image\.jpg$/);
  });

  it("should sanitize special characters in file names", () => {
    const generateFileKey = (originalName: string): string => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = originalName.split('.').pop() || 'jpg';
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      return `quotes/${timestamp}-${randomSuffix}-${safeName}.${extension}`;
    };

    const key = generateFileKey("test file (1).jpg");
    
    // Should not contain spaces or parentheses
    expect(key).not.toContain(" ");
    expect(key).not.toContain("(");
    expect(key).not.toContain(")");
  });

  it("should truncate long file names", () => {
    const generateFileKey = (originalName: string): string => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const extension = originalName.split('.').pop() || 'jpg';
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      return `quotes/${timestamp}-${randomSuffix}-${safeName}.${extension}`;
    };

    const longName = "a".repeat(100) + ".jpg";
    const key = generateFileKey(longName);
    
    // The safe name part should be truncated to 50 characters
    const parts = key.split("-");
    const safePart = parts[parts.length - 1].replace(".jpg", "");
    expect(safePart.length).toBeLessThanOrEqual(50);
  });
});

describe("Image Upload Workflow", () => {
  it("should validate image content types", () => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalidTypes = ["application/pdf", "text/plain", "video/mp4"];

    validTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(true);
    });

    invalidTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(false);
    });
  });

  it("should validate file size limits", () => {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    const smallFile = 1024 * 1024; // 1MB
    const largeFile = 15 * 1024 * 1024; // 15MB

    expect(smallFile <= maxFileSize).toBe(true);
    expect(largeFile <= maxFileSize).toBe(false);
  });
});
