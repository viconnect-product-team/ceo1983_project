import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, MessageSquare, User, QrCode, ChevronLeft, WifiOff } from "lucide-react";
import { useT, useLang, type TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import authBg from "@/assets/connect-auth-bg.jpg";

const NAVY = "#0A0A0B";
const emblem83 = "/ceo1983-emblem-8.png";

import { PullToRefresh } from "@/components/member/PullToRefresh";
import { useNavigate } from "@tanstack/react-router";
import { IncomingConnectionModal } from "@/components/member/IncomingConnectionModal";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { toast } from "sonner";

/** Mobile-constrained container for the member app. */
export function MemberScreen({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // ── BẢO VỆ ĐIỀU HƯỚNG CHUẨN NATIVE APP (NHƯ MOMO) ──
  // 1. Lắng nghe sự kiện phím Back cứng từ Native Android APK (Capacitor Bridge)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNativeHardwareBack = () => {
      // A. Nếu có Dialog / Modal / Sheet đang mở: Bấm Back sẽ đóng modal trước
      const openDialog = document.querySelector(
        '[role="dialog"], [data-modal-container], .modal-standard, [data-state="open"]'
      );
      if (openDialog) {
        window.dispatchEvent(new CustomEvent("vba:close_top_modal"));
        (window as any).__VBA_HANDLED_BACK__ = true;
        return;
      }

      // B. Nếu đang ở các tab con (/association/events, /association/card, /association/messages, /association/profile)
      // Bấm Back sẽ quay về Trang chủ /association thay vì thoát app
      if (pathname !== "/association" && pathname.startsWith("/association")) {
        navigate({ to: "/association" });
        (window as any).__VBA_HANDLED_BACK__ = true;
        return;
      }

      // C. Nếu đang ở Trang chủ /association và không có modal: Báo cho Android Native đếm 2 lần mới thoát
      (window as any).__VBA_HANDLED_BACK__ = false;
    };

    window.addEventListener("native:hardware_back", handleNativeHardwareBack);
    return () => window.removeEventListener("native:hardware_back", handleNativeHardwareBack);
  }, [pathname, navigate]);

  // 2. Quản lý History Stack & Double-tap back to exit trên Web / PWA
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastBackPressTime = 0;

    // Giữ một history state cho app để bắt sự kiện popstate
    const pushAppState = () => {
      try {
        window.history.pushState({ vbaApp: true, path: pathname }, "", window.location.href);
      } catch {}
    };

    // Đẩy state ban đầu nếu chưa có
    if (!window.history.state?.vbaApp) {
      pushAppState();
    }

    const handlePopState = (e: PopStateEvent) => {
      // A. Nếu có Dialog / Modal / Sheet đang mở: Bấm Back sẽ đóng modal trước
      const openDialog = document.querySelector(
        '[role="dialog"], [data-modal-container], .modal-standard, [data-state="open"]'
      );
      if (openDialog) {
        window.dispatchEvent(new CustomEvent("vba:close_top_modal"));
        pushAppState();
        return;
      }

      // B. Nếu đang ở các tab con: Bấm Back quay về Trang chủ /association
      if (pathname !== "/association" && pathname.startsWith("/association")) {
        navigate({ to: "/association" });
        pushAppState();
        return;
      }

      // C. Nếu đang ở Trang chủ /association và không có modal nào mở
      if (pathname === "/association") {
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          // Lần chạm thứ 2 trong 2 giây: Cho phép thoát
          toast.info("Đang thoát ứng dụng...");
        } else {
          // Lần chạm thứ 1: Giữ người dùng lại và hiện thông báo
          lastBackPressTime = now;
          pushAppState();
          try {
            if (navigator.vibrate) navigator.vibrate(15);
          } catch {}
          toast("Chạm lần nữa để thoát ứng dụng", {
            duration: 2000,
            icon: "👋",
          });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, navigate]);

  useEffect(() => {
    const socket = getConnectAppSocket();

    const handleConnectionAccepted = (data: any) => {
      const partnerName =
        data?.accepterProfile?.display_name ||
        data?.accepterProfile?.name ||
        "Hội viên CEO 1983";
      const partnerAvatar =
        data?.accepterProfile?.avatar_url || data?.accepterProfile?.avatar;
      const partnerCode =
        data?.accepterProfile?.memberCode || data?.accepterProfile?.code;
      const partnerUserId = data?.accepterProfile?.userId;

      // 1. Lưu vào vba_notifications (đẩy về chuông thông báo hiệp hội)
      try {
        const newNotif = {
          id: `conn_acc_${Date.now()}`,
          title: "Lời mời kết nối đã được chấp nhận!",
          body: `${partnerName} đã đồng ý lời mời kết nối của bạn. Giờ đây hai bạn có thể trò chuyện và giao thương.`,
          createdAt: new Date().toISOString(),
          unread: true,
          type: "connection",
          avatar: partnerAvatar,
        };
        const rawNotifs = localStorage.getItem("vba_notifications");
        const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
        notifs.unshift(newNotif);
        localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));

        // 2. Lưu vào danh bạ kết nối vba_connected_members
        const rawConnected = localStorage.getItem("vba_connected_members");
        const connectedList = rawConnected ? JSON.parse(rawConnected) : [];
        if (partnerCode && !connectedList.includes(partnerCode)) connectedList.push(partnerCode);
        if (partnerUserId && !connectedList.includes(partnerUserId)) connectedList.push(partnerUserId);
        localStorage.setItem("vba_connected_members", JSON.stringify(connectedList));

        window.dispatchEvent(new CustomEvent("notifications-updated"));
        window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
        window.dispatchEvent(new CustomEvent("vba:connection_accepted"));
      } catch {}

      // 3. Thông báo đẩy 2 chiều trên app
      toast.success(`${partnerName} đã đồng ý kết nối giao thương với bạn!`);
    };

    socket.on("connection:accepted", handleConnectionAccepted);

    return () => {
      socket.off("connection:accepted", handleConnectionAccepted);
    };
  }, []);

  return (
    <div className="vba-app relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[var(--vba-bg)] text-[var(--vba-text)] transition-colors duration-200 select-none">
      {/* Dynamic Background Mesh Overlay — only in dark luxury mode */}
      {!isLight && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <img
            src={authBg}
            alt=""
            width={1024}
            height={640}
            className="pointer-events-none absolute inset-x-0 top-0 h-[640px] w-full select-none object-cover opacity-35"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--vba-bg)]/80 to-[var(--vba-bg)]" />
        </div>
      )}

      {/* Dải Edge Guard vô hình 2 bên mép: Vô hiệu hóa cử chỉ History Swipe Navigation của trình duyệt di động mà không cần can thiệp JavaScript blocking */}
      <div className="fixed left-0 top-0 bottom-0 w-3 z-40 pointer-events-auto touch-none select-none opacity-0" aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-3 z-40 pointer-events-auto touch-none select-none opacity-0" aria-hidden="true" />

      <div
        className={`relative z-10 mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden border-x border-[var(--vba-border-soft)]/30 ${
          isLight ? "bg-white" : "bg-[var(--vba-bg)]/90"
        } shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm`}
      >
        <OfflineBanner />
        {/* Tắt hoàn toàn cử chỉ vuốt ngang chuyển tab để tránh xung đột với carousel/card và ngăn thoát app */}
        <PullToRefresh
          enableSwipeNav={false}
          pathname={pathname}
          className="flex-1 pb-[calc(max(env(safe-area-inset-bottom,0px),20px)+72px)]"
        >
          {children}
        </PullToRefresh>
        <MemberTabBar />
        <IncomingConnectionModal />
      </div>
    </div>
  );
}

/** Shows a thin banner when the device loses its network connection. */
function OfflineBanner() {
  const t = useT();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--vba-gold)] px-4 py-1.5 text-[11px] font-semibold text-[#071322]">
      <WifiOff className="h-3.5 w-3.5" />
      {t("m.shell.offline")}
    </div>
  );
}

/** Simple top bar with optional back button. */
export function MemberHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const t = useT();
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(10);
    } catch {}
    if (typeof window !== "undefined" && window.history.length > 2) {
      window.history.back();
    } else {
      navigate({ to: "/association" });
    }
  };

  return (
    <header
      className="sticky top-0 z-50 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--vba-border-soft)]/60 bg-[var(--vba-bg-2)]/95 px-4 backdrop-blur-xl transition-all shadow-2xs select-none"
      style={{
        paddingTop:
          "var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 16px) + 4px))",
        minHeight:
          "calc(var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 16px) + 4px)) + var(--bc-mobile-header-h, 56px))",
      }}
    >
      <div className="flex w-9 items-center">
        {back ? (
          <button
            onClick={handleBack}
            aria-label={t("m.shell.back")}
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--vba-gold)] transition hover:bg-card/5 active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 text-center">
        <h1 className="truncate text-[15px] font-semibold text-[var(--vba-text)]">{title}</h1>
        {subtitle ? (
          <p className="truncate text-[11px] text-[var(--vba-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-w-[36px] items-center justify-end">{right}</div>
    </header>
  );
}

const tabs = [
  { to: "/association", label: "m.shell.tab_home", icon: Home, exact: true },
  { to: "/association/events", label: "m.events.title", icon: Calendar },
  { to: "/association/card", label: "m.shell.tab_qr", icon: QrCode, center: true },
  { to: "/association/messages", label: "m.shell.tab_messages", icon: MessageSquare },
  { to: "/association/profile", label: "m.shell.tab_profile", icon: User },
] satisfies { to: string; label: TKey; icon: typeof Home; exact?: boolean; center?: boolean }[];

function useVirtualKeyboard() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || target.isContentEditable;
      if (isInput) {
        setKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        const tag = active?.tagName?.toLowerCase();
        const isInput = tag === "input" || tag === "textarea" || (active as HTMLElement)?.isContentEditable;
        if (!isInput) {
          setKeyboardOpen(false);
        }
      }, 100);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    const vv = window.visualViewport;
    if (!vv) {
      return () => {
        window.removeEventListener("focusin", handleFocusIn);
        window.removeEventListener("focusout", handleFocusOut);
      };
    }

    const handleResize = () => {
      const diff = window.innerHeight - vv.height - (vv.offsetTop || 0);
      if (diff > 140) {
        setKeyboardOpen(true);
      } else {
        const active = document.activeElement;
        const tag = active?.tagName?.toLowerCase();
        const isInput = tag === "input" || tag === "textarea" || (active as HTMLElement)?.isContentEditable;
        if (!isInput) {
          setKeyboardOpen(false);
        }
      }
    };

    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
    };
  }, []);

  return keyboardOpen;
}

function MemberTabBar() {
  const t = useT();
  const { lang } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const keyboardOpen = useVirtualKeyboard();
  const [isMidAutumn, setIsMidAutumn] = useState(false);

  const tabLabels: Record<string, { vi: string; en: string }> = {
    "/association": { vi: "Trang chủ", en: "Home" },
    "/association/events": { vi: "Sự kiện", en: "Events" },
    "/association/card": { vi: "Thẻ 83", en: "Card 83" },
    "/association/messages": { vi: "Tin nhắn", en: "Messages" },
    "/association/profile": { vi: "Cá nhân", en: "Profile" },
  };

  // Track new events count & unread messages count for animated badges
  const [newEventCount, setNewEventCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const rawCount = localStorage.getItem("vba_new_event_count");
      if (rawCount) return Math.max(0, parseInt(rawCount, 10));
      const seen = localStorage.getItem("vba_seen_events");
      if (!seen) return 2;
    } catch {}
    return 0;
  });

  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const rawCount = localStorage.getItem("vba_total_unread_messages");
      if (rawCount) return Math.max(0, parseInt(rawCount, 10));
      const rawConv = localStorage.getItem("vba_conversations");
      if (rawConv) {
        const list = JSON.parse(rawConv);
        if (Array.isArray(list)) {
          return list.reduce((acc: number, c: any) => acc + (Number(c.unread) || 0), 0);
        }
      }
    } catch {}
    return 1;
  });

  // Clear or update badges based on current route
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pathname === "/association/events" || pathname.startsWith("/association/events/")) {
      setNewEventCount(0);
      try {
        localStorage.setItem("vba_new_event_count", "0");
        localStorage.setItem("vba_seen_events", Date.now().toString());
      } catch {}
    }

    if (pathname === "/association/messages" || pathname.startsWith("/association/messages/")) {
      setUnreadMessageCount(0);
      try {
        localStorage.setItem("vba_total_unread_messages", "0");
      } catch {}
    }
  }, [pathname]);

  // Listen to socket and custom events for new messages and new events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessagesUpdate = () => {
      try {
        const rawConv = localStorage.getItem("vba_conversations");
        if (rawConv) {
          const list = JSON.parse(rawConv);
          if (Array.isArray(list)) {
            const sum = list.reduce((acc: number, c: any) => acc + (Number(c.unread) || 0), 0);
            setUnreadMessageCount(sum);
            return;
          }
        }
        const rawCount = localStorage.getItem("vba_total_unread_messages");
        if (rawCount) {
          setUnreadMessageCount(Math.max(0, parseInt(rawCount, 10)));
        }
      } catch {}
    };

    const handleNewMessage = () => {
      if (pathname !== "/association/messages") {
        setUnreadMessageCount((prev) => prev + 1);
      }
    };

    const handleNewEvent = () => {
      if (pathname !== "/association/events") {
        setNewEventCount((prev) => prev + 1);
      }
    };

    window.addEventListener("vba:conversation_updated", handleMessagesUpdate);
    window.addEventListener("dm:message_received", handleNewMessage);
    window.addEventListener("vba:new_event", handleNewEvent);
    window.addEventListener("events-updated", handleNewEvent);
    window.addEventListener("storage", handleMessagesUpdate);

    return () => {
      window.removeEventListener("vba:conversation_updated", handleMessagesUpdate);
      window.removeEventListener("dm:message_received", handleNewMessage);
      window.removeEventListener("vba:new_event", handleNewEvent);
      window.removeEventListener("events-updated", handleNewEvent);
      window.removeEventListener("storage", handleMessagesUpdate);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => {
        const enabled = localStorage.getItem("vba_event_theme_enabled") === "true";
        const disabled = localStorage.getItem("vba_event_theme_disabled") === "true";
        const type = localStorage.getItem("vba_event_theme_type") || "mid-autumn";
        setIsMidAutumn(enabled && !disabled && type === "mid-autumn");
      };
      check();
      window.addEventListener("vba-event-theme-changed", check);
      return () => window.removeEventListener("vba-event-theme-changed", check);
    }
  }, []);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  // Automatically hide bottom tab bar when mobile keyboard is open or user is typing
  if (keyboardOpen) return null;

  return (
    <nav className="vba-bottom-bar fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] pointer-events-none transition-all duration-200 select-none">
      <div
        className={`pointer-events-auto relative flex items-end justify-around border-t bg-white/95 dark:bg-[var(--vba-bg-2)]/95 px-2 pb-[max(env(safe-area-inset-bottom,0px),18px)] pt-2 backdrop-blur-xl transition-all ${
          isMidAutumn
            ? "border-amber-400/40 shadow-[0_-6px_24px_rgba(245,158,11,0.22)]"
            : "border-slate-200/80 dark:border-[var(--vba-border-soft)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* Festive Mid-Autumn Corner Dangling Lantern */}
        {isMidAutumn && (
          <div
            className="pointer-events-none absolute left-2 -top-3.5 flex flex-col items-center select-none"
            aria-hidden="true"
          >
            <span className="text-[14px] animate-bounce filter drop-shadow-[0_2px_6px_rgba(239,68,68,0.7)]" style={{ animationDuration: "3s" }}>
              🏮
            </span>
          </div>
        )}

        {/* Festive Mid-Autumn Corner Moon Rabbit */}
        {isMidAutumn && (
          <div
            className="pointer-events-none absolute right-2.5 -top-3.5 flex flex-col items-center select-none"
            aria-hidden="true"
          >
            <span className="text-[13px] animate-pulse filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.8)]">
              🥮
            </span>
          </div>
        )}

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.to, tab.exact);

          const handleTabClick = () => {
            try {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(8);
              }
            } catch {}
            // Bấm lại vào tab đang active -> Cuộn mượt lên đỉnh (chuẩn MoMo / iOS Native)
            if (active) {
              window.dispatchEvent(new CustomEvent("vba:scroll_to_top"));
            }
          };

          if (tab.center) {
            return (
              <div key={tab.to} className="relative flex flex-1 flex-col items-center justify-end">
                <Link
                  to={tab.to}
                  onClick={handleTabClick}
                  aria-label={t(tab.label)}
                  className="-mt-7 relative flex flex-col items-center group active:scale-95 transition-transform"
                >
                  {/* Mid-Autumn Full Moon Aura Halo */}
                  {isMidAutumn && (
                    <span className="absolute inset-0 -top-1 rounded-full bg-amber-400/30 blur-md animate-pulse pointer-events-none" />
                  )}
                  <span
                    className="relative grid h-14 w-14 place-items-center rounded-2xl shadow-[0_8px_24px_-6px_rgba(0,59,149,0.7)] group-hover:scale-105 group-active:scale-92 transition-transform overflow-hidden p-2.5"
                    style={{
                      background: "linear-gradient(135deg, #002B70 0%, #003B95 50%, #0052CC 100%)",
                      border: "2.5px solid #FFFFFF",
                      boxShadow: "0 6px 16px rgba(0, 59, 149, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <QrCode
                      className="h-7 w-7"
                      style={{
                        color: "#FFFFFF",
                        stroke: "#FFFFFF",
                        strokeWidth: 2.2,
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                      }}
                    />
                    {isMidAutumn && (
                      <span className="absolute -top-1.5 -right-1.5 text-[10px] select-none" aria-hidden="true">
                        🌕
                      </span>
                    )}
                  </span>
                </Link>
              </div>
            );
          }

          // Custom seasonal tab badges
          let seasonalBadge: ReactNode = null;
          if (isMidAutumn) {
            if (tab.to.includes("notifications")) {
              seasonalBadge = (
                <span className="absolute -top-1 -right-1 text-[9px] animate-bounce select-none" style={{ animationDuration: "2.4s" }} aria-hidden="true">
                  🏮
                </span>
              );
            } else if (tab.to.includes("messages")) {
              seasonalBadge = (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] animate-pulse select-none" aria-hidden="true">
                  🐰
                </span>
              );
            } else if (tab.to.includes("profile")) {
              seasonalBadge = (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] animate-wiggle select-none" aria-hidden="true">
                  ✨
                </span>
              );
            }
          }

          // Animated notification badges for Events and Messages
          let notificationBadge: ReactNode = null;
          if (tab.to === "/association/events" && newEventCount > 0) {
            notificationBadge = (
              <span
                className="absolute -top-1.5 -right-2.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-1 text-[9px] font-black text-white shadow-xs ring-1 ring-white/80 select-none animate-pulse"
                title={`${newEventCount} sự kiện mới`}
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                <span className="relative z-10">{newEventCount > 9 ? "9+" : newEventCount}</span>
              </span>
            );
          } else if (tab.to === "/association/messages" && unreadMessageCount > 0) {
            notificationBadge = (
              <span
                className="absolute -top-1.5 -right-2.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-1 text-[9px] font-black text-white shadow-xs ring-1 ring-white/80 select-none animate-pulse"
                title={`${unreadMessageCount} tin nhắn mới`}
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                <span className="relative z-10">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span>
              </span>
            );
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              onClick={handleTabClick}
              className="relative flex flex-1 flex-col items-center justify-end gap-1 py-1 transition-all touch-press select-none-touch active:scale-92 cursor-pointer"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${active ? "scale-110" : ""}`}
                  style={{ color: active ? "#003B95" : "var(--vba-text-dim)" }}
                />
                {notificationBadge || seasonalBadge}
              </div>
              <span
                className={`text-[10px] transition-colors select-none ${
                  active ? "font-bold text-[#003B95] dark:text-amber-400" : "font-medium text-[var(--vba-text-dim)]"
                }`}
              >
                {lang === "en" ? tabLabels[tab.to]?.en || t(tab.label) : tabLabels[tab.to]?.vi || t(tab.label)}
              </span>
              {/* Dot indicator nhỏ màu vàng kim sang trọng khi tab active (chuẩn MoMo) */}
              {active && (
                <span className="h-1 w-1 rounded-full bg-amber-500 dark:bg-amber-400 shadow-xs shadow-amber-500/80 -mt-0.5 animate-in fade-in zoom-in duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Reusable section heading with optional "see all" link. */
export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-[var(--vba-text)]">{title}</h2>
      {action}
    </div>
  );
}
