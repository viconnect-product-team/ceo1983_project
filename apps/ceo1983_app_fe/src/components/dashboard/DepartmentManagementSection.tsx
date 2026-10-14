import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Users,
  Briefcase,
  Megaphone,
  Coins,
  HeartHandshake,
  Check,
  X,
  AlertTriangle,
  Info,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  DepartmentItem,
  getCustomDepartments,
  saveCustomDepartments,
  INITIAL_DEPARTMENTS,
  dispatchPermissionSyncEvent,
} from "@/lib/rbac-permission-helpers";

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/60",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800/60",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/60",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/60",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800/60",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/60",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/60",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
};

const AVAILABLE_COLORS = [
  { key: "blue", label: "Xanh dương" },
  { key: "purple", label: "Tím" },
  { key: "emerald", label: "Xanh lá" },
  { key: "amber", label: "Cam hổ phách" },
  { key: "rose", label: "Hồng cánh sen" },
  { key: "yellow", label: "Vàng kim" },
  { key: "teal", label: "Xanh mòng két" },
  { key: "indigo", label: "Chàm" },
];

function getDeptIcon(name: string, code: string) {
  const s = (name + " " + code).toLowerCase();
  if (s.includes("điều hành") || s.includes("bdh")) return Shield;
  if (s.includes("thư ký") || s.includes("btk")) return Calendar;
  if (s.includes("thành viên") || s.includes("btv")) return Users;
  if (s.includes("xúc tiến") || s.includes("bxt") || s.includes("thương mại")) return Briefcase;
  if (s.includes("truyền thông") || s.includes("btt")) return Megaphone;
  if (s.includes("tài chính") || s.includes("btc")) return Coins;
  if (s.includes("thiện nguyện") || s.includes("btn") || s.includes("từ thiện")) return HeartHandshake;
  return Building2;
}

export function DepartmentManagementSection() {
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => getCustomDepartments());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLeader, setFormLeader] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formColor, setFormColor] = useState("blue");

  // Sync state when local storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setDepartments(getCustomDepartments());
    };
    window.addEventListener("ceo1983_departments_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ceo1983_departments_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormName("");
    setFormCode("");
    setFormLeader("");
    setFormDesc("");
    setFormColor("blue");
    setModalOpen(true);
  };

  const openEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormLeader(dept.leaderName || "");
    setFormDesc(dept.description || "");
    setFormColor(dept.color || "blue");
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    // Auto-generate code if creating new
    if (!editingDept && !formCode) {
      const words = val.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const initials = words.map((w) => w[0]?.toUpperCase()).join("");
        setFormCode("B" + initials.replace(/^B/, ""));
      }
    }
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    const trimmedCode = formCode.trim().toUpperCase();

    if (!trimmedName) {
      toast.error("Vui lòng nhập tên Ban chuyên môn");
      return;
    }
    if (!trimmedCode) {
      toast.error("Vui lòng nhập mã viết tắt của Ban");
      return;
    }

    // Check duplicate code or name
    const isDuplicate = departments.some((d) => {
      if (editingDept && d.id === editingDept.id) return false;
      return (
        d.name.toLowerCase() === trimmedName.toLowerCase() ||
        d.code.toUpperCase() === trimmedCode
      );
    });

    if (isDuplicate) {
      toast.error("Tên Ban hoặc Mã Ban đã tồn tại trong hệ thống");
      return;
    }

    let updatedList: DepartmentItem[];

    if (editingDept) {
      // Update
      updatedList = departments.map((d) =>
        d.id === editingDept.id
          ? {
              ...d,
              name: trimmedName,
              code: trimmedCode,
              leaderName: formLeader.trim() || undefined,
              description: formDesc.trim() || undefined,
              color: formColor,
            }
          : d
      );
      toast.success(`Đã cập nhật thông tin ${trimmedName}`);
    } else {
      // Create new
      const newDept: DepartmentItem = {
        id: `dept_${Date.now()}`,
        name: trimmedName,
        code: trimmedCode,
        leaderName: formLeader.trim() || `Trưởng ban ${trimmedName.replace(/^Ban\s+/i, "")}`,
        description: formDesc.trim() || undefined,
        color: formColor,
        memberCount: 0,
      };
      updatedList = [...departments, newDept];
      toast.success(`Đã tạo ban mới: ${trimmedName}`);
    }

    setDepartments(updatedList);
    saveCustomDepartments(updatedList);
    dispatchPermissionSyncEvent();
    setModalOpen(false);
  };

  const handleDeleteDepartment = (dept: DepartmentItem) => {
    const updatedList = departments.filter((d) => d.id !== dept.id);
    setDepartments(updatedList);
    saveCustomDepartments(updatedList);
    dispatchPermissionSyncEvent();
    setDeleteConfirmDept(null);
    toast.success(`Đã xóa ban ${dept.name}`);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục về danh sách 7 Ban chuẩn của Hiệp hội CEO 1983?")) {
      setDepartments(INITIAL_DEPARTMENTS);
      saveCustomDepartments(INITIAL_DEPARTMENTS);
      dispatchPermissionSyncEvent();
      toast.info("Đã khôi phục danh sách Ban mặc định của CEO 1983");
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs space-y-5 transition-all">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#003B95]/10 text-[#003B95] dark:bg-[#003B95]/20 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Quản Lý Ban Chuyên Môn
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {departments.length} Ban
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cấu hình cơ cấu tổ chức Hiệp hội CEO 1983 (Ban Điều Hành &amp; các Ban chuyên môn, không có Ban Quản trị)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Khôi phục danh sách ban mặc định"
            className="px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
          >
            Khôi phục chuẩn
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white font-bold text-xs shadow-md shadow-[#003B95]/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tạo Ban Mới</span>
          </button>
        </div>
      </div>

      {/* Grid of departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {departments.map((dept) => {
          const colorTheme = COLOR_MAP[dept.color || "blue"] || COLOR_MAP.blue;
          const DeptIcon = getDeptIcon(dept.name, dept.code);

          return (
            <div
              key={dept.id}
              className={`group relative rounded-2xl border ${colorTheme.border} bg-card hover:bg-muted/10 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-xl ${colorTheme.bg} ${colorTheme.text} flex items-center justify-center shrink-0`}>
                      <DeptIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-tight group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition">
                        {dept.name}
                      </h3>
                      <span className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${colorTheme.badge} mt-0.5`}>
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => openEditModal(dept)}
                      title={`Chỉnh sửa ${dept.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmDept(dept)}
                      title={`Xóa ${dept.name}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {dept.leaderName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1.5">
                    <span className="text-foreground/70">Phụ trách:</span>
                    <span className="font-semibold text-foreground truncate">{dept.leaderName}</span>
                  </div>
                )}

                {dept.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600" />
                  Đang hoạt động
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/80">
                  ID: {dept.code.toLowerCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tạo Mới / Chỉnh Sửa Ban */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-[#003B95]/10 text-[#003B95] dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingDept ? "Chỉnh Sửa Ban Chuyên Môn" : "Tạo Ban Chuyên Môn Mới"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cấu hình tên ban, mã viết tắt và vai trò phụ trách
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Tên Ban Chuyên Môn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Ban Đào Tạo & Khởi Nghiệp"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Mã Viết Tắt (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: BDT"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-mono font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Màu Sắc Nhận Diện
                  </label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  >
                    {AVAILABLE_COLORS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Chức Danh Phụ Trách / Trưởng Ban
                </label>
                <input
                  type="text"
                  value={formLeader}
                  onChange={(e) => setFormLeader(e.target.value)}
                  placeholder="Ví dụ: Trưởng ban Đào tạo"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mô Tả &amp; Nhiệm Vụ Hoạt Động
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Mô tả chức năng, nhiệm vụ trọng tâm của ban trong hiệp hội..."
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Hiệp hội chuẩn hóa theo cơ cấu Ban Điều Hành và các Ban chuyên môn. Không sử dụng tên gọi "Ban Quản trị" hay "Trưởng ban quản trị".
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted font-medium text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {editingDept ? "Lưu Cập Nhật" : "Tạo Ban"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Ban */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border-2 border-rose-500/40 bg-card p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground">
                  Xác Nhận Xóa Ban
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Bạn có chắc chắn muốn xóa ban <strong className="text-foreground">{deleteConfirmDept.name}</strong> ({deleteConfirmDept.code}) khỏi hệ thống không?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteConfirmDept(null)}
                className="px-3.5 py-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted font-medium text-xs transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDepartment(deleteConfirmDept)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa Ban</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
