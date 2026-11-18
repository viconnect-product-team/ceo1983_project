import React from "react";
import {
  Calendar,
  GraduationCap,
  Users,
  Wallet,
  Folder,
  FileText,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import type { AiFileActionOption, AiFileClarificationData } from "@/lib/document-parser";

interface AiChoiceChipsProps {
  data: AiFileClarificationData;
  onSelectOption: (option: AiFileActionOption) => void;
  disabled?: boolean;
}

export const AiChoiceChips: React.FC<AiChoiceChipsProps> = ({
  data,
  onSelectOption,
  disabled = false,
}) => {
  const getIcon = (name?: string) => {
    switch (name) {
      case "calendar":
        return <Calendar className="size-4 text-emerald-500" />;
      case "graduation-cap":
        return <GraduationCap className="size-4 text-amber-500" />;
      case "users":
        return <Users className="size-4 text-blue-500" />;
      case "wallet":
        return <Wallet className="size-4 text-rose-500" />;
      case "folder":
        return <Folder className="size-4 text-indigo-500" />;
      case "file-text":
        return <FileText className="size-4 text-slate-500" />;
      default:
        return <Sparkles className="size-4 text-primary" />;
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 shadow-sm backdrop-blur-xs">
      {/* File Meta Header */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-primary/15 text-xs">
        <span className="font-bold text-primary flex items-center gap-1.5">
          <FileText className="size-4" />
          <span>Tệp đính kèm:</span>
        </span>
        <span className="font-semibold text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
          {data.fileName}
        </span>
        <span className="text-[10px] text-muted-foreground">({data.fileSizeFormatted}, {data.totalLines} dòng)</span>
      </div>

      {/* Tóm Tắt Phát Hiện */}
      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
        <p className="font-medium">{data.summary}</p>
      </div>

      {/* Câu Hỏi Ngược Lại */}
      <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-2.5 mb-3 border border-slate-200 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
          <HelpCircle className="size-4 text-amber-500 shrink-0" />
          <span>{data.clarificationQuestion}</span>
        </p>
      </div>

      {/* Danh Sách Các Lựa Chọn Bên Dưới (Choice Chips) */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Chọn một thao tác để AI tự động thực hiện:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption(opt)}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-left hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/15 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer shadow-xs"
            >
              <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 grid place-items-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition">
                {getIcon(opt.iconName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition line-clamp-1">
                    {opt.label}
                  </span>
                  {opt.badge && (
                    <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {opt.description}
                </p>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
