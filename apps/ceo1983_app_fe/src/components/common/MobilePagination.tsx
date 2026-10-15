import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
  compact?: boolean;
}

export function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 8, 12, 24],
  itemLabel = "sản phẩm",
  className = "",
  compact = false,
}: MobilePaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 8))) {
    return null;
  }

  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  // Generate page numbers with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safePage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();
  const from = totalItems !== undefined && pageSize !== undefined ? Math.min((safePage - 1) * pageSize + 1, totalItems) : null;
  const to = totalItems !== undefined && pageSize !== undefined ? Math.min(safePage * pageSize, totalItems) : null;

  return (
    <div
      className={`w-full py-3 px-2 flex flex-col items-center justify-center gap-2 select-none ${className}`}
    >
      {/* Top Info Strip */}
      {!compact && totalItems !== undefined && (
        <div className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <div>
            Hiển thị{" "}
            {from !== null && to !== null ? (
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {from}-{to}
              </span>
            ) : null}{" "}
            trên{" "}
            <span className="font-bold text-[#003B95] dark:text-blue-400">
              {totalItems}
            </span>{" "}
            {itemLabel}
          </div>

          {onPageSizeChange && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Xem:</span>
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {pageSizeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onPageSizeChange(opt)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition cursor-pointer ${
                      pageSize === opt
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Pagination Buttons */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => safePage > 1 && onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Trang trước"
          className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-35 disabled:cursor-not-allowed transition flex items-center gap-1 text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-8 flex items-center justify-center text-xs font-bold text-slate-400 tracking-wider"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === safePage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#003B95] text-white ring-1 ring-amber-400/40 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => safePage < totalPages && onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Trang sau"
          className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-35 disabled:cursor-not-allowed transition flex items-center gap-1 text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Page indicator pill on mobile */}
      <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
        Trang <span className="font-bold text-slate-700 dark:text-slate-300">{safePage}</span> /{" "}
        <span className="font-bold text-slate-700 dark:text-slate-300">{totalPages}</span>
      </div>
    </div>
  );
}
