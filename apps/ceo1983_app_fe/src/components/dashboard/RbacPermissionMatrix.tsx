import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Users,
  Calendar,
  Vote,
  Gift,
  Award,
  DollarSign,
  Briefcase,
  ShoppingBag,
  FileText,
  Newspaper,
  Sliders,
  CheckSquare,
  Search,
  CheckCheck,
  Sparkles,
  Info,
  Video,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export interface PermissionFeature {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  iconName?: string;
  quanTri: { xem: boolean; sua: boolean; xoa: boolean; phanQuyen: boolean };
  admin: { xem: boolean; sua: boolean; phanQuyen: boolean };
  tongThuKy: { xem: boolean; sua: boolean };
  truongBan: { xem: boolean; sua: boolean };
  hoiVien: { xem: boolean };
}

export const INITIAL_FEATURES: PermissionFeature[] = [
  {
    id: "members",
    name: "Quản lý Hội viên & Hồ sơ",
    code: "FEAT_MEMBERS",
    category: "Hội viên & Ban bệ",
    description: "Quản lý danh bạ thành viên, thẩm định hồ sơ kết nạp và phân ban chuyên môn",
    iconName: "Users",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "tasks",
    name: "Quản lý Công việc (5 Dạng Views)",
    code: "FEAT_TASKS",
    category: "Hệ thống & Điều hành",
    description: "Điều phối 5 dạng hiển thị (Bảng, Kanban, Lịch, Timeline, Cây đơn vị) và họp trực tuyến",
    iconName: "CheckSquare",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "meetings",
    name: "Quản lý Cuộc họp (Zoom/Meet/UniWork)",
    code: "FEAT_MEETINGS",
    category: "Hệ thống & Điều hành",
    description: "Lên lịch họp trực tuyến & offline, xử lý cuộc họp đột ngột quan trọng và điều phối phòng họp",
    iconName: "Video",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "events",
    name: "Sự kiện & Điểm danh QR",
    code: "FEAT_EVENTS",
    category: "Sự kiện & Họp",
    description: "Tổ chức sự kiện hiệp hội, phát hành vé QR điểm danh, sơ đồ bàn VIP và họp ban",
    iconName: "Calendar",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "charity",
    name: "Ban Thiện Nguyện & An Sinh",
    code: "FEAT_CHARITY",
    category: "Thiện nguyện",
    description: "Các chiến dịch thiện nguyện vì cộng đồng, tiếp nhận đóng góp và báo cáo giải ngân",
    iconName: "Heart",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "fees",
    name: "Tài chính & Quỹ Hội Phí",
    code: "FEAT_FINANCE",
    category: "Tài chính & Quỹ",
    description: "Theo dõi dòng tiền thu chi, duyệt tạm ứng và thu hội phí thường niên",
    iconName: "DollarSign",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "opportunities",
    name: "Giao thương & Cơ hội B2B",
    code: "FEAT_OPPORTUNITIES",
    category: "Giao thương & B2B",
    description: "Đăng tải nhu cầu mua bán, tìm đối tác chiến lược và ghép nối giao thương nội bộ",
    iconName: "Briefcase",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "marketplace",
    name: "Gian hàng Sản phẩm Doanh nghiệp",
    code: "FEAT_MARKETPLACE",
    category: "Giao thương & B2B",
    description: "Trưng bày danh mục sản phẩm, dịch vụ và ưu đãi đặc quyền cho hội viên",
    iconName: "ShoppingBag",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "voting",
    name: "Bầu cử & Khen thưởng",
    code: "FEAT_VOTING",
    category: "Sự kiện & Họp",
    description: "Bỏ phiếu tín nhiệm, thông qua nghị quyết ban chấp hành và vinh danh doanh nhân tiêu biểu",
    iconName: "Vote",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "news",
    name: "Tin tức & Truyền thông Báo chí",
    code: "FEAT_NEWS",
    category: "Hệ thống & Điều hành",
    description: "Biên tập tin tức hoạt động, vinh danh thành viên tiêu biểu và thông cáo báo chí",
    iconName: "Newspaper",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: true, sua: true },
    truongBan: { xem: true, sua: true },
    hoiVien: { xem: true },
  },
  {
    id: "permissions",
    name: "Cài đặt & Cấu hình Hệ thống",
    code: "FEAT_SYSTEM",
    category: "Hệ thống & Điều hành",
    description: "Ma trận quyền truy cập, phân công vai trò điều hành và quản trị bảo mật",
    iconName: "Sliders",
    quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
    admin: { xem: true, sua: true, phanQuyen: true },
    tongThuKy: { xem: false, sua: false },
    truongBan: { xem: false, sua: false },
    hoiVien: { xem: false },
  },
];

const CATEGORIES = [
  "Tất cả",
  "Hội viên & Ban bệ",
  "Hệ thống & Điều hành",
  "Sự kiện & Họp",
  "Tài chính & Quỹ",
  "Giao thương & B2B",
  "Thiện nguyện",
];

const ICON_MAP: Record<string, any> = {
  Users,
  CheckSquare,
  Video,
  Calendar,
  Heart,
  DollarSign,
  Award,
  Briefcase,
  ShoppingBag,
  Vote,
  Gift,
  FileText,
  Newspaper,
  Sliders,
};

// 5 Vai trò chuẩn mực ở các Row bên trái
export type RoleKey = "quanTri" | "admin" | "tongThuKy" | "truongBan" | "hoiVien";

export interface RoleDefinition {
  key: RoleKey;
  name: string;
  badgeTitle: string;
  description: string;
  allowedActions: Array<"xem" | "sua" | "xoa" | "phanQuyen">;
  tagColor: string;
  badgeBg: string;
}

export const ROLES_LIST: RoleDefinition[] = [
  {
    key: "quanTri",
    name: "Quản trị",
    badgeTitle: "xem, sửa, xóa, phân quyền",
    description: "Toàn quyền tối cao quản trị nền tảng và thiết lập phân quyền",
    allowedActions: ["xem", "sua", "xoa", "phanQuyen"],
    tagColor: "text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    badgeBg: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200",
  },
  {
    key: "admin",
    name: "Admin",
    badgeTitle: "xem, sửa, phân quyền",
    description: "Vận hành hệ thống, điều phối tài nguyên và phân quyền thao tác",
    allowedActions: ["xem", "sua", "phanQuyen"],
    tagColor: "text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    badgeBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200",
  },
  {
    key: "tongThuKy",
    name: "Tổng thư ký",
    badgeTitle: "xem, sửa",
    description: "Điều phối Ban Thường vụ, kiểm duyệt nội dung, văn bản và lịch họp",
    allowedActions: ["xem", "sua"],
    tagColor: "text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200",
  },
  {
    key: "truongBan",
    name: "Trưởng ban",
    badgeTitle: "xem, sửa",
    description: "Bao gồm Ban Thiện Nguyện & An Sinh, Ban TT, Ban TV, Ban TC, Ban XT",
    allowedActions: ["xem", "sua"],
    tagColor: "text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200",
  },
  {
    key: "hoiVien",
    name: "Hội viên",
    badgeTitle: "xem",
    description: "Hội viên chính thức tham gia giao thương, sinh hoạt và kết nối",
    allowedActions: ["xem"],
    tagColor: "text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
  },
];

export function RbacPermissionMatrix() {
  const [features, setFeatures] = useState<PermissionFeature[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ceo1983_rbac_matrix_v3");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_FEATURES;
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isModified, setIsModified] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PermissionFeature | null>(null);
  const [newFeatureModal, setNewFeatureModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureCategory, setNewFeatureCategory] = useState("Hội viên & Ban bệ");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");

  // Lọc chức năng hiển thị ở đầu các column
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const matchSearch =
        feat.name.toLowerCase().includes(search.toLowerCase()) ||
        feat.code.toLowerCase().includes(search.toLowerCase()) ||
        (feat.description && feat.description.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCategory === "Tất cả" || feat.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [features, search, selectedCategory]);

  // Thống kê số lượng quyền được cấp cho từng vai trò
  const stats = useMemo(() => {
    return ROLES_LIST.map((role) => {
      let count = 0;
      let total = 0;
      features.forEach((feat) => {
        const rolePerms = feat[role.key] as any;
        if (rolePerms) {
          role.allowedActions.forEach((act) => {
            total++;
            if (rolePerms[act]) count++;
          });
        }
      });
      return {
        ...role,
        count,
        total,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }, [features]);

  // Toggle một thao tác cụ thể của một Role trên một Chức năng
  const toggleAction = (
    featureId: string,
    roleKey: RoleKey,
    action: "xem" | "sua" | "xoa" | "phanQuyen"
  ) => {
    setFeatures((prev) =>
      prev.map((feat) => {
        if (feat.id !== featureId) return feat;
        const currentRolePerms = { ...feat[roleKey] } as any;
        return {
          ...feat,
          [roleKey]: {
            ...currentRolePerms,
            [action]: !currentRolePerms[action],
          },
        };
      })
    );
    setIsModified(true);
  };

  // Bật tất cả quyền của một Role trên toàn bộ các Chức năng
  const toggleRoleAll = (roleKey: RoleKey, enable: boolean) => {
    const roleDef = ROLES_LIST.find((r) => r.key === roleKey);
    if (!roleDef) return;

    setFeatures((prev) =>
      prev.map((feat) => {
        const updatedRolePerms = { ...feat[roleKey] } as any;
        roleDef.allowedActions.forEach((act) => {
          updatedRolePerms[act] = enable;
        });
        return {
          ...feat,
          [roleKey]: updatedRolePerms,
        };
      })
    );
    setIsModified(true);
    toast.success(
      enable
        ? `Đã bật tất cả quyền cho vai trò ${roleDef.name}`
        : `Đã tắt tất cả quyền cho vai trò ${roleDef.name}`
    );
  };

  // Cấp toàn quyền cho 1 Cột Chức năng
  const setColumnAll = (featureId: string, enable: boolean) => {
    setFeatures((prev) =>
      prev.map((feat) => {
        if (feat.id !== featureId) return feat;
        return {
          ...feat,
          quanTri: { xem: enable, sua: enable, xoa: enable, phanQuyen: enable },
          admin: { xem: enable, sua: enable, phanQuyen: enable },
          tongThuKy: { xem: enable, sua: enable },
          truongBan: { xem: enable, sua: enable },
          hoiVien: { xem: enable },
        };
      })
    );
    setIsModified(true);
  };

  // Xóa một Cột Chức năng khỏi ma trận
  const handleDeleteFeature = (featureId: string, featureName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cột chức năng "${featureName}" khỏi ma trận không?`))
      return;
    setFeatures((prev) => prev.filter((f) => f.id !== featureId));
    setIsModified(true);
    toast.success(`Đã xóa cột chức năng "${featureName}"`);
  };

  // Lưu ma trận
  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo1983_rbac_matrix_v3", JSON.stringify(features));
    }
    setIsModified(false);
    toast.success("✓ Đã lưu thành công Ma trận Phân quyền 5 Cấp bậc & Thao tác!");
  };

  // Khôi phục mặc định
  const handleReset = () => {
    if (!window.confirm("Khôi phục ma trận phân quyền về cấu hình mặc định chuẩn CEO 1983?")) return;
    setFeatures(INITIAL_FEATURES);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ceo1983_rbac_matrix_v3");
    }
    setIsModified(false);
    toast.info("Đã khôi phục ma trận phân quyền về mặc định.");
  };

  // Thêm chức năng mới (Cột mới)
  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) {
      toast.error("Vui lòng nhập tên chức năng");
      return;
    }

    const newId = `custom_${Date.now()}`;
    const newCode = `FEAT_${newFeatureName
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "_")
      .slice(0, 16)}`;

    const newFeat: PermissionFeature = {
      id: newId,
      name: newFeatureName.trim(),
      code: newCode,
      category: newFeatureCategory,
      description: newFeatureDescription.trim() || "Chức năng tùy biến mới",
      iconName: "Sliders",
      quanTri: { xem: true, sua: true, xoa: true, phanQuyen: true },
      admin: { xem: true, sua: true, phanQuyen: true },
      tongThuKy: { xem: true, sua: true },
      truongBan: { xem: true, sua: true },
      hoiVien: { xem: true },
    };

    setFeatures((prev) => [newFeat, ...prev]);
    setNewFeatureModal(false);
    setNewFeatureName("");
    setNewFeatureDescription("");
    setIsModified(true);
    toast.success(`Đã thêm thành công cột chức năng: ${newFeat.name}`);
  };

  // Cập nhật tên chức năng
  const handleUpdateFeatureName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature || !editingFeature.name.trim()) return;

    setFeatures((prev) =>
      prev.map((f) => (f.id === editingFeature.id ? { ...f, name: editingFeature.name.trim() } : f))
    );
    setEditingFeature(null);
    setIsModified(true);
    toast.success("Đã cập nhật tên chức năng.");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card & Thống kê 5 Cấp Bậc */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#003B95] text-white shadow-md">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Ma Trận Phân Quyền 5 Cấp Bậc & Thao Tác Chi Tiết
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bên trái là <span className="font-bold text-foreground">5 vai trò cốt lõi</span>, ở đầu các cột là{" "}
                  <span className="font-bold text-foreground">các chức năng riêng lẻ</span>. Từng ô chứa thao tác tương ứng (Xem, Sửa, Xóa, Phân quyền).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setNewFeatureModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Chức Năng (Cột Mới)</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Mặc Định</span>
            </button>
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer ${
                isModified ? "bg-[#F59E0B] hover:bg-amber-600 animate-pulse" : "bg-[#003B95] hover:bg-blue-900"
              }`}
            >
              <Save className="h-4 w-4" />
              <span>{isModified ? "Lưu Thay Đổi (Chưa Lưu)" : "Lưu Cấu Hình"}</span>
            </button>
          </div>
        </div>

        {/* 5 Role KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
          {stats.map((role) => (
            <div
              key={role.key}
              className={`rounded-2xl border p-3.5 transition-all bg-card/80 hover:shadow-sm ${role.tagColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {role.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${role.badgeBg}`}>
                  {role.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic font-medium">
                {role.badgeTitle}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-foreground">
                <span>Số quyền:</span>
                <span>
                  {role.count} / {role.total}
                </span>
              </div>
              <div className="w-full bg-secondary/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#003B95] rounded-full transition-all duration-300"
                  style={{ width: `${role.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Toolbar & Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1 pl-1 pr-2">
            <Filter className="h-3.5 w-3.5 text-primary" /> Nhóm:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#003B95] text-white shadow-2xs"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm chức năng cột theo tên hoặc mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 3. BẢNG MA TRẬN: BÊN TRÁI 5 ROLE (ROWS) - Ở ĐẦU CÁC CHỨC NĂNG (COLUMNS) */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh] scrollbar-thin">
          <table className="w-full border-collapse text-left">
            {/* THEAD: Các Chức Năng (Columns) */}
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-border/80 sticky top-0 z-30 backdrop-blur-md">
                {/* Góc trên bên trái cố định (Giao điểm) */}
                <th className="sticky left-0 z-40 bg-slate-100 dark:bg-slate-900 border-r border-border/80 p-4 min-w-[280px] max-w-[280px] shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Vai Trò Cốt Lõi (5 Role)
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                      {filteredFeatures.length} chức năng
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">
                    Quyền hạn cho phép hiển thị trong từng cell
                  </p>
                </th>

                {/* Các Cột Chức Năng (Columns) */}
                {filteredFeatures.map((feat) => {
                  const Icon = ICON_MAP[feat.iconName || "Sliders"] || Sliders;
                  return (
                    <th
                      key={feat.id}
                      className="border-r border-border/60 p-3.5 min-w-[260px] max-w-[280px] align-top transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#003B95] dark:bg-blue-950/70 dark:text-blue-300">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <h4
                              className="text-xs font-bold text-slate-900 dark:text-white truncate"
                              title={feat.name}
                            >
                              {feat.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{feat.code}</p>
                          </div>
                        </div>

                        {/* Nút hành động nhanh trên cột */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingFeature(feat)}
                            className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-primary transition"
                            title="Sửa tên chức năng"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feat.id, feat.name)}
                            className="p-1 rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Xóa cột chức năng"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nút chọn nhanh cho cột */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[10px]">
                        <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-muted-foreground font-medium">
                          {feat.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setColumnAll(feat.id, true)}
                            className="font-bold text-primary hover:underline cursor-pointer"
                            title="Bật toàn bộ quyền cột này"
                          >
                            Cấp hết
                          </button>
                          <span className="text-border">|</span>
                          <button
                            onClick={() => setColumnAll(feat.id, false)}
                            className="font-bold text-rose-600 hover:underline cursor-pointer"
                            title="Tắt toàn bộ quyền cột này"
                          >
                            Tắt hết
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* TBODY: 5 Dòng Vai Trò Cố Định */}
            <tbody className="divide-y divide-border/70">
              {ROLES_LIST.map((role) => {
                return (
                  <tr
                    key={role.key}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30 group"
                  >
                    {/* Cột trái cố định: Tên vai trò và mô tả */}
                    <td className="sticky left-0 z-20 bg-card group-hover:bg-slate-50 dark:group-hover:bg-slate-900 border-r border-border/80 p-4 min-w-[280px] max-w-[280px] shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {role.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeBg} ${role.tagColor}`}
                        >
                          {role.badgeTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Hành động nhanh theo dòng vai trò */}
                      <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-2">
                        <button
                          onClick={() => toggleRoleAll(role.key, true)}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span>Chọn tất cả</span>
                        </button>
                        <span className="text-border">·</span>
                        <button
                          onClick={() => toggleRoleAll(role.key, false)}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          <span>Bỏ chọn</span>
                        </button>
                      </div>
                    </td>

                    {/* Các Cells giao điểm: Chức năng x Thao tác */}
                    {filteredFeatures.map((feat) => {
                      const perms = (feat[role.key] || {}) as any;

                      return (
                        <td
                          key={feat.id}
                          className="border-r border-border/60 p-3 min-w-[260px] max-w-[280px] align-middle"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {/* 1. Thao tác XEM (Có ở cả 5 Role) */}
                            {role.allowedActions.includes("xem") && (
                              <button
                                type="button"
                                onClick={() => toggleAction(feat.id, role.key, "xem")}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                                  perms.xem
                                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                                }`}
                                title="Quyền xem dữ liệu"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${perms.xem ? "bg-white" : "bg-muted-foreground"}`} />
                                <span>Xem</span>
                              </button>
                            )}

                            {/* 2. Thao tác SỬA (Chỉ có ở Quản trị, Admin, Tổng thư ký, Trưởng ban) */}
                            {role.allowedActions.includes("sua") && (
                              <button
                                type="button"
                                onClick={() => toggleAction(feat.id, role.key, "sua")}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                                  perms.sua
                                    ? "bg-[#F59E0B] text-slate-900 border-[#F59E0B] shadow-2xs font-extrabold"
                                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                                }`}
                                title="Quyền chỉnh sửa dữ liệu"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${perms.sua ? "bg-slate-900" : "bg-muted-foreground"}`} />
                                <span>Sửa</span>
                              </button>
                            )}

                            {/* 3. Thao tác XÓA (Chỉ có ở Quản trị) */}
                            {role.allowedActions.includes("xoa") && (
                              <button
                                type="button"
                                onClick={() => toggleAction(feat.id, role.key, "xoa")}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                                  perms.xoa
                                    ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                                }`}
                                title="Quyền xóa dữ liệu"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${perms.xoa ? "bg-white" : "bg-muted-foreground"}`} />
                                <span>Xóa</span>
                              </button>
                            )}

                            {/* 4. Thao tác PHÂN QUYỀN (Có ở Quản trị, Admin) */}
                            {role.allowedActions.includes("phanQuyen") && (
                              <button
                                type="button"
                                onClick={() => toggleAction(feat.id, role.key, "phanQuyen")}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                                  perms.phanQuyen
                                    ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                                    : "bg-background text-muted-foreground border-border hover:bg-secondary"
                                }`}
                                title="Quyền phân quyền quản trị"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${perms.phanQuyen ? "bg-white" : "bg-muted-foreground"}`} />
                                <span>Phân quyền</span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Ghi chú quy chuẩn RBAC */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#003B95] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <p className="font-bold text-slate-900 dark:text-white">
            Quy định phân quyền 5 cấp bậc chuẩn hóa CEO 1983:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
            <li>
              <strong>Quản trị:</strong> Đầy đủ 4 thao tác: <span className="text-blue-600 font-semibold">Xem</span>,{" "}
              <span className="text-amber-600 font-semibold">Sửa</span>,{" "}
              <span className="text-rose-600 font-semibold">Xóa</span>,{" "}
              <span className="text-purple-600 font-semibold">Phân quyền</span>.
            </li>
            <li>
              <strong>Admin:</strong> Có 3 thao tác: <span className="text-blue-600 font-semibold">Xem</span>,{" "}
              <span className="text-amber-600 font-semibold">Sửa</span>,{" "}
              <span className="text-purple-600 font-semibold">Phân quyền</span>.
            </li>
            <li>
              <strong>Tổng thư ký:</strong> Có 2 thao tác: <span className="text-blue-600 font-semibold">Xem</span>,{" "}
              <span className="text-amber-600 font-semibold">Sửa</span>.
            </li>
            <li>
              <strong>Trưởng ban:</strong> Có 2 thao tác: <span className="text-blue-600 font-semibold">Xem</span>,{" "}
              <span className="text-amber-600 font-semibold">Sửa</span> (Bao gồm Trưởng ban Thiện Nguyện & An Sinh Xã Hội mới).
            </li>
            <li>
              <strong>Hội viên:</strong> Có 1 thao tác: <span className="text-blue-600 font-semibold">Xem</span>.
            </li>
          </ul>
        </div>
      </div>

      {/* Modal: Thêm Cột Chức Năng Mới */}
      {newFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Thêm Cột Chức Năng Mới
              </h3>
              <button
                onClick={() => setNewFeatureModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeature} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Tên chức năng (Hiển thị đầu cột) *</label>
                <input
                  type="text"
                  required
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Ví dụ: Quản lý Thư viện Ảnh & Video"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Nhóm danh mục *</label>
                <select
                  value={newFeatureCategory}
                  onChange={(e) => setNewFeatureCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                >
                  {CATEGORIES.filter((c) => c !== "Tất cả").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={3}
                  value={newFeatureDescription}
                  onChange={(e) => setNewFeatureDescription(e.target.value)}
                  placeholder="Mô tả phạm vi nghiệp vụ của chức năng này..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setNewFeatureModal(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#003B95] px-5 py-2 font-bold text-white hover:bg-blue-900 transition shadow-sm cursor-pointer"
                >
                  Tạo Cột Chức Năng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa Tên Chức Năng */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-primary" /> Đổi Tên Cột Chức Năng
              </h3>
              <button
                onClick={() => setEditingFeature(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFeatureName} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Tên chức năng hiển thị *</label>
                <input
                  type="text"
                  required
                  value={editingFeature.name}
                  onChange={(e) => setEditingFeature({ ...editingFeature, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#003B95] px-5 py-2 font-bold text-white hover:bg-blue-900 transition shadow-sm cursor-pointer"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
