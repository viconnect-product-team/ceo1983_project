import { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  MoreVertical,
  Edit3,
  Trash2,
  Plus,
  Heart,
  MessageCircle,
  MessageSquare,
  X,
  Lock,
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
import { CreatePostModal } from "@/components/feed/CreatePostModal";
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
import { Ceo1983ColorThemeSelector } from "@/components/member/Ceo1983ColorThemeSelector";
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
  // 2 Nhóm chức năng chính (Yêu cầu 1): Tổng quan & Bài viết (overview) | Hoạt động & Giao thương (activities)
  const [activeTab, setActiveTab] = useState<"overview" | "activities">("overview");
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);

  // Bài viết mạng lưới của hội viên (Yêu cầu 1, 3)
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  // Edit post states
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"public" | "friends" | "only_me">("public");
  const [savingEdit, setSavingEdit] = useState(false);

  // Modals state
  const [cardPreviewOpen, setCardPreviewOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Setup 4 tính năng nhanh trang chủ (Yêu cầu 2)
  
  const fetchMyPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const res = await fetchNestApi<any[]>("/feed?limit=60").catch(() => []);
      const allPosts = Array.isArray(res) ? res : (res as any)?.items || [];
      const currentUserId = String(user.id || (member as any)?.userId || "").toLowerCase();
      const currentName = String(member?.name || user?.fullName || "").toLowerCase();
      const currentCode = String(member?.code || "").toLowerCase();
      const mine = allPosts.filter((p: any) => {
        const aId = String(p.author?.id || p.authorId || "").toLowerCase();
        const aName = String(p.author?.name || p.authorName || "").toLowerCase();
        return (currentUserId && aId === currentUserId) || 
               (currentCode && aId === currentCode) ||
               (currentName && aName === currentName);
      });
      setMyPosts(mine);
    } catch {
      /* ignore */
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user, member]);

  const handleOpenEditPost = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditPrivacy(post.privacy || "public");
    setActiveMenuPostId(null);
  };

  const handleSaveEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      await fetchNestApi(`/feed/${editingPost.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          privacy: editPrivacy,
        }),
      });

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: editTitle, content: editContent, privacy: editPrivacy }
            : p
        )
      );
      toast.success("Đã cập nhật bài viết thành công!");
      setEditingPost(null);
    } catch {
      toast.error("Không thể cập nhật bài viết");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi mạng lưới?")) return;
    try {
      await fetchNestApi(`/feed/${postId}`, {
        method: "DELETE",
      });

      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      setActiveMenuPostId(null);
      toast.success("Đã xóa bài viết thành công!");
    } catch {
      toast.error("Không thể xóa bài viết");
    }
  };

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
          <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-slate-900">
            <img
              src={displayCover}
              alt="Cover Photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />

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
          <div className="relative -mt-14 px-4 pb-4 pt-0 flex flex-col items-center text-center">
            {/* Avatar Tròn & Nút Đổi Avatar */}
            <div className="relative mb-2">
              <div className="size-22 sm:size-24 rounded-full border-4 border-white dark:border-[#0F172A] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {resolvedAvatar && !avatarError ? (
                  <img
                    src={resolvedAvatar}
                    alt={displayName}
                    onError={() => setAvatarError(true)}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-[#003B95] flex items-center justify-center text-white text-xl font-black">
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

            {/* ── 4 NÚT HÀNH ĐỘNG TINH GỌN DƯỚI AVATAR (YÊU CẦU 2): DANH THIẾP, CHIA SẺ, SỬA HỒ SƠ, CÀI ĐẶT ── */}
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

              {/* Nút 3: Sửa hồ sơ */}
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Chỉnh sửa hồ sơ"
              >
                <Pencil className="size-5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Sửa hồ sơ</span>
              </button>

              {/* Nút 4: Cài đặt hệ thống (Yêu cầu 2: đưa vào nhóm icon dưới avatar, bỏ quét mã) */}
              <button
                type="button"
                onClick={() => setSystemSettingsOpen(true)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition active:scale-95 cursor-pointer group"
                title="Cài đặt hệ thống"
              >
                <Cog className="size-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">Cài đặt</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. THANH SEGMENTED TABS: 2 NHÓM CHÍNH (YÊU CẦU 1) ── */}
        <div className="w-full">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#003B95] text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              style={activeTab === "overview" ? { backgroundColor: "#003B95", color: "#ffffff" } : undefined}
            >
              <User className={`h-3.5 w-3.5 ${activeTab === "overview" ? "text-white" : ""}`} />
              <span style={activeTab === "overview" ? { color: "#ffffff" } : undefined}>Tổng quan &amp; Bài viết</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activities")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "activities"
                  ? "bg-[#003B95] text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
              style={activeTab === "activities" ? { backgroundColor: "#003B95", color: "#ffffff" } : undefined}
            >
              <Briefcase className={`h-3.5 w-3.5 ${activeTab === "activities" ? "text-white" : ""}`} />
              <span style={activeTab === "activities" ? { color: "#ffffff" } : undefined}>Giao thương &amp; Sự kiện</span>
            </button>
          </div>
        </div>

        {/* ── 4. NỘI DUNG THEO TỪNG TAB (TẤT CẢ DẠNG ĐẦU MỤC THU GỌN - BẤM VÀO MỚI MỞ RA) ── */}

        
        {/* ── 4. NỘI DUNG 2 NHÓM CHÍNH (YÊU CẦU 1, 2, 3) ── */}

        {/* ── NHÓM 1: TỔNG QUAN, SỐ LIỆU, HỒ SƠ DOANH NGHIỆP & BÀI VIẾT MẠNG LƯỚI ── */}
        {activeTab === "overview" && (
          <div className="w-full space-y-3 animate-in fade-in duration-200">
            {/* 4 Số liệu chỉ số tổng hợp (Yêu cầu 1) */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Sự kiện</span>
                <span className="text-base font-black text-[#003B95] dark:text-blue-400 mt-0.5 block">
                  {participatedEvents.length}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cơ hội</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {connectedOpportunities.length}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hẹn B2B</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {meetings1on1.length}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Bài viết</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {myPosts.length}
                </span>
              </div>
            </div>

            {/* Panel Hồ sơ doanh nghiệp (Gộp Giới thiệu & Quy mô, không có nút sửa ở bio, cho phép đóng mở - Yêu cầu 2) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("business_profile")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Hồ sơ doanh nghiệp
                    </h3>
                    <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                      {displayCompany} • {displayIndustry} • {displayCompanySize}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["business_profile"] !== false ? "rotate-180 text-[#003B95] dark:text-amber-400" : ""
                  }`}
                />
              </button>

              {expandedSections["business_profile"] !== false && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Giới thiệu năng lực doanh nhân &amp; doanh nghiệp</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                      {displayBio}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Quy mô nhân sự</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                        {displayCompanySize}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Lĩnh vực kinh doanh</div>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">
                        {displayIndustry}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Doanh nghiệp trực thuộc</div>
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

            {/* Dưới panel hồ sơ doanh nghiệp là phần bài viết đã đăng (Yêu cầu 3) */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Bài viết đã đăng vào mạng lưới
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {myPosts.length} bài viết chia sẻ trên bảng tin CLB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCreatePostOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Đăng bài</span>
                </button>
              </div>

              {/* Danh sách bài viết */}
              {loadingPosts ? (
                <div className="py-8 flex justify-center text-slate-400">
                  <span className="text-xs">Đang tải bài viết...</span>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <FileText className="size-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bạn chưa đăng bài viết nào vào mạng lưới CEO 1983.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreatePostOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Đăng bài viết đầu tiên</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {myPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2 relative"
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-9 rounded-full bg-[#003B95] overflow-hidden shrink-0">
                            {post.author?.avatar ? (
                              <img
                                src={resolveMediaUrl(post.author.avatar) || post.author.avatar}
                                alt={post.author.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-white text-xs font-bold">
                                {initials(post.author?.name || displayName)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              {post.author?.name || displayName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>
                                {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                              <span>•</span>
                              {/* Privacy Badge (như Facebook - Yêu cầu 1) */}
                              <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-semibold">
                                {post.privacy === "friends" ? (
                                  <>
                                    <Users className="size-3 text-blue-500" />
                                    <span>Bạn bè kết nối</span>
                                  </>
                                ) : post.privacy === "only_me" ? (
                                  <>
                                    <Lock className="size-3 text-amber-500" />
                                    <span>Chỉ mình tôi</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="size-3 text-emerald-500" />
                                    <span>Công khai</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu ... có Chỉnh sửa và Xóa (Yêu cầu 1) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                            }
                            className="size-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer transition"
                            title="Tùy chọn bài viết"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {activeMenuPostId === post.id && (
                            <div
                              className="absolute right-0 top-8 z-20 w-36 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenEditPost(post)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="size-3.5 text-blue-600" />
                                <span>Chỉnh sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Xóa bài viết</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title & Content */}
                      {post.title && (
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {post.title}
                        </h4>
                      )}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                        {post.content}
                      </p>

                      {/* Images */}
                      {Array.isArray(post.images) && post.images.length > 0 && (
                        <div className={`grid gap-1.5 pt-1 ${post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {post.images.slice(0, 3).map((imgUrl: string, i: number) => (
                            <img
                              key={i}
                              src={resolveMediaUrl(imgUrl) || imgUrl}
                              alt="Post attach"
                              className="rounded-xl w-full h-28 object-cover border border-slate-200/80 dark:border-slate-700"
                            />
                          ))}
                        </div>
                      )}

                      {/* Footer Stats */}
                      <div className="flex items-center gap-4 pt-1.5 text-[11px] text-slate-400 font-medium border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="flex items-center gap-1">
                          <Heart className="size-3 text-rose-500 fill-rose-500" />
                          <span>{post.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3 text-blue-500" />
                          <span>{post.commentsCount || 0}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NHÓM 2: GIAO THƯƠNG & SỰ KIỆN ── */}
        {/* ── TAB 2: GIAO THƯƠNG B2B (TỐI GIẢN CHUẨN 3 MÀU CEO 1983: ĐỎ BÃ TRẦU - VÀNG KIM - XANH NAVY) ── */}
        {activeTab === "activities" && (
          <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            {/* 2.1. Đầu mục: Sự kiện đã tham gia */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("events")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-400 grid place-items-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Sự kiện đã tham gia
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 text-[10px] font-black border border-blue-100 dark:border-blue-900">
                      {participatedEvents.length}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["events"] ? "rotate-180 text-[#1E3A8A] dark:text-amber-400" : ""
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
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] dark:text-blue-400 hover:underline"
                      >
                        <span>Khám phá lịch sự kiện CLB</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {participatedEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to="/events/$eventId"
                          params={{ eventId: ev.id } as any}
                          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-10 rounded-xl bg-[#1E3A8A] text-white flex flex-col items-center justify-center shrink-0 leading-tight">
                              <span className="text-[10px] font-black">{ev.day || "EV"}</span>
                              <span className="text-[8px] font-bold uppercase">{ev.month || "CEO"}</span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition">
                                {ev.title}
                              </h5>
                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                                {ev.time || "Theo lịch"} • {ev.place || "Hà Nội"}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 text-[10px] font-extrabold shrink-0 border border-blue-200">
                            Đã đăng ký
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2.2. Đầu mục: Cuộc họp ban */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("committee_meetings")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-400 grid place-items-center shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cuộc họp ban
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 text-[10px] font-black border border-blue-100 dark:border-blue-900">
                      {committeeMeetings.length}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["committee_meetings"] ? "rotate-180 text-[#1E3A8A] dark:text-blue-400" : ""
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
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1E3A8A] dark:text-blue-300 text-[9.5px] font-extrabold uppercase">
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
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#1E3A8A] text-white text-[11px] font-bold shadow-2xs hover:bg-[#172554] transition cursor-pointer"
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

            {/* 2.3. Đầu mục: Cuộc gặp giao thương 1-on-1 */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("meetings_1on1")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <Handshake className="size-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cuộc gặp giao thương 1-on-1
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 text-[10px] font-black border border-blue-200 dark:border-blue-900">
                      {meetings1on1.length}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["meetings_1on1"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
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
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 text-[9.5px] font-extrabold border border-blue-200">
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
                          <Clock className="size-3 text-[#003B95] dark:text-blue-400" />
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-[#003B95] dark:text-blue-300 text-[10.5px] font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          <Phone className="size-3 text-[#003B95]" />
                          <span>Gọi điện</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2.4. Đầu mục: Cơ hội giao thương B2B */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("opportunities")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <TrendingUp className="size-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cơ hội giao thương B2B
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 text-[10px] font-black border border-blue-200 dark:border-blue-900">
                      {connectedOpportunities.length}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["opportunities"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
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
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#003B95] dark:text-blue-400 hover:underline"
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
                          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-400/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#003B95] transition">
                              {opp.title}
                            </h5>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                              {opp.company || "Hội viên CLB"} • {opp.value || "Thỏa thuận B2B"}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 text-[10px] font-extrabold shrink-0 border border-blue-200">
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
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("marketplace")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <Package className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Khám phá Marketplace &amp; Danh bạ CEO
                    </h4>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["marketplace"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
                  }`}
                />
              </button>

              {expandedSections["marketplace"] && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2 animate-in fade-in duration-150">
                  <Link
                    to="/association/products"
                    search={undefined as any}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                        <Calendar className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">Lịch hoạt động &amp; Nhắc hẹn</h5>
                          <span className="px-1.5 py-0.2 rounded-md bg-[#003B95] text-white text-[8.5px] font-bold uppercase">
                            Nhắc lịch
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Xem sự kiện, họp ban, cuộc gặp &amp; cài thông báo nhắc</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-[#003B95] shrink-0" />
                  </Link>
                </div>
              )}
            </div>

            {/* 2.6. Đầu mục: Lịch sử thao tác */}
            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection("audit_history")}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                    <History className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Lịch sử thao tác
                    </h4>
                  </div>
                </div>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    expandedSections["audit_history"] ? "rotate-180 text-[#003B95] dark:text-blue-400" : ""
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
                        <span className="size-2 rounded-full bg-[#1E3A8A] dark:bg-amber-400 shrink-0" />
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
      </div>

      {/* ── MODAL CHỈNH SỬA BÀI VIẾT (YÊU CẦU 1) ── */}
      {editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setEditingPost(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                Chỉnh sửa bài viết
              </h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề (tùy chọn)
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung bài viết (*)
                </label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Nội dung bài viết..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#003B95] resize-none"
                />
              </div>

              {/* Phạm vi hiển thị (Facebook-style) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phạm vi hiển thị (như Facebook)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("public")}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      editPrivacy === "public"
                        ? "border-[#003B95] bg-blue-50/80 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Globe className="size-3.5" />
                    <span className="text-[10.5px]">Công khai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("friends")}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      editPrivacy === "friends"
                        ? "border-[#003B95] bg-blue-50/80 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Users className="size-3.5" />
                    <span className="text-[10.5px]">Bạn bè</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("only_me")}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      editPrivacy === "only_me"
                        ? "border-[#003B95] bg-blue-50/80 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Lock className="size-3.5" />
                    <span className="text-[10.5px]">Chỉ mình tôi</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ĐĂNG BÀI VIẾT VÀO MẠNG LƯỚI (YÊU CẦU 1, 3) ── */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onSuccess={(newPost) => {
          setMyPosts((prev) => [newPost, ...prev]);
        }}
      />

      {/* ── MODAL CÀI ĐẶT HỆ THỐNG (ĐƯA VÀO ICON CÀI ĐẶT DƯỚI AVATAR - YÊU CẦU 2) ── */}
      {systemSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-hidden"
          onClick={() => setSystemSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-[#003B95] text-white grid place-items-center shadow-xs">
                  <Cog className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    Cài đặt &amp; Cấu hình hệ thống
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Nhận diện thương hiệu, tiện ích và an toàn tài khoản
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSystemSettingsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Settings Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:none]">
              
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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

                    {/* 4 Dạng Màu Tiêu Chuẩn CEO 1983 */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Ceo1983ColorThemeSelector />
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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
                    className="w-full p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between hover:brightness-105 transition cursor-pointer text-left"
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium line-clamp-1">
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
        </div>
      </div>
    )}

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
