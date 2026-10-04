import React, { useState, useEffect } from "react";
import {
  Share,
  PlusSquare,
  X,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  ArrowDown,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export function IosInstallPrompt() {
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(userAgent);
    const inApp = /zalo|fbav|fban|messenger|instagram|crios|fxios|tiktok|micromessenger/i.test(userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsIosDevice(isIos);
    setIsAndroidDevice(isAndroid);
    setIsInAppBrowser(inApp);
    setIsStandalone(standalone);

    // Bắt query param khi người khác bấm link được gửi (?install=ios, ?install=pwa, ?share=1, v.v.)
    const urlParams = new URLSearchParams(window.location.search);
    const hasInstallParam =
      urlParams.has("install") ||
      urlParams.has("pwa") ||
      urlParams.has("share") ||
      urlParams.has("app");

    if (hasInstallParam) {
      try {
        sessionStorage.removeItem("ceo1983_ios_prompt_dismissed");
        localStorage.removeItem("ceo1983_ios_prompt_dismissed");
      } catch {}
    }

    // Android Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissedLocally = localStorage.getItem("ceo1983_ios_prompt_dismissed");
      const dismissedSession = sessionStorage.getItem("ceo1983_ios_prompt_dismissed");
      if (hasInstallParam || (!dismissedLocally && !dismissedSession)) {
        setShowPrompt(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Nếu là thiết bị di động chưa cài đặt PWA
    if (!standalone && (isIos || isAndroid)) {
      const dismissedLocally = localStorage.getItem("ceo1983_ios_prompt_dismissed");
      const dismissedThisSession = sessionStorage.getItem("ceo1983_ios_prompt_dismissed");
      // Hiện lúc đầu thôi: Chỉ hiện khi có link share cài đặt (?install=ios)
      // HOẶC lần đầu tiên người dùng vào web app chưa từng bấm tắt đi ([Để sau] hoặc [X])
      if (hasInstallParam || (!dismissedLocally && !dismissedThisSession)) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    // Global listeners
    const handleOpenGuide = () => {
      setShowPrompt(true);
    };
    const handleOpenShare = () => {
      setShowShareModal(true);
    };
    const handleTriggerPrompt = () => {
      setShowPrompt(true);
    };

    window.addEventListener("open-ios-install-guide", handleOpenGuide);
    window.addEventListener("open-share-app-modal", handleOpenShare);
    window.addEventListener("open-install-prompt", handleTriggerPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-ios-install-guide", handleOpenGuide);
      window.removeEventListener("open-share-app-modal", handleOpenShare);
      window.removeEventListener("open-install-prompt", handleTriggerPrompt);
    };
  }, []);

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    setShowShareModal(false);
    try {
      localStorage.setItem("ceo1983_ios_prompt_dismissed", "true");
      sessionStorage.setItem("ceo1983_ios_prompt_dismissed", "true");
    } catch {}
  };

  const getSmartInstallUrl = () => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    return `${origin}/association?install=ios`;
  };

  const handleCopyLink = () => {
    try {
      const url = getSmartInstallUrl();
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép link cài đặt! Hãy mở Safari và dán vào thanh địa chỉ.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info("Vui lòng sao chép link trên thanh địa chỉ của bạn.");
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getSmartInstallUrl();
    const shareData = {
      title: "Ứng dụng CLB Doanh Nhân CEO 1983",
      text: "Mời bạn bấm vào link này để thêm ứng dụng CEO 1983 lên màn hình chính điện thoại:",
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Đã mở menu chia sẻ thành công!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        toast.success("Đã sao chép link cài đặt! Hãy gửi cho bạn bè qua Zalo/Messenger.");
        setTimeout(() => setCopiedShare(false), 2500);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopiedShare(true);
          toast.success("Đã sao chép link cài đặt!");
          setTimeout(() => setCopiedShare(false), 2500);
        } catch {}
      }
    }
  };

  // Không hiển thị nếu đã cài đặt chạy dạng standalone PWA
  if (isStandalone) return null;

  return (
    <>
      {/* ── 1. BẢNG THAO TÁC CÀI ĐẶT APP LÊN MÀN HÌNH CHÍNH IOS (TỰ ĐỘNG HIỆN KHI BẤM LINK APP) ── */}
      {showPrompt && !showShareModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#00183F] via-slate-950 to-black text-white shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0 bg-[#00183F]/90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003B95] to-amber-500 p-0.5 shadow-md shrink-0">
                  <img
                    src="/apple-touch-icon.png"
                    alt="CEO 1983"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                    }}
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Cài Đặt App CEO 1983</span>
                    <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-400/30">
                      {isIosDevice ? "iOS" : "Di Động"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-medium">
                    Thao tác thêm vào màn hình chính
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissPrompt}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-xs text-slate-200 overscroll-contain">
              {/* In-app Browser Notice if opened from Zalo / Facebook */}
              {isInAppBrowser ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block text-xs font-bold">
                        Đang mở trong Zalo / Messenger
                      </strong>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Hệ điều hành iOS chỉ hỗ trợ thêm app ra màn hình chính qua Safari:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl bg-slate-900/90 p-3 border border-amber-500/20 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                        1
                      </span>
                      <span>
                        Nhấn biểu tượng <strong>( ••• )</strong> ở góc trên bên phải màn hình
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                        2
                      </span>
                      <span>
                        Chọn <strong>"Mở bằng Safari"</strong> hoặc <strong>"Mở bằng trình duyệt"</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer touch-press"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Đã sao chép link thành công!" : "Sao chép link để dán vào Safari"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11.5px] text-amber-200">
                    <p className="leading-relaxed">
                      Thực hiện nhanh <strong>3 bước trên Safari</strong> để cài icon ứng dụng ra màn hình chính:
                    </p>
                  </div>

                  {/* 3 Quick Steps */}
                  <div className="space-y-2.5 text-[11.5px]">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs shrink-0">
                        1
                      </span>
                      <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                        <span>Chạm nút</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-blue-300 font-bold border border-blue-500/30">
                          <Share className="h-3.5 w-3.5 text-blue-400" />
                          Chia sẻ (Share)
                        </span>
                        <span>ở thanh dưới cùng của Safari</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10">
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

                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs shrink-0">
                        3
                      </span>
                      <div className="flex-1">
                        <span>Nhấn nút <strong>Thêm (Add)</strong> ở góc trên bên phải màn hình để hoàn tất.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 text-center text-[11px] font-bold text-amber-300">
                    <ArrowDown className="h-3.5 w-3.5 animate-bounce text-amber-400" />
                    <span>Nút Chia sẻ nằm ở thanh công cụ dưới cùng Safari</span>
                    <ArrowDown className="h-3.5 w-3.5 animate-bounce text-amber-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/10 bg-black/40 shrink-0">
              <button
                type="button"
                onClick={handleDismissPrompt}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition active:scale-95 cursor-pointer touch-press"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={handleDismissPrompt}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 px-5 py-2 text-xs font-bold text-slate-950 shadow-md transition active:scale-95 cursor-pointer touch-press"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── 2. MODAL CHIA SẺ & GỬI LINK CÀI ĐẶT APP ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-950 text-white shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0 bg-[#00183F]/90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003B95] to-amber-500 p-0.5 shadow-lg shrink-0">
                  <img
                    src="/apple-touch-icon.png"
                    alt="CEO 1983 App"
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Gửi Link Cài Đặt App</span>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-amber-300 font-medium">
                    Tự động hiện bảng cài đặt khi người khác bấm vào
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-xs text-slate-200 overscroll-contain">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <p className="leading-relaxed">
                  Khi bạn gửi liên kết này qua <strong>Zalo, Messenger, SMS</strong> cho người khác, khi họ bấm vào trên iPhone hoặc Android, ứng dụng sẽ <strong>tự động hiện thông báo hỏi có muốn thêm lên màn hình chính không</strong>.
                </p>
              </div>

              {/* Link Box */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-white/10 p-2.5">
                <input
                  type="text"
                  readOnly
                  value={getSmartInstallUrl()}
                  className="flex-1 bg-transparent text-xs text-slate-300 font-mono focus:outline-none select-all overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1 rounded-lg bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-bold shrink-0 hover:bg-amber-400 transition active:scale-95 cursor-pointer touch-press"
                >
                  {copiedShare ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedShare ? "Đã chép" : "Chép link"}</span>
                </button>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="grid grid-cols-2 gap-2 px-5 py-3 border-t border-white/10 bg-black/40 shrink-0">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition active:scale-95 cursor-pointer touch-press"
              >
                <Copy className="h-4 w-4 text-amber-300" />
                <span>Sao chép link</span>
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer touch-press"
              >
                <Share2 className="h-4 w-4" />
                <span>Gửi Zalo / Tin nhắn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
