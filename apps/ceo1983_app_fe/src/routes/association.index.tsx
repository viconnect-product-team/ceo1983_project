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
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/context/AuthContext";
import { SeasonalEventHeader, getEffectiveThemeOption, syncThemeFromBackend } from "@/components/member/SeasonalEventHeader";
import { useTheme } from "@/lib/theme";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
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
const appIcon = "/ceo1983-emblem-8.png";

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
    badgeText: "100+",
    badgeTextEn: "100+",
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
  const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveThemeOption());

  const { theme } = useTheme();
  const isDark = theme === "dark" || (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    void syncThemeFromBackend();
  }, []);

  const getActionIconStyle = (iconKey: string) => {
    if (!isDark) {
      return {
        backgroundColor: `${effectiveTheme.primaryColor}18`,
        borderColor: `${effectiveTheme.primaryColor}35`,
        color: effectiveTheme.primaryColor,
        boxShadow:
          effectiveTheme.iconStyle === "glow-neon"
            ? `0 0 12px ${effectiveTheme.accentColor}70`
            : undefined,
      };
    }
    // High-contrast, vibrant luminous styling for Dark Mode
    const darkPalette: Record<string, { bg: string; border: string; color: string }> = {
      card: { bg: "rgba(245, 158, 11, 0.18)", border: "rgba(245, 158, 11, 0.45)", color: "#FBBF24" },
      members: { bg: "rgba(56, 189, 248, 0.18)", border: "rgba(56, 189, 248, 0.45)", color: "#38BDF8" },
      checkin: { bg: "rgba(52, 211, 153, 0.18)", border: "rgba(52, 211, 153, 0.45)", color: "#34D399" },
      perks: { bg: "rgba(251, 191, 36, 0.20)", border: "rgba(251, 191, 36, 0.50)", color: "#FDE047" },
      voting: { bg: "rgba(167, 139, 250, 0.18)", border: "rgba(167, 139, 250, 0.45)", color: "#A78BFA" },
      history: { bg: "rgba(96, 165, 250, 0.18)", border: "rgba(96, 165, 250, 0.45)", color: "#60A5FA" },
      marketplace: { bg: "rgba(251, 113, 133, 0.18)", border: "rgba(251, 113, 133, 0.45)", color: "#FB7185" },
      fees: { bg: "rgba(16, 185, 129, 0.18)", border: "rgba(16, 185, 129, 0.45)", color: "#10B981" },
    };
    const item = darkPalette[iconKey] || {
      bg: "rgba(245, 158, 11, 0.18)",
      border: "rgba(245, 158, 11, 0.45)",
      color: effectiveTheme.accentColor || "#FBBF24",
    };
    return {
      backgroundColor: item.bg,
      borderColor: item.border,
      color: item.color,
      boxShadow: `0 0 10px ${item.border}`,
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
      // Dọn dẹp cache rác nếu không đúng user
      const generic = localStorage.getItem("vba_custom_profile");
      if (generic) {
        const parsedGen = JSON.parse(generic);
        if (parsedGen?.userId && parsedGen.userId !== user.id) {
          localStorage.removeItem("vba_custom_profile");
        } else if (parsedGen) {
          setCustomProfile(parsedGen);
          return;
        }
      }
    } catch {
      /* ignore */
    }
  }, [user?.id]);

  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    const uId = user?.id;
    const userLogo = uId ? localStorage.getItem(`vba_member_company_logo_${uId}`) : null;
    const genLogo = localStorage.getItem("vba_member_company_logo");
    const cpLogo = customProfile?.companyLogo;
    const sLogo = (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo;

    const resolved = userLogo || genLogo || cpLogo || sLogo;
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

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, blob } = await compressImage(file, 600, 600, 0.85);
      setAvatarPhoto(dataUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", dataUrl);
        setCustomProfile((prev) => ({ ...(prev || {}), avatar: dataUrl }));
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.avatar = dataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: dataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatar: dataUrl } }));
      toast.success("Đã cập nhật ảnh đại diện thành công!");

      uploadFileToNest(blob, file.name || "avatar.jpg")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            fetchNestApi("/members/me", {
              method: "PATCH",
              body: JSON.stringify({ avatar: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});
    } catch {
      toast.error("Không thể tải ảnh đại diện");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleDirectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, blob } = await compressImage(file, 1200, 675, 0.85);
      setCoverPhoto(dataUrl);
      setCoverError(false);
      try {
        localStorage.setItem("vba_member_cover_photo", dataUrl);
        setCustomProfile((prev) => ({ ...(prev || {}), cover: dataUrl }));
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.coverUrl = dataUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: dataUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { cover: dataUrl } }));
      toast.success("Đã cập nhật ảnh bìa thành công!");

      uploadFileToNest(blob, file.name || "cover.jpg")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            fetchNestApi("/members/me/cover", {
              method: "PATCH",
              body: JSON.stringify({ coverUrl: uploadedUrl }),
            }).catch(() => null);
          }
        })
        .catch(() => {});
    } catch {
      toast.error("Không thể tải ảnh bìa");
    } finally {
      if (e.target) e.target.value = "";
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
        } else if (user?.id) {
          const userCover = localStorage.getItem(`vba_member_cover_photo_${user.id}`);
          if (userCover) setCoverPhoto(userCover);
        }
      } catch {}
    };
    const handleAvatarUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setAvatarPhoto(detailUrl);
        } else if (user?.id) {
          const userAvatar = localStorage.getItem(`vba_member_avatar_photo_${user.id}`);
          if (userAvatar) setAvatarPhoto(userAvatar);
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

  // Priority-driven resolution: Real Member Record from DB > Real Auth User Name > Custom Profile (scoped) > Fallback
  const realUserName = (user as any)?.name || (user as any)?.user_metadata?.full_name;
  const isGenericMemberName = !effectiveMember?.name || effectiveMember.name === "Thành viên mới" || effectiveMember.name === "Hội viên CLB CEO 1983";
  const validCustomName = (customProfile?.userId === user?.id || !customProfile?.userId) ? customProfile?.name?.trim() : undefined;
  
  const displayName = (!isGenericMemberName && effectiveMember?.name)
    ? effectiveMember.name
    : (realUserName || validCustomName || effectiveMember?.name || (user as any)?.username || "Hội viên CLB CEO 1983");

  const displayTitle = effectiveMember?.title || (effectiveMember as any)?.position || effectiveMember?.industry || customProfile?.title?.trim() || (isEn ? "Official Member" : "Hội viên chính thức");
  const displayPhone =
    effectiveMember?.phone ||
    (user as any)?.phone ||
    (user as any)?.user_metadata?.phone ||
    (customProfile as any)?.phone?.trim() ||
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

      {/* ── TOP HEADER (Logo + Thông báo chuông đỏ) ── */}
      <div className="self-stretch flex flex-col justify-start items-center">
        <div className="self-stretch h-16 px-4 bg-white dark:bg-slate-900 border-b-2 border-Backgrounds-Secondary dark:border-slate-800 flex justify-between items-center overflow-hidden sticky top-0 z-30 shadow-xs">
          <img
            className="h-9 w-auto object-contain"
            src="/images/ceo1983/logo-ceo-1983.png"
            alt="Logo CEO 1983"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/ceo1983-logo.png";
            }}
          />
          <Link
            to="/association/notifications"
            className="size-9 relative bg-amber-50 dark:bg-slate-800 rounded-full border border-amber-300/80 dark:border-amber-500/40 flex justify-center items-center hover:scale-105 active:scale-95 transition-transform shadow-2xs"
            aria-label="Thông báo"
          >
            <Bell className="size-5 text-[#003B95] dark:text-amber-400" />
            {unreadNotifCount > 0 && (
              <div className="size-4 -right-1 -top-1 absolute bg-rose-500 rounded-full flex justify-center items-center overflow-hidden shadow-xs ring-1 ring-white dark:ring-slate-900">
                <span className="text-white text-[9.5px] font-bold font-sans leading-3">{unreadNotifCount > 9 ? "9+" : unreadNotifCount}</span>
              </div>
            )}
          </Link>
        </div>
        <div className="self-stretch h-3.5" />

        {/* ── THẺ HỘI VIÊN CHÍNH THỨC HERO CARD ── */}
        <div
          onClick={() => setProfileSheetOpen(true)}
          className="w-[calc(100%-2rem)] mx-4 relative rounded-3xl bg-white dark:bg-[#0B132B] border border-amber-500/25 dark:border-amber-400/20 shadow-[0_10px_30px_-8px_rgba(0,34,79,0.15)] flex flex-col justify-start items-start overflow-hidden cursor-pointer active:scale-[0.99] transition duration-200 group hover:shadow-[0_14px_35px_-8px_rgba(245,158,11,0.22)]"
        >
          {/* Cover Banner */}
          <div className="relative self-stretch h-28 w-full overflow-hidden bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A1224]">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={coverPhoto ? (resolveMediaUrl(coverPhoto) || coverPhoto) : "/images/ceo1983/banner-ceo.png"}
              alt="Banner"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/ceo1983/banner-ceo.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
          </div>

          {/* Card Body: Member name, job title, phone number + quick edit at bottom */}
          <div className="self-stretch px-4 pt-11 pb-3 flex flex-col justify-start items-start gap-1 overflow-hidden relative">
            <h2 className="text-slate-900 dark:text-white text-base font-extrabold font-sans leading-tight truncate w-full">
              {displayName || "Trần Tuấn Anh"}
            </h2>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold leading-4">
              <Briefcase className="size-3.5 shrink-0 text-[#003B95] dark:text-blue-400" />
              <span className="truncate">{displayTitle || "Hội viên Doanh nhân"}</span>
            </div>

            <div className="self-stretch flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold leading-5">
                <Phone className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-sans tracking-wide">
                  {displayPhone || "0901000001"}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickEditOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs border border-amber-500/25"
                title="Chỉnh sửa thông tin"
              >
                <Pencil className="size-3 text-amber-500" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>

          {/* Avatar overlapping cover */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              avatarFileInputRef.current?.click();
            }}
            className="size-18 left-4 top-18 absolute rounded-2xl bg-gradient-to-tr from-[#003B95] to-[#001D4A] ring-3 ring-white dark:ring-[#0B132B] shadow-xl inline-flex justify-center items-center overflow-hidden cursor-pointer hover:brightness-105 transition-transform active:scale-95"
            title="Đổi ảnh đại diện"
          >
            {displayAvatar && !avatarError ? (
              <img src={displayAvatar} alt={displayName} onError={() => setAvatarError(true)} className="size-full object-cover" />
            ) : (
              <span className="text-amber-300 text-xl font-black font-sans leading-none">{initials(displayName)}</span>
            )}
          </div>
        </div>

        {/* ── 4 TÍNH NĂNG CỐT LÕI (CHO PHÉP HỘI VIÊN TÙY BIẾN THEO MONG MUỐN) ── */}
        <div id="tour-quick-actions" className="self-stretch px-3 py-3 flex flex-col justify-start items-start gap-2">
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-['Inter']">
              Tính năng nhanh
            </span>
            <button
              type="button"
              onClick={() => setAllFeaturesModalOpen(true)}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 inline-flex items-center gap-1 transition cursor-pointer border border-amber-500/30"
              title="Xem tất cả tính năng"
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>Xem tất cả tính năng</span>
            </button>
          </div>
          <div className="self-stretch inline-flex justify-between items-start gap-2">
            {activeShortcutIds.map((id) => {
              const def = ALL_SHORTCUT_OPTIONS.find((o) => o.id === id) || ALL_SHORTCUT_OPTIONS[0];
              let badgeVal: string | number | undefined = def.badge;
              let badgeColor = def.badgeColor || "bg-amber-500 text-slate-900";
              if (id === "events" && displayEvents.length > 0) {
                badgeVal = displayEvents.length;
                badgeColor = "bg-amber-500 text-slate-950";
              } else if (id === "members") {
                badgeVal = directoryMembers.length > 0 ? directoryMembers.length : (member ? "12" : "10");
                badgeColor = "bg-[#1F3864] text-white";
              } else if (id === "opportunities" && totalOpportunitiesCount > 0) {
                badgeVal = totalOpportunitiesCount;
                badgeColor = "bg-emerald-600 text-white";
              }

              const isHash = def.to.startsWith("#");
              const iconAndBadge = (
                <div className="size-14 relative rounded-2xl bg-gradient-to-br from-amber-50 to-blue-50 dark:bg-slate-800/90 border border-amber-200/60 dark:border-amber-500/30 flex justify-center items-center group-hover:scale-105 group-hover:border-amber-400 transition-all shadow-xs">
                  <span className="text-[#003B95] dark:text-amber-300">
                    {getShortcutIcon(def.iconName, "size-6")}
                  </span>
                  {badgeVal && (
                    <div className={`px-1.5 py-0.5 right-[-6px] -top-2 absolute rounded-3xl flex justify-start items-start overflow-hidden shadow-xs ring-1 ring-white dark:ring-slate-900 ${badgeColor}`}>
                      <span className="text-[10px] font-black font-sans leading-3">
                        {badgeVal}
                      </span>
                    </div>
                  )}
                </div>
              );

              if (isHash || id === "connect" || def.to === "#connect") {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (def.to === "#map") setMapModalOpen(true);
                      else if (def.to === "#alarm") setAlarmModalOpen(true);
                      else if (def.to === "#connect" || id === "connect") setCreateConnectionModalOpen(true);
                      else setAllFeaturesModalOpen(true);
                    }}
                    className="flex-1 inline-flex flex-col justify-start items-center gap-1.5 group cursor-pointer"
                  >
                    {iconAndBadge}
                    <div className="text-center text-slate-800 dark:text-slate-200 text-xs font-bold font-sans leading-4 tracking-tight truncate max-w-full">
                      {def.name}
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  key={id}
                  to={def.to}
                  className="flex-1 inline-flex flex-col justify-start items-center gap-1.5 group"
                >
                  {iconAndBadge}
                  <div className="text-center text-slate-800 dark:text-slate-200 text-xs font-bold font-sans leading-4 tracking-tight truncate max-w-full">
                    {def.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (SỰ KIỆN, ƯU ĐÃI, CƠ HỘI, SÀN TM, TIN TỨC) ── */}
      <div className="self-stretch px-4 pt-3 flex flex-col justify-start items-start gap-4">
        {/* ── 1. SỰ KIỆN SẮP TỚI: BANNER POSTER THEO CHUẨN CEO 1983 ── */}
        <div className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <Link to="/association/events" className="flex items-center gap-1.5 group cursor-pointer">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-tr from-[#002B70] to-[#003B95] text-amber-300 text-xs border border-amber-500/40 shadow-xs overflow-hidden p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <g clipPath="url(#clip0_29_1175)">
                    <path d="M20.5 7.508V3.5C20.5 3.23478 20.3946 2.98043 20.2071 2.79289C20.0196 2.60536 19.7652 2.5 19.5 2.5H1.5C1.23478 2.5 0.98043 2.60536 0.792893 2.79289C0.605357 2.98043 0.5 3.23478 0.5 3.5V7.508H20.5Z" fill="#C0D9FF"/>
                    <path d="M20.5 4.5V3.5C20.5 3.23478 20.3946 2.98043 20.2071 2.79289C20.0196 2.60536 19.7652 2.5 19.5 2.5H1.5C1.23478 2.5 0.98043 2.60536 0.792893 2.79289C0.605357 2.98043 0.5 3.23478 0.5 3.5V4.5H20.5Z" fill="#EBF3FF"/>
                    <path d="M0.5 7.508V17.5C0.5 17.7652 0.605357 18.0196 0.792893 18.2071C0.98043 18.3946 1.23478 18.5 1.5 18.5H19.5C19.7652 18.5 20.0196 18.3946 20.2071 18.2071C20.3946 18.0196 20.5 17.7652 20.5 17.5V7.5L0.5 7.508Z" fill="white"/>
                    <path d="M9.5 18.5H1.5C1.23478 18.5 0.98043 18.3946 0.792893 18.2071C0.605357 18.0196 0.5 17.7652 0.5 17.5V3.5C0.5 3.23478 0.605357 2.98043 0.792893 2.79289C0.605357 2.98043 1.23478 2.5 1.5 2.5H19.5C19.7652 2.5 20.0196 2.60536 20.2071 2.79289C20.3946 2.98043 20.5 3.23478 20.5 3.5V10" strokeLinecap="round" strokeLinejoin="round" stroke="#002867"/>
                    <path d="M5.5 0.500977V5.50098" strokeLinecap="round" strokeLinejoin="round" stroke="#002867"/>
                    <path d="M15.5 0.500977V5.50098" strokeLinecap="round" strokeLinejoin="round" stroke="#002867"/>
                    <path d="M0.5 7.50098H20.5" strokeLinecap="round" strokeLinejoin="round" stroke="#002867"/>
                    <path d="M18.1999 11.927L19.7389 15.497H22.7329C22.8842 15.491 23.0337 15.532 23.1608 15.6142C23.288 15.6964 23.3866 15.8158 23.4433 15.9562C23.5 16.0966 23.5119 16.2511 23.4775 16.3985C23.4431 16.546 23.3639 16.6792 23.2509 16.78L20.6509 19.096L22.0909 22.408C22.1541 22.5595 22.1682 22.727 22.1312 22.887C22.0943 23.0469 22.008 23.1913 21.8847 23.2997C21.7614 23.4081 21.6072 23.4751 21.4439 23.4913C21.2805 23.5075 21.1161 23.472 20.9739 23.39L17.4999 21.43L14.0199 23.39C13.8778 23.472 13.7134 23.5075 13.55 23.4913C13.3866 23.4751 13.2325 23.4081 13.1092 23.2997C12.9858 23.1913 12.8996 23.0469 12.8626 22.887C12.8257 22.727 12.8397 22.5595 12.9029 22.408L14.3449 19.1L11.7449 16.784C11.6317 16.6837 11.5522 16.5508 11.5173 16.4036C11.4824 16.2563 11.4939 16.1019 11.5502 15.9615C11.6065 15.821 11.7048 15.7014 11.8316 15.619C11.9585 15.5365 12.1077 15.4953 12.2589 15.501H15.2589L16.7999 11.931C16.8684 11.8037 16.9701 11.6974 17.0941 11.6233C17.2181 11.5491 17.3599 11.51 17.5044 11.51C17.6489 11.51 17.7907 11.5491 17.9148 11.6233C18.0388 11.6974 18.1405 11.8037 18.2089 11.931L18.1999 11.927Z" fill="#C0D9FF"/>
                    <path d="M19.744 15.5001L18.2 11.9271C18.1316 11.7998 18.0299 11.6935 17.9059 11.6194C17.7818 11.5452 17.64 11.5061 17.4955 11.5061C17.351 11.5061 17.2092 11.5452 17.0852 11.6194C16.9612 11.6935 16.8595 11.7998 16.791 11.9271L15.255 15.5001H12.255C12.1038 15.4944 11.9546 15.5356 11.8277 15.6181C11.7009 15.7005 11.6026 15.8201 11.5463 15.9606C11.49 16.101 11.4785 16.2554 11.5134 16.4027C11.5483 16.5499 11.6278 16.6827 11.741 16.7831L14.341 19.0981L12.904 22.4101C12.8329 22.5873 12.8294 22.7844 12.894 22.9641L20.364 15.5001H19.744Z" fill="#EBF3FF"/>
                    <path d="M18.1999 11.927L19.7389 15.497H22.7329C22.8842 15.491 23.0337 15.532 23.1608 15.6142C23.288 15.6964 23.3866 15.8158 23.4433 15.9562C23.5 16.0966 23.5119 16.2511 23.4775 16.3985C23.4431 16.546 23.3639 16.6792 23.2509 16.78L20.6509 19.096L22.0909 22.408C22.1541 22.5595 22.1682 22.727 22.1312 22.887C22.0943 23.0469 22.008 23.1913 21.8847 23.2997C21.7614 23.4081 21.6072 23.4751 21.4439 23.4913C21.2805 23.5075 21.1161 23.472 20.9739 23.39L17.4999 21.43L14.0199 23.39C13.8778 23.472 13.7134 23.5075 13.55 23.4913C13.3866 23.4751 13.2325 23.4081 13.1092 23.2997C12.9858 23.1913 12.8996 23.0469 12.8626 22.887C12.8257 22.727 12.8397 22.5595 12.9029 22.408L14.3449 19.1L11.7449 16.784C11.6317 16.6837 11.5522 16.5508 11.5173 16.4036C11.4824 16.2563 11.4939 16.1019 11.5502 15.9615C11.6065 15.821 11.7048 15.7014 11.8316 15.619C11.9585 15.5365 12.1077 15.4953 12.2589 15.501H15.2589L16.7999 11.931C16.8684 11.8037 16.9701 11.6974 17.0941 11.6233C17.2181 11.5491 17.3599 11.51 17.5044 11.51C17.6489 11.51 17.7907 11.5491 17.9148 11.6233C18.0388 11.6974 18.1405 11.8037 18.2089 11.931L18.1999 11.927Z" strokeLinecap="round" strokeLinejoin="round" stroke="#002867"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_29_1175">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <h2 className="text-[14px] font-black tracking-tight text-[var(--vba-text)] group-hover:text-amber-500 transition-colors flex items-center gap-1">
                <span>{isEn ? "Upcoming Events" : "Sự kiện sắp tới"}</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </h2>
            </Link>
            <Link to="/association/events" className="flex items-center gap-1 text-[12px] font-bold text-amber-600 dark:text-amber-400 hover:underline p-1">
              <span>{isEn ? "See all" : "Xem tất cả"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Poster Grid: Hiển thị đúng số sự kiện thực tế từ database CRM, tối đa 5 sự kiện */}
          {displayEvents.length === 0 ? (
            <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-amber-500/30">
              <Calendar className="mx-auto h-7 w-7 text-amber-500/50 mb-1.5" />
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
                    className="relative block w-full h-[185px] sm:h-[210px] rounded-3xl overflow-hidden shadow-lg border border-amber-500/40 bg-slate-900 group"
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
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2 group-hover:text-amber-300 transition-colors">
                        {realTitle}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-medium text-amber-300">
                            <Clock className="size-3.5 text-amber-400 shrink-0" />
                            {currentEv.time || "08:30 - 11:30"}
                          </span>
                          <span className="truncate max-w-[150px] text-slate-300 text-[11px]">
                            {(currentEv as any).location || (currentEv as any).place || (currentEv as any).venue || "Hà Nội"}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[11px] shadow-sm">
                          <span>Chi tiết</span>
                          <ChevronRight className="size-3 stroke-[3]" />
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
                          ? "w-6 h-1.5 bg-[#003B95] dark:bg-amber-500"
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
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-[0px_4px_16px_0px_rgba(31,56,100,0.08)] border border-slate-200 dark:border-slate-800 flex flex-col gap-3 group hover:border-amber-400 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1F3864] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Package className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Sàn Thương Mại Nội Bộ
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sản phẩm &amp; dịch vụ ưu đãi độc quyền hội viên
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#1F3864] dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
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
                  <div className="text-xs font-bold text-amber-300">
                    📦 {products.length || 24} sản phẩm &amp; gói thầu niêm yết
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Tổng giá trị: <span className="font-bold text-emerald-400">{totalProductsValue || "4.8 Tỷ đ"}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-white shadow-xs">
                  Vào mua sắm &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* DOANH NGHIỆP MỚI GIA NHẬP */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
            <div className="flex justify-start items-center gap-2">
              <img src="/icons/ceo1983/briefcase-business.svg" alt="Building" className="size-5 shrink-0" />
              <span className="text-slate-800 dark:text-white text-sm font-bold font-sans leading-5">DOANH NGHIỆP MỚI GIA NHẬP</span>
            </div>
            <Link to="/association/members" className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 flex justify-center items-center hover:bg-slate-200 transition">
              <img src="/icons/ceo1983/chevron-right.svg" alt="More" className="size-4" />
            </Link>
          </div>

          <div className="self-stretch overflow-x-auto no-scrollbar flex items-start gap-2.5 pb-1">
            {(directoryMembers?.length > 0 ? directoryMembers.slice(0, 6) : [
              { name: "Cao Văn Mạnh", company: "Cao Văn Mạnh", code: "VM" },
              { name: "Dương Thị Huệ", company: "Dương Thị Huệ", code: "TH" },
              { name: "Nguyễn Văn Hùng", company: "Hùng Vương JSC", code: "VH" },
            ]).map((m, i) => {
              const pName = (m as any).personName || (m as any).contact || m.name || "Hội viên";
              const cName = (m as any).company || ((m as any).type === 'company' ? m.name : '') || (m as any).companyName || "Doanh nghiệp hội viên";
              return (
                <Link
                  key={(m as any).id || (m as any).code || i}
                  to="/association/members"
                  className="w-48 h-14 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-Backgrounds-Secondary dark:outline-slate-800 flex justify-start items-center gap-2.5 shrink-0 overflow-hidden hover:border-amber-400 transition"
                >
                  <div className="size-9 bg-sky-900 rounded-xl outline outline-1 outline-amber-400 flex justify-center items-center shrink-0">
                    <span className="text-yellow-500 text-xs font-bold font-sans">{m.code ? m.code.slice(0, 2).toUpperCase() : initials(pName)}</span>
                  </div>
                  <div className="inline-flex flex-col justify-start items-start min-w-0">
                    <span className="text-slate-800 dark:text-white text-xs font-bold truncate max-w-[120px]">{pName}</span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{cName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* TIN TỨC CÂU LẠC BỘ */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
            <div className="flex justify-start items-center gap-2">
              <img
                src="/icons/ceo1983/newspaper-fold--Streamline-Ultimate.svg"
                alt="News"
                className="size-5 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/icons/ceo1983/calendar.svg";
                }}
              />
              <span className="text-slate-800 dark:text-white text-sm font-bold font-sans leading-5">TIN TỨC CÂU LẠC BỘ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-full outline outline-1 outline-blue-200 dark:outline-blue-800 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                +{combinedNews.length || 5} TIN MỚI
              </span>
              <Link to="/association/news" className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 flex justify-center items-center hover:bg-slate-200 transition">
                <img src="/icons/ceo1983/chevron-right.svg" alt="More" className="size-4" />
              </Link>
            </div>
          </div>

          <div className="self-stretch overflow-x-auto no-scrollbar flex items-start gap-3 pb-1">
            {(combinedNews.length > 0 ? combinedNews.slice(0, 5) : [
              {
                id: "1",
                title: "Hội nghị Xúc tiến Thương mại & Kết nối Đầu tư Quốc tế Quý 3/2026",
                author: "Ban Thư Ký",
                time: "2026-09-20",
              },
              {
                id: "2",
                title: "Chương trình Caravan Thiện nguyện & Giao thương Doanh nhân 2026",
                author: "Ban Truyền Thông",
                time: "2026-09-18",
              },
            ]).map((item, i) => (
              <Link
                key={item.id || i}
                to="/association/news"
                search={{ articleId: String(item.id) }}
                className="w-64 relative bg-white dark:bg-slate-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-Backgrounds-Secondary dark:outline-slate-800 inline-flex flex-col justify-start items-start overflow-hidden shrink-0 shadow-sm group hover:border-amber-400 transition"
              >
                <div className="relative w-full h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    src={(item as any).image || (item as any).cover || "/images/ceo1983/Rectangle 6-1.png"}
                    alt={item.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/ceo1983/Rectangle 6-1.png";
                    }}
                  />
                  <div className="px-2 py-0.5 right-2 top-2 absolute bg-sky-500 text-white rounded-full inline-flex items-center gap-1 text-[9px] font-bold">
                    <span className="size-1 bg-white rounded-full" />
                    <span>Mới</span>
                  </div>
                </div>
                <div className="self-stretch p-3 flex flex-col justify-start items-start gap-1">
                  <span className="text-blue-800 dark:text-blue-400 text-[10px] font-bold uppercase">THÔNG BÁO BAN CHẤP HÀNH</span>
                  <span className="text-slate-800 dark:text-white text-xs font-bold leading-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </span>
                  <div className="self-stretch h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <div className="self-stretch inline-flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.author || "Ban Thư Ký"}</span>
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-amber-300 font-semibold font-mono">
                      <Clock className="size-3 text-amber-500 shrink-0" />
                      {formatNewsDate(item.time)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quét mã QR Check-in sự kiện */}
        {canScanEventQr && (
          <div className="self-stretch p-4 bg-gradient-to-r from-sky-950 via-blue-900 to-sky-950 rounded-[19px] inline-flex justify-between items-center gap-3 overflow-hidden shadow-md border border-white/10 mt-1">
            <div className="size-11 bg-cyan-800/80 rounded-2xl outline outline-1 outline-slate-500 flex justify-center items-center shrink-0">
              <QrCode className="size-6 text-white" />
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 overflow-hidden min-w-0">
              <span className="text-white text-xs font-bold leading-4">
                Quét mã QR Check-in<br />sự kiện
              </span>
              <div className="px-2 py-0.5 bg-yellow-500 rounded-3xl inline-flex justify-start items-center gap-1">
                <ShieldCheck className="size-3 text-sky-950" />
                <span className="text-sky-950 text-[9.5px] font-bold">BAN SOÁT VÉ SỰ KIỆN</span>
              </div>
            </div>
            <Link
              to="/association/checkin"
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-full inline-flex justify-center items-center gap-1.5 shrink-0 shadow-md active:scale-95 transition"
            >
              <span className="text-slate-950 text-xs font-black">Quét ngay</span>
              <ChevronRight className="size-3.5 text-slate-950 stroke-[3]" />
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
    </div>
  );
}
