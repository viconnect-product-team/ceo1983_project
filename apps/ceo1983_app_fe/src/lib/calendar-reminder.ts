/**
 * Hệ Thống Quản Lý Lịch & Báo Thức Nhắc Hẹn CLB CEO 1983
 * - Tự động lưu sự kiện, khóa đào tạo, cuộc họp khi đăng ký
 * - Nhắc lịch ngày mới tự động lúc 07:00 sáng hàng ngày
 * - Nhắc nhở từng sự kiện theo thời gian tùy chỉnh (đúng giờ, trước 15p, 30p, 60p, custom)
 * - Thông báo giao diện nổi Facebook Pop-up + Âm thanh chuông báo A5/A6
 */

export interface CalendarReminderItem {
  id: string; // e.g. "ev-1", "training-2", "mt-3"
  sourceType: "event" | "training" | "meeting" | "custom";
  title: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  location: string;
  details?: string;
  alarmEnabled: boolean;
  alarmLeadMinutes: number; // 0 (đúng giờ), 15 (trước 15p), 30, 60
  customAlarmTime?: string; // HH:mm
  lastNotifiedAt?: string;
  createdAt?: string;
}

const STORAGE_CALENDAR_ITEMS = "vba_user_calendar_items";
const STORAGE_MORNING_DIGEST = "vba_calendar_morning_digest";
const STORAGE_ALARM_SETTINGS = "vba_calendar_alarms";

// Phát âm thanh chuông báo thức chuẩn A5 / A6
export function playCeoAlarmChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Nốt A5 (880Hz) trượt lên A6 (1760Hz) tạo âm thanh chuông sang trọng
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
    osc.frequency.setValueAtTime(880, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.45);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (err) {
    console.debug("AudioContext prevented auto-play chime", err);
  }
}

// Lấy danh sách toàn bộ mục trong Lịch
export function getSavedCalendarItems(): CalendarReminderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CALENDAR_ITEMS);
    if (!raw) return getDefaultSeedCalendarItems();
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : getDefaultSeedCalendarItems();
  } catch {
    return getDefaultSeedCalendarItems();
  }
}

// Thêm / Cập nhật mục vào Lịch
export function saveCalendarItem(
  item: Omit<CalendarReminderItem, "id"> & { id?: string },
): CalendarReminderItem {
  const currentList = getSavedCalendarItems();
  const id = item.id || `cal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newItem: CalendarReminderItem = {
    ...item,
    id,
    alarmEnabled: item.alarmEnabled ?? true,
    alarmLeadMinutes: item.alarmLeadMinutes ?? 30,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const existingIdx = currentList.findIndex((i) => i.id === id);
  let updatedList: CalendarReminderItem[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = newItem;
  } else {
    updatedList = [newItem, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_CALENDAR_ITEMS, JSON.stringify(updatedList));
    // Đồng bộ vào vba_calendar_alarms cho tương thích ngược
    const rawAlarms = localStorage.getItem(STORAGE_ALARM_SETTINGS);
    const alarms = rawAlarms ? JSON.parse(rawAlarms) : {};
    alarms[id] = {
      enabled: newItem.alarmEnabled,
      leadMinutes: newItem.alarmLeadMinutes,
      customTime: newItem.customAlarmTime,
    };
    localStorage.setItem(STORAGE_ALARM_SETTINGS, JSON.stringify(alarms));

    window.dispatchEvent(new CustomEvent("vba_calendar_updated", { detail: newItem }));
  } catch {}

  return newItem;
}

// Xóa mục khỏi lịch
export function removeCalendarItem(id: string): void {
  const currentList = getSavedCalendarItems();
  const updatedList = currentList.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_CALENDAR_ITEMS, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent("vba_calendar_updated", { detail: { id, deleted: true } }));
  } catch {}
}

// Cập nhật cài đặt báo thức cho 1 mục
export function updateCalendarAlarm(
  id: string,
  updates: Partial<CalendarReminderItem>,
): void {
  const currentList = getSavedCalendarItems();
  const idx = currentList.findIndex((i) => i.id === id);
  if (idx < 0) return;

  currentList[idx] = { ...currentList[idx], ...updates };
  try {
    localStorage.setItem(STORAGE_CALENDAR_ITEMS, JSON.stringify(currentList));
    window.dispatchEvent(new CustomEvent("vba_calendar_updated", { detail: currentList[idx] }));
  } catch {}
}

// Cấu hình nhắc lịch sáng (Morning Digest 7:00 AM)
export function getMorningDigestSettings(): {
  enabled: boolean;
  hour: number;
  minute: number;
  lastDigestDate: string;
} {
  const def = { enabled: true, hour: 7, minute: 0, lastDigestDate: "" };
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(STORAGE_MORNING_DIGEST);
    return raw ? { ...def, ...JSON.parse(raw) } : def;
  } catch {
    return def;
  }
}

export function saveMorningDigestSettings(settings: {
  enabled?: boolean;
  hour?: number;
  minute?: number;
  lastDigestDate?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    const current = getMorningDigestSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_MORNING_DIGEST, JSON.stringify(updated));
  } catch {}
}

// Mock seed data ban đầu nếu chưa có lịch nào
function getDefaultSeedCalendarItems(): CalendarReminderItem[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return [
    {
      id: "ev-seed-1",
      sourceType: "event",
      title: "Gala Giao Thương Doanh Nhân CEO 1983 - Kết Nối B2B Quý 4",
      dateStr: todayStr,
      timeStr: "08:30",
      location: "Khách sạn Grand Plaza Hà Nội, 117 Trần Duy Hưng",
      details: "Gặp gỡ 150+ chủ doanh nghiệp, ký kết biên bản ghi nhớ hợp tác thương mại",
      alarmEnabled: true,
      alarmLeadMinutes: 30,
    },
    {
      id: "meeting-seed-1",
      sourceType: "meeting",
      title: "Họp Ban Điều Hành & Ban Thư Ký CLB CEO 1983",
      dateStr: todayStr,
      timeStr: "14:00",
      location: "Tầng 12A, Keangnam Landmark 72, Hà Nội",
      details: "Đánh giá KPI tháng và phê duyệt quy chế hoạt động hội viên mới",
      alarmEnabled: true,
      alarmLeadMinutes: 15,
    },
    {
      id: "training-seed-1",
      sourceType: "training",
      title: "Chương Trình Đào Tạo: Quản Trị Tài Chính & Tối Ưu Chi Phí DN 2026",
      dateStr: tomorrowStr,
      timeStr: "09:00",
      location: "Hội trường VCCI, Số 9 Đào Duy Anh, Đống Đa, Hà Nội",
      details: "Chuyên gia đầu ngành chia sẻ về cấu trúc dòng tiền và giải pháp tài chính số",
      alarmEnabled: true,
      alarmLeadMinutes: 60,
    },
  ];
}

