import React, { useState, useEffect } from "react";
import { Handshake, X, Sparkles, Building2, Package, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { Sponsor, SponsorPackage } from "@/lib/sponsors.functions";
import { listSponsorPackagesFn } from "@/lib/sponsors.functions";
import { VndCurrencyInput } from "@/components/dashboard/VndCurrencyInput";
import { useServerData } from "@/hooks/use-server-data";

export interface SponsorDraft {
  name: string;
  sponsorType: "regular" | "new";
  packageType: "cash" | "in_kind";
  inKindDescription?: string;
  tier: Sponsor["tier"];
  contact: string;
  email: string;
  phone: string;
  amount: number;
  since: string;
  status: "active" | "expired";
}

interface SponsorModalProps {
  open: boolean;
  initial?: Sponsor | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (draft: SponsorDraft) => void;
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 text-foreground";
const labelCls = "mb-1.5 block text-xs font-semibold text-foreground";

export function SponsorModal({
  open,
  initial,
  submitting = false,
  onClose,
  onSubmit,
}: SponsorModalProps) {
  const t = useT();

  // Load available sponsor packages
  const { data: packages } = useServerData<SponsorPackage[]>(() => listSponsorPackagesFn(), []);

  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [draft, setDraft] = useState<SponsorDraft>({
    name: "",
    sponsorType: "regular",
    packageType: "cash",
    inKindDescription: "",
    tier: "gold",
    contact: "",
    email: "",
    phone: "",
    amount: 0,
    since: new Date().toISOString().slice(0, 10),
    status: "active",
  });

  useEffect(() => {
    if (open) {
      if (initial) {
        setDraft({
          name: initial.name || "",
          sponsorType: initial.sponsorType || "regular",
          packageType: initial.packageType || "cash",
          inKindDescription: initial.inKindDescription || "",
          tier: initial.tier || "gold",
          contact: initial.contact || "",
          email: initial.email || "",
          phone: initial.phone || "",
          amount: initial.amount || 0,
          since: initial.since || new Date().toISOString().slice(0, 10),
          status: initial.status || "active",
        });
        setSelectedPkgId("");
      } else {
        setDraft({
          name: "",
          sponsorType: "regular",
          packageType: "cash",
          inKindDescription: "",
          tier: "gold",
          contact: "",
          email: "",
          phone: "",
          amount: 50000000,
          since: new Date().toISOString().slice(0, 10),
          status: "active",
        });
        setSelectedPkgId("");
      }
    }
  }, [open, initial]);

  if (!open) return null;

  // Handle selecting an existing package to auto-populate fields
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    if (!pkgId) return;

    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setDraft((prev) => ({
        ...prev,
        tier: pkg.tier,
        packageType: pkg.packageType || "cash",
        amount: pkg.price || 0,
        inKindDescription: pkg.inKindDescription || prev.inKindDescription,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(draft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative flex flex-col w-full max-w-xl my-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {initial ? "Chỉnh Sửa Nhà Tài Trợ" : "Thêm Mới Nhà Tài Trợ"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {initial ? "Cập nhật hồ sơ đối tác và giá trị tài trợ" : "Khởi tạo thông tin doanh nghiệp đồng hành tài trợ"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 overscroll-contain">
            {/* TRƯỜNG CHỌN GÓI TÀI TRỢ CÓ SẴN (TỰ ĐỘNG BÓC TÁCH) */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5" htmlFor="select-pkg">
                  <Package className="h-4 w-4" />
                  <span>Áp Dụng Gói Tài Trợ Sẵn Có</span>
                </label>
                <span className="text-[10px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                  Tự động điền dữ liệu
                </span>
              </div>
              <select
                id="select-pkg"
                value={selectedPkgId}
                onChange={(e) => handleSelectPackage(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="">-- Chọn gói tài trợ để tự động bóc tách thông tin hoặc nhập tùy chỉnh --</option>
                {packages.map((pkg) => {
                  const typeLabel = pkg.packageType === "in_kind" ? "Hiện vật" : "Bằng tiền";
                  return (
                    <option key={pkg.id} value={pkg.id}>
                      [{pkg.tier.toUpperCase()}] {pkg.tier === "platinum" ? "Bạch kim" : pkg.tier === "gold" ? "Vàng" : pkg.tier === "silver" ? "Bạc" : "Đồng"} · {typeLabel} · {new Intl.NumberFormat("vi-VN").format(pkg.price)} VNĐ
                    </option>
                  );
                })}
              </select>
              {selectedPkgId && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>Đã tự động bóc tách: Hạng gói, Hình thức tài trợ & Giá trị định mức.</span>
                </div>
              )}
            </div>

            {/* Tên Doanh Nghiệp Nhà Tài Trợ */}
            <div>
              <label className={labelCls} htmlFor="sp-name">
                Tên Doanh nghiệp / Tổ chức <span className="text-rose-500">*</span>
              </label>
              <input
                id="sp-name"
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ví dụ: Tập đoàn Công nghệ SunTech Global"
                className={inputCls}
              />
            </div>

            {/* Phân loại đối tác & Hạng tài trợ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="sp-type">
                  Phân loại đối tác
                </label>
                <select
                  id="sp-type"
                  value={draft.sponsorType}
                  onChange={(e) =>
                    setDraft({ ...draft, sponsorType: e.target.value as "regular" | "new" })
                  }
                  className={inputCls}
                >
                  <option value="regular">★ Thường xuyên ổn định</option>
                  <option value="new">✦ Nhà tài trợ mới</option>
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="sp-tier">
                  Hạng tài trợ
                </label>
                <select
                  id="sp-tier"
                  value={draft.tier}
                  onChange={(e) =>
                    setDraft({ ...draft, tier: e.target.value as Sponsor["tier"] })
                  }
                  className={inputCls}
                >
                  <option value="platinum">Bạch kim (Platinum)</option>
                  <option value="gold">Vàng (Gold)</option>
                  <option value="silver">Bạc (Silver)</option>
                  <option value="bronze">Đồng (Bronze)</option>
                </select>
              </div>
            </div>

            {/* Hình thức tài trợ & Giá trị (phân tách hàng trăm, triệu, tỷ VND) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="sp-pkg-type">
                  Hình thức tài trợ
                </label>
                <select
                  id="sp-pkg-type"
                  value={draft.packageType}
                  onChange={(e) =>
                    setDraft({ ...draft, packageType: e.target.value as "cash" | "in_kind" })
                  }
                  className={inputCls}
                >
                  <option value="cash">💵 Bằng Tiền (CK / Tiền mặt)</option>
                  <option value="in_kind">🎁 Bằng Hiện vật (Sản phẩm, quà tặng)</option>
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="sp-amount">
                  {draft.packageType === "in_kind"
                    ? "Định giá quy đổi tương đương"
                    : "Giá trị tài trợ (VNĐ)"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <VndCurrencyInput
                  id="sp-amount"
                  value={draft.amount}
                  onChange={(val) => setDraft((d) => ({ ...d, amount: val }))}
                  placeholder="Nhập giá trị (Ví dụ: 100.000.000)"
                  required
                />
              </div>
            </div>

            {/* Chi tiết hiện vật tài trợ nếu có */}
            {draft.packageType === "in_kind" && (
              <div>
                <label className={labelCls} htmlFor="sp-inkind">
                  Mô tả chi tiết hiện vật tài trợ
                </label>
                <textarea
                  id="sp-inkind"
                  rows={2}
                  value={draft.inKindDescription}
                  onChange={(e) => setDraft({ ...draft, inKindDescription: e.target.value })}
                  placeholder="Ví dụ: 200 bộ quà tặng Yến sào & Trầm hương thượng hạng..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>
            )}

            {/* Người đại diện liên hệ */}
            <div>
              <label className={labelCls} htmlFor="sp-contact">
                Người liên hệ / Chức vụ
              </label>
              <input
                id="sp-contact"
                type="text"
                value={draft.contact}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn Hùng (Chủ tịch HĐQT)"
                className={inputCls}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="sp-email">
                  Email
                </label>
                <input
                  id="sp-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="contact@company.vn"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="sp-phone">
                  Số điện thoại
                </label>
                <input
                  id="sp-phone"
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="0908 123 456"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Ngày tham gia & Trạng thái */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="sp-since">
                  Ngày tham gia
                </label>
                <input
                  id="sp-since"
                  type="date"
                  value={draft.since}
                  onChange={(e) => setDraft({ ...draft, since: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="sp-status">
                  Trạng thái
                </label>
                <select
                  id="sp-status"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as "active" | "expired" })
                  }
                  className={inputCls}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Đã hết hạn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border px-5 py-3.5 bg-muted/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {submitting ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Tạo nhà tài trợ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
