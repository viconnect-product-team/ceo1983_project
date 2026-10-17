/**
 * System Notification & Device Media Permission Manager
 * Enables external background push notifications, sound, and mic access like Messenger / Zalo.
 * Supports both Android Native Bridge (Capacitor/WebView) and Web Notification API.
 */

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export function isAndroidNative(): boolean {
  return typeof window !== "undefined" && Boolean((window as any).AndroidNative?.isNative?.());
}

export function isNotificationSupported(): boolean {
  if (isAndroidNative()) return true;
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (isAndroidNative()) {
    try {
      const granted = (window as any).AndroidNative?.isNotificationPermissionGranted?.();
      return granted ? "granted" : "default";
    } catch {
      return "default";
    }
  }
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (isAndroidNative()) {
    try {
      (window as any).AndroidNative?.requestNotificationPermission?.();
      const granted = (window as any).AndroidNative?.isNotificationPermissionGranted?.();
      return granted ? "granted" : "default";
    } catch {
      return "denied";
    }
  }
  if (!isNotificationSupported()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return "denied";
  }
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop stream immediately after permission check
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export interface SendNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
  type?: "call" | "message" | "meeting" | "notification" | "opportunity";
}

/**
 * Trigger an external system notification (shown on phone screen, status bar, heads-up banner & lock screen)
 */
export async function sendExternalNotification(title: string, options?: SendNotificationOptions): Promise<void> {
  // 1. Android Native heads-up / system tray notification (if running inside native Android APK bridge)
  if (isAndroidNative()) {
    try {
      (window as any).AndroidNative?.showNotification?.(
        title,
        options?.body || "",
        options?.type || "notification",
        options?.tag || `notif-${Date.now()}`,
        options?.url || "",
      );
      return;
    } catch (err) {
      console.warn("[sendExternalNotification:native] failed", err);
    }
  }

  // 2. ServiceWorkerRegistration showNotification (Critical for Android Chrome, Samsung Internet, PWA, iOS 16.4+)
  // Note: Modern mobile browsers strictly forbid "new Notification()" and throw Illegal Constructor.
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        const isCall = options?.type === "call" || options?.tag?.startsWith("call-");
        const vibratePattern =
          options?.vibrate ||
          (isCall
            ? [500, 250, 500, 250, 500, 250, 500]
            : [200, 100, 200, 100, 200]);

        const notifOptions: any = {
          body: options?.body || "",
          icon: options?.icon || "/app-icon.png",
          badge: "/favicon.png",
          tag: options?.tag || `ceo1983-${Date.now()}`,
          data: options?.url || (isCall ? "/association/messages" : "/association"),
          vibrate: vibratePattern,
          requireInteraction: isCall,
          renotify: true,
          silent: false,
          actions: isCall
            ? [
                { action: "accept", title: "📞 Trả lời" },
                { action: "decline", title: "✕ Từ chối" },
              ]
            : undefined,
        };

        await reg.showNotification(title, notifOptions);
        return;
      }
    } catch (swErr) {
      console.warn("[sendExternalNotification:sw] failed, falling back to Notification constructor", swErr);
    }
  }

  // 3. Desktop classic Notification API fallback
  if (getNotificationPermission() === "granted" && typeof Notification !== "undefined") {
    try {
      const notif = new Notification(title, {
        body: options?.body,
        icon: options?.icon || "/app-icon.png",
        tag: options?.tag || "ceo1983-dm",
        vibrate: options?.vibrate || [200, 100, 200],
      } as NotificationOptions);

      if (options?.url) {
        notif.onclick = () => {
          window.focus();
          window.location.href = options.url!;
          notif.close();
        };
      }
    } catch (err) {
      console.warn("[sendExternalNotification:web] failed", err);
    }
  }
}

/**
 * Register current logged-in user with Android Native Background Sync service and Service Worker.
 * Enables push notifications for incoming calls, messages & events even when phone is locked or app is in background.
 */
export function registerNativePushUser(userId: string, token?: string): void {
  if (!userId) return;

  // 1. Android Native APK background service
  if (isAndroidNative()) {
    try {
      (window as any).AndroidNative?.registerPushUser?.(userId, token || "");
    } catch (err) {
      console.warn("[registerNativePushUser:native] failed", err);
    }
  }

  // 2. Web Service Worker registration for PWA and Mobile Web
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const notifyWorker = (reg?: ServiceWorkerRegistration) => {
        const sw = reg?.active || reg?.waiting || navigator.serviceWorker.controller;
        if (sw) {
          sw.postMessage({
            type: "REGISTER_USER",
            userId,
            token: token || "",
          });
        }
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "REGISTER_USER",
          userId,
          token: token || "",
        });
      }

      navigator.serviceWorker.ready.then(notifyWorker).catch(() => {});
    } catch (err) {
      console.warn("[registerNativePushUser:sw] postMessage error", err);
    }
  }
}

/**
 * Cancel / dismiss a specific notification in Android notification shade
 */
export function dismissNativeNotification(tag: string): void {
  if (isAndroidNative() && tag) {
    try {
      (window as any).AndroidNative?.cancelNotification?.(tag);
    } catch (err) {
      console.warn("[dismissNativeNotification] failed", err);
    }
  }
}

/**
 * Trigger an incoming call alert with ring vibration & quick answer/decline actions
 */
export async function sendCallNotification(callerName: string, callerAvatar?: string, roomId?: string): Promise<void> {
  await sendExternalNotification(`📞 Cuộc gọi đến từ ${callerName}`, {
    body: "Đang gọi cho bạn qua CEO 1983. Chạm để trả lời ngay.",
    icon: callerAvatar || "/app-icon.png",
    type: "call",
    tag: `call-${roomId || Date.now()}`,
    url: "/association/messages",
    vibrate: [500, 250, 500, 250, 500, 250, 500],
  });
}

