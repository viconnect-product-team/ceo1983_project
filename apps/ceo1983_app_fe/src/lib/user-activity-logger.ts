/**
 * USER ACTIVITY LOGGER (Nhật Ký Thao Tác & Hoạt Động Hội Viên CEO 1983)
 * Lưu trữ nhật ký hành động cục bộ & gửi đồng bộ lên Backend audit_logs
 */
import { fetchNestApi } from "@/lib/api-client";

export interface UserActivityItem {
  id: string;
  action: string;
  title: string;
  time: string;
  badge: string;
  createdAt: number;
  metadata?: any;
}

const STORAGE_PREFIX = "vba_user_activity_history_";

function getStorageKey(userId?: string): string {
  if (userId) return `${STORAGE_PREFIX}${userId}`;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("vibe_user") : null;
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return `${STORAGE_PREFIX}${u.id}`;
    }
  } catch {}
  return `${STORAGE_PREFIX}default`;
}

function formatActivityTime(ts: number): string {
  const now = Date.now();
  const diffMinutes = Math.floor((now - ts) / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const d = new Date(ts);
  const today = new Date();
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `Hôm nay, ${hh}:${mm}`;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hh}:${mm}`;
}

export function getUserActivityHistory(userId?: string): UserActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const list: UserActivityItem[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => ({
          ...item,
          time: formatActivityTime(item.createdAt),
        }));
      }
    }
  } catch {}

  // Danh mục khởi tạo mẫu nếu chưa có dữ liệu thao tác
  return [
    {
      id: "init_1",
      action: "UPDATE_PROFILE",
      title: "Cập nhật hồ sơ & Quy mô nhân sự doanh nghiệp",
      time: "Hôm nay, 14:15",
      badge: "Hồ sơ",
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: "init_2",
      action: "REGISTER_EVENT",
      title: "Đăng ký tham gia Gala Doanh Nhân CEO 1983",
      time: "Hôm qua, 16:30",
      badge: "Sự kiện",
      createdAt: Date.now() - 3600000 * 26,
    },
    {
      id: "init_3",
      action: "B2B_CONNECT",
      title: "Gửi lời mời kết nối hợp tác giao thương 1-on-1",
      time: "24/10/2026",
      badge: "Giao thương",
      createdAt: Date.now() - 3600000 * 24 * 5,
    },
    {
      id: "init_4",
      action: "QR_SCAN",
      title: "Quét mã QR danh thiếp số hội viên CLB",
      time: "22/10/2026",
      badge: "Mạng lưới",
      createdAt: Date.now() - 3600000 * 24 * 7,
    },
  ];
}

export function recordUserActivity(params: {
  action: string;
  title: string;
  badge: string;
  userId?: string;
  metadata?: any;
}): UserActivityItem {
  const now = Date.now();
  const newItem: UserActivityItem = {
    id: `act_${now}_${Math.random().toString(36).substring(2, 7)}`,
    action: params.action,
    title: params.title,
    badge: params.badge,
    time: "Vừa xong",
    createdAt: now,
    metadata: params.metadata,
  };

  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(params.userId);
      const current = getUserActivityHistory(params.userId);
      // Đưa hành động mới nhất lên đầu danh sách (tối đa 100 bản ghi)
      const updated = [newItem, ...current.filter((c) => !c.id.startsWith("init_"))].slice(0, 100);
      localStorage.setItem(key, JSON.stringify(updated));

      // Đồng bộ tức thì với màn hình Lịch sử hoạt động (/association/history)
      const recentRaw = localStorage.getItem("vba_recent_activities");
      let recentList: any[] = [];
      if (recentRaw) {
        try {
          const parsed = JSON.parse(recentRaw);
          if (Array.isArray(parsed)) recentList = parsed;
        } catch {}
      }
      const historyItem = {
        id: newItem.id,
        title: params.title,
        detail:
          params.metadata?.detail ||
          params.metadata?.content ||
          `Thực hiện ${params.title.toLowerCase()} trên ứng dụng CEO 1983`,
        date: new Date(now).toISOString(),
        category: params.badge,
        type: params.badge.toLowerCase(),
      };
      const updatedRecent = [historyItem, ...recentList.filter((r) => r.id !== newItem.id)].slice(0, 100);
      localStorage.setItem("vba_recent_activities", JSON.stringify(updatedRecent));

      // Phát sự kiện toàn cục để các component (Profile, Notification, History) tự động cập nhật
      window.dispatchEvent(
        new CustomEvent("vba:user_activity_recorded", { detail: newItem })
      );
      window.dispatchEvent(new Event("vba.history.changed"));
    } catch {}
  }

  // Đồng bộ lên backend audit log (không chặn luồng UI)
  try {
    fetchNestApi("/analytics/track-action", {
      method: "POST",
      body: JSON.stringify({
        action: params.action,
        type: params.badge,
        metadata: {
          title: params.title,
          ...params.metadata,
        },
      }),
    }).catch(() => {});
  } catch {}

  return newItem;
}
