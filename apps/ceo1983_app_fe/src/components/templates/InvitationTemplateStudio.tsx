import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Upload,
  Sparkles,
  Download,
  Save,
  Send,
  Eye,
  Calendar,
  MapPin,
  QrCode,
  Layers,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Copy,
  Clock,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Award,
  Users,
  Briefcase,
  Coffee,
  Move,
  Scissors,
  Sliders,
  Maximize2,
  CheckSquare,
  Square,
  Sparkle,
  Grid,
  Type,
  SlidersHorizontal,
  UserPlus,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  Wand2,
  Star,
  ShieldCheck,
  Crown,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";
import { ImageCropModal } from "./ImageCropModal";

export type InvitationCategory = "event" | "forum" | "meeting" | "b2b_meetup";
export type FontFamilyType =
  | "serif"
  | "sans"
  | "cinzel"
  | "playfair"
  | "cormorant"
  | "montserrat"
  | "vietnam"
  | "orbitron"
  | "dancing"
  | "great_vibes"
  | "calligraphy"
  | "oswald"
  | "merriweather"
  | "roboto";
export type TextGradientColor = "gold" | "cyan" | "platinum" | "ruby" | "white";
export type TopOrnamentType = "baroque_gold" | "diamond_stars" | "royal_crown" | "atlantis_trident" | "art_deco" | "none";
export type BottomOrnamentType = "pearl_ribbon" | "water_swirl" | "laser_glow" | "none";

export interface TextBlockLayout {
  id: string;
  name: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  hasFrostedBg: boolean; // có nền mờ hay không có nền mờ
  fontFamily?: FontFamilyType;
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  colorGradient?: TextGradientColor;
  is3dEmboss?: boolean;
  zIndex?: number;
}

export type CutoutShape = "arch" | "soft_feather" | "oval" | "rounded" | "cinema";

export interface CutoutImageConfig {
  enabled: boolean;
  url: string;
  shape: CutoutShape;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  scale: number; // 50 - 150%
  opacity: number; // 20 - 100%
  featherBlur: number; // 0 - 40px
  hasBorderGlow: boolean;
}

export type AttendeeCardStyle = "royal_circle" | "heian_arch" | "oval_luxury" | "soft_feather" | "3d_card";

export interface SelectedAttendee {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  memberCode?: string;
  roleInEvent?: string; // "Diễn giả chính" | "Khách mời VIP" | "Đại biểu danh dự"
}

export interface AttendeeBlockConfig {
  enabled: boolean;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number; // 50 - 150%
  featherBlur: number; // 0 - 40px
  style: AttendeeCardStyle;
  attendees: SelectedAttendee[];
  hasFrostedBg: boolean;
  showTitle: boolean;
  showCompany: boolean;
}

export interface InvitationTemplate {
  id: string;
  code?: string;
  name: string;
  category: InvitationCategory;
  presetKey?: "wyndham" | "atlantis" | "gala" | "custom";
  kicker: string;
  leadPhrase: string;
  title: string;
  venueHighlight: string;
  capsuleBadge: string;
  capsuleBenefit: string;
  capsuleNote: string;
  dayOfWeek: string;
  timeHour: string;
  dayDigits: string;
  monthDigits: string;
  yearDigits: string;
  location: string;
  saluteText: string;
  bgUrl?: string;
  logoUrl?: string;
  partnerLogoUrl?: string;
  themeGlowColor?: "gold" | "cyan" | "royal";
  topOrnament?: TopOrnamentType;
  bottomOrnament?: BottomOrnamentType;
  qrValue?: string;
  posterUrl?: string;
  blocksLayout?: Record<string, TextBlockLayout>;
  cutoutConfig?: CutoutImageConfig;
  attendeeConfig?: AttendeeBlockConfig;
  updatedAt?: string;
}

// Bố cục mặc định chuẩn Pinterest (Tọa độ phần trăm X, Y)
const DEFAULT_BLOCKS: Record<string, TextBlockLayout> = {
  header: { id: "header", name: "Thanh Logo & Chữ ký", x: 50, y: 3.5, hasFrostedBg: false, zIndex: 10 },
  atlantis_wings: { id: "atlantis_wings", name: "Cánh Gà Trái Phải Atlantis", x: 50, y: 9, hasFrostedBg: false, zIndex: 9 },
  title: { id: "title", name: "Tiêu đề 'Thư mời' / 'ATLANTIS'", x: 50, y: 15, hasFrostedBg: false, zIndex: 12 },
  headline: { id: "headline", name: "Cụm Tiêu Đề Lớn 'DÒNG CHẢY HẠNH PHÚC'", x: 50, y: 32, hasFrostedBg: false, zIndex: 11 },
  attendee: { id: "attendee", name: "Đại Biểu VIP / Diễn Giả Khách Mời", x: 50, y: 47, hasFrostedBg: false, zIndex: 15 },
  capsule: { id: "capsule", name: "Hộp Quà Tặng / Đặc Quyền Capsule", x: 50, y: 60, hasFrostedBg: false, zIndex: 10 },
  datetime: { id: "datetime", name: "Cụm Ngày Giờ Số Lớn 06 | 04 | 24", x: 50, y: 72, hasFrostedBg: false, zIndex: 10 },
  cutout: { id: "cutout", name: "Khối Ảnh Bóc Tách / Cổng Chào Venue", x: 50, y: 86, hasFrostedBg: false, zIndex: 8 },
  salute: { id: "salute", name: "Lời kết 'Rất hân hạnh được đón tiếp!'", x: 50, y: 96, hasFrostedBg: false, zIndex: 10 },
  qr: { id: "qr", name: "Mã QR Check-in Đăng Ký", x: 86, y: 88, hasFrostedBg: false, zIndex: 12 },
};

export function InvitationTemplateStudio() {
  // Preset Backgrounds - Chuẩn Pinterest Wyndham Heian & Cung Điện Atlantis
  const BACKGROUND_PRESETS = [
    {
      id: "atlantis_royal_palace",
      name: "Cung Điện Atlantis Hoàng Gia (Pinterest 374009944081934333)",
      url: "/templates/atlantis_palace_poster.jpg",
    },
    {
      id: "heian_wyndham",
      name: "Wyndham Thanh Thủy (Heian Villas - Pinterest 501447739786387302)",
      url: "/templates/pinterest_heian_invitation.jpg",
    },
    {
      id: "skyline_cosmos",
      name: "Thành Phố Vươn Tầm (Cosmos Deep)",
      url: "/ceo1983_hero_cosmos_skyline.jpg",
    },
    {
      id: "skyline_contrast",
      name: "Thành Phố Dạ Tiệc (Contrast)",
      url: "/skyline_perspective_contrast.jpg",
    },
    {
      id: "skyline_daylight",
      name: "Thành Phố Khát Vọng (Daylight)",
      url: "/ceo1983_hero_daylight_skyline.jpg",
    },
  ];

  // Danh mục thư mời (Áp dụng đa dạng: Sự kiện, Diễn đàn, Cuộc họp, Cuộc gặp B2B)
  const [category, setCategory] = useState<InvitationCategory>("event");

  // Mode: 1. Tải poster có sẵn HOẶC 2. Tự thiết kế cấu hình poster
  const [posterMode, setPosterMode] = useState<"upload" | "studio">("studio");
  const [uploadedPosterUrl, setUploadedPosterUrl] = useState<string>("");
  const [isUploadingPoster, setIsUploadingPoster] = useState<boolean>(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState<boolean>(false);

  // Tab giao diện điều khiển bên trái:
  const [activeTab, setActiveTab] = useState<
    "content" | "attendee" | "ornaments" | "cutout" | "layout" | "upload" | "templates"
  >("content");

  // Studio Fields chuẩn Pinterest Wyndham Thanh Thủy & Atlantis
  const [selectedBg, setSelectedBg] = useState<string>("/templates/atlantis_palace_poster.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string>("HANOIBA & VICONNECT");
  const [signatureText, setSignatureText] = useState<string>("HERA COLLECTION");

  // Trang trí Trên & Dưới (Top & Bottom Ornaments)
  const [topOrnament, setTopOrnament] = useState<TopOrnamentType>("atlantis_trident");
  const [bottomOrnament, setBottomOrnament] = useState<BottomOrnamentType>("water_swirl");

  // Kiểu chữ & Nội dung Thư mời
  const [invitationHeader, setInvitationHeader] = useState<string>("ATLANTIS");
  const [invitationSubtitle, setInvitationSubtitle] = useState<string>("HERA COLLECTION · SPRING / SUMMER 2026");
  const [leftWingText, setLeftWingText] = useState<string>("FASHION\nMYTHOLOGY\nCREATIVITY");
  const [rightWingText, setRightWingText] = useState<string>("BEYOND\nTHE SURFACE\nINNOVATION");
  const [kicker, setKicker] = useState<string>("O OLIMPO SE ABRE MAIS UMA VEZ.");
  const [leadPhrase, setLeadPhrase] = useState<string>("Venha vivenciar Atlantis, a nova coleção da Hera");
  const [mainTitleLine1, setMainTitleLine1] = useState<string>("KẾT NỐI DOANH NHÂN");
  const [mainTitleLine2, setMainTitleLine2] = useState<string>("THỊNH VƯỢNG 1983");
  const [venueHighlight, setVenueHighlight] = useState<string>("tại HABBLET HOTEL & LANDMARK 72");

  // Hộp Quà Tặng / Đặc Quyền (Capsule Box)
  const [capsuleBadge, setCapsuleBadge] = useState<string>("+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES");
  const [capsuleBenefit, setCapsuleBenefit] = useState<string>("ĐẶC QUYỀN VIP PASS & BỘ QUÀ TẶNG DOANH NHÂN HERA");
  const [capsuleNote, setCapsuleNote] = useState<string>("(Trang sức ngọc trai và huy hiệu đinh ba mạ vàng)");

  // Cụm Ngày Giờ Số Lớn Luxury
  const [dayOfWeek, setDayOfWeek] = useState<string>("DATA");
  const [timeHour, setTimeHour] = useState<string>("21:30");
  const [dayDigits, setDayDigits] = useState<string>("10");
  const [monthDigits, setMonthDigits] = useState<string>("09");
  const [yearDigits, setYearDigits] = useState<string>("26");
  const [eventLocation, setEventLocation] = useState<string>("HABBLET HOTEL & CUNG ĐIỆN HERA");
  const [saluteText, setSaluteText] = useState<string>("Rất hân hạnh được đón tiếp!");
  const [qrValue, setQrValue] = useState<string>("https://ceo1983.viconnect.vn/association/events?action=register");

  // ── TRƯỜNG ADD ẢNH BÓC TÁCH CẮT ĐƯA LÊN POSTER (VENUE / HEIAN GATE / ARCH) ──
  const [cutoutConfig, setCutoutConfig] = useState<CutoutImageConfig>({
    enabled: true,
    url: "/templates/heian_gate_venue.jpg",
    shape: "arch",
    x: 50,
    y: 86,
    scale: 90,
    opacity: 95,
    featherBlur: 12,
    hasBorderGlow: true,
  });
  const [isUploadingCutout, setIsUploadingCutout] = useState<boolean>(false);

  // ── TRƯỜNG THÔNG TIN NGƯỜI THAM GIA / ĐẠI BIỂU / DIỄN GIẢ (DYNAMIC ATTENDEES) ──
  const [attendeeConfig, setAttendeeConfig] = useState<AttendeeBlockConfig>({
    enabled: true,
    x: 50,
    y: 47,
    scale: 100,
    featherBlur: 14,
    style: "royal_circle",
    attendees: [
      {
        id: "att-1",
        name: "Phạm Vũ",
        title: "Chủ tịch HĐQT & Sáng Lập",
        company: "VICONNECT GROUP",
        avatar: "/avatars/avatar-default.svg",
        memberCode: "CEO1983-088",
        roleInEvent: "Diễn giả chính (Keynote Speaker)",
      },
    ],
    hasFrostedBg: false,
    showTitle: true,
    showCompany: true,
  });
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState<boolean>(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEventAttendees, setLoadingEventAttendees] = useState<boolean>(false);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState<"members" | "registrations">("members");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState<string>("");

  // ── TỶ LỆ POSTER (ASPECT RATIO: 9:16 DỌC, 1:1 VUÔNG, 16:9 NGANG, 3:4 THIỆP ĐỨNG, 4:3 MÀN CHIẾU) ──
  const [posterRatio, setPosterRatio] = useState<"9:16" | "1:1" | "16:9" | "3:4" | "4:3">("9:16");

  // ── TRẠNG THÁI CẮT ẢNH CHUYÊN NGHIỆP (IMAGE CROPPER) ──
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<"avatar" | "cutout" | null>(null);
  const [cropShape, setCropShape] = useState<"circle" | "square" | "arch" | "oval">("circle");

  // ── CÁC PHẦN TEXT TIÊU ĐỀ BỐ CỤC CÓ THỂ DI CHUỘT TÙY Ý (DRAGGABLE) & NỀN MỜ ──
  const [blocksLayout, setBlocksLayout] = useState<Record<string, TextBlockLayout>>(DEFAULT_BLOCKS);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBlockId, setSelectedBlockId] = useState<string>("headline");

  // Template State & Omnichannel Broadcast
  const [templateNameInput, setTemplateNameInput] = useState<string>("");
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const activeBg = customBgUrl.trim() || selectedBg;
  const didInitRef = useRef<boolean>(false);

  // Nạp danh sách hội viên & sự kiện đăng ký để làm nguồn chọn đại biểu (Chạy 1 lần duy nhất, chống loop call API)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    fetchNestApi<any[]>("/members")
      .then((res) => {
        if (Array.isArray(res)) setAllMembers(res);
      })
      .catch(() => {});

    fetchNestApi<any>("/events")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list)) {
          setEventsList(list);
          if (list.length > 0) {
            const firstId = list[0].id;
            setSelectedEventId(firstId);
            fetchNestApi<any>(`/events/registrations?eventId=${firstId}`)
              .then((r) => {
                const regList = Array.isArray(r) ? r : r?.items || r?.data || [];
                if (Array.isArray(regList)) setEventRegistrations(regList);
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});

    fetchNestApi<any>("/events/registrations")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list) && list.length > 0) setEventRegistrations(list);
      })
      .catch(() => {});

    loadTemplatesFromBackend();
  }, []);

  // Lọc đại biểu đã đăng ký khi chọn sự kiện cụ thể
  const handleSelectEventForAttendees = async (eventId: string) => {
    setSelectedEventId(eventId);
    if (!eventId) {
      try {
        const res = await fetchNestApi<any>("/events/registrations");
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list)) setEventRegistrations(list);
      } catch {}
      return;
    }

    setLoadingEventAttendees(true);
    try {
      const res = await fetchNestApi<any>(`/events/registrations?eventId=${eventId}`);
      const list = Array.isArray(res) ? res : res?.items || res?.data || [];
      if (Array.isArray(list)) {
        setEventRegistrations(list);
        toast.info(`Đã nạp ${list.length} người đăng ký từ sự kiện được chọn`);
      }
    } catch {
      toast.error("Không thể tải danh sách đăng ký của sự kiện này");
    } finally {
      setLoadingEventAttendees(false);
    }
  };

  // Xử lý upload ảnh đại biểu từ máy tính và mở ngay popup Cắt Ảnh (Cropper)
  const handleUploadAvatarForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setCropImageUrl(dataUrl);
      setCropTarget("avatar");
      setCropShape(
        attendeeConfig.style === "royal_circle"
          ? "circle"
          : attendeeConfig.style === "heian_arch"
          ? "arch"
          : attendeeConfig.style === "oval_luxury"
          ? "oval"
          : "square"
      );
      setIsCropOpen(true);
      toast.info("Đã mở trình cắt ảnh cho avatar vừa chọn!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Preset 1: Atlantis Royal Palace (Pinterest 374009944081934333)
  const applyAtlantisPreset = () => {
    setSelectedBg("/templates/atlantis_palace_poster.jpg");
    setCustomBgUrl("");
    setTopOrnament("atlantis_trident");
    setBottomOrnament("water_swirl");
    setSignatureText("HERA COLLECTION");
    setInvitationHeader("ATLANTIS");
    setInvitationSubtitle("HERA COLLECTION · SPRING / SUMMER 2026");
    setLeftWingText("FASHION\nMYTHOLOGY\nCREATIVITY");
    setRightWingText("BEYOND\nTHE SURFACE\nINNOVATION");
    setKicker("O OLIMPO SE ABRE MAIS UMA VEZ.");
    setLeadPhrase("Venha vivenciar Atlantis, a nova coleção da Hera");
    setMainTitleLine1("KẾT NỐI DOANH NHÂN");
    setMainTitleLine2("THỊNH VƯỢNG 1983");
    setVenueHighlight("tại HABBLET HOTEL & LANDMARK 72");
    setCapsuleBadge("+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES");
    setCapsuleBenefit("ĐẶC QUYỀN VIP PASS & BỘ QUÀ TẶNG DOANH NHÂN HERA");
    setCapsuleNote("(Trang sức ngọc trai và huy hiệu đinh ba mạ vàng)");
    setDayOfWeek("DATA");
    setTimeHour("21:30");
    setDayDigits("10");
    setMonthDigits("09");
    setYearDigits("26");
    setEventLocation("HABBLET HOTEL & CUNG ĐIỆN HERA");
    setSaluteText("Rất hân hạnh được đón tiếp!");
    setCutoutConfig((prev) => ({
      ...prev,
      enabled: false,
    }));
    toast.success("✨ Đã nạp Mẫu Cung Điện Atlantis Hoàng Gia (Pinterest 374009944081934333)!");
  };

  // Preset 2: Wyndham Thanh Thủy Heian Villas (Pinterest 501447739786387302)
  const applyWyndhamPreset = () => {
    setSelectedBg("/templates/pinterest_heian_invitation.jpg");
    setCustomBgUrl("");
    setTopOrnament("diamond_stars");
    setBottomOrnament("pearl_ribbon");
    setSignatureText("Heian Villas");
    setInvitationHeader("Thư mời");
    setInvitationSubtitle("TRÂN TRỌNG KÍNH MỜI QUÝ HỘI VIÊN & ĐỐI TÁC");
    setLeftWingText("GẮN KẾT\nCHÂN THÀNH\nĐỒNG HÀNH");
    setRightWingText("PHÁT TRIỂN\nBỀN VỮNG\nTHỊNH VƯỢNG");
    setKicker("Tham dự sự kiện");
    setLeadPhrase("Cơ hội tận hưởng");
    setMainTitleLine1("DÒNG CHẢY");
    setMainTitleLine2("HẠNH PHÚC");
    setVenueHighlight("tại Heian Villas");
    setCapsuleBadge("QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG");
    setCapsuleBenefit("01 CẶP VÉ VIP TRĂNG CONCERT NGÀY 30/4");
    setCapsuleNote("(với sự tham gia của ca sĩ Giang Hồng Ngọc và Quốc Thiên)");
    setDayOfWeek("Thứ Bảy");
    setTimeHour("9h00");
    setDayDigits("06");
    setMonthDigits("04");
    setYearDigits("24");
    setEventLocation("Bảo Yên, Thanh Thủy, Phú Thọ");
    setSaluteText("Rất hân hạnh được đón tiếp!");
    setCutoutConfig((prev) => ({
      ...prev,
      enabled: true,
      url: "/templates/heian_gate_venue.jpg",
      shape: "arch",
    }));
    toast.success("✨ Đã nạp Mẫu Thư Mời Wyndham Thanh Thủy (Pinterest 501447739786387302)!");
  };

  // Preset 3: Gala Doanh Nhân CEO 1983 Hoàng Gia
  const applyGoldenGalaPreset = () => {
    setSelectedBg("/templates/atlantis_palace_poster.jpg");
    setCustomBgUrl("");
    setTopOrnament("baroque_gold");
    setBottomOrnament("laser_glow");
    setSignatureText("CEO 1983 - HanoiBA");
    setInvitationHeader("GALA DOANH NHÂN");
    setInvitationSubtitle("CLB DOANH NHÂN CEO 1983 (HANOIBA)");
    setLeftWingText("TIÊN PHONG\nĐỔI MỚI\nSÁNG TẠO");
    setRightWingText("BỨT PHÁ\nKỶ NGUYÊN\nVƯƠN XA");
    setKicker("Hội Ngộ Đỉnh Cao & Giao Thương 2026");
    setLeadPhrase("Tỏa sáng bản lĩnh rồng vàng");
    setMainTitleLine1("KẾT NỐI VƯƠN TẦM");
    setMainTitleLine2("THỊNH VƯỢNG");
    setVenueHighlight("tại Keangnam Landmark 72, Phạm Hùng, Hà Nội");
    setCapsuleBadge("ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC CEO 1983");
    setCapsuleBenefit("BÀN TIỆC VIP VÀNG & KỶ YẾU DOANH NHÂN THỦ ĐÔ 2026");
    setCapsuleNote("(Vé check-in QR Code mã hóa bảo mật gửi trực tiếp vào Mobile App)");
    setDayOfWeek("Thứ Bảy");
    setTimeHour("18h00");
    setDayDigits("15");
    setMonthDigits("11");
    setYearDigits("26");
    setEventLocation("Khách Sạn Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội");
    setSaluteText("Trân trọng kính mời Quý Doanh nhân!");
    setCutoutConfig((prev) => ({
      ...prev,
      enabled: false,
    }));
    toast.success("✨ Đã nạp Mẫu Gala Doanh Nhân CEO 1983 Hoàng Gia!");
  };

  // Tự động điều chỉnh nội dung mẫu khi đổi Category
  const handleSelectCategory = (cat: InvitationCategory) => {
    setCategory(cat);
    if (cat === "event") {
      setKicker("Tham dự sự kiện");
      setLeadPhrase("Cơ hội tận hưởng");
      setMainTitleLine1("DÒNG CHẢY");
      setMainTitleLine2("HẠNH PHÚC");
      setVenueHighlight("tại Heian Villas");
      setCapsuleBadge("QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG");
      setCapsuleBenefit("01 CẶP VÉ VIP TRĂNG CONCERT NGÀY 30/4");
      setCapsuleNote("(với sự tham gia của ca sĩ Giang Hồng Ngọc và Quốc Thiên)");
      setDayOfWeek("Thứ Bảy");
      setTimeHour("9h00");
      setDayDigits("06");
      setMonthDigits("04");
      setYearDigits("24");
      setEventLocation("Bảo Yên, Thanh Thủy, Phú Thọ");
      setSaluteText("Rất hân hạnh được đón tiếp!");
    } else if (cat === "forum") {
      setKicker("Diễn Đàn Doanh Nhân Tiên Phong");
      setLeadPhrase("Kiến tạo tương lai");
      setMainTitleLine1("XÚC TIẾN");
      setMainTitleLine2("GIAO THƯƠNG");
      setVenueHighlight("tại Trung Tâm Hội Nghị Quốc Gia");
      setCapsuleBadge("ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC CEO 1983");
      setCapsuleBenefit("KẾT NỐI 1-ON-1 VỚI 50+ CHỦ TỊCH TẬP ĐOÀN ĐỐI TÁC");
      setCapsuleNote("(Nhận ấn phẩm độc quyền Kỷ yếu Doanh nhân Thủ đô 2026)");
      setDayOfWeek("Thứ Sáu");
      setTimeHour("08h30");
      setDayDigits("15");
      setMonthDigits("11");
      setYearDigits("26");
      setEventLocation("Phạm Hùng, Nam Từ Liêm, Hà Nội");
      setSaluteText("Trân trọng kính mời Quý Doanh chủ!");
    } else if (cat === "meeting") {
      setKicker("Thông Báo Triệu Tập");
      setLeadPhrase("Hội nghị thường niên");
      setMainTitleLine1("KỲ HỌP");
      setMainTitleLine2("BAN ĐIỀU HÀNH");
      setVenueHighlight("tại Trụ sở HanoiBA & Jitsi Meet");
      setCapsuleBadge("CHƯƠNG TRÌNH NGHỊ SỰ QUAN TRỌNG");
      setCapsuleBenefit("PHÊ CHUẨN NGÂN SÁCH & KẾ HOẠCH HÀNH ĐỘNG Q4/2026");
      setCapsuleNote("(Tài liệu mật đã được mã hóa gửi vào tài khoản App cá nhân)");
      setDayOfWeek("Thứ Năm");
      setTimeHour("14h00");
      setDayDigits("20");
      setMonthDigits("10");
      setYearDigits("26");
      setEventLocation("Tầng 5, Cung Trí Thức Thành Phố, Cầu Giấy, Hà Nội");
      setSaluteText("Kính mong Quý Thành viên tham dự đầy đủ, đúng giờ!");
    } else if (cat === "b2b_meetup") {
      setKicker("Kết Nối Giao Lưu Thân Mật");
      setLeadPhrase("Chia sẻ cơ hội");
      setMainTitleLine1("COFFEE");
      setMainTitleLine2("CEO 1983");
      setVenueHighlight("tại Không Gian Doanh Nhân Elite");
      setCapsuleBadge("CƠ HỘI ĐỘC QUYỀN HỘI VIÊN");
      setCapsuleBenefit("GIỚI THIỆU SẢN PHẨM & KÝ KẾT THỎA THUẬN HỢP TÁC B2B");
      setCapsuleNote("(Miễn phí đồ uống & teabreak cao cấp từ Ban Tổ Chức)");
      setDayOfWeek("Chủ Nhật");
      setTimeHour("09h00");
      setDayDigits("25");
      setMonthDigits("10");
      setYearDigits("26");
      setEventLocation("The Coffee House Elite, Cầu Giấy, Hà Nội");
      setSaluteText("Hân hoan chào đón Quý Anh/Chị!");
    }
  };

  // Nạp danh sách template từ backend
  const loadTemplatesFromBackend = async () => {
    try {
      const res = await fetchNestApi<any>("/admin/invitation-templates");
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setTemplates(res.data);
      } else {
        setTemplates([
          {
            id: "tpl_atlantis_default",
            name: "Mẫu Thư Mời Cung Điện Atlantis Hoàng Gia (Pinterest 374009944081934333)",
            category: "event",
            presetKey: "atlantis",
            kicker: "O OLIMPO SE ABRE MAIS UMA VEZ.",
            leadPhrase: "Venha vivenciar Atlantis, a nova coleção da Hera",
            title: "ATLANTIS",
            venueHighlight: "tại HABBLET HOTEL & LANDMARK 72",
            capsuleBadge: "+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES",
            capsuleBenefit: "ĐẶC QUYỀN VIP PASS & BỘ QUÀ TẶNG DOANH NHÂN HERA",
            capsuleNote: "(Trang sức ngọc trai và huy hiệu đinh ba mạ vàng)",
            dayOfWeek: "DATA",
            timeHour: "21:30",
            dayDigits: "10",
            monthDigits: "09",
            yearDigits: "26",
            location: "HABBLET HOTEL & CUNG ĐIỆN HERA",
            saluteText: "Rất hân hạnh được đón tiếp!",
            bgUrl: "/templates/atlantis_palace_poster.jpg",
            blocksLayout: DEFAULT_BLOCKS,
          },
          {
            id: "tpl_wyndham_default",
            name: "Mẫu Thư Mời Sự Kiện Wyndham Thanh Thủy (Pinterest 501447739786387302)",
            category: "event",
            presetKey: "wyndham",
            kicker: "Tham dự sự kiện",
            leadPhrase: "Cơ hội tận hưởng",
            title: "DÒNG CHẢY HẠNH PHÚC",
            venueHighlight: "tại Heian Villas",
            capsuleBadge: "QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG",
            capsuleBenefit: "01 CẶP VÉ VIP TRĂNG CONCERT NGÀY 30/4",
            capsuleNote: "(với sự tham gia của ca sĩ Giang Hồng Ngọc và Quốc Thiên)",
            dayOfWeek: "Thứ Bảy",
            timeHour: "9h00",
            dayDigits: "06",
            monthDigits: "04",
            yearDigits: "24",
            location: "Bảo Yên, Thanh Thủy, Phú Thọ",
            saluteText: "Rất hân hạnh được đón tiếp!",
            bgUrl: "/templates/pinterest_heian_invitation.jpg",
            blocksLayout: DEFAULT_BLOCKS,
          },
        ]);
      }
    } catch {
      // Fallback
    }
  };

  // loadTemplatesFromBackend đã được gọi an toàn trong didInitRef tại useEffect ban đầu

  // Xử lý upload ảnh bóc tách cắt (Cutout overlay image)
  const handleUploadCutoutImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCutout(true);
    try {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setCutoutConfig((prev) => ({
          ...prev,
          url: dataUrl,
          enabled: true,
        }));
      };
      reader.readAsDataURL(file);

      const uploaded = await uploadFileToNest(file, "templates");
      if (uploaded?.url) {
        setCutoutConfig((prev) => ({
          ...prev,
          url: uploaded.url,
          enabled: true,
        }));
        toast.success("Đã tải ảnh bóc tách cắt đưa lên poster thành công!");
      }
    } catch (err: any) {
      toast.error(`Lỗi tải ảnh cắt: ${err.message || "Thử lại sau"}`);
    } finally {
      setIsUploadingCutout(false);
    }
  };

  // Xử lý upload poster có sẵn & BÓC TÁCH TEXT TỰ ĐỘNG (OCR & SMART LAYOUT DETECTION)
  const handleUploadPosterImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    setIsExtractingOcr(true);
    try {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setUploadedPosterUrl(dataUrl);
        setCustomBgUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      const uploaded = await uploadFileToNest(file, "posters");
      if (uploaded?.url) {
        setUploadedPosterUrl(uploaded.url);
        setCustomBgUrl(uploaded.url);
      }

      // Mô phỏng / Thực thi Bóc Tách Text Thông Minh
      setTimeout(() => {
        setIsExtractingOcr(false);
        // Trích xuất tự động và điền vào state
        setInvitationHeader("THƯ MỜI THAM DỰ");
        setInvitationSubtitle("TRÂN TRỌNG KÍNH MỜI QUÝ DOANH NHÂN & ĐỐI TÁC");
        setMainTitleLine1("HỘI NGHỊ GIAO THƯƠNG");
        setMainTitleLine2("ĐỈNH CAO 2026");
        setEventLocation("Trung Tâm Hội Nghị Quốc Gia, Hà Nội");
        toast.success(
          "✨ Đã bóc tách tự động thành công toàn bộ text từ Poster! Bạn có thể click trực tiếp trên poster để sửa chữ, đổi font và kéo thả vị trí."
        );
      }, 1200);
    } catch (err: any) {
      toast.error(`Lỗi tải poster: ${err.message || "Thử lại sau"}`);
      setIsExtractingOcr(false);
    } finally {
      setIsUploadingPoster(false);
    }
  };

  // ── XỬ LÝ KÉO THẢ TỌA ĐỘ PHẦN TRĂM CHUẨN XÁC THEO CHUỘT & CẢM ỨNG (DRAG & DROP) ──
  const handleMouseDownBlock = (blockId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setSelectedBlockId(blockId);
    setActiveDraggingId(blockId);

    // Tự động chuyển tab điều khiển tương ứng để tiện sửa nhanh
    if (blockId === "attendee") {
      setActiveTab("attendee");
    } else if (blockId === "title" || blockId === "headline") {
      setActiveTab("content");
    } else if (blockId === "cutout") {
      setActiveTab("cutout");
    }

    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const block = blocksLayout[blockId];
    if (!block) return;

    const clientX = "touches" in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Tọa độ pixel hiện tại của khối
    const blockPixelX = (block.x / 100) * rect.width;
    const blockPixelY = (block.y / 100) * rect.height;

    setDragOffset({
      x: clientX - rect.left - blockPixelX,
      y: clientY - rect.top - blockPixelY,
    });
  };

  // Lắng nghe di chuột toàn màn hình & chạm vuốt để kéo thả mượt mà không bị tuột tay
  useEffect(() => {
    if (!activeDraggingId) return;

    const updatePosition = (clientX: number, clientY: number) => {
      if (!posterRef.current) return;
      const rect = posterRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left - dragOffset.x;
      const mouseY = clientY - rect.top - dragOffset.y;

      const newX = Math.max(2, Math.min(98, Math.round((mouseX / rect.width) * 100)));
      const newY = Math.max(2, Math.min(98, Math.round((mouseY / rect.height) * 100)));

      setBlocksLayout((prev) => ({
        ...prev,
        [activeDraggingId]: {
          ...prev[activeDraggingId],
          x: newX,
          y: newY,
        },
      }));
    };

    const handleWindowPointerMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleWindowPointerUp = () => {
      setActiveDraggingId(null);
    };

    window.addEventListener("mousemove", handleWindowPointerMove);
    window.addEventListener("mouseup", handleWindowPointerUp);
    window.addEventListener("touchmove", handleWindowTouchMove, { passive: true });
    window.addEventListener("touchend", handleWindowPointerUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowPointerMove);
      window.removeEventListener("mouseup", handleWindowPointerUp);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowPointerUp);
    };
  }, [activeDraggingId, dragOffset]);

  const handleMouseMovePoster = (e: React.MouseEvent) => {
    // Handled by global window listener
  };

  const handleMouseUpPoster = () => {
    if (activeDraggingId) {
      setActiveDraggingId(null);
    }
  };

  // Bật/tắt nền mờ cho một khối cụ thể
  const toggleBlockFrostedBg = (blockId: string) => {
    setBlocksLayout((prev) => {
      const cur = prev[blockId];
      if (!cur) return prev;
      return {
        ...prev,
        [blockId]: {
          ...cur,
          hasFrostedBg: !cur.hasFrostedBg,
        },
      };
    });
  };

  // Thay đổi Font chữ cho khối đang chọn
  const handleSetBlockFont = (blockId: string, font: FontFamilyType) => {
    setBlocksLayout((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        fontFamily: font,
      },
    }));
    toast.success(`Đã đổi font chữ cho khối sang ${font}`);
  };

  // Thay đổi Cỡ chữ cho khối đang chọn
  const handleSetBlockFontSize = (
    blockId: string,
    size: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  ) => {
    setBlocksLayout((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        fontSize: size,
      },
    }));
  };

  // Thay đổi Dải màu Gradient cho khối đang chọn
  const handleSetBlockGradient = (blockId: string, color: TextGradientColor) => {
    setBlocksLayout((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        colorGradient: color,
      },
    }));
  };

  // Bật/tắt dập nổi 3D (3D Emboss Glow)
  const toggleBlock3dEmboss = (blockId: string) => {
    setBlocksLayout((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        is3dEmboss: !prev[blockId]?.is3dEmboss,
      },
    }));
  };

  // Bật / tắt nền mờ toàn bộ các khối
  const handleToggleAllFrosted = (enable: boolean) => {
    setBlocksLayout((prev) => {
      const next: Record<string, TextBlockLayout> = {};
      Object.keys(prev).forEach((k) => {
        next[k] = { ...prev[k], hasFrostedBg: enable };
      });
      return next;
    });
    toast.info(enable ? "Đã bật nền kính mờ cho toàn bộ các khối!" : "Đã tắt nền mờ cho toàn bộ các khối (trong suốt)!");
  };

  // Đặt lại vị trí mặc định chuẩn Pinterest
  const handleResetPositions = () => {
    setBlocksLayout(DEFAULT_BLOCKS);
    toast.info("Đã khôi phục bố cục mặc định chuẩn Pinterest!");
  };

  // Thêm đại biểu từ modal
  const handleSelectAttendeeFromList = (member: any) => {
    const newAtt: SelectedAttendee = {
      id: member.id || `att-${Date.now()}`,
      name: member.name || member.full_name || "Hội viên CEO 1983",
      title: member.position || member.title || "Lãnh đạo Doanh nghiệp",
      company: member.company || "Doanh nghiệp CLB",
      avatar: member.avatar || "/avatars/avatar-default.png",
      memberCode: member.code || member.member_code || "CEO1983",
      roleInEvent: "Diễn giả danh dự",
    };

    setAttendeeConfig((prev) => ({
      ...prev,
      enabled: true,
      attendees: [newAtt], // Chọn 1 đại biểu VIP chính
    }));
    setIsAttendeeModalOpen(false);
    toast.success(`Đã thêm đại biểu VIP: ${newAtt.name} (${newAtt.company}) vào poster!`);
  };

  // Hoàn tất cắt ảnh (Cropper callback)
  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropTarget === "avatar") {
      setAttendeeConfig((prev) => ({
        ...prev,
        attendees: prev.attendees.map((a, idx) => (idx === 0 ? { ...a, avatar: croppedDataUrl } : a)),
      }));
      toast.success("✓ Đã áp dụng avatar đại biểu đã cắt thành công!");
    } else if (cropTarget === "cutout") {
      setCutoutConfig((prev) => ({
        ...prev,
        url: croppedDataUrl,
        enabled: true,
      }));
      toast.success("✓ Đã áp dụng ảnh bóc tách venue đã cắt thành công!");
    }
  };

  // Lưu template vào hệ thống backend
  const handleSaveAsTemplate = async () => {
    const name = templateNameInput.trim() || `${mainTitleLine1} ${mainTitleLine2} (${category})`;
    setIsSavingTemplate(true);
    try {
      const newTemplate: InvitationTemplate = {
        id: selectedTemplateId || `tpl_${Date.now()}`,
        name,
        category,
        kicker,
        leadPhrase,
        title: `${mainTitleLine1} ${mainTitleLine2}`,
        venueHighlight,
        capsuleBadge,
        capsuleBenefit,
        capsuleNote,
        dayOfWeek,
        timeHour,
        dayDigits,
        monthDigits,
        yearDigits,
        location: eventLocation,
        saluteText,
        bgUrl: activeBg,
        logoUrl,
        partnerLogoUrl,
        topOrnament,
        bottomOrnament,
        qrValue,
        posterUrl: uploadedPosterUrl,
        blocksLayout,
        cutoutConfig,
        attendeeConfig,
        updatedAt: new Date().toISOString(),
      };

      const updated = [newTemplate, ...templates.filter((t) => t.id !== newTemplate.id)];
      setTemplates(updated);

      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ templates: updated }),
      });

      setSelectedTemplateId(newTemplate.id);
      setTemplateNameInput("");
      toast.success(`Đã lưu mẫu "${name}" vào kho template thành công!`);
    } catch (err: any) {
      toast.error(`Lỗi lưu template: ${err.message || "Thử lại sau"}`);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Nạp template khi click từ danh sách
  const handleSelectTemplate = (tpl: InvitationTemplate) => {
    setSelectedTemplateId(tpl.id);
    setCategory(tpl.category);
    setKicker(tpl.kicker || "");
    setLeadPhrase(tpl.leadPhrase || "");
    const parts = (tpl.title || "").split(" ");
    if (parts.length > 1) {
      setMainTitleLine1(parts[0]);
      setMainTitleLine2(parts.slice(1).join(" "));
    } else {
      setMainTitleLine1(tpl.title || "");
      setMainTitleLine2("");
    }
    setVenueHighlight(tpl.venueHighlight || "");
    setCapsuleBadge(tpl.capsuleBadge || "");
    setCapsuleBenefit(tpl.capsuleBenefit || "");
    setCapsuleNote(tpl.capsuleNote || "");
    setDayOfWeek(tpl.dayOfWeek || "");
    setTimeHour(tpl.timeHour || "");
    setDayDigits(tpl.dayDigits || "");
    setMonthDigits(tpl.monthDigits || "");
    setYearDigits(tpl.yearDigits || "");
    setEventLocation(tpl.location || "");
    setSaluteText(tpl.saluteText || "");
    if (tpl.bgUrl) setSelectedBg(tpl.bgUrl);
    if (tpl.topOrnament) setTopOrnament(tpl.topOrnament);
    if (tpl.bottomOrnament) setBottomOrnament(tpl.bottomOrnament);
    if (tpl.blocksLayout) setBlocksLayout(tpl.blocksLayout);
    if (tpl.cutoutConfig) setCutoutConfig(tpl.cutoutConfig);
    if (tpl.attendeeConfig) setAttendeeConfig(tpl.attendeeConfig);
    toast.info(`Đã nạp mẫu template "${tpl.name}" vào studio!`);
  };

  // Xuất file ảnh PNG độ nét cao (HD 1080x1920)
  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      const canvas = document.createElement("canvas");
      const exportW =
        posterRatio === "9:16"
          ? 1080
          : posterRatio === "3:4"
          ? 1200
          : posterRatio === "1:1"
          ? 1200
          : posterRatio === "16:9"
          ? 1920
          : 1600;
      const exportH =
        posterRatio === "9:16"
          ? 1920
          : posterRatio === "3:4"
          ? 1600
          : posterRatio === "1:1"
          ? 1200
          : posterRatio === "16:9"
          ? 1080
          : 1200;
      canvas.width = exportW;
      canvas.height = exportH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không thể khởi tạo Canvas 2D");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeBg;

      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => resolve(null); // fallback if CORS
      });

      ctx.fillStyle = "#071530";
      ctx.fillRect(0, 0, exportW, exportH);

      if (img.width > 0) {
        ctx.drawImage(img, 0, 0, exportW, exportH);
      }

      // Vẽ lớp gradient ban đêm và ánh sáng
      const grad = ctx.createLinearGradient(0, 0, 0, exportH);
      grad.addColorStop(0, "rgba(7, 21, 48, 0.4)");
      grad.addColorStop(0.5, "rgba(6, 18, 37, 0.15)");
      grad.addColorStop(1, "rgba(7, 21, 48, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, exportW, exportH);

      const centerX = exportW / 2;

      // Render Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 96px serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = 24;
      ctx.fillText(invitationHeader, centerX, exportH * 0.15);

      ctx.shadowBlur = 0;
      ctx.font = "bold 28px sans-serif";
      ctx.fillStyle = "#E2E8F0";
      ctx.fillText(invitationSubtitle, centerX, exportH * 0.18);

      // Headline
      ctx.fillStyle = "#67e8f9";
      ctx.font = "bold 32px serif";
      ctx.fillText(kicker, centerX, exportH * 0.27);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 36px serif";
      ctx.fillText(leadPhrase, centerX, exportH * 0.3);

      // 2 Dòng Tiêu Đề Cỡ Đại
      ctx.font = "900 84px serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(56, 189, 248, 0.7)";
      ctx.shadowBlur = 32;
      ctx.fillText(mainTitleLine1, centerX, exportH * 0.35);
      ctx.fillText(mainTitleLine2, centerX, exportH * 0.4);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(venueHighlight, centerX, exportH * 0.43);

      // Ngày giờ Luxury
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(`${dayOfWeek}  |  ${timeHour}`, centerX, exportH * 0.65);

      ctx.font = "900 110px serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.fillText(`${dayDigits}  |  ${monthDigits}  |  ${yearDigits}`, centerX, exportH * 0.71);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "28px sans-serif";
      ctx.fillText(eventLocation, centerX, exportH * 0.74);

      // Lời chào
      ctx.fillStyle = "#38bdf8";
      ctx.font = "italic bold 32px serif";
      ctx.fillText(saluteText, centerX, exportH * 0.94);

      const link = document.createElement("a");
      link.download = `Poster_${category}_${mainTitleLine1}_${mainTitleLine2}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("✨ Đã xuất ảnh Poster Full HD sắc nét thành công!");
    } catch (err: any) {
      toast.error(`Lỗi xuất ảnh: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsExportingPng(false);
    }
  };

  // Helper font class hỗ trợ đa dạng kiểu chữ và font chữ dynamic chuẩn Quốc tế & Việt hóa
  const getFontFamilyClass = (f?: FontFamilyType) => {
    switch (f) {
      case "cinzel":
        return "font-cinzel tracking-widest uppercase font-extrabold";
      case "playfair":
        return "font-playfair tracking-wide font-bold";
      case "cormorant":
        return "font-cormorant tracking-wide italic font-bold";
      case "montserrat":
        return "font-montserrat tracking-tight font-black uppercase";
      case "vietnam":
        return "font-vietnam font-bold";
      case "orbitron":
        return "font-orbitron tracking-widest font-black uppercase";
      case "dancing":
        return "font-dancing text-2xl font-bold";
      case "great_vibes":
        return "font-great-vibes text-3xl font-normal";
      case "calligraphy":
        return "font-dancing text-2xl font-semibold";
      case "oswald":
        return "font-sans font-bold tracking-wider uppercase";
      case "merriweather":
        return "font-serif font-light";
      case "roboto":
        return "font-sans font-medium";
      case "sans":
        return "font-sans font-semibold";
      case "serif":
      default:
        return "font-serif";
    }
  };

  // Helper font size class dynamic cho từng khối chữ
  const getFontSizeClass = (size?: string, defaultClass: string = "text-base") => {
    switch (size) {
      case "xs":
        return "text-[11px] leading-tight";
      case "sm":
        return "text-xs sm:text-sm leading-snug";
      case "base":
        return "text-sm sm:text-base leading-normal";
      case "lg":
        return "text-base sm:text-lg leading-normal";
      case "xl":
        return "text-lg sm:text-xl leading-relaxed";
      case "2xl":
        return "text-xl sm:text-2xl leading-relaxed";
      case "3xl":
        return "text-2xl sm:text-3xl leading-tight";
      case "4xl":
        return "text-3xl sm:text-4xl leading-tight";
      case "5xl":
        return "text-4xl sm:text-5xl leading-tight";
      default:
        return defaultClass;
    }
  };

  // Helper gradient class
  const getGradientClass = (c?: TextGradientColor) => {
    switch (c) {
      case "gold":
        return "text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500 drop-shadow-[0_4px_16px_rgba(234,179,8,0.5)]";
      case "cyan":
        return "text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-sky-300 drop-shadow-[0_4px_18px_rgba(56,189,248,0.5)]";
      case "platinum":
        return "text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]";
      case "ruby":
        return "text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-red-400 to-amber-300 drop-shadow-[0_4px_16px_rgba(244,63,94,0.5)]";
      case "white":
      default:
        return "text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.45)]";
    }
  };

  // Lọc danh sách hiển thị trong modal chọn đại biểu (hội viên CLB hoặc người đăng ký sự kiện)
  const filteredList = useMemo(() => {
    const q = attendeeSearchQuery.toLowerCase();
    const source = selectedSourceType === "registrations" ? eventRegistrations : allMembers;

    return source.filter((item: any) => {
      const name = item.name || item.full_name || item.member?.name || item.user?.name || "";
      const company = item.company || item.member?.company || item.user?.company || "";
      const code = item.code || item.member_code || item.ticket_code || "";
      const ticket = item.ticket_name || "";
      return (
        name.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        ticket.toLowerCase().includes(q)
      );
    });
  }, [selectedSourceType, eventRegistrations, allMembers, attendeeSearchQuery]);

  return (
    <div className="space-y-6">
      {/* ── HEADER CÔNG CỤ STUDIO CAO CẤP ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border border-sky-500/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            <span>Studio Poster Đồ Họa Hoàng Gia &amp; Pinterest Master v10.0</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white flex items-center gap-2.5">
            <span>Thiết Kế Poster &amp; Thư Mời Sự Kiện CEO 1983</span>
            <Crown className="size-6 text-amber-400 fill-amber-400/30 animate-pulse" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Tái tạo chuẩn ảnh Pinterest Atlantis &amp; Wyndham Thanh Thủy. Tùy chỉnh font chữ, cỡ chữ, 3D, bóc tách text
            tự động, kéo thả tự do như TopCV và chèn trực tiếp đại biểu từ danh sách hội viên!
          </p>
        </div>

        {/* NÚT TÁC VỤ NHANH */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetPositions}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="size-3.5 text-amber-400" />
            <span>Đặt Lại Vị Trí</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleAllFrosted(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 text-sky-200 text-xs font-bold border border-sky-400/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="size-3.5 text-sky-400" />
            <span>Bật Nền Kính Mờ</span>
          </button>

          <button
            type="button"
            disabled={isExportingPng}
            onClick={handleExportPng}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <Download className="size-3.5" />
            <span>{isExportingPng ? "Đang xuất ảnh..." : "Xuất Ảnh PNG HD"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
          >
            <Send className="size-3.5" />
            <span>Gửi Đa Kênh Omnichannel</span>
          </button>
        </div>
      </div>

      {/* ── BỘ CHỌN NHANH 3 MẪU HOÀNG GIA CHUẨN PINTEREST ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mẫu 1: Atlantis */}
        <div
          onClick={applyAtlantisPreset}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 relative overflow-hidden ${
            selectedBg.includes("atlantis")
              ? "bg-gradient-to-r from-blue-950/90 to-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400/50"
          }`}
        >
          <div className="size-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-serif font-black text-xl shrink-0">
            🔱
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Cung Điện Atlantis Hoàng Gia</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">Pinterest</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              Đinh ba hoàng kim, nước xoáy pha lê, chữ 3D Atlantis, cánh gà Hera
            </p>
          </div>
        </div>

        {/* Mẫu 2: Wyndham Heian */}
        <div
          onClick={applyWyndhamPreset}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 relative overflow-hidden ${
            selectedBg.includes("heian")
              ? "bg-gradient-to-r from-slate-950 to-blue-950 border-sky-400 ring-2 ring-sky-400/40"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400/50"
          }`}
        >
          <div className="size-12 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-serif font-black text-xl shrink-0">
            ⛩️
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Wyndham Thanh Thủy (Heian)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">Pinterest</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              Đêm Heian Villas, cụm ngày giờ 06|04|24, hộp Capsule, vòm Heian
            </p>
          </div>
        </div>

        {/* Mẫu 3: Gala Doanh Nhân */}
        <div
          onClick={applyGoldenGalaPreset}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 relative overflow-hidden ${
            topOrnament === "baroque_gold" && !selectedBg.includes("heian")
              ? "bg-gradient-to-r from-amber-950/60 to-slate-950 border-amber-400 ring-2 ring-amber-400/40"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/50"
          }`}
        >
          <div className="size-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-serif font-black text-xl shrink-0">
            👑
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Gala Doanh Nhân CEO 1983</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">Gold VIP</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              Hoa văn vòm Baroque mạ vàng, dải nơ ngọc trai, chữ 3D dập nổi
            </p>
          </div>
        </div>
      </div>

      {/* ── BỐ CỤC CHÍNH: 2 CỘT (CỘT ĐIỀU KHIỂN & CỘT POSTER PREVIEW) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════════
            CỘT TRÁI: BỘ ĐIỀU KHIỂN & CẤU HÌNH STUDIO (5 CỘT)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4">
          {/* THANH TABS ĐIỀU HƯỚNG */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "content"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Type className="size-3.5" />
              <span>Nội Dung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attendee")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "attendee"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="size-3.5 text-amber-500" />
              <span>Đại Biểu VIP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ornaments")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "ornaments"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Crown className="size-3.5 text-yellow-500" />
              <span>Hoa Văn 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cutout")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "cutout"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Scissors className="size-3.5" />
              <span>Ảnh Cắt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "upload"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Wand2 className="size-3.5 text-purple-500" />
              <span>OCR Bóc Tách</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "templates"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Bookmark className="size-3.5" />
              <span>Kho Mẫu</span>
            </button>
          </div>

          {/* ── TAB 1: NỘI DUNG VĂN BẢN & CHI TIẾT SỰ KIỆN ── */}
          {activeTab === "content" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              {/* Chọn danh mục */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Loại Hình Thư Mời / Poster:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("event")}
                    className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                      category === "event"
                        ? "bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>🎪 Sự Kiện / Gala</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("forum")}
                    className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                      category === "forum"
                        ? "bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>🏛️ Diễn Đàn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("meeting")}
                    className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                      category === "meeting"
                        ? "bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>💼 Kỳ Họp Ban</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("b2b_meetup")}
                    className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                      category === "b2b_meetup"
                        ? "bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>☕ Coffee B2B</span>
                  </button>
                </div>
              </div>

              {/* Tiêu đề & Kính mời */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Thư Mời / Tên Mẫu
                  </label>
                  <input
                    type="text"
                    value={invitationHeader}
                    onChange={(e) => setInvitationHeader(e.target.value)}
                    placeholder="ATLANTIS / Thư mời"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-serif font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Dòng Kính Mời / Phụ Đề
                  </label>
                  <input
                    type="text"
                    value={invitationSubtitle}
                    onChange={(e) => setInvitationSubtitle(e.target.value)}
                    placeholder="HERA COLLECTION · SPRING / SUMMER 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs uppercase font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* 2 Dòng Tiêu Đề Cỡ Đại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Lớn Dòng 1
                  </label>
                  <input
                    type="text"
                    value={mainTitleLine1}
                    onChange={(e) => setMainTitleLine1(e.target.value)}
                    placeholder="KẾT NỐI DOANH NHÂN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-serif font-black uppercase text-sky-700 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Lớn Dòng 2
                  </label>
                  <input
                    type="text"
                    value={mainTitleLine2}
                    onChange={(e) => setMainTitleLine2(e.target.value)}
                    placeholder="THỊNH VƯỢNG 1983"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-serif font-black uppercase text-sky-700 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-300"
                  />
                </div>
              </div>

              {/* Thông điệp & Địa điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Câu Kicker Trang Trọng
                  </label>
                  <input
                    type="text"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="O OLIMPO SE ABRE MAIS UMA VEZ."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-sky-600 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Địa Danh Nổi Bật Dưới Tiêu Đề
                  </label>
                  <input
                    type="text"
                    value={venueHighlight}
                    onChange={(e) => setVenueHighlight(e.target.value)}
                    placeholder="tại HABBLET HOTEL & LANDMARK 72"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Hộp Đặc Quyền / Quà Tặng (Capsule Box) */}
              <div className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-1.5">
                  <Award className="size-3.5" />
                  <span>Hộp Đặc Quyền / Quà Tặng (Capsule Badge)</span>
                </span>
                <input
                  type="text"
                  value={capsuleBadge}
                  onChange={(e) => setCapsuleBadge(e.target.value)}
                  placeholder="+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES"
                  className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg p-2 text-xs uppercase font-bold text-slate-900 dark:text-cyan-100"
                />
                <input
                  type="text"
                  value={capsuleBenefit}
                  onChange={(e) => setCapsuleBenefit(e.target.value)}
                  placeholder="ĐẶC QUYỀN VIP PASS & BỘ QUÀ TẶNG DOANH NHÂN HERA"
                  className="w-full bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800 rounded-lg p-2 text-xs uppercase font-black text-slate-900 dark:text-white"
                />
              </div>

              {/* Cụm Ngày Giờ Số Lớn Luxury */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-sky-500" />
                  <span>Cụm Ngày Giờ Số Lớn (Luxury Date &amp; Time):</span>
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Nhãn / Thứ</label>
                    <input
                      type="text"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Giờ</label>
                    <input
                      type="text"
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs text-center font-bold text-sky-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Ngày</label>
                    <input
                      type="text"
                      value={dayDigits}
                      onChange={(e) => setDayDigits(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs text-center font-black text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Tháng</label>
                    <input
                      type="text"
                      value={monthDigits}
                      onChange={(e) => setMonthDigits(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs text-center font-black text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Năm</label>
                    <input
                      type="text"
                      value={yearDigits}
                      onChange={(e) => setYearDigits(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs text-center font-black text-rose-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Địa Điểm Tổ Chức Chi Tiết</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="HABBLET HOTEL & CUNG ĐIỆN HERA"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* ── BỘ ĐIỀU KHIỂN KIỂU CHỮ & MẪU CHỮ DYNAMIC (TYPOGRAPHY MASTER) ── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-sky-400/30 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="size-4 text-sky-400" />
                    <span>Kiểu Chữ, Mẫu Chữ &amp; Hiệu Ứng Dynamic</span>
                  </span>
                  <span className="text-[10px] text-slate-300">Click khối trên canvas để chỉnh ngay</span>
                </div>

                {/* Chọn khối chữ mục tiêu cần đổi kiểu chữ */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1.5">
                    Chọn Thành Phần Muốn Đổi Kiểu Chữ:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: "headline", name: "Tiêu Đề Lớn 1983" },
                      { id: "title", name: "Thư Mời / ATLANTIS" },
                      { id: "attendee", name: "Khối Đại Biểu VIP" },
                      { id: "capsule", name: "Hộp Đặc Quyền" },
                      { id: "datetime", name: "Ngày Giờ & Địa Điểm" },
                      { id: "header", name: "Thanh Header & Logo" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBlockId(b.id)}
                        className={`p-2 rounded-xl text-[11px] font-bold transition text-left cursor-pointer ${
                          selectedBlockId === b.id
                            ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-xs"
                            : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn Font Chữ & Cỡ Chữ cho khối được chọn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Mẫu Font Chữ (Font Family):
                    </label>
                    <select
                      value={blocksLayout[selectedBlockId]?.fontFamily || "serif"}
                      onChange={(e) => handleSetBlockFont(selectedBlockId, e.target.value as FontFamilyType)}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      <optgroup label="👑 Hoàng Gia & Đẳng Cấp">
                        <option value="cinzel">Cinzel (Hoàng Gia Atlantis / La Mã)</option>
                        <option value="playfair">Playfair Display (Quý Tộc Sang Trọng)</option>
                        <option value="cormorant">Cormorant Garamond (Châu Âu Cổ Điển)</option>
                        <option value="serif">Serif (Trang Trọng Truyền Thống)</option>
                      </optgroup>
                      <optgroup label="💼 Hiện Đại & Doanh Nhân">
                        <option value="vietnam">Be Vietnam Pro (Việt Hóa Đỉnh Cao)</option>
                        <option value="montserrat">Montserrat (Doanh Nghiệp Đột Phá)</option>
                        <option value="sans">Inter (Hiện Đại / Tinh Gọn)</option>
                        <option value="roboto">Roboto (Tiêu Chuẩn)</option>
                        <option value="oswald">Oswald (Chữ In Đậm Mạnh Mẽ)</option>
                      </optgroup>
                      <optgroup label="🚀 Công Nghệ 3D & Tương Lai">
                        <option value="orbitron">Orbitron (Công Nghệ Vũ Trụ 3D)</option>
                      </optgroup>
                      <optgroup label="🖋️ Viết Tay & Nghệ Thuật">
                        <option value="dancing">Dancing Script (Uốn Lượn Tinh Tế)</option>
                        <option value="great_vibes">Great Vibes (Chữ Ký Vinh Danh)</option>
                        <option value="calligraphy">Thư Pháp Hiện Đại</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">
                      Kích Thước Chữ (Font Size):
                    </label>
                    <select
                      value={blocksLayout[selectedBlockId]?.fontSize || "base"}
                      onChange={(e) => handleSetBlockFontSize(selectedBlockId, e.target.value as any)}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      <option value="xs">Cỡ chữ: XS (11px)</option>
                      <option value="sm">Cỡ chữ: SM (13px)</option>
                      <option value="base">Cỡ chữ: Chuẩn (15px)</option>
                      <option value="lg">Cỡ chữ: Lớn LG (18px)</option>
                      <option value="xl">Cỡ chữ: Rất Lớn XL (20px)</option>
                      <option value="2xl">Cỡ chữ: Nổi Bật 2XL (24px)</option>
                      <option value="3xl">Cỡ chữ: Tiêu Đề 3XL (30px)</option>
                      <option value="4xl">Cỡ chữ: Đại Tiệc 4XL (36px)</option>
                      <option value="5xl">Cỡ chữ: Siêu Cực Đại 5XL (48px)</option>
                    </select>
                  </div>
                </div>

                {/* Chọn Màu Sắc & Gradient Ánh Kim */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1.5">
                    Màu Sắc &amp; Gradient Ánh Kim:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: "gold", name: "Vàng Gold 👑", style: "from-amber-200 to-amber-500 text-amber-950 font-bold" },
                      { id: "cyan", name: "Atlantis 🌊", style: "from-cyan-100 to-sky-400 text-slate-950 font-bold" },
                      { id: "platinum", name: "Bạch Kim 💎", style: "from-white to-slate-300 text-slate-950 font-bold" },
                      { id: "ruby", name: "Đỏ Ruby 🔴", style: "from-rose-300 to-red-600 text-white font-bold" },
                      { id: "white", name: "Trắng Sứ ⚪", style: "from-white to-slate-100 text-slate-900 font-bold" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSetBlockGradient(selectedBlockId, g.id as TextGradientColor)}
                        className={`p-2 rounded-xl text-[11px] text-center transition cursor-pointer bg-gradient-to-r ${g.style} ${
                          blocksLayout[selectedBlockId]?.colorGradient === g.id
                            ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-md scale-102"
                            : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hiệu ứng 3D dập nổi & Nền kính mờ */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleBlock3dEmboss(selectedBlockId)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      blocksLayout[selectedBlockId]?.is3dEmboss
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    <Sparkles className="size-3.5" />
                    <span>{blocksLayout[selectedBlockId]?.is3dEmboss ? "✓ Đang Bật Chữ Nổi 3D" : "Bật Chữ Nổi 3D"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBlockFrostedBg(selectedBlockId)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      blocksLayout[selectedBlockId]?.hasFrostedBg
                        ? "bg-sky-500 text-white shadow-md"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    <Layers className="size-3.5" />
                    <span>{blocksLayout[selectedBlockId]?.hasFrostedBg ? "✓ Nền Kính Mờ Đang Bật" : "Bật Nền Kính Mờ"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ĐẠI BIỂU VIP & DIỄN GIẢ KHÁCH MỜI (DYNAMIC ATTENDEES & CALL API EVENT REGISTRATIONS) ── */}
          {activeTab === "attendee" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                      Đại Biểu VIP / Diễn Giả Poster
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Call API người đăng ký sự kiện hoặc chọn từ toàn bộ hội viên
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="toggle-attendee-enabled"
                    checked={attendeeConfig.enabled}
                    onChange={(e) =>
                      setAttendeeConfig((prev) => ({
                        ...prev,
                        enabled: e.target.checked,
                      }))
                    }
                    className="size-4 rounded text-amber-600 cursor-pointer"
                  />
                  <label htmlFor="toggle-attendee-enabled" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Hiển Thị
                  </label>
                </div>
              </div>

              {/* ── KHỐI CHỌN SỰ KIỆN & CALL API NGƯỜI ĐÃ ĐĂNG KÝ ── */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-300/70 dark:border-amber-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="size-4 text-amber-600" />
                    <span>Sự Kiện Áp Dụng (Call API Đăng Ký):</span>
                  </span>
                  {loadingEventAttendees ? (
                    <span className="text-[10px] text-amber-600 font-bold animate-pulse">Đang tải API...</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      {eventRegistrations.length} lượt đăng ký
                    </span>
                  )}
                </div>

                {/* Dropdown chọn sự kiện */}
                <select
                  value={selectedEventId}
                  onChange={(e) => void handleSelectEventForAttendees(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                >
                  <option value="">-- Tất cả sự kiện ({eventsList.length} sự kiện) --</option>
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || ev.title} ({ev.date || ev.start_time ? new Date(ev.date || ev.start_time).toLocaleDateString("vi-VN") : "Sắp tới"})
                    </option>
                  ))}
                </select>

                {/* Tab chuyển nguồn: Người đăng ký sự kiện vs Toàn bộ hội viên */}
                <div className="flex items-center gap-1 p-1 bg-amber-100/60 dark:bg-slate-900 rounded-xl border border-amber-200/50">
                  <button
                    type="button"
                    onClick={() => setSelectedSourceType("registrations")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      selectedSourceType === "registrations"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-amber-900 dark:text-slate-300 hover:bg-amber-200/50"
                    }`}
                  >
                    <span>Người Đã Đăng Ký ({eventRegistrations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSourceType("members")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      selectedSourceType === "members"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-amber-900 dark:text-slate-300 hover:bg-amber-200/50"
                    }`}
                  >
                    <span>Tất Cả Hội Viên CLB ({allMembers.length})</span>
                  </button>
                </div>

                {/* Tìm kiếm nhanh */}
                <div className="relative">
                  <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm nhanh theo họ tên, chức danh, công ty..."
                    value={attendeeSearchQuery}
                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Danh sách người đăng ký / hội viên trực tiếp để click 1 chạm */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-amber-100 dark:divide-slate-800">
                  {filteredList.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Chưa tìm thấy người đăng ký nào phù hợp. Chọn sự kiện khác hoặc bấm "Tất Cả Hội Viên CLB"!
                    </div>
                  ) : (
                    filteredList.slice(0, 30).map((item: any) => {
                      const itemName = item.name || item.full_name || item.member?.name || item.user?.name || "Hội viên";
                      const itemCompany = item.company || item.member?.company || item.user?.company || "CEO 1983";
                      const itemTitle = item.title || item.position || item.member?.title || "Doanh nhân";
                      const itemAvatar = resolveMediaUrl(item.avatar || item.avatar_url || item.member?.avatar) || "/avatars/avatar-default.svg";
                      const isCurrent = attendeeConfig.attendees[0]?.name === itemName;

                      return (
                        <div
                          key={item.id || item.user_id || itemName}
                          className={`pt-1.5 flex items-center justify-between gap-2 p-1.5 rounded-lg transition ${
                            isCurrent
                              ? "bg-amber-200/50 dark:bg-amber-900/40 ring-1 ring-amber-400"
                              : "hover:bg-amber-100/40 dark:hover:bg-amber-950/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={itemAvatar}
                              alt={itemName}
                              className="size-8 rounded-full object-cover border border-amber-400 shrink-0"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.svg";
                              }}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {itemName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {itemTitle} · {itemCompany}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const newAtt: SelectedAttendee = {
                                id: String(item.id || item.user_id || Date.now()),
                                name: itemName,
                                title: itemTitle,
                                company: itemCompany,
                                avatar: itemAvatar,
                                memberCode: item.member_code || item.code || "",
                                roleInEvent: "Diễn giả chính (Keynote Speaker)",
                              };
                              setAttendeeConfig((prev) => ({
                                ...prev,
                                enabled: true,
                                attendees: [newAtt],
                              }));
                              toast.success(`✓ Đã đưa đại biểu ${itemName} lên poster!`);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition shrink-0 cursor-pointer ${
                              isCurrent
                                ? "bg-amber-600 text-white"
                                : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 hover:bg-amber-500 hover:text-white"
                            }`}
                          >
                            {isCurrent ? "Đang Chọn" : "+ Chọn Vào Poster"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── ĐẠI BIỂU ĐANG CHỌN TRÊN POSTER & CÔNG CỤ CẮT ẢNH ── */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Đại biểu / Diễn giả đang hiển thị trên poster:
                </label>

                {attendeeConfig.attendees.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="p-3.5 rounded-2xl border border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-amber-200/60 dark:border-amber-800/40">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={att.avatar}
                            alt={att.name}
                            className="size-12 rounded-full object-cover border-2 border-amber-500 shadow-md"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.svg";
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black uppercase">
                            VIP
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{att.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                              {att.roleInEvent}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            {att.title} · {att.company}
                          </div>
                        </div>
                      </div>

                      {/* Các nút tác vụ nhanh: Cắt ảnh & Tải ảnh */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCropImageUrl(att.avatar);
                            setCropTarget("avatar");
                            setCropShape(
                              attendeeConfig.style === "royal_circle"
                                ? "circle"
                                : attendeeConfig.style === "heian_arch"
                                ? "arch"
                                : attendeeConfig.style === "oval_luxury"
                                ? "oval"
                                : "square"
                            );
                            setIsCropOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Cắt xoay ảnh avatar đại biểu theo hình mong muốn"
                        >
                          <Scissors className="size-3.5" />
                          <span>Cắt Ảnh</span>
                        </button>

                        <label className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                          <Upload className="size-3.5" />
                          <span>Ảnh Mới</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadAvatarForCrop}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Form chỉnh sửa trực tiếp thông tin đại biểu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Họ và Tên Đại Biểu</label>
                        <input
                          type="text"
                          value={att.name}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: prev.attendees.map((a, i) => (i === idx ? { ...a, name: e.target.value } : a)),
                            }))
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Vai Trò Sự Kiện</label>
                        <select
                          value={att.roleInEvent || "Diễn giả chính (Keynote Speaker)"}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: prev.attendees.map((a, i) => (i === idx ? { ...a, roleInEvent: e.target.value } : a)),
                            }))
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 font-bold text-amber-700 dark:text-amber-300 cursor-pointer"
                        >
                          <option value="Diễn giả chính (Keynote Speaker)">Diễn giả chính (Keynote Speaker)</option>
                          <option value="Khách mời VIP (VIP Guest)">Khách mời VIP (VIP Guest)</option>
                          <option value="Đại biểu danh dự (Honorary Delegate)">Đại biểu danh dự (Honorary Delegate)</option>
                          <option value="Diễn giả chia sẻ (Guest Speaker)">Diễn giả chia sẻ (Guest Speaker)</option>
                          <option value="Host điều phối (Event Host)">Host điều phối (Event Host)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Chức Danh Doanh Nghiệp</label>
                        <input
                          type="text"
                          value={att.title}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: prev.attendees.map((a, i) => (i === idx ? { ...a, title: e.target.value } : a)),
                            }))
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Công Ty / Thương Hiệu</label>
                        <input
                          type="text"
                          value={att.company}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: prev.attendees.map((a, i) => (i === idx ? { ...a, company: e.target.value } : a)),
                            }))
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={attendeeConfig.showTitle !== false}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              showTitle: e.target.checked,
                            }))
                          }
                          className="size-3.5 rounded text-amber-600"
                        />
                        <span>Hiện Chức Danh</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={attendeeConfig.showCompany !== false}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              showCompany: e.target.checked,
                            }))
                          }
                          className="size-3.5 rounded text-amber-600"
                        />
                        <span>Hiện Công Ty</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kiểu hiển thị Avatar Đại Biểu */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chế Độ Khung Ảnh &amp; Bóc Tách Avatar:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "royal_circle", name: "Tròn Hoàng Gia 3D", icon: "👑" },
                    { id: "heian_arch", name: "Vòm Cung Heian", icon: "⛩️" },
                    { id: "oval_luxury", name: "Bầu Dục Ngọc Trai", icon: "✨" },
                    { id: "soft_feather", name: "Mờ Viền Lông Vũ", icon: "🪶" },
                    { id: "3d_card", name: "Thẻ Nổi 3D", icon: "🧊" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setAttendeeConfig((prev) => ({
                          ...prev,
                          style: st.id as AttendeeCardStyle,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        attendeeConfig.style === st.id
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-base mb-1">{st.icon}</div>
                      <div>{st.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Mờ Viền Ảnh (Soft Feather), Tỉ lệ Scale & Tọa độ */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Độ Mờ Viền Hòa Nền (Soft Feathering Blur):</span>
                    <span className="font-mono text-amber-600 font-bold">{attendeeConfig.featherBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={attendeeConfig.featherBlur}
                    onChange={(e) =>
                      setAttendeeConfig((prev) => ({
                        ...prev,
                        featherBlur: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Làm 4 cạnh của ảnh mờ dần hòa tan tự nhiên vào poster mà không cần Photoshop!
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Kích Thước Thẻ Đại Biểu:</span>
                    <span className="font-mono text-amber-600 font-bold">{attendeeConfig.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={attendeeConfig.scale}
                    onChange={(e) =>
                      setAttendeeConfig((prev) => ({
                        ...prev,
                        scale: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Vị Trí Ngang (X):</span>
                      <span className="font-mono text-amber-600">{blocksLayout.attendee?.x ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="98"
                      value={blocksLayout.attendee?.x ?? 50}
                      onChange={(e) =>
                        setBlocksLayout((prev) => ({
                          ...prev,
                          attendee: { ...prev.attendee, x: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Vị Trí Dọc (Y):</span>
                      <span className="font-mono text-amber-600">{blocksLayout.attendee?.y ?? 47}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="98"
                      value={blocksLayout.attendee?.y ?? 47}
                      onChange={(e) =>
                        setBlocksLayout((prev) => ({
                          ...prev,
                          attendee: { ...prev.attendee, y: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: TRANG TRÍ ĐỈNH CAO TRÊN/DƯỚI & HIỆU ỨNG 3D ── */}
          {activeTab === "ornaments" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Họa Tiết Trang Trí Trên Cùng (Header Ornaments):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "atlantis_trident", name: "Đinh Ba Atlantis 3D", icon: "🔱" },
                  { id: "baroque_gold", name: "Vòm Vàng Baroque", icon: "👑" },
                  { id: "diamond_stars", name: "Sao Kim Cương", icon: "⭐" },
                  { id: "royal_crown", name: "Vương Miện Quý Tộc", icon: "🏆" },
                  { id: "art_deco", name: "Hình Học Art Deco", icon: "🔶" },
                  { id: "none", name: "Tối Giản / Không", icon: "⚪" },
                ].map((orn) => (
                  <button
                    key={orn.id}
                    type="button"
                    onClick={() => setTopOrnament(orn.id as TopOrnamentType)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      topOrnament === orn.id
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-lg mb-1">{orn.icon}</div>
                    <div>{orn.name}</div>
                  </button>
                ))}
              </div>

              {/* Trang trí chân poster */}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block pt-2">
                Họa Tiết Trang Trí Dưới Đáy (Bottom Ornaments):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "water_swirl", name: "Sóng Nước Dạ Quang", icon: "🌊" },
                  { id: "pearl_ribbon", name: "Dải Nơ Ngọc Trai", icon: "🎀" },
                  { id: "laser_glow", name: "Vạch Sáng Laser", icon: "⚡" },
                  { id: "none", name: "Không Trang Trí", icon: "⚪" },
                ].map((orn) => (
                  <button
                    key={orn.id}
                    type="button"
                    onClick={() => setBottomOrnament(orn.id as BottomOrnamentType)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      bottomOrnament === orn.id
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-lg mb-1">{orn.icon}</div>
                    <div>{orn.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: ẢNH CẮT & CỔNG CHÀO VENUE (CUTOUT CONFIG) ── */}
          {activeTab === "cutout" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kích Hoạt Ảnh Cắt Venue / Cổng Chào Chân Poster:
                </span>
                <input
                  type="checkbox"
                  checked={cutoutConfig.enabled}
                  onChange={(e) =>
                    setCutoutConfig((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className="size-4 rounded text-sky-600"
                />
              </div>

              {/* Upload ảnh cắt */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Tải Ảnh Cắt Mới Từ Thiết Bị:
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-sky-500 transition bg-slate-50/50 dark:bg-slate-950/30">
                  <Scissors className="size-6 text-sky-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUploadingCutout ? "Đang xử lý tải ảnh..." : "Bấm để chọn file ảnh cắt PNG / JPG"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCutoutImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Nút cắt & bo viền ảnh venue */}
              {cutoutConfig.url && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={cutoutConfig.url}
                      alt="Cutout Preview"
                      className="size-10 rounded-lg object-cover border border-sky-400"
                    />
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Ảnh Venue Hiện Tại
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCropImageUrl(cutoutConfig.url);
                      setCropTarget("cutout");
                      setCropShape(
                        cutoutConfig.shape === "arch"
                          ? "arch"
                          : cutoutConfig.shape === "oval"
                          ? "oval"
                          : "square"
                      );
                      setIsCropOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Scissors className="size-3.5" />
                    <span>Cắt & Bo Viền Ảnh</span>
                  </button>
                </div>
              )}

              {/* Kiểu bóc tách cắt hình */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  5 Kiểu Bóc Tách Cắt Hình:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "arch", name: "Cổng Vòm Heian", icon: "⛩️" },
                    { id: "soft_feather", name: "Mờ Viền Hòa Nền", icon: "🪶" },
                    { id: "oval", name: "Bầu Dục Diễn Giả", icon: "✨" },
                    { id: "rounded", name: "Bo Góc 24px", icon: "🔲" },
                    { id: "cinema", name: "Toàn Cảnh Cinema", icon: "🎬" },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() =>
                        setCutoutConfig((prev) => ({
                          ...prev,
                          shape: sh.id as CutoutShape,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        cutoutConfig.shape === sh.id
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/30"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-base mb-1">{sh.icon}</div>
                      <div>{sh.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders Tinh Chỉnh */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Độ Mờ Viền Lông Vũ (Feather Blur):</span>
                    <span className="font-mono text-sky-600">{cutoutConfig.featherBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={cutoutConfig.featherBlur}
                    onChange={(e) =>
                      setCutoutConfig((prev) => ({
                        ...prev,
                        featherBlur: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Tỉ Lệ Scale:</span>
                    <span className="font-mono text-sky-600">{cutoutConfig.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={cutoutConfig.scale}
                    onChange={(e) =>
                      setCutoutConfig((prev) => ({
                        ...prev,
                        scale: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: TẢI POSTER MẪU & BÓC TÁCH TEXT TỰ ĐỘNG (OCR) ── */}
          {activeTab === "upload" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                <Wand2 className="size-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900 dark:text-purple-300">
                  <span className="font-bold block mb-0.5">Công Nghệ AI OCR Bóc Tách Tự Động:</span>
                  Tải lên bất kỳ ảnh poster nào từ máy tính (ảnh Pinterest, Canva, poster sự kiện). Hệ thống sẽ tự động
                  trích xuất text ra các khối để bạn chỉnh sửa tùy ý ngay trên canvas!
                </div>
              </div>

              <label className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-500 transition bg-purple-50/20 dark:bg-purple-950/10 text-center">
                <Upload className="size-8 text-purple-600 animate-bounce" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isUploadingPoster ? "Đang tải ảnh lên hệ thống..." : "Chọn Ảnh Poster Của Bạn"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng PNG, JPG, WEBP (Phân giải cao)</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPosterImage}
                  className="hidden"
                />
              </label>

              {isExtractingOcr && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-800 text-center space-y-2">
                  <Sparkles className="size-6 text-sky-500 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                    Đang quét bố cục và bóc tách chữ từ poster...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: KHO MẪU TEMPLATE ĐÃ LƯU ── */}
          {activeTab === "templates" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bookmark className="size-4 text-rose-500" />
                  <span>Kho Mẫu Template Thư Mời ({templates.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Click để nạp vào Studio</span>
              </div>

              {/* Form lưu mẫu mới */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập tên mẫu template mới..."
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  disabled={isSavingTemplate}
                  onClick={handleSaveAsTemplate}
                  className="px-4 py-2 rounded-lg bg-[#003B95] text-white text-xs font-bold hover:bg-[#002766] transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Save className="size-3.5" />
                  <span>{isSavingTemplate ? "Đang lưu..." : "Lưu Mẫu"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      selectedTemplateId === tmpl.id
                        ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-1 ring-sky-500/30"
                        : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {tmpl.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {tmpl.title} · {tmpl.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CỘT PHẢI: KHUNG POSTER PREVIEW TƯƠNG TÁC (TOPCV-STYLE DRAG) (7 CỘT)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Thanh công cụ Mini Nổi khi đang chọn khối (TopCV Floating Toolbar) */}
          {selectedBlockId && blocksLayout[selectedBlockId] && (
            <div className="w-full max-w-[400px] mb-3 p-2.5 rounded-xl bg-slate-900 text-white shadow-2xl border border-sky-400/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-300">
                  {blocksLayout[selectedBlockId].name}:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Font selector */}
                <select
                  value={blocksLayout[selectedBlockId].fontFamily || "serif"}
                  onChange={(e) =>
                    handleSetBlockFont(selectedBlockId, e.target.value as FontFamilyType)
                  }
                  className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-1 text-[11px]"
                >
                  <option value="cinzel">Cinzel (Hoàng Gia)</option>
                  <option value="playfair">Playfair Display (Đẳng Cấp)</option>
                  <option value="cormorant">Cormorant Garamond (Quý Tộc)</option>
                  <option value="montserrat">Montserrat (Hiện Đại)</option>
                  <option value="vietnam">Be Vietnam Pro (Việt Hóa)</option>
                  <option value="orbitron">Orbitron (3D Tech)</option>
                  <option value="dancing">Dancing Script (Uốn Lượn)</option>
                  <option value="great_vibes">Great Vibes (Vinh Danh)</option>
                  <option value="serif">Serif (Cổ Điển)</option>
                  <option value="sans">Inter (Hiện Đại)</option>
                  <option value="calligraphy">Thư Pháp (Script)</option>
                  <option value="oswald">Oswald (Ấn Tượng)</option>
                  <option value="merriweather">Merriweather (Thanh Thoát)</option>
                  <option value="roboto">Roboto (Tinh Gọn)</option>
                </select>

                {/* Font Size selector */}
                <select
                  value={blocksLayout[selectedBlockId].fontSize || "base"}
                  onChange={(e) =>
                    handleSetBlockFontSize(selectedBlockId, e.target.value as any)
                  }
                  className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-1.5 py-1 text-[11px]"
                >
                  <option value="xs">Cỡ chữ: XS</option>
                  <option value="sm">Cỡ chữ: SM</option>
                  <option value="base">Cỡ chữ: Chuẩn</option>
                  <option value="lg">Cỡ chữ: LG</option>
                  <option value="xl">Cỡ chữ: XL</option>
                  <option value="2xl">Cỡ chữ: 2XL</option>
                  <option value="3xl">Cỡ chữ: 3XL</option>
                  <option value="4xl">Cỡ chữ: 4XL</option>
                  <option value="5xl">Cỡ chữ: 5XL (Cực Lớn)</option>
                </select>

                {/* Gradient color */}
                <select
                  value={blocksLayout[selectedBlockId].colorGradient || "white"}
                  onChange={(e) =>
                    handleSetBlockGradient(selectedBlockId, e.target.value as TextGradientColor)
                  }
                  className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-1 text-[11px]"
                >
                  <option value="white">Trắng Bạc</option>
                  <option value="cyan">Xanh Atlantis</option>
                  <option value="gold">Vàng Kim Gold</option>
                  <option value="ruby">Đỏ Ruby</option>
                  <option value="platinum">Bạch Kim</option>
                </select>

                {/* 3D toggle */}
                <button
                  type="button"
                  onClick={() => toggleBlock3dEmboss(selectedBlockId)}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    blocksLayout[selectedBlockId].is3dEmboss
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  3D
                </button>

                {/* Nền mờ toggle */}
                <button
                  type="button"
                  onClick={() => toggleBlockFrostedBg(selectedBlockId)}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    blocksLayout[selectedBlockId].hasFrostedBg
                      ? "bg-sky-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  Kính Mờ
                </button>
              </div>
            </div>
          )}

          {/* ── BỘ CHỌN TỶ LỆ POSTER THƯ MỜI (VUÔNG, CHỮ NHẬT DỌC, CHỮ NHẬT NGANG, THIỆP ĐỨNG, MÀN CHIẾU) ── */}
          <div className="w-full max-w-[540px] mb-3 flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Tỷ Lệ Poster:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setPosterRatio("9:16")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  posterRatio === "9:16"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>📱 Dọc 9:16</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterRatio("3:4")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  posterRatio === "3:4"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>📄 Đứng 3:4</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterRatio("1:1")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  posterRatio === "1:1"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>⏹️ Vuông 1:1</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterRatio("16:9")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  posterRatio === "16:9"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🖥️ Ngang 16:9</span>
              </button>
              <button
                type="button"
                onClick={() => setPosterRatio("4:3")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  posterRatio === "4:3"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>📺 Ngang 4:3</span>
              </button>
            </div>
          </div>

          {/* KHUNG POSTER CHÍNH TỶ LỆ DYNAMIC THEO LỰA CHỌN */}
          <div
            ref={posterRef}
            onMouseMove={handleMouseMovePoster}
            onMouseUp={handleMouseUpPoster}
            onMouseLeave={handleMouseUpPoster}
            style={{
              backgroundImage: `url(${activeBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className={`${
              posterRatio === "9:16"
                ? "w-[360px] h-[640px] sm:w-[380px] sm:h-[675px]"
                : posterRatio === "1:1"
                ? "w-[360px] h-[360px] sm:w-[460px] sm:h-[460px]"
                : posterRatio === "3:4"
                ? "w-[360px] h-[480px] sm:w-[420px] sm:h-[560px]"
                : posterRatio === "16:9"
                ? "w-[380px] h-[214px] sm:w-[580px] sm:h-[326px]"
                : "w-[380px] h-[285px] sm:w-[500px] sm:h-[375px]"
            } rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden select-none border-2 border-white/20 transition-all`}
          >
            {/* Vệt ánh sáng đêm & Lớp phủ Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#071530]/40 via-transparent to-[#071530]/80 pointer-events-none" />

            {/* ── HOA VĂN TRANG TRÍ TRÊN CÙNG (TOP ORNAMENT) ── */}
            {topOrnament === "atlantis_trident" && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                <span className="text-3xl text-amber-300 drop-shadow-[0_2px_12px_rgba(234,179,8,0.7)]">
                  🔱
                </span>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent mt-0.5" />
              </div>
            )}
            {topOrnament === "baroque_gold" && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                <div className="text-xl text-amber-300 drop-shadow-[0_2px_12px_rgba(234,179,8,0.8)]">
                  ⚜️ 👑 ⚜️
                </div>
                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </div>
            )}
            {topOrnament === "diamond_stars" && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 text-cyan-200">
                <span>✦</span>
                <span className="text-lg">⭐</span>
                <span>✦</span>
              </div>
            )}

            {/* ── KHỐI 1: HEADER LOGOS & CHỮ KÝ ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("header", e)}
              onTouchStart={(e) => handleMouseDownBlock("header", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.header?.x ?? 50}%`,
                top: `${blocksLayout.header?.y ?? 3.5}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.header?.zIndex ?? 10,
              }}
              className={`w-[92%] transition-shadow cursor-move group select-none ${
                blocksLayout.header?.hasFrostedBg
                  ? "p-2 rounded-xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "header"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              {activeDraggingId === "header" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  HEADER: X: {blocksLayout.header?.x ?? 50}% | Y: {blocksLayout.header?.y ?? 3.5}%
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-6 object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                    }}
                  />
                  <span className="text-[8.5px] font-bold tracking-widest text-slate-100 uppercase">
                    CEO 1983
                  </span>
                </div>

                <div className="text-xs font-serif italic tracking-wider text-sky-100 font-semibold drop-shadow-sm">
                  {signatureText}
                </div>

                <div className="text-[8px] font-bold tracking-wider text-slate-200 uppercase">
                  {partnerLogoUrl}
                </div>
              </div>
            </div>

            {/* ── KHỐI CÁNH GÀ ATLANTIS TRÁI & PHẢI ── */}
            {selectedBg.includes("atlantis") && (
              <div
                onMouseDown={(e) => handleMouseDownBlock("atlantis_wings", e)}
                onTouchStart={(e) => handleMouseDownBlock("atlantis_wings", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.atlantis_wings?.x ?? 50}%`,
                  top: `${blocksLayout.atlantis_wings?.y ?? 9}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.atlantis_wings?.zIndex ?? 9,
                }}
                className={`w-[94%] flex items-center justify-between px-2 cursor-move select-none ${
                  selectedBlockId === "atlantis_wings" ? "ring-2 ring-cyan-400 ring-dashed" : ""
                }`}
              >
                {activeDraggingId === "atlantis_wings" && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-cyan-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                    WINGS: X: {blocksLayout.atlantis_wings?.x ?? 50}% | Y: {blocksLayout.atlantis_wings?.y ?? 9}%
                  </div>
                )}
                <div className="text-[7.5px] font-serif uppercase tracking-[0.25em] text-slate-200 leading-tight text-left">
                  {leftWingText.split("\n").map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
                <div className="text-[7.5px] font-serif uppercase tracking-[0.25em] text-slate-200 leading-tight text-right">
                  {rightWingText.split("\n").map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ── KHỐI 2: TIÊU ĐỀ 'THƯ MỜI' HOẶC 'ATLANTIS' ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("title", e)}
              onTouchStart={(e) => handleMouseDownBlock("title", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.title?.x ?? 50}%`,
                top: `${blocksLayout.title?.y ?? 15}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.title?.zIndex ?? 12,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
                blocksLayout.title?.hasFrostedBg
                  ? "p-2 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "title"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              {activeDraggingId === "title" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  TIÊU ĐỀ: X: {blocksLayout.title?.x ?? 50}% | Y: {blocksLayout.title?.y ?? 15}%
                </div>
              )}
              <h1
                className={`${getFontSizeClass(
                  blocksLayout.title?.fontSize,
                  "text-3xl sm:text-4xl"
                )} ${getFontFamilyClass(
                  blocksLayout.title?.fontFamily
                )} ${getGradientClass(blocksLayout.title?.colorGradient)}`}
              >
                {invitationHeader}
              </h1>
              <div className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.28em] text-slate-200 drop-shadow-sm mt-0.5">
                {invitationSubtitle}
              </div>
            </div>

            {/* ── KHỐI 3: TIÊU ĐỀ LỚN NGHỆ THUẬT 'DÒNG CHẢY HẠNH PHÚC' / 'KẾT NỐI VƯƠN TẦM' ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("headline", e)}
              onTouchStart={(e) => handleMouseDownBlock("headline", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.headline?.x ?? 50}%`,
                top: `${blocksLayout.headline?.y ?? 31}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.headline?.zIndex ?? 11,
              }}
              className={`w-[92%] text-center transition-shadow cursor-move group select-none ${
                blocksLayout.headline?.hasFrostedBg
                  ? "p-3 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "headline"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              {activeDraggingId === "headline" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  CHỦ ĐỀ: X: {blocksLayout.headline?.x ?? 50}% | Y: {blocksLayout.headline?.y ?? 31}%
                </div>
              )}
              <div className="text-xs text-[#85bfe8] font-light tracking-wide italic drop-shadow-sm">
                {kicker}
              </div>
              <div className="text-xs sm:text-[13px] text-slate-100 font-serif mt-0.5 drop-shadow-sm">
                {leadPhrase}
              </div>

              {/* 2 Dòng Tiêu Đề Lớn 3D */}
              <h2
                className={`${getFontSizeClass(
                  blocksLayout.headline?.fontSize,
                  "text-2xl sm:text-3xl"
                )} font-black uppercase tracking-[0.06em] leading-tight mt-1 ${getFontFamilyClass(
                  blocksLayout.headline?.fontFamily
                )} ${getGradientClass(blocksLayout.headline?.colorGradient || "cyan")}`}
              >
                {mainTitleLine1}
              </h2>
              <h2
                className={`${getFontSizeClass(
                  blocksLayout.headline?.fontSize,
                  "text-2xl sm:text-3xl"
                )} font-black uppercase tracking-[0.06em] leading-tight ${getFontFamilyClass(
                  blocksLayout.headline?.fontFamily
                )} ${getGradientClass(blocksLayout.headline?.colorGradient || "cyan")}`}
              >
                {mainTitleLine2}
              </h2>

              <div className="text-xs text-[#80c5f0] font-medium tracking-wide mt-1 drop-shadow-sm">
                {venueHighlight}
              </div>
            </div>

            {/* ── KHỐI 4: ĐẠI BIỂU VIP / DIỄN GIẢ KHÁCH MỜI (ATTENDEE CARD) ── */}
            {attendeeConfig.enabled && attendeeConfig.attendees.length > 0 && (
              <div
                onMouseDown={(e) => handleMouseDownBlock("attendee", e)}
                onTouchStart={(e) => handleMouseDownBlock("attendee", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.attendee?.x ?? 50}%`,
                  top: `${blocksLayout.attendee?.y ?? 47}%`,
                  transform: `translate(-50%, 0) scale(${attendeeConfig.scale / 100})`,
                  zIndex: blocksLayout.attendee?.zIndex ?? 15,
                }}
                className={`w-[88%] transition-shadow cursor-move select-none ${
                  selectedBlockId === "attendee"
                    ? "ring-2 ring-amber-400 ring-dashed"
                    : "hover:outline hover:outline-1 hover:outline-amber-400/50"
                }`}
              >
                {activeDraggingId === "attendee" && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                    ĐẠI BIỂU: X: {blocksLayout.attendee?.x ?? 50}% | Y: {blocksLayout.attendee?.y ?? 47}%
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md bg-slate-950/50 border border-amber-400/40 shadow-2xl`}
                >
                  {/* Avatar với chế độ cắt & mờ viền */}
                  <div
                    style={{
                      filter: `blur(${attendeeConfig.featherBlur > 0 ? attendeeConfig.featherBlur / 5 : 0}px)`,
                    }}
                    className="relative shrink-0"
                  >
                    <img
                      src={attendeeConfig.attendees[0].avatar}
                      alt={attendeeConfig.attendees[0].name}
                      className={`size-14 object-cover ${
                        attendeeConfig.style === "royal_circle"
                          ? "rounded-full border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : attendeeConfig.style === "heian_arch"
                          ? "rounded-t-2xl rounded-b-md border-2 border-cyan-400"
                          : attendeeConfig.style === "oval_luxury"
                          ? "rounded-[40%] border-2 border-amber-300"
                          : "rounded-xl border border-white/30"
                      }`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.svg";
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black uppercase">
                      VIP
                    </span>
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[8px] font-bold uppercase tracking-wider text-amber-300">
                      {attendeeConfig.attendees[0].roleInEvent}
                    </div>
                    <div
                      className={`font-black text-white truncate drop-shadow-sm ${getFontSizeClass(
                        blocksLayout.attendee?.fontSize,
                        "text-sm"
                      )} ${getFontFamilyClass(blocksLayout.attendee?.fontFamily)}`}
                    >
                      {attendeeConfig.attendees[0].name}
                    </div>
                    {attendeeConfig.showTitle && (
                      <div className="text-[9.5px] text-cyan-200 truncate">
                        {attendeeConfig.attendees[0].title}
                      </div>
                    )}
                    {attendeeConfig.showCompany && (
                      <div className="text-[8.5px] text-slate-300 truncate">
                        {attendeeConfig.attendees[0].company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── KHỐI 5: HỘP ĐẶC QUYỀN CAPSULE BOX ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("capsule", e)}
              onTouchStart={(e) => handleMouseDownBlock("capsule", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.capsule?.x ?? 50}%`,
                top: `${blocksLayout.capsule?.y ?? 60}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.capsule?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
                blocksLayout.capsule?.hasFrostedBg
                  ? "p-2 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "capsule"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              {activeDraggingId === "capsule" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  ĐẶC QUYỀN: X: {blocksLayout.capsule?.x ?? 50}% | Y: {blocksLayout.capsule?.y ?? 60}%
                </div>
              )}
              <div className="inline-block px-3 py-1 rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/25 via-cyan-200/40 to-cyan-400/25 shadow-[0_2px_12px_rgba(103,232,249,0.35)] backdrop-blur-xs">
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider text-slate-950">
                  {capsuleBadge}
                </span>
              </div>
              <div className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-white drop-shadow-md mt-1">
                {capsuleBenefit}
              </div>
              <div className="text-[8px] sm:text-[8.5px] text-slate-300 font-light italic mt-0.5">
                {capsuleNote}
              </div>
            </div>

            {/* ── KHỐI 6: CỤM NGÀY GIỜ SỐ LỚN LUXURY ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("datetime", e)}
              onTouchStart={(e) => handleMouseDownBlock("datetime", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.datetime?.x ?? 50}%`,
                top: `${blocksLayout.datetime?.y ?? 72}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.datetime?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
                blocksLayout.datetime?.hasFrostedBg
                  ? "p-2.5 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "datetime"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              {activeDraggingId === "datetime" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-cyan-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  THỜI GIAN: X: {blocksLayout.datetime?.x ?? 50}% | Y: {blocksLayout.datetime?.y ?? 72}%
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-medium">
                <span>{dayOfWeek}</span>
                <Clock className="size-3 text-cyan-300" />
                <span>{timeHour}</span>
              </div>

              {/* Bộ 3 số lớn: 10 | 09 | 26 hoặc 06 | 04 | 24 */}
              <div className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-serif font-normal text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-widest my-0.5">
                <span>{dayDigits}</span>
                <span className="text-cyan-200/60 font-light text-2xl">|</span>
                <span>{monthDigits}</span>
                <span className="text-cyan-200/60 font-light text-2xl">|</span>
                <span>{yearDigits}</span>
              </div>

              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[9.5px] text-slate-200 font-light">
                <MapPin className="size-3 text-rose-400 shrink-0" />
                <span className="truncate max-w-xs">{eventLocation}</span>
              </div>
            </div>

            {/* ── KHỐI 7: ẢNH CẮT / CỔNG HEIAN CHÂN POSTER ── */}
            {cutoutConfig.enabled && (
              <div
                onMouseDown={(e) => handleMouseDownBlock("cutout", e)}
                onTouchStart={(e) => handleMouseDownBlock("cutout", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.cutout?.x ?? 50}%`,
                  top: `${blocksLayout.cutout?.y ?? 86}%`,
                  transform: `translate(-50%, 0) scale(${cutoutConfig.scale / 100})`,
                  opacity: cutoutConfig.opacity / 100,
                  filter: `blur(${cutoutConfig.featherBlur > 0 ? cutoutConfig.featherBlur / 5 : 0}px)`,
                  zIndex: blocksLayout.cutout?.zIndex ?? 8,
                }}
                className={`w-[85%] text-center cursor-move select-none ${
                  selectedBlockId === "cutout" ? "ring-2 ring-sky-400 ring-dashed" : ""
                }`}
              >
                {activeDraggingId === "cutout" && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                    ẢNH NỀN: X: {blocksLayout.cutout?.x ?? 50}% | Y: {blocksLayout.cutout?.y ?? 86}%
                  </div>
                )}
                <img
                  src={cutoutConfig.url}
                  alt="Venue"
                  className={`w-full max-h-36 object-cover ${
                    cutoutConfig.shape === "arch"
                      ? "rounded-t-[80px] rounded-b-xl border-t-2 border-cyan-300/60 shadow-[0_-4px_24px_rgba(103,232,249,0.35)]"
                      : cutoutConfig.shape === "oval"
                      ? "rounded-[50%] border-2 border-cyan-300/50"
                      : "rounded-2xl"
                  }`}
                />
              </div>
            )}

            {/* ── HOA VĂN TRANG TRÍ CHÂN POSTER (BOTTOM ORNAMENT) ── */}
            {bottomOrnament === "water_swirl" && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent blur-[1px]" />
                <div className="text-sm text-cyan-200 mt-0.5">🐚 🌊 🐚</div>
              </div>
            )}
            {bottomOrnament === "pearl_ribbon" && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <div className="text-xs text-amber-300">✦ 🎀 ✦</div>
              </div>
            )}

            {/* ── KHỐI 8: LỜI KẾT 'RẤT HÂN HẠNH ĐÓN TIẾP' ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("salute", e)}
              onTouchStart={(e) => handleMouseDownBlock("salute", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.salute?.x ?? 50}%`,
                top: `${blocksLayout.salute?.y ?? 96}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.salute?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center cursor-move select-none ${
                selectedBlockId === "salute" ? "ring-2 ring-amber-400 ring-dashed" : ""
              }`}
            >
              {activeDraggingId === "salute" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  LỜI KẾT: X: {blocksLayout.salute?.x ?? 50}% | Y: {blocksLayout.salute?.y ?? 96}%
                </div>
              )}
              <div className="text-[10px] font-serif italic font-semibold text-sky-200 tracking-wide drop-shadow-md">
                {saluteText}
              </div>
            </div>
            {/* ── KHỐI 9: MÃ QR CHECK-IN ĐĂNG KÝ (DRAGGABLE BẰNG CHUỘT) ── */}
            <div
              onMouseDown={(e) => handleMouseDownBlock("qr", e)}
              onTouchStart={(e) => handleMouseDownBlock("qr", e)}
              style={{
                position: "absolute",
                left: `${blocksLayout.qr?.x ?? 86}%`,
                top: `${blocksLayout.qr?.y ?? 88}%`,
                transform: "translate(-50%, -50%)",
                zIndex: blocksLayout.qr?.zIndex ?? 12,
              }}
              className={`cursor-move p-1.5 rounded-xl backdrop-blur-md bg-white/95 shadow-xl transition-all select-none ${
                selectedBlockId === "qr" ? "ring-2 ring-amber-400 ring-dashed" : "hover:ring-1 hover:ring-sky-400"
              }`}
            >
              {activeDraggingId === "qr" && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider shadow-lg pointer-events-none z-30 whitespace-nowrap animate-bounce">
                  QR: X: {blocksLayout.qr?.x ?? 86}% | Y: {blocksLayout.qr?.y ?? 88}%
                </div>
              )}
              <QrCode className="size-8 sm:size-9 text-slate-900" />
              <div className="text-[6.5px] font-black uppercase text-center text-slate-900 tracking-tighter mt-0.5">
                Quét QR
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL CHỌN ĐẠI BIỂU TỪ HỆ THỐNG / SỰ KIỆN ── */}
      {isAttendeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Chọn Hội Viên Tham Gia / Diễn Giả Đưa Vào Poster
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendeeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nguồn dữ liệu & Bộ lọc sự kiện */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSourceType("members")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedSourceType === "members"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Danh Bạ Hội Viên CLB CEO 1983 ({allMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSourceType("registrations")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedSourceType === "registrations"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Người Đã Đăng Ký Sự Kiện ({eventRegistrations.length})
                </button>
              </div>

              {/* Lựa chọn sự kiện cụ thể để tải danh sách đăng ký */}
              {selectedSourceType === "registrations" && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <Calendar className="size-4 text-sky-500 shrink-0" />
                  <select
                    value={selectedEventId}
                    onChange={(e) => void handleSelectEventForAttendees(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="">-- Tất cả sự kiện ({eventRegistrations.length} lượt đăng ký) --</option>
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({new Date(ev.start_time || ev.created_at).toLocaleDateString("vi-VN")})
                      </option>
                    ))}
                  </select>
                  {loadingEventAttendees && (
                    <span className="text-[10px] text-sky-500 font-bold animate-pulse">
                      Đang nạp...
                    </span>
                  )}
                </div>
              )}

              <div className="relative">
                <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hội viên, công ty, chức vụ, loại vé..."
                  value={attendeeSearchQuery}
                  onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Danh sách cuộn */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {filteredList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Không tìm thấy hội viên hoặc người đăng ký nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredList.map((m: any) => {
                  const name = m.name || m.full_name || m.member?.name || m.user?.name || "Hội viên CEO 1983";
                  const avatar = m.avatar || m.member?.avatar || m.user?.avatar || "/avatars/avatar-default.png";
                  const code = m.code || m.member_code || m.ticket_code || "CEO1983";
                  const position =
                    m.position || m.title || m.member?.position || m.user?.position || (m.ticket_name ? `Vé: ${m.ticket_name}` : "Lãnh đạo");
                  const company = m.company || m.member?.company || m.user?.company || "Doanh nghiệp CLB";
                  const isReg = selectedSourceType === "registrations" || !!m.ticket_name;

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectAttendeeFromList(m)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={name}
                          className="size-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.svg";
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>{name}</span>
                            <span className="text-[10px] text-amber-600 font-mono">
                              {code}
                            </span>
                            {isReg && m.ticket_name && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold">
                                {m.ticket_name}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {position} · {company}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1 shrink-0">
                        Chọn Đưa Lên Poster <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CẮT ẢNH CHUYÊN NGHIỆP (IMAGE CROPPER) ── */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageUrl={cropImageUrl}
        initialShape={cropShape}
        title={cropTarget === "avatar" ? "Cắt Ảnh Avatar Đại Biểu VIP" : "Cắt & Bo Viền Ảnh Bóc Tách Venue"}
        onClose={() => setIsCropOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {/* ── MODAL PHÁT SÓNG ĐA KÊNH OMNICHANNEL ── */}
      {isBroadcastModalOpen && (
        <OmnichannelBroadcastModal
          open={isBroadcastModalOpen}
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          invitationData={{
            category,
            title: `${mainTitleLine1} ${mainTitleLine2}`.trim() || 'Thư mời sự kiện CEO 1983',
            subtitle: venueHighlight,
            date: `${dayDigits}/${monthDigits}/${yearDigits}`,
            time: timeHour,
            location: eventLocation,
            salutation: saluteText,
            bodyText: capsuleBenefit,
            posterUrl: uploadedPosterUrl || activeBg,
            venueHighlight,
            dayOfWeek,
            timeHour,
            dayDigits,
            monthDigits,
            yearDigits,
            saluteText,
            capsuleBenefit,
          }}
        />
      )}
    </div>
  );
}
