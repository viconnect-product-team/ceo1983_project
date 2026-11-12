import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MemberScreen } from "@/components/member/MemberShell";
import { FirstLoginChangePasswordModal } from "@/components/member/FirstLoginChangePasswordModal";
import { useAuth } from "@/context/AuthContext";
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
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=ceo1983_v4w" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon-180x180.png?v=ceo1983_v4w",
      },
      {
        rel: "apple-touch-icon",
        sizes: "152x152",
        href: "/apple-touch-icon-152x152.png?v=ceo1983_v4w",
      },
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        href: "/apple-touch-icon-167x167.png?v=ceo1983_v4w",
      },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch-icon.png?v=ceo1983_v4w" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/ceo1983-favicon.png?v=ceo1983_v4w" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/app-icon-192.png?v=ceo1983_v4w" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/app-icon.png?v=ceo1983_v4w" },
      { rel: "shortcut icon", href: "/ceo1983-favicon.png?v=ceo1983_v4w" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    // Nếu đang ở màn hình đăng nhập hoặc đăng ký Hiệp hội, KHÔNG BAO GIỜ redirect vòng lặp
    const path = location.pathname;
    if (
      path === "/association/login" ||
      path.startsWith("/association/login") ||
      path === "/association/register" ||
      path.startsWith("/association/register") ||
      path === "/register" ||
      path.startsWith("/register")
    ) {
      return;
    }

    const hasLocal =
      typeof window !== "undefined" &&
      Boolean(
        localStorage.getItem("vibe_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        document.cookie.includes("sb-access-token=") ||
        document.cookie.includes("vibe_token=") ||
        document.cookie.includes("access_token="),
      );
    if (!hasLocal) {
      const search = (location.search || {}) as any;
      const eventId = search?.id || search?.eventId;
      // Khách vãng lai / Khách mời bên ngoài không dùng app khi truy cập link sự kiện:
      // Chuyển hướng trực tiếp tới trang đăng ký công khai (Public Guest Event Registration) tuyệt đối không bắt đăng nhập!
      if (
        path.startsWith("/association/events") ||
        path.startsWith("/association/checkin") ||
        search?.action === "register"
      ) {
        throw redirect({
          to: "/guest-event-register/$eventId",
          params: { eventId: eventId || "latest" },
          search: search,
        });
      }

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

    // Bắt buộc hội viên mới (mustChangePassword) chuyển hướng ngay tới chức năng đổi mật khẩu
    if (typeof window !== "undefined") {
      let mustChange = false;
      try {
        const rawUser = localStorage.getItem("auth_user") || localStorage.getItem("user");
        let parsedUser: any = null;
        if (rawUser) {
          try {
            parsedUser = JSON.parse(rawUser);
          } catch { }
        }
        const userEmail = (parsedUser?.email || "").toLowerCase().trim();
        const userRole = (parsedUser?.role || parsedUser?.user_metadata?.role || "").toLowerCase().trim();
        const isSystemAdmin =
          userEmail === "admin@connect.vn" ||
          userEmail === "admin@ceo1983.com" ||
          userEmail === "ceo.tongthuky@ceo1983.com" ||
          userRole === "admin" ||
          userRole === "quan_tri" ||
          userRole === "platform_admin";

        if (isSystemAdmin) {
          mustChange = false;
          try {
            localStorage.removeItem("vba_must_change_password");
          } catch { }
        } else {
          const flag = localStorage.getItem("vba_must_change_password");
          if (flag === "true") {
            mustChange = true;
          } else if (parsedUser) {
            if (
              parsedUser?.mustChangePassword ||
              parsedUser?.must_change_password ||
              parsedUser?.onboarding_status === "new" ||
              parsedUser?.profile?.onboarding_status === "new"
            ) {
              mustChange = true;
            }
          }
        }
      } catch { }

      if (mustChange) {
        const isSettingsChangePass =
          location.pathname === "/association/settings" &&
          ((location as any).search?.action === "change_password" || (location as any).searchStr?.includes("action=change_password"));

        if (!isSettingsChangePass) {
          throw redirect({
            to: "/association/settings",
            search: {
              action: "change_password",
              required: "true",
            },
          });
        }
      }
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
  const path = routerState.location.pathname;
  const isLoginPage = path === "/association/login" || path.startsWith("/association/login");
  const isRegisterPage =
    path === "/association/register" ||
    path.startsWith("/association/register") ||
    path === "/register" ||
    path.startsWith("/register");

  const { user, logout } = useAuth();
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const flag = localStorage.getItem("vba_must_change_password");
    if (flag === "true") return true;
    const rawUser = localStorage.getItem("auth_user") || localStorage.getItem("vibe_user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        const email = (u.email || "").toLowerCase().trim();
        const isSysAdmin =
          email === "admin@connect.vn" ||
          email === "admin@ceo1983.com" ||
          email === "ceo.tongthuky@ceo1983.com" ||
          u.isAdmin ||
          u.role === "admin" ||
          u.role === "quan_tri";
        if (isSysAdmin) return false;
        return Boolean(
          u.mustChangePassword ||
          u.must_change_password ||
          u.isFirstLogin ||
          u.firstLogin ||
          u.onboarding_status === "new"
        );
      } catch { }
    }
    return false;
  });

  // Đồng bộ thêm nếu user từ AuthContext cập nhật có mustChangePassword
  useEffect(() => {
    if (!user) return;
    const email = (user.email || "").toLowerCase().trim();
    const isSysAdmin =
      email === "admin@connect.vn" ||
      email === "admin@ceo1983.com" ||
      email === "ceo.tongthuky@ceo1983.com" ||
      user.isAdmin ||
      user.role === "admin" ||
      user.role === "quan_tri";
    if (isSysAdmin) return;
    if (user.mustChangePassword || (user as any).must_change_password || (user as any).isFirstLogin || (user as any).firstLogin) {
      setMustChangePassword(true);
    }
  }, [user]);

  useEffect(() => {
    const handlePasswordChanged = () => {
      setMustChangePassword(false);
      try {
        localStorage.removeItem("vba_must_change_password");
      } catch { }
    };
    window.addEventListener("password-changed", handlePasswordChanged);
    return () => window.removeEventListener("password-changed", handlePasswordChanged);
  }, []);

  useRenewalReminder();
  useAssociationRealtimeNotifications();

  // Mặc định vào App CEO 1983 luôn là Theme Sáng chuẩn nhận diện thương hiệu
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("dark");
      root.classList.remove("hc");
      root.classList.add("light");
      root.dataset.theme = "light";
      root.style.colorScheme = "light";
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("vba.theme", "light");
      } catch { }
    }
  }, []);

  // Trang đăng nhập hoặc tiếp nhận hồ sơ đăng ký Hiệp hội hiển thị độc lập, không hiển thị thanh Tab Bar hay layout hội viên đã đăng nhập
  if (isLoginPage || isRegisterPage) {
    return <Outlet />;
  }

  return (
    <MemberScreen>
      <Outlet />
      {mustChangePassword && (
        <FirstLoginChangePasswordModal
          onSuccess={() => {
            setMustChangePassword(false);
            try {
              localStorage.removeItem("vba_must_change_password");
            } catch { }
          }}
          onLogout={() => {
            logout?.();
            window.location.replace("/association/login");
          }}
        />
      )}
    </MemberScreen>
  );
}
