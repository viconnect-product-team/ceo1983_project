import { useEffect, useState } from "react";

const memoryCache = new Map<string, any>();

/**
 * Lightweight client-side fetch for PWA pages with instant in-memory cache (SWR).
 * When cacheKey is provided, returns cached data immediately on mount (loading = false),
 * eliminating layout shifts and flashes when switching tabs.
 * Supports reactive dependencies (deps) to automatically invalidate and re-fetch when user/context changes.
 */
export function useServerData<T>(
  fn: () => Promise<T>,
  fallback: T,
  cacheKey?: string,
  deps: any[] = []
) {
  const cached = cacheKey ? memoryCache.get(cacheKey) : undefined;
  const [data, setData] = useState<T>(cached !== undefined ? cached : fallback);
  const [loading, setLoading] = useState<boolean>(cached === undefined);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Khi cacheKey hoặc deps thay đổi: cập nhật data ngay từ cache mới hoặc fallback
  useEffect(() => {
    if (cacheKey) {
      const currentCache = memoryCache.get(cacheKey);
      if (currentCache !== undefined) {
        setData(currentCache);
        setLoading(false);
      } else {
        setData(fallback);
        setLoading(true);
      }
    } else {
      setData(fallback);
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  useEffect(() => {
    let active = true;
    if (!cacheKey || !memoryCache.has(cacheKey)) {
      setLoading(true);
    }
    fn()
      .then((d) => {
        if (active) {
          if (cacheKey) {
            memoryCache.set(cacheKey, d);
          }
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, cacheKey, ...deps]);

  // Lắng nghe sự kiện chuyển đổi tài khoản để tự động reload
  useEffect(() => {
    const handleAuthChange = () => {
      setTick((t) => t + 1);
    };
    window.addEventListener("vba_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("vba_auth_changed", handleAuthChange);
    };
  }, []);

  return {
    data,
    loading,
    error,
    reload: () => setTick((t) => t + 1),
    invalidate: () => {
      if (cacheKey) memoryCache.delete(cacheKey);
      setTick((t) => t + 1);
    },
  };
}

export function clearServerDataCache() {
  memoryCache.clear();
}

