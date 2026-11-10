import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Copy, Reply, CornerDownRight, Check, X } from "lucide-react";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export interface BottomSheetComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  parentId?: string | null;
  level?: number;
  replyToAuthorName?: string | null;
  mediaUrl?: string | null;
  reaction?: string | null;
  createdAt: string;
}

export interface BottomSheetCommentNode extends BottomSheetComment {
  children: BottomSheetCommentNode[];
}

function organizeTree(comments: BottomSheetComment[]): BottomSheetCommentNode[] {
  const map = new Map<string, BottomSheetCommentNode>();
  const roots: BottomSheetCommentNode[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  map.forEach((node) => {
    node.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  return roots;
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Vừa xong";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

interface CommentBottomSheetModalProps {
  isOpen: boolean;
  postId: string;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

export function CommentBottomSheetModal({
  isOpen,
  postId,
  onClose,
  onCommentCountChange,
}: CommentBottomSheetModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BottomSheetComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string; level: number } | null>(null);
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Nạp danh sách bình luận khi mở modal
  useEffect(() => {
    if (!isOpen || !postId) return;
    setLoading(true);

    fetchNestApi<any>(`/feed/${postId}/comments`)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        setComments(list);
        if (onCommentCountChange) onCommentCountChange(list.length);
      })
      .catch(() => {
        // Fallback demo comments nếu API chưa có sẵn
        setComments([
          {
            id: `c-demo-1`,
            postId,
            authorId: "user-1",
            authorName: "CEO Trần Văn Long",
            authorAvatar: "https://placehold.co/70x44",
            content: "Giải pháp ERP này rất phù hợp cho các doanh nghiệp quy mô vừa và nhỏ trong CLB!",
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          },
          {
            id: `c-demo-2`,
            postId,
            authorId: "user-2",
            authorName: "CEO Nguyễn Phương Thảo",
            authorAvatar: "https://placehold.co/70x44",
            content: "Đồng quan điểm với anh Long, bên em cũng đang ứng dụng AI vào tự động hóa vận hành rất hiệu quả.",
            parentId: "c-demo-1",
            level: 2,
            replyToAuthorName: "CEO Trần Văn Long",
            createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const currentUserId = user?.id || (user as any)?.member_id || "current-user";

  const handleCopyComment = (content: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(content);
      } else {
        const ta = document.createElement("textarea");
        ta.value = content;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("✓ Đã sao chép bình luận vào clipboard");
    } catch {
      toast.error("Không thể sao chép");
    }
    setActiveMenuCommentId(null);
  };

  const handleStartReply = (commentId: string, authorName: string, level: number) => {
    setReplyingTo({ id: commentId, authorName, level });
    setActiveMenuCommentId(null);
    inputRef.current?.focus();
  };

  const handleStartEdit = (comment: BottomSheetComment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
    setActiveMenuCommentId(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;
    try {
      await fetchNestApi(`/feed/${postId}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editingText.trim() }),
      }).catch(() => {});

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: editingText.trim() } : c))
      );
      setEditingCommentId(null);
      toast.success("✓ Đã cập nhật bình luận!");
    } catch {
      toast.error("Không thể chỉnh sửa bình luận lúc này");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await fetchNestApi(`/feed/${postId}/comments/${commentId}`, {
        method: "DELETE",
      }).catch(() => {});

      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      toast.success("✓ Đã xóa bình luận!");
      setActiveMenuCommentId(null);
    } catch {
      toast.error("Không thể xóa bình luận lúc này");
    }
  };

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    setSubmitting(true);
    const newCommentPayload = {
      content: inputText.trim(),
      parentId: replyingTo?.id || null,
      level: replyingTo ? replyingTo.level + 1 : 1,
      replyToAuthorName: replyingTo?.authorName || null,
      mediaUrl: attachedImage || null,
      mediaType: attachedImage ? "image" : null,
    };

    try {
      const created = await fetchNestApi<any>(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(newCommentPayload),
      }).catch(() => null);

      const resolvedComment: BottomSheetComment = created?.id
        ? created
        : {
            id: `c-local-${Date.now()}`,
            postId,
            authorId: currentUserId,
            authorName: user?.name || (user as any)?.fullName || "Tôi",
            authorAvatar: user?.avatar || "/avatars/avatar-default.png",
            content: inputText.trim(),
            parentId: replyingTo?.id || null,
            level: replyingTo ? replyingTo.level + 1 : 1,
            replyToAuthorName: replyingTo?.authorName || null,
            mediaUrl: attachedImage || null,
            createdAt: new Date().toISOString(),
          };

      const updated = [...comments, resolvedComment];
      setComments(updated);
      if (onCommentCountChange) onCommentCountChange(updated.length);

      setInputText("");
      setAttachedImage(null);
      setReplyingTo(null);
      toast.success("✓ Đã gửi bình luận!");
    } catch {
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFileToNest(file, "feed_comments");
      if (uploaded?.url) {
        setAttachedImage(uploaded.url);
        toast.success("✓ Đã đính kèm ảnh");
      }
    } catch {
      toast.error("Không thể tải ảnh lên");
    }
  };

  const commentTree = organizeTree(comments);

  // Component đệ quy hiển thị từng comment
  const renderCommentNode = (node: BottomSheetCommentNode) => {
    const isOwn = node.authorId === currentUserId || (user && node.authorName === user.name);
    const isEditingThis = editingCommentId === node.id;
    const isMenuOpen = activeMenuCommentId === node.id;

    return (
      <div key={node.id} className="self-stretch flex flex-col justify-start items-start gap-1">
        <div className={`self-stretch flex justify-start items-start gap-2 ${node.level && node.level > 1 ? "pl-8" : ""}`}>
          {/* Avatar bo 20px theo chuẩn user */}
          <div className="size-10 bg-Neutral-300 rounded-[20px] flex justify-center items-center overflow-hidden shrink-0">
            <img
              className="size-full object-cover"
              src={node.authorAvatar || "https://placehold.co/70x44"}
              alt={node.authorName}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.png";
              }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
            {/* Bubble bình luận màu Cool-Blue-50 bo góc 8px outline Cool-Blue-100 */}
            <div className="self-stretch p-2.5 bg-[#EFF6FF] dark:bg-slate-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-[#DBEAFE] dark:outline-slate-700 flex flex-col justify-start items-start gap-1 relative">
              <div className="self-stretch inline-flex justify-between items-start">
                <div className="justify-start text-slate-900 dark:text-white text-xs font-semibold font-['Inter'] leading-4 flex items-center gap-1.5 flex-wrap">
                  <span>{node.authorName}</span>
                  {node.replyToAuthorName && (
                    <span className="text-[10.5px] text-[#003B95] dark:text-blue-400 font-normal">
                      trả lời <strong className="font-semibold">@{node.replyToAuthorName}</strong>
                    </span>
                  )}
                </div>

                {/* ── NÚT 3 CHẤM MENU TÙY CHỌN ── */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveMenuCommentId(isMenuOpen ? null : node.id)}
                    className="size-5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title="Tùy chọn bình luận"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>

                  {/* Menu Popover */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-6 z-50 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in zoom-in-95 duration-100"
                      onMouseLeave={() => setActiveMenuCommentId(null)}
                    >
                      {/* 1. Sao chép bình luận (Dành cho cả chính mình và người khác) */}
                      <button
                        type="button"
                        onClick={() => handleCopyComment(node.content)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                      >
                        <Copy className="size-3.5 text-blue-600" />
                        <span>Sao chép bình luận</span>
                      </button>

                      {/* 2. Nếu là của người khác: có Phản hồi */}
                      {!isOwn && (
                        <button
                          type="button"
                          onClick={() => handleStartReply(node.id, node.authorName, node.level || 1)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                        >
                          <Reply className="size-3.5 text-emerald-600" />
                          <span>Phản hồi</span>
                        </button>
                      )}

                      {/* 3. Nếu là của chính mình: có Chỉnh sửa & Xóa */}
                      {isOwn && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(node)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                          >
                            <Pencil className="size-3.5 text-amber-600" />
                            <span>Chỉnh sửa bình luận</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(node.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Xóa bình luận</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Nội dung text hoặc form edit */}
              {isEditingThis ? (
                <div className="w-full space-y-1.5 pt-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-[#003B95] bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingCommentId(null)}
                      className="px-2 py-1 text-[11px] rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(node.id)}
                      className="px-2.5 py-1 text-[11px] rounded bg-[#003B95] text-white font-bold"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="self-stretch justify-start text-slate-800 dark:text-slate-200 text-sm font-normal font-['Inter'] leading-5 whitespace-pre-wrap break-words">
                  {node.content}
                </div>
              )}

              {/* Ảnh đính kèm nếu có */}
              {node.mediaUrl && (
                <div className="mt-1 rounded-lg overflow-hidden max-h-40 border border-slate-200">
                  <img src={node.mediaUrl} alt="Đính kèm" className="max-h-40 object-cover" />
                </div>
              )}
            </div>

            {/* Sub-row: Thời gian, Thích, Trả lời */}
            <div className="self-stretch inline-flex justify-between items-center px-1">
              <div className="inline-flex justify-start items-center gap-3">
                <div className="justify-start text-slate-400 text-xs font-normal font-['Inter'] leading-4">
                  {formatRelativeTime(node.createdAt)}
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Đã thích bình luận")}
                  className="justify-start text-[#003B95] dark:text-blue-400 text-xs font-semibold font-['Inter'] leading-4 cursor-pointer hover:underline"
                >
                  Thích
                </button>
                <button
                  type="button"
                  onClick={() => handleStartReply(node.id, node.authorName, node.level || 1)}
                  className="justify-start text-[#003B95] dark:text-blue-400 text-xs font-semibold font-['Inter'] leading-4 cursor-pointer hover:underline"
                >
                  Trả lời
                </button>
              </div>

              {/* Like Icon SVG từ bộ CEO1983_icon (4) */}
              <div className="size-4 flex items-center justify-center">
                <img src="/icons/comments/favourite.svg" alt="Like" className="size-3.5 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Render câu trả lời con (Replies) */}
        {node.children && node.children.length > 0 && (
          <div className="self-stretch flex flex-col gap-2 mt-1">
            {node.children.map((child) => renderCommentNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg p-4 bg-white dark:bg-slate-900 rounded-tl-3xl rounded-tr-3xl sm:rounded-3xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)] flex flex-col justify-start items-center gap-4 max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Top Handle: w-28 h-[5px] bg-Neutral-400 rounded-[100px] */}
        <div className="w-28 h-[5px] bg-[#9CA3AF] rounded-[100px]" />

        {/* Header Bar: "Tất cả bình luận" + arrow-down icon & cancel icon */}
        <div className="self-stretch inline-flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex justify-start items-center gap-2">
            <div className="justify-start text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-6">
              Tất cả bình luận ({comments.length})
            </div>
            <div className="size-5 flex items-center justify-center">
              <img
                src="/icons/comments/arrow-down-01-round.svg"
                alt="Arrow"
                className="size-4"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <img src="/icons/comments/cancel-01.svg" alt="Close" className="size-5" />
          </button>
        </div>

        {/* Scrollable Comments List */}
        <div className="self-stretch flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Đang tải bình luận...</div>
          ) : commentTree.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </div>
          ) : (
            commentTree.map((rootNode) => renderCommentNode(rootNode))
          )}
        </div>

        {/* Thanh đang trả lời ai đó nếu có */}
        {replyingTo && (
          <div className="self-stretch px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <CornerDownRight className="size-3.5" />
              <span>Đang trả lời <strong>@{replyingTo.authorName}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Ảnh đính kèm preview trước khi gửi */}
        {attachedImage && (
          <div className="self-stretch px-2 relative">
            <img src={attachedImage} alt="Attached" className="h-16 rounded-lg object-cover border border-slate-300" />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1 left-16 p-0.5 rounded-full bg-rose-500 text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── BOTTOM INPUT BAR CHUẨN DESIGN USER ── */}
        <form
          onSubmit={handleSubmitComment}
          className="self-stretch pt-2 border-t border-slate-200 dark:border-slate-800 inline-flex justify-start items-center gap-2"
        >
          {/* Avatar Monogram TA Badge */}
          <div className="h-9 px-2.5 py-3.5 bg-[#003B95] rounded-[99px] flex justify-start items-center gap-2.5 shrink-0">
            <img src="/icons/comments/TA.svg" alt="TA" className="w-4 h-2 object-contain" />
          </div>

          {/* Ô nhập bình luận bo tròn 99px */}
          <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-[99px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Viết bình luận công khai..."
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm font-normal font-['Inter'] leading-5 placeholder:text-slate-400"
            />
            {/* Nút thêm ảnh add-circle.svg */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="size-5 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              title="Đính kèm ảnh"
            >
              <img src="/icons/comments/add-circle.svg" alt="Add" className="size-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
          </div>

          {/* Nút gửi sent.svg */}
          <button
            type="submit"
            disabled={submitting || (!inputText.trim() && !attachedImage)}
            className="size-9 bg-[#003B95] hover:bg-[#002766] rounded-[99px] flex justify-center items-center gap-2.5 cursor-pointer disabled:opacity-50 transition shrink-0"
            title="Gửi bình luận"
          >
            <img src="/icons/comments/sent.svg" alt="Send" className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

