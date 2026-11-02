import React, { useState } from "react";
import {
  Mail,
  MessageCircle,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";
import { ReplyTemplatesEditor } from "@/components/dashboard/ReplyTemplatesEditor";

export function OmnichannelTemplatesSection() {
  const [activeSubTab, setActiveSubTab] = useState<"email" | "replies">("email");

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Mail className="size-3.5" />
              <span>Quản Lý Mẫu Email CRM &amp; Phản Hồi</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Hệ Thống Mẫu Email &amp; Câu Trả Lời Nhanh
            </h3>
            <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Quản lý tập trung các mẫu Email HTML Dynamic visual phục vụ gửi thư mời, hội phí, kỷ niệm và kho phản hồi nhanh cho Hội viên CLB CEO 1983.
            </p>
          </div>

          {/* Sub-tabs switch */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab("email")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "email"
                  ? "bg-white text-blue-700 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <FileText className="size-3.5" />
              <span>Mẫu Email CRM</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("replies")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeSubTab === "replies"
                  ? "bg-white text-blue-700 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <MessageCircle className="size-3.5" />
              <span>Mẫu Phản Hồi Nhanh</span>
            </button>
          </div>
        </div>
      </div>

      {/* NỘI DUNG TỪNG SUB-TAB */}
      {activeSubTab === "email" && (
        <div className="space-y-4">
          <MailTemplateManager />
        </div>
      )}

      {activeSubTab === "replies" && (
        <div className="space-y-4">
          <ReplyTemplatesEditor />
        </div>
      )}
    </div>
  );
}
