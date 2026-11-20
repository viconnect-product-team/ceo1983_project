import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Vote,
  Star,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Users,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Share2,
  Award,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/vote/$pollId")({
  ssr: false,
  loader: async ({ params }) => {
    let poll = await fetchNestApi<any>(`/voting/public/polls/${params.pollId}`).catch(() => null);
    if (!poll) {
      poll = {
        id: params.pollId,
        title: "Đánh Giá Chất Lượng Chương Trình & Toạ Đàm Doanh Nghiệp 2027",
        description: "Khảo sát ý kiến đóng góp của Quý Đại biểu tham dự sự kiện Kỷ niệm 4 năm thành lập Viện Doanh Trí.",
        status: "open",
        isStarRating: true,
        averageRating: 4.9,
        starDistribution: {
          5: { count: 38, percentage: 84.4 },
          4: { count: 5, percentage: 11.1 },
          3: { count: 2, percentage: 4.5 },
          2: { count: 0, percentage: 0 },
          1: { count: 0, percentage: 0 },
        },
        options: [
          { id: "opt-5", title: "5★ - Xuất sắc / Rất hài lòng", votesCount: 38, percentage: 84.4, isLeading: true },
          { id: "opt-4", title: "4★ - Hài lòng", votesCount: 5, percentage: 11.1, isLeading: false },
          { id: "opt-3", title: "3★ - Bình thường", votesCount: 2, percentage: 4.5, isLeading: false },
          { id: "opt-2", title: "2★ - Chưa hài lòng", votesCount: 0, percentage: 0, isLeading: false },
          { id: "opt-1", title: "1★ - Rất không hài lòng", votesCount: 0, percentage: 0, isLeading: false },
        ],
        totalVotes: 45,
        eventName: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ",
      };
    }
    return { poll };
  },
  component: PublicPollVotePage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Biểu Quyết / Lấy Ý Kiến: ${
          loaderData?.poll?.title || "Viện Doanh Trí"
        }`,
      },
      {
        name: "description",
        content: "Cổng biểu quyết và khảo sát ý kiến trực tuyến sự kiện Viện Doanh Trí.",
      },
    ],
  }),
});

const STAR_LABELS: Record<number, string> = {
  1: "Rất không hài lòng",
  2: "Chưa hài lòng",
  3: "Bình thường / Tạm ổn",
  4: "Hài lòng",
  5: "Xuất sắc / Rất hài lòng",
};

export function PublicPollVotePage() {
  const { poll: initialPoll } = Route.useLoaderData();
  const [poll, setPoll] = useState<any>(initialPoll);
  const [loading, setLoading] = useState(false);

  // Parse URL search params for auto-fill
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialEmail = searchParams?.get("email") || "";
  const initialName = searchParams?.get("name") || "";

  const [voterName, setVoterName] = useState(initialName);
  const [voterEmail, setVoterEmail] = useState(initialEmail);
  const [voterPhone, setVoterPhone] = useState("");

  // Lựa chọn vote
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoveredStars, setHoveredStars] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState<"vote" | "results">("vote");

  const refreshPoll = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any>(`/voting/public/polls/${poll.id}`).catch(() => null);
      if (res && res.id) {
        setPoll(res);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tự động đồng bộ Realtime biểu đồ kết quả biểu quyết theo thời gian thực (mỗi 2.5 giây)
  useEffect(() => {
    if (!poll?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchNestApi<any>(`/voting/public/polls/${poll.id}`).catch(() => null);
        if (res && res.id) {
          setPoll(res);
        }
      } catch {
        // Silent background sync
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [poll?.id]);

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload: any = {
        voterName: voterName.trim(),
        voterEmail: voterEmail.trim().toLowerCase(),
        voterPhone: voterPhone.trim(),
      };

      if (poll.isStarRating) {
        payload.stars = selectedStars;
      } else {
        if (!selectedOptionId) {
          toast.error("Vui lòng chọn 1 phương án bình chọn!");
          setSubmitting(false);
          return;
        }
        payload.optionId = selectedOptionId;
      }

      const res = await fetchNestApi<any>(`/voting/public/polls/${poll.id}/vote`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res) {
        setPoll(res);
        setHasVoted(true);
        setActiveTab("results");
        toast.success("Đã ghi nhận ý kiến biểu quyết của Quý Anh/Chị thành công!");
      } else {
        toast.error("Không thể ghi nhận biểu quyết, vui lòng thử lại!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi gửi biểu quyết!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href.split("?")[0]);
      toast.success("Đã sao chép liên kết biểu quyết công khai!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/60 to-emerald-50/40 text-slate-800 antialiased flex flex-col justify-between selection:bg-[#005BAC] selection:text-white">
      {/* Top Header Nhận Diện Viện Doanh Trí */}
      <header className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] px-4 sm:px-8 py-3.5 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#005BAC] font-black flex items-center justify-center text-lg shadow-md ring-2 ring-emerald-300">
              DT
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                VIỆN DOANH TRÍ · LẤY Ý KIẾN TRỰC TUYẾN
              </span>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
                Cổng Biểu Quyết & Khảo Sát Ý Kiến Đại Biểu
              </h1>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Sao chép liên kết chia sẻ"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 space-y-5">
        {/* Card Tiêu Đề Biểu Quyết */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#005BAC]/10 via-[#0284C7]/10 to-[#00A859]/10 p-6 sm:p-7 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#005BAC]/15 text-[#005BAC] border border-[#005BAC]/20">
                <Vote className="w-3.5 h-3.5 text-[#00A859]" />
                {poll.isStarRating ? "Đánh Giá Theo Thang Điểm Sao" : "Biểu Quyết Phương Án"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                  poll.status === "open"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {poll.status === "open" ? "● Đang Mở Bình Chọn" : "Đã Đóng"}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {poll.title}
            </h2>

            {poll.description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {poll.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500 font-medium pt-3 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#005BAC]" />
                Đã có <strong>{poll.totalVotes || 0}</strong> lượt biểu quyết
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00A859]" />
                {poll.eventName || "Kỷ niệm 4 năm Viện Doanh Trí"}
              </span>
            </div>
          </div>

          {/* Tab Chuyển Đổi: Biểu Quyết vs Xem Biểu Đồ Kết Quả */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("vote")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "vote"
                  ? "bg-white text-[#005BAC] shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Phiếu Biểu Quyết</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("results");
                refreshPoll();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "results"
                  ? "bg-white text-[#005BAC] shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Biểu Đồ Kết Quả ({poll.totalVotes})</span>
            </button>
          </div>

          {activeTab === "vote" ? (
            /* FORM BỎ PHIẾU / ĐÁNH GIÁ SAO */
            <form onSubmit={handleVoteSubmit} className="p-6 sm:p-7 space-y-6">
              {/* DẠNG 1: ĐÁNH GIÁ THEO SAO (STAR RATING) */}
              {poll.isStarRating ? (
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50/50 via-yellow-50/30 to-white border border-amber-200 text-center space-y-4 shadow-sm">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    Chạm Để Chọn Mức Độ Đánh Giá Của Bạn
                  </div>

                  {/* 5 Ngôi Sao Lớn Tương Tác */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 py-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = (hoveredStars || selectedStars) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStars(star)}
                          onMouseLeave={() => setHoveredStars(0)}
                          onClick={() => setSelectedStars(star)}
                          className="p-1 sm:p-2 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-9 h-9 sm:w-11 sm:h-11 transition-all duration-200 ${
                              isHighlighted
                                ? "fill-amber-400 text-amber-500 drop-shadow-md"
                                : "text-slate-300 fill-slate-100"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Mô tả cảm xúc số sao đã chọn */}
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-amber-300 shadow-2xs text-xs sm:text-sm font-black text-amber-900">
                    {selectedStars} Sao · {STAR_LABELS[hoveredStars || selectedStars]}
                  </div>
                </div>
              ) : (
                /* DẠNG 2: BÌNH CHỌN PHƯƠNG ÁN TRUYỀN THỐNG */
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Chọn một trong các phương án dưới đây:
                  </div>
                  {poll.options.map((opt: any) => (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs sm:text-sm ${
                        selectedOptionId === opt.id
                          ? "bg-sky-50 border-[#005BAC] text-[#005BAC] font-bold shadow-xs ring-2 ring-[#005BAC]/20"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <span>{opt.title}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedOptionId === opt.id
                            ? "border-[#005BAC] bg-[#005BAC] text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedOptionId === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Thông Tin Đại Biểu (Không bắt buộc, hỗ trợ nhận diện) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="font-extrabold text-slate-700 uppercase text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#005BAC]" />
                  Thông Tin Đại Biểu Tham Gia (Tùy chọn)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Họ và tên:</label>
                    <input
                      type="text"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Email:</label>
                    <input
                      type="email"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      placeholder="email@company.vn"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>
                </div>
              </div>

              {/* Nút Gửi Biểu Quyết */}
              <button
                type="submit"
                disabled={submitting || poll.status === "closed"}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] hover:from-[#004a8f] hover:to-[#00964e] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi ý kiến...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Xác Nhận Bỏ Phiếu / Gửi Đánh Giá</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("results");
                    refreshPoll();
                  }}
                  className="text-xs font-bold text-[#005BAC] hover:underline cursor-pointer"
                >
                  Xem kết quả biểu quyết hiện tại →
                </button>
              </div>
            </form>
          ) : (
            /* TAB BIỂU ĐỒ KẾT QUẢ BIỂU QUYẾT */
            <div className="p-6 sm:p-7 space-y-6">
              {/* Header Kết Quả */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00A859]" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Thống Kê Kết Quả Thời Gian Thực
                  </h3>
                </div>
                <button
                  onClick={refreshPoll}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1 text-xs cursor-pointer"
                  title="Cập nhật kết quả mới nhất"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#005BAC]" : ""}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>
              </div>

              {/* TRƯỜNG HỢP 1: BIỂU ĐỒ CHO STAR RATING */}
              {poll.isStarRating && poll.starDistribution ? (
                <div className="space-y-5">
                  {/* Điểm Đánh Giá Trung Bình Lớn */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-center shadow-lg relative overflow-hidden">
                    <div className="text-xs font-black uppercase tracking-wider text-amber-100 mb-1">
                      ĐIỂM ĐÁNH GIÁ TRUNG BÌNH
                    </div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight">
                      {poll.averageRating || "5.0"}
                      <span className="text-2xl font-bold text-amber-200"> / 5.0</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-5 h-5 fill-white text-white drop-shadow-xs" />
                      ))}
                    </div>
                    <div className="text-xs text-amber-100 mt-2 font-medium">
                      Dựa trên <strong>{poll.totalVotes}</strong> lượt đánh giá từ các vị đại biểu
                    </div>
                  </div>

                  {/* Thanh Biểu Đồ Phân Phối Từng Mức Sao */}
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phân Bổ Tỷ Lệ Theo Mức Đánh Giá:
                    </div>

                    {[5, 4, 3, 2, 1].map((level) => {
                      const data = poll.starDistribution[level] || { count: 0, percentage: 0 };
                      return (
                        <div key={level} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="flex items-center gap-1">
                              <span>{level}★</span>
                              <span className="text-slate-500 font-normal">({STAR_LABELS[level]})</span>
                            </span>
                            <span className="text-[#005BAC]">
                              {data.count} phiếu ({data.percentage}%)
                            </span>
                          </div>

                          {/* Progress Bar Chart */}
                          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#005BAC] to-[#00A859]"
                              style={{ width: `${data.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* TRƯỜNG HỢP 2: BIỂU ĐỒ CHO PHƯƠNG ÁN LỰA CHỌN THÔNG THƯỜNG */
                <div className="space-y-4">
                  {poll.options.map((opt: any) => (
                    <div key={opt.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{opt.title}</span>
                          {opt.isLeading && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Dẫn đầu
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-black text-[#005BAC]">
                          {opt.percentage}% ({opt.votesCount} phiếu)
                        </span>
                      </div>

                      {/* Bar Chart */}
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            opt.isLeading
                              ? "bg-gradient-to-r from-[#005BAC] to-[#00A859]"
                              : "bg-slate-400"
                          }`}
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quay lại form */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("vote")}
                  className="w-full py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  ← Quay lại màn hình bỏ phiếu
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-xl mx-auto px-4 space-y-1">
          <p className="font-bold text-[#005BAC]">VIỆN DOANH TRÍ · KỶ NIỆM 4 NĂM</p>
          <p className="text-[11px] text-slate-500">
            Cổng Biểu Quyết & Lấy Ý Kiến Khách Mời Trực Tuyến Độc Quyền
          </p>
        </div>
      </footer>
    </div>
  );
}
