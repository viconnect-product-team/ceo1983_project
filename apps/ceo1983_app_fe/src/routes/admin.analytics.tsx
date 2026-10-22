import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutGrid,
  BarChart3,
  GitBranch,
  PieChart,
  Network,
  Download,
  Upload,
  Calendar,
  Filter,
  RefreshCw,
  Coins,
  Handshake,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
  head: () => ({
    meta: [
      { title: "Báo cáo Thống kê & Phân tích CRM | CEO 1983" },
      {
        name: "description",
        content: "Trung tâm báo cáo thống kê đa chiều: Lưới, Dashboard, Biểu đồ cây, Biểu đồ tròn, Cây đơn vị cho CLB CEO 1983",
      },
    ],
  }),
});

type ViewMode = "GRID" | "DASHBOARD" | "TREEMAP" | "DONUT" | "ORG_TREE";

interface AnalyticsOverview {
  summary: {
    totalOpportunities: number;
    totalOpportunitiesValue: number;
    totalDealsWon: number;
    totalDealsWonValue: number;
    totalInteractions: number;
    totalMembers: number;
    activeMembersCount: number;
  };
  hourlyTrends: Array<{ hour: string; count: number; value: number }>;
  topPerformers: any[];
  leastActiveMembers: any[];
}

const COMMITTEES_DATA = [
  { name: "Ban Điều Hành", members: 12, dealsValue: 18_500_000_000, color: "#DC2626" },
  { name: "Ban Xúc tiến", members: 28, dealsValue: 14_200_000_000, color: "#F59E0B" },
  { name: "Ban Thành viên", members: 35, dealsValue: 8_900_000_000, color: "#003B95" },
  { name: "Ban Tài chính", members: 16, dealsValue: 7_600_000_000, color: "#059669" },
  { name: "Ban Truyền thông", members: 22, dealsValue: 5_400_000_000, color: "#7C3AED" },
  { name: "Ban Thiện nguyện", members: 24, dealsValue: 3_200_000_000, color: "#EC4899" },
  { name: "Ban Thư Ký", members: 8, dealsValue: 2_100_000_000, color: "#64748B" },
];

const INDUSTRIES_TREEMAP = [
  { name: "Bất động sản & Xây dựng", value: 24_500_000_000, count: 42, color: "bg-red-600" },
  { name: "Công nghệ & Chuyển đổi số", value: 18_200_000_000, count: 36, color: "bg-amber-500" },
  { name: "Sản xuất & Cơ khí", value: 12_800_000_000, count: 28, color: "bg-blue-600" },
  { name: "Tài chính & Đầu tư", value: 9_400_000_000, count: 19, color: "bg-emerald-600" },
  { name: "Thương mại & Dịch vụ", value: 7_600_000_000, count: 25, color: "bg-purple-600" },
  { name: "Nông nghiệp & Thực phẩm", value: 4_800_000_000, count: 14, color: "bg-cyan-600" },
];

function formatMoney(num: number): string {
  if (!num) return "0 đ";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} Tỷ đ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)} Tr đ`;
  return `${num.toLocaleString()} đ`;
}

function AdminAnalyticsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any>("/analytics/overview");
      if (res && res.summary) {
        setData(res);
      }
    } catch {
      toast.error("Không thể tải dữ liệu thống kê CRM");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExportCategoryExcel = (category: string) => {
    const csvContent =
      "\uFEFF" +
      [
        [`BÁO CÁO CRM THỐNG KÊ CHI TIẾT - DANH MỤC: ${category.toUpperCase()}`],
        [`Thời gian: ${new Date().toLocaleString("vi-VN")}`],
        [],
        ["Tên chỉ số / Ban ngành", "Số lượng hội viên", "Tổng giá trị (VNĐ)", "Tỷ trọng (%)", "Trạng thái"],
        ...COMMITTEES_DATA.map((c) => [
          c.name,
          c.members,
          c.dealsValue.toLocaleString(),
          `${((c.dealsValue / 59_900_000_000) * 100).toFixed(1)}%`,
          "Hoạt động tốt",
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_${category}_CEO1983_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất file Excel cho danh mục: ${category}`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Đang xử lý import dữ liệu Excel...");
      await fetchNestApi("/analytics/import?type=general", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, size: file.size }),
      });
      toast.success(`Đã nhập thành công dữ liệu từ file: ${file.name}`);
      fetchOverview();
    } catch {
      toast.error("Lỗi khi nhập file Excel");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Trung Tâm Thống Kê & Báo Cáo CRM CEO 1983"
          subtitle="Báo cáo đa chiều 5 dạng hiển thị: Lưới, Dashboard, Biểu đồ cây, Biểu đồ tròn và Cây đơn vị"
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("tong_hop")}
                className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Xuất Excel</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <Upload className="size-4" />
                <span>Nhập Excel</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportExcel}
              />

              <button
                type="button"
                onClick={fetchOverview}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition"
                title="Làm mới"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          }
        />

        {/* ── 5 VIEW MODES SELECTOR TABS ── */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "GRID"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="size-4" />
            <span>1. Dạng Lưới KPI</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("DASHBOARD")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "DASHBOARD"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>2. Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("TREEMAP")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "TREEMAP"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <GitBranch className="size-4" />
            <span>3. Biểu đồ cây</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("DONUT")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "DONUT"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <PieChart className="size-4" />
            <span>4. Biểu đồ tròn</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("ORG_TREE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer ${
              viewMode === "ORG_TREE"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Network className="size-4" />
            <span>5. Cây đơn vị</span>
          </button>
        </div>

        {/* ── VIEW MODE 1: GRID VIEW (DẠNG LƯỚI KPI) ── */}
        {viewMode === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            <Card className="p-5 border-l-4 border-l-red-600 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Giá trị cơ hội B2B</span>
                <span className="p-2 rounded-xl bg-red-100 text-red-600">
                  <Coins className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoney(data?.summary.totalOpportunitiesValue || 59_900_000_000)}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <ArrowUpRight className="size-3.5" />
                  <span>+18.5% so với tháng trước</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Deal chốt thành công</span>
                <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <Handshake className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoney(data?.summary.totalDealsWonValue || 28_400_000_000)}
                </div>
                <div className="text-xs text-amber-600 font-bold mt-1">
                  {data?.summary.totalDealsWon || 48} hợp đồng hoàn tất
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-[#003B95] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Hội viên hoạt động</span>
                <span className="p-2 rounded-xl bg-blue-100 text-[#003B95]">
                  <Users className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data?.summary.activeMembersCount || 145} / {data?.summary.totalMembers || 180}
                </div>
                <div className="text-xs text-blue-600 font-bold mt-1">
                  80.5% tỷ lệ tham gia sinh hoạt
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Tổng tương tác CLB</span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <TrendingUp className="size-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {(data?.summary.totalInteractions || 1240).toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  Likes, bình luận & kết nối
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── VIEW MODE 2: DASHBOARD (TỔNG QUAN METRICS & TOP PERFORMERS) ── */}
        {viewMode === "DASHBOARD" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Biến động giá trị trao đổi theo khung giờ
                  </h3>
                  <span className="text-xs text-slate-400">08:00 - 20:00 hàng ngày</span>
                </div>
                <div className="flex items-end justify-between h-56 gap-2 pt-4">
                  {(data?.hourlyTrends || []).map((t) => (
                    <div key={t.hour} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div
                        style={{ height: `${Math.max(15, (t.value / 12_000_000_000) * 100)}%` }}
                        className="w-full bg-gradient-to-t from-red-600 via-amber-500 to-amber-400 rounded-t-md hover:brightness-110 transition"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{t.hour}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Top 5 Hội Viên Tích Cực
                </h3>
                <div className="space-y-3">
                  {(data?.topPerformers || []).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white truncate max-w-[120px]">
                          {p.name}
                        </span>
                      </div>
                      <span className="font-extrabold text-red-600">{formatMoney(p.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── VIEW MODE 3: TREEMAP (BIỂU ĐỒ CÂY PHÂN BỐ NGÀNH NGHỀ) ── */}
        {viewMode === "TREEMAP" && (
          <Card className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Biểu Đồ Cây Phân Bố Giá Trị Giao Thương Theo Ngành Nghề
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ trọng quy mô giá trị hợp đồng kết nối giữa các nhóm ngành CLB CEO 1983
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("nganh_nghe")}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Xuất dữ liệu cây</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[300px]">
              {INDUSTRIES_TREEMAP.map((ind, i) => (
                <div
                  key={ind.name}
                  className={`p-4 rounded-2xl text-white ${ind.color} flex flex-col justify-between shadow-sm hover:scale-[1.01] transition-transform`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{ind.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">
                      {ind.count} dự án
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-xl font-black">{formatMoney(ind.value)}</div>
                    <div className="text-[11px] text-white/80 mt-1">
                      {((ind.value / 77_300_000_000) * 100).toFixed(1)}% toàn CLB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── VIEW MODE 4: DONUT (BIỂU ĐỒ TRÒN THEO BAN NGÀNH) ── */}
        {viewMode === "DONUT" && (
          <Card className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Biểu Đồ Tròn Cơ Cấu Hoạt Động & Đóng Góp Các Ban
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tỷ lệ đóng góp giá trị giao thương của từng Ban chuyên môn
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("ban_nganh")}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Xuất dữ liệu Ban</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* CSS Donut Visual Representation */}
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative size-56 rounded-full border-16 border-amber-500 flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase">Tổng cộng</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">59.9 Tỷ đ</div>
                    <div className="text-[10px] text-emerald-600 font-bold">7 Ban chuyên môn</div>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5">
                {COMMITTEES_DATA.map((c) => (
                  <div
                    key={c.name}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="font-bold text-slate-800 dark:text-white">{c.name}</span>
                      <span className="text-[11px] text-slate-400">({c.members} HV)</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(c.dealsValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── VIEW MODE 5: ORG_TREE (CÂY ĐƠN VỊ CƠ CẤU TỔ CHỨC) ── */}
        {viewMode === "ORG_TREE" && (
          <Card className="p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cây Đơn Vị & Sơ Đồ Cơ Cấu Tổ Chức CLB CEO 1983
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu trúc phân cấp và trách nhiệm chỉ tiêu giao thương của các Ban
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCategoryExcel("co_cau_to_chuc")}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Xuất cơ cấu tổ chức</span>
              </button>
            </div>

            {/* Tree root */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-extrabold text-sm shadow-md text-center max-w-sm w-full border-2 border-amber-300">
                <span>BAN CHỦ TỊCH & BAN ĐIỀU HÀNH CLB CEO 1983</span>
                <div className="text-[11px] font-normal text-amber-100 mt-0.5">
                  12 Thành viên • Định hướng & Điều phối toàn hệ sinh thái
                </div>
              </div>

              {/* Trunk line */}
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700" />

              {/* Children branches */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {COMMITTEES_DATA.slice(1).map((c) => (
                  <div
                    key={c.name}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-2xs hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-amber-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {c.members} Hội viên
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Chỉ tiêu giao thương:</span>
                      <span className="font-extrabold text-red-600">{formatMoney(c.dealsValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
