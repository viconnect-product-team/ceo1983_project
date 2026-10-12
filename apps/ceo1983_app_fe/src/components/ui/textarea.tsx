import * as React from "react";

import { cn } from "@/lib/utils";
import { trimInputElement } from "@/lib/input-trim-helper";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onBlur, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Auto-trim space when losing focus
      trimInputElement(e.currentTarget);
      onBlur?.(e);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
