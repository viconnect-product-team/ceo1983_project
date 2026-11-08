import { describe, it, expect } from "vitest";
import {
  formatDisplayDate,
  formatFullVnDate,
  formatDisplayDateTime,
} from "../../lib/date-format";
import {
  sanitizePhoneNumber,
  getVNTimeGreeting,
  safeRandomUUID,
} from "../../lib/utils";

describe("Frontend Utilities & Date Formatters", () => {
  describe("formatDisplayDate", () => {
    it("should format valid date into dd/mm/yyyy", () => {
      const formatted = formatDisplayDate("2026-11-08T09:30:00.000Z");
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/2026$/);
    });

    it("should support withWeekday option", () => {
      const formatted = formatDisplayDate("2026-11-08T12:00:00.000Z", {
        withWeekday: true,
      });
      expect(formatted).toMatch(/^(CN|T2|T3|T4|T5|T6|T7), \d{2}\/\d{2}\/2026$/);
    });

    it("should support shortYear option", () => {
      const formatted = formatDisplayDate("2026-11-08T12:00:00.000Z", {
        shortYear: true,
      });
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/26$/);
    });

    it("should return fallback dash for null, undefined or empty input", () => {
      expect(formatDisplayDate(null)).toBe("—");
      expect(formatDisplayDate(undefined)).toBe("—");
      expect(formatDisplayDate("—")).toBe("—");
      expect(formatDisplayDate("-")).toBe("—");
    });
  });

  describe("formatFullVnDate", () => {
    it("should return full Vietnamese date string", () => {
      const full = formatFullVnDate("2026-11-08T12:00:00.000Z");
      expect(full).toMatch(
        /^(Chủ Nhật|Thứ Hai|Thứ Ba|Thứ Tư|Thứ Năm|Thứ Sáu|Thứ Bảy), \d{2}\/\d{2}\/2026$/
      );
    });

    it("should return empty string for null or invalid date", () => {
      expect(formatFullVnDate(null)).toBe("");
      expect(formatFullVnDate("invalid-date-string")).toBe("");
    });
  });

  describe("sanitizePhoneNumber", () => {
    it("should strip non-digit characters and trim to 11 digits", () => {
      expect(sanitizePhoneNumber("+84 983 123 456")).toBe("84983123456");
      expect(sanitizePhoneNumber("098.345.6789")).toBe("0983456789");
      expect(sanitizePhoneNumber("0983-456-78901234")).toBe("09834567890");
    });

    it("should handle empty or null safely", () => {
      expect(sanitizePhoneNumber("")).toBe("");
      expect(sanitizePhoneNumber(null as any)).toBe("");
    });
  });

  describe("getVNTimeGreeting", () => {
    it("should return a polite Vietnamese greeting", () => {
      const greeting = getVNTimeGreeting();
      expect([
        "Chào buổi sáng,",
        "Chào buổi chiều,",
        "Chào buổi tối,",
      ]).toContain(greeting);
    });
  });

  describe("safeRandomUUID", () => {
    it("should generate a valid UUID v4 compliant string", () => {
      const uuid = safeRandomUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });
});

