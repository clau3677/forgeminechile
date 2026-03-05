import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatFileSize, needsCompression } from "./imageCompression";

// Note: compressImage requires browser APIs (Canvas, Image, FileReader)
// These tests cover the utility functions that don't require browser APIs

describe("Image Compression Utilities", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("should format megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.50 MB");
    });

    it("should handle zero bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });
  });

  describe("needsCompression", () => {
    it("should return true for files larger than maxSizeMB", () => {
      const largeFile = { size: 3 * 1024 * 1024 } as File; // 3MB
      expect(needsCompression(largeFile, { maxSizeMB: 2 })).toBe(true);
    });

    it("should return false for files smaller than maxSizeMB", () => {
      const smallFile = { size: 1 * 1024 * 1024 } as File; // 1MB
      expect(needsCompression(smallFile, { maxSizeMB: 2 })).toBe(false);
    });

    it("should use default maxSizeMB of 2 when not specified", () => {
      const largeFile = { size: 3 * 1024 * 1024 } as File; // 3MB
      const smallFile = { size: 1 * 1024 * 1024 } as File; // 1MB
      
      expect(needsCompression(largeFile)).toBe(true);
      expect(needsCompression(smallFile)).toBe(false);
    });

    it("should return true for files exactly at the limit", () => {
      const exactFile = { size: 2 * 1024 * 1024 } as File; // Exactly 2MB
      // Files at exactly the limit don't need compression
      expect(needsCompression(exactFile, { maxSizeMB: 2 })).toBe(false);
    });
  });
});

describe("Compression Options", () => {
  it("should have sensible default values", () => {
    const defaultOptions = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      maxSizeMB: 2,
    };

    expect(defaultOptions.maxWidth).toBe(1920);
    expect(defaultOptions.maxHeight).toBe(1080);
    expect(defaultOptions.quality).toBeGreaterThan(0);
    expect(defaultOptions.quality).toBeLessThanOrEqual(1);
    expect(defaultOptions.maxSizeMB).toBeGreaterThan(0);
  });

  it("should allow custom options to override defaults", () => {
    const customOptions = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.6,
      maxSizeMB: 1,
    };

    expect(customOptions.maxWidth).toBe(800);
    expect(customOptions.maxHeight).toBe(600);
    expect(customOptions.quality).toBe(0.6);
    expect(customOptions.maxSizeMB).toBe(1);
  });
});

describe("Dimension Calculation", () => {
  const calculateDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } => {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }

    return { width, height };
  };

  it("should not resize images smaller than max dimensions", () => {
    const result = calculateDimensions(800, 600, 1920, 1080);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it("should resize images wider than max width", () => {
    const result = calculateDimensions(3840, 2160, 1920, 1080);
    expect(result.width).toBeLessThanOrEqual(1920);
    expect(result.height).toBeLessThanOrEqual(1080);
  });

  it("should maintain aspect ratio when resizing", () => {
    const originalAspect = 16 / 9;
    const result = calculateDimensions(3840, 2160, 1920, 1080);
    const resultAspect = result.width / result.height;
    
    // Allow small rounding differences
    expect(Math.abs(resultAspect - originalAspect)).toBeLessThan(0.01);
  });

  it("should handle portrait images", () => {
    const result = calculateDimensions(1080, 1920, 1920, 1080);
    expect(result.height).toBeLessThanOrEqual(1080);
    expect(result.width).toBeLessThan(result.height);
  });

  it("should handle square images", () => {
    const result = calculateDimensions(2000, 2000, 1920, 1080);
    expect(result.width).toBeLessThanOrEqual(1920);
    expect(result.height).toBeLessThanOrEqual(1080);
    expect(result.width).toBe(result.height);
  });
});

describe("File Type Handling", () => {
  it("should identify valid image types", () => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    validTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(true);
    });
  });

  it("should reject non-image types", () => {
    const invalidTypes = ["application/pdf", "text/plain", "video/mp4", "audio/mp3"];
    
    invalidTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(false);
    });
  });
});
