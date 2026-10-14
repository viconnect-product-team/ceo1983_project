import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Eye,
  Calendar,
  User,
  FileText,
  Loader2,
  Plus,
  ExternalLink,
  Link as LinkIcon,
  ImagePlus,
  X,
  Share2,
  Sparkles,
  Search,
  Check,
  CheckCheck,
  Newspaper,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listNews, getMyMember, type NewsItem, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { useT, useFmt } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import {
  getReadNewsIds,
  markNewsAsRead,
  markAllNewsAsRead,
} from "@/lib/news-read-tracker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type NewsCategoryTab = "all" | "latest" | "read" | "unread";

type NewsSearch = {
  tab?: NewsCategoryTab;
  articleId?: string;
};

export const Route = createFileRoute("/association/news")({
  validateSearch: (search: Record<string, unknown>): NewsSearch => {
    const validTabs: NewsCategoryTab[] = ["all", "latest", "read", "unread"];
    const tab = typeof search.tab === "string" && validTabs.includes(search.tab as NewsCategoryTab)
      ? (search.tab as NewsCategoryTab)
      : undefined;
    const articleId = typeof search.articleId === "string" ? search.articleId : undefined;
    return { tab, articleId };
  },
  component: NewsScreen,
});

export default function NewsScreen() {
  const t = useT();
  const fmt = useFmt();
  const { user } = useAuth();
  const search = Route.useSearch();

  const fetchMyMemberFn = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMyMemberFn(), null);

  const [selectedNews, setSelectedNews] = useState<(NewsItem & { url?: string }) | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category Tab state: all | latest | read | unread
  const [activeTab, setActiveTab] = useState<NewsCategoryTab>(() => {
    return search?.tab || "all";
  });

  // Track read news IDs from localStorage
  const [readNewsIds, setReadNewsIds] = useState<string[]>(() => getReadNewsIds());

  // Listen to read news changes from other components / window events
  useEffect(() => {
    const handleNewsRead = (e: Event) => {
      const customEvent = e as CustomEvent<{ readIds: string[] }>;
      if (customEvent.detail?.readIds) {
        setReadNewsIds(customEvent.detail.readIds);
      } else {
        setReadNewsIds(getReadNewsIds());
      }
    };
    window.addEventListener("ceo1983_news_read_updated", handleNewsRead);
    return () => window.removeEventListener("ceo1983_news_read_updated", handleNewsRead);
  }, []);

  // Form states for creating / editing / sharing an article
  const [editingNews, setEditingNews] = useState<(NewsItem & { url?: string }) | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Tin doanh nghiệp");
  const [customCategory, setCustomCategory] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local deleted news IDs (to hide deleted server articles)
  const [deletedNewsIds, setDeletedNewsIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_deleted_news");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Local articles state combined with server news
  const [localNews, setLocalNews] = useState<Array<NewsItem & { url?: string }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_shared_news");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchNews = useServerFn(listNews);
  const { data: serverNews = [], loading: newsLoading } = useServerData<NewsItem[]>(() => fetchNews(), []);

  // Merge local shared news and server news, filtering out deleted ones
  const allNews: Array<NewsItem & { url?: string }> = useMemo(() => {
    const combined = [
      ...localNews,
      ...serverNews.filter((sn) => !localNews.some((ln) => ln.id === sn.id)),
    ];
    return combined.filter((n) => !deletedNewsIds.includes(n.id));
  }, [localNews, serverNews, deletedNewsIds]);

  // Open specific article if articleId query param is present
  useEffect(() => {
    if (search?.articleId && allNews.length > 0) {
      const target = allNews.find((n) => n.id === search.articleId);
      if (target) {
        setSelectedNews(target);
        const updated = markNewsAsRead(target.id);
        setReadNewsIds(updated);
      }
    }
  }, [search?.articleId, allNews]);

  const readCount = useMemo(() => {
    return allNews.filter((n) => readNewsIds.includes(n.id)).length;
  }, [allNews, readNewsIds]);

  const unreadCount = useMemo(() => {
    return allNews.filter((n) => !readNewsIds.includes(n.id)).length;
  }, [allNews, readNewsIds]);

  // Filtered and sorted news list based on active tab and search query
  const displayedNews = useMemo(() => {
    let list = [...allNews];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt?.toLowerCase().includes(q) ||
          n.category?.toLowerCase().includes(q) ||
          n.author?.toLowerCase().includes(q)
      );
    }

    // Category tab filter
    if (activeTab === "latest") {
      // Sort latest first
      return list.slice().sort((a, b) => {
        const timeA = new Date(a.time).getTime() || 0;
        const timeB = new Date(b.time).getTime() || 0;
        return timeB - timeA;
      });
    } else if (activeTab === "read") {
      return list.filter((n) => readNewsIds.includes(n.id));
    } else if (activeTab === "unread") {
      return list.filter((n) => !readNewsIds.includes(n.id));
    }

    return list; // "all"
  }, [allNews, searchQuery, activeTab, readNewsIds]);

  const handleOpenArticle = (item: NewsItem & { url?: string }) => {
    setSelectedNews(item);
    const updated = markNewsAsRead(item.id);
    setReadNewsIds(updated);
  };

  const handleMarkAllRead = () => {
    const allIds = allNews.map((n) => n.id);
    const updated = markAllNewsAsRead(allIds);
    setReadNewsIds(updated);
    toast.success("Đã đánh dấu tất cả bài viết là đã đọc!");
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadFileToNest(file, `news_${Date.now()}.jpg`);
      setPostImage(uploadedUrl);
      toast.success("Đã tải ảnh lên thành công!");
    } catch {
      toast.error("Không thể tải ảnh. Vui lòng thử lại!");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setEditingNews(null);
    setPostTitle("");
    setPostCategory("Tin doanh nghiệp");
    setCustomCategory("");
    setPostUrl("");
    setPostContent("");
    setPostImage("");
    setErrors({});
  };

  const handleStartEdit = (item: NewsItem & { url?: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNews(item);
    setPostTitle(item.title);
    const standardCats = ["Tin doanh nghiệp", "Báo chí & Truyền thông", "Hoạt động CLB", "Giao thương B2B"];
    if (standardCats.includes(item.category)) {
      setPostCategory(item.category);
      setCustomCategory("");
    } else {
      setPostCategory("Khác");
      setCustomCategory(item.category || "");
    }
    setPostUrl(item.url || "");
    setPostContent(item.excerpt || "");
    setPostImage(item.image || "");
    setErrors({});
    setPostModalOpen(true);
  };

  const handleDeleteNews = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

    // Call backend API if applicable
    fetchNestApi(`/connect-app/admin/news/${id}`, { method: "DELETE" }).catch(() => {});

    // Update local news
    const updatedLocal = localNews.filter((n) => n.id !== id);
    setLocalNews(updatedLocal);
    try {
      localStorage.setItem("vba_member_shared_news", JSON.stringify(updatedLocal));
    } catch {}

    // Add to deleted IDs
    const updatedDeleted = Array.from(new Set([...deletedNewsIds, id]));
    setDeletedNewsIds(updatedDeleted);
    try {
      localStorage.setItem("vba_member_deleted_news", JSON.stringify(updatedDeleted));
    } catch {}

    if (selectedNews?.id === id) {
      setSelectedNews(null);
    }

    toast.success("Đã xóa bài viết thành công!");
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!postTitle.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề bài viết";
    }
    if (postCategory === "Khác" && !customCategory.trim()) {
      newErrors.category = "Vui lòng nhập tên phân loại mới";
    }
    if (!postContent.trim() && !postUrl.trim()) {
      newErrors.content = "Vui lòng nhập nội dung tóm tắt hoặc đính kèm liên kết";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    setErrors({});
    setPosting(true);

    const finalCategory = postCategory === "Khác" ? customCategory.trim() : postCategory;
    const authorName =
      member?.name ||
      (user as any)?.name ||
      (user as any)?.user_metadata?.full_name ||
      "Hội viên CLB CEO 1983";

    if (editingNews) {
      // UPDATE ARTICLE
      const updatedArticle = {
        ...editingNews,
        title: postTitle.trim(),
        category: finalCategory,
        excerpt:
          postContent.trim() ||
          (postUrl.trim() ? `Bài viết chia sẻ: ${postUrl.trim()}` : "Chia sẻ từ hội viên"),
        image:
          postImage ||
          editingNews.image ||
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
        url: postUrl.trim() || undefined,
      };

      fetchNestApi(`/connect-app/admin/news/${editingNews.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: updatedArticle.title,
          category: updatedArticle.category,
          excerpt: updatedArticle.excerpt,
          cover_image: updatedArticle.image,
          url: updatedArticle.url,
        }),
      }).catch(() => {});

      let updated = localNews.map((n) => (n.id === editingNews.id ? updatedArticle : n));
      if (!localNews.some((n) => n.id === editingNews.id)) {
        updated = [updatedArticle, ...localNews];
      }
      setLocalNews(updated);
      try {
        localStorage.setItem("vba_member_shared_news", JSON.stringify(updated));
      } catch {}

      if (selectedNews?.id === editingNews.id) {
        setSelectedNews(updatedArticle);
      }

      toast.success("Đã cập nhật bài viết thành công!");
    } else {
      // CREATE ARTICLE
      const newId = `shared-news-${Date.now()}`;
      const newArticle: NewsItem & { url?: string } = {
        id: newId,
        title: postTitle.trim(),
        category: finalCategory,
        excerpt:
          postContent.trim() ||
          (postUrl.trim() ? `Bài viết chia sẻ: ${postUrl.trim()}` : "Chia sẻ từ hội viên"),
        author: authorName,
        time: new Date().toISOString(),
        views: 1,
        image:
          postImage ||
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
        url: postUrl.trim() || undefined,
      };

      fetchNestApi("/connect-app/admin/news", {
        method: "POST",
        body: JSON.stringify({
          title: newArticle.title,
          category: newArticle.category,
          excerpt: newArticle.excerpt,
          content: newArticle.excerpt,
          author: newArticle.author,
          cover_image: newArticle.image,
          url: newArticle.url,
        }),
      }).catch(() => {});

      const updated = [newArticle, ...localNews];
      setLocalNews(updated);
      try {
        localStorage.setItem("vba_member_shared_news", JSON.stringify(updated));
      } catch {}

      toast.success("Đã đăng và chia sẻ bài viết thành công!");
    }

    setPosting(false);
    setPostModalOpen(false);
    resetForm();
  };

  return (
    <div className="vba-animate min-h-screen pb-16 bg-[#F4F6F9] dark:bg-[#0B111E]">
      <MemberHeader
        title="Tin tức CLB CEO 1983"
        back
      />

      {/* ── SEARCH & QUICK SHARE BAR ── */}
      <div className="px-4 pt-3 space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tin tức, sự kiện, bài viết doanh nghiệp..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003B95] dark:focus:border-blue-500 shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Share Callout Banner */}
        <div
          onClick={() => setPostModalOpen(true)}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50/70 via-blue-50/30 to-white dark:from-[#001D4A]/50 dark:to-[#002B70]/30 text-slate-900 dark:text-white shadow-xs hover:border-amber-400/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8.5 w-8.5 rounded-xl bg-amber-400/20 text-[#003B95] dark:text-amber-400 grid place-items-center shrink-0 border border-amber-400/40">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Chia sẻ tin tức hoặc bài viết doanh nghiệp
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Đăng bài báo, liên kết hoặc thông tin hoạt động B2B
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setPostModalOpen(true);
            }}
            className="rounded-xl bg-white hover:bg-slate-50 text-[#003B95] border border-[#003B95] text-[11px] font-bold px-3 py-1.5 shrink-0 shadow-xs transition active:scale-95 cursor-pointer"
          >
            Đăng ngay
          </button>
        </div>
      </div>

      {/* ── 4 CATEGORY TABS: TẤT CẢ, MỚI NHẤT, ĐÃ XEM, CHƯA XEM ── */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200/90 dark:border-white/10 shadow-xs">
          {/* Tab 1: Tất cả */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#003B95] border border-[#003B95] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === "all"
                  ? "bg-blue-50 text-[#003B95] border border-blue-200"
                  : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              {allNews.length}
            </span>
          </button>

          {/* Tab 2: Mới nhất */}
          <button
            type="button"
            onClick={() => setActiveTab("latest")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "latest"
                ? "bg-white text-[#003B95] border border-[#003B95] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="flex items-center gap-0.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Mới nhất</span>
            </span>
          </button>

          {/* Tab 3: Đã xem */}
          <button
            type="button"
            onClick={() => setActiveTab("read")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "read"
                ? "bg-white text-[#003B95] border border-[#003B95] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Đã xem</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === "read"
                  ? "bg-blue-50 text-[#003B95] border border-blue-200"
                  : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              {readCount}
            </span>
          </button>

          {/* Tab 4: Chưa xem */}
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer relative ${
              activeTab === "unread"
                ? "bg-white text-[#003B95] border border-[#003B95] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1">
              {unreadCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />}
              <span>Chưa xem</span>
            </span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "unread"
                  ? "bg-blue-50 text-[#003B95] border border-blue-200"
                  : unreadCount > 0
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              {unreadCount}
            </span>
          </button>
        </div>

        {/* Unread helper & Mark all as read action */}
        {unreadCount > 0 && (activeTab === "unread" || activeTab === "all") && (
          <div className="mt-2.5 flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Bạn có <strong className="text-amber-600 dark:text-amber-400 font-bold">{unreadCount}</strong> bài viết chưa xem
            </span>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer active:scale-95 transition"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Đánh dấu tất cả đã xem</span>
            </button>
          </div>
        )}
      </div>

      {/* ── DANH SÁCH BÀI VIẾT (CÓ ẢNH VÀ 1, 2 DÒNG THÔNG TIN) ── */}
      <div className="mt-3 space-y-2.5 px-4">
        {newsLoading && (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-[#003B95] dark:text-blue-400" />
            <p className="text-[13px]">{t("m.news.loading")}</p>
          </div>
        )}

        {!newsLoading && displayedNews.length === 0 && (
          <div className="py-16 text-center space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 shadow-xs">
            {activeTab === "unread" ? (
              <>
                <CheckCheck className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Tuyệt vời! Bạn đã xem hết tất cả tin tức
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Không còn bài viết nào chưa đọc. Hãy chuyển qua tab "Tất cả" hoặc "Mới nhất" để xem lại các hoạt động CLB.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#003B95] dark:text-blue-400 bg-white border border-[#003B95] px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Xem tất cả tin tức
                </button>
              </>
            ) : activeTab === "read" ? (
              <>
                <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Chưa có bài viết nào đã xem
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Hãy chạm vào bất kỳ bài viết nào để đọc thông tin và nội dung chi tiết.
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? "Không tìm thấy bài viết phù hợp" : t("m.news.empty")}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-[#003B95] dark:text-blue-400 font-bold hover:underline"
                  >
                    Xóa từ khóa tìm kiếm
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* News Cards: "kiểu có ảnh cùng 1,2 dòng thông tin" */}
        {displayedNews.map((n) => {
          const isRead = readNewsIds.includes(n.id);
          const imgSrc =
            resolveMediaUrl(n.image) ||
            n.image ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80";

          return (
            <article
              key={n.id}
              onClick={() => handleOpenArticle(n)}
              className="group overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131a27] transition-all duration-200 hover:border-[#003B95]/40 hover:shadow-md active:scale-[0.99] cursor-pointer shadow-xs flex items-center gap-3 p-2.5 sm:p-3"
            >
              {/* Photo Thumbnail */}
              <div className="relative w-24 sm:w-28 h-20 sm:h-22 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-100 dark:border-white/5">
                <img
                  src={imgSrc}
                  alt={n.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                {n.category && (
                  <div className="absolute bottom-1 left-1">
                    <span className="inline-block rounded bg-white/95 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-bold text-[#003B95] uppercase tracking-wider border border-[#003B95]">
                      {n.category}
                    </span>
                  </div>
                )}
                {n.url && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center gap-0.5 rounded bg-black/75 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-bold text-blue-300">
                      <LinkIcon className="h-2 w-2" />
                    </span>
                  </div>
                )}
              </div>

              {/* 1, 2 Dòng thông tin bài viết */}
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  {/* Dòng 1: Tiêu đề (line-clamp-2) */}
                  <h2 className="text-[13px] sm:text-[14px] font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors">
                    {n.title}
                  </h2>

                  {/* Dòng 2: Tóm tắt 1 dòng (nếu có) */}
                  {n.excerpt && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {n.excerpt}
                    </p>
                  )}
                </div>

                {/* Dòng thông tin meta & Action sửa / xóa */}
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 pt-1.5">
                  <div className="flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[170px]">
                    <span className="truncate">{fmt.rel(n.time) || n.time || "Mới đây"}</span>
                    <span>•</span>
                    <span className="truncate font-medium text-slate-600 dark:text-slate-400">
                      {n.author || "Ban Truyền Thông"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <Eye className="h-3 w-3 text-[#003B95] dark:text-blue-400" />
                      <span>{n.views || 1}</span>
                    </span>

                    {/* Nút Sửa & Xóa bài viết */}
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(n, e)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                        title="Chỉnh sửa bài viết"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNews(n.id, e)}
                        className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {isRead ? (
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-slate-400 dark:text-slate-500">
                        <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[2.5]" />
                        <span>Đã xem</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-700 bg-amber-100/90 dark:bg-amber-950/80 dark:text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-300/80 dark:border-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Chưa xem</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── MODAL ĐĂNG / SỬA BÀI VIẾT ── */}
      {postModalOpen && (
        <Dialog
          open={postModalOpen}
          onOpenChange={(open) => {
            setPostModalOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto p-5 rounded-3xl !bg-white dark:!bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#003B95] dark:bg-blue-900/40 dark:text-blue-300 grid place-items-center">
                  {editingNews ? <Pencil className="h-4.5 w-4.5" /> : <Share2 className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingNews ? "Chỉnh Sửa Bài Viết" : "Đăng & Chia Sẻ Bài Viết"}
                  </DialogTitle>
                  <p className="text-[11px] text-slate-400">
                    {editingNews ? "Cập nhật nội dung bài viết tin tức CLB" : "Chia sẻ bài báo, tin tức công ty hoặc đường dẫn bài viết"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitPost} noValidate className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => {
                    setPostTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="VD: Doanh nghiệp thành viên ký kết hợp tác thương mại 2026..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none transition ${
                    errors.title ? "border-rose-500 ring-2 ring-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-[#003B95]"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Danh mục
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => {
                      setPostCategory(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] cursor-pointer"
                  >
                    <option value="Tin doanh nghiệp">Tin doanh nghiệp</option>
                    <option value="Báo chí & Truyền thông">Báo chí &amp; Truyền thông</option>
                    <option value="Hoạt động CLB">Hoạt động CLB</option>
                    <option value="Giao thương B2B">Giao thương B2B</option>
                    <option value="Khác">Khác (tự nhập)</option>
                  </select>
                </div>

                {/* Khi chọn Khác thì hiển thị ô nhập phân loại */}
                {postCategory === "Khác" && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Tên phân loại tùy chỉnh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                      }}
                      placeholder="VD: Hội thảo quốc tế..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none transition ${
                        errors.category ? "border-rose-500 ring-2 ring-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-[#003B95]"
                      }`}
                    />
                    {errors.category && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                        {errors.category}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Ảnh bìa bài viết với xem trước và nút xóa */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ảnh bìa bài viết
                </label>
                {postImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={resolveMediaUrl(postImage) || postImage}
                      alt="Ảnh bài viết"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPostImage("")}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-lg cursor-pointer transition active:scale-90"
                      title="Xóa ảnh này"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 hover:border-[#003B95] transition">
                    <ImagePlus className="h-6 w-6 text-[#003B95] dark:text-blue-400" />
                    <span className="font-semibold">{uploadingImage ? "Đang tải ảnh lên MinIO..." : "Nhấn để chọn ảnh từ thiết bị (JPG, PNG, WebP)"}</span>
                    <span className="text-[10px] text-slate-400">Hình ảnh rõ nét, kích thước khuyến nghị 800x450px</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImage}
                    />
                  </label>
                )}
              </div>

              {/* Trường link chia sẻ bài viết */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Đường dẫn liên kết (Link bài viết / bài báo / video)
                </label>
                <div className="relative">
                  <LinkIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => {
                      setPostUrl(e.target.value);
                      if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
                    }}
                    placeholder="https://vnexpress.net/... hoặc https://facebook.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Hội viên có thể dán link bài viết từ báo chí, website công ty hoặc mạng xã hội.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung tóm tắt / Lời bình
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => {
                    setPostContent(e.target.value);
                    if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
                  }}
                  placeholder="Nhập nội dung tóm tắt hoặc điểm nổi bật của bài viết muốn chia sẻ đến cộng đồng CEO..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none resize-none transition ${
                    errors.content ? "border-rose-500 ring-2 ring-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-[#003B95]"
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPostModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={posting || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#003B95] border border-[#003B95] font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {posting ? "Đang xử lý..." : editingNews ? "Lưu thay đổi" : "Đăng bài viết ngay"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── ARTICLE DETAIL MODAL ── */}
      {selectedNews && (
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-0 rounded-3xl !bg-white dark:!bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Modal Image Header */}
            {selectedNews.image && (
              <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-t-3xl bg-slate-900">
                <img
                  src={resolveMediaUrl(selectedNews.image) || selectedNews.image}
                  alt={selectedNews.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-black/20 to-transparent" />
                {selectedNews.category && (
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-block rounded-full bg-white text-[#003B95] border border-[#003B95] font-bold text-[10px] px-3 py-1 uppercase tracking-wider shadow-md">
                      {selectedNews.category}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-5 sm:p-6">
              <DialogTitle className="text-lg sm:text-xl font-extrabold leading-snug text-slate-900 dark:text-white text-left mb-2.5">
                {selectedNews.title}
              </DialogTitle>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                {selectedNews.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedNews.author}</span>
                  </div>
                )}
                {selectedNews.time && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                    <span>{fmt.rel(selectedNews.time) || selectedNews.time}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedNews.views || 1} lượt xem</span>
                </div>
              </div>

              <div className="space-y-3.5 text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="font-medium text-slate-900 dark:text-white bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 leading-relaxed">
                  {selectedNews.excerpt}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Hiệp hội doanh nhân CEO 1983 không ngừng đẩy mạnh các hoạt động xúc tiến kết nối
                  giao thương nội khối, xây dựng chuỗi cung ứng bền vững và lan tỏa giá trị kinh tế
                  thiết thực đến từng hội viên trong kỷ nguyên chuyển đổi số toàn diện.
                </p>

                {selectedNews.url && (
                  <a
                    href={selectedNews.url.startsWith("http") ? selectedNews.url : `https://${selectedNews.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-between p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#003B95] dark:bg-blue-900/40 dark:text-blue-400 grid place-items-center shrink-0">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          Mở liên kết bài viết gốc
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          {selectedNews.url}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#003B95] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedNews;
                      setSelectedNews(null);
                      handleStartEdit(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-[#003B95] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Sửa bài</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNews(selectedNews.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa bài</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#003B95] border border-[#003B95] font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
