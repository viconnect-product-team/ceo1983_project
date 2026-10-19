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
    if (m === 0 && d === 0 && y >= 1900 && y <= 2100) {
      return { iso: `${y}-00-00`, display: `00/00/${y}`, isValid: true };
    }
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
    if (d === 0 && m === 0 && y >= 1900 && y <= 2100) {
      return { iso: `${y}-00-00`, display: `00/00/${y}`, isValid: true };
    }
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
 * Automatically formats typed digits into DD/MM/YYYY while typing
 */
export function formatDigitsToDdmmyyyy(raw: string, prevRaw: string): string {
  // If user is deleting character, don't auto-append slashes
  if (raw.length < prevRaw.length) {
    if (raw.endsWith("/") || raw.endsWith("-")) {
      return raw.slice(0, -1);
    }
    return raw;
  }

  // Clean characters, keep digits, slashes and dashes
  const clean = raw.replace(/[^\d\/\.-]/g, "");

  // If user typed digits only, automatically insert slashes
  if (!clean.includes("/") && !clean.includes("-") && !clean.includes(".")) {
    const digits = clean.slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  return clean.replace(/\/+/g, "/").slice(0, 10);
}

/**
 * Cleanly formats user date on blur or when fully typed, without mutating keystrokes mid-typing
 */
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
  const isFocusedRef = useRef(false);

  // Synchronize when value changes externally (and user is not currently typing)
  useEffect(() => {
    if (isFocusedRef.current) return;
    const parsed = parseFlexibleDate(value);
    const targetDisplay = parsed.isValid ? parsed.display : value || "";
    if (targetDisplay !== displayText) {
      setDisplayText(targetDisplay);
      setIsInvalid(false);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDigitsToDdmmyyyy(raw, displayText);
    setDisplayText(formatted);

    if (!formatted.trim()) {
      setIsInvalid(false);
      onChange("", "");
      return;
    }

    const parsed = parseFlexibleDate(formatted);
    if (parsed.isValid) {
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    } else {
      // Keep the typed value in parent state so it doesn't get cleared or reset during re-renders
      setIsInvalid(false);
      onChange(formatted, formatted);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const trimmed = displayText.trim();
    if (!trimmed) {
      setIsInvalid(false);
      onChange("", "");
      return;
    }

    let parsed = parseFlexibleDate(trimmed);
    if (!parsed.isValid) {
      // Check 2-digit year on blur (e.g., 25/10/83 -> 25/10/1983)
      const dmy2 = trimmed.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2})$/);
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
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    } else {
      setIsInvalid(true);
      onChange(trimmed, trimmed);
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (!isoVal) {
      setDisplayText("");
      setIsInvalid(false);
      onChange("", "");
      return;
    }
    const parsed = parseFlexibleDate(isoVal);
    if (parsed.isValid) {
      setDisplayText(parsed.display);
      setIsInvalid(false);
      onChange(parsed.iso, parsed.display);
    }
  };

  const parsedCurrent = parseFlexibleDate(displayText);
  const validPickerIso =
    parsedCurrent.isValid && !parsedCurrent.iso.includes("-00")
      ? parsedCurrent.iso
      : "";

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

        {/* Interactive Calendar Icon & Native Date Trigger (100% Mobile Compatible) */}
        <div
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-[#003B95] dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          title="Chọn ngày từ lịch"
        >
          <Calendar className="h-4.5 w-4.5 pointer-events-none group-hover:scale-110 transition-transform" />

          {/* Native HTML5 Date Input: directly overlaid with opacity 0 so finger tap on mobile hits native input */}
          <input
            ref={datePickerRef}
            type="date"
            lang="vi-VN"
            tabIndex={-1}
            disabled={disabled}
            min={min || "1920-01-01"}
            max={max || "2035-12-31"}
            value={validPickerIso}
            onChange={handleNativePickerChange}
            onClick={(e) => {
              try {
                if (typeof (e.currentTarget as any).showPicker === "function") {
                  (e.currentTarget as any).showPicker();
                }
              } catch {}
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label={ariaLabel || "Chọn ngày từ lịch"}
          />
        </div>
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
