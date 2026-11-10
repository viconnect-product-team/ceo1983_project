import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Upload,
  Sparkles,
  Download,
  Save,
  Send,
  Eye,
  EyeOff,
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
  Lock,
  Unlock,
  RotateCw,
  RefreshCw,
  X,
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
  hasFrostedBg: boolean;
  fontFamily?: FontFamilyType;
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  colorGradient?: TextGradientColor;
  is3dEmboss?: boolean;
  zIndex?: number;
  visible?: boolean;
}

export interface CustomTextLayer {
  id: string;
  text: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  fontFamily: FontFamilyType;
  fontSize: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  colorGradient: TextGradientColor;
  is3dEmboss: boolean;
  hasFrostedBg: boolean;
  zIndex: number;
}

export type ImageShapeType = "rectangle" | "rounded" | "circle" | "arch" | "oval";

export interface CustomImageLayer {
  id: string;
  name: string;
  url: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // 40 - 500 px
  height: number; // 40 - 500 px
  scale: number; // 20 - 300%
  opacity: number; // 10 - 100%
  rotation: number; // -180 to 180 deg
  shape: ImageShapeType;
  featherBlur: number; // 0 - 40px
  lockAspect: boolean;
  zIndex: number;
  visible: boolean;
}

export type CutoutShape = "arch" | "soft_feather" | "oval" | "rounded" | "cinema";

export interface CutoutImageConfig {
  enabled: boolean;
  url: string;
  shape: CutoutShape;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  featherBlur: number;
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
  roleInEvent?: string;
}

export interface AttendeeBlockConfig {
  enabled: boolean;
  x: number;
  y: number;
  scale: number;
  featherBlur: number;
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
  bgDarkness?: number;
  bgBlur?: number;
  logoUrl?: string;
  partnerLogoUrl?: string;
  themeGlowColor?: "gold" | "cyan" | "royal";
  topOrnament?: TopOrnamentType;
  bottomOrnament?: BottomOrnamentType;
  qrValue?: string;
  posterUrl?: string;
  posterRatio?: "9:16" | "1:1" | "16:9" | "3:4" | "4:3";
  blocksLayout?: Record<string, TextBlockLayout>;
  customImageLayers?: CustomImageLayer[];
  customTextLayers?: CustomTextLayer[];
  cutoutConfig?: CutoutImageConfig;
  attendeeConfig?: AttendeeBlockConfig;
  updatedAt?: string;
}

// Bố cục mặc định chuẩn Pinterest (Tọa độ phần trăm X, Y - Căn chỉnh khoảng cách vàng không chồng lấn)
const DEFAULT_BLOCKS: Record<string, TextBlockLayout> = {
  header: { id: "header", name: "Thanh Logo & Chữ ký", x: 50, y: 3.5, hasFrostedBg: false, zIndex: 10, visible: true },
  atlantis_wings: { id: "atlantis_wings", name: "Cánh Gà Trái Phải Atlantis", x: 50, y: 8, hasFrostedBg: false, zIndex: 9, visible: true },
  title: { id: "title", name: "Tiêu đề 'Thư mời' / 'ATLANTIS'", x: 50, y: 13, hasFrostedBg: false, zIndex: 12, visible: true },
  headline: { id: "headline", name: "Cụm Tiêu Đề Lớn 'KẾT NỐI DOANH NHÂN'", x: 50, y: 22, hasFrostedBg: false, zIndex: 11, visible: true },
  attendee: { id: "attendee", name: "Đại Biểu Danh Dự / Diễn Giả Khách Mời", x: 50, y: 48, hasFrostedBg: false, zIndex: 15, visible: true },
  capsule: { id: "capsule", name: "Hộp Quà Tặng / Đặc Quyền Capsule", x: 50, y: 66, hasFrostedBg: false, zIndex: 10, visible: true },
  datetime: { id: "datetime", name: "Cụm Ngày Giờ Số Lớn 06 | 04 | 24", x: 50, y: 76, hasFrostedBg: false, zIndex: 10, visible: true },
  cutout: { id: "cutout", name: "Khối Ảnh Bóc Tách / Cổng Chào Venue", x: 50, y: 85, hasFrostedBg: false, zIndex: 8, visible: true },
  salute: { id: "salute", name: "Lời kết 'Rất hân hạnh được đón tiếp!'", x: 50, y: 94, hasFrostedBg: false, zIndex: 10, visible: true },
  qr: { id: "qr", name: "Mã QR Check-in Đăng Ký", x: 86, y: 88, hasFrostedBg: false, zIndex: 12, visible: true },
};

// Preset Thư Viện Ảnh Nền Sự Kiện & Hội Nghị Doanh Nhân
const BACKGROUND_PRESETS = [
  {
    id: "atlantis_royal_palace",
    name: "Cung Điện Atlantis Hoàng Gia",
    tag: "Pinterest 374009944081934333",
    url: "/templates/atlantis_palace_poster.jpg",
  },
  {
    id: "heian_wyndham",
    name: "Wyndham Thanh Thủy (Heian Villas)",
    tag: "Pinterest 501447739786387302",
    url: "/templates/pinterest_heian_invitation.jpg",
  },
  {
    id: "skyline_cosmos",
    name: "Thành Phố Vươn Tầm (Cosmos Deep)",
    tag: "Cosmos Blue",
    url: "/ceo1983_hero_cosmos_skyline.jpg",
  },
  {
    id: "skyline_contrast",
    name: "Thành Phố Dạ Tiệc (Contrast)",
    tag: "Night Lights",
    url: "/skyline_perspective_contrast.jpg",
  },
  {
    id: "skyline_daylight",
    name: "Thành Phố Khát Vọng (Daylight)",
    tag: "Daylight Gold",
    url: "/ceo1983_hero_daylight_skyline.jpg",
  },
  {
    id: "luxury_gold_hall",
    name: "Hội Trường Dạ Tiệc Hoàng Kim",
    tag: "Gala Baroque",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "royal_navy_gala",
    name: "Sân Khấu Đại Nhạc Hội & Đêm Sao",
    tag: "Concert Stage",
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "velvet_ruby",
    name: "Thảm Đỏ Danh Vọng & Dạ Tiệc Doanh Nhân",
    tag: "Red Carpet",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
];

// Preset Sticker / Con Dấu & Huy Hiệu Doanh Nhân Sẵn Có
const STICKER_PRESETS = [
  { id: "heian_gate", name: "Cổng Vòm Heian Venue", url: "/templates/heian_gate_venue.jpg" },
  { id: "ceo1983_crest", name: "Huy Hiệu Vàng CEO 1983", url: "/app-icon.png" },
  { id: "official_logo", name: "Logo HanoiBA & CEO 1983", url: "/ceo1983-official-logo.png" },
];

// Module-level in-memory cache chống loop call API tuyệt đối
let globalMembersCache: any[] | null = null;
let globalEventsCache: any[] | null = null;
let globalTemplatesCache: InvitationTemplate[] | null = null;

// Preset Avatar Đại Biểu Doanh Nhân (Ảnh vector doanh nhân cao cấp, ánh sáng tương phản sắc nét chuẩn mực)
const SAFE_FALLBACK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cdefs%3E%3ClinearGradient id='bgGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%23020617'/%3E%3C/linearGradient%3E%3ClinearGradient id='skinGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fde0d0'/%3E%3Cstop offset='100%25' stop-color='%23f6ad92'/%3E%3C/linearGradient%3E%3ClinearGradient id='hairGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3ClinearGradient id='suitGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23002B66'/%3E%3Cstop offset='100%25' stop-color='%23001433'/%3E%3C/linearGradient%3E%3ClinearGradient id='goldGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fde68a'/%3E%3Cstop offset='50%25' stop-color='%23f59e0b'/%3E%3Cstop offset='100%25' stop-color='%23b45309'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='160' height='160' fill='url(%23bgGrad)' rx='80'/%3E%3Ccircle cx='80' cy='80' r='76' fill='none' stroke='url(%23goldGrad)' stroke-width='3'/%3E%3Cpath d='M24 160 C24 118, 52 108, 80 108 C108 108, 136 118, 136 160 Z' fill='url(%23suitGrad)'/%3E%3Cpolygon points='80,106 64,122 80,132 96,122' fill='%23FFFFFF'/%3E%3Cpolygon points='80,118 75,126 80,154 85,126' fill='url(%23goldGrad)'/%3E%3Crect x='72' y='86' width='16' height='24' fill='url(%23skinGrad)' rx='4'/%3E%3Cellipse cx='80' cy='64' rx='28' ry='32' fill='url(%23skinGrad)'/%3E%3Cpath d='M52 56 C52 32, 70 26, 80 26 C94 26, 108 34, 108 54 C104 46, 92 42, 80 44 C68 46, 58 50, 52 56 Z' fill='url(%23hairGrad)'/%3E%3Cpath d='M52 56 C51 68, 54 74, 55 76 C56 68, 57 60, 59 58 Z' fill='url(%23hairGrad)'/%3E%3Cpath d='M108 54 C109 66, 106 72, 105 76 C104 68, 103 60, 101 58 Z' fill='url(%23hairGrad)'/%3E%3Cpath d='M62 58 Q70 54 75 58' stroke='%231e293b' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3Cpath d='M85 58 Q90 54 98 58' stroke='%231e293b' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3Cellipse cx='69' cy='65' rx='3.5' ry='2' fill='%230f172a'/%3E%3Cellipse cx='91' cy='65' rx='3.5' ry='2' fill='%230f172a'/%3E%3Cpath d='M72 82 Q80 88 88 82' stroke='%23b45309' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='104' cy='128' r='4' fill='url(%23goldGrad)' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E";

const EXECUTIVE_AVATAR_PRESETS = [
  { id: "ceo_pham_vu", name: "Chủ tịch Phạm Vũ", url: "/ceo-portrait-default.png" },
  { id: "female_ceo", name: "Chân Dung CEO Nữ", url: "/landing_web_vione/professional-portrait.png" },
  { id: "saas_ceo", name: "Doanh Nhân Công Nghệ", url: "/landing_web_vione/saas-portrait.png" },
  { id: "young_ceo", name: "Doanh Nhân Trẻ", url: "/landing_web_vione/avatar-ceo.png" },
  { id: "male_young", name: "Doanh Nhân Nam", url: "/vietnamese-young-male-ceo-avatar.png" },
  { id: "crest_gold", name: "Huy Hiệu Vàng 3D", url: "/app-icon.png" },
  { id: "official_logo", name: "Logo HanoiBA & CEO 1983", url: "/ceo1983-official-logo.png" },
];

export function InvitationTemplateStudio() {
  const [category, setCategory] = useState<InvitationCategory>("event");

  // Photoshop Studio Tabs:
  const [activeTab, setActiveTab] = useState<
    "background" | "layers" | "content" | "attendee" | "ornaments" | "upload" | "templates"
  >("background");

  // ── 1. BACKGROUND STATE (ẢNH NỀN) ──
  const [selectedBg, setSelectedBg] = useState<string>("/templates/atlantis_palace_poster.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [bgDarkness, setBgDarkness] = useState<number>(45); // 0 - 100%
  const [bgBlur, setBgBlur] = useState<number>(0); // 0 - 20px
  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);

  // ── 2. MULTI-IMAGE LAYERS STATE (CÁC LỚP ẢNH TỰ DO) ──
  const [imageLayers, setImageLayers] = useState<CustomImageLayer[]>([
    {
      id: "img_venue_gate",
      name: "Ảnh Cổng Chào Venue Heian",
      url: "/templates/heian_gate_venue.jpg",
      x: 50,
      y: 86,
      width: 320,
      height: 140,
      scale: 90,
      opacity: 95,
      rotation: 0,
      shape: "arch",
      featherBlur: 10,
      lockAspect: true,
      zIndex: 8,
      visible: true,
    },
  ]);
  const [selectedImageLayerId, setSelectedImageLayerId] = useState<string | null>("img_venue_gate");
  const [isUploadingImageLayer, setIsUploadingImageLayer] = useState<boolean>(false);

  // ── 3. TEXT FIELDS & CUSTOM TEXT LAYERS (SỬA, XÓA, THÊM CHỮ) ──
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string>("HANOIBA & VICONNECT");
  const [signatureText, setSignatureText] = useState<string>("HERA COLLECTION");
  const [invitationHeader, setInvitationHeader] = useState<string>("ATLANTIS");
  const [invitationSubtitle, setInvitationSubtitle] = useState<string>("HERA COLLECTION · SPRING / SUMMER 2026");
  const [leftWingText, setLeftWingText] = useState<string>("FASHION\nMYTHOLOGY\nCREATIVITY");
  const [rightWingText, setRightWingText] = useState<string>("BEYOND\nTHE SURFACE\nINNOVATION");
  const [kicker, setKicker] = useState<string>("O OLIMPO SE ABRE MAIS UMA VEZ.");
  const [leadPhrase, setLeadPhrase] = useState<string>("Venha vivenciar Atlantis, a nova coleção da Hera");
  const [mainTitleLine1, setMainTitleLine1] = useState<string>("KẾT NỐI DOANH NHÂN");
  const [mainTitleLine2, setMainTitleLine2] = useState<string>("THỊNH VƯỢNG 1983");
  const [venueHighlight, setVenueHighlight] = useState<string>("tại HABBLET HOTEL & LANDMARK 72");
  const [capsuleBadge, setCapsuleBadge] = useState<string>("+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES");
  const [capsuleBenefit, setCapsuleBenefit] = useState<string>("ĐẶC QUYỀN DOANH NHÂN SỐ & BỘ QUÀ TẶNG THÀNH VIÊN HERA");
  const [capsuleNote, setCapsuleNote] = useState<string>("(Trang sức ngọc trai và huy hiệu đinh ba mạ vàng)");
  const [dayOfWeek, setDayOfWeek] = useState<string>("DATA");
  const [timeHour, setTimeHour] = useState<string>("21:30");
  const [dayDigits, setDayDigits] = useState<string>("10");
  const [monthDigits, setMonthDigits] = useState<string>("09");
  const [yearDigits, setYearDigits] = useState<string>("26");
  const [eventLocation, setEventLocation] = useState<string>("HABBLET HOTEL & CUNG ĐIỆN HERA");
  const [saluteText, setSaluteText] = useState<string>("Rất hân hạnh được đón tiếp!");
  const [qrValue, setQrValue] = useState<string>("https://ceo1983.viconnect.vn/association/events?action=register");

  // Dòng chữ mới do người dùng tự thêm tự do (Custom Text Layers)
  const [customTextLayers, setCustomTextLayers] = useState<CustomTextLayer[]>([]);
  const [selectedCustomTextId, setSelectedCustomTextId] = useState<string | null>(null);

  // Ornaments
  const [topOrnament, setTopOrnament] = useState<TopOrnamentType>("atlantis_trident");
  const [bottomOrnament, setBottomOrnament] = useState<BottomOrnamentType>("water_swirl");

  // ── 4. ATTENDEES STATE (ĐẠI BIỂU & CALL API ĐĂNG KÝ) ──
  const [attendeeConfig, setAttendeeConfig] = useState<AttendeeBlockConfig>({
    enabled: true,
    x: 50,
    y: 48,
    scale: 100,
    featherBlur: 14,
    style: "royal_circle",
    attendees: [
      {
        id: "att-1",
        name: "Phạm Vũ",
        title: "Chủ tịch HĐQT & Sáng Lập",
        company: "VICONNECT GROUP",
        avatar: "/ceo-portrait-default.png",
        memberCode: "CEO1983-088",
        roleInEvent: "Diễn giả chính (Keynote Speaker)",
      },
    ],
    hasFrostedBg: false,
    showTitle: true,
    showCompany: true,
  });
  const [allMembers, setAllMembers] = useState<any[]>(() => globalMembersCache || []);
  const [eventsList, setEventsList] = useState<any[]>(() => globalEventsCache || []);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEventAttendees, setLoadingEventAttendees] = useState<boolean>(false);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState<"members" | "registrations">("members");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState<string>("");
  const [isUploadingAttendeeAvatar, setIsUploadingAttendeeAvatar] = useState<boolean>(false);
  const attendeeFileInputRef = useRef<HTMLInputElement>(null);

  // ── 5. TỶ LỆ POSTER, ZOOM & CẮT ẢNH ──
  const [posterRatio, setPosterRatio] = useState<"9:16" | "1:1" | "16:9" | "3:4" | "4:3">("9:16");
  const [zoomLevel, setZoomLevel] = useState<number>(85); // 50% - 150%, mặc định 85% tối ưu hiển thị trọn vẹn toàn bộ poster trong tầm nhìn
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<"avatar" | "layer" | null>(null);
  const [cropShape, setCropShape] = useState<"circle" | "square" | "arch" | "oval">("circle");

  // ── 6. CANVAS SELECTION & DRAG & DROP ──
  const [blocksLayout, setBlocksLayout] = useState<Record<string, TextBlockLayout>>(DEFAULT_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("headline");
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<"block" | "image" | "custom_text" | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── 7. TEMPLATES WAREHOUSE (KHO MẪU & XÓA MẪU) ──
  const [templateNameInput, setTemplateNameInput] = useState<string>("");
  const [templates, setTemplates] = useState<InvitationTemplate[]>(() => globalTemplatesCache || []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [isDeletingTemplateId, setIsDeletingTemplateId] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const activeBg = customBgUrl.trim() || selectedBg;
  const didInitRef = useRef<boolean>(false);

  // Nạp danh sách hội viên & sự kiện (1 lần duy nhất, module cache chống loop call API)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (!globalMembersCache) {
      fetchNestApi<any[]>("/members")
        .then((res) => {
          const list = Array.isArray(res) ? res : (res as any)?.items || (res as any)?.data || [];
          if (Array.isArray(list)) {
            globalMembersCache = list;
            setAllMembers(list);
          }
        })
        .catch(() => {});
    }

    if (!globalEventsCache) {
      fetchNestApi<any>("/events")
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.items || res?.data || [];
          if (Array.isArray(list)) {
            globalEventsCache = list;
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
    } else if (globalEventsCache.length > 0 && !selectedEventId) {
      setSelectedEventId(globalEventsCache[0].id);
    }

    if (!globalTemplatesCache) {
      loadTemplatesFromBackend();
    }
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

  // ── XỬ LÝ TẢI ẢNH ĐẠI BIỂU TỪ MÁY TÍNH ──
  const handleUploadAttendeeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAttendeeAvatar(true);
    try {
      const res = await uploadFileToNest(file, "avatars");
      const uploadedUrl = (res as any)?.url || (res as any)?.data?.url || (typeof res === "string" ? res : "");
      if (uploadedUrl) {
        setAttendeeConfig((prev) => ({
          ...prev,
          enabled: true,
          attendees: prev.attendees.map((a, idx) => (idx === 0 ? { ...a, avatar: uploadedUrl } : a)),
        }));
        toast.success("✓ Đã tải ảnh đại biểu lên thành công!");
      }
    } catch (err: any) {
      toast.error(err.message || "Tải ảnh đại biểu thất bại");
    } finally {
      setIsUploadingAttendeeAvatar(false);
      if (attendeeFileInputRef.current) attendeeFileInputRef.current.value = "";
    }
  };

  // ── XỬ LÝ BACKGROUND: TẢI ẢNH TỪ MÁY HOẶC URL ──
  const handleUploadBgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setCustomBgUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      const uploaded = await uploadFileToNest(file, "templates");
      if (uploaded?.url) {
        setCustomBgUrl(uploaded.url);
        toast.success("✓ Đã tải ảnh nền poster mới thành công!");
      }
    } catch (err: any) {
      toast.error(`Lỗi tải ảnh nền: ${err.message || "Thử lại sau"}`);
    } finally {
      setIsUploadingBg(false);
      e.target.value = "";
    }
  };

  // ── XỬ LÝ THÊM LỚP ẢNH MỚI (MULTI-IMAGE LAYERS) ──
  const handleAddImageLayerFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImageLayer(true);
    try {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const newLayer: CustomImageLayer = {
          id: `img_${Date.now()}`,
          name: file.name.substring(0, 24) || `Ảnh ${imageLayers.length + 1}`,
          url: dataUrl,
          x: 50,
          y: 50,
          width: 180,
          height: 180,
          scale: 100,
          opacity: 100,
          rotation: 0,
          shape: "rounded",
          featherBlur: 0,
          lockAspect: true,
          zIndex: 10 + imageLayers.length,
          visible: true,
        };
        setImageLayers((prev) => [...prev, newLayer]);
        setSelectedImageLayerId(newLayer.id);
        setActiveTab("layers");
      };
      reader.readAsDataURL(file);

      const uploaded = await uploadFileToNest(file, "stickers");
      if (uploaded?.url) {
        setImageLayers((prev) =>
          prev.map((l) => (l.url.startsWith("data:") ? { ...l, url: uploaded.url } : l))
        );
        toast.success("✓ Đã thêm lớp ảnh mới vào poster!");
      }
    } catch (err: any) {
      toast.error(`Lỗi tải ảnh: ${err.message || "Thử lại"}`);
    } finally {
      setIsUploadingImageLayer(false);
      e.target.value = "";
    }
  };

  const handleAddPresetSticker = (preset: { id: string; name: string; url: string }) => {
    const newLayer: CustomImageLayer = {
      id: `img_${Date.now()}`,
      name: preset.name,
      url: preset.url,
      x: 50,
      y: 65,
      width: 160,
      height: 160,
      scale: 100,
      opacity: 100,
      rotation: 0,
      shape: "rounded",
      featherBlur: 0,
      lockAspect: true,
      zIndex: 10 + imageLayers.length,
      visible: true,
    };
    setImageLayers((prev) => [...prev, newLayer]);
    setSelectedImageLayerId(newLayer.id);
    setActiveTab("layers");
    toast.success(`Đã thêm "${preset.name}" lên poster! Bạn có thể kéo thả và đổi kích thước.`);
  };

  const handleDeleteImageLayer = (layerId: string) => {
    setImageLayers((prev) => prev.filter((l) => l.id !== layerId));
    if (selectedImageLayerId === layerId) {
      setSelectedImageLayerId(null);
    }
    toast.info("Đã gỡ ảnh khỏi poster!");
  };

  const handleUpdateImageLayer = (layerId: string, updates: Partial<CustomImageLayer>) => {
    setImageLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, ...updates } : l)));
  };

  // ── XỬ LÝ THÊM DÒNG CHỮ MỚI (CUSTOM TEXT LAYER) ──
  const handleAddCustomTextLayer = () => {
    const newText: CustomTextLayer = {
      id: `text_${Date.now()}`,
      text: "DÒNG CHỮ MỚI (CLICK ĐỂ SỬA)",
      x: 50,
      y: 50,
      fontFamily: "cinzel",
      fontSize: "xl",
      colorGradient: "gold",
      is3dEmboss: true,
      hasFrostedBg: false,
      zIndex: 20 + customTextLayers.length,
    };
    setCustomTextLayers((prev) => [...prev, newText]);
    setSelectedCustomTextId(newText.id);
    toast.success("✓ Đã thêm dòng chữ mới lên poster!");
  };

  const handleDeleteCustomTextLayer = (id: string) => {
    setCustomTextLayers((prev) => prev.filter((t) => t.id !== id));
    if (selectedCustomTextId === id) setSelectedCustomTextId(null);
    toast.info("Đã xóa dòng chữ!");
  };

  // ── XÓA / ẨN TRƯỜNG THÔNG TIN MẶC ĐỊNH ──
  const handleToggleDefaultBlockVisibility = (blockId: string) => {
    setBlocksLayout((prev) => {
      const cur = prev[blockId];
      if (!cur) return prev;
      const nextVis = cur.visible === false ? true : false;
      return {
        ...prev,
        [blockId]: {
          ...cur,
          visible: nextVis,
        },
      };
    });
    toast.info(`Đã ${blocksLayout[blockId]?.visible === false ? "hiện lại" : "ẩn"} khối ${blocksLayout[blockId]?.name || blockId}`);
  };

  // ── KÉO THẢ TỌA ĐỘ TRỰC TIẾP TRÊN CANVAS BẰNG CHUỘT / TOUCH ──
  const handleMouseDownItem = (
    type: "block" | "image" | "custom_text",
    id: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    setActiveDraggingId(id);
    setDraggingType(type);

    if (type === "block") {
      setSelectedBlockId(id);
      if (id === "attendee") setActiveTab("attendee");
      else if (id === "title" || id === "headline" || id === "capsule" || id === "datetime") setActiveTab("content");
    } else if (type === "image") {
      setSelectedImageLayerId(id);
      setActiveTab("layers");
    } else if (type === "custom_text") {
      setSelectedCustomTextId(id);
      setActiveTab("content");
    }

    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();

    let curX = 50;
    let curY = 50;

    if (type === "block") {
      const b = blocksLayout[id];
      if (b) {
        curX = b.x;
        curY = b.y;
      }
    } else if (type === "image") {
      const img = imageLayers.find((l) => l.id === id);
      if (img) {
        curX = img.x;
        curY = img.y;
      }
    } else if (type === "custom_text") {
      const txt = customTextLayers.find((t) => t.id === id);
      if (txt) {
        curX = txt.x;
        curY = txt.y;
      }
    }

    const clientX = "touches" in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const pixelX = (curX / 100) * rect.width;
    const pixelY = (curY / 100) * rect.height;

    setDragOffset({
      x: clientX - rect.left - pixelX,
      y: clientY - rect.top - pixelY,
    });
  };

  useEffect(() => {
    if (!activeDraggingId || !draggingType) return;

    const updatePosition = (clientX: number, clientY: number) => {
      if (!posterRef.current) return;
      const rect = posterRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left - dragOffset.x;
      const mouseY = clientY - rect.top - dragOffset.y;

      const newX = Math.max(2, Math.min(98, Math.round((mouseX / rect.width) * 100)));
      const newY = Math.max(2, Math.min(98, Math.round((mouseY / rect.height) * 100)));

      if (draggingType === "block") {
        setBlocksLayout((prev) => ({
          ...prev,
          [activeDraggingId]: {
            ...prev[activeDraggingId],
            x: newX,
            y: newY,
          },
        }));
        if (activeDraggingId === "attendee") {
          setAttendeeConfig((prev) => ({ ...prev, x: newX, y: newY }));
        }
      } else if (draggingType === "image") {
        setImageLayers((prev) =>
          prev.map((l) => (l.id === activeDraggingId ? { ...l, x: newX, y: newY } : l))
        );
      } else if (draggingType === "custom_text") {
        setCustomTextLayers((prev) =>
          prev.map((t) => (t.id === activeDraggingId ? { ...t, x: newX, y: newY } : t))
        );
      }
    };

    const handlePointerMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handlePointerUp = () => {
      setActiveDraggingId(null);
      setDraggingType(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [activeDraggingId, draggingType, dragOffset]);

  // Nạp danh sách template từ backend
  const loadTemplatesFromBackend = async () => {
    try {
      const res = await fetchNestApi<any>("/admin/invitation-templates");
      const list = Array.isArray(res) ? res : res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        globalTemplatesCache = list;
        setTemplates(list);
      } else {
        const defaults = [
          {
            id: "tpl_atlantis_default",
            name: "Mẫu Cung Điện Atlantis Hoàng Gia (Pinterest 374009944081934333)",
            category: "event" as const,
            presetKey: "atlantis" as const,
            kicker: "O OLIMPO SE ABRE MAIS UMA VEZ.",
            leadPhrase: "Venha vivenciar Atlantis, a nova coleção da Hera",
            title: "ATLANTIS THỊNH VƯỢNG",
            venueHighlight: "tại HABBLET HOTEL & LANDMARK 72",
            capsuleBadge: "+ 2 EMBLEMAS EXCLUSIVOS PARA OS PARTICIPANTES",
            capsuleBenefit: "ĐẶC QUYỀN DOANH NHÂN SỐ & BỘ QUÀ TẶNG THÀNH VIÊN HERA",
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
            name: "Mẫu Thư Mời Wyndham Thanh Thủy (Pinterest 501447739786387302)",
            category: "event" as const,
            presetKey: "wyndham" as const,
            kicker: "Tham dự sự kiện",
            leadPhrase: "Cơ hội tận hưởng",
            title: "DÒNG CHẢY HẠNH PHÚC",
            venueHighlight: "tại Heian Villas",
            capsuleBadge: "QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG",
            capsuleBenefit: "01 CẶP VÉ MỜI DANH DỰ TRĂNG CONCERT NGÀY 30/4",
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
        ];
        globalTemplatesCache = defaults;
        setTemplates(defaults);
      }
    } catch {}
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
        title: `${mainTitleLine1} ${mainTitleLine2}`.trim(),
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
        bgDarkness,
        bgBlur,
        logoUrl,
        partnerLogoUrl,
        topOrnament,
        bottomOrnament,
        qrValue,
        posterRatio,
        blocksLayout,
        customImageLayers: imageLayers,
        customTextLayers,
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
      toast.success(`✓ Đã lưu mẫu "${name}" vào kho template thành công!`);
    } catch (err: any) {
      toast.error(`Lỗi lưu template: ${err.message || "Thử lại sau"}`);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Xóa mẫu khỏi kho template (Gọi API DELETE và cập nhật state)
  const handleDeleteTemplate = async (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mẫu "${templateName}" khỏi kho không?`)) {
      return;
    }

    setIsDeletingTemplateId(templateId);
    try {
      await fetchNestApi(`/admin/invitation-templates/${templateId}`, {
        method: "DELETE",
      }).catch(() => {
        // Fallback: nếu endpoint DELETE chưa có hoặc lỗi, POST danh sách đã lọc
        const filtered = templates.filter((t) => t.id !== templateId);
        return fetchNestApi("/admin/invitation-templates", {
          method: "POST",
          body: JSON.stringify({ templates: filtered }),
        });
      });

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
      }
      toast.success(`✓ Đã xóa mẫu "${templateName}" khỏi kho thành công!`);
    } catch (err: any) {
      toast.error(`Lỗi xóa mẫu: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsDeletingTemplateId(null);
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
    if (tpl.bgDarkness !== undefined) setBgDarkness(tpl.bgDarkness);
    if (tpl.bgBlur !== undefined) setBgBlur(tpl.bgBlur);
    if (tpl.topOrnament) setTopOrnament(tpl.topOrnament);
    if (tpl.bottomOrnament) setBottomOrnament(tpl.bottomOrnament);
    if (tpl.posterRatio) setPosterRatio(tpl.posterRatio);
    if (tpl.blocksLayout) setBlocksLayout(tpl.blocksLayout);
    if (tpl.customImageLayers) setImageLayers(tpl.customImageLayers);
    if (tpl.customTextLayers) setCustomTextLayers(tpl.customTextLayers);
    if (tpl.attendeeConfig) setAttendeeConfig(tpl.attendeeConfig);
    toast.info(`✓ Đã nạp mẫu template "${tpl.name}" vào studio!`);
  };

  // Xuất file ảnh PNG độ nét cao (Canvas HD)
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
        img.onerror = () => resolve(null);
      });

      ctx.fillStyle = "#071530";
      ctx.fillRect(0, 0, exportW, exportH);

      if (img.width > 0) {
        ctx.drawImage(img, 0, 0, exportW, exportH);
      }

      // Overlay
      ctx.fillStyle = `rgba(7, 21, 48, ${bgDarkness / 100})`;
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

      ctx.fillStyle = "#67e8f9";
      ctx.font = "bold 32px serif";
      ctx.fillText(kicker, centerX, exportH * 0.27);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 36px serif";
      ctx.fillText(leadPhrase, centerX, exportH * 0.3);

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

  // Helper font class
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

  const selectedImageLayer = imageLayers.find((l) => l.id === selectedImageLayerId);

  return (
    <div className="space-y-6">
      {/* ── HEADER CÔNG CỤ STUDIO PHOTOSHOP MINI ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-2xl border border-sky-500/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            <span>Mini Photoshop &amp; Canva Studio Thư Mời CEO 1983</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white flex items-center gap-2.5">
            <span>Thiết Kế Poster &amp; Thư Mời Sự Kiện Hoàng Gia</span>
            <Crown className="size-6 text-amber-400 fill-amber-400/30 animate-pulse" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Tự do đổi ảnh nền, thêm nhiều lớp ảnh, kéo dãn tỷ lệ kích thước, thêm/sửa/xóa dòng chữ, bốc tách đại biểu từ danh sách đăng ký và quản lý xóa mẫu trong kho!
          </p>
        </div>

        {/* NÚT TÁC VỤ NHANH */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setBlocksLayout(DEFAULT_BLOCKS);
              toast.info("Đã đặt lại vị trí mặc định!");
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="size-3.5 text-amber-400" />
            <span>Đặt Lại Bố Cục</span>
          </button>

          <button
            type="button"
            disabled={isExportingPng}
            onClick={handleExportPng}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <Download className="size-3.5" />
            <span>{isExportingPng ? "Đang xuất..." : "Xuất File PNG HD"}</span>
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

      {/* ── BỐ CỤC CHÍNH PHOTOSHOP: 2 CỘT (CỘT ĐIỀU KHIỂN & CỘT CANVAS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════════
            CỘT TRÁI: BỘ CÔNG CỤ PHOTOSHOP & LAYER INSPECTOR (5 CỘT)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-4">
          {/* THANH TABS CÔNG CỤ PHOTOSHOP */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("background")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "background"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Palette className="size-4 text-emerald-500" />
              <span>Ảnh Nền</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("layers")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "layers"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="size-4 text-purple-500" />
              <span>Lớp Ảnh ({imageLayers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "content"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Type className="size-4 text-blue-500" />
              <span>Văn Bản</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attendee")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "attendee"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="size-4 text-amber-500" />
              <span>Đại Biểu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ornaments")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "ornaments"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Crown className="size-4 text-yellow-500" />
              <span>Họa Tiết 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                activeTab === "templates"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Bookmark className="size-4 text-rose-500" />
              <span>Kho Mẫu ({templates.length})</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: QUẢN LÝ ẢNH NỀN (BACKGROUND STUDIO)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "background" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                    Cấu Hình Ảnh Nền &amp; Hiệu Ứng Phủ
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Đổi ảnh nền tự do</span>
              </div>

              {/* Tải ảnh nền từ máy tính */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  1. Tải Ảnh Nền Từ Thiết Bị (PNG, JPG, WEBP):
                </label>
                <label className="border-2 border-dashed border-emerald-400/60 dark:border-emerald-700/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition bg-emerald-50/20 text-center">
                  <Upload className="size-6 text-emerald-600 animate-bounce" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isUploadingBg ? "Đang xử lý tải ảnh nền..." : "Bấm chọn file ảnh từ máy tính"}
                    </div>
                    <div className="text-[10px] text-slate-500">Poster sẽ đổi nền ngay tức khắc</div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBgFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Nhập URL ảnh nền trực tiếp */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  2. Hoặc Dán Đường Link (URL) Ảnh Nền:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/poster-bg.jpg"
                    value={customBgUrl}
                    onChange={(e) => setCustomBgUrl(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                  {customBgUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBgUrl("");
                        toast.info("Đã xóa URL tùy chỉnh, quay về ảnh preset");
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Thư viện 8 Preset Nền Đỉnh Cao */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  3. Chọn Nhanh Từ Thư Viện Nền Hoàng Gia CEO 1983:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {BACKGROUND_PRESETS.map((bg) => {
                    const isSelected = activeBg === bg.url;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => {
                          setCustomBgUrl("");
                          setSelectedBg(bg.url);
                          toast.success(`Đã chọn nền: ${bg.name}`);
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer group ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-400/40 shadow-md"
                            : "border-slate-200 dark:border-slate-800 hover:border-emerald-400/60"
                        }`}
                      >
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                          <span className="text-[10px] font-black text-white leading-tight line-clamp-1">
                            {bg.name}
                          </span>
                          <span className="text-[8px] text-emerald-300 font-mono mt-0.5">{bg.tag}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                            <Check className="size-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tùy chỉnh Độ Tối & Độ Mờ của Nền (Photoshop Adjustment) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Độ Tối Phủ Nền (Overlay Darkness):</span>
                    <span className="font-mono text-emerald-600">{bgDarkness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={bgDarkness}
                    onChange={(e) => setBgDarkness(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Giúp chữ trên poster nổi bật sắc nét</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Độ Mờ Nhòe Nền (Background Blur):</span>
                    <span className="font-mono text-emerald-600">{bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={bgBlur}
                    onChange={(e) => setBgBlur(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: QUẢN LÝ LỚP ẢNH & KÉO DÃN TỶ LỆ (MULTI-IMAGE LAYERS)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "layers" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-purple-500" />
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                    Quản Lý Lớp Ảnh (Kéo Dãn, Scale, Xóa)
                  </span>
                </div>
                <span className="text-[10px] text-purple-600 font-bold">{imageLayers.length} Lớp ảnh</span>
              </div>

              {/* Nút Thêm Lớp Ảnh Mới từ Thiết Bị */}
              <div className="flex items-center gap-2">
                <label className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                  <Upload className="size-4" />
                  <span>{isUploadingImageLayer ? "Đang tải..." : "+ Thêm Ảnh Mới Từ Máy"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageLayerFromFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sticker / Huy hiệu mẫu sẵn */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Thêm Nhanh Sticker / Huy Hiệu Mẫu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STICKER_PRESETS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleAddPresetSticker(st)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-slate-50 dark:bg-slate-950 flex flex-col items-center gap-1 transition cursor-pointer text-center"
                    >
                      <img src={st.url} alt={st.name} className="size-8 object-contain rounded" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                        {st.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh Sách Các Lớp Ảnh Đang Có */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Danh Sách Lớp Ảnh Trên Poster:
                </label>
                {imageLayers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    Chưa có lớp ảnh phụ nào. Bấm nút "+ Thêm Ảnh Mới Từ Máy" để chèn logo đối tác, con dấu, sticker!
                  </div>
                ) : (
                  imageLayers.map((layer) => {
                    const isSelected = selectedImageLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedImageLayerId(layer.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-400/40"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={layer.url}
                            alt={layer.name}
                            className="size-10 rounded-lg object-cover border border-purple-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {layer.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Scale: {layer.scale}% · X: {layer.x}%, Y: {layer.y}%
                            </div>
                          </div>
                        </div>

                        {/* Thao tác lớp: Ẩn/Hiện & XÓA GỠ ẢNH */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleUpdateImageLayer(layer.id, { visible: !layer.visible })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer"
                            title={layer.visible ? "Ẩn ảnh" : "Hiện ảnh"}
                          >
                            {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-rose-500" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteImageLayer(layer.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Xóa gỡ ảnh này khỏi poster"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* BỘ ĐIỀU KHIỂN CHI TIẾT LỚP ẢNH ĐANG CHỌN (RESIZE & RATIO) */}
              {selectedImageLayer && (
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300/60 dark:border-purple-800/50 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 dark:border-purple-800/40">
                    <span className="text-xs font-black uppercase text-purple-900 dark:text-purple-200">
                      Chỉnh Sửa: {selectedImageLayer.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCropImageUrl(selectedImageLayer.url);
                        setCropTarget("layer");
                        setCropShape(
                          selectedImageLayer.shape === "circle"
                            ? "circle"
                            : selectedImageLayer.shape === "arch"
                            ? "arch"
                            : selectedImageLayer.shape === "oval"
                            ? "oval"
                            : "square"
                        );
                        setIsCropOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Scissors className="size-3" />
                      <span>Cắt Ảnh</span>
                    </button>
                  </div>

                  {/* Kéo Dãn Kích Thước (Width & Height & Scale) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Chiều Rộng:</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.width}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="450"
                        value={selectedImageLayer.width}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          handleUpdateImageLayer(selectedImageLayer.id, {
                            width: w,
                            ...(selectedImageLayer.lockAspect ? { height: Math.round(w * 0.7) } : {}),
                          });
                        }}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Chiều Cao:</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.height}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="450"
                        value={selectedImageLayer.height}
                        onChange={(e) =>
                          handleUpdateImageLayer(selectedImageLayer.id, { height: Number(e.target.value) })
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Phóng to thu nhỏ (Scale) & Khóa tỷ lệ */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Tỷ Lệ Scale:</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.scale}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={selectedImageLayer.scale}
                        onChange={(e) =>
                          handleUpdateImageLayer(selectedImageLayer.id, { scale: Number(e.target.value) })
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Góc Xoay:</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedImageLayer.rotation}
                        onChange={(e) =>
                          handleUpdateImageLayer(selectedImageLayer.id, { rotation: Number(e.target.value) })
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Độ Trong Suốt & Độ Mờ Viền Hòa Nền (Soft Feather) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Độ Trong Suốt:</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={selectedImageLayer.opacity}
                        onChange={(e) =>
                          handleUpdateImageLayer(selectedImageLayer.id, { opacity: Number(e.target.value) })
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span>Mờ Viền (Feather):</span>
                        <span className="font-mono text-purple-600">{selectedImageLayer.featherBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={selectedImageLayer.featherBlur}
                        onChange={(e) =>
                          handleUpdateImageLayer(selectedImageLayer.id, { featherBlur: Number(e.target.value) })
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Kiểu Bo Góc / Hình Dáng */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Hình Dạng Cắt Viền:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: "rounded", name: "Bo Góc" },
                        { id: "circle", name: "Hình Tròn" },
                        { id: "arch", name: "Cổng Vòm" },
                        { id: "oval", name: "Bầu Dục" },
                        { id: "rectangle", name: "Vuông" },
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() =>
                            handleUpdateImageLayer(selectedImageLayer.id, { shape: sh.id as ImageShapeType })
                          }
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition text-center cursor-pointer ${
                            selectedImageLayer.shape === sh.id
                              ? "bg-purple-600 text-white"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {sh.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nút Gỡ Bỏ Lớp Ảnh */}
                  <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteImageLayer(selectedImageLayer.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xóa / Gỡ Ảnh Này Khỏi Poster</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: VĂN BẢN, SỬA XÓA TRƯỜNG & THÊM DÒNG CHỮ MỚI
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "content" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              {/* Nút Thêm Dòng Chữ Mới Tự Do */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Type className="size-4 text-blue-500" />
                  <span>Quản Lý Văn Bản &amp; Dòng Chữ</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddCustomTextLayer}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>+ Thêm Dòng Chữ Mới</span>
                </button>
              </div>

              {/* Danh Sách Các Dòng Chữ Tự Do Đã Thêm */}
              {customTextLayers.length > 0 && (
                <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                  <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase block">
                    Dòng Chữ Tự Do Đã Thêm ({customTextLayers.length}):
                  </span>
                  <div className="space-y-2">
                    {customTextLayers.map((tl) => (
                      <div
                        key={tl.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          selectedCustomTextId === tl.id
                            ? "border-blue-500 bg-blue-100/50 dark:bg-blue-900/40"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <input
                          type="text"
                          value={tl.text}
                          onChange={(e) =>
                            setCustomTextLayers((prev) =>
                              prev.map((t) => (t.id === tl.id ? { ...t, text: e.target.value } : t))
                            )
                          }
                          className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomTextLayer(tl.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Xóa dòng chữ này"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SỬA / XÓA CÁC TRƯỜNG THÔNG TIN MẶC ĐỊNH */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Các Trường Thông Tin Trên Poster (Bấm mắt để Ẩn / Hiện):
                </label>

                {/* Tiêu đề chính */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      1. Tiêu Đề 'ATLANTIS' / 'THƯ MỜI'
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultBlockVisibility("title")}
                      className="text-slate-500 hover:text-sky-600 transition cursor-pointer"
                      title="Ẩn / Hiện khối này trên poster"
                    >
                      {blocksLayout.title?.visible !== false ? (
                        <Eye className="size-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-4 text-rose-500" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={invitationHeader}
                      onChange={(e) => setInvitationHeader(e.target.value)}
                      placeholder="ATLANTIS / THƯ MỜI"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-serif font-bold text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      value={invitationSubtitle}
                      onChange={(e) => setInvitationSubtitle(e.target.value)}
                      placeholder="HERA COLLECTION · 2026"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Chủ đề lớn */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      2. Tiêu Đề Lớn 'KẾT NỐI DOANH NHÂN THỊNH VƯỢNG'
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultBlockVisibility("headline")}
                      className="text-slate-500 hover:text-sky-600 transition cursor-pointer"
                    >
                      {blocksLayout.headline?.visible !== false ? (
                        <Eye className="size-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-4 text-rose-500" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={mainTitleLine1}
                      onChange={(e) => setMainTitleLine1(e.target.value)}
                      placeholder="KẾT NỐI DOANH NHÂN"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-black uppercase text-sky-700 dark:text-sky-300"
                    />
                    <input
                      type="text"
                      value={mainTitleLine2}
                      onChange={(e) => setMainTitleLine2(e.target.value)}
                      placeholder="THỊNH VƯỢNG 1983"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-black uppercase text-sky-700 dark:text-sky-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={kicker}
                      onChange={(e) => setKicker(e.target.value)}
                      placeholder="O OLIMPO SE ABRE MAIS UMA VEZ."
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-sky-600"
                    />
                    <input
                      type="text"
                      value={venueHighlight}
                      onChange={(e) => setVenueHighlight(e.target.value)}
                      placeholder="tại HABBLET HOTEL & LANDMARK 72"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Hộp quà tặng Capsule */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      3. Hộp Quà Tặng / Đặc Quyền Capsule
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultBlockVisibility("capsule")}
                      className="text-slate-500 hover:text-sky-600 transition cursor-pointer"
                    >
                      {blocksLayout.capsule?.visible !== false ? (
                        <Eye className="size-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-4 text-rose-500" />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={capsuleBadge}
                    onChange={(e) => setCapsuleBadge(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={capsuleBenefit}
                    onChange={(e) => setCapsuleBenefit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-bold"
                  />
                </div>

                {/* Ngày giờ & Địa điểm */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      4. Ngày Giờ &amp; Địa Điểm Tổ Chức
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDefaultBlockVisibility("datetime")}
                      className="text-slate-500 hover:text-sky-600 transition cursor-pointer"
                    >
                      {blocksLayout.datetime?.visible !== false ? (
                        <Eye className="size-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-4 text-rose-500" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-xs text-center font-bold">
                    <input
                      type="text"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-center"
                    />
                    <input
                      type="text"
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-center text-sky-600"
                    />
                    <input
                      type="text"
                      value={dayDigits}
                      onChange={(e) => setDayDigits(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-center text-rose-600"
                    />
                    <input
                      type="text"
                      value={monthDigits}
                      onChange={(e) => setMonthDigits(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-center text-rose-600"
                    />
                    <input
                      type="text"
                      value={yearDigits}
                      onChange={(e) => setYearDigits(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-center text-rose-600"
                    />
                  </div>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                  />
                </div>
              </div>

              {/* BỘ ĐỔI FONT & MÀU SẮC CHO KHỐI ĐANG CHỌN */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-sky-400/40 space-y-3">
                <span className="text-xs font-bold text-sky-300 uppercase block">
                  Đổi Font Chữ &amp; Cỡ Chữ Cho Khối Đang Chọn: ({blocksLayout[selectedBlockId]?.name || selectedBlockId})
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={blocksLayout[selectedBlockId]?.fontFamily || "serif"}
                    onChange={(e) =>
                      setBlocksLayout((prev) => ({
                        ...prev,
                        [selectedBlockId]: { ...prev[selectedBlockId], fontFamily: e.target.value as FontFamilyType },
                      }))
                    }
                    className="bg-slate-800 text-white border border-slate-700 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="cinzel">Cinzel (Hoàng Gia)</option>
                    <option value="playfair">Playfair Display (Quý Tộc)</option>
                    <option value="cormorant">Cormorant Garamond (Cổ Điển)</option>
                    <option value="vietnam">Be Vietnam Pro (Việt Hóa)</option>
                    <option value="montserrat">Montserrat (Hiện Đại)</option>
                    <option value="orbitron">Orbitron (Công Nghệ 3D)</option>
                    <option value="dancing">Dancing Script (Uốn Lượn)</option>
                    <option value="serif">Serif Chuẩn</option>
                  </select>

                  <select
                    value={blocksLayout[selectedBlockId]?.fontSize || "base"}
                    onChange={(e) =>
                      setBlocksLayout((prev) => ({
                        ...prev,
                        [selectedBlockId]: { ...prev[selectedBlockId], fontSize: e.target.value as any },
                      }))
                    }
                    className="bg-slate-800 text-white border border-slate-700 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="xs">Cỡ chữ: XS</option>
                    <option value="sm">Cỡ chữ: SM</option>
                    <option value="base">Cỡ chữ: Chuẩn</option>
                    <option value="lg">Cỡ chữ: LG</option>
                    <option value="xl">Cỡ chữ: XL</option>
                    <option value="2xl">Cỡ chữ: 2XL</option>
                    <option value="3xl">Cỡ chữ: 3XL</option>
                    <option value="4xl">Cỡ chữ: 4XL</option>
                    <option value="5xl">Cỡ chữ: 5XL</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: ĐẠI BIỂU DANH DỰ & CALL API NGƯỜI ĐÃ ĐĂNG KÝ
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "attendee" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-amber-500" />
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                    Đại Biểu Danh Dự / Diễn Giả Khách Mời
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendeeConfig.enabled}
                    onChange={(e) => setAttendeeConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="size-4 rounded text-amber-600"
                  />
                  <span>Hiện Trên Poster</span>
                </label>
              </div>

              {/* Call API Lấy Người Đã Đăng Ký Theo Sự Kiện */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-300/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase flex items-center gap-1.5">
                    <Calendar className="size-4 text-amber-600" />
                    <span>Nguồn Sự Kiện (Call API Đăng Ký):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 font-bold">
                    {eventRegistrations.length} lượt đăng ký
                  </span>
                </div>

                <select
                  value={selectedEventId}
                  onChange={(e) => void handleSelectEventForAttendees(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2 text-xs font-bold cursor-pointer"
                >
                  <option value="">-- Tất cả sự kiện ({eventsList.length} sự kiện) --</option>
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || ev.title}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 p-1 bg-amber-100/60 dark:bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedSourceType("registrations")}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      selectedSourceType === "registrations" ? "bg-amber-500 text-white" : "text-amber-900 dark:text-slate-300"
                    }`}
                  >
                    Người Đã Đăng Ký ({eventRegistrations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSourceType("members")}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      selectedSourceType === "members" ? "bg-amber-500 text-white" : "text-amber-900 dark:text-slate-300"
                    }`}
                  >
                    Tất Cả Hội Viên ({allMembers.length})
                  </button>
                </div>

                {/* Tìm kiếm & Click 1 chạm đưa vào poster */}
                <div className="relative">
                  <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm nhanh theo tên, công ty..."
                    value={attendeeSearchQuery}
                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 rounded-lg text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-amber-100">
                  {filteredList.slice(0, 20).map((item: any) => {
                    const itemName = item.name || item.full_name || item.member?.name || "Hội viên";
                    const itemCompany = item.company || item.member?.company || "CEO 1983";
                    const itemAvatar = resolveMediaUrl(item.avatar || item.member?.avatar) || "/vietnamese-young-male-ceo-avatar.png";
                    return (
                      <div
                        key={item.id || itemName}
                        className="pt-1.5 flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-amber-100/50 transition cursor-pointer"
                        onClick={() => {
                          const newAtt: SelectedAttendee = {
                            id: String(item.id || Date.now()),
                            name: itemName,
                            title: item.title || item.position || "Doanh nhân",
                            company: itemCompany,
                            avatar: itemAvatar,
                            roleInEvent: "Diễn giả chính (Keynote Speaker)",
                          };
                          setAttendeeConfig((prev) => ({
                            ...prev,
                            enabled: true,
                            attendees: [newAtt],
                          }));
                          toast.success(`✓ Đã đưa đại biểu ${itemName} lên poster!`);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={itemAvatar}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="size-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{itemName}</div>
                            <div className="text-[10px] text-slate-500 truncate">{itemCompany}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 shrink-0">+ Chọn</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin đại biểu đang hiển thị */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-300">
                    Đại Biểu / Diễn Giả Đã Chọn ({attendeeConfig.attendees.length}):
                  </span>
                  {attendeeConfig.attendees.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttendeeConfig((prev) => ({
                          ...prev,
                          enabled: true,
                          attendees: [
                            {
                              id: "att-default",
                              name: "Phạm Vũ",
                              title: "Chủ tịch HĐQT & Sáng Lập",
                              company: "VICONNECT GROUP",
                              avatar: "/ceo-portrait-default.png",
                              memberCode: "CEO1983-088",
                              roleInEvent: "Diễn giả chính (Keynote Speaker)",
                            },
                          ],
                        }));
                        toast.success("✓ Đã thêm đại biểu mặc định (Chủ tịch Phạm Vũ)!");
                      }}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer underline"
                    >
                      + Thêm mặc định
                    </button>
                  )}
                </div>

                {attendeeConfig.attendees.length > 0 ? (
                  <div className="p-3.5 rounded-2xl border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className={`size-12 object-cover border-2 border-amber-500 shadow-sm ${
                              attendeeConfig.style === "royal_circle" || attendeeConfig.style === "soft_feather"
                                ? "rounded-full"
                                : attendeeConfig.style === "heian_arch"
                                ? "rounded-t-2xl rounded-b-md"
                                : attendeeConfig.style === "oval_luxury"
                                ? "rounded-[45%]"
                                : "rounded-xl"
                            }`}
                          />
                          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black uppercase shadow-xs">
                            CEO
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                            {attendeeConfig.attendees[0].name}
                          </div>
                          <div className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400 truncate">
                            {attendeeConfig.attendees[0].roleInEvent || "Diễn giả chính"}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {attendeeConfig.attendees[0].title ? `${attendeeConfig.attendees[0].title} · ` : ""}
                            {attendeeConfig.attendees[0].company}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setAttendeeConfig((prev) => ({ ...prev, attendees: [] }));
                            toast.info("Đã gỡ đại biểu khỏi poster");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Gỡ đại biểu này khỏi poster"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                      <input
                        ref={attendeeFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAttendeeAvatar}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingAttendeeAvatar}
                        onClick={() => attendeeFileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Tải ảnh chân dung từ máy tính lên"
                      >
                        <Upload className="size-3" />
                        <span>{isUploadingAttendeeAvatar ? "Đang tải..." : "Tải Ảnh"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCropImageUrl(attendeeConfig.attendees[0].avatar);
                          setCropTarget("avatar");
                          setCropShape(attendeeConfig.style === "royal_circle" ? "circle" : "square");
                          setIsCropOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Mở công cụ cắt và căn chỉnh khung ảnh"
                      >
                        <Scissors className="size-3" />
                        <span>Cắt & Căn Chỉnh</span>
                      </button>
                    </div>

                    {/* Khay chọn nhanh Avatar Doanh Nhân mẫu */}
                    <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                      <span className="text-[10.5px] font-bold text-amber-900 dark:text-amber-200 block mb-1.5">
                        Chọn Avatar Doanh Nhân Sẵn Có (1 chạm):
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {EXECUTIVE_AVATAR_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setAttendeeConfig((prev) => ({
                                ...prev,
                                attendees: prev.attendees.map((a, idx) => (idx === 0 ? { ...a, avatar: p.url } : a)),
                              }));
                              toast.success(`✓ Đã áp dụng avatar ${p.name}!`);
                            }}
                            className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                              attendeeConfig.attendees[0]?.avatar === p.url
                                ? "border-amber-500 bg-amber-100/80 dark:bg-amber-900/50 ring-2 ring-amber-400"
                                : "border-slate-200 dark:border-slate-800 hover:bg-amber-50/50"
                            }`}
                          >
                            <img
                              src={p.url}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                              }}
                              className="size-7 rounded-full object-cover border border-amber-300"
                            />
                            <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center">
                              {p.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form sửa thông tin đại biểu */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tên Đại Biểu:</label>
                        <input
                          type="text"
                          value={attendeeConfig.attendees[0]?.name || ""}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: [{ ...prev.attendees[0], name: e.target.value }],
                            }))
                          }
                          placeholder="Tên Đại Biểu"
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Vai Trò / Danh Hiệu:</label>
                        <input
                          type="text"
                          value={attendeeConfig.attendees[0]?.roleInEvent || ""}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: [{ ...prev.attendees[0], roleInEvent: e.target.value }],
                            }))
                          }
                          placeholder="Vai trò (Diễn giả chính...)"
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 font-bold text-amber-700 dark:text-amber-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Chức Danh Doanh Nghiệp:</label>
                        <input
                          type="text"
                          value={attendeeConfig.attendees[0]?.title || ""}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: [{ ...prev.attendees[0], title: e.target.value }],
                            }))
                          }
                          placeholder="Chủ tịch / CEO..."
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tên Công Ty / Doanh Nghiệp:</label>
                        <input
                          type="text"
                          value={attendeeConfig.attendees[0]?.company || ""}
                          onChange={(e) =>
                            setAttendeeConfig((prev) => ({
                              ...prev,
                              attendees: [{ ...prev.attendees[0], company: e.target.value }],
                            }))
                          }
                          placeholder="Tên Công Ty..."
                          className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chưa chọn đại biểu nào cho poster. Bấm chọn từ danh sách bên trên hoặc tải ảnh lên.
                    </p>
                  </div>
                )}
              </div>

              {/* ── CHẾ ĐỘ KHUNG ẢNH & BÓC TÁCH AVATAR ── */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
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
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
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
                    max="30"
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
                    Làm 4 cạnh của ảnh mờ dần hòa tan tự nhiên vào poster mà không làm mờ khuôn mặt!
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

                {/* Tùy chọn hiển thị chi tiết */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendeeConfig.showTitle}
                      onChange={(e) => setAttendeeConfig((prev) => ({ ...prev, showTitle: e.target.checked }))}
                      className="size-3.5 rounded text-amber-600"
                    />
                    <span>Hiện Chức Danh</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendeeConfig.showCompany}
                      onChange={(e) => setAttendeeConfig((prev) => ({ ...prev, showCompany: e.target.checked }))}
                      className="size-3.5 rounded text-amber-600"
                    />
                    <span>Hiện Tên Công Ty</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: HOA VĂN 3D TRÊN & DƯỚI
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "ornaments" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Họa Tiết Đỉnh Trên Cùng:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "atlantis_trident", name: "Đinh Ba Atlantis", icon: "🔱" },
                  { id: "baroque_gold", name: "Vòm Vàng Baroque", icon: "👑" },
                  { id: "diamond_stars", name: "Sao Kim Cương", icon: "⭐" },
                  { id: "royal_crown", name: "Vương Miện Quý Tộc", icon: "🏆" },
                  { id: "art_deco", name: "Art Deco", icon: "🔶" },
                  { id: "none", name: "Không Trang Trí", icon: "⚪" },
                ].map((orn) => (
                  <button
                    key={orn.id}
                    type="button"
                    onClick={() => setTopOrnament(orn.id as TopOrnamentType)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      topOrnament === orn.id
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                    }`}
                  >
                    <div className="text-base mb-1">{orn.icon}</div>
                    <div className="text-[11px]">{orn.name}</div>
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pt-2">
                Họa Tiết Chân Dưới:
              </span>
              <div className="grid grid-cols-3 gap-2">
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
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      bottomOrnament === orn.id
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                    }`}
                  >
                    <div className="text-base mb-1">{orn.icon}</div>
                    <div className="text-[11px]">{orn.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 6: KHO MẪU & XÓA MẪU KHỎI KHO
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "templates" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bookmark className="size-4 text-rose-500" />
                  <span>Kho Mẫu Template Thư Mời ({templates.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Click để nạp · Thùng rác để xóa</span>
              </div>

              {/* Form lưu mẫu mới */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên mẫu template mới để lưu..."
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  disabled={isSavingTemplate}
                  onClick={handleSaveAsTemplate}
                  className="px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002766] transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <Save className="size-3.5" />
                  <span>{isSavingTemplate ? "Đang lưu..." : "Lưu Vào Kho"}</span>
                </button>
              </div>

              {/* Danh Sách Mẫu Kèm Nút XÓA MẪU */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  const isDeleting = isDeletingTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-400/40"
                          : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40 hover:border-sky-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {tmpl.bgUrl ? (
                          <img
                            src={tmpl.bgUrl}
                            alt=""
                            className="size-11 rounded-xl object-cover border border-slate-300 shrink-0"
                          />
                        ) : (
                          <div className="size-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                            Poster
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {tmpl.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {tmpl.title} · {tmpl.location || "Sự kiện"}
                          </div>
                        </div>
                      </div>

                      {/* NÚT XÓA MẪU KHỎI KHO */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => handleDeleteTemplate(tmpl.id, tmpl.name, e)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Xóa vĩnh viễn mẫu này khỏi kho"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CỘT PHẢI: KHUNG CANVAS PHOTOSHOP PREVIEW TƯƠNG TÁC (7 CỘT)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col items-center sticky top-16 z-10 w-full max-h-[calc(100vh-4.5rem)] overflow-y-auto pr-1 pb-16">
          {/* BỘ CHỌN TỶ LỆ POSTER & ZOOM CANVAS */}
          <div className="w-full max-w-[560px] mb-3 flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Tỷ Lệ:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: "9:16", label: "📱 9:16" },
                  { id: "3:4", label: "📄 3:4" },
                  { id: "1:1", label: "⏹️ 1:1" },
                  { id: "16:9", label: "🖥️ 16:9" },
                  { id: "4:3", label: "📺 4:3" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setPosterRatio(r.id as any)}
                    className={`px-2 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      posterRatio === r.id
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BỘ ĐIỀU KHIỂN ZOOM PHOTOSHOP */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Thu nhỏ (-10%)"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 min-w-[38px] text-center text-slate-700 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Phóng to (+10%)"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(85)}
                className="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-[10.5px] font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Vừa màn hình (85%)"
              >
                Vừa Khung
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Đặt lại 100%"
              >
                <RotateCcw className="size-3" />
              </button>
            </div>
          </div>

          {/* KHUNG POSTER CHÍNH CANVAS CÓ ZOOM */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="flex justify-center w-full"
          >
            <div
              ref={posterRef}
            style={{
              backgroundImage: `url(${activeBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: bgBlur > 0 ? `blur(${bgBlur}px)` : "none",
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
            {/* Vệt Phủ Nền Đêm & Darkness Filter */}
            <div
              style={{ backgroundColor: `rgba(7, 21, 48, ${bgDarkness / 100})` }}
              className="absolute inset-0 pointer-events-none"
            />

            {/* ── HOA VĂN ĐỈNH TRÊN CÙNG (TOP ORNAMENT) ── */}
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

            {/* ── KHỐI HEADER LOGOS ── */}
            {blocksLayout.header?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "header", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "header", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.header?.x ?? 50}%`,
                  top: `${blocksLayout.header?.y ?? 3.5}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.header?.zIndex ?? 10,
                }}
                className={`w-[92%] transition-shadow cursor-move group select-none ${
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
            )}

            {/* ── KHỐI CÁNH GÀ ATLANTIS ── */}
            {blocksLayout.atlantis_wings?.visible !== false && selectedBg.includes("atlantis") && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "atlantis_wings", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "atlantis_wings", e)}
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

            {/* ── KHỐI TIÊU ĐỀ 'ATLANTIS' / 'THƯ MỜI' ── */}
            {blocksLayout.title?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "title", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "title", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.title?.x ?? 50}%`,
                  top: `${blocksLayout.title?.y ?? 15}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.title?.zIndex ?? 12,
                }}
                className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
                  selectedBlockId === "title"
                    ? "ring-2 ring-amber-400 ring-dashed"
                    : "hover:outline hover:outline-1 hover:outline-sky-400/50"
                }`}
              >
                <h1
                  className={`${getFontSizeClass(
                    blocksLayout.title?.fontSize,
                    "text-3xl sm:text-4xl"
                  )} ${getFontFamilyClass(blocksLayout.title?.fontFamily)} ${getGradientClass(
                    blocksLayout.title?.colorGradient
                  )}`}
                >
                  {invitationHeader}
                </h1>
                <div className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.28em] text-slate-200 drop-shadow-sm mt-0.5">
                  {invitationSubtitle}
                </div>
              </div>
            )}

            {/* ── KHỐI TIÊU ĐỀ LỚN NGHỆ THUẬT 'KẾT NỐI DOANH NHÂN' ── */}
            {blocksLayout.headline?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "headline", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "headline", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.headline?.x ?? 50}%`,
                  top: `${blocksLayout.headline?.y ?? 25}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.headline?.zIndex ?? 11,
                }}
                className={`w-[92%] text-center transition-shadow cursor-move group select-none ${
                  selectedBlockId === "headline"
                    ? "ring-2 ring-amber-400 ring-dashed"
                    : "hover:outline hover:outline-1 hover:outline-sky-400/50"
                }`}
              >
                <div className="text-[11px] sm:text-xs text-[#85bfe8] font-light tracking-wide italic drop-shadow-sm">
                  {kicker}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-100 font-serif mt-0.5 drop-shadow-sm">
                  {leadPhrase}
                </div>
                <h2
                  className={`${getFontSizeClass(
                    blocksLayout.headline?.fontSize,
                    "text-xl sm:text-2xl"
                  )} font-black uppercase tracking-[0.06em] leading-tight mt-1 ${getFontFamilyClass(
                    blocksLayout.headline?.fontFamily
                  )} ${getGradientClass(blocksLayout.headline?.colorGradient || "cyan")}`}
                >
                  {mainTitleLine1}
                </h2>
                <h2
                  className={`${getFontSizeClass(
                    blocksLayout.headline?.fontSize,
                    "text-xl sm:text-2xl"
                  )} font-black uppercase tracking-[0.06em] leading-tight ${getFontFamilyClass(
                    blocksLayout.headline?.fontFamily
                  )} ${getGradientClass(blocksLayout.headline?.colorGradient || "cyan")}`}
                >
                  {mainTitleLine2}
                </h2>
                <div className="text-[10px] sm:text-[11px] text-[#80c5f0] font-medium tracking-wide mt-0.5 drop-shadow-sm">
                  {venueHighlight}
                </div>
              </div>
            )}

            {/* ── KHỐI ĐẠI BIỂU DANH DỰ ── */}
            {attendeeConfig.enabled &&
              blocksLayout.attendee?.visible !== false &&
              attendeeConfig.attendees.length > 0 && (
                <div
                  onMouseDown={(e) => handleMouseDownItem("block", "attendee", e)}
                  onTouchStart={(e) => handleMouseDownItem("block", "attendee", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.attendee?.x ?? 50}%`,
                    top: `${blocksLayout.attendee?.y ?? 45}%`,
                    transform: `translate(-50%, 0) scale(${attendeeConfig.scale / 100})`,
                    zIndex: blocksLayout.attendee?.zIndex ?? 15,
                  }}
                  className={`w-[88%] transition-shadow cursor-move select-none ${
                    selectedBlockId === "attendee"
                      ? "ring-2 ring-amber-400 ring-dashed"
                      : "hover:outline hover:outline-1 hover:outline-amber-400/50"
                  }`}
                >
                  <div className="p-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md bg-slate-950/65 border border-amber-400/50 shadow-2xl">
                    <div className="relative shrink-0">
                      {/* 1. Tròn Hoàng Gia 3D */}
                      {attendeeConfig.style === "royal_circle" && (
                        <div className="relative">
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="size-14 rounded-full object-cover border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-[0_0_16px_rgba(251,191,36,0.6)]"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[7px] font-black uppercase tracking-wider shadow-sm">
                            CEO
                          </span>
                        </div>
                      )}

                      {/* 2. Vòm Cung Heian */}
                      {attendeeConfig.style === "heian_arch" && (
                        <div className="relative">
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="w-13 h-16 rounded-t-[26px] rounded-b-lg object-cover border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.5)]"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black uppercase">
                            CEO
                          </span>
                        </div>
                      )}

                      {/* 3. Bầu Dục Ngọc Trai */}
                      {attendeeConfig.style === "oval_luxury" && (
                        <div className="relative">
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="w-13 h-16 rounded-[45%] object-cover border-2 border-amber-200 shadow-[0_0_18px_rgba(254,240,138,0.55)]"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[7px] font-black uppercase">
                            CEO
                          </span>
                        </div>
                      )}

                      {/* 4. Mờ Viền Lông Vũ (Mép hòa tan mềm mại, mặt sắc nét) */}
                      {attendeeConfig.style === "soft_feather" && (
                        <div
                          className="relative"
                          style={{
                            maskImage: `radial-gradient(circle at center, black 65%, transparent 100%)`,
                            WebkitMaskImage: `radial-gradient(circle at center, black 65%, transparent 100%)`,
                            filter:
                              attendeeConfig.featherBlur > 0
                                ? `drop-shadow(0 0 ${attendeeConfig.featherBlur / 2}px rgba(251,191,36,0.6))`
                                : undefined,
                          }}
                        >
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="size-14 rounded-full object-cover"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[7px] font-black uppercase">
                            CEO
                          </span>
                        </div>
                      )}

                      {/* 5. Thẻ Nổi 3D */}
                      {attendeeConfig.style === "3d_card" && (
                        <div className="relative">
                          <img
                            src={resolveMediaUrl(attendeeConfig.attendees[0].avatar) || SAFE_FALLBACK_AVATAR}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                            }}
                            className="size-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_18px_rgba(103,232,249,0.5)]"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[7px] font-black uppercase">
                            CEO
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[8px] font-bold uppercase tracking-wider text-amber-300">
                        {attendeeConfig.attendees[0].roleInEvent}
                      </div>
                      <div className="font-black text-white truncate drop-shadow-sm text-sm">
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

            {/* ── KHỐI HỘP ĐẶC QUYỀN CAPSULE ── */}
            {blocksLayout.capsule?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "capsule", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "capsule", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.capsule?.x ?? 50}%`,
                  top: `${blocksLayout.capsule?.y ?? 63}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.capsule?.zIndex ?? 10,
                }}
                className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
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
            )}

            {/* ── KHỐI CỤM NGÀY GIỜ SỐ LỚN ── */}
            {blocksLayout.datetime?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "datetime", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "datetime", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.datetime?.x ?? 50}%`,
                  top: `${blocksLayout.datetime?.y ?? 72}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.datetime?.zIndex ?? 10,
                }}
                className={`w-[90%] text-center transition-shadow cursor-move group select-none ${
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
            )}

            {/* ── RENDER CÁC LỚP ẢNH TỰ DO (MULTI-IMAGE LAYERS WITH RESIZE & DRAG) ── */}
            {imageLayers
              .filter((l) => l.visible !== false)
              .map((layer) => {
                const isSelected = selectedImageLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onMouseDown={(e) => handleMouseDownItem("image", layer.id, e)}
                    onTouchStart={(e) => handleMouseDownItem("image", layer.id, e)}
                    style={{
                      position: "absolute",
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      width: `${layer.width}px`,
                      height: `${layer.height}px`,
                      transform: `translate(-50%, -50%) scale(${layer.scale / 100}) rotate(${layer.rotation}deg)`,
                      opacity: layer.opacity / 100,
                      filter: layer.featherBlur > 0 ? `blur(${layer.featherBlur / 5}px)` : "none",
                      zIndex: layer.zIndex,
                    }}
                    className={`cursor-move select-none transition-shadow ${
                      isSelected
                        ? "ring-2 ring-purple-400 ring-dashed shadow-2xl"
                        : "hover:outline hover:outline-1 hover:outline-purple-400/50"
                    }`}
                  >
                    <img
                      src={layer.url}
                      alt={layer.name}
                      className={`w-full h-full object-cover pointer-events-none ${
                        layer.shape === "circle"
                          ? "rounded-full"
                          : layer.shape === "arch"
                          ? "rounded-t-[80px] rounded-b-xl"
                          : layer.shape === "oval"
                          ? "rounded-[50%]"
                          : layer.shape === "rounded"
                          ? "rounded-2xl"
                          : "rounded-none"
                      }`}
                    />

                    {/* Nút xóa nhanh ngay trên góc ảnh khi đang chọn */}
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImageLayer(layer.id);
                        }}
                        className="absolute -top-3 -right-3 size-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition cursor-pointer z-30"
                        title="Xóa ảnh này"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

            {/* ── RENDER CÁC DÒNG CHỮ TỰ DO (CUSTOM TEXT LAYERS) ── */}
            {customTextLayers.map((textLayer) => {
              const isSelected = selectedCustomTextId === textLayer.id;
              return (
                <div
                  key={textLayer.id}
                  onMouseDown={(e) => handleMouseDownItem("custom_text", textLayer.id, e)}
                  onTouchStart={(e) => handleMouseDownItem("custom_text", textLayer.id, e)}
                  style={{
                    position: "absolute",
                    left: `${textLayer.x}%`,
                    top: `${textLayer.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: textLayer.zIndex,
                  }}
                  className={`cursor-move select-none text-center px-2 py-1 ${
                    isSelected ? "ring-2 ring-blue-400 ring-dashed" : "hover:ring-1 hover:ring-blue-300"
                  }`}
                >
                  <span
                    className={`${getFontSizeClass(textLayer.fontSize)} ${getFontFamilyClass(
                      textLayer.fontFamily
                    )} ${getGradientClass(textLayer.colorGradient)}`}
                  >
                    {textLayer.text}
                  </span>
                </div>
              );
            })}

            {/* ── LỜI KẾT ── */}
            {blocksLayout.salute?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "salute", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "salute", e)}
                style={{
                  position: "absolute",
                  left: `${blocksLayout.salute?.x ?? 50}%`,
                  top: `${blocksLayout.salute?.y ?? 93}%`,
                  transform: "translate(-50%, 0)",
                  zIndex: blocksLayout.salute?.zIndex ?? 10,
                }}
                className={`w-[90%] text-center cursor-move select-none ${
                  selectedBlockId === "salute" ? "ring-2 ring-amber-400 ring-dashed" : ""
                }`}
              >
                <div className="text-[10px] font-serif italic font-semibold text-sky-200 tracking-wide drop-shadow-md">
                  {saluteText}
                </div>
              </div>
            )}

            {/* ── MÃ QR CHECK-IN ── */}
            {blocksLayout.qr?.visible !== false && (
              <div
                onMouseDown={(e) => handleMouseDownItem("block", "qr", e)}
                onTouchStart={(e) => handleMouseDownItem("block", "qr", e)}
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
                <QrCode className="size-8 sm:size-9 text-slate-900" />
                <div className="text-[6.5px] font-black uppercase text-center text-slate-900 tracking-tighter mt-0.5">
                  Quét QR
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* ── MODAL CẮT ẢNH CHUYÊN NGHIỆP ── */}
      <ImageCropModal
        isOpen={isCropOpen}
        imageUrl={cropImageUrl}
        initialShape={cropShape}
        title={cropTarget === "avatar" ? "Cắt Ảnh Avatar Đại Biểu Danh Dự" : "Cắt & Bo Viền Ảnh Poster"}
        onClose={() => setIsCropOpen(false)}
        onCropComplete={(croppedDataUrl) => {
          if (cropTarget === "avatar") {
            setAttendeeConfig((prev) => ({
              ...prev,
              attendees: prev.attendees.map((a, idx) => (idx === 0 ? { ...a, avatar: croppedDataUrl } : a)),
            }));
            toast.success("✓ Đã áp dụng avatar đại biểu đã cắt thành công!");
          } else if (cropTarget === "layer" && selectedImageLayerId) {
            handleUpdateImageLayer(selectedImageLayerId, { url: croppedDataUrl });
            toast.success("✓ Đã áp dụng ảnh đã cắt cho lớp ảnh!");
          }
        }}
      />

      {/* ── MODAL PHÁT SÓNG ĐA KÊNH OMNICHANNEL ── */}
      {isBroadcastModalOpen && (
        <OmnichannelBroadcastModal
          open={isBroadcastModalOpen}
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          invitationData={{
            category,
            title: `${mainTitleLine1} ${mainTitleLine2}`.trim() || "Thư mời sự kiện CEO 1983",
            subtitle: venueHighlight,
            date: `${dayDigits}/${monthDigits}/${yearDigits}`,
            time: timeHour,
            location: eventLocation,
            salutation: saluteText,
            bodyText: capsuleBenefit,
            posterUrl: activeBg,
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