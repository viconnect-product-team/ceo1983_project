import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { REVIEW_SEARCH_RESET } from "@/lib/review-search";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Search,
  Send,
  Undo2,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useT, type TKey } from "@/lib/i18n";
import { exportToExcel, formatDisplayDate } from "@/lib/excel-export";
import {
  renewalKpis,
  type RenewalRecord,
  type RenewalStatus,
  type PaymentStatus,
} from "@/lib/renewal-data";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination, SortHeader } from "@/components/dashboard/DataTablePagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listRenewalsFn,
  renewMembershipFn,
  bulkRenewMembershipFn,
  sendRenewalReminderFn,
  cancelRenewalFn,
  setPaymentStatusFn,
} from "@/lib/renewals.functions";
import { fetchNestApi } from "@/lib/api-client";
import { toRecord, isApprovedMember, type Row } from "@/lib/renewals-calc";

export const Route = createFileRoute("/renewal")({
  ssr: false,
  loader: async () => {
    try {
      const clientRes = await fetchNestApi<any[]>("/members");
      if (Array.isArray(clientRes) && clientRes.length > 0) {
        return clientRes.filter(isApprovedMember).map((r) => toRecord(r as Row));
      }
    } catch {}
    try {
      const serverRes = await listRenewalsFn().catch(() => []);
      if (Array.isArray(serverRes) && serverRes.length > 0) {
        return serverRes.map((r: any) => (r.member ? r : toRecord(r as Row)));
      }
    } catch {}
    return [];
  },
  component: RenewalPage,
});

const TABS: { key: RenewalStatus | "all"; label: TKey }[] = [
  { key: "all", label: "renewal.tab.all" },
  { key: "upcoming", label: "renewal.tab.upcoming" },
  { key: "due", label: "renewal.tab.due" },
  { key: "overdue", label: "renewal.tab.overdue" },
  { key: "renewed", label: "renewal.tab.renewed" },
];

const STATUS_STYLE: Record<RenewalStatus, { bg: string; fg: string; label: TKey }> = {
  upcoming: {
    bg: "oklch(0.94 0.05 220)",
    fg: "oklch(0.42 0.15 220)",
    label: "renewal.status.upcoming",
  },
  due: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.45 0.14 65)", label: "renewal.status.due" },
  overdue: {
    bg: "oklch(0.93 0.06 25)",
    fg: "oklch(0.50 0.20 25)",
    label: "renewal.status.overdue",
  },
  renewed: {
    bg: "oklch(0.93 0.07 155)",
    fg: "oklch(0.40 0.16 155)",
    label: "renewal.status.renewed",
  },
};

function StatusPill({ status }: { status: RenewalStatus }) {
  const t = useT();
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {t(s.label)}
    </span>
  );
}

const PAYMENT_STYLE: Record<PaymentStatus, { bg: string; fg: string; label: string }> = {
  unpaid: { bg: "oklch(0.93 0.06 25)", fg: "oklch(0.50 0.20 25)", label: "Chưa thanh toán" },
  pending: {
    bg: "oklch(0.94 0.09 75)",
    fg: "oklch(0.45 0.14 65)",
    label: "Đang chờ thanh toán",
  },
  paid: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.40 0.16 155)", label: "Đã thanh toán (QR)" },
  cash: { bg: "oklch(0.93 0.08 85)", fg: "oklch(0.42 0.15 85)", label: "Đã thanh toán (Tiền mặt)" },
};

const PAYMENT_ORDER: PaymentStatus[] = ["unpaid", "pending", "paid", "cash"];

function PaymentControl({
  status,
  onChange,
}: {
  status: PaymentStatus;
  onChange: (s: PaymentStatus) => void;
}) {
  const s = PAYMENT_STYLE[status] || PAYMENT_STYLE.unpaid;
  return (
    <select
      value={status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as PaymentStatus)}
      aria-label="Chọn trạng thái thanh toán"
      className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
      style={{ background: s.bg, color: s.fg }}
    >
      {PAYMENT_ORDER.map((p) => (
        <option key={p} value={p}>
          {PAYMENT_STYLE[p].label}
        </option>
      ))}
    </select>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof Clock;
  hint?: string;
  tone: "info" | "warning" | "danger" | "success";
}) {
  const bg: Record<typeof tone, string> = {
    info: "linear-gradient(135deg, oklch(0.65 0.15 220), oklch(0.78 0.13 220))",
    warning: "linear-gradient(135deg, oklch(0.70 0.16 75), oklch(0.82 0.13 75))",
    danger: "linear-gradient(135deg, oklch(0.62 0.20 25), oklch(0.74 0.17 25))",
    success: "linear-gradient(135deg, oklch(0.65 0.15 155), oklch(0.78 0.14 155))",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
          style={{ background: bg[tone] }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function DaysCell({ rec }: { rec: RenewalRecord }) {
  const t = useT();
  if (rec.status === "renewed") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const overdue = rec.daysLeft < 0;
  const color = overdue
    ? "oklch(0.50 0.20 25)"
    : rec.daysLeft <= 14
      ? "oklch(0.55 0.16 65)"
      : "oklch(0.50 0.10 220)";
  return (
    <span className="text-sm font-semibold" style={{ color }}>
      {Math.abs(rec.daysLeft)} {overdue ? t("renewal.daysOverdue") : t("renewal.daysLeft")}
    </span>
  );
}

function RenewalPage() {
  const t = useT();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const loaderRecords = (Route.useLoaderData() as RenewalRecord[]) || [];

  const { data: records = loaderRecords, refetch } = useQuery({
    queryKey: ["renewals"],
    queryFn: async () => {
      try {
        const res = await fetchNestApi<any[]>("/members");
        if (Array.isArray(res) && res.length > 0) {
          return res.filter(isApprovedMember).map((r) => toRecord(r as Row));
        }
      } catch (err) {
        console.warn("[Renewal] fetchNestApi failed, trying listRenewalsFn fallback:", err);
      }
      try {
        const serverRes = await listRenewalsFn().catch(() => []);
        if (Array.isArray(serverRes) && serverRes.length > 0) {
          return serverRes.map((r: any) => (r.member ? r : toRecord(r as Row)));
        }
      } catch {}
      return loaderRecords;
    },
    placeholderData: loaderRecords,
    staleTime: 0,
    refetchInterval: 8000,
  });

  const renewFn = useServerFn(renewMembershipFn);
  const bulkRenewFn = useServerFn(bulkRenewMembershipFn);
  const remindFn = useServerFn(sendRenewalReminderFn);
  const cancelFn = useServerFn(cancelRenewalFn);
  const paymentFn = useServerFn(setPaymentStatusFn);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<RenewalStatus | "all">("all");

  const kpis = useMemo(() => renewalKpis(records), [records]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return records
      .filter((r) => (tab === "all" ? true : r.status === tab))
      .filter((r) => {
        if (!ql) return true;
        const m = r?.member;
        if (!m) return false;
        const name = String(m.name || "").toLowerCase();
        const code = String(m.code || "").toLowerCase();
        const email = String(m.email || "").toLowerCase();
        const contact = String(m.contact || "").toLowerCase();
        return name.includes(ql) || code.includes(ql) || email.includes(ql) || contact.includes(ql);
      });
  }, [q, tab, records]);

  const accessors = useMemo(
    () => ({
      code: (r: RenewalRecord) => r.member.code,
      name: (r: RenewalRecord) => r.member.name,
      level: (r: RenewalRecord) => r.member.level,
      termEnd: (r: RenewalRecord) => r.currentTermEnd,
      daysLeft: (r: RenewalRecord) => r.daysLeft,
      reminders: (r: RenewalRecord) => r.reminderCount,
      status: (r: RenewalRecord) => r.status,
      payment: (r: RenewalRecord) => r.paymentStatus,
    }),
    [],
  );

  const tc = useTableControls(filtered, accessors, {
    initialPageSize: 10,
    initialSortKey: "termEnd",
    initialSortDir: "desc",
  });

  const invalidateAll = async () => {
    queryClient.invalidateQueries({ queryKey: ["renewals"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    await refetch();
    router.invalidate();
  };

  const handleRenew = async (rec: RenewalRecord) => {
    if (!confirm(t("renewal.confirmRenew"))) return;
    const cleanId = rec.member.id || rec.member.code || rec.id.replace(/^RNW-/, "");
    try {
      await fetchNestApi(`/members/${cleanId}/renew`, { method: "POST" });
      toast.success(t("renewal.toast.renewed"));
    } catch (e: any) {
      await renewFn({ data: { id: cleanId } });
      toast.success(t("renewal.toast.renewed"));
    }
    await invalidateAll();
  };

  const handleRemind = async (rec: RenewalRecord) => {
    const cleanId = rec.member.id || rec.member.code || rec.id.replace(/^RNW-/, "");
    try {
      await fetchNestApi(`/members/${cleanId}/remind`, {
        method: "POST",
        body: JSON.stringify({ isAuto: false }),
      });
      toast.success(`${t("renewal.toast.reminded")} (Đã gửi email đến ${rec.member.email})`);
    } catch (e: any) {
      await remindFn({ data: { id: cleanId, isAuto: false } });
      toast.success(`${t("renewal.toast.reminded")} (Đã gửi email đến ${rec.member.email})`);
    }
    await invalidateAll();
  };

  const handleCancel = async (rec: RenewalRecord) => {
    if (!confirm(t("renewal.confirmCancel"))) return;
    const cleanId = rec.member.id || rec.member.code || rec.id.replace(/^RNW-/, "");
    try {
      await cancelFn({ data: { id: cleanId } });
      toast.success(t("renewal.toast.cancelled"));
    } catch (e: any) {
      toast.error(e?.message || "Không thể hủy gia hạn");
    }
    await invalidateAll();
  };

  const handlePayment = async (rec: RenewalRecord, status: PaymentStatus) => {
    const cleanId = rec.member.id || rec.member.code || rec.id.replace(/^RNW-/, "");
    try {
      await fetchNestApi(`/members/${cleanId}/payment-status`, {
        method: "POST",
        body: JSON.stringify({ paymentStatus: status, feePaid: status === "paid" || status === "cash" }),
      });
      toast.success(t("renewal.toast.payment"));
    } catch (e: any) {
      await paymentFn({ data: { id: cleanId, status } });
      toast.success(t("renewal.toast.payment"));
    }
    await invalidateAll();
  };

  const handleBulkRemind = async () => {
    const targets = filtered.filter((r) => r.status === "due" || r.status === "overdue");
    await Promise.all(targets.map((r: any) => remindFn({ data: { id: r.id, isAuto: false } })));
    toast.success(t("renewal.toast.bulk").replace("{n}", String(targets.length)));
    await invalidateAll();
  };

  const handleBulkRenew = async () => {
    const targets = filtered.filter((r) => r.status !== "renewed");
    if (targets.length === 0) {
      toast.error(t("renewal.toast.noneToRenew"));
      return;
    }
    if (!confirm(t("renewal.confirmBulkRenew").replace("{n}", String(targets.length)))) return;
    const res = await bulkRenewFn({ data: { ids: targets.map((r: any) => r.id) } });
    toast.success(t("renewal.toast.bulkRenewed").replace("{n}", String(res.renewed)));
    await invalidateAll();
  };

  const handleExport = () => {
    exportToExcel<RenewalRecord>({
      title: "BÁO CÁO THEO DÕI GIA HẠN TƯ CÁCH HỘI VIÊN THƯỜNG NIÊN",
      subtitle: "Hiệp Hội Doanh Nhân CEO 1983 - HanoiBA",
      filename: "theo-doi-gia-han-hoi-vien",
      sheetName: "Theo_Doi_Gia_Han",
      data: filtered,
      columns: [
        { header: "Mã hội viên", key: "code", width: 16, value: (r) => r.member.code },
        { header: "Họ và tên hội viên", key: "name", width: 28, value: (r) => r.member.name },
        { header: "Email liên hệ", key: "email", width: 26, value: (r) => r.member.email },
        { header: "Hạng hội viên", key: "level", width: 18, value: (r) => r.member.level },
        { header: "Hạn nhiệm kỳ hiện tại", key: "currentTermEnd", width: 20, value: (r) => formatDisplayDate(r.currentTermEnd) },
        { header: "Số ngày còn lại", key: "daysLeft", width: 16, value: (r) => (r.daysLeft < 0 ? `Quá hạn ${Math.abs(r.daysLeft)} ngày` : `${r.daysLeft} ngày`) },
        { header: "Trạng thái gia hạn", key: "status", width: 18, value: (r) => (r.status === "renewed" ? "Đã gia hạn" : r.status === "overdue" ? "Quá hạn" : r.status === "due" ? "Đến hạn" : "Sắp tới") },
        { header: "Thanh toán", key: "payment", width: 16, value: (r) => (r.paymentStatus === "paid" ? "Đã nộp phí" : "Chưa nộp") },
        { header: "Số lần nhắc", key: "reminders", width: 14, value: (r) => r.reminderCount },
        { header: "Lần nhắc gần nhất", key: "lastReminder", width: 18, value: (r) => formatDisplayDate(r.lastReminder) },
        { header: "Ngày gia hạn mới", key: "renewedAt", width: 18, value: (r) => formatDisplayDate(r.renewedAt) },
        { header: "Hạn nhiệm kỳ mới", key: "newTermEnd", width: 18, value: (r) => formatDisplayDate(r.newTermEnd) },
      ],
      summaryRows: [
        ["TỔNG SỐ HỒ SƠ THEO DÕI:", "", "", "", "", "", "", "", "", "", "", `${filtered.length} hội viên`],
      ],
      signerTitles: ["NGƯỜI LẬP BIỂU", "TRƯỞNG BAN HỘI VIÊN", "CHỦ TỊCH CLB CEO 1983"],
    });
    toast.success("Đã xuất báo cáo gia hạn hội viên chuẩn doanh nghiệp CEO 1983 (.xlsx)!");
  };

  const counts: Record<RenewalStatus | "all", number> = {
    all: records.length,
    upcoming: kpis.upcoming,
    due: kpis.due,
    overdue: kpis.overdue,
    renewed: kpis.renewed,
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold tracking-tight text-foreground">
            {t("renewal.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("renewal.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            {t("renewal.export")}
          </button>
          <button
            onClick={handleBulkRenew}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4 text-primary" />
            {t("renewal.bulkRenew")}
          </button>
          <button
            onClick={handleBulkRemind}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4" />
            {t("renewal.bulkRemind")}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("renewal.kpi.upcoming")} value={kpis.upcoming} icon={Clock} tone="info" />
        <KpiCard
          label={t("renewal.kpi.due")}
          value={kpis.due}
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard
          label={t("renewal.kpi.overdue")}
          value={kpis.overdue}
          icon={AlertTriangle}
          tone="danger"
        />
        <KpiCard
          label={t("renewal.kpi.renewed")}
          value={kpis.renewed}
          icon={CheckCircle2}
          hint={`${kpis.renewalRate}% ${t("renewal.kpi.rate").toLowerCase()}`}
          tone="success"
        />
      </div>

      {/* Progress */}
      <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t("renewal.progress")}</h3>
          </div>
          <div className="text-sm font-bold text-foreground">
            {kpis.renewed}/{kpis.total} · {kpis.renewalRate}%
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${kpis.renewalRate}%`, background: "var(--gradient-primary)" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("renewal.search")}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs font-semibold shadow-[var(--shadow-card)]">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`rounded-md px-3 py-1.5 transition ${
                tab === tb.key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(tb.label)}
              <span className="ml-1.5 rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {counts[tb.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="self-stretch relative bg-white dark:bg-slate-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start overflow-hidden shadow-xs">
        <div className="overflow-x-auto relative w-full">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <th className="sticky left-0 z-20 w-[56px] min-w-[56px] max-w-[56px] bg-slate-100 dark:bg-slate-800 px-3 py-3 text-center border-r border-b border-slate-200 dark:border-slate-800">
                  STT
                </th>
                <SortHeader
                  label="Mã"
                  columnKey="code"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                  className="sticky left-[56px] z-20 min-w-[110px] bg-secondary px-4 py-3 border-r border-b border-border shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)]"
                />
                <SortHeader
                  label={t("renewal.col.member")}
                  columnKey="name"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.tier")}
                  columnKey="level"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.termEnd")}
                  columnKey="termEnd"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.daysLeft")}
                  columnKey="daysLeft"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.reminders")}
                  columnKey="reminders"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.status")}
                  columnKey="status"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <SortHeader
                  label={t("renewal.col.payment")}
                  columnKey="payment"
                  sortKey={tc.sortKey}
                  sortDir={tc.sortDir}
                  onSort={tc.toggleSort}
                />
                <th className="sticky right-0 z-20 min-w-[140px] bg-secondary px-4 py-3 text-right border-l border-b border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                  {t("renewal.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {tc.pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {t("renewal.empty")}
                  </td>
                </tr>
              )}
              {tc.pageRows.map((r: any, idx: number) => (
                <tr
                  key={r.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a,button")) return;
                    navigate({
                      to: "/members/$memberId",
                      params: { memberId: r.member.id },
                      search: REVIEW_SEARCH_RESET,
                    });
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate({
                        to: "/members/$memberId",
                        params: { memberId: r.member.id },
                        search: REVIEW_SEARCH_RESET,
                      });
                    }
                  }}
                  className="group cursor-pointer border-b border-border transition-all duration-150 hover:bg-secondary/60 hover:shadow-[inset_3px_0_0_0_var(--primary)] active:bg-secondary"
                >
                  <td className="sticky left-0 z-10 w-[56px] min-w-[56px] max-w-[56px] bg-card group-hover:bg-muted/70 px-3 py-3 text-center font-medium text-muted-foreground border-r border-b border-border transition-colors">
                    {(tc.page - 1) * tc.pageSize + idx + 1}
                  </td>
                  <td className="sticky left-[56px] z-10 min-w-[110px] bg-card group-hover:bg-muted/70 px-4 py-3 font-mono text-[12px] font-semibold text-primary border-r border-b border-border shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors">
                    {r.member.code}
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {(r.member?.name || "HV")
                          .trim()
                          .split(/\s+/)
                          .slice(-2)
                          .map((p: string) => p[0] || "")
                          .join("")
                          .toUpperCase() || "HV"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">
                          {r.member?.name || "Hội viên"}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {r.member?.email || r.member?.phone || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground border-b border-border">
                    {r.member?.level ? t(r.member.level) : "Tiêu chuẩn"}
                  </td>
                  <td className="px-4 py-3 text-foreground border-b border-border">
                    {formatDisplayDate(r.currentTermEnd)}
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <DaysCell rec={r} />
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold text-foreground">{r.reminderCount}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.lastReminder
                        ? `${t("renewal.lastReminder")}: ${formatDisplayDate(r.lastReminder)}`
                        : t("renewal.never")}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <PaymentControl
                      status={r.paymentStatus}
                      onChange={(s) => handlePayment(r, s)}
                    />
                  </td>
                  <td className="sticky right-0 z-10 min-w-[140px] bg-card group-hover:bg-muted/70 px-4 py-3 text-right border-l border-b border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] transition-colors">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== "renewed" && (
                        <>
                          <button
                            onClick={() => handleRemind(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {t("renewal.action.remind")}
                          </button>
                          <button
                            onClick={() => handleRenew(r)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {t("renewal.action.renew")}
                          </button>
                        </>
                      )}
                      {r.status === "renewed" && (
                        <>
                          {r.newTermEnd && (
                            <span className="text-[11px] text-muted-foreground">
                              → {new Date(r.newTermEnd).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                          <button
                            onClick={() => handleCancel(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-background px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            {t("renewal.action.cancel")}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full self-stretch border-t border-slate-200 dark:border-slate-800 bg-card">
          <Pagination
            page={tc.page}
            pageCount={tc.pageCount}
            pageSize={tc.pageSize}
            total={tc.total}
            from={tc.from}
            to={tc.to}
            onPage={tc.setPage}
            onPageSize={tc.setPageSize}
          />
        </div>
      </div>
    </AppShell>
  );
}
