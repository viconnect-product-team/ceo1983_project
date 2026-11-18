import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  X,
  Share2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Globe,
  Trash2,
  Send,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { executeShare } from "@/lib/share-helper";
import { useAuth } from "@/context/AuthContext";

export interface EventLivePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    id: string;
    title: string;
    type: "event" | "meeting" | "activity";
    date?: string;
    time?: string;
    location?: string;
    image?: string;
  } | null;
  onSuccess?: () => void;
}

export function EventLivePhotoModal({
  isOpen,
  onClose,
  target,
  onSuccess,
}: EventLivePhotoModalProps) {
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen || !target) return null;

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (newFiles.length === 0) {
      toast.error("Vui lòng chọn định dạng tệp hình ảnh!");
      return;
    }
    if (selectedFiles.length + newFiles.length > 5) {
      toast.error("Mỗi lần tải lên tối đa 5 hình ảnh!");
      return;
    }

    const combined = [...selectedFiles, ...newFiles];
    setSelectedFiles(combined);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const url = filePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetState = () => {
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setFilePreviews([]);
    setNote("");
    setIsProcessing(false);
    setStatusMessage("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  /**
   * Tải ảnh lên server và lưu vào album sự kiện / cuộc họp
   */
  const uploadSelectedFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) {
      throw new Error("Vui lòng chụp ảnh hoặc chọn ảnh trước!");
    }
    const uploadedUrls: string[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      setStatusMessage(`Đang tải ảnh ${i + 1}/${selectedFiles.length}...`);
      const file = selectedFiles[i];
      const url = await uploadFileToNest(file, `live_${target.type}`);
      if (url) uploadedUrls.push(url);
    }
    if (uploadedUrls.length === 0) {
      throw new Error("Không thể tải ảnh lên máy chủ. Vui lòng thử lại!");
    }
    return uploadedUrls;
  };

  /**
   * Hành động 1: Lưu tại chính sự kiện / cuộc họp đang diễn ra
   */
  const handleSaveToEvent = async () => {
    setIsProcessing(true);
    try {
      const urls = await uploadSelectedFiles();

      // Lưu vào kho ảnh hoạt động cục bộ và đồng bộ
      const storageKey = `live_media_${target.type}_${target.id}`;
      try {
        const raw = localStorage.getItem(storageKey);
        const existing = raw ? JSON.parse(raw) : [];
        const newRecords = urls.map((u, idx) => ({
          id: `media-${Date.now()}-${idx}`,
          url: u,
          type: "image",
          note: note.trim() || undefined,
          createdAt: new Date().toISOString(),
          authorName: user?.name || user?.email || "Hội viên CEO 1983",
        }));
        localStorage.setItem(storageKey, JSON.stringify([...newRecords, ...existing]));
      } catch {}

      // Đồng bộ vào tài liệu sự kiện của hệ thống
      await fetchNestApi("/documents/sync-activity-media", {
        method: "POST",
        body: JSON.stringify({
          activityType: target.type === "activity" ? "event" : target.type,
          activityId: target.id,
          activityTitle: target.title,
          mediaUrls: urls,
          notes: note.trim() || undefined,
        }),
      }).catch(() => {});

      toast.success(`Đã lưu thành công ${urls.length} ảnh vào sự kiện "${target.title}"!`);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu ảnh vào sự kiện");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  /**
   * Hành động 2A: Chia sẻ lên Mạng lưới Hiệp hội (Bảng tin Social Feed)
   */
  const handleShareToNetwork = async () => {
    setIsProcessing(true);
    try {
      const urls = await uploadSelectedFiles();

      // 1. Lưu tại sự kiện
      const storageKey = `live_media_${target.type}_${target.id}`;
      try {
        const raw = localStorage.getItem(storageKey);
        const existing = raw ? JSON.parse(raw) : [];
        const newRecords = urls.map((u, idx) => ({
          id: `media-${Date.now()}-${idx}`,
          url: u,
          type: "image",
          note: note.trim() || undefined,
          createdAt: new Date().toISOString(),
          authorName: user?.name || user?.email || "Hội viên CEO 1983",
        }));
        localStorage.setItem(storageKey, JSON.stringify([...newRecords, ...existing]));
      } catch {}

      // 2. Đăng bài lên Mạng lưới hiệp hội (/feed)
      setStatusMessage("Đang đăng lên Mạng lưới CLB CEO 1983...");
      const typeLabel = target.type === "meeting" ? "Cuộc họp" : "Sự kiện";
      const feedTitle = `📸 [Khoảnh khắc trực tiếp: ${typeLabel}] ${target.title}`;
      const feedContent = `${feedTitle}\n\n${
        note.trim() ? `"${note.trim()}"\n\n` : ""
      }📍 Địa điểm: ${target.location || "CLB Doanh Nhân CEO 1983"}\n⏰ Thời gian: ${target.time || "Đang diễn ra"}\n\n✨ Hình ảnh kỷ niệm được chụp và ghi nhận trực tiếp từ ứng dụng CEO 1983.`;

      await fetchNestApi("/feed", {
        method: "POST",
        body: JSON.stringify({
          title: feedTitle,
          content: feedContent,
          category: "EVENT_MEETING",
          images: urls,
        }),
      });

      toast.success("Đã lưu ảnh và chia sẻ lên Mạng lưới CLB CEO 1983 thành công!");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi chia sẻ lên Mạng lưới");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  /**
   * Hành động 2B: Chia sẻ ra ngoài ứng dụng (Web Share API / Public link)
   */
  const handleShareOutside = async () => {
    setIsProcessing(true);
    try {
      const urls = await uploadSelectedFiles();

      // Lưu tại sự kiện
      const storageKey = `live_media_${target.type}_${target.id}`;
      try {
        const raw = localStorage.getItem(storageKey);
        const existing = raw ? JSON.parse(raw) : [];
        const newRecords = urls.map((u, idx) => ({
          id: `media-${Date.now()}-${idx}`,
          url: u,
          type: "image",
          note: note.trim() || undefined,
          createdAt: new Date().toISOString(),
          authorName: user?.name || user?.email || "Hội viên CEO 1983",
        }));
        localStorage.setItem(storageKey, JSON.stringify([...newRecords, ...existing]));
      } catch {}

      const shareType = target.type === "meeting" ? "meeting" : "event";
      const firstImg = urls[0];

      await executeShare(
        {
          type: shareType as any,
          id: target.id,
          title: `[CEO 1983] Khoảnh khắc: ${target.title}`,
          desc: note.trim() || `Hình ảnh khoảnh khắc trực tiếp tại ${target.title} - CLB Doanh Nhân CEO 1983.`,
          image: firstImg,
          targetPath: `/share/${shareType}/${target.id}`,
        },
        () => toast.success("Đã sao chép liên kết chia sẻ ra ngoài!")
      );

      toast.success("Đã chuẩn bị thông tin chia sẻ ra ngoài ứng dụng!");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi chia sẻ ra ngoài");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-white/15 p-5 text-slate-900 dark:text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-[#003B95]/10 dark:bg-white/10 text-[#003B95] dark:text-white flex items-center justify-center border border-[#003B95]/20 dark:border-white/20">
              <Camera className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Chụp &amp; Tải Ảnh Khoảnh Khắc
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {target.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="size-8 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Input ẩn phục vụ chụp trực tiếp và chọn tệp */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          className="hidden"
          onChange={(e) => handleFilesChosen(e.target.files)}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFilesChosen(e.target.files)}
        />

        {/* Body content */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {/* Action triggers: Chụp ảnh & Tải ảnh */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => cameraInputRef.current?.click()}
              className="py-3 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-xs"
            >
              <Camera className="size-4" />
              <span>Chụp ảnh ngay</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-3.5 rounded-2xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Upload className="size-4" />
              <span>Tải ảnh từ máy</span>
            </button>
          </div>

          {/* Previews grid */}
          {filePreviews.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-white flex items-center justify-between">
                <span>Ảnh đã chọn ({filePreviews.length}/5)</span>
                <span className="text-[10px] text-slate-400">Bấm X để xóa ảnh</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filePreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-neutral-900 group"
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 size-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950 flex flex-col items-center justify-center text-center gap-2">
              <div className="size-11 rounded-2xl bg-slate-100 dark:bg-neutral-900 text-slate-400 dark:text-white flex items-center justify-center">
                <ImageIcon className="size-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-white">
                Chưa có ảnh nào được chọn
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 max-w-xs">
                Hãy bấm "Chụp ảnh ngay" để bắt trọn khoảnh khắc diễn ra, hoặc tải ảnh từ thư viện.
              </p>
            </div>
          )}

          {/* Caption input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-white block">
              Ghi chú / Cảm nghĩ khoảnh khắc
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isProcessing}
              placeholder="Nhập đôi dòng chia sẻ hoặc cảm nhận về sự kiện/cuộc họp..."
              rows={2}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#003B95] dark:focus:ring-white/40"
            />
          </div>

          {/* Status feedback */}
          {isProcessing && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-[#003B95] dark:text-blue-400" />
              <span>{statusMessage || "Đang xử lý dữ liệu..."}</span>
            </div>
          )}
        </div>

        {/* Action Footer with 2 distinct workflows: Lưu tại sự kiện & Chia sẻ */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Lựa chọn 1: Lưu tại chính sự kiện */}
            <button
              type="button"
              disabled={isProcessing || selectedFiles.length === 0}
              onClick={handleSaveToEvent}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>1. Lưu tại sự kiện</span>
            </button>

            {/* Lựa chọn 2A: Chia sẻ lên màn Mạng lưới */}
            <button
              type="button"
              disabled={isProcessing || selectedFiles.length === 0}
              onClick={handleShareToNetwork}
              className="py-2.5 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <MessageSquare className="size-3.5" />
              <span>2. Share Mạng lưới</span>
            </button>
          </div>

          {/* Lựa chọn 2B: Chia sẻ ra ngoài ứng dụng */}
          <button
            type="button"
            disabled={isProcessing || selectedFiles.length === 0}
            onClick={handleShareOutside}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/20 text-[#003B95] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="size-3.5 text-amber-500" />
            <span>Chia sẻ ra ngoài ứng dụng (Zalo / Facebook / Link)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
