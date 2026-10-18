import React, { useState, useRef, useEffect } from "react";
import { Phone, Mail, Globe, Share2, Check, QrCode, Camera, Building2, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { AssociationMemberQrModal } from "./AssociationMemberQrModal";
import { AssociationCardCaptureModal } from "./AssociationCardCaptureModal";
import { QrCanvas } from "./QrCanvas";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { compressImage } from "@/lib/image";

export interface Ceo1983BusinessCardVisitProps {
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
  company?: string;
  companyLogoUrl?: string | null;
  website?: string;
  clubEmail?: string;
  qrValue?: string;
  avatarUrl?: string | null;
  cardCode?: string;
  className?: string;
  showActions?: boolean;
  onCompanyLogoUpdated?: (url: string) => void;
}

export function isBlackBackgroundLogo(url?: string | null) {
  if (!url) return false;
  return (
    url.includes("1lfhzi") ||
    url.includes("fskz6f") ||
    url.includes("brand-header-logo-white")
  );
}

export function Ceo1983BusinessCardVisit({
  name = "NGUYỄN VĂN A",
  title = "Director",
  phone = "036xxxxxxx",
  email = "username@gmail.com",
  company = "CÂU LẠC BỘ CEO1983",
  website = "https://ceo1983club.com",
  clubEmail = "info@ceo1983club.com",
  qrValue,
  avatarUrl,
  cardCode,
  className = "",
  showActions = true,
}: Ceo1983BusinessCardVisitProps) {
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const effectiveQr = qrValue || (cardCode ? `https://ceo1983club.com/card/${cardCode}` : `https://ceo1983club.com`);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveQr);
      setCopied(true);
      toast.success("Đã sao chép liên kết danh thiếp!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Danh thiếp ${name} - CLB CEO 1983`,
          text: `${name} · ${company}`,
          url: effectiveQr,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {/* 2D Flat Luxury Executive Card Container - No Flip, Clean & Direct */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[1.7/1] rounded-2xl shadow-[0_8px_30px_-5px_rgba(245,158,11,0.22)] border-2 border-amber-400/60 bg-gradient-to-br from-white via-amber-50/15 to-white overflow-hidden select-none">
        {/* ==================================================================== */}
        {/* MẶT THẺ DOANH NHÂN VIP: LOGO CÔNG TY & MÃ QR GÓC PHẢI, AVATAR DẬP NỔI */}
        {/* ==================================================================== */}
        <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5">
          {/* Custom Captured / Uploaded Background */}
          {customBgImage && (
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <img
                src={customBgImage}
                alt="Ảnh nền tùy chỉnh"
                className="w-full h-full object-cover opacity-90"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomBgImage(null);
                  toast.info("Đã khôi phục nền gốc");
                }}
                className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 backdrop-blur-md text-[10px] font-bold shadow-xs hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Khôi phục nền gốc
              </button>
            </div>
          )}


          {/* THÂN THẺ (MEMBER DETAILS & ENLARGED QR) - Bỏ tên cty và logo, chỉ hiện tên + sđt + QR to */}
          <div className="relative z-10 my-auto flex items-center justify-between gap-4 px-1">
            {/* Cột trái: Avatar + Tên + Số điện thoại */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              {/* Avatar dập viền nổi trực tiếp trên mặt thẻ */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden ring-3 ring-amber-400/80 bg-slate-100 shadow-md grid place-items-center">
                  {avatarUrl ? (
                    <img
                      src={resolveMediaUrl(avatarUrl) || avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-gradient-to-tr from-[#002B70] to-[#003B95] text-base sm:text-lg font-black text-amber-300">
                      {(() => {
                        const clean = (name || "").replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim();
                        const parts = clean.split(/\s+/).filter(Boolean);
                        if (parts.length === 0) return "CEO";
                        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      })()}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* Thông tin tên & số điện thoại */}
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg font-black tracking-wide text-[#002B70] uppercase leading-tight font-sans line-clamp-2 break-words">
                  {(name || "").replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim() || name}
                </h1>

                {phone && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-[#1E293B]">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <a href={`tel:${phone}`} className="font-bold text-[#003B95] hover:underline truncate">
                      {phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Mã QR Kích thước to nổi bật */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <div
                onClick={() => setQrModalOpen(true)}
                className="relative p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 shadow-md border border-amber-400/50 cursor-pointer hover:scale-105 active:scale-95 transition"
                title="Bấm để phóng to mã QR giữa màn hình"
              >
                <QrCanvas value={effectiveQr} size={84} />
              </div>
            </div>
          </div>

          {/* DẢI SÓNG ORGANIC GÓC TRÁI DƯỚI & VIỀN CAM UỐN LƯỢN CHUẨN BRANDBOOK */}
          <div className="absolute bottom-0 left-0 right-0 w-full h-16 sm:h-20 pointer-events-none overflow-hidden rounded-b-2xl">
            <svg
              viewBox="0 0 500 120"
              preserveAspectRatio="none"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 0,40 C 25,65 50,120 135,120 L 0,120 Z" fill="#002B70" />
              <path d="M 0,55 C 20,80 40,120 110,120 L 0,120 Z" fill="#001D4A" />
              <path
                d="M 0,38 C 28,68 55,115 140,115 L 430,115 C 470,115 490,117 500,120"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 0,34 C 28,65 58,113 145,113 L 425,113"
                stroke="#FDE68A"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CÁC NÚT ĐIỀU HƯỚNG VÀ HÀNH ĐỘNG DƯỚI DANH THIẾP */}
      {showActions && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {/* Nút Mã QR (Mở modal căn giữa màn hình) */}
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#002B70] to-[#003B95] border border-amber-400/50 hover:border-amber-400 text-amber-300 transition-all shadow-xs hover:shadow-[0_0_12px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Mã QR</span>
          </button>

          {/* Nút Chụp ảnh danh thiếp lưu danh bạ */}
          <button
            type="button"
            onClick={() => setCaptureModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-amber-50/40 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Chụp ảnh danh thiếp lưu danh bạ số hoặc đổi nền thẻ"
          >
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>Chụp Danh Thiếp</span>
          </button>

          {/* Chia sẻ danh thiếp */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#002B70] to-[#003B95] border border-amber-400/50 hover:border-amber-400 text-amber-300 transition-all shadow-xs hover:shadow-[0_0_12px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Chia Sẻ</span>
          </button>

          {/* Sao chép link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/30 bg-white dark:bg-slate-800 hover:bg-amber-50/30 text-amber-800 dark:text-amber-300 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Đã chép</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>Sao Chép Link</span>
              </>
            )}
          </button>
        </div>
      )}



      {/* Modal Mã QR của tôi & Quét QR (Căn giữa màn hình) */}
      <AssociationMemberQrModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        memberCode={
          cardCode ||
          (typeof window !== "undefined"
            ? (() => {
                try {
                  const m = JSON.parse(localStorage.getItem("vba_my_member") || "null");
                  return m?.code || null;
                } catch {
                  return null;
                }
              })()
            : null) ||
          "M1983-292"
        }
        memberName={name}
        memberTitle={title}
        memberCompany={company}
        memberAvatar={avatarUrl}
      />

      {/* Modal Chụp Ảnh / Tải Nền Khung Ngắm Chuẩn 1.7:1 */}
      <AssociationCardCaptureModal
        open={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
        onApplyBackground={(img) => setCustomBgImage(img)}
      />
    </div>
  );
}
