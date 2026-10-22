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
  format?: string;
  status: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
  meeting_room_id?: string;
  max_attendees?: number;
  materials_url?: string;
  created_at: string;
}

function TrainingsPage() {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeCallRoom, setActiveCallRoom] = useState<{ id: string; title: string; link: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formInstructorTitle, setFormInstructorTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Kỹ năng lãnh đạo");
  const [formStartTime, setFormStartTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formMeetingRoomId, setFormMeetingRoomId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<TrainingItem[]>("/trainings");
      if (Array.isArray(res)) {
        setTrainings(res);
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
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        instructor_name: formInstructor.trim() || "Chuyên gia Hội đồng CEO 1983",
        instructor_title: formInstructorTitle.trim() || "Diễn giả Doanh nhân",
        category: formCategory,
        format: "hybrid",
        status: "upcoming",
        start_time: formStartTime || new Date(Date.now() + 86400000).toISOString(),
        location: formLocation.trim() || "Trụ sở CLB CEO 1983 & Trực tuyến qua Jitsi Meet",
        meeting_room_id: roomId,
        meeting_link: `https://meet.jit.si/CEO1983_${roomId}`,
      };

      await fetchNestApi("/trainings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Thiết lập phòng họp đào tạo thành công!");
      setShowCreateModal(false);
      // Reset form
      setFormTitle("");
      setFormDescription("");
      setFormInstructor("");
      setFormMeetingRoomId("");
      fetchTrainings();
    } catch {
      toast.error("Lỗi khi tạo phòng đào tạo");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.instructor_name && t.instructor_name.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Phân Hệ Quản Trị Đào Tạo & Thiết Lập Phòng Họp Gặp Mặt"
          subtitle="Tổ chức các khóa bồi dưỡng quản trị doanh nghiệp, set up phòng họp video call trao đổi trực tuyến nội bộ CLB"
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-[#1F3864] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm hover:bg-[#152747] transition cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Set Up Phòng Họp / Khóa Đào Tạo</span>
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
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1F3864]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Chuyên đề:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden"
            >
              <option value="all">Tất cả chuyên đề</option>
              <option value="Kỹ năng lãnh đạo">Kỹ năng lãnh đạo</option>
              <option value="Quản trị tài chính">Quản trị tài chính</option>
              <option value="Chiến lược kinh doanh">Chiến lược kinh doanh</option>
              <option value="Gặp gỡ giao thương">Gặp gỡ giao thương</option>
            </select>
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
              return (
                <Card key={t.id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3864]/10 text-[#1F3864] dark:bg-blue-950/60 dark:text-blue-300">
                        {t.category || "Đào tạo doanh nhân"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {t.status === "live" ? "ĐANG DIỄN RA" : "SẮP DIỄN RA"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#1F3864] dark:text-white line-clamp-2">
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-amber-500" />
                        <span className="font-medium">
                          Giảng viên: <strong className="text-slate-800 dark:text-white">{t.instructor_name || "CEO 1983"}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-emerald-600" />
                        <span>
                          {t.start_time
                            ? new Date(t.start_time).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "Lịch định kỳ"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="size-3.5 text-blue-600" />
                        <span className="font-mono text-[11px] truncate">Phòng: {t.meeting_room_id || "CEO1983_CALL"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCallRoom({
                          id: t.id,
                          title: t.title,
                          link: meetingUrl,
                        })
                      }
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <PhoneCall className="size-3.5" />
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
                </Card>
              );
            })}
          </div>
        )}

        {/* ── EMBEDDED JITSI MEET CALL MODAL ── */}
        {activeCallRoom && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="p-4 bg-[#1F3864] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="size-5 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-sm truncate max-w-md">{activeCallRoom.title}</h4>
                    <span className="text-[10px] text-slate-300 font-mono">
                      Phòng họp trực tuyến bảo mật Jitsi Meet CLB CEO 1983
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
                    className="px-3 py-1.5 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-[#1F3864] dark:text-amber-400" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Set Up Phòng Họp / Khóa Đào Tạo Mới
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

              <form onSubmit={handleCreateTraining} className="space-y-4 mt-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên chương trình / Phòng họp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hội nghị Đào tạo Quản trị Tài chính Doanh nghiệp"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1F3864]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giảng viên / Chủ trì
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Chủ tịch / Chuyên gia BĐH"
                      value={formInstructor}
                      onChange={(e) => setFormInstructor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Chuyên đề
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

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã phòng Call (ID Jitsi)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: BAN_DIEU_HANH_HOP_THANG (để trống sẽ tạo tự động)"
                    value={formMeetingRoomId}
                    onChange={(e) => setFormMeetingRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mô tả nội dung đào tạo
                  </label>
                  <textarea
                    rows={3}
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
                    className="px-4 py-2 rounded-xl bg-[#1F3864] text-white font-bold hover:bg-[#152747] transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Xác Nhận Tạo Phòng"}
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
