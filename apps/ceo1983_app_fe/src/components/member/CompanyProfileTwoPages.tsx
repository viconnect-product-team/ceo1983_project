import React, { useRef, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Pencil,
  FileUp,
  Zap,
  Target,
  Users,
  Compass,
  ArrowRight,
  FileCode,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export interface CompanyProfile2PageData {
  // TRANG 1: ĐỊNH VỊ THƯƠNG HIỆU & NĂNG LỰC CỐT LÕI
  companyName: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  avatarUrl?: string | null;
  leaderName?: string;
  leaderTitle?: string;
  memberCode?: string;
  slogan: string;
  aboutUs: string;
  coreValues: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string }
  ];
  keyServices: Array<{
    title: string;
    desc: string;
    isPrimary?: boolean;
  }>;

  // TRANG 2: THẾ MẠNH CẠNH TRANH & THÔNG TIN LIÊN HỆ
  personnelCompetence: string;
  preferentialPolicy: string;
  workflowSteps: [string, string, string, string];
  taxCode: string;
  officeAddress: string;
  hotline: string;
  email: string;
  website: string;

  // File riêng đã tải lên (ghi đè template nếu có)
  companyProfileUrl?: string | null;
  companyProfileName?: string | null;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile2PageData = {
  companyName: "CÔNG TY CỔ PHẦN CÔNG NGHỆ & THƯƠNG MẠI CEO 1983",
  slogan: "Giải pháp công nghệ số tối ưu & Kết nối chuỗi giá trị cho doanh nghiệp",
  leaderName: "Lãnh đạo Doanh nghiệp",
  leaderTitle: "Chủ tịch / Tổng Giám đốc",
  memberCode: "CEO1983-VIP",
  aboutUs:
    "Được sáng lập bởi đội ngũ doanh nhân tâm huyết thế hệ 1983, chúng tôi ra đời với sứ mệnh mang đến những giải pháp công nghệ và dịch vụ B2B chất lượng cao. Doanh nghiệp cam kết đồng hành cùng khách hàng tối ưu hóa chi phí vận hành, nâng cao hiệu suất và kiến tạo giá trị tăng trưởng bền vững.",
  coreValues: [
    {
      title: "TỐC ĐỘ",
      desc: "Xử lý linh hoạt, phản hồi tức thì và cam kết bàn giao chuẩn tiến độ.",
    },
    {
      title: "CHẤT LƯỢNG",
      desc: "Chuẩn mực khắt khe, tối ưu trải nghiệm và bảo chứng uy tín thực nghiệm.",
    },
    {
      title: "MINH BẠCH",
      desc: "Rõ ràng trong chi phí, chuẩn chỉ trong cam kết và đồng hành lâu dài.",
    },
  ],
  keyServices: [
    {
      title: "Chuyển Đổi Số & Quản Trị Doanh Nghiệp Toàn Diện",
      desc: "Tích hợp phần mềm ERP/CRM, tự động hóa quy trình nghiệp vụ và báo cáo thông minh cho SME.",
      isPrimary: true,
    },
    {
      title: "Tư Vấn Chiến Lược & Xúc Tiến Thương Mại B2B",
      desc: "Mở rộng kênh phân phối, xúc tiến giao thương và kết nối đối tác trong mạng lưới hiệp hội.",
      isPrimary: false,
    },
    {
      title: "Cung Ứng Dịch Vụ & Sản Phẩm Đa Ngành Chất Lượng Cao",
      desc: "Gói giải pháp trọn gói với chính sách chiết khấu và bảo hành ưu việt riêng cho hội viên.",
      isPrimary: false,
    },
  ],
  personnelCompetence:
    "Đội ngũ sáng lập và chuyên gia chủ chốt sở hữu hơn 15+ năm kinh nghiệm thực chiến đa ngành, từng dẫn dắt nhiều dự án quy mô lớn và sở hữu các chứng chỉ quản trị, công nghệ quốc tế uy tín.",
  preferentialPolicy:
    "Cam kết 100% về tiến độ và chất lượng bàn giao, bảo hành hỗ trợ kỹ thuật 24/7 và áp dụng mức giá ưu đãi đặc quyền tối ưu nhất cho khách hàng, đối tác trong hệ sinh thái CEO 1983.",
  workflowSteps: [
    "Tiếp nhận thông tin",
    "Tư vấn giải pháp",
    "Triển khai",
    "Bàn giao & Bảo hành",
  ],
  taxCode: "0108319838",
  officeAddress: "Tòa nhà CEO 1983 Tower, Cầu Giấy, TP. Hà Nội",
  hotline: "0983 1983 83",
  email: "lienhe@ceo1983club.com",
  website: "https://ceo1983club.com",
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
  const [activeTab, setActiveTab] = useState<"page1" | "page2" | "all">("all");

  const companyName = data.companyName?.trim() || DEFAULT_COMPANY_PROFILE.companyName;
  const slogan = data.slogan?.trim() || DEFAULT_COMPANY_PROFILE.slogan;
  const aboutUs = data.aboutUs?.trim() || DEFAULT_COMPANY_PROFILE.aboutUs;
  const coreValues = (data.coreValues && data.coreValues.length === 3)
    ? data.coreValues
    : DEFAULT_COMPANY_PROFILE.coreValues;
  const keyServices = (data.keyServices && data.keyServices.length > 0)
    ? data.keyServices
    : DEFAULT_COMPANY_PROFILE.keyServices;

  const personnelCompetence = data.personnelCompetence?.trim() || DEFAULT_COMPANY_PROFILE.personnelCompetence;
  const preferentialPolicy = data.preferentialPolicy?.trim() || DEFAULT_COMPANY_PROFILE.preferentialPolicy;
  const workflowSteps = (data.workflowSteps && data.workflowSteps.length === 4)
    ? data.workflowSteps
    : DEFAULT_COMPANY_PROFILE.workflowSteps;

  const taxCode = data.taxCode?.trim() || DEFAULT_COMPANY_PROFILE.taxCode;
  const officeAddress = data.officeAddress?.trim() || DEFAULT_COMPANY_PROFILE.officeAddress;
  const hotline = data.hotline?.trim() || DEFAULT_COMPANY_PROFILE.hotline;
  const email = data.email?.trim() || DEFAULT_COMPANY_PROFILE.email;
  const website = data.website?.trim() || DEFAULT_COMPANY_PROFILE.website;

  const leaderName = data.leaderName || DEFAULT_COMPANY_PROFILE.leaderName;
  const leaderTitle = data.leaderTitle || DEFAULT_COMPANY_PROFILE.leaderTitle;
  const memberCode = data.memberCode || DEFAULT_COMPANY_PROFILE.memberCode;

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (data.companyProfileUrl) {
      window.open(data.companyProfileUrl, "_blank");
      toast.success("Đang mở file Profile đính kèm của doanh nghiệp!");
      return;
    }

    setDownloading(true);
    toast.info("Đang tạo bản in hồ sơ doanh nghiệp 2 trang...");
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
        backgroundColor: "#020b1c",
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

      pdf.save(`Profile_DoanhNghiep_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      toast.success("Xuất hồ sơ doanh nghiệp PDF thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể xuất PDF: " + (err?.message || "Lỗi render canvas"));
    } finally {
      setDownloading(false);
    }
  };

  // ── TRƯỜNG HỢP 1: NGƯỜI DÙNG CÓ FILE PROFILE RIÊNG TẢI LÊN (GHI ĐÈ PROFILE MẶC ĐỊNH) ──
  if (data.companyProfileUrl) {
    return (
      <div className={`mt-4 rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-[#020b1c] via-[#051a3d] to-[#010917] p-5 text-white shadow-xl ${className}`}>
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <FileText className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Profile Doanh Nghiệp (File Tải Lên)
                </h4>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Ghi đè mặc định
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[280px] sm:max-w-md mt-0.5">
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
                  className="px-2.5 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-[11.5px] font-semibold text-white transition cursor-pointer flex items-center gap-1.5"
                  title="Tải lên tệp mới"
                >
                  <FileUp className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Thay file khác</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* File Preview Card & Actions */}
        <div className="my-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shrink-0">
              <FileCode className="size-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white line-clamp-1">
                {data.companyProfileName || `${companyName} - Profile.pdf`}
              </div>
              <p className="text-xs text-slate-400">
                Tài liệu đã được tải lên MinIO an toàn &amp; liên kết trực tiếp vào thẻ hội viên.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={data.companyProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Eye className="size-4" />
              <span>Xem / Mở File</span>
            </a>
            <a
              href={data.companyProfileUrl}
              download
              className="px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              title="Tải xuống tệp"
            >
              <Download className="size-4" />
            </a>
          </div>
        </div>

        {/* Toggle to digital 2-page template */}
        {canEdit && onRemoveUploadedFile && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Bạn muốn dùng mẫu Profile 2 Trang số hóa của hệ thống?</span>
            <button
              type="button"
              onClick={onRemoveUploadedFile}
              className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Chuyển sang mẫu Profile 2 Trang</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── TRƯỜNG HỢP 2: PROFILE 2 TRANG CHUẨN MỰC THEO ĐÚNG YÊU CẦU CỦA KHÁCH HÀNG ──
  return (
    <div className={`mt-4 space-y-4 ${className}`}>
      {/* Action Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#002255] via-[#003B95] to-[#0A192F] border border-amber-400/40 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-sm shrink-0">
            <Sparkles className="size-5 font-black" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
              HỒ SƠ NĂNG LỰC DOANH NGHIỆP
            </h3>
            <p className="text-[11px] text-slate-300">
              Profile 2 Trang Chuẩn B2B • Bảo chứng CLB CEO 1983
            </p>
          </div>
        </div>

        {/* Action Buttons: Edit, Upload File, Download */}
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Chỉnh sửa thông tin profile"
            >
              <Pencil className="size-3.5" />
              <span>Sửa Profile</span>
            </button>
          )}

          {canEdit && onUploadFile && (
            <button
              type="button"
              onClick={onUploadFile}
              className="px-3 py-1.5 rounded-xl border border-amber-400/60 bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Tải tệp profile riêng (PDF/ảnh) để ghi đè"
            >
              <FileUp className="size-3.5 text-amber-400" />
              <span>Tải file riêng</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Tải bản in PDF"
          >
            <Download className="size-3.5 text-amber-300" />
            <span className="hidden sm:inline">{downloading ? "..." : "Tải PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Page Canvas Container */}
      <div ref={profileRef} className="space-y-4">
        {/* =========================================================================
            • TRANG 1: ĐỊNH VỊ THƯƠNG HIỆU & NĂNG LỰC CỐT LÕI
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-[#020b1c] via-[#051a3d] to-[#010917] text-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,35,90,0.4)]">
          {/* Page Indicator Tag */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-400/20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-md">
              <Sparkles className="size-3" />
              TRANG 1: ĐỊNH VỊ THƯƠNG HIỆU &amp; NĂNG LỰC CỐT LÕI
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono font-bold text-amber-300/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                #{memberCode}
              </span>
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[10.5px] font-bold transition cursor-pointer"
                  title="Sửa thông tin Trang 1"
                >
                  <Pencil className="size-3" />
                  <span>Sửa</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. PHẦN ĐẦU (HEADER): Logo lớn, Tên đầy đủ công ty, Slogan định vị ngành nghề */}
          <div className="py-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Logo lớn */}
            <div className="relative size-20 sm:size-24 rounded-2xl p-1 bg-gradient-to-br from-amber-400 via-amber-200 to-yellow-500 shadow-2xl shrink-0">
              <div className="size-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-950 border border-white/20 flex items-center justify-center p-1.5">
                {data.logoUrl ? (
                  <img
                    src={data.logoUrl}
                    alt={companyName}
                    className="size-full object-contain"
                  />
                ) : (
                  <Building2 className="size-10 text-[#003B95] dark:text-amber-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-white shadow-md">
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>

            {/* Tên đầy đủ công ty & Slogan */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
                {companyName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-300 italic flex items-center justify-center sm:justify-start gap-1.5">
                <Target className="size-4 shrink-0 text-amber-400" />
                <span>"{slogan}"</span>
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
                <span className="font-semibold text-white">Đại diện: {leaderName}</span>
                <span className="text-amber-400/80">•</span>
                <span className="text-amber-300 font-medium">{leaderTitle}</span>
              </div>
            </div>
          </div>

          {/* 2. ĐẶC TRƯNG NĂNG LỰC 5.0: 4 CHỈ SỐ BẢO CHỨNG NHANH */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-amber-400/25 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <span className="text-amber-400 font-black text-sm sm:text-base flex items-center gap-1">
                <Zap className="size-4 text-amber-400" /> 24/7
              </span>
              <span className="text-[10.5px] font-bold text-white uppercase mt-0.5">Tốc độ & Linh hoạt</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-blue-400/25 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <span className="text-sky-400 font-black text-sm sm:text-base flex items-center gap-1">
                <Award className="size-4 text-sky-400" /> Chuẩn 5★
              </span>
              <span className="text-[10.5px] font-bold text-white uppercase mt-0.5">Chất lượng cao</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-emerald-400/25 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <span className="text-emerald-400 font-black text-sm sm:text-base flex items-center gap-1">
                <ShieldCheck className="size-4 text-emerald-400" /> 100%
              </span>
              <span className="text-[10.5px] font-bold text-white uppercase mt-0.5">Minh bạch cam kết</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-purple-400/25 flex flex-col items-center justify-center text-center backdrop-blur-md">
              <span className="text-purple-300 font-black text-sm sm:text-base flex items-center gap-1">
                <Users className="size-4 text-purple-400" /> CEO 1983
              </span>
              <span className="text-[10.5px] font-bold text-white uppercase mt-0.5">Bảo chứng CLB</span>
            </div>
          </div>

          {/* 3. VỀ CHÚNG TÔI (TINH GỌN 5.0) */}
          <div className="my-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-start gap-3">
            <div className="size-9 rounded-xl bg-amber-400/20 text-amber-400 grid place-items-center shrink-0 border border-amber-400/30">
              <Compass className="size-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-amber-400">
                SỨ MỆNH & ĐỊNH VỊ THƯƠNG HIỆU
              </div>
              <p className="text-xs text-slate-200 leading-snug line-clamp-3">
                {aboutUs}
              </p>
            </div>
          </div>

          {/* 4. SẢN PHẨM / GIẢI PHÁP MŨI NHỌN 5.0 (DẠNG THẺ HÌNH ẢNH TRỰC QUAN) */}
          <div className="my-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>GIẢI PHÁP &amp; SẢN PHẨM MŨI NHỌN 5.0</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Xúc tiến B2B
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {keyServices.map((srv, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition relative overflow-hidden ${
                    srv.isPrimary
                      ? "bg-gradient-to-br from-[#0a2558] via-[#051a3d] to-[#020b1c] border-amber-400/70 shadow-md ring-1 ring-amber-400/30"
                      : "bg-white/[0.04] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`grid size-9 place-items-center rounded-xl shrink-0 ${
                      srv.isPrimary ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "bg-white/10 text-amber-400"
                    }`}>
                      {srv.isPrimary ? <Sparkles className="size-4.5" /> : <CheckCircle2 className="size-4.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-black text-white truncate">
                          {srv.title}
                        </h5>
                        {srv.isPrimary && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide shrink-0">
                            Mũi nhọn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            • TRANG 2: THẾ MẠNH CẠNH TRANH, QUY TRÌNH & THÔNG TIN KẾT NỐI 5.0
           ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-blue-400/50 bg-gradient-to-br from-[#020b1c] via-[#041635] to-[#010917] text-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,35,90,0.4)]">
          {/* Page Indicator Tag */}
          <div className="flex items-center justify-between pb-3.5 border-b border-blue-400/20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 text-white shadow-md">
              <ShieldCheck className="size-3" />
              TRANG 2: NĂNG LỰC THỰC THI &amp; KẾT NỐI NHANH 5.0
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Xác Thực CLB
              </span>
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 text-[10.5px] font-bold transition cursor-pointer"
                  title="Sửa thông tin Trang 2"
                >
                  <Pencil className="size-3" />
                  <span>Sửa</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. THẾ MẠNH & CHÍNH SÁCH ĐỒNG HÀNH (THẺ 5.0) */}
          <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-blue-400/30 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wide">
                <span className="grid size-6 place-items-center rounded-lg bg-blue-500/20 text-blue-400">
                  <Users className="size-3.5" />
                </span>
                <span>Năng lực chuyên gia</span>
              </div>
              <p className="text-[11.5px] text-slate-200 leading-snug line-clamp-3">
                {personnelCompetence}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-amber-400/30 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                <span className="grid size-6 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
                  <ShieldCheck className="size-3.5" />
                </span>
                <span>Chính sách ưu việt B2B</span>
              </div>
              <p className="text-[11.5px] text-slate-200 leading-snug line-clamp-3">
                {preferentialPolicy}
              </p>
            </div>
          </div>

          {/* 2. QUY TRÌNH 5.0 (4 BƯỚC TINH GỌN TRỰC QUAN) */}
          <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                <span>QUY TRÌNH TRIỂN KHAI 5.0</span>
              </div>
              <span className="text-[9.5px] text-slate-400 font-medium">4 Bước Chuẩn Hóa</span>
            </div>

            {/* Sơ đồ ngang 4 bước */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
              {workflowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-center flex flex-col items-center justify-center space-y-1 group hover:border-amber-400/40 transition"
                >
                  <div className="size-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                    0{idx + 1}
                  </div>
                  <div className="text-[10.5px] font-bold text-white leading-tight">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TRUNG TÂM KẾT NỐI & LIÊN HỆ TRỰC TIẾP */}
          <div className="pt-3 border-t border-white/15 space-y-2.5">
            <div className="text-[10.5px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              <span>KẾT NỐI DOANH NGHIỆP TRỰC TIẾP</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Hotline */}
              <a
                href={`tel:${hotline.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                <Phone className="size-4 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Hotline</div>
                  <div className="font-bold truncate text-[11px] text-white">{hotline}</div>
                </div>
              </a>

              {/* Website */}
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
              >
                <Globe className="size-4 shrink-0 text-sky-400" />
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Website</div>
                  <div className="font-bold truncate text-[11px] text-white">Mở Trang Web</div>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
              >
                <Mail className="size-4 shrink-0 text-amber-400" />
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Email B2B</div>
                  <div className="font-bold truncate text-[11px] text-white">{email.split("@")[0]}</div>
                </div>
              </a>

              {/* MST */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                <FileText className="size-4 shrink-0 text-purple-400" />
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Mã số thuế</div>
                  <div className="font-mono font-bold truncate text-[11px] text-white">{taxCode}</div>
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
              <MapPin className="size-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{officeAddress}</span>
            </div>
          </div>

          {/* Electronic Seal Verification */}
          <div className="mt-4 pt-2.5 border-t border-dashed border-white/15 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[9.5px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-amber-400 shrink-0" />
              <span>Bảo chứng hồ sơ số bởi CLB Doanh Nhân CEO 1983 (HanoiBA)</span>
            </div>
            <div className="font-mono text-[9px] text-amber-300/80">
              VERIFIED ID: #{memberCode}-5.0-CEO1983
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfileTwoPages;
