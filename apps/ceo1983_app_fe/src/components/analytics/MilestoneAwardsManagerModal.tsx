import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  Award,
  Gift,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  MilestoneAward,
  getMilestoneAwards,
  saveMilestoneAward,
  deleteMilestoneAward,
} from "@/lib/milestone-awards";

interface MilestoneAwardsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MilestoneAwardsManagerModal: React.FC<MilestoneAwardsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [awards, setAwards] = useState<MilestoneAward[]>(() => getMilestoneAwards());
  const [selectedCategory, setSelectedCategory] = useState<MilestoneAward["category"] | "all">("all");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [category, setCategory] = useState<MilestoneAward["category"]>("top_referrals");
  const [targetCount, setTargetCount] = useState<number>(10);
  const [targetUnit, setTargetUnit] = useState<string>("người");
  const [awardName, setAwardName] = useState<string>("");
  const [awardDescription, setAwardDescription] = useState<string>("");
  const [rewardType, setRewardType] = useState<MilestoneAward["rewardType"]>("voucher");
  const [rewardValueStr, setRewardValueStr] = useState<string>("");

  if (!isOpen || typeof document === "undefined") return null;

  const refreshList = () => {
    setAwards(getMilestoneAwards());
  };

  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardName.trim() || !rewardValueStr.trim() || targetCount <= 0) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin giải thưởng!");
      return;
    }

    const categoryNames: Record<MilestoneAward["category"], string> = {
      top_referrals: "Top Người Giới Thiệu",
      top_revenue: "Doanh Thu Giao Thương",
      top_connect: "Kết Nối Mạng Lưới",
      top_opportunities: "Cơ Hội Kinh Doanh",
      top_events_meetings: "Tham Gia Sự Kiện",
    };

    const newAward: MilestoneAward = {
      id: `award-${Date.now()}`,
      category,
      categoryName: categoryNames[category],
      targetCount: Number(targetCount),
      targetUnit: targetUnit.trim() || "người",
      awardName: awardName.trim(),
      awardDescription: awardDescription.trim() || rewardValueStr.trim(),
      rewardType,
      rewardValueStr: rewardValueStr.trim(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveMilestoneAward(newAward);
    refreshList();
    setIsAdding(false);
    setAwardName("");
    setRewardValueStr("");
    setAwardDescription("");
    toast.success("Đã tạo mới giải thưởng mốc thống kê và bắn xuống App CEO 1983 thành công!");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giải thưởng mốc này?")) return;
    deleteMilestoneAward(id);
    refreshList();
    toast.success("Đã xóa giải thưởng");
  };

  const handleToggleStatus = (award: MilestoneAward) => {
    const nextStatus = award.status === "active" ? "inactive" : "active";
    saveMilestoneAward({ ...award, status: nextStatus });
    refreshList();
    toast.info(`Đã ${nextStatus === "active" ? "kích hoạt" : "tạm dừng"} giải thưởng`);
  };

  const filteredAwards = awards.filter(
    (a) => selectedCategory === "all" || a.category === selectedCategory
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-hidden animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#DC2626] via-[#B8860B] to-[#003B95] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white text-[#003B95] shadow-md">
              <Trophy className="size-6 text-amber-500 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold uppercase tracking-wide">
                  Quản Lý Giải Thưởng Thống Kê (Gamification Awards)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                  Bắn Trực Tiếp Xuống App
                </span>
              </div>
              <p className="text-xs text-white/85 mt-0.5">
                Thiết lập các mốc thành tích (giới thiệu người mới, doanh thu, kết nối...) để tự động trao giải thưởng &amp; hiển thị thanh mở khóa trên Mobile App
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Action & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "all", label: "Tất cả giải thưởng" },
                { key: "top_referrals", label: "Top Người Giới Thiệu" },
                { key: "top_revenue", label: "Doanh Thu Giao Thương" },
                { key: "top_connect", label: "Kết Nối Mạng Lưới" },
                { key: "top_opportunities", label: "Cơ Hội Kinh Doanh" },
                { key: "top_events_meetings", label: "Tham Gia Sự Kiện" },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === c.key
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{isAdding ? "Đóng Form Thêm" : "Tạo Mốc Giải Thưởng Mới"}</span>
            </button>
          </div>

          {/* Form Tạo Mới Giải Thưởng */}
          {isAdding && (
            <form onSubmit={handleCreateAward} className="p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                <Sparkles className="size-4" />
                <span>Thêm Mốc Giải Thưởng &amp; Phần Quà Tự Động</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Danh mục thống kê</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const next = e.target.value as MilestoneAward["category"];
                      setCategory(next);
                      if (next === "top_referrals") setTargetUnit("người");
                      else if (next === "top_revenue") setTargetUnit("triệu VNĐ");
                      else if (next === "top_connect") setTargetUnit("kết nối");
                      else if (next === "top_opportunities") setTargetUnit("cơ hội");
                      else setTargetUnit("sự kiện");
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <option value="top_referrals">Top Người Giới Thiệu</option>
                    <option value="top_revenue">Doanh Thu Giao Thương</option>
                    <option value="top_connect">Kết Nối Mạng Lưới</option>
                    <option value="top_opportunities">Cơ Hội Kinh Doanh</option>
                    <option value="top_events_meetings">Tham Gia Sự Kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Mốc số lượng đạt được</label>
                  <input
                    type="number"
                    min={1}
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    placeholder="Ví dụ: 10, 25, 50..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Đơn vị đo lường</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="người, kết nối, triệu VNĐ..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1">Tên giải thưởng / Danh hiệu</label>
                  <input
                    type="text"
                    required
                    value={awardName}
                    onChange={(e) => setAwardName(e.target.value)}
                    placeholder="Ví dụ: Đại Sứ Kết Nối Vàng, Cúp Doanh Nhân Kim Cương..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Loại phần thưởng</label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as any)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <option value="voucher">Voucher Giảm Giá B2B</option>
                    <option value="trophy">Cúp / Kỷ Niệm Chương</option>
                    <option value="badge">Huy Hiệu & Thẻ Danh Dự</option>
                    <option value="gift">Quà Tặng Doanh Nghiệp</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Giá trị phần thưởng thực tế (Hiện trên thanh mở khóa)
                  </label>
                  <input
                    type="text"
                    required
                    value={rewardValueStr}
                    onChange={(e) => setRewardValueStr(e.target.value)}
                    placeholder="Ví dụ: Voucher 5.000.000đ mua 1 tặng 1, Kỷ niệm chương mạ vàng..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-secondary text-xs font-bold text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md cursor-pointer"
                >
                  Lưu &amp; Bắn Xuống Mobile App
                </button>
              </div>
            </form>
          )}

          {/* Danh Sách Các Mốc Giải Thưởng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAwards.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between hover:shadow-md transition space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {item.categoryName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status === "active" ? "Đang phát động" : "Đã tạm dừng"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                      {item.rewardType === "trophy" ? "🏆" : item.rewardType === "voucher" ? "🎟️" : "🎁"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground leading-snug">
                        {item.awardName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Mốc yêu cầu:{" "}
                        <strong className="text-amber-600 dark:text-amber-400">
                          {item.targetCount} {item.targetUnit}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/40 text-xs font-medium text-foreground">
                    🎁 Phần thưởng: <strong className="text-primary">{item.rewardValueStr}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {item.status === "active" ? "Tạm dừng" : "Kích hoạt lại"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            ✨ Mọi thay đổi giải thưởng sẽ được tự động đồng bộ ngay xuống Mobile App CEO 1983
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

