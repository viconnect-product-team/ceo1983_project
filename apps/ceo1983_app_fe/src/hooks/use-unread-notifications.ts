import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { listNotificationsFn } from "@/lib/notifications.functions";
import { getConnectAppSocket } from "./use-connect-app-socket";


export const SEEN_KEY = "vba.notif.lastSeenAt";

export function getLastSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** Persist "all seen" and notify listeners (badge + open panels). */
export function markNotificationsSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("notifications-seen"));
}

/**
 * Unread badge for the admin "Thông báo" menu item.
 * The broadcast `notifications` table has no per-user read state, so we treat
 * anything newer than the last time the user opened /notifications as unread.
 */
export function useUnreadNotifications() {
  const list = useServerFn(listNotificationsFn);
  const pathname = useRouterState({ select: (s) => s?.location?.pathname });
  const [count, setCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  function lastSeen(): number {
    try {
      return Number(localStorage.getItem(SEEN_KEY) ?? 0);
    } catch {
      return 0;
    }
  }

  async function refresh() {
    try {
      const items = await list({});
      const seen = lastSeen();
      // Lấy danh sách ID đã đọc cá nhân từ localStorage nếu có
      let readIds = new Set<string>();
      try {
        const raw = localStorage.getItem("vba_crm_read_notif_ids");
        if (raw) readIds = new Set(JSON.parse(raw));
      } catch {}

      const unreadList = items.filter((n) => {
        if (n.id && readIds.has(String(n.id))) return false;
        const ts = n.sentAt ? new Date(n.sentAt).getTime() : 0;
        // Chưa đọc nếu gửi sau lastSeen HOẶC trong vòng 7 ngày gần nhất chưa bị mark read
        const isRecent = Date.now() - ts < 7 * 86400000;
        return (ts > seen || isRecent) && n.status === "sent";
      });

      const catCounts: Record<string, number> = {
        "/notifications": unreadList.length,
      };

      unreadList.forEach((n) => {
        const text = `${n.title || ""} ${n.body || ""}`.toLowerCase();

        if (n.targetRoute) {
          catCounts[n.targetRoute] = (catCounts[n.targetRoute] || 0) + 1;
        }

        // 1. Hội viên mới gia nhập / nộp hồ sơ
        if (
          text.includes("hội viên") ||
          text.includes("kết nạp") ||
          text.includes("gia nhập") ||
          text.includes("đăng ký") ||
          text.includes("hồ sơ") ||
          text.includes("hội viên mới")
        ) {
          catCounts["/members"] = (catCounts["/members"] || 0) + 1;
          catCounts["/notifications?filter=new_members"] = (catCounts["/notifications?filter=new_members"] || 0) + 1;
        }

        // 2. Hội phí & niên liễm
        if (
          text.includes("gia hạn") ||
          text.includes("niên liễm") ||
          text.includes("hội phí") ||
          text.includes("phí") ||
          text.includes("quá hạn")
        ) {
          catCounts["/renewal"] = (catCounts["/renewal"] || 0) + 1;
          catCounts["/finance"] = (catCounts["/finance"] || 0) + 1;
          catCounts["/notifications?filter=fee_alerts"] = (catCounts["/notifications?filter=fee_alerts"] || 0) + 1;
        }

        // 3. Ban Điều Hành & Quản Trị Hệ Thống
        if (
          text.includes("ban điều hành") ||
          text.includes("quản trị") ||
          text.includes("hệ thống") ||
          text.includes("phân quyền") ||
          text.includes("tài khoản") ||
          text.includes("landing")
        ) {
          catCounts["/accounts"] = (catCounts["/accounts"] || 0) + 1;
          catCounts["/settings"] = (catCounts["/settings"] || 0) + 1;
          catCounts["/notifications?filter=admin_system"] = (catCounts["/notifications?filter=admin_system"] || 0) + 1;
        }

        // 4. Sự kiện & Cuộc họp
        if (
          text.includes("sự kiện") ||
          text.includes("check-in") ||
          text.includes("điểm danh") ||
          text.includes("cuộc họp") ||
          text.includes("họp ban") ||
          text.includes("meeting")
        ) {
          catCounts["/events"] = (catCounts["/events"] || 0) + 1;
          catCounts["/meetings"] = (catCounts["/meetings"] || 0) + 1;
          catCounts["/notifications?filter=events_meetings"] = (catCounts["/notifications?filter=events_meetings"] || 0) + 1;
        }

        // 5. Nhiệm vụ & công việc
        if (text.includes("nhiệm vụ") || text.includes("công việc") || text.includes("task")) {
          catCounts["/tasks"] = (catCounts["/tasks"] || 0) + 1;
        }

        // 6. Cơ hội giao thương B2B
        if (text.includes("cơ hội") || text.includes("giao thương") || text.includes("b2b") || text.includes("kết nối")) {
          catCounts["/opportunities"] = (catCounts["/opportunities"] || 0) + 1;
        }

        // 7. Tài liệu & biểu mẫu
        if (text.includes("tài liệu") || text.includes("văn bản") || text.includes("hồ sơ biểu mẫu")) {
          catCounts["/documents"] = (catCounts["/documents"] || 0) + 1;
        }

        // 8. Phê duyệt xét duyệt
        if (text.includes("phê duyệt") || text.includes("xét duyệt")) {
          catCounts["/approvals"] = (catCounts["/approvals"] || 0) + 1;
        }
      });

      setCount(unreadList.length);
      setCategoryCounts(catCounts);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void refresh();
    // Re-sync when another instance marks notifications as seen.
    const onSeen = () => setCount(0);
    window.addEventListener("notifications-seen", onSeen);
    window.addEventListener("connect-app:notification", refresh);

    const socket = getConnectAppSocket();
    if (!socket.connected) {
      socket.connect();
    }
    const onSocketEvent = () => {
      void refresh();
    };
    socket.on("notification:new", onSocketEvent);
    socket.on("notification:count", onSocketEvent);
    socket.on("notification:unread_count", onSocketEvent);
    socket.on("notification", onSocketEvent);
    socket.on("member:notification_new", onSocketEvent);

    const interval = setInterval(() => {
      void refresh();
    }, 20000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-seen", onSeen);
      window.removeEventListener("connect-app:notification", refresh);
      socket.off("notification:new", onSocketEvent);
      socket.off("notification:count", onSocketEvent);
      socket.off("notification:unread_count", onSocketEvent);
      socket.off("notification", onSocketEvent);
      socket.off("member:notification_new", onSocketEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Re-sync notifications when route changes
  useEffect(() => {
    void refresh();
  }, [pathname]);

  return {
    count,
    categoryCounts,
  };
}
