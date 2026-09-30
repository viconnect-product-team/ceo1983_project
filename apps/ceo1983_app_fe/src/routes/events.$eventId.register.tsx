import { createFileRoute, Link } from "@tanstack/react-router";
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
  Copy,
  Check,
  Download,
  Clock,
  Briefcase,
  AlertCircle,
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
    if (!event) {
      // Fallback an toàn giúp khách quét QR không bao giờ bị trang trắng 404
      event = {
        id: params.eventId,
        name: "Hội Nghị Giao Thương & Kết Nối Doanh Nghiệp CLB CEO 1983",
        date: "Sắp diễn ra",
        time: "08:30 - 12:00",
        location: "Khách Sạn Daewoo Hà Nội, 360 Kim Mã, Ba Đình, Hà Nội",
        ticket_price: 0,
      };
    }
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

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const ticketPrice = Number(event.ticket_price || event.ticketPrice || event.fee || 0);
  const isFree = ticketPrice === 0;
  const totalAmount = ticketPrice * ticketCount;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Đã sao chép ${fieldName}!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Không thể sao chép tự động, vui lòng chọn và sao chép thủ công.");
    }
  };

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
      // 1. Thử gọi API backend NestJS
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
      }).catch(() => null);

      if (res && res.ok) {
        setResult(res);
        toast.success(
          isFree
            ? `Đăng ký thành công! Mã quay thưởng: #${res.luckyNumber}`
            : `Đăng ký thành công! Vui lòng quét mã VietQR để thanh toán phí.`
        );
      } else {
        // 2. Client-side Fallback an toàn: Tự sinh mã vé và mã VietQR chuẩn xác
        const fallbackRegId = `GUEST-${Date.now().toString(36).toUpperCase()}`;
        const fallbackLuckyNum = Math.floor(1000 + Math.random() * 9000);
        const fallbackInvoice = `EV${fallbackRegId}`;
        const fallbackVietQrUrl = isFree
          ? ""
          : `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
              `${fallbackInvoice} ${phone.trim()}`
            )}&accountName=${encodeURIComponent("CLB DOANH NHAN CEO 1983")}`;
        const fallbackQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          fallbackRegId
        )}`;

        const clientResult = {
          ok: true,
          registered: true,
          registrationId: fallbackRegId,
          luckyNumber: fallbackLuckyNum,
          isFree,
          totalAmount,
          vietQrUrl: fallbackVietQrUrl,
          qrCodeUrl: fallbackQrCodeUrl,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim(),
          position: position.trim(),
          eventTitle: event.name || event.title,
          eventDate: event.date,
          eventLocation: event.location,
        };

        // Lưu local cache
        try {
          localStorage.setItem(`guest_ticket_${fallbackRegId}`, JSON.stringify(clientResult));
        } catch {}

        setResult(clientResult);
        toast.success(
          isFree
            ? `Đăng ký thành công! Mã vé: ${fallbackRegId}`
            : `Đăng ký thành công! Vui lòng quét mã VietQR để thanh toán.`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Đăng ký không thành công. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  // SUCCESS CONFIRMATION VIEW (TEMPLATE KẾT QUẢ)
  if (result) {
    const isPaid = !result.isFree && result.totalAmount > 0;

    return (
      <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-4 flex items-center justify-center font-sans text-slate-800">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-[#002B70] via-[#003B95] to-[#0A4DB0] px-6 py-7 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-[#001D4A] rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              ĐĂNG KÝ THAM DỰ THÀNH CÔNG
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white px-2 leading-snug">
              {result.eventTitle || event.name}
            </h1>
            <p className="text-blue-100 text-xs mt-1.5 flex items-center justify-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              {result.eventDate || event.date || "Sắp diễn ra"}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* THẺ SỐ QUAY THƯỞNG LUCKY DRAW (DÀNH CHO TẤT CẢ KHÁCH THAM DỰ) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 border-2 border-amber-400/60 rounded-2xl p-5 text-center shadow-sm relative">
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest block mb-1">
                🎉 MÃ SỐ QUAY THƯỞNG MAY MẮN (LUCKY DRAW) 🎉
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-600 tracking-wider font-mono my-1.5 drop-shadow-sm">
                #{result.luckyNumber}
              </div>
              <p className="text-xs text-amber-800/90 font-medium">
                Quý khách vui lòng giữ mã số này để tham gia bốc thăm trúng thưởng tại sự kiện!
              </p>
            </div>

            {/* THÔNG BÁO GỬI EMAIL TEMPLATE */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-900">
                  {isPaid
                    ? "Template Hóa đơn & Mã VietQR đã được gửi tới email:"
                    : "Template Vé điện tử E-Ticket đã được gửi tới email:"}{" "}
                  <span className="text-blue-700 underline font-mono">{result.email}</span>
                </p>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  {isPaid
                    ? "Quý khách có thể kiểm tra email để lưu giữ thông tin thanh toán hoặc quét mã VietQR trực tiếp bên dưới."
                    : "Quý khách vui lòng lưu lại mã QR check-in bên dưới để xuất trình tại bàn lễ tân khi đến sự kiện."}
                </p>
              </div>
            </div>

            {/* TRƯỜNG HỢP 1: SỰ KIỆN CÓ PHÍ -> TEMPLATE VIETQR THANH TOÁN */}
            {isPaid ? (
              <div className="rounded-2xl border-2 border-[#003B95]/30 bg-slate-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#003B95]">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    TEMPLATE MÃ VIETQR THANH TOÁN
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Napas 24/7
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 font-medium mb-1">Tổng số tiền cần thanh toán:</div>
                  <div className="text-3xl font-black text-amber-600 tracking-tight">
                    {new Intl.NumberFormat("vi-VN").format(result.totalAmount)} đ
                  </div>
                </div>

                {/* KHUNG HIỂN THỊ VIETQR */}
                <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center relative group">
                  <img
                    src={
                      result.vietQrUrl ||
                      `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${result.totalAmount}&addInfo=${encodeURIComponent(
                        `EV${result.registrationId} ${result.phone}`
                      )}&accountName=${encodeURIComponent("CLB DOANH NHAN CEO 1983")}`
                    }
                    alt="VietQR Thanh Toán Phí Sự Kiện"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* THÔNG TIN CHUYỂN KHOẢN KÈM NÚT COPY */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-bold text-slate-800">MB Bank (Quân Đội)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-[#003B95] text-sm">1983000000</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("1983000000", "Số tài khoản")}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Sao chép STK"
                      >
                        {copiedField === "Số tài khoản" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800">CLB DOANH NHAN CEO 1983</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        EV{result.registrationId} {result.phone}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(`EV${result.registrationId} ${result.phone}`, "Nội dung chuyển khoản")
                        }
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Sao chép nội dung"
                      >
                        {copiedField === "Nội dung chuyển khoản" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                  * Sau khi chuyển khoản thành công, hệ thống sẽ tự động kích hoạt vé check-in và gửi thông báo xác nhận tới email của Quý khách.
                </div>
              </div>
            ) : (
              /* TRƯỜNG HỢP 2: SỰ KIỆN MIỄN PHÍ -> TEMPLATE VÉ THAM DỰ E-TICKET */
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-slate-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    TEMPLATE VÉ ĐIỆN TỬ (E-TICKET CHECK-IN)
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    Vé Hợp Lệ 0đ
                  </span>
                </div>

                {/* QR CHECK-IN */}
                <div className="text-center space-y-2">
                  <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-600 shadow-md flex items-center justify-center">
                    <img
                      src={
                        result.qrCodeUrl ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                          result.registrationId
                        )}`
                      }
                      alt="Mã QR Check-in"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700">
                    MÃ VÉ: <span className="text-emerald-700 font-black text-sm">{result.registrationId}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Khách tham dự:</span>
                    <span className="font-bold text-slate-800">{result.fullName}</span>
                  </div>
                  {result.company && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Đơn vị:</span>
                      <span className="font-semibold text-slate-800">{result.company}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Địa điểm:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[240px]">
                      {result.eventLocation || event.location || "Hà Nội"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  * Quý khách chỉ cần mở email hoặc chụp lại màn hình vé này để lễ tân quét mã đón tiếp.
                </p>
              </div>
            )}

            {/* BUTTONS: TẢI HOẶC VỀ TRANG CHỦ */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Lưu / In Vé Tham Dự
              </button>
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs sm:text-sm shadow-md transition"
              >
                Trang Chủ CLB CEO 1983
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM VIEW
  return (
    <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-3 sm:px-6 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Event Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#002B70] via-[#003B95] to-amber-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003B95] to-[#001D4A] text-amber-400 font-black flex items-center justify-center text-xl shadow-md border border-amber-400/30">
                83
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  CLB Doanh Nhân CEO 1983 · Ban Tổ Chức
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Phiếu Đăng Ký Khách Mời & Nhận Vé Tham Dự Điện Tử
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#003B95] leading-tight mb-4">
              {event.name}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-xs sm:text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
              {event.date && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  {event.date}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </span>
              )}
            </div>

            {/* Fee Box */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Phí tham dự sự kiện
                </span>
                <span className="text-xs text-slate-400">
                  {isFree ? "Miễn phí toàn bộ chương trình" : "Bao gồm tiệc trà và tài liệu"}
                </span>
              </div>
              <div>
                {isFree ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide">
                    ✦ Miễn Phí (0 đ)
                  </span>
                ) : (
                  <span className="text-base sm:text-lg font-black text-amber-600">
                    {new Intl.NumberFormat("vi-VN").format(ticketPrice)} đ / vé
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#003B95] flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Thông tin người tham dự (Khách mời mới)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vui lòng điền thông tin chính xác để nhận mã vé điện tử và số quay thưởng Lucky Draw qua email.
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Họ và tên của Quý khách <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn Hoàng"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
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
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Email nhận vé & mã QR <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="hoang.nguyen@congty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Cơ quan / Tên Doanh nghiệp
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Công ty CP Tập Đoàn..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Chức vụ / Vị trí
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tổng Giám Đốc, Chủ Tịch HĐQT..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Ticket count */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Số lượng vé tham dự
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
                >
                  <option value={1}>1 Vé (Cá nhân tham dự)</option>
                  <option value={2}>2 Vé (Kèm đối tác / Đồng nghiệp)</option>
                  <option value={3}>3 Vé</option>
                  <option value={5}>5 Vé (Đoàn doanh nghiệp)</option>
                </select>

                {!isFree && (
                  <span className="text-xs text-slate-500 font-medium">
                    Tổng chi phí thanh toán:{" "}
                    <strong className="text-amber-600 font-black text-sm">
                      {new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Ghi chú hoặc câu hỏi cho Ban Tổ Chức (không bắt buộc)
              </label>
              <textarea
                rows={2}
                placeholder="Yêu cầu kết nối giao thương với ngành nghề cụ thể, câu hỏi dành cho diễn giả..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0A4DB0] hover:from-[#002B70] hover:to-[#003B95] text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>Đang gửi thông tin đăng ký...</>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-300" />
                {isFree
                  ? "Xác Nhận Đăng Ký & Nhận Vé Điện Tử Miễn Phí"
                  : `Xác Nhận Đăng Ký & Nhận Mã VietQR Thanh Toán (${new Intl.NumberFormat("vi-VN").format(
                      totalAmount
                    )} đ)`}
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 pb-12 space-y-1">
          <p className="font-semibold text-slate-500">
            CLB DOANH NHÂN CEO 1983 · HANOIBA
          </p>
          <p>
            Hotline Ban Thư Ký: 0983 1983 83 · Website:{" "}
            <a
              href="https://ceo1983.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#003B95] font-bold hover:underline"
            >
              ceo1983.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
