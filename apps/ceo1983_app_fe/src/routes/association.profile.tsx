import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  ChevronRight,
  ChevronDown,
  BadgeCheck,
  User,
  Building2,
  Users,
  History,
  FileText,
  Package,
  Sparkles,
  Bell,
  Settings as Cog,
  LogOut,
  Sun,
  Moon,
  Contrast,
  Share2,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  LayoutDashboard,
  ArrowUpRight,
  Nfc,
  X,
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon,
  Edit3,
  Lock,
  Globe2,
  Plus,
  ImagePlus,
  Loader2,
  MessageSquare,
  Tag,
  Users2,
  BookOpen,
  Headphones,
  Bot,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { isEventThemeEnabled, setEventThemeEnabled, getCrmAppliedTheme, getEffectiveThemeOption, DEFAULT_BASE_THEME, FESTIVAL_THEMES, syncThemeFromBackend } from "@/components/member/SeasonalEventHeader";
import { isVoiceAiEnabled, setVoiceAiEnabled } from "@/components/ai/VoiceNavAssistant";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, updateMyProfile, listMembers, listConversations, type MyMember, type DirectoryMember, type MyConversation } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi, isDeadAvatarUrl } from "@/lib/api-client";
import { requestNotificationPermission } from "@/lib/notification-permissions";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import eventImg from "@/assets/vba-event.jpg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { isAdmin: isPlatformOrTenantAdmin, isPlatformAdmin, isBQT, srsRole } = useRole();
  const fetchMember = useServerFn(getMyMember);
  const updateProfileFn = useServerFn(updateMyProfile);
  const fetchDirectory = useServerFn(listMembers);
  const fetchConversations = useServerFn(listConversations);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");
  const { data: realMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), [], "vba_directory_members");
  const { data: conversations = [] } = useServerData<MyConversation[]>(() => fetchConversations(), [], "vba_conversations");

  const userRole = String((user as any)?.role || "").toLowerCase();
  const memberRole = String((member as any)?.role || "").toLowerCase();

  const isBQTOrAdmin: boolean = Boolean(
    isPlatformOrTenantAdmin ||
    isPlatformAdmin ||
    isBQT ||
    srsRole === "admin" ||
    srsRole === "quan_tri" ||
    srsRole === "ADM" ||
    srsRole === "BQT" ||
    srsRole === "ban_dieu_hanh" ||
    userRole === "admin" ||
    userRole === "quan_tri" ||
    userRole === "quantri" ||
    userRole === "superadmin" ||
    userRole === "platform_admin" ||
    memberRole === "admin" ||
    memberRole === "quan_tri" ||
    memberRole === "quantri" ||
    memberRole === "association_admin" ||
    (member as any)?.department === "Ban Quản Trị" ||
    (member as any)?.department === "Ban Điều Hành" ||
    (member as any)?.department === "Ban Thường Trực CLB" ||
    String((member as any)?.executiveRole || "").toLowerCase().includes("chủ tịch") ||
    String((member as any)?.department || "").toLowerCase().includes("quản trị") ||
    String((member as any)?.department || "").toLowerCase().includes("điều hành")
  );
  const hasAdminPrivilege = isBQTOrAdmin;

  const [copied, setCopied] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "friends" | "posts" | "photos">("about");
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, number>>({ post1: 24, post2: 41 });
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [eventThemeEnabled, setEventThemeState] = useState(() => isEventThemeEnabled());
  const [crmThemeId, setCrmThemeId] = useState<string | null>(() => getCrmAppliedTheme());
  const [voiceAiEnabled, setVoiceAiState] = useState(() => isVoiceAiEnabled());
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const modalAvatarInputRef = useRef<HTMLInputElement>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [coverError, setCoverError] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingModalAvatar, setUploadingModalAvatar] = useState(false);
  const [modalAvatarPreview, setModalAvatarPreview] = useState<string | null>(null);

  // Chỉ reset avatarError khi người dùng chọn tải lên ảnh mới dạng base64/data URI
  useEffect(() => {
    if (customAvatar && !isDeadAvatar(customAvatar) && customAvatar.startsWith("data:")) {
      setAvatarError(false);
    }
  }, [customAvatar]);

  useEffect(() => {
    void syncThemeFromBackend().then(() => {
      setEventThemeState(isEventThemeEnabled());
      setCrmThemeId(getCrmAppliedTheme());
    });

    const handleThemeChange = () => {
      setEventThemeState(isEventThemeEnabled());
      setCrmThemeId(getCrmAppliedTheme());
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
      } else {
        const rawCover = member?.coverUrl || (member as any)?.cover_url;
        if (rawCover && !isDeadCover(rawCover)) {
          setCoverPhoto(rawCover);
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
      } else {
        const savedCover = localStorage.getItem("vba_member_cover_photo");
        if (savedCover && !isDeadCover(savedCover)) {
          setCoverPhoto(savedCover);
        }
      }
    };

    const handleAvatarUpdate = (e: any) => {
      const detailUrl = e?.detail;
      if (detailUrl && typeof detailUrl === "string") {
        setCustomAvatar(detailUrl);
      } else {
        const savedAvatar = localStorage.getItem("vba_member_avatar_photo");
        if (savedAvatar && !isDeadAvatar(savedAvatar)) {
          setCustomAvatar(savedAvatar);
        }
      }
    };

    const handleProfileUpdate = (e: any) => {
      syncLocalMedia();
      if (e?.detail?.cover) setCoverPhoto(e.detail.cover);
      if (e?.detail?.avatar) setCustomAvatar(e.detail.avatar);
    };

    const handleThemeSync = () => {
      setCrmThemeId(getCrmAppliedTheme());
      setEventThemeState(isEventThemeEnabled());
    };

    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("vba_member_avatar_updated", handleAvatarUpdate);
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba-event-theme-changed", handleThemeSync);
    window.addEventListener("ceo1983-theme-changed", handleThemeSync);
    window.addEventListener("storage", syncLocalMedia);
    window.addEventListener("storage", handleThemeSync);

    return () => {
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("vba_member_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba-event-theme-changed", handleThemeSync);
      window.removeEventListener("ceo1983-theme-changed", handleThemeSync);
      window.removeEventListener("storage", syncLocalMedia);
      window.removeEventListener("storage", handleThemeSync);
    };
  }, [member?.coverUrl, (member as any)?.cover_url]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)");
      return;
    }
    setUploadingCover(true);
    const tid = toast.loading(isEn ? "Uploading cover to MinIO..." : "Đang tải ảnh bìa lên MinIO...");
    try {
      const uploadUrl = await uploadFileToNest(file, "covers");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ MinIO");

      setCoverPhoto(uploadUrl);
      setCoverError(false);
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
      toast.error(err?.message || (isEn ? "Failed to update cover photo" : "Không thể cập nhật ảnh bìa. Vui lòng thử lại!"), { id: tid });
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
    const tid = toast.loading(isEn ? "Uploading avatar to MinIO..." : "Đang tải ảnh đại diện lên MinIO...");
    try {
      const uploadUrl = await uploadFileToNest(file, "avatars");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ MinIO");

      setCustomAvatar(uploadUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", uploadUrl);
        window.dispatchEvent(new Event("vba_member_avatar_updated"));
      } catch {}

      toast.success(isEn ? "Avatar updated successfully!" : "Cập nhật ảnh đại diện thành công!", { id: tid });
    } catch (err: any) {
      console.error("Avatar upload exception:", err);
      toast.error(err?.message || (isEn ? "Failed to upload avatar" : "Lỗi khi tải ảnh đại diện lên máy chủ"), { id: tid });
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  // ── USER POSTS FEED STATE ──
  interface UserPost {
    id: string;
    authorName: string;
    authorAvatar?: string | null;
    time: string;
    content: string;
    imageUrl?: string | null;
    privacy: "public" | "friends" | "private";
    taggedFriends: string[];
    likes: number;
  }

  const [userPosts, setUserPosts] = useState<UserPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("vba_user_posts") || "[]");
        if (Array.isArray(saved) && saved.length > 0) return saved;
      } catch {}
    }
    return [
      {
        id: "post1",
        authorName: member?.name || user?.name || "Hội viên CLB CEO 1983",
        authorAvatar: null,
        time: "Hôm qua lúc 15:30",
        content: "Rất vinh dự được đón tiếp các anh chị lãnh đạo CLB Doanh Nhân CEO 1983 tới thăm và làm việc tại trụ sở doanh nghiệp hội viên. Chúc các thỏa thuận hợp tác thương mại sớm đơm hoa kết trái! 🤝✨",
        imageUrl: eventImg,
        privacy: "public",
        taggedFriends: ["Đặng Văn Lâm", "Trần Thu Trang"],
        likes: 24,
      },
    ];
  });

  // ── CREATE POST COMPOSER MODAL STATE ──
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postPrivacy, setPostPrivacy] = useState<"public" | "friends" | "private">("public");
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  // Dynamic resolved display info based on real registered user / member
  const resolvedDisplayName = member?.name || user?.name || (user as any)?.user_metadata?.full_name || user?.username || "Hội viên CLB CEO 1983";
  const resolvedDisplayTitle = member?.title || "Hội viên chính thức CLB CEO 1983";
  const resolvedDisplayCompany = (member as any)?.companyName || member?.industry || "CLB Doanh Nhân CEO 1983";
  const resolvedDisplayPhone = member?.phone || (user as any)?.phone || "";
  const resolvedDisplayEmail = member?.email || user?.email || "";

  const userProfileStorageKey = `vba_custom_profile_${user?.id || (member as any)?.id || "default"}`;

  // Local editable profile state with user-scoped persistence
  const [profileName, setProfileName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.name) return saved.name;
      } catch {}
    }
    return resolvedDisplayName;
  });
  const [profileTitle, setProfileTitle] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.title) return saved.title;
      } catch {}
    }
    return resolvedDisplayTitle;
  });
  const [profileCompany, setProfileCompany] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.company) return saved.company;
      } catch {}
    }
    return resolvedDisplayCompany;
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.phone) return saved.phone;
      } catch {}
    }
    return resolvedDisplayPhone;
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.email) return saved.email;
      } catch {}
    }
    return resolvedDisplayEmail;
  });
  const [profileAddress, setProfileAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.address) return saved.address;
      } catch {}
    }
    return "Hà Nội, Việt Nam";
  });
  const [profileWebsite, setProfileWebsite] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.website) return saved.website;
      } catch {}
    }
    return "https://ceo1983.vn";
  });
  const [profileBio, setProfileBio] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.bio) return saved.bio;
      } catch {}
    }
    return "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương.";
  });

  // Tự động đồng bộ hóa thông tin khi dữ liệu hội viên / user từ backend load xong
  const initProfileFields = (force = false) => {
    let saved: any = {};
    if (typeof window !== "undefined") {
      try {
        saved = JSON.parse(localStorage.getItem(userProfileStorageKey) || localStorage.getItem("vba_custom_profile") || "{}");
        if (saved.avatar && isDeadAvatar(saved.avatar)) {
          delete saved.avatar;
          localStorage.setItem(userProfileStorageKey, JSON.stringify(saved));
        }
      } catch {}
    }
    const isStaleName = saved.name && (saved.name === "Lê Hoàng Long" || saved.name.includes("CEO 1983 Platform"));
    const isStaleTitle = saved.title && (saved.title === "James Nguyễn" || saved.title === "Lê Hoàng Long");

    const resolvedName = (saved.name && !isStaleName)
      ? saved.name
      : (member?.name || user?.name || (user as any)?.user_metadata?.full_name || user?.username || "");
    const resolvedTitle = (saved.title && !isStaleTitle)
      ? saved.title
      : (member?.title || (user as any)?.user_metadata?.professional_title || "Hội viên chính thức CLB CEO 1983");
    const resolvedCompany = saved.company || (member as any)?.companyName || member?.industry || (member as any)?.about || "CLB Doanh Nhân CEO 1983";
    const resolvedPhone = saved.phone || member?.phone || (user as any)?.phone || "";
    const resolvedEmail = saved.email || member?.email || user?.email || "";
    const resolvedAddress = saved.address || member?.address || "Hà Nội, Việt Nam";
    const resolvedWebsite = saved.website || member?.website || "https://ceo1983.vn";
    const resolvedBio = saved.bio || (member as any)?.about || "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương.";
    
    let candidateAv = saved.avatar || customAvatar || member?.avatar || (member as any)?.avatarUrl || (user as any)?.avatar_url || null;
    if (isDeadAvatar(candidateAv)) {
      candidateAv = null;
    }

    if (force || !profileName) setProfileName(resolvedName);
    if (force || !profileTitle) setProfileTitle(resolvedTitle);
    if (force || !profileCompany) setProfileCompany(resolvedCompany);
    if (force || !profilePhone) setProfilePhone(resolvedPhone);
    if (force || !profileEmail) setProfileEmail(resolvedEmail);
    if (force || !profileAddress) setProfileAddress(resolvedAddress);
    if (force || !profileWebsite) setProfileWebsite(resolvedWebsite);
    if (force || !profileBio) setProfileBio(resolvedBio);
    if (candidateAv && (!customAvatar || force)) {
      setCustomAvatar(candidateAv);
      setModalAvatarPreview(candidateAv);
    }
  };

  useEffect(() => {
    initProfileFields(false);
  }, [member, user, userProfileStorageKey]);

  const handleModalAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isEn ? "Only image files allowed" : "Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)");
      return;
    }
    setUploadingModalAvatar(true);
    const tid = toast.loading("Đang tải ảnh đại diện lên MinIO...");
    try {
      const uploadUrl = await uploadFileToNest(file, "avatars");
      if (!uploadUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");
      setModalAvatarPreview(uploadUrl);
      setCustomAvatar(uploadUrl);
      setAvatarError(false);
      try {
        localStorage.setItem("vba_member_avatar_photo", uploadUrl);
        window.dispatchEvent(new Event("vba_member_avatar_updated"));
      } catch {}
      toast.success(isEn ? "Avatar updated" : "Đã cập nhật ảnh đại diện trên MinIO", { id: tid });
    } catch (err: any) {
      toast.error(err?.message || (isEn ? "Failed to process image" : "Lỗi xử lý hình ảnh"), { id: tid });
    } finally {
      setUploadingModalAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  const [privacyDirectMsg, setPrivacyDirectMsg] = useState(true);
  const [privacyShowPhone, setPrivacyShowPhone] = useState(true);
  const [privacyDirectory, setPrivacyDirectory] = useState(true);

  const isEn = lang === "en";

  const handleCopyCode = () => {
    if (!member?.code) return;
    navigator.clipboard.writeText(member.code);
    setCopied(true);
    toast.success(isEn ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setPostLikes((likes) => ({
        ...likes,
        [postId]: (likes[postId] || 0) + (isLiked ? 1 : -1),
      }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: profileName || member?.name || "Hội viên CLB CEO 1983",
          text: `Danh thiếp số và hồ sơ hội viên ${profileName || member?.name} - CLB Doanh Nhân CEO 1983`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isEn ? "Profile link copied!" : "Đã sao chép liên kết trang cá nhân!");
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImagePreview) {
      toast.error(isEn ? "Please enter post content or attach a photo" : "Vui lòng nhập nội dung bài viết hoặc đính kèm ảnh");
      return;
    }

    setIsPublishing(true);
    let uploadedImageUrl = postImagePreview;

    if (postImageFile) {
      try {
        uploadedImageUrl = await uploadFileToNest(postImageFile, postImageFile.name);
      } catch {
        // Fallback to preview data url if upload encounters transient network issue
      }
    }

    const newPost: UserPost = {
      id: `post-${Date.now()}`,
      authorName: profileName || member?.name || user?.name || "Hội viên CLB CEO 1983",
      authorAvatar: resolvedAvatar,
      time: isEn ? "Just now" : "Vừa xong",
      content: postContent.trim(),
      imageUrl: uploadedImageUrl,
      privacy: postPrivacy,
      taggedFriends: [...taggedFriends],
      likes: 0,
    };

    const updated = [newPost, ...userPosts];
    setUserPosts(updated);
    try {
      localStorage.setItem("vba_user_posts", JSON.stringify(updated));
    } catch {}

    if (taggedFriends.length > 0) {
      toast.success(
        isEn
          ? `Post published! Tagged friends (${taggedFriends.join(", ")}) received notification.`
          : `Đã đăng bài thành công! Bạn bè được tag (${taggedFriends.join(", ")}) đã nhận được thông báo.`
      );
    } else {
      toast.success(isEn ? "Post published successfully!" : "Đã đăng bài viết thành công!");
    }

    setPostContent("");
    setPostImageFile(null);
    setPostImagePreview(null);
    setTaggedFriends([]);
    setPostPrivacy("public");
    setIsPublishing(false);
    setCreatePostOpen(false);
  };

  const isAdmin = isBQTOrAdmin;

  const menu = [
    {
      label: isEn ? "Digital Business Cards" : "Quản lý Danh thiếp số",
      icon: Building2,
      to: "/association/business-cards" as const,
      desc: isEn ? "Design & share electronic business card" : "Thiết kế & chia sẻ danh thiếp số cá nhân",
    },
    {
      label: isEn ? "CEO 1983 Member Directory" : "Danh bạ hội viên CLB",
      icon: Users,
      to: "/association/members" as const,
      desc: isEn ? "Search & connect with CEO 1983 members" : "Tìm kiếm & kết nối hội viên CEO 1983",
    },
    {
      label: isEn ? "B2B Trade Opportunities" : "Cơ hội giao thương B2B",
      icon: Sparkles,
      to: "/association/opportunities" as const,
      desc: isEn ? "Commercial supply, demand & investment" : "Nhu cầu mua, bán & hợp tác đầu tư",
    },
    {
      label: isEn ? "Product Showcase" : "Gian hàng sản phẩm",
      icon: Package,
      to: "/association/products" as const,
      desc: isEn ? "Showcase enterprise products & services" : "Showcase sản phẩm & dịch vụ doanh nghiệp",
    },
    {
      label: isEn ? "History & Check-in" : "Lịch sử kết nối & Check-in",
      icon: History,
      to: "/association/history" as const,
      desc: isEn ? "Trading log & event participation" : "Nhật ký giao thương & tham gia sự kiện",
    },
    {
      label: isEn ? "Notifications & Invites" : "Thông báo & Lời mời",
      icon: Bell,
      to: "/association/notifications" as const,
      desc: isEn ? "Messages & connection approvals" : "Cập nhật tin nhắn & phê duyệt kết nối",
    },
    {
      label: isEn ? "App User Guide Center (10 Features)" : "Hướng dẫn sử dụng ứng dụng (10 chức năng)",
      icon: BookOpen,
      onClick: () => setUserGuideOpen(true),
      desc: isEn ? "Full visual walkthrough of 10 core features & official PDF handbook" : "Chỉ dẫn chi tiết 10 tính năng cốt lõi, quét card AI, NFC & cẩm nang PDF",
    },
    {
      label: isEn ? "Secretariat & Support Contact" : "Liên hệ Ban Thư Ký CLB CEO 1983",
      icon: Headphones,
      onClick: () => setContactSupportOpen(true),
      desc: isEn ? "Hotline, Zalo OA & support inquiry" : "Hotline, Tổng đài, Zalo OA & gửi yêu cầu hỗ trợ",
    },
    ...(hasAdminPrivilege ? [{
      label: isEn ? "Member Permissions Management" : "Phân quyền Hội viên & Ban Quản Trị",
      icon: ShieldCheck,
      to: "/association/permissions" as const,
      desc: isEn ? "Manage member roles & committee permissions" : "Cấp quyền Ban Chấp Hành, Ban Thư Ký & Phân ban",
    }] : []),
    {
      label: isEn ? "Security & Account Settings" : "Bảo mật & Cài đặt tài khoản",
      icon: Cog,
      to: "/association/settings" as const,
      desc: isEn ? "Change password, active sessions & security" : "Đổi mật khẩu, phiên đăng nhập & bảo mật",
    },
  ];

  const themeOptions: { mode: Theme; icon: typeof Sun; label: string; desc: string }[] = [
    { mode: "light", icon: Sun, label: isEn ? "Light" : "Sáng", desc: isEn ? "Crisp, clean" : "Tươi sáng, tinh tế" },
    { mode: "dark", icon: Moon, label: isEn ? "Dark" : "Tối", desc: isEn ? "Luxury, sleek" : "Sang trọng, dịu mắt" },
  ];

  async function logout() {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  }

  const handleAvatarLoadError = () => {
    setAvatarError(true);
  };

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

  const rawCover = coverPhoto || (member?.coverUrl || (member as any)?.cover_url) || (typeof window !== "undefined" ? localStorage.getItem("vba_member_cover_photo") : null) || null;
  const displayCover = rawCover && !isDeadCover(rawCover) ? (resolveMediaUrl(rawCover) || rawCover) : null;

  const displayPhone = profilePhone || member?.phone || (user as any)?.phone || (user as any)?.user_metadata?.phone || (typeof window !== "undefined" ? localStorage.getItem("vba_member_phone") : null) || "0983 198 383";

  type FriendItem = {
    code: string;
    name: string;
    title: string;
    company: string;
    avatar: string | null;
  };

  // Real CEO 1983 active members who are CONNECTED with the current user
  const friendsList: FriendItem[] = useMemo(() => {
    const connectedKeys = new Set<string>();
    for (const c of conversations) {
      if (c.isConnected || c.connectionStatus === "accepted") {
        if (c.peerCode) connectedKeys.add(c.peerCode.toLowerCase());
        if (c.userId) connectedKeys.add(c.userId.toLowerCase());
      }
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vba_connected_peers");
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((k) => connectedKeys.add(String(k).toLowerCase()));
          }
        }
      } catch {
        /* ignore */
      }
    }

    return ((realMembers || []) as DirectoryMember[])
      .filter((m: DirectoryMember) => {
        // Exclude current user themself
        if (member?.code && m.code.toLowerCase() === member.code.toLowerCase()) return false;
        if (m.userId && user?.id && m.userId.toLowerCase() === user.id.toLowerCase()) return false;
        // Only include if connected
        const matchCode = m.code && connectedKeys.has(m.code.toLowerCase());
        const matchUserId = m.userId && connectedKeys.has(m.userId.toLowerCase());
        return Boolean(matchCode || matchUserId);
      })
      .map((m: DirectoryMember) => ({
        code: m.code,
        name: m.personName || m.name,
        title: m.personTitle || m.industry || "Hội viên CEO 1983",
        company: m.name !== m.personName ? m.name : "CLB Doanh Nhân CEO 1983",
        avatar: m.avatar && !isDeadAvatar(m.avatar) ? resolveMediaUrl(m.avatar) || m.avatar : null,
      }));
  }, [realMembers, conversations, member?.code, user?.id]);

  return (
    <div className="vba-animate min-h-full pb-28 bg-[#F4F6F9] dark:bg-[#0B1120] text-slate-900 dark:text-white flex flex-col justify-start items-center">
      <div className="w-full max-w-md flex flex-col justify-start items-stretch gap-4">
        <MemberHeader
          title={isEn ? "Profile" : "Trang cá nhân"}
          back
          right={
            <Link
              to="/association/settings"
              aria-label={isEn ? "Account settings" : "Cài đặt tài khoản"}
              className="text-[#2D2E8B] dark:text-blue-400 hover:text-[#002B70] p-1 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          }
        />

        {/* ── CARD THÔNG TIN HỘI VIÊN (Header User Info Card) ── */}
        <div className="w-full px-4 inline-flex justify-between items-center">
          <div
            onClick={() => navigate({ to: "/association/card" as any })}
            className="flex-1 px-3 py-3.5 bg-white dark:bg-[#0F172A] rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition active:scale-[0.99] cursor-pointer"
          >
            <div className="flex justify-start items-center gap-2.5 min-w-0">
              <div className="size-12 relative shrink-0">
                {resolvedAvatar && !avatarError ? (
                  <img
                    src={resolvedAvatar}
                    alt={profileName || member?.name}
                    onError={handleAvatarLoadError}
                    className="size-12 rounded-full object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="size-12 bg-blue-950 rounded-full flex items-center justify-center text-white text-xl font-bold font-sans">
                    {initials(profileName || member?.name || "Trần Tuấn Anh")}
                  </div>
                )}
              </div>
              <div className="inline-flex flex-col justify-center items-start gap-1 min-w-0">
                <div className="justify-start text-slate-900 dark:text-white text-base font-bold font-sans leading-5 line-clamp-1">
                  {profileName || member?.name || "Trần Tuấn Anh"}
                  {isAdmin ? " (Platform Admin)" : ""}
                </div>
                <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-[30px] inline-flex justify-center items-center gap-1">
                  <img
                    src="/icons/profile/check-verified-02.svg"
                    alt="Verified"
                    className="size-3.5 shrink-0"
                  />
                  <div className="justify-start text-emerald-600 dark:text-emerald-400 text-xs font-medium font-sans leading-4">
                    {isEn ? "Official CEO 1983 Member" : "Hội viên chính thức CEO 1983"}
                  </div>
                </div>
              </div>
            </div>
            <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/icons/profile/chevron-right.svg"
                alt="Go"
                className="w-4 h-4 object-contain opacity-70"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 1: DANH THIẾP & HỘI VIÊN ── */}
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-[#003B95] dark:text-blue-400 text-[13px] font-bold uppercase tracking-wider px-1">
              {isEn ? "Business Card & Members" : "Danh thiếp & hội viên"}
            </div>
            <div className="self-stretch rounded-2xl flex flex-col justify-start items-start overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Item 1: Quản lý danh thiếp số */}
              <Link
                to="/association/business-cards"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/fa7-regular_contact-card.svg"
                        alt="Card"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Digital Business Card" : "Quản lý danh thiếp số"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Design & share electronic business card" : "Thiết kế & chia sẻ danh thiếp số cá nhân"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>

              {/* Item 2: Danh bạ hội viên CLB */}
              <Link
                to="/association/members"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/fluent-mdl2_contact-list.svg"
                        alt="Directory"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Club Member Directory" : "Danh bạ hội viên CLB"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Search & connect with members" : "Tìm kiếm & kết nối hội viên CEO 1983"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: HOẠT ĐỘNG & KINH DOANH ── */}
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-[#003B95] dark:text-blue-400 text-[13px] font-bold uppercase tracking-wider px-1">
              {isEn ? "Activities & Business" : "Hoạt động & kinh doanh"}
            </div>
            <div className="self-stretch rounded-2xl flex flex-col justify-start items-start overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Item 1: Cơ hội giao thương B2B */}
              <Link
                to="/association/opportunities"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/streamline_shipment-remove.svg"
                        alt="B2B"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "B2B Trade Opportunities" : "Cơ hội giao thương B2B"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Commercial demand & investment" : "Nhu cầu mua, bán & hợp tác đầu tư"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>

              {/* Item 2: Gian hàng sản phẩm */}
              <Link
                to="/association/products"
                search={{}}
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/akar-icons_book.svg"
                        alt="Showcase"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Product Showcase" : "Gian hàng sản phẩm"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Showcase enterprise products & services" : "Showcase sản phẩm & dịch vụ doanh nghiệp"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: CÀI ĐẶT ỨNG DỤNG ── */}
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-[#003B95] dark:text-blue-400 text-[13px] font-bold uppercase tracking-wider px-1">
              {isEn ? "App Settings" : "Cài đặt ứng dụng"}
            </div>
            <div className="self-stretch rounded-2xl flex flex-col justify-start items-start overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Item 1: Bật / Tắt Thông báo đẩy */}
              <div className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex-1 flex justify-start items-center gap-3 min-w-0">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/bell-01.svg"
                        alt="Bell"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Push Notifications" : "Thông báo đẩy"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isNotificationEnabled ? (isEn ? "Enabled - instant club updates" : "Đang bật - nhận tin tức & lời mời") : (isEn ? "Disabled - tap switch to enable" : "Đang tắt - bấm để bật nhận thông báo")}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isNotificationEnabled}
                    data-state={isNotificationEnabled ? "On" : "Off"}
                    onClick={handleToggleNotification}
                    className={`w-14 h-7 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                      isNotificationEnabled ? "bg-[#34C759]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                        isNotificationEnabled ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Item 2: Hộp thư thông báo & lời mời */}
              <Link
                to="/association/notifications"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/bell-01.svg"
                        alt="Notifications"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Notifications & Invites" : "Hộp thư thông báo & lời mời"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Messages & connection approvals" : "Cập nhật tin nhắn & phê duyệt kết nối"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>

              {/* Item 3: Hướng dẫn sử dụng ứng dụng */}
              <button
                type="button"
                onClick={() => setUserGuideOpen(true)}
                className="w-full self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/streamline-sharp_customer-support-1-solid.svg"
                        alt="Support"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "User Guide Handbook" : "Hướng dẫn sử dụng ứng dụng"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "10 core features, card scan" : "Chỉ dẫn chi tiết 10 chức năng cốt lõi, quét card"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </button>

              {/* Item 4: Ngôn ngữ ứng dụng */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = lang === "vi" ? "en" : "vi";
                  setLang(nextLang);
                  toast.success(nextLang === "en" ? "Switched to English" : "Đã chuyển sang Tiếng Việt");
                }}
                className="w-full self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/heroicons_language-20-solid.svg"
                        alt="Language"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "App Language" : "Ngôn ngữ ứng dụng"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {lang === "vi" ? "Tiếng Việt (8 ngôn ngữ tổng cộng)" : "English (8 languages total)"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </button>

              {/* Item 5: Chủ đề sự kiện từ CRM */}
              {(() => {
                const crmHasTheme = crmThemeId && crmThemeId !== "none";
                const isEnabled = eventThemeEnabled && crmHasTheme;
                const currentThemeOption = isEnabled ? getEffectiveThemeOption() : DEFAULT_BASE_THEME;
                return (
                  <div className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                        <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                          <span className="text-2xl leading-none select-none">
                            {isEnabled ? (currentThemeOption.iconEmoji || "✨") : "✨"}
                          </span>
                        </div>
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                          <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                            {crmHasTheme
                              ? (isEnabled
                                  ? (currentThemeOption.name || (isEn ? "Event Theme Active" : "Chủ đề sự kiện"))
                                  : (isEn ? "Standard Interface (Theme Off)" : "Giao diện gốc (Đã tắt chủ đề)"))
                              : (isEn ? "Standard Interface (No Theme)" : "Giao diện gốc mặc định")}
                          </div>
                          <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                            {crmHasTheme
                              ? (isEnabled
                                  ? (currentThemeOption.tagline || (isEn ? "Applied from CRM" : "Đang áp dụng chủ đề từ CRM"))
                                  : (isEn ? "Using default UI for this account" : "Tài khoản đang dùng giao diện gốc"))
                              : (isEn ? "No event theme applied from CRM" : "Chưa có chủ đề nào được áp dụng từ CRM")}
                          </div>
                        </div>
                      </div>
                      {crmHasTheme ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={eventThemeEnabled}
                          data-state={eventThemeEnabled ? "On" : "Off"}
                          onClick={async () => {
                            const next = !eventThemeEnabled;
                            setEventThemeEnabled(next, user?.email || user?.id);
                            setEventThemeState(next);
                            if (!next && hasAdminPrivilege) {
                              try {
                                await fetchNestApi("/admin/active-theme", {
                                  method: "PUT",
                                  body: JSON.stringify({ themeId: "none", enabled: false }),
                                });
                              } catch (e) {
                                console.warn("Could not sync deactivate theme to backend:", e);
                              }
                            }
                            toast.success(
                              next
                                ? (isEn ? `Turned on event theme for this account` : `Đã bật hiển thị chủ đề từ CRM cho tài khoản`)
                                : (isEn ? "Switched to standard interface" : "Đã tắt chủ đề, dùng giao diện gốc cho tài khoản")
                            );
                          }}
                          className={`w-14 h-7 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                            eventThemeEnabled ? "bg-[#34C759]" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                              eventThemeEnabled ? "translate-x-7" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full shrink-0">
                          {isEn ? "Default" : "Mặc định"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Item 6: Giao diện tối màu */}
              <div className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex-1 flex justify-start items-center gap-3 min-w-0">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/moon-02.svg"
                        alt="Dark"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Dark Mode" : "Giao diện tối màu"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {theme === "dark" ? (isEn ? "Night executive style" : "Ban đêm sang trọng, dịu mắt") : (isEn ? "Daylight executive style" : "Tươi sáng, tinh tế")}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme === "dark"}
                    data-state={theme === "dark" ? "On" : "Off"}
                    onClick={() => {
                      const nextMode = theme === "dark" ? "light" : "dark";
                      setTheme(nextMode);
                      toast.success(nextMode === "dark" ? "Đã bật giao diện tối" : "Đã chuyển về giao diện sáng");
                    }}
                    className={`w-14 h-7 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                      theme === "dark" ? "bg-[#34C759]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                        theme === "dark" ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Item 7: Trợ lý điều khiển giọng nói AI */}
              <div className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] flex flex-col justify-start items-start gap-2.5">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex-1 flex justify-start items-center gap-3 min-w-0">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/ri_robot-2-line.svg"
                        alt="Voice AI"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "AI Voice Assistant" : "Trợ lý điều khiển giọng nói AI"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {voiceAiEnabled ? (isEn ? "Voice bot floating on screen" : "Hiển thị trợ lý AI điều hướng giọng nói") : (isEn ? "Voice bot is hidden" : "Đang ẩn robot trợ lý giọng nói")}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={voiceAiEnabled}
                    data-state={voiceAiEnabled ? "On" : "Off"}
                    onClick={() => {
                      const next = !voiceAiEnabled;
                      setVoiceAiState(next);
                      setVoiceAiEnabled(next);
                      toast.success(
                        next
                          ? (isEn ? "AI Voice Assistant Activated! 🤖" : "Đã bật Trợ lý Giọng nói AI! 🤖")
                          : (isEn ? "AI Voice Assistant Disabled" : "Đã tắt Trợ lý Giọng nói AI")
                      );
                    }}
                    className={`w-14 h-7 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                      voiceAiEnabled ? "bg-[#34C759]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                        voiceAiEnabled ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: CÀI ĐẶT TÀI KHOẢN ── */}
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-[#003B95] dark:text-blue-400 text-[13px] font-bold uppercase tracking-wider px-1">
              {isEn ? "Account Settings" : "Cài đặt tài khoản"}
            </div>
            <div className="self-stretch rounded-2xl flex flex-col justify-start items-start overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Item 1: Bảo mật tài khoản */}
              <Link
                to="/association/settings"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/lock-unlocked-01.svg"
                        alt="Security"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Account Security" : "Bảo mật tài khoản"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Password, sessions & security" : "Đổi mật khẩu, phiên đăng nhập & bảo mật"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>

              {/* Item 2: Liên hệ ban thư ký */}
              <button
                type="button"
                onClick={() => setContactSupportOpen(true)}
                className="w-full self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 flex flex-col justify-start items-start gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/phone-01.svg"
                        alt="Phone"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Contact Secretariat" : "Liên hệ ban thư ký"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Hotline, call center, zalo OA & inquiry" : "Hotline, tổng đài, zalo QA & gửi yêu cầu hỗ trợ"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </button>

              {/* Item 3: Phân quyền hội viên & BQT */}
              <Link
                to="/association/permissions"
                className="self-stretch p-3 sm:p-3.5 bg-white dark:bg-[#0F172A] flex flex-col justify-start items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3 min-w-0 flex-1">
                    <div className="size-11 bg-sky-50 dark:bg-sky-950/40 rounded-xl flex justify-center items-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      <img
                        src="/icons/profile/shield-tick.svg"
                        alt="Permissions"
                        className="size-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5 min-w-0">
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-sm font-semibold leading-snug line-clamp-1">
                        {isEn ? "Permissions Management" : "Phân quyền hội viên & BQT"}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 dark:text-slate-400 text-xs font-normal leading-tight line-clamp-1">
                        {isEn ? "Executive, secretariat & committee rights" : "Cấp quyền ban chấp hành, ban thư ký & phân ban"}
                      </div>
                    </div>
                  </div>
                  <div className="size-6 relative overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/icons/profile/chevron-right.svg"
                      alt="Arrow"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS: CHIA SẺ, CÀI APP, ĐĂNG XUẤT ── */}
        <div className="self-stretch px-4 flex flex-col justify-start items-start gap-2.5 mt-2">
          {/* Nút 1: Chia sẻ link cài App */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-share-app-modal"))}
            className="self-stretch px-5 py-2.5 rounded-[48px] border border-[#2D2E8B] dark:border-blue-400 bg-transparent hover:bg-[#2D2E8B]/5 dark:hover:bg-blue-400/10 text-[#2D2E8B] dark:text-blue-300 inline-flex justify-center items-center gap-2.5 font-medium font-['SF_Pro',system-ui,sans-serif] text-base transition active:scale-95 cursor-pointer"
          >
            <div className="size-6 relative overflow-hidden flex items-center justify-center">
              <img src="/icons/profile/share-01.svg" alt="Share" className="size-5 object-contain" />
            </div>
            <div className="justify-start text-base font-normal font-['SF_Pro',system-ui,sans-serif] leading-5">
              {isEn ? "Share App Link" : "Chia sẻ link cài App"}
            </div>
          </button>

          {/* Nút 2: Cài lên màn hình chính */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-install-prompt"))}
            className="self-stretch px-5 py-2.5 rounded-[48px] border border-[#2D2E8B] dark:border-blue-400 bg-transparent hover:bg-[#2D2E8B]/5 dark:hover:bg-blue-400/10 text-[#2D2E8B] dark:text-blue-300 inline-flex justify-center items-center gap-2.5 font-medium font-['SF_Pro',system-ui,sans-serif] text-base transition active:scale-95 cursor-pointer"
          >
            <div className="size-6 relative overflow-hidden flex items-center justify-center">
              <img src="/icons/profile/phone-01.svg" alt="Install" className="size-5 object-contain" />
            </div>
            <div className="justify-start text-base font-normal font-['SF_Pro',system-ui,sans-serif] leading-5">
              {isEn ? "Install to Home Screen" : "Cài lên màn hình chính"}
            </div>
          </button>

          {/* Nút 3: Đăng xuất tài khoản */}
          <button
            type="button"
            onClick={logout}
            className="self-stretch px-5 py-2.5 bg-[#FF3B30] hover:bg-red-600 active:scale-95 text-white rounded-[48px] inline-flex justify-center items-center gap-2.5 font-medium font-['SF_Pro',system-ui,sans-serif] text-base shadow-sm transition cursor-pointer"
          >
            <div className="size-6 relative overflow-hidden flex items-center justify-center">
              <img src="/icons/profile/log-out-01.svg" alt="Logout" className="size-5 object-contain" />
            </div>
            <div className="justify-start text-white text-base font-normal font-['SF_Pro',system-ui,sans-serif] leading-5">
              {isEn ? "Log Out Account" : "Đăng xuất tài khoản"}
            </div>
          </button>
        </div>

        {/* ── MODALS: HƯỚNG DẪN SỬ DỤNG VÀ LIÊN HỆ CÁC BAN ── */}
        <UserGuideModal open={userGuideOpen} onClose={() => setUserGuideOpen(false)} />
        <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
      </div>
    </div>
  );
}
