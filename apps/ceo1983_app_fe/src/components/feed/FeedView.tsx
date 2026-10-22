import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Newspaper,
  Handshake,
  Calendar,
  ShoppingBag,
  Building2,
  X,
  Send,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { CreatePostModal, COMMITTEES } from "./CreatePostModal";

interface FeedPost {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  authorTitle?: string;
  department?: string;
  category: "NEWS" | "OPPORTUNITY" | "EVENT_MEETING" | "MARKETPLACE";
  title?: string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  createdAt: string;
}

interface FeedComment {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

const CATEGORY_TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "NEWS", label: "Tin tức" },
  { id: "OPPORTUNITY", label: "Cơ hội chia sẻ" },
  { id: "EVENT_MEETING", label: "Sự kiện & Họp ban" },
  { id: "MARKETPLACE", label: "Sàn B2B" },
];

export function FeedView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Comments drawer state
  const [activeCommentPost, setActiveCommentPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Lightbox state for image preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedCategory === "NEWS" && selectedDepartment !== "ALL") {
        params.append("department", selectedDepartment);
      }
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await fetchNestApi<any>(`/feed${queryStr}`);
      if (res && Array.isArray(res.items)) {
        setPosts(res.items);
      } else if (Array.isArray(res)) {
        setPosts(res);
      }
    } catch {
      toast.error("Không thể tải bảng tin lúc này");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedCategory, selectedDepartment]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeed();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLike = async (post: FeedPost) => {
    const isLiked = post.hasLiked;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              hasLiked: !isLiked,
              likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            }
          : p
      )
    );

    try {
      await fetchNestApi(`/feed/${post.id}/like`, { method: "POST" });
    } catch {
      // Revert if error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                hasLiked: isLiked,
                likesCount: post.likesCount,
              }
            : p
        )
      );
      toast.error("Không thể gửi lượt thích");
    }
  };

  const handleOpenComments = async (post: FeedPost) => {
    setActiveCommentPost(post);
    setLoadingComments(true);
    try {
      const res = await fetchNestApi<any>(`/feed/${post.id}/comments`);
      if (res && Array.isArray(res.items)) {
        setComments(res.items);
      } else if (Array.isArray(res)) {
        setComments(res);
      }
    } catch {
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetchNestApi<any>(`/feed/${activeCommentPost.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (res && res.id) {
        setComments((prev) => [...prev, res]);
        setCommentText("");
        // increment comment count on post
        setPosts((prev) =>
          prev.map((p) =>
            p.id === activeCommentPost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p
          )
        );
        toast.success("Đã gửi bình luận!");
      }
    } catch {
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (post: FeedPost) => {
    try {
      await fetchNestApi(`/feed/${post.id}/share`, { method: "POST" });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, sharesCount: p.sharesCount + 1 } : p))
      );

      const shareUrl = `${window.location.origin}/association/messages?tab=feed&postId=${post.id}`;
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Bảng tin CEO 1983",
          text: post.content.substring(0, 100),
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Đã sao chép liên kết bài viết vào bộ nhớ tạm!");
      }
    } catch {
      /* ignore */
    }
  };

  const formatRelativeTime = (timeStr?: string) => {
    if (!timeStr) return "Vừa xong";
    try {
      const d = new Date(timeStr);
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return "Vừa xong";
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return timeStr;
    }
  };

  const renderCategoryBadge = (cat: string) => {
    switch (cat) {
      case "OPPORTUNITY":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
            Cơ hội chia sẻ
          </span>
        );
      case "EVENT_MEETING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 shadow-xs">
            Sự kiện & Họp ban
          </span>
        );
      case "MARKETPLACE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
            Sàn B2B
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003B95] text-white shadow-xs">
            Tin tức CLB
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ── TOP ACTION BAR: SEARCH & CREATE POST BUTTON ── */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="flex-1 relative flex items-center">
          <Search className="size-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tin tức, sự kiện, cơ hội..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Plus className="size-4" />
          <span>Đăng bài</span>
        </button>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                if (tab.id !== "NEWS") setSelectedDepartment("ALL");
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── SUB-FILTER BY COMMITTEE WHEN NEWS IS ACTIVE ── */}
      {selectedCategory === "NEWS" && (
        <div className="px-4 py-2 bg-amber-500/5 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 overflow-x-auto no-scrollbar flex items-center gap-1.5 animate-in fade-in duration-150">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Building2 className="size-3 text-amber-600" />
            Lọc theo Ban:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDepartment("ALL")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
              selectedDepartment === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Tất cả ban
          </button>
          {COMMITTEES.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDepartment(dept)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedDepartment === dept
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      {/* ── POSTS FEED LIST ── */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="size-6 animate-spin text-red-600" />
            <span className="text-xs">Đang tải bảng tin CEO 1983...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
              <Newspaper className="size-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              Chưa có bài đăng nào trong danh mục này
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Hãy là người đầu tiên chia sẻ thông tin, tin tức ban hoặc cơ hội đến các hội viên CEO 1983.
            </p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-red-700 transition"
            >
              + Đăng bài ngay
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3"
            >
              {/* Post Header: Avatar, Name, Dept, Time, Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#003B95] to-[#001D4A] flex items-center justify-center text-amber-300 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
                    {post.authorAvatar ? (
                      <img
                        src={resolveMediaUrl(post.authorAvatar) || post.authorAvatar}
                        alt={post.authorName || "Author"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{(post.authorName || "CEO")[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {post.authorName || "Hội viên CLB CEO 1983"}
                      </h4>
                      {post.department && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                          {post.department}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                </div>

                <div>{renderCategoryBadge(post.category)}</div>
              </div>

              {/* Title & Content */}
              {post.title && (
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {post.title}
                </h3>
              )}
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {post.content}
              </p>

              {/* Multi-image display grid */}
              {Array.isArray(post.images) && post.images.length > 0 && (
                <div
                  className={`grid gap-1.5 rounded-2xl overflow-hidden ${
                    post.images.length === 1
                      ? "grid-cols-1"
                      : post.images.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  }`}
                >
                  {post.images.slice(0, 3).map((imgUrl, i) => {
                    const isLastOfThree = i === 2 && post.images.length > 3;
                    const remaining = post.images.length - 3;
                    return (
                      <div
                        key={i}
                        onClick={() => setLightboxImage(imgUrl)}
                        className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group"
                      >
                        <img
                          src={resolveMediaUrl(imgUrl) || imgUrl}
                          alt="Feed visual"
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isLastOfThree && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-base">
                            +{remaining}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* Like */}
                <button
                  type="button"
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    post.hasLiked
                      ? "text-red-600 bg-red-50 dark:bg-red-950/20 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Heart
                    className={`size-4 ${
                      post.hasLiked ? "fill-red-600 text-red-600" : "text-slate-500"
                    }`}
                  />
                  <span>{post.likesCount || 0}</span>
                </button>

                {/* Comment */}
                <button
                  type="button"
                  onClick={() => handleOpenComments(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <MessageCircle className="size-4 text-slate-500" />
                  <span>{post.commentsCount || 0}</span>
                </button>

                {/* Share */}
                <button
                  type="button"
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Share2 className="size-4 text-slate-500" />
                  <span>{post.sharesCount || 0}</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* ── CREATE POST MODAL ── */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
        }}
      />

      {/* ── COMMENTS DRAWER / MODAL ── */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] h-[75vh]">
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Bình luận ({comments.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingComments ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="size-5 animate-spin text-red-600" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">
                  Chưa có bình luận nào. Hãy gửi lời chào hoặc thảo luận đầu tiên!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="size-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.authorAvatar ? (
                        <img
                          src={resolveMediaUrl(c.authorAvatar) || c.authorAvatar}
                          alt="Avatar"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span>{(c.authorName || "CEO")[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                          {c.authorName || "Hội viên"}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {formatRelativeTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleSendComment}
              className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="p-2 rounded-xl bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition"
              >
                {submittingComment ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX IMAGE PREVIEW ── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={resolveMediaUrl(lightboxImage) || lightboxImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}
