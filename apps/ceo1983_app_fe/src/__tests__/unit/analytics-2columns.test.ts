import { describe, it, expect } from "vitest";

export interface AnalyticsCategoryConfig {
  unit: string;
  col1Label: string;
  col1Unit: string;
  col2Label?: string;
  col2Unit?: string;
  col3Label?: string;
  col3Unit?: string;
  col4Label?: string;
  col4Unit?: string;
  timelineLabel: string;
}

export const CATEGORY_CHART_CONFIG: Record<string, AnalyticsCategoryConfig> = {
  top_opportunities: {
    unit: "Cơ hội",
    col1Label: "Cơ hội mở mới",
    col1Unit: "Cơ hội",
    col2Label: "Giá trị tăng (Tỷ)",
    col2Unit: "Tỷ VNĐ",
    col3Label: "Giá trị đàm phán",
    col3Unit: "Tỷ VNĐ",
    col4Label: "Đã khớp lệnh / chốt",
    col4Unit: "Deal",
    timelineLabel: "Tổng luồng cơ hội",
  },
  top_events_meetings: {
    unit: "Lượt",
    col1Label: "Đăng ký tham gia",
    col1Unit: "Lượt",
    col2Label: "Điểm danh thực tế",
    col2Unit: "Lượt",
    col3Label: "Cuộc họp ban",
    col3Unit: "Cuộc",
    col4Label: "Chờ check-in",
    col4Unit: "Lượt",
    timelineLabel: "Tổng lượt sự kiện",
  },
  top_referrals: {
    unit: "Hội viên",
    col1Label: "Hội viên giới thiệu",
    col1Unit: "Hội viên",
    col2Label: "Đã kết nạp",
    col2Unit: "Hội viên",
    col3Label: "Nhiệm vụ thưởng",
    col3Unit: "Nhiệm vụ",
    col4Label: "Điểm thưởng (x10)",
    col4Unit: "Điểm",
    timelineLabel: "Tổng hội viên mới",
  },
  external_shares: {
    unit: "Lượt click",
    col1Label: "Số lượng (Lượt click/chia sẻ)",
    col1Unit: "Lượt",
    col2Label: "Giá trị (VNĐ)",
    col2Unit: "Tr đ",
    col3Label: undefined,
    col3Unit: undefined,
    col4Label: undefined,
    col4Unit: undefined,
    timelineLabel: "Tổng luồng chia sẻ",
  },
};

export function formatAnalyticsShareValue(val: number): string {
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} Tỷ đ`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)} Tr đ`;
  }
  return val > 0 ? `${val} đ` : "0 đ";
}

describe("Association Analytics Categories & 2-Column Sharing Specification", () => {
  describe("external_shares Category Specification", () => {
    const config = CATEGORY_CHART_CONFIG.external_shares;

    it("should have exactly 2 active metric columns (Số lượng and Giá trị)", () => {
      expect(config.col1Label).toBeDefined();
      expect(config.col1Label).toContain("Số lượng");

      expect(config.col2Label).toBeDefined();
      expect(config.col2Label).toContain("Giá trị");

      // Columns 3 and 4 must be strictly undefined for external_shares
      expect(config.col3Label).toBeUndefined();
      expect(config.col4Label).toBeUndefined();
    });

    it("should count exactly 2 defined column labels", () => {
      const activeColumns = [
        config.col1Label,
        config.col2Label,
        config.col3Label,
        config.col4Label,
      ].filter((col) => col !== undefined);

      expect(activeColumns.length).toBe(2);
    });
  });

  describe("Standard Categories (4 Columns)", () => {
    it("should maintain 4 full metric columns for top_opportunities", () => {
      const opp = CATEGORY_CHART_CONFIG.top_opportunities;
      const activeColumns = [
        opp.col1Label,
        opp.col2Label,
        opp.col3Label,
        opp.col4Label,
      ].filter((col) => col !== undefined);

      expect(activeColumns.length).toBe(4);
    });

    it("should maintain 4 full metric columns for top_events_meetings", () => {
      const evt = CATEGORY_CHART_CONFIG.top_events_meetings;
      const activeColumns = [
        evt.col1Label,
        evt.col2Label,
        evt.col3Label,
        evt.col4Label,
      ].filter((col) => col !== undefined);

      expect(activeColumns.length).toBe(4);
    });
  });

  describe("formatAnalyticsShareValue", () => {
    it("should format billions into 'Tỷ đ'", () => {
      expect(formatAnalyticsShareValue(2_500_000_000)).toBe("2.5 Tỷ đ");
    });

    it("should format millions into 'Tr đ'", () => {
      expect(formatAnalyticsShareValue(15_400_000)).toBe("15.4 Tr đ");
    });

    it("should format 0 as '0 đ'", () => {
      expect(formatAnalyticsShareValue(0)).toBe("0 đ");
    });
  });
});

