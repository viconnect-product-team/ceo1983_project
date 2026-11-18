import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Database,
  ArrowRight,
  Eye,
  Edit3,
  XCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

export interface TaskStep {
  stepId: string;
  name: string;
  description: string;
  toolName: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  error?: string;
  retryCount: number;
}

export interface PlanChecks {
  validCount: number;
  missingCount: number;
  duplicateCount: number;
  conditionsMet: boolean;
  risks: string[];
  warnings?: string[];
}

export interface PreviewContent {
  type: "email" | "zalo" | "excel" | "marketplace" | "matching" | "event" | "training" | "finance" | "generic";
  title: string;
  summary?: string;
  data: Record<string, any>;
}

export interface RevisionDiff {
  fromVersion: number;
  toVersion: number;
  summary: string;
  added: string[];
  modified: string[];
  removed: string[];
  timestamp: string;
}

export interface TaskPlanData {
  taskId: string;
  revisionVersion: number;
  title: string;
  goal: string;
  description: string;
  scope: string[];
  affectedModules: string[];
  dataSources: string[];
  affectedRecords: number;
  steps: TaskStep[];
  previewContent?: PreviewContent;
  checks: PlanChecks;
  requiredRole: string;
  conditions: string[];
  expectedResult: string;
  payloadHash: string;
  createdAt: string;
  updatedAt: string;
}

interface AiTaskPlanCardProps {
  plan: TaskPlanData;
  diff?: RevisionDiff;
  onApprove: (plan: TaskPlanData) => void;
  onRevise: (plan: TaskPlanData, instruction?: string) => void;
  onViewWorkspace?: (plan: TaskPlanData) => void;
  onCancel?: (plan: TaskPlanData) => void;
  isApproving?: boolean;
}

export function AiTaskPlanCard({
  plan,
  diff,
  onApprove,
  onRevise,
  onViewWorkspace,
  onCancel,
  isApproving = false,
}: AiTaskPlanCardProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "preview" | "checks">("plan");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/5 via-slate-50/50 to-white dark:from-amber-950/20 dark:via-slate-900/60 dark:to-slate-950 p-4 sm:p-5 shadow-md shadow-amber-500/5 space-y-4 my-3 text-slate-800 dark:text-slate-100 transition-all">
      {/* 1. HEADER: Task Title & Revision Version Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs">
              <Sparkles className="size-3" />
              <span>KẾ HOẠCH THỰC THI (TASK PLAN)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px]">
              Phiên bản v{plan.revisionVersion}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-[10px] animate-pulse">
              ⏳ CHỜ PHÊ DUYỆT (WAITING_FOR_APPROVAL)
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5 pt-0.5">
            <span>{plan.title}</span>
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            <strong>Mục tiêu:</strong> {plan.goal}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onViewWorkspace && (
            <button
              type="button"
              onClick={() => onViewWorkspace(plan)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Mở không gian làm việc trực quan (Live Workspace)"
            >
              <Eye className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-muted-foreground transition"
            title={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* 2. REVISION DIFF BANNER (Hiển thị điểm khác biệt khi sửa đổi) */}
      {diff && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between font-bold text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500 animate-ping" />
              <span>ĐIỂM THAY ĐỔI TỪ v{diff.fromVersion} SANG v{diff.toVersion}</span>
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
              {new Date(diff.timestamp).toLocaleTimeString("vi-VN")}
            </span>
          </div>
          <p className="font-semibold text-blue-800 dark:text-blue-300">{diff.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            {diff.added.length > 0 && (
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Thêm mới (+):</span>
                {diff.added.map((a, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-300">• {a}</p>
                ))}
              </div>
            )}
            {diff.modified.length > 0 && (
              <div className="space-y-0.5">
                <span className="font-bold text-amber-600 dark:text-amber-400">Điều chỉnh (~) :</span>
                {diff.modified.map((m, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-300">• {m}</p>
                ))}
              </div>
            )}
            {diff.removed.length > 0 && (
              <div className="space-y-0.5">
                <span className="font-bold text-rose-600 dark:text-rose-400">Loại bỏ (-):</span>
                {diff.removed.map((r, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-300">• {r}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* 3. TABS: Kế hoạch thực hiện | Nội dung xem trước | Kiểm tra rủi ro */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("plan")}
              className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "plan"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Các bước thực hiện ({plan.steps.length})</span>
            </button>

            {plan.previewContent && (
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "preview"
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="size-3.5" />
                <span>Xem trước nội dung</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("checks")}
              className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "checks"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Kiểm tra & Rủi ro</span>
            </button>
          </div>

          {/* TAB 1: DANH SÁCH CÁC BƯỚC THỰC HIỆN */}
          {activeTab === "plan" && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
                <div>
                  <span className="text-muted-foreground block">Dữ liệu tác động:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{plan.affectedRecords} bản ghi</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phạm vi module:</span>
                  <strong className="text-slate-900 dark:text-white">{plan.affectedModules.join(", ") || "Hội viên"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Nguồn dữ liệu:</span>
                  <strong className="text-slate-900 dark:text-white truncate block">PostgreSQL 113.20.107.184:6432</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Quyền phê duyệt:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">{plan.requiredRole}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {plan.steps.map((step, idx) => (
                  <div
                    key={step.stepId}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-xs shadow-2xs hover:border-amber-500/40 transition"
                  >
                    <div className="size-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 grid place-items-center font-bold font-mono text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{step.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                          {step.toolName}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: XEM TRƯỚC NỘI DUNG THỰC TẾ (PREVIEW) */}
          {activeTab === "preview" && plan.previewContent && (
            <div className="space-y-2.5 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    <span>{plan.previewContent.title}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Dự kiến gửi: <strong>{plan.previewContent.data?.recipientsCount || plan.affectedRecords} người nhận</strong>
                  </span>
                </div>

                {plan.previewContent.data?.subject && (
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-muted-foreground font-normal">Tiêu đề: </span>
                    {plan.previewContent.data.subject}
                  </div>
                )}

                {plan.previewContent.data?.attachments && plan.previewContent.data.attachments.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px]">
                    <Paperclip className="size-3.5 text-primary" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Tệp đính kèm: {plan.previewContent.data.attachments.map((a: any) => `${a.name} (${a.size})`).join(", ")}
                    </span>
                  </div>
                )}

                {plan.previewContent.data?.bodyHtml && (
                  <div
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed max-h-56 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: plan.previewContent.data.bodyHtml }}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KIỂM TRA TÍNH TOÀN VẸN & RỦI RO */}
          {activeTab === "checks" && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-center">
                  <span className="text-[10px] block text-emerald-600 dark:text-emerald-400 font-bold uppercase">Hợp lệ</span>
                  <strong className="text-base font-black font-mono">{plan.checks.validCount}</strong>
                </div>
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-center">
                  <span className="text-[10px] block text-amber-600 dark:text-amber-400 font-bold uppercase">Thiếu thông tin</span>
                  <strong className="text-base font-black font-mono">{plan.checks.missingCount}</strong>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-center">
                  <span className="text-[10px] block text-muted-foreground font-bold uppercase">Trùng lặp</span>
                  <strong className="text-base font-black font-mono">{plan.checks.duplicateCount}</strong>
                </div>
              </div>

              {plan.checks.risks.length > 0 && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                    <AlertTriangle className="size-3.5" />
                    <span>Rủi ro & Điểm cần lưu ý:</span>
                  </div>
                  {plan.checks.risks.map((r, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      • {r}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <Database className="size-3.5 text-primary shrink-0" />
                <span>
                  Mã băm Payload: <strong className="font-mono text-[10px] text-slate-800 dark:text-slate-200">{plan.payloadHash.slice(0, 16)}...</strong> (Bất biến)
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. FOOTER: NÚT ĐIỀU KHIỂN BẮT BUỘC (DUYỆT THỰC HIỆN, SỬA YÊU CẦU, HỦY) */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Info className="size-3.5 text-amber-500 shrink-0" />
          <span>Chỉ bắt đầu thực thi khi Quý Anh/Chị nhấn nút duyệt bên dưới.</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={() => onCancel(plan)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-xs font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              Hủy tác vụ
            </button>
          )}

          <button
            type="button"
            onClick={() => onRevise(plan)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Đề xuất thêm bớt hoặc thay đổi điều kiện"
          >
            <Edit3 className="size-3.5" />
            <span>Chỉnh sửa yêu cầu</span>
          </button>

          <button
            type="button"
            onClick={() => onApprove(plan)}
            disabled={isApproving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <ShieldCheck className="size-4 text-slate-950" />
            <span>{isApproving ? "Đang phê duyệt & khởi động..." : "DUYỆT THỰC HIỆN"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
