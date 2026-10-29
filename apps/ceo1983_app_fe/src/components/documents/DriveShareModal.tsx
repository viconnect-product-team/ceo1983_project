import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Lock,
  Globe,
  Building,
  Users,
  Copy,
  Check,
  Shield,
  Eye,
  Download,
  Edit3,
  UserCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { type Document } from "@/lib/documents.functions";

interface DriveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSaveShare: (id: string, scope: "public" | "internal" | "specific" | "private", role: "viewer" | "downloader" | "editor", sharedWith: any[]) => Promise<void>;
  members?: Array<{ id: string; name: string; email?: string; company?: string; department?: string }>;
}

const DEPARTMENTS = [
  "Ban Điều Hành",
  "Ban Thư Ký",
  "Ban Thành Viên",
  "Ban Truyền Thông",
  "Ban Xúc Tiến",
  "Ban Tài Chính",
  "Ban Thiện Nguyện",
  "Toàn thể Hội viên chính thức",
];

export const DriveShareModal: React.FC<DriveShareModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSaveShare,
  members = [],
}) => {
  const [scope, setScope] = useState<"public" | "internal" | "specific" | "private">("public");
  const [role, setRole] = useState<"viewer" | "downloader" | "editor">("viewer");
  const [sharedList, setSharedList] = useState<Array<{ id: string; name: string; type: "member" | "dept"; role: string }>>([]);
  const [searchMember, setSearchMember] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setScope((doc.shareScope as any) || "public");
      setRole((doc.shareRole as any) || "viewer");
      if (Array.isArray(doc.sharedWith)) {
        setSharedList(doc.sharedWith);
      } else {
        setSharedList([]);
      }
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareLink = `${origin}/documents?docId=${doc.id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      toast.success("Đã sao chép đường liên kết chia sẻ vào clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleAddMember = (m: { id: string; name: string }) => {
    if (sharedList.some((item) => item.id === m.id)) {
      toast.error("Thành viên này đã có trong danh sách!");
      return;
    }
    setSharedList([...sharedList, { id: m.id, name: m.name, type: "member", role: "viewer" }]);
    setSearchMember("");
    toast.success(`Đã thêm ${m.name}`);
  };

  const handleAddDept = (deptName: string) => {
    if (sharedList.some((item) => item.id === deptName)) {
      toast.error("Ban/Nhóm này đã có trong danh sách!");
      return;
    }
    setSharedList([...sharedList, { id: deptName, name: deptName, type: "dept", role: "viewer" }]);
    toast.success(`Đã thêm ${deptName}`);
  };

  const handleRemoveShared = (id: string) => {
    setSharedList(sharedList.filter((item) => item.id !== id));
  };

  const handleUpdateItemRole = (id: string, newRole: string) => {
    setSharedList(
      sharedList.map((item) => (item.id === id ? { ...item, role: newRole } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveShare(doc.id, scope, role, sharedList);
      toast.success("Đã cập nhật phạm vi và quyền chia sẻ thành công!");
      onClose();
    } catch (err: any) {
      toast.error("Không thể lưu quyền chia sẻ: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = searchMember.trim()
    ? members.filter(
        (m) =>
          m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
          m.email?.toLowerCase().includes(searchMember.toLowerCase()) ||
          m.company?.toLowerCase().includes(searchMember.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header chuẩn Google Drive */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">
                Chia sẻ "{doc.name}"
              </h2>
              <p className="text-xs text-muted-foreground">
                {doc.isFolder ? "Thư mục" : "Tệp tài liệu"} • Cấu hình phạm vi truy cập như Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* 1. Thêm người hoặc nhóm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Thêm người hoặc Ban chuyên môn
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Nhập tên hội viên, email hoặc chọn Ban bệ bên dưới..."
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Gợi ý hội viên khi gõ */}
            {filteredMembers.length > 0 && (
              <div className="mt-2 rounded-xl border border-border bg-background p-1.5 shadow-lg space-y-1">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleAddMember(m)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.company || m.email || "Hội viên CLB"}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      + Thêm
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add Ban Chuyên Môn */}
            <div className="mt-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                Chọn nhanh theo Ban bệ CLB:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEPARTMENTS.slice(0, 5).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleAddDept(dept)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2 py-1 text-xs font-medium text-foreground hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{dept}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Danh sách người có quyền truy cập */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Những người có quyền truy cập ({1 + sharedList.length})
            </label>
            <div className="divide-y divide-border/60 rounded-xl border border-border bg-background overflow-hidden">
              {/* Chủ sở hữu */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                    {(doc.uploadedBy || "QT")[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {doc.uploadedBy || "Quản trị CLB"}
                    </div>
                    <div className="text-xs text-muted-foreground">Chủ sở hữu tài liệu</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground px-2 py-1 bg-muted rounded-md">
                  Chủ sở hữu
                </span>
              </div>

              {/* Danh sách được cấp quyền */}
              {sharedList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-xs">
                      {item.type === "dept" ? <Users className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.type === "dept" ? "Ban bệ nội bộ" : "Hội viên được chỉ định"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.role}
                      onChange={(e) => handleUpdateItemRole(item.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="viewer">Người xem</option>
                      <option value="downloader">Người tải xuống</option>
                      <option value="editor">Người chỉnh sửa</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveShared(item.id)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      title="Xóa quyền"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Quyền truy cập chung (General access) */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Quyền truy cập chung
            </label>
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {scope === "public" && <Globe className="h-4 w-4" />}
                    {scope === "internal" && <Building className="h-4 w-4" />}
                    {scope === "specific" && <Users className="h-4 w-4" />}
                    {scope === "private" && <Lock className="h-4 w-4" />}
                  </div>
                  <div>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as any)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1 text-sm font-bold text-foreground focus:border-amber-500 focus:outline-none"
                    >
                      <option value="public">🌐 Bất kỳ ai có đường liên kết</option>
                      <option value="internal">🏛️ Nội bộ CLB Doanh Nhân CEO 1983</option>
                      <option value="specific">👥 Chỉ những người được chỉ định ở trên</option>
                      <option value="private">🔒 Riêng tư (Chỉ riêng người tạo và Admin)</option>
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {scope === "public" && "Bất kỳ ai trên Internet có đường liên kết này đều có thể truy cập."}
                      {scope === "internal" && "Chỉ thành viên đã đăng nhập thuộc CLB Doanh Nhân CEO 1983 mới có thể mở."}
                      {scope === "specific" && "Chỉ những người hoặc Ban chuyên môn được thêm vào danh sách ở trên mới có thể truy cập."}
                      {scope === "private" && "Chỉ tài khoản của bạn và Quản trị viên cấp cao mới xem được."}
                    </p>
                  </div>
                </div>

                {/* Vai trò cho quyền truy cập chung */}
                {scope !== "private" && (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none shrink-0"
                  >
                    <option value="viewer">Người xem</option>
                    <option value="downloader">Người tải xuống</option>
                    <option value="editor">Người chỉnh sửa</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer chuẩn Google Drive */}
        <div className="flex items-center justify-between border-t border-border/80 px-6 py-4 bg-muted/20">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition-colors shadow-2xs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            <span>{copied ? "Đã sao chép!" : "Sao chép đường liên kết"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 cursor-pointer transition-all"
            >
              {saving ? "Đang lưu..." : "Xong"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

