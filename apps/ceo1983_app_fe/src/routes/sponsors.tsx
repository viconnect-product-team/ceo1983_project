import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  Check,
  Download,
  FileSpreadsheet,
  Handshake,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { useTableControls } from "@/hooks/use-table-controls";
import { useUrlState } from "@/hooks/use-url-state";
import { useServerData } from "@/hooks/use-server-data";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import {
  createSponsorFn,
  deleteSponsorFn,
  listSponsorsFn,
  sendSponsorThankYouEmailFn,
  updateSponsorFn,
  type Sponsor,
} from "@/lib/sponsors.functions";
import { SponsorModal, type SponsorDraft } from "@/components/dashboard/SponsorModal";
import { SponsorExcelImportModal } from "@/components/dashboard/SponsorExcelImportModal";
import { exportToExcel, formatDisplayDate, formatExcelCurrency } from "@/lib/excel-export";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/sponsors")({
  component: SponsorsPage,
});

const TIER_KEY: Record<Sponsor["tier"], TKey> = {
  platinum: "sponsors.tier.platinum",
  gold: "sponsors.tier.gold",
  silver: "sponsors.tier.silver",
  bronze: "sponsors.tier.bronze",
};
const TIER_COLOR: Record<Sponsor["tier"], string> = {
  platinum: "oklch(0.55 0.05 280)",
  gold: "oklch(0.72 0.15 85)",
  silver: "oklch(0.75 0.02 250)",
  bronze: "oklch(0.60 0.12 50)",
};

function SponsorsPage() {
  const t = useT();
  const fmt = useFmt();
  const { can } = useRole();
  const { data: SPONSORS, reload } = useServerData<Sponsor[]>(() => listSponsorsFn(), []);
  const [q, setQ] = useUrlState<string>("q", "");
  const [tier, setTier] = useState<Sponsor["tier"] | "all">("all");
  const [sponsorTypeFilter, setSponsorTypeFilter] = useState<"all" | "regular" | "new">("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState<
    "all" | "bank_transfer" | "cash" | "in_kind"
  >("all");
  const [eventAssignedFilter, setEventAssignedFilter] = useState<"all" | "assigned" | "available">(
    "all",
  );

  const createFn = useServerFn(createSponsorFn);
  const updateFn = useServerFn(updateSponsorFn);
  const deleteFn = useServerFn(deleteSponsorFn);
  const sendEmailFn = useServerFn(sendSponsorThankYouEmailFn);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const onSubmit = async (draft: SponsorDraft) => {
    setSubmitting(true);
    const payload = {
      ...draft,
      since:
        draft.since && String(draft.since).trim()
          ? String(draft.since).trim()
          : new Date().toISOString().slice(0, 10),
    };
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...(payload as object) } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: payload as never });
        if (payload.email && payload.email.includes("@")) {
          toast.success(
            "Thêm nhà tài trợ thành công! Đã tự động gửi email kèm mã VietQR và thông tin tài trợ đến đối tác."
          );
        } else {
          toast.success(t("common.created"));
        }
      }
      setModalOpen(false);
      setEditing(null);
      reload();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onResendThankYouEmail = async (s: Sponsor) => {
    if (!s.email || !s.email.includes("@")) {
      toast.error("Nhà tài trợ chưa có thông tin email hợp lệ");
      return;
    }
    setSendingEmailId(s.id);
    try {
      await sendEmailFn({ data: { id: s.id } });
      toast.success(`Đã gửi thư tri ân thành công tới ${s.email}`);
    } catch {
      toast.error("Không thể gửi email tri ân lúc này. Vui lòng thử lại sau.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const onDelete = async (s: Sponsor) => {
    if (!window.confirm(t("common.confirmDelete", { name: s.name }))) return;
    setDeletingId(s.id);
    try {
      await deleteFn({ data: { id: s.id } });
      toast.success(t("common.deletedToast"));
      reload();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return SPONSORS.filter((s) => (tier === "all" ? true : s.tier === tier))
      .filter((s) => (sponsorTypeFilter === "all" ? true : s.sponsorType === sponsorTypeFilter))
      .filter((s) => (packageTypeFilter === "all" ? true : s.packageType === packageTypeFilter))
      .filter((s) => {
        if (eventAssignedFilter === "all") return true;
        if (eventAssignedFilter === "assigned") return !!s.assignedEvent;
        return !s.assignedEvent;
      })
      .filter(
        (s) =>
          !ql ||
          s.name.toLowerCase().includes(ql) ||
          s.contact.toLowerCase().includes(ql) ||
          s.email.toLowerCase().includes(ql) ||
          s.phone.toLowerCase().includes(ql) ||
          (s.inKindDescription && s.inKindDescription.toLowerCase().includes(ql)),
      );
  }, [SPONSORS, q, tier, sponsorTypeFilter, packageTypeFilter, eventAssignedFilter]);

  const tc = useTableControls<Sponsor>(
    filtered,
    {
      name: (s) => s.name,
      tier: (s) => s.tier,
      contact: (s) => s.contact,
      amount: (s) => s.amount,
      events: (s) => s.events,
      since: (s) => s.since,
      status: (s) => s.status,
    },
    { initialSortKey: "amount", initialSortDir: "desc", initialPageSize: 20 },
  );

  const totalAmount = useMemo(() => SPONSORS.reduce((acc, s) => acc + s.amount, 0), [SPONSORS]);

  const exportExcel = () => {
    const total = filtered.reduce((acc, s) => acc + s.amount, 0);

    exportToExcel<Sponsor>({
      title: "DANH SÁCH ĐỐI TÁC & NHÀ TÀI TRỢ CHÍNH THỨC",
      subtitle: `Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) | Tổng số: ${filtered.length} nhà tài trợ đồng hành`,
      filename: `danh-sach-nha-tai-tro-ceo1983-${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Nha_Tai_Tro",
      organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
      address: "Tòa nhà HanoiBA, TP. Hà Nội",
      circularCode: "Mẫu số B03-TT",
      circularNote: "(Ban hành theo quy chế xúc tiến thương mại & tài trợ CLB CEO 1983)",
      fundType: "Nguồn quỹ tài trợ & phát triển hiệp hội",
      currencyUnit: "VNĐ",
      data: filtered,
      columns: [
        { header: "Mã NT", key: "id", width: 14, value: (s) => s.id },
        { header: "Tên Nhà Tài Trợ / Doanh Nghiệp", key: "name", width: 36, value: (s) => s.name },
        {
          header: "Hạng Tài Trợ",
          key: "tier",
          width: 16,
          value: (s) =>
            s.tier === "platinum"
              ? "Kim Cương"
              : s.tier === "gold"
              ? "Vàng"
              : s.tier === "silver"
              ? "Bạc"
              : "Đồng",
        },
        {
          header: "Hình Thức",
          key: "pkg",
          width: 20,
          value: (s) =>
            s.packageType === "in_kind"
              ? "Hiện vật"
              : s.packageType === "cash"
              ? "Tiền mặt"
              : "Chuyển khoản (VietQR)",
        },
        { header: "Chi tiết hiện vật", key: "inKind", width: 32, value: (s) => s.inKindDescription || "—" },
        { header: "Đại Diện / Người Liên Hệ", key: "contact", width: 24, value: (s) => s.contact || "—" },
        { header: "Email", key: "email", width: 26, value: (s) => s.email || "—" },
        { header: "Số Điện Thoại", key: "phone", width: 18, value: (s) => s.phone || "—" },
        {
          header: "Giá Trị Tài Trợ (VNĐ)",
          key: "amount",
          width: 22,
          value: (s) => formatExcelCurrency(s.amount),
        },
        { header: "Ngày Tham Gia", key: "since", width: 16, value: (s) => formatDisplayDate(s.since) },
        { header: "Số Sự Kiện", key: "events", width: 14, value: (s) => s.events },
        {
          header: "Trạng Thái",
          key: "status",
          width: 18,
          value: (s) => (s.status === "active" ? "Đang hoạt động" : "Hết hạn"),
        },
      ],
      summaryRows: [
        ["TỔNG GIÁ TRỊ TÀI TRỢ", "", "", "", "", "", "", "", formatExcelCurrency(total)],
        ["TỔNG SỐ ĐỐI TÁC ĐỒNG HÀNH", "", "", "", "", "", "", "", `${filtered.length} doanh nghiệp`],
      ],
      signerTitles: ["NGƯỜI LẬP BIỂU", "TRƯỞNG BAN TÀI TRỢ", "CHỦ TỊCH CLB"],
    });
    toast.success("Đã xuất danh sách nhà tài trợ sang file Excel (.xlsx) chuẩn!");
  };

  return (
    <AppShell>
      <PageHeader
        title={t("sponsors.title")}
        subtitle="Hệ thống đối tác & nhà tài trợ chính thức đồng hành cùng Hiệp Hội Doanh Nhân CEO 1983"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-2 text-xs font-semibold text-[#003B95] dark:text-blue-300 shadow-xs hover:bg-blue-100/60 transition cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Nhập file Excel</span>
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100/60 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            {can(PERMISSIONS.SPONSOR_CREATE) && (
              <button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" />
                <span>{t("sponsors.add")}</span>
              </button>
            )}
          </div>
        }
      />

      {/* ── DASHBOARD STATS ── */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng NTT & Giá Trị"
          value={`${SPONSORS.length} NTT · ${fmt.money(totalAmount)}`}
          icon={<Handshake className="h-4 w-4" />}
        />
        <StatCard
          label="★ Thường Xuyên Ổn Định"
          value={`${SPONSORS.filter((s) => s.sponsorType === "regular").length} Đối tác`}
          tone="success"
          hint={`${Math.round((SPONSORS.filter((s) => s.sponsorType === "regular").length / (SPONSORS.length || 1)) * 100)}% tổng số đối tác`}
          icon={<Award className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          label="✦ Nhà Tài Trợ Mới"
          value={`${SPONSORS.filter((s) => s.sponsorType === "new").length} Đơn vị`}
          tone="info"
          hint="Mới đồng hành các kỳ gần nhất"
          icon={<UserPlus className="h-4 w-4 text-sky-500" />}
        />
        <StatCard
          label="🎁 Tài Trợ Hiện Vật"
          value={`${SPONSORS.filter((s) => s.packageType === "in_kind").length} Gói hiện vật`}
          tone="warning"
          hint={`Quy đổi ~${fmt.money(SPONSORS.filter((s) => s.packageType === "in_kind").reduce((acc, s) => acc + s.amount, 0))}`}
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
        />
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên doanh nghiệp, người liên hệ, quà tặng hiện vật..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs shadow-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground"
          />
        </div>
        <select
          value={sponsorTypeFilter}
          onChange={(e) => setSponsorTypeFilter(e.target.value as any)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-xs cursor-pointer"
        >
          <option value="all">Tất cả đối tác</option>
          <option value="regular">★ Thường xuyên ổn định</option>
          <option value="new">✦ Nhà tài trợ mới</option>
        </select>
        <select
          value={packageTypeFilter}
          onChange={(e) => setPackageTypeFilter(e.target.value as any)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-xs cursor-pointer"
        >
          <option value="all">Tất cả hình thức</option>
          <option value="bank_transfer">🏦 Chuyển khoản (VietQR)</option>
          <option value="cash">💵 Tiền mặt trực tiếp</option>
          <option value="in_kind">🎁 Tài trợ Hiện vật</option>
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as Sponsor["tier"] | "all")}
          className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-xs cursor-pointer"
        >
          <option value="all">{t("sponsors.allTiers")}</option>
          <option value="platinum">{t("sponsors.tier.platinum")}</option>
          <option value="gold">{t("sponsors.tier.gold")}</option>
          <option value="silver">{t("sponsors.tier.silver")}</option>
          <option value="bronze">{t("sponsors.tier.bronze")}</option>
        </select>
        <select
          value={eventAssignedFilter}
          onChange={(e) => setEventAssignedFilter(e.target.value as any)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-xs cursor-pointer"
        >
          <option value="all">Tất cả sự kiện</option>
          <option value="assigned">🔒 Đang tài trợ (Đã khóa)</option>
          <option value="available">✓ Chưa gán sự kiện (Khả dụng)</option>
        </select>
      </div>

      {/* ── BẢNG DANH SÁCH NHÀ TÀI TRỢ (ĐÃ FIX ROW STRETCHING) ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[1050px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="w-12 px-3 py-3.5 text-center border-b border-border">
                  STT
                </th>
                <th className="w-20 px-3 py-3.5 border-b border-border whitespace-nowrap">
                  {t("sponsors.col.code")}
                </th>
                <th className="min-w-[240px] max-w-[320px] px-4 py-3.5 border-b border-border">
                  {t("sponsors.col.name")}
                </th>
                <th className="min-w-[130px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  Phân loại
                </th>
                <th className="min-w-[130px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  Hình thức
                </th>
                <th className="min-w-[100px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  {t("sponsors.col.tier")}
                </th>
                <th className="min-w-[190px] max-w-[240px] px-4 py-3.5 border-b border-border">
                  {t("sponsors.col.contact")}
                </th>
                <th className="min-w-[125px] px-4 py-3.5 border-b border-border whitespace-nowrap text-right">
                  {t("sponsors.col.value")}
                </th>
                <th className="min-w-[150px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  Trạng thái tài trợ
                </th>
                <th className="min-w-[100px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  {t("sponsors.col.since")}
                </th>
                <th className="min-w-[105px] px-3 py-3.5 border-b border-border whitespace-nowrap">
                  {t("sponsors.col.status")}
                </th>
                <th className="w-20 px-4 py-3.5 text-right font-bold border-b border-border whitespace-nowrap">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tc.pageRows.map((s, idx) => (
                <tr
                  key={s.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-muted-foreground">
                    {(tc.page - 1) * tc.pageSize + idx + 1}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-bold text-primary whitespace-nowrap">
                    {s.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-foreground text-xs leading-snug line-clamp-2" title={s.name}>
                      {s.name}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {s.sponsorType === "regular" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ★ Thường xuyên
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10.5px] font-bold text-sky-700 dark:text-sky-300">
                        ✦ NTT mới
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {s.packageType === "in_kind" ? (
                      <div className="flex flex-col gap-0.5 max-w-[160px]">
                        <span className="inline-flex items-center gap-1 w-fit rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                          🎁 Hiện vật
                        </span>
                        {s.inKindDescription && (
                          <span
                            className="text-[11px] text-muted-foreground truncate"
                            title={s.inKindDescription}
                          >
                            {s.inKindDescription}
                          </span>
                        )}
                      </div>
                    ) : s.packageType === "cash" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                        💵 Tiền mặt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10.5px] font-bold text-[#003B95] dark:text-blue-300 whitespace-nowrap">
                        🏦 Chuyển khoản
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-bold text-primary-foreground"
                      style={{ background: TIER_COLOR[s.tier] }}
                    >
                      {t(TIER_KEY[s.tier])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-xs leading-snug line-clamp-1" title={s.contact}>
                      {s.contact}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate" title={s.email}>
                      {s.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-foreground text-xs whitespace-nowrap text-right">
                    {fmt.money(s.amount)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {s.assignedEvent ? (
                      <div className="flex flex-col gap-0.5 max-w-[180px]">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-primary truncate" title={s.assignedEvent.name}>
                          <CalendarDays className="h-3 w-3 shrink-0" />
                          <span className="truncate">{s.assignedEvent.name}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 w-fit rounded px-1.5 py-0.2 text-[9.5px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Lock className="h-2.5 w-2.5" /> Đã khóa
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check className="h-3 w-3" /> Sẵn sàng tài trợ
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {s.since}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Pill color={s.status === "active" ? "success" : "neutral"}>
                      {t(`sponsors.status.${s.status}`)}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {can(PERMISSIONS.SPONSOR_EDIT) && (
                        <>
                          {s.email && s.email.includes("@") && (
                            <button
                              onClick={() => onResendThankYouEmail(s)}
                              disabled={sendingEmailId === s.id}
                              aria-label="Gửi lại thư tri ân"
                              title={`Gửi lại thư tri ân tới ${s.email}`}
                              className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition disabled:opacity-50 cursor-pointer"
                            >
                              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditing(s);
                              setModalOpen(true);
                            }}
                            aria-label={t("common.edit")}
                            title="Sửa thông tin nhà tài trợ"
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onDelete(s)}
                            disabled={deletingId === s.id}
                            aria-label={t("common.delete")}
                            title="Xóa nhà tài trợ"
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tc.total === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    Không tìm thấy nhà tài trợ nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {/* Sponsor Create & Edit Modal with Package Auto-Extraction and VND format */}
      <SponsorModal
        open={modalOpen}
        initial={editing}
        submitting={submitting}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />

      {/* Sponsor Excel Import Modal with Deep Data Extraction */}
      <SponsorExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={reload}
      />
    </AppShell>
  );
}
