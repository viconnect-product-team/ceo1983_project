import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

export type CurrencyType = "VND" | "USD";

export interface FormattedCurrencyInputProps {
  id?: string;
  value: string | number | null | undefined;
  onChange: (formattedVal: string, numericVal: number, currency: CurrencyType) => void;
  currency?: CurrencyType;
  allowCurrencySwitch?: boolean;
  onCurrencyChange?: (currency: CurrencyType) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

/**
 * Format string as Vietnamese Dong: 1000000 -> 1.000.000
 */
export function formatVnd(val: string | number | null | undefined): string {
  if (val === undefined || val === null || val === "") return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  const clean = digits.replace(/^0+(?=\d)/, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format string as US Dollars: 1000000 -> 1,000,000 or 1250.50 -> 1,250.50
 */
export function formatUsd(val: string | number | null | undefined): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  const clean = str.replace(/[^0-9.]/g, "");
  if (!clean) return "";
  const parts = clean.split(".");
  const intPart = (parts[0] || "0").replace(/^0+(?=\d)/, "") || "0";
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    const decPart = parts.slice(1).join("").slice(0, 2);
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}

export function parseNumericValue(val: string | number | null | undefined, curr: CurrencyType): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (curr === "USD") {
    const clean = String(val).replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    return Number.isFinite(num) ? num : 0;
  }
  const digits = String(val).replace(/\D/g, "");
  const num = parseInt(digits, 10);
  return Number.isFinite(num) ? num : 0;
}

export function parsePriceToNumber(priceVal: string | number | null | undefined, curr: CurrencyType = "VND"): number {
  if (priceVal === undefined || priceVal === null || priceVal === "") return 0;
  if (typeof priceVal === "number") return Number.isFinite(priceVal) ? priceVal : 0;
  const str = String(priceVal).trim();
  if (curr === "VND") {
    const digits = str.replace(/\D/g, "");
    return digits ? parseInt(digits, 10) : 0;
  }
  const clean = str.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return Number.isFinite(num) ? num : 0;
}

export function FormattedCurrencyInput({
  id,
  value,
  onChange,
  currency: initialCurrency = "VND",
  allowCurrencySwitch = true,
  onCurrencyChange,
  placeholder,
  className = "",
  ariaLabel,
  disabled = false,
}: FormattedCurrencyInputProps) {
  const [curr, setCurr] = useState<CurrencyType>(initialCurrency);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return initialCurrency === "USD" ? formatUsd(value) : formatVnd(value);
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const nextCursorPosRef = useRef<number | null>(null);
  const isFocusedRef = useRef(false);

  // Sync external currency prop changes
  useEffect(() => {
    if (initialCurrency && initialCurrency !== curr) {
      setCurr(initialCurrency);
    }
  }, [initialCurrency]);

  // Sync external value changes safely without overriding in-progress typing
  useEffect(() => {
    if (isFocusedRef.current) return;
    const formatted = curr === "USD" ? formatUsd(value) : formatVnd(value);
    if (formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  }, [value, curr]);

  // Restore cursor position on layout paint to avoid caret jump
  useLayoutEffect(() => {
    if (nextCursorPosRef.current !== null && inputRef.current && isFocusedRef.current) {
      const pos = Math.min(nextCursorPosRef.current, inputRef.current.value.length);
      try {
        inputRef.current.setSelectionRange(pos, pos);
      } catch {
        // ignore if not supported
      }
      nextCursorPosRef.current = null;
    }
  }, [displayValue]);

  const handleCurrencyToggle = (newCurr: CurrencyType) => {
    setCurr(newCurr);
    onCurrencyChange?.(newCurr);
    const num = parsePriceToNumber(displayValue, curr);
    const newFormatted = newCurr === "USD" ? formatUsd(num) : formatVnd(num);
    setDisplayValue(newFormatted);
    onChange(newFormatted, num, newCurr);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !inputRef.current) return;

    // When deleting right behind a thousand dot (e.g. "1.|000"), delete the digit before the dot
    if (e.key === "Backspace") {
      const selStart = inputRef.current.selectionStart;
      const selEnd = inputRef.current.selectionEnd;
      if (selStart !== null && selStart === selEnd && selStart > 1) {
        const prevChar = displayValue[selStart - 1];
        if (prevChar === "." || prevChar === ",") {
          e.preventDefault();
          const before = displayValue.slice(0, selStart - 2);
          const after = displayValue.slice(selStart);
          const newRaw = before + after;
          formatAndNotify(newRaw, selStart - 1);
        }
      }
    }
  };

  const formatAndNotify = (raw: string, cursorPosition?: number) => {
    const cursor = cursorPosition ?? (inputRef.current?.selectionStart ?? raw.length);

    if (curr === "VND") {
      const digitsBeforeCursor = raw.slice(0, cursor).replace(/\D/g, "").length;
      const digitsOnly = raw.replace(/\D/g, "");

      if (!digitsOnly) {
        setDisplayValue("");
        nextCursorPosRef.current = 0;
        onChange("", 0, "VND");
        return;
      }

      const cleanDigits = digitsOnly.replace(/^0+(?=\d)/, "");
      const formatted = cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      let newCursor = 0;
      if (digitsBeforeCursor === 0) {
        newCursor = 0;
      } else {
        let countedDigits = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            countedDigits++;
          }
          if (countedDigits === digitsBeforeCursor) {
            newCursor = i + 1;
            break;
          }
        }
        if (newCursor === 0) newCursor = formatted.length;
      }

      nextCursorPosRef.current = newCursor;
      setDisplayValue(formatted);
      const numVal = parseInt(cleanDigits, 10) || 0;
      onChange(formatted, numVal, "VND");
    } else {
      // USD Mode
      const validCharsToRight = raw.slice(cursor).replace(/[^0-9.]/g, "").length;
      const clean = raw.replace(/[^0-9.]/g, "");

      if (!clean) {
        setDisplayValue("");
        nextCursorPosRef.current = 0;
        onChange("", 0, "USD");
        return;
      }

      const parts = clean.split(".");
      const intPart = (parts[0] || "0").replace(/^0+(?=\d)/, "") || "0";
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      let formatted = formattedInt;
      if (parts.length > 1) {
        const decPart = parts.slice(1).join("").slice(0, 2);
        formatted = `${formattedInt}.${decPart}`;
      } else if (raw.endsWith(".") && !formatted.includes(".")) {
        formatted = `${formatted}.`;
      }

      let newCursor = formatted.length;
      if (validCharsToRight > 0) {
        let count = 0;
        for (let i = formatted.length - 1; i >= 0; i--) {
          if (/[0-9.]/.test(formatted[i])) {
            count++;
            if (count === validCharsToRight) {
              newCursor = i;
              break;
            }
          }
        }
      }

      nextCursorPosRef.current = newCursor;
      setDisplayValue(formatted);
      const numVal = parseFloat(formatted.replace(/,/g, "")) || 0;
      onChange(formatted, numVal, "USD");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formatAndNotify(e.target.value, e.target.selectionStart ?? undefined);
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Currency Symbol / Toggle */}
      {allowCurrencySwitch ? (
        <div className="absolute left-2.5 z-10 flex items-center pointer-events-auto">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => handleCurrencyToggle("VND")}
              className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                curr === "VND"
                  ? "bg-[#003B95] text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              ₫
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => handleCurrencyToggle("USD")}
              className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                curr === "USD"
                  ? "bg-[#003B95] text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              $
            </button>
          </div>
        </div>
      ) : (
        <span className="absolute left-3 z-10 text-xs font-bold text-slate-500 select-none pointer-events-none">
          {curr === "VND" ? "₫" : "$"}
        </span>
      )}

      {/* Actual Input */}
      <input
        ref={inputRef}
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder || (curr === "VND" ? "0 đ" : "$0.00")}
        value={displayValue}
        onFocus={() => {
          isFocusedRef.current = true;
          // Defer select slightly so mouseup doesn't cancel selection
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.select();
            }
          }, 20);
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          const formatted = curr === "USD" ? formatUsd(value) : formatVnd(value);
          if (formatted !== displayValue) {
            setDisplayValue(formatted);
          }
        }}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        style={{
          paddingLeft: allowCurrencySwitch ? "5.25rem" : "2.25rem",
          paddingRight: "3.5rem",
        }}
        className={cn(
          "w-full rounded-xl border border-input bg-background py-2 text-xs font-medium tracking-wide focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
      />

      {/* Suffix badge */}
      <span className="absolute right-3 z-10 text-xs font-semibold text-slate-400 select-none pointer-events-none">
        {curr === "VND" ? "VNĐ" : "USD"}
      </span>
    </div>
  );
}

export default FormattedCurrencyInput;
