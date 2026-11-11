import React, { useState, useEffect } from "react";
import { Mail, Calendar } from "lucide-react";
import { InvitationSetupManager } from "./InvitationSetupManager";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";

export type TemplateTab = "email" | "invitation-setup";

export interface PageTemplatesHubProps {
  initialTab?: TemplateTab;
}

export function PageTemplatesHub({ initialTab = "email" }: PageTemplatesHubProps) {
  const [activeTab, setActiveTab] = useState<TemplateTab>(initialTab);

  // Sync with URL query parameter
  useEffect(() => {
    const updateFromUrl = () => {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const tabParam = sp.get("tab") as TemplateTab;
        if (tabParam && ["email", "invitation-setup"].includes(tabParam)) {
          setActiveTab(tabParam);
        } else if (!tabParam) {
          setActiveTab("email");
        }
      }
    };

    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, []);

  const handleTabChange = (tab: TemplateTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-TAB SWITCHER: QUẢN LÝ TEMPLATE & QUẢN LÝ THƯ MỜI */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => handleTabChange("email")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "email"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Mail className="size-4" />
          <span>Quản lý Template</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("invitation-setup")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "invitation-setup"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Calendar className="size-4" />
          <span>Quản lý Thư Mời</span>
        </button>
      </div>

      {/* RENDER CURRENT ACTIVE SUB-FUNCTION */}
      <div className="animate-in fade-in-50 duration-200">
        {activeTab === "email" && <MailTemplateManager />}
        {activeTab === "invitation-setup" && <InvitationSetupManager />}
      </div>
    </div>
  );
}
