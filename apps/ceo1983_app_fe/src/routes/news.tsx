import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, Newspaper, Pencil, Plus, Trash2, Search, Filter, LayoutGrid, List, FileText, CheckCircle2, Clock, RefreshCw, MessageSquare, ShieldAlert, Check } from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { type NewsArticle } from "@/lib/extra-data";
import { createNewsFn, deleteNewsFn, listNewsFn, updateNewsFn } from "@/lib/news.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import { Pagination } from "@/components/dashboard/DataTablePagination";

export const Route = createFileRoute("/news")({
  ssr: false,
  loader: () => listNewsFn(),
  component: NewsPage,
});

const STATUS_KEY: Record<NewsArticle["status"], TKey> = {
  published: "news.status.published",
  scheduled: "news.status.scheduled",
  draft: "news.status.draft",
};
const STATUS_COLOR: Record<NewsArticle["status"], "success" | "info" | "neutral"> = {
  published: "success",
  scheduled: "info",
  draft: "neutral",
};

function NewsPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const { can, isAdmin, isPlatformAdmin, isPresident, isChuTich, canManageMedia, isTruongBanTruyenThong } = useRole();
  const canManageNews = Boolean(
    isAdmin ||
    isPlatformAdmin ||
    isPresident ||
    isChuTich ||
    canManageMedia ||
    isTruongBanTruyenThong ||
    can(PERMISSIONS.MEDIA_MANAGE)
  );
  const NEWS = Route.useLoaderData() as NewsArticle[];
  const published = NEWS.filter((n) => n.status === "published");
  const scheduled = NEWS.filter((n) => n.status === "scheduled");
  const drafts = NEWS.filter((n) => n.status === "draft");
  const totalViews = published.reduce((s, n) => s + n.views, 0);

  const createFn = useServerFn(createNewsFn);
  const updateFn = useServerFn(updateNewsFn);
  const deleteFn = useServerFn(deleteNewsFn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters & View Mode
  const [activeTab, setActiveTab] = useState<"articles" | "comments">("articles");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const loadComments = () => {
    setLoadingComments(true);
    fetchNestApi<any[]>("/feed/moderation/comments")
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch((err) => {
        toast.error("Không thể tải danh sách bình luận: " + (err?.message || "Lỗi mạng"));
      })
      .finally(() => setLoadingComments(false));
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này khỏi hệ thống không?")) return;
    setDeletingCommentId(commentId);
    try {
      await fetchNestApi(`/feed/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Đã xóa bình luận vi phạm thành công!");
    } catch (err: any) {
      toast.error("Lỗi khi xóa bình luận: " + (err?.message || "Thử lại sau"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const filteredComments = useMemo(() => {
    if (!commentSearch.trim()) return comments;
    const q = commentSearch.toLowerCase();
    return comments.filter((c) =>
      (c.content || "").toLowerCase().includes(q) ||
      (c.author_name || "").toLowerCase().includes(q) ||
      (c.post_title || "").toLowerCase().includes(q)
    );
  }, [comments, commentSearch]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "scheduled" | "draft">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const categories = useMemo(() => {
    const set = new Set<string>();
    NEWS.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [NEWS]);

  const filteredNews = useMemo(() => {
    return NEWS.filter((n) => {
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (catFilter !== "all" && n.category !== catFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = n.title?.toLowerCase().includes(q);
        const inAuthor = n.author?.toLowerCase().includes(q);
        const inCat = n.category?.toLowerCase().includes(q);
        if (!inTitle && !inAuthor && !inCat) return false;
      }
      return true;
    });
  }, [NEWS, statusFilter, catFilter, search]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const pageCount = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const paginatedNews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, page, pageSize]);

  const fields: CrudField[] = [
    { name: "title", label: t("news.col.title"), type: "text", required: true, placeholder: "Nhập tiêu đề bài viết tin tức..." },
    { name: "category", label: t("news.col.category"), type: "text", required: true, placeholder: "VD: Hoạt động CLB, Giao thương B2B, Thông báo..." },
    { name: "author", label: t("news.col.author"), type: "text", required: true, placeholder: "VD: Ban Thư Ký, Ban Truyền Thông..." },
    { name: "publishedAt", label: t("news.col.date"), type: "text", placeholder: "YYYY-MM-DD (VD: 2026-09-27)" },
    {
      name: "status",
      label: t("events.col.status"),
      type: "select",
      options: [
        { value: "draft", label: t("news.status.draft") },
        { value: "scheduled", label: t("news.status.scheduled") },
        { value: "published", label: t("news.status.published") },
      ],
    },
    {
      name: "image",
      label: "Ảnh đại diện bài viết",
      type: "image",
      placeholder: "Tải ảnh lên từ máy tính hoặc dán link ảnh...",
    },
    {
      name: "images",
      label: "Album ảnh tin tức (Tải nhiều ảnh)",
      type: "multi-image",
      placeholder: "Chọn nhiều ảnh để tạo album ảnh cho bài viết...",
    },
    { name: "excerpt", label: t("news.col.excerpt"), type: "textarea", placeholder: "Nhập đoạn tóm lược nội dung chính hiển thị ngoài danh sách tin tức..." },
  ];

  const onSubmit = async (v: CrudValues) => {
    if (!canManageNews) {
      toast.error("Bạn không có quyền tạo hoặc chỉnh sửa tin tức!");
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


  const [syncingWeb, setSyncingWeb] = useState(false);

  const handleSyncFromCeo1983Web = async () => {
    setSyncingWeb(true);
    try {
      const res = await fetchNestApi<any>("/content/admin/news/sync-from-web", {
        method: "POST",
      });
      if (res?.ok) {
        toast.success(res.message || "Đồng bộ thành công tin tức từ ceo1983.com!");
        await router.invalidate();
      } else {
        toast.error("Không thể đồng bộ tin tức lúc này.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi kết nối khi đồng bộ từ website ceo1983.com");
    } finally {
      setSyncingWeb(false);
    }
  };

  const onDelete = async (n: NewsArticle) => {
    if (!canManageNews) {
      toast.error("Bạn không có quyền xóa bài viết tin tức!");
      return;
    }
    if (!window.confirm(t("common.confirmDelete", { name: n.title }))) return;
    setDeletingId(n.id);
    try {
      await deleteFn({ data: { id: n.id } });
      toast.success(t("common.deletedToast"));
      await router.invalidate();
    } catch {
      toast.error(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t("news.title")}
        subtitle={t("news.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncFromCeo1983Web}
              disabled={syncingWeb}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer disabled:opacity-50"
              title="Đồng bộ tự động tin tức từ trang web chính thức ceo1983.com"
            >
              <RefreshCw className={`h-4 w-4 ${syncingWeb ? "animate-spin" : ""}`} />
              <span>{syncingWeb ? "Đang đồng bộ..." : "Đồng bộ từ ceo1983.com"}</span>
            </button>
            {can(PERMISSIONS.MEDIA_MANAGE) && (
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] cursor-pointer"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4" />
                {t("news.create")}
              </button>
            )}
          </div>
        }
      />

      {/* ── TAB CHUYỂN ĐỔI: BÀI VIẾT vs KIỂM DUYỆT BÌNH LUẬN ── */}
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === "articles"
              ? "bg-[#003B95] text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>Quản lý Bản Tin ({NEWS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("comments");
            loadComments();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === "comments"
              ? "bg-[#003B95] text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Kiểm duyệt Bình Luận {comments.length > 0 ? `(${comments.length})` : ""}</span>
        </button>
      </div>

      {activeTab === "comments" ? (
        <div className="space-y-4">
          {/* Header & Filter bar for comments */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                placeholder="Tìm bình luận theo nội dung, tác giả hoặc bài viết..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              {commentSearch && (
                <button
                  type="button"
                  onClick={() => setCommentSearch("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Xóa
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={loadComments}
              disabled={loadingComments}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingComments ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Comment list table */}
          <Card className="overflow-hidden p-0 border border-border shadow-xs">
            {loadingComments ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                Đang tải danh sách bình luận...
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                {commentSearch ? "Không tìm thấy bình luận nào khớp với tìm kiếm." : "Chưa có bình luận nào trên các bài viết tin tức."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Tác giả bình luận</th>
                      <th className="py-3 px-4">Bài viết liên quan</th>
                      <th className="py-3 px-4">Nội dung bình luận</th>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredComments.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={c.author_avatar || "/ceo1983-emblem-8.png"}
                              alt={c.author_name}
                              className="size-8 rounded-full object-cover border border-border"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                              }}
                            />
                            <div>
                              <div className="font-bold text-foreground text-xs leading-tight">
                                {c.author_name || "Hội viên"}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                ID: {String(c.author_id || "").slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="font-semibold text-foreground text-xs line-clamp-2">
                            {c.post_title || "Bản tin CEO 1983"}
                          </div>
                          {c.post_category && (
                            <span className="text-[10px] text-primary font-bold">
                              {c.post_category}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-[320px]">
                          <div className="text-xs text-foreground/90 whitespace-pre-wrap break-words bg-muted/40 p-2 rounded-lg border border-border/60">
                            {c.content}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {c.created_at ? new Date(c.created_at).toLocaleString("vi-VN") : "Gần đây"}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={deletingCommentId === c.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            title="Xóa bình luận vi phạm này"
                          >
                            <Trash2 className="size-3.5" />
                            <span>{deletingCommentId === c.id ? "Đang xóa..." : "Xóa"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <>
      {/* 4 Đồng bộ thẻ KPI Metric Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("news.kpi.total")}
          value={NEWS.length}
          icon={<Newspaper className="h-4 w-4" />}
          hint="Toàn bộ bản tin & bài viết"
          tone="primary"
        />
        <StatCard
          label={t("news.kpi.published")}
          value={published.length}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          hint="Đã xuất bản công khai"
        />
        <StatCard
          label="Lên lịch & Bản nháp"
          value={`${scheduled.length} lịch · ${drafts.length} nháp`}
          tone="warning"
          icon={<Clock className="h-4 w-4" />}
          hint="Chờ phê duyệt ban biên tập"
        />
        <StatCard
          label={t("news.kpi.views")}
          value={fmt.num(totalViews)}
          tone="info"
          icon={<Eye className="h-4 w-4" />}
          hint="Tổng lượt đọc & tương tác"
        />
      </div>

      {/* Filter & Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả ({NEWS.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("published");
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "published"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đã xuất bản ({published.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("scheduled");
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "scheduled"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lên lịch ({scheduled.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("draft");
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                statusFilter === "draft"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bản nháp ({drafts.length})
            </button>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tiêu đề, tác giả..."
              className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng bảng dữ liệu"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
          <p className="text-sm text-muted-foreground">Không tìm thấy bài viết tin tức nào phù hợp.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedNews.map((n: any) => (
            <Card key={n.id} className="group overflow-hidden transition hover:shadow-[var(--shadow-glow)]">
              {n.image ? (
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={n.image}
                    alt={n.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div
                  className="flex h-36 w-full items-center justify-center text-primary-foreground/40"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Newspaper className="h-10 w-10 opacity-30" />
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {n.category}
                  </span>
                  <Pill color={STATUS_COLOR[n.status as NewsArticle["status"]]}>{t(STATUS_KEY[n.status as NewsArticle["status"]])}</Pill>
                </div>
                <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground">
                  {n.title}
                </h3>
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{n.excerpt}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {n.author} · {fmt.date(n.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {fmt.num(n.views)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      setEditing(n);
                      setOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => onDelete(n)}
                    disabled={deletingId === n.id}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-secondary/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 w-14 text-center">STT</th>
                  <th className="px-4 py-3 min-w-[240px]">Tiêu đề bài viết</th>
                  <th className="px-4 py-3 min-w-[120px]">Danh mục</th>
                  <th className="px-4 py-3 min-w-[120px]">Tác giả</th>
                  <th className="px-4 py-3 min-w-[100px]">Ngày đăng</th>
                  <th className="px-4 py-3 min-w-[90px] text-right">Lượt xem</th>
                  <th className="px-4 py-3 min-w-[110px]">Trạng thái</th>
                  <th className="px-4 py-3 w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedNews.map((n: any, idx) => (
                  <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-center text-xs font-mono text-muted-foreground">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground line-clamp-1">{n.title}</div>
                      {n.excerpt && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">{n.excerpt}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-primary">
                      {n.category}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {n.author}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmt.date(n.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-right text-foreground">
                      {fmt.num(n.views)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Pill color={STATUS_COLOR[n.status as NewsArticle["status"]]}>
                        {t(STATUS_KEY[n.status as NewsArticle["status"]])}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(n);
                            setOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(n)}
                          disabled={deletingId === n.id}
                          className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── THANH CHUYỂN TRANG (PAGINATION CHUẨN CRM) ── */}
      <div className="mt-4 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={filteredNews.length}
          from={filteredNews.length === 0 ? 0 : (page - 1) * pageSize + 1}
          to={Math.min(page * pageSize, filteredNews.length)}
          onPage={(p) => setPage(p)}
          onPageSize={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[6, 9, 15, 30]}
        />
      </div>
      </>
      )}

      <CrudModal
        open={open}
        title={editing ? t("common.editTitle") : t("news.create")}
        fields={fields}
        initial={
          editing
            ? ({
                ...editing,
                images: editing.images && editing.images.length > 0 ? editing.images : (editing.image ? [editing.image] : []),
              } as unknown as CrudValues)
            : undefined
        }
        submitting={submitting}
        submitLabel={editing ? t("common.save") : t("common.create")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onDelete={editing ? () => onDelete(editing) : undefined}
        isDeleting={editing ? deletingId === editing.id : false}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </AppShell>
  );
}
