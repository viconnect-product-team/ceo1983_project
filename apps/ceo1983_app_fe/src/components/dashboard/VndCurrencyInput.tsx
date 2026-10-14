import React from "react";

export function formatVndNumber(val: number | string): string {
  const digits = String(val ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return num.toLocaleString("vi-VN");
}

export function parseVndNumber(formatted: string): number {
  const digits = String(formatted ?? "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function getVietnameseScaleLabel(num: number): string {
  if (!num || num <= 0) return "";
  if (num >= 1_000_000_000) {
    const billions = (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `~ ${billions} Tỷ VNĐ`;
  }
  if (num >= 1_000_000) {
    const millions = (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `~ ${millions} Triệu VNĐ`;
  }
  if (num >= 1_000) {
    const thousands = (num / 1_000).toFixed(0);
    return `~ ${thousands} Nghìn VNĐ`;
  }
  return `${num.toLocaleString("vi-VN")} VNĐ`;
}

interface VndCurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function VndCurrencyInput({
  id,
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  className = "",
  required = false,
}: VndCurrencyInputProps) {
  const [displayVal, setDisplayVal] = React.useState<string>(() =>
    value > 0 ? formatVndNumber(value) : value === 0 ? "0" : ""
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isFocusedRef = React.useRef(false);
  const nextCursorRef = React.useRef<number | null>(null);
  const isComposingRef = React.useRef(false);

  React.useEffect(() => {
    if (isFocusedRef.current) return;
    const formatted = value > 0 ? formatVndNumber(value) : value === 0 ? "0" : "";
    setDisplayVal(formatted);
  }, [value]);

  React.useLayoutEffect(() => {
    if (nextCursorRef.current !== null && inputRef.current && isFocusedRef.current) {
      const pos = Math.min(nextCursorRef.current, inputRef.current.value.length);
      inputRef.current.setSelectionRange(pos, pos);
      nextCursorRef.current = null;
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;

    const { selectionStart, selectionEnd, value: currentVal } = input;
    if (e.key === "Backspace" && selectionStart !== null && selectionStart === selectionEnd && selectionStart > 0) {
      const charBefore = currentVal[selectionStart - 1];
      if (charBefore === "." || charBefore === ",") {
        e.preventDefault();
        const targetDeleteIndex = selectionStart - 2;
        if (targetDeleteIndex >= 0) {
          const rawBefore = currentVal.slice(0, targetDeleteIndex);
          const rawAfter = currentVal.slice(selectionStart);
          const combined = rawBefore + rawAfter;
          const num = parseVndNumber(combined);
          const formatted = combined ? formatVndNumber(combined) : "";
          const digitsBefore = rawBefore.replace(/\D/g, "").length;
          let newCursor = 0;
          let countedDigits = 0;
          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) countedDigits++;
            if (countedDigits === digitsBefore) {
              newCursor = i + 1;
              break;
            }
          }
          nextCursorRef.current = newCursor;
          setDisplayVal(formatted);
          onChange(num);
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursor = input.selectionStart ?? rawValue.length;

    const digitsBeforeCursor = rawValue.slice(0, cursor).replace(/\D/g, "").length;
    const num = parseVndNumber(rawValue);
    const formatted = rawValue ? formatVndNumber(rawValue) : "";

    let newCursor = 0;
    if (digitsBeforeCursor === 0) {
      newCursor = 0;
    } else {
      let countedDigits = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) countedDigits++;
        if (countedDigits === digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (newCursor === 0) newCursor = formatted.length;
    }

    nextCursorRef.current = newCursor;
    setDisplayVal(formatted);
    onChange(num);
  };

  const scaleLabel = getVietnameseScaleLabel(value);

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={displayVal}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            const formatted = value > 0 ? formatVndNumber(value) : value === 0 ? "0" : "";
            setDisplayVal(formatted);
          }}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`h-10 w-full rounded-xl border border-border bg-background px-3 pr-14 text-sm font-semibold tracking-wide text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${className}`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            VNĐ
          </span>
        </div>
      </div>
      {value > 0 && (
        <div className="flex items-center justify-between text-[11px] px-1">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {scaleLabel}
          </span>
          <span className="text-muted-foreground font-mono">
            {value.toLocaleString("vi-VN")} đ
          </span>
        </div>
      )}
    </div>
  );
}
