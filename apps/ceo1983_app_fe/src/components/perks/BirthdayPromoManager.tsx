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

      {/* Preview Modal - Chuẩn Giao Diện VIP Siêu Sang Trọng */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] rounded-[32px] bg-gradient-to-b from-[#0a1428] via-[#0b1936] to-[#040a18] border-2 border-amber-400/60 shadow-[0_20px_60px_-15px_rgba(212,160,23,0.35)] overflow-hidden text-white animate-in zoom-in-95 duration-200">
            {/* Glow ambient background rings */}
            <div className="absolute -top-20 -right-20 h-52 w-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-52 w-52 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3.5 right-3.5 z-30 size-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md"
            >
              ✕
            </button>

            {/* 1. Header Banner & Floating Badge */}
            <div className="relative h-36 w-full overflow-hidden">
              <img
                src={policy.bannerUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80"}
                alt="Sinh nhật CEO 1983"
                className="w-full h-full object-cover brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/40 to-transparent" />

              {/* Floating celebratory ribbon */}
              <div className="absolute top-3 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10.5px] font-black uppercase tracking-wider shadow-lg border border-amber-300">
                <span>👑 Đặc Quyền Sinh Nhật CEO 1983</span>
              </div>

              {/* Avatar / Cake Icon Floating Center */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                <div className="relative size-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-400 p-1 shadow-[0_8px_24px_rgba(251,191,36,0.6)] flex items-center justify-center border-2 border-white">
                  <div className="size-full rounded-xl bg-slate-950 flex items-center justify-center text-amber-400">
                    <Cake className="size-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 text-sm animate-bounce">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-sm">🎉</span>
                </div>
              </div>
            </div>

            {/* 2. Main Content Body */}
            <div className="px-5 pt-8 pb-5 flex flex-col items-center text-center">
              <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight leading-snug">
                {policy.title || "Chúc Mừng Sinh Nhật Hội Viên!"}
              </h3>

              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300">
                <span>Kính gửi CEO:</span>
                <span className="text-white font-extrabold">Nguyễn Văn Tuấn (Mẫu thử nghiệm)</span>
              </div>

              <p className="mt-2.5 text-xs text-slate-300 leading-relaxed max-w-[340px]">
                {policy.greetingMessage}
              </p>

              {/* 3. Luxury Voucher Perk Card */}
              <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/50 p-3.5 text-left relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs uppercase tracking-wide">
                    <Gift className="size-4 text-amber-400" />
                    <span>{policy.giftTitle || "Quà Tặng Tri Ân Doanh Nhân"}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                    VIP GIFT
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Giá trị đặc quyền
                    </span>
                    <span className="text-base font-black text-amber-300 tracking-tight">
                      {policy.discountValue}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-400">
                    Hiệu lực {policy.validDays || 30} ngày
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between bg-black/60 rounded-xl p-2 border border-amber-400/30">
                  <div className="flex flex-col pl-1">
                    <span className="text-[9px] text-amber-200/70 font-bold uppercase tracking-wider">
                      Mã Voucher VIP
                    </span>
                    <span className="font-mono text-xs font-black text-amber-300 tracking-widest">
                      {policy.voucherCode || "CEO1983-BDAY"}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black shadow-xs">
                    Sao chép
                  </span>
                </div>
              </div>

              {/* 4. Action Buttons */}
              <div className="mt-4 w-full flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition hover:brightness-110 active:scale-98 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
                  }}
                >
                  <span>Khám Phá Ưu Đãi Thành Viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-slate-300 hover:bg-white/10 transition active:scale-95 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
