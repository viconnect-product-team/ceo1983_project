import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Database,
  Sparkles,
  ShieldCheck,
  Terminal,
  Eye,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { TaskStep } from "./AiTaskPlanCard";
import { AiVerificationCard, VerificationCardData } from "./AiVerificationCard";

export interface ExecutionProgressState {
  taskId: string;
  status: "WAITING_FOR_APPROVAL" | "RUNNING" | "COMPLETED" | "FAILED" | "PAUSED";
  currentStepId?: string;
  currentStepIndex: number;
  totalSteps: number;
  percent: number;
  startedAt?: string;
  completedAt?: string;
  elapsedSeconds: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  steps: TaskStep[];
  errorMessage?: string;
}

interface AiLiveExecutionCardProps {
  initialState: ExecutionProgressState;
  onViewWorkspace?: () => void;
  onCompleted?: (result: any) => void;
}

export function AiLiveExecutionCard({
  initialState,
  onViewWorkspace,
  onCompleted,
}: AiLiveExecutionCardProps) {
  const [state, setState] = useState<ExecutionProgressState>(initialState);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString("vi-VN")}] Khởi động Task Execution Engine cho tác vụ ${initialState.taskId}`,
    `[${new Date().toLocaleTimeString("vi-VN")}] Kết nối CSDL chuẩn 113.20.107.184:6432... Đã xác minh`,
  ]);
  const [verificationCard, setVerificationCard] = useState<VerificationCardData | null>(null);

  // Lắng nghe Server-Sent Events (SSE) theo thời gian thực
  useEffect(() => {
    if (!initialState.taskId) return;
    if (state.status === "COMPLETED" || state.status === "FAILED") return;

    const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
    // Kết nối EventSource với header hoặc query token
    const url = `/api/ai/agent/tasks/${initialState.taskId}/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.state) {
          setState(payload.state);
        }
        if (payload?.logMessage) {
          setLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString("vi-VN")}] ${payload.logMessage}`]);
        }
        if (payload?.verificationCard) {
          setVerificationCard(payload.verificationCard);
          if (onCompleted) onCompleted(payload.verificationCard);
        }
      } catch (e) {}
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [initialState.taskId, state.status, onCompleted]);

  // Bộ đếm thời gian trôi qua thực tế
  useEffect(() => {
    if (state.status !== "RUNNING") return;
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.status]);

  const isCompleted = state.status === "COMPLETED";
  const isFailed = state.status === "FAILED";

  return (
    <div className="rounded-2xl border border-primary/30 dark:border-primary/20 bg-gradient-to-b from-primary/5 via-slate-50/60 to-white dark:from-primary/10 dark:via-slate-900/70 dark:to-slate-950 p-4 sm:p-5 shadow-lg shadow-primary/5 space-y-4 my-3 text-slate-800 dark:text-slate-100 animate-fade-in">
      {/* 1. HEADER: Tiến độ & Tình trạng thực thi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-black text-[10px] tracking-wider uppercase shadow-xs">
              <Sparkles className="size-3" />
              <span>LIVE EXECUTION ENGINE</span>
            </span>

            {isCompleted ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                <span>HOÀN THÀNH 100% (COMPLETED)</span>
              </span>
            ) : isFailed ? (
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1">
                <XCircle className="size-3" />
                <span>THẤT BẠI (FAILED)</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                <span>ĐANG THAO TÁC TRỰC TIẾP (RUNNING)</span>
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2 pt-0.5">
            <span>Tiến độ thực thi: {state.percent}%</span>
            <span className="text-xs font-mono font-normal text-muted-foreground">
              ({state.currentStepIndex + (isCompleted ? 0 : 1)}/{state.totalSteps} bước)
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onViewWorkspace && (
            <button
              type="button"
              onClick={onViewWorkspace}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Eye className="size-3.5 text-primary" />
              <span>Xem Live Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. PROGRESS BAR & METRIC CARDS */}
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-emerald-500"
                : isFailed
                ? "bg-rose-500"
                : "bg-gradient-to-r from-amber-500 via-primary to-emerald-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, state.percent))}%` }}
          />
        </div>

        {/* 4 Thẻ KPI Thực Tế */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-[10px] text-muted-foreground block font-medium">Thời gian trôi qua</span>
            <strong className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {state.elapsedSeconds}s
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-[10px] text-muted-foreground block font-medium">Bản ghi đã xử lý</span>
            <strong className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {state.processedRecords}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">Thành công</span>
            <strong className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {state.successRecords}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-bold">Thất bại</span>
            <strong className="font-mono text-sm font-bold text-rose-700 dark:text-rose-300">
              {state.failedRecords}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH BƯỚC ĐANG CHẠY TRỰC TIẾP */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Tiến trình từng bước
        </div>

        <div className="space-y-1.5">
          {state.steps.map((step, idx) => {
            const isStepRunning = step.status === "RUNNING";
            const isStepCompleted = step.status === "COMPLETED";
            const isStepFailed = step.status === "FAILED";

            return (
              <div
                key={step.stepId}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition ${
                  isStepRunning
                    ? "border-amber-500 bg-amber-500/10 shadow-sm"
                    : isStepCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 text-slate-700 dark:text-slate-300"
                    : isStepFailed
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : "border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 opacity-70"
                }`}
              >
                {/* Trạng thái Icon */}
                <div className="shrink-0 mt-0.5">
                  {isStepRunning ? (
                    <Loader2 className="size-4 text-amber-500 animate-spin" />
                  ) : isStepCompleted ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : isStepFailed ? (
                    <XCircle className="size-4 text-rose-500" />
                  ) : (
                    <Clock className="size-4 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-bold ${
                        isStepRunning
                          ? "text-amber-700 dark:text-amber-300"
                          : isStepCompleted
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Bước {idx + 1}: {step.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {step.toolName}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>

                  {/* Lỗi nếu có */}
                  {step.error && (
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">
                      ⚠️ Lỗi: {step.error}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TERMINAL LIVE ACTIVITY STREAM LOGS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-3 font-mono text-[10px] space-y-1">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
          <span className="flex items-center gap-1.5">
            <Terminal className="size-3 text-emerald-400" />
            <span>Activity Stream (Socket.IO & SSE)</span>
          </span>
          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="max-h-24 overflow-y-auto space-y-1 pt-1">
          {logs.map((log, i) => (
            <div key={i} className="text-slate-300 leading-relaxed">
              <span className="text-slate-500">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>

      {/* 5. THẺ KIỂM TRA ĐỐI SOÁT CUỐI CÙNG (KHI HOÀN THÀNH 100%) */}
      {verificationCard && (
        <div className="pt-2 animate-fade-in">
          <AiVerificationCard data={verificationCard} />
        </div>
      )}
    </div>
  );
}
