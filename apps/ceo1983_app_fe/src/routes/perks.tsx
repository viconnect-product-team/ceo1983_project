import { createFileRoute } from "@tanstack/react-router";
import {
  Gift,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  Building2,
  QrCode,
  Eye,
  EyeOff,
  Tag,
  CheckCircle2,
  X,
  Store,
  MapPin,
  Phone,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { fetchNestApi } from "@/lib/api-client";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import { useTableControls } from "@/hooks/use-table-controls";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { QrCanvas } from "@/components/member/QrCanvas";
import type { MemberPerkFormData } from "@/components/perks/MemberPerkCreateModal";
import {
  createPerkFn,
  deletePerkFn,
  listPerksAdminFn,
  updatePerkFn,
  type AdminPerk,
} from "@/lib/perks.functions";
import { useT } from "@/lib/i18n";
import { BirthdayPromoManager } from "@/components/perks/BirthdayPromoManager";

export const Route = createFileRoute("/perks")({
  component: PerksAdminPage,
});

const ICON_OPTIONS = ["Gift", "Briefcase", "Scale", "Calculator", "Hotel"];

const DEFAULT_FALLBACK_PERKS: AdminPerk[] = [
  {
    id: "perk-001",
    title: "VIP Lounge & Golf Long Biên",
    category: "Golf & Nghỉ dưỡng",
    partner: "Sân Golf Long Biên",
    discount: "Giảm 25%",
    summary: "Đặc quyền phòng chờ VIP và ưu đãi giá green fee dành riêng cho hội viên CEO 1983",
    description: "Hội viên xuất trình thẻ doanh nhân CEO 1983 điện tử để nhận đặc quyền phòng chờ VIP, giảm 25% phí green fee tất cả các ngày trong tuần.",
    icon: "Hotel",
    link: "https://longbiengolf.vn",
    validUntil: "2026-12-31",
    sortOrder: 1,
    status: "active",
  },
  {
    id: "perk-002",
    title: "Nghỉ dưỡng 5 sao Vinpearl & InterContinental",
    category: "Golf & Nghỉ dưỡng",
    partner: "Hệ thống Vinpearl & InterContinental",
    discount: "Ưu đãi 30%",
    summary: "Ưu đãi đặt phòng và dịch vụ ẩm thực tại hệ thống resort 5 sao trên toàn quốc",
    description: "Giảm 30% giá phòng công bố và 15% dịch vụ ẩm thực F&B tại tất cả các cơ sở Vinpearl và InterContinental tại Phú Quốc, Nha Trang, Đà Nẵng.",
    icon: "Hotel",
    link: "https://vinpearl.com",
    validUntil: "2026-12-31",
    sortOrder: 2,
    status: "active",
  },
  {
    id: "perk-003",
    title: "Gói Pháp lý Doanh nghiệp & M&A",
    category: "Dịch vụ Doanh nghiệp",
    partner: "Công ty Luật Trí Minh",
    discount: "Tặng 100% tư vấn",
    summary: "Tư vấn rà soát hợp đồng kinh tế và tái cấu trúc doanh nghiệp miễn phí lần đầu",
    description: "Miễn phí 01 buổi tư vấn chuyên sâu về tái cấu trúc vốn và M&A; giảm 20% phí luật sư cho các vụ việc phát sinh tiếp theo.",
    icon: "Scale",
    link: "https://luattriminh.vn",
    validUntil: "2026-12-31",
    sortOrder: 3,
    status: "active",
  },
  {
    id: "perk-004",
    title: "Dịch vụ Kế toán & Kiểm toán Độc lập",
    category: "Dịch vụ Doanh nghiệp",
    partner: "Vaco Auditing",
    discount: "Chiết khấu 20%",
    summary: "Kiểm toán báo cáo tài chính và thẩm định định giá doanh nghiệp hội viên",
    description: "Chiết khấu trực tiếp 20% phí dịch vụ kiểm toán báo cáo tài chính năm và soát xét hệ thống kiểm soát nội bộ cho doanh nghiệp hội viên.",
    icon: "Calculator",
    link: "https://vaco.com.vn",
    validUntil: "2026-12-31",
    sortOrder: 4,
    status: "active",
  },
  {
    id: "perk-005",
    title: "Hạ tầng Cloud & Chuyển đổi số VNPT",
    category: "Công nghệ & Viễn thông",
    partner: "VNPT Cloud",
    discount: "Tài trợ 15 triệu",
    summary: "Gói tài trợ giải pháp đám mây Smart Cloud và chữ ký số từ xa SmartCA",
    description: "Tặng 15.000.000đ cước sử dụng Cloud Server trong 6 tháng đầu tiên kèm gói chữ ký số cá nhân SmartCA dành cho CEO.",
    icon: "Briefcase",
    link: "https://cloud.vnpt.vn",
    validUntil: "2026-12-31",
    sortOrder: 5,
    status: "active",
  },
];

function PerksAdminPage() {
  const t = useT();
  const { isAdmin, can, loading: roleLoading } = useRole();
  const [perks, setPerks] = useState<AdminPerk[]>(DEFAULT_FALLBACK_PERKS);
  const [loading, setLoading] = useState(false);

  const loadPerks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any[]>("/content/admin/perks").catch(() => null);
      if (Array.isArray(res) && res.length > 0) {
        setPerks(
          res.map((p) => ({
            id: String(p.id),
            title: p.title || "",
            category: p.category || "",
            partner: p.partner || "",
            summary: p.summary || "",
            description: p.description || "",
            discount: p.discount || "",
            icon: p.icon || "Gift",
            link: p.link || "",
            validUntil: p.validUntil || p.valid_until || "",
            sortOrder: Number(p.sortOrder ?? p.sort_order ?? 0),
            status: p.status === "inactive" ? "inactive" : "active",
          })),
        );
      }
    } catch (err) {
      console.error("[Perks] Error fetching perks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = () => loadPerks();

  const createFn = useServerFn(createPerkFn);
  const updateFn = useServerFn(updatePerkFn);
  const deleteFn = useServerFn(deletePerkFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPerk | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [view, setView] = useState<"table" | "cards">("table");
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"system" | "member_perks">("system");
  const [selectedQrPerk, setSelectedQrPerk] = useState<MemberPerkFormData | null>(null);

  // Load custom perks posted by members
  const [memberPerks, setMemberPerks] = useState<MemberPerkFormData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_custom_perks");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [
      {
        id: "perk-mem-seed-1",
        voucherCode: "CEO83-DESIGN30",
        title: "Giảm 30% Chi Phí Thiết Kế Kiến Trúc & Thi Công Nội Thất",
        description: "Áp dụng cho doanh nghiệp Hội viên CEO 1983 khi ký hợp đồng thi công văn phòng, biệt thự.",
        discountType: "percent",
        discountValue: "Giảm 30%",
        partner: "Công Ty CP Kiến Trúc Xanh An Phát",
        category: "Nội thất & Xây dựng",
        productName: "Gói Thiết Kế & Thi Công Nội Thất Cao Cấp",
        applicableLocation: "Tại Văn phòng Hà Nội & TP. Hồ Chí Minh",
        address: "Tầng 8, Tòa Discovery Complex, 302 Cầu Giấy, Hà Nội",
        hotline: "0934 556 677",
        validFrom: "2026-01-01",
        validUntil: "2026-12-31",
        qrPayload: JSON.stringify({ type: "CEO1983_PERK_VOUCHER", voucher: "CEO83-DESIGN30", discount: "Giảm 30%" }),
        creatorName: "Vũ Thành Đạt - Giám đốc",
        status: "active",
        createdAt: "2026-10-15T08:00:00.000Z",
      },
      {
        id: "perk-mem-seed-2",
        voucherCode: "CEO83-BOGO-FNB",
        title: "Mua 1 Tặng 1 Toàn Bộ Menu Đồ Uống & Tiệc Doanh Nhân",
        description: "Tặng 01 phần thức uống cùng loại hoặc giảm 10% tiệc gala tiếp khách doanh nghiệp.",
        discountType: "bogo",
        discountValue: "Mua 1 Tặng 1",
        partner: "Hệ Thống Nhà Hàng & Lounge Legend 83",
        category: "Ẩm thực & Nhà hàng F&B",
        productName: "Menu Ẩm Thực Tiếp Khách & Rượu Vang VIP",
        applicableLocation: "Tất cả chi nhánh tại Hà Nội & Đà Nẵng",
        address: "Số 68 Bà Triệu, Q. Hoàn Kiếm, Hà Nội",
        hotline: "0912 345 678",
        validFrom: "2026-02-01",
        validUntil: "2026-12-31",
        qrPayload: JSON.stringify({ type: "CEO1983_PERK_VOUCHER", voucher: "CEO83-BOGO-FNB", discount: "Mua 1 Tặng 1" }),
        creatorName: "Nguyễn Thị Mai - Phó Tổng GĐ",
        status: "active",
        createdAt: "2026-10-20T10:00:00.000Z",
      },
    ];
  });

  const handleToggleMemberPerkStatus = (id: string, newStatus: "active" | "hidden") => {
    setMemberPerks((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
      try {
        localStorage.setItem("vba_member_custom_perks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(newStatus === "active" ? "Đã duyệt và hiển thị ưu đãi lên App!" : "Đã tạm gỡ/ẩn ưu đãi khỏi App!");
  };

  const handleDeleteMemberPerk = (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn ưu đãi B2B này?")) return;
    setMemberPerks((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("vba_member_custom_perks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success("Đã xóa ưu đãi thành công!");
  };

  const filteredPerks = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return perks;
    return perks.filter(
      (p) =>
        p.title.toLowerCase().includes(ql) ||
        (p.partner || "").toLowerCase().includes(ql) ||
        (p.category || "").toLowerCase().includes(ql) ||
        (p.summary || "").toLowerCase().includes(ql),
    );
  }, [perks, q]);

  const accessors = useMemo(
    () => ({
      title: (p: AdminPerk) => p.title,
      category: (p: AdminPerk) => p.category,
      partner: (p: AdminPerk) => p.partner,
      status: (p: AdminPerk) => p.status,
      sortOrder: (p: AdminPerk) => p.sortOrder,
    }),
    [],
  );

  const tc = useTableControls(filteredPerks, accessors, {
    initialPageSize: 10,
    initialSortKey: "sortOrder",
    initialSortDir: "asc",
  });

  const active = perks.filter((p) => p.status === "active");

  useEffect(() => {
    loadPerks();
  }, [loadPerks]);

  const fields: CrudField[] = [
    { name: "title", label: t("perks.col.title"), type: "text", required: true },
    { name: "category", label: t("perks.col.category"), type: "text" },
    { name: "partner", label: t("perks.col.partner"), type: "text" },
    { name: "discount", label: t("perks.col.discount"), type: "text", placeholder: "-20%" },
    { name: "summary", label: t("perks.col.summary"), type: "textarea" },
    { name: "description", label: t("perks.col.description"), type: "textarea" },
    { name: "link", label: t("perks.col.link"), type: "text", placeholder: "https://" },
    {
      name: "validUntil",
      label: t("perks.col.validUntil"),
      type: "text",
      placeholder: "2026-12-31",
    },
    {
      name: "icon",
      label: t("perks.col.icon"),
      type: "select",
      options: ICON_OPTIONS.map((i) => ({ value: i, label: i })),
    },
    { name: "sortOrder", label: t("perks.col.sortOrder"), type: "number" },
    {
      name: "status",
      label: t("perks.col.status"),
      type: "select",
      options: [
        { value: "active", label: t("perks.status.active") },
        { value: "inactive", label: t("perks.status.inactive") },
      ],
    },
  ];

  const onSubmit = async (v: CrudValues) => {
    if (!can(PERMISSIONS.SPONSOR_CREATE) && !can(PERMISSIONS.MEMBER_CREATE)) {
      toast.error("Bạn không có quyền thêm mới hoặc chỉnh sửa ưu đãi!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: String(v.title || ""),
        category: String(v.category || ""),
        partner: String(v.partner || ""),
        discount: String(v.discount || ""),
        summary: String(v.summary || ""),
        description: String(v.description || ""),
        link: String(v.link || ""),
        validUntil: String(v.validUntil || ""),
        icon: String(v.icon || "Gift"),
        sortOrder: Number(v.sortOrder || 0),
        status: (v.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      };

      if (editing) {
        await fetchNestApi(`/content/admin/perks/${editing.id}`, {
          method: "PUT",
          body: payload,
        }).catch(async () => {
          await updateFn({ data: { id: editing.id, ...payload } as never });
        });
        setPerks((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)),
        );
        toast.success(t("common.updated"));
      } else {
        const res: any = await fetchNestApi("/content/admin/perks", {
          method: "POST",
          body: payload,
        }).catch(async () => {
          return await createFn({ data: payload as never });
        });
        const created: AdminPerk = {
          id: res?.id || `perk-${Date.now()}`,
          ...payload,
        };
        setPerks((prev) => [...prev, created]);
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      loadPerks();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (p: AdminPerk) => {
    if (!can(PERMISSIONS.SPONSOR_CREATE) && !can(PERMISSIONS.MEMBER_CREATE)) {
      toast.error("Bạn không có quyền xóa ưu đãi!");
      return;
    }
    if (!window.confirm(t("common.confirmDelete", { name: p.title }))) return;
    setDeletingId(p.id);
    try {
      await fetchNestApi(`/content/admin/perks/${p.id}`, {
        method: "DELETE",
      }).catch(async () => {
        await deleteFn({ data: { id: p.id } });
      });
      setPerks((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(t("common.deletedToast"));
      loadPerks();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t("perks.title")}
        subtitle={t("perks.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-border bg-card p-0.5 shadow-[var(--shadow-card)]">
              <button
                onClick={() => setView("table")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "table"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" /> Bảng
              </button>
              <button
                onClick={() => setView("cards")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === "cards"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Thẻ
              </button>
            </div>
            {(can(PERMISSIONS.SPONSOR_CREATE) || can(PERMISSIONS.MEMBER_CREATE)) && (
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] cursor-pointer"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" />
                {t("perks.create")}
              </button>
            )}
          </div>
        }
      />

      {/* Birthday Promotion & Perks Policy Managed by Association CRM */}
      <BirthdayPromoManager />

      {/* Tab Switch: Hệ Thống vs Hội Viên Tự Đăng B2B */}
      <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "system"
              ? "bg-[#003B95] text-white shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-4" />
          <span>Ưu Đãi Đối Tác / Hiệp Hội ({perks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("member_perks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "member_perks"
              ? "bg-gradient-to-r from-[#DC2626] to-[#B8860B] text-white shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gift className="size-4" />
          <span>Ưu Đãi Do Hội Viên Đăng B2B ({memberPerks.length})</span>
        </button>
      </div>

      {activeTab === "member_perks" ? (
        <div className="space-y-5">
          {/* Member Perks KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Tổng ưu đãi B2B Hội viên đăng"
              value={memberPerks.length}
              icon={<Gift className="h-4 w-4 text-[#DC2626]" />}
            />
            <StatCard
              label="Đang hiển thị trên Mobile App"
              value={memberPerks.filter((p) => p.status === "active").length}
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              label="Đã tạm ẩn / Gỡ khỏi App"
              value={memberPerks.filter((p) => p.status === "hidden").length}
              tone="warning"
              icon={<EyeOff className="h-4 w-4 text-amber-600" />}
            />
          </div>

          {/* Member Perks Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Danh Sách Ưu Đãi Doanh Nghiệp Do Hội Viên Đăng
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quyền Quản Trị / Ban Điều Hành: Kiểm duyệt, gỡ bỏ hoặc kích hoạt mã ưu đãi của Hội viên
                </p>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="border-b border-border bg-secondary/80 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="sticky left-0 z-20 w-[56px] min-w-[56px] bg-secondary px-3 py-3 text-center border-r border-b border-border">
                      STT
                    </th>
                    <th className="px-4 py-3 border-b border-border">Mã Voucher</th>
                    <th className="px-4 py-3 border-b border-border">Ưu Đãi & Doanh Nghiệp</th>
                    <th className="px-4 py-3 border-b border-border">Hình thức & Mức giảm</th>
                    <th className="px-4 py-3 border-b border-border">Sản phẩm & Nơi áp dụng</th>
                    <th className="px-4 py-3 border-b border-border">Hội viên đăng</th>
                    <th className="px-4 py-3 border-b border-border">Hạn dùng</th>
                    <th className="px-4 py-3 border-b border-border">Trạng thái</th>
                    <th className="sticky right-0 z-20 min-w-[150px] bg-secondary px-4 py-3 text-right border-l border-b border-border">
                      Thao tác Quản trị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberPerks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                        Chưa có ưu đãi B2B nào được hội viên gửi lên.
                      </td>
                    </tr>
                  ) : (
                    memberPerks.map((mp, idx) => (
                      <tr key={mp.id} className="border-b border-border hover:bg-secondary/40 transition">
                        <td className="sticky left-0 z-10 bg-card px-3 py-3 text-center text-xs font-medium text-muted-foreground border-r border-b border-border">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 font-mono text-xs font-black">
                            {mp.voucherCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <div className="font-bold text-foreground text-xs">{mp.title}</div>
                          <div className="text-[11px] text-muted-foreground">{mp.partner}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
                            {mp.discountValue}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b border-border text-xs">
                          <div className="font-medium text-foreground">{mp.productName}</div>
                          <div className="text-[11px] text-muted-foreground">{mp.applicableLocation}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-border text-xs">
                          <div className="font-medium text-foreground">{mp.creatorName || "Hội viên"}</div>
                          <div className="text-[11px] text-blue-600 font-mono">{mp.hotline}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-border text-xs font-mono text-muted-foreground">
                          {mp.validUntil}
                        </td>
                        <td className="px-4 py-3 border-b border-border">
                          <Pill color={mp.status === "active" ? "success" : "neutral"}>
                            {mp.status === "active" ? "Đang hiện" : "Đã gỡ/ẩn"}
                          </Pill>
                        </td>
                        <td className="sticky right-0 z-10 bg-card px-4 py-3 text-right border-l border-b border-border">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedQrPerk(mp)}
                              className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground transition cursor-pointer"
                              title="Xem mã QR ưu đãi"
                            >
                              <QrCode className="size-4 text-blue-600" />
                            </button>
                            {mp.status === "active" ? (
                              <button
                                type="button"
                                onClick={() => handleToggleMemberPerkStatus(mp.id, "hidden")}
                                className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                title="Gỡ ưu đãi khỏi App"
                              >
                                <EyeOff className="size-3.5" /> Gỡ
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleMemberPerkStatus(mp.id, "active")}
                                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                title="Duyệt và hiển thị ưu đãi lên App"
                              >
                                <Eye className="size-3.5" /> Duyệt
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteMemberPerk(mp.id)}
                              className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition cursor-pointer"
                              title="Xóa ưu đãi vĩnh viễn"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label={t("perks.kpi.total")}
              value={perks.length}
              icon={<Gift className="h-4 w-4" />}
            />
            <StatCard
              label={t("perks.kpi.active")}
              value={active.length}
              tone="success"
              icon={<Gift className="h-4 w-4" />}
            />
          </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm ưu đãi theo tiêu đề, đối tác, danh mục..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
      ) : tc.pageRows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("perks.empty")}</p>
      ) : view === "table" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-border bg-secondary/80 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 z-20 w-[56px] min-w-[56px] max-w-[56px] bg-secondary px-3 py-3 text-center border-r border-b border-border">
                    STT
                  </th>
                  <th className="sticky left-[56px] z-20 min-w-[100px] bg-secondary px-4 py-3 border-r border-b border-border shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                    Mã
                  </th>
                  <th className="px-4 py-3 border-b border-border">Ưu đãi & Đối tác</th>
                  <th className="px-4 py-3 border-b border-border">Danh mục</th>
                  <th className="px-4 py-3 border-b border-border">Mức giảm</th>
                  <th className="px-4 py-3 border-b border-border">Trạng thái</th>
                  <th className="px-4 py-3 border-b border-border text-center">Thứ tự</th>
                  <th className="sticky right-0 z-20 min-w-[120px] bg-secondary px-4 py-3 text-right border-l border-b border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {tc.pageRows.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="group border-b border-border transition-all duration-150 hover:bg-secondary/60"
                  >
                    <td className="sticky left-0 z-10 w-[56px] min-w-[56px] max-w-[56px] bg-card group-hover:bg-muted/70 px-3 py-3 text-center text-xs font-medium text-muted-foreground border-r border-b border-border transition-colors">
                      {(tc.page - 1) * tc.pageSize + idx + 1}
                    </td>
                    <td className="sticky left-[56px] z-10 min-w-[100px] bg-card group-hover:bg-muted/70 px-4 py-3 font-mono text-[12px] font-semibold text-primary border-r border-b border-border shadow-[4px_0_6px_-2px_rgba(0,0,0,0.05)] transition-colors">
                      UD-{String(p.sortOrder).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-3 border-b border-border">
                      <div className="font-semibold text-foreground text-xs">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">{p.partner || p.summary}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-primary font-medium border-b border-border">
                      {p.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-primary border-b border-border">
                      {p.discount || "—"}
                    </td>
                    <td className="px-4 py-3 border-b border-border">
                      <Pill color={p.status === "active" ? "success" : "neutral"}>
                        {p.status === "active" ? t("perks.status.active") : t("perks.status.inactive")}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-foreground border-b border-border">
                      #{p.sortOrder}
                    </td>
                    <td className="sticky right-0 z-10 min-w-[120px] bg-card group-hover:bg-muted/70 px-4 py-3 text-right border-l border-b border-border shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)] transition-colors">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-destructive/20 bg-background px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tc.pageRows.map((p) => (
            <Card key={p.id} className="p-5 transition hover:shadow-[var(--shadow-glow)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {p.category || "—"}
                </span>
                <Pill color={p.status === "active" ? "success" : "neutral"}>
                  {p.status === "active" ? t("perks.status.active") : t("perks.status.inactive")}
                </Pill>
              </div>
              <h3 className="mb-1 line-clamp-2 text-base font-semibold text-foreground">
                {p.title}
              </h3>
              {p.discount && (
                <span className="text-xs font-semibold text-primary">{p.discount}</span>
              )}
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.summary}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{p.partner || "—"}</span>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> Link
                  </a>
                )}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                <button
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => onDelete(p)}
                  disabled={deletingId === p.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete")}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      </>
      )}

      {/* Modal Xem Mã QR Ưu Đãi B2B */}
      {selectedQrPerk && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50"
          onClick={() => setSelectedQrPerk(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center text-foreground shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQrPerk(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-muted text-muted-foreground transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              ✦ Mã QR Ưu Đãi B2B ✦
            </span>

            <h3 className="text-base font-bold text-foreground">
              {selectedQrPerk.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedQrPerk.partner} • {selectedQrPerk.discountValue}
            </p>

            <div className="mx-auto my-2 p-3 bg-white rounded-2xl border-2 border-amber-400 shadow-sm inline-block">
              <QrCanvas
                value={selectedQrPerk.qrPayload || `https://ceo1983.vn/perks/redeem?voucher=${selectedQrPerk.voucherCode}`}
                size={180}
                logoUrl="/ceo1983-emblem-8.png"
                logoScale={0.24}
              />
            </div>

            <div className="p-2 rounded-xl bg-secondary text-xs font-mono font-bold text-primary">
              MÃ VOUCHER: {selectedQrPerk.voucherCode}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Nơi áp dụng: {selectedQrPerk.applicableLocation}
            </p>

            <button
              type="button"
              onClick={() => setSelectedQrPerk(null)}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-bold transition cursor-pointer"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      <CrudModal
        open={open}
        title={editing ? t("perks.edit") : t("perks.create")}
        fields={fields}
        initial={editing ? (editing as unknown as CrudValues) : undefined}
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </AppShell>
  );
}
