import React, { useState, useEffect } from "react";
import {
  Share,
  PlusSquare,
  X,
  Smartphone,
  Sparkles,
  Download,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ArrowDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function IosInstallPrompt() {
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "safari">("profile");
  const [copied, setCopied] = useState(false);
  const [hasDismissedPill, setHasDismissedPill] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const inApp = /zalo|fbav|fban|messenger|instagram|crios|fxios|tiktok|micromessenger/i.test(userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsIosDevice(isIos);
    setIsInAppBrowser(inApp);
    setIsStandalone(standalone);

    // Check if dismissed recently (within 7 days)
    const dismissedUntil = localStorage.getItem("ceo1983_pwa_dismissed_until");
    const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

    if (isIos && !standalone) {
      if (!isDismissed) {
        // Automatically pop up helper after 2 seconds
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }

    // Global event listener to open from anywhere
    const handleOpen = () => setShowModal(true);
    window.addEventListener("open-ios-install-guide", handleOpen);
    return () => window.removeEventListener("open-ios-install-guide", handleOpen);
  }, []);

  const handleDismissForever = (days = 7) => {
    setShowModal(false);
    setHasDismissedPill(true);
    try {
      const until = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem("ceo1983_pwa_dismissed_until", until.toString());
    } catch {}
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Đã sao chép liên kết! Hãy mở Safari và dán vào thanh địa chỉ.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Vui lòng sao chép link trên thanh địa chỉ của bạn.");
    }
  };

  const handleDownloadProfile = () => {
    // Download the Apple WebClip .mobileconfig profile
    const profileUrl = "/ceo1983.mobileconfig";
    window.location.href = profileUrl;
    toast.success("Đang tải hồ sơ cấu hình... Hãy bấm 'Cho phép' và vào Cài đặt để kích hoạt.");
  };

  // Only render for iOS non-standalone devices
  if (!isIosDevice || isStandalone) return null;

  return (
    <>
      {/* 1. Persistent Mini Floating Pill (when modal is closed and not permanently hidden) */}
      {!showModal && !hasDismissedPill && (
        <div className="fixed bottom-20 right-3 z-[9980] animate-bounce-subtle">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-[#001A4D] via-[#003B95] to-[#002B70] px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-amber-400/30"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              iOS
            </div>
            <span>Cài App CEO 1983</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          </button>
        </div>
      )}

      {/* 2. In-App Warning Banner (Top sticky if opened in Zalo / Facebook / Messenger) */}
      {isInAppBrowser && !showModal && (
        <div className="fixed top-0 inset-x-0 z-[9995] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-3 py-2 text-white shadow-lg text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200 animate-bounce" />
            <span className="truncate">
              Đang mở qua <strong>Zalo/Facebook</strong>. Bấm nút để chuyển sang Safari!
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-black text-amber-900 shadow-xs hover:bg-amber-100 transition active:scale-95 cursor-pointer"
          >
            Mở Safari
          </button>
        </div>
      )}

      {/* 3. Comprehensive Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-900/98 p-5 text-white shadow-2xl ring-1 ring-white/10 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header with App Icon */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#003B95] to-amber-500 p-0.5 shadow-lg shrink-0">
                  <img
                    src="/apple-touch-icon.png"
                    alt="CEO 1983 App"
                    className="h-full w-full rounded-[14px] object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>Cài Đặt App CEO 1983</span>
                    <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                      iOS 1-Chạm
                    </span>
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    Trải nghiệm toàn màn hình như ứng dụng App Store
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Special Section: Zalo / Facebook In-App Browser Detection */}
            {isInAppBrowser ? (
              <div className="my-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block text-[13px] font-bold">
                      Bạn đang xem qua trình duyệt Zalo/Facebook
                    </strong>
                    <p className="text-[11.5px] text-slate-300 mt-1 leading-relaxed">
                      Apple không cho phép cài đặt App từ trình duyệt nội bộ này. Vui lòng chuyển sang trình duyệt Safari mặc định:
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl bg-slate-950/60 p-3 border border-amber-500/20 text-[11.5px]">
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      1
                    </span>
                    <span>
                      Nhấn vào biểu tượng <strong>( ••• )</strong> ở góc trên bên phải màn hình
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      2
                    </span>
                    <span>
                      Chọn <strong>"Mở bằng trình duyệt"</strong> hoặc <strong>"Mở bằng Safari"</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Đã sao chép link thành công!" : "Sao chép link để dán vào Safari"}</span>
                </button>
              </div>
            ) : (
              /* Regular Safari Environment: 2 Installation Methods */
              <div className="my-3 space-y-3 overflow-y-auto pr-1">
                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/5 p-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-[#003B95] text-white shadow-md border border-blue-400/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Cài 1-Chạm (Profile)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("safari")}
                    className={`rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "safari"
                        ? "bg-[#003B95] text-white shadow-md border border-blue-400/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Share className="h-3.5 w-3.5" />
                    <span>Thêm Qua Safari</span>
                  </button>
                </div>

                {activeTab === "profile" ? (
                  /* Option A: 1-Click Apple Configuration Profile */
                  <div className="space-y-3 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-950/80 p-3.5 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Cài đặt tự động qua Apple Configuration Profile</span>
                    </div>

                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      Tiện lợi nhất cho Doanh nhân: Không cần tìm nút trong menu Safari, biểu tượng App sẽ được đưa thẳng lên màn hình chính.
                    </p>

                    <div className="space-y-2 rounded-xl bg-slate-900/90 p-3 text-[11.5px] text-slate-200 border border-white/5">
                      <div className="flex items-start gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500/30 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                          1
                        </span>
                        <span>Bấm nút <strong>Tải Profile Cài Đặt</strong> bên dưới rồi chọn <strong>Cho phép</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500/30 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                          2
                        </span>
                        <span>Vào ứng dụng <strong>Cài đặt (Settings)</strong> trên iPhone &gt; Bấm vào dòng <strong>"Đã tải về hồ sơ"</strong> ở đầu trang.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500/30 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                          3
                        </span>
                        <span>Bấm <strong>Cài đặt (Install)</strong> ở góc trên bên phải &gt; Xong! Icon CEO 1983 xuất hiện ngay ngoài màn hình chính.</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadProfile}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#003B95] hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xs py-3 shadow-lg transition active:scale-98 cursor-pointer ring-1 ring-blue-400/30"
                    >
                      <Download className="h-4 w-4" />
                      <span>Tải Profile Cài Đặt (iOS WebClip)</span>
                    </button>
                  </div>
                ) : (
                  /* Option B: Standard Safari Share Menu with Visual Arrow */
                  <div className="space-y-3 rounded-2xl bg-white/5 p-3.5 border border-white/5">
                    <p className="text-[11.5px] text-slate-300">
                      Thực hiện nhanh 3 bước trên thanh công cụ Safari của iPhone:
                    </p>

                    <div className="space-y-2.5 text-[11.5px] text-slate-200">
                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/80 p-2.5 border border-white/5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs shrink-0">
                          1
                        </span>
                        <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                          <span>Chạm nút</span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-blue-300 font-bold border border-blue-500/30">
                            <Share className="h-3.5 w-3.5 text-blue-400" />
                            Chia sẻ
                          </span>
                          <span>ở thanh dưới cùng của Safari</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/80 p-2.5 border border-white/5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs shrink-0">
                          2
                        </span>
                        <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                          <span>Cuộn xuống và chọn</span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-300 font-bold border border-amber-500/30">
                            <PlusSquare className="h-3.5 w-3.5 text-amber-400" />
                            Thêm vào MH chính
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/80 p-2.5 border border-white/5">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs shrink-0">
                          3
                        </span>
                        <div className="flex-1">
                          <span>Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải màn hình để hoàn tất.</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Bouncing Arrow pointing to bottom bar */}
                    <div className="flex items-center justify-center gap-2 pt-2 text-center text-xs font-bold text-amber-300">
                      <ArrowDown className="h-4 w-4 animate-bounce text-amber-400" />
                      <span>Nhìn xuống thanh công cụ dưới cùng Safari để thấy nút Chia sẻ</span>
                      <ArrowDown className="h-4 w-4 animate-bounce text-amber-400" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDismissForever(7)}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer underline underline-offset-2"
              >
                Không nhắc lại trong 7 ngày
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-[#003B95] hover:bg-[#002B70] px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
