// @ts-nocheck
/* eslint-disable */
/**
 * CEO 1983 Progressive Web App Service Worker (PWA & Offline First)
 * Phiên bản: ceo1983-pwa-v6
 */

(function () {
  "use strict";

  // Tự động hủy đăng ký ngay lập tức nếu chạy trên domain Quản trị CRM
  // Tuyệt đối không can thiệp hay cài đặt fetch listener trên portal CRM!
  if (
    typeof self !== "undefined" &&
    self.location &&
    (self.location.hostname.includes("crm") || self.location.port === "5443")
  ) {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => {
      event.waitUntil(
        self.registration.unregister().then(() => {
          return self.clients.matchAll();
        }).then((clients) => {
          clients.forEach((client) => {
            if (client.url && "navigate" in client) {
              client.navigate(client.url);
            }
          });
        })
      );
    });
    return;
  }

  const SW_CACHE_NAME = "ceo1983-pwa-v6";

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
      caches.open(SW_CACHE_NAME).then((cache) => {
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
          keys.filter((key) => key !== SW_CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    // Tránh lỗi net::ERR_CACHE_MISS khi browser gửi request only-if-cached
    if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
      return;
    }

    const url = new URL(request.url);

    // Chỉ can thiệp vào same-origin requests
    if (url.origin !== self.location.origin) return;

    // Bỏ qua hoàn toàn trên cổng CRM để không cache hay can thiệp luồng web quản trị
    if (
      self.location.hostname.includes("crm") ||
      url.hostname.includes("crm") ||
      url.port === "5443" ||
      self.location.port === "5443"
    ) {
      return;
    }

    // Không can thiệp API calls, WebSocket, Server Functions hoặc data endpoints
    if (
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/dm") ||
      url.pathname.startsWith("/connect-app") ||
      url.pathname.startsWith("/socket.io") ||
      url.pathname.startsWith("/_serverFn") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/notifications") ||
      url.pathname.startsWith("/members") ||
      url.pathname.startsWith("/events") ||
      url.pathname.startsWith("/meetings") ||
      url.pathname.startsWith("/news") ||
      url.pathname.startsWith("/opportunities") ||
      url.pathname.startsWith("/products") ||
      url.pathname.startsWith("/transactions") ||
      url.pathname.startsWith("/invoices")
    ) {
      return;
    }

    // 1. Navigation request (HTML pages) hoặc tài liệu gốc: Network-First để luôn nhận phiên bản mới nhất khi deploy
    if (request.mode === "navigate" || request.destination === "document" || url.pathname === "/") {
      event.respondWith(
        (async () => {
          try {
            const networkResponse = await fetch(request).catch(() => null);
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(SW_CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => { });
              return networkResponse;
            }
            if (networkResponse) return networkResponse;
          } catch { }

          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = (await caches.match("/association")) || (await caches.match("/"));
          if (fallback) return fallback;
          return new Response("Offline", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
        })()
      );
      return;
    }

    // 2. Chunks JS/CSS hoặc assets: Network-First với fallback cache
    if (url.pathname.includes("/assets/") || url.pathname.includes("/_build/")) {
      event.respondWith(
        (async () => {
          try {
            const networkResponse = await fetch(request).catch(() => null);
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(SW_CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => { });
              return networkResponse;
            }
            if (networkResponse) return networkResponse;
          } catch { }

          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response("", { status: 408, statusText: "Request Timeout" });
        })()
      );
      return;
    }

    // 3. Các assets tĩnh khác: Stale-While-Revalidate an toàn
    event.respondWith(
      (async () => {
        try {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            if (request.cache !== "only-if-cached") {
              try {
                fetch(new Request(request.url, {
                  method: "GET",
                  headers: request.headers,
                  credentials: request.credentials,
                  cache: "no-cache",
                }))
                  .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                      const copy = networkResponse.clone();
                      caches.open(SW_CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => { });
                    }
                  })
                  .catch(() => { });
              } catch { }
            }
            return cachedResponse;
          }

          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(SW_CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => { });
          }
          return networkResponse;
        } catch {
          return new Response("", { status: 408, statusText: "Request Timeout" });
        }
      })()
    );
  });

  // 4. Xử lý Push Notifications (Hỗ trợ thông báo đẩy chạy nền PWA)
  self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload = {
      title: "CEO 1983 Thông báo",
      body: "Bạn có cập nhật mới từ CLB Doanh Nhân CEO 1983",
      icon: "/app-icon-192.png",
      badge: "/favicon.png",
      data: { url: "/notifications" },
    };

    try {
      const data = event.data.json();
      payload = {
        title: data.title || payload.title,
        body: data.body || payload.body,
        icon: data.icon || payload.icon,
        badge: data.badge || payload.badge,
        data: data.data || { url: data.url || "/notifications" },
      };
    } catch {
      payload.body = event.data.text();
    }

    const options = {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
      vibrate: [100, 50, 100],
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(payload.title, options));
  });

  // 5. Chuyển hướng khi người dùng nhấn vào Notification
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) || "/notifications";

    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
    );
  });
})();
