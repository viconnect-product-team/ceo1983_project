import React, { useState } from "react";
import { X, Sparkles, Newspaper, Image, FileText, AlignLeft, Tag, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createCommunityNewsFn } from "@/lib/business-connect/mobile/community.functions";

interface CreateNewsModalProps {
  communityId: string;
  communityName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NEWS_CATEGORIES = [
  { id: "ANNOUNCEMENT", label: "Thông báo Ban Chấp Hành" },
  { id: "BUSINESS_DEAL", label: "Tin tức Giao thương & Hợp tác" },
  { id: "MEMBER_SPOTLIGHT", label: "Gương mặt & Doanh nghiệp Hội viên" },
  { id: "CLUB_ACTIVITY", label: "Hoạt động & Sự kiện CLB" },
  { id: "MARKET_INSIGHT", label: "Bản tin Thị trường & Chính sách" },
];

export function CreateNewsModal({
  communityId,
  communityName,
  isOpen,
  onClose,
  onSuccess,
}: CreateNewsModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ANNOUNCEMENT");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCommunityNewsFn({
        data: {
          communityId,
          title: title.trim(),
          category,
          coverImage: coverImage.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content: content.trim() || undefined,
        },
      });

      if (res.ok) {
        toast.success("✓ Đã đăng bài viết thành công!", {
          description: "Bài viết đã được xuất bản tới toàn thể hội viên cộng đồng.",
        });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Không thể đăng bài viết. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Create news error", err);
      toast.error("Đã xảy ra lỗi khi đăng bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-lg h-[90vh] sm:h-auto max-h-[90vh] max-h-[90dvh] flex flex-col rounded-3xl border border-amber-500/40 bg-[#1A120B] text-white shadow-2xl overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-[#1A120B]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shrink-0">
              <Newspaper className="w-4.5 h-4.5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-mono font-bold text-amber-500 uppercase tracking-wider truncate">
                  {communityName || "BẢN TIN CỘNG ĐỒNG"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                Đăng Bài Viết & Tin Tức
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
          {/* Tiêu đề bài viết */}
          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Tiêu đề bài viết <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Hội nghị Xúc tiến Giao thương Quý 3/2026..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#1A0F0A] text-black dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Chuyên mục & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Chuyên mục</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#1A0F0A] text-black dark:text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-amber-500" />
                <span>Link Ảnh bìa (URL)</span>
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#1A0F0A] text-black dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tóm tắt bài viết */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>Tóm tắt ngắn (Excerpt)</span>
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Đoạn tóm lược nội dung chính (1-2 câu) hiển thị trên danh sách tin..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#1A0F0A] text-black dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Nội dung chi tiết */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Nội dung chi tiết bài viết</span>
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập toàn bộ nội dung bài viết, kế hoạch, thông báo hoặc chương trình chi tiết..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#1A0F0A] text-black dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Fixed Footer Bar */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-white/10 bg-[#140E08] flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 sm:py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 sm:py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#F6E1C3] via-[#D8B282] to-[#C29B69] text-black shadow-md hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Đang đăng...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Xuất bản bài viết</span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
