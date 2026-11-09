import React, { useState, useEffect, useRef } from "react";
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
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export type InvitationCategory = "event" | "forum" | "meeting" | "b2b_meetup";
export type FontFamilyType = "serif" | "sans" | "cinzel" | "calligraphy" | "orbitron";
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
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
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
        avatar: "/avatars/avatar-default.png",
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
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState<"members" | "registrations">("members");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState<string>("");

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

  // Nạp danh sách hội viên & sự kiện đăng ký để làm nguồn chọn đại biểu
  useEffect(() => {
    fetchNestApi<any[]>("/members")
      .then((res) => {
        if (Array.isArray(res)) setAllMembers(res);
      })
      .catch(() => {});

    fetchNestApi<any>("/events/registrations")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list)) setEventRegistrations(list);
      })
      .catch(() => {});
  }, []);

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
      const res = await fetchNestApi<any>("/app-settings/invitation-templates");
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

  useEffect(() => {
    loadTemplatesFromBackend();
  }, []);

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

  // ── XỬ LÝ KÉO THẢ TỌA ĐỘ PHẦN TRĂM CHUẨN XÁC THEO CHUỘT (DRAG & DROP) ──
  const handleMouseDownBlock = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlockId(blockId);
    setActiveDraggingId(blockId);

    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const block = blocksLayout[blockId];
    if (!block) return;

    // Tọa độ pixel hiện tại của khối
    const blockPixelX = (block.x / 100) * rect.width;
    const blockPixelY = (block.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - blockPixelX,
      y: e.clientY - rect.top - blockPixelY,
    });
  };

  const handleMouseMovePoster = (e: React.MouseEvent) => {
    if (!activeDraggingId || !posterRef.current) return;

    const rect = posterRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

    // Chuyển đổi thành phần trăm % và giới hạn 0 - 100%
    const newX = Math.max(5, Math.min(95, Math.round((mouseX / rect.width) * 100)));
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

      await fetchNestApi("/app-settings/invitation-templates", {
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
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không thể khởi tạo Canvas 2D");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeBg;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => resolve(null); // fallback if CORS
      });

      ctx.fillStyle = "#071530";
      ctx.fillRect(0, 0, 1080, 1920);

      if (img.width > 0) {
        ctx.drawImage(img, 0, 0, 1080, 1920);
      }

      // Vẽ lớp gradient ban đêm và ánh sáng
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, "rgba(7, 21, 48, 0.4)");
      grad.addColorStop(0.5, "rgba(6, 18, 37, 0.15)");
      grad.addColorStop(1, "rgba(7, 21, 48, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Render Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 96px serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = 24;
      ctx.fillText(invitationHeader, 540, 280);

      ctx.shadowBlur = 0;
      ctx.font = "bold 28px sans-serif";
      ctx.fillStyle = "#E2E8F0";
      ctx.fillText(invitationSubtitle, 540, 340);

      // Headline
      ctx.fillStyle = "#67e8f9";
      ctx.font = "bold 32px serif";
      ctx.fillText(kicker, 540, 520);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 36px serif";
      ctx.fillText(leadPhrase, 540, 570);

      // 2 Dòng Tiêu Đề Cỡ Đại
      ctx.font = "900 84px serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(56, 189, 248, 0.7)";
      ctx.shadowBlur = 32;
      ctx.fillText(mainTitleLine1, 540, 680);
      ctx.fillText(mainTitleLine2, 540, 770);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(venueHighlight, 540, 830);

      // Ngày giờ Luxury
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(`${dayOfWeek}  |  ${timeHour}`, 540, 1260);

      ctx.font = "900 110px serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.fillText(`${dayDigits}  |  ${monthDigits}  |  ${yearDigits}`, 540, 1370);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "28px sans-serif";
      ctx.fillText(eventLocation, 540, 1430);

      // Lời chào
      ctx.fillStyle = "#38bdf8";
      ctx.font = "italic bold 32px serif";
      ctx.fillText(saluteText, 540, 1820);

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

  // Helper font class
  const getFontFamilyClass = (f?: FontFamilyType) => {
    switch (f) {
      case "serif":
        return "font-serif";
      case "cinzel":
        return "font-serif tracking-widest uppercase";
      case "calligraphy":
        return "font-serif italic";
      case "orbitron":
        return "font-mono font-bold tracking-wider";
      case "sans":
      default:
        return "font-sans";
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

  // Lọc danh sách hội viên trong modal
  const filteredMembers = allMembers.filter((m) => {
    const q = attendeeSearchQuery.toLowerCase();
    return (
      (m.name || m.full_name || "").toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q) ||
      (m.code || "").toLowerCase().includes(q)
    );
  });

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
            </div>
          )}

          {/* ── TAB 2: ĐẠI BIỂU VIP & DIỄN GIẢ KHÁCH MỜI (DYNAMIC ATTENDEES) ── */}
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
                      Lấy từ danh sách hội viên đăng ký sự kiện hoặc CLB
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAttendeeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <UserPlus className="size-3.5" />
                  <span>Chọn Hội Viên</span>
                </button>
              </div>

              {/* Công tắc Bật / Tắt khối đại biểu */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hiển Thị Khối Đại Biểu VIP Trên Poster:
                </span>
                <input
                  type="checkbox"
                  checked={attendeeConfig.enabled}
                  onChange={(e) =>
                    setAttendeeConfig((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className="size-4 rounded text-sky-600"
                />
              </div>

              {/* Danh sách đại biểu đang chọn */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Đại biểu / Diễn giả đã chọn ({attendeeConfig.attendees.length}):
                </label>
                {attendeeConfig.attendees.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-amber-300/40 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={att.avatar}
                        alt={att.name}
                        className="size-10 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.png";
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{att.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                            {att.roleInEvent}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {att.title} · {att.company}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttendeeConfig((prev) => ({
                          ...prev,
                          attendees: prev.attendees.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-base mb-1">{st.icon}</div>
                      <div>{st.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Mờ Viền Ảnh (Soft Feather) & Tỉ lệ Scale */}
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Độ Mờ Viền Hòa Nền (Soft Feathering Blur):</span>
                    <span className="font-mono text-amber-600">{attendeeConfig.featherBlur}px</span>
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
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Làm 4 cạnh của ảnh mờ dần hòa tan tự nhiên vào poster mà không cần Photoshop!
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Kích Thước Thẻ Đại Biểu:</span>
                    <span className="font-mono text-amber-600">{attendeeConfig.scale}%</span>
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
                    className="w-full accent-amber-500"
                  />
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

              <div className="flex items-center gap-1.5">
                {/* Font selector */}
                <select
                  value={blocksLayout[selectedBlockId].fontFamily || "serif"}
                  onChange={(e) =>
                    handleSetBlockFont(selectedBlockId, e.target.value as FontFamilyType)
                  }
                  className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-1 text-[11px]"
                >
                  <option value="serif">Playfair (Serif)</option>
                  <option value="cinzel">Cinzel (La Mã)</option>
                  <option value="calligraphy">Thư Pháp</option>
                  <option value="sans">Inter (Hiện đại)</option>
                  <option value="orbitron">Orbitron (3D)</option>
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

          {/* KHUNG POSTER CHÍNH TỶ LỆ 9:16 (360x640) */}
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
            className="w-[360px] h-[640px] sm:w-[380px] sm:h-[675px] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden select-none border-2 border-white/20 transition-all"
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
              style={{
                position: "absolute",
                left: `${blocksLayout.header?.x ?? 50}%`,
                top: `${blocksLayout.header?.y ?? 3.5}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.header?.zIndex ?? 10,
              }}
              className={`w-[92%] transition-shadow cursor-move group ${
                blocksLayout.header?.hasFrostedBg
                  ? "p-2 rounded-xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "header"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-6 object-contain drop-shadow-md"
                    onError={(e) => {
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
                style={{
                  position: "absolute",
                  left: `${blocksLayout.atlantis_wings?.x ?? 50}%`,
                  top: `${blocksLayout.atlantis_wings?.y ?? 9}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.atlantis_wings?.zIndex ?? 9,
                }}
                className={`w-[94%] flex items-center justify-between px-2 cursor-move ${
                  selectedBlockId === "atlantis_wings" ? "ring-2 ring-cyan-400 ring-dashed" : ""
                }`}
              >
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
              style={{
                position: "absolute",
                left: `${blocksLayout.title?.x ?? 50}%`,
                top: `${blocksLayout.title?.y ?? 15}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.title?.zIndex ?? 12,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group ${
                blocksLayout.title?.hasFrostedBg
                  ? "p-2 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "title"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              <h1
                className={`text-3xl sm:text-4xl ${getFontFamilyClass(
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
              style={{
                position: "absolute",
                left: `${blocksLayout.headline?.x ?? 50}%`,
                top: `${blocksLayout.headline?.y ?? 31}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.headline?.zIndex ?? 11,
              }}
              className={`w-[92%] text-center transition-shadow cursor-move group ${
                blocksLayout.headline?.hasFrostedBg
                  ? "p-3 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "headline"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
              <div className="text-xs text-[#85bfe8] font-light tracking-wide italic drop-shadow-sm">
                {kicker}
              </div>
              <div className="text-xs sm:text-[13px] text-slate-100 font-serif mt-0.5 drop-shadow-sm">
                {leadPhrase}
              </div>

              {/* 2 Dòng Tiêu Đề Lớn 3D */}
              <h2
                className={`text-2xl sm:text-3xl font-black uppercase tracking-[0.06em] leading-tight mt-1 ${getFontFamilyClass(
                  blocksLayout.headline?.fontFamily
                )} ${getGradientClass(blocksLayout.headline?.colorGradient || "cyan")}`}
              >
                {mainTitleLine1}
              </h2>
              <h2
                className={`text-2xl sm:text-3xl font-black uppercase tracking-[0.06em] leading-tight ${getFontFamilyClass(
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
                style={{
                  position: "absolute",
                  left: `${blocksLayout.attendee?.x ?? 50}%`,
                  top: `${blocksLayout.attendee?.y ?? 47}%`,
                  transform: `translate(-50%, 0) scale(${attendeeConfig.scale / 100})`,
                  zIndex: blocksLayout.attendee?.zIndex ?? 15,
                }}
                className={`w-[88%] transition-shadow cursor-move ${
                  selectedBlockId === "attendee"
                    ? "ring-2 ring-amber-400 ring-dashed"
                    : "hover:outline hover:outline-1 hover:outline-amber-400/50"
                }`}
              >
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
                        (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.png";
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
                    <div className="text-sm font-serif font-black text-white truncate drop-shadow-sm">
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
              style={{
                position: "absolute",
                left: `${blocksLayout.capsule?.x ?? 50}%`,
                top: `${blocksLayout.capsule?.y ?? 60}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.capsule?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group ${
                blocksLayout.capsule?.hasFrostedBg
                  ? "p-2 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "capsule"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
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
              style={{
                position: "absolute",
                left: `${blocksLayout.datetime?.x ?? 50}%`,
                top: `${blocksLayout.datetime?.y ?? 72}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.datetime?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center transition-shadow cursor-move group ${
                blocksLayout.datetime?.hasFrostedBg
                  ? "p-2.5 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                  : ""
              } ${
                selectedBlockId === "datetime"
                  ? "ring-2 ring-amber-400 ring-dashed"
                  : "hover:outline hover:outline-1 hover:outline-sky-400/50"
              }`}
            >
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
                style={{
                  position: "absolute",
                  left: `${blocksLayout.cutout?.x ?? 50}%`,
                  top: `${blocksLayout.cutout?.y ?? 86}%`,
                  transform: `translate(-50%, 0) scale(${cutoutConfig.scale / 100})`,
                  opacity: cutoutConfig.opacity / 100,
                  filter: `blur(${cutoutConfig.featherBlur > 0 ? cutoutConfig.featherBlur / 5 : 0}px)`,
                  zIndex: blocksLayout.cutout?.zIndex ?? 8,
                }}
                className={`w-[85%] text-center cursor-move ${
                  selectedBlockId === "cutout" ? "ring-2 ring-sky-400 ring-dashed" : ""
                }`}
              >
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
              style={{
                position: "absolute",
                left: `${blocksLayout.salute?.x ?? 50}%`,
                top: `${blocksLayout.salute?.y ?? 96}%`,
                transform: "translate(-50%, 0)",
                zIndex: blocksLayout.salute?.zIndex ?? 10,
              }}
              className={`w-[90%] text-center cursor-move ${
                selectedBlockId === "salute" ? "ring-2 ring-amber-400 ring-dashed" : ""
              }`}
            >
              <div className="text-[10px] font-serif italic font-semibold text-sky-200 tracking-wide drop-shadow-md">
                {saluteText}
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

            {/* Nguồn dữ liệu & Tìm kiếm */}
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
                  Hội Viên Đăng Ký Sự Kiện ({eventRegistrations.length})
                </button>
              </div>

              <div className="relative">
                <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hội viên, công ty, chức vụ..."
                  value={attendeeSearchQuery}
                  onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Danh sách cuộn */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Không tìm thấy hội viên nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectAttendeeFromList(m)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar || "/avatars/avatar-default.png"}
                        alt={m.name}
                        className="size-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/avatars/avatar-default.png";
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{m.name || m.full_name}</span>
                          <span className="text-[10px] text-amber-600 font-mono">
                            {m.code || "CEO1983"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {m.position || m.title || "Lãnh đạo"} · {m.company || "Doanh nghiệp CLB"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 shrink-0">
                      Chọn <ChevronRight className="size-3.5" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
