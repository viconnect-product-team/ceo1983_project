import React, { useState } from "react";
import {
  TrendingUp,
  Handshake,
  Download,
  BarChart3,
  ChevronRight,
  Sparkles,
  PieChart,
  FileSpreadsheet,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export interface OpportunityReportSummary {
  totalClubCount: number;
  totalClubValue: number;
  mySharedCount: number;
  mySharedValue: number;
  myWonCount: number;
  myWonValue: number;
  totalWonCount: number;
  totalWonValue: number;
}

export interface OpportunityAnalyticsWidgetProps {
  summary: OpportunityReportSummary;
  opportunities: any[];
  onViewDetails?: () => void;
}

function formatShortVnd(val: number): string {
  if (!val || val === 0) return "0 đ";
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} Tỷ`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(0)} Tr`;
  }
  return `${val.toLocaleString("vi-VN")} đ`;
}

export const OpportunityAnalyticsWidget: React.FC<OpportunityAnalyticsWidgetProps> = ({
  summary,
  opportunities,
  onViewDetails,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Maximum value for comparative scaling
  const maxVal = Math.max(summary.totalClubValue, 1);
  const sharedPercent = Math.min(100, Math.round((summary.mySharedValue / maxVal) * 100)) || 5;
  const wonPercent = Math.min(100, Math.round((summary.myWonValue / maxVal) * 100)) || 3;

  const handleExportReport = () => {
    setIsExporting(true);
    try {
      if (!opportunities || opportunities.length === 0) {
        toast.info("Chưa có dữ liệu cơ hội để xuất báo cáo.");
        return;
      }

      // Generate CSV with UTF-8 BOM for flawless Excel display
      const headers = [
        "STT",
        "Tiêu đề cơ hội",
        "Phân loại",
        "Ngành nghề",
        "Giá trị tối đa (VNĐ)",
        "Người đăng",
        "Công ty",
        "Ban chuyên môn",
        "Người nhận / Chốt deal",
        "Trạng thái",
        "Ngày đăng",
      ];

      const rows = opportunities.map((o, idx) => [
        idx + 1,
        `"${(o.title || "").replace(/"/g, '""')}"`,
        `"${o.type || o.tradeType || "Hợp tác B2B"}"`,
        `"${o.industry || "Đa ngành"}"`,
        o.budgetMax || o.budgetMin || 0,
        `"${(o.posterName || "").replace(/"/g, '""')}"`,
        `"${(o.posterCompany || "").replace(/"/g, '""')}"`,
        `"${(o.posterDepartment || "Ban kết nối").replace(/"/g, '""')}"`,
        `"${(o.claimedByName || "").replace(/"/g, '""')}"`,
        `"${o.status === "claimed" || o.isWon ? "Đã chốt deal" : "Đang mở"}"`,
        `"${o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : ""}"`,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Bao_Cao_Co_Hoi_Giao_Thuong_CEO1983_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Xuất file báo cáo cơ hội Excel/CSV thành công!");
    } catch (err: any) {
      toast.error(`Không thể xuất báo cáo: ${err?.message || "Lỗi không xác định"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="self-stretch rounded-3xl bg-gradient-to-br from-[#001D4A] via-[#002B70] to-[#0A1A3A] p-4 text-white shadow-xl shadow-blue-950/20 border border-blue-400/20 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Báo Cáo & Biểu Đồ Cơ Hội Giao Thương</span>
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[9px] font-black text-white uppercase tracking-wider">
                Realtime
              </span>
            </h3>
            <p className="text-[10px] text-blue-200/80 font-medium">
              Đối soát 3 chiều: Cơ hội chia sẻ, Deal thành công & Toàn CLB
            </p>
          </div>
        </div>

        {/* Action Buttons: Export & View Detail */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Xuất file báo cáo Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>

          <Link
            to="/association/analytics"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <span>Thống kê</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Column Visual Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 relative z-10 mb-3.5">
        {/* Metric 1: Cơ hội tôi đã chia sẻ (Warm Amber) */}
        <div className="rounded-2xl bg-white/[0.07] border border-amber-500/30 p-2.5 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Tôi chia sẻ
            </span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-black text-amber-400 leading-tight">
              {summary.mySharedCount} <span className="text-[10px] font-semibold text-white/70">tin</span>
            </div>
            <div className="text-[11px] font-bold text-white/90 mt-0.5">
              {formatShortVnd(summary.mySharedValue)}
            </div>
          </div>
        </div>

        {/* Metric 2: Deal chốt thành công (Crimson Red Priority) */}
        <div className="rounded-2xl bg-white/[0.07] border border-red-500/40 p-2.5 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
              Deal đã chốt
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div>
            <div className="text-base font-black text-rose-400 leading-tight">
              {summary.myWonCount} <span className="text-[10px] font-semibold text-white/70">deal</span>
            </div>
            <div className="text-[11px] font-bold text-white/90 mt-0.5">
              {formatShortVnd(summary.myWonValue)}
            </div>
          </div>
        </div>

        {/* Metric 3: Tổng cơ hội toàn CLB (Royal Navy/Blue) */}
        <div className="rounded-2xl bg-white/[0.07] border border-sky-400/30 p-2.5 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
              Tổng CLB
            </span>
            <Handshake className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <div className="text-base font-black text-sky-300 leading-tight">
              {summary.totalClubCount} <span className="text-[10px] font-semibold text-white/70">tin</span>
            </div>
            <div className="text-[11px] font-bold text-white/90 mt-0.5">
              {formatShortVnd(summary.totalClubValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Progress Bar Chart */}
      <div className="rounded-2xl bg-black/25 p-3 border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Tỷ trọng cơ hội của bạn:
          </span>
          <span className="text-amber-300 font-extrabold">{sharedPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, sharedPercent)}%` }}
            title={`Cơ hội chia sẻ: ${sharedPercent}%`}
          />
          <div
            className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500 ml-0.5"
            style={{ width: `${Math.max(2, wonPercent)}%` }}
            title={`Deal đã chốt: ${wonPercent}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-blue-200/70 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Tỷ lệ chốt deal: {summary.totalWonCount}/{summary.totalClubCount}
          </span>
          <Link
            to="/association/analytics"
            className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
          >
            Mở bảng thống kê chi tiết →
          </Link>
        </div>
      </div>
    </div>
  );
};
