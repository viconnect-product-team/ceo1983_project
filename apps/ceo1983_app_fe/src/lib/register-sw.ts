export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // Không can thiệp hoặc đăng ký Service Worker trên domain Quản trị CRM
    if (window.location.hostname.startsWith("crm.")) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    });
  }
}
