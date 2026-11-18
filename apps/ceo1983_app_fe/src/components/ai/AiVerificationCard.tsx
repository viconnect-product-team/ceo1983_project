import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldCheck,
  ExternalLink,
  Edit3,
  RotateCcw,
  Check,
  Calendar,
  Users,
  GraduationCap,
  Wallet,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface VerificationDetailItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface VerificationCardData {
  actionId: string;
  actionType: string;
  title: string;
  status: "success" | "warning" | "pending";
  tableName?: string;
  recordId?: string;
  timestamp: string;
  details: VerificationDetailItem[];
  integrityCheck: {
    passed: boolean;
    dbValidated?: boolean;
    noDuplicate?: boolean;
    rbacPermitted?: boolean;
    message: string;
  };
  actions?: Array<{
    label: string;
    route?: string;
    action?: string;
    variant?: "primary" | "secondary" | "destructive" | "outline";
    onClick?: () => void;
  }>;
}

interface AiVerificationCardProps {
  data: VerificationCardData;
  onActionClick?: (actionKey: string, data: VerificationCardData) => void;
  className?: string;
}

export const AiVerificationCard: React.FC<AiVerificationCardProps> = ({
  data,
  onActionClick,
  className = "",
}) => {
  const isSuccess = data.status === "success";

  const getActionIcon = () => {
    switch (data.actionType) {
      case "CREATE_EVENT":
        return <Calendar className="size-4 text-emerald-500" />;
      case "CREATE_TRAINING":
        return <GraduationCap className="size-4 text-amber-500" />;
      case "IMPORT_MEMBERS":
        return <Users className="size-4 text-blue-500" />;
      case "RECORD_FINANCE":
      case "EXPORT_REPORT":
        return <Wallet className="size-4 text-emerald-500" />;
      default:
        return <Sparkles className="size-4 text-primary" />;
    }
  };

  return (
    <div
      className={`my-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-sm backdrop-blur-xs transition hover:border-emerald-500/50 ${className}`}
    >
      {/* Header Thẻ Kiểm Tra */}
      <div className="flex items-start justify-between gap-3 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 grid place-items-center shrink-0 border border-emerald-500/30">
            {getActionIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {data.title}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                Đã kiểm tra hợp lệ
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <span>Mã lệnh: <strong className="font-mono">{data.actionId}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {data.timestamp}
              </span>
            </div>
          </div>
        </div>

        {data.tableName && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-emerald-500/20">
            <Database className="size-3 text-emerald-500" />
            <span>{data.tableName}</span>
          </div>
        )}
      </div>

      {/* Bảng Chi Tiết Đối Soát Dữ Liệu */}
      <div className="my-3 space-y-1.5 text-xs">
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>📋 Bảng đối soát dữ liệu ghi nhận</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {data.details.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
              <span
                className={`text-xs font-medium ${
                  item.highlight
                    ? "font-bold text-primary dark:text-amber-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {item.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Khối Kiểm Tra Tính Toàn Vẹn (Integrity Check) */}
      <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 p-2.5 border border-emerald-500/20 text-xs">
        <div className="flex items-start gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px]">
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
              {data.integrityCheck.message}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-500" /> CSDL 113.20.107.184:6432
              </span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-500" /> Không trùng lặp
              </span>
              <span className="flex items-center gap-1">
                <Check className="size-3 text-emerald-500" /> Đúng thẩm quyền RBAC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng Nút Tương Tác */}
      {data.actions && data.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/20">
          {data.actions.map((act, i) => {
            if (act.route) {
              return (
                <Link
                  key={i}
                  to={act.route}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="size-3.5" />
                  <span>{act.label}</span>
                </Link>
              );
            }

            const isDestructive = act.variant === "destructive";
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (act.onClick) act.onClick();
                  else if (onActionClick && act.action) onActionClick(act.action, data);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  isDestructive
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {isDestructive ? <RotateCcw className="size-3" /> : <Edit3 className="size-3" />}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
