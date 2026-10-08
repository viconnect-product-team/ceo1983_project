import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConnectAppSocket } from "./use-connect-app-socket";
import { useViewerUserId } from "./use-viewer-user-id";
import { notificationKeys } from "./use-bc-notifications";
import { bcMobileHomeKeys } from "./use-business-connect-home";
import { GlobalNetworkSDK } from "@/lib/global-network/network.sdk";
import { sendExternalNotification } from "@/lib/notification-permissions";

// Global cache of recent notifications / connection event keys to strictly prevent double toasts across components & re-renders
const globalRecentToastKeys = new Map<string, number>();

export function useConnectAppRealtimeNotifications() {
  const qc = useQueryClient();
  const viewerUserId = useViewerUserId();
  const socket = useConnectAppSocket();

  useEffect(() => {
    if (!socket || !viewerUserId || !qc) return;

    const playNotificationSound = () => {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate([100, 60, 150]);
        }
      } catch {
        /* ignore */
      }
    };

    const invalidateEverything = () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.root });
      void qc.invalidateQueries({ queryKey: bcMobileHomeKeys.root });
      void qc.invalidateQueries({ queryKey: ["bc-home"] });
      void qc.invalidateQueries({ queryKey: ["user-connections"] });
      void qc.invalidateQueries({ queryKey: ["network-requests"] });
      void qc.invalidateQueries({ queryKey: ["network-incoming-requests"] });
      void qc.invalidateQueries({ queryKey: ["network-status-counts"] });
      void qc.invalidateQueries({ queryKey: ["crm-events-home"] });
      void qc.invalidateQueries({ queryKey: ["my-notifications"] });
      void qc.invalidateQueries({ queryKey: ["member-notifications"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["member-app"] });
    };

    const shouldShowToast = (keys: (string | undefined | null)[]): boolean => {
      const now = Date.now();
      const validKeys = keys.filter(Boolean) as string[];
      for (const k of validKeys) {
        const prev = globalRecentToastKeys.get(k);
        if (prev && now - prev < 8000) {
          return false;
        }
      }
      for (const k of validKeys) {
        globalRecentToastKeys.set(k, now);
      }
      return true;
    };

    // Show Luxury Interactive Toast for Connection Requests
    const showConnectionRequestToast = ({
      title,
      senderName,
      senderCompany,
      senderTitle,
      senderAvatar,
      senderUserId,
      connectionId,
    }: {
      title: string;
      senderName: string;
      senderCompany?: string;
      senderTitle?: string;
      senderAvatar?: string;
      senderUserId?: string;
      connectionId?: string;
    }) => {
      const dedupeKeys = [
        connectionId ? `conn_req:${connectionId}` : null,
        senderUserId ? `conn_req_user:${senderUserId}` : null,
      ];
      if (!shouldShowToast(dedupeKeys)) return;

      playNotificationSound();
      sendExternalNotification(title, {
        body: `${senderName}: Đã gửi lời mời kết nối thành viên VIP`,
        tag: dedupeKeys[0] || undefined,
        type: "notification",
        url: "/connect-app/network/requests",
      });

      toast.custom(
        (toastId) => (
          <div className="w-full max-w-sm rounded-2xl border border-[#D8B282]/50 bg-[#0F1420]/95 p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(216,178,130,0.15)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#E8C986]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#E8C986] animate-pulse" />
                <span>{title}</span>
              </div>
              <button
                type="button"
                onClick={() => toast.dismiss(toastId)}
                className="text-white/40 hover:text-white text-xs px-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              {senderAvatar ? (
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D8B282]/60 shadow-md shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C261E] to-[#16130F] border border-[#D8B282]/60 flex items-center justify-center text-[#E8C986] font-bold text-base shadow-md shrink-0">
                  {senderName ? senderName.charAt(0).toUpperCase() : "V"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-white truncate">{senderName}</p>
                {(senderTitle || senderCompany) && (
                  <p className="text-xs text-[#9DA3AE] truncate mt-0.5">
                    {senderTitle ? `${senderTitle} · ` : ""}
                    {senderCompany || ""}
                  </p>
                )}
                <p className="text-[11px] text-[#D8B282]/90 mt-0.5 font-medium">
                  Đã gửi lời mời kết bạn với bạn
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t border-white/10">
              {connectionId && (
                <button
                  type="button"
                  onClick={async () => {
                    toast.dismiss(toastId);
                    try {
                      await GlobalNetworkSDK.mutations.accept(connectionId);
                      invalidateEverything();
                      toast.success(`Đã kết nối thành công với ${senderName}!`, {
                        description: "Bạn có thể trò chuyện và trao đổi cơ hội kinh doanh ngay.",
                      });
                    } catch {
                      toast.error("Không thể hoàn tất kết nối. Vui lòng thử lại sau.");
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#F7D896] via-[#E2B755] to-[#C49338] text-slate-950 hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ✓ Đồng ý
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  toast.dismiss(toastId);
                  if (typeof window !== "undefined") {
                    if (senderUserId) {
                      window.location.href = `/connect-app/network/u:${senderUserId}`;
                    } else {
                      window.location.href = "/connect-app/network/requests";
                    }
                  }
                }}
                className="flex-1 py-2 px-3 rounded-full font-semibold text-xs border border-[#D8B282]/40 bg-white/5 hover:bg-white/10 text-[#E8C986] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                🔍 Xem chi tiết
              </button>

              {connectionId && (
                <button
                  type="button"
                  onClick={async () => {
                    toast.dismiss(toastId);
                    try {
                      await GlobalNetworkSDK.mutations.decline(connectionId);
                      invalidateEverything();
                      toast.info("Đã từ chối lời mời kết nối.");
                    } catch {
                      // ignore
                    }
                  }}
                  className="py-2 px-2.5 rounded-full font-medium text-xs text-[#8A8D91] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Từ chối
                </button>
              )}
            </div>
          </div>
        ),
        { duration: 10000 },
      );
    };

    const handleConnectionAccepted = (data: any) => {
      invalidateEverything();
      const connectionId = data?.connectionId || data?.sourceRecordId;
      const dedupeKeys = [connectionId ? `conn_acc:${connectionId}` : null];
      if (!shouldShowToast(dedupeKeys)) return;

      playNotificationSound();
      const name =
        data?.accepterProfile?.display_name ||
        data?.safeDisplayData?.counterpartDisplayName ||
        data?.actorDisplayName ||
        "Đối tác";

      sendExternalNotification(`${name} đã xác nhận kết bạn`, {
        body: `${name} đã đồng ý lời mời kết bạn của bạn.`,
        tag: `conn_acc_${connectionId}`,
        type: "notification",
        url: "/association/messages",
      });

      toast.success(`${name} đã xác nhận kết bạn`, {
        description: `${name} đã đồng ý lời mời kết bạn của bạn.`,
        action: {
          label: "Xem hồ sơ",
          onClick: () => {
            if (typeof window !== "undefined") {
              const uId =
                data?.accepterUserId ||
                data?.actorUserId ||
                data?.safeDisplayData?.counterpartUserId;
              if (uId) {
                window.location.href = `/connect-app/network/u:${uId}`;
              } else {
                window.location.href = "/connect-app/network";
              }
            }
          },
        },
        duration: 8000,
      });
    };

    const handleConnectionDeclined = (data: any) => {
      invalidateEverything();
      const connectionId = data?.connectionId || data?.sourceRecordId;
      const dedupeKeys = [connectionId ? `conn_dec:${connectionId}` : null];
      if (!shouldShowToast(dedupeKeys)) return;

      const name =
        data?.declinerProfile?.display_name ||
        data?.safeDisplayData?.counterpartDisplayName ||
        data?.actorDisplayName ||
        "Người dùng";

      toast.info(`${name} đã từ chối lời mời kết bạn`, {
        description: `${name} đã từ chối lời mời kết bạn.`,
        duration: 6000,
      });
    };

    const handleNewNotification = (notif: any) => {
      invalidateEverything();

      const eventKind = notif?.eventKind || notif?.notificationKind || notif?.type;

      if (eventKind === "connection_request_accepted") {
        handleConnectionAccepted(notif);
        return;
      }

      if (eventKind === "connection_request_declined") {
        handleConnectionDeclined(notif);
        return;
      }

      const isConnectionRequest =
        eventKind === "connection_request_received" ||
        eventKind === "connection_request" ||
        notif?.titleKey === "connection_request_received";

      const senderName =
        notif?.safeDisplayData?.counterpartDisplayName ||
        notif?.actorDisplayName ||
        "Hội viên CEO 1983";
      const senderCompany = notif?.safeDisplayData?.companyName || notif?.actorCompanyName;
      const senderTitle = notif?.safeDisplayData?.jobTitle || notif?.actorJobTitle;
      const senderAvatar = notif?.safeDisplayData?.avatarUrl || notif?.actorAvatarUrl;
      const connectionId = notif?.sourceRecordId || notif?.connectionId;
      const senderUserId = notif?.safeDisplayData?.counterpartUserId || notif?.actorUserId;

      if (isConnectionRequest) {
        showConnectionRequestToast({
          title: "📱 Lời mời kết nối mới",
          senderName,
          senderCompany,
          senderTitle,
          senderAvatar,
          senderUserId,
          connectionId,
        });
        return;
      }

      const notifId = notif?.id || notif?.sourceRecordId;
      if (!shouldShowToast([notifId ? `notif:${notifId}` : null])) return;

      playNotificationSound();
      const title = notif?.safeDisplayData?.title || "Bạn có thông báo mới";
      const desc = notif?.safeDisplayData?.body || notif?.safeDisplayData?.companyName;

      const notifCategory = notif?.category || notif?.type;
      const isOpp =
        notifCategory === "opportunity" ||
        notifCategory === "b2b" ||
        notif?.action?.targetRoute?.includes("opportunities");

      sendExternalNotification(title, {
        body: desc,
        tag: `notif-${notifId}`,
        type: isOpp ? "opportunity" : "notification",
        url: notif?.action?.targetRoute || "/association",
      });

      toast.info(title, {
        description: desc,
        action: {
          label: "Xem ngay",
          onClick: () => {
            if (typeof window !== "undefined") {
              const route = notif?.action?.targetRoute || "/connect-app/notifications";
              window.location.href = route;
            }
          },
        },
        duration: 8000,
      });
    };

    const handleNfcTapped = (data: any) => {
      invalidateEverything();
      const name = data?.requesterProfile?.display_name || "Hội viên CEO 1983";
      const company = data?.requesterProfile?.company_name;
      const title = data?.requesterProfile?.professional_title;
      const avatar = data?.requesterProfile?.avatar_url;
      const connectionId = data?.connectionId;
      const senderUserId = data?.requesterProfile?.id || data?.requesterUserId;

      showConnectionRequestToast({
        title: "⚡ Quét QR / Chạm danh thiếp VIP",
        senderName: name,
        senderCompany: company,
        senderTitle: title,
        senderAvatar: avatar,
        senderUserId,
        connectionId,
      });
    };

    const handleConnectionRequested = (data: any) => {
      invalidateEverything();
      const name = data?.requesterProfile?.display_name || "Hội viên CEO 1983";
      const company = data?.requesterProfile?.company_name;
      const title = data?.requesterProfile?.professional_title;
      const avatar = data?.requesterProfile?.avatar_url;
      const connectionId = data?.connectionId;
      const senderUserId = data?.requesterProfile?.id || data?.requesterUserId;

      showConnectionRequestToast({
        title: "📱 Lời mời kết nối mới",
        senderName: name,
        senderCompany: company,
        senderTitle: title,
        senderAvatar: avatar,
        senderUserId,
        connectionId,
      });
    };

    const handleConnectionCancelled = (_data: any) => {
      invalidateEverything();
    };

    const handleNotificationUpdated = (_data: any) => {
      invalidateEverything();
    };

    const handleNotificationDeleted = (_data: any) => {
      invalidateEverything();
    };

    const handleUnreadCount = (data: { unreadCount?: number; count?: number }) => {
      const count =
        typeof data?.unreadCount === "number"
          ? data.unreadCount
          : typeof data?.count === "number"
            ? data.count
            : 0;
      qc.setQueryData(notificationKeys.unreadCount(), { count });
      if (viewerUserId) {
        qc.setQueryData(bcMobileHomeKeys.home(viewerUserId), (old: any) => {
          if (!old) return old;
          return { ...old, unreadNotificationCount: count };
        });
      }
      if (count === 0) {
        try {
          localStorage.setItem("vba.notif.lastSeenAt", String(Date.now()));
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("notifications-seen"));
      }
      invalidateEverything();
    };

    const handleDmReceived = (data: any) => {
      invalidateEverything();
      const msg = data?.message || data;
      const threadId = data?.threadId || msg?.threadId;
      const senderUserId = msg?.senderUserId || msg?.sender_id || msg?.fromUserId;
      if (senderUserId && viewerUserId && String(senderUserId) === String(viewerUserId)) {
        return;
      }
      const senderName =
        msg?.senderName || data?.threadSummary?.otherUserName || msg?.actorDisplayName || "Đối tác";
      const rawBody = msg?.body || msg?.text || msg?.content || "";
      if (!rawBody && !msg?.attachments?.length) return;

      const dedupeKey = `dm_msg:${msg?.id || threadId || Date.now()}`;
      if (!shouldShowToast([dedupeKey])) return;

      playNotificationSound();

      if (typeof rawBody === "string" && rawBody.startsWith("[B2B_CONNECT_INVITE]")) {
        const title = `🤝 Thư mời gặp mặt B2B từ ${senderName}`;
        const bodyText = "Mời bạn tham gia cuộc gặp trao đổi hợp tác kinh doanh B2B";
        toast.info(title, {
          description: bodyText,
          action: {
            label: "Xem ngay",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = `/association/messages${threadId ? `?thread=${threadId}` : ""}`;
              }
            },
          },
          duration: 8000,
        });
        sendExternalNotification(title, {
          body: bodyText,
          tag: `meeting-${threadId || Date.now()}`,
          type: "meeting",
          url: `/association/messages${threadId ? `?thread=${threadId}` : ""}`,
        });
        return;
      }

      if (typeof rawBody === "string" && rawBody.startsWith("[call:")) {
        const title = `📞 Cuộc gọi từ ${senderName}`;
        const bodyText = "Cuộc gọi thoại / video trực tiếp giữa 2 hội viên";
        sendExternalNotification(title, {
          body: bodyText,
          tag: `call-log-${threadId || Date.now()}`,
          type: "call",
          url: `/association/messages${threadId ? `?thread=${threadId}` : ""}`,
        });
        return;
      }

      const title = `💬 ${senderName}`;
      const bodyText = rawBody.length > 120 ? rawBody.slice(0, 120) + "..." : rawBody;
      toast.info(title, {
        description: bodyText,
        action: {
          label: "Trả lời",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = `/association/messages${threadId ? `?thread=${threadId}` : ""}`;
            }
          },
        },
        duration: 6000,
      });
      sendExternalNotification(title, {
        body: bodyText,
        tag: `dm-${threadId || Date.now()}`,
        type: "message",
        url: `/association/messages${threadId ? `?thread=${threadId}` : ""}`,
      });
    };

    const handleMeetingRequested = (data: any) => {
      invalidateEverything();
      const reqProfile = data?.requesterProfile;
      const meeting = data?.meeting;
      const name = reqProfile?.display_name || reqProfile?.name || "Hội viên";
      const title = `🤝 Lịch hẹn / Cuộc gặp mới từ ${name}`;
      const body =
        meeting?.title || meeting?.purpose || "Mời bạn tham gia cuộc gặp trao đổi kết nối B2B";

      playNotificationSound();
      toast.info(title, {
        description: body,
        action: {
          label: "Chi tiết",
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = "/association/messages";
          },
        },
        duration: 8000,
      });
      sendExternalNotification(title, {
        body,
        tag: `meeting-req-${meeting?.id || Date.now()}`,
        type: "meeting",
        url: "/association/messages",
      });
    };

    const handleMeetingResponded = (data: any) => {
      invalidateEverything();
      const resProfile = data?.responderProfile;
      const status = data?.status;
      const name = resProfile?.display_name || resProfile?.name || "Đối tác";
      const title = `🤝 Phản hồi cuộc hẹn từ ${name}`;
      const body =
        status === "confirmed" ? "Đã đồng ý cuộc hẹn gặp với bạn" : "Đã từ chối lời mời gặp";

      playNotificationSound();
      toast.info(title, {
        description: body,
        duration: 7000,
      });
      sendExternalNotification(title, {
        body,
        tag: `meeting-res-${Date.now()}`,
        type: "meeting",
        url: "/association/messages",
      });
    };

    const handleOpportunityCreated = (data: any) => {
      invalidateEverything();
      const opp = data?.opportunity || data;
      const authorName = opp?.authorName || opp?.creatorName || opp?.memberName || "Hội viên";
      const oppTitle = opp?.title || "Cơ hội giao thương mới";
      const title = `✨ Cơ hội hợp tác mới từ ${authorName}`;
      const bodyText = oppTitle.length > 120 ? oppTitle.slice(0, 120) + "..." : oppTitle;

      playNotificationSound();
      toast.info(title, {
        description: bodyText,
        action: {
          label: "Xem ngay",
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = `/opportunities`;
          },
        },
        duration: 8000,
      });
      sendExternalNotification(title, {
        body: bodyText,
        tag: `opp-${opp?.id || Date.now()}`,
        type: "opportunity",
        url: `/opportunities`,
      });
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:updated", handleNotificationUpdated);
    socket.on("notification:deleted", handleNotificationDeleted);
    socket.on("notification:unread_count", handleUnreadCount);
    socket.on("notification:count", handleUnreadCount);
    socket.on("nfc:tapped", handleNfcTapped);
    socket.on("connection:requested", handleConnectionRequested);
    socket.on("connection:accepted", handleConnectionAccepted);
    socket.on("connection:declined", handleConnectionDeclined);
    socket.on("connection:cancelled", handleConnectionCancelled);
    socket.on("dm:thread_updated", handleDmReceived);
    socket.on("dm:message_received", handleDmReceived);
    socket.on("member:message_received", handleDmReceived);
    socket.on("meeting:requested", handleMeetingRequested);
    socket.on("meeting:responded", handleMeetingResponded);
    socket.on("opportunity:created", handleOpportunityCreated);
    socket.on("opportunity:new", handleOpportunityCreated);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:updated", handleNotificationUpdated);
      socket.off("notification:deleted", handleNotificationDeleted);
      socket.off("notification:unread_count", handleUnreadCount);
      socket.off("notification:count", handleUnreadCount);
      socket.off("nfc:tapped", handleNfcTapped);
      socket.off("connection:requested", handleConnectionRequested);
      socket.off("connection:accepted", handleConnectionAccepted);
      socket.off("connection:declined", handleConnectionDeclined);
      socket.off("connection:cancelled", handleConnectionCancelled);
      socket.off("dm:thread_updated", handleDmReceived);
      socket.off("dm:message_received", handleDmReceived);
      socket.off("member:message_received", handleDmReceived);
      socket.off("meeting:requested", handleMeetingRequested);
      socket.off("meeting:responded", handleMeetingResponded);
      socket.off("opportunity:created", handleOpportunityCreated);
      socket.off("opportunity:new", handleOpportunityCreated);
    };
  }, [socket, viewerUserId, qc]);
}
