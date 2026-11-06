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
      const unreadList = items.filter((n) => {
        const ts = n.sentAt ? new Date(n.sentAt).getTime() : 0;
        return ts > seen && n.status === "sent";
      });

      const catCounts: Record<string, number> = {};
      unreadList.forEach((n) => {
        const text = `${n.title || ""} ${n.body || ""}`.toLowerCase();

        if (n.targetRoute) {
          catCounts[n.targetRoute] = (catCounts[n.targetRoute] || 0) + 1;
        }
        if (text.includes("hội viên") || text.includes("kết nạp") || text.includes("gia nhập") || text.includes("đăng ký")) {
          catCounts["/members"] = (catCounts["/members"] || 0) + 1;
        }
        if (text.includes("gia hạn") || text.includes("niên liễm") || text.includes("hội phí")) {
          catCounts["/renewal"] = (catCounts["/renewal"] || 0) + 1;
        }
        if (text.includes("sự kiện") || text.includes("check-in") || text.includes("điểm danh")) {
          catCounts["/events"] = (catCounts["/events"] || 0) + 1;
        }
        if (text.includes("cuộc họp") || text.includes("họp ban") || text.includes("meeting")) {
          catCounts["/meetings"] = (catCounts["/meetings"] || 0) + 1;
        }
        if (text.includes("nhiệm vụ") || text.includes("công việc") || text.includes("task")) {
          catCounts["/tasks"] = (catCounts["/tasks"] || 0) + 1;
        }
        if (text.includes("cơ hội") || text.includes("giao thương") || text.includes("b2b") || text.includes("kết nối")) {
          catCounts["/opportunities"] = (catCounts["/opportunities"] || 0) + 1;
        }
        if (text.includes("tài liệu") || text.includes("văn bản") || text.includes("hồ sơ")) {
          catCounts["/documents"] = (catCounts["/documents"] || 0) + 1;
        }
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


  // Mark as seen when the user opens the notifications page.
  useEffect(() => {
    if (pathname === "/notifications") {
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setCount(0);
      window.dispatchEvent(new Event("notifications-seen"));
    }
  }, [pathname]);

  return {
    count,
    categoryCounts,
  };
}
