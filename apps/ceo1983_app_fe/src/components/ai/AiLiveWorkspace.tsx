import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Mail,
  ShoppingBag,
  Handshake,
  Calendar,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { TaskPlanData } from "./AiTaskPlanCard";

interface AiLiveWorkspaceProps {
  plan: TaskPlanData;
  isOpen: boolean;
  onClose: () => void;
}

export function AiLiveWorkspace({ plan, isOpen, onClose }: AiLiveWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "data" | "log">("workspace");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const preview = plan.previewContent;
  const isEmail = preview?.type === "email" || plan.scope.some((s) => s.toLowerCase().includes("email"));
  const isExcel = preview?.type === "excel" || plan.title.toLowerCase().includes("excel");
  const isMarketplace = preview?.type === "marketplace" || plan.title.toLowerCase().includes("sản phẩm");
  const isResearch = plan.steps.some((s) => s.toolName.includes("search") || s.toolName.includes("web"));

  // Mock hoặc dữ liệu thực tế cho bảng dữ liệu đang xử lý
  const sampleRows = Array.from({ length: Math.min(plan.affectedRecords, 15) }).map((_, i) => ({
    id: `REC-${1000 + i}`,
    name: `Công ty CP Vận Tải & Logistics Hưng Thịnh ${i + 1}`,
    taxCode: `01089234${10 + i}`,
    representative: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
    phone: `0983 198 ${300 + i}`,
    email: `contact.logistics${i + 1}@hungthinh.vn`,
    scale: i % 3 === 0 ? "Lớn (> 200 NV)" : "Vừa (50 - 200 NV)",
    status: i === 2 ? "warning" : "valid",
    note: i === 2 ? "Cần kiểm tra MST trên Tổng cục thuế" : "Đã đối soát CSDL CLB",
  }));

  const filteredRows = sampleRows.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.taxCode.includes(searchQuery),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl h-[90vh] max-h-[780px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* 1. WORKSPACE HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 grid place-items-center shrink-0">
              {isEmail ? (
                <Mail className="size-5" />
              ) : isExcel ? (
                <FileSpreadsheet className="size-5" />
              ) : isMarketplace ? (
                <ShoppingBag className="size-5" />
              ) : (
                <Globe className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-950 dark:text-white truncate">
                  Live Workspace: {plan.title}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold shrink-0">
                  v{plan.revisionVersion}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Không gian làm việc trực quan • CSDL chuẩn 113.20.107.184:6432
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground grid place-items-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 2. SUB HEADER / TOOLBAR */}
        <div className="px-5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === "workspace"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mô hình trực quan (Visual Action)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === "data"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bảng dữ liệu đối soát ({plan.affectedRecords} dòng)
            </button>
          </div>

          {activeTab === "data" && (
            <div className="relative w-48 sm:w-64">
              <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc tên, MST, email..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* 3. WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "workspace" && (
            <div className="space-y-4 animate-fade-in">
              {/* Nếu là Email Automation */}
              {isEmail && preview?.data && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <Mail className="size-4" />
                      <span>Thư mời điện tử chính thức</span>
                    </span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {preview.data.recipientsCount || plan.affectedRecords} người nhận mục tiêu
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-muted-foreground block">Người gửi:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {preview.data.from || "bantin@ceo1983.vn"}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] text-muted-foreground block">Tiêu đề thư:</span>
                      <strong className="text-slate-800 dark:text-slate-200 line-clamp-1 text-[11px]">
                        {preview.data.subject}
                      </strong>
                    </div>
                  </div>

                  {preview.data.bodyHtml && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-inner">
                      <div
                        className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: preview.data.bodyHtml }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Nếu có Nghiên cứu ngoài (External Research) */}
              {isResearch && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Globe className="size-4" />
                      <span>Nguồn Dữ Liệu & Danh Bạ Đối Soát Bên Ngoài</span>
                    </span>
                    <span className="text-emerald-500 font-normal text-[11px]">✓ Đã xác minh</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Cổng Thông Tin Doanh Nghiệp Quốc Gia</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Tra cứu tự động mã số thuế, đại diện pháp luật và tình trạng hoạt động.
                      </p>
                      <span className="text-[10px] font-mono text-primary block pt-1">
                        thongtindoanhnghiep.co
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Hiệp Hội Doanh Nghiệp Logistics (VLA)</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Danh sách hội viên doanh nghiệp vận tải, kho bãi khu vực miền Bắc.
                      </p>
                      <span className="text-[10px] font-mono text-primary block pt-1">
                        vla.com.vn
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-3 animate-fade-in">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Mã</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Tên Doanh Nghiệp</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Mã Số Thuế</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Đại Diện / SĐT</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Email</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Quy Mô</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 font-normal">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-[10px] text-muted-foreground">{row.id}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                        <td className="p-3 font-mono text-[11px]">{row.taxCode}</td>
                        <td className="p-3">
                          <div>{row.representative}</div>
                          <span className="text-[10px] font-mono text-muted-foreground">{row.phone}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-primary">{row.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                            {row.scale}
                          </span>
                        </td>
                        <td className="p-3">
                          {row.status === "valid" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              <CheckCircle2 className="size-3" />
                              <span>Hợp lệ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                              <AlertCircle className="size-3" />
                              <span>Cần xác minh</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4. WORKSPACE FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-muted-foreground text-[11px]">
            Đang hiển thị <strong>{filteredRows.length}</strong> / {plan.affectedRecords} bản ghi đối soát
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition cursor-pointer text-xs"
          >
            Đóng Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
