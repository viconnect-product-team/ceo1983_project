import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

export type CurrencyType = "VND" | "USD";

export interface FormattedCurrencyInputProps {
  id?: string;
  value: string | number;
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
export function formatVnd(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  const clean = digits.replace(/^0+(?=\d)/, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format string as US Dollars: 1000000 -> 1,000,000 or 1250.50 -> 1,250.50
 */
export function formatUsd(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  // Strip everything except digits and decimal dot
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

export function parseNumericValue(val: string | number, curr: CurrencyType): number {
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

export function parsePriceToNumber(priceVal: string | number | null | undefined): number {
  if (priceVal === undefined || priceVal === null || priceVal === "") return 0;
  if (typeof priceVal === "number") return Number.isFinite(priceVal) ? priceVal : 0;
  const str = String(priceVal).trim();
  const dotCount = (str.match(/\./g) || []).length;
  // If multiple dots, or single dot followed by 3 digits without comma (Vietnamese thousand separator)
  if (dotCount > 1 || (dotCount === 1 && !str.includes(",") && /^\d+\.\d{3}$/.test(str))) {
    return parseInt(str.replace(/\D/g, ""), 10) || 0;
  }
  return parseFloat(str.replace(/,/g, "").replace(/[^0-9.]/g, "")) || 0;
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
    const formatted = curr === "USD" ? formatUsd(value) : formatVnd(value);
    const externalNum = parsePriceToNumber(value);
    const currentNum = parsePriceToNumber(displayValue);

    if (isFocusedRef.current) {
      // If user is actively typing, only override if external value changed radically (e.g. form reset)
      if (externalNum !== currentNum) {
        setDisplayValue(formatted);
      }
    } else {
      if (formatted !== displayValue) {
        setDisplayValue(formatted);
      }
    }
  }, [value, curr]);

  const isComposingRef = useRef(false);

  // Restore cursor position on layout paint to avoid caret jump only when separators change
  useLayoutEffect(() => {
    if (nextCursorPosRef.current !== null && inputRef.current) {
      const pos = Math.min(nextCursorPosRef.current, inputRef.current.value.length);
      if (inputRef.current.selectionStart !== pos || inputRef.current.selectionEnd !== pos) {
        inputRef.current.setSelectionRange(pos, pos);
      }
      nextCursorPosRef.current = null;
    }
  }, [displayValue]);

  const handleCurrencyToggle = (newCurr: CurrencyType) => {
    setCurr(newCurr);
    onCurrencyChange?.(newCurr);
    const num = parsePriceToNumber(displayValue);
    const newFormatted = newCurr === "USD" ? formatUsd(num) : formatVnd(num);
    setDisplayValue(newFormatted);
    onChange(newFormatted, num, newCurr);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // When deleting right behind a thousand dot (e.g. "1.|000"), delete the digit before the dot
    if (e.key === "Backspace" && inputRef.current) {
      const selStart = inputRef.current.selectionStart;
      const selEnd = inputRef.current.selectionEnd;
      if (selStart !== null && selStart === selEnd && selStart > 1) {
        const prevChar = displayValue[selStart - 1];
        if (prevChar === "." || prevChar === ",") {
          e.preventDefault();
          const before = displayValue.slice(0, selStart - 2);
          const after = displayValue.slice(selStart);
          const newRaw = before + after;
          const fakeEvent = {
            target: {
              value: newRaw,
              selectionStart: selStart - 1,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          handleChange(fakeEvent);
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposingRef.current) return;
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;

    if (curr === "VND") {
      // Digits to the right of cursor before reformatting (invariant anchor)
      const digitsToRight = raw.slice(cursor).replace(/\D/g, "").length;
      const digitsOnly = raw.replace(/\D/g, "");

      if (!digitsOnly) {
        setDisplayValue("");
        nextCursorPosRef.current = null;
        onChange("", 0, "VND");
        return;
      }

      const cleanDigits = digitsOnly.replace(/^0+(?=\d)/, "");
      const formatted = cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      // If no separators changed and raw matches cleanDigits, do not force selection range
      if (raw === formatted && cleanDigits.length <= 3) {
        nextCursorPosRef.current = null;
      } else {
        // Calculate cursor position from right side invariant
        let newCursor = formatted.length;
        if (digitsToRight > 0) {
          let count = 0;
          for (let i = formatted.length - 1; i >= 0; i--) {
            if (/\d/.test(formatted[i])) {
              count++;
              if (count === digitsToRight) {
                newCursor = i;
                break;
              }
            }
          }
        }
        nextCursorPosRef.current = newCursor;
      }

      setDisplayValue(formatted);
      const numVal = parseInt(cleanDigits, 10) || 0;
      onChange(formatted, numVal, "VND");
    } else {
      // USD Mode: allows integer commas and optional dot decimal
      const validCharsToRight = raw.slice(cursor).replace(/[^0-9.]/g, "").length;
      const clean = raw.replace(/[^0-9.]/g, "");

      if (!clean) {
        setDisplayValue("");
        nextCursorPosRef.current = null;
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

      if (raw === formatted && !formatted.includes(",")) {
        nextCursorPosRef.current = null;
      } else {
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
      }

      setDisplayValue(formatted);
      const numVal = parseFloat(formatted.replace(/,/g, "")) || 0;
      onChange(formatted, numVal, "USD");
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Currency Symbol / Toggle */}
      {allowCurrencySwitch ? (
        <div className="absolute left-2.5 z-10 flex items-center">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => handleCurrencyToggle("VND")}
              className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                curr === "VND"
                  ? "bg-[#003B95] text-white shadow-xs"
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
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              $
            </button>
          </div>
        </div>
      ) : (
        <span className="absolute left-3 z-10 text-xs font-bold text-slate-500 select-none">
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
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
        }}
        onFocus={(e) => {
          isFocusedRef.current = true;
          if (displayValue === "0" || displayValue === "0 đ" || displayValue === "$0") {
            setDisplayValue("");
            nextCursorPosRef.current = null;
            onChange("", 0, curr);
          } else {
            e.target.select();
          }
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
        className={`${className} ${
          allowCurrencySwitch ? "pl-20" : "pl-8"
        } pr-12 font-medium tracking-wide`}
      />

      {/* Suffix badge */}
      <span className="absolute right-3 z-10 text-xs font-semibold text-slate-400 select-none pointer-events-none">
        {curr === "VND" ? "VNĐ" : "USD"}
      </span>
    </div>
  );
}

export default FormattedCurrencyInput;
