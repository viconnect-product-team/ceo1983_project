import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  MapPin,
  Users,
  UserCheck,
  Ticket,
  Filter,
  Eye,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { fetchNestApi } from "@/lib/api-client";
import type { EventOverviewRow } from "@/lib/events-overview.functions";
import { useT } from "@/lib/i18n";
import {
  CustomTable,
  useCustomTableSort,
  CrmMetricCard,
  CrmMetricGrid,
  CrmToolbar,
  type CustomTableColumn,
} from "@/components/common/CustomTable";

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

function Rate({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-[#003B95] dark:bg-blue-400"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const overviewQ = useQuery({
    queryKey: ["events-overview-api", statusFilter],
    queryFn: async () => {
      try {
        const query =
          statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";
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
        r.status.toLowerCase().includes(term)
    );
  }, [rows, q, statusFilter]);

  // Hook sắp xếp 3 trạng thái chuẩn CRM
  const { sortKey, sortDir, handleSort, sortData } =
    useCustomTableSort<EventOverviewRow>("date", "desc");

  const sorted = useMemo(() => {
    return sortData(filtered, {
      name: (r) => r.name,
      date: (r) => new Date(r.date).getTime(),
      status: (r) => r.status,
      registrations: (r) => r.registrations,
      confirmed: (r) => r.confirmed,
      cancelled: (r) => r.cancelled,
      attended: (r) => r.attended,
      fill: (r) => (r.capacity > 0 ? r.registrations / r.capacity : 0),
    });
  }, [filtered, sortData]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (
          acc: { events: number; registrations: number; attended: number; capacity: number },
          r: EventOverviewRow
        ) => ({
          events: acc.events + 1,
          registrations: acc.registrations + (r.registrations || 0),
          attended: acc.attended + (r.attended || 0),
          capacity: acc.capacity + (r.capacity || 0),
        }),
        { events: 0, registrations: 0, attended: 0, capacity: 0 }
      ),
    [filtered]
  );

  // Định nghĩa các cột cho CustomTable
  const columns: CustomTableColumn<EventOverviewRow>[] = [
    {
      key: "name",
      label: t("eventsOverview.colEvent"),
      width: 320,
      render: (r) => (
        <div>
          <Link
            to="/events/$eventId"
            params={{ eventId: r.id }}
            className="font-bold text-foreground hover:text-[#003B95] dark:hover:text-blue-400 hover:underline"
          >
            {r.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#003B95]" />
              {new Date(r.date).toLocaleDateString("vi-VN")}
            </span>
            {r.location ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{r.location}</span>
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: t("eventsOverview.colStatus"),
      width: 140,
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
            r.status === "ongoing" || r.status === "published"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : r.status === "completed" || r.status === "ended"
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              : r.status === "cancelled"
              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
          }`}
        >
          {r.status === "upcoming"
            ? "Sắp diễn ra"
            : r.status === "ongoing"
            ? "Đang diễn ra"
            : r.status === "completed"
            ? "Đã kết thúc"
            : r.status === "cancelled"
            ? "Đã hủy"
            : r.status}
        </span>
      ),
    },
    {
      key: "registrations",
      label: t("eventsOverview.colRegistrations"),
      width: 120,
      align: "right",
      render: (r) => (
        <span className="tabular-nums font-bold text-foreground">
          {r.registrations.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "confirmed",
      label: t("eventsOverview.colConfirmed"),
      width: 110,
      align: "right",
      render: (r) => (
        <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
          {r.confirmed.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "cancelled",
      label: t("eventsOverview.colCancelled"),
      width: 110,
      align: "right",
      render: (r) => (
        <span className="tabular-nums text-slate-400">
          {r.cancelled.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "attended",
      label: t("eventsOverview.colAttended"),
      width: 130,
      align: "right",
      render: (r) => (
        <div className="tabular-nums font-bold text-foreground">
          {r.attended.toLocaleString("vi-VN")}
          <span className="text-muted-foreground font-normal text-[11px]">
            /{r.registrations}
          </span>
        </div>
      ),
    },
    {
      key: "fill",
      label: t("eventsOverview.colFill"),
      width: 140,
      render: (r) => <Rate value={r.registrations} total={r.capacity} />,
    },
  ];

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("eventsOverview.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("eventsOverview.subtitle")}
          </p>
        </header>

        {/* ── 4 THẺ METRIC GRADIENT FIGMA CHUẨN ── */}
        <CrmMetricGrid>
          <CrmMetricCard
            label={t("eventsOverview.kpiEvents")}
            value={totals.events}
            sub="Tổng sự kiện theo bộ lọc"
            icon={CalendarDays}
            tone="sky"
          />
          <CrmMetricCard
            label={t("eventsOverview.kpiRegistrations")}
            value={totals.registrations}
            sub="Lượt hội viên & khách đăng ký"
            icon={Ticket}
            tone="violet"
          />
          <CrmMetricCard
            label={t("eventsOverview.kpiAttended")}
            value={totals.attended}
            sub="Đại biểu đã check-in thực tế"
            icon={UserCheck}
            tone="green"
          />
          <CrmMetricCard
            label={t("eventsOverview.kpiCapacity")}
            value={totals.capacity}
            sub="Tổng quy mô sức chứa hội trường"
            icon={Users}
            tone="orange"
          />
        </CrmMetricGrid>

        {/* ── TOOLBAR TÌM KIẾM & BỘ LỌC ── */}
        <CrmToolbar
          searchQuery={q}
          onSearchChange={(val) => {
            setQ(val);
            setPage(1);
          }}
          searchPlaceholder={t("eventsOverview.searchPlaceholder")}
        >
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {[
              { key: "all", label: "Tất cả", count: rows.length },
              {
                key: "upcoming",
                label: "Sắp tới",
                count: rows.filter((r) => r.status === "upcoming" || r.status === "draft").length,
              },
              {
                key: "ongoing",
                label: "Đang diễn ra",
                count: rows.filter((r) => r.status === "ongoing" || r.status === "published").length,
              },
              {
                key: "completed",
                label: "Đã xong",
                count: rows.filter((r) => r.status === "completed" || r.status === "ended").length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-white dark:bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </CrmToolbar>

        {/* ── CUSTOM TABLE VỚI SẮP XẾP 3 TRẠNG THÁI & PHÂN TRANG ── */}
        <CustomTable<EventOverviewRow>
          columns={columns}
          data={pagedRows}
          keyExtractor={(r) => r.id}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          showStt={true}
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          actionColumn={{
            title: "THAO TÁC",
            width: 110,
            render: (r) => (
              <Link
                to="/events/$eventId"
                params={{ eventId: r.id }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Eye className="h-3.5 w-3.5 text-[#003B95]" />
                <span>Chi tiết</span>
              </Link>
            ),
          }}
          emptyText={t("eventsOverview.empty")}
        />
      </div>
    </AppShell>
  );
}
