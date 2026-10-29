import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Upload,
  Link as LinkIcon,
  Folder,
  Plus,
  Check,
  Shield,
  Building,
  Globe,
  Lock,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { type Document } from "@/lib/documents.functions";
import { getNestApiUrl } from "@/lib/api-client";

interface DriveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  currentFolderId: string | null;
  currentFolderName?: string;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onSave: (values: any) => Promise<void>;
  isLeaderOrAdmin: boolean;
}

export const DriveDocumentModal: React.FC<DriveDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentFolderId,
  currentFolderName = "Thư mục gốc",
  categories,
  onAddCategory,
  onSave,
  isLeaderOrAdmin,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Biểu mẫu chung");
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");

  const [docScope, setDocScope] = useState<"association" | "enterprise">("association");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState("");
  const [fileType, setFileType] = useState<string>("pdf");
  const [fileSize, setFileSize] = useState("");
  const [uploader, setUploader] = useState("");

  const [shareScope, setShareScope] = useState<"public" | "internal" | "specific" | "private">("public");
  const [shareRole, setShareRole] = useState<"viewer" | "downloader" | "editor">("viewer");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setName(doc.name || "");
      setCategory(doc.category || "Biểu mẫu chung");
      setDocScope((doc.docScope as any) || "association");
      setEnterpriseName(doc.enterpriseName || "");
      setDriveUrl(doc.driveUrl || "");
      setFilePath(doc.filePath || "");
      setFileType(doc.type || "pdf");
      setFileSize(doc.size || "");
      setUploader(doc.uploadedBy || "");
      setShareScope((doc.shareScope as any) || "public");
      setShareRole((doc.shareRole as any) || "viewer");
    } else {
      setName("");
      setCategory(categories[0] || "Biểu mẫu chung");
      setDocScope("association");
      setEnterpriseName("");
      setDriveUrl("");
      setFile(null);
      setFilePath("");
      setFileType("pdf");
      setFileSize("");
      setUploader("");
      setShareScope("public");
      setShareRole("viewer");
    }
    setIsAddingNewCat(false);
    setNewCatInput("");
  }, [doc, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddCategorySubmit = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    onAddCategory(trimmed);
    setCategory(trimmed);
    setIsAddingNewCat(false);
    setNewCatInput("");
    toast.success(`Đã thêm danh mục mới: "${trimmed}"`);
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    if (!name.trim()) {
      // Tự động điền tên tài liệu theo tên file (bỏ phần mở rộng)
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(fileNameWithoutExt);
    }
    const ext = (selectedFile.name.split(".").pop() ?? "").toLowerCase();
    setFileType(ext || "other");

    const sizeStr =
      selectedFile.size >= 1048576
        ? `${(selectedFile.size / 1048576).toFixed(1)} MB`
        : `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`;
    setFileSize(sizeStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tiêu đề tài liệu!");
      return;
    }

    if (docScope === "association" && !isLeaderOrAdmin) {
      toast.error("Tài liệu của Hiệp Hội chỉ có Quản trị, Chủ tịch và các Trưởng ban mới có quyền quản lý!");
      return;
    }

    setSaving(true);
    try {
      let finalFilePath = filePath;

      // Nếu có tệp mới được chọn từ máy, tiến hành upload trước
      if (file) {
        setUploading(true);
        const toastId = toast.loading(`Đang tải lên tệp: ${file.name}...`);
        try {
          const formData = new FormData();
          formData.append("file", file);
          const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
          const headers = new Headers();
          if (token) headers.set("Authorization", `Bearer ${token}`);

          const response = await fetch(getNestApiUrl("/upload/file"), {
            method: "POST",
            body: formData,
            headers,
          });

          if (!response.ok) throw new Error("Upload failed: " + response.statusText);
          const resData = await response.json();
          finalFilePath = resData.url;
          toast.success("Tải tệp lên thành công!", { id: toastId });
        } catch (err: any) {
          toast.error("Không thể tải tệp lên: " + (err.message || ""), { id: toastId });
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      await onSave({
        name: name.trim(),
        category,
        docScope,
        enterpriseName: docScope === "enterprise" ? enterpriseName.trim() : undefined,
        driveUrl: driveUrl.trim() || undefined,
        filePath: finalFilePath,
        type: fileType,
        size: fileSize || "—",
        uploadedBy: uploader.trim() || "Thành viên CEO 1983",
        folderId: doc ? doc.folderId : currentFolderId,
        shareScope,
        shareRole,
        isFolder: false,
      });

      onClose();
    } catch (err: any) {
      toast.error("Không thể lưu tài liệu: " + (err.message || "Lỗi không xác định"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {doc ? "Chỉnh sửa tài liệu" : "Tạo & Tải lên tài liệu mới"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Folder className="h-3.5 w-3.5 text-amber-500" />
                <span>Vị trí: <strong>{currentFolderName}</strong></span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Tiêu đề tài liệu tự do */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Tên / Tiêu đề tài liệu <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên tiêu đề tài liệu tùy ý (Ví dụ: Quy chế bầu cử BĐH 2026, Hợp đồng tài trợ...)"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Danh mục: Cho phép chọn có sẵn HOẶC tự nhập danh mục mới */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ban phụ trách / Danh mục tài liệu <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isAddingNewCat ? "Chọn từ danh mục có sẵn" : "+ Tự thêm danh mục mới"}</span>
              </button>
            </div>

            {isAddingNewCat ? (
              <div className="flex items-center gap-2 animate-in fade-in">
                <input
                  type="text"
                  autoFocus
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Gõ tên danh mục mới của bạn..."
                  className="flex-1 rounded-xl border border-primary/50 bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleAddCategorySubmit}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer"
                >
                  Lưu danh mục
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setIsAddingNewCat(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__add_new__">➕ [+ Tự thêm danh mục mới...]</option>
              </select>
            )}
          </div>

          {/* Phân loại tài liệu & Tên doanh nghiệp nếu là tài liệu DN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Phân loại tài liệu
              </label>
              <select
                value={docScope}
                onChange={(e) => setDocScope(e.target.value as "association" | "enterprise")}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="association">🏛️ Tài liệu Hiệp Hội (Ban Điều Hành)</option>
                <option value="enterprise">🏢 Tài liệu Doanh Nghiệp (Thành viên)</option>
              </select>
            </div>

            {docScope === "enterprise" && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tên Doanh nghiệp sở hữu
                </label>
                <input
                  type="text"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Viconnect..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Tệp đính kèm trực tiếp từ máy (Upload chuẩn) */}
          <div className="p-3.5 rounded-2xl border border-border bg-muted/30 space-y-2">
            <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" />
              <span>Tệp đính kèm tải lên từ máy tính (Tối đa 500MB)</span>
            </label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileSelect(f);
              }}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {file && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <Check className="h-3.5 w-3.5" />
                <span>Đã chọn: {file.name} ({fileSize})</span>
              </div>
            )}
            {filePath && !file && (
              <div className="text-xs text-muted-foreground truncate">
                Tệp hiện tại: <span className="font-semibold">{filePath}</span>
              </div>
            )}
          </div>

          {/* Hoặc Liên kết Google Drive */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-emerald-600" />
              <span>Đường dẫn Google Drive (Link Driver - Tùy chọn)</span>
            </label>
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... hoặc link thư mục Drive"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Cấu hình chia sẻ chuẩn Google Drive */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-blue-600" />
                <span>Phạm vi chia sẻ (Chuẩn Google Drive)</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: "public", label: "🌐 Công khai", desc: "Toàn bộ CLB" },
                { id: "internal", label: "🏛️ Nội bộ", desc: "Chỉ BĐH" },
                { id: "specific", label: "👥 Chỉ định", desc: "Người chỉ định" },
                { id: "private", label: "🔒 Riêng tư", desc: "Chỉ mình tôi" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShareScope(s.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    shareScope === s.id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-80">{s.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Quyền hạn đối với người nhận:</span>
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold focus:outline-none"
              >
                <option value="viewer">👁️ Người xem (Chỉ đọc)</option>
                <option value="downloader">📥 Người tải xuống</option>
                <option value="editor">✏️ Người chỉnh sửa</option>
              </select>
            </div>
          </div>

          {/* Footer nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving || uploading || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2 text-sm font-bold text-primary-foreground shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving || uploading ? "Đang lưu..." : doc ? "Cập nhật tài liệu" : "Tạo tài liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

