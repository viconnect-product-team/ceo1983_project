import React, { useState } from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Globe,
  Users,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import { StandardDateInput } from "@/components/common/StandardDateInput";

export function Ceo1983MemberRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("Tổng Giám Đốc / CEO");
  const [birthDate, setBirthDate] = useState("1983-08-19");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("ind.trade");
  const [customIndustry, setCustomIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [staffSize, setStaffSize] = useState("10 - 50 nhân sự");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  const industries = [
    { value: "ind.trade", label: "Thương mại & Bán lẻ" },
    { value: "ind.it", label: "Công nghệ thông tin & Viễn thông" },
    { value: "ind.manufacturing", label: "Sản xuất & Chế tạo" },
    { value: "ind.realestate", label: "Bất động sản & Xây dựng" },
    { value: "ind.finance", label: "Tài chính & Đầu tư" },
    { value: "ind.fnb", label: "Ẩm thực & Dịch vụ F&B" },
    { value: "ind.logistics", label: "Vận tải & Logistics" },
    { value: "ind.health", label: "Y tế, Dược phẩm & Chăm sóc sức khỏe" },
    { value: "ind.education", label: "Giáo dục & Đào tạo" },
    { value: "ind.other", label: "Ngành nghề khác..." },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim() || !companyName.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ để nhận tài khoản");
      return;
    }

    setSubmitting(true);
    try {
      const finalIndustry = industry === "ind.other" && customIndustry ? customIndustry : industry;
      await fetchNestApi("/members/public-register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          position,
          birthYear: birthDate,
          companyName: companyName.trim(),
          industry: finalIndustry,
          address: address.trim(),
          website: website.trim(),
          staffSize,
          notes: notes.trim(),
        }),
      });

      setRegisteredData({
        fullName,
        companyName,
        email,
        phone,
        notes,
      });
      setSubmitted(true);
      toast.success(
        "✓ Hồ sơ đăng ký đã được tiếp nhận! Thư cảm ơn & biên nhận đã được gửi tới email của Quý Doanh nhân."
      );
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Cobalt Banner */}
          <div className="h-3 bg-[#003B95]" />

          <div className="p-8 sm:p-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              ✦ Đăng Ký Hội Viên Thành Công ✦
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003B95] mb-3">
              Hồ Sơ Đã Được Tiếp Nhận
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-6">
              Kính gửi Anh/Chị <strong>{registeredData?.fullName}</strong> (Đại diện cho{" "}
              <strong>{registeredData?.companyName}</strong>), đơn đăng ký gia nhập Hiệp hội CEO
              1983 của Anh/Chị đã được tiếp nhận thành công vào hệ thống.
            </p>

            {/* Email Dispatch Confirmation Highlight */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 mb-6 text-left flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-950 space-y-1">
                <p className="font-bold text-emerald-900">
                  ✉️ Thư Cảm Ơn & Xác Nhận Tiếp Nhận Đã Được Gửi!
                </p>
                <p className="text-emerald-800">
                  Hệ thống đã tự động gửi email cảm ơn kèm mã biên nhận hồ sơ tới hòm thư{" "}
                  <strong className="font-mono text-emerald-950">{registeredData?.email}</strong>. Quý Doanh nhân vui lòng kiểm tra hộp thư đến (Inbox / Spam).
                </p>
              </div>
            </div>

            {/* Information Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-left text-sm space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Doanh nghiệp:</span>
                <span className="font-bold text-slate-800">{registeredData?.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Người đại diện:</span>
                <span className="font-bold text-slate-800">{registeredData?.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Email nhận tài khoản:</span>
                <span className="font-mono font-bold text-[#003B95]">{registeredData?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <span className="font-bold text-slate-800">{registeredData?.phone}</span>
              </div>
              {registeredData?.notes && (
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Lời nhắn gửi:</span>
                  <span className="font-medium text-slate-700 italic max-w-xs text-right truncate">
                    {registeredData.notes}
                  </span>
                </div>
              )}
            </div>

            {/* Process Notice */}
            <div className="bg-blue-50 border-l-4 border-[#003B95] p-4 rounded-r-xl text-left text-xs sm:text-sm text-[#003B95] mb-8">
              <p className="font-bold mb-1">📌 Quy trình thẩm định & cấp tài khoản hội viên:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Ban Thành Viên Hiệp hội CEO 1983 sẽ thẩm định hồ sơ trong vòng 24 giờ.</li>
                <li>
                  Khi được phê duyệt, hệ thống sẽ <strong>tự động gửi email</strong> chứa tên đăng nhập
                  và mật khẩu kích hoạt tới hòm thư <strong>{registeredData?.email}</strong>.
                </li>
                <li>Anh/Chị có thể sử dụng thông tin đó để đăng nhập vào App Hiệp Hội.</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-sm shadow-md transition-all"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                Khám phá Website: ceo1983.com
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="/association/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
              >
                Cổng Đăng Nhập App
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F9] py-8 sm:py-12 px-3 sm:px-6 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Branding Card - Clean CEO 1983 Brand */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          {/* Top CEO1983 Navy Accent Strip */}
          <div className="h-3.5 bg-[#003B95]" />

          <div className="p-6 sm:p-8">
            {/* Clean Brand Header: Logo + Title */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
                <img
                  src="/ceo1983-logo.png"
                  alt="CEO 1983"
                  className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#003B95] text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span>✦ Hiệp Hội Doanh Nghiệp CEO 1983 ✦</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#003B95] tracking-tight">
                    Đơn Đăng Ký Hội Viên CEO 1983
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                    Cổng Tiếp Nhận Hồ Sơ Gia Nhập — Ban Thành Viên & Kết Nối
                  </p>
                </div>
              </div>

              {/* Official Website Link Badge */}
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B95] text-xs font-bold border border-blue-200 transition-colors shrink-0 shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>ceo1983.com</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
              Kính chào Quý Doanh nhân. Vui lòng cung cấp đầy đủ thông tin pháp nhân doanh nghiệp và người đại diện bên dưới để Ban Thành Viên tiếp nhận, thẩm định hồ sơ và cấp tài khoản hội viên chính thức.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <span className="text-rose-500 font-semibold">* Mục bắt buộc</span>
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Bảo mật thông tin doanh nghiệp theo tiêu chuẩn Hiệp hội
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#003B95] flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                1. Thông tin người đại diện doanh nghiệp
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin cá nhân của lãnh đạo đại diện doanh nghiệp tham gia sinh hoạt CLB
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Họ và tên người đại diện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Số điện thoại di động <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="0983xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email nhận tài khoản <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ceo@tencongty.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mật khẩu và thông báo phê duyệt sẽ được gửi về email này
                </p>
              </div>

              {/* Position - để mỗi label chức danh */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Chức danh <span className="text-rose-500">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                >
                  <option value="Chủ tịch HĐQT / Sáng lập viên">Chủ tịch HĐQT / Sáng lập viên</option>
                  <option value="Tổng Giám Đốc / CEO">Tổng Giám Đốc / CEO</option>
                  <option value="Phó Tổng Giám Đốc / COO">Phó Tổng Giám Đốc / COO</option>
                  <option value="Giám Đốc Điều Hành">Giám Đốc Điều Hành</option>
                  <option value="Giám Đốc Chức Năng">Giám Đốc Chức Năng</option>
                  <option value="Chủ hộ kinh doanh">Chủ hộ kinh doanh / Cá nhân</option>
                </select>
              </div>

              {/* Ngày tháng năm sinh - Sửa label và điền ngày tháng năm sinh */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Ngày tháng năm sinh (dd/mm/yyyy)
                </label>
                <StandardDateInput
                  value={birthDate}
                  placeholder="dd/mm/yyyy (VD: 15/08/1983)"
                  onChange={(iso) => setBirthDate(iso)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Company Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#003B95] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                2. Thông tin pháp nhân / Doanh nghiệp
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin công ty để kết nối giao thương trong danh bạ hội viên
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tên doanh nghiệp / Công ty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công ty Cổ phần Công nghệ & Đầu tư ViOne"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>

              {/* Staff Size */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Quy mô nhân sự
                </label>
                <select
                  value={staffSize}
                  onChange={(e) => setStaffSize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                >
                  <option value="Dưới 10 nhân sự">Dưới 10 nhân sự</option>
                  <option value="10 - 50 nhân sự">10 - 50 nhân sự</option>
                  <option value="50 - 200 nhân sự">50 - 200 nhân sự</option>
                  <option value="Trên 200 nhân sự">Trên 200 nhân sự</option>
                </select>
              </div>

              {/* Industry */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Ngành nghề hoạt động chính <span className="text-rose-500">*</span>
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50 mb-2"
                >
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>

                {industry === "ind.other" && (
                  <input
                    type="text"
                    placeholder="Nhập tên ngành nghề hoạt động cụ thể..."
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                  />
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Địa chỉ trụ sở công ty <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, đường, phường, quận/huyện, tỉnh/thành phố"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Website / Fanpage công ty
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="https://tencongty.vn"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Lời nhắn - không bắt buộc (not required) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Lời nhắn gửi tới CLB <span className="text-slate-400 text-xs font-normal">(Không bắt buộc)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Gợi ý, mong muốn hoặc chia sẻ thêm với Ban Điều Hành CLB..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Bottom Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <a
              href="https://ceo1983.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#003B95] transition-colors"
            >
              <Globe className="w-4 h-4 text-amber-500" />
              Website chính thức: <strong>ceo1983.com</strong>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>Đang gửi hồ sơ...</>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  Gửi Đơn Đăng Ký Gia Nhập
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-6 pb-12 space-y-1">
          <p className="font-semibold text-slate-600">CLB DOANH NHÂN 1983</p>
          <p>Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</p>
          <p>
            Cổng thông tin chính thức:{" "}
            <a
              href="https://ceo1983.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#003B95] hover:underline"
            >
              ceo1983.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
