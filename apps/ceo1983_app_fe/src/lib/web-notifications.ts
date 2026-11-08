/**
 * Quản lý Web Push & Hệ thống Thông Báo Thiết Bị CLB Doanh Nhân CEO 1983 (HanoiBA)
 * Cho phép hiển thị thông báo ra ngoài màn hình thiết bị khi hội viên thoát app hoặc ẩn trình duyệt.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn("[WebNotifications] Error requesting permission:", err);
    return "default";
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isNotificationGranted(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export interface SystemNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: string;
  silent?: boolean;
  vibrate?: number[];
  requireInteraction?: boolean;
}

/**
 * Bắn thông báo ra ngoài app (hệ điều hành / màn hình khóa / khay thông báo)
 * Hoạt động cả khi hội viên đang ở ứng dụng khác hoặc thoát app ra màn hình chính.
 */
export async function triggerSystemNotification(
  title: string,
  options: SystemNotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  // Nếu chưa cấp quyền thì không cố bắn
  if (Notification.permission !== "granted") {
    return false;
  }

  const notifOptions: any = {
    body: options.body || "Bạn có thông báo mới từ CLB Doanh Nhân CEO 1983",
    icon: options.icon || "/ceo1983-emblem-8.png",
    badge: options.badge || "/favicon.png",
    tag: options.tag || `ceo1983-notif-${Date.now()}`,
    data: options.data || "/association/notifications",
    silent: options.silent ?? false,
    vibrate: options.vibrate || [200, 100, 200],
    requireInteraction: options.requireInteraction ?? false,
  };

  // Ưu tiên hiển thị qua Service Worker Registration nếu có để hỗ trợ thông báo nền
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    } catch (e) {
      console.warn("[WebNotifications] SW showNotification fallback:", e);
    }
  }

  // Fallback sang native Notification constructor
  try {
    const notif = new Notification(title, notifOptions);
    notif.onclick = () => {
      window.focus();
      if (options.data) {
        window.location.href = options.data;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn("[WebNotifications] Native Notification failed:", err);
    return false;
  }
}

/**
 * Đồng bộ User và Token sang Service Worker để SW duy trì kiểm tra thông báo định kỳ
 */
export function syncAuthToServiceWorker(userId: string | null, token: string | null) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "REGISTER_USER",
      userId,
      token,
    });
  } else {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({
        type: "REGISTER_USER",
        userId,
        token,
      });
    }).catch(() => {});
  }
}
