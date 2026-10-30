import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Gift,
  Tag,
  Percent,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Sparkles,
  QrCode,
  Check,
  ShoppingBag,
  Clock,
  Layers,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { QrCanvas } from "@/components/member/QrCanvas";

export type PerkDiscountType = "percent" | "bogo" | "cash" | "gift" | "free";

export interface MemberPerkFormData {
  id: string;
  voucherCode: string;
  title: string;
  description: string;
  discountType: PerkDiscountType;
  discountValue: string; // "Giảm 30%", "Mua 1 Tặng 1", "Giảm 500.000đ"
  partner: string;
  category: string;
  productName: string;
  applicableLocation: string;
  address: string;
  hotline: string;
  validFrom: string;
  validUntil: string;
  qrPayload: string;
  creatorName?: string;
  status: "active" | "pending" | "hidden";
  createdAt: string;
}

interface MemberPerkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPerk: MemberPerkFormData) => void;
  defaultMemberName?: string;
  defaultCompanyName?: string;
  defaultPhone?: string;
}

const DISCOUNT_TYPES = [
  { id: "percent" as PerkDiscountType, label: "% Giảm giá", icon: Percent, badge: "-20%, -30%..." },
  { id: "bogo" as PerkDiscountType, label: "Mua 1 Tặng 1", icon: Gift, badge: "Mua 1 Tặng 1" },
  { id: "cash" as PerkDiscountType, label: "Giảm tiền mặt", icon: Tag, badge: "Trừ tiền trực tiếp" },
  { id: "gift" as PerkDiscountType, label: "Quà tặng DN", icon: Sparkles, badge: "Tặng kèm quà VIP" },
  { id: "free" as PerkDiscountType, label: "Miễn phí", icon: ShoppingBag, badge: "Free trải nghiệm" },
];

const CATEGORIES = [
  "Thương mại & Bán lẻ",
  "Dịch vụ Doanh nghiệp & Luật",
  "Tài chính & Kế toán",
  "Ẩm thực & Nhà hàng F&B",
  "Golf & Nghỉ dưỡng 5 sao",
  "Công nghệ & Viễn thông",
  "Y tế & Sức khỏe",
  "Nội thất & Xây dựng",
  "Giáo dục & Đào tạo",
  "Khác",
];

export const MemberPerkCreateModal: React.FC<MemberPerkCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMemberName = "",
  defaultCompanyName = "",
  defaultPhone = "",
}) => {
  const todayIso = new Date().toISOString().split("T")[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const nextYearIso = nextYearDate.toISOString().split("T")[0];

  // Random voucher code generator
  const genVoucher = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CEO83-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const [voucherCode, setVoucherCode] = useState(genVoucher);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<PerkDiscountType>("percent");
  const [percentRate, setPercentRate] = useState("20");
  const [cashAmount, setCashAmount] = useState("500000");
  const [giftDetail, setGiftDetail] = useState("Tặng 01 Bộ Quà Doanh Nhân Cao Cấp");
  const [partner, setPartner] = useState(defaultCompanyName || "Doanh Nghiệp Hội Viên CEO 1983");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [productName, setProductName] = useState("");
  const [applicableLocation, setApplicableLocation] = useState("Tại Trụ sở & Tất cả chi nhánh trên toàn quốc");
  const [address, setAddress] = useState("");
  const [hotline, setHotline] = useState(defaultPhone || "");
  const [validFrom, setValidFrom] = useState(todayIso);
  const [validUntil, setValidUntil] = useState(nextYearIso);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || typeof document === "undefined") return null;

  // Resolve discount value label
  const computeDiscountValue = () => {
    if (discountType === "percent") return `Giảm ${percentRate}%`;
    if (discountType === "bogo") return "Mua 1 Tặng 1";
    if (discountType === "cash") {
      const num = Number(cashAmount) || 0;
      return `Giảm ${num.toLocaleString("vi-VN")}đ`;
    }
    if (discountType === "gift") return "Tặng quà Doanh nhân";
    return "Miễn phí 100%";
  };

  const currentDiscountValue = computeDiscountValue();

  // QR Code payload
  const qrPayload = JSON.stringify({
    type: "CEO1983_PERK_VOUCHER",
    voucher: voucherCode,
    company: partner,
    discount: currentDiscountValue,
    expiry: validUntil,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập hoặc tạo mã voucher");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề ưu đãi");
      return;
    }
    if (!productName.trim()) {
      toast.error("Vui lòng nhập sản phẩm / dịch vụ áp dụng");
      return;
    }
    if (!description.trim()) {
      toast.error("Vui lòng nhập nội dung chi tiết ưu đãi");
      return;
    }

    setSubmitting(true);
    try {
      const newPerk: MemberPerkFormData = {
        id: `perk-mem-${Date.now()}`,
        voucherCode: voucherCode.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        discountType,
        discountValue: currentDiscountValue,
        partner: partner.trim(),
        category,
        productName: productName.trim(),
        applicableLocation: applicableLocation.trim(),
        address: address.trim(),
        hotline: hotline.trim(),
        validFrom,
        validUntil,
        qrPayload,
        creatorName: defaultMemberName || "Hội viên CEO 1983",
        status: "active",
        createdAt: new Date().toISOString(),
      };

      // Persist to localStorage
      try {
        const existing = localStorage.getItem("vba_member_custom_perks");
        const list: MemberPerkFormData[] = existing ? JSON.parse(existing) : [];
        list.unshift(newPerk);
        localStorage.setItem("vba_member_custom_perks", JSON.stringify(list));
      } catch {}

      toast.success("✓ Đã đăng ưu đãi doanh nghiệp thành công cho toàn thể Hội viên CEO 1983!");
      onSuccess(newPerk);
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu ưu đãi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="w-full max-w-[560px] max-h-[92dvh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#003B95] via-blue-900 to-[#002766] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
              <Gift className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                <span>Đăng Ưu Đãi Doanh Nghiệp</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  B2B CEO 1983
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Chia sẻ đặc quyền ưu đãi dành riêng cho cộng đồng Hội viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 [scrollbar-width:none]">
          {/* 1. Mã Voucher & Tạo tự động */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Tag className="size-3.5 text-amber-600" />
                Mã Voucher Ưu Đãi (*)
              </label>
              <button
                type="button"
                onClick={() => setVoucherCode(genVoucher())}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="size-3" /> Tạo mã ngẫu nhiên
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="VD: CEO83-VIP2026"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white font-mono font-bold tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center shrink-0 shadow-sm">
                {currentDiscountValue}
              </span>
            </div>
          </div>

          {/* 2. Loại Ưu Đãi Đa Dạng (như app thương mại) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="size-3.5 text-blue-600" />
              Hình thức ưu đãi (*)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DISCOUNT_TYPES.map((dt) => {
                const Icon = dt.icon;
                const isSelected = discountType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDiscountType(dt.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                      isSelected
                        ? "bg-[#003B95]/10 dark:bg-blue-900/30 border-[#003B95] text-[#003B95] dark:text-blue-300 ring-1 ring-[#003B95]"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="size-4" />
                      {isSelected && <Check className="size-3.5 text-[#003B95]" />}
                    </div>
                    <span className="text-xs font-bold">{dt.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{dt.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chi tiết theo từng loại ưu đãi */}
          {discountType === "percent" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <label className="text-xs font-bold shrink-0 text-slate-700 dark:text-slate-300">Tỷ lệ giảm (%):</label>
              <div className="flex gap-1.5 flex-wrap">
                {["10", "15", "20", "25", "30", "50"].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPercentRate(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      percentRate === rate
                        ? "bg-[#DC2626] text-white shadow-sm"
                        : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="99"
                value={percentRate}
                onChange={(e) => setPercentRate(e.target.value)}
                className="w-16 px-2 py-1 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          )}

          {discountType === "cash" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số tiền giảm trừ trực tiếp (VNĐ):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="50000"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold"
                />
                <span className="text-xs font-bold text-slate-500 self-center">VNĐ</span>
              </div>
            </div>
          )}

          {discountType === "gift" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quà tặng kèm theo:</label>
              <input
                type="text"
                value={giftDetail}
                onChange={(e) => setGiftDetail(e.target.value)}
                placeholder="VD: 01 Hộp Trà Thượng Hạng mạ vàng..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          )}

          {/* 3. Tiêu Đề Ưu Đãi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Tiêu đề ưu đãi (*)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giảm 30% Chi Phí Thi Công Nội Thất Biệt Thự & Văn Phòng"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#003B95]"
              required
            />
          </div>

          {/* 4. Doanh Nghiệp & Sản Phẩm Áp Dụng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="size-3 text-slate-500" />
                Doanh nghiệp phát hành (*)
              </label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Tên công ty / Doanh nghiệp"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ShoppingBag className="size-3 text-slate-500" />
                Sản phẩm / Dịch vụ áp dụng (*)
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="VD: Gói thiết kế kiến trúc, Khóa học CEO..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* 5. Danh Mục & Nơi Áp Dụng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lĩnh vực / Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="size-3 text-red-500" />
                Nơi áp dụng ưu đãi (*)
              </label>
              <input
                type="text"
                value={applicableLocation}
                onChange={(e) => setApplicableLocation(e.target.value)}
                placeholder="VD: Showroom Hà Nội, Online, Toàn quốc..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* 6. Địa Chỉ Cụ Thể & Hotline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Địa chỉ chi tiết showroom / văn phòng
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, quận, thành phố..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="size-3 text-green-600" />
                Hotline liên hệ / Đặt hẹn
              </label>
              <input
                type="tel"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="VD: 0988 123 456"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* 7. Thời hạn hiệu lực */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="size-3 text-slate-500" /> Ngày bắt đầu
              </label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="size-3 text-amber-600" /> Hạn áp dụng
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* 8. Nội Dung Chi Tiết */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="size-3 text-slate-500" />
              Nội dung & Điều kiện áp dụng ưu đãi (*)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả quyền lợi chi tiết dành cho hội viên CEO 1983, hướng dẫn xuất trình mã QR hoặc đọc mã voucher khi liên hệ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003B95]"
              required
            />
          </div>

          {/* 9. Preview Mã QR Quét Tại Điểm Bán */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
              <QrCanvas value={qrPayload} size={64} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <QrCode className="size-3" /> Mã QR Ưu Đãi Động
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {voucherCode} - {currentDiscountValue}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hội viên khác quét mã này tại điểm bán để nhận ưu đãi tức thì
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DC2626] to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold shadow-md shadow-red-500/25 cursor-pointer disabled:opacity-50 transition"
            >
              <Check className="size-4" />
              <span>{submitting ? "Đang đăng ưu đãi..." : "Phát Hành Ưu Đãi B2B"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
