import { useState, useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  IdCard,
  Contact,
  Users,
  Calendar,
  Newspaper,
  History,
  FolderOpen,
  Phone,
  Handshake,
  Package,
  Crown,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  CalendarCheck,
  BadgeCheck,
  Copy,
  Clock,
  MapPin,
  Sparkles,
  Flame,
  TrendingUp,
  Check,
  QrCode,
  CreditCard,
  Smartphone,
  Building2,
  ExternalLink,
  Camera,
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Vote,
  Pencil,
  Headphones,
  Briefcase,
  Palette,
  Cake,
  Share2,
  Download,
  BookOpen,
  BellRing,
  MessageSquare,
} from "lucide-react";
import { HomeOpportunityRowWidget } from "@/components/opportunities/HomeOpportunityRowWidget";
import { CeoInteractiveMapModal } from "@/components/member/CeoInteractiveMapModal";
import { CeoCalendarAlarmModal } from "@/components/member/CeoCalendarAlarmModal";
import { MemberProfileModal } from "@/components/member/MemberProfileModal";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/context/AuthContext";
import { SeasonalEventHeader, getEffectiveThemeOption, syncThemeFromBackend } from "@/components/member/SeasonalEventHeader";
import { useTheme } from "@/lib/theme";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import {
  getActiveCeo1983ColorTheme,
  COLOR_THEME_EVENT,
  type Ceo1983ColorTheme,
} from "@/lib/ceo1983-color-theme";
import { canScanEventQr as checkCanScanEventQr } from "@/lib/checkin-gatekeeper-auth";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { BirthdayCelebrationModal } from "@/components/member/BirthdayCelebrationModal";
import { toast } from "sonner";
import { isBlackBackgroundLogo } from "@/components/member/Ceo1983BusinessCardVisit";
import { GuidedTourModal, type TourStep } from "@/components/common/GuidedTourModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { PersonalProfileBottomSheet, type PersonalProfileData } from "@/components/common/PersonalProfileBottomSheet";
import {
  CustomHomeShortcutsModal,
  ALL_SHORTCUT_OPTIONS,
  DEFAULT_SHORTCUT_IDS,
  getShortcutIcon,
} from "@/components/member/CustomHomeShortcutsModal";
import { AllFeaturesModal } from "@/components/member/AllFeaturesModal";
import { CreateConnectionModal } from "@/components/member/CreateConnectionModal";
import { MemberPerksCarousel } from "@/components/member/MemberPerksCarousel";
import { QrCanvas } from "@/components/member/QrCanvas";
import heroImg from "@/assets/vba-hero.jpg";
import giftImg from "@/assets/vba-gift.png";
import { EventCountdownMiniBadge } from "@/components/events/EventCountdownTimer";
import { useServerData } from "@/hooks/use-server-data";
import { useRole, PERMISSIONS } from "@/hooks/use-role";
import {
  getMyMember,
  listMyEvents,
  getMyAssociationBrand,
  listMyOpportunities,
  listMyProducts,
  listMyNotifications,
  listMembers,
  listNews,
  getMyHistory,
  type MyMember,
  type MyEvent,
  type MyAssociationBrand,
  type MyOpportunity,
  type MyProduct,
  type MyNotification,
  type DirectoryMember,
  type NewsItem,
  type MyHistory,
} from "@/lib/member-app.functions";
import { getReadNewsIds, markNewsAsRead } from "@/lib/news-read-tracker";
import { useT, useLang } from "@/lib/i18n";
import { AssociationContactSheet } from "@/components/member/AssociationContactSheet";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { compressImage } from "@/lib/image";
import { ImageCropModal } from "@/components/templates/ImageCropModal";
const appIcon = "/ceo1983-emblem-8.png";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function BubbleChatIcon({ color = "currentColor", className = "size-6" }: { color?: string; className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0052 12H12.0142M16.0007 12H16.0097M8.00973 12H8.0187" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 13.0483 2.6698 14.057 2.98341 15C3.5282 16.6382 3.12865 18.5818 2.6935 19.6074C2.59266 19.8451 2.62741 20.1274 2.80997 20.31C2.93024 20.4302 3.09774 20.4913 3.26592 20.4658C4.37462 20.2979 5.63177 19.362 7.5 20.3687C8.8394 21.0904 10.3719 21.5 12 21.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
    </svg>
  );
}

function ContactBookIcon({ color = "currentColor", className = "size-6" }: { color?: string; className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 10C4.5 6.22876 4.5 4.34315 5.67157 3.17157C6.84315 2 8.72876 2 12.5 2H14C17.7712 2 19.6569 2 20.8284 3.17157C22 4.34315 22 6.22876 22 10V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H12.5C8.72876 22 6.84315 22 5.67157 20.8284C4.5 19.6569 4.5 17.7712 4.5 14V10Z" strokeWidth="1.5" stroke={color} />
      <path d="M4.5 6H2M4.5 12H2M4.5 18H2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M15.2758 8.49261C15.2758 9.59715 14.3804 10.4926 13.2759 10.4926C12.1714 10.4926 11.2759 9.59715 11.2759 8.49261C11.2759 7.38808 12.1714 6.49268 13.2759 6.49268C14.3804 6.49268 15.2758 7.38808 15.2758 8.49261ZM13.2759 13.4774C12.0598 13.4762 10.3791 14.0868 9.3208 15.7161C9.25237 15.8215 9.23351 15.9512 9.29526 16.0607C9.54278 16.4996 10.3113 17.3705 10.8663 17.4296C11.5044 17.4974 13.2242 17.5069 13.2772 17.5072C13.3301 17.5069 14.9984 17.4974 15.6362 17.4296C16.1913 17.3705 16.9597 16.4996 17.2073 16.0607C17.269 15.9512 17.2502 15.8215 17.1817 15.7161C16.1234 14.0868 14.4919 13.4787 13.2759 13.4774Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
    </svg>
  );
}

function ChartBreakoutCircleIcon({ color = "currentColor", className = "size-6" }: { color?: string; className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3.38462V2M19.6306 4.36369L20.6081 3.38462M20.6176 8H22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M11.8537 8.00684H15.0758C15.4546 8.00684 15.7617 8.32175 15.7617 8.71022V12.0354M2.76172 13.9583C5.03496 14.2241 10.7393 13.5137 14.8933 8.88963" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
    </svg>
  );
}

function Briefcase04Icon({ color = "currentColor", className = "size-6" }: { color?: string; className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 6.5C8.5 5.093 8.5 4.389 8.837 3.883C8.983 3.665 9.17 3.477 9.389 3.337C9.893 3 10.595 3 12 3C13.404 3 14.106 3 14.611 3.337C14.829 3.477 15.017 3.665 15.163 3.883C15.5 4.389 15.5 5.093 15.5 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M22 13.5V14C22 17.2998 22 18.9497 20.975 19.9745C19.95 21 18.3 21 15 21H9C5.7 21 4.05 21 3.025 19.9745C2 18.9497 2 17.2998 2 14V13.5C2 10.2002 2 8.55025 3.025 7.52513C4.05 6.5 5.7 6.5 9 6.5H15C18.3 6.5 19.95 6.5 20.975 7.52513C22 8.55025 22 10.2002 22 13.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M13.5 14C19.573 13.51 21.75 10 21.75 10M2.25 10C2.25 10 4.427 13.51 10.5 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
      <path d="M10.5 13V14C10.5 14.8284 11.1716 15.5 12 15.5C12.8284 15.5 13.5 14.8284 13.5 14V13C13.5 12.7239 13.2761 12.5 13 12.5H11C10.7239 12.5 10.5 12.7239 10.5 13Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke={color} />
    </svg>
  );
}

export const Route = createFileRoute("/association/")({
  component: Home,
});

function initials(name?: string) {
  if (!name) return "CEO";
  const clean = name.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim();
  if (!clean) return "CEO";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DEFAULT_NEWS_THUMBNAILS = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
];

function formatNewsDate(timeStr?: string) {
  if (!timeStr) return "Gần đây";
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return timeStr;
  }
}

const quickActionDefs = [
  {
    key: "m.index.qaMessages",
    iconKey: "messages",
    icon: MessageSquare,
    to: "/association/messages?tab=messages",
    customLabel: "Tin nhắn",
    enLabel: "Messages",
    badgeId: "messages",
    badgeText: "Chat",
    badgeTextEn: "Chat",
  },
  {
    key: "m.index.qaCard",
    iconKey: "card",
    icon: IdCard,
    to: "/association/business-cards",
    customLabel: "Danh thiếp số",
    enLabel: "Digital Card",
    badgeId: "card",
    badgeText: "VIP",
    badgeTextEn: "VIP",
  },
  {
    key: "m.index.qaMembers",
    iconKey: "members",
    icon: Users,
    to: "/association/members",
    customLabel: "Danh bạ CEO",
    enLabel: "CEO Directory",
    badgeId: "members",
    badgeText: "",
    badgeTextEn: "",
  },
  {
    key: "m.index.qaEvents",
    iconKey: "events",
    icon: Calendar,
    to: "/association/events",
    customLabel: "Sự kiện CLB",
    enLabel: "Club Events",
    badgeId: "events",
    badgeText: "Mới",
    badgeTextEn: "New",
  },
  {
    key: "m.index.qaPerks",
    iconKey: "perks",
    icon: Crown,
    to: "/association/perks",
    customLabel: "Đặc quyền VIP",
    enLabel: "VIP Perks",
    badgeId: "perks",
    badgeText: "Ưu đãi",
    badgeTextEn: "Perks",
  },
  {
    key: "m.index.qaVoting",
    iconKey: "voting",
    icon: Vote,
    to: "/association/voting",
    customLabel: "Biểu quyết số",
    enLabel: "E-Voting",
    badgeId: "voting",
    badgeText: "Mới",
    badgeTextEn: "New",
  },
  {
    key: "m.index.qaHistory",
    iconKey: "history",
    icon: History,
    to: "/association/history",
    customLabel: "Lịch sử",
    enLabel: "History",
    badgeId: "history",
    badgeText: "Hoạt động",
    badgeTextEn: "Active",
  },
  {
    key: "m.index.qaLibrary",
    iconKey: "library",
    icon: FolderOpen,
    to: "/association/library",
    customLabel: "Kho tài liệu",
    enLabel: "Library",
    badgeId: "library",
    badgeText: "Điều lệ",
    badgeTextEn: "Docs",
  },
  {
    key: "m.index.qaFees",
    iconKey: "fees",
    icon: CreditCard,
    to: "/association/renew",
    customLabel: "Hội phí",
    enLabel: "Membership Dues",
    badgeId: "fees",
    badgeText: "2026",
    badgeTextEn: "2026",
  },
  {
    key: "m.index.qaDocuments",
    iconKey: "documents",
    icon: CalendarCheck,
    to: "/association/calendar",
    customLabel: "Lịch hoạt động",
    enLabel: "Activity Calendar",
    badgeId: "calendar",
    badgeText: "Lịch",
    badgeTextEn: "Calendar",
  },
  {
    key: "m.index.qaAlarm",
    iconKey: "alarm",
    icon: BellRing,
    to: "#alarm",
    customLabel: "Lịch báo thức",
    enLabel: "Alarm Schedule",
    badgeId: "alarm",
    badgeText: "Nhắc",
    badgeTextEn: "Alarm",
  },
] as const;

// Fallback high-res business event photos with CEO 1983 blue lighting tone
const defaultEventImages = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
];

const CEO1983_TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-member-card",
    title: "Thẻ Hội Viên & Số Điện Thoại",
    description: "Thẻ nhận diện số chính thức của bạn trong Hiệp hội CEO 1983. Hiển thị ảnh đại diện, ảnh bìa sắc nét, mã hội viên M1983 và số điện thoại liên hệ trực tiếp.",
    icon: "🎖️",
  },
  {
    targetId: "tour-quick-edit-btn",
    title: "Chỉnh Sửa Hồ Sơ Nhanh",
    description: "Chạm vào đây bất kỳ lúc nào để cập nhật ảnh đại diện, ảnh bìa và thông tin doanh nghiệp. Dữ liệu sẽ đồng bộ tức thì trên toàn hệ sinh thái.",
    icon: "✏️",
  },
  {
    targetId: "tour-quick-actions",
    title: "Tính Năng Nhanh & Danh Bạ Kết Nối",
    description: "Truy cập nhanh danh thiếp số, danh bạ hội viên, quét check-in, đặc quyền VIP và biểu quyết số.",
    icon: "⚡",
  },
  {
    targetId: "tour-opportunities-stats",
    title: "Chia Sẻ Cơ Hội & Sàn Giao Thương B2B",
    description: "Theo dõi số lượng cơ hội kinh doanh đang mở và sản phẩm chào bán. Nơi 200+ doanh nhân kết nối cung - cầu và xúc tiến thương mại.",
    icon: "💼",
  },
];

function Home() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const { canScanQR, isAdmin, isPlatformAdmin, isBTC, isBQT, isBTK, isBTT, can } = useRole();

  const hasCheckinPermission = useMemo(() => {
    if (canScanQR || isAdmin || isPlatformAdmin || isBTC || isBQT || isBTK || isBTT) return true;
    if (can(PERMISSIONS.EVENT_CHECKIN_MANAGE)) return true;
    const userRole = (user as any)?.role;
    if (userRole === "admin" || userRole === "superadmin" || userRole === "platform_admin" || userRole === "bqt") return true;
    if (typeof window !== "undefined" && localStorage.getItem("vba_is_media_department_member") === "true") return true;
    return false;
  }, [canScanQR, isAdmin, isPlatformAdmin, isBTC, isBQT, isBTK, isBTT, can, user]);

  const visibleQuickActions = useMemo(() => {
    return quickActionDefs;
  }, []);
  const [tourOpen, setTourOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [memberQrModalOpen, setMemberQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<any | null>(null);
  const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveThemeOption());
  const [brandColorTheme, setBrandColorTheme] = useState<Ceo1983ColorTheme>(() => getActiveCeo1983ColorTheme());

  useEffect(() => {
    const handleColorThemeUpdate = (e: any) => {
      if (e?.detail) {
        setBrandColorTheme(e.detail);
      } else {
        setBrandColorTheme(getActiveCeo1983ColorTheme());
      }
    };
    window.addEventListener(COLOR_THEME_EVENT, handleColorThemeUpdate);
    window.addEventListener("storage", handleColorThemeUpdate);
    return () => {
      window.removeEventListener(COLOR_THEME_EVENT, handleColorThemeUpdate);
      window.removeEventListener("storage", handleColorThemeUpdate);
    };
  }, []);

  const { theme } = useTheme();
  const isDark = theme === "dark" || (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    void syncThemeFromBackend();
  }, []);

  const getActionIconStyle = (iconKey: string) => {
    const primary = brandColorTheme.primaryColor;
    const accent = brandColorTheme.accentColor;
    if (!isDark) {
      return {
        backgroundColor: brandColorTheme.lightBg,
        borderColor: brandColorTheme.lightBorder,
        color: primary,
        boxShadow:
          effectiveTheme.iconStyle === "glow-neon"
            ? `0 0 12px ${primary}60`
            : undefined,
      };
    }
    return {
      backgroundColor: `${primary}30`,
      borderColor: `${accent}60`,
      color: accent,
      boxShadow: `0 0 10px ${primary}40`,
    };
  };

  useEffect(() => {
    const handleThemeUpdate = () => {
      setEffectiveTheme(getEffectiveThemeOption());
    };
    window.addEventListener("vba-event-theme-changed", handleThemeUpdate);
    window.addEventListener("ceo1983-theme-changed", handleThemeUpdate);
    window.addEventListener("storage", handleThemeUpdate);
    return () => {
      window.removeEventListener("vba-event-theme-changed", handleThemeUpdate);
      window.removeEventListener("ceo1983-theme-changed", handleThemeUpdate);
      window.removeEventListener("storage", handleThemeUpdate);
    };
  }, []);

  // Guided tour is triggered explicitly from profile/user guide center
  useEffect(() => {
    try {
      const triggerTour = localStorage.getItem("ceo1983_trigger_tour_on_mount");
      if (triggerTour === "1") {
        localStorage.removeItem("ceo1983_trigger_tour_on_mount");
        const timer = setTimeout(() => setTourOpen(true), 400);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);
  const [clearedBadges, setClearedBadges] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_cleared_badges") || "{}");
    } catch {
      return {};
    }
  });

  const handleActionClick = (badgeId?: string) => {
    if (!badgeId) return;
    setClearedBadges((prev) => {
      const next = { ...prev, [badgeId]: true };
      try {
        localStorage.setItem("vba_cleared_badges", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const userKey = user?.id || "guest";
  const fetchMember = useServerFn(getMyMember);
  const fetchEvents = useServerFn(listMyEvents);
  const fetchBrand = useServerFn(getMyAssociationBrand);
  const fetchOpps = useServerFn(listMyOpportunities);
  const fetchProducts = useServerFn(listMyProducts);
  const fetchNotifs = useServerFn(listMyNotifications);
  const fetchDirectory = useServerFn(listMembers);
  const fetchNews = useServerFn(listNews);

  const { data: member } = useServerData<MyMember | null>(
    () => fetchMember(),
    null,
    user?.id ? `vba_my_member_${user.id}` : undefined,
    [user?.id]
  );
  const { data: serverEvents = [] } = useServerData<MyEvent[]>(
    () => fetchEvents(),
    [],
    user?.id ? `vba_events_${user.id}` : "vba_events",
    [user?.id]
  );
  const { data: brand } = useServerData<MyAssociationBrand | null>(
    () => fetchBrand(),
    null,
    user?.id ? `vba_brand_${user.id}` : "vba_brand",
    [user?.id]
  );
  const { data: opportunities = [] } = useServerData<MyOpportunity[]>(
    () => fetchOpps(),
    [],
    user?.id ? `vba_opps_${user.id}` : "vba_opps",
    [user?.id]
  );
  const [allMarketplaceProducts, setAllMarketplaceProducts] = useState<any[]>([]);
  useEffect(() => {
    fetchNestApi<any[]>("/products")
      .then((res) => {
        if (Array.isArray(res)) setAllMarketplaceProducts(res);
      })
      .catch(() => {});
  }, []);

  const { data: products = [] } = useServerData<MyProduct[]>(
    () => fetchProducts(),
    [],
    user?.id ? `vba_products_${user.id}` : "vba_products",
    [user?.id]
  );
  const { data: notifications = [], reload: reloadNotifs } = useServerData<MyNotification[]>(
    () => fetchNotifs(),
    [],
    user?.id ? `vba_notifs_${user.id}` : "vba_notifs",
    [user?.id]
  );
  const { data: directoryMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), [], "vba_directory_members");
  const { data: newsItems = [] } = useServerData<NewsItem[]>(() => fetchNews(), [], "vba_news");

  // Check quyền quét mã sự kiện trên mobile CEO 1983 theo đúng nghiệp vụ:
  // Quản trị, Chủ tịch, Admin luôn có quyền.
  // Các tài khoản khác chỉ được quét khi là Thành viên Ban Truyền Thông VÀ được tick chọn trong danh sách qrStaff của sự kiện
  const canScanEventQr = useMemo(() => {
    return checkCanScanEventQr(user, serverEvents, member);
  }, [user, serverEvents, member]);

  const [readNewsIds, setReadNewsIds] = useState<string[]>(() => getReadNewsIds());

  useEffect(() => {
    const handleNewsReadUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ readIds: string[] }>;
      if (customEvent.detail?.readIds) {
        setReadNewsIds(customEvent.detail.readIds);
      } else {
        setReadNewsIds(getReadNewsIds());
      }
    };
    window.addEventListener("ceo1983_news_read_updated", handleNewsReadUpdated);
    return () => window.removeEventListener("ceo1983_news_read_updated", handleNewsReadUpdated);
  }, []);

  const combinedNews = useMemo(() => {
    return newsItems;
  }, [newsItems]);

  // Client-side fetch trực tiếp từ NestJS /members/me bằng Bearer token của user hiện tại
  const [directMember, setDirectMember] = useState<MyMember | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setDirectMember(null);
      return;
    }
    let active = true;
    fetchNestApi<any>("/members/me")
      .then((live) => {
        if (active && live) {
          setDirectMember(live);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Ưu tiên: directMember (tươi mới từ API trực tiếp) > member (từ SSR Server Function)
  const effectiveMember = useMemo(() => {
    const dm = directMember as any;
    const m = member as any;
    if (dm && (dm.userId === user?.id || dm.id === user?.id || !dm.userId)) {
      return directMember;
    }
    if (m && (m.userId === user?.id || m.id === user?.id || !m.userId)) {
      return member;
    }
    return directMember || member;
  }, [directMember, member, user?.id]);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  // Real-time active polls count for core features badge
  const [activePollsCount, setActivePollsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("vba_active_polls_count");
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    fetchNestApi<any[]>("/voting/polls")
      .then((polls) => {
        if (Array.isArray(polls)) {
          const activeCount = polls.filter((p) => p.status === "ACTIVE" || p.status === "OPEN" || !p.status).length;
          const count = activeCount || polls.length || 1;
          setActivePollsCount(count);
          try {
            localStorage.setItem("vba_active_polls_count", String(count));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real-time analytics overview for candlestick stock ticker widget
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  useEffect(() => {
    fetchNestApi<any>("/analytics/overview")
      .then((res) => {
        if (res && (res.ok || res.hourlyTimeline)) {
          setAnalyticsOverview(res);
        }
      })
      .catch(() => {});
  }, []);

  // User-scoped custom profile (STRICTLY FOR CURRENT LOGGED IN USER)
  const userProfileStorageKey = user?.id ? `vba_custom_profile_${user.id}` : null;
  const [customProfile, setCustomProfile] = useState<{
    name?: string;
    title?: string;
    company?: string;
    avatar?: string | null;
    cover?: string | null;
    companyLogo?: string | null;
    phone?: string;
    userId?: string;
    linkedin?: string;
    facebook?: string;
    zalo?: string;
    website?: string;
    tiktok?: string;
  } | null>(() => {
    if (typeof window === "undefined" || !user?.id) return null;
    try {
      if (userProfileStorageKey) {
        const scoped = localStorage.getItem(userProfileStorageKey);
        if (scoped) {
          const parsed = JSON.parse(scoped);
          if (parsed && (parsed.userId === user.id || !parsed.userId)) return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Re-sync user-scoped profile
  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) {
      setCustomProfile(null);
      return;
    }
    try {
      const scoped = localStorage.getItem(`vba_custom_profile_${user.id}`);
      if (scoped) {
        const parsed = JSON.parse(scoped);
        if (parsed && (parsed.userId === user.id || !parsed.userId)) {
          setCustomProfile(parsed);
          return;
        }
      }
      // Xóa bỏ hoàn toàn cache dùng chung vba_custom_profile để không nhiễm thông tin giữa các tài khoản
      if (localStorage.getItem("vba_custom_profile")) {
        localStorage.removeItem("vba_custom_profile");
      }
    } catch {
      /* ignore */
    }
  }, [user?.id]);

  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const userCover = localStorage.getItem(`vba_member_cover_photo_${user.id}`);
      if (userCover) return userCover;
    }
    return effectiveMember?.coverUrl || (effectiveMember as any)?.cover_url || null;
  });
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    const rawCover = effectiveMember?.coverUrl || (effectiveMember as any)?.cover_url;
    if (rawCover) {
      setCoverPhoto(rawCover);
    } else if (user?.id) {
      const userCover = localStorage.getItem(`vba_member_cover_photo_${user.id}`);
      if (userCover) setCoverPhoto(userCover);
    }
  }, [effectiveMember?.coverUrl, (effectiveMember as any)?.cover_url, user?.id]);

  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined" && user?.id) {
      const userAvatar = localStorage.getItem(`vba_member_avatar_photo_${user.id}`);
      if (userAvatar) return userAvatar;
    }
    return effectiveMember?.avatar || (effectiveMember as any)?.avatarUrl || user?.avatar_url || (user as any)?.user_metadata?.avatar_url || null;
  });
  const [avatarError, setAvatarError] = useState(false);

  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [customShortcutsModalOpen, setCustomShortcutsModalOpen] = useState(false);
  const [allFeaturesModalOpen, setAllFeaturesModalOpen] = useState(false);
  const [createConnectionModalOpen, setCreateConnectionModalOpen] = useState(false);
  const [activeShortcutIds, setActiveShortcutIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SHORTCUT_IDS;
    try {
      const saved =
        localStorage.getItem("ceo1983_home_shortcuts") ||
        localStorage.getItem("vba_user_custom_shortcuts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const legacy = ["messages", "members", "analytics", "opportunities"];
          if (parsed.length === legacy.length && legacy.every((id, idx) => parsed[idx] === id)) {
            return DEFAULT_SHORTCUT_IDS;
          }
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SHORTCUT_IDS;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncShortcuts = () => {
      try {
        const saved =
          localStorage.getItem("ceo1983_home_shortcuts") ||
          localStorage.getItem("vba_user_custom_shortcuts");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const legacy = ["messages", "members", "analytics", "opportunities"];
            if (parsed.length === legacy.length && legacy.every((id, idx) => parsed[idx] === id)) {
              setActiveShortcutIds(DEFAULT_SHORTCUT_IDS);
              return;
            }
            setActiveShortcutIds(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener("ceo1983_shortcuts_changed", syncShortcuts);
    window.addEventListener("storage", syncShortcuts);
    return () => {
      window.removeEventListener("ceo1983_shortcuts_changed", syncShortcuts);
      window.removeEventListener("storage", syncShortcuts);
    };
  }, []);

  const handleSaveShortcuts = (ids: string[]) => {
    setActiveShortcutIds(ids);
    try {
      localStorage.setItem("ceo1983_home_shortcuts", JSON.stringify(ids));
      localStorage.setItem("vba_user_custom_shortcuts", JSON.stringify(ids));
      if (user?.id) {
        localStorage.setItem(`vba_user_custom_shortcuts_${user.id}`, JSON.stringify(ids));
      }
      window.dispatchEvent(new Event("ceo1983_shortcuts_changed"));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  };

  // Event banner carousel slide state (Yêu cầu 1: 1 sự kiện banner to kèm slide chuyển)
  const [eventSlideIndex, setEventSlideIndex] = useState(0);
  const [isEventHovered, setIsEventHovered] = useState(false);
  const eventTouchStartXRef = useRef<number | null>(null);

  // News carousel slide state (Yêu cầu 3: 1 tin tức duy nhất full màn hình kèm slide chuyển tin liên tục)
  const [newsSlideIndex, setNewsSlideIndex] = useState(0);
  const [isNewsHovered, setIsNewsHovered] = useState(false);
  const newsTouchStartXRef = useRef<number | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const uId = user?.id;
      const userLogo = uId ? localStorage.getItem(`vba_member_company_logo_${uId}`) : null;
      const genLogo = localStorage.getItem("vba_member_company_logo");
      const customProf = uId ? localStorage.getItem(`vba_custom_profile_${uId}`) : localStorage.getItem("vba_custom_profile");
      let cpLogo = null;
      try { cpLogo = customProf ? JSON.parse(customProf)?.companyLogo : null; } catch {}
      const myMem = localStorage.getItem("vba_my_member");
      let mmLogo = null;
      try { mmLogo = myMem ? (JSON.parse(myMem)?.companyLogoUrl || JSON.parse(myMem)?.companyLogo) : null; } catch {}

      return (
        userLogo ||
        genLogo ||
        cpLogo ||
        mmLogo ||
        (effectiveMember as any)?.companyLogoUrl ||
        (effectiveMember as any)?.companyLogo ||
        null
      );
    }
    return (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo || null;
  });
  const [companyLogoError, setCompanyLogoError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userLogo = user?.id ? localStorage.getItem(`vba_member_company_logo_${user.id}`) : null;
    const cpLogo = customProfile?.companyLogo;
    const sLogo = (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo;

    const resolved = userLogo || cpLogo || sLogo;
    if (resolved && !isBlackBackgroundLogo(resolved)) {
      setCompanyLogo(resolved);
    }
    const sAvatar = effectiveMember?.avatar || (effectiveMember as any)?.avatarUrl || user?.avatar_url || (user as any)?.user_metadata?.avatar_url;
    if (sAvatar) setAvatarPhoto(sAvatar);
  }, [
    (effectiveMember as any)?.companyLogoUrl,
    (effectiveMember as any)?.companyLogo,
    customProfile?.companyLogo,
    effectiveMember?.avatar,
    (effectiveMember as any)?.avatarUrl,
    user?.avatar_url,
    (user as any)?.user_metadata?.avatar_url,
    user?.id,
  ]);

  const validLocalLogo = isBlackBackgroundLogo(companyLogo) ? null : companyLogo;
  const validServerLogo = isBlackBackgroundLogo((effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo)
    ? null
    : ((effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo);
  const displayCompanyLogo = validLocalLogo || validServerLogo || "/ceo1983-official-logo.png";

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover">("avatar");
  const [cropImageUrl, setCropImageUrl] = useState("");

  const handleDirectAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCropImageUrl(dataUrl);
        setCropTarget("avatar");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleDirectCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCropImageUrl(dataUrl);
        setCropTarget("cover");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleHomeCropComplete = async (croppedDataUrl: string) => {
    if (cropTarget === "avatar") {
      setAvatarPhoto(croppedDataUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", croppedDataUrl);
        setCustomProfile((prev) => ({ ...(prev || {}), avatar: croppedDataUrl }));
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.avatar = croppedDataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: croppedDataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatar: croppedDataUrl } }));
      toast.success("Đã cập nhật ảnh đại diện thành công!");

      const file = dataUrlToFile(croppedDataUrl, `avatar-${Date.now()}.png`);
      uploadFileToNest(file, "avatars")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            fetchNestApi("/members/me", {
              method: "PATCH",
              body: JSON.stringify({ avatar: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});
    } else {
      setCoverPhoto(croppedDataUrl);
      setCoverError(false);
      try {
        localStorage.setItem("vba_member_cover_photo", croppedDataUrl);
        setCustomProfile((prev) => ({ ...(prev || {}), cover: croppedDataUrl }));
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.coverUrl = croppedDataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: croppedDataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { cover: croppedDataUrl } }));
      toast.success("Đã cập nhật ảnh bìa thành công!");

      const file = dataUrlToFile(croppedDataUrl, `cover-${Date.now()}.png`);
      uploadFileToNest(file, "covers")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            fetchNestApi("/members/me/cover", {
              method: "PATCH",
              body: JSON.stringify({ coverUrl: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});
    }
  };

  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, blob } = await compressImage(file, 400, 400, 0.85);
      setCompanyLogo(dataUrl);

      try {
        localStorage.setItem("vba_member_company_logo", dataUrl);
        if (user?.id) {
          localStorage.setItem(`vba_member_company_logo_${user.id}`, dataUrl);
          const cp = JSON.parse(localStorage.getItem(`vba_custom_profile_${user.id}`) || "{}");
          cp.companyLogo = dataUrl;
          cp.userId = user.id;
          localStorage.setItem(`vba_custom_profile_${user.id}`, JSON.stringify(cp));
        }

        const cpGen = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        cpGen.companyLogo = dataUrl;
        localStorage.setItem("vba_custom_profile", JSON.stringify(cpGen));

        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.companyLogo = dataUrl;
        mem.companyLogoUrl = dataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch (storageErr) {
        console.warn("Storage quota warning:", storageErr);
      }

      window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: dataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { companyLogo: dataUrl } }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: { companyLogo: dataUrl } }));
      toast.success("Đã cập nhật logo công ty thành công!");

      uploadFileToNest(blob, file.name || "company-logo.png")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            setCompanyLogo(uploadedUrl);
            try {
              localStorage.setItem("vba_member_company_logo", uploadedUrl);
              if (user?.id) {
                localStorage.setItem(`vba_member_company_logo_${user.id}`, uploadedUrl);
                const cp = JSON.parse(localStorage.getItem(`vba_custom_profile_${user.id}`) || "{}");
                cp.companyLogo = uploadedUrl;
                localStorage.setItem(`vba_custom_profile_${user.id}`, JSON.stringify(cp));
              }
              const cpGen = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
              cpGen.companyLogo = uploadedUrl;
              localStorage.setItem("vba_custom_profile", JSON.stringify(cpGen));
            } catch {}
            window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: uploadedUrl }));
            window.dispatchEvent(new CustomEvent("profile-updated", { detail: { companyLogo: uploadedUrl } }));
            fetchNestApi("/members/me", {
              method: "PATCH",
              body: JSON.stringify({ companyLogo: uploadedUrl, companyLogoUrl: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});
    } catch {
      toast.error("Không thể tải logo công ty");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      reloadNotifs();
    };
    const handleProfileUpdate = (e?: any) => {
      try {
        const detail = e?.detail;
        if (detail && typeof detail === "object") {
          if (detail.avatar) setAvatarPhoto(detail.avatar);
          if (detail.cover) setCoverPhoto(detail.cover);
          const newLogo = detail.companyLogo || detail.companyLogoUrl;
          if (newLogo && !isBlackBackgroundLogo(newLogo)) {
            setCompanyLogo(newLogo);
            if (user?.id) {
              try { localStorage.setItem(`vba_member_company_logo_${user.id}`, newLogo); } catch {}
            }
          }
          if (detail.name || detail.title || detail.company) {
            setCustomProfile(detail);
            return;
          }
        }
        if (user?.id) {
          const scoped = localStorage.getItem(`vba_custom_profile_${user.id}`);
          if (scoped) {
            const parsed = JSON.parse(scoped);
            if (parsed && (parsed.userId === user.id || !parsed.userId)) {
              setCustomProfile(parsed);
              return;
            }
          }
        }
        const generic = localStorage.getItem("vba_custom_profile");
        if (generic) {
          const parsedGen = JSON.parse(generic);
          if (parsedGen && (!parsedGen.userId || parsedGen.userId === user?.id)) {
            setCustomProfile(parsedGen);
          }
        }
      } catch {}
    };
    const handleCoverUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setCoverPhoto(detailUrl);
        } else {
          const userCover = user?.id ? localStorage.getItem(`vba_member_cover_photo_${user.id}`) : null;
          const genCover = localStorage.getItem("vba_member_cover_photo");
          if (userCover || genCover) setCoverPhoto(userCover || genCover);
        }
        if (user?.id) {
          fetchNestApi<any>("/members/me").then((live) => { if (live) setDirectMember(live); }).catch(() => {});
        }
      } catch {}
    };
    const handleAvatarUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setAvatarPhoto(detailUrl);
        } else {
          const userAvatar = user?.id ? localStorage.getItem(`vba_member_avatar_photo_${user.id}`) : null;
          const genAvatar = localStorage.getItem("vba_member_avatar_photo");
          if (userAvatar || genAvatar) setAvatarPhoto(userAvatar || genAvatar);
        }
        if (user?.id) {
          fetchNestApi<any>("/members/me").then((live) => { if (live) setDirectMember(live); }).catch(() => {});
        }
      } catch {}
    };
    const handleLogoUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string" && !isBlackBackgroundLogo(detailUrl)) {
          setCompanyLogo(detailUrl);
        } else {
          const userLogo = user?.id ? localStorage.getItem(`vba_member_company_logo_${user.id}`) : null;
          const genLogo = localStorage.getItem("vba_member_company_logo");
          const target = userLogo || genLogo;
          if (target && !isBlackBackgroundLogo(target)) {
            setCompanyLogo(target);
          }
        }
      } catch {}
    };
    window.addEventListener("notifications-updated", handleUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_profile_updated", handleProfileUpdate);
    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("vba_member_avatar_updated", handleAvatarUpdate);
    window.addEventListener("vba_member_company_logo_updated", handleLogoUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("notifications-updated", handleUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_profile_updated", handleProfileUpdate);
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("vba_member_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("vba_member_company_logo_updated", handleLogoUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [reloadNotifs, user?.id]);

  // Priority-driven resolution: Custom Profile (instant reactivity) > Real Member Record from DB > Real Auth User Name > Fallback
  const realUserName = (user as any)?.name || (user as any)?.user_metadata?.full_name;
  const isGenericMemberName = !effectiveMember?.name || effectiveMember.name === "Thành viên mới" || effectiveMember.name === "Hội viên CLB CEO 1983";
  const validCustomName = (customProfile?.userId === user?.id || !customProfile?.userId) ? customProfile?.name?.trim() : undefined;
  
  const displayName = validCustomName || ((!isGenericMemberName && effectiveMember?.name)
    ? effectiveMember.name
    : (realUserName || effectiveMember?.name || (user as any)?.username || "Hội viên CLB CEO 1983"));

  const displayTitle = customProfile?.title?.trim() || effectiveMember?.title || (effectiveMember as any)?.position || (isEn ? "Official Member" : "Hội viên chính thức");
  const displayPhone =
    (customProfile as any)?.phone?.trim() ||
    effectiveMember?.phone ||
    (user as any)?.phone ||
    (user as any)?.user_metadata?.phone ||
    "";
  const rawCompany = customProfile?.company?.trim() || (effectiveMember as any)?.companyName || (effectiveMember as any)?.company || (effectiveMember as any)?.businessName;
  const isOldSeedCompany = rawCompany && ((rawCompany.includes("Phạm Văn Vũ") && !displayName.includes("Phạm Văn Vũ")));
  const displayCompany = (!rawCompany || isOldSeedCompany) ? "CLB Doanh Nhân CEO 1983" : rawCompany;
  const rawAvatar =
    avatarPhoto ||
    customProfile?.avatar ||
    effectiveMember?.avatar ||
    (user as any)?.avatar_url ||
    (user as any)?.user_metadata?.avatar_url ||
    null;
  const displayAvatar = rawAvatar ? (resolveMediaUrl(rawAvatar) || rawAvatar) : null;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!effectiveMember?.code) return;
    navigator.clipboard.writeText(effectiveMember.code);
    setCopied(true);
    toast.success(isEn ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Real events from server
  const displayEvents: MyEvent[] = serverEvents || [];

  // Auto-play timer cho Slide sự kiện nổi bật (Yêu cầu 1: 1 sự kiện banner to kèm slide)
  useEffect(() => {
    if (isEventHovered || displayEvents.length <= 1) return;
    const timer = setInterval(() => {
      setEventSlideIndex((prev) => (prev + 1) % displayEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isEventHovered, displayEvents.length]);

  // Auto-play timer cho Slide Tin tức CLB (Yêu cầu 3: 1 tin tức full width chuyển tin liên tục mỗi 4.5s)
  useEffect(() => {
    const listLen = combinedNews.length > 0 ? combinedNews.length : 1;
    if (isNewsHovered || listLen <= 1) return;
    const timer = setInterval(() => {
      setNewsSlideIndex((prev) => (prev + 1) % listLen);
    }, 4500);
    return () => clearInterval(timer);
  }, [isNewsHovered, combinedNews.length]);

  const totalOpportunitiesCount = opportunities.length;
  const totalProductsCount = products.length;

  // Tính tổng giá trị cơ hội giao thương & tổng giá trị sản phẩm sàn thương mại
  const totalOpportunitiesValue = useMemo(() => {
    let sum = 0;
    for (const o of opportunities) {
      if (typeof o.estimatedValue === "number" && o.estimatedValue > 0) {
        sum += o.estimatedValue;
      } else if (o.value) {
        const clean = o.value.toLowerCase().replace(/,/g, ".");
        const matchTy = clean.match(/([\d.]+)\s*tỷ/);
        const matchTrieu = clean.match(/([\d.]+)\s*triệu/);
        if (matchTy) {
          sum += parseFloat(matchTy[1]) * 1_000_000_000;
        } else if (matchTrieu) {
          sum += parseFloat(matchTrieu[1]) * 1_000_000;
        } else {
          const num = parseInt(clean.replace(/[^\d]/g, ""), 10);
          if (!isNaN(num) && num > 0) sum += num;
        }
      }
    }
    if (sum === 0) {
      return "0 đ";
    }
    if (sum >= 1_000_000_000) {
      return `${(sum / 1_000_000_000).toFixed(1).replace(".0", "")} Tỷ đ`;
    }
    return `${(sum / 1_000_000).toFixed(0)} Tr đ`;
  }, [opportunities]);

  const totalProductsValue = useMemo(() => {
    let sum = 0;
    for (const p of products) {
      const priceVal = (p as any).priceNumber ?? (p as any).memberPrice ?? p.price;
      if (typeof priceVal === "number" && priceVal > 0) {
        sum += priceVal;
      } else if (typeof priceVal === "string") {
        const clean = priceVal.replace(/[^\d]/g, "");
        const num = parseInt(clean, 10);
        if (!isNaN(num) && num > 0) {
          sum += num;
        }
      }
    }
    if (sum === 0) {
      return "0 đ";
    }
    if (sum >= 1_000_000_000) {
      return `${(sum / 1_000_000_000).toFixed(1).replace(".0", "")} Tỷ đ`;
    }
    return `${(sum / 1_000_000).toFixed(0)} Tr đ`;
  }, [products]);

  return (
    <div
      className="w-full max-w-full min-h-screen relative bg-Backgrounds-Primary dark:bg-slate-950 flex flex-col justify-start items-start pb-28 transition-colors duration-300"
      style={{
        backgroundImage: "var(--festival-bg-image, none)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <SeasonalEventHeader />
      {/* Hidden inputs cho phép click trực tiếp để upload */}
      <input type="file" ref={avatarFileInputRef} className="hidden" accept="image/*" onChange={handleDirectAvatarUpload} />
      <input type="file" ref={coverFileInputRef} className="hidden" accept="image/*" onChange={handleDirectCoverUpload} />
      <input type="file" ref={logoFileInputRef} className="hidden" accept="image/*" onChange={handleDirectLogoUpload} />

      {/* ── TOP HEADER (Logo + Xin chào, MemberName + Chuông thông báo - Chuẩn iOS Safe Area) ── */}
      <div className="self-stretch flex flex-col justify-start items-center">
        <div
          data-type="1"
          style={{
            paddingTop: "calc(max(env(safe-area-inset-top, 0px), 48px) + 6px)",
          }}
          className="self-stretch px-4 pb-2.5 bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] flex justify-between items-center overflow-hidden sticky top-0 z-30 border-b border-slate-100"
        >
          <div className="flex justify-start items-center gap-2.5">
            <div className="w-14 h-9 relative shrink-0">
              <img
                className="w-14 h-9 left-0 top-0 absolute object-contain mix-blend-multiply"
                src="/images/ceo1983/logo-ceo-1983.png"
                alt="Logo CEO 1983"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/ceo1983-official-logo.png";
                }}
              />
            </div>
            <div className="inline-flex flex-col justify-center items-start gap-px">
              <div className="text-slate-600 text-xs font-normal font-['Inter'] leading-4">Xin chào,</div>
              <div className="text-slate-900 text-sm font-semibold font-['Inter'] leading-5 truncate max-w-[170px]">
                {displayName || "Trần Tuấn Anh"}
              </div>
            </div>
          </div>
          <Link
            to="/association/notifications"
            className="relative p-2 rounded-xl border border-orange-200 bg-orange-50/50 inline-flex justify-center items-center hover:scale-105 active:scale-95 transition shadow-xs"
            aria-label="Thông báo"
          >
            <img src="/icons/home/notification-01.svg" className="size-5" alt="Thông báo" />
            <div className="px-1.5 py-0.5 -right-1.5 -top-1.5 absolute bg-[#EF4444] rounded-[100px] inline-flex justify-center items-center overflow-hidden ring-1 ring-white shadow-xs">
              <div className="text-center text-white text-[10px] font-bold font-['Inter'] leading-3">
                {unreadNotifCount > 9 ? "9+" : (unreadNotifCount || "9+")}
              </div>
            </div>
          </Link>
        </div>

        {/* ── THẺ HỘI VIÊN CHÍNH THỨC HERO CARD THEO TONE MÀU ĐỘNG BRAND THEME ── */}
        <div className="self-stretch px-4 pt-3 flex flex-col justify-start items-start gap-2.5">
          <div
            onClick={() => setProfileSheetOpen(true)}
            style={{
              background: !isDark
                ? `linear-gradient(135deg, ${brandColorTheme.lightBg} 0%, #FFFFFF 65%, ${brandColorTheme.lightBg} 100%)`
                : brandColorTheme.gradientCard,
              borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorder,
              boxShadow: !isDark
                ? `0px 4px 16px 0px ${brandColorTheme.primaryColor}20`
                : `0px 4px 16px 0px ${brandColorTheme.primaryColor}35`,
            }}
            className="self-stretch h-56 relative rounded-[20px] border overflow-hidden cursor-pointer active:scale-[0.99] transition duration-200 group"
          >
            {/* Cover Banner */}
            <div
              style={{ borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorderSoft }}
              className="w-full h-24 left-0 top-0 absolute bg-slate-100 dark:bg-slate-800/80 rounded-tl-2xl rounded-tr-2xl border-b overflow-hidden"
            >
              {coverPhoto && !coverError ? (
                <>
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={resolveMediaUrl(coverPhoto) || coverPhoto}
                    alt="Banner"
                    onError={() => setCoverError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 select-none">
                  <span className="text-xs font-semibold">Chưa có ảnh bìa</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Chạm để tải ảnh bìa</span>
                </div>
              )}
            </div>

            {/* Avatar overlapping cover */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                avatarFileInputRef.current?.click();
              }}
              className="size-16 left-4 top-[58px] absolute bg-slate-900 dark:bg-slate-950 rounded-full border-[3px] border-white dark:border-slate-900 shadow-md inline-flex justify-center items-center overflow-hidden cursor-pointer"
            >
              {displayAvatar && !avatarError ? (
                <img src={displayAvatar} alt={displayName} onError={() => setAvatarError(true)} className="size-full object-cover" />
              ) : (
                <div
                  style={{ background: brandColorTheme.gradientPrimary }}
                  className="w-full h-full flex flex-col items-center justify-center text-white text-[9px] font-bold text-center leading-tight p-1 select-none"
                  title="Chưa có avatar"
                >
                  <span>Chưa có</span>
                  <span>avatar</span>
                </div>
              )}
            </div>

            {/* Member Info: Name & Role Badge */}
            <div className="left-4 top-[128px] absolute inline-flex flex-col justify-start items-start gap-1 max-w-[240px]">
              <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                <div className="text-slate-900 dark:text-white text-lg font-bold font-['Inter'] leading-6 truncate">
                  {displayName || "Trần Tuấn Anh"}
                </div>
                <img
                  src="/icons/home/security-check.svg"
                  className="size-4 shrink-0"
                  style={{ filter: `drop-shadow(0 0 4px ${brandColorTheme.primaryColor}80)` }}
                  alt="Xác thực"
                />
              </div>
              <div
                style={{
                  backgroundColor: !isDark ? brandColorTheme.lightBg : `${brandColorTheme.primaryColor}25`,
                  borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorderSoft,
                  color: !isDark ? brandColorTheme.primaryColor : brandColorTheme.accentLight,
                }}
                className="px-2.5 py-[2px] border rounded-full inline-flex justify-start items-center"
              >
                <div className="text-xs font-semibold font-['Inter'] leading-4">
                  {displayTitle || "CEO"}
                </div>
              </div>
            </div>

            {/* Quick Edit Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickEditOpen(true);
              }}
              style={{
                borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorderSoft,
              }}
              className="w-8 h-8 p-1.5 right-4 top-[106px] absolute rounded-xl border bg-white/95 dark:bg-slate-800/90 shadow-2xs inline-flex justify-center items-center hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <img src="/icons/home/edit-04.svg" className="size-4" alt="Chỉnh sửa" />
            </button>

            {/* Member Phone */}
            <div className="left-4 top-[188px] absolute inline-flex justify-start items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" style={{ color: brandColorTheme.primaryColor }} />
              <div className="text-slate-800 dark:text-slate-200 text-sm font-semibold font-['Inter'] leading-5 tracking-wide">
                {displayPhone || "0393631546"}
              </div>
            </div>
          </div>
        </div>

        {/* ── TÍNH NĂNG NHANH THEO MOCKUP JSX & TONE THEME ĐỘNG ── */}
        <div id="tour-quick-actions" className="self-stretch flex flex-col justify-start items-start pt-4">
          <div className="self-stretch px-4 inline-flex justify-between items-center">
            <div className="text-slate-900 dark:text-white text-base font-semibold font-['Inter'] leading-5">
              Tính năng nhanh
            </div>
            <button
              type="button"
              onClick={() => setAllFeaturesModalOpen(true)}
              style={{
                backgroundColor: !isDark ? brandColorTheme.lightBg : `${brandColorTheme.primaryColor}20`,
                borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorderSoft,
                color: brandColorTheme.primaryColor,
              }}
              className="px-2.5 py-1 rounded-lg border flex justify-start items-center gap-1.5 cursor-pointer hover:opacity-90 transition"
            >
              <div className="text-xs font-semibold font-['Inter'] leading-5">
                Xem tất cả
              </div>
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="self-stretch px-4 pt-3.5 pb-2 grid grid-cols-4 gap-2">
            {activeShortcutIds.slice(0, 4).map((id) => {
              const item = ALL_SHORTCUT_OPTIONS.find((s) => s.id === id) || {
                id,
                name: "Tính năng",
                desc: "",
                to: "/association",
                iconName: "Sparkles",
              };

              const isConnectModal = item.to === "#connect";
              const isAlarmModal = item.to === "#alarm";

              const badgeCount =
                item.id === "members"
                  ? (directoryMembers.length > 0 ? directoryMembers.length : null)
                  : item.id === "opportunities"
                  ? (totalOpportunitiesCount > 0 ? totalOpportunitiesCount : null)
                  : null;

              const content = (
                <div className="w-full inline-flex flex-col justify-start items-center gap-1.5 group cursor-pointer relative">
                  <div
                    style={{
                      backgroundColor: !isDark ? brandColorTheme.lightBg : `${brandColorTheme.primaryColor}20`,
                      borderColor: !isDark ? brandColorTheme.lightBorder : brandColorTheme.darkBorderSoft,
                    }}
                    className="size-14 border rounded-2xl inline-flex justify-center items-center shadow-xs group-hover:scale-105 transition relative"
                  >
                    {getShortcutIcon(item.iconName, "size-6", brandColorTheme.primaryColor)}

                    {badgeCount !== null && (
                      <div className="px-1.5 py-0.5 right-[-4px] top-[-6px] absolute bg-[#EF4444] rounded-[100px] flex justify-center items-center overflow-hidden ring-1 ring-white dark:ring-slate-900 shadow-xs">
                        <div className="text-center text-white text-[10px] font-bold font-['Inter'] leading-3">
                          {badgeCount}
                        </div>
                      </div>
                    )}
                    {item.badge && badgeCount === null && (
                      <div className={`px-1.5 py-0.2 right-[-4px] top-[-6px] absolute ${item.badgeColor || "bg-amber-500 text-slate-900"} rounded-full text-[9px] font-black uppercase ring-1 ring-white dark:ring-slate-900 shadow-xs`}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <div className="text-center text-slate-800 dark:text-slate-200 text-xs font-medium font-['Inter'] leading-4 line-clamp-1 truncate max-w-full">
                    {item.name}
                  </div>
                </div>
              );

              if (isConnectModal) {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCreateConnectionModalOpen(true)}
                    className="w-full text-center p-0 bg-transparent border-none cursor-pointer"
                  >
                    {content}
                  </button>
                );
              }

              if (isAlarmModal) {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlarmModalOpen(true)}
                    className="w-full text-center p-0 bg-transparent border-none cursor-pointer"
                  >
                    {content}
                  </button>
                );
              }

              const [path, queryString] = item.to.split("?");
              const searchObj = queryString
                ? Object.fromEntries(new URLSearchParams(queryString))
                : undefined;

              return (
                <Link
                  key={id}
                  to={path}
                  search={searchObj}
                  className="w-full text-center cursor-pointer block"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (SỰ KIỆN, ƯU ĐÃI, CƠ HỘI, SÀN TM, TIN TỨC) ── */}
      <div className="self-stretch px-4 pt-3 flex flex-col justify-start items-start gap-4">
        {/* ── 1. SỰ KIỆN SẮP TỚI: BANNER POSTER THEO CHUẨN CEO 1983 TONE CAM ── */}
        <div className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <Link to="/association/events" className="flex items-center gap-1.5 group cursor-pointer">
              <Calendar className="size-4 text-orange-500 shrink-0" />
              <h2 className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                {isEn ? "Upcoming Events" : "Sự kiện sắp tới"}
              </h2>
            </Link>
            <Link to="/association/events" className="flex items-center gap-1 text-[12px] font-bold text-orange-600 dark:text-orange-400 hover:underline p-1">
              <span>{isEn ? "See all" : "Xem tất cả"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Poster Grid: Hiển thị đúng số sự kiện thực tế từ database CRM, tối đa 5 sự kiện */}
          {displayEvents.length === 0 ? (
            <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-orange-200 dark:border-slate-700 bg-orange-50/30 dark:bg-slate-900/50">
              <Calendar className="mx-auto h-7 w-7 text-orange-500/60 mb-1.5" />
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                {isEn ? "No upcoming events scheduled" : "Chưa có sự kiện mới được lên lịch"}
              </p>
            </div>
          ) : (
            <div
              className="relative w-full overflow-hidden rounded-3xl group select-none"
              onMouseEnter={() => setIsEventHovered(true)}
              onMouseLeave={() => setIsEventHovered(false)}
              onTouchStart={(e) => {
                eventTouchStartXRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (eventTouchStartXRef.current === null) return;
                const diff = eventTouchStartXRef.current - e.changedTouches[0].clientX;
                if (diff > 45) {
                  setEventSlideIndex((prev) => (prev + 1) % displayEvents.length);
                } else if (diff < -45) {
                  setEventSlideIndex((prev) => (prev === 0 ? displayEvents.length - 1 : prev - 1));
                }
                eventTouchStartXRef.current = null;
              }}
            >
              {(() => {
                const currentEv = displayEvents[eventSlideIndex % displayEvents.length] || displayEvents[0];
                const realTitle = currentEv.title;
                const rawImg = (currentEv as any).image;
                const fallbackImg = defaultEventImages[eventSlideIndex % defaultEventImages.length];
                const realImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : fallbackImg;

                return (
                  <Link
                    to="/association/events"
                    search={{ eventId: currentEv.id }}
                    className="relative block w-full h-[185px] sm:h-[210px] rounded-3xl overflow-hidden shadow-lg border border-orange-400/40 bg-slate-900 group"
                  >
                    <img
                      src={realImg}
                      alt={realTitle}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackImg;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

                    {/* Top badging: Countdown + Slide Index */}
                    <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5">
                        <EventCountdownMiniBadge event={currentEv} index={eventSlideIndex} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                        {(eventSlideIndex % displayEvents.length) + 1} / {displayEvents.length}
                      </span>
                    </div>

                    {/* Bottom information */}
                    <div className="absolute inset-x-3.5 bottom-3.5 z-10 flex flex-col gap-1.5">
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2 group-hover:text-amber-200 transition-colors">
                        {realTitle}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-medium text-white">
                            <Clock className="size-3.5 text-orange-400 shrink-0" />
                            {(() => {
                              const evAny = currentEv as any;
                              const sTime = evAny?.startTime || evAny?.start_time;
                              const eTime = evAny?.endTime || evAny?.end_time;
                              if (sTime && eTime && sTime !== "00:00" && eTime !== "00:00") {
                                return `${sTime} - ${eTime}`;
                              }
                              if (sTime && sTime !== "00:00") {
                                return `${sTime} - 17:30`;
                              }
                              const t = currentEv.time;
                              if (t && t.includes("-") && !t.includes("00:00 - 00:00")) return t;
                              if (t && t !== "00:00") return `${t} - 17:30`;

                              if (currentEv.date) {
                                try {
                                  const d = new Date(currentEv.date);
                                  if (!isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
                                    const hh = String(d.getHours()).padStart(2, "0");
                                    const mm = String(d.getMinutes()).padStart(2, "0");
                                    return `${hh}:${mm} - 21:30`;
                                  }
                                } catch {}
                              }

                              const tl = realTitle.toLowerCase();
                              if (tl.includes("golf")) return "06:00 - 15:30";
                              if (tl.includes("gala") || tl.includes("kỷ niệm") || tl.includes("đại hội")) return "18:00 - 22:00";
                              if (tl.includes("tọa đàm") || tl.includes("workshop") || tl.includes("diễn đàn")) return "08:30 - 11:45";
                              if (tl.includes("caravan")) return "07:00 - 18:00";
                              return "08:00 - 17:30";
                            })()}
                          </span>
                          <span className="truncate max-w-[150px] text-slate-300 text-[11px]">
                            {(currentEv as any).location || (currentEv as any).place || (currentEv as any).venue || "Hà Nội"}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E0592A] to-[#f97316] hover:from-[#c94b20] hover:to-[#ea580c] shadow-md transition border border-white/20 select-none">
                          <span className="font-extrabold text-[11.5px] leading-none text-white" style={{ color: "#ffffff" }}>
                            Chi tiết
                          </span>
                          <ChevronRight className="size-3.5 stroke-[3] text-white" style={{ color: "#ffffff" }} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* Prev / Next buttons if multiple events */}
              {displayEvents.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEventSlideIndex((prev) => (prev === 0 ? displayEvents.length - 1 : prev - 1));
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md cursor-pointer transition active:scale-95"
                    title="Sự kiện trước"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEventSlideIndex((prev) => (prev + 1) % displayEvents.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md cursor-pointer transition active:scale-95"
                    title="Sự kiện sau"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}

              {/* Dots indicator */}
              {displayEvents.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  {displayEvents.slice(0, 8).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEventSlideIndex(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        eventSlideIndex % displayEvents.length === idx
                          ? "w-6 h-1.5 bg-orange-500"
                          : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={`Sự kiện ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ƯU ĐÃI RIÊNG HỘI VIÊN & ĐỐI TÁC: CAROUSEL SLIDER (3 ƯU ĐÃI + SINH NHẬT + BIỂU DƯƠNG NĂM) ── */}
        <div className="self-stretch">
          <MemberPerksCarousel />
        </div>

        {/* ── 2. CƠ HỘI GIAO THƯƠNG NỘI KHỐI (1 HÀNG TỐI ƯU GỌN GÀNG VỚI 3 BIỂU ĐỒ TRÒN & POPUP) ── */}
        <div className="w-full flex flex-col gap-3">
          <HomeOpportunityRowWidget
            opportunities={opportunities || []}
            totalOpportunitiesCount={totalOpportunitiesCount}
            totalOpportunitiesValue={totalOpportunitiesValue}
            totalDealsWonValue={
              analyticsOverview?.summary?.totalDealsWonValue
                ? `${(analyticsOverview.summary.totalDealsWonValue / 1000000000).toFixed(1)} Tỷ đ`
                : "12.8 Tỷ đ"
            }
          />
        </div>

        {/* ── 3. SÀN THƯƠNG MẠI DOANH NGHIỆP HỘI VIÊN (ĐẨY XUỐNG DƯỚI TOÀN ĐỘ RỘNG) ── */}
        <div className="w-full flex flex-col gap-3">
          <Link
            to="/association/products"
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-[0px_4px_16px_0px_rgba(234,88,12,0.08)] border border-slate-200 dark:border-slate-800 flex flex-col gap-3 group hover:border-orange-400 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-orange-500 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Sàn Thương Mại Nội Bộ
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sản phẩm &amp; dịch vụ ưu đãi độc quyền hội viên
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                <span>Gian hàng</span>
                <ChevronRight className="size-3.5" />
              </div>
            </div>

            {/* Banner with product count overlay */}
            <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-slate-900">
              <img
                src="/images/ceo1983/marketplace-banner.jpg"
                alt="Sàn thương mại"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-white">
                <div>
                  <div className="text-xs font-bold text-white">
                    📦 {allMarketplaceProducts.length || products.length} sản phẩm &amp; gói thầu niêm yết
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Tổng giá trị: <span className="font-bold text-emerald-400">{totalProductsValue || "0 đ"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* DOANH NGHIỆP MỚI GIA NHẬP */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
            <div className="flex justify-start items-center gap-2">
              <Users className="size-4 text-orange-500 shrink-0" />
              <span className="text-slate-800 dark:text-white text-sm font-bold font-sans leading-5">HỘI VIÊN MỚI GIA NHẬP</span>
            </div>
            <Link to="/association/members" className="p-1 rounded-full bg-orange-50 dark:bg-slate-800 flex justify-center items-center hover:bg-orange-100 transition">
              <ChevronRight className="size-4 text-slate-500 dark:text-slate-400" />
            </Link>
          </div>

          <div className="self-stretch overflow-x-auto no-scrollbar flex items-start gap-2.5 pb-1">
            {(!directoryMembers || directoryMembers.length === 0) ? (
              <div className="w-full py-4 text-center text-xs text-slate-400">
                Chưa có doanh nghiệp mới gia nhập trong tháng này
              </div>
            ) : (
              directoryMembers.slice(0, 8).map((m, i) => {
              const pName = (m as any).personName || (m as any).contact || m.name || "Hội viên";
              const cName = (m as any).company || ((m as any).type === 'company' ? m.name : '') || (m as any).companyName || "Doanh nghiệp hội viên";
              const rawAvatar = (m as any).avatar || (m as any).avatarUrl || (m as any).avatar_url;
              const resolvedAv = resolveMediaUrl(rawAvatar);
              return (
                <button
                  type="button"
                  key={(m as any).id || (m as any).code || i}
                  onClick={() => setSelectedMemberForProfile(m)}
                  className="w-48 h-14 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xs outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-800 flex justify-start items-center gap-2.5 shrink-0 overflow-hidden hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition cursor-pointer text-left"
                  title={`Xem hồ sơ chi tiết của ${pName}`}
                >
                  <div className="size-9 bg-orange-500 rounded-xl outline outline-1 outline-orange-300 overflow-hidden flex justify-center items-center shrink-0 shadow-2xs">
                    {resolvedAv ? (
                      <img src={resolvedAv} alt={pName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold font-sans">{initials(pName)}</span>
                    )}
                  </div>
                  <div className="inline-flex flex-col justify-start items-start min-w-0">
                    <span className="text-slate-800 dark:text-white text-xs font-bold truncate max-w-[120px]">{pName}</span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{cName}</span>
                  </div>
                </button>
              );
            }))}
          </div>
        </div>

        {/* TIN TỨC CÂU LẠC BỘ: CHỈ HIỆN 1 TIN TỨC ĐỘ RỘNG NGANG FULL MÀN HÌNH VÀ SLIDE CHUYỂN LIÊN TỤC (YÊU CẦU 3) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
            <div className="flex justify-start items-center gap-2">
              <Newspaper className="size-4 text-orange-500 shrink-0" />
              <span className="text-slate-800 dark:text-white text-sm font-bold font-sans leading-5">TIN TỨC CÂU LẠC BỘ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/60 rounded-full outline outline-1 outline-orange-200 dark:outline-orange-800 text-orange-700 dark:text-orange-300 text-[10px] font-bold">
                {combinedNews.length > 0 ? `+${combinedNews.length} BẢN TIN` : "0 BẢN TIN"}
              </span>
              <Link to="/association/news" className="p-1 rounded-full bg-orange-50 dark:bg-slate-800 flex justify-center items-center hover:bg-orange-100 transition">
                <ChevronRight className="size-4 text-slate-500 dark:text-slate-400" />
              </Link>
            </div>
          </div>

          {/* 1 TIN TỨC DUY NHẤT FULL CHIỀU RỘNG MÀN HÌNH VỚI AUTO-SLIDE CAROUSEL */}
          {combinedNews.length === 0 ? (
            <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-orange-200 dark:border-slate-700 bg-orange-50/30 dark:bg-slate-900/50 w-full">
              <Newspaper className="mx-auto h-7 w-7 text-orange-500/60 mb-1.5" />
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                Chưa có bản tin mới từ CLB
              </p>
            </div>
          ) : (() => {
            const newsList = combinedNews;

            const currentIndex = newsSlideIndex % newsList.length;
            const currentNews = newsList[currentIndex] || newsList[0];
            const rawImg = (currentNews as any).image || (currentNews as any).cover;
            const fallbackImg = DEFAULT_NEWS_THUMBNAILS[currentIndex % DEFAULT_NEWS_THUMBNAILS.length] || "/images/ceo1983/Rectangle 6-1.png";
            const realImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : fallbackImg;

            return (
              <div
                className="relative w-full overflow-hidden rounded-3xl select-none group"
                onMouseEnter={() => setIsNewsHovered(true)}
                onMouseLeave={() => setIsNewsHovered(false)}
                onTouchStart={(e) => {
                  newsTouchStartXRef.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (newsTouchStartXRef.current === null) return;
                  const diff = newsTouchStartXRef.current - e.changedTouches[0].clientX;
                  if (diff > 45) {
                    setNewsSlideIndex((prev) => (prev + 1) % newsList.length);
                  } else if (diff < -45) {
                    setNewsSlideIndex((prev) => (prev === 0 ? newsList.length - 1 : prev - 1));
                  }
                  newsTouchStartXRef.current = null;
                }}
              >
                {/* 1 Tin tức Full Width duy nhất */}
                <Link
                  to="/association/news"
                  search={{ articleId: String(currentNews.id) }}
                  className="relative block w-full h-52 sm:h-60 rounded-3xl overflow-hidden shadow-lg border border-orange-300/80 dark:border-orange-500/30 bg-slate-900 group"
                >
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={realImg}
                    alt={currentNews.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackImg;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

                  {/* Header badges: Tag chuyên mục + Vị trí Slide */}
                  <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="size-3" />
                      <span>{(currentNews as any).category || "BẢN TIN HOẠT ĐỘNG"}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                      {currentIndex + 1} / {newsList.length}
                    </span>
                  </div>

                  {/* Bottom info banner */}
                  <div className="absolute inset-x-3.5 bottom-3.5 z-10 flex flex-col gap-1.5">
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {currentNews.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-200 pt-1 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-300 text-[11px] truncate max-w-[130px]">
                          {currentNews.author || "Ban Truyền Thông"}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-amber-300 text-[11px]">
                          <Clock className="size-3 text-amber-300 shrink-0" />
                          {formatNewsDate(currentNews.time)}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-sm transition">
                        <span>Đọc tiếp</span>
                        <ChevronRight className="size-3 stroke-[3]" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Nút Điều Hướng Trái / Phải nếu có nhiều hơn 1 tin */}
                {newsList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewsSlideIndex((prev) => (prev === 0 ? newsList.length - 1 : prev - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md cursor-pointer transition active:scale-95"
                      title="Tin tức trước"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewsSlideIndex((prev) => (prev + 1) % newsList.length);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md cursor-pointer transition active:scale-95"
                      title="Tin tức tiếp theo"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {newsList.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2.5">
                    {newsList.slice(0, 8).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewsSlideIndex(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          currentIndex === idx
                            ? "w-6 h-1.5 bg-orange-500"
                            : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={`Bản tin ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Quét mã QR Check-in sự kiện (Chuẩn Gradient Thương hiệu Tone Cam & Gold) */}
        {canScanEventQr && (
          <div className="self-stretch p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 rounded-[20px] inline-flex justify-between items-center gap-3 overflow-hidden shadow-lg shadow-orange-500/25 border border-orange-300/40 mt-1">
            <div className="size-12 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/40 flex justify-center items-center shrink-0 text-white shadow-inner">
              <QrCode className="size-6.5 text-white" />
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 overflow-hidden min-w-0">
              <span className="text-white text-xs font-extrabold leading-4">
                Quét mã QR Check-in<br />sự kiện & điểm danh
              </span>
              <div className="px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded-3xl inline-flex justify-start items-center gap-1 shadow-xs border border-white/30">
                <ShieldCheck className="size-3 text-white" />
                <span className="text-white text-[9.5px] font-black tracking-wide">BAN SOÁT VÉ CLB</span>
              </div>
            </div>
            <Link
              to="/association/checkin"
              className="px-4 py-2.5 bg-white text-orange-600 font-bold hover:bg-orange-50 rounded-full inline-flex justify-center items-center gap-1.5 shrink-0 shadow-md shadow-black/10 active:scale-95 transition"
            >
              <span className="text-xs font-bold">Quét ngay</span>
              <ChevronRight className="size-3.5 text-orange-600 stroke-[2.5]" />
            </Link>
          </div>
        )}
      </div>

      {/* ── MODAL MÃ QR HỘI VIÊN & QUÉT QR (DUAL TAB) ── */}
      <AssociationMemberQrModal
        open={memberQrModalOpen}
        onClose={() => setMemberQrModalOpen(false)}
        memberCode={
          member?.code ||
          (typeof window !== "undefined"
            ? (() => {
                try {
                  const m = JSON.parse(localStorage.getItem("vba_my_member") || "null");
                  return m?.code || null;
                } catch {
                  return null;
                }
              })()
            : null) ||
          "M1983-292"
        }
        memberName={displayName}
        memberTitle={displayTitle}
        memberCompany={displayCompany}
        memberAvatar={displayAvatar}
      />

      {/* ── POPUP THÔNG TIN CÁ NHÂN TỪ DƯỚI LÊN (ẢNH, PROFILE, LINK FACEBOOK...) ── */}
      <PersonalProfileBottomSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        profile={{
          displayName: displayName || "Hội viên CEO 1983",
          jobTitle: displayTitle || null,
          companyName: displayCompany || null,
          companyLogo: companyLogo || null,
          avatarUrl: displayAvatar || null,
          coverUrl: coverPhoto || null,
          phone: displayPhone || null,
          email: member?.email || user?.email || null,
          address: member?.address || (member as any)?.city || "Hà Nội, Việt Nam",
          bio:
            (member as any)?.bio ||
            (member as any)?.about ||
            (customProfile as any)?.bio ||
            "Hội viên chính thức CLB Doanh Nhân CEO 1983, tích cực giao lưu kết nối và hợp tác giao thương.",
          facebookUrl:
            (customProfile as any)?.facebook ||
            (member as any)?.facebookUrl ||
            (member as any)?.facebook ||
            null,
          linkedinUrl:
            (customProfile as any)?.linkedin ||
            (member as any)?.linkedinUrl ||
            (member as any)?.linkedin ||
            null,
          zaloPhone:
            (customProfile as any)?.zalo ||
            (member as any)?.zaloPhone ||
            displayPhone ||
            null,
          website:
            (customProfile as any)?.website ||
            (member as any)?.website ||
            "https://ceo1983.vn",
          memberCode: member?.code || "CEO1983-VIP",
          isOwner: true,
        }}
        onEdit={() => {
          setProfileSheetOpen(false);
          setQuickEditOpen(true);
        }}
        onOpenQr={() => {
          setProfileSheetOpen(false);
          window.location.href = "/association/card";
        }}
      />

      {/* ── MODAL CHỈNH SỬA NHANH NHƯ FACEBOOK (Req 1 & Req 10) ── */}
      <QuickProfileEditModal
        open={quickEditOpen}
        onClose={() => setQuickEditOpen(false)}
        initialName={displayName}
        initialPhone={(customProfile as any)?.phone || member?.phone || ""}
        initialCompany={displayCompany}
        initialTitle={displayTitle}
        initialAvatar={displayAvatar}
        initialCover={coverPhoto}
        initialCompanyLogo={companyLogo}
        initialLinkedin={
          (customProfile as any)?.linkedin ||
          (member as any)?.linkedinUrl ||
          (member as any)?.linkedin ||
          ""
        }
        initialFacebook={
          (customProfile as any)?.facebook ||
          (member as any)?.facebookUrl ||
          (member as any)?.facebook ||
          ""
        }
        initialZalo={
          (customProfile as any)?.zalo ||
          (member as any)?.zaloPhone ||
          ""
        }
        initialWebsite={
          (customProfile as any)?.website ||
          (member as any)?.website ||
          ""
        }
        initialTiktok={
          (customProfile as any)?.tiktok ||
          (member as any)?.tiktokUrl ||
          ""
        }
        userId={user?.id}
        onSaved={(updated) => {
          setCustomProfile((prev) => ({ ...(prev || {}), ...updated }));
          if (updated.avatar) setAvatarPhoto(updated.avatar);
          if (updated.cover) setCoverPhoto(updated.cover);
          if (updated.companyLogo) {
            setCompanyLogo(updated.companyLogo);
            setCompanyLogoError(false);
          }
          setQuickEditOpen(false);
          if (user?.id) {
            fetchNestApi<any>("/members/me").then((live) => { if (live) setDirectMember(live); }).catch(() => {});
          }
          toast.success("Đã cập nhật thông tin tài khoản thành công!");
        }}
      />

      {/* ── MODAL LIÊN HỆ BAN NGÀNH & HỖ TRỢ (Req 14) ── */}
      <ContactSupportModal
        open={contactSupportOpen}
        onClose={() => setContactSupportOpen(false)}
      />

      {/* ── HƯỚNG DẪN SỬ DỤNG TƯƠNG TÁC TỪNG BƯỚC (BANKING TOUR) ── */}
      <GuidedTourModal
        steps={CEO1983_TOUR_STEPS}
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        storageKey="ceo1983_guided_tour_completed"
      />



      {/* ── HƯỚNG DẪN SỬ DỤNG TƯƠNG TÁC TỪNG BƯỚC & GIỌNG NÓI AUDIO (Req 12) ── */}
      <UserGuideModal
        open={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
      />

      {/* ── POPUP CHÚC MỪNG SINH NHẬT & TẶNG ƯU ĐÃI VIP (Req 4) ── */}
      <BirthdayCelebrationModal member={member} />

      {/* ── MODAL TÙY BIẾN 4 TÍNH NĂNG CHÍNH ── */}
      <CustomHomeShortcutsModal
        isOpen={customShortcutsModalOpen}
        onClose={() => setCustomShortcutsModalOpen(false)}
        selectedIds={activeShortcutIds}
        onSave={handleSaveShortcuts}
      />

      {/* ── BẢN ĐỒ SỐ TƯƠNG TÁC CEO 1983 (TÍNH NĂNG NHANH) ── */}
      <CeoInteractiveMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        members={directoryMembers}
        events={displayEvents}
        meetings={serverEvents}
        myMember={member}
      />

      {/* ── LỊCH & BÁO THỨC HỘI VIÊN ── */}
      <CeoCalendarAlarmModal
        isOpen={alarmModalOpen}
        onClose={() => setAlarmModalOpen(false)}
        events={displayEvents}
        meetings={serverEvents}
      />

      {/* ── TẤT CẢ TÍNH NĂNG CEO 1983 MODAL ── */}
      <AllFeaturesModal
        isOpen={allFeaturesModalOpen}
        onClose={() => setAllFeaturesModalOpen(false)}
        onOpenConnectModal={() => setCreateConnectionModalOpen(true)}
        onOpenMapModal={() => setMapModalOpen(true)}
        onOpenAlarmModal={() => setAlarmModalOpen(true)}
      />

      {/* ── TẠO KẾT NỐI B2B MODAL ── */}
      <CreateConnectionModal
        isOpen={createConnectionModalOpen}
        onClose={() => setCreateConnectionModalOpen(false)}
      />

      {/* ── XEM HỒ SƠ CHI TIẾT HỘI VIÊN MỚI ── */}
      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          onClose={() => setSelectedMemberForProfile(null)}
        />
      )}

      {/* ── CĂN CHỈNH & CẮT ẢNH STUDIO (AVATAR & COVER) ── */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageUrl={cropImageUrl}
        initialShape={cropTarget === "avatar" ? "circle" : "banner"}
        title={cropTarget === "avatar" ? "Căn Chỉnh & Cắt Ảnh Đại Diện" : "Căn Chỉnh & Cắt Ảnh Bìa"}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleHomeCropComplete}
      />
    </div>
  );
}
