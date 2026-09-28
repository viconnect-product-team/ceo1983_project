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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/context/AuthContext";
import { SeasonalEventHeader } from "@/components/member/SeasonalEventHeader";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { AppThemeSelectorModal } from "@/components/member/AppThemeSelectorModal";
import { BirthdayCelebrationModal } from "@/components/member/BirthdayCelebrationModal";
import { toast } from "sonner";
import { GuidedTourModal, type TourStep } from "@/components/common/GuidedTourModal";
import { PersonalProfileBottomSheet, type PersonalProfileData } from "@/components/common/PersonalProfileBottomSheet";
import { QrCanvas } from "@/components/member/QrCanvas";
import { EventCountdownMiniBadge } from "@/components/events/EventCountdownTimer";
import heroImg from "@/assets/vba-hero.jpg";
import giftImg from "@/assets/vba-gift.png";
import eventImg from "@/assets/vba-event.jpg";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  listMyEvents,
  getMyAssociationBrand,
  listMyOpportunities,
  listMyProducts,
  listMyNotifications,
  listMembers,
  listNews,
  type MyMember,
  type MyEvent,
  type MyAssociationBrand,
  type MyOpportunity,
  type MyProduct,
  type MyNotification,
  type DirectoryMember,
  type NewsItem,
} from "@/lib/member-app.functions";
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
  { key: "m.index.qaHistory", icon: History, to: "/association/history", customLabel: "Lịch sử", enLabel: "History" },
  {
    key: "m.index.qaBusinessCards",
    icon: Contact,
    to: "/association/business-cards",
    customLabel: "Danh thiếp số",
    enLabel: "Digital Cards",
    badgeId: "bc",
    badgeText: "Mới",
  },
  { key: "m.index.qaMembers", icon: Users, to: "/association/members", customLabel: "Hội viên", enLabel: "Members" },
  {
    key: "m.index.qaEvents",
    icon: Calendar,
    to: "/association/events",
    customLabel: "Sự kiện",
    enLabel: "Events",
    badgeId: "events",
    badgeText: "3",
  },
  {
    key: "m.index.qaNews",
    icon: Newspaper,
    to: "/association/news",
    customLabel: "Tin tức",
    enLabel: "News",
    badgeId: "news",
    badgeText: "5",
  },
  {
    key: "m.index.qaLibrary",
    icon: FolderOpen,
    to: "/association/library",
    customLabel: "Tài liệu",
    enLabel: "Documents",
  },
  {
    key: "m.index.qaContact",
    icon: Phone,
    to: "/association/messages",
    isContact: true,
    customLabel: "Liên hệ nhanh",
    enLabel: "Quick Contact",
    badgeId: "contact",
    badgeText: "1",
  },
  {
    key: "m.index.qaVoting",
    icon: Vote,
    to: "/association/voting",
    customLabel: "Biểu quyết",
    enLabel: "Voting",
    badgeId: "voting",
    badgeText: "Mới",
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
    title: "Ưu Đãi Nhanh & Danh Bạ Kết Nối",
    description: "Truy cập nhanh danh thiếp số, danh bạ hội viên để gửi lời mời kết nối, đăng ký sự kiện và biểu quyết nội khối câu lạc bộ.",
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
  const [tourOpen, setTourOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [memberQrModalOpen, setMemberQrModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
        }
      }
      setCustomProfile(null);
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
    return (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo || null;
  });

  useEffect(() => {
    const sLogo = (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo;
    if (sLogo) {
      setCompanyLogo(sLogo);
    } else if (user?.id) {
      const userLogo = localStorage.getItem(`vba_member_company_logo_${user.id}`);
      if (userLogo) setCompanyLogo(userLogo);
    }
    const sAvatar = effectiveMember?.avatar || (effectiveMember as any)?.avatarUrl || user?.avatar_url || (user as any)?.user_metadata?.avatar_url;
    if (sAvatar) setAvatarPhoto(sAvatar);
  }, [(effectiveMember as any)?.companyLogoUrl, (effectiveMember as any)?.companyLogo, effectiveMember?.avatar, (effectiveMember as any)?.avatarUrl, user?.avatar_url, (user as any)?.user_metadata?.avatar_url, user?.id]);

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
        if (user?.id) {
          localStorage.setItem(`vba_member_company_logo_${user.id}`, dataUrl);
          const cp = JSON.parse(localStorage.getItem(`vba_custom_profile_${user.id}`) || "{}");
          cp.companyLogo = dataUrl;
          cp.userId = user.id;
          localStorage.setItem(`vba_custom_profile_${user.id}`, JSON.stringify(cp));
        }

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
        if (detail && typeof detail === "object" && (detail.name || detail.title || detail.company)) {
          setCustomProfile(detail);
          if (detail.avatar) setAvatarPhoto(detail.avatar);
          if (detail.cover) setCoverPhoto(detail.cover);
          if (detail.companyLogo) {
            setCompanyLogo(detail.companyLogo);
            if (user?.id) {
              try { localStorage.setItem(`vba_member_company_logo_${user.id}`, detail.companyLogo); } catch {}
            }
          }
          return;
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
        setCustomProfile(null);
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
        if (detailUrl && typeof detailUrl === "string") {
          setCompanyLogo(detailUrl);
        } else if (user?.id) {
          const userLogo = localStorage.getItem(`vba_member_company_logo_${user.id}`);
          if (userLogo) setCompanyLogo(userLogo);
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
      const priceVal = (p as any).priceNumber || p.price;
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

  // Quyền quét mã QR sự kiện: Admin & Ban Quản Trị full quyền; hoặc người thuộc Ban Truyền Thông được chỉ định
  const canScanQR = useMemo(() => {
    // 1. Kiểm tra tài khoản Admin / Super Admin / Ban Quản Trị từ mọi nguồn (Auth Context, Token, LocalStorage)
    const email = (user?.email || (typeof window !== "undefined" ? localStorage.getItem("vba_user_email") || localStorage.getItem("vibe_user_email") : "") || "").toLowerCase();
    const role = (user?.role || (typeof window !== "undefined" ? localStorage.getItem("vba_current_role") || localStorage.getItem("vba_user_role") : "") || "").toLowerCase();

    if (
      role === "admin" ||
      role === "superadmin" ||
      role === "super_admin" ||
      email.includes("admin") ||
      (typeof window !== "undefined" && localStorage.getItem("vba_is_admin") === "true") ||
      user?.isBoardOfDirectors === true
    ) {
      return true;
    }

    // 2. Check Ban Quản Trị / Ban Lãnh Đạo
    const dept = (user?.department || "").toLowerCase();
    const board = (user?.boardName || "").toLowerCase();
    const title = (user?.title || "").toLowerCase();
    const customCombined = `${customProfile?.title || ""} ${customProfile?.company || ""}`.toLowerCase();
    const combined = `${role} ${dept} ${board} ${title} ${customCombined}`.toLowerCase();

    if (
      combined.includes("ban quản trị") ||
      combined.includes("bqt") ||
      combined.includes("chủ tịch") ||
      combined.includes("phó chủ tịch") ||
      combined.includes("ban điều hành")
    ) {
      return true;
    }

    // 3. Ban Truyền Thông được Ban Quản Trị chỉ định
    const isMedia = combined.includes("truyền thông") || combined.includes("media");
    const isAssigned =
      typeof window !== "undefined" &&
      (localStorage.getItem("vba_is_media_department_member") === "true" ||
        localStorage.getItem("vba_assigned_event_scanner") === "true" ||
        (user as any)?.isEventScanner === true);
    return isMedia && isAssigned;
  }, [user, customProfile]);

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

  return (
    <div className="vba-animate min-h-full">
      {/* ── CỐ ĐỊNH HEADER LOGO VÀ NOTIFICATIONS (BỎ ICON CHỤP ẢNH, GIỮ LOGO CHUẨN CEO1983) ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-[var(--vba-border)] bg-white/95 dark:bg-[#070D1A]/95 px-4 backdrop-blur-md shadow-xs"
        style={{
          paddingTop: "var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px))",
          minHeight: "calc(var(--bc-mobile-safe-top-compact, calc(max(env(safe-area-inset-top, 0px), 12px) + 4px)) + 52px)",
        }}
      >
        {/* Logo CEO 1983 chuẩn ở header, không có chữ official app */}
        <div className="flex items-center">
          <img
            src="/ceo1983-logo.png"
            alt="CLB Doanh Nhân CEO 1983"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
            }}
            className="h-8 max-w-[150px] object-contain"
          />
        </div>

        {/* Thông báo */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/association/notifications"
            aria-label={t("m.index.notifAria")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#14223E] text-[#003B95] dark:text-blue-400 shadow-xs transition hover:scale-105 active:scale-95 hover:border-[#003B95]/50"
          >
            <Bell className="h-4.5 w-4.5 stroke-[2]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-xs animate-pulse">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hidden inputs cho phép click trực tiếp để upload */}
      <input type="file" ref={avatarFileInputRef} className="hidden" accept="image/*" onChange={handleDirectAvatarUpload} />
      <input type="file" ref={coverFileInputRef} className="hidden" accept="image/*" onChange={handleDirectCoverUpload} />
      <input type="file" ref={logoFileInputRef} className="hidden" accept="image/*" onChange={handleDirectLogoUpload} />

      {/* Hero Banner with Classic Cobalt Navy Atmosphere */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#003B95]/15 via-blue-500/5 to-transparent">
        <SeasonalEventHeader />

        <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-[#003B95]/20 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <img
          src={heroImg}
          alt={t("m.index.heroAlt")}
          className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-25 mix-blend-overlay"
          width={1024}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--vba-bg)]/80 to-[var(--vba-bg)]" />

        <div className="relative z-10 px-4 pb-14 pt-3" />
      </div>

      {/* ── 1. THẺ HỘI VIÊN VIP EXECUTIVE (ĐÃ TINH GỌN CHUẨN YÊU CẦU) ── */}
      <div id="tour-member-card" className="relative z-10 -mt-14 mx-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-md transition hover:border-[#003B95]/40">
        {/* Ảnh bìa to rộng */}
        <div 
          className="relative h-24 sm:h-28 w-full overflow-hidden bg-gradient-to-r from-[#19194D] via-[#003B95] to-[#0A1A3A]"
        >
          {coverPhoto && !coverError ? (
            <img
              src={resolveMediaUrl(coverPhoto) || coverPhoto}
              alt="Cover Banner"
              onError={() => {
                setCoverError(true);
                try { localStorage.removeItem("vba_member_cover_photo"); } catch {}
              }}
              className="h-full w-full object-cover opacity-85"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-[#19194D] via-[#003B95] to-[#0A1A3A]">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#003B95_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

          {/* Logo công ty hội viên trên ảnh bìa ở góc phải: Clean, tinh tế không nền đen */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              logoFileInputRef.current?.click();
            }}
            className="absolute top-2.5 right-3 z-10 cursor-pointer"
            title="Bấm vào để tải lên hoặc đổi Logo công ty"
          >
            {companyLogo ? (
              <div className="flex items-center gap-1.5 p-1 transition group hover:opacity-90">
                <img
                  src={resolveMediaUrl(companyLogo) || companyLogo}
                  alt="Company Logo"
                  onError={(e) => {
                    const fallback = localStorage.getItem("vba_member_company_logo");
                    if (fallback && fallback !== companyLogo) {
                      (e.target as HTMLImageElement).src = fallback;
                    }
                  }}
                  className="h-7 sm:h-8 w-auto max-w-[120px] object-contain drop-shadow filter"
                />
                <span className="hidden group-hover:inline-block text-[10px] text-white/90 font-semibold drop-shadow">Đổi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 text-white/80 hover:text-white text-[11px] font-bold transition active:scale-95 drop-shadow">
                <Building2 className="h-3.5 w-3.5 text-white" />
                <span>+ Logo Cty</span>
              </div>
            )}
          </div>
        </div>

        {/* Thân thẻ với Avatar dập viền trắng đè lên ảnh bìa */}
        <div className="px-4 pb-3 pt-0 relative">
          <div className="flex items-end justify-between -mt-8 mb-2.5">
            {/* Avatar tròn to dập viền trắng nổi bật có chấm xanh online (Click để đổi avatar) */}
            <div 
              onClick={() => avatarFileInputRef.current?.click()}
              className="relative shrink-0 cursor-pointer"
              title="Bấm vào ảnh đại diện để thay đổi"
            >
              {displayAvatar && !avatarError ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-3 ring-white dark:ring-[#0F172A] shadow-md bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-[#003B95] to-[#19194D] text-[18px] font-black text-white ring-3 ring-white dark:ring-[#0F172A] shadow-md">
                  {initials(displayName)}
                </span>
              )}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
            </div>

          </div>

          {/* Thông tin hội viên & doanh nghiệp — Bấm mở popup hồ sơ từ dưới lên */}
          <div
            onClick={() => setProfileSheetOpen(true)}
            className="space-y-1 cursor-pointer transition hover:opacity-90 active:scale-[0.99] rounded-xl p-1 -m-1"
            title="Bấm để xem hồ sơ cá nhân chi tiết (Ảnh, Profile, Facebook...)"
          >
            {/* Tên công ty của hội viên (không có logo phụ cạnh tên công ty) */}
            <div className="text-xs sm:text-[13px] font-extrabold uppercase tracking-wide text-[#003B95] dark:text-blue-400 truncate">
              {displayCompany}
            </div>

            {/* Tên hội viên & Huy hiệu xác thực */}
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[17px] font-black text-slate-900 dark:text-white">
                {displayName}
              </span>
              <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-[#0284c7] dark:text-sky-400" />
            </div>

            {/* Chức danh / Profile hội viên */}
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="truncate">{displayTitle}</span>
            </div>

            {/* Số điện thoại */}
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
              <span>{displayPhone}</span>
            </div>
          </div>

          {/* Footer của thẻ hội viên: Chỉ để DUY NHẤT icon chỉnh sửa nhanh gọn gàng */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <span
              onClick={() => setProfileSheetOpen(true)}
              className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer hover:text-[#003B95] dark:hover:text-blue-400 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Xem hồ sơ & liên kết cá nhân →</span>
            </span>
            <button
              id="tour-quick-edit-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickEditOpen(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 hover:text-[#003B95] dark:hover:text-blue-300 hover:border-blue-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Chỉnh sửa nhanh hồ sơ"
              aria-label="Chỉnh sửa nhanh hồ sơ"
            >
              <Pencil className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Action shortcuts / Quick Action Grid */}
      <div id="tour-quick-actions" className="relative mt-3.5 mx-4 rounded-3xl vba-card p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2E3192]"></span>
            Tính năng nhanh
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {quickActionDefs.map((a: any) => {
            const Icon = a.icon;
            const label = isEn ? a.enLabel : a.customLabel || t(a.key);
            const showBadge = a.badgeId ? !clearedBadges[a.badgeId] : false;

            if (a.isContact) {
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    handleActionClick(a.badgeId);
                    setContactSupportOpen(true);
                  }}
                  className="group relative flex flex-col items-center gap-1.5 transition cursor-pointer"
                >
                  <span
                    className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#2E3192]/15 text-[#2E3192] dark:text-blue-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-[#2E3192]/60 group-active:scale-95 ${
                      showBadge ? "ring-2 ring-red-500/40" : ""
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5 stroke-[2]" />

                    {/* HIỆU ỨNG TUYẾT RƠI KHI CÓ SỐ THÔNG BÁO MỚI */}
                    {showBadge && (
                      <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                        <span className="absolute -top-1.5 -right-1 text-[9px] text-amber-300 dark:text-amber-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" aria-hidden="true">❄</span>
                        <span className="absolute top-1 -left-1.5 text-[8px] text-yellow-400 dark:text-yellow-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" aria-hidden="true">✦</span>
                        <span className="absolute bottom-0 right-0 text-[7px] text-amber-400 dark:text-amber-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(217,119,6,0.8)]" aria-hidden="true">✧</span>
                        <span className="absolute -top-1 left-0.5 text-[8px] text-amber-300 dark:text-amber-200 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" aria-hidden="true">⋆</span>
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/70">
                          {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                        </span>
                      </div>
                    )}
                  </span>
                  <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-[#2E3192]">
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={a.key}
                to={a.to}
                onClick={() => handleActionClick(a.badgeId)}
                className="group relative flex flex-col items-center gap-1.5 transition"
              >
                <span
                  className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border border-[#2E3192]/20 bg-blue-50/70 dark:bg-[#2E3192]/15 text-[#2E3192] dark:text-blue-400 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-[#2E3192]/60 group-active:scale-95 ${
                    showBadge ? "ring-2 ring-red-500/40" : ""
                  }`}
                >
                  <Icon className="h-5.5 w-5.5 stroke-[2]" />

                  {/* HIỆU ỨNG TUYẾT RƠI KHI CÓ SỐ THÔNG BÁO MỚI */}
                  {showBadge && (
                    <div className="pointer-events-none absolute inset-0 -m-1 select-none overflow-visible">
                      <span className="absolute -top-1.5 -right-1 text-[9px] text-amber-300 dark:text-amber-200 animate-blue-snow-1 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" aria-hidden="true">❄</span>
                      <span className="absolute top-1 -left-1.5 text-[8px] text-yellow-400 dark:text-yellow-300 animate-blue-snow-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" aria-hidden="true">✦</span>
                      <span className="absolute bottom-0 right-0 text-[7px] text-amber-400 dark:text-amber-300 animate-blue-snow-3 drop-shadow-[0_0_4px_rgba(217,119,6,0.8)]" aria-hidden="true">✧</span>
                      <span className="absolute -top-1 left-0.5 text-[8px] text-amber-300 dark:text-amber-200 animate-blue-sparkle drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]" aria-hidden="true">⋆</span>
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs animate-pulse ring-1 ring-white/70">
                        {a.badgeId === "events" ? String(displayEvents.length) : a.badgeText}
                      </span>
                    </div>
                  )}
                </span>
                <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--vba-text)] transition-colors group-hover:text-[#2E3192]">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Contact Drawer Modal */}
      <AssociationContactSheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        onOpenChat={() => {
          setContactOpen(false);
          navigate({
            to: "/association/messages" as any,
            search: { peerCode: "admin", peerName: "Tin nhắn từ hệ thống" } as any,
          });
        }}
      />

      {/* ── 1. SỰ KIỆN SẮP TỚI: BANNER POSTER THEO CHUẨN CEO 1983 ── */}
      <div className="mx-4 mt-5">
        <div className="mb-3 flex items-center justify-between">
          <Link to="/association/events" className="flex items-center gap-1.5 group cursor-pointer">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#003B95] text-amber-300 text-xs shadow-xs">
              <Calendar className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[14px] font-black tracking-tight text-[var(--vba-text)] group-hover:text-[#003B95] dark:group-hover:text-amber-400 flex items-center gap-1">
              <span>{isEn ? "Upcoming Events" : "Sự kiện sắp tới"}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </h2>
          </Link>
          <Link to="/association/events" className="flex items-center gap-1 text-[12px] font-bold text-[#003B95] dark:text-amber-400 hover:underline p-1">
            <span>{isEn ? "See all" : "Xem tất cả"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Poster Grid: Hiển thị đúng số sự kiện thực tế từ database CRM, tối đa 5 sự kiện */}
        {displayEvents.length === 0 ? (
          <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No upcoming events scheduled" : "Chưa có sự kiện mới được lên lịch"}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory overscroll-x-contain">
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
                  className={`group flex flex-col transition active:scale-95 shrink-0 snap-start ${
                    isSingle ? "w-full" : "w-[245px] max-w-[78%] min-w-[215px]"
                  }`}
                >
                  {/* Poster Box thu gọn 2/3 chiều rộng và 1/2 chiều cao hiện tại trên mobile */}
                  <div className="relative h-[115px] w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900 shadow-sm group-hover:shadow-md transition-all group-hover:border-sky-400/50">
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
                      <h3 className="line-clamp-1 text-[12px] font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-sky-300 transition-colors">
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

      {/* ── 2. ƯU ĐÃI HỘI VIÊN & ĐỐI TÁC ── */}
      <div className="relative mx-4 mt-5 flex items-center gap-3 overflow-hidden rounded-2xl vba-card p-4 shadow-xs border border-amber-500/30">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-1.5">
            <Crown className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" />
            <div className="min-w-0 flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] sm:text-[14px] font-bold text-amber-800 dark:text-amber-300 leading-tight">
                {isEn ? "Member & Partner Perks" : "Ưu đãi Hội viên & Đối tác"}
              </span>
              <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs whitespace-nowrap leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping shrink-0" />
                +Hot
              </span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
            {isEn
              ? "Discover price support policies, affiliated gifts and trade benefits exclusive to CEO 1983."
              : "Khám phá các chính sách trợ giá, quà tặng liên kết và quyền lợi giao thương dành riêng cho Hội viên CLB Doanh Nhân CEO 1983."}
          </p>
          <Link
            to="/association/perks"
            className="mt-3 inline-block rounded-xl bg-[#2E3192] hover:bg-[#19194D] px-3.5 py-1.5 text-[10.5px] font-bold text-white shadow-xs transition active:scale-95"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "View perks now" : "Xem ưu đãi ngay"}
          </Link>
        </div>

        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-full bg-blue-400/20 blur-md animate-pulse pointer-events-none" />
          <img
            src={giftImg}
            alt="Quà tặng ưu đãi"
            loading="lazy"
            width={512}
            height={512}
            className="relative z-10 h-20 w-20 object-contain drop-shadow-md animate-bounce"
            style={{ animationDuration: "2.4s" }}
          />
        </div>
      </div>

      {/* ── 3. CHIA SẺ CƠ HỘI & MARKETPLACE ── */}
      <div id="tour-opportunities-stats" className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {/* Chia sẻ cơ hội - Nút bấm Cobalt Navy */}
        <Link
          to="/association/opportunities"
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-[#2E3192]/50 shadow-xs overflow-hidden"
        >
          <span className="absolute -inset-px rounded-2xl border border-[#2E3192]/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-blue-400 shadow-xs overflow-hidden border border-[#2E3192]/20">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png"
                  alt="Chia sẻ cơ hội"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/25 text-[#003B95] dark:text-blue-300 text-[10.5px] font-extrabold shadow-2xs backdrop-blur-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{totalOpportunitiesCount}+</span>
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">{isEn ? "deals" : "cơ hội"}</span>
              </div>
            </div>

            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "SHARE OPPORTUNITIES" : "CHIA SẺ CƠ HỘI"}
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Share business deals & connect" : "Chia sẻ cơ hội & Kết nối"}
            </p>

            {/* HIỂN THỊ TỔNG GIÁ TRỊ GIAO DỊCH / CƠ HỘI (Requirement 3) */}
            <div className="mt-2.5 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{isEn ? "Total deal:" : "Tổng giá trị:"}</span>
              <span className="text-[11.5px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{totalOpportunitiesValue}</span>
            </div>
          </div>

          <span
            className="mt-3.5 inline-flex self-start rounded-xl bg-[#F0F4FA] dark:bg-slate-800 text-[#003B95] dark:text-blue-300 px-3.5 py-1 text-[10.5px] font-bold shadow-xs transition active:scale-95"
          >
            {isEn ? "Explore now" : "Khám phá ngay"}
          </span>
        </Link>

        {/* Marketplace 5.0 - SÀN THƯƠNG MẠI */}
        <Link
          to="/association/products"
          search={{ action: undefined }}
          className="group relative vba-card flex flex-col justify-between p-4 transition hover:border-[#2E3192]/50 shadow-xs overflow-hidden cursor-pointer"
        >
          <span className="absolute -inset-px rounded-2xl border border-[#2E3192]/30 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none animate-pulse" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-blue-400 shadow-xs overflow-hidden border border-[#2E3192]/20">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png"
                  alt="Marketplace"
                  className="h-7 w-7 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[10.5px] font-extrabold shadow-2xs backdrop-blur-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{totalProductsCount}+</span>
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">{isEn ? "items" : "sản phẩm"}</span>
              </div>
            </div>

            <div className="text-[13px] font-bold text-[var(--vba-text)]">
              {isEn ? "MARKETPLACE" : "SÀN THƯƠNG MẠI"}
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-[var(--vba-text-muted)]">
              {isEn ? "Promote enterprise products" : "Gian hàng sản phẩm & dịch vụ"}
            </p>

            {/* HIỂN THỊ TỔNG GIÁ TRỊ SẢN PHẨM NIÊM YẾT (Requirement 3) */}
            <div className="mt-2.5 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{isEn ? "Total prod:" : "Tổng giá trị:"}</span>
              <span className="text-[11.5px] font-black text-amber-600 dark:text-amber-400 tracking-tight">{totalProductsValue}</span>
            </div>
          </div>

          {/* Nút Khám phá sàn - Chuẩn màu xanh CEO chữ trắng */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({
                to: "/association/products" as any,
                search: { action: "create" } as any,
              });
            }}
            className="mt-3.5 inline-flex self-start rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-3.5 py-1 text-[10.5px] font-bold shadow-xs transition active:scale-95 cursor-pointer z-10"
            style={{ color: "#ffffff" }}
          >
            {isEn ? "Post now" : "Đăng ngay"}
          </button>
        </Link>
      </div>




      {/* ── 4. DOANH NGHIỆP MỚI GIA NHẬP (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "New Member Enterprises" : "Doanh nghiệp mới gia nhập"}
            </h2>
          </div>
          <Link
            to="/association/members"
            className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
          >
            <span>{isEn ? "Directory" : "Xem danh bạ"}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        {directoryMembers.length === 0 ? (
          <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No new enterprise members recorded this week" : "Chưa có doanh nghiệp mới tuần này"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {directoryMembers.slice(0, 2).map((m) => (
              <Link
                key={m.code}
                to="/association/members"
                className="vba-card flex items-center gap-2.5 rounded-xl p-2.5 shadow-xs transition hover:border-amber-500/50"
              >
                {m.avatar ? (
                  <img
                    src={resolveMediaUrl(m.avatar) || m.avatar}
                    alt={m.name}
                    className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#2E3192] text-[12px] font-black text-white shadow-xs">
                    {initials(m.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-[var(--vba-text)]">
                    {m.name}
                  </div>
                  <div className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">
                    {m.personName || m.industry || (isEn ? "Member" : "Hội viên")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. TIỆN ÍCH THẺ THÔNG MINH (CHỈ HIỂN THỊ KHI CÓ QUYỀN SOÁT VÉ BAN TRUYỀN THÔNG) ── */}
      {canScanQR && (
        <div className="mx-4 mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
                {isEn ? "Smart Card Utilities" : "Tiện ích thẻ thông minh"}
              </h2>
            </div>
            <Link
              to="/association/checkin"
              className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
            >
              <span>{isEn ? "Check-in" : "Vào điểm danh"}</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>

          <Link
            to="/association/checkin"
            className="vba-card flex items-center justify-between rounded-2xl p-4 transition hover:border-amber-500/50 shadow-xs active:scale-[0.99] group bg-gradient-to-r from-[#2E3192]/10 via-amber-500/5 to-transparent border border-[#2E3192]/20 dark:border-amber-500/30"
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#003B95] to-[#2E3192] text-white shadow-md shadow-[#2E3192]/25 group-hover:scale-105 transition-transform border border-amber-400/30">
                <QrCode className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[14px] font-extrabold text-[var(--vba-text)]">
                    {isEn ? "Event Check-in" : "Soát vé sự kiện"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-400/40">
                    📢 {isEn ? "Media Team" : "Ban Truyền Thông"}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn ? "Media team QR/NFC event ticket scanner & attendee check-in" : "Quét mã QR soát vé đại biểu & hiển thị thông tin chỗ ngồi"}
                </p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/50 transition shrink-0 ml-2">
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* ── 6. TIN HOẠT ĐỘNG CLB (CHUẨN PHƯƠNG ÁN 1) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4.5 w-4.5 shrink-0 text-[#2E3192] dark:text-amber-400" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[var(--vba-text)]">
              {isEn ? "Club Activities & News" : "Tin hoạt động CLB"}
            </h2>
          </div>
          <Link
            to="/association/news"
            className="flex items-center text-[11px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:underline"
          >
            <span>{isEn ? "View all" : "Xem tất cả"}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        {newsItems.length === 0 ? (
          <div className="rounded-2xl vba-card p-5 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Newspaper className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {isEn ? "No newly published club news" : "Chưa có bản tin mới trong tuần"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {newsItems.slice(0, 3).map((item, idx) => {
              const rawImg = (item as any).image || (item as any).imageUrl || (item as any).coverUrl || (item as any).thumbnail;
              const newsImg = rawImg ? resolveMediaUrl(rawImg) || rawImg : DEFAULT_NEWS_THUMBNAILS[idx % DEFAULT_NEWS_THUMBNAILS.length];
              return (
                <Link
                  key={item.id}
                  to="/association/news"
                  className="vba-card group flex items-center gap-3 rounded-2xl p-2.5 sm:p-3 shadow-xs transition hover:border-amber-500/50 hover:shadow-md"
                >
                  {/* Photo thumbnail */}
                  <div className="relative h-20 w-24 sm:h-22 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-900">
                    <img
                      src={newsImg}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {item.category && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                    <div className="line-clamp-2 text-[13px] font-bold text-[var(--vba-text)] leading-snug group-hover:text-[#003B95] dark:group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-slate-400 dark:text-slate-500">
                      <span>{formatNewsDate(item.time)}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px] font-medium text-slate-600 dark:text-slate-400">
                        {item.author || "Ban Truyền Thông"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Install hint */}
      <div className="mx-4 mt-5">
        <Link
          to="/install"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-[var(--vba-surface)] py-3 text-[12px] font-bold text-[#2E3192] dark:text-amber-400 transition hover:bg-amber-500/10"
        >
          📲 {isEn ? "Install App to Phone Home Screen" : "Cài đặt ứng dụng lên màn hình chính điện thoại"}
        </Link>
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
          if (updated.companyLogo) setCompanyLogo(updated.companyLogo);
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

      {/* ── BẬT / TẮT & CHỌN CHỦ ĐỀ LỄ HỘI TRÊN APP (Req 6) ── */}
      <AppThemeSelectorModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      {/* ── POPUP CHÚC MỪNG SINH NHẬT & TẶNG ƯU ĐÃI VIP (Req 4) ── */}
      <BirthdayCelebrationModal member={member} />
    </div>
  );
}
