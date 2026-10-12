import * as React from "react";

import { cn } from "@/lib/utils";
import { trimInputElement } from "@/lib/input-trim-helper";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onBlur, ...props }, ref) => {
    const isEmail = type === "email";

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Auto-trim space when losing focus
      trimInputElement(e.currentTarget);
      onBlur?.(e);
    };

    return (
      <input
        type={type}
        autoCapitalize={props.autoCapitalize ?? (isEmail ? "none" : undefined)}
        autoCorrect={props.autoCorrect ?? (isEmail ? "off" : undefined)}
        spellCheck={props.spellCheck ?? (isEmail ? false : undefined)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
