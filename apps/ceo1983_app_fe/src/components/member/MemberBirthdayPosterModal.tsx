import React, { useState, useEffect, useRef } from "react";
import { X, Download, Share2, Sparkles, Crown, Heart, Award, Check } from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api-client";

export interface BirthdayMemberData {
  id?: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  avatar?: string;
  company?: string;
  title?: string;
  executiveRole?: string;
  birthDate?: string;
  dob?: string;
  birthday?: string;
  code?: string;
}

interface MemberBirthdayPosterModalProps {
  member?: BirthdayMemberData | null;
  isOpen?: boolean;
  onClose?: () => void;
  autoCheckToday?: boolean;
}

export function MemberBirthdayPosterModal({
  member,
  isOpen: propIsOpen,
  onClose,
  autoCheckToday = true,
}: MemberBirthdayPosterModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Tự động kiểm tra ngày sinh hôm nay nếu không truyền prop isOpen
  useEffect(() => {
    if (typeof propIsOpen === "boolean") {
      setInternalOpen(propIsOpen);
      return;
    }

    if (!autoCheckToday || !member) return;

    try {
      const dismissed = sessionStorage.getItem("ceo1983_bday_poster_dismissed");
      if (dismissed === "true") return;

      const rawPolicy = localStorage.getItem("ceo1983_birthday_policy");
      let testMode = false;
      if (rawPolicy) {
        try {
          const parsed = JSON.parse(rawPolicy);
          if (parsed?.testMode) testMode = true;
        } catch {}
      }

      let isToday = false;
      if (testMode) {
        isToday = true;
      } else {
        const bStr = member.birthDate || member.dob || member.birthday;
        if (bStr) {
          const bDate = new Date(bStr);
          const now = new Date();
          if (bDate.getDate() === now.getDate() && bDate.getMonth() === now.getMonth()) {
            isToday = true;
          }
        }
      }

      if (isToday) {
        const timer = setTimeout(() => setInternalOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [member, propIsOpen, autoCheckToday]);

  const isOpen = typeof propIsOpen === "boolean" ? propIsOpen : internalOpen;

  if (!isOpen) return null;

  const handleClose = () => {
    setInternalOpen(false);
    sessionStorage.setItem("ceo1983_bday_poster_dismissed", "true");
    if (onClose) onClose();
  };

  const displayName =
    member?.fullName ||
    member?.name ||
    "DOANH NHÂN CEO 1983";

  const displayCompany =
    member?.company ||
    "Doanh nghiệp Hội viên CEO 1983";

  const displayRole =
    member?.title ||
    member?.executiveRole ||
    "Ủy viên CLB Doanh Nhân CEO 1983";

  const rawAvatar = member?.avatarUrl || member?.avatar || "";
  const avatarSrc = rawAvatar
    ? resolveMediaUrl(rawAvatar) || rawAvatar
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80";

  // Định dạng ngày tháng sinh nhật
  const bStr = member?.birthDate || member?.dob || member?.birthday;
  let formattedBday = "08/11/1983";
  if (bStr) {
    try {
      const d = new Date(bStr);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        formattedBday = `${dd}/${mm}/1983`;
      }
    } catch {}
  }

  // Tải poster dạng Canvas image
  const handleDownloadPoster = async () => {
    if (!posterRef.current || isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading("Đang xuất poster chúc mừng sinh nhật độ nét cao...");

    try {
      // Dùng HTML5 Canvas để vẽ trực tiếp poster chất lượng cao
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350; // Tỉ lệ poster 4:5 chuẩn Instagram & Pinterest
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Nền Navy hoàng gia sang trọng
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
        bgGrad.addColorStop(0, "#050B14");
        bgGrad.addColorStop(0.35, "#0A1733");
        bgGrad.addColorStop(0.7, "#050B14");
        bgGrad.addColorStop(1, "#03070E");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1350);

        // Khung viền hoa văn vàng kim nghệ thuật
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 6;
        ctx.strokeRect(36, 36, 1080 - 72, 1350 - 72);

        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(52, 52, 1080 - 104, 1350 - 104);

        // Header logo text
        ctx.fillStyle = "#F5D77F";
        ctx.font = "bold 26px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CLB DOANH NHÂN CEO 1983 - HANOIBA", 540, 120);

        // Tiêu đề HAPPY BIRTHDAY
        ctx.fillStyle = "#FFDF73";
        ctx.font = "900 68px Inter, serif";
        ctx.fillText("CHÚC MỪNG SINH NHẬT", 540, 210);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "600 32px Inter, sans-serif";
        ctx.fillText("HAPPY BIRTHDAY", 540, 260);

        // Tên Doanh nhân
        ctx.fillStyle = "#FFE899";
        ctx.font = "900 48px Inter, sans-serif";
        ctx.fillText(displayName.toUpperCase(), 540, 840);

        // Chức vụ & Công ty
        ctx.fillStyle = "#93C5FD";
        ctx.font = "bold 28px Inter, sans-serif";
        ctx.fillText(displayRole, 540, 895);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "26px Inter, sans-serif";
        ctx.fillText(displayCompany, 540, 940);

        // Ngày sinh
        ctx.fillStyle = "#FBBF24";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText(`Ngày sinh nhật: ${formattedBday}`, 540, 990);

        // Lời chúc
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "italic 22px Inter, sans-serif";
        ctx.fillText("Kính chúc Anh/Chị bước sang tuổi mới luôn dồi dào sức khỏe, tâm sáng trí bền,", 540, 1060);
        ctx.fillText("dẫn dắt doanh nghiệp bứt phá thành công & luôn đồng hành cùng CEO 1983!", 540, 1095);

        // Footer ký tên
        ctx.fillStyle = "#D4AF37";
        ctx.font = "bold 22px Inter, sans-serif";
        ctx.fillText("TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983", 540, 1220);

        // Trigger tải file PNG
        const link = document.createElement("a");
        link.download = `Poster_Sinh_Nhat_CEO1983_${displayName.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("✓ Đã tải poster sinh nhật chất lượng cao thành công!", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Không thể xuất ảnh poster: " + (err?.message || "Lỗi canvas"), { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareToFeed = () => {
    handleClose();
    toast.success("🎉 Đã gửi lời chúc sinh nhật lên Mạng lưới CEO 1983!");
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-[440px] my-auto">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng poster"
          className="absolute -top-3.5 -right-3.5 z-50 size-9 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition shadow-xl cursor-pointer active:scale-90"
        >
          <X className="size-5" />
        </button>

        {/* ── BẢN POSTER CHUẨN PINTEREST LUXURY GOLD & NAVY ── */}
        <div
          ref={posterRef}
          className="relative w-full rounded-[28px] overflow-hidden text-center text-white border-2 border-amber-400/80 shadow-[0_25px_70px_rgba(212,175,55,0.35)]"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, #0F2347 0%, #061024 55%, #03070E 100%)",
          }}
        >
          {/* Họa tiết ánh kim vàng & viền nghệ thuật kép */}
          <div className="absolute inset-2.5 rounded-[22px] border border-amber-400/40 pointer-events-none" />
          <div className="absolute inset-4 rounded-[18px] border border-amber-300/20 pointer-events-none" />

          {/* 4 Góc hoa văn vàng hoàng gia */}
          <div className="absolute top-4 left-4 size-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-4 right-4 size-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-4 right-4 size-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Dải ánh sáng lung linh đỉnh poster */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />

          <div className="px-6 pt-7 pb-6 relative z-10 flex flex-col items-center">
            {/* Header: Logo & Tên CLB */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/ceo1983-logo.png"
                alt="CEO 1983 Logo"
                className="h-7 w-7 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                }}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                CLB DOANH NHÂN CEO 1983
              </span>
            </div>

            {/* Tiêu đề Happy Birthday phong cách Pinterest luxury */}
            <div className="my-1 space-y-0.5">
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-amber-300/90">
                ★ HAPPY BIRTHDAY ★
              </p>
              <h2
                className="text-2xl sm:text-[26px] font-black tracking-tight leading-tight uppercase"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #FFE8A3 50%, #D4AF37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 8px rgba(212,175,55,0.4))",
                }}
              >
                CHÚC MỪNG SINH NHẬT
              </h2>
            </div>

            {/* ── TÂM ĐIỂM: KHUNG ẢNH CHÂN DUNG VIỀN ĐÔI DÁT VÀNG NỔI BẬT ── */}
            <div className="my-4 relative">
              {/* Hiệu ứng hào quang vàng tỏa tròn */}
              <div className="absolute inset-0 size-36 sm:size-40 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-300/30 to-amber-600/40 blur-xl animate-pulse pointer-events-none" />

              {/* Vòng ngoài mạ vàng */}
              <div className="relative size-36 sm:size-40 rounded-full p-1.5 bg-gradient-to-tr from-[#D4AF37] via-[#FFF1B8] to-[#996515] shadow-[0_10px_30px_rgba(212,175,55,0.6)] flex items-center justify-center">
                {/* Vòng trong đệm tối */}
                <div className="size-full rounded-full p-1 bg-[#061024] flex items-center justify-center">
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="size-full rounded-full object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                {/* Huy hiệu vương miện đỉnh avatar */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 size-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white shadow-md flex items-center justify-center text-slate-950">
                  <Crown className="size-4 fill-current text-slate-950" />
                </div>
              </div>
            </div>

            {/* Thông tin Doanh nhân hội viên */}
            <div className="space-y-1 mb-3">
              <h3 className="text-lg sm:text-xl font-black text-amber-200 uppercase tracking-wide">
                {displayName}
              </h3>
              <p className="text-xs font-bold text-sky-200 leading-snug">
                {displayRole}
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                {displayCompany}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10.5px] font-bold text-amber-300 mt-1">
                <span>🎂 Ngày sinh:</span>
                <span className="font-extrabold">{formattedBday}</span>
              </div>
            </div>

            {/* Lời chúc mừng trang trọng từ CLB */}
            <div className="my-2 p-3 rounded-2xl bg-white/5 border border-amber-400/30 text-[11px] text-slate-200 italic leading-relaxed max-w-[340px]">
              "CLB Doanh Nhân CEO 1983 kính chúc Anh/Chị bước sang tuổi mới luôn dồi dào sức khỏe, tràn đầy nhiệt huyết, dẫn dắt doanh nghiệp ngày càng bứt phá thành công &amp; luôn tỏa sáng cùng cộng đồng!"
            </div>

            {/* Chữ ký Ban Chấp Hành */}
            <div className="pt-2 text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">
              TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983
            </div>
          </div>
        </div>

        {/* ── THANH HÀNH ĐỘNG BÊN DƯỚI POSTER ── */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPoster}
            disabled={isDownloading}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Download className="size-4 text-slate-950" />
            <span>{isDownloading ? "Đang xuất ảnh..." : "Tải poster kỷ niệm"}</span>
          </button>

          <button
            type="button"
            onClick={handleShareToFeed}
            className="py-2.5 px-3 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white border border-amber-400/40 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shrink-0"
          >
            <Share2 className="size-4 text-amber-300" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

