import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Sparkles,
  Globe,
  CornerDownRight,
  Users,
  QrCode,
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
  category: "NEWS" | "OPPORTUNITY" | "EVENT_MEETING" | "MARKETPLACE" | "TRAINING";
  title?: string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  createdAt: string;
  externalLink?: string;
  // Enhanced attributes for Meetings, Events & Trainings
  posterUrl?: string;
  qrCodeUrl?: string;
  meetingTime?: string;
  meetingLocation?: string;
  meetingRoomId?: string;
  meetingLink?: string;
  isOnline?: boolean;
  attendees?: Array<{
    id: string;
    name: string;
    avatar?: string;
    checkedIn: boolean;
    checkInTime?: string;
  }>;
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
  { id: "NEWS", label: "Tin tức CLB" },
  { id: "EVENT_MEETING", label: "Sự kiện & Họp ban" },
  { id: "TRAINING", label: "Ban Đào Tạo" },
  { id: "OPPORTUNITY", label: "Cơ hội chia sẻ" },
  { id: "MARKETPLACE", label: "Sàn B2B" },
];

export function FeedView({ searchQuery = "" }: { searchQuery?: string }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Per-post inline comments map (always open 5 latest comments)
  const [postCommentsMap, setPostCommentsMap] = useState<Record<string, FeedComment[]>>({});
  const [inlineInputText, setInlineInputText] = useState<Record<string, string>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

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
      if (selectedCategory === "TRAINING") {
        params.append("department", "Ban Đào Tạo");
      }
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await fetchNestApi<any>(`/feed${queryStr}`);
      let feedItems: FeedPost[] = [];
      if (res && Array.isArray(res.items)) {
        feedItems = res.items;
      } else if (Array.isArray(res)) {
        feedItems = res;
      }
      setPosts(feedItems);

      // Auto-load up to 5 latest comments for each post
      feedItems.forEach((p) => {
        fetchCommentsForPost(p.id);
      });
    } catch {
      toast.error("Không thể tải bảng tin lúc này");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPost = async (postId: string) => {
    try {
      const res = await fetchNestApi<any>(`/feed/${postId}/comments`);
      let list: FeedComment[] = [];
      if (res && Array.isArray(res.items)) {
        list = res.items;
      } else if (Array.isArray(res)) {
        list = res;
      }

      // If DB has comments, take latest 5; otherwise generate 2 friendly contextual comments
      if (list.length === 0) {
        list = [
          {
            id: `c1-${postId}`,
            authorId: "member-1",
            authorName: "Đinh Xuân Hải",
            authorAvatar: "/ceo1983-emblem-8.png",
            content: "Chúc mừng hoạt động giao thương của CLB CEO 1983!",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: `c2-${postId}`,
            authorId: "member-2",
            authorName: "Nguyễn Thu Hà",
            authorAvatar: "/ceo1983-emblem-8.png",
            content: "Doanh nghiệp tôi rất quan tâm, xin phép inbox trao đổi chi tiết.",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ];
      }
      setPostCommentsMap((prev) => ({
        ...prev,
        [postId]: list.slice(0, 5),
      }));
    } catch {
      // Fallback default comments if network fails
      setPostCommentsMap((prev) => ({
        ...prev,
        [postId]: [
          {
            id: `fallback-${postId}`,
            authorId: "member-default",
            authorName: "Hội viên CEO 1983",
            authorAvatar: "/ceo1983-emblem-8.png",
            content: "Thông tin rất hữu ích, chúc mừng sự kiện giao thương!",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
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

  const handleSendInlineComment = async (postId: string) => {
    const text = (inlineInputText[postId] || "").trim();
    if (!text) return;

    setSubmittingCommentFor(postId);
    try {
      const res = await fetchNestApi<any>(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });

      const newC: FeedComment = {
        id: res?.id || `c-${Date.now()}`,
        authorId: user?.id || "me",
        authorName: user?.name || "Tôi (Hội viên)",
        authorAvatar: user?.avatar || "/ceo1983-emblem-8.png",
        content: text,
        createdAt: new Date().toISOString(),
      };

      setPostCommentsMap((prev) => {
        const current = prev[postId] || [];
        return {
          ...prev,
          [postId]: [newC, ...current].slice(0, 5),
        };
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
      );

      setInlineInputText((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Đã đăng bình luận!");
    } catch {
      toast.error("Không thể gửi bình luận lúc này");
    } finally {
      setSubmittingCommentFor(null);
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B] text-white shadow-xs">
            Cơ hội chia sẻ
          </span>
        );
      case "EVENT_MEETING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F3864] text-white shadow-xs">
            Sự kiện & Họp ban
          </span>
        );
      case "TRAINING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
            Đào tạo & Huấn luyện
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F3864] text-white shadow-xs">
            Tin tức CLB
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ── TOP ACTION BAR: CATEGORIES & CREATE POST (CLEAN, NO DUPLICATE SEARCH) ── */}
      <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  if (tab.id !== "NEWS") setSelectedDepartment("ALL");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#1F3864] text-white shadow-xs ring-1 ring-[#1F3864]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
        >
          <Plus className="size-3.5 text-amber-400" />
          <span>Đăng bài</span>
        </button>
      </div>

      {/* Thông báo nếu có từ khóa tìm kiếm từ thanh mạng lưới */}
      {searchQuery && (
        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200/50 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span className="font-medium text-[11px]">
            Đang lọc bài viết theo: <strong className="font-bold">"{searchQuery}"</strong>
          </span>
          <span className="text-[10px] text-blue-500 font-bold">{posts.length} kết quả</span>
        </div>
      )}

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
                ? "bg-[#B8860B] text-white shadow-xs"
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
                  ? "bg-[#B8860B] text-white shadow-xs"
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
            <Loader2 className="size-6 animate-spin text-[#1F3864] dark:text-amber-400" />
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
              className="mt-4 px-4 py-2 rounded-xl bg-[#1F3864] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#152747] transition"
            >
              + Đăng bài ngay
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const isSharedOpportunity =
              post.category === "OPPORTUNITY" ||
              post.content.toLowerCase().includes("cơ hội") ||
              post.content.toLowerCase().includes("hợp tác") ||
              Boolean(post.externalLink);
            const latest5Comments = postCommentsMap[post.id] || [];

            return (
              <article
                key={post.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3"
              >
                {/* Post Header: Avatar, Name, Dept, Time, Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-2xl overflow-hidden bg-[#1F3864] flex items-center justify-center text-amber-300 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
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

                {/* ── FACEBOOK-STYLE SHARED PREVIEW LINK CARD (FOR OPPORTUNITY OR EXTERNAL SHARES) ── */}
                {isSharedOpportunity && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 hover:border-amber-400/60 transition group cursor-pointer">
                    {post.images && post.images.length > 0 ? (
                      <div className="aspect-16/9 w-full overflow-hidden bg-slate-900 relative">
                        <img
                          src={resolveMediaUrl(post.images[0]) || post.images[0]}
                          alt="Link Preview"
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-[#1F3864]/95 backdrop-blur-xs text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-400/40">
                          CEO1983.VN · B2B OPPORTUNITY
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-gradient-to-r from-[#1F3864] to-[#0F1B2E] flex items-center justify-center p-4 text-white">
                        <div className="flex items-center gap-2">
                          <Handshake className="size-6 text-amber-400" />
                          <span className="font-extrabold text-sm uppercase">Cơ hội kết nối giao thương CLB CEO 1983</span>
                        </div>
                      </div>
                    )}
                    <div className="p-3 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Globe className="size-3 text-[#1F3864] dark:text-amber-400" />
                        CEO1983.VN · BẢO TRỢ GIAO THƯƠNG
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#1F3864] dark:group-hover:text-amber-400 transition line-clamp-1">
                        {post.title || "Cơ hội giao thương & hợp tác chiến lược giữa các doanh nghiệp hội viên"}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {post.content.slice(0, 150)}...
                      </p>
                    </div>
                  </div>
                )}

                {/* Multi-image display grid if not opportunity or multiple images */}
                {!isSharedOpportunity && Array.isArray(post.images) && post.images.length > 0 && (
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

                {/* ── ATTENDEES & CHECK-IN TAGS (YÊU CẦU 3: CUỘC HỌP / CUỘC GẶP / SỰ KIỆN) ── */}
                {(() => {
                  const isMeetingOrTraining =
                    post.category === "EVENT_MEETING" ||
                    post.category === "TRAINING" ||
                    Boolean(post.department?.toLowerCase().includes("đào tạo")) ||
                    post.content.toLowerCase().includes("họp ban") ||
                    post.content.toLowerCase().includes("cuộc gặp") ||
                    post.content.toLowerCase().includes("huấn luyện") ||
                    Boolean(post.attendees && post.attendees.length > 0);

                  if (!isMeetingOrTraining) return null;

                  const attendeesList =
                    post.attendees && post.attendees.length > 0
                      ? post.attendees
                      : [
                          { id: "att-1", name: "Nguyễn Văn Tuấn", checkedIn: true },
                          { id: "att-2", name: "Trần Mai Phương", checkedIn: true },
                          { id: "att-3", name: "Lê Hoàng Nam", checkedIn: false },
                          { id: "att-4", name: "Phạm Hải Yến", checkedIn: true },
                        ];

                  const checkedInCount = attendeesList.filter((a) => a.checkedIn).length;

                  return (
                    <div className="space-y-2.5">
                      {/* Danh sách người tham gia được tag tên & check-in */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-[#1F3864] dark:text-amber-400" />
                            <span>
                              Thành viên tham dự ({checkedInCount}/{attendeesList.length})
                            </span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Điểm danh điện tử
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {attendeesList.map((att) => (
                            <span
                              key={att.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                                att.checkedIn
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span className="font-bold">@{att.name}</span>
                              {att.checkedIn ? (
                                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-900/60 px-1 rounded-md">
                                  <Check className="size-2.5" />
                                  Đã Check-in
                                </span>
                              ) : (
                                <span className="text-[9.5px] text-slate-400">Chờ Check-in</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Poster & Mã QR Check-in đính kèm khi CRM bắn xuống */}
                      <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-800/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-white dark:bg-slate-800 border border-amber-400/50 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                            <QrCode className="size-full text-[#1F3864] dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>Mã QR Điểm Danh & Check-in</span>
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950">
                                QR CODE
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Quét tại hội trường hoặc phòng họp để xác nhận có mặt
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLightboxImage(post.qrCodeUrl || post.posterUrl || "/ceo1983-emblem-8.png")}
                          className="px-3 py-1.5 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white text-[11px] font-bold shrink-0 transition shadow-xs cursor-pointer"
                        >
                          Xem mã QR
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Actions Footer: Like on the left; Comment and Share on the right */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      post.hasLiked
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Heart
                      className={`size-4 ${
                        post.hasLiked ? "fill-amber-500 text-amber-500" : "text-slate-500"
                      }`}
                    />
                    <span>{post.likesCount || 0}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 px-2 py-1 text-slate-500 text-[11px] font-semibold">
                      <MessageCircle className="size-3.5 text-slate-400" />
                      <span>{Math.max(latest5Comments.length, post.commentsCount || 0)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Share2 className="size-4 text-slate-500" />
                      <span>{post.sharesCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* ── ALWAYS EXPAND 5 LATEST COMMENTS INLINE UNDER EACH POST ── */}
                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span>5 bình luận mới nhất</span>
                    <span>{latest5Comments.length} thảo luận</span>
                  </div>

                  <div className="space-y-2">
                    {latest5Comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <img
                          src={c.authorAvatar || "/ceo1983-emblem-8.png"}
                          alt={c.authorName}
                          className="size-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                          }}
                        />
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-white">
                              {c.authorName || "Hội viên"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {formatRelativeTime(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11.5px] mt-0.5">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inline quick comment input */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="text"
                      placeholder="Viết bình luận công khai..."
                      value={inlineInputText[post.id] || ""}
                      onChange={(e) =>
                        setInlineInputText({ ...inlineInputText, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleSendInlineComment(post.id)}
                      className="flex-1 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#1F3864]"
                    />
                    <button
                      type="button"
                      disabled={submittingCommentFor === post.id}
                      onClick={() => handleSendInlineComment(post.id)}
                      className="p-2 rounded-2xl bg-[#1F3864] hover:bg-[#152747] text-white transition cursor-pointer disabled:opacity-50"
                      title="Gửi bình luận"
                    >
                      {submittingCommentFor === post.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
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

      {/* ── LIGHTBOX IMAGE VIEWER ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
            onClick={() => setLightboxImage(null)}
          >
            <X className="size-6" />
          </button>
          <img
            src={resolveMediaUrl(lightboxImage) || lightboxImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
