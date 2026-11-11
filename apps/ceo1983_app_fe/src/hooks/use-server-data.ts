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

  // Lắng nghe sự kiện chuyển đổi tài khoản hoặc cập nhật hồ sơ để tự động đồng bộ cache tức thì
  useEffect(() => {
    const handleAuthChange = () => {
      setTick((t) => t + 1);
    };
    const handleProfileUpdated = (e: any) => {
      const detail = e?.detail;
      if (detail && cacheKey && cacheKey.startsWith("vba_my_member")) {
        setData((prev: any) => {
          if (!prev) return prev;
          const merged = {
            ...prev,
            fullName: detail.name || prev.fullName,
            name: detail.name || prev.name,
            phone: detail.phone || prev.phone,
            companyName: detail.company || prev.companyName,
            company: detail.company || prev.company,
            title: detail.title || prev.title,
            address: detail.address || prev.address,
            bio: detail.bio || prev.bio,
            companySize: detail.companySize || prev.companySize,
            industry: detail.industry || prev.industry,
            avatar: detail.avatar || prev.avatar,
            avatarUrl: detail.avatar || prev.avatarUrl,
            coverUrl: detail.cover || prev.coverUrl,
            companyLogo: detail.companyLogo || prev.companyLogo,
            companyLogoUrl: detail.companyLogo || prev.companyLogoUrl,
          };
          memoryCache.set(cacheKey, merged);
          return merged;
        });
      }
    };

    window.addEventListener("vba_auth_changed", handleAuthChange);
    window.addEventListener("vba_profile_updated", handleProfileUpdated);
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("vba_auth_changed", handleAuthChange);
      window.removeEventListener("vba_profile_updated", handleProfileUpdated);
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [cacheKey]);

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

export function setServerDataCache(key: string, data: any) {
  memoryCache.set(key, data);
}

export function updateServerDataCache<T>(key: string, updater: (prev: T) => T) {
  if (memoryCache.has(key)) {
    const prev = memoryCache.get(key);
    memoryCache.set(key, updater(prev));
  }
}

export function clearServerDataCache() {
  memoryCache.clear();
}

