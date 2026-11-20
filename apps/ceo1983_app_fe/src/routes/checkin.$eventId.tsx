import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
  Briefcase,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Share2,
  RefreshCw,
  Search,
  Users,
  CheckCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin/$eventId")({
  ssr: false,
  loader: async ({ params }) => {
    let event = await fetchNestApi<any>(`/events/${params.eventId}`).catch(() => null);
    if (!event) {
      const allEvents = await fetchNestApi<any[]>("/events").catch(() => []);
      if (Array.isArray(allEvents) && allEvents.length > 0) {
        event =
          allEvents.find(
            (e: any) => e.id === params.eventId || e.slug === params.eventId
          ) || (params.eventId === "latest" ? allEvents[0] : null);
      }
    }
    if (!event) {
      // Fallback chuẩn theo yêu cầu sự kiện Viện Doanh Trí 21/11/2026
      event = {
        id: params.eventId,
        name: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
        title: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
        tagline: "Kỷ niệm 4 năm thành lập Viện Doanh Trí",
        date: "2026-11-21",
        time: "14h30 - 17h30, Thứ 7, ngày 21/11/2026",
        location: "Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy",
      };
    }
    return { event };
  },
  component: PublicEventCheckinPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Điểm Danh / Check-in: ${
          loaderData?.event?.name || "Kỷ Niệm 4 Năm Viện Doanh Trí"
        }`,
      },
      {
        name: "description",
        content:
          "Form điểm danh check-in tự động sự kiện Viện Doanh Trí và Toạ đàm Doanh Nghiệp Việt 2027.",
      },
    ],
  }),
});

function PublicEventCheckinPage() {
  const { event } = Route.useLoaderData();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Danh sách đại biểu công khai đã đăng ký / điểm danh
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeStats, setAttendeeStats] = useState({
    total: 0,
    checkedInCount: 0,
    onTimeCount: 0,
    lateCount: 0,
  });
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "attendees">("form");

  const fetchAttendees = async () => {
    try {
      setLoadingAttendees(true);
      const res = await fetchNestApi<any>(`/events/${event.id}/public-attendees`).catch(() => null);
      if (res && Array.isArray(res.attendees)) {
        setAttendees(res.attendees);
        setAttendeeStats({
          total: res.total || res.attendees.length,
          checkedInCount: res.checkedInCount || 0,
          onTimeCount: res.onTimeCount || 0,
          lateCount: res.lateCount || 0,
        });
      }
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Vui lòng nhập Họ và tên!");
      return;
    }

    if (email.trim() && !email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ Email hợp lệ!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchNestApi<any>(`/events/${event.id}/public-checkin`, {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          position: position.trim() || "Đại biểu",
          company: company.trim() || "Doanh nghiệp",
          phone: phone.trim(),
        }),
      });

      if (res && res.ok) {
        setResult(res);
        if (Array.isArray(res.attendees)) {
          setAttendees(res.attendees);
          setAttendeeStats({
            total: res.total || res.attendees.length,
            checkedInCount: res.checkedInCount || 0,
            onTimeCount: res.onTimeCount || 0,
            lateCount: res.lateCount || 0,
          });
        } else {
          fetchAttendees();
        }
        toast.success(res.message || "Check-in thành công!");
      } else {
        toast.error(res?.message || "Check-in không thành công, vui lòng thử lại!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi kết nối hệ thống check-in!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFullName("");
    setEmail("");
    setPosition("");
    setCompany("");
    setPhone("");
    setActiveTab("form");
  };

  // Filtered attendees for search
  const filteredAttendees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return attendees;
    return attendees.filter(
      (a) =>
        (a.memberName && a.memberName.toLowerCase().includes(q)) ||
        (a.company && a.company.toLowerCase().includes(q)) ||
        (a.position && a.position.toLowerCase().includes(q))
    );
  }, [attendees, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-emerald-50/30 to-slate-100 text-slate-800 antialiased flex flex-col justify-between selection:bg-[#005BAC] selection:text-white">
      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-5 sm:py-7 flex-1 space-y-4">
        {result ? (
          /* MÀN HÌNH KẾT QUẢ CHECK-IN THÀNH CÔNG VÀ DANH SÁCH ĐÃ ĐIỂM DANH */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            {/* Card thông báo thành công */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] p-8 text-center text-white relative">
                <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/60 text-white flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white text-[#005BAC] mb-2 shadow-sm">
                  XÁC NHẬN THÀNH CÔNG
                </span>
                <h2 className="text-xl font-black text-white">
                  Chào mừng {result.fullName}!
                </h2>
                <p className="text-xs text-sky-100 mt-1 max-w-sm mx-auto">
                  Cảm ơn Anh/Chị đã hoàn tất điểm danh tham dự sự kiện Kỷ niệm 4 năm Viện Doanh Trí.
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Phân loại check-in 30 phút: Đúng giờ vs Check-in muộn */}
                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                    result.checkinStatus === "on_time"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      result.checkinStatus === "on_time"
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wide">
                      {result.checkinStatus === "on_time"
                        ? "✓ ĐIỂM DANH ĐÚNG GIỜ (Trong 30 phút đầu)"
                        : "⏱ ĐIỂM DANH SAU 30 PHÚT (Ghi nhận check-in muộn)"}
                    </div>
                    <div className="text-xs opacity-85 mt-0.5">
                      Thời gian check-in: <strong>{result.checkedInAt}</strong>
                    </div>
                  </div>
                </div>

                {/* Thông tin đại biểu */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="font-extrabold uppercase tracking-wide text-[11px] pb-1 border-b border-slate-200 text-[#005BAC]">
                    THÔNG TIN ĐẠI BIỂU ĐIỂM DANH
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Họ và tên:</span>
                    <span className="font-bold text-slate-900">{result.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="font-bold text-slate-900">{result.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 font-medium">Doanh nghiệp:</span>
                    <span className="font-bold text-slate-900">{result.company || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 font-medium">Chức danh:</span>
                    <span className="font-bold text-slate-900">{result.position || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 font-medium">Mã đăng ký:</span>
                    <span className="font-mono font-bold text-[#005BAC]">{result.registrationId}</span>
                  </div>
                </div>

                {/* Thông báo email đã gửi */}
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-2.5 text-xs text-sky-900">
                  <Mail className="w-4 h-4 text-[#005BAC] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Email cảm ơn và xác nhận điểm danh từ <strong>Viện Doanh Trí</strong> đã được gửi tức thì về hòm thư: <strong>{result.email}</strong>. Quý Anh/Chị vui lòng kiểm tra hộp thư đến (Inbox / Spam).
                  </p>
                </div>

                {/* Lịch trình tóm tắt */}
                <div className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-4 text-xs text-sky-950 space-y-2">
                  <div className="font-bold text-[#005BAC] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#00A859]" />
                    CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ
                  </div>
                  <div className="text-[11px] text-slate-700 flex flex-col gap-1.5 pt-1 border-t border-sky-200/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#00A859] shrink-0" />
                      <span><strong>Thời gian:</strong> 14h30 - 17h30, Thứ 7, ngày 21/11/2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00A859] shrink-0" />
                      <span><strong>Địa điểm:</strong> Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy</span>
                    </div>
                  </div>
                </div>

                {/* Nút reset */}
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Điểm danh cho khách mời khác
                </button>
              </div>
            </div>

            {/* DANH SÁCH ĐẠI BIỂU ĐÃ ĐIỂM DANH SỰ KIỆN DOANH TRÍ */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] px-6 py-4 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    DANH SÁCH ĐẠI BIỂU SỰ KIỆN DOANH TRÍ
                  </div>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    Các Đại Biểu Đã Điểm Danh ({attendeeStats.checkedInCount}/{attendeeStats.total})
                  </h3>
                </div>
                <button
                  onClick={fetchAttendees}
                  disabled={loadingAttendees}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAttendees ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tổng Đại Biểu</div>
                  <div className="text-base font-black text-slate-800 mt-0.5">{attendeeStats.total}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Đúng giờ (30p)</div>
                  <div className="text-base font-black text-emerald-700 mt-0.5">{attendeeStats.onTimeCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Check-in Muộn</div>
                  <div className="text-base font-black text-amber-700 mt-0.5">{attendeeStats.lateCount}</div>
                </div>
              </div>

              {/* Search Box */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm đại biểu, doanh nghiệp, chức danh..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#005BAC] bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Attendee List Items */}
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredAttendees.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    {loadingAttendees ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005BAC]" />
                        <span>Đang tải danh sách đại biểu...</span>
                      </div>
                    ) : (
                      "Chưa có đại biểu nào trong danh sách hoặc không khớp từ khoá."
                    )}
                  </div>
                ) : (
                  filteredAttendees.map((a, idx) => {
                    const isCurrentUser =
                       result &&
                      (a.id === result.registrationId ||
                        (a.memberName && a.memberName.trim().toLowerCase() === result.fullName.trim().toLowerCase()));

                    return (
                      <div
                        key={a.id || idx}
                        className={`p-4 flex items-center justify-between gap-3 text-xs transition ${
                          isCurrentUser ? "bg-sky-50/80 border-l-4 border-l-[#005BAC]" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                              isCurrentUser
                                ? "bg-[#005BAC] text-white ring-2 ring-[#00A859]"
                                : a.checkinStatus === "on_time"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.checkinStatus === "late"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 truncate">
                                {a.memberName}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#005BAC] text-white uppercase">
                                  Quý khách vừa check-in
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {a.position ? `${a.position} · ` : ""}{a.company || "Doanh nghiệp"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {a.checkinStatus === "on_time" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              Đúng giờ
                            </span>
                          ) : a.checkinStatus === "late" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Muộn (&gt;30p)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              Đã đăng ký
                            </span>
                          )}
                          {a.checkedInAt && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              {a.checkedInAt.split(" ")[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* FORM CHECK-IN VÀ TAB CHUYỂN ĐỔI */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header thông tin sự kiện nhận diện Viện Doanh Trí chuẩn theo Image 1 */}
            <div className="bg-white p-6 sm:p-7 border-b border-slate-200 text-center">
              <div className="inline-flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black text-[#003B7A] tracking-wider uppercase leading-tight">
                    CHƯƠNG TRÌNH
                  </div>
                  <div className="text-xs sm:text-sm font-black text-[#003B7A] tracking-wider uppercase leading-tight">
                    KỶ NIỆM
                  </div>
                </div>
                <div className="h-10 sm:h-12 w-[2px] bg-slate-300 mx-1 hidden sm:block" />
                <div className="text-4xl sm:text-5xl font-black text-[#00A859] leading-none px-1">
                  4
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-black text-[#003B7A] tracking-wider uppercase leading-tight">
                    NĂM THÀNH LẬP
                  </div>
                  <div className="text-xs sm:text-sm font-black text-[#003B7A] tracking-wider uppercase leading-tight">
                    VIỆN DOANH TRÍ
                  </div>
                </div>
              </div>
              <div className="mt-2.5 text-xs sm:text-sm font-extrabold text-[#008A44] tracking-wider uppercase">
                &amp; TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11
              </div>

              {/* Thông tin Thời gian & Địa điểm (chỉ text gọn theo yêu cầu) */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00A859] shrink-0" />
                  <span className="font-bold text-slate-800">14h30 - 17h30, Thứ 7, ngày 21/11/2026</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A859] shrink-0" />
                  <span className="font-bold text-slate-800">Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
                  <span>Hotline BTC: 0988.870.888 / 0903.203.204</span>
                </div>
              </div>
            </div>

            {/* Tab chuyển đổi giữa Form và Danh sách đại biểu */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "form"
                    ? "bg-white text-[#005BAC] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Form Điểm Danh
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("attendees");
                  fetchAttendees();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "attendees"
                    ? "bg-white text-[#005BAC] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Đã Điểm Danh ({attendeeStats.checkedInCount}/{attendeeStats.total})
              </button>
            </div>

            {activeTab === "form" ? (
              /* Form ngắn gọn 4-5 trường */
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Họ và tên */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#005BAC]" />
                    Họ và tên của Quý Anh/Chị: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#005BAC]" />
                    Số điện thoại liên hệ:
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#005BAC]" />
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                </div>

                {/* Công ty / Doanh nghiệp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#005BAC]" />
                    Công ty / Doanh nghiệp:
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ví dụ: Công ty CP Đầu Tư & Phát Triển..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                </div>

                {/* Chức danh */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#005BAC]" />
                    Chức danh:
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ví dụ: Chủ tịch, Tổng giám đốc, Giám đốc..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-sm text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] hover:from-[#004b99] hover:to-[#00964e] text-white font-black text-sm tracking-wide uppercase transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ĐANG XÁC NHẬN CHECK-IN...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>XÁC NHẬN CHECK-IN NGAY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Nút xem danh sách */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("attendees");
                      fetchAttendees();
                    }}
                    className="text-xs font-bold text-[#005BAC] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#00A859]" />
                    Đã có {attendeeStats.checkedInCount} đại biểu điểm danh. Xem danh sách ngay →
                  </button>
                </div>

                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bằng cách nhấn Check-in, thông tin của Quý Anh/Chị sẽ được đồng bộ trực tiếp tới Cổng Quản trị Sự kiện và thư xác nhận sẽ được gửi ngay lập tức về email.
                  </p>
                </div>
              </form>
            ) : (
              /* TAB XEM DANH SÁCH ĐẠI BIỂU ĐÃ ĐIỂM DANH TRƯỚC HOẶC TRONG SỰ KIỆN */
              <div className="p-4 space-y-3">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm đại biểu, doanh nghiệp, chức danh..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#005BAC] bg-slate-50/50"
                    />
                  </div>
                  <button
                    onClick={fetchAttendees}
                    disabled={loadingAttendees}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    title="Làm mới"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAttendees ? "animate-spin text-[#005BAC]" : ""}`} />
                  </button>
                </div>

                {/* Attendee List */}
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto rounded-2xl border border-slate-200">
                  {filteredAttendees.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      {loadingAttendees ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#005BAC]" />
                          <span>Đang tải danh sách đại biểu...</span>
                        </div>
                      ) : (
                        "Chưa có đại biểu nào trong danh sách hoặc không khớp từ khoá."
                      )}
                    </div>
                  ) : (
                    filteredAttendees.map((a, idx) => (
                      <div
                        key={a.id || idx}
                        className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              a.checkinStatus === "on_time"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.checkinStatus === "late"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {a.memberName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {a.position ? `${a.position} · ` : ""}{a.company || "Doanh nghiệp"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {a.checkinStatus === "on_time" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              Đúng giờ
                            </span>
                          ) : a.checkinStatus === "late" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Muộn (&gt;30p)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              Đã đăng ký
                            </span>
                          )}
                          {a.checkedInAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {a.checkedInAt.split(" ")[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    ← Quay lại form điểm danh
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-xl mx-auto px-4 space-y-1">
          <p className="font-bold text-[#005BAC]">VIỆN DOANH TRÍ</p>
          <p className="text-[11px] text-slate-500">
            Hotline hỗ trợ: 0988.870.888 / 0903.203.204
          </p>
        </div>
      </footer>
    </div>
  );
}
