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
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export type InvitationCategory = "event" | "forum" | "meeting" | "b2b_meetup";

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
  updatedAt?: string;
}

export function InvitationTemplateStudio() {
  // Preset Backgrounds - Kèm hình ảnh Wyndham Thanh Thủy Heian Villas chuẩn Pinterest
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

  // Studio Fields theo phong cách Pinterest
  const [selectedBg, setSelectedBg] = useState<string>("/templates/pinterest_heian_invitation.jpg");
  const [customBgUrl, setCustomBgUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/ceo1983-official-logo.png");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string>("HanoiBA & VICONNECT");

  // Nội dung thiệp mời chuẩn Pinterest
  const [invitationHeader, setInvitationHeader] = useState<string>("Thư mời");
  const [invitationSubtitle, setInvitationSubtitle] = useState<string>("TRÂN TRỌNG KÍNH MỜI QUÝ HỘI VIÊN & ĐỐI TÁC");
  const [kicker, setKicker] = useState<string>("Tham dự sự kiện");
  const [leadPhrase, setLeadPhrase] = useState<string>("Cơ hội tận hưởng & kết nối đỉnh cao");
  const [mainTitle, setMainTitle] = useState<string>("DÒNG CHẢY HẠNH PHÚC");
  const [venueHighlight, setVenueHighlight] = useState<string>("tại Heian Villas & Cung Trí Thức Hà Nội");

  // Hộp đặc quyền (Capsule Badge Box)
  const [capsuleBadge, setCapsuleBadge] = useState<string>("QUÀ TẶNG KẾT NỐI B2B & GIAO THƯƠNG");
  const [capsuleBenefit, setCapsuleBenefit] = useState<string>("01 CẶP VÉ VIP TRĂNG CONCERT & GIAO LƯU ĐỐI TÁC");
  const [capsuleNote, setCapsuleNote] = useState<string>("(Kèm cơ hội kết nối trực tiếp cùng hơn 100+ Doanh chủ CEO 1983)");

  // Cụm ngày giờ nghệ thuật: Thứ Bảy 9h00 | 06 | 04 | 24 | Địa điểm
  const [dayOfWeek, setDayOfWeek] = useState<string>("Thứ Bảy");
  const [timeHour, setTimeHour] = useState<string>("9h00");
  const [dayDigits, setDayDigits] = useState<string>("06");
  const [monthDigits, setMonthDigits] = useState<string>("04");
  const [yearDigits, setYearDigits] = useState<string>("24");
  const [eventLocation, setEventLocation] = useState<string>(
    "Bảo Yên, Thanh Thủy, Phú Thọ & Cầu Giấy, Hà Nội"
  );
  const [saluteText, setSaluteText] = useState<string>("Rất hân hạnh được đón tiếp!");
  const [qrValue, setQrValue] = useState<string>("https://ceo1983.viconnect.vn/association/events");
  const [themeGlowColor, setThemeGlowColor] = useState<"cyan" | "gold" | "royal">("cyan");

  // Templates Management State
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>("tmpl-inv-heian");
  const [templateNameInput, setTemplateNameInput] = useState<string>("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);

  // Available events/meetings to auto-fill
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [availableMeetings, setAvailableMeetings] = useState<any[]>([]);

  // Omnichannel Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Preset mặc định chuẩn 4 danh mục theo yêu cầu người dùng
  const PRESET_TEMPLATES: Record<InvitationCategory, Partial<InvitationTemplate>> = {
    event: {
      category: "event",
      kicker: "Tham dự sự kiện",
      leadPhrase: "Cơ hội tận hưởng & kết nối đỉnh cao",
      title: "DÒNG CHẢY HẠNH PHÚC",
      venueHighlight: "tại Heian Villas & Cung Trí Thức",
      capsuleBadge: "QUÀ TẶNG KẾT NỐI B2B & GIAO THƯƠNG",
      capsuleBenefit: "01 CẶP VÉ VIP TRĂNG CONCERT & GIAO LƯU ĐỐI TÁC",
      capsuleNote: "(Kèm cơ hội kết nối trực tiếp cùng hơn 100+ Doanh chủ CEO 1983)",
      dayOfWeek: "Thứ Bảy",
      timeHour: "9h00",
      dayDigits: "06",
      monthDigits: "04",
      yearDigits: "24",
      location: "Bảo Yên, Thanh Thủy, Phú Thọ & Cầu Giấy, Hà Nội",
      themeGlowColor: "cyan",
    },
    forum: {
      category: "forum",
      kicker: "Tham dự Diễn đàn Doanh nhân",
      leadPhrase: "Cơ hội bứt phá & kiến tạo tương lai",
      title: "DIỄN ĐÀN KINH TẾ & ĐỔI MỚI SÁNG TẠO 2026",
      venueHighlight: "tại Trung tâm Hội nghị Quốc gia, Hà Nội",
      capsuleBadge: "ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC",
      capsuleBenefit: "KÝ KẾT BIÊN BẢN GHI NHỚ DEAL B2B & QUẢNG BÁ THƯƠNG HIỆU",
      capsuleNote: "(Kết nối cung cầu và tiếp cận nguồn lực đối tác chiến lược)",
      dayOfWeek: "Thứ Năm",
      timeHour: "14h00",
      dayDigits: "12",
      monthDigits: "11",
      yearDigits: "26",
      location: "Trung tâm Hội nghị Quốc gia, Mễ Trì, Hà Nội",
      themeGlowColor: "gold",
    },
    meeting: {
      category: "meeting",
      kicker: "Tham dự Kỳ họp Ban Điều Hành",
      leadPhrase: "Đồng lòng kiến tạo & điều phối hoạt động",
      title: "KỲ HỌP BAN ĐIỀU HÀNH LẦN THỨ 14",
      venueHighlight: "tại Phòng VIP Văn phòng HanoiBA & Jitsi Meet",
      capsuleBadge: "THÀNH PHẦN TRIỆU TẬP",
      capsuleBenefit: "TOÀN BỘ THÀNH VIÊN BAN ĐIỀU HÀNH & BAN THƯ KÝ",
      capsuleNote: "(Tài liệu nghị sự mật được cập nhật trực tiếp trên App CEO 1983)",
      dayOfWeek: "Thứ Tư",
      timeHour: "14h30",
      dayDigits: "25",
      monthDigits: "10",
      yearDigits: "26",
      location: "Tầng 4 Cung Trí Thức, Số 1 Tôn Thất Thuyết, Hà Nội",
      themeGlowColor: "royal",
    },
    b2b_meetup: {
      category: "b2b_meetup",
      kicker: "Tham dự Cuộc gặp kết nối 1-on-1",
      leadPhrase: "Gặp gỡ thân mật & chia sẻ thực chiến",
      title: "COFFEE CEO 1983 - KẾT NỐI GIAO THƯƠNG",
      venueHighlight: "tại CEO Lounge, Keangnam Landmark 72",
      capsuleBadge: "CƠ HỘI GIAO THƯƠNG TRỰC TIẾP",
      capsuleBenefit: "TRAO ĐỔI HỢP TÁC DỊCH VỤ & KẾT NỐI CHUỖI CUNG ỨNG",
      capsuleNote: "(Giới hạn 20 Doanh chủ mỗi phiên gặp gỡ)",
      dayOfWeek: "Thứ Ba",
      timeHour: "09h00",
      dayDigits: "18",
      monthDigits: "11",
      yearDigits: "26",
      location: "Keangnam Landmark 72, Phạm Hùng, Hà Nội",
      themeGlowColor: "cyan",
    },
  };

  // Áp dụng Category Preset
  const handleApplyCategoryPreset = (cat: InvitationCategory) => {
    setCategory(cat);
    const p = PRESET_TEMPLATES[cat];
    if (p.kicker) setKicker(p.kicker);
    if (p.leadPhrase) setLeadPhrase(p.leadPhrase);
    if (p.title) setMainTitle(p.title);
    if (p.venueHighlight) setVenueHighlight(p.venueHighlight);
    if (p.capsuleBadge) setCapsuleBadge(p.capsuleBadge);
    if (p.capsuleBenefit) setCapsuleBenefit(p.capsuleBenefit);
    if (p.capsuleNote) setCapsuleNote(p.capsuleNote);
    if (p.dayOfWeek) setDayOfWeek(p.dayOfWeek);
    if (p.timeHour) setTimeHour(p.timeHour);
    if (p.dayDigits) setDayDigits(p.dayDigits);
    if (p.monthDigits) setMonthDigits(p.monthDigits);
    if (p.yearDigits) setYearDigits(p.yearDigits);
    if (p.location) setEventLocation(p.location);
    if (p.themeGlowColor) setThemeGlowColor(p.themeGlowColor);
    toast.success(`Đã chuyển đổi mẫu thư mời sang: "${cat === "event" ? "Sự kiện & Gala" : cat === "forum" ? "Diễn đàn Doanh nhân" : cat === "meeting" ? "Họp Ban Điều Hành" : "Cuộc gặp B2B & Coffee CEO"}"`);
  };

  // Fetch templates & events on mount
  useEffect(() => {
    fetchTemplates();
    fetchUpcomingEventsAndMeetings();
  }, []);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await fetchNestApi<InvitationTemplate[]>("/admin/invitation-templates");
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
      } else {
        // Fallback default templates
        setTemplates([
          {
            id: "tmpl-heian-1",
            name: "Mẫu Gala Wyndham Thanh Thủy (Heian Villas Style)",
            category: "event",
            kicker: "Tham dự sự kiện",
            leadPhrase: "Cơ hội tận hưởng & kết nối đỉnh cao",
            title: "DÒNG CHẢY HẠNH PHÚC",
            venueHighlight: "tại Heian Villas & Cung Trí Thức",
            capsuleBadge: "QUÀ TẶNG KẾT NỐI B2B & GIAO THƯƠNG",
            capsuleBenefit: "01 CẶP VÉ VIP TRĂNG CONCERT & GIAO LƯU ĐỐI TÁC",
            capsuleNote: "(Kèm cơ hội kết nối trực tiếp cùng hơn 100+ Doanh chủ CEO 1983)",
            dayOfWeek: "Thứ Bảy",
            timeHour: "9h00",
            dayDigits: "06",
            monthDigits: "04",
            yearDigits: "24",
            location: "Bảo Yên, Thanh Thủy, Phú Thọ & Cầu Giấy, Hà Nội",
            saluteText: "Rất hân hạnh được đón tiếp!",
            bgUrl: "/templates/pinterest_heian_invitation.jpg",
            themeGlowColor: "cyan",
          },
          {
            id: "tmpl-forum-1",
            name: "Mẫu Thư Mời Diễn Đàn Doanh Nhân & B2B 2026",
            category: "forum",
            kicker: "Tham dự Diễn đàn Doanh nhân",
            leadPhrase: "Cơ hội bứt phá & kiến tạo tương lai",
            title: "DIỄN ĐÀN KINH TẾ & ĐỔI MỚI SÁNG TẠO 2026",
            venueHighlight: "tại Trung tâm Hội nghị Quốc gia, Hà Nội",
            capsuleBadge: "ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC",
            capsuleBenefit: "KÝ KẾT BIÊN BẢN GHI NHỚ DEAL B2B & QUẢNG BÁ THƯƠNG HIỆU",
            capsuleNote: "(Kết nối cung cầu và tiếp cận nguồn lực đối tác chiến lược)",
            dayOfWeek: "Thứ Năm",
            timeHour: "14h00",
            dayDigits: "12",
            monthDigits: "11",
            yearDigits: "26",
            location: "Trung tâm Hội nghị Quốc gia, Mễ Trì, Hà Nội",
            saluteText: "Rất hân hạnh được đón tiếp!",
            themeGlowColor: "gold",
          },
          {
            id: "tmpl-meeting-1",
            name: "Mẫu Thư Mời Triệu Tập Họp Ban Điều Hành",
            category: "meeting",
            kicker: "Tham dự Kỳ họp Ban Điều Hành",
            leadPhrase: "Đồng lòng kiến tạo & điều phối hoạt động",
            title: "KỲ HỌP BAN ĐIỀU HÀNH LẦN THỨ 14",
            venueHighlight: "tại Phòng VIP Văn phòng HanoiBA & Jitsi Meet",
            capsuleBadge: "THÀNH PHẦN TRIỆU TẬP",
            capsuleBenefit: "TOÀN BỘ THÀNH VIÊN BAN ĐIỀU HÀNH & BAN THƯ KÝ",
            capsuleNote: "(Tài liệu nghị sự mật được cập nhật trực tiếp trên App CEO 1983)",
            dayOfWeek: "Thứ Tư",
            timeHour: "14h30",
            dayDigits: "25",
            monthDigits: "10",
            yearDigits: "26",
            location: "Tầng 4 Cung Trí Thức, Số 1 Tôn Thất Thuyết, Hà Nội",
            saluteText: "Rất hân hạnh được đón tiếp!",
            themeGlowColor: "royal",
          },
        ]);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchUpcomingEventsAndMeetings = async () => {
    try {
      const [events, meetings] = await Promise.all([
        fetchNestApi<any[]>("/events").catch(() => []),
        fetchNestApi<any[]>("/meetings").catch(() => []),
      ]);
      if (Array.isArray(events)) setAvailableEvents(events.slice(0, 10));
      if (Array.isArray(meetings)) setAvailableMeetings(meetings.slice(0, 10));
    } catch {}
  };

  // Chọn template từ kho
  const handleSelectTemplate = (tmpl: InvitationTemplate) => {
    setSelectedTemplateId(tmpl.id);
    if (tmpl.category) setCategory(tmpl.category);
    setMainTitle(tmpl.title || "");
    setKicker(tmpl.kicker || "");
    setLeadPhrase(tmpl.leadPhrase || "");
    setVenueHighlight(tmpl.venueHighlight || "");
    setCapsuleBadge(tmpl.capsuleBadge || "");
    setCapsuleBenefit(tmpl.capsuleBenefit || "");
    setCapsuleNote(tmpl.capsuleNote || "");
    setDayOfWeek(tmpl.dayOfWeek || "Thứ Bảy");
    setTimeHour(tmpl.timeHour || "9h00");
    setDayDigits(tmpl.dayDigits || "06");
    setMonthDigits(tmpl.monthDigits || "04");
    setYearDigits(tmpl.yearDigits || "24");
    setEventLocation(tmpl.location || "");
    setSaluteText(tmpl.saluteText || "Rất hân hạnh được đón tiếp!");
    if (tmpl.bgUrl) setSelectedBg(tmpl.bgUrl);
    if (tmpl.themeGlowColor) setThemeGlowColor(tmpl.themeGlowColor);
    toast.success(`Đã nạp mẫu thư mời: "${tmpl.name}"`);
  };

  // Nạp nhanh từ sự kiện
  const handleSelectEvent = (event: any) => {
    if (!event) return;
    setCategory("event");
    setKicker("Tham dự sự kiện");
    setMainTitle(event.name || event.title || mainTitle);
    if (event.place) setVenueHighlight(`tại ${event.place}`);
    if (event.date) {
      const d = new Date(event.date);
      if (!isNaN(d.getTime())) {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        setDayOfWeek(days[d.getDay()] || "Thứ Bảy");
        setDayDigits(String(d.getDate()).padStart(2, "0"));
        setMonthDigits(String(d.getMonth() + 1).padStart(2, "0"));
        setYearDigits(String(d.getFullYear()).slice(-2));
      }
    }
    if (event.location) setEventLocation(event.location);
    toast.info(`Đã nạp thông tin từ sự kiện: ${event.name || event.title}`);
  };

  // Nạp nhanh từ cuộc họp
  const handleSelectMeeting = (m: any) => {
    if (!m) return;
    setCategory("meeting");
    setKicker("Tham dự Kỳ họp");
    setMainTitle(m.title || m.name || mainTitle);
    if (m.location) setVenueHighlight(`tại ${m.location}`);
    if (m.date) {
      const d = new Date(m.date);
      if (!isNaN(d.getTime())) {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        setDayOfWeek(days[d.getDay()] || "Thứ Tư");
        setDayDigits(String(d.getDate()).padStart(2, "0"));
        setMonthDigits(String(d.getMonth() + 1).padStart(2, "0"));
        setYearDigits(String(d.getFullYear()).slice(-2));
      }
    }
    if (m.location) setEventLocation(m.location);
    toast.info(`Đã nạp thông tin từ cuộc họp: ${m.title || m.name}`);
  };

  // Tải poster có sẵn
  const handleUploadPosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPoster(true);
    try {
      const url = await uploadFileToNest(file, `invitation_poster_${Date.now()}_${file.name}`);
      if (url) {
        setUploadedPosterUrl(url);
        setPosterMode("upload");
        toast.success("Tải poster thư mời có sẵn thành công!");
      }
    } catch {
      toast.error("Không thể tải tệp poster lên máy chủ");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  // Lưu thành template mẫu
  const handleSaveAsTemplate = async () => {
    if (!templateNameInput.trim()) {
      toast.error("Vui lòng nhập tên mẫu template trước khi lưu");
      return;
    }
    setIsSavingTemplate(true);
    try {
      const newTemplate: InvitationTemplate = {
        id: `tmpl-${Date.now()}`,
        name: templateNameInput.trim(),
        category,
        kicker,
        leadPhrase,
        title: mainTitle,
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
        bgUrl: selectedBg,
        logoUrl,
        partnerLogoUrl,
        themeGlowColor,
        qrValue,
        posterUrl: posterMode === "upload" ? uploadedPosterUrl : undefined,
        updatedAt: new Date().toISOString(),
      };

      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify(newTemplate),
      }).catch(() => null);

      setTemplates((prev) => [newTemplate, ...prev.filter((t) => t.id !== newTemplate.id)]);
      setSelectedTemplateId(newTemplate.id);
      setTemplateNameInput("");
      toast.success(`Đã lưu mẫu thư mời "${newTemplate.name}" thành công!`);
    } catch {
      toast.error("Lỗi khi lưu mẫu template thư mời");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Xóa template
  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa mẫu template thư mời này không?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Đã xóa mẫu template");
  };

  const activeBg = customBgUrl || selectedBg;
  const currentPosterForBroadcast = posterMode === "upload" ? uploadedPosterUrl : activeBg;

  return (
    <div className="space-y-6">
      {/* ── THANH CHỌN MỤC ĐÍCH THƯ MỜI (SỰ KIỆN, DIỄN ĐÀN, CUỘC HỌP, GẶP MẶT B2B) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <span>Mục Đích Thư Mời (Chuẩn Phong Cách Pinterest Wyndham Thanh Thủy)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Áp dụng linh hoạt cho Sự kiện, Diễn đàn Doanh nhân, Kỳ họp Ban Điều Hành và Cuộc gặp B2B Matching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPosterMode("studio")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                posterMode === "studio"
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Palette className="size-3.5" />
              <span>Thiết kế Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setPosterMode("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                posterMode === "upload"
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Upload className="size-3.5" />
              <span>Tải poster có sẵn</span>
            </button>
          </div>
        </div>

        {/* 4 Nhóm Preset Loại Thư Mời */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleApplyCategoryPreset("event")}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition cursor-pointer text-left ${
              category === "event"
                ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-1 ring-sky-500/40"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-sky-700 dark:text-sky-300">
              <Sparkles className="size-3.5" />
              <span>Sự kiện &amp; Gala</span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1">
              Gala Doanh nhân, Đại hội, Hội thảo
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyCategoryPreset("forum")}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition cursor-pointer text-left ${
              category === "forum"
                ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500/40"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300">
              <Award className="size-3.5" />
              <span>Diễn đàn Doanh nhân</span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1">
              Diễn đàn Kinh tế, Xúc tiến đầu tư
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyCategoryPreset("meeting")}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition cursor-pointer text-left ${
              category === "meeting"
                ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-500/40"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-300">
              <Briefcase className="size-3.5" />
              <span>Họp Ban Điều Hành</span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1">
              Họp Thường trực, Ban chuyên môn
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyCategoryPreset("b2b_meetup")}
            className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition cursor-pointer text-left ${
              category === "b2b_meetup"
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500/40"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
              <Coffee className="size-3.5" />
              <span>B2B &amp; Coffee CEO</span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1">
              Hẹn gặp 1-1, Thăm quan doanh nghiệp
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── CỘT TRÁI: BỘ ĐIỀU KHIỂN & SOẠN THẢO (7 CỘT) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Nạp nhanh từ sự kiện hoặc cuộc họp sẵn có */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Nạp Nhanh Từ Dữ Liệu Sự Kiện / Cuộc Họp</span>
              <span className="text-[11px] font-normal text-slate-400">Tự động điền ngày giờ &amp; địa điểm</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Chọn Sự Kiện CLB CEO 1983
                </label>
                <select
                  onChange={(e) => {
                    const ev = availableEvents.find((x) => x.id === e.target.value);
                    if (ev) handleSelectEvent(ev);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Chọn sự kiện để nạp --</option>
                  {availableEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Chọn Cuộc Họp / Diễn Đàn
                </label>
                <select
                  onChange={(e) => {
                    const m = availableMeetings.find((x) => x.id === e.target.value);
                    if (m) handleSelectMeeting(m);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">-- Chọn cuộc họp để nạp --</option>
                  {availableMeetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title || m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CẤU HÌNH CHI TIẾT THEO CHUẨN PINTEREST */}
          {posterMode === "upload" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Upload className="size-4 text-blue-500" />
                <span>Tải Lên File Poster Thư Mời Có Sẵn</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nếu bạn đã có sẵn file thiết kế ảnh poster (PNG, JPG, WebP), hãy tải lên trực tiếp để hệ thống gửi vào App, Zalo OA và Email.
              </p>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                <input
                  type="file"
                  id="poster-upload"
                  accept="image/*"
                  onChange={handleUploadPosterFile}
                  className="hidden"
                />
                <label htmlFor="poster-upload" className="cursor-pointer space-y-2 block">
                  <div className="size-12 rounded-full bg-blue-50 text-[#003B95] dark:bg-blue-950/50 dark:text-blue-300 mx-auto flex items-center justify-center">
                    <ImageIcon className="size-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUploadingPoster ? "Đang tải ảnh lên..." : "Bấm để chọn file ảnh Poster (JPG, PNG, WebP)"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Kích thước khuyến nghị: 1080 x 1920 px (tỷ lệ 9:16)
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* CHỌN NỀN & HIỆU ỨNG ÁNH SÁNG */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Layers className="size-4 text-sky-500" />
                    <span>Nền Khung Cảnh &amp; Hiệu Ứng Sao Rơi Chuẩn Pinterest</span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setThemeGlowColor("cyan")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        themeGlowColor === "cyan" ? "bg-cyan-500 text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      Xanh Băng
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeGlowColor("gold")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        themeGlowColor === "gold" ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      Vàng Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeGlowColor("royal")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        themeGlowColor === "royal" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                      }`}
                    >
                      Dạ Hội
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedBg(preset.url);
                        setCustomBgUrl("");
                      }}
                      className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition group ${
                        activeBg === preset.url ? "border-sky-500 ring-2 ring-sky-500/40" : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex items-end">
                        <span className="text-[9px] font-semibold text-white truncate">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NỘI DUNG VĂN BẢN THƯ MỜI CHUẨN PINTEREST */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nội Dung Chi Tiết Thư Mời
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Kicker ngữ cảnh (VD: Tham dự sự kiện / Tham dự Diễn đàn)
                    </label>
                    <input
                      type="text"
                      value={kicker}
                      onChange={(e) => setKicker(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Dòng dẫn dắt (Lead phrase)
                    </label>
                    <input
                      type="text"
                      value={leadPhrase}
                      onChange={(e) => setLeadPhrase(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu đề chính lớn (Headline lớn in hoa kiểu Pinterest)
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Địa điểm nổi bật (VD: tại Heian Villas &amp; Cung Trí Thức Hà Nội)
                  </label>
                  <input
                    type="text"
                    value={venueHighlight}
                    onChange={(e) => setVenueHighlight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                {/* Hộp Đặc Quyền / Quà Tặng (Capsule Badge Box) */}
                <div className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 space-y-2.5">
                  <div className="text-[11px] font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Award className="size-3.5" />
                    <span>Hộp Đặc Quyền &amp; Quà Tặng Tham Dự (Capsule Box)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Tiêu đề huy hiệu (Badge Text)
                      </label>
                      <input
                        type="text"
                        value={capsuleBadge}
                        onChange={(e) => setCapsuleBadge(e.target.value)}
                        className="w-full bg-white border border-sky-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-sky-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Nội dung quyền lợi chính
                      </label>
                      <input
                        type="text"
                        value={capsuleBenefit}
                        onChange={(e) => setCapsuleBenefit(e.target.value)}
                        className="w-full bg-white border border-sky-300 rounded-lg p-1.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-sky-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Ghi chú bổ sung
                    </label>
                    <input
                      type="text"
                      value={capsuleNote}
                      onChange={(e) => setCapsuleNote(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded-lg p-1.5 text-xs text-slate-600 dark:bg-slate-900 dark:border-sky-800 dark:text-slate-300"
                    />
                  </div>
                </div>

                {/* Cụm Ngày Giờ Luxury (Chuẩn Pinterest) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Thứ trong tuần
                    </label>
                    <input
                      type="text"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      placeholder="Thứ Bảy"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Giờ diễn ra
                    </label>
                    <input
                      type="text"
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      placeholder="9h00"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Ngày (2 số)
                    </label>
                    <input
                      type="text"
                      value={dayDigits}
                      onChange={(e) => setDayDigits(e.target.value)}
                      placeholder="06"
                      maxLength={2}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Tháng (2 số)
                    </label>
                    <input
                      type="text"
                      value={monthDigits}
                      onChange={(e) => setMonthDigits(e.target.value)}
                      placeholder="04"
                      maxLength={2}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Năm (2 số)
                    </label>
                    <input
                      type="text"
                      value={yearDigits}
                      onChange={(e) => setYearDigits(e.target.value)}
                      placeholder="24"
                      maxLength={2}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 text-center font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                      <MapPin className="size-3 text-rose-500" /> Địa điểm tổ chức đầy đủ
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
                      <QrCode className="size-3 text-blue-500" /> Link mã QR Check-in / RSVP
                    </label>
                    <input
                      type="text"
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LƯU THÀNH MẪU TEMPLATE THƯ MỜI SẴN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Bookmark className="size-4 text-amber-500" />
              <span>Lưu thành Mẫu Template Thư Mời sẵn</span>
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nhập tên mẫu template (VD: Thư mời Diễn đàn B2B Thanh Thủy)"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              />
              <button
                type="button"
                disabled={isSavingTemplate}
                onClick={handleSaveAsTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 text-xs font-bold hover:opacity-90 transition cursor-pointer shrink-0"
              >
                <Save className="size-3.5" />
                <span>{isSavingTemplate ? "Đang lưu..." : "Lưu Template Mẫu"}</span>
              </button>
            </div>
          </div>

          {/* KHO MẪU THƯ MỜI ĐÃ LƯU */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kho Mẫu Template Thư Mời ({templates.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click để nạp nhanh vào trình tạo</span>
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
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                      title="Xóa mẫu"
                      className="text-slate-400 hover:text-rose-500 transition p-0.5"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tmpl.title}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {tmpl.category === "meeting" ? "💼 Cuộc họp" : tmpl.category === "forum" ? "🏛️ Diễn đàn" : tmpl.category === "b2b_meetup" ? "☕ Gặp gỡ B2B" : "🎪 Sự kiện & Gala"}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                      Sử dụng <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI: LIVE PREVIEW POSTER THƯ MỜI CHUẨN PINTEREST (5 CỘT) ── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="size-4 text-sky-500" />
              <span>Xem Trước Poster Thư Mời Chuẩn Pinterest</span>
            </h4>
            <span className="text-[11px] text-slate-400">Tỷ lệ 9:16 dọc sang trọng</span>
          </div>

          {/* POSTER CANVAS (EXACT PINTEREST WYNDHAM THANH THỦY STYLE) */}
          <div
            ref={posterRef}
            className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-sky-400/30 bg-[#071329] flex flex-col justify-between text-white select-none"
            style={{
              backgroundImage:
                posterMode === "upload" && uploadedPosterUrl
                  ? `url(${uploadedPosterUrl})`
                  : `linear-gradient(180deg, rgba(7,19,41,0.85) 0%, rgba(13,37,76,0.6) 40%, rgba(7,19,41,0.95) 100%), url(${activeBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Hiệu ứng vệt sáng sao rơi (Celestial shooting star light streaks) */}
            <div className="absolute top-0 inset-x-0 h-32 pointer-events-none flex justify-around opacity-40">
              <div className="w-px h-16 bg-gradient-to-b from-white/70 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-24 bg-gradient-to-b from-white/60 via-cyan-300/30 to-transparent relative mt-2">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-white/70 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-white/60 via-cyan-300/30 to-transparent relative mt-1">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-white/70 via-cyan-300/40 to-transparent relative">
                <span className="size-1 rounded-full bg-cyan-200 absolute -bottom-0.5 -left-0.5 shadow-sm shadow-cyan-300" />
              </div>
            </div>

            {posterMode === "upload" && uploadedPosterUrl ? (
              <div className="h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="p-3.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
                  <div className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">
                    Poster Sẵn Có
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">
                    {mainTitle}
                  </h3>
                  <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-center gap-2">
                    <span>📅 {dayOfWeek}, {dayDigits}/{monthDigits}/{yearDigits} lúc {timeHour}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* STUDIO POSTER VIEW */
              <div className="relative z-10 size-full flex flex-col justify-between p-5 text-center">
                {/* 1. TOP BRAND HEADER ROW */}
                <div className="flex items-center justify-between pt-1">
                  {/* Left Logo */}
                  <div className="flex items-center gap-1.5">
                    <img
                      src={logoUrl}
                      alt="Logo CEO 1983"
                      className="h-7 object-contain drop-shadow-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                      }}
                    />
                    <span className="text-[9px] font-bold tracking-widest text-slate-200 uppercase">
                      CEO 1983
                    </span>
                  </div>

                  {/* Center Calligraphy Signature */}
                  <div className="text-sm font-serif italic tracking-wide text-sky-200/90 font-medium">
                    CEO 1983 Elite Club
                  </div>

                  {/* Right Partner / Sponsor Logo */}
                  <div className="text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                    HanoiBA
                  </div>
                </div>

                {/* 2. CHỮ THƯ MỜI CHUẨN PINTEREST */}
                <div className="space-y-1 pt-3">
                  <h1 className="text-3xl sm:text-4xl font-serif tracking-normal text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">
                    {invitationHeader}
                  </h1>
                  <div className="text-[8.5px] font-bold uppercase tracking-[0.25em] text-slate-300 drop-shadow-sm">
                    {invitationSubtitle}
                  </div>
                </div>

                {/* 3. NGỮ CẢNH & TIÊU ĐỀ LỚN NGHỆ THUẬT */}
                <div className="space-y-1.5 my-auto">
                  <div className="text-xs text-sky-300 font-light tracking-wide italic">
                    {kicker}
                  </div>
                  <div className="text-xs text-slate-200 font-serif">
                    {leadPhrase}
                  </div>

                  {/* Tiêu đề chính lớn cách điệu */}
                  <h2 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wider leading-snug drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-sky-100 via-cyan-200 to-sky-300">
                    {mainTitle}
                  </h2>

                  <div className="text-xs text-cyan-200 font-medium drop-shadow-sm">
                    {venueHighlight}
                  </div>
                </div>

                {/* 4. HỘP ĐẶC QUYỀN CAPSULE BOX CHUẨN PINTEREST */}
                <div className="my-1 space-y-1">
                  <div className="inline-block px-3.5 py-1 rounded-full border border-sky-300/40 bg-gradient-to-r from-sky-400/20 via-sky-300/30 to-sky-400/20 backdrop-blur-xs shadow-md">
                    <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-sky-100">
                      {capsuleBadge}
                    </span>
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-white drop-shadow-md">
                    {capsuleBenefit}
                  </div>
                  <div className="text-[9px] text-slate-300 font-light italic">
                    {capsuleNote}
                  </div>
                </div>

                {/* 5. CỤM NGÀY GIỜ SỐ LỚN CHUẨN PINTEREST */}
                <div className="pt-2 pb-1 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-200 font-medium">
                    <span>{dayOfWeek}</span>
                    <Clock className="size-3 text-cyan-300" />
                    <span>{timeHour}</span>
                  </div>

                  {/* Bộ số lớn: 06 | 04 | 24 */}
                  <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-lg tracking-widest">
                    <span>{dayDigits}</span>
                    <span className="text-slate-400 font-light text-xl">|</span>
                    <span>{monthDigits}</span>
                    <span className="text-slate-400 font-light text-xl">|</span>
                    <span>{yearDigits}</span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[9.5px] text-slate-300 font-light pt-0.5">
                    <MapPin className="size-3 text-rose-400 shrink-0" />
                    <span className="truncate max-w-xs">{eventLocation}</span>
                  </div>
                </div>

                {/* 6. HÌNH ẢNH CỔNG CHÀO HOÀNG HÔN DƯỚI ĐÁY */}
                <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden mt-1 shadow-lg border border-white/10">
                  <img
                    src={activeBg}
                    alt="Venue Gate"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                  
                  {/* Mã QR tích hợp nhỏ gọn ở góc */}
                  <div className="absolute right-2 bottom-2 p-1 bg-white rounded-md shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(qrValue)}`}
                      alt="QR"
                      className="size-8 object-contain"
                    />
                  </div>
                </div>

                {/* 7. LỜI KẾT SALUTE CHÂN TRANG */}
                <div className="pt-1.5">
                  <div className="text-xs font-serif italic text-slate-200">
                    {saluteText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HÀNH ĐỘNG ÁP DỤNG & GỬI NGAY */}
          <div className="space-y-2 pt-2">
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

      {/* OMNICHANNEL BROADCAST MODAL (GỬI QUA APP, ZALO OA, EMAIL) */}
      <OmnichannelBroadcastModal
        open={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        invitationData={{
          title: mainTitle,
          subtitle: `${kicker} - ${venueHighlight}`,
          posterUrl: currentPosterForBroadcast,
          date: `${dayOfWeek}, ${dayDigits}/${monthDigits}/${yearDigits}`,
          time: timeHour,
          location: eventLocation,
          salutation: `Kính gửi: Quý Doanh Nhân & Hội Viên CEO 1983`,
          bodyText: `${leadPhrase} tại ${venueHighlight}.\nĐặc quyền: ${capsuleBenefit} ${capsuleNote}.\nThời gian: ${dayOfWeek}, ${dayDigits}/${monthDigits}/${yearDigits} lúc ${timeHour}.\nĐịa điểm: ${eventLocation}.\n\n${saluteText}`,
          templateId: selectedTemplateId || undefined,
        }}
        onSuccess={() => {
          setIsBroadcastModalOpen(false);
        }}
      />
    </div>
  );
}
