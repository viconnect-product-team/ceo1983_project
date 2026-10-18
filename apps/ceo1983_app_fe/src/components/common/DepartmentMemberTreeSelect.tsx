import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Check,
  X,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Shield,
  Layers,
  Sparkles,
  Loader2,
  Calendar,
  Megaphone,
  Coins,
  HeartHandshake,
} from "lucide-react";
import { fetchNestApi, resolveMediaUrl, isDeadAvatarUrl } from "@/lib/api-client";
import { INITIAL_DEPARTMENTS, type DepartmentItem } from "@/lib/rbac-permission-helpers";

export interface MemberTreeItem {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  role?: string;
  title?: string;
  department?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  status?: string;
}

export interface DepartmentTreeGroup {
  id: string;
  code: string;
  name: string;
  icon: any;
  color: string;
  members: MemberTreeItem[];
}

export interface DepartmentMemberTreeSelectProps {
  selectedEmails?: string[];
  selectedMemberIds?: string[];
  onChange?: (
    selectedItems: MemberTreeItem[],
    selectedEmails: string[],
    selectedIds: string[]
  ) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  defaultExpandedDept?: string;
}

const DEPT_ICON_MAP: Record<string, any> = {
  bdh: Shield,
  btk: Calendar,
  btv: Users,
  bxt: Briefcase,
  btt: Megaphone,
  btc: Coins,
  btn: HeartHandshake,
};

function getDeptIcon(deptCodeOrName: string) {
  const s = deptCodeOrName.toLowerCase();
  if (s.includes("điều hành") || s.includes("quản trị") || s.includes("bdh")) return Shield;
  if (s.includes("thư ký") || s.includes("btk")) return Calendar;
  if (s.includes("thành viên") || s.includes("btv")) return Users;
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("bxt")) return Briefcase;
  if (s.includes("truyền thông") || s.includes("btt")) return Megaphone;
  if (s.includes("tài chính") || s.includes("btc")) return Coins;
  if (s.includes("thiện nguyện") || s.includes("btn") || s.includes("từ thiện")) return HeartHandshake;
  return Building2;
}

export function DepartmentMemberTreeSelect({
  selectedEmails = [],
  selectedMemberIds = [],
  onChange,
  multiple = true,
  label = "Chọn người tham gia theo Ban chuyên môn",
  placeholder = "Tìm kiếm theo tên, chức vụ, email, số điện thoại...",
  required = false,
  className = "",
  disabled = false,
  defaultExpandedDept,
}: DepartmentMemberTreeSelectProps) {
  const [members, setMembers] = useState<MemberTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  // Internal selected set of keys (prefer email, fallback to id)
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(
    () => new Set([...selectedEmails, ...selectedMemberIds])
  );

  // Sync internal state when external props change
  useEffect(() => {
    setInternalSelectedKeys(new Set([...selectedEmails, ...selectedMemberIds]));
  }, [selectedEmails, selectedMemberIds]);

  // Fetch real members from CEO 1983 backend API
  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      setLoading(true);
      try {
        const data = await fetchNestApi<any[]>("/members");
        if (!cancelled && Array.isArray(data)) {
          const mapped: MemberTreeItem[] = data.map((m) => {
            const rawAvatar = m.avatar || m.avatarUrl || m.avatar_url;
            const validAvatar = rawAvatar && !isDeadAvatarUrl(rawAvatar)
              ? (rawAvatar.startsWith("data:") || rawAvatar.startsWith("blob:") ? rawAvatar : resolveMediaUrl(rawAvatar) || rawAvatar)
              : null;

            return {
              id: String(m.id || m.code || m.email || Math.random()),
              name: m.name || m.fullName || m.full_name || "Hội viên CEO 1983",
              code: m.code || "",
              email: m.email || "",
              phone: m.phone || m.contact || "",
              company: m.company || m.companyName || "CLB Doanh Nhân CEO 1983",
              position: m.position || m.title || m.role || "Hội viên",
              role: m.executive_role || m.role || "",
              title: m.title || "",
              department: m.department || "Ban Điều Hành",
              avatar: validAvatar,
              status: m.status || "active",
            };
          });
          setMembers(mapped);

          // Auto-expand default or first department
          if (defaultExpandedDept) {
            setExpandedDepts((prev) => ({ ...prev, [defaultExpandedDept]: true }));
          } else {
            // Expand first 2 departments by default
            setExpandedDepts({
              "Ban Điều Hành": true,
              "Ban Thư Ký": true,
              "Ban Xúc tiến thương mại": true,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách hội viên cho Tree Select:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [defaultExpandedDept]);

  // Group members into Departments
  const departmentGroups: DepartmentTreeGroup[] = useMemo(() => {
    // Standard template depts
    const standardDepts: { name: string; code: string; color: string }[] = [
      { name: "Ban Điều Hành", code: "BDH", color: "blue" },
      { name: "Ban Thư Ký", code: "BTK", color: "purple" },
      { name: "Ban Thành viên", code: "BTV", color: "emerald" },
      { name: "Ban Xúc tiến thương mại", code: "BXT", color: "amber" },
      { name: "Ban Truyền thông", code: "BTT", color: "rose" },
      { name: "Ban Tài chính", code: "BTC", color: "yellow" },
      { name: "Ban Thiện nguyện", code: "BTN", color: "teal" },
    ];

    const groupMap = new Map<string, MemberTreeItem[]>();
    standardDepts.forEach((d) => groupMap.set(d.name, []));

    // Distribute members into matched department
    members.forEach((mem) => {
      const memDept = (mem.department || "").trim().toLowerCase();
      let matched = false;

      for (const d of standardDepts) {
        const dName = d.name.toLowerCase();
        const dCode = d.code.toLowerCase();

        if (
          memDept === dName ||
          memDept === dCode ||
          (dCode === "bdh" && (memDept.includes("điều hành") || memDept.includes("quản trị"))) ||
          (dCode === "btk" && memDept.includes("thư ký")) ||
          (dCode === "btv" && memDept.includes("thành viên")) ||
          (dCode === "bxt" && (memDept.includes("xúc tiến") || memDept.includes("thương mại"))) ||
          (dCode === "btt" && memDept.includes("truyền thông")) ||
          (dCode === "btc" && memDept.includes("tài chính")) ||
          (dCode === "btn" && (memDept.includes("thiện nguyện") || memDept.includes("từ thiện")))
        ) {
          groupMap.get(d.name)!.push(mem);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Create custom group or fallback to Ban Điều Hành
        const fallbackName = mem.department ? mem.department.trim() : "Ban Điều Hành";
        if (!groupMap.has(fallbackName)) {
          groupMap.set(fallbackName, []);
        }
        groupMap.get(fallbackName)!.push(mem);
      }
    });

    const result: DepartmentTreeGroup[] = [];
    groupMap.forEach((mems, deptName) => {
      // Find matching standard info if any
      const std = standardDepts.find(
        (s) => s.name.toLowerCase() === deptName.toLowerCase()
      );
      result.push({
        id: `dept_${deptName}`,
        code: std?.code || "BAN",
        name: deptName,
        icon: getDeptIcon(deptName),
        color: std?.color || "blue",
        members: mems,
      });
    });

    return result;
  }, [members]);

  // Filtered groups based on search query
  const filteredDepartmentGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return departmentGroups;

    return departmentGroups
      .map((dept) => {
        const matchedMembers = dept.members.filter((m) => {
          return (
            m.name.toLowerCase().includes(q) ||
            (m.email && m.email.toLowerCase().includes(q)) ||
            (m.phone && m.phone.toLowerCase().includes(q)) ||
            (m.company && m.company.toLowerCase().includes(q)) ||
            (m.position && m.position.toLowerCase().includes(q)) ||
            (m.role && m.role.toLowerCase().includes(q)) ||
            (m.code && m.code.toLowerCase().includes(q))
          );
        });

        // If dept name matches search query, include all its members
        const deptMatches = dept.name.toLowerCase().includes(q) || dept.code.toLowerCase().includes(q);

        return {
          ...dept,
          members: deptMatches ? dept.members : matchedMembers,
        };
      })
      .filter((dept) => dept.members.length > 0);
  }, [departmentGroups, searchQuery]);

  // Auto-expand all depts when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allExpanded: Record<string, boolean> = {};
      filteredDepartmentGroups.forEach((d) => {
        allExpanded[d.name] = true;
      });
      setExpandedDepts(allExpanded);
    }
  }, [searchQuery, filteredDepartmentGroups]);

  // Helper check if member is selected
  const isMemberSelected = useCallback(
    (mem: MemberTreeItem) => {
      if (mem.email && internalSelectedKeys.has(mem.email)) return true;
      if (mem.id && internalSelectedKeys.has(mem.id)) return true;
      return false;
    },
    [internalSelectedKeys]
  );

  // Helper check if all members of department are selected
  const isDeptFullySelected = useCallback(
    (dept: DepartmentTreeGroup) => {
      if (dept.members.length === 0) return false;
      return dept.members.every((m) => isMemberSelected(m));
    },
    [isMemberSelected]
  );

  // Helper check if some members of department are selected
  const isDeptPartiallySelected = useCallback(
    (dept: DepartmentTreeGroup) => {
      if (dept.members.length === 0) return false;
      const count = dept.members.filter((m) => isMemberSelected(m)).length;
      return count > 0 && count < dept.members.length;
    },
    [isMemberSelected]
  );

  // Toggle single member
  const handleToggleMember = (mem: MemberTreeItem) => {
    if (disabled) return;

    const next = new Set(internalSelectedKeys);
    const key = mem.email || mem.id;

    if (multiple) {
      if (isMemberSelected(mem)) {
        if (mem.email) next.delete(mem.email);
        if (mem.id) next.delete(mem.id);
      } else {
        next.add(key);
        if (mem.email) next.add(mem.email);
        if (mem.id) next.add(mem.id);
      }
    } else {
      next.clear();
      next.add(key);
      if (mem.email) next.add(mem.email);
      if (mem.id) next.add(mem.id);
    }

    setInternalSelectedKeys(next);
    fireOnChange(next);
  };

  // Toggle entire department
  const handleToggleDepartment = (dept: DepartmentTreeGroup) => {
    if (disabled || !multiple) return;

    const next = new Set(internalSelectedKeys);
    const allSelected = isDeptFullySelected(dept);

    dept.members.forEach((m) => {
      if (allSelected) {
        if (m.email) next.delete(m.email);
        if (m.id) next.delete(m.id);
      } else {
        if (m.email) next.add(m.email);
        if (m.id) next.add(m.id);
      }
    });

    setInternalSelectedKeys(next);
    fireOnChange(next);
  };

  // Select all visible members
  const handleSelectAllVisible = () => {
    if (disabled || !multiple) return;
    const next = new Set(internalSelectedKeys);
    filteredDepartmentGroups.forEach((dept) => {
      dept.members.forEach((m) => {
        if (m.email) next.add(m.email);
        if (m.id) next.add(m.id);
      });
    });
    setInternalSelectedKeys(next);
    fireOnChange(next);
  };

  // Clear all selections
  const handleClearAll = () => {
    if (disabled) return;
    const next = new Set<string>();
    setInternalSelectedKeys(next);
    fireOnChange(next);
  };

  // Expand / collapse dept
  const handleToggleExpand = (deptName: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptName]: !prev[deptName],
    }));
  };

  // Emit change callback
  const fireOnChange = (selectedSet: Set<string>) => {
    const selectedItems = members.filter((m) => {
      return (m.email && selectedSet.has(m.email)) || (m.id && selectedSet.has(m.id));
    });
    const emails = Array.from(new Set(selectedItems.map((m) => m.email).filter(Boolean))) as string[];
    const ids = Array.from(new Set(selectedItems.map((m) => m.id).filter(Boolean))) as string[];

    onChange?.(selectedItems, emails, ids);
  };

  // Get list of selected member items
  const selectedMembersList = useMemo(() => {
    return members.filter((m) => isMemberSelected(m));
  }, [members, isMemberSelected]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#003B95] border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
            {selectedMembersList.length} đã chọn
          </span>
        </label>

        {multiple && !disabled && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-[#003B95] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Chọn tất cả
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-red-500 font-medium transition cursor-pointer"
            >
              Xóa chọn
            </button>
          </div>
        )}
      </div>

      {/* Selected Members Chips Bar */}
      {selectedMembersList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 max-h-28 overflow-y-auto">
          {selectedMembersList.map((mem) => (
            <span
              key={mem.id || mem.email}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs group"
            >
              {mem.avatar ? (
                <img
                  src={mem.avatar}
                  alt={mem.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#003B95] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {mem.name.charAt(0)}
                </span>
              )}
              <span className="font-semibold text-[#003B95] dark:text-blue-400 max-w-[130px] truncate">
                {mem.name}
              </span>
              <span className="text-[10px] text-muted-foreground max-w-[100px] truncate">
                ({mem.department})
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleToggleMember(mem)}
                  className="text-slate-400 hover:text-red-500 transition p-0.5 rounded cursor-pointer"
                  title="Bỏ chọn"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-[#003B95]/30 focus:border-[#003B95] transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tree View Box */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden divide-y divide-border/60 max-h-[380px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#003B95]" />
            <span>Đang tải danh sách ban chuyên môn & hội viên...</span>
          </div>
        ) : filteredDepartmentGroups.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground space-y-1">
            <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-foreground">Không tìm thấy thành viên phù hợp</p>
            <p className="text-xs">Thử thay đổi từ khóa tìm kiếm theo tên, chức vụ, email hoặc số điện thoại.</p>
          </div>
        ) : (
          filteredDepartmentGroups.map((dept) => {
            const DeptIcon = dept.icon;
            const isExpanded = Boolean(expandedDepts[dept.name]);
            const isFullySelected = isDeptFullySelected(dept);
            const isPartiallySelected = isDeptPartiallySelected(dept);
            const selectedCount = dept.members.filter((m) => isMemberSelected(m)).length;

            return (
              <div key={dept.id} className="transition-colors">
                {/* Department Node (Root / Parent) */}
                <div
                  className={`flex items-center justify-between px-3.5 py-2.5 bg-secondary/30 hover:bg-secondary/60 cursor-pointer select-none transition ${
                    isExpanded ? "border-b border-border/40" : ""
                  }`}
                  onClick={() => handleToggleExpand(dept.name)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      aria-label="Mở rộng / Thu gọn ban"
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpand(dept.name);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="size-7 rounded-lg bg-blue-500/10 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <DeptIcon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-sm text-foreground hover:text-[#003B95] transition">
                        {dept.name}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        ({selectedCount}/{dept.members.length})
                      </span>
                    </div>
                  </div>

                  {multiple && !disabled && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-background/80 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDepartment(dept);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isFullySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => handleToggleDepartment(dept)}
                        className="rounded border-border text-[#003B95] focus:ring-[#003B95] h-4 w-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {isFullySelected ? "Bỏ chọn cả ban" : "Chọn cả ban"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Children (Leaf Nodes) */}
                {isExpanded && (
                  <div className="bg-background/40 divide-y divide-border/30">
                    {dept.members.length === 0 ? (
                      <div className="py-2.5 px-10 text-xs text-muted-foreground italic">
                        Chưa có thành viên nào trong ban này.
                      </div>
                    ) : (
                      dept.members.map((mem) => {
                        const selected = isMemberSelected(mem);
                        return (
                          <div
                            key={mem.id || mem.email}
                            onClick={() => handleToggleMember(mem)}
                            className={`flex items-center justify-between px-4 py-2.5 pl-10 cursor-pointer transition ${
                              selected
                                ? "bg-blue-50/70 dark:bg-blue-950/40 text-foreground font-medium"
                                : "hover:bg-secondary/40 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Selection Indicator */}
                              <div
                                className={`size-4 rounded ${
                                  multiple ? "rounded" : "rounded-full"
                                } border flex items-center justify-center shrink-0 transition ${
                                  selected
                                    ? "bg-[#003B95] border-[#003B95] text-white"
                                    : "border-border bg-background"
                                }`}
                              >
                                {selected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>

                              {/* Member Avatar */}
                              <div className="size-8 rounded-full overflow-hidden shrink-0 border border-border/80 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                {mem.avatar ? (
                                  <img
                                    src={mem.avatar}
                                    alt={mem.name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-[#003B95] dark:text-blue-400">
                                    {mem.name.charAt(0)}
                                  </span>
                                )}
                              </div>

                              {/* Member Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs sm:text-sm font-semibold truncate text-foreground">
                                    {mem.name}
                                  </p>
                                  {mem.code && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                                      {mem.code}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                                  {mem.position && (
                                    <span className="truncate max-w-[160px]">
                                      {mem.position}
                                    </span>
                                  )}
                                  {mem.company && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate max-w-[180px] font-medium">
                                        {mem.company}
                                      </span>
                                    </>
                                  )}
                                  {mem.phone && (
                                    <>
                                      <span>·</span>
                                      <span className="font-mono">{mem.phone}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
