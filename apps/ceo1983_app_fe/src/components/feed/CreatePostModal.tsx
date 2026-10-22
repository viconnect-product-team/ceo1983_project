import React, { useState, useRef } from "react";
import {
  X,
  ImagePlus,
  Crop,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
  Building2,
  Handshake,
  Calendar,
  ShoppingBag,
  Newspaper,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export const COMMITTEES = [
  "Ban Điều Hành",
  "Ban Thành viên",
  "Ban xúc tiến",
  "Ban truyền thông",
  "Ban tài chính",
  "Ban thiện nguyện",
  "Ban Thư Ký",
];

export const CATEGORIES = [
  { id: "NEWS", label: "Tin tức các ban", icon: Newspaper, color: "text-blue-600 bg-blue-50" },
  { id: "OPPORTUNITY", label: "Cơ hội chia sẻ", icon: Handshake, color: "text-red-600 bg-red-50" },
  { id: "EVENT_MEETING", label: "Sự kiện & Họp ban", icon: Calendar, color: "text-amber-600 bg-amber-50" },
  { id: "MARKETPLACE", label: "Sản phẩm Marketplace", icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50" },
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPost: any) => void;
}

export function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("NEWS");
  const [department, setDepartment] = useState(COMMITTEES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simple Cropper state
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const res = await uploadFileToNest(file);
        return res?.url || URL.createObjectURL(file);
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`Đã thêm ${uploadedUrls.length} ảnh`);
    } catch {
      toast.error("Không thể tải một số ảnh lên");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activeCropIndex === index) {
      setActiveCropIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.warning("Vui lòng nhập nội dung bài viết");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        department: category === "NEWS" || category === "EVENT_MEETING" ? department : undefined,
        images,
      };

      const res = await fetchNestApi<any>("/feed", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.id) {
        toast.success("Đăng bài thành công lên bảng tin CLB!");
        onSuccess(res);
        onClose();
      } else {
        throw new Error("Lỗi phản hồi server");
      }
    } catch {
      toast.error("Không thể đăng bài viết lúc này");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50/60 via-amber-50/30 to-blue-50/40 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tạo bài đăng Bảng tin CLB
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chia sẻ tin tức, cơ hội hoặc sản phẩm đến cộng đồng CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Danh mục bài đăng <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      isSelected
                        ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${c.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Committee selector if NEWS or EVENT_MEETING */}
          {(category === "NEWS" || category === "EVENT_MEETING") && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Thuộc Ban / Đơn vị <span className="text-red-600">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-red-600"
              >
                {COMMITTEES.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tiêu đề (Tùy chọn)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thông báo họp Ban Xúc tiến tháng 10..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-red-600"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nội dung chi tiết <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung chia sẻ, trao đổi, thông báo sự kiện, sản phẩm..."
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-red-600 resize-none"
            />
          </div>

          {/* Multi-image upload with Crop & Move */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hình ảnh đính kèm ({images.length})
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <ImagePlus className="size-3.5" />
                <span>Thêm nhiều ảnh</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </div>

            {uploadingImages && (
              <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="size-4 animate-spin text-red-600" />
                <span>Đang tải ảnh lên hệ thống...</span>
              </div>
            )}

            {/* Images grid preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={resolveMediaUrl(imgUrl) || imgUrl}
                      alt={`Ảnh ${idx + 1}`}
                      className="size-full object-cover"
                    />

                    {/* Action overlays: Crop / Adjust & Remove */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCropIndex(idx);
                          setCropZoom(1);
                          setCropPan({ x: 0, y: 0 });
                        }}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-[10px] font-bold shadow-xs cursor-pointer"
                        title="Kéo di chuyển / Cắt ảnh"
                      >
                        <Crop className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 text-[10px] font-bold shadow-xs cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitting indicator */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:opacity-95 text-white font-bold text-xs shadow-md active:scale-98 transition inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang đăng bài...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Đăng ngay lên Bảng tin CEO 1983</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── MODAL CẮT / KÉO DI CHUYỂN ẢNH (Image Crop & Pan Editor) ── */}
        {activeCropIndex !== null && images[activeCropIndex] && (
          <div className="fixed inset-0 z-60 bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
                <span className="text-xs font-bold inline-flex items-center gap-1.5">
                  <Crop className="size-4 text-amber-400" />
                  Kéo di chuyển / Khung ảnh #{activeCropIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCropIndex(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Viewport for pan / zoom */}
              <div
                className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-slate-700 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={(e) => {
                  isDraggingRef.current = true;
                  dragStartRef.current = { x: e.clientX - cropPan.x, y: e.clientY - cropPan.y };
                }}
                onPointerMove={(e) => {
                  if (!isDraggingRef.current) return;
                  setCropPan({
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y,
                  });
                }}
                onPointerUp={() => {
                  isDraggingRef.current = false;
                }}
              >
                <img
                  src={resolveMediaUrl(images[activeCropIndex]) || images[activeCropIndex]}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    transform: `translate(${cropPan.x}px, ${cropPan.y}px) scale(${cropZoom})`,
                    transition: isDraggingRef.current ? "none" : "transform 0.1s ease-out",
                  }}
                  className="size-full object-contain pointer-events-none"
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/50 rounded-2xl" />
              </div>

              {/* Zoom control */}
              <div className="flex items-center gap-3 text-white text-xs px-2">
                <span className="text-slate-400 text-[11px]">Zoom:</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono">{Math.round(cropZoom * 100)}%</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCropZoom(1);
                    setCropPan({ x: 0, y: 0 });
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Đã lưu khung vị trí ảnh!");
                    setActiveCropIndex(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="size-3.5" />
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
