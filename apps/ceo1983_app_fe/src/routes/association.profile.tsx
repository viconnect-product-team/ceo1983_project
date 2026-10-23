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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { CardPreviewModal } from "@/components/member/CardPreviewModal";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { AccountSecuritySettingsForm } from "@/components/member/AccountSecuritySettingsForm";
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

  // Cài đặt ứng dụng nhanh 1 chạm (PWA Native Prompt / Tải APK Android / Hướng dẫn iOS Safari)
  const handleFastInstallApp = async () => {
    // 1. Nếu có prompt PWA từ trình duyệt (Chrome/Edge/Samsung Internet): Kích hoạt hộp thoại cài đặt ngay lập tức!
    const p = (window as any).__pwaInstallPrompt;
    if (p && typeof p.prompt === "function") {
      try {
        p.prompt();
        const choice = await p.userChoice;
        if (choice?.outcome === "accepted") {
          toast.success("Ứng dụng đang được tự động cài đặt lên màn hình chính!");
        }
        (window as any).__pwaInstallPrompt = null;
        return;
      } catch (err) {
        console.warn("Fast install prompt error:", err);
      }
    }

    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
    const isAndroid = /android/i.test(userAgent);
    const isIos = /iphone|ipad|ipod/i.test(userAgent);

    // 2. Nếu là Android (không có sự kiện prompt trước đó): Tự động kích hoạt tải nhanh tệp APK cài đặt gốc
    if (isAndroid) {
      toast.info("Đang tự động tải bộ cài APK ứng dụng CEO 1983 cho Android...");
      const link = document.createElement("a");
      link.href = "/docs/CEO1983-app-latest.apk";
      link.download = "CEO1983-app-latest.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 3. Nếu là iOS: Thông báo nhanh 1 thao tác và mở popup chỉ dẫn
    if (isIos) {
      toast.info("Chạm nút Chia sẻ ⎋ dưới đáy Safari → chọn 'Thêm vào MH chính' ⊞", {
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent("open-install-prompt"));
      return;
    }

    // 4. Môi trường khác: Mở popup hướng dẫn cài đặt PWA
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
      } catch {}

      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: uploadUrl }));

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
        window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: uploadUrl }));
      } catch {}

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
            <div className="grid grid-cols-4 gap-1 w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              {/* Nút 1: Danh thiếp */}
              <button
                type="button"
                onClick={() => setCardPreviewOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Xem danh thiếp số"
              >
                <CreditCard className="size-4.5 text-[#003B95] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Danh thiếp</span>
              </button>

              {/* Nút 2: Sửa hồ sơ */}
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Chỉnh sửa hồ sơ"
              >
                <Pencil className="size-4.5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Sửa hồ sơ</span>
              </button>

              {/* Nút 3: Chia sẻ */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Chia sẻ hồ sơ"
              >
                <Share2 className="size-4.5 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Chia sẻ</span>
              </button>

              {/* Nút 4: Mã QR */}
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Mã QR hội viên"
              >
                <QrCode className="size-4.5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Mã QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD CHỦ ĐỀ GIAO DIỆN CLB (ĐỒNG BỘ TỪ CRM - YÊU CẦU 4) ── */}
        <div className="w-full rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0 border border-amber-500/20">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Chủ đề giao diện CLB</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ĐỒNG BỘ CRM
                  </span>
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Tự động hiển thị và đồng bộ theo cấu hình Ban Điều Hành
                </p>
              </div>
            </div>
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
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#003B95] dark:hover:text-amber-400 transition cursor-pointer disabled:opacity-50"
              title="Đồng bộ lại chủ đề từ CRM"
            >
              <RotateCcw className={`size-4 ${themeSyncing ? "animate-spin text-amber-500" : ""}`} />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-500/5 dark:from-slate-800/40 dark:to-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-lg flex items-center justify-center text-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0">
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

        {/* ── 4. NỘI DUNG THEO TỪNG TAB ── */}

        {/* ── TAB 1: HỒ SƠ & THÔNG TIN KẾT NỐI TRỰC TIẾP ── */}
        {activeTab === "about" && (
          <div className="w-full space-y-3 animate-in fade-in duration-200">
            {/* Card Thông tin liên hệ trực tiếp */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>Thông tin liên hệ &amp; kết nối trực tiếp</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* SĐT / Hotline */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Hotline / SĐT</span>
                      <span className="font-bold text-slate-800 dark:text-white block truncate">{displayPhone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3 py-1 rounded-xl bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        Gọi
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Sao chép số điện thoại"
                    >
                      {copiedPhone ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                      <span className="font-bold text-slate-800 dark:text-white block truncate">{displayEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {displayEmail && (
                      <a
                        href={`mailto:${displayEmail}`}
                        className="px-2.5 py-1 rounded-xl border border-blue-600 text-[#003B95] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs transition cursor-pointer"
                      >
                        Gửi thư
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Sao chép Email"
                    >
                      {copiedEmail ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Địa chỉ trụ sở */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ / Trụ sở</span>
                    <span className="font-semibold text-slate-800 dark:text-white block line-clamp-1">{displayAddress}</span>
                  </div>
                </div>

                {/* Website chính thức */}
                {displayWebsite && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Website</span>
                        <span className="font-bold text-slate-800 dark:text-white block truncate">{displayWebsite}</span>
                      </div>
                    </div>
                    <a
                      href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mở web</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Card Giới thiệu doanh nhân / Bio */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>Giới thiệu doanh nhân &amp; năng lực</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  <Pencil className="size-3" />
                  <span>Sửa</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {displayBio}
              </p>
            </div>

            {/* Card Thông số quy mô & lĩnh vực */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Quy mô &amp; Lĩnh vực kinh doanh</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Quy mô nhân sự</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{displayCompanySize}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Lĩnh vực</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{displayIndustry}</div>
                </div>
              </div>
            </div>

            {/* Card Thống kê hoạt động & kết nối giao thương (Ý kiến cuộc họp - Item 15) */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <span>Hoạt động &amp; Kết nối giao thương</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("friends")}
                  className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Chi tiết</span>
                  <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setActiveTab("friends")}
                  className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100/60 transition"
                >
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Sự kiện đã tham gia</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{participatedEvents.length} sự kiện</div>
                </div>
                <div
                  onClick={() => setActiveTab("friends")}
                  className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 cursor-pointer hover:bg-amber-100/60 transition"
                >
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Cơ hội đã kết nối</div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{connectedOpportunities.length} cơ hội</div>
                </div>
              </div>
            </div>

            {/* Card Kênh kết nối số & mạng xã hội */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                <span>Kênh kết nối số &amp; mạng xã hội</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 hover:bg-blue-100/60 transition cursor-pointer"
                >
                  <div className="size-7 rounded-lg bg-[#0068FF] text-white font-black text-xs grid place-items-center">
                    Z
                  </div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Nhắn Zalo</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 hover:bg-amber-100/60 transition cursor-pointer"
                >
                  <div className="size-7 rounded-lg bg-amber-500 text-white grid place-items-center">
                    <Share2 className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Chia sẻ hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: HOẠT ĐỘNG & GIAO THƯƠNG B2B ── */}
        {activeTab === "friends" && (
          <div className="w-full space-y-3 animate-in fade-in duration-200">
            {/* ── LỊCH SỬ HOẠT ĐỘNG: SỰ KIỆN ĐÃ THAM GIA (Ý KIẾN CUỘC HỌP - ITEM 15) ── */}
            <div className="w-full p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Sự kiện đã tham gia ({participatedEvents.length})
                    </h4>
                    <span className="text-[10px] text-slate-400">Lịch sử sinh hoạt &amp; kết nối CLB</span>
                  </div>
                </div>
                <Link
                  to="/events"
                  className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Tất cả</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>

              {participatedEvents.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bạn chưa đăng ký tham gia sự kiện nào sắp tới.
                  </p>
                  <Link
                    to="/events"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline"
                  >
                    <span>Khám phá lịch sự kiện CLB</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {participatedEvents.slice(0, 3).map((ev) => (
                    <Link
                      key={ev.id}
                      to="/events/$eventId"
                      params={{ eventId: ev.id }}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 leading-tight">
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

            {/* ── LỊCH SỬ HOẠT ĐỘNG: CƠ HỘI KINH DOANH ĐÃ KẾT NỐI (Ý KIẾN CUỘC HỌP - ITEM 15) ── */}
            <div className="w-full p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center">
                    <Handshake className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cơ hội đã kết nối ({connectedOpportunities.length})
                    </h4>
                    <span className="text-[10px] text-slate-400">Giao thương &amp; đối tác quan tâm</span>
                  </div>
                </div>
                <Link
                  to="/association/opportunities"
                  className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Tất cả</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>

              {connectedOpportunities.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bạn chưa gửi quan tâm hoặc kết nối cơ hội giao thương nào.
                  </p>
                  <Link
                    to="/association/opportunities"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Khám phá cơ hội hợp tác B2B</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {connectedOpportunities.slice(0, 3).map((opp) => (
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

            {/* Mục 1: Quản lý danh thiếp số */}
            <button
              type="button"
              onClick={() => setCardPreviewOpen(true)}
              className="w-full p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#003B95] dark:text-sky-400 grid place-items-center border border-sky-100 dark:border-sky-900/50 shrink-0">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Danh thiếp số NFC &amp; QR</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Xem trước thẻ doanh nhân và hồ sơ 2 trang</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 shrink-0" />
            </button>

            {/* Mục 2: Cơ hội giao thương B2B */}
            <Link
              to="/association/opportunities"
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center border border-amber-100 dark:border-amber-900/50 shrink-0">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cơ hội giao thương B2B</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Đăng và tìm kiếm cơ hội hợp tác kinh doanh</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 shrink-0" />
            </Link>

            {/* Mục 3: Gian hàng sản phẩm & dịch vụ */}
            <Link
              to="/association/products"
              search={{}}
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                  <Package className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gian hàng sản phẩm &amp; dịch vụ</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Showcase sản phẩm ưu đãi dành riêng cho hội viên</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 shrink-0" />
            </Link>

            {/* Mục 4: Danh bạ hội viên CLB CEO 1983 */}
            <Link
              to="/association/members"
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 grid place-items-center border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                  <Users className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Danh bạ hội viên CLB CEO 1983</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tra cứu &amp; kết nối 500+ doanh nhân</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 shrink-0" />
            </Link>
          </div>
        )}

        {/* ── TAB 3: CÀI ĐẶT HỆ THỐNG & BẢO MẬT TÀI KHOẢN ── */}
        {activeTab === "posts" && (
          <div className="w-full space-y-4 animate-in fade-in duration-200">
            {/* 1. KHỐI CÀI ĐẶT HỆ THỐNG (SYSTEM SETTINGS) */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <Cog className="h-4 w-4 text-amber-500" />
                  <span>{isEn ? "System Settings" : "Cài đặt hệ thống"}</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  CEO 1983 App
                </span>
              </div>

              {/* Mục 1: Chọn ngôn ngữ (Language Selector) */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">
                        {isEn ? "Display Language" : "Ngôn ngữ hiển thị"}
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                        {lang === "vi" ? "Đang chọn Tiếng Việt" : "Selected English"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLang("vi");
                      toast.success("Đã chuyển sang Tiếng Việt");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      lang === "vi"
                        ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-sm">🇻🇳</span>
                    <span>Tiếng Việt</span>
                    {lang === "vi" && <Check className="size-3.5 text-[#003B95] dark:text-amber-400 ml-auto" />}
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
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-sm">🇬🇧</span>
                    <span>English</span>
                    {lang === "en" && <Check className="size-3.5 text-[#003B95] dark:text-amber-400 ml-auto" />}
                  </button>
                </div>
              </div>

              {/* Mục 2: Bật/Tắt Trợ lý AI CEO 1983 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="size-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 grid place-items-center shrink-0">
                    <Bot className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                      {isEn ? "AI Voice & Chat Assistant" : "Trợ lý điều khiển & Trò chuyện AI"}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {voiceAiEnabled
                        ? (isEn ? "Floating AI bot is visible on screen" : "Đang hiển thị trợ lý AI nổi trên màn hình")
                        : (isEn ? "AI bot is currently hidden" : "Đang tắt / ẩn trợ lý AI")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={voiceAiEnabled}
                  onClick={handleToggleVoiceAi}
                  className={`w-12 h-6.5 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                    voiceAiEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  title="Bật/tắt Trợ lý AI"
                >
                  <div
                    className={`size-5.5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                      voiceAiEnabled ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Mục 3: Giao diện hiển thị (Theme sáng / tối) */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">
                        {isEn ? "Appearance Mode" : "Giao diện hiển thị"}
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                        {theme === "dark" ? "Chế độ ban đêm (Dark Mode)" : "Chế độ ban ngày (Light Mode)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
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
                    <Sun className="size-4 text-amber-500" />
                    <span>{isEn ? "Light" : "Giao diện sáng"}</span>
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
                    <Moon className="size-4 text-sky-400" />
                    <span>{isEn ? "Dark" : "Giao diện tối"}</span>
                  </button>
                </div>
              </div>

              {/* Mục 4: Thông báo đẩy & Tin nhắn nền */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="size-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 grid place-items-center shrink-0">
                    <Bell className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                      {isEn ? "Push Notifications" : "Thông báo đẩy & Tin tức CLB"}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {isNotificationEnabled
                        ? (isEn ? "Enabled notifications" : "Đang bật nhận chuông và tin nhắn")
                        : (isEn ? "Notifications are disabled" : "Đang tắt thông báo")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isNotificationEnabled}
                  onClick={handleToggleNotification}
                  className={`w-12 h-6.5 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                    isNotificationEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  title="Bật/tắt Thông báo"
                >
                  <div
                    className={`size-5.5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                      isNotificationEnabled ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Mục 5: Cài đặt ứng dụng PWA / Mobile App */}
              <button
                type="button"
                onClick={handleFastInstallApp}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between hover:brightness-105 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-9 rounded-xl bg-[#003B95] text-white grid place-items-center shrink-0 shadow-xs">
                    <Smartphone className="size-4.5" />
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

            {/* 2. KHỐI CÁC TRƯỜNG LIÊN HỆ & HỖ TRỢ BAN THƯ KÝ */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <Headphones className="h-4 w-4 text-rose-500" />
                  <span>Các trường liên hệ &amp; Hỗ trợ Ban Thư Ký</span>
                </h3>
              </div>

              {/* Thông tin liên hệ nhanh: Hotline + Email Ban Thư Ký */}
              <div className="space-y-2 text-xs">
                {/* Hotline Ban Thư Ký */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Hotline Ban Thư Ký</span>
                      <span className="font-bold text-slate-800 dark:text-white block truncate">098.333.1983 / 098.1983.888</span>
                    </div>
                  </div>
                  <a
                    href="tel:0983331983"
                    className="px-3 py-1 rounded-xl bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer"
                  >
                    Gọi ngay
                  </a>
                </div>

                {/* Email Ban Thư Ký */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Email tiếp nhận &amp; hỗ trợ</span>
                      <span className="font-bold text-slate-800 dark:text-white block truncate">banthuky@ceo1983.vn</span>
                    </div>
                  </div>
                  <a
                    href="mailto:banthuky@ceo1983.vn"
                    className="px-2.5 py-1 rounded-xl border border-blue-600 text-[#003B95] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs transition shrink-0 cursor-pointer"
                  >
                    Gửi thư
                  </a>
                </div>

                {/* Địa chỉ trụ sở văn phòng CLB */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Trụ sở CLB Doanh Nhân CEO 1983</span>
                    <span className="font-semibold text-slate-800 dark:text-white block text-[11px] leading-snug">
                      Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA) - TP. Hà Nội
                    </span>
                  </div>
                </div>
              </div>

              {/* 2 Nút mở popup tương tác trực tiếp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setContactSupportOpen(true)}
                  className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/80 transition flex items-center justify-between cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8.5 rounded-xl bg-rose-600 text-white grid place-items-center shrink-0 shadow-xs">
                      <Headphones className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block truncate">
                        Liên hệ Ban Thư Ký CLB
                      </span>
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 block truncate">
                        Gửi phản ánh, góp ý &amp; hỗ trợ
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-rose-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setUserGuideOpen(true)}
                  className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/80 transition flex items-center justify-between cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8.5 rounded-xl bg-amber-500 text-slate-950 grid place-items-center shrink-0 shadow-xs">
                      <BookOpen className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block truncate">
                        Hướng dẫn sử dụng App
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block truncate">
                        Cẩm nang &amp; tour tính năng
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-amber-600 shrink-0" />
                </button>
              </div>

              {/* Nếu có quyền quản trị */}
              {hasAdminPrivilege && (
                <Link
                  to="/association/permissions"
                  className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-100/80 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8.5 rounded-xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-xs">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block truncate">
                        Phân quyền Ban Quản Trị &amp; Ban Chuyên Môn
                      </span>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block truncate">
                        Quản lý ma trận vai trò RBAC hệ thống
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-indigo-600 shrink-0" />
                </Link>
              )}
            </div>

            {/* 3. KHỐI CÀI ĐẶT & BẢO MẬT TÀI KHOẢN (ĐỔI EMAIL/SĐT VÀ ĐỔI MẬT KHẨU) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <span>Bảo mật tài khoản &amp; Đổi mật khẩu</span>
                </h3>
              </div>
              <AccountSecuritySettingsForm />
            </div>

            {/* 4. NÚT ĐĂNG XUẤT TÀI KHOẢN */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
              >
                <LogOut className="size-4 text-rose-500" />
                <span>Đăng xuất khỏi ứng dụng</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
