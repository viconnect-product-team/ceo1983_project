import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Calendar,
  Users,
  Handshake,
  IdCard,
  CreditCard,
  TrendingUp,
  Crown,
  Vote,
  FolderOpen,
  MessageSquare,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  GraduationCap,
  PhoneCall,
  MapPin,
  BellRing,
  BarChart3,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export interface ShortcutItem {
  id: string;
  name: string;
  desc: string;
  to: string;
  iconName: string;
  badge?: string;
  badgeColor?: string;
}

export const ALL_SHORTCUT_OPTIONS: ShortcutItem[] = [
  {
    id: "members",
    name: "Danh bạ CEO",
    desc: "Danh bạ 200+ CEO doanh nhân",
    to: "/association/members",
    iconName: "Users",
  },
  {
    id: "messages",
    name: "Tin nhắn",
    desc: "Trò chuyện & nhắn tin kết nối nhanh",
    to: "/association/messages?tab=messages",
    iconName: "MessageSquare",
    badge: "Chat",
    badgeColor: "bg-[#003B95] text-white",
  },
  {
    id: "connect",
    name: "Kết nối B2B",
    desc: "Tạo kết nối 1-on-1 & hợp tác B2B",
    to: "/association/connect",
    iconName: "Handshake",
    badge: "B2B",
    badgeColor: "bg-[#003B95] text-white",
  },
  {
    id: "events",
    name: "Sự kiện",
    desc: "Sự kiện & chương trình CLB",
    to: "/association/events",
    iconName: "Calendar",
  },
  {
    id: "calendar",
    name: "Lịch",
    desc: "Lịch sự kiện, họp ban, cuộc gặp & cài nhắc",
    to: "/association/calendar",
    iconName: "Calendar",
    badge: "Lịch",
    badgeColor: "bg-red-600 text-white",
  },
  {
    id: "opportunities",
    name: "Cơ hội B2B",
    desc: "Sàn kết nối cơ hội kinh doanh B2B",
    to: "/association/opportunities",
    iconName: "TrendingUp",
  },
  {
    id: "analytics",
    name: "Báo cáo",
    desc: "Báo cáo số liệu giao thương & hoạt động",
    to: "/association/analytics",
    iconName: "BarChart3",
    badge: "Số liệu",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "profile",
    name: "Hội viên",
    desc: "Hồ sơ & thông tin doanh nghiệp",
    to: "/association/profile",
    iconName: "IdCard",
  },
  {
    id: "feed",
    name: "Bảng tin",
    desc: "Tin tức các ban & tương tác",
    to: "/association/messages?tab=feed",
    iconName: "MessageSquare",
    badge: "Mới",
    badgeColor: "bg-amber-500 text-slate-900",
  },
  {
    id: "business-cards",
    name: "Danh thiếp",
    desc: "Danh thiếp số CEO thông minh",
    to: "/association/business-cards",
    iconName: "CreditCard",
    badge: "VIP",
    badgeColor: "bg-amber-500 text-slate-900",
  },
  {
    id: "perks",
    name: "Ưu đãi VIP",
    desc: "Ưu đãi đối tác nội bộ CLB",
    to: "/association/perks",
    iconName: "Crown",
  },
  {
    id: "voting",
    name: "Biểu quyết",
    desc: "Bình chọn đại hội & nghị quyết",
    to: "/association/voting",
    iconName: "Vote",
  },
  {
    id: "marketplace",
    name: "Sàn B2B",
    desc: "Sản phẩm & dịch vụ thành viên",
    to: "/association/marketplace",
    iconName: "ShoppingBag",
  },
  {
    id: "library",
    name: "Tài liệu",
    desc: "Điều lệ, quy chế & văn bản",
    to: "/association/library",
    iconName: "FolderOpen",
  },
  {
    id: "training",
    name: "Đào tạo",
    desc: "Khóa học, tài liệu & phòng họp video",
    to: "/association/training",
    iconName: "GraduationCap",
    badge: "Mới",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    id: "connect-1on1",
    name: "Gặp 1-1",
    desc: "Hẹn kết nối & chốt deal B2B",
    to: "/association/connect",
    iconName: "PhoneCall",
    badge: "B2B",
    badgeColor: "bg-[#1F3864] text-white",
  },
  {
    id: "calendar-alarm",
    name: "Báo thức",
    desc: "Nhắc lịch hẹn, sự kiện & cuộc họp",
    to: "#alarm",
    iconName: "BellRing",
    badge: "Nhắc",
    badgeColor: "bg-amber-500 text-slate-900",
  },
  {
    id: "system-config",
    name: "Cấu hình",
    desc: "Đổi mật khẩu, màu giao diện & AI",
    to: "/association/system-config",
    iconName: "Settings",
    badge: "Hệ thống",
    badgeColor: "bg-[#003B95] text-amber-300 font-bold",
  },
];

export const DEFAULT_SHORTCUT_IDS = ["members", "messages", "connect", "events"];

export function getShortcutIcon(iconName: string, className = "size-6", color?: string) {
  const style = color ? { color } : undefined;
  switch (iconName) {
    case "Calendar":
      return <Calendar className={className} style={style} />;
    case "Users":
      return <Users className={className} style={style} />;
    case "Handshake":
      return <Handshake className={className} style={style} />;
    case "IdCard":
      return <IdCard className={className} style={style} />;
    case "TrendingUp":
      return <TrendingUp className={className} style={style} />;
    case "MessageSquare":
      return <MessageSquare className={className} style={style} />;
    case "CreditCard":
      return <CreditCard className={className} style={style} />;
    case "Crown":
      return <Crown className={className} style={style} />;
    case "Vote":
      return <Vote className={className} style={style} />;
    case "ShoppingBag":
      return <ShoppingBag className={className} style={style} />;
    case "FolderOpen":
      return <FolderOpen className={className} style={style} />;
    case "GraduationCap":
      return <GraduationCap className={className} style={style} />;
    case "PhoneCall":
      return <PhoneCall className={className} style={style} />;
    case "MapPin":
      return <MapPin className={className} style={style} />;
    case "BellRing":
      return <BellRing className={className} style={style} />;
    case "BarChart3":
      return <BarChart3 className={className} style={style} />;
    case "Settings":
      return <Settings className={className} style={style} />;
    default:
      return <Sparkles className={className} style={style} />;
  }
}

interface CustomHomeShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

export function CustomHomeShortcutsModal({
  isOpen,
  onClose,
  selectedIds,
  onSave,
}: CustomHomeShortcutsModalProps) {
  const [currentSelected, setCurrentSelected] = useState<string[]>(
    Array.isArray(selectedIds) && selectedIds.length === 4 ? selectedIds : DEFAULT_SHORTCUT_IDS
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentSelected(
        Array.isArray(selectedIds) && selectedIds.length === 4 ? selectedIds : DEFAULT_SHORTCUT_IDS
      );
    }
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  const handleToggle = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentSelected.includes(id)) {
      if (currentSelected.length <= 1) {
        toast.warning("Bạn cần chọn tối thiểu 1 tính năng");
        return;
      }
      setCurrentSelected((prev) => prev.filter((item) => item !== id));
    } else {
      if (currentSelected.length >= 4) {
        toast.warning("Chỉ được chọn tối đa 4 tính năng hiển thị chính. Hãy bỏ chọn 1 tính năng trước khi thêm.");
        return;
      }
      setCurrentSelected((prev) => [...prev, id]);
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentSelected(DEFAULT_SHORTCUT_IDS);
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentSelected.length !== 4) {
      toast.warning("Vui lòng chọn đúng 4 tính năng bạn thường xuyên sử dụng nhất");
      return;
    }
    onSave(currentSelected);
    toast.success("Đã lưu tùy biến 4 tính năng chính trang chủ!");
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-50/60 via-amber-50/40 to-blue-50/50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tùy biến 4 tính năng chính
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chọn {currentSelected.length}/4 chức năng bạn muốn hiển thị ở trang chủ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* List of features */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {ALL_SHORTCUT_OPTIONS.map((item) => {
            const isSelected = currentSelected.includes(item.id);
            const selectionIndex = currentSelected.indexOf(item.id) + 1;

            return (
              <div
                key={item.id}
                onClick={(e) => handleToggle(item.id, e)}
                className={`pt-2 first:pt-0 flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-2 border-amber-500 dark:bg-amber-950/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {getShortcutIcon(item.iconName, "size-5")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            item.badgeColor || "bg-amber-500 text-slate-900"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <div className="size-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {selectionIndex}
                    </div>
                  ) : (
                    <div className="size-6 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#003B95] hover:bg-[#002b6d] text-white shadow-md active:scale-95 transition inline-flex items-center gap-1.5 border border-amber-400/30 cursor-pointer"
            >
              <Check className="size-4" />
              <span>Áp dụng ({currentSelected.length}/4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
