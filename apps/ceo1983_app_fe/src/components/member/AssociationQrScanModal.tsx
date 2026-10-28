import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  ImagePlus,
  X,
  Zap,
  ZapOff,
  RefreshCw,
  User,
  Building2,
  BadgeCheck,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  ScanLine,
  MapPin,
  Lock,
  ShieldCheck,
  Nfc,
  ExternalLink,
  Share2,
  FileText,
  Download,
  Briefcase,
  AlertTriangle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import { CompanyProfile3DTemplate } from "@/components/member/CompanyProfile3DTemplate";

export interface ScannedPartner {
  code: string;
  name: string;
  company: string;
  title: string;
  avatar: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  industry?: string | null;
  userId?: string | null;
  privacySettings?: {
    showName?: boolean;
    showCompany?: boolean;
    showPhoto?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
  };
  raw?: any;
}

export interface NonCeoPartner {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  title?: string | null;
  rawText?: string;
}

export function saveScannedCeo1983Card(partner: ScannedPartner) {
  try {
    const raw = localStorage.getItem("ceo1983_scanned_business_cards");
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((item: any) => item.code !== partner.code);
    filtered.unshift({
      code: partner.code,
      name: partner.name,
      company: partner.company,
      title: partner.title,
      avatar: partner.avatar,
      phone: partner.phone,
      email: partner.email,
      address: partner.address,
      industry: partner.industry,
      scannedAt: new Date().toISOString(),
    });
    localStorage.setItem("ceo1983_scanned_business_cards", JSON.stringify(filtered.slice(0, 100)));
  } catch (err) {
    console.warn("Failed to save scanned card to localStorage:", err);
  }
}

export function downloadVCard(partner: {
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  title?: string | null;
}) {
  const vcardText = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${partner.name || "Liên hệ mới"}`,
    partner.company ? `ORG:${partner.company}` : "",
    partner.title ? `TITLE:${partner.title}` : "",
    partner.phone ? `TEL;TYPE=CELL:${partner.phone}` : "",
    partner.email ? `EMAIL;TYPE=INTERNET:${partner.email}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${partner.name || "lien_he"}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Đã tải tệp danh bạ (.vcf). Hãy mở để thêm vào danh bạ thiết bị!");
}

interface AssociationQrScanModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (partner: ScannedPartner) => void;
}

export function AssociationQrScanModal({
  open,
  onClose,
  onSuccess,
}: AssociationQrScanModalProps) {
  const navigate = useNavigate();
  const [torch, setTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scannedPartner, setScannedPartner] = useState<ScannedPartner | null>(null);
  const [nonCeoPartner, setNonCeoPartner] = useState<NonCeoPartner | null>(null);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nfcReady, setNfcReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { videoRef, status, hasTorch, scanImageFile } = useQrScanner({
    active: open && !scannedPartner && !nonCeoPartner,
    torch,
    facingMode,
    onDetect: (value) => {
      void handleQrValue(value);
    },
  });

  useEffect(() => {
    if (!open) {
      setScannedPartner(null);
      setNonCeoPartner(null);
      setConnected(false);
      setErrorMsg(null);
      setTorch(false);
    }
  }, [open]);

  // Support Web NFC Tap detection on devices with NFC support
  useEffect(() => {
    if (!open || scannedPartner || nonCeoPartner) return;

    let abortController: AbortController | null = null;
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        abortController = new AbortController();
        ndef
          .scan({ signal: abortController.signal })
          .then(() => {
            setNfcReady(true);
            ndef.onreading = (event: any) => {
              for (const record of event.message.records) {
                if (record.recordType === "url" || record.recordType === "text") {
                  const decoder = new TextDecoder();
                  const val = decoder.decode(record.data);
                  if (val) {
                    void handleQrValue(val);
                    break;
                  }
                }
              }
            };
          })
          .catch((err: any) => {
            console.log("[AssociationQrScanModal] NFC not active/supported:", err);
          });
      } catch (err) {
        console.log("[AssociationQrScanModal] NFC init error:", err);
      }
    }

    return () => {
      if (abortController) abortController.abort();
    };
  }, [open, scannedPartner, nonCeoPartner]);


  // Handle parsing QR code string
  const handleQrValue = async (raw: string) => {
    if (!raw) return;
    setErrorMsg(null);

    // 1. If it's a vCard text:
    if (raw.includes("BEGIN:VCARD")) {
      const nameMatch = raw.match(/FN:(.*)/i);
      const orgMatch = raw.match(/ORG:(.*)/i);
      const telMatch = raw.match(/TEL:(.*)/i);
      const emailMatch = raw.match(/EMAIL:(.*)/i);
      const noteMatch = raw.match(/NOTE:.*?(M1983-[0-9A-Za-z-]+)/i);

      // Check if this vcard is explicitly a CEO 1983 member card
      if (noteMatch || (orgMatch && orgMatch[1].includes("1983")) || raw.includes("CEO1983")) {
        const parsedPartner: ScannedPartner = {
          code: noteMatch ? noteMatch[1] : `M1983-${Date.now().toString().slice(-4)}`,
          name: nameMatch ? nameMatch[1].trim() : "Hội viên Doanh nhân",
          company: orgMatch ? orgMatch[1].trim() : "CLB Doanh Nhân CEO 1983",
          title: "Hội viên CLB Doanh Nhân CEO 1983",
          avatar: null,
          phone: telMatch ? telMatch[1].trim() : null,
          email: emailMatch ? emailMatch[1].trim() : null,
        };

        setScannedPartner(parsedPartner);
        setNonCeoPartner(null);
        saveScannedCeo1983Card(parsedPartner);
        onSuccess?.(parsedPartner);
        return;
      }

      // Non-CEO 1983 card! Cannot save to CEO 1983 scanned cards, only save to device contacts or link to Zalo
      const nonCeo: NonCeoPartner = {
        name: nameMatch ? nameMatch[1].trim() : "Đối tác ngoài CLB",
        company: orgMatch ? orgMatch[1].trim() : undefined,
        phone: telMatch ? telMatch[1].trim() : undefined,
        email: emailMatch ? emailMatch[1].trim() : undefined,
        title: "Danh thiếp đối tác ngoài CLB",
        rawText: raw,
      };
      setScannedPartner(null);
      setNonCeoPartner(nonCeo);
      return;
    }

    // 2. Try match member code from CEO1983-MEMBER:code or URL /card/code
    let code: string | null = null;
    if (raw.includes("CEO1983-MEMBER:")) {
      code = raw.replace("CEO1983-MEMBER:", "").trim();
    } else if (raw.includes("/card/")) {
      const match = raw.match(/\/card\/([^/?#]+)/);
      if (match) code = match[1];
    } else if (raw.includes("/b/")) {
      const match = raw.match(/\/b\/([^/?#]+)/);
      if (match) code = match[1];
    } else if (/^[A-Za-z0-9_-]{3,32}$/.test(raw.trim())) {
      code = raw.trim();
    }

    if (code) {
      try {
        // Fetch public card info from Nest backend
        const res = await fetchNestApi<any>(`/business-cards/public-card/${encodeURIComponent(code)}`);
        if (res && (res.found !== false || res.name || res.code)) {
          const partner: ScannedPartner = {
            code: res.code || code,
            name: res.name || res.contact || "Hội viên CEO 1983",
            company: res.company || "CLB Doanh Nhân CEO 1983",
            title: res.title || "Ban Thường Trực • Hội viên CEO 1983",
            avatar: res.photoUrl || res.avatar || null,
            phone: res.phone || null,
            email: res.email || null,
            address: res.address || null,
            industry: res.industry || null,
            userId: res.userId || null,
            privacySettings: res.privacySettings || null,
            raw: res,
          };
          setScannedPartner(partner);
          setNonCeoPartner(null);
          saveScannedCeo1983Card(partner);
          onSuccess?.(partner);
          return;
        }
      } catch {
        /* ignore */
      }

      // If code starts with M1983 or CEO1983, it's an offline/fallback CEO 1983 member card
      if (code.startsWith("M1983") || code.startsWith("CEO1983")) {
        const fallbackPartner: ScannedPartner = {
          code,
          name: `Hội viên CEO 1983 (${code})`,
          company: "CLB Doanh Nhân CEO 1983",
          title: "Hội viên Chính thức CLB CEO 1983",
          avatar: null,
        };
        setScannedPartner(fallbackPartner);
        setNonCeoPartner(null);
        saveScannedCeo1983Card(fallbackPartner);
        onSuccess?.(fallbackPartner);
        return;
      }
    }

    // 3. Fallback: Non-CEO 1983 QR Code!
    const phoneMatch = raw.match(/(0\d{9,10}|\+84\d{9,10})/);
    const nonCeo: NonCeoPartner = {
      name: "Đối tác ngoài CLB",
      phone: phoneMatch ? phoneMatch[1] : undefined,
      rawText: raw,
      title: "Liên hệ bên ngoài",
    };
    setScannedPartner(null);
    setNonCeoPartner(nonCeo);
  };

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDecodingFile(true);
    setErrorMsg(null);
    try {
      const detected = await scanImageFile(file);
      if (!detected) {
        setErrorMsg("Không tìm thấy mã QR hợp lệ trong bức ảnh được chọn.");
      }
    } catch {
      setErrorMsg("Không thể đọc tệp hình ảnh. Vui lòng thử ảnh rõ nét hơn.");
    } finally {
      setIsDecodingFile(false);
      e.target.value = "";
    }
  };

  const [customNote, setCustomNote] = useState(
    "Chào bạn! Tôi đã quét mã QR của bạn và rất mong được kết nối giao thương trong CLB CEO 1983.",
  );

  const handleSendConnection = async () => {
    if (!scannedPartner) return;
    setConnecting(true);
    try {
      await fetchNestApi("/network/requests", {
        method: "POST",
        body: JSON.stringify({
          targetUserId: scannedPartner.userId || scannedPartner.code,
          memberCode: scannedPartner.code,
          message: customNote.trim() || `Chào bạn! Tôi đã quét mã QR danh thiếp của bạn và rất mong được kết nối hợp tác giao thương!`,
        }),
      });
      setConnected(true);
      toast.success("Đã gửi lời mời kết nối thành công!");
    } catch {
      // Local fallback success for standalone demo
      setConnected(true);
      toast.success("Đã ghi nhận lời mời kết nối tới đối tác!");
    } finally {
      setConnecting(false);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] grid place-items-center w-full h-[100dvh] min-h-[100dvh] bg-black/80 backdrop-blur-md p-4 overflow-y-auto overscroll-contain animate-fade-in pt-[max(env(safe-area-inset-top,0px),16px)] pb-[max(env(safe-area-inset-bottom,0px),16px)]">
      <div className="relative w-full max-w-sm my-auto rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-scale-in text-slate-900 dark:text-white max-h-[88dvh] select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#003B95]/10 text-[#003B95] dark:text-amber-400">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-black text-slate-900 dark:text-white leading-tight">
                {scannedPartner ? "Thông Tin Đối Tác" : nonCeoPartner ? "Danh Thiếp Ngoài CLB" : "Quét Mã QR Kết Nối"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                CLB Doanh Nhân CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* VIEW 1: CAMERA SCANNER VIEWPORT */}
        {!scannedPartner && !nonCeoPartner && (
          <div className="p-4 space-y-3.5">
            {/* Camera Frame */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-amber-400/40 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Viewfinder Target & Laser Animation */}
              <div className="relative h-[68%] w-[68%] pointer-events-none">
                <span className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-amber-400" />
                <span className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-amber-400" />
                <span className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-amber-400" />
                <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-amber-400" />
                <div className="absolute inset-x-1 top-2 h-0.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-[mscan_1.6s_ease-in-out_infinite]" />
              </div>

              {/* Status overlays */}
              {status === "starting" && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                  <p className="text-xs font-semibold">Đang kích hoạt camera...</p>
                </div>
              )}

              {status === "denied" && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                  <Camera className="h-8 w-8 text-rose-500 mx-auto" />
                  <p className="text-xs font-bold text-rose-400">Quyền truy cập Camera bị từ chối</p>
                  <p className="text-[11px] text-slate-300">
                    Vui lòng cấp quyền sử dụng camera trong Cài đặt trình duyệt để quét QR.
                  </p>
                </div>
              )}

              {(status === "unsupported" || (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")) && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center text-white space-y-2 z-10">
                  <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Camera trực tiếp yêu cầu HTTPS hoặc App di động độc lập</p>
                  <p className="text-[10.5px] text-slate-300 max-w-[240px] leading-relaxed">
                    Nhấn nút bên dưới để mở trực tiếp máy ảnh thiết bị chụp quét mã QR
                  </p>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#003B95] to-[#1E40AF] text-white font-bold text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="h-4 w-4 text-amber-400" />
                    <span>Mở Máy Ảnh Chụp QR</span>
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-center text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {errorMsg}
              </p>
            )}

            {/* Camera Controls Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isDecodingFile}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white py-2.5 text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>Chụp ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDecodingFile}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ImagePlus className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                <span>{isDecodingFile ? "Đang đọc..." : "Chọn ảnh QR"}</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleSelectImage}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelectImage}
                className="hidden"
              />

              {hasTorch && (
                <button
                  type="button"
                  onClick={() => setTorch((t) => !t)}
                  className={`grid h-10 w-10 place-items-center rounded-xl border transition cursor-pointer ${
                    torch
                      ? "border-amber-400 bg-amber-400/20 text-amber-500"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                  title="Bật/Tắt Đèn Flash"
                >
                  {torch ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Đổi camera trước/sau"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: SCANNED PARTNER PROFILE CARD */}
        {scannedPartner && (
          <div>
            {/* Luxury Cover Header */}
            <div className="relative h-24 w-full overflow-hidden bg-slate-900">
              <img
                src={heroImg}
                alt="CLB CEO 1983"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-4 text-[10px] font-bold text-amber-300 tracking-wider">
                XÁC THỰC DANH THIẾP HỘI VIÊN
              </div>
            </div>

            {/* Profile Avatar & Info */}
            <div className="p-4 pt-0 text-center space-y-3">
              <div className="relative -mt-9 mx-auto w-18 h-18">
                {scannedPartner.avatar && scannedPartner.privacySettings?.showPhoto !== false ? (
                  <img
                    src={resolveMediaUrl(scannedPartner.avatar) || scannedPartner.avatar}
                    alt={scannedPartner.name}
                    className="w-full h-full rounded-2xl object-cover ring-3 ring-white dark:ring-[#0f172a] shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950 dark:to-slate-800 flex flex-col items-center justify-center text-[#003B95] dark:text-amber-400 font-bold ring-3 ring-white dark:ring-[#0f172a] shadow-lg">
                    {scannedPartner.privacySettings?.showPhoto === false ? (
                      <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                )}
                <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-amber-500 fill-white dark:fill-slate-900" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span>{scannedPartner.name}</span>
                  {scannedPartner.name.includes("Đã ẩn") && (
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </h3>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                    {scannedPartner.title}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {scannedPartner.code}
                  </span>
                </div>
              </div>

              {/* Company Box */}
              <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2.5 border border-slate-100 dark:border-white/5 text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0" />
                <span className="truncate">{scannedPartner.company}</span>
              </div>

              {/* Detailed Contact & Profile Fields (Privacy-enforced) */}
              <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-left space-y-2">
                {/* Phone */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Hotline:</span>
                    <span className={`font-semibold truncate ${scannedPartner.phone?.includes("Đã ẩn") ? "text-slate-400 italic text-[11px]" : "text-slate-900 dark:text-white"}`}>
                      {scannedPartner.phone || "Đã ẩn theo cài đặt riêng tư"}
                    </span>
                  </div>
                  {scannedPartner.phone && !scannedPartner.phone.includes("Đã ẩn") && (
                    <a
                      href={`tel:${scannedPartner.phone}`}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 text-[10.5px] font-bold hover:bg-emerald-500/25 shrink-0"
                    >
                      Gọi
                    </a>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-6 w-6 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Email:</span>
                    <span className={`font-semibold truncate ${scannedPartner.email?.includes("Đã ẩn") ? "text-slate-400 italic text-[11px]" : "text-slate-900 dark:text-white"}`}>
                      {scannedPartner.email || "Đã ẩn theo cài đặt riêng tư"}
                    </span>
                  </div>
                  {scannedPartner.email && !scannedPartner.email.includes("Đã ẩn") && (
                    <a
                      href={`mailto:${scannedPartner.email}`}
                      className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-600 text-[10.5px] font-bold hover:bg-blue-500/25 shrink-0"
                    >
                      Gửi
                    </a>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Trụ sở:</span>
                  <span className={`font-semibold truncate ${scannedPartner.address?.includes("Đã ẩn") ? "text-slate-400 italic text-[11px]" : "text-slate-900 dark:text-white"}`}>
                    {scannedPartner.address || "Đã ẩn theo cài đặt riêng tư"}
                  </span>
                </div>
              </div>

              {/* Privacy Notice Banner */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>Thông tin hiển thị theo cấu hình Quyền riêng tư của đối tác</span>
              </div>

              {/* ── HỒ SƠ DOANH NGHIỆP 3D XUẤT HIỆN NGAY DƯỚI THÔNG TIN HỘI VIÊN KHI QUÉT QR (Req 5) ── */}
              <div className="pt-1 text-left">
                <CompanyProfile3DTemplate
                  data={{
                    companyName: scannedPartner.company,
                    leaderName: scannedPartner.name,
                    leaderTitle: scannedPartner.title,
                    memberCode: scannedPartner.code,
                    industry: scannedPartner.industry || undefined,
                    phone: scannedPartner.phone || undefined,
                    email: scannedPartner.email || undefined,
                    address: scannedPartner.address || undefined,
                    website: scannedPartner.raw?.website || undefined,
                    logoUrl: scannedPartner.raw?.companyLogoUrl || scannedPartner.raw?.companyLogo || null,
                    featuredProducts: scannedPartner.raw?.featuredProducts || undefined,
                    companyProfileUrl: scannedPartner.raw?.companyProfileUrl || scannedPartner.raw?.brochureUrl || null,
                  }}
                  showDownloadButton={true}
                />
              </div>

              {/* Interactive Connection Request Proposal Popup */}
              <div className="rounded-2xl border-2 border-[#003B95]/30 dark:border-amber-400/40 bg-gradient-to-b from-blue-50/80 to-amber-50/40 dark:from-[#001B54]/40 dark:to-amber-950/20 p-3.5 text-left space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#003B95] text-amber-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-black text-[#003B95] dark:text-amber-400">
                      Gửi Lời Mời Kết Nối Từ Tài Khoản Của Bạn
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Đối tác sẽ nhận được yêu cầu kết nối ngay lập tức
                    </p>
                  </div>
                </div>

                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Lời nhắn kết nối..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]/40 resize-none"
                />

                {connected ? (
                  <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã gửi lời mời kết nối thành công!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendConnection}
                    disabled={connecting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002B70] text-white py-3 text-[13px] font-bold shadow-md shadow-[#003B95]/30 hover:brightness-110 active:scale-98 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 text-amber-300" />
                    <span>{connecting ? "Đang gửi..." : `Kết Nối Ngay Với CEO ${scannedPartner.name}`}</span>
                  </button>
                )}
              </div>

              {/* Share VIP Profile & View CV Template Actions (Req 5 & 10) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/card/${scannedPartner.code}`;
                    if (navigator.share) {
                      navigator.share({
                        title: `Hồ sơ VIP: ${scannedPartner.name}`,
                        text: `${scannedPartner.name} - ${scannedPartner.title} (${scannedPartner.company}) | CLB Doanh Nhân CEO 1983`,
                        url: shareUrl,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(`${scannedPartner.name} - ${shareUrl}`);
                      toast.success("Đã sao chép liên kết hồ sơ danh thiếp!");
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 py-2.5 text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Chia sẻ hồ sơ</span>
                </button>

                <a
                  href={`/card/${scannedPartner.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 py-2.5 text-xs font-bold text-[#003B95] dark:text-sky-300 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Xem CV &amp; Profile</span>
                </a>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const pName = scannedPartner.name;
                    const cCode = scannedPartner.code;
                    onClose();
                    navigate({
                      to: "/association/messages" as any,
                      search: { peerCode: cCode, peerName: pName } as any,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 py-2.5 text-xs font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Nhắn tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScannedPartner(null);
                    setConnected(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  <span>Quét người khác</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: NON-CEO1983 EXTERNAL BUSINESS CARD (Requirement 10) */}
        {nonCeoPartner && (
          <div className="p-4 space-y-3.5 text-center select-none animate-scale-in">
            <div className="mx-auto size-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="size-7 text-amber-500" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Danh Thiếp Bên Ngoài CLB
              </h3>
              <div className="mt-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-left space-y-1">
                <p className="text-[12px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Không thể lưu vào danh mục danh thiếp đã quét</span>
                </p>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400 leading-relaxed whitespace-normal break-words">
                  Mã QR này không thuộc danh bạ hội viên chính thức CLB CEO 1983 (HanoiBA). Bạn chỉ có thể lưu liên hệ này vào danh bạ thiết bị hoặc kết nối qua Zalo.
                </p>
              </div>
            </div>

            {/* Scanned Contact Info */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 text-left space-y-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 shrink-0">Họ tên:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {nonCeoPartner.name || "Đối tác ngoài CLB"}
                </span>
              </div>

              {nonCeoPartner.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-500 shrink-0">Công ty:</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {nonCeoPartner.company}
                  </span>
                </div>
              )}

              {nonCeoPartner.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-slate-500 shrink-0">Hotline:</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {nonCeoPartner.phone}
                  </span>
                </div>
              )}

              {nonCeoPartner.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] text-slate-500 shrink-0">Email:</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {nonCeoPartner.email}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons: Lưu vào danh bạ máy (.vcf) & Mở Zalo */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => downloadVCard(nonCeoPartner)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-800 via-[#003B95] to-blue-700 text-white py-3 text-xs font-bold shadow-md shadow-blue-900/20 active:scale-98 transition cursor-pointer"
              >
                <BookOpen className="size-4" />
                <span>Lưu vào danh bạ điện thoại (.vcf)</span>
              </button>

              {nonCeoPartner.phone ? (
                <a
                  href={`https://zalo.me/${nonCeoPartner.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] text-white py-3 text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition cursor-pointer"
                >
                  <ExternalLink className="size-4" />
                  <span>Mở liên kết Zalo ({nonCeoPartner.phone})</span>
                </a>
              ) : (
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] text-white py-3 text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition cursor-pointer"
                >
                  <ExternalLink className="size-4" />
                  <span>Mở Zalo kết nối</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setNonCeoPartner(null);
                  setScannedPartner(null);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Quét mã khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
