import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageCircle,
  Heart,
  Send,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Smile,
  AtSign,
  Reply,
  CheckCircle2,
  CornerDownRight,
  Maximize2,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { MEMBERS } from "@/lib/members-data";

export const COMMENT_EMOTIONS = [
  { id: "like", emoji: "👍", label: "Thích" },
  { id: "love", emoji: "❤️", label: "Yêu thích" },
  { id: "clap", emoji: "👏", label: "Tuyệt vời" },
  { id: "celebrate", emoji: "🎉", label: "Chúc mừng" },
  { id: "insightful", emoji: "💡", label: "Sáng tạo" },
];

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  parentId?: string | null;
  level?: number;
  replyToAuthorName?: string | null;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | "gif" | null;
  reaction?: string | null;
  createdAt: string;
}

export interface CommentNode extends FeedComment {
  children: CommentNode[];
}

export interface ConnectedMemberSummary {
  id: string;
  userId?: string | null;
  name: string;
  company?: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
}

/** Sắp xếp bình luận thành dạng cây phân cấp Facebook (Tree replies) */
export function organizeCommentsTree(rawComments: FeedComment[]): CommentNode[] {
  const nodeMap = new Map<string, CommentNode>();
  const rootNodes: CommentNode[] = [];

  rawComments.forEach((c) => {
    nodeMap.set(c.id, { ...c, children: [] });
  });

  rawComments.forEach((c) => {
    const node = nodeMap.get(c.id)!;
    if (c.parentId && nodeMap.has(c.parentId)) {
      nodeMap.get(c.parentId)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // Bình luận gốc mới nhất hiển thị trên cùng (Newest root comments on TOP)
  rootNodes.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // Các câu trả lời con trong từng cây được xếp theo thời gian tăng dần
  nodeMap.forEach((node) => {
    node.children.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  });

  return rootNodes;
}

/** Format thời gian tương đối dễ đọc */
export function formatCommentTime(t?: string): string {
  if (!t) return "Vừa xong";
  const d = new Date(t);
  if (isNaN(d.getTime())) return "Vừa xong";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 45) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

/** Tách văn bản và highlight các thẻ @mention màu xanh thương hiệu #003B95 */
export function renderMentionableText(text: string) {
  if (!text) return null;
  // Regex khớp @TênHộiViên (hỗ trợ tiếng Việt Unicode)
  const parts = text.split(/(@[A-Za-z0-9À-ỹ_ ]{2,30}?)(?=[.,!?:;\s]|$)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("@") && part.length > 2) {
      return (
        <span
          key={idx}
          className="inline-flex items-center text-[#003B95] dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded cursor-pointer hover:underline mx-0.5"
          title={`Hội viên được nhắc tên: ${part}`}
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/** Component đệ quy render từng Node bình luận dạng cây Facebook */
export function CommentTreeNodeItem({
  node,
  postId,
  onReply,
  onReact,
  activeReactionCommentId,
  setActiveReactionCommentId,
  onImagePreview,
  onEdit,
  onDelete,
  currentUserId,
  isAdmin,
}: {
  node: CommentNode;
  postId: string;
  onReply: (commentId: string, authorName: string, level: number) => void;
  onReact: (commentId: string, reactionId: string) => void;
  activeReactionCommentId: string | null;
  setActiveReactionCommentId: (id: string | null) => void;
  onImagePreview: (url: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const longPressTimerRef = useRef<any>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isReactionPickerOpen = activeReactionCommentId === node.id;
  const matchedEmotion = COMMENT_EMOTIONS.find((e) => e.id === node.reaction);
  const level = node.level || 1;

  const isAuthor = Boolean(
    (currentUserId && (node.authorId === currentUserId || (node.author as any)?.id === currentUserId)) ||
    isAdmin
  );

  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowMenu(true);
    }, 550);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div className={`space-y-1.5 ${level > 1 ? "ml-4 sm:ml-7 pl-3 border-l-2 border-blue-200/80 dark:border-blue-900/60 relative before:absolute before:left-[-2px] before:top-4 before:w-2.5 before:h-px before:bg-blue-300 dark:before:bg-blue-700" : ""}`}>
      <div className="flex items-start gap-2 group">
        {/* Avatar tác giả */}
        <img
          src={node.authorAvatar || node.author?.avatar || "/ceo1983-emblem-8.png"}
          alt={node.authorName}
          className="size-7 sm:size-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
          onError={(e) => {
            e.currentTarget.src = "/ceo1983-emblem-8.png";
          }}
        />

        <div className="flex-1 min-w-0">
          {/* Bong bóng bình luận kiểu Facebook + Hỗ trợ giữ lâu (long press) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative inline-block max-w-[94%] bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3 py-2 text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition select-none"
          >
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="font-bold text-slate-900 dark:text-white text-[12px] truncate">
                {node.authorName || "Hội viên CEO 1983"}
              </span>

              {node.replyToAuthorName && (
                <span className="inline-flex items-center gap-0.5 text-[10.5px] text-[#003B95] dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-950/40 px-1.5 py-0.2 rounded-md">
                  <CornerDownRight className="size-2.5" />
                  <span>@{node.replyToAuthorName}</span>
                </span>
              )}
            </div>

            {/* Nội dung text hoặc chế độ chỉnh sửa inline */}
            {isEditing ? (
              <div className="mt-1 space-y-1.5">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-[#003B95] outline-none text-slate-900 dark:text-white"
                  rows={2}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editContent.trim()) {
                        onEdit(node.id, editContent.trim());
                        setIsEditing(false);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#003B95] text-white font-bold hover:bg-[#002B70] transition cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-[12px] break-words whitespace-pre-wrap">
                {renderMentionableText(node.content)}
              </div>
            )}

            {/* Ảnh đính kèm nếu có */}
            {node.mediaUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-[240px]">
                {node.mediaType === "video" ? (
                  <video src={node.mediaUrl} controls className="max-h-48 w-full object-cover rounded-xl" />
                ) : (
                  <div className="relative group/img cursor-pointer" onClick={() => onImagePreview(node.mediaUrl!)}>
                    <img src={node.mediaUrl} alt="Đính kèm" className="max-h-48 w-full object-cover rounded-xl transition hover:opacity-90" />
                    <span className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white text-[10px] opacity-0 group-hover/img:opacity-100 transition">
                      <Maximize2 className="size-3" />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Huy hiệu cảm xúc (Reaction Badge) */}
            {matchedEmotion && (
              <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-0.5 text-[11px]">
                <span>{matchedEmotion.emoji}</span>
              </div>
            )}
          </div>

          {/* Thanh tương tác dưới bình luận (Thích, Phản hồi, ..., Thời gian) */}
          <div className="flex items-center gap-3 pt-1 pl-1 text-[11px] text-slate-500 font-medium">
            {/* Popover chọn Reaction Facebook */}
            <div className="relative">
              <button
                type="button"
                onClick={() => onReact(node.id, matchedEmotion ? "" : "like")}
                onMouseEnter={() => setActiveReactionCommentId(node.id)}
                className={`font-semibold cursor-pointer hover:underline transition ${
                  matchedEmotion ? "text-[#003B95] dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {matchedEmotion ? `${matchedEmotion.emoji} ${matchedEmotion.label}` : "Thích"}
              </button>

              {isReactionPickerOpen && (
                <div
                  onMouseLeave={() => setActiveReactionCommentId(null)}
                  className="absolute bottom-6 left-0 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl inline-flex items-center gap-1 z-30 animate-in zoom-in-95 duration-100"
                >
                  {COMMENT_EMOTIONS.map((emo) => (
                    <button
                      key={emo.id}
                      type="button"
                      onClick={() => {
                        onReact(node.id, emo.id);
                        setActiveReactionCommentId(null);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-base transition-transform hover:scale-130 active:scale-95 cursor-pointer"
                      title={emo.label}
                    >
                      {emo.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nút Phản hồi */}
            <button
              type="button"
              onClick={() => onReply(node.id, node.authorName, level + 1)}
              className="font-semibold text-slate-600 dark:text-slate-400 hover:text-[#003B95] dark:hover:text-blue-400 hover:underline cursor-pointer"
            >
              Phản hồi
            </button>

            {/* Nút 3 chấm ... (MoreHorizontal) thao tác Sửa / Xóa bình luận */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                title="Tùy chọn bình luận"
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer"
              >
                <MoreHorizontal className="size-3.5" />
              </button>

              {showMenu && (
                <div
                  className="absolute left-0 top-5 z-40 w-38 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs animate-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <div className="py-0.5">
                    {/* Với chính tác giả: Chỉnh sửa & Xóa */}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditContent(node.content);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Pencil className="size-3 text-blue-600" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
                            onDelete(node.id);
                          }
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                        <span>Xóa bình luận</span>
                      </button>
                    )}

                    {/* Sao chép nội dung bình luận (Facebook-style: Dành cho cả chính mình và người khác) */}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(node.content);
                          } else {
                            const textarea = document.createElement("textarea");
                            textarea.value = node.content;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand("copy");
                            document.body.removeChild(textarea);
                          }
                          toast.success("Đã sao chép nội dung bình luận");
                        } catch {
                          toast.error("Không thể sao chép");
                        }
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Copy className="size-3 text-slate-500" />
                      <span>Sao chép</span>
                    </button>

                    {/* Phản hồi bình luận */}
                    <button
                      type="button"
                      onClick={() => {
                        onReply(node.id, node.authorName, level + 1);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Reply className="size-3 text-[#003B95]" />
                      <span>Phản hồi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thời gian */}
            <span className="text-[10px] text-slate-400">{formatCommentTime(node.createdAt)}</span>
          </div>

          {/* Toggle thu gọn/mở rộng các câu trả lời con */}
          {hasChildren && (
            <div className="pt-1.5 pl-1">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer"
              >
                {collapsed ? (
                  <>
                    <ChevronDown className="size-3" />
                    <span>Xem {node.children.length} câu trả lời</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="size-3" />
                    <span>Ẩn câu trả lời</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Render đệ quy các comment con nếu không bị collapse */}
          {!collapsed && hasChildren && (
            <div className="pt-2 space-y-2">
              {node.children.map((child) => (
                <CommentTreeNodeItem
                  key={child.id}
                  node={child}
                  postId={postId}
                  onReply={onReply}
                  onReact={onReact}
                  activeReactionCommentId={activeReactionCommentId}
                  setActiveReactionCommentId={setActiveReactionCommentId}
                  onImagePreview={onImagePreview}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface CommentTreeSectionProps {
  postId: string;
  title?: string;
  defaultOpen?: boolean;
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

export function CommentTreeSection({
  postId,
  title = "Bình luận & Thảo luận",
  defaultOpen = true,
  onCommentCountChange,
  className = "",
}: CommentTreeSectionProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortMode, setSortMode] = useState<"newest" | "all">("newest");

  // Input & Reply state
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    authorName: string;
    level: number;
  } | null>(null);

  // Media attachments
  const [attachedMedia, setAttachedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);

  // @Mention Connected Members State (Chỉ lấy hội viên ĐÃ KẾT NỐI 1-on-1, không lấy toàn bộ hệ thống)
  const [connectedMembers, setConnectedMembers] = useState<ConnectedMemberSummary[]>([]);
  const [taggedMembers, setTaggedMembers] = useState<ConnectedMemberSummary[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tải danh sách hội viên ĐÃ KẾT NỐI để phục vụ @mention (Tuyệt đối không fallback toàn bộ danh bạ hay mock data)
  useEffect(() => {
    let isMounted = true;
    async function loadConnectedMembers() {
      try {
        const res = await fetchNestApi<any>("/members/directory?connectedOnly=true");
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.items)) list = res.items;

        if (isMounted) {
          const formatted: ConnectedMemberSummary[] = list.map((m: any) => ({
            id: m.id || m.userId || m.code || "",
            userId: m.userId || m.user_id || m.id || null,
            name: m.contact || m.name || m.personName || "Hội viên CEO",
            company: m.companyName || m.company || "",
            avatarUrl: m.avatarUrl || m.avatar || "/ceo1983-emblem-8.png",
            role: m.role || m.personTitle || "Hội viên",
          }));
          setConnectedMembers(formatted);
        }
      } catch {
        if (isMounted) setConnectedMembers([]);
      }
    }
    loadConnectedMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tải danh sách bình luận của bài viết / thread
  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await fetchNestApi<any>(`/feed/${postId}/comments`);
      let list: FeedComment[] = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.items)) list = res.items;

      setComments(list);
      if (onCommentCountChange) onCommentCountChange(list.length);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Tổ chức cây bình luận Facebook (Tree replies, newest root comments on TOP)
  const commentTrees = useMemo(() => organizeCommentsTree(comments), [comments]);

  // Lọc danh sách gợi ý @mention
  const filteredMentionMembers = useMemo(() => {
    if (mentionQuery === null && !showMentionPicker) return [];
    const q = (mentionQuery || "").toLowerCase().trim();
    if (!q) return connectedMembers.slice(0, 10);
    return connectedMembers
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.company && m.company.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [connectedMembers, mentionQuery, showMentionPicker]);

  // Xử lý khi gõ phím trong input: phát hiện ký tự @ để mở danh sách hội viên kết nối
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const queryAfterAt = textBeforeCursor.substring(lastAtPos + 1);
      // Nếu không có khoảng trắng sau @ hoặc độ dài ngắn -> mở popup gợi ý
      if (!queryAfterAt.includes(" ") || queryAfterAt.length <= 15) {
        setMentionQuery(queryAfterAt);
        setShowMentionPicker(true);
        return;
      }
    }
    setMentionQuery(null);
    setShowMentionPicker(false);
  };

  // Chọn hội viên từ gợi ý @mention và thêm vào danh sách chip đã gắn thẻ
  const handleSelectMention = (member: ConnectedMemberSummary) => {
    const cursorPos = inputRef.current?.selectionStart || inputText.length;
    const textBeforeCursor = inputText.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    let newText = "";
    if (lastAtPos !== -1) {
      newText =
        inputText.substring(0, lastAtPos) +
        `@${member.name} ` +
        inputText.substring(cursorPos);
    } else {
      newText = `${inputText} @${member.name} `;
    }

    setInputText(newText);
    setMentionQuery(null);
    setShowMentionPicker(false);

    // Thêm vào danh sách chip gắn thẻ đa thành viên
    setTaggedMembers((prev) => {
      if (prev.some((m) => (m.userId || m.id) === (member.userId || member.id))) return prev;
      return [...prev, member];
    });

    // Ghi nhận target userId để backend bắn thông báo đẩy
    const targetUserId = member.userId || member.id;
    if (targetUserId && !mentionedUserIds.includes(targetUserId)) {
      setMentionedUserIds((prev) => [...prev, targetUserId]);
    }

    // Đưa con trỏ lại sau tên vừa chèn
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Xóa nhanh một thẻ hội viên khỏi danh sách tag
  const handleRemoveTaggedMember = (memberId: string, memberName: string) => {
    setTaggedMembers((prev) => prev.filter((m) => m.id !== memberId && m.userId !== memberId));
    setMentionedUserIds((prev) => prev.filter((id) => id !== memberId));
    setInputText((prev) => prev.replace(new RegExp(`@${memberName}\\s*`, "g"), "").trim());
  };

  // Cập nhật nội dung bình luận qua API
  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await fetchNestApi(`/feed/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content } : c))
      );
      toast.success("Đã cập nhật bình luận!");
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật bình luận");
    }
  };

  // Xóa bình luận qua API
  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetchNestApi(`/feed/comments/${commentId}`, {
        method: "DELETE",
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      if (onCommentCountChange) onCommentCountChange(Math.max(0, comments.length - 1));
      toast.success("Đã xóa bình luận!");
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa bình luận");
    }
  };

  // Thả cảm xúc cho bình luận
  const handleReactToComment = async (commentId: string, reactionId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, reaction: c.reaction === reactionId ? undefined : reactionId }
          : c
      )
    );
    try {
      await fetchNestApi(`/feed/comments/${commentId}/reaction`, {
        method: "POST",
        body: JSON.stringify({ reaction: reactionId }),
      });
    } catch {
      // ignore
    }
  };

  // Tải ảnh đính kèm vào bình luận
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const url = await uploadFileToNest(file, "feed_comments");
      const isVideo = file.type.startsWith("video/");
      setAttachedMedia({ url, type: isVideo ? "video" : "image" });
      toast.success(isVideo ? "Đã đính kèm video vào bình luận!" : "Đã đính kèm ảnh vào bình luận!");
    } catch {
      toast.error("Không thể tải lên tập tin");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Gửi bình luận / phản hồi
  const handleSendComment = async () => {
    const text = inputText.trim();
    if (!text && !attachedMedia) {
      toast.error("Vui lòng nhập nội dung hoặc đính kèm ảnh!");
      return;
    }

    setSubmitting(true);
    try {
      const realAuthorName = user?.name || (user as any)?.contact || "Hội viên CEO 1983";
      const realAuthorAvatar = user?.avatar || (user as any)?.avatarUrl || "/ceo1983-emblem-8.png";

      const payload = {
        content: text,
        parentId: replyingTo?.commentId || null,
        level: replyingTo ? replyingTo.level : 1,
        replyToAuthorName: replyingTo?.authorName || undefined,
        mediaUrl: attachedMedia?.url || null,
        mediaType: attachedMedia?.type || null,
        authorName: realAuthorName,
        authorAvatar: realAuthorAvatar,
        mentionedUserIds, // Gửi danh sách ID hội viên được tag để BE dispatch push notification!
      };

      const res = await fetchNestApi<any>(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newComment: FeedComment = {
        id: res?.comment?.id || res?.id || `cmt-${Date.now()}`,
        postId,
        authorId: user?.id || "me",
        authorName: realAuthorName,
        authorAvatar: realAuthorAvatar,
        content: text,
        parentId: replyingTo?.commentId || null,
        level: replyingTo ? replyingTo.level : 1,
        replyToAuthorName: replyingTo?.authorName || null,
        mediaUrl: attachedMedia?.url || null,
        mediaType: attachedMedia?.type || null,
        createdAt: new Date().toISOString(),
      };

      // ĐIỀU KIỆN QUAN TRỌNG:
      // - Nếu là bình luận gốc (root comment): PREPEND lên ĐẦU DANH SÁCH (Newest comment on TOP!)
      // - Nếu là phản hồi con: Append vào danh sách để đưa vào cây phân cấp của comment cha
      setComments((prev) => {
        if (!newComment.parentId) {
          return [newComment, ...prev];
        }
        return [...prev, newComment];
      });

      if (onCommentCountChange) onCommentCountChange(comments.length + 1);

      // Reset form
      setInputText("");
      setAttachedMedia(null);
      setReplyingTo(null);
      setMentionedUserIds([]);
      setMentionQuery(null);
      setShowMentionPicker(false);
      setIsOpen(true);

      toast.success(
        replyingTo
          ? `Đã phản hồi @${replyingTo.authorName}!`
          : "Đã đăng bình luận thành công!"
      );
    } catch (err: any) {
      toast.error(err?.message || "Không thể đăng bình luận lúc này");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header xem tất cả bình luận & Toggle thu gọn */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-[#003B95]/10 text-[#003B95] dark:text-blue-400">
            <MessageCircle className="size-4" />
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {title} ({comments.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          {isOpen ? (
            <>
              <ChevronUp className="size-3.5" />
              <span>Thu gọn</span>
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              <span>Xem tất cả ({comments.length})</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3">
          {/* CÂY BÌNH LUẬN FACEBOOK HIERARCHICAL TREE */}
          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-[#003B95]" />
              <span>Đang tải bình luận...</span>
            </div>
          ) : commentTrees.length === 0 ? (
            <div className="py-3 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              Chưa có bình luận nào. Hãy là người đầu tiên đóng góp ý kiến!
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {commentTrees.map((rootNode) => (
                <CommentTreeNodeItem
                  key={rootNode.id}
                  node={rootNode}
                  postId={postId}
                  onReply={(commentId, authorName, level) => {
                    setReplyingTo({ commentId, authorName, level });
                    // Tự động chèn @Tên vào input để tiện phản hồi
                    setInputText((prev) => (prev.includes(`@${authorName}`) ? prev : `@${authorName} ${prev}`));
                    inputRef.current?.focus();
                  }}
                  onReact={handleReactToComment}
                  activeReactionCommentId={activeReactionCommentId}
                  setActiveReactionCommentId={setActiveReactionCommentId}
                  onImagePreview={(url) => setPreviewImage(url)}
                  onEdit={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  currentUserId={user?.id}
                  isAdmin={user?.role === "ADMIN" || (user as any)?.role === "SUPER_ADMIN"}
                />
              ))}
            </div>
          )}

          {/* BANNER ĐANG PHẢN HỒI */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-xs">
              <div className="flex items-center gap-1.5 text-[#003B95] dark:text-blue-300 font-semibold truncate">
                <Reply className="size-3.5 shrink-0" />
                <span>
                  Đang phản hồi <strong className="font-bold">@{replyingTo.authorName}</strong> (Cấp {replyingTo.level})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 cursor-pointer"
                title="Hủy phản hồi"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* PREVIEW ẢNH ĐÍNH KÈM */}
          {attachedMedia && (
            <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
              <img src={attachedMedia.url} alt="Attached" className="h-16 w-24 object-cover" />
              <button
                type="button"
                onClick={() => setAttachedMedia(null)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          {/* KHUNG NHẬP BÌNH LUẬN KIỂU FACEBOOK + AUTOCOMPLETE @MENTION */}
          <div className="relative pt-1">
            {/* DANH SÁCH HỘI VIÊN ĐÃ GẮN THẺ ĐA THÀNH VIÊN KÈM NÚT XÓA NHANH X */}
            {taggedMembers.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1.5 animate-in fade-in duration-100">
                <span className="text-[10.5px] font-bold text-slate-400">Đã gắn thẻ:</span>
                {taggedMembers.map((tm) => (
                  <span
                    key={tm.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[11px] font-bold text-[#003B95] dark:text-blue-300 shadow-2xs"
                  >
                    <span>@{tm.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTaggedMember(tm.id, tm.name)}
                      className="p-0.5 rounded-full hover:bg-blue-200/60 dark:hover:bg-blue-800/60 transition cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      title={`Xóa @${tm.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* DROPDOWN GỢI Ý @MENTION HỘI VIÊN ĐÃ KẾT NỐI */}
            {showMentionPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-2 max-h-56 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-40 p-1.5 space-y-1 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[#003B95] dark:text-blue-400">
                    <AtSign className="size-3" />
                    <span>Hội viên đã kết nối 1-on-1</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMentionPicker(false)}
                    className="p-0.5 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                {filteredMentionMembers.length === 0 ? (
                  <div className="py-3 px-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Chưa có hội viên trong mạng lưới kết nối 1-on-1. Hãy kết nối thêm hội viên để gắn thẻ @.
                  </div>
                ) : (
                  filteredMentionMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMention(m)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <img
                        src={m.avatarUrl || "/ceo1983-emblem-8.png"}
                        alt={m.name}
                        className="size-7 rounded-full object-cover border border-amber-400/40 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "/ceo1983-emblem-8.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {m.name}
                        </p>
                        {m.company && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {m.company}
                          </p>
                        )}
                      </div>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-[#003B95] dark:text-blue-300 font-bold shrink-0">
                        Gắn thẻ @
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Input bar: Bỏ viền khi nhập, người dùng tự gõ @, không có icon @ trùng lặp */}
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || (user as any)?.avatarUrl || "/ceo1983-emblem-8.png"}
                alt="My avatar"
                className="size-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                onError={(e) => {
                  e.currentTarget.src = "/ceo1983-emblem-8.png";
                }}
              />

              <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border-0 outline-none focus-within:ring-0 shadow-none transition">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                    if (e.key === "Escape") {
                      setShowMentionPicker(false);
                    }
                  }}
                  placeholder={
                    replyingTo
                      ? `Phản hồi @${replyingTo.authorName}...`
                      : "Viết bình luận công khai, gõ @ để nhắc tên hội viên..."
                  }
                  className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none py-1 border-none focus:outline-none focus:ring-0"
                />

                {/* Đính kèm ảnh */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  title="Đính kèm ảnh"
                  className="p-1 rounded-lg text-slate-400 hover:text-[#003B95] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition disabled:opacity-50"
                >
                  {uploadingMedia ? (
                    <Loader2 className="size-4 animate-spin text-[#003B95]" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* NÚT GỬI BÌNH LUẬN: MÀU XANH CHUẨN CEO 1983 (#003B95), TUYỆT ĐỐI KHÔNG DÙNG GRADIENT */}
              <button
                type="button"
                onClick={handleSendComment}
                disabled={submitting || (!inputText.trim() && !attachedMedia)}
                aria-label="Gửi bình luận"
                className="h-9 px-3.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX XEM ẢNH PHÓNG TO */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewImage} alt="Phóng to" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center shadow-lg border border-slate-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
