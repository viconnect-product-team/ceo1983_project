import { useState, useEffect } from "react";
import { Cake, Gift, X, Sparkles, Copy, Check, ArrowRight, Heart, Crown, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { MyMember } from "@/lib/member-app.functions";

interface BirthdayCelebrationModalProps {
  member?: MyMember | null;
}

export function BirthdayCelebrationModal({ member }: BirthdayCelebrationModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ceo1983_birthday_policy");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.enabled === false) return;

      // Check if already dismissed this browser session
      const dismissed = sessionStorage.getItem("ceo1983_bday_dismissed_session");
      if (dismissed === "true") return;

      // Check birthday match
      let isBirthday = false;
      if (parsed.testMode) {
        isBirthday = true;
      } else if (member) {
        const bDateStr = (member as any).birthDate || (member as any).dob || (member as any).birthday;
        if (bDateStr) {
          const bDate = new Date(bDateStr);
          const now = new Date();
          if (bDate.getDate() === now.getDate() && bDate.getMonth() === now.getMonth()) {
            isBirthday = true;
          }
        }
      }

      if (isBirthday) {
        setPolicy(parsed);
        // Small delay so page renders nicely first
        const timer = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [member]);

  if (!open || !policy) return null;

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("ceo1983_bday_dismissed_session", "true");
  };

  const handleCopyCode = () => {
    if (!policy?.voucherCode) return;
    navigator.clipboard.writeText(policy.voucherCode);
    setCopied(true);
    toast.success(`✓ Đã sao chép mã ưu đãi độc quyền: ${policy.voucherCode}`);
    setTimeout(() => setCopied(false), 2500);
  };

  const memberName =
    (member as any)?.fullName ||
    (member as any)?.name ||
    "Quý Hội Viên Doanh Nhân";

  const bannerImg =
    policy.bannerUrl ||
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] rounded-[32px] bg-gradient-to-b from-[#0a1428] via-[#0b1936] to-[#040a18] border-2 border-amber-400/60 shadow-[0_20px_60px_-15px_rgba(212,160,23,0.35)] overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Glow ambient background rings */}
        <div className="absolute -top-20 -right-20 h-52 w-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-52 w-52 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng"
          className="absolute top-3.5 right-3.5 z-30 size-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md"
        >
          <X className="size-4" />
        </button>

        {/* 1. Header Banner & Floating Badge */}
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={bannerImg}
            alt="Sinh nhật CEO 1983"
            className="w-full h-full object-cover brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/40 to-transparent" />

          {/* Floating celebratory ribbon */}
          <div className="absolute top-3 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10.5px] font-black uppercase tracking-wider shadow-lg border border-amber-300">
            <Crown className="size-3.5 text-slate-950 fill-current" />
            <span>Đặc Quyền Sinh Nhật CEO 1983</span>
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
          {/* Title */}
          <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight leading-snug">
            {policy.title || "Chúc Mừng Sinh Nhật Hội Viên!"}
          </h3>

          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300">
            <span>Kính gửi CEO:</span>
            <span className="text-white font-extrabold">{memberName}</span>
          </div>

          {/* Greeting message */}
          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed max-w-[340px]">
            {policy.greetingMessage}
          </p>

          {/* 3. Luxury Voucher Perk Card (Vé VIP Sinh Nhật) */}
          <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/50 p-3.5 text-left relative overflow-hidden shadow-inner">
            {/* Background watermark badge */}
            <Award className="absolute -right-3 -bottom-3 size-20 text-amber-400/10 pointer-events-none" />

            <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs uppercase tracking-wide">
                <Gift className="size-4 text-amber-400" />
                <span>{policy.giftTitle || "Quà Tặng Tri Ân Doanh Nhân"}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#003B95] hover:bg-[#002B70] text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
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

            {/* Voucher Code Box */}
            <div className="mt-2.5 flex items-center justify-between bg-black/60 rounded-xl p-2 border border-amber-400/30">
              <div className="flex flex-col pl-1">
                <span className="text-[9px] text-amber-200/70 font-bold uppercase tracking-wider">
                  Mã Voucher VIP
                </span>
                <span className="font-mono text-xs font-black text-amber-300 tracking-widest">
                  {policy.voucherCode || "CEO1983-BDAY"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003B95] hover:bg-[#002B70] text-white hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-slate-950" /> : <Copy className="size-3.5 text-slate-950" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="mt-4 w-full flex items-center gap-2">
            <Link
              to="/association/perks"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition hover:brightness-110 active:scale-98 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
              }}
            >
              <span>Xem ưu đãi thành viên</span>
              <ArrowRight className="size-3.5 text-slate-950" />
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-slate-300 hover:bg-white/10 transition active:scale-95 cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
