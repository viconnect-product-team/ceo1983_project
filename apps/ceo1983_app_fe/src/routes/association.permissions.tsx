import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Users,
  Building2,
  Check,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  Save,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  Crown,
  Calendar,
  Newspaper,
  ShoppingBag,
  Vote,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers, getMyMember, type DirectoryMember, type MyMember } from "@/lib/member-app.functions";
import { useServerFn } from "@tanstack/react-start";
import { useRole } from "@/hooks/use-role";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/api-client";

export const Route = createFileRoute("/association/permissions")({
  component: AssociationPermissionsScreen,
});

export interface MemberPermissionProfile {
  memberCode: string;
  boardName: string;
  boardRole: "truong-ban" | "pho-ban-thuong-truc" | "pho-ban" | "uy-vien" | "hoi-vien";
  canManageEvents: boolean;
  canManageNews: boolean;
  canManageMarketplace: boolean;
  canManageVoting: boolean;
  canManageMembers: boolean;
  isAdmin: boolean;
  updatedAt: string;
}

const BOARD_OPTIONS = [
  "Ban Thường Trực CLB",
  "Ban Thư Ký & Điều Phối",
  "Ban Xúc Tiến Thương Mại & Đầu Tư B2B",
  "Ban Phát Triển Hội Viên & Thẩm Định",
  "Ban Truyền Thông & Sự Kiện",
  "Ban Tài Chính & Pháp Chế",
  "Ban Đào Tạo & Chuyển Đổi Số",
  "Hội viên CLB CEO 1983",
];

const ROLE_LABELS: Record<string, string> = {
  "truong-ban": "Trưởng Ban",
  "pho-ban-thuong-truc": "Phó Ban Thường Trực",
  "pho-ban": "Phó Ban",
  "uy-vien": "Ủy Viên",
  "hoi-vien": "Hội Viên",
};

function AssociationPermissionsScreen() {
  const { isBQT, isPlatformAdmin, loading: roleLoading } = useRole();
  const { user } = useAuth();
  const fetchMyMemberFn = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMyMemberFn(), null, "vba_my_member");

  const isBQTOrAdmin = Boolean(
    (user as any)?.role === "admin" ||
    (user as any)?.role === "platform_admin" ||
    (member as any)?.role === "admin" ||
    (member as any)?.role === "association_admin" ||
    isPlatformAdmin ||
    isBQT ||
    (member as any)?.department === "Ban Quản Trị" ||
    (member as any)?.department === "Ban Thường Trực CLB" ||
    String((member as any)?.executiveRole || "").toLowerCase().includes("chủ tịch") ||
    String((member as any)?.department || "").toLowerCase().includes("quản trị")
  );
  const hasAccess = isBQTOrAdmin;

  const fetchMembersFn = useServerFn(listMembers);
  const { data: directory = [] } = useServerData<DirectoryMember[]>(() => fetchMembersFn(), [], "vba_directory_members");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoardFilter, setSelectedBoardFilter] = useState("all");
  const [editingMemberCode, setEditingMemberCode] = useState<string | null>(null);

  // Stored member permissions mapping: memberCode -> MemberPermissionProfile
  const [permissionsMap, setPermissionsMap] = useState<Record<string, MemberPermissionProfile>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("vba_member_permissions");
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  // Draft state while editing a single member's permissions
  const [draftPermission, setDraftPermission] = useState<MemberPermissionProfile | null>(null);

  const handleStartEdit = (member: DirectoryMember) => {
    const existing = permissionsMap[member.code] || {
      memberCode: member.code,
      boardName: member.industry || "Hội viên CLB CEO 1983",
      boardRole: "hoi-vien",
      canManageEvents: false,
      canManageNews: false,
      canManageMarketplace: false,
      canManageVoting: false,
      canManageMembers: false,
      isAdmin: false,
      updatedAt: new Date().toISOString(),
    };
    setDraftPermission({ ...existing });
    setEditingMemberCode(member.code);
  };

  const handleSaveDraft = () => {
    if (!draftPermission || !editingMemberCode) return;

    setPermissionsMap((prev) => {
      const updated = {
        ...prev,
        [editingMemberCode]: {
          ...draftPermission,
          updatedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem("vba_member_permissions", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    toast.success("Đã lưu phân quyền hội viên thành công!", {
      description: `Quyền hạn của ${editingMemberCode} đã được cập nhật hiệu lực ngay lập tức.`,
    });
    setEditingMemberCode(null);
    setDraftPermission(null);
  };

  const filteredMembers = useMemo(() => {
    return directory.filter((m) => {
      const p = permissionsMap[m.code];
      const nameMatch =
        (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.personName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.company || "").toLowerCase().includes(searchQuery.toLowerCase());

      const boardMatch =
        selectedBoardFilter === "all" ||
        (p?.boardName && p.boardName.toLowerCase() === selectedBoardFilter.toLowerCase());

      return nameMatch && boardMatch;
    });
  }, [directory, permissionsMap, searchQuery, selectedBoardFilter]);

  if (!roleLoading && !hasAccess) {
    return (
      <div className="vba-animate min-h-screen bg-[var(--vba-bg)] text-[var(--vba-text)] pb-20">
        <MemberHeader title="Phân Quyền Hội Viên" />
        <div className="mx-4 mt-8 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              KHÔNG CÓ QUYỀN TRUY CẬP
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Khu vực này chỉ dành riêng cho Ban Quản Trị và Ban Thư Ký CLB Doanh Nhân CEO 1983 để phân quyền điều hành ứng dụng.
            </p>
          </div>
          <Link
            to="/association"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold shadow-md hover:bg-[#002B70] transition"
          >
            <span>Quay lại Trang Chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vba-animate min-h-screen bg-[var(--vba-bg)] text-[var(--vba-text)] pb-24">
      <MemberHeader
        title="Phân Quyền Hội Viên (BQT)"
        subtitle="Quản lý ban ngành & phân quyền chức năng cho Hội viên"
      />

      {/* Top Admin Banner */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A] p-4 text-white shadow-md border border-[#003B95]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-tight uppercase">BẢNG PHÂN QUYỀN HỘI VIÊN</h2>
                <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-[9px] font-extrabold text-amber-300 border border-amber-400/30">
                  ADMIN BQT
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90 mt-0.5">
                Cấp quyền quản lý Sự kiện, Bản tin, Gian hàng Marketplace và Biểu quyết
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-sky-200">
          <span>Tổng số hội viên trong danh bạ: <strong className="text-white">{directory.length}</strong></span>
          <span>Đã cấp quyền quản trị: <strong className="text-amber-300">{Object.keys(permissionsMap).length}</strong></span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mx-4 mt-3 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hội viên, doanh nghiệp, mã số..."
            className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003B95]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedBoardFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
              selectedBoardFilter === "all"
                ? "bg-[#003B95] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            Tất cả ban ngành
          </button>
          {BOARD_OPTIONS.slice(0, 5).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBoardFilter(b)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                selectedBoardFilter === b
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Members Permission List */}
      <div className="mx-4 mt-3 space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-[#0F172A]">
            <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              Không tìm thấy hội viên nào phù hợp với điều kiện tìm kiếm.
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const perm = permissionsMap[member.code];
            const isEditing = editingMemberCode === member.code;
            const displayName = member.personName || member.name;
            const displayCompany = member.company || member.name;

            return (
              <div
                key={member.code}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 shadow-xs space-y-3 transition hover:border-[#003B95]/40"
              >
                {/* Member Summary Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {member.avatar ? (
                        <img
                          src={resolveMediaUrl(member.avatar) || member.avatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center font-bold text-xs text-[#003B95]">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {displayName}
                        </h3>
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-slate-600 dark:text-slate-400">
                          {member.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {displayCompany}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-[#003B95] dark:text-blue-300 border border-[#003B95]/20">
                          {perm?.boardName || "Hội viên chính thức"}
                        </span>
                        {perm?.boardRole && (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-400/30">
                            {ROLE_LABELS[perm.boardRole] || perm.boardRole}
                          </span>
                        )}
                        {perm?.isAdmin && (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Close Toggle Button */}
                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditingMemberCode(null) : handleStartEdit(member))}
                    className="shrink-0 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    {isEditing ? "Đóng" : "Phân quyền"}
                  </button>
                </div>

                {/* Edit Drawer for this Member */}
                {isEditing && draftPermission && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Board Select */}
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">
                          Ban Chuyên Môn / Bộ phận:
                        </label>
                        <select
                          value={draftPermission.boardName}
                          onChange={(e) =>
                            setDraftPermission({ ...draftPermission, boardName: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] cursor-pointer"
                        >
                          {BOARD_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Board Role Select */}
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">
                          Chức vụ trong Ban:
                        </label>
                        <select
                          value={draftPermission.boardRole}
                          onChange={(e) =>
                            setDraftPermission({
                              ...draftPermission,
                              boardRole: e.target.value as MemberPermissionProfile["boardRole"],
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] cursor-pointer"
                        >
                          <option value="truong-ban">Trưởng Ban</option>
                          <option value="pho-ban-thuong-truc">Phó Ban Thường Trực</option>
                          <option value="pho-ban">Phó Ban</option>
                          <option value="uy-vien">Ủy Viên</option>
                          <option value="hoi-vien">Hội Viên</option>
                        </select>
                      </div>
                    </div>

                    {/* Permission Toggles List */}
                    <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200/60 dark:border-slate-800">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Cấp quyền thao tác quản trị trên App:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* 1. Events */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            Duyệt & Quản lý Sự kiện
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.canManageEvents}
                            onChange={(e) =>
                              setDraftPermission({ ...draftPermission, canManageEvents: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-[#003B95] cursor-pointer"
                          />
                        </label>

                        {/* 2. News */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Newspaper className="h-3.5 w-3.5 text-emerald-600" />
                            Đăng & Duyệt Bản tin CLB
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.canManageNews}
                            onChange={(e) =>
                              setDraftPermission({ ...draftPermission, canManageNews: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-[#003B95] cursor-pointer"
                          />
                        </label>

                        {/* 3. Marketplace */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                            Kiểm duyệt Marketplace
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.canManageMarketplace}
                            onChange={(e) =>
                              setDraftPermission({
                                ...draftPermission,
                                canManageMarketplace: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded text-[#003B95] cursor-pointer"
                          />
                        </label>

                        {/* 4. Voting */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Vote className="h-3.5 w-3.5 text-sky-600" />
                            Tạo & Quản lý Biểu quyết
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.canManageVoting}
                            onChange={(e) =>
                              setDraftPermission({ ...draftPermission, canManageVoting: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-[#003B95] cursor-pointer"
                          />
                        </label>

                        {/* 5. Members */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                            Thẩm định Hồ sơ Hội viên
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.canManageMembers}
                            onChange={(e) =>
                              setDraftPermission({ ...draftPermission, canManageMembers: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-[#003B95] cursor-pointer"
                          />
                        </label>

                        {/* 6. Admin All */}
                        <label className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 cursor-pointer">
                          <span className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                            <Crown className="h-3.5 w-3.5 text-rose-600" />
                            Quyền Quản trị viên (Admin)
                          </span>
                          <input
                            type="checkbox"
                            checked={draftPermission.isAdmin}
                            onChange={(e) =>
                              setDraftPermission({ ...draftPermission, isAdmin: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-rose-600 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Save Action Button */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingMemberCode(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Hủy
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Lưu phân quyền</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
