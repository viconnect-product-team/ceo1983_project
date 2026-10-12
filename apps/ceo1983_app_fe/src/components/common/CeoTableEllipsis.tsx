import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export interface CeoTableEllipsisProps {
  text?: string | number | null;
  /** Max width class (e.g. max-w-[180px], max-w-[240px], max-w-[300px]). Defaults to max-w-[220px] */
  maxWidth?: string;
  className?: string;
  subText?: string | null;
  showTooltip?: boolean;
}

/**
 * Hiển thị nội dung trong bảng CRM hiệp hội:
 * - Khóa không bao giờ bị xuống dòng (whitespace-nowrap)
 * - Cắt ngắn bằng dấu ... (text-ellipsis)
 * - Hover hiển thị Tooltip chuẩn phong cách Ant Design: nền đen sâu #1f1f1f, chữ trắng tinh tế, mũi tên định hướng
 */
export function CeoTableEllipsis({
  text,
  maxWidth = "max-w-[220px]",
  className = "",
  subText,
  showTooltip = true,
}: CeoTableEllipsisProps) {
  const displayStr = text !== undefined && text !== null ? String(text) : "";

  if (!displayStr && !subText) {
    return <span className="text-muted-foreground select-none">—</span>;
  }

  const content = (
    <div className={`inline-flex flex-col min-w-0 ${maxWidth}`}>
      <span
        className={`truncate block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-foreground cursor-default transition-colors hover:text-[#003B95] dark:hover:text-amber-400 ${className}`}
      >
        {displayStr || "—"}
      </span>
      {subText && (
        <span className="truncate block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground mt-0.5">
          {subText}
        </span>
      )}
    </div>
  );

  if (!showTooltip || (!displayStr && !subText)) {
    return content;
  }

  const tooltipFullText = subText ? `${displayStr} (${subText})` : displayStr;

  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {content}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align="center"
            sideOffset={5}
            className="z-[9999] max-w-sm break-words rounded-[6px] bg-[#1f1f1f] px-2.5 py-1.5 text-xs font-normal leading-normal text-white shadow-[0_6px_16px_0_rgba(0,0,0,0.32),0_3px_6px_-4px_rgba(0,0,0,0.4)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 select-all"
          >
            <span>{tooltipFullText}</span>
            <TooltipPrimitive.Arrow className="fill-[#1f1f1f]" width={9} height={4} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
