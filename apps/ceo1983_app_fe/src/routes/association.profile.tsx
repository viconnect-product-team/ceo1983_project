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
  ExternalLink,
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
import { QuickProfileEditModal } from "@/components/common/QuickProfileEditModal";

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
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { isSuperAdmin } = useRole();
  const fetchMember = useServerFn(getMyMember);
  const updateProfileFn = useServerFn(updateMyProfile);
  const fetchDirectory = useServerFn(listMembers);
  const fetchConversations = useServerFn(listConversations);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");
  const { data: realMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), [], "vba_directory_members");
  const { data: conversations = [] } = useServerData<MyConversation[]>(() => fetchConversations(), [], "vba_conversations");

  // Phân quyền: CHỈ Quản trị / Admin / Chủ tịch (đồng bộ CRM Hiệp hội)
  const hasAdminPrivilege = isSuperAdmin;

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

  const isAdmin = Boolean(hasAdminPrivilege || isSuperAdmin || user?.role === "platform_admin" || user?.role === "admin");

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

  const displayPhone = profilePhone || member?.phone || (user as any)?.phone || (user as any)?.user_metadata?.phone || "0983 198 383";

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
      <div className="w-full max-w-full flex flex-col justify-start items-stretch gap-4">
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

        {/* ── EXECUTIVE PROFILE HERO (COVER BACKGROUND & AVATAR) ── */}
        <div className="w-full relative px-3 sm:px-4">
          {/* Cover Photo Container */}
          <div className="relative w-full h-44 sm:h-52 rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-[#00173D] via-[#002B70] to-[#003B95] border border-slate-200/80 dark:border-white/10 group">
            {displayCover ? (
              <img
                src={displayCover}
                alt="Profile Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                {/* Executive decorative pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center px-4 relative z-10">
                  <span className="text-amber-400 font-extrabold tracking-widest text-[11px] uppercase block mb-1">
                    CLB Doanh Nhân CEO 1983 • HanoiBA
                  </span>
                  <h2 className="text-white text-base sm:text-lg font-black drop-shadow-md">
                    KẾT NỐI SỨC MẠNH — LAN TỎA THÀNH CÔNG
                  </h2>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Member Code Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-bold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{member?.code || "CEO1983-VIP"}</span>
            </div>

            {/* Change Cover Button */}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold transition active:scale-95 cursor-pointer shadow-md"
              title="Đổi ảnh bìa"
            >
              {uploadingCover ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
              ) : (
                <Camera className="h-3.5 w-3.5 text-amber-300" />
              )}
              <span className="hidden sm:inline">Đổi ảnh bìa</span>
            </button>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {/* User Info Card Floating Over Cover */}
          <div className="relative -mt-12 mx-1 sm:mx-3 px-4 sm:px-6 pt-0 pb-5 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            {/* Avatar Section */}
            <div className="relative -mt-12 sm:-mt-14 mb-3">
              <div className="relative size-24 sm:size-28 rounded-full border-4 border-white dark:border-[#0F172A] shadow-xl overflow-hidden bg-gradient-to-tr from-[#00224F] to-[#003B95] ring-2 ring-amber-400/40">
                {resolvedAvatar && !avatarError ? (
                  <img
                    src={resolvedAvatar}
                    alt={profileName || member?.name}
                    onError={handleAvatarLoadError}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-300 text-2xl font-black">
                    {initials(profileName || member?.name || "Trần Tuấn Anh")}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-amber-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Change Avatar Button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 size-8 rounded-full bg-[#003B95] hover:bg-[#002B70] text-amber-300 border-2 border-white dark:border-[#0F172A] shadow-md grid place-items-center cursor-pointer transition active:scale-95"
                title="Đổi ảnh đại diện"
              >
                <Camera className="size-4" />
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name & Official Verified Status */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {profileName || member?.name || "Trần Tuấn Anh"}
              </h1>
              <BadgeCheck className="h-5 w-5 text-[#003B95] dark:text-sky-400 shrink-0 fill-[#003B95]/10" />
            </div>

            {/* Title & Company */}
            <div className="mt-1 flex flex-col items-center gap-0.5">
              <p className="text-xs sm:text-sm font-bold text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span>{profileTitle || "Hội viên chính thức CLB CEO 1983"}</span>
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{profileCompany || "CLB Doanh Nhân CEO 1983"}</span>
              </p>
            </div>

            {/* Official Member Ribbon */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Hội viên chính thức CLB Doanh Nhân CEO 1983</span>
            </div>

            {/* Executive Quick Actions Toolbar (4 Nút lớn tinh tế) */}
            <div className="grid grid-cols-4 gap-2 w-full mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate({ to: "/association/card" as any })}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700/60 transition active:scale-95 cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center">
                  <CreditCard className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Danh thiếp</span>
              </button>

              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 border border-amber-200/70 dark:border-amber-800/50 transition active:scale-95 cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 grid place-items-center">
                  <Edit3 className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">Sửa hồ sơ</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700/60 transition active:scale-95 cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 grid place-items-center">
                  <Share2 className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Chia sẻ</span>
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/association/card" as any })}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700/60 transition active:scale-95 cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <QrCode className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Mã QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── EXECUTIVE SEGMENTED TABS (THEME SÁNG SẮC NÉT) ── */}
        <div className="w-full px-3 sm:px-4">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "about"
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-sm font-extrabold"
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
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-sm font-extrabold"
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
                  ? "bg-white dark:bg-[#003B95] text-[#003B95] dark:text-white shadow-sm font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Cog className="h-3.5 w-3.5" />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: HỒ SƠ & GIỚI THIỆU DOANH NHÂN ── */}
        {activeTab === "about" && (
          <div className="w-full px-3 sm:px-4 space-y-3.5 animate-in fade-in duration-200">
            {/* Card Thông tin liên hệ trực tiếp */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
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
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`tel:${displayPhone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                    >
                      Gọi
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(displayPhone);
                        toast.success("Đã sao chép số điện thoại!");
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                      title="Sao chép"
                    >
                      <Copy className="size-3.5" />
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
                      <span className="font-bold text-slate-800 dark:text-white block truncate">{profileEmail || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  {profileEmail && (
                    <a
                      href={`mailto:${profileEmail}`}
                      className="px-2.5 py-1 rounded-lg bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-[11px] shadow-xs cursor-pointer"
                    >
                      Gửi thư
                    </a>
                  )}
                </div>

                {/* Địa chỉ trụ sở */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                  <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Địa chỉ / Trụ sở</span>
                    <span className="font-semibold text-slate-800 dark:text-white block line-clamp-1">{profileAddress}</span>
                  </div>
                </div>

                {/* Website chính thức */}
                {profileWebsite && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Website</span>
                        <span className="font-bold text-slate-800 dark:text-white block truncate">{profileWebsite}</span>
                      </div>
                    </div>
                    <a
                      href={profileWebsite.startsWith("http") ? profileWebsite : `https://${profileWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#003B95] dark:text-blue-400 hover:bg-slate-200 cursor-pointer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Card Giới thiệu doanh nhân / Bio */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Giới thiệu doanh nhân &amp; năng lực</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profileBio || "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương mở rộng mạng lưới doanh nghiệp B2B."}
              </p>
            </div>

            {/* Card Kênh mạng xã hội (Zalo, Facebook, LinkedIn) */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                <span>Kênh kết nối số &amp; mạng xã hội</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://zalo.me/${displayPhone.replace(/[^0-9]/g, "")}`}
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
                    <Share2 className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Chia sẻ hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: HOẠT ĐỘNG & GIAO THƯƠNG B2B ── */}
        {activeTab === "friends" && (
          <div className="w-full px-3 sm:px-4 space-y-3 animate-in fade-in duration-200">
            {/* Mục 1: Quản lý danh thiếp số */}
            <Link
              to="/association/business-cards"
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#003B95] dark:text-sky-400 grid place-items-center border border-sky-100 dark:border-sky-900/50">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quản lý danh thiếp số NFC</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thiết kế &amp; chia sẻ danh thiếp điện tử 1 chạm</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </Link>

            {/* Mục 2: Cơ hội giao thương B2B */}
            <Link
              to="/association/opportunities"
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center border border-amber-100 dark:border-amber-900/50">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cơ hội giao thương B2B</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nhu cầu mua, bán &amp; tìm kiếm đối tác chiến lược</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </Link>

            {/* Mục 3: Gian hàng sản phẩm */}
            <Link
              to="/association/products"
              search={{}}
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 grid place-items-center border border-emerald-100 dark:border-emerald-900/50">
                  <Package className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gian hàng sản phẩm &amp; dịch vụ</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Showcase sản phẩm của doanh nghiệp hội viên</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </Link>

            {/* Mục 4: Danh bạ hội viên CLB */}
            <Link
              to="/association/members"
              className="p-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 grid place-items-center border border-indigo-100 dark:border-indigo-900/50">
                  <Users className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Danh bạ hội viên CLB CEO 1983</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tra cứu &amp; kết nối 500+ doanh nhân</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400" />
            </Link>
          </div>
        )}

        {/* ── TAB 3: TIỆN ÍCH & CÀI ĐẶT ỨNG DỤNG ── */}
        {activeTab === "posts" && (
          <div className="w-full px-3 sm:px-4 space-y-3.5 animate-in fade-in duration-200">
            {/* Cụm Cài đặt ứng dụng */}
            <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {/* Item 1: Bật / Tắt Thông báo đẩy */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#003B95] dark:text-sky-400 grid place-items-center shrink-0">
                    <Bell className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Thông báo đẩy</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isNotificationEnabled ? "Đang bật nhận tin tức & lời mời" : "Đang tắt thông báo"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isNotificationEnabled}
                  onClick={handleToggleNotification}
                  className={`w-12 h-6 p-0.5 rounded-full flex items-center transition-colors cursor-pointer shrink-0 ${
                    isNotificationEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`size-5 bg-white rounded-full shadow-md transform transition ${
                      isNotificationEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Item 2: Ngôn ngữ */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <Globe2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ngôn ngữ</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === "vi" ? "Tiếng Việt (VN)" : "English (EN)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (lang !== "vi") setLang("vi");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      lang === "vi" ? "bg-[#003B95] text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🇻🇳 VN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (lang !== "en") setLang("en");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      lang === "en" ? "bg-[#003B95] text-white shadow-xs" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>

              {/* Item 3: Giao diện tối màu */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
                    <Moon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Giao diện tối màu</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {theme === "dark" ? "Chế độ ban đêm dịu mắt" : "Chế độ tươi sáng ban ngày"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === "dark"}
                  onClick={() => {
                    const nextMode = theme === "dark" ? "light" : "dark";
                    setTheme(nextMode);
                    toast.success(nextMode === "dark" ? "Đã bật giao diện tối" : "Đã chuyển về giao diện sáng");
                  }}
                  className={`w-12 h-6 p-0.5 rounded-full flex items-center transition-colors cursor-pointer shrink-0 ${
                    theme === "dark" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`size-5 bg-white rounded-full shadow-md transform transition ${
                      theme === "dark" ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Item 4: Hướng dẫn sử dụng */}
              <button
                type="button"
                onClick={() => setUserGuideOpen(true)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cẩm nang hướng dẫn sử dụng</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">10 chức năng cốt lõi dành cho hội viên</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-slate-400" />
              </button>

              {/* Item 5: Liên hệ ban thư ký */}
              <button
                type="button"
                onClick={() => setContactSupportOpen(true)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 grid place-items-center shrink-0">
                    <Headphones className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Liên hệ Ban Thư Ký CLB</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hotline, Zalo OA &amp; tiếp nhận hỗ trợ</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-slate-400" />
              </button>
            </div>

            {/* Các nút hành động chính */}
            <div className="space-y-2 pt-1">
              {/* Đi tới quản trị nếu có quyền */}
              {hasAdminPrivilege && (
                <Link
                  to="/events"
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#003B95] to-[#001D4D] text-white flex items-center justify-center gap-2 font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  <LayoutDashboard className="size-4 text-amber-300" />
                  <span>Quản trị hệ thống CLB CEO 1983</span>
                </Link>
              )}

              {/* Cài lên màn hình điện thoại */}
              <button
                type="button"
                onClick={async () => {
                  const p = (window as any).__pwaInstallPrompt;
                  if (p) {
                    try {
                      p.prompt();
                      const choice = await p.userChoice;
                      if (choice?.outcome === "accepted") {
                        toast.success("Ứng dụng đang được tự động cài lên màn hình!");
                      }
                      (window as any).__pwaInstallPrompt = null;
                      return;
                    } catch {}
                  }
                  window.dispatchEvent(new CustomEvent("open-install-prompt"));
                }}
                className="w-full p-3.5 rounded-2xl border border-[#003B95] dark:border-blue-400 text-[#003B95] dark:text-blue-300 bg-white dark:bg-[#0F172A] flex items-center justify-center gap-2 font-bold text-sm transition active:scale-95 cursor-pointer"
              >
                <Smartphone className="size-4" />
                <span>Cài đặt ứng dụng lên màn hình chính</span>
              </button>

              {/* Đăng xuất tài khoản */}
              <button
                type="button"
                onClick={logout}
                className="w-full p-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>
        )}

        {/* ── POPUP CHỈNH SỬA HỒ SƠ NHANH (QUICK PROFILE EDIT MODAL) ── */}
        <QuickProfileEditModal
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          initialName={profileName}
          initialPhone={profilePhone}
          initialCompany={profileCompany}
          initialTitle={profileTitle}
          initialAvatar={resolvedAvatar}
          initialCover={displayCover}
          initialWebsite={profileWebsite}
          onSaved={(updated) => {
            if (updated.name) setProfileName(updated.name);
            if (updated.phone) setProfilePhone(updated.phone);
            if (updated.title) setProfileTitle(updated.title);
            if (updated.company) setProfileCompany(updated.company);
            if (updated.website) setProfileWebsite(updated.website);
            if (updated.avatar) setCustomAvatar(updated.avatar);
            if (updated.cover) setCoverPhoto(updated.cover);
            setEditProfileOpen(false);
            toast.success("Hồ sơ đã được lưu và cập nhật!");
          }}
        />

        {/* ── MODALS: HƯỚNG DẪN SỬ DỤNG VÀ LIÊN HỆ CÁC BAN ── */}
        <UserGuideModal open={userGuideOpen} onClose={() => setUserGuideOpen(false)} />
        <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
      </div>
    </div>
  );
}
