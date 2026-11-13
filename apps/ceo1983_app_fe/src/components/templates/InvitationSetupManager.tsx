import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mail,
  Calendar,
  MapPin,
  Clock,
  Users,
  Send,
  Eye,
  EyeOff,
  QrCode,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck,
  Search,
  Filter,
  Share2,
  Bell,
  Smartphone,
  Check,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sliders,
  Type,
  Plus,
  Award,
  Building2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";
import { ZaloZbsInvitationModal } from "./ZaloZbsInvitationModal";

export interface ActivityOption {
  id: string;
  title: string;
  type: "event" | "meeting" | "training" | "forum";
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  speaker?: string;
}

export interface SetupRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  ticketType?: string;
  qrCode?: string;
  avatar?: string;
}

// Cấu hình các khối thông tin trên thư mời (Mỗi khối có thể di chuyển Y và xóa/ẩn)
export interface InvitationFieldConfig {
  id: string;
  name: string;
  visible: boolean;
  offsetY: number; // Pixels offset để di chuyển tùy ý
}

export function InvitationSetupManager() {
  // ── 1. DANH SÁCH SỰ KIỆN, CUỘC HỌP, CHƯƠNG TRÌNH ĐÀO TẠO ──
  const [activityCategory, setActivityCategory] = useState<"all" | "event" | "meeting" | "training">("all");
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);

  // ── 2. DANH SÁCH NGƯỜI ĐĂNG KÝ THAM DỰ & ĐẠI BIỂU ──
  const [registeredAttendees, setRegisteredAttendees] = useState<SetupRecipient[]>([]);
  const [allMembers, setAllMembers] = useState<SetupRecipient[]>([]);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>("");
  const [isLoadingAttendees, setIsLoadingAttendees] = useState<boolean>(false);
  const [searchAttendeeQuery, setSearchAttendeeQuery] = useState<string>("");

  // Đại biểu đang chọn hiển thị trên thư mời (tên, avatar, chức vụ)
  const [currentAttendeeAvatar, setCurrentAttendeeAvatar] = useState<string>("");
  const [currentAttendeeName, setCurrentAttendeeName] = useState<string>("Quý Doanh Nghiệp, Quý Đối Tác");
  const [currentAttendeePosition, setCurrentAttendeePosition] = useState<string>("Đại Biểu Danh Dự");
  const [currentAttendeeCompany, setCurrentAttendeeCompany] = useState<string>("Doanh Nghiệp Hội Viên CEO 1983");

  // ── 3. DỮ LIỆU NỘI DUNG THƯ MỜI CHUẨN THEO ẢNH 2 ──
  // Header logos text
  const [logosText, setLogosText] = useState<string>("VIEM | DGROUP | CEO 1983 | VICONNECT");
  // Tiêu đề & Cành nguyệt quế
  const [mainTitle, setMainTitle] = useState<string>("THƯ MỜI");
  const [mainSubtitle, setMainSubtitle] = useState<string>("Tham dự lễ kỷ niệm");
  // Lời dẫn & Kính gửi
  const [greetingHeader, setGreetingHeader] = useState<string>("Kính gửi: Quý Doanh nghiệp, Quý Đối tác!");
  const [greetingProse, setGreetingProse] = useState<string>(
    "Bốn năm – một hành trình kết nối tri thức, kiến tạo giá trị và đồng hành cùng cộng đồng doanh nghiệp Việt Nam phát triển bền vững.\n\nNhân dịp Kỷ niệm 4 năm thành lập Viện Doanh Trí và Tri ân Ngày Nhà giáo Việt Nam 20/11, Viện Doanh Trí trân trọng kính mời Quý vị tham dự tọa đàm:"
  );
  // Dải băng nhãn dưới avatar
  const [avatarRibbonText, setAvatarRibbonText] = useState<string>("★ KHÁCH MỜI ★");
  // Banner chủ đề chính (Glow Pill)
  const [bannerCategory, setBannerCategory] = useState<string>("DOANH NGHIỆP VIỆT 2027:");
  const [bannerHeadline1, setBannerHeadline1] = useState<string>("CỦNG CỐ NỘI LỰC");
  const [bannerHeadline2, setBannerHeadline2] = useState<string>("TẠO ĐÀ TĂNG TRƯỞNG");
  // Thời gian & Địa điểm (2 cột)
  const [eventTimeRange, setEventTimeRange] = useState<string>("14h30 – 22h00");
  const [eventDateString, setEventDateString] = useState<string>("Thứ Bảy, ngày 21/11/2026");
  const [eventVenue, setEventVenue] = useState<string>("Tầng 2, Nhà hàng Long Phụng");
  const [eventAddress, setEventAddress] = useState<string>("29T2 Trung Hòa – Nhân Chính, Hà Nội");
  // Lời cảm ơn & Chữ ký
  const [saluteQuote, setSaluteQuote] = useState<string>(
    "Sự hiện diện của Quý vị là niềm vinh hạnh và góp phần tạo nên thành công của chương trình."
  );
  const [signatureText, setSignatureText] = useState<string>("Trân trọng kính mời!");
  // Footer Kỷ niệm & Skyline
  const [anniversaryNumber, setAnniversaryNumber] = useState<string>("4");
  const [anniversaryLabel, setAnniversaryLabel] = useState<string>("NĂM");
  const [anniversaryTitle, setAnniversaryTitle] = useState<string>("THÀNH LẬP VIỆN DOANH TRÍ (2022 - 2026)");

  // ── 4. CẤU HÌNH VỊ TRÍ & ẨN/XÓA CÁC TRƯỜNG THÔNG TIN TRÊN THƯ MỜI (MỖI TRƯỜNG DI CHUYỂN & XÓA ĐƯỢC) ──
  const [fieldsConfig, setFieldsConfig] = useState<Record<string, InvitationFieldConfig>>({
    logos: { id: "logos", name: "Dải Logo Đối Tác & CLB", visible: true, offsetY: 0 },
    title: { id: "title", name: "Tiêu Đề Thư Mời & Nguyệt Quế", visible: true, offsetY: 0 },
    greeting: { id: "greeting", name: "Lời Chào & Lời Dẫn Kính Gửi", visible: true, offsetY: 0 },
    avatarFrame: { id: "avatarFrame", name: "Khung Avatar & Dải Băng Vàng", visible: true, offsetY: 0 },
    topicBanner: { id: "topicBanner", name: "Banner Chủ Đề Phát Sáng", visible: true, offsetY: 0 },
    timeLocation: { id: "timeLocation", name: "Khối Thời Gian & Địa Điểm 2 Cột", visible: true, offsetY: 0 },
    salutation: { id: "salutation", name: "Lời Tri Ân & Chữ Ký Kính Mời", visible: true, offsetY: 0 },
    footer: { id: "footer", name: "Huy Hiệu Kỷ Niệm & Skyline Thành Phố", visible: true, offsetY: 0 },
  });

  const [activeSelectedField, setActiveSelectedField] = useState<string | null>(null);

  // Hàm toggle ẩn/hiện trường
  const toggleFieldVisibility = (fieldId: string) => {
    setFieldsConfig((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], visible: !prev[fieldId].visible },
    }));
    toast.info(
      fieldsConfig[fieldId].visible
        ? `Đã xóa/ẩn trường "${fieldsConfig[fieldId].name}" khỏi thư mời.`
        : `Đã khôi phục trường "${fieldsConfig[fieldId].name}".`
    );
  };

  // Hàm dịch chuyển vị trí Y của trường (lên hoặc xuống)
  const adjustFieldOffset = (fieldId: string, delta: number) => {
    setFieldsConfig((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], offsetY: Math.min(Math.max(prev[fieldId].offsetY + delta, -60), 60) },
    }));
  };

  // Khôi phục tất cả trường về mặc định
  const handleResetFieldsToDefault = () => {
    setFieldsConfig({
      logos: { id: "logos", name: "Dải Logo Đối Tác & CLB", visible: true, offsetY: 0 },
      title: { id: "title", name: "Tiêu Đề Thư Mời & Nguyệt Quế", visible: true, offsetY: 0 },
      greeting: { id: "greeting", name: "Lời Chào & Lời Dẫn Kính Gửi", visible: true, offsetY: 0 },
      avatarFrame: { id: "avatarFrame", name: "Khung Avatar & Dải Băng Vàng", visible: true, offsetY: 0 },
      topicBanner: { id: "topicBanner", name: "Banner Chủ Đề Phát Sáng", visible: true, offsetY: 0 },
      timeLocation: { id: "timeLocation", name: "Khối Thời Gian & Địa Điểm 2 Cột", visible: true, offsetY: 0 },
      salutation: { id: "salutation", name: "Lời Tri Ân & Chữ Ký Kính Mời", visible: true, offsetY: 0 },
      footer: { id: "footer", name: "Huy Hiệu Kỷ Niệm & Skyline Thành Phố", visible: true, offsetY: 0 },
    });
    toast.success("Đã khôi phục bố cục thư mời chuẩn ban đầu (Ảnh 2)!");
  };

  // Tải avatar tùy chỉnh từ máy tính
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentAttendeeAvatar(reader.result as string);
      toast.success("Đã tải avatar đại biểu lên thư mời thành công!");
    };
    reader.readAsDataURL(file);
  };

  // ── 5. PHÁT HÀNH ĐA KÊNH & LƯU TRỮ ──
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isZaloZbsModalOpen, setIsZaloZbsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // ── CALL API NẠP TOÀN BỘ SỰ KIỆN, CUỘC HỌP, CHƯƠNG TRÌNH ĐÀO TẠO ──
  useEffect(() => {
    setIsLoadingActivities(true);
    Promise.allSettled([
      fetchNestApi<any>("/events"),
      fetchNestApi<any>("/meetings"),
    ])
      .then(([eventsRes, meetingsRes]) => {
        const rawEvents =
          eventsRes.status === "fulfilled"
            ? Array.isArray(eventsRes.value)
              ? eventsRes.value
              : eventsRes.value?.items || eventsRes.value?.data || []
            : [];
        const rawMeetings =
          meetingsRes.status === "fulfilled"
            ? Array.isArray(meetingsRes.value)
              ? meetingsRes.value
              : meetingsRes.value?.items || meetingsRes.value?.data || []
            : [];

        const unifiedList: ActivityOption[] = [];

        // Gộp Sự Kiện & Chương Trình Đào Tạo
        rawEvents.forEach((ev: any) => {
          const isTraining =
            String(ev.type || "").toLowerCase() === "training" ||
            String(ev.category || "").toLowerCase().includes("đào tạo") ||
            String(ev.title || "").toLowerCase().includes("đào tạo");
          unifiedList.push({
            id: ev.id,
            title: ev.title || "Sự kiện CLB CEO 1983",
            type: isTraining ? "training" : "event",
            start_time: ev.start_time || ev.event_date,
            end_time: ev.end_time,
            location: ev.location || "Hà Nội",
            description: ev.description || ev.excerpt || "",
            speaker: ev.speaker || ev.speaker_name,
          });
        });

        // Gộp Cuộc Họp
        rawMeetings.forEach((m: any) => {
          unifiedList.push({
            id: m.id,
            title: m.title || "Cuộc họp Ban CLB CEO 1983",
            type: "meeting",
            start_time: m.meeting_date || m.start_time || m.created_at,
            end_time: m.end_time,
            location: m.location || m.address || "Trụ sở CLB CEO 1983",
            description: m.description || m.agenda || "",
          });
        });

        setActivities(unifiedList);

        if (unifiedList.length > 0) {
          const first = unifiedList[0];
          setSelectedActivityId(first.id);
          applyActivityToFields(first);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingActivities(false));

    // Nạp toàn bộ danh sách hội viên làm danh sách người nhận dự phòng
    fetchNestApi<any[]>("/members")
      .then((res) => {
        if (Array.isArray(res)) {
          const mapped: SetupRecipient[] = res.map((m: any) => ({
            id: m.id || m.userId,
            name: m.name || m.full_name || m.contact || "Hội viên CEO 1983",
            email: m.email,
            phone: m.phone,
            company: m.company || m.company_name || "Doanh nghiệp CLB",
            position: m.position || m.title || "Chủ tịch HĐQT",
            avatar: resolveMediaUrl(m.avatar || m.avatar_url || m.avatarUrl) || "",
          }));
          setAllMembers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Hàm điền tự động dữ liệu sự kiện vào thư mời
  const applyActivityToFields = (act: ActivityOption) => {
    if (act.title) {
      // Tách tiêu đề thành headline
      if (act.title.includes(":")) {
        const parts = act.title.split(":");
        setBannerCategory(parts[0].trim().toUpperCase() + ":");
        setBannerHeadline1(parts.slice(1).join(":").trim().toUpperCase());
      } else {
        setBannerHeadline1(act.title.toUpperCase());
      }
    }
    if (act.location) {
      if (act.location.includes(",")) {
        const locParts = act.location.split(",");
        setEventVenue(locParts[0].trim());
        setEventAddress(locParts.slice(1).join(",").trim());
      } else {
        setEventVenue(act.location);
      }
    }
    if (act.start_time) {
      try {
        const d = new Date(act.start_time);
        const hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, "0");
        setEventTimeRange(`${hours}h${mins} – 22h00`);
        setEventDateString(`Thứ Bảy, ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
      } catch {}
    }
  };

  // ── CALL API TUẦN TỰ: KHI CHỌN SỰ KIỆN ➔ CALL API NẠP DANH SÁCH NGƯỜI ĐĂNG KÝ THAM DỰ ──
  useEffect(() => {
    if (!selectedActivityId) return;
    const act = activities.find((a) => a.id === selectedActivityId);
    if (act) applyActivityToFields(act);

    setIsLoadingAttendees(true);
    fetchNestApi<any>(`/events/registrations?eventId=${selectedActivityId}`)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped: SetupRecipient[] = list.map((r: any) => ({
            id: r.id || r.user_id,
            name: r.name || r.full_name || r.member?.name || r.user?.name || "Người đăng ký",
            email: r.email || r.member?.email || r.user?.email,
            phone: r.phone || r.member?.phone || r.user?.phone,
            company: r.company || r.member?.company || "Doanh nghiệp CLB",
            position: r.position || r.ticket_name || "Đại biểu",
            ticketType: r.ticket_name || "Vé Mời VIP",
            qrCode: r.qr_code || r.ticket_code || "CEO1983-VIP",
            avatar: resolveMediaUrl(r.avatar || r.member?.avatar || r.avatar_url) || "",
          }));
          setRegisteredAttendees(mapped);
          // Tự động chọn người đầu tiên và tự động đưa avatar vào thư mời
          if (mapped.length > 0) {
            applyAttendeeToInvitation(mapped[0]);
          }
        } else {
          setRegisteredAttendees([]);
          // Nếu sự kiện chưa có người đăng ký, sử dụng danh sách hội viên CLB để chọn thử avatar
          if (allMembers.length > 0) {
            applyAttendeeToInvitation(allMembers[0]);
          }
        }
      })
      .catch(() => {
        setRegisteredAttendees([]);
        if (allMembers.length > 0) applyAttendeeToInvitation(allMembers[0]);
      })
      .finally(() => setIsLoadingAttendees(false));
  }, [selectedActivityId, activities, allMembers]);

  // ── KHI CHỌN HỘI VIÊN ĐĂNG KÝ XONG ➔ TỰ ĐỘNG HIỆN AVATAR VÀO KHUNG AVATAR TRÊN THƯ MỜI ──
  const applyAttendeeToInvitation = (attendee: SetupRecipient) => {
    setSelectedAttendeeId(attendee.id);
    setCurrentAttendeeName(attendee.name);
    setCurrentAttendeePosition(attendee.position || "Đại biểu danh dự");
    setCurrentAttendeeCompany(attendee.company || "Doanh nghiệp CEO 1983");
    // Tự động gán Avatar vào khu avatar trên thư mời!
    if (attendee.avatar) {
      setCurrentAttendeeAvatar(attendee.avatar);
    } else {
      setCurrentAttendeeAvatar("");
    }
    toast.success(`Đã đồng bộ thông tin & Avatar của đại biểu "${attendee.name}" vào thư mời!`);
  };

  // Danh sách hiển thị người tham dự
  const displayAttendees = registeredAttendees.length > 0 ? registeredAttendees : allMembers;
  const filteredAttendees = displayAttendees.filter((m) => {
    if (!searchAttendeeQuery.trim()) return true;
    const q = searchAttendeeQuery.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q) ||
      (m.position || "").toLowerCase().includes(q)
    );
  });

  // Lọc hoạt động theo loại
  const filteredActivities = useMemo(() => {
    if (activityCategory === "all") return activities;
    return activities.filter((a) => a.type === activityCategory);
  }, [activities, activityCategory]);

  const handleSaveInvitationSetup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        activityId: selectedActivityId,
        logosText,
        mainTitle,
        mainSubtitle,
        greetingHeader,
        greetingProse,
        avatarRibbonText,
        bannerCategory,
        bannerHeadline1,
        bannerHeadline2,
        eventTimeRange,
        eventDateString,
        eventVenue,
        eventAddress,
        saluteQuote,
        signatureText,
        fieldsConfig,
        attendeeId: selectedAttendeeId,
        attendeeAvatar: currentAttendeeAvatar,
        updatedAt: new Date().toISOString(),
      };

      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ template: payload }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        localStorage.setItem("ceo1983_custom_invitation_config", JSON.stringify(payload));
      }

      toast.success("Đã lưu thiết lập mẫu thư mời thành công!");
    } catch (err: any) {
      toast.error(`Lỗi: ${err?.message || "Không thể lưu mẫu thư mời"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER QUẢN LÝ THƯ MỜI ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A2540] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              STUDIO THƯ MỜI DOANH NHÂN
            </span>
            <span className="text-xs text-blue-200">Chuẩn thiết kế Gala & Tọa đàm 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Mail className="size-6 text-amber-400" />
            Quản Lý & Thiết Kế Thư Mời Sự Kiện - Cuộc Họp - Đào Tạo
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
            Tự do tùy biến từng trường thông tin, di chuyển vị trí, xóa trường tùy ý. Tự động đồng bộ Avatar hội viên đăng ký vào khung Avatar mạ vàng trên thư mời.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetFieldsToDefault}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
            title="Khôi phục lại toàn bộ vị trí & trường thông tin như mẫu ảnh 2"
          >
            <RotateCcw className="size-4" />
            <span>Mẫu Ảnh 2 Chuẩn</span>
          </button>
          <button
            type="button"
            onClick={handleSaveInvitationSetup}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-2 border border-white/30 cursor-pointer"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{isSaving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsZaloZbsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0068FF] hover:bg-[#0052CC] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Smartphone className="size-4" />
            <span>Gửi Zalo ZBS từ File Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="size-4 text-slate-950" />
            <span>Phát Hành Thư Mời</span>
          </button>
        </div>
      </div>

      {/* ── BỐ CỤC 2 CỘT: KHUNG ĐIỀU KHIỂN THIẾT LẬP (TRÁI 7 COLS) + XEM TRƯỚC THƯ MỜI CHUẨN ẢNH 2 (PHẢI 5 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== CỘT TRÁI: ĐIỀU KHIỂN & CALL API LẦN LƯỢT ==================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* MỤC 1: SỬA LABEL THEO YÊU CẦU + CALL API RA LIST SỰ KIỆN, CUỘC HỌP, CHƯƠNG TRÌNH ĐÀO TẠO */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-sky-400 grid place-items-center">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    1. Chọn sự kiện, cuộc họp, chương trình đào tạo
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Call API trực tiếp từ hệ thống, tự động điền tiêu đề, thời gian và địa điểm
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {isLoadingActivities ? "Đang nạp..." : `${filteredActivities.length} mục`}
              </span>
            </div>

            {/* Bộ lọc phân loại hoạt động */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "Tất cả hoạt động" },
                { id: "event", label: "Sự kiện lớn / Gala" },
                { id: "meeting", label: "Cuộc họp Ban" },
                { id: "training", label: "Chương trình đào tạo" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActivityCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activityCategory === cat.id
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Select chọn sự kiện, cuộc họp, đào tạo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Hoạt động mục tiêu phát hành thư mời:
              </label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-[#003B95]"
              >
                {filteredActivities.map((act) => {
                  const tag =
                    act.type === "training"
                      ? "[ĐÀO TẠO]"
                      : act.type === "meeting"
                      ? "[HỌP BAN]"
                      : "[SỰ KIỆN]";
                  return (
                    <option key={act.id} value={act.id}>
                      {tag} {act.title} {act.start_time ? `(${new Date(act.start_time).toLocaleDateString("vi-VN")})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* MỤC 2: CALL API LẦN LƯỢT LẤY NGƯỜI ĐĂNG KÝ VÀ TỰ ĐỘNG HIỆN AVATAR VÀO KHU AVATAR THƯ MỜI */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center">
                  <Users className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Chọn người đăng ký tham dự để gán Avatar
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Chọn hội viên đăng ký xong ➔ Tự động Avatar hiện vào khung Avatar mạ vàng trên thư mời
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200">
                {isLoadingAttendees ? "Đang nạp..." : `${displayAttendees.length} đại biểu`}
              </span>
            </div>

            {/* Select chọn người đăng ký */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Đại biểu danh dự hiển thị trên thiệp:
                </label>
                {registeredAttendees.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic">
                    (Chưa có vé đăng ký, tự động nạp từ danh bạ CLB)
                  </span>
                )}
              </div>

              <select
                value={selectedAttendeeId}
                onChange={(e) => {
                  const att = displayAttendees.find((a) => a.id === e.target.value);
                  if (att) applyAttendeeToInvitation(att);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-amber-500"
              >
                {displayAttendees.map((att) => (
                  <option key={att.id} value={att.id}>
                    👤 {att.name} · {att.position || "Hội viên"} ({att.company || "CEO 1983"})
                  </option>
                ))}
              </select>
            </div>

            {/* Xem trước người nhận đang chọn & Tùy biến Avatar */}
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative size-12 rounded-full ring-2 ring-amber-400 p-0.5 bg-gradient-to-br from-amber-300 to-amber-600 overflow-hidden shrink-0 shadow-sm">
                  {currentAttendeeAvatar ? (
                    <img src={currentAttendeeAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {currentAttendeeName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{currentAttendeeName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase">
                      Đã gán Avatar
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {currentAttendeePosition} · {currentAttendeeCompany}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  onChange={handleCustomAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  title="Thay đổi ảnh avatar khác từ máy tính"
                >
                  <Upload className="size-3 text-amber-500" />
                  <span>Đổi ảnh</span>
                </button>
              </div>
            </div>
          </div>

          {/* MỤC 3: QUẢN LÝ TỪNG TRƯỜNG THÔNG TIN TRÊN THƯ MỜI (DI CHUYỂN TÙY Ý & CÓ THỂ XÓA) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    3. Bố Cục Thư Mời (Mỗi trường di chuyển tùy ý & có thể xóa)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Nhấp vào biểu tượng mắt để ẩn/xóa trường, mũi tên để di chuyển vị trí Y
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFieldsToDefault}
                className="text-xs font-bold text-[#003B95] dark:text-sky-400 hover:underline cursor-pointer"
              >
                Khôi phục tất cả
              </button>
            </div>

            {/* Danh sách 8 trường thông tin thư mời kèm nút di chuyển và xóa */}
            <div className="space-y-2">
              {Object.values(fieldsConfig).map((f) => {
                const isSelected = activeSelectedField === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveSelectedField(f.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                      isSelected
                        ? "border-[#003B95] bg-blue-50/40 dark:bg-blue-950/20"
                        : "border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    } ${!f.visible ? "opacity-50 bg-slate-100/50" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`size-2 rounded-full ${f.visible ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>{f.name}</span>
                          {!f.visible && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold uppercase">
                              Đã xóa/ẩn
                            </span>
                          )}
                        </div>
                        {f.offsetY !== 0 && (
                          <div className="text-[10px] text-blue-600 dark:text-sky-400 font-mono">
                            Độ lệch vị trí Y: {f.offsetY > 0 ? `+${f.offsetY}px` : `${f.offsetY}px`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bộ nút di chuyển (Lên / Xuống) và Xóa/Ẩn */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => adjustFieldOffset(f.id, -5)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Di chuyển trường lên trên (-5px)"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustFieldOffset(f.id, 5)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Di chuyển trường xuống dưới (+5px)"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility(f.id)}
                        className={`p-1.5 rounded-lg cursor-pointer transition ${
                          f.visible
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                        title={f.visible ? "Xóa / Ẩn trường này khỏi thư mời" : "Khôi phục lại trường này"}
                      >
                        {f.visible ? <Trash2 className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MỤC 4: CHỈNH SỬA CHI TIẾT NỘI DUNG CÁC TRƯỜNG THÔNG TIN */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Type className="size-4 text-indigo-600" />
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                4. Nội Dung Chi Tiết Trên Thư Mời
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Logo thanh tiêu đề:
                </label>
                <input
                  type="text"
                  value={logosText}
                  onChange={(e) => setLogosText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu đề chính:
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Phụ đề:
                  </label>
                  <input
                    type="text"
                    value={mainSubtitle}
                    onChange={(e) => setMainSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Lời chào đại biểu:
                </label>
                <input
                  type="text"
                  value={greetingHeader}
                  onChange={(e) => setGreetingHeader(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Đoạn văn mở đầu kính mời:
                </label>
                <textarea
                  rows={3}
                  value={greetingProse}
                  onChange={(e) => setGreetingProse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Nhãn dải băng Avatar:
                  </label>
                  <input
                    type="text"
                    value={avatarRibbonText}
                    onChange={(e) => setAvatarRibbonText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Tiêu đề phân loại Banner:
                  </label>
                  <input
                    type="text"
                    value={bannerCategory}
                    onChange={(e) => setBannerCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Chủ đề dòng 1 (In đậm, nghiêng):
                  </label>
                  <input
                    type="text"
                    value={bannerHeadline1}
                    onChange={(e) => setBannerHeadline1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-blue-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Chủ đề dòng 2 (In đậm, nghiêng):
                  </label>
                  <input
                    type="text"
                    value={bannerHeadline2}
                    onChange={(e) => setBannerHeadline2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Khung giờ:
                  </label>
                  <input
                    type="text"
                    value={eventTimeRange}
                    onChange={(e) => setEventTimeRange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Ngày tháng:
                  </label>
                  <input
                    type="text"
                    value={eventDateString}
                    onChange={(e) => setEventDateString(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Tên địa điểm (Nhà hàng / Khách sạn):
                  </label>
                  <input
                    type="text"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Địa chỉ chi tiết:
                  </label>
                  <input
                    type="text"
                    value={eventAddress}
                    onChange={(e) => setEventAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Lời tri ân (Giữa hai cành lá):
                </label>
                <input
                  type="text"
                  value={saluteQuote}
                  onChange={(e) => setSaluteQuote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs italic"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Chữ ký trang trọng:
                </label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-serif"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT PHẢI: XEM TRƯỚC THƯ MỜI CHUẨN THEO ẢNH 2 (5 COLS) ==================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[430px] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                <Eye className="size-4 text-[#003B95]" />
                Xem Trước Thư Mời Chuẩn (Ảnh 2)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                Vector Luxury
              </span>
            </div>

            {/* THIỆP MỜI HIỂN THỊ CHUẨN 100% THEO ẢNH 2 */}
            <div
              className="w-full rounded-[28px] bg-gradient-to-b from-[#F0F8FF] via-[#FFFFFF] to-[#E6F4FF] text-slate-900 shadow-2xl border-2 border-sky-100 relative overflow-hidden flex flex-col justify-between p-6 select-none"
              style={{
                minHeight: "680px",
                boxShadow: "0 20px 40px -15px rgba(0, 59, 149, 0.2), 0 0 0 1px rgba(186, 230, 253, 0.5)",
              }}
            >
              {/* CÁC ĐƯỜNG CONG NGHỆ THUẬT (XANH LÁ & XANH DƯƠNG - KHÔNG CHÈN TEXT RÁC) */}
              <div
                className="absolute top-0 left-0 w-44 h-44 rounded-full pointer-events-none opacity-40 blur-2xl"
                style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }}
              />
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-30 blur-2xl"
                style={{ background: "radial-gradient(circle, #0284C7 0%, transparent 70%)" }}
              />
              <div
                className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-25 blur-3xl"
                style={{ background: "radial-gradient(circle, #00A859 0%, transparent 70%)" }}
              />

              {/* Dải sóng ribbon nghệ thuật ở góc trên bên trái */}
              <svg className="absolute top-0 left-0 w-40 h-28 pointer-events-none opacity-80" viewBox="0 0 160 110" fill="none">
                <path d="M-20 -10 C30 20, 80 10, 140 -20 L160 0 C90 30, 40 40, -20 10 Z" fill="url(#grad_ribbon_top)" />
                <defs>
                  <linearGradient id="grad_ribbon_top" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dải sóng ribbon ở góc dưới cùng */}
              <svg className="absolute bottom-0 inset-x-0 w-full h-24 pointer-events-none opacity-90" viewBox="0 0 400 90" fill="none" preserveAspectRatio="none">
                <path d="M0 60 Q100 20, 200 45 T400 30 L400 90 L0 90 Z" fill="url(#grad_wave_bot1)" />
                <path d="M0 75 Q150 40, 250 60 T400 50 L400 90 L0 90 Z" fill="url(#grad_wave_bot2)" opacity="0.8" />
                <defs>
                  <linearGradient id="grad_wave_bot1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#003B95" />
                    <stop offset="50%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="grad_wave_bot2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#00A859" />
                  </linearGradient>
                </defs>
              </svg>

              {/* ── NỘI DUNG CHÍNH (CÁC KHỐI CÓ THỂ DI CHUYỂN & XÓA) ── */}
              <div className="relative z-10 space-y-3.5">
                {/* KHỐI 1: DẢI LOGO TRÊN CÙNG */}
                {fieldsConfig.logos?.visible && (
                  <div
                    style={{ transform: `translateY(${fieldsConfig.logos?.offsetY || 0}px)` }}
                    className="flex items-center justify-center gap-2 pt-1 transition-transform"
                  >
                    <div className="flex items-center gap-2 text-[10.5px] font-black uppercase tracking-wider text-slate-800">
                      <span className="flex items-center gap-1 text-[#059669]">
                        <span className="size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black">V</span>
                        VIEM
                      </span>
                      <span className="text-slate-300 font-light">|</span>
                      <span className="flex items-center gap-1 text-orange-600 font-bold">
                        <span className="size-4 rounded-md bg-orange-500 text-white flex items-center justify-center text-[8px] font-black">D</span>
                        DGROUP
                      </span>
                      <span className="text-slate-300 font-light">|</span>
                      <span className="flex items-center gap-1 text-[#003B95] font-black">
                        <span className="size-4 rounded-full bg-[#003B95] text-amber-300 flex items-center justify-center text-[8px] font-black">83</span>
                        CEO 1983
                      </span>
                      <span className="text-slate-300 font-light">|</span>
                      <span className="flex items-center gap-1 text-sky-600 font-black">
                        VICONNECT
                      </span>
                    </div>
                  </div>
                )}

                {/* KHỐI 2: TIÊU ĐỀ THƯ MỜI & CÀNH NGUYỆT QUẾ */}
                {fieldsConfig.title?.visible && (
                  <div
                    style={{ transform: `translateY(${fieldsConfig.title?.offsetY || 0}px)` }}
                    className="text-center pt-2 transition-transform"
                  >
                    <div className="inline-flex items-center justify-center gap-3">
                      <span className="text-xl sm:text-2xl text-slate-400 select-none">🪶</span>
                      <h1 className="text-2xl sm:text-3xl font-black uppercase font-serif tracking-widest text-[#003B95] drop-shadow-sm">
                        {mainTitle}
                      </h1>
                      <span className="text-xl sm:text-2xl text-slate-400 select-none rotate-180">🪶</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                      — {mainSubtitle} —
                    </div>
                  </div>
                )}

                {/* KHỐI 3 & 4: LỜI DẪN (TRÁI) VÀ KHUNG AVATAR ĐẠI BIỂU (PHẢI) */}
                <div className="grid grid-cols-12 gap-3 items-center pt-1">
                  {/* Cột trái: Lời chào và lời dẫn */}
                  {fieldsConfig.greeting?.visible && (
                    <div
                      style={{ transform: `translateY(${fieldsConfig.greeting?.offsetY || 0}px)` }}
                      className={`${fieldsConfig.avatarFrame?.visible ? "col-span-7" : "col-span-12"} space-y-1.5 transition-transform`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-3.5 bg-emerald-600 rounded-full" />
                        <h4 className="text-[11.5px] font-black text-slate-900 leading-tight">
                          {greetingHeader}
                        </h4>
                      </div>
                      <div className="text-[9.5px] text-slate-700 leading-relaxed text-justify space-y-1 font-medium">
                        {greetingProse.split("\n\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cột phải: Khung Avatar tròn viền vàng nguyệt quế và dải băng Khách Mời */}
                  {fieldsConfig.avatarFrame?.visible && (
                    <div
                      style={{ transform: `translateY(${fieldsConfig.avatarFrame?.offsetY || 0}px)` }}
                      className={`${fieldsConfig.greeting?.visible ? "col-span-5" : "col-span-12"} flex flex-col items-center justify-center transition-transform`}
                    >
                      {/* Vòng tròn viền vàng kim có cành nguyệt quế bao quanh */}
                      <div className="relative">
                        {/* Cành nguyệt quế vàng kim bọc quanh */}
                        <div className="absolute -inset-2.5 rounded-full border-2 border-amber-300/80 pointer-events-none" />
                        
                        <div className="size-24 sm:size-28 rounded-full p-1 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 shadow-xl overflow-hidden ring-4 ring-white">
                          {currentAttendeeAvatar ? (
                            <img
                              src={currentAttendeeAvatar}
                              alt={currentAttendeeName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                              <span className="size-10 rounded-full bg-slate-300 mb-1" />
                              <span className="w-14 h-4 rounded-full bg-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Dải băng màu xanh lá cây đậm viền vàng ở mép đáy Avatar */}
                        <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                          <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 border border-amber-300 text-amber-200 text-[9px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                            {avatarRibbonText}
                          </div>
                        </div>
                      </div>

                      {/* Tên đại biểu bên dưới */}
                      <div className="text-center mt-3 pt-0.5">
                        <div className="text-[10px] font-black text-slate-900 line-clamp-1 max-w-[130px]">
                          {currentAttendeeName}
                        </div>
                        <div className="text-[8.5px] text-slate-500 line-clamp-1 max-w-[130px]">
                          {currentAttendeeCompany}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* KHỐI 5: BANNER CHỦ ĐỀ CHÍNH NỔI BẬT (GLOW EMERALD-BLUE CAPSULE) */}
                {fieldsConfig.topicBanner?.visible && (
                  <div
                    style={{ transform: `translateY(${fieldsConfig.topicBanner?.offsetY || 0}px)` }}
                    className="relative w-full rounded-3xl p-3.5 text-center text-white shadow-xl transition-transform overflow-hidden"
                  >
                    {/* Nền gradient phát sáng xanh lá - xanh dương chuẩn ảnh 2 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00A859] via-[#0284C7] to-[#0052CC] opacity-95" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_70%)]" />

                    <div className="relative z-10 space-y-0.5">
                      <div className="text-[10px] font-bold tracking-widest text-emerald-100 uppercase">
                        {bannerCategory}
                      </div>
                      <h2 className="text-base sm:text-lg font-black italic tracking-wide uppercase font-serif drop-shadow-md leading-tight">
                        {bannerHeadline1}
                      </h2>
                      <h3 className="text-base sm:text-lg font-black italic tracking-wide uppercase font-serif drop-shadow-md leading-tight text-yellow-300">
                        {bannerHeadline2}
                      </h3>
                    </div>
                  </div>
                )}

                {/* KHỐI 6: THỜI GIAN VÀ ĐỊA ĐIỂM (2 CỘT CHUẨN ẢNH 2) */}
                {fieldsConfig.timeLocation?.visible && (
                  <div
                    style={{ transform: `translateY(${fieldsConfig.timeLocation?.offsetY || 0}px)` }}
                    className="grid grid-cols-2 gap-3 items-center py-1 transition-transform"
                  >
                    {/* Cột trái: Thời gian */}
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                        <Calendar className="size-5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Thời gian:</div>
                        <div className="text-xs font-black text-slate-900 leading-tight">{eventTimeRange}</div>
                        <div className="text-[9.5px] text-slate-600 font-semibold">{eventDateString}</div>
                      </div>
                    </div>

                    {/* Cột phải: Địa điểm */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                      <div className="size-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Địa điểm:</div>
                        <div className="text-xs font-black text-slate-900 leading-tight">{eventVenue}</div>
                        <div className="text-[9.5px] text-slate-600 font-medium line-clamp-1">{eventAddress}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KHỐI 7: LỜI CẢM ƠN & CHỮ KÝ TRÂN TRỌNG KÍNH MỜI */}
                {fieldsConfig.salutation?.visible && (
                  <div
                    style={{ transform: `translateY(${fieldsConfig.salutation?.offsetY || 0}px)` }}
                    className="text-center pt-2 space-y-1 transition-transform"
                  >
                    <div className="text-[9.5px] text-slate-600 italic font-medium max-w-[340px] mx-auto leading-relaxed">
                      🌿 {saluteQuote} 🌿
                    </div>
                    <div className="size-1.5 bg-emerald-600 rotate-45 mx-auto my-0.5" />
                    <div className="text-lg sm:text-xl font-black font-serif italic text-slate-900">
                      {signatureText}
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 8: FOOTER KỶ NIỆM VÀ SKYLINE TOÀN CẢNH (ĐÁY THIỆP) */}
              {fieldsConfig.footer?.visible && (
                <div
                  style={{ transform: `translateY(${fieldsConfig.footer?.offsetY || 0}px)` }}
                  className="relative z-10 flex items-end justify-between pt-6 border-t border-slate-200/50 transition-transform"
                >
                  {/* Góc trái: Logo 4 năm kỷ niệm */}
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="text-3xl font-black font-serif text-amber-300 drop-shadow-md">
                      {anniversaryNumber}
                    </span>
                    <div className="text-[7.5px] font-bold uppercase leading-tight text-cyan-100">
                      <div>{anniversaryLabel}</div>
                      <div className="font-extrabold text-white">KỶ NIỆM</div>
                      <div className="text-[7px] text-slate-200">{anniversaryTitle}</div>
                    </div>
                  </div>

                  {/* Góc phải: Đồ họa Skyline tòa nhà */}
                  <div className="text-right text-[8px] font-mono font-bold text-white/80 pr-1">
                    CEO 1983 VIP INVITATION
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PHÁT HÀNH ĐA KÊNH */}
      {isBroadcastModalOpen && (
        <OmnichannelBroadcastModal
          open={isBroadcastModalOpen}
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          invitationData={{
            category: "event",
            title: mainTitle,
            subtitle: mainSubtitle,
            date: eventDateString,
            time: eventTimeRange,
            location: `${eventVenue}, ${eventAddress}`,
            salutation: greetingHeader,
            bodyText: greetingProse,
            venueHighlight: eventVenue,
            dayOfWeek: "Thứ Bảy",
            timeHour: eventTimeRange,
            dayDigits: "21",
            monthDigits: "11",
            yearDigits: "26",
            saluteText: signatureText,
            capsuleBenefit: bannerHeadline1 + " - " + bannerHeadline2,
          }}
        />
      )}

      {/* MODAL CẤU HÌNH ZALO ZBS & IMPORT EXCEL GỬI HÀNG LOẠT */}
      {isZaloZbsModalOpen && (
        <ZaloZbsInvitationModal
          open={isZaloZbsModalOpen}
          onClose={() => setIsZaloZbsModalOpen(false)}
          eventData={{
            eventName: mainTitle + (mainSubtitle ? `: ${mainSubtitle}` : ""),
            eventDate: eventDateString,
            eventLocation: `${eventVenue}, ${eventAddress}`,
          }}
        />
      )}
    </div>
  );
}
