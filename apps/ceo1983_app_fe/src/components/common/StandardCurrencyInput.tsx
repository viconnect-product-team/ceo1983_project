import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/date-format";

export interface StandardCurrencyInputProps {
  id?: string;
  name?: string;
  value?: string | number | null;
  onChange: (formattedValue: string, numericValue: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  unit?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * StandardCurrencyInput
 * Prevents caret jumping, handles dots seamlessly, preserves cursor position,
 * and eliminates the annoying auto-modify bugs when typing prices.
 */
export function StandardCurrencyInput({
  id,
  name,
  value,
  onChange,
  placeholder = "VD: 10.000.000",
  className = "",
  disabled = false,
  required = false,
  unit,
  autoComplete = "off",
  autoFocus = false,
  ariaLabel,
}: StandardCurrencyInputProps) {
  const [displayText, setDisplayText] = useState(() => formatCurrencyInput(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const nextCursorRef = useRef<number | null>(null);

  // Synchronize when value changes externally and input is not actively focused
  useEffect(() => {
    if (isFocusedRef.current) return;
    const formatted = formatCurrencyInput(value);
    if (formatted !== displayText) {
      setDisplayText(formatted);
    }
  }, [value]);

  // Restore caret position after React re-renders with new formatted value
  useLayoutEffect(() => {
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

    // Handle Backspace directly preceding a dot separator
    if (e.key === "Backspace" && selectionStart !== null && selectionStart === selectionEnd && selectionStart > 0) {
      const charBefore = currentVal[selectionStart - 1];
      if (charBefore === "." || charBefore === ",") {
        e.preventDefault();
        // Delete the digit before the dot instead of doing nothing
        const targetDeleteIndex = selectionStart - 2;
        if (targetDeleteIndex >= 0) {
          const rawBefore = currentVal.slice(0, targetDeleteIndex);
          const rawAfter = currentVal.slice(selectionStart);
          const combined = rawBefore + rawAfter;
          const formatted = formatCurrencyInput(combined);
          const numeric = parseCurrencyInput(formatted);

          // Calculate new cursor position based on remaining digits before delete
          const digitsBefore = rawBefore.replace(/\D/g, "").length;
          let newCursor = 0;
          let countedDigits = 0;
          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
              countedDigits++;
            }
            if (countedDigits === digitsBefore) {
              newCursor = i + 1;
              break;
            }
          }

          nextCursorRef.current = newCursor;
          setDisplayText(formatted);
          onChange(formatted, numeric);
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursor = input.selectionStart ?? rawValue.length;

    // Count how many numeric digits are to the left of the cursor
    const digitsBeforeCursor = rawValue.slice(0, cursor).replace(/\D/g, "").length;

    const formatted = formatCurrencyInput(rawValue);
    const numeric = parseCurrencyInput(formatted);

    // Calculate where cursor should be in the newly formatted string
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

    nextCursorRef.current = newCursor;
    setDisplayText(formatted);
    onChange(formatted, numeric);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const formatted = formatCurrencyInput(displayText);
    const numeric = parseCurrencyInput(formatted);
    setDisplayText(formatted);
    onChange(formatted, numeric);
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        value={displayText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={`${className} ${unit ? "pr-12" : ""}`}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
          {unit}
        </span>
      )}
    </div>
  );
}

export default StandardCurrencyInput;
