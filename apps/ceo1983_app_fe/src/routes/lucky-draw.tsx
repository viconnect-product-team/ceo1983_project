import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { LuckyDrawLandingBanner } from "@/components/dashboard/LuckyDrawLandingBanner";
import { LuckyDrawWheel } from "@/components/events/LuckyDrawWheel";
import { ArrowLeft, Sparkles, Gift, RotateCcw, SlidersHorizontal, Maximize2, Calendar } from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/lucky-draw")({
  component: LuckyDrawRoutePage,
});

function LuckyDrawRoutePage() {
  const [activeTab, setActiveTab] = useState<"wheel" | "banner">("wheel");
  const [selectedEventId, setSelectedEventId] = useState<string>("event-doanhtri-20261121");
  const [eventsList, setEventsList] = useState<Array<{ id: string; title?: string; name?: string; date?: string; eventDate?: string }>>([]);

  useEffect(() => {
    fetchNestApi<any>("/events?page=1&size=50")
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.items || [];
        setEventsList(items);
        if (items.length > 0) {
          const dtEvent = items.find((e: any) => String(e.id).includes("doanhtri") || String(e.name || e.title).toLowerCase().includes("doanh trí"));
          if (dtEvent) {
            setSelectedEventId(dtEvent.id);
          } else if (!selectedEventId && items[0]?.id) {
            setSelectedEventId(items[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/voting"
              search={{ tab: "all", page: 1, size: 10 }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Biểu quyết & Sự kiện</span>
            </Link>

            <a
              href={`/lucky-draw/${selectedEventId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] px-4 py-2 text-xs font-black text-white hover:opacity-95 transition shadow-md"
              title="Mở toàn màn hình chiếu ra máy chiếu hoặc màn hình LED sân khấu"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Chiếu LED Toàn Màn Hình</span>
            </a>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ chọn sự kiện */}
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#005BAC]" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer max-w-[220px] truncate"
              >
                {eventsList.length === 0 ? (
                  <option value="event-doanhtri-20261121">Kỷ niệm 4 năm Viện Doanh Trí</option>
                ) : (
                  eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title || ev.name || ev.id}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Viện Doanh Trí · Vòng Quay Bốc Thăm Trúng Thưởng</span>
            </div>
          </div>
        </div>

        {/* Chuyển tab giữa Vòng quay xoay tròn và Cấu hình Banner */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("wheel")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "wheel"
                ? "bg-gradient-to-r from-[#005BAC] to-[#00A859] text-white shadow-md"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Vòng Quay Bốc Thăm Trúng Thưởng (Trực Tiếp)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("banner")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "banner"
                ? "bg-gradient-to-r from-[#005BAC] to-[#00A859] text-white shadow-md"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cấu Hình Banner & Thể Lệ Sự Kiện</span>
          </button>
        </div>

        {/* Tab 1: Vòng quay xoay tròn trực tiếp */}
        {activeTab === "wheel" && (
          <LuckyDrawWheel eventId={selectedEventId} inCrm={true} />
        )}

        {/* Tab 2: Cấu hình banner và giải thưởng cũ */}
        {activeTab === "banner" && (
          <LuckyDrawLandingBanner />
        )}
      </div>
    </AppShell>
  );
}
