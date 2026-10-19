import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  FolderOpen,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
  Mail,
  Building,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getNestApiUrl, resolveMediaUrl } from "@/lib/api-client";

import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { EmptyState, ListSkeleton, NoSearchResult } from "@/components/dashboard/StateKit";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";
import { useTableControls } from "@/hooks/use-table-controls";
import { useUrlState } from "@/hooks/use-url-state";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { TruncatedText } from "@/components/dashboard/TruncatedText";
import {
  createDocumentFn,
  deleteDocumentFn,
  getDocumentUrlFn,
  listDocumentsFn,
  updateDocumentFn,
  type Document,
} from "@/lib/documents.functions";
import { useFmt, useT } from "@/lib/i18n";

export const Route = createFileRoute("/documents/")({
  ssr: false,
  loader: () => listDocumentsFn(),
  component: DocsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

const TYPE_COLOR: Record<Document["type"], string> = {
  pdf: "oklch(0.62 0.18 25)",
  doc: "oklch(0.55 0.16 240)",
  docx: "oklch(0.55 0.16 240)",
  xls: "oklch(0.55 0.16 145)",
  xlsx: "oklch(0.55 0.16 145)",
  ppt: "oklch(0.62 0.18 50)",
  pptx: "oklch(0.62 0.18 50)",
  txt: "oklch(0.58 0.04 220)",
  csv: "oklch(0.56 0.15 170)",
  zip: "oklch(0.62 0.15 75)",
  rar: "oklch(0.62 0.15 75)",
  png: "oklch(0.60 0.18 310)",
  jpg: "oklch(0.60 0.18 310)",
  jpeg: "oklch(0.60 0.18 310)",
  other: "oklch(0.50 0.02 240)",
};

const PIN_KEY = "vba.doc.pins";

/** Client-only pinned/favorite documents via localStorage. */
function usePinnedDocs(): {
  pins: Set<string>;
  isPinned: (id: string) => boolean;
  toggle: (id: string) => void;
} {
  const [pins, setPins] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY);
      if (raw) setPins(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (id: string) => {
    setPins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(PIN_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isPinned = useCallback((id: string) => pins.has(id), [pins]);

  return { pins, isPinned, toggle };
}

type SortMode = "newest" | "oldest" | "nameAsc" | "nameDesc";

function FilterChip({
  label,
  onClear,
  clearLabel,
}: {
  label: string;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-foreground">
      <span className="max-w-[10rem] truncate">{label}</span>
      <button
        onClick={onClear}
        aria-label={`${clearLabel}: ${label}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function DocsPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const { isAdmin, isPlatformAdmin, isPresident, isChuTich, isTruongBan, isBanDieuHanh, can } = useRole();
  // Quản trị, chủ tịch, admin, các trưởng ban có quyền xem, chỉnh sửa, upload, xóa tài liệu hiệp hội
  const isLeaderOrAdmin = Boolean(
    isAdmin || isPlatformAdmin || isPresident || isChuTich || isTruongBan || isBanDieuHanh
  );
  const canWriteAssociation = isLeaderOrAdmin || can(PERMISSIONS.DOCUMENT_MANAGE);
  const canWrite = canWriteAssociation;

  const DOCUMENTS = Route.useLoaderData() as Document[];
  const { pins, isPinned, toggle } = usePinnedDocs();

  const [q, setQ] = useUrlState<string>("q", "");
  const [cat, setCat] = useUrlState<string>("cat", "all");
  const [typeF, setTypeF] = useUrlState<string>("type", "all");
  const [owner, setOwner] = useUrlState<string>("owner", "all");
  const [sort, setSort] = useUrlState<SortMode>("sort", "newest");
  const [view, setView] = useUrlState<"card" | "list">("view", "card");
  const [pinnedOnly, setPinnedOnly] = useUrlState<"0" | "1">("pinned", "0");
  const [group, setGroup] = useUrlState<"none" | "cat">("group", "none");
  const [docTab, setDocTab] = useUrlState<"docs" | "mail_templates">("tab", "docs");
  const [scopeTab, setScopeTab] = useUrlState<"all" | "association" | "enterprise">("scope", "all");

  const CRM_COMMITTEE_LIST = [
    "Ban Điều Hành",
    "Ban Thành Viên",
    "Ban Truyền Thông",
    "Ban Xúc Tiến",
    "Ban Tài Chính",
    "Ban Thiện Nguyện",
    "Ban Thư Ký",
    "Biểu mẫu chung",
  ];

  const cats = useMemo(
    () => ["all", ...new Set([...CRM_COMMITTEE_LIST, ...DOCUMENTS.map((d) => d.category).filter(Boolean)])],
    [DOCUMENTS],
  );
  const types = useMemo(() => ["all", ...new Set(DOCUMENTS.map((d) => d.type))], [DOCUMENTS]);
  const owners = useMemo(
    () => ["all", ...new Set(DOCUMENTS.map((d) => d.uploadedBy).filter(Boolean))],
    [DOCUMENTS],
  );

  const createFn = useServerFn(createDocumentFn);
  const updateFn = useServerFn(updateDocumentFn);
  const deleteFn = useServerFn(deleteDocumentFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fields: CrudField[] = [
    {
      name: "filePath",
      label: "Tệp tài liệu đính kèm",
      type: "file",
      required: true,
      placeholder: "Chọn hoặc dán đường dẫn tệp tài liệu...",
    },
    { name: "name", label: t("doc.col.name"), type: "text", required: true, placeholder: "Nhập tên tài liệu..." },
    {
      name: "docScope",
      label: "Phân loại tài liệu",
      type: "select",
      required: true,
      options: [
        { value: "association", label: "🏛️ Tài liệu Hiệp Hội (Chỉ Quản trị / Trưởng ban quản lý)" },
        { value: "enterprise", label: "🏢 Tài liệu Doanh Nghiệp (Hồ sơ, profile, catalogue DN)" },
      ],
    },
    {
      name: "enterpriseName",
      label: "Tên Doanh nghiệp (nếu là tài liệu doanh nghiệp)",
      type: "text",
      placeholder: "Ví dụ: Công ty Cổ phần Viconnect...",
    },
    {
      name: "category",
      label: "Ban phụ trách / Danh mục",
      type: "select",
      required: true,
      options: [
        { value: "Ban Điều Hành", label: "Ban Điều Hành" },
        { value: "Ban Thành Viên", label: "Ban Thành Viên" },
        { value: "Ban Truyền Thông", label: "Ban Truyền Thông" },
        { value: "Ban Xúc Tiến", label: "Ban Xúc Tiến" },
        { value: "Ban Tài Chính", label: "Ban Tài Chính" },
        { value: "Ban Thiện Nguyện", label: "Ban Thiện Nguyện" },
        { value: "Ban Thư Ký", label: "Ban Thư Ký" },
        { value: "Biểu mẫu chung", label: "Biểu mẫu chung" },
        { value: "Hồ sơ & Catalogue Doanh nghiệp", label: "Hồ sơ & Catalogue Doanh nghiệp" },
        { value: "Báo cáo & Chứng nhận DN", label: "Báo cáo & Chứng nhận DN" },
      ],
    },
    {
      name: "type",
      label: t("doc.col.type"),
      type: "select",
      placeholder: "Chọn định dạng tệp...",
      options: [
        { value: "pdf", label: "PDF (.pdf)" },
        { value: "docx", label: "Word (.docx)" },
        { value: "doc", label: "Word cũ (.doc)" },
        { value: "xlsx", label: "Excel (.xlsx)" },
        { value: "xls", label: "Excel cũ (.xls)" },
        { value: "pptx", label: "PowerPoint (.pptx)" },
        { value: "ppt", label: "PowerPoint cũ (.ppt)" },
        { value: "txt", label: "Văn bản thô (.txt)" },
        { value: "csv", label: "Dữ liệu CSV (.csv)" },
        { value: "zip", label: "Tệp nén ZIP (.zip)" },
        { value: "rar", label: "Tệp nén RAR (.rar)" },
        { value: "png", label: "Hình ảnh PNG (.png)" },
        { value: "jpg", label: "Hình ảnh JPG (.jpg, .jpeg)" },
        { value: "other", label: "Định dạng khác" },
      ],
    },
    { name: "size", label: t("doc.col.size"), type: "text", placeholder: "Ví dụ: 2.4 MB" },
    { name: "uploadedBy", label: t("doc.col.uploader"), type: "text", placeholder: "Tên người tải lên..." },
  ];

  const onSubmit = async (v: CrudValues) => {
    const isAssocDoc = v.docScope === "association" || !v.docScope;
    if (isAssocDoc && !canWriteAssociation) {
      toast.error("Tài liệu của Hiệp Hội chỉ có Quản trị, Chủ tịch và các Trưởng ban mới có quyền thêm/chỉnh sửa!");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...(v as object) } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: v as never });
        toast.success(t("common.created"));
      }
      setOpen(false);
      setEditing(null);
      await router.invalidate();
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (d: Document) => {
    const isAssoc = d.docScope === "association" || !d.docScope;
    if (isAssoc && !canWriteAssociation) {
      toast.error("Tài liệu Hiệp Hội chỉ có Quản trị, Chủ tịch và các Trưởng ban được xóa!");
      return;
    }
    if (!window.confirm(t("common.confirmDelete", { name: d.name }))) return;
    setDeletingId(d.id);
    try {
      await deleteFn({ data: { id: d.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const urlFn = useServerFn(getDocumentUrlFn);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onDownload = async (d: Document) => {
    try {
      let rawUrl: string | null | undefined = d.filePath || d.url || d.fileUrl;
      if (!rawUrl) {
        rawUrl = await urlFn({ data: { id: d.id } });
      }
      if (!rawUrl) {
        toast.error(t("doc.noFile"));
        return;
      }
      const finalUrl = resolveMediaUrl(rawUrl) || rawUrl;
      window.open(finalUrl, "_blank", "noopener");
    } catch (e) {
      toast.error(String((e as Error).message ?? e));
    }
  };

  const onUploadFile = async (f: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);

      const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
      const headers = new Headers();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(getNestApiUrl("/upload/file"), {
        method: "POST",
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      const resData = await response.json();
      const path = resData.url;

      const ext = (f.name.split(".").pop() ?? "").toLowerCase();
      const validTypes = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "csv",
        "zip",
        "rar",
        "png",
        "jpg",
        "jpeg",
      ];
      const type = (validTypes.includes(ext) ? ext : "other") as Document["type"];
      const size =
        f.size >= 1048576
          ? `${(f.size / 1048576).toFixed(1)} MB`
          : `${Math.max(1, Math.round(f.size / 1024))} KB`;
      await createFn({
        data: {
          name: f.name,
          category: t("doc.uploadDefaultCat"),
          size,
          uploadedBy: "",
          type,
          filePath: path,
        } as never,
      });
      toast.success(t("doc.uploaded"));
      await router.invalidate();
    } catch (e) {
      toast.error(String((e as Error).message ?? e));
    } finally {
      setUploading(false);
    }
  };

  const pinnedActive = pinnedOnly === "1";
  const hasFilters =
    q.trim() !== "" || cat !== "all" || typeF !== "all" || owner !== "all" || pinnedActive;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = DOCUMENTS.filter((d) => {
      const scope = d.docScope || (d.enterpriseName ? "enterprise" : "association");
      if (scopeTab === "association" && scope !== "association") return false;
      if (scopeTab === "enterprise" && scope !== "enterprise") return false;
      return true;
    })
      .filter((d) => (cat === "all" ? true : d.category === cat))
      .filter((d) => (typeF === "all" ? true : d.type === typeF))
      .filter((d) => (owner === "all" ? true : d.uploadedBy === owner))
      .filter((d) => (pinnedActive ? pins.has(d.id) : true))
      .filter(
        (d) =>
          !ql ||
          d.name.toLowerCase().includes(ql) ||
          d.category.toLowerCase().includes(ql) ||
          (d.enterpriseName && d.enterpriseName.toLowerCase().includes(ql)),
      );

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.uploadedAt.localeCompare(b.uploadedAt);
        case "nameAsc":
          return a.name.localeCompare(b.name, "vi");
        case "nameDesc":
          return b.name.localeCompare(a.name, "vi");
        case "newest":
        default:
          return b.uploadedAt.localeCompare(a.uploadedAt);
      }
    });
    return sorted;
  }, [q, cat, typeF, owner, sort, pinnedActive, pins, DOCUMENTS, scopeTab]);

  // Pinned section only in the default (unfiltered, ungrouped) view.
  const pinnedDocs = useMemo(
    () => (pinnedActive ? [] : filtered.filter((d) => isPinned(d.id))),
    [filtered, isPinned, pinnedActive],
  );
  const recentDocs = useMemo(
    () =>
      hasFilters
        ? []
        : [...DOCUMENTS].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 4),
    [DOCUMENTS, hasFilters],
  );

  // Group filtered docs by category for the grouped view.
  const grouped = useMemo(() => {
    const map = new Map<string, Document[]>();
    for (const d of filtered) {
      const key = d.category || "—";
      const arr = map.get(key);
      if (arr) arr.push(d);
      else map.set(key, [d]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "vi"));
  }, [filtered]);

  const clearFilters = () => {
    setQ("");
    setCat("all");
    setTypeF("all");
    setOwner("all");
    setPinnedOnly("0");
  };

  const tc = useTableControls<Document>(
    filtered,
    {
      name: (d) => d.name,
      cat: (d) => d.category,
      type: (d) => d.type,
      uploader: (d) => d.uploadedBy,
      date: (d) => d.uploadedAt,
    },
    { initialSortKey: "date", initialSortDir: "desc", initialPageSize: 24 },
  );

  const selectClass =
    "h-11 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

  function TypeGlyph({ d, size = "md" }: { d: Document; size?: "sm" | "md" }) {
    const dim = size === "sm" ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-[11px]";
    return (
      <div
        className={`flex ${dim} shrink-0 items-center justify-center rounded-xl font-bold uppercase text-primary-foreground`}
        style={{ background: TYPE_COLOR[d.type] }}
        aria-hidden="true"
      >
        {d.type}
      </div>
    );
  }

  function PinButton({ d }: { d: Document }) {
    const pinned = isPinned(d.id);
    return (
      <button
        onClick={() => toggle(d.id)}
        aria-pressed={pinned}
        aria-label={pinned ? t("doc.unpin") : t("doc.pin")}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          pinned
            ? "bg-warning/15 text-warning"
            : "bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        {pinned ? (
          <PinOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Pin className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  function DocCard({ d }: { d: Document }) {
    return (
      <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-md)]">
        <div className="flex items-start gap-3">
          <TypeGlyph d={d} />
          <div className="min-w-0 flex-1">
            <Link
              to="/documents/$docId"
              params={{ docId: d.id }}
              className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={d.name}
            >
              {d.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold ${
                (d.docScope || "association") === "association"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
              }`}>
                {(d.docScope || "association") === "association" ? "🏛️ Hiệp hội" : "🏢 Doanh nghiệp"}
              </span>
              {d.enterpriseName ? (
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                  {d.enterpriseName}
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {[d.category, d.type?.toUpperCase(), d.size].filter(Boolean).join(" · ")}
              </span>
            </div>
          </div>
          <PinButton d={d} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{d.uploadedBy || "—"}</span>
          <span className="shrink-0">{fmt.date(d.uploadedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 border-t border-border pt-3">
          <button
            onClick={() => void onDownload(d)}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.download")}
          </button>
          {(() => {
            const isAssoc = d.docScope === "association" || !d.docScope;
            const canManageThis = isAssoc ? canWriteAssociation : true;
            if (!canManageThis) return null;
            return (
              <>
                <button
                  onClick={() => {
                    setEditing(d);
                    setOpen(true);
                  }}
                  aria-label={t("doc.edit")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onDelete(d)}
                  disabled={deletingId === d.id}
                  aria-label={t("doc.delete")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </>
            );
          })()}
        </div>
      </div>
    );
  }

  const isLoading = router.state.isLoading;
  const noDocs = DOCUMENTS.length === 0;
  const noResults = !noDocs && filtered.length === 0;

  return (
    <AppShell>
      <PageHeader
        title={docTab === "mail_templates" ? "Quản lý Template Mail & Thông báo" : t("doc.title")}
        subtitle={docTab === "mail_templates" ? "Thiết lập mẫu email tự động CRM: hội phí, cảm ơn hội viên, vé sự kiện, nhắc nợ..." : t("doc.subtitle")}
        actions={
          docTab === "docs" ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-[var(--shadow-card)]"
              role="group"
              aria-label={t("doc.sort.label")}
            >
              <button
                onClick={() => setView("card")}
                aria-pressed={view === "card"}
                aria-label={t("doc.view.card")}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  view === "card"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label={t("doc.view.list")}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  view === "list"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {canWrite && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.png,.jpg,.jpeg"
                  className="hidden"
                  aria-hidden="true"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUploadFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {t("doc.upload")}
                </button>
              </>
            )}
            {canWrite && (
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("doc.create")}
              </button>
            )}
          </div>
          ) : undefined
        }
      />

      {/* Phân Loại Danh Mục Tài Liệu: Hiệp Hội & Doanh Nghiệp */}
      {docTab === "docs" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-2.5 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScopeTab("all")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                scopeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Tất cả tài liệu</span>
              <span className="ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px]">
                {DOCUMENTS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setScopeTab("association")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                scopeTab === "association"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-transparent text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Tài liệu Hiệp Hội</span>
              <span className="ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px]">
                {DOCUMENTS.filter((d) => (d.docScope || "association") === "association").length}
              </span>
              {!canWriteAssociation && (
                <span className="ml-1 text-[10px] font-normal opacity-80">(Chỉ xem)</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setScopeTab("enterprise")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                scopeTab === "enterprise"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Tài liệu Doanh Nghiệp</span>
              <span className="ml-1 rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px]">
                {DOCUMENTS.filter((d) => d.docScope === "enterprise" || Boolean(d.enterpriseName)).length}
              </span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pr-2">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span>Tài liệu Hiệp Hội: Quản trị, Chủ tịch &amp; Trưởng ban toàn quyền; Thành viên chỉ xem.</span>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setDocTab("docs")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            docTab === "docs"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Kho Tài Liệu &amp; Văn Bản</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              docTab === "docs" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {DOCUMENTS.length}
          </span>
        </button>

        <button
          onClick={() => setDocTab("mail_templates")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            docTab === "mail_templates"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Quản Lý Template Mail CRM</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              docTab === "mail_templates" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            }`}
          >
            Dynamic
          </span>
        </button>
      </div>

      {docTab === "mail_templates" ? (
        <MailTemplateManager />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={t("doc.kpi.total")}
          value={DOCUMENTS.length}
          icon={<FolderOpen className="h-4 w-4" />}
        />
        <StatCard
          label={t("doc.kpi.cats")}
          value={cats.length - 1}
          tone="info"
          icon={<FolderOpen className="h-4 w-4" />}
        />
        <StatCard
          label={t("doc.kpi.pinned")}
          value={pins.size}
          tone="warning"
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          label={t("doc.kpi.recent")}
          value={
            recentDocs[0] || DOCUMENTS[0]
              ? fmt.date((recentDocs[0] || DOCUMENTS[0]).uploadedAt)
              : "—"
          }
          tone="primary"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Sticky search + filters */}
      <div className="sm:sticky sm:top-18 z-20 mb-5 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("doc.searchPh")}
              aria-label={t("doc.searchPh")}
              className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label={t("doc.col.cat")}
              className={selectClass}
            >
              {cats.map((c: any) => (
                <option key={c} value={c}>
                  {c === "all" ? t("common.allCategories") : c}
                </option>
              ))}
            </select>
            <select
              value={typeF}
              onChange={(e) => setTypeF(e.target.value)}
              aria-label={t("doc.filter.type")}
              className={selectClass}
            >
              {types.map((c: any) => (
                <option key={c} value={c}>
                  {c === "all" ? t("doc.filter.allTypes") : c.toUpperCase()}
                </option>
              ))}
            </select>
            {owners.length > 1 && (
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                aria-label={t("doc.filter.owner")}
                className={selectClass}
              >
                {owners.map((c: any) => (
                  <option key={c} value={c}>
                    {c === "all" ? t("doc.filter.allOwners") : c}
                  </option>
                ))}
              </select>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label={t("doc.sort.label")}
              className={selectClass}
            >
              <option value="newest">{t("doc.sort.newest")}</option>
              <option value="oldest">{t("doc.sort.oldest")}</option>
              <option value="nameAsc">{t("doc.sort.nameAsc")}</option>
              <option value="nameDesc">{t("doc.sort.nameDesc")}</option>
            </select>
          </div>
        </div>

        {/* Quick filters + active filter chips */}
        <div
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3"
          role="group"
          aria-label={t("doc.quick.label")}
        >
          <button
            onClick={() => setPinnedOnly(pinnedActive ? "0" : "1")}
            aria-pressed={pinnedActive}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              pinnedActive
                ? "border-warning/40 bg-warning/15 text-warning"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            {t("doc.quick.pinned")}
          </button>
          <button
            onClick={() => setGroup(group === "cat" ? "none" : "cat")}
            aria-pressed={group === "cat"}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              group === "cat"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {t("doc.quick.group")}
          </button>

          {/* Active filter chips */}
          {q.trim() !== "" && (
            <FilterChip
              label={`“${q.trim()}”`}
              onClear={() => setQ("")}
              clearLabel={t("doc.chip.remove")}
            />
          )}
          {cat !== "all" && (
            <FilterChip
              label={cat}
              onClear={() => setCat("all")}
              clearLabel={t("doc.chip.remove")}
            />
          )}
          {typeF !== "all" && (
            <FilterChip
              label={typeF.toUpperCase()}
              onClear={() => setTypeF("all")}
              clearLabel={t("doc.chip.remove")}
            />
          )}
          {owner !== "all" && (
            <FilterChip
              label={owner}
              onClear={() => setOwner("all")}
              clearLabel={t("doc.chip.remove")}
            />
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t("doc.quick.clear")}
            </button>
          )}
        </div>
      </div>

      {isLoading && <ListSkeleton rows={6} />}

      {!isLoading && noDocs && (
        <EmptyState
          title={t("doc.empty.title")}
          description={t("doc.empty.desc")}
          icon={<FolderOpen className="h-6 w-6" />}
        />
      )}

      {!isLoading && noResults && pinnedActive && (
        <EmptyState
          title={t("doc.empty.pinned.title")}
          description={t("doc.empty.pinned.desc")}
          icon={<Pin className="h-6 w-6" />}
        />
      )}

      {!isLoading && noResults && !pinnedActive && <NoSearchResult />}

      {!isLoading && !noDocs && !noResults && (
        <div className="space-y-8">
          {/* Recent (only when no active filters) */}
          {recentDocs.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {t("doc.section.recent")}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recentDocs.map((d) => (
                  <DocCard key={`recent-${d.id}`} d={d} />
                ))}
              </div>
            </section>
          )}

          {/* Pinned */}
          {pinnedDocs.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Pin className="h-4 w-4 text-warning" aria-hidden="true" />
                {t("doc.section.pinned")}
                <span className="text-xs font-normal text-muted-foreground">
                  ({pinnedDocs.length} {t("doc.count")})
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pinnedDocs.map((d) => (
                  <DocCard key={`pin-${d.id}`} d={d} />
                ))}
              </div>
            </section>
          )}

          {/* All documents */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t("doc.section.all")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({filtered.length} {t("doc.count")})
              </span>
            </h3>

            {view === "card" ? (
              group === "cat" ? (
                <div className="space-y-6">
                  {grouped.map(([category, docs]) => (
                    <div key={category}>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        {category}
                        <span className="font-normal normal-case">
                          ({docs.length} {t("doc.count")})
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {docs.map((d) => (
                          <DocCard key={d.id} d={d} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tc.pageRows.map((d) => (
                      <DocCard key={d.id} d={d} />
                    ))}
                  </div>
                  <div className="mt-4">
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
                </>
              )
            ) : (
              <div className="self-stretch relative bg-white dark:bg-slate-900 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start overflow-hidden shadow-xs">
                <div className="relative overflow-x-auto w-full">
                  <table className="w-full border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        <th className="sticky left-0 z-20 w-14 bg-slate-100 dark:bg-slate-800 px-3 py-3 text-center text-xs font-bold border-b border-r border-slate-200 dark:border-slate-800">STT</th>
                        <th className="sticky left-[56px] z-20 bg-secondary/90 px-4 py-3 text-xs font-bold border-b border-border">{t("doc.col.name")}</th>
                        <th className="px-4 py-3 border-b border-border">{t("doc.col.cat")}</th>
                        <th className="px-4 py-3 border-b border-border">{t("doc.col.type")}</th>
                        <th className="px-4 py-3 border-b border-border">{t("doc.col.size")}</th>
                        <th className="px-4 py-3 border-b border-border">{t("doc.col.uploader")}</th>
                        <th className="px-4 py-3 border-b border-border">{t("doc.col.date")}</th>
                        <th className="sticky right-0 z-20 bg-secondary/90 px-4 py-3 text-right text-xs font-bold border-b border-border">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tc.pageRows.map((d, idx) => (
                        <tr
                          key={d.id}
                          className="group border-b border-border/50 transition hover:bg-secondary/40"
                        >
                          <td className="sticky left-0 z-10 bg-card px-3 py-3 text-center font-mono text-xs font-semibold text-muted-foreground group-hover:bg-muted/70 border-b border-border/50">
                            {(tc.page - 1) * tc.pageSize + idx + 1}
                          </td>
                          <td className="sticky left-[56px] z-10 bg-card px-4 py-3 group-hover:bg-muted/70 border-b border-border/50">
                            <div className="flex items-center gap-3">
                              <TypeGlyph d={d} size="sm" />
                              <Link
                                to="/documents/$docId"
                                params={{ docId: d.id }}
                                className="font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <TruncatedText text={d.name} maxWidth="max-w-[260px]" className="font-semibold text-foreground" />
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground border-b border-border/50">
                            <TruncatedText text={d.category} maxWidth="max-w-[160px]" />
                          </td>
                          <td className="px-4 py-3 text-[11px] font-semibold uppercase text-muted-foreground border-b border-border/50">
                            {d.type}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground border-b border-border/50">{d.size}</td>
                          <td className="px-4 py-3 text-foreground border-b border-border/50">
                            <TruncatedText text={d.uploadedBy} maxWidth="max-w-[160px]" />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground border-b border-border/50">{fmt.date(d.uploadedAt)}</td>
                          <td className="sticky right-0 z-10 bg-card px-4 py-3 group-hover:bg-muted/70 border-b border-border/50">
                            <div className="flex items-center justify-end gap-1">
                              <PinButton d={d} />
                              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                {t("common.download")}
                              </button>
                              {(() => {
                                const isAssoc = d.docScope === "association" || !d.docScope;
                                const canManageThis = isAssoc ? canWriteAssociation : true;
                                if (!canManageThis) return null;
                                return (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditing(d);
                                        setOpen(true);
                                      }}
                                      aria-label={t("doc.edit")}
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                    <button
                                      onClick={() => onDelete(d)}
                                      disabled={deletingId === d.id}
                                      aria-label={t("doc.delete")}
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                  </>
                                );
                              })()}
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
            )}
          </section>
        </div>
      )}
      </>
      )}

      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("doc.create")}
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
