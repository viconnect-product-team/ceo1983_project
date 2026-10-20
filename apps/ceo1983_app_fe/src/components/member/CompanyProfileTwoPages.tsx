import React, { useRef, useState } from "react";
import {
  Globe,
  Phone,
  MapPin,
  Download,
  CheckCircle2,
  FileText,
  Pencil,
  FileUp,
  Users,
  Briefcase,
  FileCode,
  RotateCcw,
  Eye,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export interface CompanyProfile2PageData {
  // ── THÔNG TIN CHÍNH HỒ SƠ DOANH NGHIỆP ──
  companyName: string;
  aboutUs?: string;
  industry?: string;
  personnelCompetence?: string;
  website?: string;
  hotline?: string;
  officeAddress?: string;

  // ── ẢNH HÌNH HỌC (PENTAGON / GEOMETRIC CUTOUT) ──
  geoImageUrl?: string | null;
  triangleImageUrl?: string | null; // Backward compatibility
  halfDiamondImageUrl?: string | null; // Backward compatibility

  // ── ĐIỂM NỔI BẬT / METRICS ──
  metric1Val?: string;
  metric1Label?: string;
  metric2Val?: string;
  metric2Label?: string;

  // ── CÁC TRƯỜNG PHỤ / LIÊN KẾT ──
  logoUrl?: string | null;
  coverUrl?: string | null;
  avatarUrl?: string | null;
  leaderName?: string;
  leaderTitle?: string;
  memberCode?: string;
  slogan?: string;
  email?: string;
  taxCode?: string;
  keyServices?: Array<{ title: string; desc: string; isPrimary?: boolean }>;
  companyProfileUrl?: string | null;
  companyProfileName?: string | null;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile2PageData = {
  companyName: "VICONNECT JSC",
  aboutUs:
    "Giải pháp Công nghệ B2B & Chuyển đổi số doanh nghiệp.\nXúc tiến thương mại & Tối ưu chi phí vận hành.",
  industry: "Kinh nghiệm Thực chiến",
  personnelCompetence: "Nhân sự Chuyên gia",
  metric1Val: "50+",
  metric1Label: "Nhân sự Chuyên gia",
  metric2Val: "10+ Năm",
  metric2Label: "Kinh nghiệm Thực chiến",
  website: "https://ceo1983club.com",
  hotline: "0983 1983 83",
  officeAddress: "Tòa nhà CEO 1983 Tower, Cầu Giấy, Hà Nội",
  geoImageUrl:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  triangleImageUrl:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
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

  // Parse data fields - only use non-empty data, fallback to default
  const companyName = data.companyName?.trim() || DEFAULT_COMPANY_PROFILE.companyName;
  const aboutUs = data.aboutUs?.trim() ?? DEFAULT_COMPANY_PROFILE.aboutUs ?? "";
  const website = data.website?.trim() || "";
  const hotline = data.hotline?.trim() || "";
  const officeAddress = data.officeAddress?.trim() || "";

  // Geometric photo
  const geoImgSrc =
    data.geoImageUrl ||
    data.triangleImageUrl ||
    data.coverUrl ||
    DEFAULT_COMPANY_PROFILE.geoImageUrl!;

  // Dynamic metrics: prioritized explicit values or inferred from personnelCompetence / industry
  const metric1Val =
    data.metric1Val?.trim() ||
    (data.personnelCompetence && data.personnelCompetence.length <= 15
      ? data.personnelCompetence
      : DEFAULT_COMPANY_PROFILE.metric1Val);
  const metric1Label =
    data.metric1Label?.trim() || DEFAULT_COMPANY_PROFILE.metric1Label;

  const metric2Val =
    data.metric2Val?.trim() ||
    (data.industry && data.industry.length <= 15
      ? data.industry
      : DEFAULT_COMPANY_PROFILE.metric2Val);
  const metric2Label =
    data.metric2Label?.trim() || DEFAULT_COMPANY_PROFILE.metric2Label;

  // Split aboutUs into bullet items
  const introItems = aboutUs
    ? aboutUs
        .split(/\r?\n|•/)
        .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
        .filter(Boolean)
    : [];

  // Clean website display
  const cleanWebsite = website.replace(/^https?:\/\//i, "").replace(/\/$/, "");

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
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const marginX = 10;
      const marginY = 15;

      pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      pdf.save(`Ho_So_Doanh_Nghiep_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      toast.success("Xuất hồ sơ doanh nghiệp PDF thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể xuất PDF: " + (err?.message || "Lỗi render canvas"));
    } finally {
      setDownloading(false);
    }
  };

  // ── TRƯỜNG HỢP: NGƯỜI DÙNG CÓ FILE PROFILE RIÊNG TẢI LÊN ──
  if (data.companyProfileUrl) {
    return (
      <div className={`mt-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 text-slate-900 dark:text-white shadow-xl ${className}`}>
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#003B95] dark:text-amber-400 border border-blue-200 dark:border-amber-500/30">
              <FileText className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-[#003B95] dark:text-amber-400 uppercase tracking-wider">
                  Hồ Sơ Năng Lực (Tệp Đính Kèm)
                </h4>
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  File riêng
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md mt-0.5">
                {data.companyProfileName || "Tài liệu hồ sơ năng lực chính thức"}
              </p>
            </div>
          </div>

          {canEdit && onUploadFile && (
            <button
              type="button"
              onClick={onUploadFile}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5"
              title="Tải lên tệp mới"
            >
              <FileUp className="size-3.5 text-[#003B95] dark:text-amber-400" />
              <span className="hidden sm:inline">Thay file khác</span>
            </button>
          )}
        </div>

        {/* File Preview Card & Actions */}
        <div className="my-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-[#003B95] flex items-center justify-center text-white shadow-md shrink-0">
              <FileCode className="size-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                {data.companyProfileName || `${companyName} - Profile.pdf`}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              title="Tải xuống tệp"
            >
              <Download className="size-4" />
            </a>
          </div>
        </div>

        {canEdit && onRemoveUploadedFile && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dùng mẫu hồ sơ số hóa chuẩn thẻ?</span>
            <button
              type="button"
              onClick={onRemoveUploadedFile}
              className="text-[#003B95] dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Chuyển sang mẫu chuẩn</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── TRƯỜNG HỢP: HỒ SƠ DOANH NGHIỆP THEO CHUẨN THIẾT KẾ ĐÃ ĐƯỢC CUNG CẤP ──
  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      {/* Thanh công cụ quản trị (chỉ hiện khi có canEdit hoặc nút tải PDF) */}
      {(canEdit || onEdit || onUploadFile) && (
        <div className="max-w-[480px] mx-auto flex items-center justify-end gap-2 px-1">
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
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              title="Tải tệp PDF riêng"
            >
              <FileUp className="size-3.5 text-[#003B95] dark:text-amber-400" />
              <span className="hidden sm:inline">Tải PDF riêng</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            title="Tải bản in PDF"
          >
            <Download className="size-3.5 text-[#003B95] dark:text-amber-400" />
            <span>{downloading ? "Đang xuất..." : "Tải PDF"}</span>
          </button>
        </div>
      )}

      {/* ── THẺ HỒ SƠ DOANH NGHIỆP THEO CHUẨN HTML YÊU CẦU ── */}
      <div
        ref={profileRef}
        className="profile-card w-full max-w-[480px] mx-auto bg-white dark:bg-[#0F172A] rounded-[24px] p-6 sm:p-7 shadow-[0_20px_40px_rgba(10,37,64,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-[#E2E8F0] dark:border-slate-800 relative overflow-hidden transition-colors"
      >
        {/* Top Bar & Badges */}
        <div className="top-bar flex justify-between items-center mb-5">
          <div className="brand-badge inline-flex items-center gap-2 bg-[#F58220]/10 text-[#F58220] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#F58220]/20">
            <Award className="size-4 text-[#F58220]" />
            <span>CEO 1983 MEMBER</span>
          </div>
        </div>

        {/* Company Name */}
        <h1 className="company-name text-xl sm:text-[22px] font-extrabold text-[#0A2540] dark:text-white leading-[1.2] mb-5 uppercase tracking-normal">
          {companyName}
        </h1>

        {/* Geometric Image Container */}
        <div className="visual-container relative w-full h-[220px] mb-6 flex justify-center items-center">
          <img
            className="geo-img w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            src={geoImgSrc}
            alt={companyName}
            style={{
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </div>

        {/* Key Metrics Grid */}
        {(metric1Val || metric2Val) && (
          <div className="metrics-grid grid grid-cols-2 gap-3 mb-6">
            {metric1Val && (
              <div className="metric-box bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 p-4 rounded-2xl text-center transition-all hover:border-[#F58220] hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_4px_12px_rgba(245,130,32,0.1)]">
                <Users className="metric-icon size-5 text-[#F58220] mx-auto mb-2" />
                <div className="metric-val text-base sm:text-lg font-extrabold text-[#0A2540] dark:text-white mb-0.5">
                  {metric1Val}
                </div>
                <div className="metric-label text-[11px] text-[#64748B] dark:text-slate-400 font-semibold uppercase">
                  {metric1Label}
                </div>
              </div>
            )}

            {metric2Val && (
              <div className="metric-box bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 p-4 rounded-2xl text-center transition-all hover:border-[#F58220] hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_4px_12px_rgba(245,130,32,0.1)]">
                <Briefcase className="metric-icon size-5 text-[#F58220] mx-auto mb-2" />
                <div className="metric-val text-base sm:text-lg font-extrabold text-[#0A2540] dark:text-white mb-0.5">
                  {metric2Val}
                </div>
                <div className="metric-label text-[11px] text-[#64748B] dark:text-slate-400 font-semibold uppercase">
                  {metric2Label}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bullet Points Section (Intro Box) */}
        {introItems.length > 0 && (
          <div className="intro-box bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 rounded-2xl p-4 mb-6 space-y-2.5">
            {introItems.map((item, idx) => (
              <div
                key={idx}
                className="intro-item flex items-start gap-2.5 text-[13px] text-[#1E293B] dark:text-slate-200 font-medium leading-[1.4]"
              >
                <CheckCircle2 className="size-3.5 text-[#F58220] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Contact Details Grid (Chỉ xuất hiện với những thông tin có thể chỉnh sửa) */}
        {(website || hotline || officeAddress) && (
          <div className="contact-list flex flex-col gap-2.5">
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="contact-item flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 text-[#1E293B] dark:text-slate-200 text-[13px] font-semibold hover:bg-[#F8FAFC] dark:hover:bg-slate-700/60 transition group cursor-pointer"
              >
                <div className="contact-icon size-8 rounded-lg bg-[rgba(10,37,64,0.05)] dark:bg-white/10 text-[#0A2540] dark:text-amber-400 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="size-4" />
                </div>
                <span className="truncate">{cleanWebsite}</span>
              </a>
            )}

            {hotline && (
              <a
                href={`tel:${hotline.replace(/\s+/g, "")}`}
                className="contact-item flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 text-[#1E293B] dark:text-slate-200 text-[13px] font-semibold hover:bg-[#F8FAFC] dark:hover:bg-slate-700/60 transition group cursor-pointer"
              >
                <div className="contact-icon size-8 rounded-lg bg-[rgba(10,37,64,0.05)] dark:bg-white/10 text-[#0A2540] dark:text-amber-400 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="size-4" />
                </div>
                <span>{hotline}</span>
              </a>
            )}

            {officeAddress && (
              <div className="contact-item flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 text-[#1E293B] dark:text-slate-200 text-[13px] font-semibold">
                <div className="contact-icon size-8 rounded-lg bg-[rgba(10,37,64,0.05)] dark:bg-white/10 text-[#0A2540] dark:text-amber-400 flex items-center justify-center text-sm shrink-0">
                  <MapPin className="size-4 text-rose-500" />
                </div>
                <span className="leading-snug">{officeAddress}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyProfileTwoPages;
