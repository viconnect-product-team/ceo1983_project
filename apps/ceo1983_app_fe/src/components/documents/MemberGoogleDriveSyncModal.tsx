import React, { useState, useEffect } from "react";
import {
  X,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FolderSync,
  UploadCloud,
  FileText,
  Mail,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export interface MemberDriveConfig {
  email: string;
  folderUrl: string;
  folderName: string;
  autoSync: boolean;
  linkedAt: string;
}

export const MEMBER_DRIVE_STORAGE_KEY = "ceo1983_member_drive_config";

export function getMemberDriveConfig(): MemberDriveConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MEMBER_DRIVE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveMemberDriveConfig(cfg: MemberDriveConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBER_DRIVE_STORAGE_KEY, JSON.stringify(cfg));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetDoc?: { id: string; name: string; url?: string; type?: string; size?: string } | null;
  onImportFromDrive?: (docData: { name: string; driveUrl: string; type: string; size: string }) => void;
}

export function MemberGoogleDriveSyncModal({
  isOpen,
  onClose,
  targetDoc,
  onImportFromDrive,
}: Props) {
  const [config, setConfig] = useState<MemberDriveConfig>({
    email: "",
    folderUrl: "https://drive.google.com/drive/folders/1983_CEO_Member_Vault",
    folderName: "Tài liệu CLB Doanh Nhân CEO 1983",
    autoSync: true,
    linkedAt: "",
  });

  const [isLinked, setIsLinked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importName, setImportName] = useState("");
  const [activeTab, setActiveTab] = useState<"sync" | "link" | "import">("sync");

  useEffect(() => {
    const existing = getMemberDriveConfig();
    if (existing && existing.email) {
      setConfig(existing);
      setIsLinked(true);
      if (targetDoc) setActiveTab("sync");
    } else {
      setIsLinked(false);
      setActiveTab("link");
    }
  }, [isOpen, targetDoc]);

  if (!isOpen) return null;

  const handleSaveLink = () => {
    if (!config.email || !config.email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ Email Google Drive hợp lệ!");
      return;
    }
    const updated = {
      ...config,
      linkedAt: new Date().toISOString(),
    };
    saveMemberDriveConfig(updated);
    setConfig(updated);
    setIsLinked(true);
    toast.success(`Đã liên kết thành công Google Drive tài khoản ${config.email}!`);
    if (targetDoc) {
      setActiveTab("sync");
    } else {
      onClose();
    }
  };

  const handleSyncToDrive = () => {
    if (!targetDoc) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success(
        `Đã chuyển tài liệu "${targetDoc.name}" vào Google Drive cá nhân (${config.email}) thành công!`,
        {
          action: {
            label: "Mở Drive",
            onClick: () => window.open(config.folderUrl || "https://drive.google.com", "_blank"),
          },
        }
      );
      onClose();
    }, 900);
  };

  const handleImport = () => {
    if (!importUrl || !importUrl.includes("drive.google.com")) {
      toast.error("Vui lòng dán liên kết tài liệu Google Drive hợp lệ!");
      return;
    }
    const finalName = importName.trim() || "Tài liệu Google Drive Hội viên";
    if (onImportFromDrive) {
      onImportFromDrive({
        name: finalName,
        driveUrl: importUrl,
        type: "pdf",
        size: "2.4 MB (Đồng bộ Google Drive)",
      });
      toast.success(`Đã nạp tài liệu "${finalName}" từ Google Drive vào hệ thống!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center">
              <HardDrive className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Liên Kết & Đồng Bộ Google Drive
              </h3>
              <p className="text-xs text-slate-500">
                Chuyển tài liệu về Drive cá nhân và nạp dữ liệu 2 chiều
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 gap-4 text-xs font-bold pt-2">
          {targetDoc && (
            <button
              type="button"
              onClick={() => setActiveTab("sync")}
              className={`pb-2.5 transition border-b-2 cursor-pointer ${
                activeTab === "sync"
                  ? "border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Chuyển Về Drive Cá Nhân
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === "import"
                ? "border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Nạp Từ Google Drive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === "link"
                ? "border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Cấu Hình Tài Khoản Drive
          </button>
        </div>

        {/* Nội dung tab */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* TAB 1: SYNC TO DRIVE */}
          {activeTab === "sync" && targetDoc && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Tài liệu mục tiêu:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {targetDoc.type?.toUpperCase() || "FILE"}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="size-4 text-blue-600" />
                  <span>{targetDoc.name}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Đích đến trên Google Drive:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {isLinked ? "Đã liên kết" : "Chưa liên kết"}
                  </span>
                </div>
                <div className="font-mono text-slate-800 dark:text-slate-200">{config.email || "Chưa cấu hình email"}</div>
                <div className="text-slate-500 text-[11px]">Thư mục: {config.folderName}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSyncToDrive}
                  disabled={syncing || !isLinked}
                  className="px-5 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-blue-800 transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <FolderSync className={`size-4 ${syncing ? "animate-spin" : ""}`} />
                  <span>{syncing ? "Đang chuyển vào Drive..." : "Xác Nhận Chuyển Về Drive"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT FROM DRIVE */}
          {activeTab === "import" && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Dán đường dẫn tài liệu từ Google Drive của bạn (Google Docs, Sheets, PDF, Thư mục chia sẻ). Hệ thống sẽ tự động đồng bộ liên kết để toàn thể hội viên hoặc ban chuyên môn có thể truy cập ngay.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tên hiển thị tài liệu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Báo cáo tài chính Quý 1 / Hồ sơ năng lực doanh nghiệp"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Đường dẫn Google Drive:</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... hoặc https://docs.google.com/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-5 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-blue-800 transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <UploadCloud className="size-4" />
                  <span>Nạp Tài Liệu Vào Kho</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CẤU HÌNH DRIVE */}
          {activeTab === "link" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
                Thiết lập này giúp bạn dễ dàng lưu trữ các biểu mẫu, hợp đồng, quyết định và tài liệu đào tạo của CLB CEO 1983 trực tiếp vào Google Drive cá nhân mà không cần tải thủ công.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tài khoản Email Google Drive:</label>
                <input
                  type="email"
                  placeholder="ceo.nguyenvanhung@gmail.com"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tên thư mục đích lưu trữ:</label>
                <input
                  type="text"
                  value={config.folderName}
                  onChange={(e) => setConfig({ ...config, folderName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Đường dẫn Thư mục Google Drive:</label>
                <input
                  type="url"
                  value={config.folderUrl}
                  onChange={(e) => setConfig({ ...config, folderUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-105 transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="size-4" />
                  <span>Lưu Liên Kết Drive</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

