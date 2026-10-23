import React, { useState } from "react";
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
    id: "events",
    name: "Sự kiện",
    desc: "Lịch sinh hoạt & sự kiện CLB",
    to: "/association/events",
    iconName: "Calendar",
  },
  {
    id: "members",
    name: "Tìm hội viên",
    desc: "Danh bạ 200+ CEO doanh nhân",
    to: "/association/members",
    iconName: "Users",
  },
  {
    id: "opportunities",
    name: "Cơ hội",
    desc: "Sàn kết nối cơ hội kinh doanh B2B",
    to: "/association/opportunities",
    iconName: "Handshake",
  },
  {
    id: "profile",
    name: "Góc hội viên",
    desc: "Hồ sơ & thông tin doanh nghiệp",
    to: "/association/profile",
    iconName: "IdCard",
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
    id: "feed",
    name: "Bảng tin CLB",
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
    name: "Đặc quyền VIP",
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
    name: "Đào tạo & Họp",
    desc: "Khóa học, tài liệu & phòng họp video",
    to: "/association/training",
    iconName: "GraduationCap",
    badge: "Mới",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    id: "connect",
    name: "Gặp gỡ 1-1",
    desc: "Hẹn kết nối & chốt deal B2B",
    to: "/association/connect",
    iconName: "PhoneCall",
    badge: "B2B",
    badgeColor: "bg-[#1F3864] text-white",
  },
  {
    id: "map",
    name: "Bản đồ CEO",
    desc: "Bản đồ định vị hội viên, sự kiện & cuộc gặp",
    to: "#map",
    iconName: "MapPin",
    badge: "GPS",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    id: "calendar-alarm",
    name: "Lịch & Báo thức",
    desc: "Nhắc lịch hẹn, sự kiện & cuộc họp",
    to: "#alarm",
    iconName: "BellRing",
    badge: "Nhắc",
    badgeColor: "bg-amber-500 text-slate-900",
  },
];

export const DEFAULT_SHORTCUT_IDS = ["messages", "members", "opportunities", "profile"];

export function getShortcutIcon(iconName: string, className = "size-6") {
  switch (iconName) {
    case "Calendar":
      return <Calendar className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Handshake":
      return <Handshake className={className} />;
    case "IdCard":
      return <IdCard className={className} />;
    case "TrendingUp":
      return <TrendingUp className={className} />;
    case "MessageSquare":
      return <MessageSquare className={className} />;
    case "CreditCard":
      return <CreditCard className={className} />;
    case "Crown":
      return <Crown className={className} />;
    case "Vote":
      return <Vote className={className} />;
    case "ShoppingBag":
      return <ShoppingBag className={className} />;
    case "FolderOpen":
      return <FolderOpen className={className} />;
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "PhoneCall":
      return <PhoneCall className={className} />;
    case "MapPin":
      return <MapPin className={className} />;
    case "BellRing":
      return <BellRing className={className} />;
    default:
      return <Sparkles className={className} />;
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
    selectedIds.length === 4 ? selectedIds : DEFAULT_SHORTCUT_IDS
  );

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (currentSelected.includes(id)) {
      if (currentSelected.length <= 1) {
        toast.warning("Bạn cần chọn tối thiểu 1 tính năng");
        return;
      }
      setCurrentSelected((prev) => prev.filter((item) => item !== id));
    } else {
      if (currentSelected.length >= 4) {
        toast.warning("Chỉ được chọn tối đa 4 tính năng hiển thị chính");
        return;
      }
      setCurrentSelected((prev) => [...prev, id]);
    }
  };

  const handleReset = () => {
    setCurrentSelected(DEFAULT_SHORTCUT_IDS);
  };

  const handleSave = () => {
    if (currentSelected.length !== 4) {
      toast.warning("Vui lòng chọn đúng 4 tính năng bạn thường xuyên sử dụng nhất");
      return;
    }
    onSave(currentSelected);
    toast.success("Đã lưu tùy biến 4 tính năng chính trang chủ!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
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
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                onClick={() => handleToggle(item.id)}
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
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <RotateCcw className="size-3.5" />
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1F3864] hover:bg-[#152747] text-white shadow-md active:scale-95 transition inline-flex items-center gap-1.5 border border-amber-400/30"
            >
              <Check className="size-4" />
              <span>Áp dụng ({currentSelected.length}/4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
