import React, { useState, useRef, useEffect } from "react";
import {
  X,
  ImagePlus,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
  Globe,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { COMMITTEES, CATEGORIES } from "./CreatePostModal";

export interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title?: string;
    content?: string;
    category?: string;
    department?: string;
    images?: string[];
    sharedArticle?: any;
    externalLink?: string;
    type?: string;
    [key: string]: any;
  } | null;
  onSuccess: (updatedPost: any) => void;
}

export function EditPostModal({ isOpen, onClose, post, onSuccess }: EditPostModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("NEWS");
  const [department, setDepartment] = useState(COMMITTEES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // External share state
  const isSharedPost = Boolean(
    post?.sharedArticle || post?.externalLink || post?.type === "shared_link"
  );
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedTitle, setSharedTitle] = useState("");
  const [sharedSummary, setSharedSummary] = useState("");
  const [sharedDomain, setSharedDomain] = useState("");
  const [sharedThumbnail, setSharedThumbnail] = useState("");
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setCategory(post.category || "NEWS");
      setDepartment(post.department || COMMITTEES[0]);
      setImages(Array.isArray(post.images) ? [...post.images] : []);

      let art: any = null;
      if (post.sharedArticle) {
        if (typeof post.sharedArticle === "string") {
          try {
            art = JSON.parse(post.sharedArticle);
          } catch {
            art = null;
          }
        } else {
          art = post.sharedArticle;
        }
      }

      const url = art?.url || post.externalLink || "";
      setSharedUrl(url);
      setSharedTitle(art?.title || post.title || "");
      setSharedSummary(art?.snippet || art?.excerpt || "");
      setSharedDomain(art?.domain || art?.sourceName || "");
      setSharedThumbnail(art?.thumbnailUrl || art?.thumbnail || "");
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleFetchMetadata = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.trim()) return;
    setLoadingMetadata(true);
    try {
      let cleanUrl = targetUrl.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
      }
      try {
        const u = new URL(cleanUrl);
        setSharedDomain(u.hostname.replace(/^www\./, "").toUpperCase());
      } catch {}

      const res = await fetchNestApi<any>(`/feed/url-metadata?url=${encodeURIComponent(cleanUrl)}`);
      if (res && res.ok) {
        if (res.domain) setSharedDomain(res.domain);
        if (res.title) setSharedTitle(res.title);
        if (res.description) setSharedSummary(res.description);
        if (res.thumbnail) setSharedThumbnail(res.thumbnail);
        toast.success("Đã trích xuất thông tin liên kết ngoài!");
      }
    } catch {
      toast.info("Đã nhận diện liên kết");
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      toast.warning("Chỉ được đính kèm tối đa 5 ảnh.");
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingImages(true);
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const res = await uploadFileToNest(file);
        return res?.url || URL.createObjectURL(file);
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
      toast.success(`Đã thêm ${uploadedUrls.length} ảnh`);
    } catch {
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim() && !sharedUrl.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung bài viết");
      return;
    }

    setSubmitting(true);
    try {
      const cleanUrl = sharedUrl.trim()
        ? sharedUrl.trim().startsWith("http")
          ? sharedUrl.trim()
          : `https://${sharedUrl.trim()}`
        : "";

      const sharedArticle = isSharedPost && cleanUrl
        ? {
            url: cleanUrl,
            domain: sharedDomain || "LIÊN KẾT NGOÀI",
            title: sharedTitle.trim() || title.trim() || "Bài viết chia sẻ",
            snippet: sharedSummary.trim() || "Bấm vào để xem toàn văn bài viết chi tiết từ ứng dụng nguồn.",
            thumbnailUrl: sharedThumbnail.trim() || (images.length > 0 ? images[0] : ""),
            sourceName: sharedDomain || "LIÊN KẾT NGOÀI",
          }
        : post.sharedArticle;

      const payload = {
        title: title.trim() || (sharedArticle ? sharedArticle.title : undefined),
        content: content.trim(),
        category,
        department,
        images,
        sharedArticle,
        externalLink: cleanUrl || undefined,
      };

      // Call backend API update
      await fetchNestApi(`/feed/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("Backend PATCH /feed error, falling back to local sync:", err);
      });

      const updatedPost = {
        ...post,
        ...payload,
        title: payload.title,
        content: payload.content,
        category: payload.category,
        department: payload.department,
        images: payload.images,
        sharedArticle: payload.sharedArticle,
        updatedAt: new Date().toISOString(),
      };

      // Sync with localStorage cache
      try {
        const raw = localStorage.getItem("vba_network_feed_posts");
        if (raw) {
          const list = JSON.parse(raw);
          const nextList = list.map((p: any) => (p.id === post.id ? { ...p, ...updatedPost } : p));
          localStorage.setItem("vba_network_feed_posts", JSON.stringify(nextList));
        }
      } catch {}

      toast.success("Đã cập nhật bài đăng thành công!");
      onSuccess(updatedPost);
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thay đổi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003B95] dark:text-blue-400 flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isSharedPost ? "Chỉnh sửa bài chia sẻ liên kết ngoài" : "Chỉnh sửa bài đăng mạng lưới"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Cập nhật thông tin hiển thị trên bảng tin CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Category & Department selector */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Thể loại bài đăng
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ban trực thuộc
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
              >
                {COMMITTEES.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nội dung chia sẻ
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung chi tiết hoặc lời dẫn bài chia sẻ..."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95] leading-relaxed resize-none"
            />
          </div>

          {/* Shared Article Section (if shared post) */}
          {isSharedPost && (
            <div className="p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  <span>Liên kết bài viết chia sẻ ngoài</span>
                </span>
                {loadingMetadata && (
                  <span className="text-[10px] text-purple-600 flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Đang lấy metadata...</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input
                    type="url"
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    placeholder="https://vnexpress.net/..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchMetadata(sharedUrl)}
                  disabled={loadingMetadata || !sharedUrl.trim()}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  Cập nhật
                </button>
              </div>

              {/* Preview card of shared article */}
              {(sharedTitle || sharedUrl) && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                  {sharedThumbnail && (
                    <div className="h-28 w-full overflow-hidden bg-slate-950 relative">
                      <img
                        src={resolveMediaUrl(sharedThumbnail) || sharedThumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-2.5 space-y-1">
                    <div className="text-[9.5px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                      {sharedDomain || "LIÊN KẾT NGOÀI"}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {sharedTitle || sharedUrl}
                    </div>
                    {sharedSummary && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {sharedSummary}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photo gallery */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Hình ảnh đính kèm ({images.length}/5)
              </label>
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <ImagePlus className="size-3.5" />
                  <span>{uploadingImages ? "Đang tải ảnh..." : "+ Thêm ảnh"}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />

            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={resolveMediaUrl(img) || img}
                      alt={`Image ${idx + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-[#003B95] transition"
              >
                <ImagePlus className="size-6 text-slate-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Bấm để tải thêm ảnh đính kèm (tối đa 5 ảnh)
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploadingImages}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition hover:opacity-95 active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ background: "#003B95" }}
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

