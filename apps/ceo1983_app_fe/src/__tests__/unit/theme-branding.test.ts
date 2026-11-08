import { describe, it, expect } from "vitest";

export const BRAND_COLORS = {
  PRIORITY_1_RED: "#DC2626",
  PRIORITY_1_BURGUNDY: "#C8102E",
  PRIORITY_2_AMBER: "#F59E0B",
  PRIORITY_2_GOLD: "#D97706",
  PRIORITY_3_NAVY: "#003B95",
  PRIORITY_3_GREEN: "#059669",
  BACKGROUND_DARK_OBSIDIAN: "#0F172A",
  BACKGROUND_LIGHT: "#FFFFFF",
};

export const PROHIBITED_COLORS = [
  "#8B5CF6", // Purple
  "#A855F7", // Purple 500
  "#EC4899", // Pink
  "#F43F5E", // Rose/Pink neon
  "#00FF00", // Neon Green
];

export function validateThemeColor(hex: string): {
  isValid: boolean;
  priorityLevel: number | null;
  reason?: string;
} {
  const upper = hex.toUpperCase();
  if (PROHIBITED_COLORS.map((c) => c.toUpperCase()).includes(upper)) {
    return {
      isValid: false,
      priorityLevel: null,
      reason: "Màu bị cấm theo quy chuẩn thương hiệu CEO 1983 (Không dùng tím, hồng, neon)",
    };
  }

  if (
    upper === BRAND_COLORS.PRIORITY_1_RED.toUpperCase() ||
    upper === BRAND_COLORS.PRIORITY_1_BURGUNDY.toUpperCase()
  ) {
    return { isValid: true, priorityLevel: 1 };
  }

  if (
    upper === BRAND_COLORS.PRIORITY_2_AMBER.toUpperCase() ||
    upper === BRAND_COLORS.PRIORITY_2_GOLD.toUpperCase()
  ) {
    return { isValid: true, priorityLevel: 2 };
  }

  if (
    upper === BRAND_COLORS.PRIORITY_3_NAVY.toUpperCase() ||
    upper === BRAND_COLORS.PRIORITY_3_GREEN.toUpperCase()
  ) {
    return { isValid: true, priorityLevel: 3 };
  }

  return { isValid: true, priorityLevel: null };
}

export function validateButtonClasses(className: string): {
  isCompliant: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  if (className.includes("bg-gradient") || className.includes("from-")) {
    violations.push("Cấm gradient trên nút bấm hành động (Phải dùng solid Navy #003B95)");
  }
  if (className.includes("bg-purple") || className.includes("bg-pink")) {
    violations.push("Cấm dùng màu tím hoặc hồng trên nút bấm");
  }
  return {
    isCompliant: violations.length === 0,
    violations,
  };
}

describe("CEO 1983 Brand 3-Color Hierarchy & Button Compliance", () => {
  describe("validateThemeColor", () => {
    it("should classify Red as Priority 1 (Action & Urgency)", () => {
      const res = validateThemeColor("#DC2626");
      expect(res.isValid).toBe(true);
      expect(res.priorityLevel).toBe(1);
    });

    it("should classify Amber Gold as Priority 2 (In-Progress & VIP)", () => {
      const res = validateThemeColor("#F59E0B");
      expect(res.isValid).toBe(true);
      expect(res.priorityLevel).toBe(2);
    });

    it("should classify Navy Blue as Priority 3 (Core Identity)", () => {
      const res = validateThemeColor("#003B95");
      expect(res.isValid).toBe(true);
      expect(res.priorityLevel).toBe(3);
    });

    it("should reject prohibited colors (Purple & Pink)", () => {
      const resPurple = validateThemeColor("#8B5CF6");
      expect(resPurple.isValid).toBe(false);
      expect(resPurple.reason).toContain("Màu bị cấm");

      const resPink = validateThemeColor("#EC4899");
      expect(resPink.isValid).toBe(false);
    });
  });

  describe("validateButtonClasses", () => {
    it("should accept solid Navy #003B95 button classes", () => {
      const btn = "bg-[#003B95] text-white hover:bg-[#002B70] px-4 py-2 rounded-xl font-bold shadow-md";
      const check = validateButtonClasses(btn);
      expect(check.isCompliant).toBe(true);
      expect(check.violations.length).toBe(0);
    });

    it("should flag violation if button uses multi-color gradient", () => {
      const gradientBtn = "bg-gradient-to-r from-red-500 to-purple-600 text-white";
      const check = validateButtonClasses(gradientBtn);
      expect(check.isCompliant).toBe(false);
      expect(check.violations).toContain(
        "Cấm gradient trên nút bấm hành động (Phải dùng solid Navy #003B95)"
      );
    });
  });
});

