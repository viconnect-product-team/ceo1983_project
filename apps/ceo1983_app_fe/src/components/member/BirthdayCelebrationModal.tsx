import { useState, useEffect } from "react";
import { Cake, Gift, X, Sparkles, Copy, Check, ArrowRight, Heart } from "lucide-react";
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
        const timer = setTimeout(() => setOpen(true), 1200);
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
    toast.success(`Đã sao chép mã ưu đãi: ${policy.voucherCode}`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-400/50 p-6 text-white shadow-2xl overflow-hidden text-center">
        {/* Glow & Confetti Effects */}
        <div className="absolute -top-16 -right-16 h-44 w-44 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-44 w-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition z-20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          {/* Cake Icon */}
          <div className="relative mb-3">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-orange-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce" style={{ animationDuration: "3s" }}>
              <Cake className="h-10 w-10" />
            </div>
            <div className="absolute -top-1 -right-1 text-lg">✨</div>
            <div className="absolute -bottom-1 -left-1 text-lg">🎉</div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>MÓN QUÀ TRI ÂN TỪ HIỆP HỘI</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-amber-300 leading-tight">
            {policy.title || "Chúc Mừng Sinh Nhật!"}
          </h3>

          <p className="text-xs font-semibold text-blue-200 mt-1">
            Kính gửi Hội viên: <span className="text-white font-bold">{(member as any)?.fullName || (member as any)?.name || "Quý Hội Viên"}</span>
          </p>

          {/* Message */}
          <p className="mt-3 text-xs text-slate-300 leading-relaxed px-2">
            {policy.greetingMessage}
          </p>

          {/* Voucher / Perk Gift Card */}
          <div className="my-4 w-full rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/40 p-4 text-left shadow-inner">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Gift className="h-4 w-4 text-amber-400" />
                <span>{policy.giftTitle}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                VIP PERK
              </span>
            </div>

            <div className="mt-1.5 text-base font-extrabold text-white">
              {policy.discountValue}
            </div>

            {/* Voucher Code Copy Bar */}
            <div className="mt-3 flex items-center justify-between bg-slate-950/80 rounded-xl p-2 border border-amber-400/30">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mã ưu đãi độc quyền</span>
                <span className="font-mono text-xs font-bold text-amber-300 tracking-wider">
                  {policy.voucherCode || "CEO1983-BDAY"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex items-center gap-2.5 pt-1">
            <Link
              to="/association/perks"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-900 shadow-md flex items-center justify-center gap-1.5 transition hover:brightness-105 active:scale-98"
              style={{
                background:
                  "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
              }}
            >
              <span>Xem ưu đãi thành viên</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-900" />
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
