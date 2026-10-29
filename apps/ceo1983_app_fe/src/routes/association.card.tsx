import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  ReceiptText,
  CalendarPlus,
  CalendarClock,
  UserPen,
  BadgeCheck,
  QrCode,
  IdCard,
  Nfc,
  X,
  Pencil,
  ImagePlus,
  Trash2,
  Wallet,
  ShieldCheck,
  Palette,
  Check,
  CloudOff,
  Handshake,
  BookOpen,
  TrendingUp,
  Gift,
  Award,
  Sparkles,
  Tag,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Copy,
  MessageSquare,
  ExternalLink,
  Crown,
  Facebook,
  Linkedin,
  Camera,
  Users,
  ScanLine,
  FileText,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  FileUp,
} from "lucide-react";
import heroImg from "@/assets/vba-hero.jpg";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { MemberHeader } from "@/components/member/MemberShell";
import { QrCanvas } from "@/components/member/QrCanvas";
import { Ceo1983BusinessCardVisit, isBlackBackgroundLogo } from "@/components/member/Ceo1983BusinessCardVisit";
import { AssociationMemberQrModal } from "@/components/member/AssociationMemberQrModal";
import { AssociationQrScanModal } from "@/components/member/AssociationQrScanModal";
import { AssociationCardCaptureModal } from "@/components/member/AssociationCardCaptureModal";
import { PrivacySettingsModal } from "@/components/member/PrivacySettingsModal";
import { CompanyProfileTemplateModal } from "@/components/member/CompanyProfileTemplateModal";
import {
  CompanyProfileTwoPages,
  type CompanyProfile2PageData,
  DEFAULT_COMPANY_PROFILE,
} from "@/components/member/CompanyProfileTwoPages";
import { CompanyProfileEditModal } from "@/components/member/CompanyProfileEditModal";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import {
  getMyMember,
  type MyMember,
  getMyBenefits,
  type MemberBenefit,
  getActiveAssociationId,
  getMyAssociationBrand,
  type MyAssociationBrand,
} from "@/lib/member-app.functions";
import { getCardSettings, saveCardSettings, type CardSettings } from "@/lib/card.functions";
import { useT, useLang } from "@/lib/i18n";
import {
  resolveTheme,
  resolveState,
  STATE_STYLES,
  CARD_THEME_LIST,
  type CardTheme,
} from "@/lib/card-themes";
import { buildMembershipPass } from "@/lib/membership-pass";
import { walletCapabilities, walletAddUrl } from "@/lib/wallet-provider";
import { getMyIdentityPassFn, type MyIdentityPass } from "@/lib/member-identity.functions";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";
import { compressImage } from "@/lib/image";
const appIcon = "/ceo1983-emblem-8.png";
const THEME_KEY = "vba-card-theme";

export const Route = createFileRoute("/association/card")({
  component: CardScreen,
});

type Display = {
  name: string;
  company: string;
  photo: string | null;
  showName: boolean;
  showCompany: boolean;
  showPhoto: boolean;
};

function resolveDisplay(
  member: MyMember | null,
  s: CardSettings | null,
  customProfile?: any,
  customAvatar?: string | null,
  currentUser?: any,
): Display {
  const isGeneric = !member?.name || member.name === "Thành viên mới" || member.name === "Hội viên CLB CEO 1983";
  const authUserName = currentUser?.name || currentUser?.user_metadata?.full_name;

  // Khi người dùng chỉnh sửa hồ sơ thẻ (customProfile hoặc settings), thông tin mới cập nhật PHẢI có độ ưu tiên cao nhất
  const customName = customProfile?.name?.trim() || s?.displayName?.trim();
  const dbMemberName = (!isGeneric && member?.name) ? member.name.trim() : null;
  const rawName = customName || dbMemberName || authUserName || member?.name || "";
  const cleanName = rawName || "Hội viên CLB CEO 1983";

  const customCompany = customProfile?.company?.trim() || s?.displayCompany?.trim();
  const dbCompany = (member as any)?.companyName || (member as any)?.company;
  const rawCompany = customCompany || dbCompany;
  const isOldSeed = rawCompany && (rawCompany.includes("Default Platform") || rawCompany.includes("CLB CEO 1983"));
  const cleanCompany = !rawCompany || isOldSeed ? "CLB Doanh Nhân CEO 1983" : rawCompany;

  return {
    name: cleanName.trim() || "Hội viên CLB CEO 1983",
    company: cleanCompany.trim(),
    photo: (() => {
      const raw =
        customAvatar ||
        customProfile?.avatar ||
        s?.photoUrl ||
        member?.avatar ||
        (member as any)?.avatarUrl ||
        (currentUser as any)?.avatar_url ||
        (currentUser as any)?.user_metadata?.avatar_url ||
        null;
      return raw ? (resolveMediaUrl(raw) || raw) : null;
    })(),
    showName: s?.showName ?? true,
    showCompany: s?.showCompany ?? true,
    showPhoto: s?.showPhoto ?? true,
  };
}

/** vCard text encoded into QR/NFC: CHỈ LƯU TÊN VÀ SỐ ĐIỆN THOẠI (Bỏ chức vụ, bỏ mô tả) */
function buildVCard(member: MyMember | null, d: Display): string {
  if (!member) return "";
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (d.showName && d.name) lines.push(`FN:${d.name}`);
  if (member.phone) lines.push(`TEL;TYPE=CELL:${member.phone}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

function initials(name: string) {
  if (!name) return "CEO";
  const clean = name.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim();
  if (!clean) return "CEO";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function resolveBenefitIcon(b: MemberBenefit, index: number) {
  const text = `${b.titleVi || ""} ${b.titleEn || ""} ${b.descVi || ""}`.toLowerCase();
  if (text.includes("kết nối") || text.includes("network") || text.includes("giao thương"))
    return Handshake;
  if (
    text.includes("đào tạo") ||
    text.includes("học") ||
    text.includes("training") ||
    text.includes("hội thảo")
  )
    return BookOpen;
  if (
    text.includes("xúc tiến") ||
    text.includes("đầu tư") ||
    text.includes("tăng trưởng") ||
    text.includes("kinh doanh")
  )
    return TrendingUp;
  if (
    text.includes("ưu đãi") ||
    text.includes("giảm") ||
    text.includes("quà") ||
    text.includes("voucher")
  )
    return Gift;
  if (text.includes("thương hiệu") || text.includes("truyền thông") || text.includes("vinh danh"))
    return Award;
  if (text.includes("pháp lý") || text.includes("bảo vệ") || text.includes("tư vấn"))
    return ShieldCheck;
  const fallbackIcons = [Handshake, Gift, TrendingUp, Award, BookOpen, ShieldCheck, Sparkles];
  return fallbackIcons[index % fallbackIcons.length] || Sparkles;
}

function CardScreen() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useAuth();
  const fetchMember = useServerFn(getMyMember);
  const fetchSettings = useServerFn(getCardSettings);
  const fetchBenefits = useServerFn(getMyBenefits);
  const fetchAssocId = useServerFn(getActiveAssociationId);
  const fetchBrand = useServerFn(getMyAssociationBrand);
  const { data: member } = useServerData<MyMember | null>(
    () => fetchMember(),
    null,
    user?.id ? `vba_my_member_${user.id}` : undefined,
    [user?.id],
  );
  const { data: brand } = useServerData<MyAssociationBrand | null>(() => fetchBrand(), null, "vba_brand");
  const fetchIdentity = useServerFn(getMyIdentityPassFn);
  const { data: identity } = useServerData<MyIdentityPass | null>(() => fetchIdentity(), null, "vba_identity_pass");
  const { data: benefits, reload: reloadBenefits } = useServerData<MemberBenefit[]>(
    () => fetchBenefits(),
    [],
    "vba_benefits",
  );
  const { data: activeAssocId } = useServerData<string | null>(() => fetchAssocId(), null, "vba_active_assoc_id");

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

  // Auto-refresh benefits when the active association changes, or when an admin
  // updates the benefits list — but only when the update targets the association
  // currently active for me (events carry an associationId in their detail).
  useEffect(() => {
    const onBenefitsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ associationId?: string | null }>).detail;
      const targetId = detail?.associationId ?? null;
      // No key on the event → reload to stay safe; otherwise match my active one.
      if (!targetId || !activeAssocId || targetId === activeAssocId) reloadBenefits();
    };
    const onAssocChange = () => reloadBenefits();
    window.addEventListener("association-changed", onAssocChange);
    window.addEventListener("benefits-updated", onBenefitsUpdated);
    return () => {
      window.removeEventListener("association-changed", onAssocChange);
      window.removeEventListener("benefits-updated", onBenefitsUpdated);
    };
  }, [reloadBenefits, activeAssocId]);

  // Refetch benefits when the PWA returns to the foreground so data stays fresh.
  useEffect(() => {
    const onForeground = () => {
      if (document.visibilityState === "visible") reloadBenefits();
    };
    document.addEventListener("visibilitychange", onForeground);
    window.addEventListener("focus", onForeground);
    return () => {
      document.removeEventListener("visibilitychange", onForeground);
      window.removeEventListener("focus", onForeground);
    };
  }, [reloadBenefits]);

  // Offline support: keep the latest fetched benefits in localStorage per
  // association, and re-sync as soon as the network comes back online.
  const cacheKey = `member-benefits:${activeAssocId ?? "default"}`;
  const [cachedBenefits, setCachedBenefits] = useState<MemberBenefit[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) setCachedBenefits(JSON.parse(raw));
    } catch {
      /* ignore corrupt cache */
    }
  }, [cacheKey]);

  useEffect(() => {
    if (benefits && benefits.length > 0) {
      setCachedBenefits(benefits);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(benefits));
      } catch {
        /* ignore quota errors */
      }
    }
  }, [benefits, cacheKey]);

  useEffect(() => {
    const onOnline = () => reloadBenefits();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [reloadBenefits]);

  // Show live data when available, otherwise fall back to the cached copy.
  const displayBenefits = benefits && benefits.length > 0 ? benefits : cachedBenefits;
  const { data: settings, reload: reloadSettings } = useServerData<CardSettings | null>(
    () => fetchSettings(),
    null,
    user?.id ? `vba_card_settings_${user.id}` : undefined,
    [user?.id],
  );

  const [qrOpen, setQrOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [memberQrModalOpen, setMemberQrModalOpen] = useState(false);
  const [nfcBusy, setNfcBusy] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persisted per-user theme preference (client-only).
  useEffect(() => {
    try {
      setThemeId(localStorage.getItem(THEME_KEY));
    } catch {
      /* ignore */
    }
  }, []);
  function pickTheme(id: string) {
    setThemeId(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      /* ignore */
    }
    setThemeOpen(false);
  }

  // Offline awareness + last successful data sync timestamp.
  useEffect(() => {
    if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    if (effectiveMember) setLastSync(Date.now());
  }, [effectiveMember]);

  const [customProfile, setCustomProfile] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
    } catch {
      return null;
    }
  });
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vba_member_avatar_photo");
  });
  const [coverPhoto, setCoverPhoto] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("vba_member_cover_photo");
  });
  const [coverError, setCoverError] = useState(false);

  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    const serverLogo = (settings as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo;
    if (serverLogo && !isBlackBackgroundLogo(serverLogo)) return serverLogo;
    if (typeof window === "undefined") return "/ceo1983-official-logo.png";
    try {
      const direct = localStorage.getItem("vba_member_company_logo");
      if (direct && !isBlackBackgroundLogo(direct)) return direct;
      if (direct && isBlackBackgroundLogo(direct)) {
        localStorage.removeItem("vba_member_company_logo");
      }
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
      if (cp?.companyLogo && !isBlackBackgroundLogo(cp.companyLogo)) return cp.companyLogo;
    } catch {}
    return "/ceo1983-official-logo.png";
  });

  useEffect(() => {
    if (effectiveMember?.coverUrl || (effectiveMember as any)?.cover_url) {
      setCoverPhoto(effectiveMember?.coverUrl || (effectiveMember as any)?.cover_url);
    }
    const serverLogo = (settings as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogoUrl || (effectiveMember as any)?.companyLogo;
    if (serverLogo && !isBlackBackgroundLogo(serverLogo)) {
      setCompanyLogo(serverLogo);
    }
    const serverPhoto = settings?.photoUrl || effectiveMember?.avatar || (effectiveMember as any)?.avatarUrl;
    if (serverPhoto) {
      setCustomAvatar(serverPhoto);
    }
  }, [
    settings?.photoUrl,
    settings?.companyLogoUrl,
    effectiveMember?.avatar,
    (effectiveMember as any)?.avatarUrl,
    effectiveMember?.coverUrl,
    (effectiveMember as any)?.cover_url,
    (effectiveMember as any)?.companyLogoUrl,
    (effectiveMember as any)?.companyLogo,
  ]);

  const [copiedCode, setCopiedCode] = useState(false);

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [cardCaptureOpen, setCardCaptureOpen] = useState(false);
  const [companyProfileModalOpen, setCompanyProfileModalOpen] = useState(false);
  const [edit2PageModalOpen, setEdit2PageModalOpen] = useState(false);
  const [companyProfile2Pages, setCompanyProfile2Pages] = useState<CompanyProfile2PageData>(() => {
    if (typeof window === "undefined") return DEFAULT_COMPANY_PROFILE;
    try {
      const raw = localStorage.getItem("vba_company_profile_2pages");
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_COMPANY_PROFILE;
  });
  const [contractData, setContractData] = useState(() => {
    if (typeof window === "undefined") {
      return {
        contractNo: "HĐ-CEO1983/2024-VIP08",
        joinedAt: "15/08/2023",
        validUntil: "15/08/2027",
        tier: "Hội viên Doanh nghiệp VIP",
        status: "Đang hiệu lực",
      };
    }
    try {
      const raw = localStorage.getItem("vba_member_contract_data");
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      contractNo: "HĐ-CEO1983/2024-VIP08",
      joinedAt: "15/08/2023",
      validUntil: "15/08/2027",
      tier: "Hội viên Doanh nghiệp VIP",
      status: "Đang hiệu lực",
    };
  });
  const [cardPrivacy, setCardPrivacy] = useState(() => {
    if (typeof window === "undefined") {
      return {
        showPhone: true,
        showEmail: true,
        showContract: true,
        showAddress: true,
        showProducts: true,
      };
    }
    try {
      const raw = localStorage.getItem("vba_member_privacy_settings");
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      showPhone: true,
      showEmail: true,
      showContract: true,
      showAddress: true,
      showProducts: true,
    };
  });

  useEffect(() => {
    const handleProfileUpdate = (e?: any) => {
      try {
        setCustomProfile(JSON.parse(localStorage.getItem("vba_custom_profile") || "null"));
        setCustomAvatar(localStorage.getItem("vba_member_avatar_photo"));
        const logo = e?.detail?.companyLogo || localStorage.getItem("vba_member_company_logo");
        if (logo) setCompanyLogo(logo);
      } catch {}
    };
    const handleSyncContractAndPrivacy = () => {
      try {
        const rawContract = localStorage.getItem("vba_member_contract_data");
        if (rawContract) setContractData(JSON.parse(rawContract));
        const rawPrivacy = localStorage.getItem("vba_member_privacy_settings");
        if (rawPrivacy) setCardPrivacy(JSON.parse(rawPrivacy));
      } catch {}
    };
    const handleCoverUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setCoverPhoto(detailUrl);
        } else {
          setCoverPhoto(localStorage.getItem("vba_member_cover_photo"));
        }
      } catch {}
    };
    const handleLogoUpdate = (e?: any) => {
      try {
        const detailUrl = e?.detail;
        if (detailUrl && typeof detailUrl === "string") {
          setCompanyLogo(detailUrl);
        } else {
          setCompanyLogo(localStorage.getItem("vba_member_company_logo"));
        }
      } catch {}
    };
    const handle2PageProfileUpdate = (e?: any) => {
      try {
        const raw = localStorage.getItem("vba_company_profile_2pages");
        if (raw) setCompanyProfile2Pages(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_profile_updated", handleProfileUpdate);
    window.addEventListener("avatar-updated", handleProfileUpdate);
    window.addEventListener("vba_member_avatar_updated", handleProfileUpdate);
    window.addEventListener("contract-updated", handleSyncContractAndPrivacy);
    window.addEventListener("privacy-updated", handleSyncContractAndPrivacy);
    window.addEventListener("vba_member_cover_updated", handleCoverUpdate);
    window.addEventListener("vba_member_company_logo_updated", handleLogoUpdate);
    window.addEventListener("vba_company_profile_2pages_updated", handle2PageProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_profile_updated", handleProfileUpdate);
      window.removeEventListener("avatar-updated", handleProfileUpdate);
      window.removeEventListener("vba_member_avatar_updated", handleProfileUpdate);
      window.removeEventListener("contract-updated", handleSyncContractAndPrivacy);
      window.removeEventListener("privacy-updated", handleSyncContractAndPrivacy);
      window.removeEventListener("vba_member_cover_updated", handleCoverUpdate);
      window.removeEventListener("vba_member_company_logo_updated", handleLogoUpdate);
      window.removeEventListener("vba_company_profile_2pages_updated", handle2PageProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = effectiveMember?.code || currentMemberCode;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(lang === "en" ? "Member code copied!" : "Đã sao chép mã hội viên!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const d = resolveDisplay(effectiveMember, settings, customProfile, customAvatar, user);
  const vcard = buildVCard(effectiveMember, d);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const currentMemberCode =
    effectiveMember?.code ||
    (typeof window !== "undefined"
      ? (() => {
          try {
            const m = JSON.parse(localStorage.getItem(user?.id ? `vba_my_member_${user.id}` : "vba_my_member") || "null");
            return m?.code || null;
          } catch {
            return null;
          }
        })()
      : null) ||
    "M1983-292";

  // URL danh thiếp số công khai - khi quét từ bất kỳ ứng dụng nào (Zalo, Camera iOS/Android) đều mở ra hồ sơ hội viên
  const resolvedCardCode = effectiveMember?.code || currentMemberCode || "M1983-001";
  const qrValue = `${origin}/card/${encodeURIComponent(resolvedCardCode)}`;

  const theme: CardTheme = resolveTheme(themeId, brand?.brandPrimary ?? null);
  const state = resolveState(effectiveMember?.status, effectiveMember?.validUntil ?? null);
  const stateStyle = STATE_STYLES[state];
  const pass = effectiveMember
    ? buildMembershipPass({
        memberCode: effectiveMember.code,
        memberName: d.name || effectiveMember.name,
        organization: d.company || effectiveMember.title,
        associationName: brand?.name ?? null,
        associationLogoUrl: brand?.logoUrl ?? null,
        membershipLevel: effectiveMember.type === "company" ? "Doanh nghiệp" : "Cá nhân",
        state,
        issuedAt: effectiveMember.joinedAt,
        expiresAt: effectiveMember.validUntil,
        themeId: theme.id,
        brandPrimary: brand?.brandPrimary ?? null,
        origin,
        photoUrl: d.photo,
      })
    : null;
  const wallets = walletCapabilities();

  const actions = [
    { label: t("m.card.actionBenefits"), icon: Heart, to: "/association/perks" as const },
    { label: t("m.card.actionHistory"), icon: ReceiptText, to: "/association/history" as const },
    { label: t("m.card.actionRenew"), icon: CalendarPlus, to: "/association/renew" as const },
  ];

  async function shareNfc() {
    if (!effectiveMember) return;
    if (typeof window === "undefined") {
      toast.error(t("m.card.nfcNotSupported"));
      return;
    }
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      Boolean(
        (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor,
      );
    if (!window.isSecureContext && !isLocal) {
      toast.error("Ghi NFC yêu cầu kết nối HTTPS bảo mật hoặc ứng dụng di động CEO 1983.");
      return;
    }
    const NDEFReader = (window as any).NDEFReader;
    if (!NDEFReader || typeof NDEFReader !== "function") {
      toast.error("Trình duyệt chưa hỗ trợ Web NFC. Vui lòng mở bằng Google Chrome trên Android.");
      return;
    }
    try {
      setNfcBusy(true);
      toast.info("Đang chờ chạm thẻ... Hãy áp thẻ NFC vào giữa mặt lưng điện thoại.");

      const ndef = new NDEFReader();
      await ndef.write({
        records: [
          { recordType: "url", data: `${window.location.origin}/card/${effectiveMember.code}` },
          { recordType: "text", data: vcard },
        ],
      });
      toast.success(t("m.card.nfcWriteSuccess"));
    } catch (e: any) {
      if (e?.name === "NotAllowedError" || e?.message?.includes("not allowed")) {
        toast.error("Quyền ghi NFC bị từ chối trong trình duyệt.");
      } else {
        toast.error(
          e instanceof Error
            ? t("m.card.nfcWriteError", { msg: e.message })
            : t("m.card.nfcWriteErrorGeneric"),
        );
      }
    } finally {
      setNfcBusy(false);
    }
  }

  const [copiedLink, setCopiedLink] = useState(false);
  const handleCopyLink = async () => {
    if (!effectiveMember) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/card/${effectiveMember.code}` : "";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết danh thiếp hội viên!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareProfile = async () => {
    if (!effectiveMember) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/card/${effectiveMember.code}` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ Hội viên CEO 1983 - ${d.name || effectiveMember.name}`,
          text: `Danh thiếp & Hồ sơ Doanh nhân ${d.name || effectiveMember.name} - ${d.company || effectiveMember.title}`,
          url,
        });
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết danh thiếp & hồ sơ!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const handleUploadCompanyProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Dung lượng tệp hồ sơ không được vượt quá 25MB");
      return;
    }

    setUploadingProfile(true);
    const toastId = toast.loading(`Đang tải lên hồ sơ "${file.name}"...`);

    try {
      const uploadedUrl = await uploadFileToNest(file, file.name);
      if (!uploadedUrl) {
        throw new Error("Không nhận được phản hồi tải tệp từ máy chủ");
      }

      // Update customProfile in state and localStorage
      const updatedProfile = {
        ...(customProfile || {}),
        companyProfileUrl: uploadedUrl,
        companyProfileName: file.name,
      };
      setCustomProfile(updatedProfile);

      try {
        localStorage.setItem("vba_custom_profile", JSON.stringify(updatedProfile));
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        mem.companyProfileUrl = uploadedUrl;
        mem.brochureUrl = uploadedUrl;
        localStorage.setItem("vba_my_member", JSON.stringify(mem));
      } catch {}

      // Dispatch event to sync with other components
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: updatedProfile }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: updatedProfile }));

      // Call server API to persist
      await fetchNestApi("/members/me", {
        method: "PATCH",
        body: JSON.stringify({ companyProfileUrl: uploadedUrl }),
      }).catch(() => null);

      toast.success("Đã tải lên Profile doanh nghiệp thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải lên Profile doanh nghiệp", { id: toastId });
    } finally {
      setUploadingProfile(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDownloadCompanyProfile = () => {
    const customUrl =
      customProfile?.companyProfileUrl ||
      (effectiveMember as any)?.companyProfileUrl ||
      (effectiveMember as any)?.brochureUrl ||
      (effectiveMember as any)?.companyProfile;
    if (customUrl) {
      window.open(customUrl, "_blank");
      toast.success("Đang mở tải Profile doanh nghiệp chính thức!");
    } else {
      setCompanyProfileModalOpen(true);
    }
  };

  return (
    <div className="vba-animate min-h-full pb-36">
      <MemberHeader title={t("m.card.headerTitle")} back />

      <div className="px-4 pt-4">
        {/* Visit Card CEO 1983 (100% thay thế hoàn toàn thẻ cứng theo yêu cầu) */}
        <div id="tour-card-visit" className="mb-4">
          <Ceo1983BusinessCardVisit
            name={d.name || "NGUYỄN VĂN A"}
            title={customProfile?.title || (effectiveMember as any)?.position || (effectiveMember as any)?.title || "Director"}
            phone={customProfile?.phone || effectiveMember?.phone || "036xxxxxxx"}
            email={customProfile?.email || effectiveMember?.email || "username@gmail.com"}
            company={d.company || "CÂU LẠC BỘ CEO1983"}
            companyLogoUrl={companyLogo}
            website="https://ceo1983club.com"
            clubEmail="info@ceo1983club.com"
            cardCode={currentMemberCode}
            qrValue={`${origin}/card/${currentMemberCode}`}
            avatarUrl={d.photo}
            showActions={false}
          />
        </div>

        {/* Thời gian hiệu lực thẻ hội viên (thay thế Đã đồng bộ theo Req 7) */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-400">
          <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
          <span>
            Thời gian hiệu lực:{" "}
            <strong className="text-slate-900 dark:text-white font-bold">
              {contractData.validUntil || (effectiveMember as any)?.validUntil || "15/08/2027"}
            </strong>
          </span>
        </div>

        {/* Nút thao tác dưới thẻ hội viên */}
        <div className="mt-3.5 space-y-2">
          {/* Cặp nút Hành động chính: Quét QR & Chụp danh thiếp nằm cạnh nhau */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              id="tour-card-qr-scan"
              type="button"
              onClick={() => setScanModalOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002B70] border border-amber-400/40 px-4 text-[13px] font-bold text-white shadow-md shadow-[#003B95]/25 hover:opacity-95 transition cursor-pointer"
            >
              <ScanLine className="h-4.5 w-4.5 text-white" />
              <span>Quét QR</span>
            </button>
            <button
              id="tour-card-capture"
              type="button"
              onClick={() => setCardCaptureOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition cursor-pointer"
            >
              <Camera className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
              <span>Chụp danh thiếp</span>
            </button>
          </div>

          {/* 3 nút tiện ích: Chỉnh sửa, Chia sẻ, Sao chép (Bỏ NFC per Req 5) */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              id="tour-card-edit-action"
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shadow-xs"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              <span>Sửa thẻ</span>
            </button>
            <button
              type="button"
              onClick={handleShareProfile}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              <span>Chia sẻ</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
              <span>{copiedLink ? "Đã chép" : "Sao chép"}</span>
            </button>
          </div>

          {/* Hidden input for uploading company profile file */}
          <input
            ref={profileFileInputRef}
            type="file"
            accept=".pdf,image/*,.doc,.docx"
            className="hidden"
            onChange={handleUploadCompanyProfile}
          />

          {/* Nút text ngắn Tải Profile per user request: "còn nút tải profile thì làm text ngắn xong bấm vào thôi" */}
          <div className="flex items-center justify-between px-1.5 py-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Hồ sơ năng lực doanh nghiệp:
            </span>
            <button
              type="button"
              onClick={() => profileFileInputRef.current?.click()}
              disabled={uploadingProfile}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B95] dark:text-amber-400 hover:underline cursor-pointer active:scale-95 transition"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>{uploadingProfile ? "Đang tải lên..." : "Tải profile"}</span>
            </button>
          </div>
        </div>

        {/* ── BẢO MẬT & QUYỀN RIÊNG TƯ: CÔNG TẮC BẬT/TẮT ẨN HIỆN SĐT & EMAIL (Ý KIẾN CUỘC HỌP) ── */}
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Quyền riêng tư thẻ hội viên
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Ẩn / Hiện khi quét QR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Toggle SĐT */}
            <button
              type="button"
              onClick={() => {
                const updated = { ...cardPrivacy, showPhone: !cardPrivacy.showPhone };
                setCardPrivacy(updated);
                try {
                  localStorage.setItem("vba_member_privacy_settings", JSON.stringify(updated));
                  window.dispatchEvent(new CustomEvent("privacy-updated"));
                } catch {}
                toast.success(updated.showPhone ? "Đã BẬT hiển thị SĐT trên thẻ hội viên" : "Đã ẨN SĐT trên thẻ hội viên");
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                cardPrivacy.showPhone
                  ? "bg-white dark:bg-slate-800 border-emerald-400/60 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 opacity-80"
              }`}
            >
              <div className="flex items-center gap-1.5 text-left">
                <Phone className={`h-3.5 w-3.5 ${cardPrivacy.showPhone ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Số ĐT</span>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                cardPrivacy.showPhone ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {cardPrivacy.showPhone ? "Hiện" : "Ẩn"}
              </span>
            </button>

            {/* Toggle Email */}
            <button
              type="button"
              onClick={() => {
                const updated = { ...cardPrivacy, showEmail: !cardPrivacy.showEmail };
                setCardPrivacy(updated);
                try {
                  localStorage.setItem("vba_member_privacy_settings", JSON.stringify(updated));
                  window.dispatchEvent(new CustomEvent("privacy-updated"));
                } catch {}
                toast.success(updated.showEmail ? "Đã BẬT hiển thị Email trên thẻ hội viên" : "Đã ẨN Email trên thẻ hội viên");
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                cardPrivacy.showEmail
                  ? "bg-white dark:bg-slate-800 border-emerald-400/60 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 opacity-80"
              }`}
            >
              <div className="flex items-center gap-1.5 text-left">
                <Mail className={`h-3.5 w-3.5 ${cardPrivacy.showEmail ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Email</span>
              </div>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                cardPrivacy.showEmail ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {cardPrivacy.showEmail ? "Hiện" : "Ẩn"}
              </span>
            </button>
          </div>
        </div>

        {/* ── HỒ SƠ HỘI VIÊN & DOANH NGHIỆP (PROFILE) ── */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-[#003B95] dark:text-blue-400 border border-blue-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white">
                  Hồ sơ Doanh nghiệp & Cá nhân
                </h3>
                <p className="text-[11px] text-slate-500">{d.company}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
            >
              <span>{effectiveMember?.code || currentMemberCode}</span>
              {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
            </button>
          </div>

          <div className="mt-3 space-y-2 text-[12.5px]">
            {/* Tách riêng hàng Hội viên và hàng Chức vụ */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Hội viên:</span>
              <span className="font-bold text-slate-900 dark:text-white">{d.name || effectiveMember?.name || "Hội viên CEO 1983"}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Chức vụ:</span>
              <span className="font-bold text-[#003B95] dark:text-blue-400">{customProfile?.title || effectiveMember?.title || (effectiveMember as any)?.position || "Doanh nhân CEO 1983"}</span>
            </div>

            {/* Hàng SĐT có toggle ẩn/hiện */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> SĐT / Hotline:
              </span>
              {cardPrivacy.showPhone ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {customProfile?.phone || effectiveMember?.phone || (user as any)?.phone || "Chưa cập nhật"}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                  <Lock className="h-3 w-3 text-amber-500" /> Ẩn theo cài đặt riêng tư
                </span>
              )}
            </div>

            {/* Hàng Email có toggle ẩn/hiện */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> Email:
              </span>
              {cardPrivacy.showEmail ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {customProfile?.email || effectiveMember?.email || (user as any)?.email || "Chưa cập nhật"}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                  <Lock className="h-3 w-3 text-amber-500" /> Ẩn theo cài đặt riêng tư
                </span>
              )}
            </div>

            {(customProfile?.industry || effectiveMember?.industry) && (
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> Lĩnh vực:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{customProfile?.industry || effectiveMember?.industry}</span>
              </div>
            )}

            {(customProfile?.industryDetail || (effectiveMember as any)?.industryDetail) && (
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> Chuyên ngành:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{customProfile?.industryDetail || (effectiveMember as any)?.industryDetail}</span>
              </div>
            )}

            {(customProfile?.companySize || (effectiveMember as any)?.companySize) && (
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> Quy mô:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{customProfile?.companySize || (effectiveMember as any)?.companySize}</span>
              </div>
            )}

            {cardPrivacy.showProducts && (customProfile?.featuredProducts || (effectiveMember as any)?.featuredProducts) && (
              <div className="pt-2 border-b border-slate-50 dark:border-slate-850 pb-2">
                <div className="font-semibold text-slate-500 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Sản phẩm / dịch vụ chủ lực:
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 text-slate-700 dark:text-slate-300">
                  {customProfile?.featuredProducts || (effectiveMember as any)?.featuredProducts}
                </div>
              </div>
            )}

            {cardPrivacy.showAddress && (customProfile?.address || effectiveMember?.address) && (
              <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50 dark:border-slate-850">
                <span className="font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" /> Địa chỉ:
                </span>
                <span className="text-right text-slate-800 dark:text-slate-200 text-[12px]">{customProfile?.address || effectiveMember?.address}</span>
              </div>
            )}

            {(customProfile?.website || effectiveMember?.website) && (
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400" /> Website:
                </span>
                <a
                  href={(customProfile?.website || effectiveMember?.website).startsWith("http") ? (customProfile?.website || effectiveMember?.website) : `https://${customProfile?.website || effectiveMember?.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{customProfile?.website || effectiveMember?.website}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Social Links & Share */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Kết nối:</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2 py-1 text-[11px] font-semibold text-[#1877F2]"
              >
                <Facebook className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </a>
              <a
                href={`https://zalo.me/${(customProfile?.phone || member?.phone || "0901000002").replace(/\s+/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 px-2 py-1 text-[11px] font-bold text-[#0068FF]"
              >
                <span>Zalo</span>
              </a>
            </div>
            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Đã chép link" : "Chia sẻ hồ sơ"}</span>
            </button>
          </div>
        </div>

        {/* ── PROFILE DOANH NGHIỆP 2 TRANG HIỆN NGAY BÊN DƯỚI CÁC TRƯỜNG THEO YÊU CẦU ── */}
        <div id="company-profile-2pages-section" className="mt-4">
          <CompanyProfileTwoPages
            data={{
              ...companyProfile2Pages,
              companyName:
                companyProfile2Pages.companyName && companyProfile2Pages.companyName !== DEFAULT_COMPANY_PROFILE.companyName
                  ? companyProfile2Pages.companyName
                  : d.company || (effectiveMember as any)?.company || (effectiveMember as any)?.companyName || DEFAULT_COMPANY_PROFILE.companyName,
              logoUrl: companyProfile2Pages.logoUrl || companyLogo,
              leaderName:
                companyProfile2Pages.leaderName && companyProfile2Pages.leaderName !== DEFAULT_COMPANY_PROFILE.leaderName
                  ? companyProfile2Pages.leaderName
                  : d.name || effectiveMember?.name || DEFAULT_COMPANY_PROFILE.leaderName,
              leaderTitle:
                companyProfile2Pages.leaderTitle && companyProfile2Pages.leaderTitle !== DEFAULT_COMPANY_PROFILE.leaderTitle
                  ? companyProfile2Pages.leaderTitle
                  : customProfile?.title || (effectiveMember as any)?.position || effectiveMember?.title || DEFAULT_COMPANY_PROFILE.leaderTitle,
              memberCode: currentMemberCode,
              hotline: companyProfile2Pages.hotline || customProfile?.phone || effectiveMember?.phone || DEFAULT_COMPANY_PROFILE.hotline,
              email: companyProfile2Pages.email || customProfile?.email || effectiveMember?.email || DEFAULT_COMPANY_PROFILE.email,
              officeAddress: companyProfile2Pages.officeAddress || customProfile?.address || effectiveMember?.address || DEFAULT_COMPANY_PROFILE.officeAddress,
              website: companyProfile2Pages.website || customProfile?.website || effectiveMember?.website || DEFAULT_COMPANY_PROFILE.website,
              taxCode: companyProfile2Pages.taxCode || customProfile?.taxCode || DEFAULT_COMPANY_PROFILE.taxCode,
              companyProfileUrl:
                customProfile?.companyProfileUrl ||
                (effectiveMember as any)?.companyProfileUrl ||
                (effectiveMember as any)?.brochureUrl ||
                companyProfile2Pages.companyProfileUrl,
              companyProfileName:
                customProfile?.companyProfileName ||
                companyProfile2Pages.companyProfileName,
            }}
            canEdit={true}
            onEdit={() => setEdit2PageModalOpen(true)}
            onUploadFile={() => profileFileInputRef.current?.click()}
            onRemoveUploadedFile={() => {
              const updated = {
                ...customProfile,
                companyProfileUrl: null,
                companyProfileName: null,
              };
              setCustomProfile(updated);
              try {
                localStorage.setItem("vba_custom_profile", JSON.stringify(updated));
                const p2 = { ...companyProfile2Pages, companyProfileUrl: null, companyProfileName: null };
                localStorage.setItem("vba_company_profile_2pages", JSON.stringify(p2));
                setCompanyProfile2Pages(p2);
              } catch {}
              toast.success("Đã chuyển về mẫu hồ sơ số hóa 2 trang!");
            }}
          />
        </div>

        {/* Modal chỉnh sửa Profile 2 trang */}
        <CompanyProfileEditModal
          open={edit2PageModalOpen}
          onClose={() => setEdit2PageModalOpen(false)}
          initialData={{
            ...companyProfile2Pages,
            companyName:
              companyProfile2Pages.companyName && companyProfile2Pages.companyName !== DEFAULT_COMPANY_PROFILE.companyName
                ? companyProfile2Pages.companyName
                : d.company || (effectiveMember as any)?.company || (effectiveMember as any)?.companyName || DEFAULT_COMPANY_PROFILE.companyName,
            logoUrl: companyProfile2Pages.logoUrl || companyLogo,
            leaderName:
              companyProfile2Pages.leaderName && companyProfile2Pages.leaderName !== DEFAULT_COMPANY_PROFILE.leaderName
                ? companyProfile2Pages.leaderName
                : d.name || effectiveMember?.name || DEFAULT_COMPANY_PROFILE.leaderName,
            leaderTitle:
              companyProfile2Pages.leaderTitle && companyProfile2Pages.leaderTitle !== DEFAULT_COMPANY_PROFILE.leaderTitle
                ? companyProfile2Pages.leaderTitle
                : customProfile?.title || (effectiveMember as any)?.position || effectiveMember?.title || DEFAULT_COMPANY_PROFILE.leaderTitle,
            memberCode: currentMemberCode,
            hotline: companyProfile2Pages.hotline || customProfile?.phone || effectiveMember?.phone || DEFAULT_COMPANY_PROFILE.hotline,
            email: companyProfile2Pages.email || customProfile?.email || effectiveMember?.email || DEFAULT_COMPANY_PROFILE.email,
            officeAddress: companyProfile2Pages.officeAddress || customProfile?.address || effectiveMember?.address || DEFAULT_COMPANY_PROFILE.officeAddress,
            website: companyProfile2Pages.website || customProfile?.website || effectiveMember?.website || DEFAULT_COMPANY_PROFILE.website,
            taxCode: companyProfile2Pages.taxCode || customProfile?.taxCode || DEFAULT_COMPANY_PROFILE.taxCode,
            companyProfileUrl:
              customProfile?.companyProfileUrl ||
              (effectiveMember as any)?.companyProfileUrl ||
              companyProfile2Pages.companyProfileUrl,
            companyProfileName:
              customProfile?.companyProfileName ||
              companyProfile2Pages.companyProfileName,
          }}
          onSaved={(newData) => {
            setCompanyProfile2Pages(newData);
          }}
        />

        {/* Association QR Scan Modal (Req 8) */}
        <AssociationQrScanModal
          open={scanModalOpen}
          onClose={() => setScanModalOpen(false)}
        />

        {/* Association Business Card Capture & Contact Save Modal */}
        <AssociationCardCaptureModal
          open={cardCaptureOpen}
          onClose={() => setCardCaptureOpen(false)}
        />

        {/* Modal Tải Template Profile Doanh Nghiệp 3D nếu chưa có file riêng (Req 5) */}
        <CompanyProfileTemplateModal
          open={companyProfileModalOpen}
          onClose={() => setCompanyProfileModalOpen(false)}
          data={{
            companyName: d.company || (effectiveMember as any)?.company || (effectiveMember as any)?.companyName || "CLB Doanh Nhân CEO 1983",
            leaderName: d.name || effectiveMember?.name || "Hội viên CEO 1983",
            leaderTitle: customProfile?.title || effectiveMember?.title || "Chủ tịch / Tổng Giám đốc",
            memberCode: currentMemberCode,
            industry: customProfile?.industry || effectiveMember?.industry || "Thương mại & Dịch vụ Đa ngành",
            industryDetail: customProfile?.industryDetail || (effectiveMember as any)?.industryDetail,
            companySize: customProfile?.companySize || (effectiveMember as any)?.companySize,
            phone: customProfile?.phone || effectiveMember?.phone || undefined,
            email: customProfile?.email || effectiveMember?.email || undefined,
            address: customProfile?.address || effectiveMember?.address || undefined,
            website: customProfile?.website || effectiveMember?.website || undefined,
            avatarUrl: d.photo || effectiveMember?.avatar || (effectiveMember as any)?.avatarUrl || null,
            logoUrl: companyLogo,
            coverUrl: (effectiveMember as any)?.coverUrl || (effectiveMember as any)?.coverPhoto || null,
            featuredProducts: customProfile?.featuredProducts || (effectiveMember as any)?.featuredProducts,
            companyProfileUrl: customProfile?.companyProfileUrl || (effectiveMember as any)?.companyProfileUrl || (effectiveMember as any)?.brochureUrl,
          }}
          onDownloadCustomProfile={handleDownloadCompanyProfile}
        />
      </div>

      {/* Full-screen QR modal - rendered via Portal directly into document.body to ensure 100% viewport centering */}
      {qrOpen && member && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          style={{ minHeight: "100dvh" }}
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative mx-auto w-full max-w-[320px] rounded-3xl border border-slate-700/60 bg-slate-900/95 p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrOpen(false)}
              className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-300 hover:text-white transition"
              aria-label={t("m.card.closeAriaLabel")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 text-[13px] font-bold text-blue-400">
              {t("m.card.qrScanPrompt")}
            </div>
            <div className="mx-auto w-fit rounded-2xl bg-white p-3.5 shadow-lg">
              <QrCanvas value={qrValue} size={220} />
            </div>
            {d.showName && (
              <div className="mt-4 text-[15px] font-bold text-white">{d.name}</div>
            )}
            <div className="text-[13px] font-semibold text-blue-400">{member.code}</div>
            {identity?.hasPass && (
              <div className="mt-3 space-y-1 border-t border-slate-700/60 pt-3 text-[11px] text-slate-300">
                <div>
                  Serial:{" "}
                  <span className="font-semibold text-white">{identity.serial}</span>
                </div>
                <div>
                  {lang === "en" ? "Status" : "Trạng thái"}:{" "}
                  <span className="font-semibold text-emerald-400">
                    {identity.effectiveStatus}
                  </span>
                  {" · v"}
                  {identity.cardVersion}
                </div>
                {identity.expiresAt && (
                  <div>
                    {lang === "en" ? "Valid until" : "Hiệu lực đến"}:{" "}
                    <span className="font-semibold text-white">
                      {new Date(identity.expiresAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {identity.qrToken && (
                  <div className="text-[10px] text-slate-400">
                    {lang === "en"
                      ? "Signed QR · refreshes each open"
                      : "QR ký số · làm mới mỗi lần mở"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Edit display modal */}
      {editOpen && (effectiveMember || member) && (
        <EditCardModal
          member={(effectiveMember || member)!}
          current={d}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            try {
              const fresh = JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
              setCustomProfile(fresh);
              const freshAvatar = localStorage.getItem("vba_member_avatar_photo");
              setCustomAvatar(freshAvatar);
              if (fresh) {
                setDirectMember((prev: any) => ({
                  ...(prev || {}),
                  ...fresh,
                  name: fresh.name,
                  company: fresh.company,
                  companyName: fresh.company,
                  title: fresh.title,
                  phone: fresh.phone,
                  email: fresh.email,
                  avatar: freshAvatar || fresh.avatar || prev?.avatar,
                }));
              }
            } catch {}
            reloadSettings();
          }}
        />
      )}

      {/* ── MODAL MÃ QR HỘI VIÊN & QUÉT QR (DUAL TAB) ── */}
      <AssociationMemberQrModal
        open={memberQrModalOpen}
        onClose={() => setMemberQrModalOpen(false)}
        memberCode={currentMemberCode}
        memberName={d.name || "Hội viên CEO 1983"}
        memberTitle={customProfile?.title || member?.title || "Ban Quản Trị"}
        memberCompany={d.company || "CLB Doanh Nhân CEO 1983"}
        memberAvatar={d.photo || null}
      />

      {/* ── MODAL BẢO MẬT & QUYỀN RIÊNG TƯ HIỂN THỊ TRÊN QR / THẺ ── */}
      <PrivacySettingsModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onUpdated={() => {
          reloadSettings();
        }}
      />
    </div>
  );
}

const cardProfileSchema = z.object({
  name: z.string().trim().min(1, "Họ và tên không được phép để trống"),
  phone: z.string().trim().min(1, "Số điện thoại không được phép để trống"),
});

function EditCardModal({
  member,
  current,
  onClose,
  onSaved,
}: {
  member: MyMember;
  current: Display;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const save = useServerFn(saveCardSettings);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarBlobRef = useRef<Blob | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.name || current.name || member.name || "";
    } catch {
      return current.name || member.name || "";
    }
  });
  const [company, setCompany] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.company || current.company || (member as any)?.company || (member as any)?.companyName || member.title || "";
    } catch {
      return current.company || (member as any)?.company || (member as any)?.companyName || member.title || "";
    }
  });
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      const av = localStorage.getItem("vba_member_avatar_photo");
      return av || current.photo || member?.avatar || (member as any)?.avatarUrl || null;
    } catch {
      return current.photo || member?.avatar || (member as any)?.avatarUrl || null;
    }
  });
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    return (member as any)?.companyLogoUrl || (member as any)?.companyLogo || null;
  });
  const [showName, setShowName] = useState(current.showName);
  const [showCompany, setShowCompany] = useState(current.showCompany);
  const [showPhoto, setShowPhoto] = useState(current.showPhoto);

  // Extended Profile Attributes (Req 7)
  const [title, setTitle] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.title || (member as any)?.position || member?.title || "";
    } catch {
      return "";
    }
  });
  const [phone, setPhone] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.phone || member?.phone || "";
    } catch {
      return "";
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.email || member?.email || "";
    } catch {
      return "";
    }
  });
  const [industry, setIndustry] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.industry || member?.industry || "";
    } catch {
      return "";
    }
  });
  const [industryDetail, setIndustryDetail] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.industryDetail || (member as any)?.industryDetail || "";
    } catch {
      return "";
    }
  });
  const [companySize, setCompanySize] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.companySize || (member as any)?.companySize || "";
    } catch {
      return "";
    }
  });
  const [featuredProducts, setFeaturedProducts] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.featuredProducts || (member as any)?.featuredProducts || "";
    } catch {
      return "";
    }
  });
  const [address, setAddress] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.address || member?.address || "";
    } catch {
      return "";
    }
  });
  const [website, setWebsite] = useState(() => {
    try {
      const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
      return cp.website || member?.website || "";
    } catch {
      return "";
    }
  });

  // Privacy toggles (Req 7 - Toggle what other members see when scanning QR)
  const [privacyPhone, setPrivacyPhone] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("vba_member_privacy_settings") || "{}");
      return p.showPhone !== false;
    } catch {
      return true;
    }
  });
  const [privacyEmail, setPrivacyEmail] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("vba_member_privacy_settings") || "{}");
      return p.showEmail !== false;
    } catch {
      return true;
    }
  });
  const [privacyAddress, setPrivacyAddress] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("vba_member_privacy_settings") || "{}");
      return p.showAddress !== false;
    } catch {
      return true;
    }
  });
  const [privacyProducts, setPrivacyProducts] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("vba_member_privacy_settings") || "{}");
      return p.showProducts !== false;
    } catch {
      return true;
    }
  });

  const [busy, setBusy] = useState(false);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl, blob } = await compressImage(file, 400, 400, 0.82);
      setPhoto(dataUrl);
      setShowPhoto(true);
      avatarBlobRef.current = blob;

      uploadFileToNest(blob, file.name || "avatar.jpg")
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            setPhoto(uploadedUrl);
            avatarBlobRef.current = null;
          }
        })
        .catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("m.card.photoLoadError"));
    }
  }

  async function submit() {
    const result = cardProfileSchema.safeParse({ name, phone });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errMap[key]) errMap[key] = issue.message;
      }
      setErrors(errMap);
      return;
    }
    setErrors({});

    setBusy(true);
    try {
      // 1. Upload pending avatar to MinIO to get permanent URLs
      let finalPhoto = photo;
      if (avatarBlobRef.current || (photo && photo.startsWith("data:"))) {
        try {
          const blobToUpload = avatarBlobRef.current || (await (await fetch(photo!)).blob());
          finalPhoto = await uploadFileToNest(blobToUpload, "avatar.jpg");
          avatarBlobRef.current = null;
        } catch (uploadErr) {
          console.warn("Avatar upload notice:", uploadErr);
        }
      }

      const finalLogo = companyLogo;

      // 2. Save directly to Server DB as the Single Source of Truth
      await save({
        data: {
          displayName: name.trim() || null,
          displayCompany: company.trim() || null,
          photoUrl: finalPhoto || null,
          companyLogoUrl: finalLogo || null,
          showName,
          showCompany,
          showPhoto,
          showEmail: privacyEmail,
          showPhone: privacyPhone,
          showAddress: privacyAddress,
        },
      });

      // 3. Sync member profile on backend
      await fetchNestApi("/members/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          avatar: finalPhoto || undefined,
          companyLogo: finalLogo || undefined,
          title: title.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          website: website.trim() || undefined,
        }),
      }).catch(() => null);

      // 4. Update local memory state & dispatch events
      const updatedProfile = {
        name: name.trim() || member.name,
        company: company.trim() || (member as any)?.company || member.title || "",
        title: title.trim(),
        phone: phone.trim(),
        email: email.trim(),
        industry: industry.trim(),
        industryDetail: industryDetail.trim(),
        companySize: companySize.trim(),
        featuredProducts: featuredProducts.trim(),
        address: address.trim(),
        website: website.trim(),
        avatar: finalPhoto || undefined,
        companyLogo: finalLogo || undefined,
      };

      try {
        localStorage.setItem("vba_custom_profile", JSON.stringify(updatedProfile));
        if (finalPhoto) localStorage.setItem("vba_member_avatar_photo", finalPhoto);
        if (finalLogo) localStorage.setItem("vba_member_company_logo", finalLogo);
      } catch {}

      window.dispatchEvent(new CustomEvent("profile-updated", { detail: updatedProfile }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: updatedProfile }));
      window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: finalPhoto }));
      window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: finalLogo }));
      window.dispatchEvent(new Event("privacy-updated"));
      window.dispatchEvent(new Event("contract-updated"));

      toast.success("Đã cập nhật hồ sơ và đồng bộ lên máy chủ thành công!");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("m.card.saveError"));
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 px-3.5 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 max-h-[90dvh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          aria-label={t("m.card.closeAriaLabel")}
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Pencil className="h-4 w-4 text-amber-500" />
          <span>Chỉnh sửa hồ sơ hội viên</span>
        </h2>

        {/* Photo */}
        <div className="mb-3 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          {photo ? (
            <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-500" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-[16px] font-bold text-amber-500 border border-slate-200 dark:border-slate-700">
              {initials(name || member.name)}
            </span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:border-amber-500 cursor-pointer"
            >
              <ImagePlus className="h-4 w-4 text-amber-500" /> {t("m.card.pickPhoto")}
            </button>
            {photo && (
              <button
                onClick={() => setPhoto(null)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> {t("m.card.deletePhoto")}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickPhoto}
          />
        </div>

        {/* SECTION 1: HỒ SƠ CÁ NHÂN & DOANH NGHIỆP */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 text-[12.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>1. Thông tin Doanh nghiệp & Cá nhân</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Họ và tên hội viên <span className="text-rose-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Nhập họ và tên..."
                className={`${inputCls} ${
                  errors.name ? "border-rose-500 ring-1 ring-rose-500/30 focus:border-rose-500" : ""
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Chức vụ / Vị trí
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Tổng Giám Đốc / Founder"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Công ty / Doanh nghiệp
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nhập tên doanh nghiệp..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Số điện thoại / Hotline <span className="text-rose-500">*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="Nhập số điện thoại..."
                className={`${inputCls} ${
                  errors.phone ? "border-rose-500 ring-1 ring-rose-500/30 focus:border-rose-500" : ""
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Email liên hệ
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Lĩnh vực kinh doanh
              </label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Công nghệ, Xây dựng, F&B..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Chuyên ngành chi tiết
              </label>
              <input
                value={industryDetail}
                onChange={(e) => setIndustryDetail(e.target.value)}
                placeholder="Chuyển đổi số, Phần mềm ERP..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Quy mô nhân sự
              </label>
              <input
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="50 - 200 nhân viên"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Website doanh nghiệp
              </label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.vn"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Sản phẩm / Dịch vụ nổi bật
              </label>
              <textarea
                value={featuredProducts}
                onChange={(e) => setFeaturedProducts(e.target.value)}
                placeholder="Giải pháp phần mềm CRM, Xuất nhập khẩu..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 p-3 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11.5px] font-medium text-slate-600 dark:text-slate-400">
                Địa chỉ doanh nghiệp
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={member.address || "Tầng 5, Tòa nhà CEO..."}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CÀI ĐẶT BẢO MẬT & TOGGLE KHI QUÉT QR (Req 7) */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[12px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            <span>2. Quyền riêng tư (Hiển thị cho hội viên khác khi quét QR)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Bật/tắt các thông tin bạn muốn chia sẻ khi người khác quét mã QR danh thiếp của bạn:
          </p>
          <Toggle label="Hiển thị Số điện thoại / Hotline khi quét QR" checked={privacyPhone} onChange={setPrivacyPhone} />
          <Toggle label="Hiển thị Email liên hệ khi quét QR" checked={privacyEmail} onChange={setPrivacyEmail} />
          <Toggle label="Hiển thị Địa chỉ doanh nghiệp" checked={privacyAddress} onChange={setPrivacyAddress} />
          <Toggle label="Hiển thị Sản phẩm / Dịch vụ chủ lực" checked={privacyProducts} onChange={setPrivacyProducts} />
          <Toggle label={t("m.card.showName")} checked={showName} onChange={setShowName} />
          <Toggle label={t("m.card.showCompany")} checked={showCompany} onChange={setShowCompany} />
          <Toggle label={t("m.card.showPhoto")} checked={showPhoto} onChange={setShowPhoto} />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 text-[14px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
          >
            {t("m.card.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002B70] border border-amber-400/40 hover:opacity-95 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-[#003B95]/30 disabled:opacity-60 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {busy ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer outline-none focus:outline-none"
    >
      <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200 text-left pr-2">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
          checked ? "bg-[#003B95]" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
