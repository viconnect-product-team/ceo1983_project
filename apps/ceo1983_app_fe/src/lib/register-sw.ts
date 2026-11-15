export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const isCrmDomain =
      window.location.hostname.includes("crm") ||
      window.location.port === "5443" ||
      sessionStorage.getItem("crm_portal") === "1" ||
      new URLSearchParams(window.location.search).get("portal") === "crm";

    // Không can thiệp hoặc đăng ký Service Worker trên Cổng Quản trị CRM
    if (isCrmDomain) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if (typeof window.caches !== "undefined") {
        window.caches.keys().then((keys) => {
          for (const key of keys) {
            window.caches.delete(key);
          }
        });
      }
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
