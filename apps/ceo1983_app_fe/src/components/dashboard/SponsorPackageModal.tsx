import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, X, Package } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { SponsorPackage, PackageType } from "@/lib/sponsors.functions";
import { VndCurrencyInput } from "@/components/dashboard/VndCurrencyInput";

export type PackageDraft = {
  tier: SponsorPackage["tier"];
  price: number;
  packageType: PackageType;
  inKindDescription: string;
  available: number;
  sold: number;
  benefits: string[];
};

const TIERS: SponsorPackage["tier"][] = ["platinum", "gold", "silver", "bronze"];

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";
const labelCls = "mb-1.5 block text-xs font-semibold text-foreground";

export function SponsorPackageModal({
  open,
  initial,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: SponsorPackage | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (draft: PackageDraft) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<PackageDraft>({
    tier: "gold",
    price: 0,
    packageType: "bank_transfer",
    inKindDescription: "",
    available: 10,
    sold: 0,
    benefits: [],
  });

  useEffect(() => {
    if (open) {
      setDraft(
        initial
          ? {
              tier: initial.tier,
              price: initial.price || 0,
              packageType: initial.packageType || "bank_transfer",
              inKindDescription: initial.inKindDescription || "",
              available: initial.available ?? 10,
              sold: initial.sold ?? 0,
              benefits: Array.isArray(initial.benefits) ? [...initial.benefits] : [],
            }
          : {
              tier: "gold",
              price: 50000000,
              packageType: "bank_transfer",
              inKindDescription: "",
              available: 10,
              sold: 0,
              benefits: [
                "Bảng tên và logo thương hiệu trang trọng tại hội trường",
                "2 vé tham dự sự kiện tiêu chuẩn VIP",
                "Quảng bá video clip giới thiệu trên các kênh truyền thông",
              ],
            },
      );
    }
  }, [open, initial]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const setBenefit = (i: number, v: string) =>
    setDraft((d) => ({ ...d, benefits: d.benefits.map((b, idx) => (idx === i ? v : b)) }));
  const removeBenefit = (i: number) =>
    setDraft((d) => ({ ...d, benefits: d.benefits.filter((_, idx) => idx !== i) }));
  const addBenefit = () => setDraft((d) => ({ ...d, benefits: [...d.benefits, ""] }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...draft,
      price: Math.max(0, draft.price || 0),
      available: Math.max(0, Number(draft.available) || 0),
      sold: Math.max(0, Number(draft.sold) || 0),
      benefits: draft.benefits.map((b) => b.trim()).filter(Boolean),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto w-screen h-screen"
      role="dialog"
      aria-modal="true"
      aria-label={initial ? t("pkg.edit") : t("pkg.create")}
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative flex flex-col w-full max-w-xl my-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[88vh] z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {initial ? "Sửa Gói Tài Trợ" : "Tạo Gói Tài Trợ Mới"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {initial ? "Cập nhật định mức và quyền lợi đính kèm" : "Cấu hình gói tài trợ định danh cho sự kiện & hiệp hội"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("onb.cancel")}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 overscroll-contain">
            {/* Hạng gói & Hình thức */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="pkg-tier">
                  {t("pkg.field.tier")} <span className="text-rose-500">*</span>
                </label>
                <select
                  id="pkg-tier"
                  className={inputCls}
                  value={draft.tier}
                  onChange={(e) =>
                    setDraft({ ...draft, tier: e.target.value as SponsorPackage["tier"] })
                  }
                >
                  {TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {t(`sponsors.tier.${tier}` as never)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="pkg-type">
                  Hình thức gói tài trợ <span className="text-rose-500">*</span>
                </label>
                <select
                  id="pkg-type"
                  className={inputCls}
                  value={draft.packageType}
                  onChange={(e) =>
                    setDraft({ ...draft, packageType: e.target.value as PackageType })
                  }
                >
                  <option value="bank_transfer">🏦 Tài trợ Chuyển khoản (Có mã VietQR)</option>
                  <option value="cash">💵 Tài trợ Tiền mặt (Trực tiếp)</option>
                  <option value="in_kind">🎁 Tài trợ Hiện vật (Sản phẩm / Quà tặng)</option>
                </select>
              </div>
            </div>

            {/* Giá trị quy đổi chuẩn VND */}
            <div>
              <label className={labelCls} htmlFor="pkg-price">
                {draft.packageType === "in_kind"
                  ? "Định giá quy đổi tương đương (VNĐ)"
                  : "Giá trị gói tài trợ (VNĐ)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <VndCurrencyInput
                id="pkg-price"
                value={draft.price}
                onChange={(val) => setDraft((d) => ({ ...d, price: val }))}
                placeholder="Nhập giá trị (Ví dụ: 50.000.000)"
                required
              />
            </div>

            {draft.packageType === "in_kind" && (
              <div>
                <label className={labelCls} htmlFor="pkg-inkind-desc">
                  Mô tả chi tiết hiện vật tài trợ
                </label>
                <textarea
                  id="pkg-inkind-desc"
                  rows={2}
                  placeholder="Ví dụ: Tài trợ toàn bộ teabreak, tiệc trà & cà phê cao cấp giờ giải lao..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  value={draft.inKindDescription}
                  onChange={(e) => setDraft({ ...draft, inKindDescription: e.target.value })}
                />
              </div>
            )}

            {/* Số lượng phát hành & Đã bán */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} htmlFor="pkg-available">
                  {t("pkg.field.available")} (Suất)
                </label>
                <input
                  id="pkg-available"
                  type="number"
                  min={0}
                  className={inputCls}
                  value={draft.available}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) =>
                    setDraft({ ...draft, available: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="pkg-sold">
                  {t("pkg.field.sold")} (Suất)
                </label>
                <input
                  id="pkg-sold"
                  type="number"
                  min={0}
                  className={inputCls}
                  value={draft.sold}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) =>
                    setDraft({ ...draft, sold: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                />
              </div>
            </div>

            {/* Quyền lợi đi kèm */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>{t("pkg.field.benefits")}</label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {draft.benefits.filter(Boolean).length} quyền lợi
                </span>
              </div>
              <div className="space-y-2">
                {draft.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={inputCls}
                      placeholder={t("pkg.benefit.ph")}
                      aria-label={t("pkg.field.benefits")}
                      value={b}
                      onChange={(e) => setBenefit(i, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(i)}
                      aria-label={t("pkg.benefit.remove")}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addBenefit}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {t("pkg.benefit.add")}
              </button>
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
              {t("onb.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition cursor-pointer disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {submitting ? t("onb.submitting") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
