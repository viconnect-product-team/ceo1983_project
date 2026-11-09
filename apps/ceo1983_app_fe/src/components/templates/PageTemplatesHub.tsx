import React, { useState, useEffect } from "react";
import {
  LayoutTemplate,
  Sparkles,
  Mail,
  MessageSquare,
  Wallet,
  Users2,
  FileText,
  Layers,
  ChevronRight,
} from "lucide-react";
import { InvitationTemplateStudio } from "./InvitationTemplateStudio";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";
import { ZaloTemplateManager } from "./ZaloTemplateManager";
import { DuesTemplateManager } from "./DuesTemplateManager";
import { ForumMeetingTemplateManager } from "./ForumMeetingTemplateManager";

export type TemplateTab =
  | "invitation"
  | "email"
  | "zalo"
  | "dues"
  | "forum-meetings";

export interface PageTemplatesHubProps {
  initialTab?: TemplateTab;
}

export function PageTemplatesHub({ initialTab = "invitation" }: PageTemplatesHubProps) {
  const [activeTab, setActiveTab] = useState<TemplateTab>(initialTab);

  // Sync with URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get("tab") as TemplateTab;
      if (
        tabParam &&
        ["invitation", "email", "zalo", "dues", "forum-meetings"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: TemplateTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const tabsConfig = [
    {
      id: "invitation" as TemplateTab,
      label: "Template Thư Mời",
      icon: Sparkles,
      desc: "Tải poster hoặc tự tạo poster thư mời & gửi đa kênh",
      badge: "Mới",
      badgeColor: "bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30",
    },
    {
      id: "email" as TemplateTab,
      label: "Template Email",
      icon: Mail,
      desc: "Mẫu email HTML CRM gửi thư mời, hội phí, kỷ niệm",
      badge: "HTML v3",
      badgeColor: "bg-blue-500/20 text-blue-500 dark:text-blue-300 border-blue-500/30",
    },
    {
      id: "zalo" as TemplateTab,
      label: "Template Mẫu Tin Nhắn Zalo",
      icon: MessageSquare,
      desc: "Mẫu thông báo Zalo OA ZNS tới SĐT hội viên",
      badge: "ZNS",
      badgeColor: "bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border-cyan-500/30",
    },
    {
      id: "dues" as TemplateTab,
      label: "Thanh Toán Hội Phí",
      icon: Wallet,
      desc: "Cấu hình ngân hàng, VietQR động & định mức niên liễm",
      badge: "VietQR",
      badgeColor: "bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border-emerald-500/30",
    },
    {
      id: "forum-meetings" as TemplateTab,
      label: "Mẫu Cuộc Gặp Diễn Đàn",
      icon: Users2,
      desc: "Kịch bản Diễn đàn B2B, Cafe kết nối & Họp Ban",
      badge: "Agenda",
      badgeColor: "bg-purple-500/20 text-purple-500 dark:text-purple-300 border-purple-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5 SUB-FUNCTION TAB SWITCHER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {tabsConfig.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition cursor-pointer ${
                  isActive
                    ? "border-amber-500/80 bg-amber-50/60 dark:bg-amber-950/25 ring-1 ring-amber-500/40 shadow-xs"
                    : "border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${t.badgeColor}`}
                  >
                    {t.badge}
                  </span>
                </div>
                <div
                  className={`text-xs font-bold mt-1 line-clamp-1 ${
                    isActive
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {t.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER CURRENT ACTIVE SUB-FUNCTION */}
      <div className="animate-in fade-in-50 duration-200">
        {activeTab === "invitation" && <InvitationTemplateStudio />}
        {activeTab === "email" && <MailTemplateManager />}
        {activeTab === "zalo" && <ZaloTemplateManager />}
        {activeTab === "dues" && <DuesTemplateManager />}
        {activeTab === "forum-meetings" && <ForumMeetingTemplateManager />}
      </div>
    </div>
  );
}

