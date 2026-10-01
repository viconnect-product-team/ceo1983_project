import React, { useState, useEffect, useRef } from "react";
import { Calendar, AlertCircle } from "lucide-react";

export interface StandardDateInputProps {
  id?: string;
  name?: string;
  value?: string; // YYYY-MM-DD or DD/MM/YYYY
  onChange: (isoValue: string, displayValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  ariaLabel?: string;
}

/**
 * Checks if year, month, day represent a valid calendar date
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * Parses flexible input strings into ISO (YYYY-MM-DD) and Display (DD/MM/YYYY)
 */
export function parseFlexibleDate(val?: string | null): { iso: string; display: string; isValid: boolean } {
  if (!val) return { iso: "", display: "", isValid: false };
  const trimmed = val.trim();

  // 1. YYYY-MM-DD or ISO timestamp
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (isValidDate(y, m, d)) {
      const iso = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const display = `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y.toString().padStart(4, "0")}`;
      return { iso, display, isValid: true };
    }
  }

  // 2. DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY (Require 4-digit year while typing)
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (isValidDate(y, m, d)) {
      const iso = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const display = `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y.toString().padStart(4, "0")}`;
      return { iso, display, isValid: true };
    }
  }

  // 3. 8 contiguous digits: DDMMYYYY
  const eightMatch = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (eightMatch) {
    const d = parseInt(eightMatch[1], 10);
    const m = parseInt(eightMatch[2], 10);
    const y = parseInt(eightMatch[3], 10);
    if (isValidDate(y, m, d)) {
      const iso = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const display = `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y.toString().padStart(4, "0")}`;
      return { iso, display, isValid: true };
    }
  }

  return { iso: "", display: trimmed, isValid: false };
}

/**
 * Converts ISO date (YYYY-MM-DD) or other formats to DD/MM/YYYY
 */
export function formatToDdmmyyyy(val?: string | null): string {
  return parseFlexibleDate(val).display;
}

/**
 * Converts DD/MM/YYYY to ISO format YYYY-MM-DD
 */
export function formatToIso(val?: string | null): string {
  return parseFlexibleDate(val).iso;
}

/**
 * Formats user input as they type without interfering with manual slashes or backspacing
 */
function formatMaskWhileTyping(input: string, prevVal: string): string {
  // If user deleted a character, allow natural deletion
  if (prevVal && input.length < prevVal.length) {
    if (input.endsWith("/")) {
      return input.slice(0, -1);
    }
    return input;
  }

  // Remove invalid characters (keep digits and slashes only)
  let clean = input.replace(/[^0-9\/]/g, "");
  // Collapse multiple slashes
  clean = clean.replace(/\/+/g, "/");

  // If user typed digits continuously without slashes (e.g. 20101983)
  if (!clean.includes("/") && clean.length > 2) {
    const d = clean.slice(0, 2);
    const m = clean.slice(2, 4);
    const y = clean.slice(4, 8);
    let r = d;
    if (m) r += "/" + m;
    if (y) r += "/" + y;
    return r;
  }

  const parts = clean.split("/");

  // Day part
  let d = parts[0] ? parts[0].slice(0, 2) : "";
  if (d.length === 2 && parseInt(d, 10) > 31) d = "31";

  // Month part
  let m = parts[1] !== undefined ? parts[1].slice(0, 2) : "";
  if (m.length === 2 && parseInt(m, 10) > 12) m = "12";

  // Year part
  const y = parts[2] !== undefined ? parts[2].slice(0, 4) : "";

  let res = d;
  if (d.length === 2) {
    res += "/" + m;
    if (m.length === 2) {
      res += "/" + y;
    } else if (parts.length > 2) {
      res += "/" + y;
    }
  } else if (parts.length > 1) {
    res += "/" + m;
    if (parts.length > 2) {
      res += "/" + y;
    }
  }

  return res;
}

export function StandardDateInput({
  id,
  name,
  value = "",
  onChange,
  placeholder = "dd/mm/yyyy (ví dụ: 25/10/2026)",
  className = "",
  disabled = false,
  required = false,
  min,
  max,
  ariaLabel,
}: StandardDateInputProps) {
  const [displayText, setDisplayText] = useState(() => {
    const parsed = parseFlexibleDate(value);
    return parsed.isValid ? parsed.display : value || "";
  });
  const [isInvalid, setIsInvalid] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const prevTextRef = useRef(displayText);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    const parsed = parseFlexibleDate(value);
    const targetDisplay = parsed.isValid ? parsed.display : value || "";
    if (targetDisplay !== displayText && value !== displayText) {
      setDisplayText(targetDisplay);
      prevTextRef.current = targetDisplay;
      setIsInvalid(false);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      setDisplayText("");
      prevTextRef.current = "";
      setIsInvalid(false);
      onChange("", "");
      return;
    }

    const formatted = formatMaskWhileTyping(raw, prevTextRef.current);
    prevTextRef.current = formatted;
    setDisplayText(formatted);

    const parsed = parseFlexibleDate(formatted);
    if (parsed.isValid) {
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    } else {
      // If user has typed full 10 chars (dd/mm/yyyy) but date is mathematically invalid (e.g. 31/02/2026)
      if (formatted.length === 10) {
        setIsInvalid(true);
      } else {
        setIsInvalid(false);
      }
      onChange("", formatted);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (!displayText.trim()) {
      setIsInvalid(false);
      onChange("", "");
      return;
    }
    let parsed = parseFlexibleDate(displayText);
    if (!parsed.isValid) {
      // Check 2-digit year on blur only
      const dmy2 = displayText.trim().match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/);
      if (dmy2) {
        const d = parseInt(dmy2[1], 10);
        const m = parseInt(dmy2[2], 10);
        let y = parseInt(dmy2[3], 10);
        y = y > 50 ? 1900 + y : 2000 + y;
        if (isValidDate(y, m, d)) {
          const iso = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
          const display = `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y.toString().padStart(4, "0")}`;
          parsed = { iso, display, isValid: true };
        }
      }
    }
    if (parsed.isValid) {
      setDisplayText(parsed.display);
      prevTextRef.current = parsed.display;
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    } else {
      setIsInvalid(true);
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (!isoVal) {
      setDisplayText("");
      prevTextRef.current = "";
      setIsInvalid(false);
      onChange("", "");
      return;
    }
    const parsed = parseFlexibleDate(isoVal);
    if (parsed.isValid) {
      setDisplayText(parsed.display);
      prevTextRef.current = parsed.display;
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    }
  };

  const openCalendar = () => {
    if (datePickerRef.current && !disabled) {
      try {
        if (typeof datePickerRef.current.showPicker === "function") {
          datePickerRef.current.showPicker();
        } else {
          datePickerRef.current.click();
        }
      } catch {
        datePickerRef.current.click();
      }
    }
  };

  const parsedCurrent = parseFlexibleDate(displayText);
  const currentIso = parsedCurrent.isValid ? parsedCurrent.iso : "";

  return (
    <div className="relative flex flex-col w-full">
      <div className="relative flex items-center w-full">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayText}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || placeholder}
          className={`${className} pr-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal ${
            isInvalid ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""
          }`}
        />

        {/* Hidden native date picker utilized for showPicker() */}
        <input
          ref={datePickerRef}
          type="date"
          lang="vi-VN"
          tabIndex={-1}
          disabled={disabled}
          min={min}
          max={max}
          value={currentIso}
          onChange={handleNativePickerChange}
          className="sr-only"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            border: 0,
            pointerEvents: "none",
          }}
        />

        {/* Clickable Calendar Icon Button */}
        <button
          type="button"
          tabIndex={-1}
          onClick={openCalendar}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#003B95] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer pointer-events-auto"
          aria-label="Chọn ngày từ lịch"
          title="Chọn ngày từ lịch"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {isInvalid && displayText.trim() && (
        <span className="mt-1 flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          Ngày không hợp lệ (định dạng chuẩn: ngày/tháng/năm)
        </span>
      )}
    </div>
  );
}

export default StandardDateInput;
