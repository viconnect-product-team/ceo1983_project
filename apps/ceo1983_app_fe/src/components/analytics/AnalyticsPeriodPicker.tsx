import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  History,
  Check,
  CalendarDays,
} from "lucide-react";

export type PeriodGranularity = "month" | "quarter" | "year";

export interface AnalyticsPeriodPickerProps {
  granularity: PeriodGranularity;
  onGranularityChange: (g: PeriodGranularity) => void;
  selectedYear: number;
  onYearChange: (y: number) => void;
  selectedMonth: number; // 1 - 12
  onMonthChange: (m: number) => void;
  selectedQuarter: number; // 1 - 4
  onQuarterChange: (q: number) => void;
  isCompact?: boolean;
  themeColor?: string;
  className?: string;
}

export function AnalyticsPeriodPicker({
  granularity,
  onGranularityChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  selectedQuarter,
  onQuarterChange,
  isCompact = false,
  themeColor = "#003B95",
  className = "",
}: AnalyticsPeriodPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);

  // Kiểm tra xem người dùng có đang xem kỳ lịch sử hay không
  const isHistorical = useMemo(() => {
    if (granularity === "year") return selectedYear !== currentYear;
    if (granularity === "quarter") return selectedYear !== currentYear || selectedQuarter !== currentQuarter;
    return selectedYear !== currentYear || selectedMonth !== currentMonth;
  }, [granularity, selectedYear, selectedMonth, selectedQuarter, currentYear, currentMonth, currentQuarter]);

  // Nhãn hiển thị kỳ hiện tại
  const periodLabel = useMemo(() => {
    if (granularity === "year") return `Năm ${selectedYear}`;
    if (granularity === "quarter") return `Quý ${selectedQuarter}/${selectedYear}`;
    return `Tháng ${selectedMonth}/${selectedYear}`;
  }, [granularity, selectedYear, selectedMonth, selectedQuarter]);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Điều hướng kỳ trước
  const handlePrev = () => {
    if (granularity === "month") {
      if (selectedMonth <= 1) {
        onMonthChange(12);
        onYearChange(selectedYear - 1);
      } else {
        onMonthChange(selectedMonth - 1);
      }
    } else if (granularity === "quarter") {
      if (selectedQuarter <= 1) {
        onQuarterChange(4);
        onYearChange(selectedYear - 1);
      } else {
        onQuarterChange(selectedQuarter - 1);
      }
    } else {
      onYearChange(selectedYear - 1);
    }
  };

  // Điều hướng kỳ sau
  const handleNext = () => {
    if (granularity === "month") {
      if (selectedMonth >= 12) {
        onMonthChange(1);
        onYearChange(selectedYear + 1);
      } else {
        onMonthChange(selectedMonth + 1);
      }
    } else if (granularity === "quarter") {
      if (selectedQuarter >= 4) {
        onQuarterChange(1);
        onYearChange(selectedYear + 1);
      } else {
        onQuarterChange(selectedQuarter + 1);
      }
    } else {
      onYearChange(selectedYear + 1);
    }
  };

  // Quay về kỳ hiện tại
  const handleResetToCurrent = () => {
    onYearChange(currentYear);
    onMonthChange(currentMonth);
    onQuarterChange(currentQuarter);
  };

  // Danh sách năm khả dụng để chọn (5 năm gần nhất đến hiện tại + 1 năm tương lai)
  const availableYears = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 4; y <= currentYear + 1; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1.5 flex-nowrap select-none ${className}`}>
      {/* ── BỘ CHỌN LỊCH VÀ ĐIỀU HƯỚNG KỲ LỊCH SỬ (PREV / DROPDOWN / NEXT / RESET) ── */}
      <div className="inline-flex items-center gap-0.5 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
        {/* Nút lùi kỳ trước */}
        <button
          type="button"
          onClick={handlePrev}
          className="size-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Xem kỳ trước đó (Tháng cũ / Quý cũ / Năm cũ)"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Nút mở hộp chọn lịch */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
            isHistorical
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
              : "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          }`}
        >
          <CalendarIcon className={`size-3 ${isHistorical ? "text-amber-600" : "text-slate-500"}`} />
          <span className="whitespace-nowrap">{periodLabel}</span>
          {isHistorical && (
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" title="Đang xem dữ liệu lịch sử" />
          )}
        </button>

        {/* Nút tiến kỳ sau */}
        <button
          type="button"
          onClick={handleNext}
          className="size-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Xem kỳ tiếp theo"
        >
          <ChevronRight className="size-3.5" />
        </button>

        {/* Nút quay về Hiện tại (khi đang xem kỳ cũ) */}
        {isHistorical && (
          <button
            type="button"
            onClick={handleResetToCurrent}
            className="h-7 px-1.5 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-0.5 cursor-pointer"
            title="Quay về kỳ hiện tại"
          >
            <RotateCcw className="size-2.5" />
            <span className="hidden sm:inline">Kỳ này</span>
          </button>
        )}
      </div>

      {/* ── 3 CHẾ ĐỘ XEM CHUẨN: THÁNG / QUÝ / NĂM ── */}
      <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs shrink-0">
        {[
          { id: "month" as const, label: "Tháng", desc: "Xem từng tháng" },
          { id: "quarter" as const, label: "Quý", desc: "Xem 4 quý" },
          { id: "year" as const, label: "Năm", desc: "Xem theo năm" },
        ].map((tab) => {
          const isActive = granularity === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onGranularityChange(tab.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? "text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={isActive ? { backgroundColor: themeColor } : undefined}
              title={tab.desc}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── DROPDOWN POPOVER CHỌN THÁNG CŨ, QUÝ CŨ, NĂM CŨ ── */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-76 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5">
          {/* Header Popover: Chọn năm */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarDays className="size-4 text-[#003B95] dark:text-amber-400" />
              <span>Chọn Lịch Thống Kê</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onYearChange(selectedYear - 1)}
                className="text-slate-500 hover:text-slate-900 text-xs px-1 cursor-pointer"
              >
                ◀
              </button>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{selectedYear}</span>
              <button
                type="button"
                onClick={() => onYearChange(selectedYear + 1)}
                className="text-slate-500 hover:text-slate-900 text-xs px-1 cursor-pointer"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Quick Select Năm */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onYearChange(yr)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedYear === yr
                    ? "bg-[#003B95] text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* DẠNG 1: CHỌN THEO THÁNG (12 THÁNG) */}
          {granularity === "month" && (
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                12 Tháng Trong Năm {selectedYear}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                  const isSelected = selectedMonth === m;
                  const isNowMonth = selectedYear === currentYear && currentMonth === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        onMonthChange(m);
                        setIsOpen(false);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                        isSelected
                          ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                          : isNowMonth
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <span>T{m}</span>
                      {isNowMonth && !isSelected && (
                        <span className="block text-[8px] font-normal text-amber-600">Hiện tại</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG 2: CHỌN THEO QUÝ (4 QUÝ) */}
          {granularity === "quarter" && (
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                4 Quý Tài Khóa Năm {selectedYear}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { q: 1, label: "Quý 1", months: "Tháng 1 - 3" },
                  { q: 2, label: "Quý 2", months: "Tháng 4 - 6" },
                  { q: 3, label: "Quý 3", months: "Tháng 7 - 9" },
                  { q: 4, label: "Quý 4", months: "Tháng 10 - 12" },
                ].map((item) => {
                  const isSelected = selectedQuarter === item.q;
                  const isNowQuarter = selectedYear === currentYear && currentQuarter === item.q;
                  return (
                    <button
                      key={item.q}
                      type="button"
                      onClick={() => {
                        onQuarterChange(item.q);
                        setIsOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left transition cursor-pointer border ${
                        isSelected
                          ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                          : isNowQuarter
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.months}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG 3: CHỌN THEO NĂM */}
          {granularity === "year" && (
            <div className="space-y-1.5">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                Các Năm Tài Khóa CLB CEO 1983
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {availableYears.map((yr) => {
                  const isSelected = selectedYear === yr;
                  const isNowYear = yr === currentYear;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        onYearChange(yr);
                        setIsOpen(false);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                        isSelected
                          ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                          : isNowYear
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <span>{yr}</span>
                      {isNowYear && !isSelected && (
                        <span className="block text-[8px] font-normal text-amber-600">Năm nay</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer: Phím tắt nhanh */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                handleResetToCurrent();
                setIsOpen(false);
              }}
              className="text-[#003B95] dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="size-3" />
              <span>Về kỳ hiện tại</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

