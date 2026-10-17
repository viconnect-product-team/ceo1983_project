const CACHE_NAME = "ceo1983-pwa-v4";
const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/apple-touch-icon-180x180.png",
  "/favicon.png",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/app-icon-maskable-192.png",
  "/app-icon-maskable-512.png",
  "/app-icon.png",
  "/ceo1983-official-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        /* Continue even if some optional assets are missed */
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Không can thiệp API calls hoặc WebSocket
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/dm") || url.pathname.startsWith("/socket.io")) {
    return;
  }

  // 1. Navigation request (HTML pages): Network-First để luôn nhận phiên bản mới nhất khi deploy
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request) || caches.match("/association"))
    );
    return;
  }

  // 2. Chunks JS/CSS hoặc assets: Network-First với fallback cache
  if (url.pathname.includes("/assets/") || url.pathname.includes("/_build/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Các assets tĩnh khác: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Background Push Notification & Incoming Calls
let currentUserId = null;
let currentToken = null;
let lastActiveCallId = null;
const seenNotificationIds = new Set();

self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "REGISTER_USER") {
    currentUserId = event.data.userId || null;
    currentToken = event.data.token || null;
  } else if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    if (title) {
      self.registration.showNotification(title, options || {});
    }
  }
});

// Periodic background check for incoming calls and urgent notifications (runs even when tab is backgrounded)
setInterval(async () => {
  if (!currentUserId) return;
  try {
    const headers = {
      Accept: "application/json",
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    };

    // 1. Kiểm tra cuộc gọi đến đang đổ chuông
    const callRes = await fetch("/api/me/active-call", { headers }).catch(() => null);
    if (callRes && callRes.ok) {
      const callData = await callRes.json().catch(() => null);
      if (callData?.ok && callData?.call && callData.call.status === "ringing") {
        const call = callData.call;
        const callId = call.callId;
        if (callId && callId !== lastActiveCallId) {
          lastActiveCallId = callId;
          const callerName = call.callerName || "Hội viên CEO 1983";
          const callType = call.callType === "video" ? "Video" : "Thoại";
          self.registration.showNotification(`📞 Cuộc gọi ${callType} đến từ ${callerName}`, {
            body: `${callerName} đang gọi cho bạn... Bấm để trả lời ngay!`,
            icon: call.callerAvatar || "/app-icon.png",
            badge: "/favicon.png",
            tag: `call-${callId}`,
            data: `/association/messages?callId=${callId}`,
            vibrate: [500, 250, 500, 250, 500, 250, 500],
            requireInteraction: true,
            renotify: true,
            silent: false,
            actions: [
              { action: "accept", title: "📞 Trả lời" },
              { action: "decline", title: "✕ Từ chối" },
            ],
          });
        }
      } else if (lastActiveCallId) {
        lastActiveCallId = null;
      }
    }

    // 2. Kiểm tra thông báo mới
    const notifRes = await fetch("/api/me/notifications?limit=2&unreadOnly=true", { headers }).catch(() => null);
    if (notifRes && notifRes.ok) {
      const notifData = await notifRes.json().catch(() => null);
      const list = Array.isArray(notifData) ? notifData : notifData?.data || [];
      for (const item of list) {
        const notifId = item.id || `${item.title}-${item.created_at || Date.now()}`;
        if (!seenNotificationIds.has(notifId) && !item.is_read) {
          seenNotificationIds.add(notifId);
          self.registration.showNotification(item.title || "CEO 1983", {
            body: item.body || item.message || "Bạn có thông báo mới từ Hiệp hội CEO 1983",
            icon: item.icon || "/app-icon.png",
            badge: "/favicon.png",
            tag: `notif-${notifId}`,
            data: item.action_url || item.url || "/association",
            vibrate: [200, 100, 200],
            renotify: true,
          });
        }
      }
    }
  } catch {
    /* Silent catch for background checks */
  }
}, 4500);

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || "CEO 1983";
    const isCall = data.type === "call" || data.tag?.startsWith("call-");
    const options = {
      body: data.body || "",
      icon: data.icon || "/app-icon.png",
      badge: "/favicon.png",
      tag: data.tag || `notif-${Date.now()}`,
      data: data.url || (isCall ? "/association/messages" : "/association"),
      vibrate: isCall ? [500, 250, 500, 250, 500] : [200, 100, 200],
      requireInteraction: isCall,
      renotify: true,
      actions: isCall
        ? [
            { action: "accept", title: "📞 Trả lời" },
            { action: "decline", title: "✕ Từ chối" },
          ]
        : [],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data ? event.data.text() : "";
    event.waitUntil(
      self.registration.showNotification("CEO 1983", {
        body: text || "Bạn có thông báo mới từ CLB Doanh Nhân CEO 1983",
        icon: "/app-icon.png",
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || "/association";

  if (event.action === "decline") {
    // Người dùng từ chối cuộc gọi
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url && "navigate" in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

