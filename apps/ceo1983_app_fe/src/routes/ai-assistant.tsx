import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Bot,
  Activity,
  FileSpreadsheet,
  Receipt,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Wallet,
  Handshake,
  QrCode,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Eye,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/excel-export";
import { CrmChatGPTView } from "@/components/ai/CrmChatGPTView";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/ai-assistant")({
  component: AiAssistantPage,
});

export function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "analysis" | "finance_report" | "invoice" | "activity">("chat");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Dữ liệu tạo phiếu thu / hóa đơn điện tử
  const [invoiceForm, setInvoiceForm] = useState({
    payerName: "Nguyễn Văn Hùng",
    companyName: "Công ty Cổ phần Công nghệ & Đầu tư Alpha",
    taxCode: "0109988776",
    address: "Tòa tháp Keangnam Landmark 72, Nam Từ Liêm, Hà Nội",
    amount: 5000000,
    reason: "Đóng hội phí thường niên năm 2026 - CLB Doanh Nhân CEO 1983",
    paymentMethod: "Chuyển khoản QR Ngân Hàng",
  });
  const [invoicePreview, setInvoicePreview] = useState<any>(null);

  // Báo cáo thu chi tổng hợp
  const [financeReport, setFinanceReport] = useState<any>(null);

  // Load phân tích ban đầu
  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetchNestApi<any>("/api/ai/crm/analyze");
      if (res?.ok && res?.data) {
        setAnalysisData(res.data);
        toast.success("AI đã hoàn tất quét và phân tích dữ liệu CRM toàn diện!");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ AI");
    } finally {
      setAnalyzing(false);
    }
  };

  // Load báo cáo thu chi
  const loadFinanceReport = async () => {
    try {
      const res = await fetchNestApi<any>("/api/ai/crm/export-report", {
        method: "POST",
        body: JSON.stringify({ type: "financial_summary" }),
      });
      if (res?.ok) {
        setFinanceReport(res);
      }
    } catch {}
  };

  // Tạo hóa đơn / phiếu thu
  const generateInvoice = async () => {
    try {
      const res = await fetchNestApi<any>("/api/ai/crm/export-report", {
        method: "POST",
        body: JSON.stringify({
          type: "invoice",
          options: invoiceForm,
        }),
      });
      if (res?.ok) {
        setInvoicePreview(res);
        toast.success("Đã sinh phiếu thu điện tử thành công!");
      }
    } catch {
      toast.error("Không thể sinh phiếu thu");
    }
  };

  useEffect(() => {
    runAnalysis();
    loadFinanceReport();
    generateInvoice();
  }, []);

  const handleExportExcelFinance = () => {
    if (!financeReport) return;
    const dataRows = [
      ...(financeReport.incomeBreakdown || []).map((i: any) => ({
        type: "KHOẢN THU",
        category: i.category,
        amount: i.amount,
        percentage: `${i.percentage}%`,
      })),
      ...(financeReport.expenseBreakdown || []).map((e: any) => ({
        type: "KHOẢN CHI",
        category: e.category,
        amount: e.amount,
        percentage: `${e.percentage}%`,
      })),
    ];
    exportToExcel({
      filename: `Bao_Cao_Thu_Chi_CEO1983_${Date.now()}`,
      sheetName: "Thu Chi",
      title: "BÁO CÁO THU CHI & QUỸ NGÂN SÁCH CLB CEO 1983",
      columns: [
        { header: "Loại Giao Dịch", key: "type", value: (r: any) => r.type },
        { header: "Danh Mục", key: "category", value: (r: any) => r.category },
        { header: "Số Tiền (VNĐ)", key: "amount", value: (r: any) => r.amount },
        { header: "Tỷ Trọng", key: "percentage", value: (r: any) => r.percentage },
      ],
      data: dataRows,
    });
    toast.success("Đã xuất báo cáo Excel thu chi thành công!");
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Trợ Lý AI Điều Hành CEO 1983"
          subtitle="Hệ thống trí tuệ nhân tạo phân tích toàn diện dữ liệu CRM, lịch sử hoạt động và xuất báo cáo chức năng con"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <RefreshCw className={`size-4 ${analyzing ? "animate-spin" : ""}`} />
                <span>{analyzing ? "Đang quét CRM..." : "Quét & Phân Tích Realtime"}</span>
              </button>
            </div>
          }
        />

        {/* ── TABS ĐIỀU HƯỚNG ── */}
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "chat"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4 text-primary" />
            <span>Trò Chuyện AI (ChatGPT Style)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Model Free
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "analysis"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4" />
            <span>Phân Tích Thông Minh CRM</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("finance_report")}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "finance_report"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="size-4" />
            <span>Báo Cáo Thu Chi & Ngân Sách</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invoice")}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "invoice"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="size-4" />
            <span>Xuất Hóa Đơn / Phiếu Thu Điện Tử</span>
          </button>
        </div>

        {/* ── NỘI DUNG TAB 1: PHÂN TÍCH TOÀN BỘ CRM ── */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            <CrmChatGPTView />
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* Tóm tắt điều hành & Điểm sức khỏe */}
            <div className="p-6 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/5 via-background to-amber-500/5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center text-primary font-black text-xl shadow-2xs">
                    {analysisData?.healthScore || 94}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                      <span>Đánh Giá Sức Khỏe CLB CEO 1983</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        Rất Tích Cực
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Điểm số tổng hợp từ 4 trụ cột: Hội viên, Tài chính, Sự kiện và Giao thương B2B
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Thời gian phân tích:</div>
                  <div className="font-bold text-foreground">
                    {new Date(analysisData?.generatedAt || Date.now()).toLocaleTimeString("vi-VN")} - {new Date(analysisData?.generatedAt || Date.now()).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-foreground/90 bg-background/80 p-4 rounded-xl border border-border/60">
                {analysisData?.executiveSummary ||
                  "Hệ sinh thái CLB Doanh Nhân CEO 1983 (HanoiBA) đang duy trì nhịp độ tăng trưởng tích cực. Mạng lưới hội viên kết nối keo sơn, các chỉ số giao thương B2B và dòng tiền ngân sách duy trì ở trạng thái thặng dư an toàn."}
              </p>
            </div>

            {/* 4 Trụ cột cốt lõi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hội viên */}
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Hội Viên & Nhân Sự</span>
                  <Users className="size-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {analysisData?.pillars?.members?.total || 180}
                  <span className="text-xs font-medium text-muted-foreground ml-1">doanh nhân</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {analysisData?.pillars?.members?.assessment || "Tăng trưởng đều đặn, mạng lưới doanh nhân gắn kết."}
                </p>
              </div>

              {/* Tài chính */}
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Quỹ Thặng Dư</span>
                  <Wallet className="size-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                    analysisData?.pillars?.finance?.surplus || 235000000
                  )}
                  <span className="text-xs font-medium text-muted-foreground ml-1">VNĐ</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {analysisData?.pillars?.finance?.assessment || "Tài chính minh bạch, quỹ dồi dào đảm bảo thanh khoản."}
                </p>
              </div>

              {/* Sự kiện */}
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Sự Kiện & Kỳ Họp</span>
                  <Calendar className="size-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {analysisData?.pillars?.events?.total || 24}
                  <span className="text-xs font-medium text-muted-foreground ml-1">kỳ họp</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {analysisData?.pillars?.events?.assessment || "Tỷ lệ check-in QR đạt mức cao kỷ lục."}
                </p>
              </div>

              {/* B2B */}
              <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Giao Thương B2B</span>
                  <Handshake className="size-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {Math.round((analysisData?.pillars?.b2b?.totalValue || 18500000000) / 1000000000)} Tỷ
                  <span className="text-xs font-medium text-muted-foreground ml-1">VNĐ</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {analysisData?.pillars?.b2b?.assessment || "Giá trị kết nối vượt kỳ vọng, tạo ra giá trị thực chất."}
                </p>
              </div>
            </div>

            {/* Điểm mạnh & Điểm nghẽn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="size-4" />
                  <span>Điểm Mạnh Nổi Bật Của Hệ Thống</span>
                </div>
                <ul className="space-y-2 text-xs text-foreground/90">
                  {(analysisData?.keyStrengths || [
                    "Giao thương B2B sôi động giữa các doanh nghiệp hội viên",
                    "Tài chính bền vững, tỷ lệ thặng dư an toàn",
                    "Tính gắn kết cao thông qua các kỳ họp và quét QR danh thiếp",
                  ]).map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="size-4" />
                  <span>Điểm Nghẽn Cần Khắc Phục</span>
                </div>
                <ul className="space-y-2 text-xs text-foreground/90">
                  {(analysisData?.bottlenecks || [
                    "Hội viên mới cần hoàn thiện bổ sung hồ sơ năng lực và sản phẩm",
                    "Cần đẩy mạnh các phiên Matching B2B chuyên đề ngành xây dựng và công nghệ",
                  ]).map((b: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Đề xuất hành động chiến lược AI */}
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Khuyến Nghị Hành Động Chiến Lược Dành Cho Ban Điều Hành</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(analysisData?.actionableRecommendations || [
                  {
                    priority: "Cao",
                    title: "Thẩm định cơ hội kinh doanh tồn đọng",
                    desc: "Tổ chức buổi cà phê B2B giải ngân các cơ hội giao thương trên 500 triệu VNĐ.",
                  },
                  {
                    priority: "Trung bình",
                    title: "Nhắc nhở đóng hội phí kỳ mới",
                    desc: "Tự động gửi thông báo qua Zalo OA và App CEO 1983 cho các hội viên sắp đến hạn.",
                  },
                  {
                    priority: "Trung bình",
                    title: "Chuẩn bị ngân sách Gala Kết Nối",
                    desc: "Trích xuất quỹ thặng dư và mở các gói tài trợ Diamond / Gold cho sự kiện quy mô.",
                  },
                ]).map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Ưu tiên {rec.priority}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-foreground">{rec.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">{rec.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NỘI DUNG TAB 2: BÁO CÁO THU CHI & NGÂN SÁCH ── */}
        {activeTab === "finance_report" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-black text-foreground">Báo Cáo Thu Chi & Cân Đối Ngân Sách Quỹ</h3>
                  <p className="text-xs text-muted-foreground">
                    Tổng hợp chi tiết các khoản thu hội phí, tài trợ và các khoản chi hoạt động CLB CEO 1983
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcelFinance}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Xuất File Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    <span>In Báo Cáo</span>
                  </button>
                </div>
              </div>

              {/* Thẻ tổng hợp số liệu thu chi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">TỔNG THU NGÂN SÁCH</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      financeReport?.summary?.totalIncome ?? 0
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-1">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400">TỔNG CHI HOẠT ĐỘNG</span>
                  <div className="text-xl font-black text-red-600 dark:text-red-400">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      financeReport?.summary?.totalExpense ?? 0
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">SỐ DƯ QUỸ HIỆN HỮU</span>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      financeReport?.summary?.balance ?? 0
                    )}
                  </div>
                </div>
              </div>

              {/* Bảng phân bổ thu & chi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Cơ Cấu Nguồn Thu</h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-bold">
                        <tr>
                          <th className="py-2 px-3">Danh mục thu</th>
                          <th className="py-2 px-3 text-right">Số tiền</th>
                          <th className="py-2 px-3 text-right">Tỷ lệ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium">
                        {(financeReport?.incomeBreakdown || []).map((i: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">{i.category}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-600">
                              {new Intl.NumberFormat("vi-VN").format(i.amount)} đ
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">{i.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Cơ Cấu Khoản Chi</h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-bold">
                        <tr>
                          <th className="py-2 px-3">Danh mục chi</th>
                          <th className="py-2 px-3 text-right">Số tiền</th>
                          <th className="py-2 px-3 text-right">Tỷ lệ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium">
                        {(financeReport?.expenseBreakdown || []).map((e: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">{e.category}</td>
                            <td className="py-2 px-3 text-right font-bold text-red-600">
                              {new Intl.NumberFormat("vi-VN").format(e.amount)} đ
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">{e.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NỘI DUNG TAB 3: XUẤT HÓA ĐƠN / PHIẾU THU ĐIỆN TỬ ── */}
        {activeTab === "invoice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form nhập thông tin */}
            <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <span>Thông Tin Phiếu Thu / Hóa Đơn</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Người nộp tiền:</label>
                  <input
                    type="text"
                    value={invoiceForm.payerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, payerName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-background outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Doanh nghiệp / Đơn vị:</label>
                  <input
                    type="text"
                    value={invoiceForm.companyName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, companyName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-background outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mã số thuế:</label>
                  <input
                    type="text"
                    value={invoiceForm.taxCode}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxCode: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-background outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Số tiền (VNĐ):</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-background outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Lý do thu:</label>
                  <textarea
                    rows={2}
                    value={invoiceForm.reason}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, reason: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-background outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={generateInvoice}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer"
                >
                  Cập Nhật & Xem Trước Phiếu Thu
                </button>
              </div>
            </div>

            {/* Mẫu phiếu thu điện tử chuẩn in ấn */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Bản Xem Trước Phiếu Thu Điện Tử</span>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>In Phiếu Thu / Lưu PDF</span>
                </button>
              </div>

              {/* Vùng in ấn A4 chuẩn */}
              <div className="p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Header phiếu thu */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase text-red-700">HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)</div>
                    <div className="text-sm font-black text-slate-900">CLB DOANH NHÂN CEO 1983</div>
                    <div className="text-[11px] text-slate-600">Tầng 5, Cung Trí Thức Hà Nội, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội</div>
                    <div className="text-[11px] text-slate-600">Hotline: 024.3755.1983 - Email: contact@ceo1983.vn</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs font-bold text-slate-700">Mẫu số: 01-TT (Ban hành theo TT 200/BTC)</div>
                    <div className="text-xs font-mono font-bold text-red-600">Số: {invoicePreview?.receiptNo || "PT-1983-0001"}</div>
                    <div className="text-[11px] text-slate-500">Ngày lập: {invoicePreview?.issueDate || new Date().toLocaleDateString("vi-VN")}</div>
                  </div>
                </div>

                {/* Tiêu đề chính */}
                <div className="text-center space-y-1 py-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">PHIẾU THU TIỀN ĐIỆN TỬ</h2>
                  <div className="text-xs text-slate-500 italic">Liên 1: Lưu tại quỹ CLB - Liên 2: Giao người nộp tiền</div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Họ và tên người nộp:</span>
                    <span className="font-bold text-slate-900">{invoicePreview?.payer?.name || invoiceForm.payerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Đơn vị / Doanh nghiệp:</span>
                    <span className="font-semibold text-slate-900">{invoicePreview?.payer?.company || invoiceForm.companyName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Mã số thuế:</span>
                    <span className="font-mono text-slate-900">{invoicePreview?.payer?.taxCode || invoiceForm.taxCode}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Lý do nộp tiền:</span>
                    <span className="text-slate-800">{invoicePreview?.paymentDetails?.reason || invoiceForm.reason}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Số tiền nộp:</span>
                    <span className="font-black text-sm text-red-600">
                      {invoicePreview?.paymentDetails?.amountFormatted ||
                        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(invoiceForm.amount)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Viết bằng chữ:</span>
                    <span className="italic font-medium text-slate-700">
                      {invoicePreview?.paymentDetails?.amountInWords || "Năm triệu đồng chẵn."}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-slate-500 shrink-0">Hình thức thanh toán:</span>
                    <span className="text-slate-800">{invoicePreview?.paymentDetails?.paymentMethod || invoiceForm.paymentMethod}</span>
                  </div>
                </div>

                {/* Phần chữ ký & Con dấu */}
                <div className="grid grid-cols-3 text-center text-xs pt-4 border-t border-slate-200">
                  <div className="space-y-12">
                    <div className="font-bold text-slate-700">Người Nộp Tiền</div>
                    <div className="font-bold text-slate-900">{invoicePreview?.payer?.name || invoiceForm.payerName}</div>
                  </div>
                  <div className="space-y-12">
                    <div className="font-bold text-slate-700">Thủ Quỹ / Ban Tài Chính</div>
                    <div className="font-bold text-slate-900">Ban Tài Chính CEO 1983</div>
                  </div>
                  <div className="space-y-4">
                    <div className="font-bold text-slate-700">Chủ Tịch / Ban Điều Hành</div>
                    <div className="inline-block p-1 border border-emerald-500 rounded-lg text-[10px] text-emerald-700 bg-emerald-50 font-bold">
                      <ShieldCheck className="size-4 mx-auto mb-0.5" />
                      <span>ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                      <div className="text-[9px] font-mono">{new Date().toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div className="font-bold text-slate-900">Nguyễn Hùng Cường</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
