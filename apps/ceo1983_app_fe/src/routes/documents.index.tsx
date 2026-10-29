import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  FolderOpen,
  FolderPlus,
  Folder,
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
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Share2,
  Move,
  Check,
  Globe,
  Users,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getNestApiUrl, resolveMediaUrl } from "@/lib/api-client";

import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { EmptyState, ListSkeleton, NoSearchResult } from "@/components/dashboard/StateKit";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";
import { DriveShareModal } from "@/components/documents/DriveShareModal";
import { DriveMoveModal } from "@/components/documents/DriveMoveModal";
import { DriveDocumentModal } from "@/components/documents/DriveDocumentModal";
import { useTableControls } from "@/hooks/use-table-controls";
import { useUrlState } from "@/hooks/use-url-state";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import { TruncatedText } from "@/components/dashboard/TruncatedText";
import {
  createDocumentFn,
  deleteDocumentFn,
  getDocumentUrlFn,
  listDocumentsFn,
  updateDocumentFn,
  updateShareDocumentFn,
  moveDocumentFn,
  toggleStarDocumentFn,
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
  folder: "oklch(0.68 0.18 80)",
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

  // Danh mục tùy biến người dùng tự thêm linh hoạt
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("vba_custom_doc_categories");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const onAddCustomCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed || customCategories.includes(trimmed) || CRM_COMMITTEE_LIST.includes(trimmed)) return;
    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    try {
      localStorage.setItem("vba_custom_doc_categories", JSON.stringify(updated));
    } catch { }
  };

  const cats = useMemo(
    () => [
      "all",
      ...new Set([
        ...CRM_COMMITTEE_LIST,
        ...customCategories,
        ...DOCUMENTS.map((d) => d.category).filter(Boolean),
      ]),
    ],
    [DOCUMENTS, customCategories],
  );
  const types = useMemo(() => ["all", ...new Set(DOCUMENTS.map((d) => d.type))], [DOCUMENTS]);
  const owners = useMemo(
    () => ["all", ...new Set(DOCUMENTS.map((d) => d.uploadedBy).filter(Boolean))],
    [DOCUMENTS],
  );

  const createFn = useServerFn(createDocumentFn);
  const updateFn = useServerFn(updateDocumentFn);
  const deleteFn = useServerFn(deleteDocumentFn);
  const updateShareFn = useServerFn(updateShareDocumentFn);
  const moveFn = useServerFn(moveDocumentFn);
  const toggleStarFn = useServerFn(toggleStarDocumentFn);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quản lý thư mục và chia sẻ phong cách Google Drive
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderCat, setNewFolderCat] = useState("Biểu mẫu chung");
  const [isAddingFolderCat, setIsAddingFolderCat] = useState(false);
  const [newFolderCatInput, setNewFolderCatInput] = useState("");
  const [newFolderScope, setNewFolderScope] = useState<"association" | "enterprise">("association");
  const [newFolderColor, setNewFolderColor] = useState<string>("#F59E0B");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Modals phong cách Google Drive
  const [shareModalDoc, setShareModalDoc] = useState<Document | null>(null);
  const [moveModalDoc, setMoveModalDoc] = useState<Document | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onSaveDoc = async (payload: any) => {
    const isAssocDoc = payload.docScope === "association" || !payload.docScope;
    if (isAssocDoc && !canWriteAssociation) {
      toast.error("Tài liệu của Hiệp Hội chỉ có Quản trị, Chủ tịch và các Trưởng ban mới có quyền thêm/chỉnh sửa!");
      return;
    }
    if (payload.category) {
      onAddCustomCategory(payload.category);
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn({ data: { id: editing.id, ...payload } as never });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: payload as never });
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

  const onCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error("Vui lòng nhập tên thư mục!");
      return;
    }
    const finalCat =
      isAddingFolderCat && newFolderCatInput.trim() ? newFolderCatInput.trim() : newFolderCat;
    if (isAddingFolderCat && newFolderCatInput.trim()) {
      onAddCustomCategory(newFolderCatInput.trim());
    }
    setCreatingFolder(true);
    try {
      await createFn({
        data: {
          name: newFolderName.trim(),
          category: finalCat,
          type: "folder",
          isFolder: true,
          folderId: currentFolderId,
          docScope: newFolderScope,
          colorTag: newFolderColor,
          size: "Thư mục",
          uploadedBy: "Quản trị CLB",
          filePath: "",
        } as never,
      });
      toast.success(`Đã tạo thư mục "${newFolderName}" thành công!`);
      setCreateFolderModalOpen(false);
      setNewFolderName("");
      setIsAddingFolderCat(false);
      setNewFolderCatInput("");
      setNewFolderColor("#F59E0B");
      await router.invalidate();
    } catch (err: any) {
      toast.error("Không thể tạo thư mục lúc này: " + (err.message || ""));
    } finally {
      setCreatingFolder(false);
    }
  };

  const onSaveShare = async (
    id: string,
    shareScope: "public" | "internal" | "specific" | "private",
    shareRole: "viewer" | "downloader" | "editor",
    sharedWith: any[]
  ) => {
    await updateShareFn({ data: { id, shareScope, shareRole, sharedWith } });
    await router.invalidate();
  };

  const onMoveDoc = async (id: string, targetFolderId: string | null) => {
    await moveFn({ data: { id, targetFolderId } });
    await router.invalidate();
  };

  const onToggleStar = async (d: Document) => {
    toggle(d.id);
    try {
      await toggleStarFn({ data: { id: d.id } });
      await router.invalidate();
    } catch { }
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
      // Nếu có liên kết Google Drive, mở trực tiếp liên kết
      if (d.driveUrl) {
        window.open(d.driveUrl, "_blank", "noopener");
        return;
      }
      let rawUrl: string | null | undefined = d.filePath || d.url || d.fileUrl;
      let docName = d.name;
      if (!rawUrl) {
        const urlRes = await urlFn({ data: { id: d.id } });
        if (typeof urlRes === "string") {
          rawUrl = urlRes;
        } else if (urlRes && typeof urlRes === "object") {
          rawUrl = (urlRes as any).url;
          if ((urlRes as any).name) docName = (urlRes as any).name;
        }
      }
      if (!rawUrl) {
        toast.error(t("doc.noFile"));
        return;
      }
      const finalUrl = resolveMediaUrl(rawUrl) || rawUrl;

      // Đảm bảo tên file tải về có đầy đủ extension để mở chuẩn trên máy tính
      let downloadFileName = docName;
      if (
        d.type &&
        d.type !== "other" &&
        d.type !== "folder" &&
        !downloadFileName.toLowerCase().endsWith("." + d.type.toLowerCase())
      ) {
        downloadFileName = `${downloadFileName}.${d.type}`;
      }

      // Tải file về máy với đúng tên của tài liệu
      toast.loading(`Đang tải xuống "${downloadFileName}"...`, { id: "doc-download" });
      try {
        const res = await fetch(finalUrl);
        if (!res.ok) throw new Error("Fetch failed");
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success(`Đã tải xuống "${downloadFileName}" thành công!`, { id: "doc-download" });
      } catch {
        // Fallback mở trực tiếp kèm download attribute
        const link = document.createElement("a");
        link.href = finalUrl;
        link.download = downloadFileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Đang mở tệp "${downloadFileName}"`, { id: "doc-download" });
      }
    } catch (e) {
      toast.error(String((e as Error).message ?? e));
    }
  };

  const onUploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const toastId = toast.loading(`Đang tải lên 0/${files.length} tài liệu...`);

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

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Kiểm tra dung lượng tối đa 500MB trực tiếp từ client để tránh sập web
      if (f.size > 500 * 1024 * 1024) {
        toast.error(
          `Tệp "${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)} MB) vượt quá dung lượng cho phép (tối đa 500MB). Vui lòng chọn tệp nhỏ hơn hoặc dán link Google Drive!`,
          { duration: 6000 }
        );
        failCount++;
        continue;
      }

      toast.loading(`Đang tải lên (${i + 1}/${files.length}): ${f.name}...`, { id: toastId });
      try {
        const formData = new FormData();
        formData.append("file", f);

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
            folderId: currentFolderId,
            isFolder: false,
          } as never,
        });
        successCount++;
      } catch (err: any) {
        console.error("Error uploading doc:", f.name, err);
        failCount++;
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Đã tải lên thành công ${successCount} tài liệu!${failCount > 0 ? ` (${failCount} tệp lỗi hoặc >500MB)` : ""}`, {
        id: toastId,
      });
      await router.invalidate();
    } else {
      toast.error(`Tải tài liệu thất bại!`, { id: toastId });
    }
  };

  const pinnedActive = pinnedOnly === "1";
  const hasFilters =
    q.trim() !== "" || cat !== "all" || typeF !== "all" || owner !== "all" || pinnedActive;

  const currentFolder = useMemo(() => {
    return currentFolderId ? DOCUMENTS.find((d) => d.id === currentFolderId) || null : null;
  }, [DOCUMENTS, currentFolderId]);

  const currentFolders = useMemo(() => {
    if (q.trim()) return [];
    return DOCUMENTS.filter(
      (d) => (d.isFolder || d.type === "folder") && (currentFolderId ? d.folderId === currentFolderId : !d.folderId),
    );
  }, [DOCUMENTS, currentFolderId, q]);

  const breadcrumbs = useMemo(() => {
    const trail: { id: string | null; name: string }[] = [{ id: null, name: "Thư mục gốc" }];
    if (!currentFolderId) return trail;

    const visited = new Set<string>();
    const currTrail: { id: string; name: string }[] = [];
    let curr: Document | undefined = DOCUMENTS.find((d) => d.id === currentFolderId);
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      currTrail.unshift({ id: curr.id, name: curr.name });
      const parentId: string | null = curr.folderId || null;
      if (!parentId) break;
      curr = DOCUMENTS.find((d) => d.id === parentId);
    }
    return [...trail, ...currTrail];
  }, [DOCUMENTS, currentFolderId]);

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
      .filter((d) => {
        // Nếu tìm kiếm từ khóa thì tìm trong toàn bộ hệ thống
        if (ql) return true;
        // Nếu không tìm kiếm thì chỉ hiện tệp thuộc thư mục đang mở
        if (currentFolderId) {
          return d.folderId === currentFolderId;
        }
        return !d.folderId;
      })
      .filter(
        (d) =>
          !ql ||
          d.name.toLowerCase().includes(ql) ||
          d.category.toLowerCase().includes(ql) ||
          (d.enterpriseName && d.enterpriseName.toLowerCase().includes(ql)),
      );

    const sorted = [...list].sort((a, b) => {
      // Ưu tiên hiển thị thư mục lên trước các tệp
      const aIsFolder = a.isFolder || a.type === "folder" ? 1 : 0;
      const bIsFolder = b.isFolder || b.type === "folder" ? 1 : 0;
      if (aIsFolder !== bIsFolder) return bIsFolder - aIsFolder;

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
  }, [q, cat, typeF, owner, sort, pinnedActive, pins, DOCUMENTS, scopeTab, currentFolderId]);

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
    const isFolder = d.isFolder || d.type === "folder";
    if (isFolder) {
      return (
        <div
          className={`flex ${dim} shrink-0 items-center justify-center rounded-xl font-bold uppercase bg-amber-500 text-white shadow-xs`}
          aria-hidden="true"
        >
          <Folder className={size === "sm" ? "h-4 w-4 fill-white/30" : "h-5 w-5 fill-white/30"} />
        </div>
      );
    }
    return (
      <div
        className={`flex ${dim} shrink-0 items-center justify-center rounded-xl font-bold uppercase text-primary-foreground`}
        style={{ background: TYPE_COLOR[d.type] || "oklch(0.50 0.02 240)" }}
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
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${pinned
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
    const isFolder = d.isFolder || d.type === "folder";
    return (
      <div
        onClick={() => {
          if (isFolder) setCurrentFolderId(d.id);
        }}
        className={`group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-md)] ${isFolder ? "cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5" : ""
          }`}
      >
        <div className="flex items-start gap-3">
          <TypeGlyph d={d} />
          <div className="min-w-0 flex-1">
            {isFolder ? (
              <span
                className="block truncate text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400"
                title={d.name}
              >
                📁 {d.name}
              </span>
            ) : (
              <Link
                to="/documents/$docId"
                params={{ docId: d.id } as any}
                className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={d.name}
              >
                {d.name}
              </Link>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold ${(d.docScope || "association") === "association"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                  }`}
              >
                {(d.docScope || "association") === "association" ? "🏛️ Hiệp hội" : "🏢 Doanh nghiệp"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${d.shareScope === "public"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : d.shareScope === "internal"
                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                      : d.shareScope === "specific"
                        ? "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                        : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                  }`}
              >
                {d.shareScope === "public" && "🌐 Công khai"}
                {d.shareScope === "internal" && "🏛️ Nội bộ"}
                {d.shareScope === "specific" && "👥 Chỉ định"}
                {(!d.shareScope || d.shareScope === "private") && "🔒 Riêng tư"}
              </span>
              {d.driveUrl && (
                <a
                  href={d.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:underline"
                  title="Mở Google Drive"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Drive
                </a>
              )}
              {d.enterpriseName ? (
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                  {d.enterpriseName}
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {[d.category, isFolder ? "THƯ MỤC" : d.type?.toUpperCase(), d.size].filter(Boolean).join(" · ")}
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
          {isFolder ? (
            <button
              onClick={() => setCurrentFolderId(d.id)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 text-xs font-bold hover:bg-amber-500/20 cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Mở thư mục
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void onDownload(d);
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {d.driveUrl ? (
                <>
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Mở Google Drive</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("common.download")}</span>
                </>
              )}
            </button>
          )}
          {(() => {
            const isAssoc = d.docScope === "association" || !d.docScope;
            const canManageThis = isAssoc ? canWriteAssociation : true;
            if (!canManageThis) return null;
            return (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareModalDoc(d);
                  }}
                  title="Chia sẻ (như Google Drive)"
                  aria-label="Chia sẻ"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 focus-visible:outline-none cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoveModalDoc(d);
                  }}
                  title="Di chuyển vào thư mục khác"
                  aria-label="Di chuyển"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 focus-visible:outline-none cursor-pointer"
                >
                  <Move className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(d);
                    setOpen(true);
                  }}
                  aria-label={t("doc.edit")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(d);
                  }}
                  disabled={deletingId === d.id}
                  aria-label={t("doc.delete")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          const files = Array.from(e.dataTransfer.files || []);
          if (files.length > 0) void onUploadFiles(files);
        }}
        className="relative min-h-[calc(100vh-120px)]"
      >
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
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "card"
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
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "list"
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <ListIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {canWrite && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFolderName("");
                        setCreateFolderModalOpen(true);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 text-sm font-semibold text-amber-700 dark:text-amber-300 shadow-[var(--shadow-card)] hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <FolderPlus className="h-4 w-4" aria-hidden="true" />
                      <span>Tạo thư mục</span>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.png,.jpg,.jpeg"
                      className="hidden"
                      aria-hidden="true"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) void onUploadFiles(files);
                        e.target.value = "";
                      }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      {uploading ? "Đang tải lên..." : "Tải lên tài liệu"}
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${scopeTab === "all"
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${scopeTab === "association"
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${scopeTab === "enterprise"
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
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${docTab === "docs"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Kho Tài Liệu &amp; Văn Bản</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${docTab === "docs" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
            >
              {DOCUMENTS.length}
            </span>
          </button>

          <button
            onClick={() => setDocTab("mail_templates")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${docTab === "mail_templates"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <Mail className="h-4 w-4" />
            <span>Quản Lý Template Mail CRM</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${docTab === "mail_templates" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
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
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${pinnedActive
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
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${group === "cat"
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
              <div className="space-y-6">
                {/* Breadcrumb Navigation - Chuẩn Google Drive */}
                {!q.trim() && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 px-4 py-2.5 shadow-xs">
                    <nav className="flex items-center gap-1.5 text-sm overflow-x-auto py-1">
                      {breadcrumbs.map((crumb, idx) => {
                        const isLast = idx === breadcrumbs.length - 1;
                        return (
                          <div key={crumb.id || "root"} className="flex items-center gap-1.5 shrink-0">
                            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                            <button
                              type="button"
                              onClick={() => setCurrentFolderId(crumb.id)}
                              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${isLast
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                              {idx === 0 ? <Folder className="h-3.5 w-3.5 text-amber-500" /> : <FolderOpen className="h-3.5 w-3.5 text-amber-600" />}
                              <span>{crumb.name}</span>
                            </button>
                          </div>
                        );
                      })}
                    </nav>
                    <div className="flex items-center gap-2">
                      {currentFolderId && (
                        <button
                          type="button"
                          onClick={() => {
                            const parentId = currentFolder?.folderId || null;
                            setCurrentFolderId(parentId);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Lên thư mục cha</span>
                        </button>
                      )}
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewFolderName("");
                            setCreateFolderModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                          <span>Thư mục mới</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Danh sách Thư mục con (Folders Grid) */}
                {!q.trim() && currentFolders.length > 0 && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                      <Folder className="h-4 w-4 text-amber-500" />
                      <span>Thư mục con ({currentFolders.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {currentFolders.map((f) => {
                        const childCount = DOCUMENTS.filter((d) => d.folderId === f.id).length;
                        return (
                          <div
                            key={`f-${f.id}`}
                            onClick={() => setCurrentFolderId(f.id)}
                            className="group flex items-center justify-between gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-md cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs group-hover:scale-105 transition-transform"
                                style={{ backgroundColor: f.colorTag || "#F59E0B" }}
                              >
                                <Folder className="h-5 w-5 fill-white/20" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                  {f.name}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <span>{childCount} mục</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[80px]">{f.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShareModalDoc(f);
                                }}
                                title="Chia sẻ thư mục"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

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
                                      params={{ docId: d.id } as any}
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
                                    <button
                                      onClick={() => void onDownload(d)}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                      {t("common.download")}
                                    </button>
                                    <button
                                      onClick={() => setShareModalDoc(d)}
                                      title="Chia sẻ (Google Drive)"
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                    >
                                      <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setMoveModalDoc(d)}
                                      title="Di chuyển vào thư mục khác"
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                                    >
                                      <Move className="h-3.5 w-3.5" />
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

        {/* Modal Tạo & Chỉnh Sửa Tài Liệu Phong Cách Google Drive */}
        <DriveDocumentModal
          isOpen={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          document={editing}
          currentFolderId={currentFolderId}
          currentFolderName={currentFolder ? currentFolder.name : "Thư mục gốc"}
          categories={cats.filter((c) => c !== "all")}
          onAddCategory={onAddCustomCategory}
          onSave={onSaveDoc}
          isLeaderOrAdmin={canWriteAssociation}
        />

        {/* Modal Tạo Thư Mục Mới Chuẩn Google Drive */}
        {createFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Tạo thư mục mới</h3>
                    <p className="text-xs text-muted-foreground">Tạo phân cấp lưu trữ tài liệu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateFolderModalOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={onCreateFolder} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Tên thư mục <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ví dụ: Đại hội Hội viên 2026, Biểu mẫu ban Xúc tiến..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Phân loại thư mục
                  </label>
                  <select
                    value={newFolderScope}
                    onChange={(e) => setNewFolderScope(e.target.value as "association" | "enterprise")}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="association">🏛️ Thư mục Hiệp Hội (Chỉ Quản trị / Trưởng ban)</option>
                    <option value="enterprise">🏢 Thư mục Doanh Nghiệp (Dành cho thành viên)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Ban phụ trách / Danh mục
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingFolderCat(!isAddingFolderCat)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isAddingFolderCat ? "Chọn có sẵn" : "+ Nhập danh mục mới"}</span>
                    </button>
                  </div>

                  {isAddingFolderCat ? (
                    <input
                      type="text"
                      autoFocus
                      value={newFolderCatInput}
                      onChange={(e) => setNewFolderCatInput(e.target.value)}
                      placeholder="Gõ tên danh mục thư mục mới..."
                      className="w-full rounded-xl border border-amber-500/50 bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  ) : (
                    <select
                      value={newFolderCat}
                      onChange={(e) => {
                        if (e.target.value === "__add_new__") {
                          setIsAddingFolderCat(true);
                        } else {
                          setNewFolderCat(e.target.value);
                        }
                      }}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                    >
                      {cats
                        .filter((c) => c !== "all")
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      <option value="__add_new__">➕ [+ Tự thêm danh mục mới...]</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Màu sắc thư mục (Google Drive)
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { color: "#F59E0B", name: "Vàng Hổ Phách" },
                      { color: "#DC2626", name: "Đỏ CEO 1983" },
                      { color: "#003B95", name: "Xanh Navy" },
                      { color: "#059669", name: "Xanh Emerald" },
                      { color: "#7C3AED", name: "Tím Hoàng Gia" },
                      { color: "#475569", name: "Xám Titan" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setNewFolderColor(c.color)}
                        style={{ backgroundColor: c.color }}
                        className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${newFolderColor === c.color ? "scale-125 ring-2 ring-foreground ring-offset-2" : "hover:scale-110"
                          }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>
                    Vị trí lưu: <strong className="text-foreground">{currentFolder ? currentFolder.name : "Thư mục gốc"}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCreateFolderModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {creatingFolder ? "Đang tạo..." : "Tạo thư mục"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Chia sẻ chuẩn Google Drive */}
        <DriveShareModal
          isOpen={Boolean(shareModalDoc)}
          onClose={() => setShareModalDoc(null)}
          document={shareModalDoc}
          onSaveShare={onSaveShare}
        />

        {/* Modal Di chuyển vào thư mục */}
        <DriveMoveModal
          isOpen={Boolean(moveModalDoc)}
          onClose={() => setMoveModalDoc(null)}
          document={moveModalDoc}
          allDocuments={DOCUMENTS}
          onMove={onMoveDoc}
        />

        {/* Drag & Drop Visual Indicator Overlay */}
        {isDraggingOver && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none animate-in fade-in duration-150">
            <div className="rounded-3xl border-2 border-dashed border-amber-500 bg-card/95 p-8 shadow-2xl flex flex-col items-center gap-3 max-w-md text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
                <Upload className="h-8 w-8 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Thả tệp vào đây để tải lên</h3>
              <p className="text-xs text-muted-foreground">
                Tệp sẽ được lưu trực tiếp vào: <strong className="text-foreground">{currentFolder ? currentFolder.name : "Thư mục gốc"}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
