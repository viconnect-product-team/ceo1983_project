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
  BadgeCheck,
  Copy,
  Clock,
  MapPin,
  Sparkles,
  Flame,
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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/context/AuthContext";
import { SeasonalEventHeader, getEffectiveThemeOption, syncThemeFromBackend } from "@/components/member/SeasonalEventHeader";
import { useTheme } from "@/lib/theme";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { BirthdayCelebrationModal } from "@/components/member/BirthdayCelebrationModal";
import { toast } from "sonner";
import { isBlackBackgroundLogo } from "@/components/member/Ceo1983BusinessCardVisit";
import { GuidedTourModal, type TourStep } from "@/components/common/GuidedTourModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { PersonalProfileBottomSheet, type PersonalProfileData } from "@/components/common/PersonalProfileBottomSheet";
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
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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

  // Check quyền quét mã sự kiện trên mobile CEO 1983:
  // Riêng quản trị, chủ tịch, admin luôn có full quyền quét mã check-in mọi sự kiện.
  // Các tài khoản khác chỉ được quét khi được BQT tích chọn phân công trong danh sách qrScanners của sự kiện trên CRM hiệp hội
  const canScanEventQr = useMemo(() => {
    const role = (user?.role || (member as any)?.role || "").toLowerCase().trim();
    const isSuperOrAdmin =
      Boolean((user as any)?.isAdmin) ||
      Boolean((user as any)?.isPresident) ||
      user?.permissions?.includes("admin:full_access") ||
      user?.permissions?.includes("event:scan_qr") ||
      role === "quan_tri" ||
      role === "admin" ||
      role === "chu_tich" ||
      role === "platform_admin" ||
      role.includes("quản trị") ||
      role.includes("chủ tịch") ||
      role.includes("admin");

    if (isSuperOrAdmin) return true;

    if (!serverEvents || !Array.isArray(serverEvents) || serverEvents.length === 0) {
      return false;
    }

    const myIds = [
      user?.id,
      member?.id,
      member?.code,
      member?.phone,
      member?.email,
      (user as any)?.email,
    ]
      .filter(Boolean)
      .map((x) => String(x).toLowerCase().trim());

    return serverEvents.some((ev: any) => {
      let scanners = ev.qrScanners || ev.qrStaff || ev.qr_scanners || ev.qr_staff_ids || [];
      if (typeof scanners === "string") {
        try {
          scanners = JSON.parse(scanners);
        } catch {
          scanners = [];
        }
      }
      if (!Array.isArray(scanners) || scanners.length === 0) return false;
      return scanners.some((s: any) => {
        if (typeof s === "string") {
          const lower = s.toLowerCase().trim();
          return myIds.some((id) => lower === id || lower.includes(id));
        }
        if (typeof s === "object" && s !== null) {
          const objVals = [s.id, s.code, s.userId, s.memberCode, s.phone, s.email, s.name]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase().trim());
          return myIds.some((id) => objVals.includes(id));
        }
        return false;
      });
    });
  }, [member, user, serverEvents]);

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
    <div className="w-full max-w-full min-h-screen relative bg-Backgrounds-Primary dark:bg-slate-950 flex flex-col justify-start items-start pb-28">
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
            className="size-9 relative bg-amber-50 dark:bg-amber-950/40 rounded-full outline outline-1 outline-offset-[-1px] outline-orange-300 dark:outline-amber-600 flex justify-center items-center hover:scale-105 active:scale-95 transition-transform"
          >
            <img src="/icons/ceo1983/bell.svg" alt="Bell" className="size-5 object-contain" />
            {unreadNotifCount > 0 && (
              <div className="size-4 -right-1 -top-1 absolute bg-rose-500 rounded-full flex justify-center items-center overflow-hidden shadow-xs">
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

          {/* Card Body: Only member name + edit icon, job title, phone number */}
          <div className="self-stretch px-4 pt-11 pb-4 flex flex-col justify-start items-start gap-1 overflow-hidden relative">
            <div className="flex items-center justify-between w-full overflow-hidden">
              <h2 className="text-slate-900 dark:text-white text-base font-extrabold font-sans leading-tight truncate">
                {displayName || "Trần Tuấn Anh"}
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickEditOpen(true);
                }}
                className="p-1 rounded-full hover:bg-amber-500/15 text-slate-400 hover:text-amber-500 transition-colors"
                title="Chỉnh sửa thông tin"
              >
                <Pencil className="size-4 text-amber-500" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold leading-4">
              <Briefcase className="size-3.5 shrink-0 text-[#003B95] dark:text-blue-400" />
              <span className="truncate">{displayTitle || "Hội viên Doanh nhân"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold leading-5">
              <Phone className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-sans tracking-wide">
                {displayPhone || "0901000001"}
              </span>
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

        {/* ── 8 CHỨC NĂNG CỐT LÕI (2 HÀNG 4 CỘT) ── */}
        <div className="self-stretch px-3 py-4 flex flex-col justify-start items-start gap-3">
          {/* Hàng 1 */}
          <div className="self-stretch h-20 inline-flex justify-between items-start gap-1">
            <Link to="/association/card" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/id-card.svg" alt="Danh thiếp số" className="size-7" />
              </div>
              <div className="text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Danh thiếp số</div>
            </Link>

            <Link to="/association/members" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 relative bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/users.svg" alt="Danh bạ CEO" className="size-7" />
                <div className="px-1.5 py-0.5 right-[-6px] -top-2 absolute bg-rose-500 rounded-3xl flex justify-start items-start overflow-hidden shadow-xs">
                  <span className="text-white text-[10px] font-bold font-sans leading-3">100+</span>
                </div>
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Danh bạ CEO</div>
            </Link>

            <button
              type="button"
              onClick={() => setUserGuideOpen(true)}
              className="flex-1 inline-flex flex-col justify-start items-center gap-1 group cursor-pointer"
            >
              <div className="size-14 relative bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/book-open.svg" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/icons/ceo1983/id-card.svg"; }} alt="Hướng dẫn sử dụng" className="size-7" />
                <div className="px-1.5 py-0.5 right-[-6px] -top-2 absolute bg-amber-500 rounded-3xl flex justify-start items-start overflow-hidden shadow-xs">
                  <span className="text-white text-[10px] font-bold font-sans leading-3">Audio</span>
                </div>
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Hướng dẫn</div>
            </button>

            <Link to="/association/benefits" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/crown.svg" alt="Đặc quyền VIP" className="size-7" />
              </div>
              <div className="text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Đặc quyền VIP</div>
            </Link>
          </div>

          {/* Hàng 2 */}
          <div className="self-stretch inline-flex justify-between items-start gap-1">
            <Link to="/association/voting" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 relative bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/vote.svg" alt="Biểu quyết số" className="size-7" />
                <div className="px-1.5 py-0.5 right-[-6px] -top-2 absolute bg-rose-500 rounded-3xl flex justify-start items-start overflow-hidden shadow-xs">
                  <span className="text-white text-[10px] font-bold font-sans leading-3">Mới</span>
                </div>
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Biểu quyết số</div>
            </Link>

            <Link to="/association/history" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/history.svg" alt="Lịch sử" className="size-7" />
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Lịch sử</div>
            </Link>

            <Link to={"/association/documents" as any} className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/folder-open.svg" alt="Kho tài liệu" className="size-7" />
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Kho tài liệu</div>
            </Link>

            <Link to="/association/renew" className="flex-1 inline-flex flex-col justify-start items-center gap-1 group">
              <div className="size-14 bg-sky-100/50 dark:bg-sky-950/50 rounded-xl inline-flex justify-center items-center group-hover:scale-105 transition-transform shadow-xs">
                <img src="/icons/ceo1983/credit-card.svg" alt="Hội phí" className="size-7" />
              </div>
              <div className="w-20 text-center text-slate-800 dark:text-slate-200 text-xs font-sans leading-4 tracking-tight">Hội phí</div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (SỰ KIỆN, ƯU ĐÃI, CƠ HỘI, SÀN TM, TIN TỨC) ── */}
      <div className="self-stretch px-4 pt-3 flex flex-col justify-start items-start gap-4">
        {/* ── 1. SỰ KIỆN SẮP TỚI: BANNER POSTER THEO CHUẨN CEO 1983 ── */}
        <div className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <Link to="/association/events" className="flex items-center gap-1.5 group cursor-pointer">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-tr from-[#002B70] to-[#003B95] text-amber-300 text-xs border border-amber-500/40 shadow-xs">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
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
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory overscroll-x-contain smooth-scroll-touch">
              {displayEvents.slice(0, 5).map((ev, pIdx) => {
                const realTitle = ev.title;
                const rawImg = (ev as any).image;
                const fallbackImg = defaultEventImages[pIdx % defaultEventImages.length];
                const realImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : fallbackImg;
                const isSingle = displayEvents.length === 1;

                return (
                  <Link
                    key={ev.id || pIdx}
                    to="/association/events"
                    className={`group flex flex-col transition active:scale-95 shrink-0 snap-start touch-press ${
                      isSingle ? "w-full" : "w-[245px] max-w-[78%] min-w-[215px]"
                    }`}
                  >
                    {/* Poster Box with Amber Gold Border */}
                    <div className="relative h-[115px] w-full overflow-hidden rounded-2xl border border-amber-500/30 group-hover:border-amber-400/80 bg-slate-900 shadow-sm group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all">
                      <img
                        src={realImg}
                        alt={realTitle}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackImg) {
                            target.src = fallbackImg;
                          }
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Dark gradient overlay on photo */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />

                      {/* Chỉ để mỗi tên sự kiện với thời gian đếm ngược */}
                      <div className="absolute inset-x-0 bottom-0 p-2.5 z-10 flex flex-col gap-1">
                        <div className="flex items-center">
                          <EventCountdownMiniBadge event={ev} index={pIdx} />
                        </div>
                        <h3 className="line-clamp-1 text-[12px] font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-amber-300 transition-colors">
                          {realTitle}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Ưu Đãi Riêng Hội Viên & Đối Tác Banner */}
        <div className="self-stretch min-h-[160px] relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-sky-950 via-blue-900 to-indigo-950 border border-amber-500/30 p-4 flex items-center justify-between">
          <img className="w-full h-full object-cover absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none" src="/images/ceo1983/image 10.png" alt="Ưu đãi" />
          <div className="relative z-10 max-w-[65%] flex flex-col justify-start items-start gap-1">
            <div className="text-amber-400 text-xl sm:text-2xl font-black font-sans leading-tight tracking-wide drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
              Ưu Đãi Riêng
            </div>
            <div className="text-white text-sm font-semibold font-sans">Hội Viên &amp; Đối Tác</div>
            <p className="text-white/85 text-xs font-normal font-sans leading-4 mt-0.5">
              Khám phá các <span className="text-amber-300 font-semibold">Chính sách trợ giá, Quà tặng liên kết</span> dành riêng cho bạn
            </p>
            <Link
              to="/association/benefits"
              className="mt-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-sans rounded-full inline-flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <span>Xem ưu đãi ngay</span>
              <img src="/icons/ceo1983/chevron-right.svg" alt="Arrow" className="size-3 invert" />
            </Link>
          </div>
          {/* Hộp quà vàng 3D sang trọng */}
          <div className="relative z-10 shrink-0 flex items-center justify-center pr-1">
            <img
              src="/images/ceo1983/image 12.png"
              alt="Hộp quà ưu đãi"
              className="w-24 sm:w-28 h-auto object-contain drop-shadow-[0_10px_25px_rgba(251,191,36,0.45)]"
            />
          </div>
        </div>

        {/* CƠ HỘI & KẾT NỐI + SÀN THƯƠNG MẠI */}
        <div className="self-stretch inline-flex justify-start items-start gap-3">
          {/* Card 1: Cơ hội */}
          <Link
            to="/association/opportunities"
            className="flex-1 self-stretch p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-[0px_4px_13px_0px_rgba(174,113,21,0.10)] outline outline-1 outline-offset-[-1px] outline-Backgrounds-Secondary dark:outline-slate-800 inline-flex flex-col justify-between items-start gap-2.5 overflow-hidden group hover:border-amber-400 transition"
          >
            <img className="w-full h-24 rounded-lg object-cover" src="/images/ceo1983/Rectangle 6-1.png" alt="Cơ hội & Kết nối" />
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold leading-4">🤝 {opportunities.length || 6} cơ hội mới</span>
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-slate-900 dark:text-white text-xs font-bold leading-5">CƠ HỘI &amp; KẾT NỐI</span>
                <img src="/icons/ceo1983/chevron-right.svg" alt="Go" className="size-3.5 opacity-60" />
              </div>
            </div>
            <div className="self-stretch h-px bg-Backgrounds-Secondary dark:bg-slate-800" />
            <div className="self-stretch inline-flex justify-between items-center text-xs">
              <span className="text-slate-400">Tổng giá trị:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalOpportunitiesValue || "4.2 Tỷ"}</span>
            </div>
          </Link>

          {/* Card 2: Sàn thương mại */}
          <Link
            to="/association/products"
            className="flex-1 self-stretch p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-[0px_4px_13px_0px_rgba(174,113,21,0.10)] outline outline-1 outline-offset-[-1px] outline-Backgrounds-Secondary dark:outline-slate-800 inline-flex flex-col justify-between items-start gap-2.5 overflow-hidden group hover:border-amber-400 transition"
          >
            <img className="w-full h-24 rounded-lg object-cover" src="/images/ceo1983/image 13.png" alt="Sàn thương mại" />
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold leading-4">📦 {products.length || 3} sản phẩm mới</span>
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-slate-900 dark:text-white text-xs font-bold leading-5">SÀN THƯƠNG MẠI</span>
                <img src="/icons/ceo1983/chevron-right.svg" alt="Go" className="size-3.5 opacity-60" />
              </div>
            </div>
            <div className="self-stretch h-px bg-Backgrounds-Secondary dark:bg-slate-800" />
            <div className="self-stretch inline-flex justify-between items-center text-xs">
              <span className="text-slate-400">Tổng giá trị:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalProductsValue || "2.4 Tỷ"}</span>
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
            ]).map((m, i) => (
              <Link
                key={(m as any).id || (m as any).code || i}
                to="/association/members"
                className="w-48 h-14 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm outline outline-1 outline-offset-[-1px] outline-Backgrounds-Secondary dark:outline-slate-800 flex justify-start items-center gap-2.5 shrink-0 overflow-hidden hover:border-amber-400 transition"
              >
                <div className="size-9 bg-sky-900 rounded-xl outline outline-1 outline-amber-400 flex justify-center items-center shrink-0">
                  <span className="text-yellow-500 text-xs font-bold font-sans">{m.code ? m.code.slice(0, 2).toUpperCase() : initials(m.name)}</span>
                </div>
                <div className="inline-flex flex-col justify-start items-start min-w-0">
                  <span className="text-slate-800 dark:text-white text-xs font-bold truncate max-w-[120px]">{m.name}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{m.company || m.name}</span>
                </div>
              </Link>
            ))}
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
                to={`/association/news/${item.id}` as any}
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
                  <div className="self-stretch inline-flex justify-between items-center text-[10px] text-slate-400">
                    <span>{item.author || "Ban Thư Ký"}</span>
                    <span>{formatNewsDate(item.time)}</span>
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
              <img src="/icons/ceo1983/qr-code.svg" alt="QR" className="size-6 invert" />
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 overflow-hidden min-w-0">
              <span className="text-white text-xs font-bold leading-4">
                Quét mã QR Check-in<br />sự kiện
              </span>
              <div className="px-2 py-0.5 bg-yellow-500 rounded-3xl inline-flex justify-start items-center gap-1">
                <img src="/icons/ceo1983/shield-check.svg" alt="Shield" className="size-3" />
                <span className="text-sky-950 text-[9.5px] font-bold">BAN SOÁT VÉ SỰ KIỆN</span>
              </div>
            </div>
            <Link
              to="/association/checkin"
              className="px-3.5 py-2 bg-white rounded-full inline-flex justify-center items-center gap-1 shrink-0 shadow-sm active:scale-95 transition"
            >
              <span className="text-blue-800 text-xs font-bold">Quét ngay</span>
              <img src="/icons/ceo1983/chevron-right.svg" alt="Go" className="size-3" />
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

      {/* ── MODAL CHỈNH SỬA NHANH NHƯ FACEBOOK (Req 1) ── */}
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
    </div>
  );
}
