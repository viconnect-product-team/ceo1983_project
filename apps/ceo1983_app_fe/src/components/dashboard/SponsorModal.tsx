import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Handshake,
  X,
  Sparkles,
  Building2,
  Package,
  Check,
  Plus,
  AlertCircle,
  Coins,
  Gift,
  Mail,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useT } from "@/lib/i18n";
import type { Sponsor, SponsorPackage, PackageType } from "@/lib/sponsors.functions";
import {
  listSponsorPackagesFn,
  createSponsorPackageFn,
} from "@/lib/sponsors.functions";
import { VndCurrencyInput } from "@/components/dashboard/VndCurrencyInput";
import {
  SponsorPackageModal,
  type PackageDraft,
} from "@/components/dashboard/SponsorPackageModal";

export interface SponsorDraft {
  name: string;
  sponsorType: "regular" | "new";
  packageType: PackageType;
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

  // Load available sponsor packages from API
  const [packages, setPackages] = useState<SponsorPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");

  // Nested Package Creation Modal
  const [createPkgModalOpen, setCreatePkgModalOpen] = useState<boolean>(false);
  const [submittingNewPkg, setSubmittingNewPkg] = useState<boolean>(false);
  const createPkgFn = useServerFn(createSponsorPackageFn);

  const [draft, setDraft] = useState<SponsorDraft>({
    name: "",
    sponsorType: "regular",
    packageType: "bank_transfer",
    inKindDescription: "",
    tier: "gold",
    contact: "",
    email: "",
    phone: "",
    amount: 50000000,
    since: new Date().toISOString().slice(0, 10),
    status: "active",
  });

  const loadPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await listSponsorPackagesFn();
      setPackages(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("[SponsorModal] Failed to fetch sponsor packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPackages();
      if (initial) {
        setDraft({
          name: initial.name || "",
          sponsorType: initial.sponsorType || "regular",
          packageType: initial.packageType || "bank_transfer",
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
          packageType: "bank_transfer",
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
  if (typeof document === "undefined") return null;

  // Filter packages by current contribution method
  const matchingPackages = packages.filter(
    (p) => (p.packageType || "bank_transfer") === draft.packageType
  );

  // Handle selecting an existing package to auto-populate fields
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    if (!pkgId) return;

    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setDraft((prev) => ({
        ...prev,
        tier: pkg.tier,
        packageType: pkg.packageType || prev.packageType,
        amount: pkg.price || 0,
        inKindDescription: pkg.inKindDescription || prev.inKindDescription,
      }));
    }
  };

  // Quick create package on-the-fly from inside SponsorModal
  const handleQuickCreatePackage = async (draftPkg: PackageDraft) => {
    setSubmittingNewPkg(true);
    try {
      const created = await createPkgFn({ data: draftPkg });
      toast.success("Đã tạo gói tài trợ mới thành công!");
      await loadPackages();
      setSelectedPkgId(created.id);
      setDraft((prev) => ({
        ...prev,
        tier: created.tier,
        packageType: created.packageType,
        amount: created.price || 0,
        inKindDescription: created.inKindDescription || prev.inKindDescription,
      }));
      setCreatePkgModalOpen(false);
    } catch (err: any) {
      console.error("[SponsorModal] Quick create package failed:", err);
      toast.error(err?.message || "Không thể tạo gói tài trợ lúc này");
    } finally {
      setSubmittingNewPkg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Vui lòng nhập tên Doanh nghiệp / Tổ chức tài trợ");
      return;
    }
    onSubmit(draft);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto w-screen h-screen"
      role="dialog"
      aria-modal="true"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative flex flex-col w-full max-w-xl my-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[92vh] z-[10000]"
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
                {initial
                  ? "Cập nhật hồ sơ đối tác và giá trị tài trợ thực tế"
                  : "Khởi tạo đối tác, chọn gói và tự động gửi email kèm mã VietQR"}
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
            {/* 1. HÌNH THỨC TÀI TRỢ CHIA RÕ RÀNG (CHUYỂN KHOẢN / TIỀN MẶT / HIỆN VẬT) */}
            <div>
              <label className={labelCls}>
                Hình Thức Đóng Góp Tài Trợ <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Chuyển khoản */}
                <button
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, packageType: "bank_transfer" }));
                    setSelectedPkgId("");
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    draft.packageType === "bank_transfer"
                      ? "border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30 font-bold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-5 w-5 mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold leading-tight">Chuyển Khoản</span>
                  <span className="text-[10px] opacity-75 font-normal mt-0.5">Bắn VietQR</span>
                </button>

                {/* Tiền mặt */}
                <button
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, packageType: "cash" }));
                    setSelectedPkgId("");
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    draft.packageType === "cash"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Coins className="h-5 w-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold leading-tight">Tiền Mặt</span>
                  <span className="text-[10px] opacity-75 font-normal mt-0.5">Trực tiếp</span>
                </button>

                {/* Hiện vật */}
                <button
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, packageType: "in_kind" }));
                    setSelectedPkgId("");
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    draft.packageType === "in_kind"
                      ? "border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30 font-bold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Gift className="h-5 w-5 mb-1 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold leading-tight">Hiện Vật</span>
                  <span className="text-[10px] opacity-75 font-normal mt-0.5">Quà / Dịch vụ</span>
                </button>
              </div>
            </div>

            {/* 2. CHỌN GÓI TÀI TRỢ HOẶC HIỂN THỊ "CHƯA CÓ GÓI" & NÚT BẤM TẠO GÓI NGAY */}
            {matchingPackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      Chưa có gói tài trợ{" "}
                      {draft.packageType === "bank_transfer"
                        ? "Chuyển khoản"
                        : draft.packageType === "cash"
                        ? "Tiền mặt"
                        : "Hiện vật"}{" "}
                      nào trong hệ thống
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                    Bạn có thể bấm nút bên cạnh để tạo gói định mức mới hoặc nhập số tiền thực tế bên dưới.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatePkgModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-xs font-bold shadow-sm hover:brightness-105 transition cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tạo Gói Tài Trợ Ngay</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary flex items-center gap-1.5" htmlFor="select-pkg">
                    <Package className="h-4 w-4" />
                    <span>
                      Chọn Gói Tài Trợ ({matchingPackages.length} gói khả dụng)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreatePkgModalOpen(true)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Tạo gói mới</span>
                  </button>
                </div>
                <select
                  id="select-pkg"
                  value={selectedPkgId}
                  onChange={(e) => handleSelectPackage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">-- Chọn gói tài trợ định mức hoặc nhập tùy chỉnh bên dưới --</option>
                  {matchingPackages.map((pkg) => {
                    const tierName =
                      pkg.tier === "platinum"
                        ? "Bạch kim"
                        : pkg.tier === "gold"
                        ? "Vàng"
                        : pkg.tier === "silver"
                        ? "Bạc"
                        : "Đồng";
                    return (
                      <option key={pkg.id} value={pkg.id}>
                        [{pkg.tier.toUpperCase()}] Gói {tierName} · {new Intl.NumberFormat("vi-VN").format(pkg.price)} VNĐ ({pkg.available - pkg.sold} suất)
                      </option>
                    );
                  })}
                </select>
                {selectedPkgId && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Đã điền định mức gói. Bạn vẫn có thể tùy biến số tiền thực tế bên dưới.</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. NHẬP GIÁ TRỊ THỰC TẾ THEO SỐ TIỀN NHÀ TÀI TRỢ MUỐN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="sp-amount">
                  {draft.packageType === "in_kind"
                    ? "Định giá quy đổi hiện vật thực tế (VNĐ)"
                    : "Số tiền tài trợ thực tế mong muốn (VNĐ)"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10.5px] text-muted-foreground italic">
                  Tự do nhập số tiền thực tế
                </span>
              </div>
              <VndCurrencyInput
                id="sp-amount"
                value={draft.amount}
                onChange={(val) => setDraft((d) => ({ ...d, amount: val }))}
                placeholder="Nhập số tiền thực tế (Ví dụ: 100.000.000)"
                required
              />
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                {draft.packageType === "bank_transfer" ? (
                  <>
                    <QrCode className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Sau khi tạo, hệ thống sẽ <strong>tự động bắn email có mã VietQR</strong> đúng với số tiền <strong>{new Intl.NumberFormat("vi-VN").format(draft.amount || 0)} VNĐ</strong> này về email của nhà tài trợ.
                    </span>
                  </>
                ) : draft.packageType === "cash" ? (
                  <>
                    <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Sau khi tạo, hệ thống sẽ gửi email xác nhận khoản tài trợ tiền mặt và thông báo đến Ban Tài chính để tiếp nhận trực tiếp.
                    </span>
                  </>
                ) : (
                  <>
                    <Gift className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      Sau khi tạo, hệ thống sẽ gửi email hướng dẫn bàn giao hiện vật và quy đổi giá trị tài trợ vào biên bản nghiệm thu.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Chi tiết hiện vật tài trợ nếu chọn Hình thức Hiện vật */}
            {draft.packageType === "in_kind" && (
              <div>
                <label className={labelCls} htmlFor="sp-inkind">
                  Mô tả chi tiết hiện vật tài trợ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sp-inkind"
                  rows={2}
                  required
                  value={draft.inKindDescription}
                  onChange={(e) => setDraft({ ...draft, inKindDescription: e.target.value })}
                  placeholder="Ví dụ: 200 bộ quà tặng Yến sào & Trầm hương cao cấp, hoặc 1 gói giải pháp ERP chuyển đổi số trị giá 100 triệu..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>
            )}

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

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="sp-email">
                  Email nhận mã QR & Thư tri ân <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="sp-email"
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="sponsor@company.vn"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="sp-phone">
                  Số điện thoại liên hệ
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

            {/* Người đại diện liên hệ */}
            <div>
              <label className={labelCls} htmlFor="sp-contact">
                Người liên hệ / Chức vụ đại diện
              </label>
              <input
                id="sp-contact"
                type="text"
                value={draft.contact}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn Hùng (Tổng Giám Đốc)"
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
          <div className="flex items-center justify-between gap-2.5 border-t border-border px-5 py-3.5 bg-muted/20 shrink-0">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Tự động bắn email VietQR ngay khi lưu</span>
            </span>
            <div className="flex items-center gap-2">
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
                {submitting ? "Đang lưu & gửi email..." : initial ? "Lưu thay đổi" : "Tạo & Bắn Email QR"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Nested Create Sponsor Package Modal */}
      {createPkgModalOpen && (
        <SponsorPackageModal
          open={createPkgModalOpen}
          initial={null}
          submitting={submittingNewPkg}
          onClose={() => setCreatePkgModalOpen(false)}
          onSubmit={handleQuickCreatePackage}
        />
      )}
    </div>,
    document.body
  );
}
