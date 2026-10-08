import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MemberScreen } from "@/components/member/MemberShell";
import { checkRenewalReminder } from "@/lib/member-app.functions";
import { MEMBER_MANIFEST_HREF } from "@/lib/pwa-manifest";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { toast } from "sonner";
import {
  sendExternalNotification,
  requestNotificationPermission,
} from "@/lib/notification-permissions";

export const Route = createFileRoute("/association")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "theme-color", content: "#001D4A" },
      { name: "apple-mobile-web-app-title", content: "CEO 1983" },
      { title: "Hiệp hội Doanh nhân CEO 1983" },
    ],
    links: [
      { rel: "manifest", href: MEMBER_MANIFEST_HREF },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=ceo1983_v3" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon-180x180.png?v=ceo1983_v3",
      },
      {
        rel: "apple-touch-icon",
        sizes: "152x152",
        href: "/apple-touch-icon-152x152.png?v=ceo1983_v3",
      },
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        href: "/apple-touch-icon-167x167.png?v=ceo1983_v3",
      },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch-icon.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/ceo1983-favicon.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/app-icon-192.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/app-icon.png?v=ceo1983_v3" },
      { rel: "shortcut icon", href: "/ceo1983-favicon.png?v=ceo1983_v3" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    // Nếu đang ở màn hình đăng nhập Hiệp hội, KHÔNG BAO GIỜ redirect vòng lặp
    if (
      location.pathname === "/association/login" ||
      location.pathname.startsWith("/association/login")
    ) {
      return;
    }

    const hasLocal =
      typeof window !== "undefined" &&
      Boolean(
        localStorage.getItem("vibe_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token"),
      );
    if (!hasLocal) {
      const searchStr =
        typeof (location as any).searchStr === "string" ? (location as any).searchStr : "";
      const target = location.pathname.startsWith("/association/login")
        ? "/association"
        : location.pathname + searchStr;

      throw redirect({
        to: "/association/login",
        search: {
          redirect: target,
        },
      });
    }
  },
  component: MemberRoot,
});

const REMINDER_KEY = "vba.renewal.reminderCheckedAt";

/** Runs the renewal-reminder check at most once per day per device. */
function useRenewalReminder() {
  const check = useServerFn(checkRenewalReminder);
  useEffect(() => {
    let last = 0;
    try {
      last = Number(localStorage.getItem(REMINDER_KEY) ?? 0);
    } catch {
      /* ignore */
    }
    if (Date.now() - last < 24 * 3600 * 1000) return;
    void check({})
      .then((res) => {
        try {
          localStorage.setItem(REMINDER_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        if (res?.created) {
          // Let the notifications badge refresh.
          window.dispatchEvent(new Event("notifications-updated"));
        }
      })
      .catch(() => {
        /* silent — reminder is best-effort */
      });
  }, [check]);
}

function useAssociationRealtimeNotifications() {
  useEffect(() => {
    // Proactively request notification permission on mount
    void requestNotificationPermission();

    let socket: any = null;
    try {
      socket = getConnectAppSocket();
      if (!socket.connected) {
        socket.connect();
      }
    } catch {
      return;
    }

    const joinRooms = () => {
      try {
        const rawUser = localStorage.getItem("auth_user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        const rawMember = localStorage.getItem("vba_my_member");
        const member = rawMember ? JSON.parse(rawMember) : null;

        if (user?.id) {
          socket.emit("join:room", { room: `user:${user.id}` });
        }
        if (member?.code) {
          socket.emit("join:room", { room: `user:${member.code.toLowerCase()}` });
        }
        if (member?.id) {
          socket.emit("join:room", { room: `user:${member.id}` });
        }
      } catch {
        // ignore room join error
      }
    };

    joinRooms();
    socket.on("connect", joinRooms);

    const handleNewNotification = (data: any) => {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate([80, 50, 100]);
        }
      } catch {
        // ignore vibrate error on non-supported devices
      }

      window.dispatchEvent(new Event("notifications-updated"));

      const title = data?.title || "Thông báo từ Ban Thư Ký";
      const body = data?.body || "";
      toast.info(title, {
        description: body ? (body.length > 90 ? body.slice(0, 90) + "..." : body) : undefined,
        duration: 5000,
      });

      sendExternalNotification(title, {
        body,
        tag: `assoc-notif-${data?.id || Date.now()}`,
        type: "notification",
        url: "/association",
      });
    };

    const handleCount = () => {
      window.dispatchEvent(new Event("notifications-updated"));
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:count", handleCount);
    socket.on("member:notification_new", handleNewNotification);

    return () => {
      socket.off("connect", joinRooms);
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:count", handleCount);
      socket.off("member:notification_new", handleNewNotification);
    };
  }, []);
}

function MemberRoot() {
  const routerState = useRouterState();
  const isLoginPage = routerState.location.pathname.startsWith("/association/login");
  useRenewalReminder();
  useAssociationRealtimeNotifications();

  // Trang đăng nhập Hiệp hội hiển thị màn hình riêng, không hiển thị thanh Tab Bar hội viên
  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <MemberScreen>
      <Outlet />
    </MemberScreen>
  );
}
