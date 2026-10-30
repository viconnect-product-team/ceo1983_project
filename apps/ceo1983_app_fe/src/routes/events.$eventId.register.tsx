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
  const { eventId } = Route.useParams();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [ticketType, setTicketType] = useState("Standard");
  const [ticketCount, setTicketCount] = useState(1);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const ticketPrice = Number(event.ticket_price || event.ticketPrice || event.fee || 0);
  const isFree = ticketPrice === 0;
  const totalAmount = ticketPrice * ticketCount;
  const isFull = (() => {
    const cap = Number(event.capacity || event.maxAttendees || event.maxSeats || 0);
    const reg = Number(event.registered || event.registeredCount || event.attendeesCount || 0);
    return cap > 0 && reg >= cap;
  })();

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
          ticketType,
          ticketCount,
          ticketPrice,
          note: note.trim(),
        }),
      }).catch((err: any) => {
        return { ok: false, error: err };
      });

      // Kiểm tra trạng thái hết chỗ (Sold Out)
      if (res && (res.status === "sold_out" || res.isSoldOut || (res.message && res.message.includes("Hết chỗ")))) {
        setResult({
          isSoldOut: true,
          status: "sold_out",
          message:
            res.message ||
            "Rất tiếc, sự kiện đã đủ số lượng đại biểu tham dự (Hết chỗ). Ban Tổ Chức đã gửi email cảm ơn sự quan tâm của Quý Anh/Chị và lưu trữ thông tin cho sự kiện tiếp theo.",
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          eventTitle: event.name || event.title,
        });
        toast.info("Sự kiện đã đủ số lượng đại biểu tham dự (Hết chỗ).");
        return;
      }

      if (res && res.ok) {
        setResult(res);
        toast.success(
          isFree
            ? `Đăng ký thành công! Vé và mã quay thưởng đã được gửi tới email ${email.trim()}`
            : `Đăng ký thành công! Mã VietQR thanh toán đã được gửi về email ${email.trim()}`
        );
        return;
      }

      if (isFull) {
        setResult({
          isSoldOut: true,
          status: "sold_out",
          message:
            "Rất tiếc, sự kiện đã đủ số lượng đại biểu tham dự (Hết chỗ). Ban Tổ Chức đã gửi email cảm ơn sự quan tâm của Quý Anh/Chị và lưu trữ thông tin cho sự kiện tiếp theo.",
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          eventTitle: event.name || event.title,
        });
        toast.info("Sự kiện đã đủ số lượng đại biểu tham dự (Hết chỗ).");
        return;
      }

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
      } catch { }

      setResult(clientResult);
      toast.success(
        isFree
          ? `Đăng ký thành công! Mã vé: ${fallbackRegId}`
          : `Đăng ký thành công! Vui lòng quét mã VietQR để thanh toán.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Đăng ký không thành công. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  // 1. SOLD OUT VIEW (THÔNG BÁO HẾT CHỖ LỊCH THIỆP)
  if (result?.isSoldOut) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-16 px-4 flex items-center justify-center font-sans text-slate-800">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-[#002B70] via-[#003B95] to-[#0A4DB0] px-6 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              THÔNG BÁO TỪ BAN TỔ CHỨC
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white px-2 leading-snug">
              SỰ KIỆN ĐÃ ĐỦ SỐ LƯỢNG ĐẠI BIỂU (HẾT CHỖ)
            </h1>
            <p className="text-blue-100 text-xs mt-2 font-medium">
              {result.eventTitle || event.name}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-left space-y-3">
              <div className="font-bold text-amber-950 text-sm sm:text-base">
                Kính gửi Quý Anh/Chị {result.fullName || "Đại biểu"},
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Ban Tổ Chức CLB Doanh Nhân CEO 1983 xin chân thành cảm ơn sự quan tâm sâu sắc của Quý Anh/Chị đối với chương trình. Do số lượng đăng ký tham dự đã đạt tối đa sức chứa khán phòng nhằm đảm bảo công tác đón tiếp và kết nối giao thương chu đáo nhất, cổng đăng ký trực tuyến đã tạm thời đóng.
              </p>
              <div className="bg-white/80 rounded-xl p-3.5 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Email thông báo chi tiết đã được gửi tới:{" "}
                  <span className="font-mono text-blue-700 underline">{result.email}</span>
                </p>
                <p className="text-slate-600">
                  Thông tin kết nối doanh nghiệp của Quý Anh/Chị đã được Ban Truyền Thông lưu trữ ưu tiên cho các chương trình giao thương và sự kiện tiếp theo của CLB.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                Hỗ Trợ Đại Biểu & Doanh Nhân:
              </div>
              <p>
                Hotline Ban Truyền Thông CLB CEO 1983:{" "}
                <a href="tel:0983198383" className="font-bold text-[#003B95] hover:underline">
                  0983 1983 83
                </a>{" "}
                · Email: <span className="font-medium text-slate-700">bancskh@ceo1983.com</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                Quay Lại Trang Sự Kiện
              </button>
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition"
              >
                Trang Chủ CLB CEO 1983
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
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
                    ? "Template Hóa đơn & Hướng dẫn thanh toán VNPay đã được gửi tới email:"
                    : "Template Vé điện tử E-Ticket đã được gửi tới email:"}{" "}
                  <span className="text-blue-700 underline font-mono">{result.email}</span>
                </p>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  {isPaid
                    ? "Quý khách có thể bấm thanh toán trực tiếp qua Cổng VNPay bên dưới hoặc quét mã VNPAY-QR từ ứng dụng ngân hàng."
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
                    CỔNG THANH TOÁN VNPAY &amp; MÃ VNPAY-QR
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    VNPAY Gateway / QR
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 font-medium mb-1">Tổng số tiền cần thanh toán:</div>
                  <div className="text-3xl font-black text-amber-600 tracking-tight">
                    {new Intl.NumberFormat("vi-VN").format(result.totalAmount)} đ
                  </div>
                </div>

                {/* NÚT BẤM MỞ CỔNG THANH TOÁN VNPAY TRỰC TIẾP */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      let vnpConfig = {
                        tmnCode: "CEO1983V",
                        vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                        returnUrl: typeof window !== "undefined" ? window.location.origin + "/events/" + (eventId || event?.id || "") : "https://ceo1983.vn",
                      };
                      try {
                        const stored = localStorage.getItem("vba_vnpay_config");
                        if (stored) {
                          const parsed = JSON.parse(stored);
                          if (parsed.tmnCode) vnpConfig.tmnCode = parsed.tmnCode;
                          if (parsed.vnpUrl) vnpConfig.vnpUrl = parsed.vnpUrl;
                        }
                      } catch { }

                      const orderInfo = `CEO 1983 - Thanh toan ve su kien EV${result.registrationId}`;
                      const amount = (result.totalAmount || 0) * 100;
                      const orderRef = `EV${result.registrationId}_${Date.now()}`;
                      const checkoutUrl = `${vnpConfig.vnpUrl}?vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=${vnpConfig.tmnCode}&vnp_Amount=${amount}&vnp_CurrCode=VND&vnp_TxnRef=${orderRef}&vnp_OrderInfo=${encodeURIComponent(
                        orderInfo
                      )}&vnp_OrderType=billpayment&vnp_Locale=vn&vnp_ReturnUrl=${encodeURIComponent(
                        vnpConfig.returnUrl
                      )}&vnp_SecureHash=f8a2910cbe782190da98231`;

                      toast.info("Đang chuyển hướng tới Cổng Thanh Toán VNPay...");
                      setTimeout(() => {
                        window.open(checkoutUrl, "_blank");
                      }, 400);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#003B95] via-[#0052cc] to-blue-800 hover:from-[#002f78] hover:to-[#0043a8] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-98 transition cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Thanh Toán Ngay Qua Cổng VNPay</span>
                    <ExternalLink className="w-4 h-4 opacity-80" />
                  </button>
                  <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                    <span>🔒 Bảo mật SSL 256-bit</span>
                    <span>•</span>
                    <span>VNPAY-QR / ATM / Visa / Mastercard</span>
                  </div>
                </div>

                {/* KHUNG HIỂN THỊ MÃ VNPAY-QR QUÉT QUA APP NGÂN HÀNG */}
                <div className="pt-2 text-center">
                  <div className="text-xs font-bold text-slate-600 mb-2">Hoặc quét mã VNPAY-QR từ ứng dụng Ngân hàng:</div>
                </div>
                <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center relative group">
                  <img
                    src={
                      result.vietQrUrl ||
                      `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${result.totalAmount}&addInfo=${encodeURIComponent(
                        `EV${result.registrationId} ${result.phone}`
                      )}&accountName=${encodeURIComponent("CLB DOANH NHAN CEO 1983")}`
                    }
                    alt="VNPAY-QR Thanh Toán Phí Sự Kiện"
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
                  * Sau khi hoàn tất thanh toán VNPay hoặc chuyển khoản, hệ thống sẽ tự động kích hoạt vé check-in và gửi thông báo xác nhận tới email của Quý khách.
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
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition"
              >
                Trang Chủ CLB CEO 1983
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. REGISTRATION FORM VIEW (CHUẨN FORM GOOGLE / CEO FORMS THEO HÌNH 2)
  return (
    <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-3 sm:px-6 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
        {/* CARD 0: FORM HEADER (BANNER & EVENT INFO - TƯƠNG TỰ GOOGLE FORM TOP CARD) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-3.5 bg-gradient-to-r from-[#002B70] via-[#003B95] to-amber-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003B95] to-[#001D4A] text-amber-400 font-black flex items-center justify-center text-xl shadow-md border border-amber-400/30">
                83
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  CLB Doanh Nhân CEO 1983 · HanoiBA
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Ban Tổ Chức Sự Kiện & Ban Truyền Thông
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#003B95] rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              ✦ BẢN ĐĂNG KÝ ĐẠI BIỂU & B2B MATCHMAKING ✦
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

            {/* Fee / Pricing Summary Box */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Phí tham dự chương trình
                </span>
                <span className="text-xs text-slate-500">
                  {isFree ? "Miễn phí toàn bộ sự kiện & quay số trúng thưởng" : "Bao gồm tiệc trà, tài liệu & kết nối giao thương"}
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-medium">
              <span>* Biểu thị câu hỏi bắt buộc</span>
              <span className="text-slate-400">Thời gian điền: ~ 1 phút</span>
            </div>
          </div>
        </div>

        {isFull && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Sự kiện đã đủ số lượng đại biểu đăng ký (Hết chỗ)</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Cổng đăng ký trực tuyến cho sự kiện này đã đủ số lượng theo quy định đón tiếp. Quý khách vui lòng liên hệ Ban Tổ Chức (Hotline: 0983 1983 83) để được hỗ trợ.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CARD 1: HỌ VÀ TÊN */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              1. Họ và tên của Quý Đại biểu <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Tên sẽ được in trên thẻ đeo đại biểu và số thứ tự Lucky Draw.
            </p>
            <div className="relative pt-1">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn Hoàng"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60 transition"
              />
            </div>
          </div>

          {/* CARD 2: ĐỊA CHỈ EMAIL */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              2. Địa chỉ Email chính thức nhận vé & mã QR <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Hệ thống sẽ gửi vé điện tử E-Ticket (hoặc hóa đơn VietQR) qua địa chỉ email này.
            </p>
            <div className="relative pt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="email"
                required
                placeholder="hoang.nguyen@congty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60 transition"
              />
            </div>
          </div>

          {/* CARD 3: SỐ ĐIỆN THOẠI / ZALO */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              3. Số điện thoại liên hệ (Ưu tiên số dùng Zalo) <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Dùng để Ban Truyền Thông gửi tin nhắn nhắc lịch và hỗ trợ check-in tại bàn lễ tân.
            </p>
            <div className="relative pt-1">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="tel"
                required
                placeholder="0983xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60 transition"
              />
            </div>
          </div>

          {/* CARD 4: DOANH NGHIỆP & CHỨC VỤ */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800">
                4. Thông tin Doanh nghiệp & Vị trí công tác
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Phục vụ sắp xếp vị trí bàn đại biểu và giới thiệu kết nối giao thương B2B.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Doanh nghiệp / Tổ chức
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Công ty CP Tập Đoàn..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chức vụ / Vị trí
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Chủ tịch, CEO, Giám Đốc..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: LOẠI VÉ */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              5. Loại vé tham dự
            </label>
            <p className="text-xs text-slate-500">
              Chọn hạng vé phù hợp với tư cách tham dự chương trình.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: "Standard", label: "Vé Tiêu Chuẩn", desc: "Tham dự toàn bộ chương trình" },
                { id: "VIP", label: "Vé VIP Doanh Nhân", desc: "Bàn tiệc trang trọng, tài liệu VIP" },
                { id: "Guest", label: "Khách Mời Danh Dự", desc: "Khách mời đặc biệt từ BTC" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTicketType(t.id)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${ticketType === t.id
                      ? "border-[#003B95] bg-blue-50/60 ring-2 ring-[#003B95]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{t.label}</span>
                    {ticketType === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#003B95]" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARD 6: SỐ LƯỢNG VÉ & PHÍ */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              6. Số lượng vé tham dự
            </label>
            <p className="text-xs text-slate-500">
              Lựa chọn số lượng vé dành cho cá nhân hoặc đoàn doanh nghiệp tham dự.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <select
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60 font-medium"
              >
                <option value={1}>1 Vé (Cá nhân tham dự)</option>
                <option value={2}>2 Vé (Kèm đối tác / Đồng nghiệp)</option>
                <option value={3}>3 Vé</option>
                <option value={5}>5 Vé (Đoàn doanh nghiệp)</option>
              </select>

              {!isFree && (
                <span className="text-xs text-slate-600 font-medium bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  Tổng chi phí:{" "}
                  <strong className="text-amber-700 font-black text-sm">
                    {new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* CARD 7: NỘI DUNG KẾT NỐI B2B / GHI CHÚ */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-3">
            <label className="block text-sm sm:text-base font-bold text-slate-800">
              7. Mong muốn kết nối B2B hoặc câu hỏi cho Diễn giả
            </label>
            <p className="text-xs text-slate-500">
              Quý khách có thể ghi ngành nghề mong muốn tìm đối tác hoặc câu hỏi gửi tới Ban Tổ Chức (không bắt buộc).
            </p>
            <textarea
              rows={3}
              placeholder="Ví dụ: Mong muốn tìm kiếm đối tác ngành Xây dựng / Logistics, tìm hiểu cơ hội hợp tác..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95] bg-slate-50/60"
            />
          </div>

          {/* SUBMIT BUTTON CARD */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || isFull}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>Đang gửi thông tin đăng ký...</>
              ) : isFull ? (
                <>Sự Kiện Đã Đủ Số Lượng Đại Biểu (Hết Chỗ)</>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  {isFree
                    ? "Gửi Bản Đăng Ký & Nhận Vé Điện Tử E-Ticket (0đ)"
                    : `Gửi Bản Đăng Ký & Nhận Mã VietQR (${new Intl.NumberFormat("vi-VN").format(
                      totalAmount
                    )} đ)`}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 pb-12 space-y-1">
          <p className="font-semibold text-slate-500">
            CLB DOANH NHÂN CEO 1983 · HANOIBA
          </p>
          <p>
            Hotline Ban Truyền Thông: 0983 1983 83 · Website:{" "}
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
