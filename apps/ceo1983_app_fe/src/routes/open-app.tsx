import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  Smartphone,
  Apple,
  Share,
  PlusSquare,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";

const ZALO_OA_URL = "https://zalo.me/ceo1983";

export const Route = createFileRoute("/open-app")({
  head: () => ({
    meta: [
      { title: "Cài Đặt Ứng Dụng & Kết Nối Zalo OA — CLB Doanh Nhân CEO 1983 (HanoiBA)" },
      {
        name: "description",
        content:
          "Cài đặt ứng dụng Hội viên CEO 1983 lên thiết bị di động iOS và Android chỉ với 1 chạm, kết nối trực tiếp đến Zalo Official Account chính thức của CLB.",
      },
    ],
  }),
  component: OpenAppLauncherPage,
});

function OpenAppLauncherPage() {
  const navigate = useNavigate();
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("android");
  const [isStandalone, setIsStandalone] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [currentUrl, setCurrentUrl] = useState("https://ceo1983.viconnect.vn/association/login");

  const openZaloOa = (openInNewTab = true) => {
    try {
      if (typeof window !== "undefined") {
        if (openInNewTab) {
          window.open(ZALO_OA_URL, "_blank");
        } else {
          window.location.href = ZALO_OA_URL;
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Đọc query params
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    const autoInstall = params.get("auto_install") === "true" || params.get("ref") === "email_account";
    setTargetEmail(email);

    const origin = window.location.origin;
    const loginTarget = email
      ? `${origin}/association/login?email=${encodeURIComponent(email)}`
      : `${origin}/association/login`;
    setCurrentUrl(loginTarget);

    // 2. Nhận diện thiết bị
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /android/i.test(ua);

    if (isIos) {
      setDeviceType("ios");
    } else if (isAndroid) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }

    // 3. Nếu bấm từ email thông báo tài khoản: Tự động link đến trang Zalo OA CEO 1983 sau 1.2s
    if (autoInstall) {
      const zaloTimer = setTimeout(() => {
        try {
          window.open(ZALO_OA_URL, "_blank");
        } catch {}
      }, 1500);
      return () => clearTimeout(zaloTimer);
    }

    // 4. Kiểm tra xem đã chạy ở chế độ App Standalone (PWA đã cài đặt hoặc Capacitor Native) chưa
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      (window as any).Capacitor !== undefined ||
      document.referrer.includes("android-app://");

    if (standaloneMode) {
      setIsStandalone(true);
      setTimeout(() => {
        window.location.href = loginTarget;
      }, 800);
      return;
    }

    // 5. Bắt sự kiện PWA beforeinstallprompt từ window hoặc global cache
    const globalPrompt = (window as any).__pwaInstallPrompt;
    if (globalPrompt) {
      setInstallPrompt(globalPrompt);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
      setInstallPrompt(e);

      // Nếu là Android và người dùng vừa click mở từ email: Tự động bung hộp thoại cài đặt
      if (isAndroid) {
        setTimeout(() => {
          try {
            e.prompt();
          } catch {}
        }, 1200);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Xử lý khi nhấn nút Cài Đặt Android (1 chạm) + Tự động mở link Zalo OA
  const handleInstallAndroid = async () => {
    // 1. Mở song song link Zalo OA CEO 1983
    openZaloOa(true);

    // 2. Kích hoạt cài đặt PWA
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstallSuccess(true);
          (window as any).__pwaInstallPrompt = null;
          setInstallPrompt(null);
        }
      } catch {
        window.location.href = currentUrl;
      }
    } else {
      window.location.href = currentUrl;
    }
  };

  // Vào App ngay trên trình duyệt (kèm mở Zalo OA nếu chưa quan tâm)
  const handleOpenDirectly = () => {
    window.location.href = currentUrl;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-[#003B95] selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#003B95]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-md mx-auto w-full px-5 py-8 flex-1 flex flex-col justify-center">
        {/* Logo Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-[#001A4D] via-[#003B95] to-[#002B70] p-1 shadow-2xl border border-amber-400/40 flex items-center justify-center mb-3">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-['Inter']">
              CEO<span className="text-amber-400">1983</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3 text-amber-400 animate-spin" />
            <span>Ứng Dụng Doanh Nhân Chính Thức</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            CLB DOANH NHÂN CEO 1983
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            HanoiBA · Kết nối bền vững — Kiến tạo thịnh vượng — Vươn tầm doanh nhân
          </p>

          {targetEmail && (
            <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Tài khoản: <span className="font-bold text-amber-300">{targetEmail}</span>
            </div>
          )}
        </div>

        {/* Trạng thái 1: Đã ở trong App Standalone */}
        {isStandalone ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6 text-center space-y-3 backdrop-blur-md">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Đang Khởi Chạy Ứng Dụng CEO 1983</h3>
            <p className="text-xs text-slate-300">
              Hệ thống đang tự động đăng nhập vào tài khoản của Quý Anh/Chị...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ── TRƯỜNG HỢP 1: THIẾT BỊ ANDROID ── */}
            {deviceType === "android" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Thiết bị Android</h2>
                    <p className="text-[11px] text-slate-400">Cài đặt biểu tượng App lên màn hình chính</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Nhấn nút <strong>"Cài Đặt App CEO 1983"</strong> bên dưới.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Chọn <strong>"Cài đặt" (Install)</strong> khi trình duyệt hiển thị thông báo.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Biểu tượng CEO 1983 sẽ xuất hiện ngay trên màn hình chính như ứng dụng CH Play.</span>
                  </div>
                </div>

                {/* Nút Cài đặt Android */}
                <button
                  type="button"
                  onClick={handleInstallAndroid}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Download className="size-4.5" />
                  <span>Cài Đặt App CEO 1983 & Mở Zalo OA</span>
                </button>

                {/* Nút Quan Tâm Zalo OA CEO 1983 */}
                <button
                  type="button"
                  onClick={() => openZaloOa(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0068FF] to-[#004DC7] hover:from-[#005FE8] hover:to-[#0042AC] text-white font-bold text-xs shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <span className="size-5 rounded-full bg-white text-[#0068FF] font-black text-[11px] grid place-items-center">Z</span>
                  <span>Quan Tâm Zalo OA CEO 1983 Ngay</span>
                  <ExternalLink className="size-3.5 ml-0.5 opacity-80" />
                </button>

                {/* Nút Vào App Trực Tiếp */}
                <button
                  type="button"
                  onClick={handleOpenDirectly}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>Mở Trực Tiếp Trên Trình Duyệt</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}

            {/* ── TRƯỜNG HỢP 2: THIẾT BỊ iOS (IPHONE / IPAD) ── */}
            {deviceType === "ios" && (
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Apple className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">iPhone / iPad (iOS)</h2>
                    <p className="text-[11px] text-amber-400/90 font-medium">3 bước thêm vào Màn hình chính</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div className="flex-1">
                      <span>Bấm nút <strong>Chia Sẻ</strong> (biểu tượng</span>
                      <Share className="size-3.5 inline mx-1 text-blue-400" />
                      <span>ở thanh công cụ Safari bên dưới).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div className="flex-1">
                      <span>Cuộn xuống và chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen</span>
                      <PlusSquare className="size-3.5 inline mx-1 text-slate-200" />
                      <span>).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div className="flex-1">
                      <span>Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải. App CEO 1983 sẽ xuất hiện trên iPhone của Anh/Chị!</span>
                    </div>
                  </div>
                </div>

                {/* Nút Quan Tâm Zalo OA CEO 1983 iOS */}
                <button
                  type="button"
                  onClick={() => openZaloOa(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0068FF] to-[#004DC7] hover:from-[#005FE8] hover:to-[#0042AC] text-white font-bold text-xs shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <span className="size-5 rounded-full bg-white text-[#0068FF] font-black text-[11px] grid place-items-center">Z</span>
                  <span>Quan Tâm Zalo OA CEO 1983 Ngay</span>
                  <ExternalLink className="size-3.5 ml-0.5 opacity-80" />
                </button>

                {/* Nút Vào App Trực Tiếp iOS */}
                <button
                  type="button"
                  onClick={() => {
                    openZaloOa(true);
                    handleOpenDirectly();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002B70] hover:from-[#002766] hover:to-[#001A4D] text-white font-extrabold text-sm shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <ExternalLink className="size-4" />
                  <span>Vào App CEO 1983 Ngay Bây Giờ</span>
                </button>
              </div>
            )}

            {/* ── TRƯỜNG HỢP 3: MÁY TÍNH ĐỂ BÀN (DESKTOP) ── */}
            {deviceType === "desktop" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 pb-2 text-xs font-bold text-amber-400">
                  <Laptop className="size-4" />
                  <span>Quét mã để Cài Đặt lên Điện Thoại iOS & Android</span>
                </div>

                <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-md">
                  <QrCanvas value={currentUrl} size={180} />
                </div>

                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Dùng Camera điện thoại quét mã QR trên để tự động mở và cài đặt App CEO 1983 lên thiết bị di động.
                </p>

                {/* Nút Quan Tâm Zalo OA CEO 1983 Desktop */}
                <button
                  type="button"
                  onClick={() => openZaloOa(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0068FF] to-[#004DC7] hover:from-[#005FE8] hover:to-[#0042AC] text-white font-bold text-xs shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <span className="size-4 rounded-full bg-white text-[#0068FF] font-black text-[10px] grid place-items-center">Z</span>
                  <span>Liên Kết Trang Zalo OA CLB CEO 1983</span>
                  <ExternalLink className="size-3.5 ml-0.5 opacity-80" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenDirectly}
                  className="w-full py-3 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
                >
                  <span>Đăng Nhập Cổng Web Trên Máy Tính</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer cam kết bảo mật & Hotline */}
        <div className="mt-8 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Ứng dụng bảo mật độc quyền CLB Doanh Nhân CEO 1983</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Bản quyền © 2026 CLB Doanh Nhân CEO 1983 (HanoiBA)
          </p>
          <p className="text-[10.5px] text-amber-400/90 font-mono font-bold">
            Hotline Hỗ Trợ: 0973.205.683 / 0903.205.683 / 0903.203.204
          </p>
        </div>
      </div>
    </div>
  );
}

