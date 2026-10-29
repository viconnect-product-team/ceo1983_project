import React from "react";
import { LayoutDashboard, BarChart3, FolderTree } from "lucide-react";

export type FinanceViewMode = "dashboard" | "charts" | "unit_tree";

interface FinanceViewModeTabsProps {
  viewMode: FinanceViewMode;
  onChange: (mode: FinanceViewMode) => void;
  className?: string;
}

export function FinanceViewModeTabs({
  viewMode,
  onChange,
  className = "",
}: FinanceViewModeTabsProps) {
  const tabs = [
    {
      id: "dashboard" as const,
      label: "Dashboard Tổng Hợp",
      icon: LayoutDashboard,
      desc: "Bảng số liệu KPI & Bảng Excel giao dịch chi tiết",
    },
    {
      id: "charts" as const,
      label: "Biểu Đồ Cột & Tròn",
      icon: BarChart3,
      desc: "Phân tích xu hướng dòng tiền & Tỷ trọng cơ cấu",
    },
    {
      id: "unit_tree" as const,
      label: "Cây Đơn Vị",
      icon: FolderTree,
      desc: "Phân cấp ngân sách theo 6 Ban & Khối Doanh nghiệp",
    },
  ];

  return (
    <div className={`p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap sm:flex-nowrap gap-1.5 shadow-2xs ${className}`}>
      {tabs.map((tab) => {
        const active = viewMode === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              active
                ? "bg-[#003B95] text-white shadow-sm ring-1 ring-blue-900"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <Icon className={`size-4 shrink-0 ${active ? "text-amber-400" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

