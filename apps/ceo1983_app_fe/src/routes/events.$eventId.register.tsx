import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  MapPin,
  Ticket,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Send,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$eventId/register")({
  ssr: false,
  loader: async ({ params }) => {
    let event = await fetchNestApi<any>(`/events/${params.eventId}`).catch(() => null);
    if (!event) {
      const allEvents = await fetchNestApi<any[]>("/events").catch(() => []);
      if (Array.isArray(allEvents)) {
        event = allEvents.find((e: any) => e.id === params.eventId || e.slug === params.eventId) || null;
      }
    }
    if (!event) throw notFound();
    return { event };
  },
  component: GuestEventRegistrationPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `Đăng Ký Tham Dự: ${loaderData?.event?.name || "Sự Kiện CLB CEO 1983"}` },
      {
        name: "description",
        content: `Đăng ký vé tham gia sự kiện và nhận mã quay số may mắn trúng thưởng CLB Doanh Nhân CEO 1983.`,
      },
    ],
  }),
});

function GuestEventRegistrationPage() {
  const { event } = Route.useLoaderData();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const ticketPrice = Number(event.ticket_price || event.ticketPrice || event.fee || 0);
  const isFree = ticketPrice === 0;
  const totalAmount = ticketPrice * ticketCount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Email để nhận vé!");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchNestApi<any>(`/events/${event.id}/guest-register`, {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim(),
          position: position.trim(),
          ticketCount,
          note: note.trim(),
        }),
      });

      setResult(res);
      toast.success(
        isFree
          ? `Đăng ký thành công! Mã quay thưởng: #${res.luckyNumber}`
          : `Đăng ký thành công! Vui lòng quét mã VietQR để thanh toán phí.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Đăng ký không thành công. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  // SUCCESS CONFIRMATION VIEW
  if (result) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-4 flex items-center justify-center font-sans text-slate-800">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Banner */}
          <div className="bg-[#003B95] px-6 py-6 text-white text-center">
            <span className="inline-block px-3 py-1 bg-amber-400 text-[#001D4A] rounded-full text-xs font-black uppercase tracking-wider mb-2">
              ✦ ĐĂNG KÝ VÉ THÀNH CÔNG ✦
            </span>
            <h1 className="text-xl sm:text-2xl font-black">{event.name}</h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* LUCKY DRAW NUMBER DISPLAY */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
                🎉 MÃ SỐ QUAY THƯỞNG MAY MẮN (LUCKY DRAW) 🎉
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-600 tracking-wider font-mono my-2">
                #{result.luckyNumber}
              </div>
              <p className="text-xs text-amber-800 font-medium">
                Hãy giữ mã số này để tham gia chương trình quay số trúng thưởng đặc biệt tại sự kiện!
              </p>
            </div>

            {/* Email Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-xs sm:text-sm text-blue-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">
                  Email xác nhận đã được gửi tới: <strong>{result.email}</strong>
                </p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Vui lòng kiểm tra hộp thư (hoặc mục Quảng cáo/Spam) để xem chi tiết vé điện tử, mã QR
                  check-in và thông tin sự kiện.
                </p>
              </div>
            </div>

            {/* PAYMENT VIETQR (IF PAID EVENT) */}
            {!result.isFree && result.vietQrUrl && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#003B95]">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  MÃ VIETQR THANH TOÁN PHÍ THAM DỰ
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {new Intl.NumberFormat("vi-VN").format(result.totalAmount)} đ
                </div>

                <div className="w-56 h-56 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                  <img
                    src={result.vietQrUrl}
                    alt="VietQR Thanh Toán Phí Sự Kiện"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-xs text-slate-600 text-left bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <p>
                    <strong>Nội dung CK:</strong>{" "}
                    <span className="font-mono text-[#003B95] font-bold">EV{result.registrationId}</span>
                  </p>
                  <p>
                    <strong>Người thụ hưởng:</strong> CLB DOANH NHÂN CEO 1983
                  </p>
                  <p className="text-[11px] text-slate-400">
                    * Quý khách có thể quét mã thanh toán ngay bằng ứng dụng ngân hàng hoặc thanh toán tại bàn đón tiếp của Ban Truyền Thông.
                  </p>
                </div>
              </div>
            )}

            {/* FREE TICKET QR PASS (IF FREE EVENT) */}
            {result.isFree && result.qrCodeUrl && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  MÃ QR CHECK-IN TẠI SỰ KIỆN
                </span>
                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border-2 border-[#003B95] shadow-sm flex items-center justify-center">
                  <img
                    src={result.qrCodeUrl}
                    alt="Mã QR Checkin"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-mono text-xs font-bold text-[#003B95]">
                  MÃ VÉ: {result.registrationId}
                </div>
              </div>
            )}

            {/* Back action */}
            <div className="pt-2">
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-sm shadow-md transition-all"
              >
                Khám phá Website CLB: ceo1983.com
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-3 sm:px-6 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Event Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-3 bg-[#003B95]" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#003B95] text-amber-400 font-black flex items-center justify-center text-lg shadow-sm">
                83
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  CLB Doanh Nhân CEO 1983 · Ban Tổ Chức
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Phiếu Đăng Ký Tham Dự Sự Kiện & Nhận Vé Điện Tử
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#003B95] leading-tight mb-3">
              {event.name}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
              {event.date && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {event.date}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  {event.location}
                </span>
              )}
            </div>

            {/* Fee Box */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-xs font-semibold text-slate-600">Mức phí tham dự:</span>
              <span className="text-sm font-black text-[#003B95]">
                {isFree ? (
                  <span className="text-emerald-600 font-extrabold uppercase">Miễn phí (0 đ)</span>
                ) : (
                  <span className="text-amber-600">
                    {new Intl.NumberFormat("vi-VN").format(ticketPrice)} đ / vé
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-[#003B95] border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Thông tin người tham dự
            </h2>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Họ và tên người tham dự <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Trần Văn Nam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="0983xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Email nhận vé & mã quay thưởng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="nam@congty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Cơ quan / Tên Doanh nghiệp
                </label>
                <input
                  type="text"
                  placeholder="Công ty CP..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Chức vụ / Vị trí
                </label>
                <input
                  type="text"
                  placeholder="Giám đốc, Quản lý..."
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                />
              </div>
            </div>

            {/* Ticket count */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Số lượng vé tham dự
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                >
                  <option value={1}>1 Vé (Cá nhân)</option>
                  <option value={2}>2 Vé (Kèm đối tác / Đồng nghiệp)</option>
                  <option value={3}>3 Vé</option>
                  <option value={5}>5 Vé (Đoàn doanh nghiệp)</option>
                </select>

                {!isFree && (
                  <span className="text-xs text-slate-500">
                    Tổng chi phí:{" "}
                    <strong className="text-amber-600 font-bold text-sm">
                      {new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Ghi chú thêm (nếu có)
              </label>
              <textarea
                rows={2}
                placeholder="Yêu cầu vị trí ngồi, đón tiếp hoặc câu hỏi dành cho diễn giả..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>Đang đăng ký...</>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                Xác Nhận Đăng Ký & Nhận Vé / Mã Quay Thưởng
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 pb-12">
          CLB DOANH NHÂN CEO 1983 · Hotline: 0983 1983 83 · Website:{" "}
          <a
            href="https://ceo1983.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#003B95] hover:underline"
          >
            ceo1983.com
          </a>
        </div>
      </div>
    </div>
  );
}
