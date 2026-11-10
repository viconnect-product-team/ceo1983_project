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
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchNestApi, resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { executeShare } from "@/lib/share-helper";
import { useAuth } from "@/context/AuthContext";
import { CreatePostModal, COMMITTEES } from "./CreatePostModal";
import { EditPostModal } from "./EditPostModal";
import { CommentTreeSection } from "./CommentTreeSection";
import { QuickRegisterMeetingModal } from "./QuickRegisterMeetingModal";
import { QrCanvas } from "../member/QrCanvas";
import { CategoryTreeModal } from "./CategoryTreeModal";
import { CommentBottomSheetModal } from "./CommentBottomSheetModal";
import { FolderTree } from "lucide-react";

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
  category: "NEWS" | "OPPORTUNITY" | "EVENT_MEETING" | "MARKETPLACE" | "TRAINING" | "OTHER";
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
  { id: "OTHER", label: "Khác" },
];

export function FeedView({
  searchQuery = "",
  initialShare,
}: {
  searchQuery?: string;
  initialShare?: { title?: string; text?: string; url?: string };
}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(() => {
    return Boolean(initialShare?.url || initialShare?.title || initialShare?.text);
  });
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi bảng tin?")) return;
    try {
      await fetchNestApi(`/feed/${postId}`, { method: "DELETE" }).catch(() => {});
    } catch {}
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      const raw = localStorage.getItem("vba_network_feed_posts");
      if (raw) {
        const list = JSON.parse(raw);
        localStorage.setItem(
          "vba_network_feed_posts",
          JSON.stringify(list.filter((p: any) => p.id !== postId))
        );
      }
    } catch {}
    toast.success("Đã xóa bài viết thành công!");
  };

  const handlePostSaved = (updatedPost: any) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
  };

  useEffect(() => {
    if (initialShare?.url || initialShare?.title || initialShare?.text) {
      setCreateModalOpen(true);
    }
  }, [initialShare]);

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

  // Quick Register Modal state for meetings / forums in Feed
  const [registeringMeeting, setRegisteringMeeting] = useState<{
    id: string;
    title: string;
    time?: string;
    location?: string;
    isOnline?: boolean;
    department?: string;
    posterName?: string;
    qrCodeUrl?: string;
  } | null>(null);

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

      // Auto-load comments for top posts if not already loaded (tránh spam API khi tìm kiếm)
      feedItems.slice(0, 10).forEach((p) => {
        if (!postCommentsMap[p.id]) {
          fetchCommentsForPost(p.id);
        }
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

      await executeShare(
        {
          type: "post",
          id: post.id,
          title: `[Mạng Lưới CEO 1983] ${post.title || `Bài viết từ Doanh nhân ${post.authorName || "Hội viên"}`}`,
          desc: post.content?.slice(0, 200),
          image: post.images?.[0] || undefined,
          targetPath: `/association/messages?post=${post.id}`,
        },
        () => toast.success("Đã sao chép liên kết bài viết!")
      );
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B] text-white shadow-xs shrink-0 whitespace-nowrap">
            Cơ hội chia sẻ
          </span>
        );
      case "EVENT_MEETING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F3864] text-white shadow-xs shrink-0 whitespace-nowrap">
            Sự kiện & Họp ban
          </span>
        );
      case "TRAINING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs shrink-0 whitespace-nowrap">
            Đào tạo & Huấn luyện
          </span>
        );
      case "MARKETPLACE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs shrink-0 whitespace-nowrap">
            Sàn B2B
          </span>
        );
      case "OTHER":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs shrink-0 whitespace-nowrap">
            Khác
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F3864] text-white shadow-xs shrink-0 whitespace-nowrap">
            Tin tức CLB
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ── BAR ĐĂNG BÀI VIẾT MỚI (THEO CHUẨN GIAO DIỆN USER) ── */}
      <div className="w-full px-4 pt-3 flex flex-col justify-start items-start gap-2.5 bg-white dark:bg-slate-900">
        <div 
          onClick={() => setCreateModalOpen(true)}
          className="w-full inline-flex justify-between items-center py-1 cursor-pointer"
        >
          <div className="flex justify-start items-center gap-2">
            <div className="h-9 px-2.5 py-1.5 bg-[#DC2626] rounded-[99px] flex justify-start items-center gap-2.5 shadow-xs">
              <img src="/icons/feed/TA.svg" alt="TA" className="h-4 w-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div className="text-slate-800 dark:text-slate-200 text-sm font-normal font-['Inter'] leading-5">
              Đăng bài viết mới...
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCreateModalOpen(true);
            }}
            className="p-1.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Tạo bài viết mới"
          >
            <img src="/icons/feed/add-01.svg" alt="Add" className="size-5" />
          </button>
        </div>
      </div>

      {/* ── TAB DANH MỤC ROUNDED-[99PX] + NÚT CÂY DANH MỤC CHUYÊN SÂU ── */}
      <div className="w-full px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.id);
                  if (tab.id !== "NEWS") setSelectedDepartment("ALL");
                }}
                className={`px-3 py-1.5 rounded-[99px] outline outline-1 outline-offset-[-1px] text-sm transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#DC2626] text-white font-semibold outline-[#DC2626] shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-normal outline-slate-200 dark:outline-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút mở Cây danh mục (Category Tree) */}
        <button
          type="button"
          onClick={() => setIsTreeModalOpen(true)}
          className="p-1.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#003B95] dark:text-amber-400 transition cursor-pointer shrink-0"
          title="Xem cây danh mục"
        >
          <FolderTree className="size-5" />
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-10 bg-blue-900 rounded-[20px] flex justify-center items-center overflow-hidden shrink-0">
                      {post.authorAvatar ? (
                        <img
                          src={resolveMediaUrl(post.authorAvatar) || post.authorAvatar}
                          alt={post.authorName || "Author"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-amber-300 font-bold text-xs">{(post.authorName || "CEO")[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-start items-start overflow-hidden">
                      <h4 className="text-slate-900 dark:text-white text-sm font-semibold font-['Inter'] leading-5 truncate w-full">
                        {post.authorName || "Hội viên CLB CEO 1983"}
                      </h4>
                      <div className="pt-0.5 flex items-center gap-1.5 overflow-hidden text-xs text-slate-400 font-normal font-['Inter'] leading-4">
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        {post.department && (
                          <>
                            <div className="size-[3px] bg-slate-300 dark:bg-slate-600 rounded-[99px]" />
                            <span className="truncate">{post.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="px-2 py-[3px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-[99px] text-xs font-medium font-['Inter'] leading-4">
                      {CATEGORY_TABS.find(t => t.id === post.category)?.label || "Tin tức CLB"}
                    </div>
                    {(() => {
                      const isMyPost = Boolean(
                        user &&
                        (
                          post.authorId === user.id ||
                          post.authorId === (user as any).member_id ||
                          post.authorId === "mem-me" ||
                          post.authorName === user.name ||
                          post.authorName === (user as any).fullName ||
                          post.authorName === (user as any).name
                        )
                      );
                      const canModerate = Boolean(
                        user &&
                        (user.isAdmin || user.isPresident || user.isExecutive || user.role === "admin" || user.role === "quan_tri")
                      );
                      const canEditOrDelete = Boolean(
                        isMyPost || canModerate || post.authorId === "mem-me" || post.sharedArticle || post.externalLink
                      );

                      if (!canEditOrDelete) return null;

                      return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label="Tùy chọn bài viết"
                              className="size-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <DropdownMenuItem
                              onClick={() => setEditingPost(post)}
                              className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-2"
                            >
                              <Pencil className="size-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Chỉnh sửa bài đăng</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.id)}
                              className="cursor-pointer text-xs font-semibold text-destructive focus:text-destructive flex items-center gap-2 py-2"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Xóa bài đăng</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    })()}
                  </div>
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
                {post.sharedArticle || post.externalLink ? (
                  (() => {
                    let art: any = {};
                    if (post.sharedArticle) {
                      if (typeof post.sharedArticle === "string") {
                        try {
                          art = JSON.parse(post.sharedArticle);
                        } catch {
                          art = {};
                        }
                      } else {
                        art = post.sharedArticle;
                      }
                    }
                    const targetUrl = art.url || post.externalLink || "#";
                    const thumb = art.thumbnailUrl || (art as any).thumbnail || (art as any).image || (art as any).image_url || (post.images && post.images.length > 0 ? post.images[0] : null);
                    let domain = art.domain || "";
                    if (!domain && targetUrl && targetUrl.startsWith("http")) {
                      try {
                        domain = new URL(targetUrl).hostname.replace(/^www\./, "").toUpperCase();
                      } catch {}
                    }
                    const artTitle = art.title || post.title || "Xem liên kết bài viết";
                    const artSnippet = art.snippet || (art as any).excerpt || "Bấm vào để đọc toàn văn bài viết chi tiết từ ứng dụng nguồn.";

                    return (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500/60 transition group shadow-xs cursor-pointer"
                      >
                        {thumb && (
                          <div className="w-full h-44 sm:h-52 overflow-hidden bg-slate-900 relative">
                            <img
                              src={resolveMediaUrl(thumb) || thumb}
                              alt={artTitle}
                              className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
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
                            <span>{domain || "LIÊN KẾT NGOÀI"}</span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
                            {artTitle}
                          </h4>
                          {artSnippet && (
                            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {artSnippet}
                            </p>
                          )}
                        </div>
                      </a>
                    );
                  })()
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
                      {/* Box thành viên tham dự theo chuẩn mockup user */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex flex-col justify-start items-start gap-2 border border-slate-100 dark:border-slate-800">
                        <div className="w-full inline-flex justify-between items-center">
                          <div className="text-slate-800 dark:text-slate-200 text-xs font-medium font-['Inter'] leading-4">
                            Thành viên tham dự ({checkedInCount} / {attendeesList.length})
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRegisteringMeeting({
                                id: post.id,
                                title: (post.content || "Cuộc họp / Diễn đàn CLB CEO 1983").slice(0, 80),
                                time: post.meetingTime,
                                location: post.meetingLocation,
                                isOnline: post.isOnline,
                                department: post.department,
                                posterName: post.authorName,
                                qrCodeUrl: post.qrCodeUrl,
                              })
                            }
                            className="inline-flex justify-start items-center gap-1 text-[#003B95] dark:text-blue-400 text-xs font-medium font-['Inter'] leading-4 hover:underline cursor-pointer"
                          >
                            <span>Xem tất cả</span>
                            <img src="/icons/feed/arrow-right-02.svg" alt="Arrow" className="size-3.5" />
                          </button>
                        </div>
                        <div className="w-full inline-flex justify-start items-center gap-1.5 flex-wrap">
                          {attendeesList.map((att) => (
                            <div
                              key={att.id}
                              className="size-7 bg-blue-900 rounded-[14px] flex justify-center items-center overflow-hidden ring-1 ring-white dark:ring-slate-800"
                              title={att.name}
                            >
                              {att.avatar ? (
                                <img src={att.avatar} alt={att.name} className="size-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-white uppercase">{att.name[0]}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dòng đăng ký tham gia */}
                      <div className="w-full py-1 flex flex-col justify-start items-start">
                        <div className="w-full inline-flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() =>
                              setRegisteringMeeting({
                                id: post.id,
                                title: (post.content || "Cuộc họp / Diễn đàn CLB CEO 1983").slice(0, 80),
                                time: post.meetingTime,
                                location: post.meetingLocation,
                                isOnline: post.isOnline,
                                department: post.department,
                                posterName: post.authorName,
                                qrCodeUrl: post.qrCodeUrl,
                              })
                            }
                            className="inline-flex justify-start items-center gap-1.5 text-[#003B95] dark:text-blue-400 text-xs font-semibold font-['Inter'] leading-4 hover:underline cursor-pointer"
                          >
                            <span>Đăng ký tham gia</span>
                            <img src="/icons/feed/arrow-right-02.svg" alt="Arrow" className="size-3.5" />
                          </button>
                          <div className="text-slate-400 dark:text-slate-500 text-xs font-normal font-['Inter'] leading-4">
                            {post.meetingTime ? `Hạn: ${post.meetingTime}` : "Hạn: 15/11/2026"}
                          </div>
                        </div>
                      </div>

                      {/* ── BẮT BUỘC HIỂN THỊ MÃ QR TRỰC TIẾP LÊN MẠNG LƯỚI & FORM ĐĂNG KÝ (YÊU CẦU 3) ── */}
                      {(() => {
                        const meetingQrValue =
                          post.qrCodeUrl ||
                          `https://app.ceo1983.vn/register-meeting?id=${post.id}&title=${encodeURIComponent(
                            (post.content || "").slice(0, 50)
                          )}&time=${encodeURIComponent(post.meetingTime || "")}&location=${encodeURIComponent(
                            post.meetingLocation || ""
                          )}`;

                        return (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-blue-900/10 dark:from-amber-950/30 dark:to-blue-950/20 border border-amber-300/60 dark:border-amber-700/60 shadow-xs space-y-3">
                            <div className="flex flex-col sm:flex-row items-center gap-3.5">
                              {/* QR Code Canvas hiển thị TRỰC TIẾP to rõ nét */}
                              <div
                                onClick={() =>
                                  setRegisteringMeeting({
                                    id: post.id,
                                    title: (post.content || "Cuộc họp / Diễn đàn CLB CEO 1983").slice(0, 80),
                                    time: post.meetingTime,
                                    location: post.meetingLocation,
                                    isOnline: post.isOnline,
                                    department: post.department,
                                    posterName: post.authorName,
                                    qrCodeUrl: post.qrCodeUrl,
                                  })
                                }
                                className="group relative p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 shadow-md flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-[#003B95] dark:hover:border-amber-400 transition"
                                title="Chạm để mở form đăng ký tham gia"
                              >
                                <QrCanvas
                                  value={meetingQrValue}
                                  size={108}
                                  logoUrl="/ceo1983-emblem-8.png"
                                  className="rounded-xl shadow-xs"
                                />
                                <span className="mt-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 tracking-wider flex items-center gap-1 group-hover:text-[#003B95]">
                                  <QrCode className="size-2.5" />
                                  CHẠM ĐỂ QUÉT
                                </span>
                              </div>

                              {/* Thông tin cuộc họp & nút đăng ký */}
                              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#003B95] text-white shadow-2xs">
                                    MÃ QR THAM GIA
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-500 text-slate-950">
                                    ĐIỂM DANH TỰ ĐỘNG
                                  </span>
                                  {post.isOnline && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                      ZOOM ONLINE
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {post.content ? post.content.split("\n")[0] : "Cuộc Họp & Gặp Mặt Doanh Nhân"}
                                  </p>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                    {post.meetingLocation || "Trụ sở CLB CEO 1983 (HanoiBA)"}
                                    {post.meetingTime ? ` • ${post.meetingTime}` : ""}
                                  </p>
                                </div>

                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                  Hội viên quét QR bằng camera hoặc bấm nút dưới để hiện form đăng ký tham gia ngay.
                                </p>

                                <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRegisteringMeeting({
                                        id: post.id,
                                        title: (post.content || "Cuộc họp / Diễn đàn CLB CEO 1983").slice(0, 80),
                                        time: post.meetingTime,
                                        location: post.meetingLocation,
                                        isOnline: post.isOnline,
                                        department: post.department,
                                        posterName: post.authorName,
                                        qrCodeUrl: post.qrCodeUrl,
                                      })
                                    }
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#152747] hover:from-[#002B70] hover:to-[#0f1d36] text-white text-xs font-bold shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="size-3.5 text-amber-400" />
                                    <span>Đăng Ký Tham Gia</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLightboxImage(post.qrCodeUrl || post.posterUrl || "/ceo1983-emblem-8.png")
                                    }
                                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                                  >
                                    Phóng to QR
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* Actions Footer: Like on the left; Comment and Share on the right (Chuẩn Mockup User) */}
                <div className="pt-3 inline-flex justify-between items-center border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Left: Like with favourite.svg */}
                  <button
                    type="button"
                    onClick={() => handleLike(post)}
                    className="flex justify-start items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                  >
                    <img
                      src="/icons/feed/favourite.svg"
                      alt="Like"
                      className={`size-5 transition ${post.hasLiked ? "brightness-75 filter hue-rotate-320" : ""}`}
                    />
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                      {post.likesCount || 0}
                    </div>
                  </button>

                  {/* Right: Comments and Share */}
                  <div className="flex justify-start items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCommentPostId(post.id)}
                      className="flex justify-start items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                      title="Mở tất cả bình luận"
                    >
                      <img src="/icons/feed/comment add-02.svg" alt="Comment" className="size-5" />
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                        {totalCommentsCount}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="flex justify-start items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                      title="Chia sẻ bài viết"
                    >
                      <img src="/icons/feed/share-01.svg" alt="Share" className="size-5" />
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                        {post.sharesCount || 0}
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── COMMENTS SECTION: REUSABLE FACEBOOK TREE REPLIES, @MENTION, MỚI NHẤT LÊN ĐẦU ── */}
                {isCommentsOpen && (
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <CommentTreeSection
                      postId={post.id}
                      title="Bình luận bài viết"
                      defaultOpen={true}
                      onCommentCountChange={(cnt) => {
                        setPosts((prev) =>
                          prev.map((p) => (p.id === post.id ? { ...p, commentsCount: cnt } : p))
                        );
                      }}
                    />
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
        initialShare={initialShare}
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

      {/* ── QUICK REGISTER MEETING MODAL (YÊU CẦU 3: HIỆN FORM ĐĂNG KÝ THAM GIA TẠI CHÍNH CUỘC HỌP MẠNG LƯỚI) ── */}
      {registeringMeeting && (
        <QuickRegisterMeetingModal
          isOpen={Boolean(registeringMeeting)}
          meeting={registeringMeeting}
          onClose={() => setRegisteringMeeting(null)}
          onRegisterSuccess={(attendee) => {
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id === registeringMeeting.id) {
                  const currentAttendees = p.attendees || [];
                  const exists = currentAttendees.some(
                    (a) => a.name.toLowerCase() === attendee.name.toLowerCase()
                  );
                  if (!exists) {
                    return {
                      ...p,
                      attendees: [
                        ...currentAttendees,
                        {
                          id: `att-${Date.now()}`,
                          name: attendee.name,
                          avatar: attendee.avatar,
                          checkedIn: true,
                          checkInTime: new Date().toLocaleTimeString("vi-VN"),
                        },
                      ],
                    };
                  }
                }
                return p;
              })
            );
          }}
        />
      )}

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

      {/* ── EDIT POST MODAL ── */}
      <EditPostModal
        isOpen={Boolean(editingPost)}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSuccess={handlePostSaved}
      />

      {/* ── COMMENT BOTTOM SHEET MODAL (THEO CHUẨN DESIGN USER) ── */}
      {activeCommentPostId && (
        <CommentBottomSheetModal
          isOpen={Boolean(activeCommentPostId)}
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
          onCommentCountChange={(cnt) => {
            setPosts((prev) =>
              prev.map((p) => (p.id === activeCommentPostId ? { ...p, commentsCount: cnt } : p))
            );
          }}
        />
      )}

      {/* ── CATEGORY TREE MODAL ── */}
      <CategoryTreeModal
        isOpen={isTreeModalOpen}
        onClose={() => setIsTreeModalOpen(false)}
        selectedCategory={selectedCategory}
        selectedDepartment={selectedDepartment}
        onSelectCategory={(cat, dept) => {
          setSelectedCategory(cat);
          setSelectedDepartment(dept);
        }}
      />
    </div>
  );
}
