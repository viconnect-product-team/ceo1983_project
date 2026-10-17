import React, { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { SortDir } from "@/hooks/use-table-controls";

export interface SortHeaderProps {
  label: string;
  columnKey: string;
  sortKey: string | null;
  sortDir: SortDir;
  onSort?: (key: string) => void;
  align?: "left" | "right" | "center";
  className?: string;
  width?: number | string;
  minWidth?: number;
  resizable?: boolean;
  onResize?: (newWidth: number) => void;
  children?: React.ReactNode;
}

/**
 * Header bảng dữ liệu chuyên nghiệp:
 * 1. Tích hợp sắp xếp cột (Sorting) với biểu tượng mũi tên rõ ràng
 * 2. Tích hợp thanh co giãn độ rộng cột (Column Resizing) kéo thả 1 tay cực mượt
 */
export function SortHeader({
  label,
  columnKey,
  sortKey,
  sortDir,
  onSort,
  align = "left",
  className = "",
  width,
  minWidth = 70,
  resizable = true,
  onResize,
  children,
}: SortHeaderProps) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const active = sortKey === columnKey;
  const Icon = !active ? ChevronsUpDown : sortDir === "asc" ? ChevronUp : ChevronDown;

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const th = thRef.current;
      const startWidth = th ? th.getBoundingClientRect().width : typeof width === "number" ? width : 120;
      setIsResizing(true);

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const delta = moveEvt.clientX - startX;
        const newW = Math.max(minWidth, Math.round(startWidth + delta));
        if (th) {
          th.style.width = `${newW}px`;
          th.style.minWidth = `${newW}px`;
        }
        if (onResize) onResize(newW);
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [minWidth, onResize, width]
  );

  return (
    <th
      ref={thRef}
      style={width ? { width: typeof width === "number" ? `${width}px` : width, minWidth: `${minWidth}px` } : { minWidth: `${minWidth}px` }}
      className={`group/col relative px-4 py-3 select-none text-xs font-bold transition-colors ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${active ? "bg-primary/5 dark:bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"} ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 w-full ${
          align === "right" ? "justify-end flex-row-reverse" : align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        {onSort ? (
          <button
            type="button"
            onClick={() => onSort(columnKey)}
            className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground cursor-pointer focus:outline-none ${
              active ? "text-primary font-black" : ""
            } ${align === "right" ? "flex-row-reverse" : ""}`}
            aria-label={`Sắp xếp theo ${label}`}
          >
            {children || <span>{label}</span>}
            <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground/60"}`} />
          </button>
        ) : (
          <span className="uppercase tracking-wider">{children || label}</span>
        )}
      </div>

      {/* Resize Handle ở mép phải cột */}
      {resizable && (
        <div
          onPointerDown={handleResizeStart}
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 h-full w-3.5 cursor-col-resize flex items-center justify-center z-20 group/handle touch-none ${
            isResizing ? "opacity-100" : "opacity-0 group-hover/col:opacity-100"
          } transition-opacity`}
          title="Kéo sang trái hoặc phải để co giãn độ rộng cột"
        >
          <div
            className={`w-[2px] transition-all rounded-full ${
              isResizing ? "bg-primary h-full ring-2 ring-primary/30" : "bg-border h-4 group-hover/handle:bg-primary group-hover/handle:h-full"
            }`}
          />
        </div>
      )}
    </th>
  );
}

/**
 * Thanh Phân Trang Đồng Nhất Chuẩn Doanh Nghiệp (Unified CRM Pagination Bar):
 * - Được thiết kế gắn liền dưới đáy bảng (Table Footer)
 * - Tự động chống cắt cụt nội dung dòng cuối bảng
 * - Đầy đủ thông tin: Hiển thị 1-20 trên 35 kết quả, số dòng/trang, Trước/Sau, Trang X trên Y
 */
export function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  from,
  to,
  onPage,
  onPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  from: number;
  to: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}) {
  const t = useT();

  const safeTotal = Math.max(0, total);
  const safeFrom = safeTotal === 0 ? 0 : Math.max(1, from);
  const safeTo = Math.min(safeTotal, Math.max(safeFrom, to));
  const safePageCount = Math.max(1, pageCount);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-slate-50/70 dark:bg-slate-900/60 px-4 sm:px-6 py-3.5 text-xs sm:text-sm select-none transition-colors ${className}`}
    >
      {/* Khối thống kê kết quả bên trái */}
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <span>{t("page.showing") || "Hiển thị"}</span>
        <span className="font-bold text-foreground font-mono">
          {safeFrom}-{safeTo}
        </span>
        <span>{t("page.of") || "trên"}</span>
        <span className="font-bold text-foreground font-mono">{safeTotal}</span>
        <span>{t("page.results") || "kết quả"}</span>
      </div>

      {/* Khối điều khiển phân trang bên phải */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Chọn số dòng hiển thị trên một trang */}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-xs hover:border-border/80 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
            aria-label="Chọn số dòng trên mỗi trang"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline">{t("page.rows") || "dòng/trang"}</span>
        </label>

        {/* Nút điều hướng Trang trước / Trang sau */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 sm:px-3 text-xs font-bold text-foreground shadow-xs hover:bg-muted active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-card transition cursor-pointer"
            title="Về trang trước"
            aria-label={t("page.prev") || "Trước"}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("page.prev") || "Trước"}</span>
          </button>

          <span className="px-2 text-xs text-muted-foreground whitespace-nowrap font-medium">
            {t("page.page") || "Trang"}{" "}
            <span className="font-bold text-foreground font-mono">{page}</span>{" "}
            {t("page.of") || "trên"} {safePageCount}
          </span>

          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= safePageCount}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 sm:px-3 text-xs font-bold text-foreground shadow-xs hover:bg-muted active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-card transition cursor-pointer"
            title="Sang trang sau"
            aria-label={t("page.next") || "Sau"}
          >
            <span className="hidden sm:inline">{t("page.next") || "Sau"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
