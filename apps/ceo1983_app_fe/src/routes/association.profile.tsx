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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { isEventThemeEnabled, setEventThemeEnabled, getCrmAppliedTheme, FESTIVAL_THEMES } from "@/components/member/SeasonalEventHeader";
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
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import eventImg from "@/assets/vba-event.jpg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

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
  const trimmed = url.trim();
  return !trimmed || trimmed === "undefined" || trimmed === "null";
}

function isDeadCover(url?: string | null): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  return !trimmed || trimmed === "undefined" || trimmed === "null";
}

export default function ProfileScreen() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { isAdmin: isPlatformOrTenantAdmin, isPlatformAdmin } = useRole();
  const hasAdminPrivilege = Boolean(isPlatformOrTenantAdmin || isPlatformAdmin);
  const fetchMember = useServerFn(getMyMember);
  const updateProfileFn = useServerFn(updateMyProfile);
  const fetchDirectory = useServerFn(listMembers);
  const fetchConversations = useServerFn(listConversations);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null, "vba_my_member");
  const { data: realMembers = [] } = useServerData<DirectoryMember[]>(() => fetchDirectory(), [], "vba_directory_members");
  const { data: conversations = [] } = useServerData<MyConversation[]>(() => fetchConversations(), [], "vba_conversations");

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
    try {
      // 1. Nén ảnh qua Canvas để kích thước vừa vặn và không gây quá tải storage (tối đa 1200px)
      const compressedUrl = await compressImage(file, 1200, 0.82);
      let finalCover = compressedUrl;

      // 2. Upload file lên Nest nếu khả dụng
      try {
        const uploadUrl = await uploadFileToNest(file, file.name || "cover.jpg");
        if (uploadUrl && typeof uploadUrl === "string") {
          finalCover = uploadUrl;
        }
      } catch (uploadErr) {
        console.warn("Nest upload media not reachable, fallback to compressed image:", uploadErr);
      }

      // 3. Cập nhật state & lưu localStorage
      setCoverPhoto(finalCover);
      try {
        localStorage.setItem("vba_member_cover_photo", finalCover);
      } catch (stErr) {
        console.warn("Storage full:", stErr);
      }

      // 4. Phát event để toàn app (Home banner, Card điện tử) cập nhật ngay
      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: finalCover }));

      // 5. Lưu vĩnh viễn vào backend DB
      await fetchNestApi("/members/me/cover", {
        method: "PATCH",
        body: JSON.stringify({ coverUrl: finalCover }),
      }).catch((apiErr) => {
        console.warn("API /members/me/cover PATCH error:", apiErr);
      });

      toast.success(isEn ? "Cover photo updated successfully!" : "Cập nhật ảnh bìa thành công!");
    } catch (err) {
      console.error("Error updating cover photo:", err);
      toast.error(isEn ? "Failed to update cover photo" : "Không thể cập nhật ảnh bìa. Vui lòng thử lại!");
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) {
        setCustomAvatar(res);
        setAvatarError(false);
        try {
          localStorage.setItem("vba_member_avatar_photo", res);
          window.dispatchEvent(new Event("vba_member_avatar_updated"));
        } catch {}
      }
    };
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem("vibe_token") || localStorage.getItem("token") || localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          setCustomAvatar(json.url);
          setAvatarError(false);
          localStorage.setItem("vba_member_avatar_photo", json.url);
          window.dispatchEvent(new Event("vba_member_avatar_updated"));
          toast.success(isEn ? "Avatar updated successfully!" : "Cập nhật ảnh đại diện thành công!");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn("Avatar upload rejected:", res.status, err);
        toast.error(isEn ? "Failed to upload avatar" : "Không thể tải ảnh đại diện lên máy chủ");
      }
    } catch (err) {
      console.error("Avatar upload exception:", err);
      toast.error(isEn ? "Failed to upload avatar" : "Lỗi khi tải ảnh đại diện lên máy chủ");
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
    try {
      const compressedUrl = await compressImage(file, 800, 0.85);
      setModalAvatarPreview(compressedUrl);
      setCustomAvatar(compressedUrl);
      try {
        const uploadUrl = await uploadFileToNest(file, file.name || "avatar.jpg");
        if (uploadUrl && typeof uploadUrl === "string") {
          setCustomAvatar(uploadUrl);
          setModalAvatarPreview(uploadUrl);
        }
      } catch {}
      toast.success(isEn ? "Avatar selected" : "Đã chọn ảnh đại diện mới");
    } catch {
      toast.error(isEn ? "Failed to process image" : "Lỗi xử lý hình ảnh");
    } finally {
      setUploadingModalAvatar(false);
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

  const isAdmin = Boolean(
    (user as any)?.role === "admin" ||
    (user as any)?.role === "platform_admin" ||
    (member as any)?.role === "admin" ||
    (member as any)?.role === "association_admin" ||
    (member as any)?.executiveRole
  );

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
    ...(isAdmin ? [{
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
    { mode: "contrast", icon: Contrast, label: isEn ? "Contrast" : "Tương phản", desc: isEn ? "High contrast" : "Độ tương phản cao" },
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
    customAvatar ||
    (typeof window !== "undefined" ? localStorage.getItem("vba_member_avatar_photo") : null) ||
    member?.avatar ||
    (member as any)?.avatarUrl ||
    (user as any)?.avatar_url ||
    (user as any)?.user_metadata?.avatar_url ||
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
    <div className="vba-animate min-h-full pb-28 text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "Profile & Administration" : "Trang Cá Nhân & Quản Trị"}
        back
        right={
          <Link
            to="/association/settings"
            aria-label={isEn ? "Account settings" : "Cài đặt tài khoản"}
            className="text-[#2E3192] dark:text-amber-400 hover:text-[#19194D] p-1"
          >
            <Settings className="h-5 w-5" />
          </Link>
        }
      />

      {/* ── COMPACT MEMBER IDENTITY CARD (Liên kết trực tiếp tới Thẻ Hội Viên & Hồ Sơ) ── */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs">
        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A]">
          {displayCover && !coverError ? (
            <img
              src={displayCover}
              alt="Cover Photo"
              onError={() => setCoverError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[10.5px] font-bold backdrop-blur-md shadow-xs">
            <BadgeCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Hội viên chính thức CEO 1983</span>
          </div>
          <div className="absolute bottom-2.5 left-4 text-[11px] font-medium text-blue-100/90 drop-shadow-xs">
            Mã định danh: <span className="font-mono font-bold text-white">{member?.code || "CEO1983-VIP"}</span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-0">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative">
              {resolvedAvatar && !avatarError ? (
                <img
                  src={resolvedAvatar}
                  alt={profileName || member?.name}
                  onError={handleAvatarLoadError}
                  className="h-20 w-20 rounded-2xl border-4 border-white dark:border-[#0F172A] object-cover shadow-md bg-white"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl border-4 border-white dark:border-[#0F172A] bg-gradient-to-br from-[#003B95] to-[#00224F] text-white font-black text-xl grid place-items-center shadow-md">
                  {initials(profileName || member?.name)}
                </div>
              )}
            </div>

            <Link
              to="/association/card"
              className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold px-3.5 py-2 text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-white" />
              <span>{isEn ? "Member Card & Contract" : "Thẻ Hội Viên & Hồ Sơ"}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {profileName || member?.name || "Doanh Nhân CEO 1983"}
              </h2>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Phone className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400 shrink-0" />
              <span>{displayPhone}</span>
            </div>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profileCompany || (member as any)?.company || "CLB Doanh Nhân CEO 1983"}</span>
            </p>
          </div>
        </div>
      </div>


      {/* ── NAVIGATION MENU (Phân hệ chức năng) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isEn ? "Functional Modules" : "Phân hệ chức năng"}
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs">
          {menu.map((m: any) => {
            const Icon = m.icon;
            if (m.onClick) {
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={m.onClick}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-amber-50/50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-amber-400 border border-blue-100 dark:border-blue-900/40">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {m.label}
                    </div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              );
            }
            return (
              <Link
                key={m.label}
                to={m.to}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-amber-50/50 dark:hover:bg-slate-800/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50/80 dark:bg-[#14223E] text-[#2E3192] dark:text-amber-400 border border-blue-100 dark:border-blue-900/40">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {m.label}
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.desc}</div>
                </div>
                {m.hasAddAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      void navigate({
                        to: "/association/business-cards",
                        search: { tab: "cards", action: "create" },
                      });
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2E3192] dark:text-blue-400 hover:bg-[#2E3192] hover:text-white transition-colors cursor-pointer mr-1 shrink-0"
                    title={isEn ? "Create new card" : "Tạo danh thiếp số mới"}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── THEME & APPEARANCE PICKER ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? "Appearance & Theme" : "Giao diện & Chế độ màu"}
          </span>
          <span className="text-[11px] font-bold text-[#2E3192] dark:text-amber-400">
            {theme === "light" ? (isEn ? "Light" : "Sáng") : theme === "dark" ? (isEn ? "Dark" : "Tối") : (isEn ? "Contrast" : "Tương phản")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setTheme(opt.mode)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all cursor-pointer border ${
                  active
                    ? "border-[#2E3192] dark:border-amber-500 bg-blue-50 dark:bg-[#14223E] shadow-md scale-[1.02]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active
                      ? "bg-[#2E3192] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[12px] font-bold text-slate-900 dark:text-white">
                  {opt.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LANGUAGE SELECTOR (Chuyển đổi ngôn ngữ hoạt động lập tức) ── */}
      <div className="mx-4 mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? "App Language (8 Languages)" : "Ngôn ngữ ứng dụng (8 Ngôn ngữ)"}
          </span>
          <span className="text-[11px] font-bold text-[#2E3192] dark:text-amber-400">
            {lang === "vi" ? "Tiếng Việt" : "English"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { code: "vi" as const, name: "Tiếng Việt", flag: "🇻🇳" },
            { code: "en" as const, name: "English", flag: "🇬🇧" },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                toast.success(l.code === "en" ? "Switched to English" : `Đã chuyển sang ${l.name}`);
              }}
              className={`flex items-center justify-between rounded-xl p-3 border text-xs font-semibold transition cursor-pointer ${
                lang === l.code
                  ? "border-[#2E3192] dark:border-amber-500 bg-blue-50 dark:bg-[#14223E] text-[#2E3192] dark:text-amber-300 shadow-xs font-bold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                <span className="truncate">{l.name}</span>
              </span>
              {lang === l.code && <Check className="h-4 w-4 shrink-0 text-[#2E3192] dark:text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── SEASONAL FESTIVAL THEME SWITCH (Chỉ hiển thị khi CRM đã áp dụng chủ đề) ── */}
      {(() => {
        const appliedTheme = crmThemeId ? FESTIVAL_THEMES.find((t) => t.id === crmThemeId) : null;
        if (!appliedTheme) return null;

        return (
          <div className="mx-4 mt-6 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-[#14223E]/80 p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#003B95]/15 text-[#003B95] dark:text-blue-400 border border-[#003B95]/30">
                  <span className="text-xl select-none">{appliedTheme.iconEmoji}</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{appliedTheme.name}</span>
                    {eventThemeEnabled ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#003B95] text-white">
                        {isEn ? "Active" : "Đang bật"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {isEn ? "Default Off" : "Đang tắt"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {eventThemeEnabled
                      ? appliedTheme.tagline
                      : (isEn ? "Switched to standard executive theme" : "Giao diện Doanh nhân Chuẩn CEO 1983")}
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={eventThemeEnabled}
                onClick={() => {
                  const next = !eventThemeEnabled;
                  setEventThemeEnabled(next);
                  setEventThemeState(next);
                  toast.success(
                    next
                      ? `Đã kích hoạt ${appliedTheme.name}!`
                      : (isEn ? "Switched to Standard CEO 1983 Theme" : "Đã chuyển về Giao diện Chuẩn CEO 1983")
                  );
                }}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  eventThemeEnabled ? "bg-[#003B95]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    eventThemeEnabled ? "translate-x-5.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── TRỢ LÝ ĐIỀU KHIỂN GIỌNG NÓI AI (VOICE AI NAVIGATION ASSISTANT SWITCH) ── */}
      <div className="mx-4 mt-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-[#0f1d38]/80 dark:to-[#16203a]/80 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEn ? "AI Voice Assistant" : "Trợ lý Điều khiển Giọng nói AI"}</span>
                {voiceAiEnabled ? (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
                    {isEn ? "Active" : "Đang bật"}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {isEn ? "Disabled" : "Đang tắt"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {voiceAiEnabled
                  ? (isEn ? "Robot icon floating on screen to navigate by voice command" : "Hiển thị Robot thông minh trên màn hình để ra lệnh mở các danh mục")
                  : (isEn ? "Voice AI assistant is hidden" : "Đang ẩn robot trợ lý giọng nói")}
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={voiceAiEnabled}
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
            className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              voiceAiEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                voiceAiEnabled ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── BQT ADMIN PHÂN QUYỀN HỘI VIÊN (Req 17) ── */}
      {hasAdminPrivilege && (
        <div className="mx-4 mt-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    PHÂN QUYỀN HỘI VIÊN BQT
                  </h3>
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-300 border border-amber-400/30 uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Cấp quyền điều hành Sự kiện, Bản tin, Marketplace, Biểu quyết
                </p>
              </div>
            </div>
            <Link
              to="/association/permissions"
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold shadow-xs hover:bg-[#002B70] transition active:scale-95"
            >
              <span>Phân quyền</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── SUPPORT & LOGOUT ── */}
      <div className="mx-4 mt-6 space-y-2.5">

        <Link
          to="/install"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-white dark:bg-[#0F172A] py-3 text-[13px] font-bold text-[#2E3192] dark:text-amber-400 shadow-xs transition hover:bg-amber-50 dark:hover:bg-[#14223E]"
        >
          {isEn ? "📲 Install App to Home Screen" : "📲 Cài đặt ứng dụng lên màn hình chính"}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white bg-[#2E3192] hover:bg-[#19194D] active:scale-[0.99] transition-all cursor-pointer shadow-md"
        >
          <LogOut className="h-4 w-4 text-white" /> {isEn ? "Sign out" : "Đăng xuất tài khoản"}
        </button>
      </div>



      {/* ── MODALS: HƯỚNG DẪN SỬ DỤNG VÀ LIÊN HỆ CÁC BAN ── */}
      <UserGuideModal open={userGuideOpen} onClose={() => setUserGuideOpen(false)} />
      <ContactSupportModal open={contactSupportOpen} onClose={() => setContactSupportOpen(false)} />
    </div>
  );
}
