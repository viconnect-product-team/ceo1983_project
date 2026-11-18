import React, { useState } from "react";
import { Calendar, FileSpreadsheet } from "lucide-react";
import { InvitationSetupManager } from "./InvitationSetupManager";
import { FormTemplatesManager } from "./FormTemplatesManager";
import { useNavigate } from "@tanstack/react-router";

export type TemplateTab = "invitation-setup" | "forms";

export interface PageTemplatesHubProps {
  initialTab?: string;
}

export function PageTemplatesHub({ initialTab = "invitation-setup" }: PageTemplatesHubProps) {
  const [activeTab, setActiveTab] = useState<TemplateTab>(
    initialTab === "forms" ? "forms" : "invitation-setup"
  );
  const navigate = useNavigate();

  const handleTabChange = (tab: TemplateTab) => {
    setActiveTab(tab);
    navigate({
      to: "/templates",
      search: { tab },
      replace: true,
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar chuyển đổi giữa Biểu mẫu định dạng và Thư mời */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => handleTabChange("forms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "forms"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileSpreadsheet className="size-4" />
          <span>Biểu Mẫu & Định Dạng (Excel, PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("invitation-setup")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "invitation-setup"
              ? "bg-[#003B95] text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="size-4" />
          <span>Quản lý Thư Mời Sự Kiện</span>
        </button>
      </div>

      {/* RENDER CURRENT ACTIVE SUB-FUNCTION */}
      <div className="animate-in fade-in-50 duration-200">
        {activeTab === "forms" ? (
          <FormTemplatesManager />
        ) : (
          <InvitationSetupManager />
        )}
      </div>
    </div>
  );
}
