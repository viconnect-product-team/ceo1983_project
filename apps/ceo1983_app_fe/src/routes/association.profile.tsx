import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  ChevronRight,
  User,
  Building2,
  Users,
  FileText,
  Package,
  Sparkles,
  Bell,
  Settings as Cog,
  LogOut,
  Sun,
  Moon,
  Share2,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  LayoutDashboard,
  TrendingUp,
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  ExternalLink,
  Pencil,
  BookOpen,
  Headphones,
  Bot,
  CreditCard,
  Smartphone,
  Download,
  HelpCircle,
  BadgeCheck,
  Calendar,
  Handshake,
  RotateCcw,
  ChevronDown,
  Clock,
  Video,
  History,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { CardPreviewModal } from "@/components/member/CardPreviewModal";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { CeoBusinessLocationPicker } from "@/components/member/CeoBusinessLocationPicker";
import { AccountSecuritySettingsForm } from "@/components/member/AccountSecuritySettingsForm";
import {
  CustomHomeShortcutsModal,
  DEFAULT_SHORTCUT_IDS,
  ALL_SHORTCUT_OPTIONS,
  getShortcutIcon,
} from "@/components/member/CustomHomeShortcutsModal";
import {
  getEffectiveThemeOption,
  syncThemeFromBackend,
  isEventThemeEnabled,
  type FestivalThemeOption,
} from "@/components/member/SeasonalEventHeader";
import {
  isVoiceAiEnabled,
  setVoiceAiEnabled,
  VOICE_AI_EVENT_NAME,
} from "@/components/ai/Ceo1983ChatAssistant";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  listMyEvents,
  listMyOpportunities,
  type MyMember,
  type MyEvent,
  type MyOpportunity,
} from "@/lib/member-app.functions";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi, isDeadAvatarUrl } from "@/lib/api-client";
import { requestNotificationPermission } from "@/lib/notification-permissions";
import { toast } from "sonner";
// @ts-ignore
import heroImg from "@/assets/vba-hero.jpg";

export const Route = createFileRoute("/association/profile")({
  component: ProfileScreen,
});

function initials(name?: string) {
  if (!name) return "VIP";
  const clean = name.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim();
  if (!clean) return "VIP";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isDeadAvatar(url?: string | null): boolean {
  if (!url || typeof url !== "string") return true;
  return isDeadAvatarUrl(url);
}

function isDeadCover(url?: string | null): boolean {
  if (!url || typeof url !== "string") return true;
  return isDeadAvatarUrl(url);
}

export default function ProfileScreen() {
  const { lang, setLang } = useLang();
  const isEn = lang === "en";
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { isSuperAdmin } = useRole();
  const fetchMember = useServerFn(getMyMember);
  const { data: member, reload: reloadMember } = useServerData<MyMember | null>(
    () => fetchMember(),
    null,
    "vba_my_member"
  );

  const fetchEvents = useServerFn(listMyEvents);
  const fetchOpps = useServerFn(listMyOpportunities);
  const { data: myEventsList = [] } = useServerData<MyEvent[]>(() => fetchEvents(), []);
  const { data: myOppsList = [] } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);

  // Lịch sử hoạt động hội viên (Ý kiến cuộc họp - Item 15)
  const participatedEvents = useMemo(() => {
    return (myEventsList || []).filter((e) => e.registered);
  }, [myEventsList]);

  const connectedOpportunities = useMemo(() => {
    return (myOppsList || []).filter((o) => o.interested || (o as any).isOwner);
  }, [myOppsList]);

  const hasAdminPrivilege = isSuperAdmin;

  // Active tab state: Hồ sơ (about), Giao thương (friends), Cài đặt (posts)
  const [activeTab, setActiveTab] = useState<"about" | "friends" | "posts">("about");

  // Modals state
  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Setup 4 tính năng nhanh trang chủ (Yêu cầu 2)
  const [customShortcutsOpen, setCustomShortcutsOpen] = useState(false);
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SHORTCUT_IDS;
    try {
      const saved = localStorage.getItem("ceo1983_home_shortcuts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SHORTCUT_IDS;
  });

  const handleSaveShortcuts = (ids: string[]) => {
    setSelectedShortcuts(ids);
    try {
      localStorage.setItem("ceo1983_home_shortcuts", JSON.stringify(ids));
      localStorage.setItem("vba_user_custom_shortcuts", JSON.stringify(ids));
      window.dispatchEvent(new Event("ceo1983_shortcuts_changed"));
      window.dispatchEvent(new Event("storage"));
    } catch {}
    setCustomShortcutsOpen(false);
    toast.success("Đã lưu thiết lập 4 tính năng nhanh trang chủ!");
  };

  // Trạng thái thu gọn/mở rộng từng đầu mục chức năng (Yêu cầu 2: bấm vào mới mở ra)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Cuộc họp ban (Ban Điều Hành, Ban Thư Ký, Ban Xúc Tiến, Ban Truyền Thông...)
  const committeeMeetings = useMemo(() => [
    {
      id: "meet_btk_01",
      title: "Họp Ban Thư Ký & Ban Điều Hành Quý IV",
      department: "Ban Thư Ký",
      date: "28/10/2026",
      time: "14:00 - 16:30",
      location: "Văn phòng HanoiBA & Trực tuyến Zoom",
      zoomUrl: "https://zoom.us/j/8831983001",
      type: "Ban chuyên môn",
      status: "Sắp diễn ra",
    },
    {
      id: "meet_xttm_02",
      title: "Phiên giao ban Xúc Tiến Thương Mại & Deal B2B",
      department: "Ban Xúc Tiến Thương Mại",
      date: "05/11/2026",
      time: "09:00 - 11:30",
      location: "Zoom Meeting ID: 883-1983-002",
      zoomUrl: "https://zoom.us/j/8831983002",
      type: "Giao ban định kỳ",
      status: "Chuẩn bị",
    },
    {
      id: "meet_tt_03",
      title: "Họp triển khai chiến dịch Caravan Doanh Nhân 1983",
      department: "Ban Truyền Thông",
      date: "12/11/2026",
      time: "15:00 - 17:00",
      location: "Google Meet",
      zoomUrl: "https://meet.google.com/ceo-1983-meet",
      type: "Họp dự án",
      status: "Sắp tới",
    },
  ], []);

  // Cuộc gặp 1-on-1 (Giao lưu, hợp tác kinh doanh)
  const meetings1on1 = useMemo(() => [
    {
      id: "meet_1on1_01",
      title: "Gặp gỡ 1-on-1: Trao đổi cung ứng vật tư & công nghệ sản xuất",
      partnerName: "CEO Lê Văn Hùng",
      partnerCompany: "Tập đoàn Xây dựng & Cơ điện Thăng Long",
      date: "29/10/2026",
      time: "10:00",
      location: "Cafe Trung Nguyên Legend, Cầu Giấy, Hà Nội",
      status: "Đã xác nhận",
      phone: "0988111222",
    },
    {
      id: "meet_1on1_02",
      title: "Gặp gỡ 1-on-1: Thảo luận giải pháp Chuyển đổi số Doanh nghiệp",
      partnerName: "CEO Đỗ Thị Mai",
      partnerCompany: "Công ty Cổ phần Giải pháp Công nghệ ViOne",
      date: "02/11/2026",
      time: "15:30",
      location: "Trực tuyến Google Meet",
      status: "Đang chờ",
      phone: "0988333444",
    },
  ], []);

  // Lịch sử thao tác hội viên (Audit Log - Yêu cầu 3)
  const auditHistory = useMemo(() => [
    {
      id: "act_1",
      title: "Cập nhật hồ sơ & Quy mô nhân sự doanh nghiệp",
      time: "Hôm nay, 14:15",
      badge: "Hồ sơ",
    },
    {
      id: "act_2",
      title: "Đăng ký tham gia Gala Doanh Nhân CEO 1983",
      time: "Hôm qua, 16:30",
      badge: "Sự kiện",
    },
    {
      id: "act_3",
      title: "Gửi lời mời kết nối hợp tác giao thương 1-on-1",
      time: "24/10/2026",
      badge: "Giao thương",
    },
    {
      id: "act_4",
      title: "Quét mã QR danh thiếp số hội viên CLB",
      time: "22/10/2026",
      badge: "Mạng lưới",
    },
    {
      id: "act_5",
      title: "Chia sẻ danh thiếp số doanh nhân lên Zalo",
      time: "20/10/2026",
      badge: "Chia sẻ",
    },
  ], []);

  // AI Assistant Toggle state
  const [voiceAiEnabled, setVoiceAiState] = useState(() => isVoiceAiEnabled());

  // Active CRM theme state & listener (Yêu cầu 4)
  const [activeTheme, setActiveTheme] = useState<FestivalThemeOption>(() => getEffectiveThemeOption());
  const [themeSyncing, setThemeSyncing] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(getEffectiveThemeOption());
    };
    window.addEventListener("vba-event-theme-changed", handleThemeChange);
    window.addEventListener("ceo1983-theme-changed", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("vba-event-theme-changed", handleThemeChange);
      window.removeEventListener("ceo1983-theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const handleSyncAi = () => {
      setVoiceAiState(isVoiceAiEnabled());
    };
    window.addEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
    window.addEventListener("ceo1983_ai_toggle", handleSyncAi);
    window.addEventListener("storage", handleSyncAi);
    return () => {
      window.removeEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
      window.removeEventListener("ceo1983_ai_toggle", handleSyncAi);
      window.removeEventListener("storage", handleSyncAi);
    };
  }, []);

  const handleToggleVoiceAi = () => {
    const nextVal = !voiceAiEnabled;
    setVoiceAiState(nextVal);
    setVoiceAiEnabled(nextVal);
    toast.success(nextVal ? "Đã bật Trợ lý AI CEO 1983" : "Đã tắt Trợ lý AI CEO 1983");
  };

  // Push notifications state
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const pref = localStorage.getItem("vba_push_notifications_enabled");
    if (pref === "false") return false;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return true;
    return pref === "true";
  });

  const handleToggleNotification = async () => {
    if (!isNotificationEnabled) {
      const res = await requestNotificationPermission();
      if (res === "granted" || (typeof Notification !== "undefined" && Notification.permission === "granted")) {
        setIsNotificationEnabled(true);
        localStorage.setItem("vba_push_notifications_enabled", "true");
        toast.success(isEn ? "Push notifications enabled!" : "Đã bật thông báo đẩy thành công!");
      } else {
        setIsNotificationEnabled(true);
        localStorage.setItem("vba_push_notifications_enabled", "true");
        toast.success(isEn ? "Notification preference saved!" : "Đã lưu cài đặt thông báo!");
      }
    } else {
      setIsNotificationEnabled(false);
      localStorage.setItem("vba_push_notifications_enabled", "false");
      toast.info(isEn ? "Push notifications disabled." : "Đã tắt thông báo đẩy.");
    }
  };

  // Cài đặt ứng dụng nhanh 1 chạm (PWA Native Prompt / Hướng dẫn iOS Safari & Android Chrome)
  const handleFastInstallApp = async () => {
    // 1. Nếu có prompt PWA từ trình duyệt (Chrome/Edge/Samsung Internet): Kích hoạt hộp thoại cài đặt ngay lập tức!
    const p = (window as any).__pwaInstallPrompt;
    if (p && typeof p.prompt === "function") {
      try {
        p.prompt();
        const choice = await p.userChoice;
        if (choice?.outcome === "accepted") {
          toast.success("Ứng dụng đang được tự động cài đặt lên màn hình chính!");
          (window as any).__pwaInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn("Fast install prompt error:", err);
      }
    }

    // 2. Mở bảng điều khiển cài đặt ứng dụng chuyên biệt hỗ trợ cả iPhone (iOS) và Android
    window.dispatchEvent(new CustomEvent("open-install-prompt"));
  };

  // Đăng xuất phiên an toàn
  const handleLogout = async () => {
    try {
      await signOutSession();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  };

  // Avatar & Cover upload refs & states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vba_member_cover_photo");
    }
    return null;
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vba_member_avatar_photo");
    }
    return null;
  });
  const [avatarError, setAvatarError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const syncLocalMedia = () => {
      if (typeof window === "undefined") return;
      const savedCover = localStorage.getItem("vba_member_cover_photo");
      if (savedCover) {
        if (isDeadCover(savedCover)) {
          localStorage.removeItem("vba_member_cover_photo");
          setCoverPhoto(null);
        } else {
          setCoverPhoto(savedCover);
        }
      }
      const savedAvatar = localStorage.getItem("vba_member_avatar_photo");
      if (savedAvatar) {
        if (isDeadAvatar(savedAvatar)) {
          localStorage.removeItem("vba_member_avatar_photo");
          setCustomAvatar(null);
        } else {
          setCustomAvatar(savedAvatar);
        }
      }
    };
    syncLocalMedia();

    const handleCoverUpdate = (e: any) => {
      const detailUrl = e?.detail;
      if (detailUrl && typeof detailUrl === "string") {
        setCoverPhoto(detailUrl);
      }
    };

    const handleAvatarUpdate = (e: any) => {
      const detailUrl = e?.detail;
      if (detailUrl && typeof detailUrl === "string") {
        setCustomAvatar(detailUrl);
        setAvatarError(false);
      }
    };

    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("vba_member_avatar_updated", handleAvatarUpdate);
    window.addEventListener("storage", syncLocalMedia);
    return () => {
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("vba_member_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("storage", syncLocalMedia);
    };
  }, []);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)");
      return;
    }
    setUploadingCover(true);
    const tid = toast.loading(isEn ? "Uploading cover..." : "Đang tải ảnh bìa lên...");
    try {
      const uploadUrl = await uploadFileToNest(file, "covers");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");

      setCoverPhoto(uploadUrl);
      try {
        localStorage.setItem("vba_member_cover_photo", uploadUrl);
        if (user?.id) {
          localStorage.setItem(`vba_member_cover_photo_${user.id}`, uploadUrl);
          const cp = JSON.parse(localStorage.getItem(`vba_custom_profile_${user.id}`) || "{}");
          cp.cover = uploadUrl;
          cp.userId = user.id;
          localStorage.setItem(`vba_custom_profile_${user.id}`, JSON.stringify(cp));
        }
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.coverUrl = uploadUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: uploadUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { cover: uploadUrl } }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: { cover: uploadUrl } }));

      await fetchNestApi("/members/me/cover", {
        method: "PATCH",
        body: JSON.stringify({ coverUrl: uploadUrl }),
      }).catch((apiErr) => {
        console.warn("API /members/me/cover PATCH error:", apiErr);
      });

      toast.success(isEn ? "Cover photo updated successfully!" : "Cập nhật ảnh bìa thành công!", { id: tid });
    } catch (err: any) {
      console.error("Error updating cover photo:", err);
      toast.error(err?.message || (isEn ? "Failed to update cover photo" : "Không thể cập nhật ảnh bìa"), { id: tid });
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh");
      return;
    }
    setUploadingAvatar(true);
    const tid = toast.loading(isEn ? "Uploading avatar..." : "Đang tải ảnh đại diện lên...");
    try {
      const uploadUrl = await uploadFileToNest(file, "avatars");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");

      setCustomAvatar(uploadUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", uploadUrl);
        if (user?.id) {
          localStorage.setItem(`vba_member_avatar_photo_${user.id}`, uploadUrl);
          const cp = JSON.parse(localStorage.getItem(`vba_custom_profile_${user.id}`) || "{}");
          cp.avatar = uploadUrl;
          cp.userId = user.id;
          localStorage.setItem(`vba_custom_profile_${user.id}`, JSON.stringify(cp));
        }
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.avatar = uploadUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: uploadUrl }));
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatar: uploadUrl } }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: { avatar: uploadUrl } }));

      await fetchNestApi("/members/me", {
        method: "PATCH",
        body: JSON.stringify({ avatar: uploadUrl }),
      }).catch((apiErr) => {
        console.warn("API /members/me avatar PATCH error:", apiErr);
      });

      toast.success(isEn ? "Avatar updated successfully!" : "Cập nhật ảnh đại diện thành công!", { id: tid });
    } catch (err: any) {
      console.error("Avatar upload exception:", err);
      toast.error(err?.message || (isEn ? "Failed to upload avatar" : "Lỗi khi tải ảnh đại diện"), { id: tid });
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  // Resolved dynamic fields
  const memberCode = member?.code || (user as any)?.user_metadata?.member_code || "M1983-268";
  const displayName =
    member?.name || user?.name || (user as any)?.user_metadata?.full_name || user?.username || "Doanh Nhân CEO 1983";
  const displayTitle = member?.title || (member as any)?.position || "Tổng Giám Đốc / CEO";
  const displayCompany = (member as any)?.companyName || (member as any)?.company || "Doanh nghiệp CLB CEO 1983";
  const displayPhone = member?.phone || (user as any)?.phone || "0988888888";
  const displayEmail = member?.email || user?.email || "lienhe@ceo1983club.com";
  const displayWebsite = (member as any)?.website || "https://ceo1983club.com";
  const displayAddress =
    (member as any)?.address ||
    (member as any)?.officeAddress ||
    "Tòa nhà CEO 1983 Tower, Cầu Giấy, TP. Hà Nội";
  const displayLat = Number((member as any)?.latitude || (member as any)?.lat || (user as any)?.latitude || 21.0175);
  const displayLng = Number((member as any)?.longitude || (member as any)?.lng || (user as any)?.longitude || 105.7838);
  let rawBio = (member as any)?.bio || (member as any)?.about || "";
  let extractedStaffSize = (member as any)?.companySize || (member as any)?.company_size || (member as any)?.staffSize || "";
  if (typeof rawBio === "string" && rawBio.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawBio);
      rawBio = parsed.notes || parsed.intro || "";
      if (parsed.staffSize && !extractedStaffSize) {
        extractedStaffSize = parsed.staffSize;
      }
    } catch {}
  }

  const displayBio =
    rawBio ||
    "Hội viên tích cực CLB Doanh Nhân CEO 1983 (HanoiBA). Sẵn sàng giao lưu kết nối, hợp tác kinh doanh và mở rộng chuỗi cung ứng B2B bền vững.";

  const displayCompanySize =
    extractedStaffSize ||
    "20 - 50 nhân sự";

  const displayIndustry =
    (member as any)?.industry ||
    (member as any)?.businessField ||
    (member as any)?.business_field ||
    "Sản xuất, Thương mại & Dịch vụ";

  const rawCurrentAvatar =
    member?.avatar ||
    (member as any)?.avatarUrl ||
    (user as any)?.avatar_url ||
    (user as any)?.user_metadata?.avatar_url ||
    customAvatar ||
    null;
  const resolvedAvatar =
    rawCurrentAvatar && !isDeadAvatar(rawCurrentAvatar)
      ? resolveMediaUrl(rawCurrentAvatar) || rawCurrentAvatar
      : null;

  const rawCover = coverPhoto || member?.coverUrl || (member as any)?.cover_url || heroImg;
  const displayCover = rawCover && !isDeadCover(rawCover) ? resolveMediaUrl(rawCover) || rawCover : heroImg;

  const cleanPhone = displayPhone ? displayPhone.replace(/\D/g, "") : "";

  // Share profile handler
  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.viconnect.vn";
    const shareUrl = `${origin}/card/${memberCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ Hội viên: ${displayName}`,
          text: `${displayName} — ${displayTitle} tại ${displayCompany} (CLB Doanh Nhân CEO 1983)`,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép liên kết danh thiếp & hồ sơ cá nhân!");
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleCopyPhone = () => {
    if (!displayPhone) return;
    navigator.clipboard.writeText(displayPhone);
    setCopiedPhone(true);
    toast.success("Đã sao chép số điện thoại!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    if (!displayEmail) return;
    navigator.clipboard.writeText(displayEmail);
    setCopiedEmail(true);
    toast.success("Đã sao chép email liên hệ!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  async function logout() {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-[#F4F6F9] dark:bg-[#0B1120] text-slate-900 dark:text-white flex flex-col justify-start items-center font-sans transition-colors duration-300">
      {/* ── 1. HEADER CHUẨN DI ĐỘNG CEO 1983 (BỎ CÁC ICON CHỨC NĂNG THEO YÊU CẦU 4) ── */}
      <MemberHeader
        title={isEn ? "Profile" : "Trang cá nhân"}
        back
        right={null}
      />

      <div className="w-full max-w-lg flex flex-col justify-start items-stretch gap-3 px-3 sm:px-4 pt-1">
        {/* Hidden inputs upload ảnh */}
        <input
          type="file"
          ref={coverInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* ── 2. CARD PROFILE NỔI BẬT: ẢNH BÌA, AVATAR, THÔNG TIN VÀ 4 NÚT HÀNH ĐỘNG TINH GỌN ── */}
        <div className="w-full rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800">
          {/* Ảnh Bìa với Badge Mã và Nút Đổi Bìa */}
          <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-slate-900">
            <img
              src={displayCover}
              alt="Cover Photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />

            {/* Mã Hội Viên */}
            <div className="absolute top-3 left-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold">{memberCode}</span>
              </div>
            </div>

            {/* Nút Đổi ảnh bìa */}
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold transition active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
              title="Đổi ảnh bìa"
            >
              <Camera className="h-3.5 w-3.5 text-amber-300" />
              <span>{uploadingCover ? "Đang tải..." : "Đổi ảnh bìa"}</span>
            </button>
          </div>

          {/* Khối Thân Profile đè lên ảnh bìa */}
          <div className="relative -mt-12 px-4 pb-4 pt-0 flex flex-col items-center text-center">
            {/* Avatar Tròn & Nút Đổi Avatar */}
            <div className="relative -mt-10 sm:-mt-12 mb-2">
              <div className="size-22 sm:size-24 rounded-full border-4 border-white dark:border-[#0F172A] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {resolvedAvatar && !avatarError ? (
                  <img
                    src={resolvedAvatar}
                    alt={displayName}
                    onError={() => setAvatarError(true)}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-[#003B95] to-[#001D4A] flex items-center justify-center text-white text-xl font-black">
                    {initials(displayName)}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 size-7 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#003B95] hover:scale-110 active:scale-95 transition cursor-pointer"
                title="Đổi ảnh đại diện"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            {/* Họ và Tên kèm Tích Xanh Xác Thực */}
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {displayName}
              </h1>
              <BadgeCheck className="size-5 text-[#003B95] dark:text-blue-400 fill-[#003B95]/10 shrink-0" />
            </div>

            {/* Chức vụ & Doanh nghiệp */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs">
              <div className="inline-flex items-center gap-1 font-bold text-[#003B95] dark:text-blue-400">
                <Briefcase className="size-3.5" />
                <span>{displayTitle}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                <Building2 className="size-3.5 text-slate-400" />
                <span>{displayCompany}</span>
              </div>
            </div>

            {/* (ĐÃ BỎ HOÀN TOÀN TEXT & BADGE HỘI VIÊN CHÍNH THỨC PER YÊU CẦU NGƯỜI DÙNG: "ĐÃ ĐĂNG NHẬP RỒI THÌ LÀ HỘI VIÊN RỒI") */}

            {/* ── 4 NÚT HÀNH ĐỘNG TINH GỌN (LÀM NHỎ LẠI, KHÔNG ĐỂ BACKGROUND) ── */}
            {/* ── 4 NÚT HÀNH ĐỘNG TINH GỌN DƯỚI AVATAR (YÊU CẦU 2): DANH THIẾP, CHIA SẺ, QUÉT MÃ, SỬA HỒ SƠ ── */}
            <div className="grid grid-cols-4 gap-1 w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              {/* Nút 1: Danh thiếp */}
              <button
                type="button"
                onClick={() => setCardPreviewOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Xem danh thiếp số"
              >
                <CreditCard className="size-5 text-[#003B95] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Danh thiếp</span>
              </button>

              {/* Nút 2: Chia sẻ */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Chia sẻ hồ sơ"
              >
                <Share2 className="size-5 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Chia sẻ</span>
              </button>

              {/* Nút 3: Quét mã */}
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Mã QR hội viên"
              >
                <QrCode className="size-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Quét mã</span>
              </button>

              {/* Nút 4: Sửa hồ sơ */}
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Chỉnh sửa hồ sơ"
              >
                <Pencil className="size-5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Sửa hồ sơ</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. THANH SEGMENTED TABS: HỒ SƠ | GIAO THƯƠNG | CÀI ĐẶT ── */}
        <div className="w-full">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "about"
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Hồ sơ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("friends")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "friends"
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Giao thương</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "posts"
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>Cài đặt &amp; Bảo mật</span>
            </button>
          </div>
        </div>

        {/* ── 4. NỘI DUNG THEO TỪNG TAB (TẤT CẢ DẠNG ĐẦU MỤC THU GỌN - BẤM VÀO MỚI MỞ RA) ── */}

        {/* ── TAB 1: HỒ SƠ DOANH NHÂN (ĐÃ BỎ CARD LIÊN HỆ & KẾT NỐI TRỰC TIẾP PER YÊU CẦU 2) ── */}
        {activeTab === "about" && (
          <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            {/* 1.1. Đầu mục: Giới thiệu doanh nhân & năng lực */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("bio")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Giới thiệu doanh nhân &amp; năng lực
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Tiểu sử, định hướng hợp tác và tầm nhìn phát triển
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["bio"] ? "rotate-180 text-[#003B95] dark:text-amber-400" : ""
                  }`}
                />
              </button>

              {expandedSections["bio"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                    {displayBio}
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditProfileOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold transition hover:bg-amber-100 cursor-pointer"
                    >
                      <Pencil className="size-3" />
                      <span>Chỉnh sửa phần giới thiệu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1.2. Đầu mục: Quy mô & Lĩnh vực kinh doanh */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("business")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Quy mô &amp; Lĩnh vực kinh doanh
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {displayCompanySize} • {displayIndustry}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["business"] ? "rotate-180 text-[#003B95] dark:text-amber-400" : ""
                  }`}
                />
              </button>

              {expandedSections["business"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Quy mô nhân sự</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                        {displayCompanySize}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Lĩnh vực</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">
                        {displayIndustry}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Công ty trực thuộc</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{displayCompany}</div>
                    </div>
                    <Building2 className="size-4 text-slate-400" />
                  </div>

                  {/* Địa chỉ doanh nghiệp và Bản đồ định vị tương tác */}
                  <div className="pt-2">
                    <CeoBusinessLocationPicker
                      initialAddress={displayAddress}
                      initialLat={displayLat}
                      initialLng={displayLng}
                      companyName={displayCompany}
                      userId={user?.id}
                      onAddressSaved={() => {
                        reloadMember?.();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: GIAO THƯƠNG B2B (YÊU CẦU 3: HIỆN HẾT SỰ KIỆN, HỌP BAN, CUỘC GẶP & LỊCH SỬ THAO TÁC, XÓA NFC QR) ── */}
        {activeTab === "friends" && (
          <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            {/* 2.1. Đầu mục: Sự kiện đã tham gia (Hiện hết tất cả - Yêu cầu 3) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("events")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Sự kiện đã tham gia
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-[#003B95] dark:text-blue-300 text-[10px] font-black">
                        {participatedEvents.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Lịch sử toàn bộ sự kiện đã đăng ký trong năm
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["events"] ? "rotate-180 text-[#003B95] dark:text-amber-400" : ""
                  }`}
                />
              </button>

              {expandedSections["events"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  {participatedEvents.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bạn chưa đăng ký tham gia sự kiện nào.
                      </p>
                      <Link
                        to="/association/events"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline"
                      >
                        <span>Khám phá lịch sự kiện CLB</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* HIỆN TOÀN BỘ SỰ KIỆN THEO ĐÚNG YÊU CẦU 3 (BỎ SLICE) */}
                      {participatedEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to="/events/$eventId"
                          params={{ eventId: ev.id } as any}
                          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-10 rounded-xl bg-[#003B95] text-white flex flex-col items-center justify-center shrink-0 leading-tight">
                              <span className="text-[10px] font-black">{ev.day || "EV"}</span>
                              <span className="text-[8px] font-bold uppercase">{ev.month || "CEO"}</span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition">
                                {ev.title}
                              </h5>
                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                                {ev.time || "Theo lịch"} • {ev.place || "Hà Nội"}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold shrink-0 border border-emerald-200">
                            Đã đăng ký
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2.2. Đầu mục: Cuộc họp ban (Yêu cầu 3) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("committee_meetings")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Cuộc họp ban
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                        {committeeMeetings.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Ban Thư Ký, Xúc Tiến Thương Mại, Truyền Thông &amp; Điều Hành
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["committee_meetings"] ? "rotate-180 text-purple-600 dark:text-purple-400" : ""
                  }`}
                />
              </button>

              {expandedSections["committee_meetings"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  {committeeMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9.5px] font-extrabold uppercase">
                          {m.department}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9.5px] font-extrabold">
                          {m.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {m.title}
                      </h5>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          <span>{m.time}, {m.date}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-full">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{m.location}</span>
                        </span>
                      </div>
                      {m.zoomUrl && (
                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href={m.zoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#003B95] text-white text-[11px] font-bold shadow-2xs hover:bg-[#002d73] transition cursor-pointer"
                          >
                            <Video className="size-3 text-amber-300" />
                            <span>Vào phòng họp</span>
                          </a>
                          <span className="text-[10px] text-slate-400 italic">Được cấp bởi Ban Thư Ký</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2.3. Đầu mục: Cuộc gặp giao thương 1-on-1 (Yêu cầu 3) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("meetings_1on1")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <Handshake className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Cuộc gặp giao thương 1-on-1
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                        {meetings1on1.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Lịch hẹn cafe, trao đổi cung ứng và gặp gỡ đối tác
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["meetings_1on1"] ? "rotate-180 text-amber-600 dark:text-amber-400" : ""
                  }`}
                />
              </button>

              {expandedSections["meetings_1on1"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  {meetings1on1.map((meet) => (
                    <div
                      key={meet.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#003B95] dark:text-blue-400">
                          {meet.partnerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-extrabold">
                          {meet.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {meet.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Doanh nghiệp: {meet.partnerCompany}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="size-3 text-amber-500" />
                          <span>{meet.time} ngày {meet.date}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-full">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{meet.location}</span>
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-between">
                        <a
                          href={`https://zalo.me/${meet.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#003B95] dark:text-blue-300 text-[10.5px] font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          <span>Nhắn Zalo đối tác</span>
                        </a>
                        <a
                          href={`tel:${meet.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <Phone className="size-3 text-emerald-600" />
                          <span>Gọi điện</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2.4. Đầu mục: Cơ hội giao thương B2B */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("opportunities")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Cơ hội giao thương B2B
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                        {connectedOpportunities.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Các gói deal, chào mua và hợp tác chuỗi cung ứng
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["opportunities"] ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                />
              </button>

              {expandedSections["opportunities"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  {connectedOpportunities.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bạn chưa gửi quan tâm hoặc kết nối cơ hội giao thương nào.
                      </p>
                      <Link
                        to="/association/opportunities"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Khám phá cơ hội hợp tác B2B</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectedOpportunities.map((opp) => (
                        <Link
                          key={opp.id}
                          to="/association/opportunities"
                          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition">
                              {opp.title}
                            </h5>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                              {opp.company || "Hội viên CLB"} • {opp.value || "Thỏa thuận B2B"}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 text-[10px] font-extrabold shrink-0 border border-blue-200">
                            {opp.interested ? "Đã quan tâm" : "Đã đăng"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2.5. Đầu mục: Khám phá Marketplace & Danh bạ CEO */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("marketplace")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
                    <Package className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Khám phá Marketplace &amp; Danh bạ CEO
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Gian hàng sản phẩm, dịch vụ và danh bạ 500+ doanh nhân
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["marketplace"] ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                  }`}
                />
              </button>

              {expandedSections["marketplace"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  <Link
                    to="/association/products"
                    search={undefined as any}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                        <Package className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Gian hàng sản phẩm &amp; dịch vụ</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Ưu đãi độc quyền giữa các doanh nghiệp CLB</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 shrink-0" />
                  </Link>

                  <Link
                    to="/association/members"
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
                        <Users className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Danh bạ CEO 1983</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Tra cứu thông tin và kết nối lãnh đạo</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 shrink-0" />
                  </Link>

                  <Link
                    to="/association/calendar"
                    className="p-3 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 dark:from-red-950/30 dark:via-amber-950/30 dark:to-blue-950/30 rounded-2xl border border-amber-400/40 flex items-center justify-between hover:border-amber-500 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-amber-500 text-slate-950 grid place-items-center shrink-0 shadow-xs">
                        <Calendar className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">Lịch hoạt động &amp; Nhắc hẹn</h5>
                          <span className="px-1.5 py-0.2 rounded-md bg-red-600 text-white text-[8.5px] font-black uppercase">
                            Nhắc lịch
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Xem sự kiện, họp ban, cuộc gặp &amp; cài thông báo nhắc</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-amber-500 shrink-0" />
                  </Link>
                </div>
              )}
            </div>

            {/* 2.6. Đầu mục: Lịch sử thao tác gần đây (DƯỚI CÙNG TAB GIAO THƯƠNG PER YÊU CẦU 3) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("audit_history")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 grid place-items-center shrink-0">
                    <History className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Lịch sử thao tác
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Nhật ký hoạt động, đăng ký sự kiện &amp; tương tác gần đây
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["audit_history"] ? "rotate-180 text-slate-900 dark:text-white" : ""
                  }`}
                />
              </button>

              {expandedSections["audit_history"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  {auditHistory.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {act.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700 text-[9.5px] font-bold text-slate-600 dark:text-slate-300">
                          {act.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: CÀI ĐẶT & BẢO MẬT (CHỦ ĐỀ & 4 TÍNH NĂNG NHANH ĐƯỢC ĐƯA VÀO ĐÂY PER YÊU CẦU 2) ── */}
        {activeTab === "posts" && (
          <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            {/* 3.1. Đầu mục: Chủ đề giao diện CLB (Đồng bộ CRM - Yêu cầu 2) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("theme_crm")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 grid place-items-center shrink-0 border border-amber-500/20">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Chủ đề giao diện CLB
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        ĐỒNG BỘ CRM
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Cấu hình nhận diện thương hiệu bởi Ban Điều Hành
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["theme_crm"] ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>

              {expandedSections["theme_crm"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-500/5 dark:from-slate-800/40 dark:to-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-lg flex items-center justify-center text-xl bg-white dark:bg-slate-900 shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0">
                        {activeTheme.iconEmoji || "👑"}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                          {activeTheme.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {activeTheme.tagline}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="size-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
                        style={{ backgroundColor: activeTheme.primaryColor }}
                        title={`Màu chủ đạo: ${activeTheme.primaryColor}`}
                      />
                      <span
                        className="size-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"
                        style={{ backgroundColor: activeTheme.accentColor }}
                        title={`Màu điểm nhấn: ${activeTheme.accentColor}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Tự động tải bảng màu theo mùa lễ hội CLB
                    </span>
                    <button
                      type="button"
                      disabled={themeSyncing}
                      onClick={async () => {
                        setThemeSyncing(true);
                        try {
                          await syncThemeFromBackend();
                          setActiveTheme(getEffectiveThemeOption());
                          toast.success("Đã đồng bộ chủ đề giao diện mới nhất từ CRM!");
                        } catch {
                          toast.error("Không thể đồng bộ chủ đề lúc này");
                        } finally {
                          setThemeSyncing(false);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`size-3.5 ${themeSyncing ? "animate-spin" : ""}`} />
                      <span>{themeSyncing ? "Đang đồng bộ..." : "Đồng bộ lại"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3.2. Đầu mục: Cài đặt hiển thị 4 tính năng nhanh trang chủ (Yêu cầu 2) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("home_shortcuts")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <LayoutDashboard className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Cài đặt 4 tính năng nhanh trang chủ
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-blue-500/15 text-[#003B95] dark:text-blue-300">
                        {selectedShortcuts.length}/4 CHỌN
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Tùy biến các lối tắt tiện ích hiển thị ở màn hình chính
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["home_shortcuts"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
                  }`}
                />
              </button>

              {expandedSections["home_shortcuts"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    4 tính năng nhanh được hiển thị trên Trang chủ của bạn:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedShortcuts.map((id) => {
                      const item = ALL_SHORTCUT_OPTIONS.find((s) => s.id === id);
                      if (!item) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700"
                        >
                          <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#003B95] dark:text-blue-300 grid place-items-center shrink-0">
                            {getShortcutIcon(item.iconName, "size-4")}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomShortcutsOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002d73] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="size-4 text-amber-300" />
                    <span>Tùy biến lại 4 tính năng hiển thị</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3.3. Đầu mục: Cài đặt hệ thống (Ngôn ngữ, Giao diện, AI Bot, Thông báo) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("system_settings")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 grid place-items-center shrink-0">
                    <Cog className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cài đặt hệ thống
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Ngôn ngữ, Giao diện sáng/tối, Trợ lý AI và Thông báo đẩy
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["system_settings"] ? "rotate-180 text-slate-900 dark:text-white" : ""
                  }`}
                />
              </button>

              {expandedSections["system_settings"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  {/* Ngôn ngữ */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Globe className="size-3.5 text-[#003B95] dark:text-blue-400" />
                      <span>{isEn ? "Display Language" : "Ngôn ngữ hiển thị"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLang("vi");
                          toast.success("Đã chuyển sang Tiếng Việt");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          lang === "vi"
                            ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span>🇻🇳 Tiếng Việt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLang("en");
                          toast.success("Switched to English");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          lang === "en"
                            ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span>🇬🇧 English</span>
                      </button>
                    </div>
                  </div>

                  {/* Trợ lý AI */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Bot className="size-4 text-sky-500" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                          Trợ lý AI CEO 1983
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {voiceAiEnabled ? "Đang bật nút trợ lý nổi" : "Đang tắt"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={voiceAiEnabled}
                      onClick={handleToggleVoiceAi}
                      className={`w-11 h-6 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                        voiceAiEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`size-5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                          voiceAiEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Chế độ Sáng / Tối */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" />
                      <span>{isEn ? "Appearance Mode" : "Giao diện hiển thị"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTheme("light");
                          toast.success(isEn ? "Light mode enabled" : "Đã chuyển sang giao diện sáng");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          theme === "light"
                            ? "border-[#003B95] bg-blue-50 text-[#003B95] shadow-2xs font-extrabold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Sun className="size-3.5 text-amber-500" />
                        <span>Sáng</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTheme("dark");
                          toast.success(isEn ? "Dark mode enabled" : "Đã chuyển sang giao diện tối");
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          theme === "dark"
                            ? "border-amber-400 bg-amber-950/40 text-amber-400 shadow-2xs font-extrabold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Moon className="size-3.5 text-sky-400" />
                        <span>Tối</span>
                      </button>
                    </div>
                  </div>

                  {/* Thông báo đẩy */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Bell className="size-4 text-rose-500" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                          Thông báo đẩy &amp; Tin tức
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {isNotificationEnabled ? "Đang bật nhận chuông" : "Đang tắt"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isNotificationEnabled}
                      onClick={handleToggleNotification}
                      className={`w-11 h-6 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                        isNotificationEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`size-5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                          isNotificationEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3.4. Đầu mục: Cài đặt ứng dụng PWA / Mobile App */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("install_app")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <Smartphone className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cài đặt ứng dụng PWA / Mobile App
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Cài ứng dụng lên màn hình chính điện thoại
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["install_app"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
                  }`}
                />
              </button>

              {expandedSections["install_app"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={handleFastInstallApp}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between hover:brightness-105 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-[#003B95] text-white grid place-items-center shrink-0 shadow-xs">
                        <Smartphone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block truncate">
                          Cài đặt ứng dụng lên màn hình chính
                        </span>
                        <span className="text-[10.5px] text-blue-700 dark:text-blue-300/80 block line-clamp-1">
                          Tải file APK Android hoặc ghim Icon App lên iOS Safari
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* 3.5. Đầu mục: Hỗ trợ Ban Thư Ký & Hướng dẫn sử dụng App */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("support_guide")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-500 grid place-items-center shrink-0">
                    <Headphones className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Hỗ trợ Ban Thư Ký &amp; Cẩm nang App
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Hotline: 098.333.1983 • banthuky@ceo1983.vn
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["support_guide"] ? "rotate-180 text-rose-500" : ""
                  }`}
                />
              </button>

              {expandedSections["support_guide"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
                  <div className="space-y-2 text-xs">
                    {/* Hotline Ban Thư Ký */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-white text-xs truncate">098.333.1983</span>
                      </div>
                      <a
                        href="tel:0983331983"
                        className="px-2.5 py-1 rounded-xl bg-[#00A86B] text-white font-bold text-xs"
                      >
                        Gọi ngay
                      </a>
                    </div>
                    {/* Email */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="size-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-white text-xs truncate">banthuky@ceo1983.vn</span>
                      </div>
                      <a
                        href="mailto:banthuky@ceo1983.vn"
                        className="px-2.5 py-1 rounded-xl border border-blue-600 text-[#003B95] dark:text-blue-400 font-bold text-xs"
                      >
                        Gửi thư
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setContactSupportOpen(true)}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Headphones className="size-3.5" />
                      <span>Gửi phản ánh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserGuideOpen(true)}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="size-3.5" />
                      <span>Xem cẩm nang</span>
                    </button>
                  </div>

                  {hasAdminPrivilege && (
                    <Link
                      to="/association/permissions"
                      className="w-full p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-indigo-600" />
                        <span>Phân quyền Ban Quản Trị &amp; RBAC</span>
                      </div>
                      <ChevronRight className="size-3.5 text-indigo-500" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 3.6. Đầu mục: Bảo mật tài khoản & Đổi mật khẩu */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("account_security")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Bảo mật tài khoản &amp; Đổi mật khẩu
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Quản lý mật khẩu, email và an toàn thông tin
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["account_security"] ? "rotate-180 text-emerald-500" : ""
                  }`}
                />
              </button>

              {expandedSections["account_security"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  <AccountSecuritySettingsForm />
                </div>
              )}
            </div>

            {/* Nút Đăng xuất tài khoản */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
              >
                <LogOut className="size-4 text-rose-500" />
                <span>Đăng xuất khỏi ứng dụng</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Cài đặt 4 tính năng nhanh trang chủ (Yêu cầu 2) */}
      <CustomHomeShortcutsModal
        isOpen={customShortcutsOpen}
        onClose={() => setCustomShortcutsOpen(false)}
        selectedIds={selectedShortcuts}
        onSave={handleSaveShortcuts}
      />

      {/* ── 5. MODALS (DANH THIẾP, SỬA HỒ SƠ, QR CODE, HƯỚNG DẪN SỬ DỤNG) ── */}

      {/* Modal 1: Xem trước Danh thiếp số VIP */}
      {cardPreviewOpen && (
        <CardPreviewModal
          slug={memberCode}
          name={displayName}
          title={displayTitle}
          company={displayCompany}
          avatarUrl={resolvedAvatar}
          onClose={() => setCardPreviewOpen(false)}
        />
      )}

      {/* Modal 2: Chỉnh sửa nhanh hồ sơ cá nhân / doanh nghiệp */}
      <QuickProfileEditModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        initialName={displayName}
        initialPhone={displayPhone}
        initialAvatar={resolvedAvatar}
        initialCover={displayCover}
        initialCompany={displayCompany}
        initialTitle={displayTitle}
        initialAddress={displayAddress}
        initialWebsite={displayWebsite}
        initialCompanySize={displayCompanySize}
        initialIndustry={displayIndustry}
        initialBio={displayBio}
        userId={user?.id}
        onSaved={(_updated) => {
          setEditProfileOpen(false);
          toast.success("Đã lưu cập nhật hồ sơ doanh nghiệp thành công!");
          reloadMember?.();
        }}
      />

      {/* Modal 3: Mã QR Hội viên CEO 1983 */}
      {qrModalOpen && (
        <AssociationMemberQrModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          memberCode={memberCode}
          memberName={displayName}
          memberTitle={displayTitle}
          memberCompany={displayCompany}
          memberAvatar={resolvedAvatar}
        />
      )}

      {/* Modal 4: Hướng dẫn sử dụng App CEO 1983 (CHỈ DÀNH CHO APP) */}
      <UserGuideModal
        open={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
      />

      {/* Modal 5: Liên hệ hỗ trợ Ban Thư Ký */}
      <ContactSupportModal
        open={contactSupportOpen}
        onClose={() => setContactSupportOpen(false)}
      />
    </div>
  );
}
