import React from "react";
import { Calendar } from "lucide-react";
import { InvitationSetupManager } from "./InvitationSetupManager";

export type TemplateTab = "invitation-setup";

export interface PageTemplatesHubProps {
  initialTab?: string;
}

export function PageTemplatesHub({ initialTab = "invitation-setup" }: PageTemplatesHubProps) {
  return (
    <div className="space-y-6">
      {/* QUẢN LÝ THƯ MỜI SỰ KIỆN & GALA CEO 1983 */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#003B95] text-white shadow-sm">
          <Calendar className="size-4" />
          <span>Quản lý Thư Mời Sự Kiện</span>
        </div>
      </div>

      {/* RENDER CURRENT ACTIVE SUB-FUNCTION */}
      <div className="animate-in fade-in-50 duration-200">
        <InvitationSetupManager />
      </div>
    </div>
  );
}
