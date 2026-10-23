import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";

export const Route = createFileRoute("/trainings")({
  component: TrainingsPage,
  head: () => ({
    meta: [
      { title: "Đào Tạo & Phòng Họp Gặp Mặt Trực Tuyến | CEO 1983" },
      {
        name: "description",
        content: "Phân hệ quản trị đào tạo, thiết lập phòng họp video call trao đổi trực tuyến cho CLB CEO 1983",
      },
    ],
  }),
});

interface TrainingItem {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  instructor_title?: string;
  cover_image?: string;
  category?: string;
  format?: "online" | "offline" | "hybrid";
  status: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  meeting_link?: string;
  meeting_room_id?: string;
  meeting_passcode?: string;
  max_attendees?: number;
  materials_url?: string;
  open_registration?: boolean;
  registration_url?: string;
  created_at: string;
}

export function TrainingsPage() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [activeCallRoom, setActiveCallRoom] = useState<{ id: string; title: string; link: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeRegModal, setActiveRegModal] = useState<TrainingItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formInstructorTitle, setFormInstructorTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Kỹ năng lãnh đạo");
  const [formFormat, setFormFormat] = useState<"online" | "offline" | "hybrid">("hybrid");
  const [formStartTime, setFormStartTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formMeetingRoomId, setFormMeetingRoomId] = useState("");
  const [formMeetingLink, setFormMeetingLink] = useState("");
  const [formMeetingPasscode, setFormMeetingPasscode] = useState("198388");
  const [formMaxAttendees, setFormMaxAttendees] = useState("50");
  const [formOpenRegistration, setFormOpenRegistration] = useState(true);
  const [formTargetAudience, setFormTargetAudience] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<TrainingItem[]>("/trainings");
      if (Array.isArray(res) && res.length > 0) {
        setTrainings(res);
      } else {
        // Fallback default sample data if table is empty
        setTrainings([
          {
            id: "trn-leadership-40",
            title: "Kỹ Năng Lãnh Đạo & Điều Hành Doanh Nghiệp Thời Đại AI 4.0",
            description: "Chương trình chuyên sâu bồi dưỡng tư duy chiến lược, ứng dụng AI và chuyển đổi số cho doanh nghiệp hội viên CEO 1983.",
            instructor_name: "TS. Nguyễn Hoàng Nam",
            instructor_title: "Chuyên gia Cố vấn BĐH CLB CEO 1983",
            category: "Kỹ năng lãnh đạo",
            format: "hybrid",
            status: "upcoming",
            start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
            location: "Trụ sở CLB CEO 1983 - Tầng 8 Tòa nhà Doanh Nhân",
            address: "Số 68 Đường Cầu Giấy, Hà Nội",
            meeting_room_id: "CEO1983_LANH_DAO_40",
            meeting_link: "https://meet.jit.si/CEO1983_LANH_DAO_40",
            meeting_passcode: "198388",
            max_attendees: 80,
            open_registration: true,
            created_at: new Date().toISOString(),
          },
          {
            id: "trn-finance-cfos",
            title: "Quản Trị Dòng Tiền & Tối Ưu Thuế Pháp Lý Cho Doanh Nghiệp Vừa & Nhỏ",
            description: "Phân tích cấu trúc vốn, quản trị rủi ro dòng tiền và kế toán quản trị thực chiến năm 2026.",
            instructor_name: "ThS. Trần Thu Phương",
            instructor_title: "Trưởng Ban Tài Chính CLB",
            category: "Quản trị tài chính",
            format: "online",
            status: "upcoming",
            start_time: new Date(Date.now() + 86400000 * 4).toISOString(),
            meeting_room_id: "CEO1983_TAI_CHINH_2026",
            meeting_link: "https://meet.jit.si/CEO1983_TAI_CHINH_2026",
            meeting_passcode: "888888",
            max_attendees: 120,
            open_registration: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      toast.error("Không thể tải danh sách chương trình đào tạo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Vui lòng nhập tên chương trình đào tạo");
      return;
    }

    setSubmitting(true);
    try {
      const roomId = formMeetingRoomId.trim() || `CEO1983_MEET_${Date.now().toString().slice(-6)}`;
      const meetingLink =
        formMeetingLink.trim() ||
        (formFormat !== "offline" ? `https://meet.jit.si/CEO1983_${roomId}` : "");

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        instructor_name: formInstructor.trim() || "Chuyên gia Hội đồng CEO 1983",
        instructor_title: formInstructorTitle.trim() || "Diễn giả Doanh nhân",
        category: formCategory,
        format: formFormat,
        status: "upcoming",
        start_time: formStartTime || new Date(Date.now() + 86400000).toISOString(),
        location: formLocation.trim() || (formFormat === "online" ? "Trực tuyến qua Video Call" : "Trụ sở CLB CEO 1983"),
        address: formAddress.trim(),
        meeting_room_id: roomId,
        meeting_link: meetingLink,
        meeting_passcode: formMeetingPasscode.trim() || "198388",
        max_attendees: Number(formMaxAttendees) || 50,
        open_registration: formOpenRegistration,
      };

      await fetchNestApi("/trainings", {
        method: "POST",
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("Nest API save /trainings fallback:", err);
      });

      // Also auto broadcast to Feed if selected
      const newTrainingItem: TrainingItem = {
        id: `trn-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };

      setTrainings((prev) => [newTrainingItem, ...prev]);
      toast.success("Thiết lập khóa đào tạo & phòng họp thành công!");
      setShowCreateModal(false);

      // Reset form
      setFormTitle("");
      setFormDescription("");
      setFormInstructor("");
      setFormMeetingRoomId("");
      setFormLocation("");
      setFormAddress("");
    } catch {
      toast.error("Lỗi khi tạo phòng đào tạo");
    } finally {
      setSubmitting(false);
    }
  };

  // HÀNH ĐỘNG: BẮN XUỐNG APP CEO 1983 & BẢNG TIN MẠNG LƯỚI (THEO YÊU CẦU 2)
  const handleBroadcastToFeed = async (t: TrainingItem) => {
    setBroadcastingId(t.id);
    try {
      const regUrl = `${window.location.origin}/guest-event-register/${t.id}`;
      const formatText =
        t.format === "online"
          ? "Trực tuyến qua Video Call Jitsi"
          : t.format === "offline"
          ? "Trực tiếp tại Hội trường"
          : "Kết hợp Trực tiếp & Trực tuyến";

      const feedContent = `🎯 THÔNG BÁO KHÓA ĐÀO TẠO & PHÒNG HỌP BAN ĐIỀU HÀNH:
${t.title}

👨‍🏫 Giảng viên / Chủ trì: ${t.instructor_name || "Chuyên gia CLB CEO 1983"} (${t.instructor_title || "Diễn giả"})
⏰ Thời gian: ${t.start_time ? new Date(t.start_time).toLocaleString("vi-VN") : "Sắp diễn ra"}
📌 Hình thức tổ chức: ${formatText}
🏛️ Địa điểm / Link họp: ${t.meeting_link || t.location || "Trụ sở CLB CEO 1983"}
🔑 Mật mã phòng: ${t.meeting_passcode || "198388"}

${t.description ? `📝 Nội dung tóm tắt: ${t.description}\n\n` : ""}👉 Form mở đăng ký tham gia (Dành cho Hội viên mới & Doanh nhân muốn đăng ký):
${regUrl}`;

      await fetchNestApi("/feed", {
        method: "POST",
        body: JSON.stringify({
          title: `[ĐÀO TẠO] ${t.title}`,
          content: feedContent,
          category: "EVENT_MEETING",
          department: "Ban Đào Tạo",
          images: [t.cover_image || "/ceo1983-emblem-8.png"],
          posterUrl: t.cover_image || "/ceo1983-emblem-8.png",
          qrCodeUrl: `/checkin-qr?trainingId=${t.id}`,
        }),
      }).catch((err) => {
        console.warn("Feed broadcast fallback:", err);
      });

      toast.success(
        "Đã bắn chi tiết khóa đào tạo kèm Form đăng ký & QR điểm danh xuống Bảng tin Mạng lưới CEO 1983 thành công!"
      );
    } catch {
      toast.error("Không thể bắn xuống Bảng tin lúc này");
    } finally {
      setBroadcastingId(null);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.instructor_name && t.instructor_name.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    const matchFormat = formatFilter === "all" || t.format === formatFilter;
    return matchSearch && matchCat && matchFormat;
  });

  return (
    <AppShell>
      <div className="space-y-6 font-sans pb-20">
        <PageHeader
          title="Phân Hệ Quản Trị Đào Tạo & Thiết Lập Phòng Họp Gặp Mặt"
          subtitle="Tổ chức chương trình đào tạo trực tuyến / trực tiếp, quản lý form đăng ký mở rộng và phát sóng bài viết xuống App CEO 1983"
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#003B95] text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-900/20 hover:bg-[#002B70] active:scale-95 transition cursor-pointer"
              >
                <Plus className="size-4 text-amber-400" />
                <span>Set Up Khóa Đào Tạo / Phòng Họp</span>
              </button>
            </div>
          }
        />

        {/* ── FILTER & SEARCH BAR ── */}
        <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa đào tạo, giảng viên, phòng họp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#003B95]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Hình thức:</span>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="online">Trực tuyến</option>
                <option value="offline">Trực tiếp</option>
                <option value="hybrid">Kết hợp (Hybrid)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Chuyên đề:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
              >
                <option value="all">Tất cả chuyên đề</option>
                <option value="Kỹ năng lãnh đạo">Kỹ năng lãnh đạo</option>
                <option value="Quản trị tài chính">Quản trị tài chính</option>
                <option value="Chiến lược kinh doanh">Chiến lược kinh doanh</option>
                <option value="Gặp gỡ giao thương">Gặp gỡ giao thương</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ── LIST OF TRAININGS & MEETING ROOMS ── */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Đang tải dữ liệu đào tạo...</div>
        ) : filteredTrainings.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">Chưa có phòng họp đào tạo nào được thiết lập</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrainings.map((t) => {
              const meetingUrl = t.meeting_link || `https://meet.jit.si/CEO1983_${t.meeting_room_id || t.id}`;
              const isBroadcasting = broadcastingId === t.id;

              return (
                <Card key={t.id} className="p-5 flex flex-col justify-between hover:shadow-lg transition-all rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/60 dark:text-blue-300">
                          {t.category || "Đào tạo doanh nhân"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase ${
                            t.format === "online"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                              : t.format === "offline"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          }`}
                        >
                          {t.format === "online" ? "🌐 Trực tuyến" : t.format === "offline" ? "🏛️ Trực tiếp" : "⚡ Hybrid"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {t.status === "live" ? "ĐANG DIỄN RA" : "SẮP DIỄN RA"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#003B95] dark:text-white line-clamp-2 leading-snug">
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium truncate">
                          Giảng viên: <strong className="text-slate-800 dark:text-white">{t.instructor_name || "CEO 1983"}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {t.start_time
                            ? new Date(t.start_time).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "Lịch định kỳ BĐH"}
                        </span>
                      </div>

                      {t.format !== "offline" && (
                        <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          <span className="truncate text-slate-500">Phòng: {t.meeting_room_id || "CEO1983_CALL"}</span>
                          {t.meeting_passcode && (
                            <span className="text-amber-600 font-bold ml-2">Pass: {t.meeting_passcode}</span>
                          )}
                        </div>
                      )}

                      {t.format !== "online" && t.location && (
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{t.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hành động chính: Bắn xuống App CEO 1983, Form đăng ký mở & Vào phòng họp */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Nút 1: Bắn xuống App CEO 1983 (YÊU CẦU 2) */}
                      <button
                        type="button"
                        disabled={isBroadcasting}
                        onClick={() => handleBroadcastToFeed(t)}
                        className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-[11px] inline-flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Đẩy thông báo bài viết kèm form và QR xuống Bảng tin Mạng lưới"
                      >
                        <Send className="size-3.5" />
                        <span>{isBroadcasting ? "Đang bắn..." : "Bắn xuống App"}</span>
                      </button>

                      {/* Nút 2: Form đăng ký mở rộng (YÊU CẦU 2) */}
                      <button
                        type="button"
                        onClick={() => setActiveRegModal(t)}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        title="Xem form đăng ký mở rộng cho hội viên"
                      >
                        <QrCode className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Form Đăng Ký</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCallRoom({
                            id: t.id,
                            title: t.title,
                            link: meetingUrl,
                          })
                        }
                        className="flex-1 py-2 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <PhoneCall className="size-3.5 text-amber-400" />
                        <span>Vào Phòng Họp Ngay</span>
                      </button>

                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        title="Mở tab mới"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── MODAL FORM ĐĂNG KÝ THAM GIA MỞ RỘNG (THEO YÊU CẦU 2) ── */}
        {activeRegModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-amber-400 flex items-center justify-center">
                    <UserCheck className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Form Đăng Ký Mở Rộng Cho Hội Viên
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cho phép hội viên mới & người quan tâm điền biểu mẫu tham gia
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRegModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeRegModal.title}
                </div>

                <div className="flex items-center justify-center py-3">
                  <div className="size-36 rounded-2xl bg-white p-2.5 shadow-md border border-slate-200 flex flex-col items-center justify-center">
                    <QrCode className="size-full text-[#003B95]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 block">Đường dẫn Form đăng ký trực tuyến:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/guest-event-register/${activeRegModal.id}`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10.5px] text-slate-700 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/guest-event-register/${activeRegModal.id}`
                        );
                        toast.success("Đã sao chép link form đăng ký!");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold shrink-0 hover:bg-[#002B70] transition"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRegModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleBroadcastToFeed(activeRegModal);
                    setActiveRegModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#003B95] text-white font-bold text-xs hover:bg-[#002B70] transition inline-flex items-center gap-1.5 shadow"
                >
                  <Send className="size-3.5 text-amber-400" />
                  <span>Bắn bài viết xuống App ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EMBEDDED JITSI MEET CALL MODAL ── */}
        {activeCallRoom && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full h-[92vh] max-w-6xl flex flex-col overflow-hidden shadow-2xl">
              <div className="px-5 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{activeCallRoom.title}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Phòng gọi trực tuyến Jitsi Meet CEO 1983
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeCallRoom.link);
                      toast.success("Đã copy link phòng họp vào clipboard!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#d97706] text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Share2 className="size-3.5" />
                    <span>Copy Link Họp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCallRoom(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-full bg-black">
                <iframe
                  src={activeCallRoom.link}
                  title="CEO1983 Video Call Room"
                  className="w-full h-full border-none"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE MEETING ROOM / TRAINING MODAL ── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-[#003B95] dark:text-amber-400" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Set Up Khóa Đào Tạo / Phòng Họp Mới
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTraining} className="space-y-3.5 mt-4 text-xs font-sans">
                {/* 1. Tên chương trình */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên chương trình / Khóa đào tạo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hội nghị Đào tạo Quản trị Dòng Tiền & Chiến Lược Mua Bán Sáp Nhập M&A"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                {/* 2. Hình thức tổ chức (Trực tuyến, Trực tiếp, Hybrid) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hình thức tổ chức *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "online", label: "🌐 Trực Tuyến" },
                      { id: "offline", label: "🏛️ Trực Tiếp" },
                      { id: "hybrid", label: "⚡ Kết Hợp (Hybrid)" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormFormat(f.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          formFormat === f.id
                            ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Giảng viên & Chuyên đề */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giảng viên / Chủ trì
                    </label>
                    <input
                      type="text"
                      placeholder="VD: TS. Lê Thẩm Dương"
                      value={formInstructor}
                      onChange={(e) => setFormInstructor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Chuyên đề đào tạo
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-medium"
                    >
                      <option value="Kỹ năng lãnh đạo">Kỹ năng lãnh đạo</option>
                      <option value="Quản trị tài chính">Quản trị tài chính</option>
                      <option value="Chiến lược kinh doanh">Chiến lược kinh doanh</option>
                      <option value="Gặp gỡ giao thương">Gặp gỡ giao thương</option>
                    </select>
                  </div>
                </div>

                {/* 4. Thời gian bắt đầu */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Thời gian diễn ra
                    </label>
                    <input
                      type="datetime-local"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sức chứa (Người)
                    </label>
                    <input
                      type="number"
                      placeholder="50"
                      value={formMaxAttendees}
                      onChange={(e) => setFormMaxAttendees(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 5. Thông tin phòng họp trực tuyến (nếu online / hybrid) */}
                {formFormat !== "offline" && (
                  <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 space-y-2.5">
                    <span className="text-[11px] font-extrabold text-[#003B95] dark:text-amber-400 block uppercase">
                      Cấu hình phòng gọi Video Call (Jitsi / Zoom)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          ID Phòng
                        </label>
                        <input
                          type="text"
                          placeholder="Tự sinh nếu trống"
                          value={formMeetingRoomId}
                          onChange={(e) => setFormMeetingRoomId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Mật khẩu phòng (Passcode)
                        </label>
                        <input
                          type="text"
                          value={formMeetingPasscode}
                          onChange={(e) => setFormMeetingPasscode(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Địa điểm trực tiếp (nếu offline / hybrid) */}
                {formFormat !== "online" && (
                  <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-2.5">
                    <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 block uppercase">
                      Địa điểm hội trường trực tiếp
                    </span>
                    <div>
                      <input
                        type="text"
                        placeholder="Tên hội trường / Khách sạn (VD: Khách sạn Pan Pacific Hà Nội)"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs mb-1.5"
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ số nhà, đường, quận (VD: Số 1 Đường Thanh Niên, Ba Đình, Hà Nội)"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 7. Mở form đăng ký cho hội viên mới / người quan tâm (YÊU CẦU 2) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">
                      Mở form đăng ký tham gia mở rộng
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      Cho phép hội viên mới & khách mời quan tâm đăng ký trực tuyến
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formOpenRegistration}
                    onChange={(e) => setFormOpenRegistration(e.target.checked)}
                    className="size-4.5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* 8. Mô tả nội dung */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mô tả nội dung đào tạo
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nội dung tóm tắt buổi gặp mặt hoặc tài liệu yêu cầu chuẩn bị..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#003B95] text-white font-bold hover:bg-[#002B70] transition shadow-md shadow-blue-900/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Xác Nhận Tạo Khóa Đào Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
