import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Film,
  Globe,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

export interface LiveActivityMediaSectionProps {
  activityType: "event" | "meeting" | "training" | "connect";
  activityId: string;
  activityTitle: string;
  canPushToFeed?: boolean;
  className?: string;
  onMediaUploaded?: (urls: string[], pushedToFeed: boolean) => void;
}

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  note?: string;
  createdAt: string;
  authorName?: string;
}

export const LiveActivityMediaSection: React.FC<LiveActivityMediaSectionProps> = ({
  activityType,
  activityId,
  activityTitle,
  canPushToFeed = true,
  className = "",
  onMediaUploaded,
}) => {
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    Array<{ file: File; previewUrl: string; isVideo: boolean }>
  >([]);
  const [note, setNote] = useState("");
  const [pushToFeed, setPushToFeed] = useState(canPushToFeed);
  const [isUploading, setIsUploading] = useState(false);

  // Lịch sử ảnh/video đã tải lên cho hoạt động này
  const [historyMedia, setHistoryMedia] = useState<MediaItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const storageKey = `live_media_${activityType}_${activityId}`;

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHistoryMedia(JSON.parse(saved));
      }
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, [activityId, activityType]);

  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const currentImages = selectedFiles.filter((f) => f.type.startsWith("image/"));
    const currentVideos = selectedFiles.filter((f) => f.type.startsWith("video/"));

    const newImages = newFiles.filter((f) => f.type.startsWith("image/"));
    const newVideos = newFiles.filter((f) => f.type.startsWith("video/"));

    if (currentImages.length + newImages.length > 5) {
      toast.error("Giới hạn tối đa 5 ảnh cho mỗi đợt đính kèm khoảnh khắc!");
      return;
    }

    if (currentVideos.length + newVideos.length > 1) {
      toast.error("Mỗi đợt chỉ được đính kèm tối đa 1 video!");
      return;
    }

    const combined = [...selectedFiles, ...newFiles];
    setSelectedFiles(combined);

    // Tạo preview URL
    const newPreviews = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const target = filePreviews[index];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndSave = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chụp ảnh hoặc chọn tệp ảnh/video trước khi lưu!");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const url = await uploadFileToNest(file, `live_${activityType}`);
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length === 0) {
        throw new Error("Không thể tải tệp lên máy chủ");
      }

      // Lưu vào Lịch sử
      const newItems: MediaItem[] = uploadedUrls.map((u, idx) => ({
        id: `media-${Date.now()}-${idx}`,
        url: u,
        type: selectedFiles[idx]?.type.startsWith("video/") ? "video" : "image",
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
        authorName: user?.name || user?.email || "Ban Tổ Chức",
      }));

      const updatedHistory = [...newItems, ...historyMedia];
      setHistoryMedia(updatedHistory);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      } catch {}

      // Nếu có quyền và chọn Đẩy sang màn mạng lưới (Feed)
      let pushed = false;
      if (pushToFeed && canPushToFeed) {
        try {
          const typeLabelMap = {
            event: "Sự kiện",
            meeting: "Cuộc họp",
            training: "Chương trình đào tạo",
            connect: "Giao lưu kết nối B2B",
          };
          const typeName = typeLabelMap[activityType] || "Hoạt động";
          const feedContent = `📸 [Khoảnh khắc trực tiếp: ${typeName}] ${activityTitle}\n${
            note.trim() ? `\n"${note.trim()}"\n` : ""
          }\n✨ Tư liệu hình ảnh & video ghi nhận trực tiếp trong quá trình diễn ra.`;

          await fetchNestApi("/feed", {
            method: "POST",
            body: JSON.stringify({
              title: `Khoảnh khắc trực tiếp: ${activityTitle}`,
              content: feedContent,
              category: "EVENT_MEETING",
              images: uploadedUrls.filter((u) => !u.match(/\.(mp4|mov|avi|webm)$/i)),
            }),
          });
          pushed = true;
          toast.success("Đã đẩy khoảnh khắc trực tiếp lên Mạng lưới Hiệp hội thành công!");
        } catch (feedErr) {
          console.warn("Push to feed error:", feedErr);
        }
      }

      toast.success(
        `Đã lưu ${uploadedUrls.length} ảnh/video vào lịch sử ${
          pushed ? "và chia sẻ lên Mạng lưới!" : "thành công!"
        }`
      );

      // Dọn dẹp form
      filePreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setSelectedFiles([]);
      setFilePreviews([]);
      setNote("");

      onMediaUploaded?.(uploadedUrls, pushed);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tải ảnh/video lên máy chủ!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="size-4 text-[#003B95] dark:text-blue-400" />
            <span>Tư Liệu &amp; Khoảnh Khắc Trực Tiếp</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chụp ảnh trực tiếp hoặc tải ảnh / video (tối đa 5 ảnh + 1 video) lưu vào lịch sử hoạt động và đẩy lên Mạng lưới.
          </p>
        </div>

        {/* Input ẩn phục vụ chụp ảnh trực tiếp và chọn tệp */}
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
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFilesChosen(e.target.files)}
        />

        {/* 2 Nút chụp ảnh trực tiếp & tải ảnh/video */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Mở camera trên điện thoại chụp trực tiếp"
          >
            <Camera className="size-3.5" />
            <span>Chụp ảnh trực tiếp</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Chọn ảnh hoặc video từ máy"
          >
            <Upload className="size-3.5" />
            <span>Tải ảnh / Video</span>
          </button>
        </div>
      </div>

      {/* Danh sách ảnh/video đang chọn để tải lên */}
      {filePreviews.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Đã chọn: {filePreviews.length} tệp ({filePreviews.filter((p) => !p.isVideo).length} ảnh,{" "}
              {filePreviews.filter((p) => p.isVideo).length} video)
            </span>
            <span className="text-[11px] text-slate-400">Giới hạn: Tối đa 5 ảnh &amp; 1 video</span>
          </div>

          {/* Grid ảnh preview */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {filePreviews.map((p, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group"
              >
                {p.isVideo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                    <Film className="size-6 text-amber-400 mb-1" />
                    <span className="text-[9px] font-bold">VIDEO</span>
                  </div>
                ) : (
                  <img src={p.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition cursor-pointer"
                  title="Xóa tệp này"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Ghi chú khoảnh khắc */}
          <div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú khoảnh khắc (VD: Ban Thường Trực phát biểu khai mạc, ký kết hợp tác...)..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
            />
          </div>

          {/* Tùy chọn đẩy lên mạng lưới & Nút lưu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pushToFeed}
                onChange={(e) => setPushToFeed(e.target.checked)}
                disabled={!canPushToFeed}
                className="rounded border-slate-300 text-[#003B95] focus:ring-[#003B95] size-4"
              />
              <span className="flex items-center gap-1">
                <Globe className="size-3.5 text-blue-500" />
                <span>Đẩy khoảnh khắc này sang màn Mạng Lưới (Feed) của Hội viên</span>
              </span>
            </label>

            <button
              type="button"
              disabled={isUploading}
              onClick={handleUploadAndSave}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang tải lên máy chủ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Lưu Vào Lịch Sử {pushToFeed ? "& Đẩy Mạng Lưới" : ""}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lịch sử tư liệu đã ghi lại */}
      {historyMedia.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400" />
              <span>Tư liệu lịch sử đã lưu ({historyMedia.length} mục)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {historyMedia.map((m) => {
              const fullUrl = resolveMediaUrl(m.url) || m.url;
              return (
                <div
                  key={m.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-square flex flex-col justify-end p-2"
                >
                  {m.type === "video" ? (
                    <video src={fullUrl} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <img src={fullUrl} alt="History" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {m.note && (
                    <p className="relative z-10 text-[10px] text-white font-medium line-clamp-1">
                      {m.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

