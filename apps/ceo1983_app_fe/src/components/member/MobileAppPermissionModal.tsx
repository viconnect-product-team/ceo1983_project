import React, { useState, useEffect } from "react";
import { Camera, Mic, Bell, ShieldCheck, CheckCircle2, ChevronRight, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getActiveCeo1983ColorTheme } from "@/lib/ceo1983-color-theme";

export interface MobileAppPermissionModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function MobileAppPermissionModal({ forceOpen = false, onClose }: MobileAppPermissionModalProps) {
  const [open, setOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  const brand = getActiveCeo1983ColorTheme();

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }

    if (typeof window === "undefined") return;

    // Chỉ tự động hiện trên thiết bị di động / PWA chưa từng hỏi quyền
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const prompted = localStorage.getItem("ceo1983_permissions_prompted") === "true";

    if ((isMobile || isStandalone) && !prompted) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  // Kiểm tra trạng thái quyền hiện tại
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "camera" as any }).then((res) => {
        setCameraGranted(res.state === "granted");
        res.onchange = () => setCameraGranted(res.state === "granted");
      }).catch(() => {});

      navigator.permissions.query({ name: "microphone" as any }).then((res) => {
        setMicGranted(res.state === "granted");
        res.onchange = () => setMicGranted(res.state === "granted");
      }).catch(() => {});
    }
  }, [open]);

  const handleGrantAll = async () => {
    setRequesting(true);
    let cameraOk = false;
    let micOk = false;
    let notifOk = false;

    // 1. Xin quyền Notification
    try {
      if ("Notification" in window) {
        const notifRes = await Notification.requestPermission();
        if (notifRes === "granted") {
          notifOk = true;
          setNotifGranted(true);
        }
      }
    } catch (e) {
      console.warn("Notification request failed:", e);
    }

    // 2. Xin quyền Camera & Microphone qua getUserMedia
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        cameraOk = true;
        micOk = true;
        setCameraGranted(true);
        setMicGranted(true);
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // Nếu không cho cả 2 cùng lúc, thử xin từng quyền riêng
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
          cameraOk = true;
          setCameraGranted(true);
          vStream.getTracks().forEach((t) => t.stop());
        }
      } catch {}

      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micOk = true;
          setMicGranted(true);
          aStream.getTracks().forEach((t) => t.stop());
        }
      } catch {}
    }

    // 3. Android Native Bridge (nếu có Capacitor/Native)
    if (typeof window !== "undefined" && (window as any).AndroidNative) {
      try {
        (window as any).AndroidNative?.requestNotificationPermission?.();
        (window as any).AndroidNative?.requestCameraPermission?.();
      } catch {}
    }

    try {
      localStorage.setItem("ceo1983_permissions_prompted", "true");
    } catch {}

    setRequesting(false);

    if (cameraOk || micOk || notifOk) {
      toast.success("✓ Đã kích hoạt quyền thiết bị thành công cho CEO 1983!", {
        description: "Máy ảnh, Micro thoại và Thông báo đã sẵn sàng sử dụng.",
      });
      setOpen(false);
      onClose?.();
    } else {
      toast.info("Quý Anh/Chị có thể cấp quyền trong Cài đặt trình duyệt để sử dụng Máy ảnh và Micro.");
      setOpen(false);
      onClose?.();
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("ceo1983_permissions_prompted", "true");
    } catch {}
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400 shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white my-auto">
        {/* Header Icon + Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                CẤP QUYỀN THIẾT BỊ
              </span>
              <h3 className="text-base font-black leading-snug">
                Ứng Dụng CEO 1983
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Để trải nghiệm trọn vẹn các tính năng kết nối giao thương và sự kiện trên điện thoại, vui lòng cấp các quyền sau:
        </p>

        {/* Danh sách 3 quyền chính */}
        <div className="space-y-2">
          {/* 1. Camera */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                <Camera className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Máy ảnh (Camera)
                </div>
                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  Quét mã QR kết nối, vé sự kiện & chụp danh thiếp
                </div>
              </div>
            </div>
            {cameraGranted && (
              <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 ml-1.5" />
            )}
          </div>

          {/* 2. Microphone */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                <Mic className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Microphone (Đàm thoại)
                </div>
                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  Gọi điện trao đổi B2B & Trợ lý ảo AI CEO 1983
                </div>
              </div>
            </div>
            {micGranted && (
              <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 ml-1.5" />
            )}
          </div>

          {/* 3. Notifications */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                <Bell className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Thông báo đẩy (Notification)
                </div>
                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  Nhận tin nhắn, lời mời sự kiện & nhắc lịch hẹn
                </div>
              </div>
            </div>
            {notifGranted && (
              <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 ml-1.5" />
            )}
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleGrantAll}
            disabled={requesting}
            style={{
              backgroundColor: brand.primaryColor,
            }}
            className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition cursor-pointer"
          >
            <Sparkles className="size-4 text-amber-300" />
            <span>{requesting ? "Đang yêu cầu cấp quyền..." : "Cấp quyền 1 chạm ngay"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Để sau (Quý Anh/Chị có thể bật lại trong Cài đặt)
          </button>
        </div>
      </div>
    </div>
  );
}

