/**
 * Quản Lý Giải Thưởng & Cột Mốc Thống Kê Gamification (CEO 1983)
 * - Ban Điều Hành cấu hình giải thưởng tại Web CRM
 * - Tự động bắn xuống Mobile App và hiển thị thanh tiến trình mở khóa giải thưởng
 */

export interface MilestoneAward {
  id: string;
  category:
    | "top_referrals"
    | "top_revenue"
    | "top_connect"
    | "top_opportunities"
    | "top_events_meetings";
  categoryName: string;
  targetCount: number; // Mốc số lượng, ví dụ: 10, 25, 50
  targetUnit: string; // "người giới thiệu", "kết nối", "cơ hội", "buổi họp", "triệu VNĐ"
  awardName: string; // Tên giải thưởng
  awardDescription: string;
  rewardType: "voucher" | "gift" | "trophy" | "badge";
  rewardValueStr: string; // "Voucher 5.000.000đ", "Kỷ niệm chương Đại Sứ", "Cúp Vinh Danh Vàng"
  status: "active" | "inactive";
  createdAt: string;
}

const STORAGE_AWARDS = "vba_milestone_awards";

export const DEFAULT_MILESTONE_AWARDS: MilestoneAward[] = [
  // 1. Giới thiệu Hội Viên
  {
    id: "award-ref-10",
    category: "top_referrals",
    categoryName: "Top Người Giới Thiệu",
    targetCount: 10,
    targetUnit: "người",
    awardName: "Đại Sứ Kết Nối Đồng Niên",
    awardDescription: "Tặng Voucher Ưu đãi 5.000.000đ áp dụng tại tất cả doanh nghiệp hội viên",
    rewardType: "voucher",
    rewardValueStr: "Voucher B2B 5.000.000đ",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "award-ref-25",
    category: "top_referrals",
    categoryName: "Top Người Giới Thiệu",
    targetCount: 25,
    targetUnit: "người",
    awardName: "Kỷ Niệm Chương Đại Sứ Bạc",
    awardDescription: "Trao kỷ niệm chương Đại Sứ CEO 1983 tại Gala thường niên + Bảng vinh danh",
    rewardType: "trophy",
    rewardValueStr: "Kỷ niệm chương mạ bạc & Huy hiệu",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "award-ref-50",
    category: "top_referrals",
    categoryName: "Top Người Giới Thiệu",
    targetCount: 50,
    targetUnit: "người",
    awardName: "Cúp Đại Sứ Kim Cương & Miễn Hội Phí 1 Năm",
    awardDescription: "Đặc quyền miễn 100% hội phí thường niên 1 năm + Cúp Vinh danh Kim Cương tại Đại Hội",
    rewardType: "trophy",
    rewardValueStr: "Cúp Kim Cương + Miễn hội phí 1 năm",
    status: "active",
    createdAt: new Date().toISOString(),
  },

  // 2. Doanh thu Giao thương
  {
    id: "award-rev-500",
    category: "top_revenue",
    categoryName: "Doanh Thu Giao Thương",
    targetCount: 500,
    targetUnit: "triệu VNĐ",
    awardName: "Ngôi Sao Giao Thương Khởi Sắc",
    awardDescription: "Gói truyền thông bài PR Doanh nghiệp trên Cổng thông tin Hiệp hội",
    rewardType: "voucher",
    rewardValueStr: "Gói PR Truyền thông 10.000.000đ",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "award-rev-2000",
    category: "top_revenue",
    categoryName: "Doanh Thu Giao Thương",
    targetCount: 2000,
    targetUnit: "triệu VNĐ",
    awardName: "Cúp Doanh Nhân Bạc 2 Tỷ Đồng",
    awardDescription: "Vinh danh doanh nghiệp có đóng góp thương mại xuất sắc",
    rewardType: "trophy",
    rewardValueStr: "Cúp Vinh danh Doanh nhân Bạc",
    status: "active",
    createdAt: new Date().toISOString(),
  },

  // 3. Kết nối mạng lưới 1-on-1
  {
    id: "award-conn-20",
    category: "top_connect",
    categoryName: "Kết Nối Mạng Lưới 1-on-1",
    targetCount: 20,
    targetUnit: "cuộc gặp 1-on-1",
    awardName: "Hội Viên Kết Nối Năng Động",
    awardDescription: "Tặng Combo Voucher Coffee & Teabreak tại các điểm hẹn liên kết",
    rewardType: "voucher",
    rewardValueStr: "Combo Voucher Teabreak 1.000.000đ",
    status: "active",
    createdAt: new Date().toISOString(),
  },

  // 4. Cơ hội kinh doanh B2B
  {
    id: "award-opp-10",
    category: "top_opportunities",
    categoryName: "Cơ Hội Kinh Doanh B2B",
    targetCount: 10,
    targetUnit: "cơ hội B2B",
    awardName: "Người Trao Cơ Hội Vàng",
    awardDescription: "Voucher tài trợ gian hàng triển lãm B2B tại sự kiện thường niên",
    rewardType: "voucher",
    rewardValueStr: "Gian hàng B2B miễn phí tại Gala",
    status: "active",
    createdAt: new Date().toISOString(),
  },

  // 5. Tham gia sự kiện & họp ban
  {
    id: "award-event-15",
    category: "top_events_meetings",
    categoryName: "Tham Gia Sự Kiện & Họp Ban",
    targetCount: 15,
    targetUnit: "sự kiện",
    awardName: "Hội Viên Gắn Kết Xuất Sắc",
    awardDescription: "Thẻ VIP ưu tiên bàn đại biểu danh dự tại mọi sự kiện của CLB",
    rewardType: "badge",
    rewardValueStr: "Thẻ VIP Đại biểu Danh dự",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export function getMilestoneAwards(): MilestoneAward[] {
  if (typeof window === "undefined") return DEFAULT_MILESTONE_AWARDS;
  try {
    const raw = localStorage.getItem(STORAGE_AWARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_AWARDS, JSON.stringify(DEFAULT_MILESTONE_AWARDS));
      return DEFAULT_MILESTONE_AWARDS;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_MILESTONE_AWARDS;
  } catch {
    return DEFAULT_MILESTONE_AWARDS;
  }
}

export function saveMilestoneAward(award: MilestoneAward): void {
  const current = getMilestoneAwards();
  const idx = current.findIndex((a) => a.id === award.id);
  let updated: MilestoneAward[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = award;
  } else {
    updated = [award, ...current];
  }

  try {
    localStorage.setItem(STORAGE_AWARDS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("vba_milestone_awards_updated", { detail: award }));
  } catch {}
}

export function deleteMilestoneAward(id: string): void {
  const current = getMilestoneAwards();
  const updated = current.filter((a) => a.id !== id);
  try {
    localStorage.setItem(STORAGE_AWARDS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("vba_milestone_awards_updated", { detail: { id, deleted: true } }));
  } catch {}
}

export function getAwardsByCategory(
  category: MilestoneAward["category"]
): MilestoneAward[] {
  const all = getMilestoneAwards();
  return all
    .filter((a) => a.category === category && a.status === "active")
    .sort((a, b) => a.targetCount - b.targetCount);
}

