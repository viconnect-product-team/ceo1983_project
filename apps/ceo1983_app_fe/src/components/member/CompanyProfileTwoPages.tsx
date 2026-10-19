import React, { useRef, useState } from "react";
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  ExternalLink,
  Pencil,
  FileUp,
  Users,
  Briefcase,
  FileCode,
  RotateCcw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export interface CompanyProfile2PageData {
  // ── 8 TRƯỜNG CHÍNH THEO YÊU CẦU ──
  logoUrl?: string | null;
  companyName: string;
  aboutUs: string;
  industry: string;
  personnelCompetence: string;
  website: string;
  hotline: string;
  officeAddress: string;

  // ── 2 ẢNH HÌNH HỌC (TAM GIÁC & NỬA HÌNH THOI) TRÊN NỀN TRẮNG ──
  triangleImageUrl?: string | null;
  halfDiamondImageUrl?: string | null;

  // ── CÁC TRƯỜNG TƯƠNG THÍCH PHỤ ──
  coverUrl?: string | null;
  avatarUrl?: string | null;
  leaderName?: string;
  leaderTitle?: string;
  memberCode?: string;
  slogan?: string;
  email?: string;
  taxCode?: string;
  coreValues?: Array<{ title: string; desc: string }>;
  keyServices?: Array<{ title: string; desc: string; isPrimary?: boolean }>;
  preferentialPolicy?: string;
  workflowSteps?: string[];
  companyProfileUrl?: string | null;
  companyProfileName?: string | null;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile2PageData = {
  logoUrl: "/ceo1983-logo.png",
  companyName: "CÔNG TY CỔ PHẦN CÔNG NGHỆ & THƯƠNG MẠI CEO 1983",
  aboutUs:
    "Được sáng lập bởi đội ngũ doanh nhân tâm huyết thế hệ 1983, chúng tôi ra đời với sứ mệnh mang đến những giải pháp công nghệ và dịch vụ B2B chất lượng cao. Doanh nghiệp cam kết đồng hành cùng đối tác tối ưu hóa chi phí vận hành, nâng cao hiệu suất và kiến tạo giá trị tăng trưởng bền vững.",
  industry: "Công nghệ thông tin, Chuyển đổi số doanh nghiệp & Xúc tiến thương mại B2B",
  personnelCompetence:
    "Quy mô hơn 50+ nhân sự chính thức gồm các kỹ sư giải pháp, chuyên gia công nghệ và cố vấn quản trị doanh nghiệp hơn 10+ năm kinh nghiệm thực chiến.",
  website: "https://ceo1983club.com",
  hotline: "0983 1983 83",
  officeAddress: "Tòa nhà CEO 1983 Tower, Cầu Giấy, TP. Hà Nội",

  // 2 ảnh mặc định chất lượng cao cho hình khối
  triangleImageUrl:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
  halfDiamondImageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",

  leaderName: "Lãnh đạo Doanh nghiệp",
  leaderTitle: "Chủ tịch / Tổng Giám đốc",
  memberCode: "CEO1983-VIP",
  slogan: "Giải pháp công nghệ số tối ưu & Kết nối chuỗi giá trị cho doanh nghiệp",
  email: "lienhe@ceo1983club.com",
};

interface CompanyProfileTwoPagesProps {
  data: Partial<CompanyProfile2PageData>;
  canEdit?: boolean;
  onEdit?: () => void;
  onUploadFile?: () => void;
  onRemoveUploadedFile?: () => void;
  className?: string;
}

export function CompanyProfileTwoPages({
  data,
  canEdit = false,
  onEdit,
  onUploadFile,
  onRemoveUploadedFile,
  className = "",
}: CompanyProfileTwoPagesProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // 8 trường thông tin chính
  const companyName = data.companyName?.trim() || DEFAULT_COMPANY_PROFILE.companyName;
  const logoUrl = data.logoUrl || DEFAULT_COMPANY_PROFILE.logoUrl;
  const aboutUs = data.aboutUs?.trim() || DEFAULT_COMPANY_PROFILE.aboutUs;
  const industry =
    data.industry?.trim() ||
    (data.keyServices && data.keyServices.length > 0
      ? data.keyServices.map((s) => s.title).join(", ")
      : DEFAULT_COMPANY_PROFILE.industry);
  const personnelCompetence =
    data.personnelCompetence?.trim() || DEFAULT_COMPANY_PROFILE.personnelCompetence;
  const website = data.website?.trim() || DEFAULT_COMPANY_PROFILE.website;
  const hotline = data.hotline?.trim() || DEFAULT_COMPANY_PROFILE.hotline;
  const officeAddress = data.officeAddress?.trim() || DEFAULT_COMPANY_PROFILE.officeAddress;

  // 2 ảnh hình học
  const triangleImageUrl =
    data.triangleImageUrl ||
    data.coverUrl ||
    DEFAULT_COMPANY_PROFILE.triangleImageUrl;
  const halfDiamondImageUrl =
    data.halfDiamondImageUrl ||
    DEFAULT_COMPANY_PROFILE.halfDiamondImageUrl;

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (data.companyProfileUrl) {
      window.open(data.companyProfileUrl, "_blank");
      toast.success("Đang mở file Profile đính kèm của doanh nghiệp!");
      return;
    }

    setDownloading(true);
    toast.info("Đang tạo bản in hồ sơ năng lực doanh nghiệp...");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      if (!profileRef.current) throw new Error("Canvas container missing");

      const canvas = await html2canvas(profileRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Ho_So_Nang_Luc_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      toast.success("Xuất hồ sơ năng lực PDF thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể xuất PDF: " + (err?.message || "Lỗi render canvas"));
    } finally {
      setDownloading(false);
    }
  };

  // ── TRƯỜNG HỢP 1: NGƯỜI DÙNG CÓ FILE PROFILE RIÊNG TẢI LÊN ──
  if (data.companyProfileUrl) {
    return (
      <div className={`mt-4 rounded-3xl border-2 border-[#003B95]/30 bg-white p-5 text-slate-900 shadow-xl ${className}`}>
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-[#003B95] border border-blue-200">
              <FileText className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-[#003B95] uppercase tracking-wider">
                  Hồ Sơ Năng Lực (Tệp Đính Kèm)
                </h4>
                <span className="rounded-md bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  File riêng
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-md mt-0.5">
                {data.companyProfileName || "Tài liệu hồ sơ năng lực chính thức"}
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              {onUploadFile && (
                <button
                  type="button"
                  onClick={onUploadFile}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11.5px] font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  title="Tải lên tệp mới"
                >
                  <FileUp className="size-3.5 text-[#003B95]" />
                  <span className="hidden sm:inline">Thay file khác</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* File Preview Card & Actions */}
        <div className="my-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-[#003B95] flex items-center justify-center text-white shadow-md shrink-0">
              <FileCode className="size-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 line-clamp-1">
                {data.companyProfileName || `${companyName} - Profile.pdf`}
              </div>
              <p className="text-xs text-slate-500">
                Tài liệu đã được tải lên lưu trữ an toàn & liên kết với danh thiếp hội viên.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={data.companyProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003B95] text-white font-bold text-xs shadow-md shadow-blue-900/20 hover:bg-[#002B70] active:scale-95 transition cursor-pointer"
            >
              <Eye className="size-4" />
              <span>Xem File</span>
            </a>
            <a
              href={data.companyProfileUrl}
              download
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Tải xuống tệp"
            >
              <Download className="size-4" />
            </a>
          </div>
        </div>

        {canEdit && onRemoveUploadedFile && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bạn muốn dùng mẫu Hồ sơ số hóa trực tiếp?</span>
            <button
              type="button"
              onClick={onRemoveUploadedFile}
              className="text-[#003B95] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Dùng mẫu chuẩn nền trắng</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── TRƯỜNG HỢP 2: HỒ SƠ NĂNG LỰC NỀN TRẮNG CHUẨN 8 TRƯỜNG & 2 ẢNH HÌNH HỌC ──
  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-[#003B95] border border-blue-200 shrink-0">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#003B95]">
              HỒ SƠ NĂNG LỰC DOANH NGHIỆP
            </h3>
            <p className="text-[11px] text-slate-500">
              Ấn phẩm số hóa chuẩn mực • CLB Doanh Nhân CEO 1983
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Chỉnh sửa thông tin hồ sơ"
            >
              <Pencil className="size-3.5" />
              <span>Sửa hồ sơ</span>
            </button>
          )}

          {canEdit && onUploadFile && (
            <button
              type="button"
              onClick={onUploadFile}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Tải tệp PDF riêng để thay thế"
            >
              <FileUp className="size-3.5 text-[#003B95]" />
              <span className="hidden sm:inline">Tải PDF riêng</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            title="Tải bản in PDF"
          >
            <Download className="size-3.5 text-[#003B95]" />
            <span>{downloading ? "Đang xuất..." : "Tải PDF"}</span>
          </button>
        </div>
      </div>

      {/* ── BẢN CANVAS HỒ SƠ NĂNG LỰC NỀN TRẮNG HOÀN TOÀN ── */}
      <div
        ref={profileRef}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 p-6 sm:p-10 shadow-lg space-y-8"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Phù hiệu bảo chứng góc trên */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#003B95]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              HỒ SƠ NĂNG LỰC DOANH NGHIỆP • CEO 1983
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#003B95] text-[10px] font-black uppercase">
            <CheckCircle2 className="size-3 text-[#003B95]" />
            Xác thực chính thức
          </span>
        </div>

        {/* ── PHẦN 1: LOGO DOANH NGHIỆP & TÊN DOANH NGHIỆP KÈM ẢNH HÌNH TAM GIÁC ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Cột trái (7/12): Logo & Tên Doanh Nghiệp */}
          <div className="md:col-span-7 space-y-4">
            {/* 1. Logo doanh nghiệp */}
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl p-2 bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/ceo1983-logo.png";
                    }}
                  />
                ) : (
                  <Building2 className="size-10 text-[#003B95]" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                  Thành viên chính thức
                </span>
                <p className="text-xs text-slate-500 font-medium">CLB Doanh Nhân CEO 1983</p>
              </div>
            </div>

            {/* 2. Tên doanh nghiệp */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#003B95] uppercase tracking-tight leading-tight">
                {companyName}
              </h1>
              <div className="h-1.5 w-20 bg-gradient-to-r from-[#003B95] to-amber-500 rounded-full mt-2" />
            </div>
          </div>

          {/* Cột phải (5/12): ẢNH 1 - THEO HÌNH TAM GIÁC TRÊN NỀN TRẮNG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Vòng nền phát sáng nhẹ */}
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 overflow-hidden bg-gradient-to-br from-[#003B95] to-amber-500 p-[3px] shadow-lg transition-transform duration-300 group-hover:scale-102"
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                }}
              >
                <div
                  className="w-full h-full bg-slate-100 overflow-hidden"
                  style={{
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  }}
                >
                  <img
                    src={triangleImageUrl || undefined}
                    alt="Ảnh dự án / trụ sở tam giác"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80";
                    }}
                  />
                </div>
              </div>
              <span className="mt-2 text-[10.5px] font-semibold text-slate-400 block text-center italic">
                (Hình ảnh biểu trưng kiến trúc & năng lực)
              </span>
            </div>
          </div>
        </div>

        {/* ── PHẦN 2: GIỚI THIỆU DOANH NGHIỆP ── */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#003B95]">
            <Building2 className="size-4 shrink-0 text-[#003B95]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              3. Giới thiệu doanh nghiệp
            </h3>
          </div>
          <p className="text-[13.5px] sm:text-[14px] text-slate-700 leading-relaxed text-justify whitespace-pre-line">
            {aboutUs}
          </p>
        </div>

        {/* ── PHẦN 3: LĨNH VỰC HOẠT ĐỘNG ── */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#003B95]">
            <Briefcase className="size-4 shrink-0 text-[#003B95]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#003B95]">
              4. Lĩnh vực hoạt động
            </h3>
          </div>
          <p className="text-[13.5px] sm:text-[14px] font-semibold text-slate-800 leading-relaxed">
            {industry}
          </p>
        </div>

        {/* ── PHẦN 4: NHÂN SỰ & ẢNH 2 (NỬA HÌNH THOI Ở DƯỚI NỀN TRẮNG) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Cột trái (7/12): 5. Nhân sự */}
          <div className="md:col-span-7 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#003B95]">
              <Users className="size-4 shrink-0 text-[#003B95]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                5. Quy mô & Năng lực nhân sự
              </h3>
            </div>
            <p className="text-[13.5px] sm:text-[14px] text-slate-700 leading-relaxed">
              {personnelCompetence}
            </p>
          </div>

          {/* Cột phải (5/12): ẢNH 2 - NỬA HÌNH THOI Ở DƯỚI NỀN TRẮNG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Nửa hình thoi nhọn chúc xuống dưới cực kỳ chuẩn hình học */}
              <div
                className="w-48 h-36 sm:w-56 sm:h-40 overflow-hidden bg-gradient-to-r from-amber-500 to-[#003B95] p-[3px] shadow-lg transition-transform duration-300 group-hover:scale-102"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                }}
              >
                <div
                  className="w-full h-full bg-slate-100 overflow-hidden"
                  style={{
                    clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  }}
                >
                  <img
                    src={halfDiamondImageUrl || undefined}
                    alt="Ảnh đội ngũ / nửa hình thoi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80";
                    }}
                  />
                </div>
              </div>
              <span className="mt-2 text-[10.5px] font-semibold text-slate-400 block text-center italic">
                (Hình ảnh nửa hình thoi đội ngũ thực thi)
              </span>
            </div>
          </div>
        </div>

        {/* ── PHẦN 5: THÔNG TIN LIÊN HỆ (6. WEBSITE, 7. HOTLINE, 8. ĐỊA CHỈ) ── */}
        <div className="pt-4 border-t-2 border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            Thông tin liên hệ & Kết nối
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 6. Website */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-[#003B95]/40 transition">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Globe className="size-4 text-[#003B95]" />
                <span>6. Website</span>
              </div>
              {website ? (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs sm:text-sm font-bold text-[#003B95] hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa cập nhật</span>
              )}
            </div>

            {/* 7. Hotline */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-amber-500/40 transition">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Phone className="size-4 text-amber-600" />
                <span>7. Hotline</span>
              </div>
              {hotline ? (
                <a
                  href={`tel:${hotline.replace(/\s+/g, "")}`}
                  className="text-xs sm:text-sm font-black text-amber-600 hover:underline truncate block"
                >
                  {hotline}
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa cập nhật</span>
              )}
            </div>

            {/* 8. Địa chỉ */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-[#003B95]/40 transition sm:col-span-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <MapPin className="size-4 text-rose-600" />
                <span>8. Địa chỉ</span>
              </div>
              <p className="text-xs sm:text-[12.5px] font-semibold text-slate-700 leading-snug line-clamp-2">
                {officeAddress || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer ghi nhận xác thực bản quyền */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Hệ sinh thái Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA)</span>
          <span className="font-mono">ceo1983club.com</span>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfileTwoPages;
