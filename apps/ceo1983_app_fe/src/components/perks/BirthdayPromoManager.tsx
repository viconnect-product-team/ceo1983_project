import { useState, useEffect } from "react";
import { Cake, Gift, Sparkles, CheckCircle2, Save, Eye, Palette, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface BirthdayPromoPolicy {
  enabled: boolean;
  title: string;
  greetingMessage: string;
  giftTitle: string;
  voucherCode: string;
  discountValue: string;
  bannerUrl: string;
  validDays: number;
  testMode: boolean;
  updatedAt: string;
}

const DEFAULT_BIRTHDAY_POLICY: BirthdayPromoPolicy = {
  enabled: true,
  title: "Chúc Mừng Sinh Nhật Hội Viên CLB Doanh Nhân CEO 1983! 🎂🎉",
  greetingMessage:
    "Ban Chấp Hành và toàn thể Hội viên CLB CEO 1983 kính chúc Quý Anh/Chị tuổi mới dồi dào sức khỏe, gia đình thịnh vượng, doanh nghiệp bứt phá và luôn đồng hành gắn kết cùng Hiệp hội!",
  giftTitle: "Voucher Ưu Đãi Độc Quyền Hội Viên & Quà Tặng Sự Kiện",
  voucherCode: "CEO1983-BDAY-VIP",
  discountValue: "2,000,000 đ hoặc Giảm 20% Dịch vụ Thành viên",
  bannerUrl:
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80",
  validDays: 30,
  testMode: true,
  updatedAt: new Date().toISOString(),
};

export function BirthdayPromoManager() {
  const [policy, setPolicy] = useState<BirthdayPromoPolicy>(() => {
    try {
      const raw = localStorage.getItem("ceo1983_birthday_policy");
      if (raw) return { ...DEFAULT_BIRTHDAY_POLICY, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_BIRTHDAY_POLICY;
  });

  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      const updated = {
        ...policy,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("ceo1983_birthday_policy", JSON.stringify(updated));
      window.dispatchEvent(new Event("ceo1983-birthday-policy-changed"));
      window.dispatchEvent(new Event("storage"));
      toast.success("Đã lưu chính sách ưu đãi sinh nhật thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-amber-950/20 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md">
            <Cake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chính Sách & Ưu Đãi Sinh Nhật Hội Viên
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  policy.enabled
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {policy.enabled ? "Đang Bật Trên App" : "Đang Tạm Dừng"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Cấu hình tại CRM Hiệp hội. Tự động hiển thị popup chúc mừng & tặng quà khi hội viên có sinh nhật mở App Hiệp hội.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground shadow-2xs">
            <input
              type="checkbox"
              checked={policy.enabled}
              onChange={(e) => setPolicy((p) => ({ ...p, enabled: e.target.checked }))}
              className="rounded accent-amber-600 h-4 w-4"
            />
            <span>Kích hoạt chính sách</span>
          </label>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition"
          >
            <Eye className="h-3.5 w-3.5 text-amber-600" />
            <span>Xem trước Popup</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
            }}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Đang lưu..." : "Lưu Chính Sách"}</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tiêu đề Popup Chúc Mừng
          </label>
          <input
            type="text"
            value={policy.title}
            onChange={(e) => setPolicy((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tên Quà Tặng / Ưu Đãi
          </label>
          <input
            type="text"
            value={policy.giftTitle}
            onChange={(e) => setPolicy((p) => ({ ...p, giftTitle: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nội dung thông điệp chúc mừng từ Hiệp hội
          </label>
          <textarea
            rows={2}
            value={policy.greetingMessage}
            onChange={(e) => setPolicy((p) => ({ ...p, greetingMessage: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Mã Voucher Sinh Nhật
          </label>
          <input
            type="text"
            value={policy.voucherCode}
            onChange={(e) => setPolicy((p) => ({ ...p, voucherCode: e.target.value.toUpperCase() }))}
            placeholder="VD: CEO1983-BDAY-VIP"
            className="w-full font-mono uppercase rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Trị giá ưu đãi / Quyền lợi
          </label>
          <input
            type="text"
            value={policy.discountValue}
            onChange={(e) => setPolicy((p) => ({ ...p, discountValue: e.target.value }))}
            placeholder="VD: 2,000,000 đ hoặc Giảm 20%"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Ảnh Banner Chúc Mừng (URL)
          </label>
          <input
            type="text"
            value={policy.bannerUrl}
            onChange={(e) => setPolicy((p) => ({ ...p, bannerUrl: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={policy.testMode}
              onChange={(e) => setPolicy((p) => ({ ...p, testMode: e.target.checked }))}
              className="rounded accent-amber-600 h-4 w-4"
            />
            <span>Bật chế độ thử nghiệm (Luôn hiển thị Popup trên App để kiểm thử)</span>
          </label>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-400/40 p-6 text-white shadow-2xl text-center overflow-hidden">
            <div className="absolute -top-12 -right-12 h-36 w-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg mb-3">
                <Cake className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-amber-300">{policy.title}</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {policy.greetingMessage}
              </p>

              <div className="my-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4 text-left">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Gift className="h-4 w-4" />
                  <span>{policy.giftTitle}</span>
                </div>
                <div className="mt-1 text-sm font-black text-white">{policy.discountValue}</div>
                <div className="mt-2 inline-flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-400/40 font-mono text-xs text-amber-300 font-bold">
                  <span>MÃ: {policy.voucherCode}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition"
              >
                Đóng Bản Xem Trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
