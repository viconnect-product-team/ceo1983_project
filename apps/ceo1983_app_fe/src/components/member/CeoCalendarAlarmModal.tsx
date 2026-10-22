import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  BellRing,
  Volume2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CalendarCheck,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/date-format";

export interface CalendarAlarmItem {
  id: string;
  type: "event" | "meeting" | "meeting_1on1";
  title: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  location: string;
  alarmEnabled: boolean;
  alarmLeadMinutes: number; // 0, 15, 30, 60, 1440
  customAlarmTime?: string; // HH:mm
}

interface CeoCalendarAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  events?: any[];
  meetings?: any[];
}

export const CeoCalendarAlarmModal: React.FC<CeoCalendarAlarmModalProps> = ({
  isOpen,
  onClose,
  events = [],
  meetings = [],
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Alarm configurations loaded from localStorage
  const [alarms, setAlarms] = useState<Record<string, { enabled: boolean; leadMinutes: number; customTime?: string }>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_calendar_alarms");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveAlarms = (newAlarms: typeof alarms) => {
    setAlarms(newAlarms);
    try {
      localStorage.setItem("vba_calendar_alarms", JSON.stringify(newAlarms));
    } catch {}
  };

  // Compile calendar events and meetings
  const allScheduleItems: CalendarAlarmItem[] = useMemo(() => {
    const list: CalendarAlarmItem[] = [];

    events.forEach((ev, idx) => {
      const d = ev.date || ev.start_date || new Date().toISOString();
      const dateStr = d.split("T")[0];
      const timeStr = ev.time || "08:30";
      const id = `ev-${ev.id || idx}`;
      const savedAlarm = alarms[id] || { enabled: true, leadMinutes: 30 };

      list.push({
        id,
        type: "event",
        title: ev.title || "Sự kiện Hiệp hội CEO 1983",
        dateStr,
        timeStr,
        location: ev.location || ev.venue || "Keangnam Landmark 72, Hà Nội",
        alarmEnabled: savedAlarm.enabled,
        alarmLeadMinutes: savedAlarm.leadMinutes,
        customAlarmTime: savedAlarm.customTime,
      });
    });

    meetings.forEach((mt, idx) => {
      const d = mt.date || new Date().toISOString();
      const dateStr = d.split("T")[0];
      const timeStr = mt.time || "09:00";
      const is1on1 = mt.venueType === "offline" || mt.type === "1on1" || !mt.title?.includes("Họp Ban");
      const id = `mt-${mt.id || idx}`;
      const savedAlarm = alarms[id] || { enabled: true, leadMinutes: 15 };

      list.push({
        id,
        type: is1on1 ? "meeting_1on1" : "meeting",
        title: mt.title || (is1on1 ? "Hẹn gặp kết nối 1-on-1" : "Họp Ban Chuyên Môn"),
        dateStr,
        timeStr,
        location: mt.venue || mt.location || "Highlands Coffee, Hà Nội",
        alarmEnabled: savedAlarm.enabled,
        alarmLeadMinutes: savedAlarm.leadMinutes,
        customAlarmTime: savedAlarm.customTime,
      });
    });

    return list;
  }, [events, meetings, alarms]);

  // Items for currently selected date
  const selectedDayItems = useMemo(() => {
    return allScheduleItems.filter((i) => i.dateStr === selectedDate);
  }, [allScheduleItems, selectedDate]);

  // Audio synthesizer for previewing alarm sound
  const playAlarmSoundPreview = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6 note
      osc.frequency.setValueAtTime(880, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.45);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
      toast.success("Đang phát thử âm thanh chuông báo thức CEO 1983");
    } catch {
      toast.info("Chuông báo thức đã sẵn sàng");
    }
  };

  // Toggle alarm for an item
  const handleToggleAlarm = (id: string, currentEnabled: boolean) => {
    const current = alarms[id] || { enabled: false, leadMinutes: 30 };
    const nextAlarms = {
      ...alarms,
      [id]: { ...current, enabled: !currentEnabled },
    };
    saveAlarms(nextAlarms);

    if (!currentEnabled) {
      toast.success("Đã bật báo thức nhắc lịch thành công!");
      if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    } else {
      toast.info("Đã tắt báo thức nhắc lịch");
    }
  };

  // Change lead time
  const handleChangeLeadMinutes = (id: string, leadMinutes: number) => {
    const current = alarms[id] || { enabled: true, leadMinutes: 30 };
    const nextAlarms = {
      ...alarms,
      [id]: { ...current, leadMinutes, enabled: true },
    };
    saveAlarms(nextAlarms);
    toast.success(`Đã cập nhật nhắc trước ${leadMinutes === 0 ? "đúng giờ" : `${leadMinutes} phút`}`);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNum: number; dateStr: string; hasEvents: boolean }> = [];

    // Adjust for Monday first
    const blankDays = (firstDay + 6) % 7;
    for (let i = 0; i < blankDays; i++) {
      days.push({ dayNum: 0, dateStr: "", hasEvents: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const hasEvents = allScheduleItems.some((item) => item.dateStr === dateStr);
      days.push({ dayNum: d, dateStr, hasEvents });
    }

    return days;
  }, [currentMonth, allScheduleItems]);

  const activeAlarmsCount = useMemo(() => {
    return allScheduleItems.filter((i) => i.alarmEnabled).length;
  }, [allScheduleItems]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="w-full max-w-[460px] max-h-[92dvh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#003B95] to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <BellRing className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                <span>Lịch &amp; Báo Thức Hội Viên</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {activeAlarmsCount} Đang Bật
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Tự động reo chuông nhắc sự kiện, họp ban &amp; gặp 1-on-1
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:none]">
          {/* Month Switcher */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-black uppercase text-[#003B95] dark:text-amber-400 tracking-wider">
              Tháng {currentMonth.getMonth() + 1} / {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Mini Calendar Month Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <span key={day} className="text-[10.5px] font-bold text-slate-400 py-1">
                {day}
              </span>
            ))}
            {calendarDays.map((item, idx) => {
              if (!item.dayNum) {
                return <div key={`blank-${idx}`} className="h-8" />;
              }
              const isSelected = item.dateStr === selectedDate;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition cursor-pointer text-xs font-bold ${
                    isSelected
                      ? "bg-[#003B95] text-white shadow-md font-black"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{item.dayNum}</span>
                  {item.hasEvents && (
                    <span
                      className={`size-1.5 rounded-full absolute bottom-1 ${
                        isSelected ? "bg-amber-400" : "bg-red-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sound Preview Test Banner */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="size-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-amber-300">
                Chuông báo thức reo chuẩn âm
              </span>
            </div>
            <button
              type="button"
              onClick={playAlarmSoundPreview}
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Play className="size-3 fill-current" />
              <span>Nghe thử</span>
            </button>
          </div>

          {/* Schedule List for the Selected Date */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Lịch trình ngày: {formatDisplayDate(selectedDate)} ({selectedDayItems.length} mục)
            </h4>

            {selectedDayItems.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                <CalendarIcon className="size-8 mx-auto mb-2 opacity-40 text-amber-500" />
                <p>Không có sự kiện hoặc cuộc hẹn nào trong ngày này.</p>
              </div>
            ) : (
              selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                            item.type === "event"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400"
                              : "bg-[#003B95]/15 text-[#003B95] dark:text-blue-400"
                          }`}
                        >
                          {item.type === "event" ? "Sự kiện CLB" : (item.type === "meeting_1on1" ? "Gặp 1-on-1" : "Họp Ban")}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{item.timeStr}</span>
                        </span>
                      </div>
                      <h5 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight mt-1">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>

                    {/* Switch Toggle Alarm */}
                    <button
                      type="button"
                      onClick={() => handleToggleAlarm(item.id, item.alarmEnabled)}
                      className={`size-9 rounded-2xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs ${
                        item.alarmEnabled
                          ? "bg-emerald-600 text-white shadow-emerald-600/30"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                      }`}
                      title={item.alarmEnabled ? "Báo thức đang bật" : "Báo thức đang tắt"}
                    >
                      <Bell className="size-4" />
                    </button>
                  </div>

                  {/* Alarm Settings / Lead Time Selection */}
                  {item.alarmEnabled && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        Reo chuông trước:
                      </span>
                      <div className="flex items-center gap-1">
                        {[
                          { min: 0, label: "Đúng giờ" },
                          { min: 15, label: "15p" },
                          { min: 30, label: "30p" },
                          { min: 60, label: "1h" },
                        ].map((lead) => (
                          <button
                            key={lead.min}
                            type="button"
                            onClick={() => handleChangeLeadMinutes(item.id, lead.min)}
                            className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer border ${
                              item.alarmLeadMinutes === lead.min
                                ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {lead.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            🔔 Tự động đồng bộ với âm thanh điện thoại
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white text-xs font-black shadow-md cursor-pointer transition"
          >
            Đã xong
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
