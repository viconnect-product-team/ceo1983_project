import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useT, type TKey } from "@/lib/i18n";
import { WorkspaceSummaryCards } from "@/components/business-connect/meeting/workspace/WorkspaceSummaryCards";
import { WorkspaceBucketList } from "@/components/business-connect/meeting/workspace/WorkspaceBucketList";
import type { MeetingWorkspaceBucket } from "@/lib/meeting/workspace/types";
import { MEETING_WORKSPACE_BUCKETS } from "@/lib/meeting/workspace/types";
import { Create1on1MeetingModal } from "@/components/meetings/Create1on1MeetingModal";
import { Calendar, Clock, MapPin, Video, User, Phone, Plus, Sparkles, Building2 } from "lucide-react";

export const Route = createFileRoute("/business-connect/meetings/")({
  head: () => ({
    meta: [
      { title: "Cuộc Gặp Kết Nối — Business Connect" },
      { name: "description", content: "Quản lý và lên lịch cuộc gặp kết nối 1-on-1 giữa các hội viên doanh nghiệp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeetingsWorkspacePage,
});

const TAB_LABEL: Record<MeetingWorkspaceBucket, TKey> = {
  overview: "bc.meetings.workspace.tab.overview",
  needs_action: "bc.meetings.workspace.tab.needs_action",
  upcoming: "bc.meetings.workspace.tab.upcoming",
  unscheduled: "bc.meetings.workspace.tab.unscheduled",
  history: "bc.meetings.workspace.tab.history",
};

interface ConnectionMeetingItem {
  id: string;
  title: string;
  hostName: string;
  partnerName: string;
  partnerPhone?: string;
  partnerCompany?: string;
  date: string;
  time: string;
  venueType: "offline" | "online";
  venue: string;
  onlineUrl?: string;
  notes?: string;
  status: string;
}

function MeetingsWorkspacePage() {
  const t = useT();
  const [bucket, setBucket] = useState<MeetingWorkspaceBucket>("overview");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localMeetings, setLocalMeetings] = useState<ConnectionMeetingItem[]>([]);

  const loadMeetings = () => {
    try {
      const stored = localStorage.getItem("ceo1983_meetings_history") || localStorage.getItem("vione_meetings_history") || "[]";
      setLocalMeetings(JSON.parse(stored));
    } catch {
      setLocalMeetings([]);
    }
  };

  useEffect(() => {
    loadMeetings();
    const onUpdate = () => loadMeetings();
    window.addEventListener("ceo1983:calendar-updated", onUpdate);
    window.addEventListener("vione:meetings-updated", onUpdate);
    return () => {
      window.removeEventListener("ceo1983:calendar-updated", onUpdate);
      window.removeEventListener("vione:meetings-updated", onUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Quản Lý Cuộc Gặp Kết Nối 1-on-1</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lịch gặp gỡ kết nối, cơ hội hợp tác kinh doanh và trao đổi giao thương đồng bộ đa nền tảng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer transition hover:bg-blue-700 bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Cuộc Gặp Kết Nối</span>
        </button>
      </div>

      <WorkspaceSummaryCards />

      {/* Danh sách các cuộc gặp kết nối 1-on-1 được tạo */}
      {localMeetings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Cuộc Gặp Kết Nối Đã Lên Lịch Gần Đây ({localMeetings.length})
            </h3>
            <span className="text-xs text-muted-foreground">Đồng bộ từ App CEO 1983 & ViOne</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localMeetings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                      item.venueType === "online"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    }`}
                  >
                    {item.venueType === "online" ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      <strong>Đối tác:</strong> {item.partnerName}{" "}
                      {item.partnerCompany && <span className="opacity-80">({item.partnerCompany})</span>}
                    </span>
                  </div>
                  {item.partnerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{item.partnerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {item.date} lúc {item.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.venueType === "online" ? (
                      <Video className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="truncate">{item.venue}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-muted-foreground bg-secondary/40 p-2 rounded-xl line-clamp-2 italic">
                    "{item.notes}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  {item.venueType === "online" && item.onlineUrl && (
                    <a
                      href={item.onlineUrl.startsWith("http") ? item.onlineUrl : `https://${item.onlineUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                    >
                      Vào Họp Online
                    </a>
                  )}
                  {item.venueType === "offline" && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition"
                    >
                      Xem Bản Đồ
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Phân loại Workspace */}
      <div
        role="tablist"
        aria-label={t("bc.meetings.workspace.title")}
        className="flex flex-wrap gap-1 border-b"
      >
        {MEETING_WORKSPACE_BUCKETS.map((b) => {
          const selected = bucket === b;
          return (
            <button
              key={b}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`ws-panel-${b}`}
              id={`ws-tab-${b}`}
              onClick={() => setBucket(b)}
              className={
                "whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                (selected
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t(TAB_LABEL[b])}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`ws-panel-${bucket}`} aria-labelledby={`ws-tab-${bucket}`}>
        <WorkspaceBucketList bucket={bucket} />
      </div>

      <Create1on1MeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => loadMeetings()}
      />
    </div>
  );
}

