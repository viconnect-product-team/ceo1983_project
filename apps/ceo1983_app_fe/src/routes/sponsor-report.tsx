import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Download, FileBarChart, FileSpreadsheet, TrendingUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { listSponsorsFn, type Sponsor } from "@/lib/sponsors.functions";
import { useServerData } from "@/hooks/use-server-data";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import { exportToExcel, formatDisplayDate, formatExcelCurrency } from "@/lib/excel-export";
import { SponsorExcelImportModal } from "@/components/dashboard/SponsorExcelImportModal";

export const Route = createFileRoute("/sponsor-report")({
  ssr: false,
  loader: () => listSponsorsFn(),
  component: ReportPage,
});

const TIER_KEY: Record<Sponsor["tier"], TKey> = {
  platinum: "sponsors.tier.platinum",
  gold: "sponsors.tier.gold",
  silver: "sponsors.tier.silver",
  bronze: "sponsors.tier.bronze",
};

function ReportPage() {
  const t = useT();
  const fmt = useFmt();
  const initialSponsors = (Route.useLoaderData() as Sponsor[]) || [];
  const { data: SPONSORS = initialSponsors, reload } = useServerData<Sponsor[]>(
    () => listSponsorsFn(),
    initialSponsors,
  );
  const [importOpen, setImportOpen] = useState(false);

  const total = SPONSORS.reduce((s, x) => s + x.amount, 0);
  const byTier = (["platinum", "gold", "silver", "bronze"] as Sponsor["tier"][]).map((tier) => {
    const list = SPONSORS.filter((s) => s.tier === tier);
    const amount = list.reduce((s, x) => s + x.amount, 0);
    return {
      tier,
      count: list.length,
      amount,
      pct: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  });
  const top = [...SPONSORS].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const handleExportExcel = () => {
    exportToExcel<Sponsor>({
      title: "BÁO CÁO PHÂN TÍCH TỔNG HỢP NHÀ TÀI TRỢ & ĐỐI TÁC CHIẾN LƯỢC",
      subtitle: `CLB Doanh Nhân CEO 1983 (HanoiBA) | Tổng số: ${SPONSORS.length} đối tác · Doanh thu tài trợ: ${formatExcelCurrency(total)} VNĐ`,
      filename: `bao-cao-tai-tro-ceo1983-${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Bao_Cao_Tai_Tro",
      organization: "CLB DOANH NHÂN CEO 1983 (HANOIBA)",
      address: "Tòa nhà HanoiBA, TP. Hà Nội",
      circularCode: "Mẫu số B04-BCTT",
      circularNote: "(Ban hành theo quy chế quản trị tài trợ & xúc tiến thương mại CLB CEO 1983)",
      fundType: "Nguồn quỹ tài trợ & phát triển hiệp hội",
      currencyUnit: "VNĐ",
      data: SPONSORS,
      columns: [
        { header: "Mã NT", key: "id", width: 14, value: (s) => s.id },
        { header: "Tên Nhà Tài Trợ / Doanh Nghiệp", key: "name", width: 38, value: (s) => s.name },
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
        { header: "Mô tả hiện vật", key: "inKind", width: 30, value: (s) => s.inKindDescription || "—" },
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
        ["TỔNG GIÁ TRỊ TÀI TRỢ TOÀN HỆ THỐNG", "", "", "", "", "", "", "", formatExcelCurrency(total)],
        ["TỔNG SỐ ĐỐI TÁC ĐỒNG HÀNH", "", "", "", "", "", "", "", `${SPONSORS.length} doanh nghiệp`],
      ],
      signerTitles: ["NGƯỜI LẬP BÁO CÁO", "TRƯỞNG BAN TÀI TRỢ", "CHỦ TỊCH CLB"],
    });
    toast.success("Đã xuất báo cáo phân tích nhà tài trợ Excel (.xlsx) chuẩn!");
  };

  return (
    <AppShell>
      <PageHeader
        title={t("sreport.title")}
        subtitle={t("sreport.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#003B95] dark:text-blue-300 shadow-xs hover:bg-blue-100/60 transition cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Nhập Dữ Liệu Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100/60 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Xuất Báo Cáo Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>In / Xuất PDF</span>
            </button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("sreport.kpi.total")}
          value={fmt.money(total)}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label={t("sreport.kpi.count")}
          value={SPONSORS.length}
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          label={t("sreport.kpi.avg")}
          value={fmt.money(Math.round(total / SPONSORS.length))}
          tone="info"
          icon={<FileBarChart className="h-4 w-4" />}
        />
        <StatCard
          label={t("sreport.kpi.retention")}
          value="92%"
          hint={t("common.versus")}
          tone="primary"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("sreport.byTier")}</h3>
          <div className="space-y-3.5">
            {byTier.map((b) => (
              <div key={b.tier}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-foreground">
                    {t(TIER_KEY[b.tier])} · {b.count} {t("common.units")}
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {fmt.money(b.amount)} · {b.pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.pct}%`, background: "var(--gradient-primary)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("sreport.top5")}</h3>
          <div className="space-y-3">
            {top.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t(TIER_KEY[s.tier])} · {s.events} {t("events.title").toLowerCase()}
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">{fmt.money(s.amount)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-semibold text-foreground">{t("sreport.detail")}</h3>
      <TableShell
        columns={[
          t("sponsors.col.name"),
          t("sponsors.col.tier"),
          t("sreport.col.events"),
          t("sreport.col.contrib"),
          t("sponsors.col.since"),
        ]}
      >
        {SPONSORS.map((s) => (
          <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
            <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
            <td className="px-4 py-3 text-foreground">{t(TIER_KEY[s.tier])}</td>
            <td className="px-4 py-3 text-foreground">{s.events}</td>
            <td className="px-4 py-3 font-semibold text-primary">{fmt.money(s.amount)}</td>
            <td className="px-4 py-3 text-muted-foreground">{fmt.date(s.since)}</td>
          </tr>
        ))}
      </TableShell>

      <SponsorExcelImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={reload}
      />
    </AppShell>
  );
}
