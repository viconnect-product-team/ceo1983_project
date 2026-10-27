import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  Users,
  Calendar,
  Handshake,
  TrendingUp,
  Package,
  MessageSquare,
  IdCard,
  Crown,
  Vote,
  GraduationCap,
  History,
  FolderOpen,
  CreditCard,
  MapPin,
  BellRing,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export interface AllFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal?: () => void;
  onOpenMapModal?: () => void;
  onOpenAlarmModal?: () => void;
}

interface FeatureItem {
  id: string;
  name: string;
  category: "Giao thương & Kết nối" | "Hoạt động & Sự kiện" | "Đặc quyền & Hội viên" | "Tiện ích số";
  desc: string;
  to?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export function AllFeaturesModal({
  isOpen,
  onClose,
  onOpenConnectModal,
  onOpenMapModal,
  onOpenAlarmModal,
}: AllFeaturesModalProps) {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  const features: FeatureItem[] = [
    {
      id: "members",
      name: "Danh bạ CEO",
      category: "Giao thương & Kết nối",
      desc: "Tra cứu danh bạ 200+ CEO, Chủ tịch doanh nhân",
      to: "/association/members",
      icon: Users,
      badge: "100+",
      badgeColor: "bg-[#003B95] text-white",
    },
    {
      id: "connect",
      name: "Tính năng kết nối",
      category: "Giao thương & Kết nối",
      desc: "Tạo lịch hẹn kết nối 1-on-1 Online & Offline",
      action: () => {
        onClose();
        if (onOpenConnectModal) onOpenConnectModal();
        else navigate({ to: "/association/connect" as any });
      },
      icon: Handshake,
      badge: "Mới",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      id: "opportunities",
      name: "Cơ hội giao thương",
      category: "Giao thương & Kết nối",
      desc: "Sàn chia sẻ & chốt deal cơ hội kinh doanh B2B",
      to: "/association/opportunities",
      icon: TrendingUp,
      badge: "Deal",
      badgeColor: "bg-amber-500 text-slate-950",
    },
    {
      id: "marketplace",
      name: "Sàn thương mại B2B",
      category: "Giao thương & Kết nối",
      desc: "Sản phẩm & dịch vụ ưu đãi độc quyền hội viên",
      to: "/association/products",
      icon: Package,
    },
    {
      id: "events",
      name: "Sự kiện CLB",
      category: "Hoạt động & Sự kiện",
      desc: "Đại hội, Gala, Diễn đàn xúc tiến & Họp ban",
      to: "/association/events",
      icon: Calendar,
      badge: "Hot",
      badgeColor: "bg-red-600 text-white",
    },
    {
      id: "voting",
      name: "Biểu quyết số",
      category: "Hoạt động & Sự kiện",
      desc: "Bình chọn đại hội, nghị quyết & khảo sát CLB",
      to: "/association/voting",
      icon: Vote,
    },
    {
      id: "training",
      name: "Đào tạo & Huấn luyện",
      category: "Hoạt động & Sự kiện",
      desc: "Khóa học quản trị, tài liệu & phòng họp video",
      to: "/association/training",
      icon: GraduationCap,
    },
    {
      id: "feed",
      name: "Bảng tin Mạng lưới",
      category: "Hoạt động & Sự kiện",
      desc: "Tin tức phát thanh từ các ban & tương tác cộng đồng",
      to: "/association/messages?tab=feed",
      icon: MessageSquare,
      badge: "Social",
      badgeColor: "bg-[#003B95] text-white",
    },
    {
      id: "messages",
      name: "Tin nhắn trực tiếp",
      category: "Giao thương & Kết nối",
      desc: "Trò chuyện & trao đổi hợp tác riêng tư với hội viên",
      to: "/association/messages?tab=messages",
      icon: MessageSquare,
      badge: "Chat",
      badgeColor: "bg-blue-600 text-white",
    },
    {
      id: "card",
      name: "Danh thiếp số VIP",
      category: "Đặc quyền & Hội viên",
      desc: "Thẻ hội viên số nhận diện doanh nhân công nghệ NFC",
      to: "/association/card",
      icon: IdCard,
      badge: "VIP",
      badgeColor: "bg-amber-500 text-slate-950",
    },
    {
      id: "perks",
      name: "Đặc quyền & Ưu đãi",
      category: "Đặc quyền & Hội viên",
      desc: "Kho voucher & ưu đãi dịch vụ 5 sao đối tác",
      to: "/association/perks",
      icon: Crown,
    },
    {
      id: "library",
      name: "Kho tài liệu CLB",
      category: "Đặc quyền & Hội viên",
      desc: "Điều lệ, quy chế hoạt động, kỷ yếu & biểu mẫu",
      to: "/association/library",
      icon: FolderOpen,
    },
    {
      id: "renew",
      name: "Hội phí niên liễm",
      category: "Đặc quyền & Hội viên",
      desc: "Gia hạn tư cách hội viên, thanh toán VietQR",
      to: "/association/renew",
      icon: CreditCard,
    },
    {
      id: "history",
      name: "Lịch sử hoạt động",
      category: "Tiện ích số",
      desc: "Nhật ký điểm danh sự kiện, cuộc gặp & trao đổi",
      to: "/association/history",
      icon: History,
    },
    {
      id: "map",
      name: "Bản đồ CEO GPS",
      category: "Tiện ích số",
      desc: "Định vị vị trí doanh nghiệp hội viên trên bản đồ",
      action: () => {
        onClose();
        if (onOpenMapModal) onOpenMapModal();
        else navigate({ to: "/association/members" as any });
      },
      icon: MapPin,
      badge: "GPS",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      id: "calendar",
      name: "Lịch hoạt động & Nhắc hẹn",
      category: "Hoạt động & Sự kiện",
      desc: "Lịch sự kiện, cuộc họp ban, cuộc gặp 1-on-1 & cài đặt nhắc hẹn",
      to: "/association/calendar",
      icon: Calendar,
      badge: "Nhắc hẹn",
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
    },
  ];

  const filtered = React.useMemo(() => {
    if (!search.trim()) return features;
    const q = search.toLowerCase();
    return features.filter((f) => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [features, search]);

  const categories = ["Giao thương & Kết nối", "Hoạt động & Sự kiện", "Đặc quyền & Hội viên", "Tiện ích số"] as const;

  const handleFeatureClick = (f: FeatureItem) => {
    onClose();
    if (f.action) {
      f.action();
    } else if (f.to) {
      navigate({ to: f.to as any });
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[460px] max-h-[92dvh] rounded-3xl bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-amber-500/30 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-amber-50/20 dark:from-slate-900 dark:via-[#0B132B] dark:to-amber-950/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#003B95] text-amber-300 shadow-xs">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                TẤT CẢ TÍNH NĂNG CEO 1983
              </h2>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Toàn bộ hệ sinh thái dịch vụ &amp; tiện ích dành cho Doanh nhân
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-[#003B95] dark:focus-within:border-amber-400">
            <Search className="size-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh tính năng..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden"
            />
          </div>
        </div>

        {/* Scrollable Features List by Category */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 [scrollbar-width:none]">
          {categories.map((cat) => {
            const catFeatures = filtered.filter((f) => f.category === cat);
            if (catFeatures.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#003B95] dark:text-amber-400 block px-1">
                  {cat}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {catFeatures.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleFeatureClick(f)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-blue-50/80 dark:hover:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#003B95]/50 dark:hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between group shadow-xs active:scale-[0.98]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="size-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-amber-400/80 text-[#003B95] dark:text-amber-400 grid place-items-center shadow-2xs group-hover:scale-105 transition-transform">
                            <Icon className="size-4.5" />
                          </div>
                          {f.badge && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${f.badgeColor || "bg-amber-500 text-slate-900"}`}>
                              {f.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#003B95] dark:group-hover:text-amber-300 transition truncate">
                            {f.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {f.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
