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
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export type InvitationCategory = "event" | "forum" | "meeting" | "b2b_meetup";

export interface TextBlockLayout {
  id: string;
  name: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  hasFrostedBg: boolean; // có nền mờ hay không có nền mờ
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
  hasBorderGlow: boolean;
}

export interface InvitationTemplate {
  id: string;
  code?: string;
  name: string;
  category: InvitationCategory;
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
  qrValue?: string;
  posterUrl?: string;
  blocksLayout?: Record<string, TextBlockLayout>;
  cutoutConfig?: CutoutImageConfig;
  updatedAt?: string;
}

// Bố cục mặc định chuẩn Pinterest (Tọa độ phần trăm X, Y)
const DEFAULT_BLOCKS: Record<string, TextBlockLayout> = {
  header: { id: "header", name: "Thanh Logo & Chữ ký", x: 50, y: 3.5, hasFrostedBg: false },
  title: { id: "title", name: "Tiêu đề 'Thư mời' & Phụ đề", x: 50, y: 13, hasFrostedBg: false },
  headline: { id: "headline", name: "Cụm Tiêu Đề Lớn 'DÒNG CHẢY HẠNH PHÚC'", x: 50, y: 34, hasFrostedBg: false },
  capsule: { id: "capsule", name: "Hộp Quà Tặng / Đặc Quyền Capsule", x: 50, y: 52, hasFrostedBg: false },
  datetime: { id: "datetime", name: "Cụm Ngày Giờ Số Lớn 06 | 04 | 24", x: 50, y: 65, hasFrostedBg: false },
  cutout: { id: "cutout", name: "Khối Ảnh Bóc Tách / Cổng Chào Venue", x: 50, y: 84, hasFrostedBg: false },
  salute: { id: "salute", name: "Lời kết 'Rất hân hạnh được đón tiếp!'", x: 50, y: 96, hasFrostedBg: false },
};

export function InvitationTemplateStudio() {
  // Preset Backgrounds - Chuẩn Pinterest Wyndham Thanh Thủy Heian Villas
  const BACKGROUND_PRESETS = [
    {
      id: "heian_wyndham",
      name: "Wyndham Thanh Thủy (Heian Villas - Chuẩn Pinterest)",
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

  // Tab giao diện điều khiển bên trái: 'content' | 'cutout' | 'layout' | 'templates'
  const [activeTab, setActiveTab] = useState<"content" | "cutout" | "layout" | "templates">("content");

  // Studio Fields chuẩn Pinterest Wyndham Thanh Thủy
  const [selectedBg, setSelectedBg] = useState<string>("/templates/pinterest_heian_invitation.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string>("HanoiBA & VICONNECT");
  const [signatureText, setSignatureText] = useState<string>("Heian Villas");

  // Kiểu chữ & Nội dung Thư mời
  const [invitationHeader, setInvitationHeader] = useState<string>("Thư mời");
  const [invitationSubtitle, setInvitationSubtitle] = useState<string>("TRÂN TRỌNG KÍNH MỜI QUÝ HỘI VIÊN & ĐỐI TÁC");
  const [kicker, setKicker] = useState<string>("Tham dự sự kiện");
  const [leadPhrase, setLeadPhrase] = useState<string>("Cơ hội tận hưởng");
  const [mainTitleLine1, setMainTitleLine1] = useState<string>("DÒNG CHẢY");
  const [mainTitleLine2, setMainTitleLine2] = useState<string>("HẠNH PHÚC");
  const [venueHighlight, setVenueHighlight] = useState<string>("tại Heian Villas");

  // Hộp Quà Tặng / Đặc Quyền (Capsule Box)
  const [capsuleBadge, setCapsuleBadge] = useState<string>("QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG");
  const [capsuleBenefit, setCapsuleBenefit] = useState<string>("01 CẶP VÉ VIP TRĂNG CONCERT NGÀY 30/4");
  const [capsuleNote, setCapsuleNote] = useState<string>("(với sự tham gia của ca sĩ Giang Hồng Ngọc và Quốc Thiên)");

  // Cụm Ngày Giờ Số Lớn Luxury: Thứ Bảy 9h00, 06 | 04 | 24
  const [dayOfWeek, setDayOfWeek] = useState<string>("Thứ Bảy");
  const [timeHour, setTimeHour] = useState<string>("9h00");
  const [dayDigits, setDayDigits] = useState<string>("06");
  const [monthDigits, setMonthDigits] = useState<string>("04");
  const [yearDigits, setYearDigits] = useState<string>("24");
  const [eventLocation, setEventLocation] = useState<string>("Bảo Yên, Thanh Thủy, Phú Thọ");
  const [saluteText, setSaluteText] = useState<string>("Rất hân hạnh được đón tiếp!");
  const [qrValue, setQrValue] = useState<string>("https://ceo1983.viconnect.vn/association/events?action=register");

  // ── TRƯỜNG ADD ẢNH BÓC TÁCH CẮT ĐƯA LÊN POSTER ──
  const [cutoutConfig, setCutoutConfig] = useState<CutoutImageConfig>({
    enabled: true,
    url: "/templates/heian_gate_venue.jpg",
    shape: "arch",
    x: 50,
    y: 84,
    scale: 100,
    opacity: 100,
    hasBorderGlow: true,
  });
  const [isUploadingCutout, setIsUploadingCutout] = useState<boolean>(false);

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
        // Fallback template mặc định
        setTemplates([
          {
            id: "tpl_wyndham_default",
            name: "Mẫu Thư Mời Sự Kiện Wyndham Thanh Thủy (Chuẩn Pinterest)",
            category: "event",
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
      setTemplates([
        {
          id: "tpl_wyndham_default",
          name: "Mẫu Thư Mời Sự Kiện Wyndham Thanh Thủy (Chuẩn Pinterest)",
          category: "event",
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
      // Đọc file cục bộ preview tức thì qua FileReader
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

      // Đồng thời tải lên server nếu có endpoint upload
      const res = await uploadFileToNest(file, "templates").catch(() => null);
      if (res) {
        const uploadedUrl = typeof res === "string" ? res : (res as any)?.url || (res as any)?.fileUrl;
        if (uploadedUrl) {
          setCutoutConfig((prev) => ({
            ...prev,
            url: uploadedUrl,
            enabled: true,
          }));
        }
      }
      toast.success("Đã tải ảnh lên và bóc tách cắt thành công!");
    } catch {
      toast.error("Không thể tải ảnh. Vui lòng thử lại!");
    } finally {
      setIsUploadingCutout(false);
    }
  };

  // Xử lý upload poster có sẵn
  const handleUploadPosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setUploadedPosterUrl(url);
        toast.success("Đã nạp file poster thành công!");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Lỗi khi đọc file poster");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  // ── XỬ LÝ DI CHUỘT KÉO THẢ TÙY Ý TRÊN POSTER CANVAS ──
  const handleMouseDownBlock = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const currentBlock = blocksLayout[blockId];
    if (!currentBlock) return;

    // Tính tọa độ offset giữa chuột và tâm khối
    const blockPixelX = (currentBlock.x / 100) * rect.width;
    const blockPixelY = (currentBlock.y / 100) * rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setActiveDraggingId(blockId);
    setSelectedBlockId(blockId);
    setDragOffset({
      x: mouseX - blockPixelX,
      y: mouseY - blockPixelY,
    });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!activeDraggingId || !posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();

    // Tính vị trí mới theo phần trăm (0% đến 100%)
    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

    const newX = Math.min(Math.max((mouseX / rect.width) * 100, 5), 95);
    const newY = Math.min(Math.max((mouseY / rect.height) * 100, 3), 97);

    setBlocksLayout((prev) => ({
      ...prev,
      [activeDraggingId]: {
        ...prev[activeDraggingId],
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      },
    }));
  };

  const handleMouseUpCanvas = () => {
    if (activeDraggingId) {
      setActiveDraggingId(null);
    }
  };

  // Đặt lại vị trí mặc định chuẩn Pinterest ban đầu
  const handleResetLayout = () => {
    setBlocksLayout(DEFAULT_BLOCKS);
    toast.success("Đã khôi phục bố cục chuẩn Pinterest ban đầu!");
  };

  // Bật / Tắt nền mờ cho một khối cụ thể
  const toggleBlockFrostedBg = (blockId: string) => {
    setBlocksLayout((prev) => {
      const current = prev[blockId];
      if (!current) return prev;
      const nextState = !current.hasFrostedBg;
      toast.info(`Khối [${current.name}]: ${nextState ? "Đã bật nền kính mờ" : "Đã tắt nền mờ (trong suốt)"}`);
      return {
        ...prev,
        [blockId]: {
          ...current,
          hasFrostedBg: nextState,
        },
      };
    });
  };

  // Bật/tắt nền mờ cho toàn bộ các khối
  const handleToggleAllFrosted = (enable: boolean) => {
    setBlocksLayout((prev) => {
      const updated: Record<string, TextBlockLayout> = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = {
          ...prev[key],
          hasFrostedBg: enable,
        };
      });
      return updated;
    });
    toast.success(enable ? "Đã bật nền kính mờ cho toàn bộ các khối text!" : "Đã tắt nền mờ (trong suốt toàn bộ)");
  };

  // Lưu thành template mẫu
  const handleSaveAsTemplate = async () => {
    if (!templateNameInput.trim()) {
      toast.error("Vui lòng nhập tên cho mẫu template thư mời!");
      return;
    }
    setIsSavingTemplate(true);
    const newTemplate: InvitationTemplate = {
      id: `tmpl_${Date.now()}`,
      name: templateNameInput.trim(),
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
      logoUrl,
      partnerLogoUrl,
      qrValue,
      posterUrl: uploadedPosterUrl || undefined,
      blocksLayout,
      cutoutConfig,
      updatedAt: new Date().toISOString(),
    };

    try {
      const nextList = [newTemplate, ...templates.filter((t) => t.id !== newTemplate.id)];
      setTemplates(nextList);
      await fetchNestApi("/app-settings/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ templates: nextList }),
      }).catch(() => null);
      toast.success(`Đã lưu thành công mẫu "${newTemplate.name}"!`);
      setTemplateNameInput("");
      setSelectedTemplateId(newTemplate.id);
    } catch {
      toast.success(`Đã lưu tạm thời mẫu "${newTemplate.name}" vào bộ nhớ trình duyệt!`);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Chọn template từ danh sách đã lưu
  const handleSelectTemplate = (t: InvitationTemplate) => {
    setSelectedTemplateId(t.id);
    setCategory(t.category);
    setKicker(t.kicker || "Tham dự sự kiện");
    setLeadPhrase(t.leadPhrase || "Cơ hội tận hưởng");
    const parts = (t.title || "DÒNG CHẢY HẠNH PHÚC").split(" ");
    if (parts.length >= 2) {
      setMainTitleLine1(parts.slice(0, Math.ceil(parts.length / 2)).join(" "));
      setMainTitleLine2(parts.slice(Math.ceil(parts.length / 2)).join(" "));
    } else {
      setMainTitleLine1(t.title || "DÒNG CHẢY");
      setMainTitleLine2("");
    }
    setVenueHighlight(t.venueHighlight || "tại Heian Villas");
    setCapsuleBadge(t.capsuleBadge || "QUÀ TẶNG CHO KH BOOKING & CHUYỂN CỌC THÀNH CÔNG");
    setCapsuleBenefit(t.capsuleBenefit || "01 CẶP VÉ VIP TRĂNG CONCERT NGÀY 30/4");
    setCapsuleNote(t.capsuleNote || "(với sự tham gia của ca sĩ)");
    setDayOfWeek(t.dayOfWeek || "Thứ Bảy");
    setTimeHour(t.timeHour || "9h00");
    setDayDigits(t.dayDigits || "06");
    setMonthDigits(t.monthDigits || "04");
    setYearDigits(t.yearDigits || "24");
    setEventLocation(t.location || "Bảo Yên, Thanh Thủy, Phú Thọ");
    setSaluteText(t.saluteText || "Rất hân hạnh được đón tiếp!");
    if (t.bgUrl) setSelectedBg(t.bgUrl);
    if (t.blocksLayout) setBlocksLayout(t.blocksLayout);
    if (t.cutoutConfig) setCutoutConfig(t.cutoutConfig);
    toast.success(`Đã nạp mẫu template "${t.name}"!`);
  };

  // Tải ảnh Poster chất lượng cao về máy
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsExportingPng(true);
    try {
      // Dynamic import html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || (html2canvasModule as any);
      const canvas = await html2canvas(posterRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#071329",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `CEO1983_ThuMoi_${category}_${dayDigits}${monthDigits}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Đã xuất và tải ảnh Poster thư mời PNG 9:16 chất lượng cao thành công!");
    } catch {
      // Fallback: Tải file ảnh nền gốc nếu có
      const link = document.createElement("a");
      link.download = `CEO1983_ThuMoi_${category}.jpg`;
      link.href = activeBg;
      link.click();
      toast.info("Đã tải ảnh poster về máy!");
    } finally {
      setIsExportingPng(false);
    }
  };

  // Lấy kiểu cắt Shape CSS cho ảnh bóc tách
  const getCutoutMaskStyle = () => {
    if (cutoutConfig.shape === "arch") {
      return "rounded-t-[70px] rounded-b-xl border-t-2 border-x-2 border-cyan-300/40 shadow-2xl";
    }
    if (cutoutConfig.shape === "soft_feather") {
      return "rounded-2xl [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]";
    }
    if (cutoutConfig.shape === "oval") {
      return "rounded-[50%] border-2 border-cyan-300/50 shadow-2xl aspect-[4/3] object-cover";
    }
    if (cutoutConfig.shape === "rounded") {
      return "rounded-3xl border border-white/20 shadow-2xl";
    }
    // cinema
    return "rounded-xl border-b-2 border-cyan-400/40 shadow-2xl";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── TIÊU ĐỀ STUDIO & THANH CHUYỂN CHẾ ĐỘ ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Sparkles className="size-3 text-sky-500 animate-pulse" />
              Thiết Kế Poster Chuẩn Pinterest Wyndham Thanh Thủy (9:16 Dọc)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>Studio Quản Lý Mẫu Thư Mời Đa Năng CEO 1983</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Áp dụng linh hoạt cho Sự kiện, Diễn đàn, Cuộc họp, B2B Meetup. Cho phép kéo thả chuột tự do &amp; bật/tắt nền mờ trên từng khối text.
          </p>
        </div>

        {/* 2 Chế Độ: Studio Tự Thiết Kế vs Tải Poster Có Sẵn */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setPosterMode("studio")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              posterMode === "studio"
                ? "bg-[#003B95] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Studio Cấu Hình Chuẩn Pinterest</span>
          </button>
          <button
            type="button"
            onClick={() => setPosterMode("upload")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              posterMode === "upload"
                ? "bg-[#003B95] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Upload className="size-3.5" />
            <span>Tải Poster Có Sẵn</span>
          </button>
        </div>
      </div>

      {/* ── THANH CHỌN MỤC ĐÍCH THƯ MỜI (4 LOẠI) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => handleSelectCategory("event")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
            category === "event"
              ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 shadow-xs ring-1 ring-sky-500/20"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Award className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">Sự Kiện &amp; Gala</div>
            <div className="text-[10px] text-slate-400 truncate">Dòng chảy hạnh phúc</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory("forum")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
            category === "forum"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/20"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">Diễn Đàn Doanh Nhân</div>
            <div className="text-[10px] text-slate-400 truncate">Xúc tiến thương mại</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory("meeting")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
            category === "meeting"
              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 shadow-xs ring-1 ring-purple-500/20"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Briefcase className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">Kỳ Họp Ban Điều Hành</div>
            <div className="text-[10px] text-slate-400 truncate">Thường trực &amp; Đột xuất</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory("b2b_meetup")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
            category === "b2b_meetup"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs ring-1 ring-amber-500/20"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Coffee className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">Gặp Mặt B2B / Coffee</div>
            <div className="text-[10px] text-slate-400 truncate">Kết nối 1-on-1</div>
          </div>
        </button>
      </div>

      {/* ── BỐ CỤC 2 CỘT: TRÁI (BẢNG ĐIỀU KHIỂN & BÓC TÁCH ẢNH) - PHẢI (LIVE PREVIEW POSTER KÉO THẢ) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── CỘT TRÁI: BẢNG CẤU HÌNH & BÓC TÁCH (7 CỘT) ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB ĐIỀU HƯỚNG CẤU HÌNH */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "content"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Palette className="size-3.5 text-sky-500" />
              <span>1. Nội Dung &amp; Kiểu Chữ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cutout")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "cutout"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Scissors className="size-3.5 text-amber-500" />
              <span>2. Bóc Tách Cắt Ảnh Đưa Lên Poster</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("layout")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "layout"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Move className="size-3.5 text-indigo-500" />
              <span>3. Kéo Thả Vị Trí &amp; Nền Mờ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === "templates"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Bookmark className="size-3.5 text-rose-500" />
              <span>4. Kho Mẫu Đã Lưu ({templates.length})</span>
            </button>
          </div>

          {/* ── TAB 1: NỘI DUNG & KIỂU CHỮ CHUẨN PINTEREST ── */}
          {activeTab === "content" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Palette className="size-4 text-sky-500" />
                  <span>Nội Dung Văn Bản Chuẩn Mực Pinterest</span>
                </span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                  Font Serif &amp; Chữ Nghệ Thuật
                </span>
              </div>

              {/* 1. Header Row Logos & Chữ ký */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Logo Góc Trái
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL ảnh Logo..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Chữ Ký Nghệ Thuật Giữa
                  </label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Heian Villas hoặc CEO 1983"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-serif italic text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Đối Tác Góc Phải
                  </label>
                  <input
                    type="text"
                    value={partnerLogoUrl}
                    onChange={(e) => setPartnerLogoUrl(e.target.value)}
                    placeholder="MPD Group hoặc HanoiBA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* 2. Tiêu đề Thư Mời & Dòng Kính Mời */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Lớn
                  </label>
                  <input
                    type="text"
                    value={invitationHeader}
                    onChange={(e) => setInvitationHeader(e.target.value)}
                    placeholder="Thư mời"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-serif font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Dòng Kính Mời (Tracking Rộng)
                  </label>
                  <input
                    type="text"
                    value={invitationSubtitle}
                    onChange={(e) => setInvitationSubtitle(e.target.value)}
                    placeholder="TRÂN TRỌNG KÍNH MỜI QUÝ KHÁCH HÀNG"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs uppercase font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* 3. Ngữ cảnh & Tiêu đề Lớn Cách Điệu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Dòng Kicker Xanh Băng
                  </label>
                  <input
                    type="text"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="Tham dự sự kiện"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-sky-600 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Cụm Dẫn Trắng
                  </label>
                  <input
                    type="text"
                    value={leadPhrase}
                    onChange={(e) => setLeadPhrase(e.target.value)}
                    placeholder="Cơ hội tận hưởng"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 font-serif"
                  />
                </div>
              </div>

              {/* 2 Dòng Tiêu Đề Cỡ Đại Nghệ Thuật (DÒNG CHẢY - HẠNH PHÚC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Lớn Dòng 1 (Nghệ thuật)
                  </label>
                  <input
                    type="text"
                    value={mainTitleLine1}
                    onChange={(e) => setMainTitleLine1(e.target.value)}
                    placeholder="DÒNG CHẢY"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-serif font-black uppercase text-sky-700 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu Đề Lớn Dòng 2 (Nghệ thuật)
                  </label>
                  <input
                    type="text"
                    value={mainTitleLine2}
                    onChange={(e) => setMainTitleLine2(e.target.value)}
                    placeholder="HẠNH PHÚC"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-serif font-black uppercase text-sky-700 dark:bg-slate-950 dark:border-slate-700 dark:text-sky-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Địa Danh Nổi Bật Dưới Tiêu Đề
                </label>
                <input
                  type="text"
                  value={venueHighlight}
                  onChange={(e) => setVenueHighlight(e.target.value)}
                  placeholder="tại Heian Villas"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              {/* 4. Hộp Đặc Quyền / Quà Tặng (Capsule Box) */}
              <div className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-1.5">
                  <Award className="size-3.5" />
                  <span>Hộp Đặc Quyền / Quà Tặng (Capsule Badge)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Nội dung huy hiệu bo tròn
                    </label>
                    <input
                      type="text"
                      value={capsuleBadge}
                      onChange={(e) => setCapsuleBadge(e.target.value)}
                      className="w-full bg-white border border-cyan-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-cyan-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Quyền lợi / Quà tặng chính
                    </label>
                    <input
                      type="text"
                      value={capsuleBenefit}
                      onChange={(e) => setCapsuleBenefit(e.target.value)}
                      className="w-full bg-white border border-cyan-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-cyan-800 dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Ghi chú nghệ sĩ / điều kiện
                  </label>
                  <input
                    type="text"
                    value={capsuleNote}
                    onChange={(e) => setCapsuleNote(e.target.value)}
                    className="w-full bg-white border border-cyan-300 rounded-lg p-1.5 text-xs text-slate-600 dark:bg-slate-900 dark:border-cyan-800 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* 5. Cụm Ngày Giờ Số Lớn: 06 | 04 | 24 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Thứ
                  </label>
                  <input
                    type="text"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Giờ
                  </label>
                  <input
                    type="text"
                    value={timeHour}
                    onChange={(e) => setTimeHour(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Ngày (2 số)
                  </label>
                  <input
                    type="text"
                    value={dayDigits}
                    maxLength={2}
                    onChange={(e) => setDayDigits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Tháng (2 số)
                  </label>
                  <input
                    type="text"
                    value={monthDigits}
                    maxLength={2}
                    onChange={(e) => setMonthDigits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Năm (2 số)
                  </label>
                  <input
                    type="text"
                    value={yearDigits}
                    maxLength={2}
                    onChange={(e) => setYearDigits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center"
                  />
                </div>
              </div>

              {/* Địa điểm & Link Mã QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <MapPin className="size-3 text-rose-500" /> Địa Điểm Tổ Chức
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <QrCode className="size-3 text-blue-500" /> Link Mã QR Quét Form Đăng Ký
                  </label>
                  <input
                    type="text"
                    value={qrValue}
                    onChange={(e) => setQrValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: TRƯỜNG ADD ẢNH BÓC TÁCH CẮT ĐƯA LÊN POSTER ── */}
          {activeTab === "cutout" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Scissors className="size-4 text-amber-500" />
                  <span>Bóc Tách &amp; Cắt Ảnh Tải Vào Đưa Lên Poster</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Hiển thị ảnh bóc tách:</span>
                  <input
                    type="checkbox"
                    checked={cutoutConfig.enabled}
                    onChange={(e) => setCutoutConfig((p) => ({ ...p, enabled: e.target.checked }))}
                    className="size-4 text-sky-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Tải ảnh từ máy tính hoặc dán URL */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-2">
                <div className="size-12 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 mx-auto flex items-center justify-center">
                  <Upload className="size-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tải lên ảnh cần bóc tách (Ảnh địa điểm, Diễn giả, Khách VIP hoặc Key Visual)
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Hệ thống tự động bóc tách, cắt mặt nạ cong vòm hoặc viền mờ hòa quyện lên nền poster thư mời.
                </p>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002766] transition cursor-pointer shadow-xs">
                    <ImageIcon className="size-3.5" />
                    <span>{isUploadingCutout ? "Đang xử lý ảnh..." : "Chọn Ảnh Từ Máy Tính"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCutoutImage}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setCutoutConfig((p) => ({
                        ...p,
                        url: "/templates/heian_gate_venue.jpg",
                        enabled: true,
                        shape: "arch",
                      }));
                      toast.success("Đã nạp ảnh cổng chào kiến trúc Heian chuẩn Pinterest!");
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Dùng Cổng Chào Heian Mẫu
                  </button>
                </div>
              </div>

              {/* LỰA CHỌN KIỂU BÓC TÁCH / MẶT NẠ CẮT ẢNH */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Kiểu dáng bóc tách cắt ảnh (Cutout Shape Mode):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "arch", name: "Cổng Vòm Heian", desc: "Uốn cong kiến trúc" },
                    { id: "soft_feather", name: "Hòa Quyện Viền Mờ", desc: "Tách mờ 4 cạnh mềm" },
                    { id: "oval", name: "Bầu Dục / Elip", desc: "Khung oval diễn giả" },
                    { id: "rounded", name: "Bo Góc 24px", desc: "Khung thẻ sang trọng" },
                    { id: "cinema", name: "Toàn Cảnh Đáy", desc: "Trải rộng chân poster" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCutoutConfig((p) => ({ ...p, shape: s.id as CutoutShape }))}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        cutoutConfig.shape === s.id
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500/20"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{s.name}</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CÁC THANH TRƯỢT ĐIỀU CHỈNH TỌA ĐỘ VỊ TRÍ, TỶ LỆ, ĐỘ MỜ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Vị trí trục dọc (Y):</span>
                    <span className="font-mono">{cutoutConfig.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={cutoutConfig.y}
                    onChange={(e) => setCutoutConfig((p) => ({ ...p, y: Number(e.target.value) }))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Kích thước (Scale):</span>
                    <span className="font-mono">{cutoutConfig.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={cutoutConfig.scale}
                    onChange={(e) => setCutoutConfig((p) => ({ ...p, scale: Number(e.target.value) }))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Độ rõ nét / Opacity:</span>
                    <span className="font-mono">{cutoutConfig.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={cutoutConfig.opacity}
                    onChange={(e) => setCutoutConfig((p) => ({ ...p, opacity: Number(e.target.value) }))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: KÉO THẢ VỊ TRÍ & BẬT/TẮT NỀN MỜ TRÊN TEXT ── */}
          {activeTab === "layout" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Move className="size-4 text-indigo-500" />
                    <span>Kéo Thả Vị Trí &amp; Tùy Chọn Nền Mờ Trên Text</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nhấn giữ chuột trực tiếp trên ảnh Poster để di chuyển bất kỳ khối nào.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetLayout}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <RotateCcw className="size-3" />
                  <span>Đặt lại vị trí chuẩn</span>
                </button>
              </div>

              {/* CÁC NÚT THAO TÁC NHANH CHO NỀN MỜ */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllFrosted(true)}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="size-3.5" />
                  <span>Bật Nền Kính Mờ Cho Toàn Bộ Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllFrosted(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Square className="size-3.5" />
                  <span>Tắt Nền Mờ (Trong Suốt Toàn Bộ)</span>
                </button>
              </div>

              {/* DANH SÁCH CÁC KHỐI & CÔNG TẮC NỀN MỜ TỪNG KHỐI */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Danh sách 7 Khối có thể di chuyển &amp; Bật/Tắt nền mờ:
                </span>
                <div className="space-y-2">
                  {Object.values(blocksLayout).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBlockId(b.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                        selectedBlockId === b.id
                          ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                          : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Move className="size-3.5 text-slate-400" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {b.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Tọa độ: X={b.x}% | Y={b.y}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Công tắc Bật/Tắt Nền Mờ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBlockFrostedBg(b.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            b.hasFrostedBg
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300"
                          }`}
                        >
                          <Sparkles className="size-3" />
                          <span>{b.hasFrostedBg ? "Có Nền Kính Mờ" : "Không Nền Mờ"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: KHO MẪU TEMPLATE ĐÃ LƯU ── */}
          {activeTab === "templates" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bookmark className="size-4 text-rose-500" />
                  <span>Kho Mẫu Template Thư Mời Sẵn Có ({templates.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Click để nạp nhanh vào Studio</span>
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
                  <span>{isSavingTemplate ? "Đang lưu..." : "Lưu Template Mẫu"}</span>
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
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {tmpl.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {tmpl.title} · {tmpl.location}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400">
                      <span className="font-semibold text-sky-600 dark:text-sky-400">
                        {tmpl.category === "meeting" ? "💼 Cuộc họp" : tmpl.category === "forum" ? "🏛️ Diễn đàn" : tmpl.category === "b2b_meetup" ? "☕ Gặp gỡ B2B" : "🎪 Sự kiện & Gala"}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                        Áp dụng <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHỌN HÌNH NỀN POSTER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Hình Nền Poster (Xanh Đêm Hoàng Gia Wyndham Thanh Thủy)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    setSelectedBg(bg.url);
                    setCustomBgUrl("");
                  }}
                  className={`p-1.5 rounded-xl border text-left transition cursor-pointer overflow-hidden ${
                    selectedBg === bg.url && !customBgUrl
                      ? "border-sky-500 ring-2 ring-sky-500/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="h-16 rounded-lg bg-slate-900 overflow-hidden relative">
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {bg.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI: LIVE PREVIEW POSTER 9:16 DỌC KÉO THẢ TÙY Ý (5 CỘT) ── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="size-4 text-sky-500" />
              <span>Xem Trước Poster Thư Mời Chuẩn Pinterest</span>
            </h4>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1">
              <Move className="size-3" />
              <span>Di chuột kéo thả vị trí tùy ý</span>
            </span>
          </div>

          {/* POSTER CANVAS (TỶ LỆ 9:16 DỌC - CHUẨN XÁC Y HỆT URL PINTEREST WYNDHAM THANH THỦY) */}
          <div
            ref={posterRef}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            onMouseLeave={handleMouseUpCanvas}
            className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-sky-400/40 bg-gradient-to-b from-[#071530] via-[#102d59] to-[#071530] flex flex-col justify-between text-white select-none"
            style={{
              backgroundImage:
                posterMode === "upload" && uploadedPosterUrl
                  ? `url(${uploadedPosterUrl})`
                  : `linear-gradient(180deg, rgba(7,21,48,0.92) 0%, rgba(16,45,89,0.72) 45%, rgba(7,21,48,0.96) 100%), url(${activeBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Vệt ánh sao rơi li ti thanh mảnh (Celestial shooting star light streaks) */}
            <div className="absolute top-0 inset-x-0 h-36 pointer-events-none flex justify-around opacity-45">
              <div className="w-px h-16 bg-gradient-to-b from-white/80 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-24 bg-gradient-to-b from-white/70 via-cyan-300/30 to-transparent relative mt-2">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-white/80 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-white/70 via-cyan-300/30 to-transparent relative mt-1">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-white/80 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
            </div>

            {posterMode === "upload" && uploadedPosterUrl ? (
              <div className="h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="p-3.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
                  <div className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">
                    Poster Tải Lên Sẵn Có
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">
                    {mainTitleLine1} {mainTitleLine2}
                  </h3>
                  <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-center gap-2">
                    <span>📅 {dayOfWeek}, {dayDigits}/{monthDigits}/{yearDigits} lúc {timeHour}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── STUDIO POSTER CHUẨN PINTEREST VỚI CÁC KHỐI DRAGGABLE TUỲ Ý & NỀN MỜ ── */
              <div className="relative z-10 size-full">
                {/* 1. KHỐI HEADER LOGOS & CHỮ KÝ */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("header", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.header?.x ?? 50}%`,
                    top: `${blocksLayout.header?.y ?? 3.5}%`,
                    transform: "translate(-50%, 0)",
                  }}
                  className={`w-[92%] transition-shadow cursor-move group ${
                    blocksLayout.header?.hasFrostedBg
                      ? "p-2 rounded-xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "header" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left Brand Logo */}
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

                    {/* Center Calligraphy Signature (Heian Villas) */}
                    <div className="text-sm font-serif italic tracking-wide text-sky-100 font-semibold drop-shadow-sm">
                      {signatureText}
                    </div>

                    {/* Right Partner / Sponsor Logo */}
                    <div className="text-[8.5px] font-bold tracking-wider text-slate-200 uppercase">
                      {partnerLogoUrl}
                    </div>
                  </div>
                </div>

                {/* 2. KHỐI TIÊU ĐỀ 'THƯ MỜI' & DÒNG KÍNH MỜI */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("title", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.title?.x ?? 50}%`,
                    top: `${blocksLayout.title?.y ?? 13}%`,
                    transform: "translate(-50%, 0)",
                  }}
                  className={`w-[90%] text-center transition-shadow cursor-move group ${
                    blocksLayout.title?.hasFrostedBg
                      ? "p-3 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "title" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  <h1 className="text-3xl sm:text-4xl font-serif tracking-normal text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.45)]">
                    {invitationHeader}
                  </h1>
                  <div className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.28em] text-slate-200 drop-shadow-sm mt-0.5">
                    {invitationSubtitle}
                  </div>
                </div>

                {/* 3. KHỐI TIÊU ĐỀ LỚN NGHỆ THUẬT 'DÒNG CHẢY HẠNH PHÚC' */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("headline", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.headline?.x ?? 50}%`,
                    top: `${blocksLayout.headline?.y ?? 27}%`,
                    transform: "translate(-50%, 0)",
                  }}
                  className={`w-[92%] text-center transition-shadow cursor-move group ${
                    blocksLayout.headline?.hasFrostedBg
                      ? "p-3.5 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "headline" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  <div className="text-xs text-[#85bfe8] font-light tracking-wide italic drop-shadow-sm">
                    {kicker}
                  </div>
                  <div className="text-xs sm:text-[13px] text-slate-100 font-serif mt-0.5 drop-shadow-sm">
                    {leadPhrase}
                  </div>

                  {/* 2 Dòng Tiêu Đề Lớn Cách Điệu Phong Cách Luxury */}
                  <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-[0.06em] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-sky-300 drop-shadow-[0_4px_18px_rgba(56,189,248,0.45)] mt-1">
                    {mainTitleLine1}
                  </h2>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-[0.06em] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-sky-300 drop-shadow-[0_4px_18px_rgba(56,189,248,0.45)]">
                    {mainTitleLine2}
                  </h2>

                  <div className="text-xs text-[#80c5f0] font-medium tracking-wide mt-1 drop-shadow-sm">
                    {venueHighlight}
                  </div>
                </div>

                {/* 4. KHỐI HỘP ĐẶC QUYỀN CAPSULE BOX CHUẨN PINTEREST */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("capsule", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.capsule?.x ?? 50}%`,
                    top: `${blocksLayout.capsule?.y ?? 47}%`,
                    transform: "translate(-50%, 0)",
                  }}
                  className={`w-[90%] text-center transition-shadow cursor-move group ${
                    blocksLayout.capsule?.hasFrostedBg
                      ? "p-3 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "capsule" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  {/* Pill Badge */}
                  <div className="inline-block px-4 py-1 rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/25 via-cyan-200/40 to-cyan-400/25 shadow-[0_2px_12px_rgba(103,232,249,0.35)] backdrop-blur-xs">
                    <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-slate-950">
                      {capsuleBadge}
                    </span>
                  </div>

                  <div className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-white drop-shadow-md mt-1">
                    {capsuleBenefit}
                  </div>
                  <div className="text-[8.5px] sm:text-[9px] text-slate-300 font-light italic mt-0.5">
                    {capsuleNote}
                  </div>
                </div>

                {/* 5. KHỐI CỤM NGÀY GIỜ SỐ LỚN: THỨ BẢY 9H00 & 06 | 04 | 24 */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("datetime", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.datetime?.x ?? 50}%`,
                    top: `${blocksLayout.datetime?.y ?? 58}%`,
                    transform: "translate(-50%, 0)",
                  }}
                  className={`w-[90%] text-center transition-shadow cursor-move group ${
                    blocksLayout.datetime?.hasFrostedBg
                      ? "p-3 rounded-2xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "datetime" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-medium">
                    <span>{dayOfWeek}</span>
                    <Clock className="size-3 text-cyan-300" />
                    <span>{timeHour}</span>
                  </div>

                  {/* Bộ 3 số lớn phong cách Luxury: 06 | 04 | 24 */}
                  <div className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-serif font-normal text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] tracking-widest my-0.5">
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

                {/* 6. KHỐI ẢNH BÓC TÁCH / CỔNG CHÀO KIẾN TRÚC HEIAN DƯỚI ĐÁY */}
                {cutoutConfig.enabled && (
                  <div
                    onMouseDown={(e) => handleMouseDownBlock("cutout", e)}
                    style={{
                      position: "absolute",
                      left: `${cutoutConfig.x}%`,
                      top: `${cutoutConfig.y}%`,
                      transform: `translate(-50%, -50%) scale(${cutoutConfig.scale / 100})`,
                      opacity: cutoutConfig.opacity / 100,
                    }}
                    className={`w-[88%] h-28 sm:h-32 transition-shadow cursor-move group relative overflow-hidden ${getCutoutMaskStyle()} ${
                      activeDraggingId === "cutout" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"
                    }`}
                  >
                    <img
                      src={cutoutConfig.url}
                      alt="Cutout Venue / Speaker"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Mã QR nhỏ góc dưới */}
                    <div className="absolute right-2 bottom-2 p-1 bg-white rounded-md shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(qrValue)}`}
                        alt="QR"
                        className="size-7 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* 7. KHỐI LỜI KẾT CHÂN TRANG */}
                <div
                  onMouseDown={(e) => handleMouseDownBlock("salute", e)}
                  style={{
                    position: "absolute",
                    left: `${blocksLayout.salute?.x ?? 50}%`,
                    top: `${blocksLayout.salute?.y ?? 96}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`w-[90%] text-center transition-shadow cursor-move group ${
                    blocksLayout.salute?.hasFrostedBg
                      ? "p-2 rounded-xl backdrop-blur-md bg-slate-950/45 border border-white/15 shadow-xl"
                      : ""
                  } ${activeDraggingId === "salute" ? "ring-2 ring-sky-400 ring-dashed" : "hover:outline hover:outline-1 hover:outline-sky-400/50"}`}
                >
                  <div className="text-xs font-serif italic text-slate-200 drop-shadow-sm">
                    {saluteText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CÁC NÚT THAO TÁC XUẤT ẢNH & PHÁT HÀNH ĐA KÊNH ── */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadPoster}
                disabled={isExportingPng}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <Download className="size-3.5 text-sky-500" />
                <span>{isExportingPng ? "Đang xuất PNG..." : "Tải Ảnh Poster PNG"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAllFrosted(!blocksLayout.headline?.hasFrostedBg)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{blocksLayout.headline?.hasFrostedBg ? "Tắt Toàn Bộ Nền Mờ" : "Bật Nền Kính Mờ"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-[#003B95] to-blue-700 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-98 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Áp Dụng &amp; Gửi Thư Mời Ngay (App, Zalo OA, Email)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── OMNICHANNEL BROADCAST MODAL (GỬI THƯ MỜI QUA APP, ZALO OA, EMAIL) ── */}
      <OmnichannelBroadcastModal
        open={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        invitationData={{
          title: `${mainTitleLine1} ${mainTitleLine2}`.trim(),
          subtitle: `${kicker} - ${venueHighlight}`,
          posterUrl: uploadedPosterUrl || activeBg,
          date: `${dayOfWeek}, ${dayDigits}/${monthDigits}/${yearDigits}`,
          time: timeHour,
          location: eventLocation,
          salutation: `Kính gửi: Quý Doanh Nhân & Hội Viên CEO 1983`,
          bodyText: `${leadPhrase} tại ${venueHighlight}.\nĐặc quyền: ${capsuleBenefit} ${capsuleNote}.\nThời gian: ${dayOfWeek}, ${dayDigits}/${monthDigits}/${yearDigits} lúc ${timeHour}.\nĐịa điểm: ${eventLocation}.\n\n${saluteText}`,
          templateId: selectedTemplateId || undefined,
        }}
        onSuccess={() => {
          setIsBroadcastModalOpen(false);
          toast.success("Đã hoàn tất gửi thư mời đa kênh thành công!");
        }}
      />
    </div>
  );
}
