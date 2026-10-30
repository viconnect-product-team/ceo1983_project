import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  Smile,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { CreatePostModal, COMMITTEES } from "./CreatePostModal";

export const COMMENT_EMOTIONS = [
  { id: "like", emoji: "👍", label: "Thích" },
  { id: "love", emoji: "❤️", label: "Yêu thích" },
  { id: "handshake", emoji: "🤝", label: "Hợp tác" },
  { id: "clap", emoji: "👏", label: "Hoan hô" },
  { id: "fire", emoji: "🔥", label: "Bùng nổ" },
  { id: "celebrate", emoji: "🎉", label: "Chúc mừng" },
  { id: "hundred", emoji: "💯", label: "Đỉnh cao" },
  { id: "idea", emoji: "💡", label: "Sáng tạo" },
  { id: "wealth", emoji: "💰", label: "Phát tài" },
  { id: "strong", emoji: "💪", label: "Quyết tâm" },
  { id: "target", emoji: "🎯", label: "Mục tiêu" },
  { id: "trophy", emoji: "🏆", label: "Thành công" },
];

export const BUSINESS_GIFS = [
  { id: "g1", title: "Bắt tay hợp tác", url: "https://media.giphy.com/media/xT9DPIlGnuHpr2yObu/giphy.gif" },
  { id: "g2", title: "Chúc mừng thành công", url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" },
  { id: "g3", title: "Vỗ tay tán thưởng", url: "https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/giphy.gif" },
  { id: "g4", title: "Tuyệt vời xuất sắc", url: "https://media.giphy.com/media/diUKszNTUghVe/giphy.gif" },
  { id: "g5", title: "Đồng ý chốt deal", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
  { id: "g6", title: "Quyết tâm bứt phá", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" },
];

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
  sharedArticle?: {
    url: string;
    domain: string;
    title: string;
    snippet?: string;
    thumbnailUrl?: string;
    sourceName?: string;
  };
  status?: "active" | "hidden" | "deleted";
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
  parentId?: string | null;
  level?: 1 | 2 | 3;
  replyToAuthorName?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "gif";
  reaction?: string;
}

interface CommentNode extends FeedComment {
  children: CommentNode[];
}

function organizeComments(rawComments: FeedComment[]): CommentNode[] {
  const nodeMap = new Map<string, CommentNode>();
  const rootNodes: CommentNode[] = [];

  rawComments.forEach((c) => {
    nodeMap.set(c.id, { ...c, children: [] });
  });

  rawComments.forEach((c) => {
    const node = nodeMap.get(c.id)!;
    if (c.parentId && nodeMap.has(c.parentId)) {
      const parentNode = nodeMap.get(c.parentId)!;
      node.level = Math.min(3, ((parentNode.level || 1) + 1)) as 1 | 2 | 3;
      parentNode.children.push(node);
    } else {
      node.level = (c.level || 1) as 1 | 2 | 3;
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

function RenderCommentNode({
  node,
  postId,
  collapsedMap,
  onToggleCollapse,
  onReply,
  formatTime,
  onLightbox,
  onReact,
  activeReactionCommentId,
  setActiveReactionCommentId,
}: {
  node: CommentNode;
  postId: string;
  collapsedMap: Record<string, boolean>;
  onToggleCollapse: (id: string) => void;
  onReply: (postId: string, commentId: string, authorName: string, level: 1 | 2 | 3) => void;
  formatTime: (t?: string) => string;
  onLightbox: (url: string) => void;
  onReact: (postId: string, commentId: string, reaction: string) => void;
  activeReactionCommentId: string | null;
  setActiveReactionCommentId: (id: string | null) => void;
}) {
  const isCollapsed = collapsedMap[node.id];
  const hasChildren = node.children && node.children.length > 0;
  const level = node.level || 1;
  const isReactionPickerOpen = activeReactionCommentId === node.id;
  const matchedEmotion = COMMENT_EMOTIONS.find((e) => e.id === node.reaction);

  const levelIndent =
    level === 1
      ? ""
      : level === 2
      ? "ml-4 sm:ml-6 pl-2.5 border-l-2 border-slate-200 dark:border-slate-700/60"
      : "ml-7 sm:ml-10 pl-2.5 border-l-2 border-slate-200 dark:border-slate-700/60";

  return (
    <div className={`space-y-1 ${levelIndent}`}>
      <div className="flex items-start gap-2 text-xs group">
        {node.authorAvatar ? (
          <img
            src={resolveMediaUrl(node.authorAvatar) || node.authorAvatar}
            alt={node.authorName || "Hội viên"}
            className={`rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs ${
              level === 1 ? "size-8" : "size-7"
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
            }}
          />
        ) : (
          <div
            className={`rounded-full shrink-0 mt-0.5 bg-gradient-to-br from-[#003B95] to-[#B8860B] text-white font-bold flex items-center justify-center text-[10.5px] shadow-2xs ${
              level === 1 ? "size-8" : "size-7"
            }`}
          >
            {((node.authorName || "H").trim()[0] || "H").toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* ── BÓNG CHAT CHUẨN FACEBOOK SPEECH BUBBLE ── */}
          <div className="inline-block max-w-[95%] bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-[18px] px-3.5 py-2 relative shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[12px] text-slate-900 dark:text-white hover:underline cursor-pointer">
                {node.authorName || "Hội viên Doanh nhân"}
              </span>
              {node.replyToAuthorName && (
                <span className="text-[11px] text-[#003B95] dark:text-blue-400 font-semibold">
                  @{node.replyToAuthorName}
                </span>
              )}
            </div>

            {node.content && (
              <p className="text-slate-900 dark:text-slate-100 text-[12px] mt-0.5 whitespace-pre-wrap break-words leading-relaxed select-text">
                {node.content}
              </p>
            )}

            {/* Attached Media (Image / Video / GIF) */}
            {node.mediaUrl && (node.mediaType === "image" || node.mediaType === "gif") && (
              <div className="mt-1.5 rounded-xl overflow-hidden max-w-xs border border-slate-200 dark:border-slate-700 shadow-2xs">
                <img
                  src={resolveMediaUrl(node.mediaUrl) || node.mediaUrl}
                  alt="Đính kèm"
                  onClick={() => onLightbox(node.mediaUrl!)}
                  className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition"
                />
              </div>
            )}

            {node.mediaUrl && node.mediaType === "video" && (
              <div className="mt-1.5 rounded-xl overflow-hidden max-w-xs border border-slate-200 dark:border-slate-700 shadow-2xs">
                <video
                  src={resolveMediaUrl(node.mediaUrl) || node.mediaUrl}
                  controls
                  className="w-full max-h-48 rounded-xl bg-black"
                />
              </div>
            )}

            {/* Floating Reaction Badge at bottom-right of bubble */}
            {matchedEmotion && (
              <div
                onClick={() => onReact(postId, node.id, "")}
                className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-white dark:bg-[#242526] rounded-full px-1.5 py-0.5 shadow-sm border border-slate-200 dark:border-slate-700 text-[10px] cursor-pointer hover:scale-110 transition"
                title="Chạm để gỡ cảm xúc"
              >
                <span className="text-xs">{matchedEmotion.emoji}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-[9.5px]">1</span>
              </div>
            )}
          </div>

          {/* Emotion Picker Popover Row */}
          {isReactionPickerOpen && (
            <div className="mt-1 mb-1 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl inline-flex items-center gap-1 animate-in zoom-in-95 duration-100 z-20">
              {COMMENT_EMOTIONS.slice(0, 6).map((emo) => (
                <button
                  key={emo.id}
                  type="button"
                  onClick={() => {
                    onReact(postId, node.id, emo.id);
                    setActiveReactionCommentId(null);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-base transition-transform hover:scale-130 active:scale-95 cursor-pointer"
                  title={emo.label}
                >
                  {emo.emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveReactionCommentId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          {/* ── ACTION BAR DƯỚI BÓNG CHAT: Thích · Phản hồi · 2 giờ (OUTSIDE BUBBLE) ── */}
          <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] font-bold text-slate-500 select-none">
            <button
              type="button"
              onClick={() => {
                if (node.reaction) {
                  onReact(postId, node.id, "");
                } else {
                  onReact(postId, node.id, "like");
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setActiveReactionCommentId(isReactionPickerOpen ? null : node.id);
              }}
              className={`hover:underline cursor-pointer transition ${
                matchedEmotion
                  ? "text-[#003B95] dark:text-blue-400 font-extrabold flex items-center gap-1"
                  : "hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {matchedEmotion ? (
                <>
                  <span>{matchedEmotion.emoji}</span>
                  <span>{matchedEmotion.label}</span>
                </>
              ) : (
                "Thích"
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveReactionCommentId(isReactionPickerOpen ? null : node.id)}
              className="text-slate-400 hover:text-amber-500 cursor-pointer text-[10px]"
              title="Thả cảm xúc khác"
            >
              <Smile className="size-3" />
            </button>

            <button
              type="button"
              onClick={() =>
                onReply(postId, node.id, node.authorName || "Hội viên", (node.level || 1) as 1 | 2 | 3)
              }
              className="hover:underline cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Phản hồi
            </button>

            <span className="text-slate-400 font-normal text-[10.5px]">
              {formatTime(node.createdAt)}
            </span>

            {hasChildren && (
              <button
                type="button"
                onClick={() => onToggleCollapse(node.id)}
                className="text-[#003B95] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold ml-1"
              >
                <CornerDownRight className="size-2.5" />
                <span>
                  {isCollapsed ? `Xem ${node.children.length} câu trả lời` : "Thu gọn"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render children comments if not collapsed */}
      {!isCollapsed && hasChildren && (
        <div className="space-y-1.5 pt-0.5">
          {node.children.map((child) => (
            <RenderCommentNode
              key={child.id}
              node={child}
              postId={postId}
              collapsedMap={collapsedMap}
              onToggleCollapse={onToggleCollapse}
              onReply={onReply}
              formatTime={formatTime}
              onLightbox={onLightbox}
              onReact={onReact}
              activeReactionCommentId={activeReactionCommentId}
              setActiveReactionCommentId={setActiveReactionCommentId}
            />
          ))}
        </div>
      )}
    </div>
  );
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

  // Per-post comments map
  const [postCommentsMap, setPostCommentsMap] = useState<Record<string, FeedComment[]>>({});
  const [inlineInputText, setInlineInputText] = useState<Record<string, string>>({});
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

  // Toggle comments visibility per post (click MessageCircle icon to open/collapse all comments)
  const [openCommentsMap, setOpenCommentsMap] = useState<Record<string, boolean>>({});

  // Collapsed state for specific comments/threads
  const [collapsedCommentsMap, setCollapsedCommentsMap] = useState<Record<string, boolean>>({});

  // Active reply target: postId, target commentId, target authorName, and comment nesting level
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    commentId: string;
    authorName: string;
    level: 1 | 2 | 3;
  } | null>(null);

  // Lightbox state for image preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Media & Emotion states for inline comments
  const [commentMediaMap, setCommentMediaMap] = useState<
    Record<string, { url: string; type: "image" | "video" | "gif" } | null>
  >({});
  const [commentEmotionMap, setCommentEmotionMap] = useState<Record<string, string | null>>({});
  const [activeMediaPickerFor, setActiveMediaPickerFor] = useState<{
    postId: string;
    type: "emotion" | "gif";
  } | null>(null);
  const [uploadingMediaFor, setUploadingMediaFor] = useState<string | null>(null);
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadPostId, setActiveUploadPostId] = useState<string | null>(null);

  const toggleCommentsVisibility = (postId: string) => {
    setOpenCommentsMap((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleCommentCollapse = (commentId: string) => {
    setCollapsedCommentsMap((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleMediaUpload = async (postId: string, file: File, type: "image" | "video") => {
    try {
      setUploadingMediaFor(postId);
      const url = await uploadFileToNest(file, `feed_comments`);
      setCommentMediaMap((prev) => ({
        ...prev,
        [postId]: { url, type },
      }));
      toast.success(type === "image" ? "Đã đính kèm ảnh vào bình luận!" : "Đã đính kèm video vào bình luận!");
    } catch {
      toast.error("Không thể tải lên tập tin lúc này");
    } finally {
      setUploadingMediaFor(null);
    }
  };

  const handleReactToComment = async (postId: string, commentId: string, reactionId: string) => {
    setPostCommentsMap((prev) => {
      const list = prev[postId] || [];
      return {
        ...prev,
        [postId]: list.map((c) =>
          c.id === commentId
            ? { ...c, reaction: c.reaction === reactionId ? undefined : reactionId }
            : c
        ),
      };
    });
    setActiveReactionCommentId(null);

    try {
      await fetchNestApi(`/feed/comments/${commentId}/reaction`, {
        method: "POST",
        body: JSON.stringify({ reaction: reactionId }),
      });
    } catch {
      /* ignore */
    }
  };

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

      // Merge local shared posts (including external shared posts from members)
      try {
        const local = localStorage.getItem("vba_network_feed_posts");
        if (local) {
          const localPosts = JSON.parse(local);
          const existingIds = new Set(feedItems.map((p) => p.id));
          localPosts.forEach((lp: any) => {
            if (!existingIds.has(lp.id) && lp.status !== "hidden" && lp.status !== "deleted") {
              feedItems.unshift(lp);
            }
          });
        }
      } catch {}

      setPosts(feedItems);

      // Auto-load comments for each post
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

      // STRICT ZERO FAKE MOCK: Real database comments only
      setPostCommentsMap((prev) => ({
        ...prev,
        [postId]: list,
      }));
    } catch {
      setPostCommentsMap((prev) => ({
        ...prev,
        [postId]: [],
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
    const media = commentMediaMap[postId];
    const emotion = commentEmotionMap[postId];

    if (!text && !media && !emotion) return;

    setSubmittingCommentFor(postId);
    try {
      const activeReply = replyingTo?.postId === postId ? replyingTo : null;
      const targetParentId = activeReply ? activeReply.commentId : null;
      const targetLevel = activeReply ? ((Math.min(3, (activeReply.level || 1) + 1)) as 1 | 2 | 3) : 1;
      const targetReplyToAuthor = activeReply ? activeReply.authorName : undefined;

      // Real user avatar & name from session
      const realAuthorName = user?.name || (user as any)?.contact || "Hội viên Doanh nhân";
      const realAuthorAvatar = user?.avatar || (user as any)?.avatarUrl || "";

      const res = await fetchNestApi<any>(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: text,
          parentId: targetParentId,
          level: targetLevel,
          replyToAuthorName: targetReplyToAuthor,
          mediaUrl: media?.url,
          mediaType: media?.type,
          reaction: emotion || undefined,
          authorName: realAuthorName,
          authorAvatar: realAuthorAvatar,
        }),
      });

      const newC: FeedComment = {
        id: res?.comment?.id || res?.id || `c-${Date.now()}`,
        authorId: user?.id || "me",
        authorName: realAuthorName,
        authorAvatar: realAuthorAvatar || "/ceo1983-emblem-8.png",
        content: text,
        createdAt: new Date().toISOString(),
        parentId: targetParentId,
        level: targetLevel,
        replyToAuthorName: targetReplyToAuthor,
        mediaUrl: media?.url,
        mediaType: media?.type,
        reaction: emotion || undefined,
      };

      setPostCommentsMap((prev) => {
        const current = prev[postId] || [];
        return {
          ...prev,
          [postId]: [...current, newC],
        };
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
      );

      setInlineInputText((prev) => ({ ...prev, [postId]: "" }));
      setCommentMediaMap((prev) => ({ ...prev, [postId]: null }));
      setCommentEmotionMap((prev) => ({ ...prev, [postId]: null }));
      setActiveMediaPickerFor(null);
      setReplyingTo(null);
      // Auto-open comments section so the user sees their reply immediately
      setOpenCommentsMap((prev) => ({ ...prev, [postId]: true }));
      toast.success(targetParentId ? `Đã phản hồi cấp ${targetLevel}!` : "Đã đăng bình luận!");
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
            const postComments = postCommentsMap[post.id] || [];
            const commentTrees = organizeComments(postComments);
            const isCommentsOpen = openCommentsMap[post.id] !== false;
            const totalCommentsCount = Math.max(postComments.length, post.commentsCount || 0);

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

                {/* ── BÀI VIẾT CHIA SẺ TỪ ỨNG DỤNG BÊN NGOÀI (CHUẨN GIAO DIỆN FACEBOOK SHARE CARD) ── */}
                {post.sharedArticle ? (
                  <a
                    href={post.sharedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500/60 transition group shadow-xs cursor-pointer"
                  >
                    {post.sharedArticle.thumbnailUrl && (
                      <div className="w-full h-44 sm:h-52 overflow-hidden bg-slate-900 relative">
                        <img
                          src={resolveMediaUrl(post.sharedArticle.thumbnailUrl) || post.sharedArticle.thumbnailUrl}
                          alt={post.sharedArticle.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <ExternalLink className="size-3 text-blue-400" />
                          <span>Xem bài gốc</span>
                        </div>
                      </div>
                    )}
                    <div className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Globe className="size-3 text-blue-600 dark:text-blue-400" />
                        <span>{post.sharedArticle.domain || "LIÊN KẾT NGOÀI"}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
                        {post.sharedArticle.title}
                      </h4>
                      {post.sharedArticle.snippet && (
                        <p className="text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {post.sharedArticle.snippet}
                        </p>
                      )}
                    </div>
                  </a>
                ) : isSharedOpportunity ? (
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
                ) : null}

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
                    {/* Bấm vào icon bình luận để mở/thu gọn xem tất cả bình luận */}
                    <button
                      type="button"
                      onClick={() => toggleCommentsVisibility(post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer text-xs font-semibold ${
                        isCommentsOpen
                          ? "text-[#1F3864] dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/40"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      title="Bấm để xem tất cả bình luận"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>{totalCommentsCount}</span>
                    </button>

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

                {/* ── COMMENTS SECTION: 3-LEVEL NESTED REPLIES & THREAD COLLAPSE ── */}
                {isCommentsOpen && (
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="size-3.5 text-[#1F3864] dark:text-amber-400" />
                        <span>Tất cả bình luận ({totalCommentsCount})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCommentsVisibility(post.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                      >
                        <ChevronUp className="size-3" />
                        Thu gọn bình luận
                      </button>
                    </div>

                    {/* Comment Tree */}
                    <div className="space-y-2">
                      {commentTrees.length > 0 ? (
                        commentTrees.map((rootNode) => (
                          <RenderCommentNode
                            key={rootNode.id}
                            node={rootNode}
                            postId={post.id}
                            collapsedMap={collapsedCommentsMap}
                            onToggleCollapse={toggleCommentCollapse}
                            onReply={(pId, cId, aName, lvl) =>
                              setReplyingTo({
                                postId: pId,
                                commentId: cId,
                                authorName: aName,
                                level: lvl,
                              })
                            }
                            formatTime={formatRelativeTime}
                            onLightbox={(url) => setLightboxImage(url)}
                            onReact={handleReactToComment}
                            activeReactionCommentId={activeReactionCommentId}
                            setActiveReactionCommentId={setActiveReactionCommentId}
                          />
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic py-1 px-1">
                          Chưa có bình luận nào. Hãy là người đầu tiên kết nối thảo luận!
                        </p>
                      )}
                    </div>

                    {/* Active Reply Banner */}
                    {replyingTo?.postId === post.id && (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/50 text-[11px]">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                          <CornerDownRight className="size-3 text-amber-600 dark:text-amber-400" />
                          <span>
                            Đang trả lời <b>@{replyingTo.authorName}</b> (Cấp {Math.min(3, (replyingTo.level || 1) + 1)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-800/40 rounded-full text-slate-500 cursor-pointer"
                          title="Huỷ trả lời"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}

                    {/* Attached Media / Emotion Preview */}
                    {(commentMediaMap[post.id] || commentEmotionMap[post.id]) && (
                      <div className="flex items-center gap-2 p-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/50 text-xs">
                        {commentMediaMap[post.id] && (
                          <div className="flex items-center gap-2">
                            {commentMediaMap[post.id]!.type === "video" ? (
                              <div className="size-10 rounded-lg bg-black flex items-center justify-center text-white">
                                <Video className="size-4" />
                              </div>
                            ) : (
                              <img
                                src={resolveMediaUrl(commentMediaMap[post.id]!.url) || commentMediaMap[post.id]!.url}
                                alt="Đính kèm"
                                className="size-10 rounded-lg object-cover border border-amber-300"
                              />
                            )}
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                              {commentMediaMap[post.id]!.type === "video"
                                ? "Video đính kèm"
                                : commentMediaMap[post.id]!.type === "gif"
                                ? "GIF đính kèm"
                                : "Hình ảnh đính kèm"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCommentMediaMap((prev) => ({ ...prev, [post.id]: null }))}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-full cursor-pointer"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        )}

                        {commentEmotionMap[post.id] && (
                          <div className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-amber-300 text-xs">
                            <span>{COMMENT_EMOTIONS.find((e) => e.id === commentEmotionMap[post.id])?.emoji}</span>
                            <span className="font-bold text-[10.5px] text-amber-700 dark:text-amber-300">
                              {COMMENT_EMOTIONS.find((e) => e.id === commentEmotionMap[post.id])?.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCommentEmotionMap((prev) => ({ ...prev, [post.id]: null }))}
                              className="p-0.5 text-slate-400 hover:text-rose-500 rounded-full cursor-pointer"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline quick comment input Facebook Style */}
                    <div className="space-y-1.5 pt-1.5">
                      <div className="flex items-center gap-2">
                        {user?.avatar ? (
                          <img
                            src={resolveMediaUrl(user.avatar) || user.avatar}
                            alt={user.name || "Tôi"}
                            className="size-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                            }}
                          />
                        ) : (
                          <div className="size-8 rounded-full shrink-0 bg-gradient-to-br from-[#003B95] to-[#B8860B] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                            {((user?.name || "T").trim()[0] || "T").toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 flex items-center gap-1.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-[22px] px-3.5 py-1.5 border border-transparent focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-2xs transition">
                          <input
                            type="text"
                            placeholder={
                              replyingTo?.postId === post.id
                                ? `Trả lời @${replyingTo.authorName}...`
                                : "Viết bình luận công khai..."
                            }
                            value={inlineInputText[post.id] || ""}
                            onChange={(e) =>
                              setInlineInputText({ ...inlineInputText, [post.id]: e.target.value })
                            }
                            onKeyDown={(e) => e.key === "Enter" && handleSendInlineComment(post.id)}
                            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none"
                          />

                          {inlineInputText[post.id] && (
                            <button
                              type="button"
                              onClick={() => setInlineInputText({ ...inlineInputText, [post.id]: "" })}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Xóa trắng"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}

                          {/* Media Toolbar buttons inside capsule */}
                          <div className="flex items-center gap-0.5 shrink-0 text-slate-500">
                            {/* Upload Image */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveUploadPostId(post.id);
                                imageInputRef.current?.click();
                              }}
                              disabled={uploadingMediaFor === post.id}
                              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-[#003B95] dark:hover:text-blue-400 transition cursor-pointer"
                              title="Đính kèm ảnh"
                            >
                              <ImageIcon className="size-4" />
                            </button>

                            {/* GIF Picker */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaPickerFor((cur) =>
                                  cur?.postId === post.id && cur?.type === "gif" ? null : { postId: post.id, type: "gif" }
                                )
                              }
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wider transition cursor-pointer ${
                                activeMediaPickerFor?.postId === post.id && activeMediaPickerFor?.type === "gif"
                                  ? "bg-amber-500 text-white"
                                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-[#003B95]"
                              }`}
                              title="Chọn GIF"
                            >
                              GIF
                            </button>

                            {/* Emotion Picker */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaPickerFor((cur) =>
                                  cur?.postId === post.id && cur?.type === "emotion" ? null : { postId: post.id, type: "emotion" }
                                )
                              }
                              className={`p-1.5 rounded-full transition cursor-pointer ${
                                activeMediaPickerFor?.postId === post.id && activeMediaPickerFor?.type === "emotion"
                                  ? "bg-amber-500 text-white"
                                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-amber-500"
                              }`}
                              title="Thả Cảm Xúc"
                            >
                              <Smile className="size-4" />
                            </button>

                            {/* Send Button */}
                            <button
                              type="button"
                              disabled={
                                submittingCommentFor === post.id ||
                                uploadingMediaFor === post.id ||
                                (!inlineInputText[post.id]?.trim() && !commentMediaMap[post.id] && !commentEmotionMap[post.id])
                              }
                              onClick={() => handleSendInlineComment(post.id)}
                              className={`p-1.5 rounded-full transition cursor-pointer disabled:opacity-30 ${
                                inlineInputText[post.id]?.trim() || commentMediaMap[post.id] || commentEmotionMap[post.id]
                                  ? "bg-[#003B95] text-white hover:bg-[#002B70] shadow-2xs"
                                  : "text-slate-400"
                              }`}
                              title="Gửi bình luận"
                            >
                              {submittingCommentFor === post.id || uploadingMediaFor === post.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Send className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Active Media Picker Popups */}
                      {activeMediaPickerFor?.postId === post.id && (
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl space-y-2 animate-in zoom-in-95 duration-100">
                          {activeMediaPickerFor.type === "emotion" ? (
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <span>Bộ Emotion Doanh Nhân CEO 1983</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveMediaPickerFor(null)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {COMMENT_EMOTIONS.map((emo) => (
                                  <button
                                    key={emo.id}
                                    type="button"
                                    onClick={() => {
                                      setCommentEmotionMap((prev) => ({ ...prev, [post.id]: emo.id }));
                                      setActiveMediaPickerFor(null);
                                    }}
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 border border-transparent hover:border-amber-300 transition cursor-pointer"
                                  >
                                    <span className="text-xl">{emo.emoji}</span>
                                    <span className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 text-center truncate max-w-full">
                                      {emo.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <span>Chọn GIF Doanh nghiệp &amp; Chúc mừng</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveMediaPickerFor(null)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {BUSINESS_GIFS.map((gif) => (
                                  <div
                                    key={gif.id}
                                    onClick={() => {
                                      setCommentMediaMap((prev) => ({
                                        ...prev,
                                        [post.id]: { url: gif.url, type: "gif" },
                                      }));
                                      setActiveMediaPickerFor(null);
                                    }}
                                    className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer transition aspect-4/3 relative group"
                                  >
                                    <img src={gif.url} alt={gif.title} className="w-full h-full object-cover" />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-semibold px-1 py-0.5 truncate text-center opacity-0 group-hover:opacity-100 transition">
                                      {gif.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

      {/* Hidden file inputs for comment media upload */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadPostId) {
            await handleMediaUpload(activeUploadPostId, file, "image");
          }
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadPostId) {
            await handleMediaUpload(activeUploadPostId, file, "video");
          }
          e.target.value = "";
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
