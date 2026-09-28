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
  companyLogoUrl,
  website = "https://ceo1983club.com",
  clubEmail = "info@ceo1983club.com",
  qrValue,
  avatarUrl,
  cardCode,
  className = "",
  showActions = true,
  onCompanyLogoUpdated,
}: Ceo1983BusinessCardVisitProps) {
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [localCompanyLogo, setLocalCompanyLogo] = useState<string | null>(() => {
    if (companyLogoUrl && !isBlackBackgroundLogo(companyLogoUrl)) {
      return companyLogoUrl;
    }
    if (typeof window !== "undefined") {
      try {
        const direct = localStorage.getItem("vba_member_company_logo");
        if (direct && !isBlackBackgroundLogo(direct)) return direct;
        const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
        if (cp?.companyLogo && !isBlackBackgroundLogo(cp.companyLogo)) return cp.companyLogo;
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "null");
        if ((mem?.companyLogoUrl || mem?.companyLogo) && !isBlackBackgroundLogo(mem?.companyLogoUrl || mem?.companyLogo)) {
          return mem.companyLogoUrl || mem.companyLogo;
        }
      } catch {}
    }
    return companyLogoUrl || null;
  });

  useEffect(() => {
    if (companyLogoUrl && !isBlackBackgroundLogo(companyLogoUrl)) {
      setLocalCompanyLogo(companyLogoUrl);
    }
  }, [companyLogoUrl]);

  useEffect(() => {
    const handleLogoUpdate = (e?: any) => {
      const url = e?.detail || localStorage.getItem("vba_member_company_logo");
      if (url && !isBlackBackgroundLogo(url)) setLocalCompanyLogo(url);
    };
    const handleProfileUpdate = (e?: any) => {
      const logo = e?.detail?.companyLogo || e?.detail?.companyLogoUrl;
      if (logo && !isBlackBackgroundLogo(logo)) setLocalCompanyLogo(logo);
    };
    window.addEventListener("vba_member_company_logo_updated", handleLogoUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("vba_member_company_logo_updated", handleLogoUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_profile_updated", handleProfileUpdate);
    };
  }, []);

  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  const validLocalLogo = isBlackBackgroundLogo(localCompanyLogo) ? null : localCompanyLogo;
  const validCompanyLogoUrl = isBlackBackgroundLogo(companyLogoUrl) ? null : companyLogoUrl;
  const displayCompanyLogo = validLocalLogo || validCompanyLogoUrl || "/ceo1983-official-logo.png";
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

  const handleUploadCompanyLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // 1. Client-side compression to avoid QuotaExceededError and ensure instant reactivity
      const { dataUrl, blob } = await compressImage(file, 400, 400, 0.85);

      // Instant local state update
      setLocalCompanyLogo(dataUrl);

      // Save to all relevant localStorage keys
      try {
        localStorage.setItem("vba_member_company_logo", dataUrl);

        const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        cp.companyLogo = dataUrl;
        localStorage.setItem("vba_custom_profile", JSON.stringify(cp));

        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.companyLogo = dataUrl;
        mem.companyLogoUrl = dataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch (storageErr) {
        console.warn("Storage quota warning:", storageErr);
      }

      // Dispatch global events for instant sync across all open routes and components
      window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: dataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { companyLogo: dataUrl } }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: { companyLogo: dataUrl } }));

      if (onCompanyLogoUpdated) {
        onCompanyLogoUpdated(dataUrl);
      }

      // Background upload to server (non-blocking) and replace with clean MinIO URL
      uploadFileToNest(blob, file.name || "company-logo.png")
        .then(async (uploadedUrl) => {
          if (uploadedUrl) {
            setLocalCompanyLogo(uploadedUrl);
            try {
              localStorage.setItem("vba_member_company_logo", uploadedUrl);
              const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
              cp.companyLogo = uploadedUrl;
              localStorage.setItem("vba_custom_profile", JSON.stringify(cp));
              const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
              mem.companyLogo = uploadedUrl;
              mem.companyLogoUrl = uploadedUrl;
              localStorage.setItem("vba_my_member", JSON.stringify(mem));
            } catch {}
            window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: uploadedUrl }));
            window.dispatchEvent(new CustomEvent("profile-updated", { detail: { companyLogo: uploadedUrl } }));
            window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: { companyLogo: uploadedUrl } }));
            if (onCompanyLogoUpdated) {
              onCompanyLogoUpdated(uploadedUrl);
            }
            await fetchNestApi("/members/me", {
              method: "PATCH",
              body: JSON.stringify({ companyLogoUrl: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});

      toast.success("Đã cập nhật logo công ty thành công!");
    } catch {
      toast.error("Không thể tải lên logo công ty");
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={companyLogoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleUploadCompanyLogo}
      />

      {/* 2D Flat Luxury Executive Card Container - No Flip, Clean & Direct */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[1.7/1] rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 bg-white overflow-hidden select-none">
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


          {/* TOP ROW: Góc trái là Tên công ty / Huy hiệu; Góc phải là LOGO CÔNG TY & MÃ QR */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            {/* Top-Left: Tên công ty to rõ ràng */}
            <div className="min-w-0 flex-1 pr-2">
              <span className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#19194D] line-clamp-2">
                {company}
              </span>
            </div>

            {/* Top-Right: LOGO CÔNG TY & MÃ QR CHÌM XUỐNG NỀN (KHÔNG BORDER & BACKGROUND) */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              {/* Logo công ty hội viên chìm xuống nền */}
              <div
                onClick={() => companyLogoInputRef.current?.click()}
                className="relative h-10 w-16 sm:h-12 sm:w-20 p-0 flex items-center justify-center cursor-pointer transition hover:opacity-80"
                title="Bấm để tải lên / thay đổi Logo công ty"
              >
                {displayCompanyLogo ? (
                  <img
                    src={resolveMediaUrl(displayCompanyLogo) || displayCompanyLogo}
                    alt={company}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ceo1983-official-logo.png";
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[9px] font-bold text-slate-400 leading-none gap-0.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>Logo Cty</span>
                  </div>
                )}
              </div>

              {/* Mã QR chìm xuống nền không border không background */}
              <div
                onClick={() => setQrModalOpen(true)}
                className="relative p-0 cursor-pointer hover:scale-105 active:scale-95 transition"
                title="Bấm để phóng to mã QR giữa màn hình"
              >
                <QrCanvas value={effectiveQr} size={48} />
              </div>
            </div>
          </div>

          {/* THÂN THẺ (MEMBER DETAILS & AVATAR) - Avatar dập nổi trực tiếp trên thẻ */}
          <div className="relative z-10 my-auto flex items-center gap-3 sm:gap-4 pl-0.5">
            {/* Avatar dập viền nổi trực tiếp trên mặt thẻ */}
            <div className="relative shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-2 ring-[#003B95]/30 bg-slate-100 shadow-md grid place-items-center">
                {avatarUrl ? (
                  <img
                    src={resolveMediaUrl(avatarUrl) || avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-base sm:text-lg font-black text-[#003B95]">
                    {name
                      .trim()
                      .split(/\s+/)
                      .slice(-2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase() || "CEO"}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Thông tin tên & số điện thoại (Đã bỏ email và chức danh theo yêu cầu) */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-[#19194D] uppercase leading-tight font-sans line-clamp-1">
                {name}
              </h1>

              {/* Thông tin liên hệ điện thoại */}
              {phone && (
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-[13px] text-[#1E293B]">
                  <Phone className="w-3.5 h-3.5 text-[#003B95] shrink-0" />
                  <a href={`tel:${phone}`} className="font-bold text-[#003B95] hover:underline truncate">
                    {phone}
                  </a>
                </div>
              )}
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
              <path d="M 0,40 C 25,65 50,120 135,120 L 0,120 Z" fill="#1B2456" />
              <path d="M 0,55 C 20,80 40,120 110,120 L 0,120 Z" fill="#141B41" />
              <path
                d="M 0,38 C 28,68 55,115 140,115 L 430,115 C 470,115 490,117 500,120"
                stroke="#F58220"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 0,34 C 28,65 58,113 145,113 L 425,113"
                stroke="#FDBA74"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CÁC NÚT ĐIỀU HƯỚNG VÀ HÀNH ĐỘNG DƯỚI DANH THIẾP (ĐÃ BỎ NÚT LẬT THẺ) */}
      {showActions && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {/* Nút Mã QR (Mở modal căn giữa màn hình) */}
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#003B95] hover:bg-[#002B70] text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR</span>
          </button>

          {/* Nút Chụp ảnh danh thiếp lưu danh bạ */}
          <button
            type="button"
            onClick={() => setCaptureModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Chụp ảnh danh thiếp lưu danh bạ số hoặc đổi nền thẻ"
          >
            <Camera className="w-3.5 h-3.5 text-slate-700" />
            <span>Chụp Danh Thiếp</span>
          </button>

          {/* Chia sẻ danh thiếp */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#19194D] to-[#252870] hover:brightness-110 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia Sẻ</span>
          </button>

          {/* Sao chép link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Đã chép</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao Chép Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Hidden input for company logo upload */}
      <input
        ref={companyLogoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadCompanyLogo}
      />

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
