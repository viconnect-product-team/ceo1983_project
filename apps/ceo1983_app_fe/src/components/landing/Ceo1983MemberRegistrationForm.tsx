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

export function Ceo1983MemberRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("Tổng Giám Đốc / CEO");
  const [birthYear, setBirthYear] = useState("1983");
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [industry, setIndustry] = useState("ind.trade");
  const [customIndustry, setCustomIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [staffSize, setStaffSize] = useState("10 - 50 nhân sự");
  const [boardWish, setBoardWish] = useState("Ban Thiện Nguyện & An Sinh Xã Hội");
  const [needs, setNeeds] = useState("");
  const [offers, setOffers] = useState("");
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

  const boards = [
    {
      id: "Ban Thiện Nguyện & An Sinh Xã Hội",
      title: "Ban Thiện Nguyện & An Sinh Xã Hội",
      desc: "Tổ chức các hoạt động thiện nguyện, an sinh xã hội, xây cầu, trường học và lan tỏa giá trị nhân văn của CLB",
      highlight: true,
    },
    {
      id: "Ban Sự Kiện & Hội Nghị",
      title: "Ban Sự Kiện & Hội Nghị",
      desc: "Tổ chức diễn đàn, caravan, gala, các buổi kết nối giao lưu quy mô",
    },
    {
      id: "Ban Xúc Tiến Thương Mại & Đầu Tư",
      title: "Ban Xúc Tiến Thương Mại & Đầu Tư",
      desc: "Xúc tiến chéo cơ hội kinh doanh B2B, gọi vốn, mở rộng thị trường",
    },
    {
      id: "Ban Truyền Thông & Marketing",
      title: "Ban Truyền Thông & Marketing",
      desc: "Định vị thương hiệu hội viên, truyền thông đa kênh, sự kiện báo chí",
    },
    {
      id: "Ban Thành Viên & Kết Nối",
      title: "Ban Thành Viên & Kết Nối",
      desc: "Thẩm định, tiếp đón và hỗ trợ hội viên mới hội nhập",
    },
    {
      id: "Ban Tài Chính & Tài Trợ",
      title: "Ban Tài Chính & Tài Trợ",
      desc: "Quản lý nguồn lực tài chính và phát triển gói tài trợ đồng hành",
    },
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
      const res = await fetchNestApi("/members/public-register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          position,
          birthYear,
          companyName: companyName.trim(),
          taxCode: taxCode.trim(),
          industry: finalIndustry,
          address: address.trim(),
          website: website.trim(),
          staffSize,
          boardWish,
          needs: needs.trim(),
          offers: offers.trim(),
          notes: notes.trim(),
        }),
      });

      setRegisteredData({
        fullName,
        companyName,
        email,
        phone,
        boardWish,
      });
      setSubmitted(true);
      toast.success("Hồ sơ đăng ký gia nhập đã được tiếp nhận thành công!");
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
              ✦ Đăng Ký Gia Nhập Thành Công ✦
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003B95] mb-3">
              Hồ Sơ Đã Được Tiếp Nhận
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              Kính gửi Anh/Chị <strong>{registeredData?.fullName}</strong> (Đại diện cho{" "}
              <strong>{registeredData?.companyName}</strong>), đơn đăng ký gia nhập CLB Doanh Nhân
              CEO 1983 của Anh/Chị đã được lưu vào hệ thống xét duyệt.
            </p>

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
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nguyện vọng tham gia:</span>
                <span className="font-bold text-amber-600">{registeredData?.boardWish}</span>
              </div>
            </div>

            {/* Process Notice */}
            <div className="bg-blue-50 border-l-4 border-[#003B95] p-4 rounded-r-xl text-left text-xs sm:text-sm text-[#003B95] mb-8">
              <p className="font-bold mb-1">📌 Quy trình phê duyệt & cấp tài khoản:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Ban Thành Viên CLB CEO 1983 sẽ thẩm định hồ sơ trong vòng 24 giờ.</li>
                <li>
                  Khi được phê duyệt, hệ thống sẽ <strong>tự động gửi email</strong> chứa tên đăng nhập
                  và mật khẩu ngẫu nhiên tới hòm thư <strong>{registeredData?.email}</strong>.
                </li>
                <li>Anh/Chị có thể sử dụng thông tin đó để đăng nhập vào App Hiệp Hội CEO 1983.</li>
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
        {/* Header Branding Card - Google Form Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          {/* Top CEO1983 Navy Accent Strip */}
          <div className="h-3.5 bg-[#003B95]" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#003B95] text-amber-400 font-black text-xl flex items-center justify-center shadow-md">
                  83
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    HanoiBA · CLB Doanh Nhân 1983
                  </div>
                  <div className="text-sm font-semibold text-slate-500">
                    Kết nối Đồng Niên — Gắn kết Thương Trường
                  </div>
                </div>
              </div>

              {/* Official Website Badge Link */}
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003B95] text-xs font-bold border border-blue-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                ceo1983.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#003B95] tracking-tight mb-2">
              Đơn Đăng Ký Gia Nhập CLB Doanh Nhân CEO 1983
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Chào mừng Quý Doanh nhân quan tâm và mong muốn tham gia ngôi nhà chung CEO 1983. Vui lòng
              điền đầy đủ thông tin bên dưới để Ban Thành Viên tiếp nhận, thẩm định và cấp tài khoản
              thành viên chính thức.
            </p>

            {/* Mobile Website Banner Link */}
            <div className="sm:hidden mb-4">
              <a
                href="https://ceo1983.com"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 text-[#003B95] text-xs font-bold border border-blue-200"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                Xem cổng thông tin CLB: <strong>ceo1983.com</strong>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <span>* Mục bắt buộc</span>
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

              {/* Position */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Chức danh / Vị trí <span className="text-rose-500">*</span>
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

              {/* Birth Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Năm sinh <span className="text-slate-400 text-xs font-normal">(Ưu tiên đồng niên 1983)</span>
                </label>
                <input
                  type="text"
                  placeholder="1983"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
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

              {/* Tax Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mã số thuế (MST)
                </label>
                <input
                  type="text"
                  placeholder="010xxxxxxx"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>

              {/* Staff Size */}
              <div>
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
            </div>
          </div>

          {/* SECTION 3: Board Wish & Orientation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#003B95] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-500" />
                3. Nguyện vọng sinh hoạt Ban chuyên môn & Kết nối
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lựa chọn Ban chuyên môn để sinh hoạt và định hướng chia sẻ giá trị trong CLB
              </p>
            </div>

            {/* Board Selection Radios */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Nguyện vọng tham gia Ban chuyên môn: <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {boards.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      boardWish === b.id
                        ? "border-[#003B95] bg-blue-50/40 ring-1 ring-[#003B95]"
                        : "border-slate-200 hover:bg-slate-50"
                    } ${b.highlight ? "relative overflow-hidden" : ""}`}
                  >
                    <input
                      type="radio"
                      name="boardWish"
                      value={b.id}
                      checked={boardWish === b.id}
                      onChange={(e) => setBoardWish(e.target.value)}
                      className="mt-1 text-[#003B95] focus:ring-[#003B95]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{b.title}</span>
                        {b.highlight && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            ★ Ban Mới Đề Xuất
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Offerings & Needs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sản phẩm / Dịch vụ thế mạnh cung cấp:
                </label>
                <textarea
                  rows={3}
                  placeholder="Những giải pháp, sản phẩm doanh nghiệp có thể cung cấp cho hội viên CLB..."
                  value={offers}
                  onChange={(e) => setOffers(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nhu cầu tìm kiếm đối tác / Kết nối:
                </label>
                <textarea
                  rows={3}
                  placeholder="Cần tìm đối tác trong ngành nghề nào, mở rộng thị trường ra sao..."
                  value={needs}
                  onChange={(e) => setNeeds(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Lời nhắn gửi tới Ban Điều Hành CLB CEO 1983:
              </label>
              <textarea
                rows={2}
                placeholder="Gợi ý, mong muốn hoặc chia sẻ thêm với CLB..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003B95] focus:border-transparent text-sm bg-slate-50/50"
              />
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
          <p className="font-semibold text-slate-600">CLB DOANH NHÂN CEO 1983 (HanoiBA)</p>
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
