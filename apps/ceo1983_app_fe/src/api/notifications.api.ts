import { httpClient, type RequestOptions } from "./http-client";

export interface NotificationDTO {
  id: string;
  title: string;
  body: string;
  audience?: string;
  channel?: string;
  appScope?: "crm" | "association_app" | "all";
  sentAt: string;
  status: "sent" | "scheduled" | "draft";
  read?: boolean;
}

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; limit?: number }, options?: RequestOptions) =>
    httpClient.get<NotificationDTO[]>("/notifications", { ...options, params: params as any }),

  getUnreadCount: (options?: RequestOptions) =>
    httpClient.get<{ count: number }>("/notifications/unread-count", options),

  create: (data: Partial<NotificationDTO>, options?: RequestOptions) =>
    httpClient.post<NotificationDTO>("/notifications", data, options),

  markAsRead: (id: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {}, options),

  markAllAsRead: (options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>("/notifications/read-all", {}, options),
};
