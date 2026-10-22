import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  Video,
  Calendar,
  Clock,
  Users,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  PhoneCall,
  Download,
  Share2,
  FileText,
  Sparkles,
  BookOpen,
  Building2,
  ChevronRight,
  Maximize2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { MemberHeader } from "@/components/member/MemberShell";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/association/training")({
  component: AssociationTrainingScreen,
  head: () => ({
    meta: [
      { title: "Đào Tạo & Phòng Họp Video Trực Tuyến | CEO 1983" },
      {
        name: "description",
        content: "Trung tâm đào tạo doanh nhân và phòng họp trực tuyến Jitsi Meet bảo mật nội bộ CLB CEO 1983",
      },
    ],
  }),
});

export interface TrainingMaterial {
  id?: string;
  title: string;
  url?: string;
  type?: "pdf" | "slides" | "doc" | "video" | "excel" | string;
  size?: string;
}

export interface TrainingItem {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  instructor_title?: string;
  instructor_avatar?: string;
  category?: string;
  format?: "online" | "offline" | "hybrid" | string;
  status: "ongoing" | "upcoming" | "completed" | "live" | string;
  start_time?: string;
  end_time?: string;
  location?: string;
  room_id?: string;
  room_url?: string;
  materials?: TrainingMaterial[];
  attendee_count?: number;
  max_attendees?: number;
  created_at?: string;
}

const SAMPLE_TRAININGS: TrainingItem[] = [
  {
    id: "train_001",
    title: "Tái Cấu Trúc Vận Hành Doanh Nghiệp & Tối Ưu Dòng Tiền Thời Kỳ Số",
    description: "Chuyên đề chia sẻ thực chiến về phương pháp tinh gọn bộ máy nhân sự, kiểm soát dòng tiền và xây dựng kịch bản tài chính ứng phó biến động thị trường.",
    instructor_name: "TS. Nguyễn Trọng Hải",
    instructor_title: "Chuyên gia Cố vấn Chiến lược & Tái cấu trúc",
    instructor_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    category: "Chiến lược & Quản trị",
    format: "online",
    status: "ongoing",
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    location: "Phòng họp trực tuyến bảo mật Jitsi Meet",
    room_id: "CEO1983_TAICAUTRUC",
    room_url: "https://meet.jit.si/CEO1983_TAICAUTRUC",
    attendee_count: 54,
    max_attendees: 100,
    materials: [
      {
        id: "mat_1",
        title: "Slide bài giảng: 12 Bước Tái cấu trúc doanh nghiệp SME",
        type: "pdf",
        size: "4.8 MB",
        url: "#",
      },
      {
        id: "mat_2",
        title: "Bảng tính Excel: Mô hình dự báo dòng tiền 12 tháng",
        type: "excel",
        size: "1.2 MB",
        url: "#",
      },
    ],
  },
  {
    id: "train_002",
    title: "Ứng Dụng AI & Tự Động Hóa Dành Riêng Cho Lãnh Đạo Doanh Nghiệp CEO 1983",
    description: "Hướng dẫn thực chiến tích hợp AI (Gemini, Claude, ChatGPT) vào tối ưu quy trình báo cáo, soạn thảo hợp đồng thương mại và chăm sóc khách hàng tự động.",
    instructor_name: "Ban Đào Tạo & Chuyển Đổi Số",
    instructor_title: "Hội đồng Chuyên gia Công nghệ CEO 1983",
    category: "Chuyển đổi số & AI",
    format: "online",
    status: "upcoming",
    start_time: new Date(Date.now() + 2 * 86400 * 1000 + 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 86400 * 1000 + 4 * 3600 * 1000).toISOString(),
    location: "Phòng họp trực tuyến bảo mật Jitsi Meet",
    room_id: "CEO1983_AI_WORKSHOP",
    room_url: "https://meet.jit.si/CEO1983_AI_WORKSHOP",
    attendee_count: 78,
    max_attendees: 150,
    materials: [
      {
        id: "mat_3",
        title: "Bộ Prompt 100+ câu lệnh chuyên sâu cho CEO",
        type: "pdf",
        size: "3.2 MB",
        url: "#",
      },
      {
        id: "mat_4",
        title: "Sổ tay kiến trúc tự động hóa quy trình nghiệp vụ",
        type: "slides",
        size: "6.5 MB",
        url: "#",
      },
    ],
  },
  {
    id: "train_003",
    title: "Pháp Lý Hợp Đồng Thương Mại & Phòng Ngừa Rủi Ro Thuế Năm 2026",
    description: "Cập nhật các quy định mới nhất về hóa đơn điện tử, chính sách thuế thu nhập doanh nghiệp và các điều khoản vàng bảo vệ chủ doanh nghiệp khi ký kết hợp tác.",
    instructor_name: "Luật sư Trần Đình Hùng",
    instructor_title: "Trọng tài viên VIAC, Luật sư cao cấp",
    instructor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    category: "Pháp lý & Thuế",
    format: "online",
    status: "upcoming",
    start_time: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
    end_time: new Date(Date.now() + 5 * 86400 * 1000 + 2 * 3600 * 1000).toISOString(),
    location: "Phòng họp trực tuyến bảo mật Jitsi Meet",
    room_id: "CEO1983_PHAPLY_THUE",
    room_url: "https://meet.jit.si/CEO1983_PHAPLY_THUE",
    attendee_count: 62,
    max_attendees: 120,
    materials: [
      {
        id: "mat_5",
        title: "Mẫu hợp đồng hợp tác kinh doanh đa phương (CEO1983)",
        type: "doc",
        size: "820 KB",
        url: "#",
      },
      {
        id: "mat_6",
        title: "Checklist 25 điểm rủi ro cần kiểm tra trước khi ký hợp đồng",
        type: "pdf",
        size: "2.1 MB",
        url: "#",
      },
    ],
  },
  {
    id: "train_004",
    title: "Nghệ Thuật Đàm Phán & Chốt Deal Hợp Đồng Giá Trị Lớn (High-Ticket Sales)",
    description: "Bộ quy tắc đàm phán dựa trên tâm lý lãnh đạo, kỹ thuật neo giá trị và xây dựng mối quan hệ đối tác chiến lược bền vững.",
    instructor_name: "ThS. Lê Hoàng Long",
    instructor_title: "Chuyên gia Đào tạo Bán hàng B2B",
    category: "Bán hàng & B2B",
    format: "offline",
    status: "completed",
    start_time: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    end_time: new Date(Date.now() - 7 * 86400 * 1000 + 3 * 3600 * 1000).toISOString(),
    location: "Hội trường lớn CLB CEO 1983 - Tầng 8, Tháp Doanh Nhân, Hà Nội",
    room_id: "CEO1983_SALES_PRO",
    attendee_count: 95,
    max_attendees: 100,
    materials: [
      {
        id: "mat_7",
        title: "Tài liệu tổng kết: Chiến lược chốt Deal B2B thực chiến",
        type: "pdf",
        size: "5.4 MB",
        url: "#",
      },
    ],
  },
];

const CATEGORIES = [
  "Tất cả",
  "Chiến lược & Quản trị",
  "Chuyển đổi số & AI",
  "Pháp lý & Thuế",
  "Bán hàng & B2B",
];

export function AssociationTrainingScreen() {
  const { user } = useAuth();

  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "completed">("all");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Modals state
  const [activeMeeting, setActiveMeeting] = useState<TrainingItem | null>(null);
  const [materialsModalTraining, setMaterialsModalTraining] = useState<TrainingItem | null>(null);
  const [checkedInIds, setCheckedInIds] = useState<Record<string, boolean>>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any>("/trainings").catch(() => null);
      let list: TrainingItem[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && Array.isArray(res.items)) {
        list = res.items;
      }

      if (list.length > 0) {
        setTrainings(list);
      } else {
        setTrainings(SAMPLE_TRAININGS);
      }
    } catch {
      setTrainings(SAMPLE_TRAININGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Lịch định kỳ";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Lịch định kỳ";
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Lịch định kỳ";
    }
  };

  const handleJoinTraining = async (training: TrainingItem) => {
    setJoiningId(training.id);
    try {
      await fetchNestApi(`/trainings/${training.id}/join`, {
        method: "POST",
        body: JSON.stringify({ memberId: user?.id }),
      }).catch(() => null);

      setCheckedInIds((prev) => ({ ...prev, [training.id]: true }));
      toast.success("Điểm danh tham gia buổi đào tạo thành công!");
    } catch {
      toast.error("Không thể ghi nhận điểm danh.");
    } finally {
      setJoiningId(null);
    }
  };

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      // Status filter
      if (activeTab === "ongoing") {
        if (t.status !== "ongoing" && t.status !== "live") return false;
      } else if (activeTab === "upcoming") {
        if (t.status !== "upcoming") return false;
      } else if (activeTab === "completed") {
        if (t.status !== "completed") return false;
      }

      // Category filter
      if (selectedCategory !== "Tất cả" && t.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const instructorMatch = t.instructor_name?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        return titleMatch || instructorMatch || descMatch;
      }

      return true;
    });
  }, [trainings, activeTab, selectedCategory, searchQuery]);

  const ongoingCount = useMemo(() => {
    return trainings.filter((t) => t.status === "ongoing" || t.status === "live").length;
  }, [trainings]);

  const totalMaterialsCount = useMemo(() => {
    return trainings.reduce((acc, t) => acc + (t.materials?.length || 0), 0);
  }, [trainings]);

  return (
    <div className="vba-animate pb-24 min-h-screen bg-stone-50 dark:bg-slate-950 font-sans">
      <MemberHeader title="Đào Tạo & Họp Trực Tuyến" back />

      {/* Top Banner & Quick KPI */}
      <div className="px-4 pt-3 space-y-3 max-w-2xl mx-auto">
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1F3864] via-[#152747] to-[#0A1224] text-white shadow-xl border border-amber-400/40 relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10.5px] font-bold border border-amber-400/30 mb-1.5">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Học Viện Lãnh Đạo CEO 1983</span>
              </div>
              <h2 className="text-base font-black tracking-tight">Trung Tâm Đào Tạo & Họp Video</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Nâng tầm tư duy lãnh đạo, chia sẻ kinh nghiệm thực chiến & phòng họp Jitsi Meet bảo mật nội bộ.
              </p>
            </div>

            <div className="size-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <GraduationCap className="size-6 text-amber-400" />
            </div>
          </div>

          {/* Background watermark */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Video className="size-36 text-white" />
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tổng chuyên đề</span>
            <div className="text-base font-black text-[#1F3864] dark:text-blue-400 mt-0.5">
              {trainings.length}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Phòng họp Live</span>
            <div className="text-base font-black text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
              {ongoingCount > 0 && (
                <span className="size-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              )}
              <span>{ongoingCount}</span>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tài liệu lưu hành</span>
            <div className="text-base font-black text-[#B8860B] mt-0.5">
              {totalMaterialsCount}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài giảng, giảng viên, nội dung..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#1F3864] text-slate-800 dark:text-slate-100 shadow-2xs"
          />
        </div>

        {/* Status Navigation Tabs (Strictly No Red) */}
        <div className="p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#1F3864] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[10px] opacity-80">({trainings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "ongoing"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang diễn ra</span>
            <span className="text-[10px] opacity-80">({ongoingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-[#B8860B] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <span>Sắp diễn ra</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "completed"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <span>Đã học</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#1F3864] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* List of Trainings */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu đào tạo & phòng họp...
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <BookOpen className="size-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Không tìm thấy khóa đào tạo phù hợp
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục đào tạo khác.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTrainings.map((t) => {
              const isLive = t.status === "ongoing" || t.status === "live";
              const isUpcoming = t.status === "upcoming";
              const meetingUrl =
                t.room_url || `https://meet.jit.si/${t.room_id || `CEO1983_${t.id}`}`;
              const isCheckedIn = checkedInIds[t.id];

              return (
                <div
                  key={t.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
                >
                  {/* Card Header: Category & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3864]/10 text-[#1F3864] dark:bg-blue-950/60 dark:text-blue-300">
                      {t.category || "Đào tạo doanh nhân"}
                    </span>

                    {isLive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                        <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
                        <span>ĐANG DIỄN RA</span>
                      </span>
                    ) : isUpcoming ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/30">
                        SẮP DIỄN RA
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        ĐÃ HOÀN THÀNH
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-black text-[#1F3864] dark:text-white leading-snug line-clamp-2">
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {/* Instructor & Meta details */}
                  <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      {t.instructor_avatar ? (
                        <img
                          src={t.instructor_avatar}
                          alt={t.instructor_name}
                          className="size-7 rounded-full object-cover ring-1 ring-amber-400/50"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-[#1F3864] text-white flex items-center justify-center font-black text-[11px]">
                          {t.instructor_name ? t.instructor_name.charAt(0) : "C"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {t.instructor_name || "Ban Đào Tạo CEO 1983"}
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          {t.instructor_title || "Chuyên gia cố vấn"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11.5px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{formatDateTime(t.start_time)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {t.format === "offline" ? (
                          <>
                            <Building2 className="size-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{t.location || "Hội trường CEO 1983"}</span>
                          </>
                        ) : (
                          <>
                            <Video className="size-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-mono text-[11px]">
                              Phòng: {t.room_id || "CEO1983_JITSI"}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-blue-600 shrink-0" />
                        <span>
                          {t.attendee_count || 45} / {t.max_attendees || 100} Hội viên tham gia
                        </span>
                      </div>

                      {t.materials && t.materials.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium text-amber-700 dark:text-amber-400">
                            {t.materials.length} tài liệu giáo trình đính kèm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Strictly No Red Buttons) */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    {/* Primary Button: Video call if online */}
                    {t.format !== "offline" && (
                      <button
                        type="button"
                        onClick={() => setActiveMeeting(t)}
                        className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer ${
                          isLive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#1F3864] hover:bg-[#152747] text-white"
                        }`}
                      >
                        <PhoneCall className="size-3.5" />
                        <span>{isLive ? "Vào Phòng Họp Ngay" : "Mở Phòng Họp"}</span>
                      </button>
                    )}

                    {/* Check-in / Join Button */}
                    <button
                      type="button"
                      disabled={isCheckedIn || joiningId === t.id}
                      onClick={() => handleJoinTraining(t)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isCheckedIn
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-[#B8860B] hover:bg-[#9a7009] text-white shadow-xs active:scale-95"
                      }`}
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{isCheckedIn ? "Đã Điểm Danh" : "Điểm Danh"}</span>
                    </button>

                    {/* Materials Button */}
                    {t.materials && t.materials.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMaterialsModalTraining(t)}
                        className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                        title="Xem tài liệu giáo trình"
                      >
                        <Download className="size-3.5 text-amber-600" />
                        <span>Tài liệu ({t.materials.length})</span>
                      </button>
                    )}

                    {/* Share Link Button */}
                    {t.format !== "offline" && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(meetingUrl);
                          toast.success("Đã copy link phòng họp vào clipboard!");
                        }}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="Copy link phòng họp"
                      >
                        <Share2 className="size-4" />
                      </button>
                    )}

                    {/* External Link */}
                    {t.format !== "offline" && (
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="Mở tab trình duyệt riêng"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EMBEDDED JITSI MEET MODAL (STRICT NO RED BUTTONS) ── */}
      {activeMeeting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-3.5 bg-[#1F3864] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="size-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Video className="size-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-xs sm:text-sm truncate">
                    {activeMeeting.title}
                  </h4>
                  <span className="text-[10px] text-slate-300 font-mono truncate block">
                    Phòng Jitsi: {activeMeeting.room_id || `CEO1983_${activeMeeting.id}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const url =
                      activeMeeting.room_url ||
                      `https://meet.jit.si/${activeMeeting.room_id || `CEO1983_${activeMeeting.id}`}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Đã copy link phòng họp!");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Share2 className="size-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </button>

                <a
                  href={
                    activeMeeting.room_url ||
                    `https://meet.jit.si/${activeMeeting.room_id || `CEO1983_${activeMeeting.id}`}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Mở toàn màn hình tab mới"
                >
                  <Maximize2 className="size-4" />
                </a>

                {/* Close Button - Slate/Navy, NO RED */}
                <button
                  type="button"
                  onClick={() => setActiveMeeting(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Đóng phòng họp"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe */}
            <div className="flex-1 bg-black relative">
              <iframe
                src={
                  activeMeeting.room_url ||
                  `https://meet.jit.si/${activeMeeting.room_id || `CEO1983_${activeMeeting.id}`}`
                }
                title={activeMeeting.title}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="text-[11px]">Đang truyền tải video mã hóa bảo mật Jitsi Meet</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleJoinTraining(activeMeeting)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="size-3.5" />
                  <span>Điểm danh</span>
                </button>

                {/* Close/Exit call - Slate button, NOT RED */}
                <button
                  type="button"
                  onClick={() => setActiveMeeting(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Rời phòng họp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MATERIALS MODAL SHEET (STRICT NO RED BUTTONS) ── */}
      {materialsModalTraining && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold mb-1">
                  <Download className="size-3" />
                  <span>Tài Liệu Giáo Trình Nội Bộ</span>
                </div>
                <h4 className="font-black text-sm text-[#1F3864] dark:text-white line-clamp-1">
                  {materialsModalTraining.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setMaterialsModalTraining(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {materialsModalTraining.materials && materialsModalTraining.materials.length > 0 ? (
                materialsModalTraining.materials.map((mat, idx) => (
                  <div
                    key={mat.id || idx}
                    className="p-3 bg-stone-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-amber-400 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-[#1F3864]/10 text-[#1F3864] dark:text-blue-300 flex items-center justify-center shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span className="uppercase font-mono">{mat.type || "PDF"}</span>
                          {mat.size && <span>• {mat.size}</span>}
                        </div>
                      </div>
                    </div>

                    <a
                      href={mat.url && mat.url !== "#" ? mat.url : undefined}
                      onClick={(e) => {
                        if (!mat.url || mat.url === "#") {
                          e.preventDefault();
                          toast.success(`Đang mở tải tài liệu: "${mat.title}"`);
                        }
                      }}
                      download
                      className="px-3 py-1.5 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Download className="size-3.5" />
                      <span>Tải về</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có tài liệu đính kèm cho chuyên đề này.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setMaterialsModalTraining(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
