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
export function sendExternalNotification(title: string, options?: SendNotificationOptions) {
  // 1. Android Native heads-up / system tray notification
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

  // 2. Standard Web Notification API fallback
  if (getNotificationPermission() !== "granted") return;

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
