import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ColumnWidthConfig {
  [key: string]: number;
}

export function useResizableColumns<K extends string>(initialWidths: Record<K, number>) {
  const [widths, setWidths] = useState<Record<K, number>>(initialWidths);
  const activeResizeRef = useRef<{ col: K; startX: number; startWidth: number } | null>(null);

  const startResize = useCallback((col: K, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = widths[col] || 120;
    activeResizeRef.current = { col, startX, startWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!activeResizeRef.current) return;
      const deltaX = moveEvent.clientX - activeResizeRef.current.startX;
      const newWidth = Math.max(50, activeResizeRef.current.startWidth + deltaX);
      setWidths((prev) => ({
        ...prev,
        [activeResizeRef.current!.col]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      activeResizeRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [widths]);

  return { widths, startResize, setWidths };
}

interface ResizableThProps<K extends string> extends React.ThHTMLAttributes<HTMLTableCellElement> {
  colKey: K;
  width?: number;
  onResize?: (col: K, e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export function ResizableTh<K extends string>({
  colKey,
  width,
  onResize,
  className,
  children,
  style,
  ...props
}: ResizableThProps<K>) {
  return (
    <th
      style={{
        ...style,
        ...(width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : {}),
      }}
      className={cn(
        "relative select-none group/th transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between overflow-hidden pr-2">
        {children}
      </div>
      {onResize && (
        <div
          role="separator"
          aria-label="Kéo để chỉnh độ rộng cột"
          onMouseDown={(e) => onResize(colKey, e)}
          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-30 flex items-center justify-center hover:bg-primary/20 active:bg-primary/40 group/handle transition-colors"
          title="Kéo sang trái / phải để co giãn cột như Excel"
        >
          <div className="w-0.5 h-4/5 bg-border/60 group-hover/handle:bg-primary group-hover/handle:w-1 transition-all rounded-full" />
        </div>
      )}
    </th>
  );
}
