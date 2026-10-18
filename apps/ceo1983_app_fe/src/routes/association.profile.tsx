import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  ChevronRight,
  User,
  Building2,
  Users,
  History,
  FileText,
  Package,
  Sparkles,
  Bell,
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
  Edit3,
  CreditCard,
  PhoneCall,
  CheckCircle2,
  Tag,
  BookOpen,
  Headphones,
  Send,
  Pencil,
  Plus,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { CardPreviewModal } from "@/components/member/CardPreviewModal";
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, updateMyProfile, listMembers, type MyMember, type DirectoryMember } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
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
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
  const t = useT();
  const { lang, setLang } = useLang();
  const isEn = lang === "en";
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { isSuperAdmin, isAdmin: isRoleAdmin } = useRole();

  const fetchMember = useServerFn(getMyMember);
  const updateProfileFn = useServerFn(updateMyProfile);
  const fetchDirectory = useServerFn(listMembers);

  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");
  const { data: realMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), [], "vba_directory_members");

  const hasAdminPrivilege = isSuperAdmin || isRoleAdmin || user?.role === "admin" || user?.role === "platform_admin";

  // Navigation & Tabs state: 'about' (Hồ sơ), 'business' (Giao thương), 'settings' (Cài đặt)
  const [activeTab, setActiveTab] = useState<"about" | "business" | "settings">("about");

  // Modals state
  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);

  // Copy states
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  // Cover & Avatar upload states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Sync initial media
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCover = localStorage.getItem("vba_member_cover_photo");
    if (savedCover && !isDeadCover(savedCover)) {
      setCoverPhoto(savedCover);
    } else {
      const rawCover = member?.coverUrl || (member as any)?.cover_url;
      if (rawCover && !isDeadCover(rawCover)) {
        setCoverPhoto(rawCover);
      }
    }

    const savedAvatar = localStorage.getItem("vba_member_avatar_photo");
    if (savedAvatar && !isDeadAvatar(savedAvatar)) {
      setCustomAvatar(savedAvatar);
    }
  }, [member?.coverUrl, (member as any)?.cover_url]);

  // Handle Cover Upload
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)");
      return;
    }
    setUploadingCover(true);
    const tid = toast.loading(isEn ? "Uploading cover image..." : "Đang tải ảnh bìa lên hệ thống...");
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

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh");
      return;
    }
    setUploadingAvatar(true);
    const tid = toast.loading(isEn ? "Uploading avatar image..." : "Đang tải ảnh đại diện lên...");
    try {
      const uploadUrl = await uploadFileToNest(file, "avatars");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");

      setCustomAvatar(uploadUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", uploadUrl);
        window.dispatchEvent(new Event("vba_member_avatar_updated"));
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

  // Resolved display fields
  const memberCode = member?.code || (user as any)?.user_metadata?.member_code || "M1983-268";
  const displayName = member?.name || user?.name || (user as any)?.user_metadata?.full_name || user?.username || "Jame Nguyễn";
  const displayTitle = member?.title || (member as any)?.position || "admin";
  const displayCompany = (member as any)?.companyName || (member as any)?.company || "Câu lạc bộ CEO1983";
  const displayPhone = member?.phone || (user as any)?.phone || "0988888888";
  const displayEmail = member?.email || user?.email || "admin@connect.vn";
  const displayDepartment = (member as any)?.department || "Ban Quản trị & Điều Hành";
  const displayAddress = (member as any)?.address || "Tòa V-Tower, 649 Kim Mã, Ba Đình, Hà Nội";
  const displayWebsite = (member as any)?.website || "https://ceo1983club.com";
  const displayBio = (member as any)?.bio || "Lãnh đạo doanh nghiệp hội viên CLB Doanh Nhân CEO 1983 (HanoiBA). Cam kết giao thương thực chiến, minh bạch và phát triển chuỗi giá trị liên kết bền vững.";

  const rawCurrentAvatar =
    member?.avatar ||
    (member as any)?.avatarUrl ||
    (user as any)?.avatar_url ||
    (user as any)?.user_metadata?.avatar_url ||
    customAvatar ||
    (typeof window !== "undefined" ? localStorage.getItem("vba_member_avatar_photo") : null) ||
    null;
  const resolvedAvatar = rawCurrentAvatar && !isDeadAvatar(rawCurrentAvatar)
    ? (resolveMediaUrl(rawCurrentAvatar) || rawCurrentAvatar)
    : null;

  const rawCover = coverPhoto || (member?.coverUrl || (member as any)?.cover_url) || heroImg;
  const displayCover = rawCover && !isDeadCover(rawCover) ? (resolveMediaUrl(rawCover) || rawCover) : heroImg;

  const cleanPhone = displayPhone ? displayPhone.replace(/\D/g, "") : "";

  // Share handler
  const handleShareProfile = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.vn";
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
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết danh thiếp & hồ sơ cá nhân!");
      setTimeout(() => setCopiedLink(false), 2000);
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
    toast.success("Đã sao chép địa chỉ email!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  async function logout() {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  }

  return (
    <div className="w-full min-h-screen bg-slate-100/70 dark:bg-[#080d19] pb-24 text-slate-800 dark:text-slate-100">
      {/* ── 1. HEADER CHUẨN DI ĐỘNG CEO 1983 ── */}
      <MemberHeader
        title={isEn ? "Profile" : "Trang cá nhân"}
        back
        right={
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            aria-label={isEn ? "Account settings" : "Cài đặt tài khoản"}
            className="text-[#003B95] dark:text-blue-400 hover:text-[#002B70] p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pt-2">
        {/* Hidden inputs for uploading photo */}
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />

        {/* ── 2. COVER IMAGE & BADGES (ẢNH BÌA) ── */}
        <div className="relative w-full h-44 sm:h-52 rounded-3xl overflow-hidden shadow-md border border-slate-200/60 dark:border-slate-800 bg-slate-900">
          <img
            src={displayCover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30 pointer-events-none" />

          {/* Member Code Badge (Góc trên trái) */}
          <div className="absolute top-3 left-3 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-sm">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wide">
                {memberCode}
              </span>
            </div>
          </div>

          {/* Change Cover Button (Góc trên phải) */}
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/65 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Camera className="h-3.5 w-3.5 text-amber-300" />
              <span>{uploadingCover ? "Đang tải..." : "Đổi ảnh bìa"}</span>
            </button>
          </div>
        </div>

        {/* ── 3. MAIN PROFILE CARD (THÔNG TIN CHÍNH ĐÈ LÊN ẢNH BÌA) ── */}
        <div className="relative -mt-16 sm:-mt-20 z-20 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xl p-5 text-center transition-all">
          {/* Circular Avatar in Center with thick border */}
          <div className="relative mx-auto size-24 sm:size-28 -mt-16 sm:-mt-20 group">
            <div className="size-full rounded-full ring-4 ring-white dark:ring-[#0F172A] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {resolvedAvatar && !avatarError ? (
                <img
                  src={resolvedAvatar}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-[#003B95] to-[#001D4A] flex items-center justify-center text-white text-2xl font-black">
                  {initials(displayName)}
                </div>
              )}
            </div>

            {/* Small camera icon button to change avatar */}
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Đổi ảnh đại diện"
              className="absolute bottom-0 right-0 size-7 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-[#0F172A] shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#003B95] dark:hover:text-blue-400 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          {/* Member Name & Verified Badge */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {displayName}
            </h1>
            <CheckCircle2 className="size-5 text-[#003B95] dark:text-blue-400 fill-[#003B95] dark:fill-blue-400 text-white shrink-0" />
          </div>

          {/* Role & Company */}
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <div className="inline-flex items-center gap-1.5 font-bold text-[#003B95] dark:text-blue-400">
              <Briefcase className="size-3.5" />
              <span>{displayTitle}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <Building2 className="size-3.5 text-muted-foreground" />
              <span>{displayCompany}</span>
            </div>
          </div>

          {/* Official Membership Badge (Huy hiệu vàng đồng chuẩn CEO 1983) */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-400/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
            <span>Hội viên chính thức CLB Doanh Nhân CEO 1983</span>
          </div>

          {/* ── 4 QUICK ACTION BUTTONS (4 NÚT HÌNH VUÔNG BO TRÒN) ── */}
          <div className="grid grid-cols-4 gap-2.5 mt-5 pt-1">
            {/* Button 1: Danh thiếp (Xem trước thẻ + Profile) */}
            <button
              type="button"
              onClick={() => setCardPreviewOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 text-[#003B95] dark:text-blue-300 transition-all active:scale-95 shadow-2xs cursor-pointer group"
            >
              <div className="size-9 rounded-xl bg-white dark:bg-blue-900/60 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                <CreditCard className="size-4 text-[#003B95] dark:text-blue-300" />
              </div>
              <span className="text-[11px] font-bold">Danh thiếp</span>
            </button>

            {/* Button 2: Sửa hồ sơ */}
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 transition-all active:scale-95 shadow-2xs cursor-pointer group"
            >
              <div className="size-9 rounded-xl bg-white dark:bg-amber-900/60 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                <Pencil className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold">Sửa hồ sơ</span>
            </button>

            {/* Button 3: Chia sẻ */}
            <button
              type="button"
              onClick={handleShareProfile}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100/80 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-300 transition-all active:scale-95 shadow-2xs cursor-pointer group"
            >
              <div className="size-9 rounded-xl bg-white dark:bg-sky-900/60 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                <Share2 className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-[11px] font-bold">Chia sẻ</span>
            </button>

            {/* Button 4: Mã QR */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 transition-all active:scale-95 shadow-2xs cursor-pointer group"
            >
              <div className="size-9 rounded-xl bg-white dark:bg-emerald-900/60 flex items-center justify-center shadow-2xs group-hover:scale-105 transition">
                <QrCode className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold">Mã QR</span>
            </button>
          </div>
        </div>

        {/* ── 4. SEGMENTED PILL TABS (HỒ SƠ / GIAO THƯƠNG / CÀI ĐẶT) ── */}
        <div className="mt-4 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-white dark:bg-[#0F172A] text-[#003B95] dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="size-3.5" />
            <span>Hồ sơ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("business")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "business"
                ? "bg-white dark:bg-[#0F172A] text-[#003B95] dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="size-3.5" />
            <span>Giao thương</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-white dark:bg-[#0F172A] text-[#003B95] dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className="size-3.5" />
            <span>Cài đặt</span>
          </button>
        </div>

        {/* ── 5. TAB CONTENT ── */}
        <div className="mt-4 space-y-4">
          {/* TAB 1: HỒ SƠ (THÔNG TIN LIÊN HỆ & KẾT NỐI TRỰC TIẾP) */}
          {activeTab === "about" && (
            <div className="space-y-4">
              {/* Card Liên hệ trực tiếp */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#003B95] dark:text-blue-400">
                  <PhoneCall className="size-4 text-amber-500" />
                  <span>Thông tin liên hệ &amp; kết nối trực tiếp</span>
                </div>

                <div className="space-y-2.5">
                  {/* HOTLINE / SĐT */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Hotline / SĐT
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {displayPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cleanPhone ? (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00A86B] hover:bg-[#00925d] active:scale-95 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Gọi</span>
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        aria-label="Sao chép số điện thoại"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {copiedPhone ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {displayEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`mailto:${displayEmail}`}
                        className="px-3 py-1.5 rounded-xl border border-[#003B95] dark:border-blue-400 text-[#003B95] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 active:scale-95 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Gửi thư</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        aria-label="Sao chép email"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {copiedEmail ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Doanh nghiệp & Ban chuyên môn */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#003B95] dark:text-blue-400">
                  <Building2 className="size-4 text-amber-500" />
                  <span>Doanh nghiệp &amp; Ban chuyên trách</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium shrink-0">Doanh nghiệp:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      {displayCompany}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium shrink-0">Chức vụ điều hành:</span>
                    <span className="font-bold text-[#003B95] dark:text-blue-400 text-right">
                      {displayTitle}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium shrink-0">Ban chuyên môn:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-right">
                      {displayDepartment}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium shrink-0">Trụ sở:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
                      {displayAddress}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium shrink-0">Website:</span>
                    <a
                      href={displayWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#003B95] dark:text-blue-400 hover:underline text-right truncate max-w-[200px] flex items-center gap-1 justify-end"
                    >
                      <span>{displayWebsite.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>

                {/* Giới thiệu doanh nghiệp */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Định hướng &amp; Giới thiệu
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {displayBio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GIAO THƯƠNG & SẢN PHẨM B2B */}
          {activeTab === "business" && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#003B95] dark:text-blue-400">
                    <Package className="size-4 text-amber-500" />
                    <span>Gian hàng &amp; Sản phẩm tiêu biểu</span>
                  </div>
                  <Link
                    to="/association/products"
                    search={{}}
                    className="text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
                  <Package className="size-8 mx-auto text-slate-400" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Gian hàng B2B của bạn
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Đăng tải các sản phẩm, giải pháp và năng lực cung ứng của doanh nghiệp bạn lên sàn giao thương CLB CEO 1983.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/association/products"
                      search={{}}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Đăng sản phẩm mới</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Nhu cầu hợp tác & Cơ hội đầu tư */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#003B95] dark:text-blue-400">
                    <Sparkles className="size-4 text-amber-500" />
                    <span>Nhu cầu kết nối giao thương B2B</span>
                  </div>
                  <Link
                    to="/association/opportunities"
                    className="text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Xem deal</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>💡 Định hướng hợp tác B2B trọng tâm:</span>
                  </p>
                  <p className="leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                    Tìm kiếm các đối tác trong hệ sinh thái CEO 1983 về cung ứng chuỗi vật tư, công nghệ số, logistics, xuất nhập khẩu và xúc tiến mở rộng thị trường trong &amp; ngoài nước.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CÀI ĐẶT & QUẢN TRỊ ỨNG DỤNG */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {/* 1. Quản lý danh thiếp số */}
                <Link
                  to="/association/business-cards"
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#003B95] dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                      <CreditCard className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Quản lý Danh thiếp số
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Thiết kế &amp; chia sẻ danh thiếp điện tử VIP
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 shrink-0" />
                </Link>

                {/* 2. Danh bạ hội viên */}
                <Link
                  to="/association/members"
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Danh bạ hội viên CEO 1983
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Tìm kiếm &amp; kết nối 1-on-1 với doanh nhân
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 shrink-0" />
                </Link>

                {/* 3. Đổi giao diện Sáng / Tối */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
                      {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Giao diện hiển thị
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Chế độ {theme === "dark" ? "Tối (Dark Luxury)" : "Sáng (Light Crisp)"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Đổi giao diện
                  </button>
                </div>

                {/* 4. Thông báo đẩy */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
                      <Bell className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Thông báo đẩy
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {isNotificationEnabled ? "Đang bật" : "Đang tắt"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isNotificationEnabled}
                    onClick={handleToggleNotification}
                    className={`w-12 h-6 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer ${
                      isNotificationEnabled ? "bg-[#34C759]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        isNotificationEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Cẩm nang Hướng dẫn sử dụng */}
                <button
                  type="button"
                  onClick={() => setUserGuideOpen(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-900">
                      <BookOpen className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Hướng dẫn sử dụng ứng dụng
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Cẩm nang 10 tính năng cốt lõi &amp; tải tài liệu
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 shrink-0" />
                </button>

                {/* 6. Liên hệ Ban Thư Ký */}
                <button
                  type="button"
                  onClick={() => setContactSupportOpen(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
                      <Headphones className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Liên hệ Ban Thư Ký CLB CEO 1983
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Hotline, hỗ trợ kỹ thuật &amp; tiếp nhận đóng góp
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-400 shrink-0" />
                </button>

                {/* 7. Phân quyền (Nếu có quyền Quản trị) */}
                {hasAdminPrivilege && (
                  <Link
                    to="/association/permissions"
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Phân quyền Ban Quản Trị &amp; Ban Chuyên Môn
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Quản lý ma trận vai trò RBAC hệ thống
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 shrink-0" />
                  </Link>
                )}
              </div>

              {/* Nút Đăng xuất */}
              <button
                type="button"
                onClick={logout}
                className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-2xs"
              >
                <LogOut className="size-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. MODALS POPUP (XEM TRƯỚC DANH THIẾP SỐ, SỬA HỒ SƠ, QR CODE) ── */}

      {/* Modal 1: Xem trước Danh thiếp số VIP + Profile hội viên */}
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

      {/* Modal 2: Sửa nhanh hồ sơ cá nhân */}
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
        userId={user?.id}
        onSaved={(_updated) => {
          setEditProfileOpen(false);
          toast.success("Đã lưu cập nhật hồ sơ cá nhân thành công!");
        }}
      />

      {/* Modal 3: Mã QR Hội viên CEO 1983 */}
      <AssociationMemberQrModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        memberCode={memberCode}
        memberName={displayName}
        memberTitle={displayTitle}
        memberCompany={displayCompany}
        memberAvatar={resolvedAvatar}
      />

      {/* Modal 4: Hướng dẫn sử dụng & Liên hệ ban chuyên môn */}
      <UserGuideModal open={userGuideOpen} onClose={() => setUserGuideOpen(false)} />
      <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
    </div>
  );
}
