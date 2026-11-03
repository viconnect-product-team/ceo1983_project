import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Link as LinkIcon,
  Play,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  PhoneCall,
  Download,
  Share2,
  Radio,
  MapPin,
  QrCode,
  Send,
  Copy,
  Sparkles,
  UserCheck,
  Eye,
  Pencil,
  Trash2,
  Ticket,
  Award,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import {
  CustomTable,
  useCustomTableSort,
  CrmMetricCard,
  CrmMetricGrid,
  CrmToolbar,
  type CustomTableColumn,
} from "@/components/common/CustomTable";
import { StandardDateInput, formatToDdmmyyyy } from "@/components/common/StandardDateInput";
import { GoogleMapAddressPicker } from "@/components/common/GoogleMapAddressPicker";
import { VndCurrencyInput } from "@/components/dashboard/VndCurrencyInput";
import { QrCanvas } from "@/components/member/QrCanvas";

export const Route = createFileRoute("/trainings")({
  component: TrainingsPage,
  head: () => ({
    meta: [
      { title: "Đào Tạo & Khóa Học Doanh Nhân | CEO 1983" },
      {
        name: "description",
        content:
          "Phân hệ quản trị đào tạo, khai báo khóa học doanh nhân và thiết lập phòng họp trực tuyến cho CLB CEO 1983",
      },
    ],
  }),
});

export interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface TrainingItem {
  id: string;
  title: string;
  tagline?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_company?: string;
  description?: string;
  category?: string;
  format?: "online" | "offline" | "hybrid";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  room_id?: string;
  room_url?: string;
  meeting_passcode?: string;
  video_provider?: string;
  max_attendees: number;
  attendee_count: number;
  ticket_tiers?: TicketTier[];
  materials?: { title: string; url: string }[];
  cover_image?: string;
  registration_url?: string;
  open_registration?: boolean;
  created_at?: string;
  attendees?: any[];
}

export function TrainingsPage() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Modals
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingItem | null>(null);
  const [detailTraining, setDetailTraining] = useState<TrainingItem | null>(null);
  const [activeCallRoom, setActiveCallRoom] = useState<{ id: string; title: string; link: string } | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<TrainingItem | null>(null);

  // Form State cho Khai Báo Khóa Đào Tạo (Chuẩn như Sự Kiện, có số lượng & hạng vé, KHÔNG xếp chỗ)
  const [formTitle, setFormTitle] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formInstructorName, setFormInstructorName] = useState("");
  const [formInstructorTitle, setFormInstructorTitle] = useState("");
  const [formInstructorCompany, setFormInstructorCompany] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Kỹ năng lãnh đạo");
  const [formFormat, setFormFormat] = useState<"online" | "offline" | "hybrid">("hybrid");
  const [formStatus, setFormStatus] = useState<"upcoming" | "ongoing" | "completed" | "cancelled">("upcoming");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:30");
  const [formEndTime, setFormEndTime] = useState("11:30");
  const [formLocation, setFormLocation] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formRoomId, setFormRoomId] = useState("");
  const [formRoomUrl, setFormRoomUrl] = useState("");
  const [formMeetingPasscode, setFormMeetingPasscode] = useState("198388");
  const [formMaxAttendees, setFormMaxAttendees] = useState("100");
  const [formMaterialsUrl, setFormMaterialsUrl] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formRegistrationUrl, setFormRegistrationUrl] = useState("");
  const [formTicketTiers, setFormTicketTiers] = useState<TicketTier[]>([
    {
      name: "Vé Hội Viên CEO 1983",
      price: 0,
      quantity: 100,
      description: "Đặc quyền miễn phí 100% dành cho hội viên chính thức CLB",
    },
    {
      name: "Vé Doanh Nhân Khách Mời",
      price: 500000,
      quantity: 20,
      description: "Dành cho đại biểu & khách mời ngoài CLB giao lưu",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Load danh sách khóa đào tạo từ CSDL Backend
  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await fetchNestApi<any>("/trainings");
      const list = Array.isArray(res) ? res : res?.items || [];
      if (Array.isArray(list)) {
        setTrainings(list);
      }
    } catch {
      toast.error("Không thể tải danh sách khóa đào tạo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // Filter dữ liệu
  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const matchSearch =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.instructor_name && t.instructor_name.toLowerCase().includes(search.toLowerCase())) ||
        (t.location && t.location.toLowerCase().includes(search.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchFormat = formatFilter === "all" || t.format === formatFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;

      return matchSearch && matchFormat && matchStatus;
    });
  }, [trainings, search, formatFilter, statusFilter]);

  // Hook sắp xếp 3 trạng thái chuẩn CRM CEO 1983
  const { sortKey, sortDir, handleSort, sortData } = useCustomTableSort<TrainingItem>(
    "start_time",
    "desc"
  );

  const sortedTrainings = useMemo(() => {
    return sortData(filteredTrainings, {
      title: (t) => t.title,
      instructor_name: (t) => t.instructor_name || "",
      start_time: (t) => (t.start_time ? new Date(t.start_time).getTime() : 0),
      format: (t) => t.format || "hybrid",
      max_attendees: (t) => Number(t.max_attendees) || 0,
      attendee_count: (t) => Number(t.attendee_count) || 0,
      status: (t) => t.status,
    });
  }, [filteredTrainings, sortData]);

  const pagedTrainings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedTrainings.slice(start, start + pageSize);
  }, [sortedTrainings, page, pageSize]);

  // Tính toán 4 chỉ số KPI Metric Grid
  const kpis = useMemo(() => {
    const total = trainings.length;
    const active = trainings.filter((t) => t.status === "upcoming" || t.status === "ongoing").length;
    const totalAttendees = trainings.reduce((acc, t) => acc + (Number(t.attendee_count) || 0), 0);
    const totalCapacity = trainings.reduce((acc, t) => acc + (Number(t.max_attendees) || 0), 0);
    return { total, active, totalAttendees, totalCapacity };
  }, [trainings]);

  // Reset form mở modal tạo mới
  const handleOpenCreate = () => {
    setEditingTraining(null);
    setFormTitle("");
    setFormTagline("Chuyên đề nâng cao năng lực quản trị doanh nghiệp CEO 1983");
    setFormInstructorName("");
    setFormInstructorTitle("Chuyên gia cố vấn Ban Điều Hành");
    setFormInstructorCompany("CLB Doanh Nhân CEO 1983");
    setFormDescription("");
    setFormCategory("Kỹ năng lãnh đạo");
    setFormFormat("hybrid");
    setFormStatus("upcoming");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStartTime("08:30");
    setFormEndTime("11:30");
    setFormLocation("Hội trường VIP Keangnam Landmark 72, Hà Nội");
    setFormAddress("Tầng 5, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội");
    const autoRoomId = `CEO1983_DAO_TAO_${Date.now().toString(36).toUpperCase()}`;
    setFormRoomId(autoRoomId);
    setFormRoomUrl(`https://meet.jit.si/${autoRoomId}`);
    setFormMeetingPasscode("198388");
    setFormMaxAttendees("100");
    setFormMaterialsUrl("");
    setFormCoverImage("");
    setFormRegistrationUrl("");
    setFormTicketTiers([
      {
        name: "Vé Hội Viên CEO 1983",
        price: 0,
        quantity: 100,
        description: "Đặc quyền miễn phí 100% dành cho hội viên chính thức CLB",
      },
      {
        name: "Vé Doanh Nhân Khách Mời",
        price: 500000,
        quantity: 20,
        description: "Dành cho đại biểu & khách mời ngoài CLB giao lưu",
      },
    ]);
    setShowWizardModal(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (t: TrainingItem) => {
    setEditingTraining(t);
    setFormTitle(t.title);
    setFormTagline(t.tagline || "");
    setFormInstructorName(t.instructor_name || "");
    setFormInstructorTitle(t.instructor_title || "");
    setFormInstructorCompany(t.instructor_company || "");
    setFormDescription(t.description || "");
    setFormCategory(t.category || "Kỹ năng lãnh đạo");
    setFormFormat(t.format || "hybrid");
    setFormStatus(t.status || "upcoming");
    if (t.start_time) {
      const d = new Date(t.start_time);
      setFormDate(d.toISOString().split("T")[0]);
      setFormStartTime(d.toTimeString().slice(0, 5));
    }
    if (t.end_time) {
      const d = new Date(t.end_time);
      setFormEndTime(d.toTimeString().slice(0, 5));
    }
    setFormLocation(t.location || "");
    setFormAddress(t.address || "");
    setFormRoomId(t.room_id || "");
    setFormRoomUrl(t.room_url || "");
    setFormMeetingPasscode(t.meeting_passcode || "198388");
    setFormMaxAttendees(String(t.max_attendees || 100));
    setFormMaterialsUrl(t.materials && t.materials[0] ? t.materials[0].url : "");
    setFormCoverImage(t.cover_image || "");
    setFormRegistrationUrl(t.registration_url || "");
    setFormTicketTiers(
      t.ticket_tiers && t.ticket_tiers.length > 0
        ? t.ticket_tiers
        : [
            {
              name: "Vé Hội Viên CEO 1983",
              price: 0,
              quantity: t.max_attendees || 100,
              description: "Đặc quyền miễn phí 100% dành cho hội viên",
            },
          ]
    );
    setShowWizardModal(true);
  };

  // Lưu tạo / cập nhật khóa đào tạo
  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Vui lòng nhập tên khóa đào tạo!");
      return;
    }

    setSubmitting(true);
    try {
      const startIso = formDate
        ? new Date(`${formDate}T${formStartTime || "08:30"}:00`).toISOString()
        : new Date().toISOString();
      const endIso = formDate
        ? new Date(`${formDate}T${formEndTime || "11:30"}:00`).toISOString()
        : new Date(Date.now() + 3600000 * 3).toISOString();

      const payload = {
        title: formTitle.trim(),
        tagline: formTagline.trim(),
        instructorName: formInstructorName.trim() || "Ban Đào Tạo CLB CEO 1983",
        instructorTitle: formInstructorTitle.trim(),
        instructorCompany: formInstructorCompany.trim(),
        description: formDescription.trim(),
        category: formCategory,
        format: formFormat,
        status: formStatus,
        startTime: startIso,
        endTime: endIso,
        location: formLocation.trim() || "Keangnam Landmark 72, Hà Nội",
        address: formAddress.trim(),
        roomId: formRoomId.trim(),
        roomUrl: formRoomUrl.trim() || `https://meet.jit.si/${formRoomId || "CEO1983_DAO_TAO"}`,
        meetingPasscode: formMeetingPasscode.trim(),
        maxAttendees: parseInt(formMaxAttendees) || 100,
        ticketTiers: formTicketTiers,
        materials: formMaterialsUrl.trim()
          ? [{ title: "Giáo trình & Slide đào tạo", url: formMaterialsUrl.trim() }]
          : [],
        coverImage: formCoverImage.trim(),
        registrationUrl: formRegistrationUrl.trim(),
      };

      if (editingTraining) {
        await fetchNestApi(`/trainings/${editingTraining.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success(`Đã cập nhật khóa đào tạo "${formTitle}" thành công!`);
      } else {
        await fetchNestApi("/trainings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success(`Đã khai báo thành công khóa đào tạo "${formTitle}"!`);
      }

      setShowWizardModal(false);
      await fetchTrainings();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu thông tin khóa đào tạo");
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa khóa đào tạo
  const handleDeleteTraining = async (t: TrainingItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khóa đào tạo "${t.title}"?`)) return;
    try {
      await fetchNestApi(`/trainings/${t.id}`, { method: "DELETE" });
      toast.success(`Đã xóa khóa đào tạo "${t.title}"`);
      await fetchTrainings();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi xóa khóa đào tạo");
    }
  };

  // Định nghĩa các cột cho CustomTable
  const columns: CustomTableColumn<TrainingItem>[] = [
    {
      key: "title",
      label: "Khóa Đào Tạo & Chuyên Đề",
      width: 320,
      render: (t) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setDetailTraining(t)}
              className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#003B95] dark:hover:text-blue-400 hover:underline text-left line-clamp-1 cursor-pointer"
            >
              {t.title}
            </button>
            {t.tagline && (
              <div className="text-[11px] text-slate-500 line-clamp-1">{t.tagline}</div>
            )}
            <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-slate-500">
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                {t.category || "Kỹ năng"}
              </span>
              <span>·</span>
              <span className="capitalize">
                {t.format === "online"
                  ? "🌐 Trực tuyến"
                  : t.format === "offline"
                  ? "🏢 Trực tiếp"
                  : "⚡ Kết hợp Hybrid"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "instructor_name",
      label: "Giảng Viên / Chuyên Gia",
      width: 220,
      render: (t) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-xs">
            {t.instructor_name || "Ban Đào Tạo"}
          </div>
          <div className="text-[11px] text-slate-500">
            {t.instructor_title || t.instructor_company || "Cố vấn CLB"}
          </div>
        </div>
      ),
    },
    {
      key: "start_time",
      label: "Thời Gian Diễn Ra",
      width: 180,
      render: (t) => {
        if (!t.start_time) return <span className="text-slate-400">Chưa xếp lịch</span>;
        const d = new Date(t.start_time);
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white text-xs">
              <Calendar className="h-3.5 w-3.5 text-[#003B95]" />
              <span>{d.toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" />
              <span>
                {d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "max_attendees",
      label: "Học Viên / Sức Chứa",
      width: 170,
      render: (t) => {
        const count = t.attendee_count || 0;
        const max = t.max_attendees || 100;
        const pct = Math.min(100, Math.round((count / max) * 100));
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-900 dark:text-white">
                {count}/{max} học viên
              </span>
              <span className="text-muted-foreground font-semibold">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-[#003B95] dark:bg-blue-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {t.ticket_tiers ? `${t.ticket_tiers.length} hạng vé` : "1 hạng vé"}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Trạng Thái",
      width: 140,
      render: (t) => {
        const isOngoing = t.status === "ongoing";
        const isUpcoming = t.status === "upcoming";
        const isCompleted = t.status === "completed";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isOngoing
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse"
                : isUpcoming
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                : isCompleted
                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isOngoing && <Radio className="h-3 w-3 text-rose-600 animate-spin" />}
            {isOngoing
              ? "Đang Diễn Ra"
              : isUpcoming
              ? "Sắp Diễn Ra"
              : isCompleted
              ? "Đã Kết Thúc"
              : "Đã Hủy"}
          </span>
        );
      },
    },
  ];

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header với Icon Logo */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold font-['Inter'] leading-8">
              Quản Lý Đào Tạo &amp; Phòng Họp Doanh Nhân
            </h1>
            <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
              Khai báo khóa học chuyên sâu, phân phối hạng vé học viên, thiết lập phòng họp trực tuyến và quản trị điểm danh điện tử cho CLB CEO 1983
            </p>
          </div>
        </div>

        {/* ── 4 THẺ METRIC GRADIENT FIGMA CHUẨN ── */}
        <CrmMetricGrid>
          <CrmMetricCard
            label="TỔNG KHÓA ĐÀO TẠO"
            value={kpis.total}
            sub="Khóa học & chuyên đề đã tạo"
            icon={GraduationCap}
            tone="sky"
          />
          <CrmMetricCard
            label="ĐANG &amp; SẮP DIỄN RA"
            value={kpis.active}
            sub="Khóa học sẵn sàng đón học viên"
            icon={Calendar}
            tone="violet"
          />
          <CrmMetricCard
            label="LƯỢT HỌC VIÊN ĐĂNG KÝ"
            value={kpis.totalAttendees}
            sub="Hội viên & doanh nhân đã đăng ký"
            icon={UserCheck}
            tone="green"
          />
          <CrmMetricCard
            label="QUY MÔ CHỖ ĐÀO TẠO"
            value={kpis.totalCapacity}
            sub="Tổng số lượng học viên tối đa"
            icon={Users}
            tone="orange"
          />
        </CrmMetricGrid>

        {/* ── TOOLBAR TÌM KIẾM CẠNH THÊM MỚI (FIGMA STYLE) ── */}
        <CrmToolbar
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
          searchPlaceholder="Tìm theo tên khóa học, giảng viên, địa điểm..."
          addButtonLabel="Khai Báo Khóa Học Mới"
          onAddClick={handleOpenCreate}
        >
          <div className="flex items-center gap-2">
            <select
              value={formatFilter}
              onChange={(e) => {
                setFormatFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-[100px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="all">Tất cả hình thức</option>
              <option value="online">🌐 Trực tuyến (Online)</option>
              <option value="offline">🏢 Trực tiếp (Offline)</option>
              <option value="hybrid">⚡ Kết hợp (Hybrid)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-[100px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
        </CrmToolbar>

        {/* ── CUSTOM TABLE VỚI SẮP XẾP 3 TRẠNG THÁI & PHÂN TRANG ── */}
        <CustomTable<TrainingItem>
          columns={columns}
          data={pagedTrainings}
          keyExtractor={(t) => t.id}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          showStt={true}
          page={page}
          pageSize={pageSize}
          total={sortedTrainings.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          actionColumn={{
            title: "THAO TÁC",
            width: 220,
            render: (t) => (
              <div className="flex items-center justify-center gap-1.5">
                {/* Vào phòng Video Call */}
                {t.room_url && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCallRoom({
                        id: t.id,
                        title: t.title,
                        link: t.room_url || `https://meet.jit.si/${t.room_id || t.id}`,
                      })
                    }
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
                    title="Vào phòng họp Video Call trực tuyến"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                )}

                {/* Điểm danh QR */}
                <button
                  type="button"
                  onClick={() => setActiveQrModal(t)}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
                  title="Mã QR Điểm danh học viên điện tử"
                >
                  <QrCode className="h-4 w-4" />
                </button>

                {/* Chi tiết */}
                <button
                  type="button"
                  onClick={() => setDetailTraining(t)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                  title="Xem chi tiết khóa học"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Sửa */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
                  title="Chỉnh sửa khóa học"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {/* Xóa */}
                <button
                  type="button"
                  onClick={() => handleDeleteTraining(t)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100 transition cursor-pointer"
                  title="Xóa khóa học"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          }}
          emptyText="Chưa có khóa đào tạo nào phù hợp bộ lọc."
          emptyAction={
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B95] text-white text-xs font-bold shadow-xs hover:bg-[#002f78] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Khai Báo Khóa Học Mới Ngay</span>
            </button>
          }
        />

        {/* ── MODAL KHAI BÁO KHÓA ĐÀO TẠO (CHUẨN EVENT WIZARD, CÓ SỐ LƯỢNG & HẠNG VÉ, KHÔNG XẾP CHỖ) ── */}
        {showWizardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingTraining
                        ? "Chỉnh Sửa Khai Báo Khóa Đào Tạo"
                        : "Khai Báo Khóa Đào Tạo Doanh Nhân Mới"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Thiết lập chuyên đề, giảng viên, hình thức tổ chức, số lượng học viên &amp; hạng vé
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWizardModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveTraining} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* 1. Tên & Tagline */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>1. Thông Tin Khóa Học &amp; Chuyên Đề</span>
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên Khóa Đào Tạo / Buổi Chia Sẻ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ví dụ: Chiến Lược Quản Trị Dòng Tiền & Tối Ưu Thuế 2026"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Khẩu Hiệu / Tagline Khóa Học
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="Ví dụ: Nâng cao năng lực tài chính chiến lược cho chủ doanh nghiệp CEO 1983"
                      className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs text-foreground outline-none focus:border-[#003B95]"
                    />
                  </div>
                </div>

                {/* 2. Giảng Viên / Diễn Giả */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>2. Giảng Viên &amp; Đơn Vị Đào Tạo</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Họ &amp; Tên Giảng Viên
                      </label>
                      <input
                        type="text"
                        value={formInstructorName}
                        onChange={(e) => setFormInstructorName(e.target.value)}
                        placeholder="ThS. Nguyễn Văn A"
                        className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Chức Danh / Học Vị
                      </label>
                      <input
                        type="text"
                        value={formInstructorTitle}
                        onChange={(e) => setFormInstructorTitle(e.target.value)}
                        placeholder="Chuyên gia Tài chính Doanh nghiệp"
                        className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Đơn Vị Công Tác / Học Viện
                      </label>
                      <input
                        type="text"
                        value={formInstructorCompany}
                        onChange={(e) => setFormInstructorCompany(e.target.value)}
                        placeholder="Học viện Quản trị & CLB CEO 1983"
                        className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Thời Gian & Hình Thức */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>3. Thời Gian &amp; Hình Thức Tổ Chức</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ngày Diễn Ra
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Giờ Bắt Đầu
                      </label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Giờ Kết Thúc
                      </label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hình Thức Tổ Chức
                      </label>
                      <select
                        value={formFormat}
                        onChange={(e) => setFormFormat(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none cursor-pointer focus:border-[#003B95]"
                      >
                        <option value="hybrid">⚡ Kết hợp Trực tiếp &amp; Online (Hybrid)</option>
                        <option value="online">🌐 Hoàn toàn Trực tuyến (Video Call Jitsi)</option>
                        <option value="offline">🏢 Trực tiếp tại Hội trường (Offline)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Trạng Thái Khóa Học
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none cursor-pointer focus:border-[#003B95]"
                      >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra (Phát trực tiếp)</option>
                        <option value="completed">Đã kết thúc</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>

                  {/* Địa điểm (nếu Offline/Hybrid) */}
                  {formFormat !== "online" && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Địa Điểm Hội Trường Tổ Chức
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Hội trường VIP Keangnam Landmark 72, Hà Nội"
                        className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none focus:border-[#003B95]"
                      />
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Số nhà, phố, quận/huyện chi tiết..."
                        className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs text-foreground outline-none focus:border-[#003B95]"
                      />
                    </div>
                  )}

                  {/* Phòng Họp Trực Tuyến (nếu Online/Hybrid) */}
                  {formFormat !== "offline" && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Phòng Họp Trực Tuyến (Jitsi Video)
                        </label>
                        <input
                          type="text"
                          value={formRoomId}
                          onChange={(e) => {
                            setFormRoomId(e.target.value);
                            setFormRoomUrl(`https://meet.jit.si/${e.target.value}`);
                          }}
                          placeholder="Mã phòng họp..."
                          className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-mono text-foreground outline-none focus:border-[#003B95]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mật Mã Phòng Họp (Passcode)
                        </label>
                        <input
                          type="text"
                          value={formMeetingPasscode}
                          onChange={(e) => setFormMeetingPasscode(e.target.value)}
                          placeholder="198388"
                          className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-mono font-bold text-foreground outline-none focus:border-[#003B95]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. SỐ LƯỢNG HỌC VIÊN TỐI ĐA & HẠNG VÉ (CÓ SỐ LƯỢNG - TUYỆT ĐỐI KHÔNG XẾP CHỖ) */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                      <Ticket className="h-4 w-4" />
                      <span>4. Số Lượng Học Viên &amp; Hạng Vé (Không Xếp Chỗ)</span>
                    </h3>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Tự do vào lớp, quét mã QR điểm danh
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tổng Số Lượng Học Viên Tối Đa (Sức Chứa / Capacity) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={formMaxAttendees}
                      onChange={(e) => setFormMaxAttendees(e.target.value)}
                      placeholder="100"
                      className="w-full sm:w-48 h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none focus:border-[#003B95]"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Hệ thống tự động khóa đăng ký khi đạt giới hạn số lượng học viên này.
                    </p>
                  </div>

                  {/* Bảng cấu hình các hạng vé */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Danh Sách Hạng Vé Học Viên
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormTicketTiers((prev) => [
                            ...prev,
                            {
                              name: `Hạng vé ${prev.length + 1}`,
                              price: 0,
                              quantity: 20,
                              description: "Quyền lợi học viên tiêu chuẩn",
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Thêm Hạng Vé</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formTicketTiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800"
                        >
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormTicketTiers((prev) =>
                                prev.map((t, i) => (i === idx ? { ...t, name: val } : t))
                              );
                            }}
                            placeholder="Tên hạng vé..."
                            className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none focus:border-[#003B95]"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={tier.price}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setFormTicketTiers((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, price: val } : t))
                                );
                              }}
                              placeholder="Giá vé (0đ = Miễn phí)"
                              className="w-28 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-xs font-semibold text-foreground outline-none"
                            />
                            <span className="text-[11px] text-slate-500 font-bold">VNĐ</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              value={tier.quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 1;
                                setFormTicketTiers((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, quantity: val } : t))
                                );
                              }}
                              placeholder="Số lượng"
                              className="w-20 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-background text-xs font-bold text-foreground outline-none text-center"
                            />
                            <span className="text-[11px] text-slate-500">vé</span>
                          </div>
                          {formTicketTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormTicketTiers((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer self-end sm:self-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Tài Liệu & Mô Tả */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>5. Tài Liệu &amp; Nội Dung Giảng Dạy</span>
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Link Tài Liệu / Giáo Trình Slide
                    </label>
                    <input
                      type="url"
                      value={formMaterialsUrl}
                      onChange={(e) => setFormMaterialsUrl(e.target.value)}
                      placeholder="https://drive.google.com/... hoặc link tải slide"
                      className="w-full h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs text-foreground outline-none focus:border-[#003B95]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mô Tả &amp; Mục Tiêu Khóa Đào Tạo
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Tóm tắt nội dung trọng tâm, mục tiêu đạt được sau buổi học..."
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-xs font-normal text-foreground outline-none focus:border-[#003B95]"
                    />
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowWizardModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-card text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold shadow-md hover:bg-[#002f78] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{editingTraining ? "Lưu Cập Nhật" : "Hoàn Tất Khai Báo"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL CHI TIẾT KHÓA HỌC ── */}
        {detailTraining && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-5 w-5 text-[#003B95]" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Chi Tiết Khóa Đào Tạo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailTraining(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {detailTraining.title}
                  </h4>
                  {detailTraining.tagline && (
                    <p className="text-slate-500 mt-0.5">{detailTraining.tagline}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 font-semibold block">Giảng viên:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {detailTraining.instructor_name || "Ban Đào Tạo"} (
                      {detailTraining.instructor_title || "Chuyên gia"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Hình thức:</span>
                    <span className="font-bold text-[#003B95] capitalize">
                      {detailTraining.format || "Hybrid"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Quy mô chỗ ngồi:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {detailTraining.attendee_count || 0}/{detailTraining.max_attendees} học viên (Không xếp chỗ)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Thời gian:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {detailTraining.start_time
                        ? new Date(detailTraining.start_time).toLocaleString("vi-VN")
                        : "Chưa ấn định"}
                    </span>
                  </div>
                </div>

                {detailTraining.description && (
                  <div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Mục tiêu &amp; Nội dung:</div>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                      {detailTraining.description}
                    </p>
                  </div>
                )}

                {/* Hạng vé */}
                {detailTraining.ticket_tiers && detailTraining.ticket_tiers.length > 0 && (
                  <div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Các Hạng Vé Khóa Học:
                    </div>
                    <div className="space-y-2">
                      {detailTraining.ticket_tiers.map((tt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{tt.name}</div>
                            {tt.description && (
                              <div className="text-[11px] text-slate-500">{tt.description}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#003B95]">
                              {tt.price === 0
                                ? "Miễn Phí 0đ"
                                : `${tt.price.toLocaleString("vi-VN")} VNĐ`}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              Số lượng: {tt.quantity} vé
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phòng họp online */}
                {detailTraining.room_url && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-900 dark:text-blue-200">
                        Phòng Học Video Call Jitsi
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">
                        Pass: {detailTraining.meeting_passcode || "198388"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailTraining(null);
                        setActiveCallRoom({
                          id: detailTraining.id,
                          title: detailTraining.title,
                          link: detailTraining.room_url || "",
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-800 text-white font-bold text-xs shadow-xs hover:bg-blue-900 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="h-4 w-4" />
                      <span>Vào Phòng Học</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL QR CHECK-IN ĐIỂM DANH HỌC VIÊN ── */}
        {activeQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-2xl text-center space-y-4">
              <button
                type="button"
                onClick={() => setActiveQrModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mã QR Điểm Danh Học Viên
                </h3>
                <p className="text-xs text-slate-500 mt-1">{activeQrModal.title}</p>
              </div>

              <div className="flex justify-center p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-xs">
                <QrCanvas
                  value={`CEO1983_TRAINING_CHECKIN|TRAINING_ID:${activeQrModal.id}|TITLE:${encodeURIComponent(
                    activeQrModal.title
                  )}`}
                  size={180}
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Học viên dùng Camera hoặc App CEO 1983 quét mã này tại cửa phòng học để xác nhận điểm danh tự động.
              </div>

              <button
                type="button"
                onClick={() => setActiveQrModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL PHÒNG HỌP TRỰC TUYẾN (IFRAME VIDEO CALL JITSI) ── */}
        {activeCallRoom && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm truncate">{activeCallRoom.title}</span>
                <span className="text-xs text-slate-400 font-mono">
                  (Video Call Jitsi Bảo Mật CLB CEO 1983)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeCallRoom.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở Tab Riêng</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveCallRoom(null)}
                  className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full bg-black">
              <iframe
                src={activeCallRoom.link}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title={activeCallRoom.title}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
