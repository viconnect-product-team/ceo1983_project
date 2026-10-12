import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Search, Users, UserCheck, Ticket, Filter } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { fetchNestApi } from "@/lib/api-client";
import type { EventOverviewRow } from "@/lib/events-overview.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/events-overview")({
  ssr: false,
  loader: async () => {
    try {
      const res = await fetchNestApi<EventOverviewRow[]>("/events/overview");
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },
  component: EventsOverviewPage,
  head: () => ({
    meta: [
      { title: "Tổng quan sự kiện | CEO 1983" },
      {
        name: "description",
        content:
          "Bảng tổng quan sự kiện cho quản trị viên: danh sách sự kiện, lượt đăng ký và số người tham dự thực tế.",
      },
      { property: "og:title", content: "Tổng quan sự kiện | CEO 1983" },
      {
        property: "og:description",
        content: "Theo dõi lượt đăng ký và số người tham dự của từng sự kiện.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

function Kpi({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}

function Rate({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="tabular-nums text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

function EventsOverviewPage() {
  const t = useT();
  const initialRows = (Route.useLoaderData() || []) as EventOverviewRow[];
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const overviewQ = useQuery({
    queryKey: ["events-overview-api", statusFilter],
    queryFn: async () => {
      try {
        const query = statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";
        const res = await fetchNestApi<EventOverviewRow[]>(`/events/overview${query}`);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
      return initialRows;
    },
    initialData: initialRows,
  });

  const rows = overviewQ.data || initialRows;

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter !== "all") {
      list = list.filter((r) => {
        const s = String(r.status || "").toLowerCase();
        if (statusFilter === "upcoming") return s === "upcoming" || s === "draft";
        if (statusFilter === "ongoing") return s === "ongoing" || s === "published";
        if (statusFilter === "completed") return s === "completed" || s === "ended";
        if (statusFilter === "cancelled") return s === "cancelled";
        return s === statusFilter;
      });
    }
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (r: EventOverviewRow) =>
        r.name.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term),
    );
  }, [rows, q, statusFilter]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc: { events: number; registrations: number; attended: number; capacity: number }, r: EventOverviewRow) => ({
          events: acc.events + 1,
          registrations: acc.registrations + (r.registrations || 0),
          attended: acc.attended + (r.attended || 0),
          capacity: acc.capacity + (r.capacity || 0),
        }),
        { events: 0, registrations: 0, attended: 0, capacity: 0 },
      ),
    [filtered],
  );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl p-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("eventsOverview.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("eventsOverview.subtitle")}
          </p>
        </header>

        {/* Bộ lọc trạng thái sự kiện gọi theo Database API */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Filter className="h-4 w-4 text-[#003B95]" />
            <span>Lọc Trạng Thái Sự Kiện:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "Tất cả sự kiện", count: rows.length },
              {
                key: "upcoming",
                label: "Sắp diễn ra",
                count: rows.filter((r) => r.status === "upcoming" || r.status === "draft").length,
              },
              {
                key: "ongoing",
                label: "Đang diễn ra",
                count: rows.filter((r) => r.status === "ongoing" || r.status === "published").length,
              },
              {
                key: "completed",
                label: "Đã kết thúc",
                count: rows.filter((r) => r.status === "completed" || r.status === "ended").length,
              },
              {
                key: "cancelled",
                label: "Đã hủy",
                count: rows.filter((r) => r.status === "cancelled").length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground border border-border"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label={t("eventsOverview.kpiEvents")} value={totals.events} icon={CalendarDays} />
          <Kpi
            label={t("eventsOverview.kpiRegistrations")}
            value={totals.registrations}
            icon={Ticket}
          />
          <Kpi label={t("eventsOverview.kpiAttended")} value={totals.attended} icon={UserCheck} />
          <Kpi label={t("eventsOverview.kpiCapacity")} value={totals.capacity} icon={Users} />
        </div>

        <label className="mt-6 flex min-h-10 max-w-sm items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("eventsOverview.searchPlaceholder")}
            aria-label={t("eventsOverview.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("eventsOverview.empty")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[880px] text-sm">
              <caption className="sr-only">{t("eventsOverview.title")}</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-3">
                    {t("eventsOverview.colEvent")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("eventsOverview.colStatus")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {t("eventsOverview.colRegistrations")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {t("eventsOverview.colConfirmed")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {t("eventsOverview.colCancelled")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {t("eventsOverview.colAttended")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("eventsOverview.colFill")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: EventOverviewRow) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: r.id }}
                        className="font-medium text-foreground hover:underline"
                      >
                        {r.name}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                          {new Date(r.date).toLocaleDateString("vi-VN")}
                        </span>
                        {r.location ? (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            <span className="truncate">{r.location}</span>
                          </span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {r.registrations}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {r.confirmed}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {r.cancelled}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {r.attended}
                      <span className="text-muted-foreground">/{r.registrations}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Rate value={r.registrations} total={r.capacity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
