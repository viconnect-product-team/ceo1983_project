import { type ReactNode, useEffect, useState, useMemo } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, MessageSquare, User, QrCode, ChevronLeft, WifiOff } from "lucide-react";
import { useT, useLang, type TKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { fetchNestApi } from "@/lib/api-client";
import authBg from "@/assets/connect-auth-bg.jpg";

const NAVY = "#003B95";
const emblem83 = "/ceo1983-emblem-8.png";

import { PullToRefresh } from "@/components/member/PullToRefresh";
import { IncomingConnectionModal } from "@/components/member/IncomingConnectionModal";
import { sendExternalNotification } from "@/lib/notification-permissions";
import { useAuth } from "@/context/AuthContext";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
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

    // KHÔNG tự động xin quyền thông báo khi mở app. Người dùng bật tại màn Cá nhân (association.profile).

    const handleNativeHardwareBack = () => {
      // A. Nếu có Dialog / Modal / Sheet đang mở: Bấm Back sẽ đóng modal trước
      const openDialog = document.querySelector(
        '[role="dialog"], [data-modal-container], .modal-standard, [data-state="open"]',
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

  // 2. Lắng nghe phím Back cho PWA Standalone / Capacitor native
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const openDialog = document.querySelector(
        '[role="dialog"], [data-modal-container], .modal-standard, [data-state="open"]',
      );
      if (openDialog) {
        window.dispatchEvent(new CustomEvent("vba:close_top_modal"));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const socket = getConnectAppSocket();

    const handleConnectionAccepted = (data: any) => {
      const partnerName =
        data?.accepterProfile?.display_name || data?.accepterProfile?.name || "Hội viên CEO 1983";
      const partnerAvatar = data?.accepterProfile?.avatar_url || data?.accepterProfile?.avatar;
      const partnerCode = data?.accepterProfile?.memberCode || data?.accepterProfile?.code;
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
        if (partnerUserId && !connectedList.includes(partnerUserId))
          connectedList.push(partnerUserId);
        localStorage.setItem("vba_connected_members", JSON.stringify(connectedList));

        window.dispatchEvent(new CustomEvent("notifications-updated"));
        window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
        window.dispatchEvent(new CustomEvent("vba:connection_accepted"));
      } catch {
        /* ignore */
      }

      // 3. Thông báo đẩy 2 chiều trên app & hệ thống điện thoại
      toast.success(`${partnerName} đã đồng ý kết nối giao thương với bạn!`);
      sendExternalNotification("🎉 Lời mời kết nối đã được chấp nhận!", {
        body: `${partnerName} đã đồng ý lời mời kết nối của bạn.`,
        type: "notification",
        url: "/association/messages",
      });
    };

    const handleConnectionDeclined = (data: any) => {
      const declinerName =
        data?.declinerProfile?.display_name || data?.declinerProfile?.name || "Hội viên CEO 1983";
      try {
        const newNotif = {
          id: `conn_dec_${Date.now()}`,
          title: "Lời mời kết nối đã bị từ chối",
          body: `${declinerName} đã từ chối lời mời kết nối của bạn.`,
          createdAt: new Date().toISOString(),
          unread: true,
          type: "connection",
        };
        const rawNotifs = localStorage.getItem("vba_notifications");
        const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
        notifs.unshift(newNotif);
        localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));

        window.dispatchEvent(new CustomEvent("notifications-updated"));
      } catch {
        /* ignore */
      }

      toast.info(`${declinerName} đã từ chối lời mời kết nối.`);
    };

    const handleMeetingRequested = (data: any) => {
      const hostName = data?.host?.name || "Hội viên CEO 1983";
      try {
        const newNotif = {
          id: `meet_req_${Date.now()}`,
          title: "Lời mời hẹn gặp kết nối 1-on-1 mới!",
          body: `${hostName} đã gửi lời mời hẹn gặp kết nối 1-on-1 với bạn: "${data?.title || "Gặp gỡ kết nối"}".`,
          createdAt: new Date().toISOString(),
          unread: true,
          type: "meeting",
          actionUrl: "/association/members?tab=meetings",
          meetingId: data?.id,
        };
        const rawNotifs = localStorage.getItem("vba_notifications");
        const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
        notifs.unshift(newNotif);
        localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));

        window.dispatchEvent(new CustomEvent("notifications-updated"));
        window.dispatchEvent(new Event("vba.meeting.changed"));
      } catch {
        /* ignore */
      }

      toast.info(`Bạn có lời mời hẹn gặp 1-on-1 mới từ ${hostName}!`, {
        action: {
          label: "Xem chi tiết",
          onClick: () => {
            window.location.href = "/association/members?tab=meetings";
          },
        },
      });

      sendExternalNotification("🤝 Lời mời hẹn gặp 1-on-1 mới!", {
        body: `${hostName} đã gửi lời mời hẹn gặp kết nối 1-on-1 với bạn: "${data?.title || "Gặp gỡ kết nối"}"`,
        type: "meeting",
        url: "/association/members?tab=meetings",
      });
    };

    const handleMeetingResponded = (data: any) => {
      const responderName = data?.responder?.name || "Đối tác";
      const isAccepted = data?.action === "accept";
      try {
        const newNotif = {
          id: `meet_resp_${Date.now()}`,
          title: isAccepted ? "Lịch hẹn gặp đã được đồng ý!" : "Lịch hẹn gặp đã bị từ chối",
          body: isAccepted
            ? `${responderName} đã đồng ý lịch hẹn gặp kết nối với bạn!`
            : `${responderName} đã từ chối lịch hẹn gặp kết nối.`,
          createdAt: new Date().toISOString(),
          unread: true,
          type: "meeting",
          actionUrl: "/association/members?tab=meetings",
          meetingId: data?.id,
        };
        const rawNotifs = localStorage.getItem("vba_notifications");
        const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
        notifs.unshift(newNotif);
        localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));

        window.dispatchEvent(new CustomEvent("notifications-updated"));
        window.dispatchEvent(new Event("vba.meeting.changed"));
      } catch {
        /* ignore */
      }

      if (isAccepted) {
        toast.success(`${responderName} đã đồng ý lịch hẹn gặp kết nối 1-on-1!`);
      } else {
        toast.info(`${responderName} đã từ chối lịch hẹn gặp kết nối.`);
      }

      sendExternalNotification(
        isAccepted ? "🤝 Lịch hẹn đã được đồng ý!" : "🤝 Lịch hẹn đã bị từ chối",
        {
          body: isAccepted
            ? `${responderName} đã đồng ý lịch hẹn gặp kết nối với bạn!`
            : `${responderName} đã từ chối lịch hẹn gặp kết nối.`,
          type: "meeting",
          url: "/association/members?tab=meetings",
        },
      );
    };

    socket.on("connection:accepted", handleConnectionAccepted);
    socket.on("connection:declined", handleConnectionDeclined);
    socket.on("meeting:requested", handleMeetingRequested);
    socket.on("meeting:responded", handleMeetingResponded);

    return () => {
      socket.off("connection:accepted", handleConnectionAccepted);
      socket.off("connection:declined", handleConnectionDeclined);
      socket.off("meeting:requested", handleMeetingRequested);
      socket.off("meeting:responded", handleMeetingResponded);
    };
  }, []);

  return (
    <div className="vba-app relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[var(--vba-bg)] text-[var(--vba-text)] transition-colors duration-200">
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

      {/* Dải Edge Guard vô hình 2 bên mép: Đảm bảo pointer-events-none để không chặn cảm ứng người dùng */}
      <div
        className="fixed left-0 top-0 bottom-0 w-3 z-40 pointer-events-none touch-none select-none opacity-0"
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-3 z-40 pointer-events-none touch-none select-none opacity-0"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden border-x border-[var(--vba-border-soft)]/30 ${
          isLight ? "bg-white" : "bg-[var(--vba-bg)]"
        } shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]`}
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
    <div className="ceo-safe-sticky sticky top-0 z-40 flex items-center justify-center gap-2 bg-slate-800 px-4 py-1.5 text-[11px] font-semibold text-white">
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
      className="w-full sticky top-0 z-50 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-[var(--vba-bg-2)]/95 px-4 backdrop-blur-xl transition-all shadow-xs select-none"
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
            className="grid h-9 w-9 place-items-center rounded-full text-[#003B95] dark:text-blue-400 hover:text-[#002B70] transition hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
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

function FooterHomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.9104 13.7714C3.9104 13.0227 3.9104 12.6484 4.00689 12.3037C4.09237 11.9983 4.23284 11.7111 4.4214 11.4562C4.63427 11.1684 4.92975 10.9385 5.52071 10.4789L14.3613 3.60286C14.8193 3.24668 15.0482 3.06859 15.3011 3.00014C15.5242 2.93973 15.7593 2.93973 15.9824 3.00014C16.2352 3.06859 16.4642 3.24668 16.9222 3.60286L25.7628 10.4789C26.3537 10.9385 26.6492 11.1684 26.8621 11.4562C27.0506 11.7111 27.1911 11.9983 27.2766 12.3037C27.3731 12.6484 27.3731 13.0227 27.3731 13.7714V23.202C27.3731 24.662 27.3731 25.3921 27.0889 25.9497C26.839 26.4403 26.4402 26.8391 25.9497 27.089C25.392 27.3732 24.662 27.3732 23.2019 27.3732H8.08154C6.62151 27.3732 5.89149 27.3732 5.33383 27.089C4.8433 26.8391 4.44448 26.4403 4.19454 25.9497C3.9104 25.3921 3.9104 24.662 3.9104 23.202V13.7714Z"
        fill={active ? "#E9F2FF" : "none"}
      />
      <path
        d="M11.7313 27.3732V17.7274C11.7313 16.9974 11.7313 16.6324 11.8734 16.3535C11.9983 16.1083 12.1977 15.9089 12.443 15.7839C12.7218 15.6418 13.0868 15.6418 13.8169 15.6418H17.4666C18.1966 15.6418 18.5616 15.6418 18.8405 15.7839C19.0857 15.9089 19.2852 16.1083 19.4101 16.3535C19.5522 16.6324 19.5522 16.9974 19.5522 17.7274V27.3732"
        fill={active ? "#E9F2FF" : "none"}
      />
      <path
        d="M11.7313 27.3732V17.7274C11.7313 16.9974 11.7313 16.6324 11.8734 16.3535C11.9983 16.1083 12.1977 15.9089 12.443 15.7839C12.7218 15.6418 13.0868 15.6418 13.8169 15.6418H17.4666C18.1966 15.6418 18.5616 15.6418 18.8405 15.7839C19.0857 15.9089 19.2852 16.1083 19.4101 16.3535C19.5522 16.6324 19.5522 16.9974 19.5522 17.7274V27.3732M14.3613 3.60286L5.52071 10.4789C4.92975 10.9385 4.63427 11.1684 4.4214 11.4562C4.23284 11.7111 4.09237 11.9983 4.00689 12.3037C3.9104 12.6484 3.9104 13.0227 3.9104 13.7714V23.202C3.9104 24.662 3.9104 25.3921 4.19454 25.9497C4.44448 26.4403 4.8433 26.8391 5.33383 27.089C5.89149 27.3732 6.62151 27.3732 8.08154 27.3732H23.2019C24.662 27.3732 25.392 27.3732 25.9497 27.089C26.4402 26.8391 26.839 26.4403 27.0889 25.9497C27.3731 25.3921 27.3731 24.662 27.3731 23.202V13.7714C27.3731 13.0227 27.3731 12.6484 27.2766 12.3037C27.1911 11.9983 27.0506 11.7111 26.8621 11.4562C26.6492 11.1684 26.3537 10.9385 25.7628 10.4789L16.9222 3.60286C16.4642 3.24668 16.2352 3.06859 15.9824 3.00014C15.7593 2.93973 15.5242 2.93973 15.3011 3.00014C15.0482 3.06859 14.8193 3.24668 14.3613 3.60286Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={active ? "#003B95" : "#64748B"}
      />
    </svg>
  );
}

function FooterCalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M27.3731 13.0348H3.9104M20.8557 2.60693V7.82086M10.4278 2.60693V7.82086M10.1671 28.6766H21.1164C23.3064 28.6766 24.4015 28.6766 25.2379 28.2504C25.9737 27.8755 26.572 27.2772 26.9469 26.5414C27.3731 25.705 27.3731 24.6099 27.3731 22.4199V11.4706C27.3731 9.28056 27.3731 8.18553 26.9469 7.34904C26.572 6.61324 25.9737 6.01502 25.2379 5.64011C24.4015 5.2139 23.3064 5.2139 21.1164 5.2139H10.1671C7.97706 5.2139 6.88203 5.2139 6.04554 5.64011C5.30974 6.01502 4.71152 6.61324 4.33661 7.34904C3.9104 8.18553 3.9104 9.28056 3.9104 11.4706V22.4199C3.9104 24.6099 3.9104 25.705 4.33661 26.5414C4.71152 27.2772 5.30974 27.8755 6.04554 28.2504C6.88203 28.6766 7.97706 28.6766 10.1671 28.6766Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={active ? "#003B95" : "#64748B"}
      />
    </svg>
  );
}

function FooterMessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.6417 27.3731C22.1208 27.3731 27.3731 22.1208 27.3731 15.6417C27.3731 9.1627 22.1208 3.9104 15.6417 3.9104C9.1627 3.9104 3.9104 9.1627 3.9104 15.6417C3.9104 17.2022 4.21507 18.6915 4.76817 20.0534C4.87403 20.314 4.92696 20.4444 4.95057 20.5497C4.97367 20.6528 4.98212 20.729 4.98213 20.8346C4.98215 20.9426 4.96255 21.0602 4.92335 21.2954L4.15041 25.933C4.06946 26.4187 4.02899 26.6615 4.10431 26.8371C4.17022 26.9908 4.29269 27.1133 4.44637 27.1792C4.62196 27.2545 4.86479 27.214 5.35044 27.1331L9.98808 26.3601C10.2233 26.3209 10.3409 26.3013 10.4488 26.3014C10.5545 26.3014 10.6307 26.3098 10.7338 26.3329C10.8391 26.3565 10.9694 26.4095 11.2301 26.5153C12.592 27.0684 14.0813 27.3731 15.6417 27.3731Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={active ? "#003B95" : "#64748B"}
      />
    </svg>
  );
}

function FooterUserIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.92967 25.3376C7.72261 23.4694 9.57395 22.1592 11.7313 22.1592H19.5522C21.7096 22.1592 23.5609 23.4694 24.3538 25.3376M20.8557 12.3831C20.8557 15.2626 18.5213 17.597 15.6418 17.597C12.7622 17.597 10.4278 15.2626 10.4278 12.3831C10.4278 9.50348 12.7622 7.16912 15.6418 7.16912C18.5213 7.16912 20.8557 9.50348 20.8557 12.3831ZM28.6766 15.6418C28.6766 22.8407 22.8407 28.6766 15.6418 28.6766C8.44282 28.6766 2.60693 22.8407 2.60693 15.6418C2.60693 8.44282 8.44282 2.60693 15.6418 2.60693C22.8407 2.60693 28.6766 8.44282 28.6766 15.6418Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={active ? "#003B95" : "#64748B"}
      />
    </svg>
  );
}

const tabs = [
  { to: "/association", label: "m.shell.tab_home", icon: FooterHomeIcon, exact: true },
  { to: "/association/events", label: "m.events.title", icon: FooterCalendarIcon },
  { to: "/association/card", label: "m.shell.tab_qr", icon: null, center: true },
  { to: "/association/messages", label: "m.shell.tab_messages", icon: FooterMessageIcon },
  { to: "/association/profile", label: "m.shell.tab_profile", icon: FooterUserIcon },
] satisfies { to: string; label: TKey; icon: any; exact?: boolean; center?: boolean }[];

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
        const isInput =
          tag === "input" || tag === "textarea" || (active as HTMLElement)?.isContentEditable;
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
        const isInput =
          tag === "input" || tag === "textarea" || (active as HTMLElement)?.isContentEditable;
        if (!isInput) {
          setKeyboardOpen(false);
        }
      }
    };

    vv.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      vv.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardOpen;
}

function MemberTabBar() {
  const t = useT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const keyboardOpen = useVirtualKeyboard();
  const [isMidAutumn, setIsMidAutumn] = useState(false);
  const { user } = useAuth();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Check if current user is authorized as event QR scanner / check-in staff
  const [canScanQr, setCanScanQr] = useState<boolean>(() => {
    return Boolean(
      user?.isAdmin ||
        user?.isPresident ||
        user?.permissions?.includes('event:scan_qr') ||
        user?.permissions?.includes('admin:full_access'),
    );
  });

  useEffect(() => {
    if (!user) {
      setCanScanQr(false);
      return;
    }
    if (
      user.isAdmin ||
      user.isPresident ||
      user.permissions?.includes('event:scan_qr') ||
      user.permissions?.includes('admin:full_access')
    ) {
      setCanScanQr(true);
      return;
    }

    fetchNestApi<any[]>('/events')
      .then((events) => {
        if (!Array.isArray(events) || events.length === 0) {
          setCanScanQr(false);
          return;
        }
        const userIdentifiers = [
          user.id,
          (user as any).memberCode,
          (user as any).email,
          (user as any).phone,
          (user as any).name,
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase().trim());

        const isAuthorized = events.some((ev) => {
          let scanners = ev.qr_scanners || ev.qrScanners || ev.qrStaff || ev.qr_staff_ids || [];
          if (typeof scanners === "string") {
            try {
              scanners = JSON.parse(scanners);
            } catch {
              scanners = [];
            }
          }
          if (!Array.isArray(scanners) || scanners.length === 0) return false;
          return scanners.some((s: any) => {
            if (typeof s === "string") {
              const lower = s.toLowerCase().trim();
              return userIdentifiers.some((id) => lower === id || lower.includes(id));
            }
            if (typeof s === "object" && s !== null) {
              const objVals = [s.id, s.code, s.userId, s.memberCode, s.phone, s.email, s.name]
                .filter(Boolean)
                .map((x) => String(x).toLowerCase().trim());
              return userIdentifiers.some((id) => objVals.includes(id));
            }
            return false;
          });
        });

        setCanScanQr(isAuthorized);
      })
      .catch(() => {});
  }, [user]);

  const visibleTabs = tabs;

  useEffect(() => {
    const handleOpenQr = () => setQrModalOpen(true);
    window.addEventListener("vba:open_qr_modal", handleOpenQr);
    return () => window.removeEventListener("vba:open_qr_modal", handleOpenQr);
  }, []);

  const tabLabels: Record<string, { vi: string; en: string }> = {
    "/association": { vi: "Trang chủ", en: "Home" },
    "/association/events": { vi: "Sự kiện", en: "Events" },
    "/association/card": { vi: "Check-in", en: "Check-in" },
    "/association/messages": { vi: "Tin nhắn", en: "Messages" },
    "/association/profile": { vi: "Cá nhân", en: "Profile" },
  };

  const memberCode = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) {
        const m = JSON.parse(raw);
        if (m?.code) return m.code;
      }
    } catch {}
    return user?.member_code || user?.id || "";
  }, [user]);

  const memberName = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) {
        const m = JSON.parse(raw);
        if (m?.name) return m.name;
      }
    } catch {}
    return user?.full_name || user?.name || "Hội viên CLB CEO 1983";
  }, [user]);

  const memberCompany = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) {
        const m = JSON.parse(raw);
        if (m?.company || m?.company_name) return m.company || m.company_name;
      }
    } catch {}
    return user?.company || "CLB Doanh Nhân CEO 1983";
  }, [user]);

  const memberTitle = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) {
        const m = JSON.parse(raw);
        if (m?.executive_role || m?.title) return m.executive_role || m.title;
      }
    } catch {}
    return user?.title || "Hội viên chính thức";
  }, [user]);

  const memberAvatar = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("vba_my_member") : null;
      if (raw) {
        const m = JSON.parse(raw);
        if (m?.avatar || m?.avatar_url) return m.avatar || m.avatar_url;
      }
    } catch {}
    return user?.avatar_url || user?.avatar || null;
  }, [user]);

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

  // Automatically hide bottom tab bar when mobile keyboard is open, user is typing,
  // OR when mustChangePassword is required for a new member
  const isMustChangePassword = typeof window !== "undefined" && localStorage.getItem("vba_must_change_password") === "true";
  if (keyboardOpen || isMustChangePassword) return null;

  return (
    <>
      <nav className="vba-bottom-bar fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] pointer-events-none transition-all duration-200 select-none">
      <div
        className={`pointer-events-auto relative flex items-end justify-around border-t bg-white/95 dark:bg-[var(--vba-bg-2)]/95 px-2 pb-[max(env(safe-area-inset-bottom,0px),18px)] pt-2 backdrop-blur-xl transition-all border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]`}
      >
        {/* Festive Mid-Autumn Corner Dangling Lantern */}
        {isMidAutumn && (
          <div
            className="pointer-events-none absolute left-2 -top-3.5 flex flex-col items-center select-none"
            aria-hidden="true"
          >
            <span
              className="text-[14px] animate-bounce filter drop-shadow-[0_2px_6px_rgba(239,68,68,0.7)]"
              style={{ animationDuration: "3s" }}
            >
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

        {visibleTabs.map((tab) => {
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
                <button
                  type="button"
                  onClick={() => {
                    handleTabClick();
                    navigate({ to: "/association/card" as any });
                    setQrModalOpen(true);
                  }}
                  aria-label="Check-in & Quét mã QR"
                  className="-mt-7 relative flex flex-col items-center group active:scale-95 transition-transform cursor-pointer border-0 bg-transparent p-0 outline-none pb-0.5"
                >
                  {/* Subtle Glow */}
                  <span className="absolute inset-0 -top-1 rounded-full bg-blue-600/25 blur-md animate-pulse pointer-events-none" />

                  {/* Circular Button matching user design: size-14, bg-linear-46 from-sky-900 to-blue-700 */}
                  <span
                    className="relative grid h-14 w-14 place-items-center rounded-full shadow-[0_8px_20px_-4px_rgba(0,59,149,0.5)] group-hover:scale-105 group-active:scale-95 transition-all overflow-hidden p-2.5"
                    style={{
                      background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #1d4ed8 100%)",
                      border: "3px solid rgba(255, 255, 255, 0.85)",
                      boxShadow: "0 6px 20px rgba(12, 74, 110, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <img
                      src="/icons/footer/qr-code-02.svg"
                      alt="Check-in"
                      className="size-7 brightness-110 drop-shadow-sm"
                    />
                    {isMidAutumn && (
                      <span
                        className="absolute -top-1 -right-1 text-[10px] select-none"
                        aria-hidden="true"
                      >
                        🌕
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 mt-1">
                    Check-in
                  </span>
                </button>
              </div>
            );
          }

          // Custom seasonal tab badges
          let seasonalBadge: ReactNode = null;
          if (isMidAutumn) {
            if (tab.to.includes("notifications")) {
              seasonalBadge = (
                <span
                  className="absolute -top-1 -right-1 text-[9px] animate-bounce select-none"
                  style={{ animationDuration: "2.4s" }}
                  aria-hidden="true"
                >
                  🏮
                </span>
              );
            } else if (tab.to.includes("messages")) {
              seasonalBadge = (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] animate-pulse select-none"
                  aria-hidden="true"
                >
                  🐰
                </span>
              );
            } else if (tab.to.includes("profile")) {
              seasonalBadge = (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] animate-wiggle select-none"
                  aria-hidden="true"
                >
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
                <span className="relative z-10">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
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
                {Icon && <Icon active={active} />}
                {notificationBadge || seasonalBadge}
              </div>
              <span
                className={`text-[11px] transition-colors select-none ${
                  active
                    ? "font-bold text-[#003B95] dark:text-blue-400"
                    : "font-normal text-slate-500 dark:text-slate-400"
                }`}
              >
                {lang === "en"
                  ? tabLabels[tab.to]?.en || t(tab.label)
                  : tabLabels[tab.to]?.vi || t(tab.label)}
              </span>
              {/* Dot indicator khi tab active */}
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#003B95] dark:bg-blue-400 shadow-sm shadow-[#003B95]/40 -mt-0.5 animate-in fade-in zoom-in duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
    <AssociationMemberQrModal
      open={qrModalOpen}
      onClose={() => {
        setQrModalOpen(false);
        navigate({ to: "/association/card" as any });
      }}
      defaultTab="my_qr"
      memberCode={memberCode}
      memberName={memberName}
      memberTitle={memberTitle}
      memberCompany={memberCompany}
      memberAvatar={memberAvatar}
    />
    </>
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
