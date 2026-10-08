import { useState, useEffect, useCallback } from "react";
import { fetchNestApi } from "@/lib/api-client";

export const SIDEBAR_LABELS_STORAGE_KEY = "ceo1983_dynamic_sidebar_labels";

export const DEFAULT_SIDEBAR_LABELS: Record<string, string> = {
  "/": "Tổng quan",
  "/members": "Hội viên",
  "/companies": "Doanh nghiệp",
  "/segments": "Phân khúc hội viên",
  "/renewal": "Gia hạn hội viên",
  "/events": "Sự kiện",
  "/events-overview": "Tổng quan sự kiện",
  "/meetings": "Cuộc họp",
  "/voting": "Biểu quyết & Bầu cử",
  "/event-registrations": "Đăng ký sự kiện",
  "/checkin": "Check-in sự kiện",
  "/checkin-qr": "Mã QR Check-in",
  "/sponsors": "Nhà tài trợ",
  "/sponsor-packages": "Gói tài trợ",
  "/sponsor-report": "Báo cáo tài trợ",
  "/fees": "Hội phí",
  "/income": "Khoản thu",
  "/expenses": "Khoản chi",
  "/finance-report": "Báo cáo tài chính",
  "/notifications": "Thông báo",
  "/email-marketing": "Email Marketing",
  "/news": "Tin tức & Truyền thông",
  "/perks": "Quyền lợi & Ưu đãi",
  "/benefits": "Khen thưởng & Danh hiệu",
  "/network": "Tin nhắn & Trao đổi",
  "/business-connect/meetings": "Cuộc gặp B2B",
  "/marketplace": "Marketplace B2B",
  "/opportunities": "Cơ hội hợp tác",
  "/tasks": "Quản lý công việc",
  "/settings": "Cài đặt hệ thống",
  "/activity": "Lịch sử hoạt động",
  "/admin/landing-templates": "Quản lý chủ đề",
  "/permissions": "Phân quyền hệ thống",
  "/documents": "Tài liệu & Biểu mẫu",
  // Group keys:
  "nav.group.overview": "Tổng quan",
  "nav.group.members": "Hội viên",
  "nav.group.events": "Sự kiện & Họp",
  "nav.group.sponsors": "Tài trợ",
  "nav.group.finance": "Tài chính",
  "nav.group.comm": "Truyền thông",
  "nav.group.network": "Kết nối kinh doanh",
  "nav.group.system": "Hệ thống",
  "nav.group.permissions": "Phân quyền",
  "nav.group.admin": "Quản trị",
};

export function dispatchSidebarLabelsSyncEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sidebar_labels_updated"));
  }
}

export function useSidebarLabels() {
  const [labels, setLabels] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SIDEBAR_LABELS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            return { ...DEFAULT_SIDEBAR_LABELS, ...parsed };
          }
        }
      } catch {}
    }
    return DEFAULT_SIDEBAR_LABELS;
  });

  const loadFromBackend = useCallback(async () => {
    try {
      const res: any = await fetchNestApi("/admin/sidebar-labels");
      if (res && res.ok && res.labels && typeof res.labels === "object") {
        const merged = { ...DEFAULT_SIDEBAR_LABELS, ...res.labels };
        setLabels(merged);
        if (typeof window !== "undefined") {
          localStorage.setItem(SIDEBAR_LABELS_STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadFromBackend();

    const handleSync = () => {
      try {
        const stored = localStorage.getItem(SIDEBAR_LABELS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            setLabels((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {}
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sidebar_labels_updated", handleSync);
      window.addEventListener("storage", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sidebar_labels_updated", handleSync);
        window.removeEventListener("storage", handleSync);
      }
    };
  }, [loadFromBackend]);

  const getLabel = useCallback(
    (item: { to?: string; key?: string; label?: string }, defaultFallback?: string): string => {
      // 1. Check exact route match in dynamic DB labels
      if (item.to && labels[item.to]) {
        return labels[item.to];
      }
      // 2. Check i18n key match in dynamic DB labels
      if (item.key && labels[item.key]) {
        return labels[item.key];
      }
      // 3. Fallback to hardcoded label on item or defaultFallback
      return item.label || defaultFallback || "";
    },
    [labels]
  );

  const getGroupLabel = useCallback(
    (groupKey: string, defaultFallback: string): string => {
      if (labels[groupKey]) {
        return labels[groupKey];
      }
      return defaultFallback;
    },
    [labels]
  );

  return {
    labels,
    getLabel,
    getGroupLabel,
    reloadLabels: loadFromBackend,
  };
}
