import React, { useState, useEffect } from "react";
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
    const updateFromUrl = () => {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const tabParam = sp.get("tab") as TemplateTab;
        if (
          tabParam &&
          ["invitation", "email", "zalo", "dues", "forum-meetings"].includes(tabParam)
        ) {
          setActiveTab(tabParam);
        } else if (!tabParam) {
          setActiveTab("invitation");
        }
      }
    };

    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, []);

  return (
    <div className="space-y-6">
      {/* RENDER CURRENT ACTIVE SUB-FUNCTION DIRECTLY FROM SIDEBAR SELECTION */}
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
