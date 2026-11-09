import React, { useState } from "react";
import {
  Users2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Save,
  Send,
  Plus,
  Trash2,
  Video,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export interface ForumAgendaStep {
  time: string;
  title: string;
  speaker?: string;
}

export interface ForumMeetingTemplate {
  id: string;
  name: string;
  type: "forum" | "cafe" | "executive" | "tour";
  title: string;
  subtitle: string;
  description: string;
  format: "offline" | "online" | "hybrid";
  locationDefault: string;
  onlineLink?: string;
  agenda: ForumAgendaStep[];
}

export function ForumMeetingTemplateManager() {
  const DEFAULT_TEMPLATES: ForumMeetingTemplate[] = [
    {
      id: "forum-digital",
      name: "Diễn Đàn Chuyển Đổi Số & Giao Thương B2B",
      type: "forum",
      title: "DIỄN ĐÀN GIAO THƯƠNG & CHUYỂN ĐỔI SỐ DOANH NGHIỆP CEO 1983",
      subtitle: "Bứt Phá Năng Suất & Liên Minh Chuỗi Cung Ứng",
      description: "Diễn đàn chuyên đề định kỳ với sự tham gia của 100+ CEO, chia sẻ kinh nghiệm ứng dụng AI, tối ưu chi phí và ký kết các hợp đồng thương mại trực tiếp tại chỗ.",
      format: "hybrid",
      locationDefault: "Trung tâm Hội nghị HanoiBA, Cầu Giấy, Hà Nội",
      onlineLink: "https://ceo1983.viconnect.vn/association/training",
      agenda: [
        { time: "13:30 - 14:00", title: "Đón tiếp đại biểu & Check-in QR Thẻ Số" },
        { time: "14:00 - 14:15", title: "Phát biểu khai mạc của Chủ tịch CLB", speaker: "Chủ tịch CLB CEO 1983" },
        { time: "14:15 - 15:30", title: "Tọa đàm chuyên đề: AI & Tự động hóa CRM", speaker: "Chuyên gia & Ban Xúc Tiến" },
        { time: "15:30 - 16:30", title: "Phiên Matching Giao Thương B2B 1-on-1" },
        { time: "16:30 - 17:00", title: "Ký kết thỏa thuận hợp tác & Chụp ảnh lưu niệm" },
      ],
    },
    {
      id: "cafe-connect-fri",
      name: "Cafe Doanh Nhân Thứ Sáu (Business Networking)",
      type: "cafe",
      title: "CAFE DOANH NHÂN CEO 1983 - KẾT NỐI B2B THỨ SÁU",
      subtitle: "Gặp Gỡ Thân Mật - Chia Sẻ Cơ Hội Thực Chất",
      description: "Không gian giao lưu cởi mở vào sáng thứ sáu hàng tuần, nơi các doanh nhân CEO 1983 trao đổi deal, giới thiệu nguồn hàng và hợp tác.",
      format: "offline",
      locationDefault: "Highlands Coffee / Business Lounge HanoiBA",
      agenda: [
        { time: "08:00 - 08:30", title: "Thưởng thức cafe & Giao lưu tự do" },
        { time: "08:30 - 09:30", title: "Mỗi CEO có 60 giây giới thiệu DN và nhu cầu cần kết nối" },
        { time: "09:30 - 10:30", title: "Ghép đôi trao đổi hợp tác sâu (Deep Connect)" },
      ],
    },
    {
      id: "exec-meeting",
      name: "Họp Định Kỳ Ban Điều Hành & Trưởng Ban",
      type: "executive",
      title: "HỘI NGHỊ BAN ĐIỀU HÀNH & TRƯỞNG BAN CHUYÊN MÔN",
      subtitle: "Đánh Giá Phong Trào & Triển Khai Nhiệm Vụ",
      description: "Cuộc họp nội bộ lãnh đạo CLB để tổng kết các chỉ số kết nạp hội viên, doanh số B2B, quản lý thu chi và chuẩn bị sự kiện lớn tiếp theo.",
      format: "hybrid",
      locationDefault: "Phòng Họp VIP Ban Điều Hành HanoiBA",
      onlineLink: "https://ceo1983.viconnect.vn/association/training",
      agenda: [
        { time: "19:00 - 19:15", title: "Báo cáo công tác của Ban Thư Ký & Tài Chính" },
        { time: "19:15 - 20:00", title: "6 Ban chuyên môn báo cáo tiến độ nhiệm vụ" },
        { time: "20:00 - 20:30", title: "Chủ tịch kết luận và ban hành nghị quyết" },
      ],
    },
    {
      id: "business-tour",
      name: "Thăm Quan Doanh Nghiệp Hội Viên (Business Tour)",
      type: "tour",
      title: "BUSINESS TOUR - THĂM DOANH NGHIỆP HỘI VIÊN TIÊU BIỂU",
      subtitle: "Mục Sở Thị Quy Trình & Khảo Sát Cơ Hội Hợp Tác",
      description: "Đoàn kết nối trực tiếp đến trụ sở hoặc nhà máy của doanh nghiệp thành viên, học hỏi mô hình vận hành và hỗ trợ quảng bá sản phẩm.",
      format: "offline",
      locationDefault: "Trụ sở Doanh nghiệp tiếp đón (Cập nhật theo kỳ)",
      agenda: [
        { time: "08:30 - 09:00", title: "Tập trung tại điểm hẹn & Di chuyển" },
        { time: "09:00 - 10:00", title: "Tham quan dây chuyền / văn phòng DN" },
        { time: "10:00 - 11:30", title: "Tọa đàm chia sẻ bài học kinh doanh & Thảo luận B2B" },
      ],
    },
  ];

  const [templates, setTemplates] = useState<ForumMeetingTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>("forum-digital");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const current = templates.find((t) => t.id === selectedId) || templates[0];

  const handleUpdate = (field: keyof ForumMeetingTemplate, val: any) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === current.id ? { ...t, [field]: val } : t))
    );
  };

  const handleAddAgendaStep = () => {
    const newStep: ForumAgendaStep = {
      time: "00:00 - 00:00",
      title: "Nội dung phiên mới",
    };
    handleUpdate("agenda", [...current.agenda, newStep]);
  };

  const handleRemoveAgendaStep = (idx: number) => {
    handleUpdate(
      "agenda",
      current.agenda.filter((_, i) => i !== idx)
    );
  };

  const handleSaveTemplates = () => {
    toast.success("Đã lưu mẫu cuộc gặp diễn đàn thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
              <Users2 className="size-3.5 text-purple-500" />
              <span>Khung Mẫu Cuộc Gặp Diễn Đàn &amp; Matching B2B</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quản Lý Mẫu Cuộc Gặp Diễn Đàn &amp; Họp Ban
            </h3>
            <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Cung cấp các mẫu kịch bản tổ chức, lịch trình Agenda theo từng khung giờ và thư mời tham gia các cuộc gặp mặt doanh nhân: Diễn đàn B2B, Cafe kết nối, Họp Ban Điều Hành, Business Tour.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Gửi Thư Mời Cuộc Gặp Đa Kênh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột Trái: Chọn Mẫu & Soạn Agenda (7 Cột) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Chọn Mẫu Cuộc Gặp Diễn Đàn
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedId === tmpl.id
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-500/30"
                      : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      {tmpl.format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Thông Tin Chi Tiết */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Thông Tin Kịch Bản &amp; Địa Điểm
              </h4>
              <button
                type="button"
                onClick={handleSaveTemplates}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Save className="size-3.5" /> Lưu Thay Đổi
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Tiêu đề cuộc gặp / diễn đàn (In hoa)
              </label>
              <input
                type="text"
                value={current.title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Hình thức tổ chức
                </label>
                <select
                  value={current.format}
                  onChange={(e) => handleUpdate("format", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="offline">Trực tiếp (Offline)</option>
                  <option value="online">Trực tuyến Jitsi/Zoom (Online)</option>
                  <option value="hybrid">Kết hợp (Hybrid)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Địa điểm mặc định
                </label>
                <input
                  type="text"
                  value={current.locationDefault}
                  onChange={(e) => handleUpdate("locationDefault", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            {/* AGENDA BUILDER */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-purple-500" />
                  <span>Kịch Bản Lịch Trình Agenda Theo Giờ</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddAgendaStep}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Thêm Bước
                </button>
              </div>

              <div className="space-y-2">
                {current.agenda.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={step.time}
                      onChange={(e) => {
                        const newAgenda = [...current.agenda];
                        newAgenda[idx].time = e.target.value;
                        handleUpdate("agenda", newAgenda);
                      }}
                      className="w-32 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const newAgenda = [...current.agenda];
                        newAgenda[idx].title = e.target.value;
                        handleUpdate("agenda", newAgenda);
                      }}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaStep(idx)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Xem Trước Thẻ Cuộc Gặp Diễn Đàn (5 Cột) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users2 className="size-4 text-purple-500" />
              <span>Xem Trước Thẻ Cuộc Gặp Diễn Đàn</span>
            </h4>
            <span className="text-[11px] text-slate-400">Giao diện Hội viên</span>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-950 text-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  CLB DOANH NHÂN CEO 1983
                </span>
                <h3 className="text-sm font-black text-white uppercase mt-0.5 leading-snug">
                  {current.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{current.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{current.locationDefault}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="size-3.5 text-blue-400 shrink-0" />
                <span>Hình thức: {current.format === "hybrid" ? "Trực tiếp & Trực tuyến Jitsi" : current.format}</span>
              </div>
            </div>

            {/* Agenda Preview */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Lịch trình chương trình
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {current.agenda.map((a, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2.5 text-[11px]"
                  >
                    <span className="font-mono text-purple-300 shrink-0 font-bold">{a.time}</span>
                    <span className="text-slate-200">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBroadcastOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-purple-800 py-3 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Phát Thư Mời Tham Dự Cuộc Gặp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <OmnichannelBroadcastModal
        open={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        invitationData={{
          title: current.title,
          subtitle: current.subtitle,
          posterUrl: "/ceo1983_hero_cosmos_skyline.jpg",
          date: "Theo thông báo lịch trình",
          location: current.locationDefault,
          salutation: "Kính gửi: Quý Anh/Chị Hội viên CLB Doanh Nhân CEO 1983,",
          bodyText: current.description,
        }}
      />
    </div>
  );
}

