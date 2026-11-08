import { describe, it, expect } from "vitest";

export interface DealProposal {
  id: string;
  memberId: string;
  memberName: string;
  dealValue: number;
  contact: string;
  message?: string;
  createdAt: string;
}

export function calculateDealMetrics(
  dealValue: number | undefined,
  budgetRef: number
) {
  if (!dealValue || budgetRef <= 0) {
    return {
      dealPercent: null,
      profitPercent: null,
      badgeText: "Thương lượng",
      isProfitable: false,
    };
  }

  const dealPercent = Math.round((dealValue / budgetRef) * 100);
  const profitPercent = dealPercent - 100;
  const isProfitable = profitPercent >= 0;

  return {
    dealPercent,
    profitPercent,
    badgeText: isProfitable ? `+${profitPercent}% lời` : `${profitPercent}%`,
    isProfitable,
  };
}

export function rankDealsForPoster(
  deals: DealProposal[],
  budgetRef: number
): (DealProposal & { dealPercent: number | null; profitPercent: number | null })[] {
  return [...deals]
    .map((deal) => {
      const metrics = calculateDealMetrics(deal.dealValue, budgetRef);
      return {
        ...deal,
        dealPercent: metrics.dealPercent,
        profitPercent: metrics.profitPercent,
      };
    })
    .sort((a, b) => {
      // Sắp xếp theo giá trị deal cao nhất (lời nhất cho người đăng)
      const valA = a.dealValue || 0;
      const valB = b.dealValue || 0;
      return valB - valA;
    });
}

describe("B2B Opportunity Deal Margin & Profit Ranking", () => {
  const budgetRef = 100_000_000; // 100 Triệu VNĐ

  describe("calculateDealMetrics", () => {
    it("should calculate +20% profit margin when proposed deal is 120M against 100M budget", () => {
      const metrics = calculateDealMetrics(120_000_000, budgetRef);
      expect(metrics.dealPercent).toBe(120);
      expect(metrics.profitPercent).toBe(20);
      expect(metrics.badgeText).toBe("+20% lời");
      expect(metrics.isProfitable).toBe(true);
    });

    it("should calculate +0% profit margin when deal equals exact budget", () => {
      const metrics = calculateDealMetrics(100_000_000, budgetRef);
      expect(metrics.dealPercent).toBe(100);
      expect(metrics.profitPercent).toBe(0);
      expect(metrics.badgeText).toBe("+0% lời");
      expect(metrics.isProfitable).toBe(true);
    });

    it("should calculate -15% margin when proposed deal is 85M", () => {
      const metrics = calculateDealMetrics(85_000_000, budgetRef);
      expect(metrics.dealPercent).toBe(85);
      expect(metrics.profitPercent).toBe(-15);
      expect(metrics.badgeText).toBe("-15%");
      expect(metrics.isProfitable).toBe(false);
    });

    it("should return null for undefined deal or zero budget", () => {
      const metricsZero = calculateDealMetrics(50_000_000, 0);
      expect(metricsZero.dealPercent).toBeNull();
      expect(metricsZero.badgeText).toBe("Thương lượng");

      const metricsUndef = calculateDealMetrics(undefined, budgetRef);
      expect(metricsUndef.dealPercent).toBeNull();
    });
  });

  describe("rankDealsForPoster", () => {
    it("should sort deals descending with the most profitable deal at top (Rank #1)", () => {
      const deals: DealProposal[] = [
        {
          id: "deal-1",
          memberId: "m-1",
          memberName: "Nguyễn Văn A",
          dealValue: 90_000_000,
          contact: "0983111111",
          createdAt: "2026-11-08T10:00:00Z",
        },
        {
          id: "deal-2",
          memberId: "m-2",
          memberName: "Phạm Văn B (Top Bid)",
          dealValue: 150_000_000,
          contact: "0983222222",
          createdAt: "2026-11-08T10:15:00Z",
        },
        {
          id: "deal-3",
          memberId: "m-3",
          memberName: "Trần Thị C",
          dealValue: 110_000_000,
          contact: "0983333333",
          createdAt: "2026-11-08T10:30:00Z",
        },
      ];

      const ranked = rankDealsForPoster(deals, budgetRef);
      expect(ranked[0].id).toBe("deal-2");
      expect(ranked[0].dealValue).toBe(150_000_000);
      expect(ranked[0].dealPercent).toBe(150);
      expect(ranked[0].profitPercent).toBe(50);

      expect(ranked[1].id).toBe("deal-3");
      expect(ranked[1].dealValue).toBe(110_000_000);

      expect(ranked[2].id).toBe("deal-1");
      expect(ranked[2].dealValue).toBe(90_000_000);
      expect(ranked[2].profitPercent).toBe(-10);
    });
  });
});

