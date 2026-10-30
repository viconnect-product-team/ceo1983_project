import { useEffect, useState, useCallback, useRef } from "react";
import {
  CalendarReminderItem,
  getMorningDigestSettings,
  getSavedCalendarItems,
  saveMorningDigestSettings,
  updateCalendarAlarm,
} from "@/lib/calendar-reminder";
import type { ActiveReminderNotice } from "@/components/calendar/CeoFacebookReminderBanner";

export function useCalendarNotifications() {
  const [activeNotice, setActiveNotice] = useState<ActiveReminderNotice | null>(null);
  const snoozeUntilRef = useRef<number>(0);

  const checkReminders = useCallback(() => {
    // Nếu đang trong thời gian snooze thì hoãn
    if (Date.now() < snoozeUntilRef.current) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const allItems = getSavedCalendarItems();
    const todayItems = allItems.filter((i) => i.dateStr === todayStr);

    // ── 1. KIỂM TRA NHẮC LỊCH 7:00 SÁNG HÀNG NGÀY (MORNING DIGEST) ──
    const digestSettings = getMorningDigestSettings();
    if (digestSettings.enabled) {
      const isPast7AM = currentHour > 7 || (currentHour === 7 && currentMinute >= 0);
      if (isPast7AM && digestSettings.lastDigestDate !== todayStr) {
        if (todayItems.length > 0) {
          setActiveNotice({
            id: `digest-${todayStr}`,
            type: "morning_digest",
            title: `Chào buổi sáng CEO 1983! Hôm nay bạn có ${todayItems.length} lịch trình`,
            subtitle: "Hệ thống tự động nhắc lịch ngày mới lúc 7:00 sáng để bạn chủ động sắp xếp công việc và gặp gỡ.",
            items: todayItems,
            triggeredAt: now.toISOString(),
          });
          saveMorningDigestSettings({ lastDigestDate: todayStr });
          return;
        } else {
          // Dù không có lịch cũng ghi nhận đã check hôm nay để tránh chạy lặp
          saveMorningDigestSettings({ lastDigestDate: todayStr });
        }
      }
    }

    // ── 2. KIỂM TRA LỜI NHẮC RIÊNG TỪNG LỊCH TRÌNH (SPECIFIC REMINDERS) ──
    for (const item of todayItems) {
      if (!item.alarmEnabled) continue;

      const [itemHour, itemMin] = item.timeStr.split(":").map(Number);
      if (isNaN(itemHour) || isNaN(itemMin)) continue;

      const itemTotalMinutes = itemHour * 60 + itemMin;
      const triggerTimeMinutes = itemTotalMinutes - (item.alarmLeadMinutes || 0);

      // Điều kiện kích hoạt: trong cửa sổ 5 phút từ triggerTimeMinutes
      const diffMinutes = currentTotalMinutes - triggerTimeMinutes;
      const isInTriggerWindow = diffMinutes >= 0 && diffMinutes <= 5;

      // Tránh thông báo lặp nếu đã báo trong 30 phút qua
      const lastNotified = item.lastNotifiedAt ? new Date(item.lastNotifiedAt).getTime() : 0;
      const alreadyNotifiedRecently = Date.now() - lastNotified < 30 * 60 * 1000;

      if (isInTriggerWindow && !alreadyNotifiedRecently) {
        const leadText =
          item.alarmLeadMinutes === 0
            ? "bắt đầu ngay bây giờ"
            : `sẽ diễn ra sau ${item.alarmLeadMinutes} phút nữa`;

        setActiveNotice({
          id: `alarm-${item.id}-${Date.now()}`,
          type: "event_alarm",
          title: `Nhắc hẹn: ${item.title}`,
          subtitle: `Lịch trình của bạn tại CEO 1983 ${leadText}. Vui lòng chuẩn bị tham dự!`,
          items: [item],
          triggeredAt: now.toISOString(),
        });

        // Ghi nhận thời gian đã thông báo
        updateCalendarAlarm(item.id, { lastNotifiedAt: now.toISOString() });
        break;
      }
    }
  }, []);

  // Lắng nghe sự kiện thêm lịch mới để check tức thì
  useEffect(() => {
    const handleUpdate = () => {
      checkReminders();
    };
    window.addEventListener("vba_calendar_updated", handleUpdate);
    return () => window.removeEventListener("vba_calendar_updated", handleUpdate);
  }, [checkReminders]);

  // Kiểm tra định kỳ mỗi 20 giây
  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 20_000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const dismissNotice = useCallback(() => {
    setActiveNotice(null);
  }, []);

  const snoozeNotice = useCallback((minutes: number = 15) => {
    snoozeUntilRef.current = Date.now() + minutes * 60 * 1000;
    setActiveNotice(null);
  }, []);

  return {
    activeNotice,
    dismissNotice,
    snoozeNotice,
  };
}

