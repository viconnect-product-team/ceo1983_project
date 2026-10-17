import React, { useRef, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Printer,
  FileText,
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export interface CompanyProfileData {
  companyName?: string;
  tagline?: string;
  leaderName?: string;
  leaderTitle?: string;
  avatarUrl?: string | null;
  memberCode?: string;
  industry?: string;
  industryDetail?: string;
  companySize?: string;
  establishedYear?: string | number;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  featuredProducts?: string;
  description?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  brochureUrl?: string | null;
  companyProfileUrl?: string | null;
}

interface CompanyProfile3DTemplateProps {
  data: CompanyProfileData;
  showDownloadButton?: boolean;
  onDownloadCustomProfile?: () => void;
  className?: string;
}

export function CompanyProfile3DTemplate({
  data,
  showDownloadButton = true,
  onDownloadCustomProfile,
  className = "",
}: CompanyProfile3DTemplateProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const companyName = data.companyName?.trim() || "DOANH NGHIỆP HỘI VIÊN CEO 1983";
  const leaderName = data.leaderName?.trim() || "Lãnh đạo Doanh nghiệp";
  const leaderTitle = data.leaderTitle?.trim() || "Chủ tịch / Tổng Giám đốc";
  const memberCode = data.memberCode?.trim() || "CEO1983-VIP";
  const industry = data.industry?.trim() || "Công nghệ & Thương mại Đa ngành";
  const establishedYear = data.establishedYear || "2018";
  const companySize = data.companySize || "50 - 200 nhân sự";
  const address = data.address || "Trụ sở CLB Doanh Nhân CEO 1983, TP. Hà Nội";
  const website = data.website || "https://ceo1983club.com";
  const phone = data.phone || "0983 1983 83";
  const email = data.email || "doanhnghiep@ceo1983club.com";
  const tagline = data.tagline || "Đổi Mới Sáng Tạo • Nâng Tầm Giá Trị • Kết Nối Thịnh Vượng";
  const featuredProducts = data.featuredProducts || "Giải pháp B2B trọn gói, Cung ứng chuỗi giá trị và Dịch vụ thương mại chất lượng cao bảo chứng bởi CLB CEO 1983.";

  // Handle Export / Download Profile
  const handleDownloadPdf = async () => {
    // If enterprise has their own brochure/profile URL, use it directly
    const customUrl = data.companyProfileUrl || data.brochureUrl;
    if (customUrl) {
      if (onDownloadCustomProfile) {
        onDownloadCustomProfile();
      } else {
        window.open(customUrl, "_blank");
        toast.success("Đang mở tệp Profile chính thức của doanh nghiệp!");
      }
      return;
    }

    setDownloading(true);
    toast.info("Đang tạo bản in hồ sơ doanh nghiệp 3D...");
    try {
      // Dynamic import to keep bundle light
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      if (!profileRef.current) return;

      const canvas = await html2canvas(profileRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#030d22",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
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

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Profile_DoanhNghiep_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      toast.success("Đã tải thành công Profile doanh nghiệp!");
    } catch (err) {
      console.warn("PDF export fallback to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ Doanh nghiệp 3D: ${companyName}`,
          text: `${companyName} - Đại diện: ${leaderName} (${leaderTitle}) | CLB Doanh Nhân CEO 1983`,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép liên kết hồ sơ doanh nghiệp!");
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Action Bar for Profile */}
      {showDownloadButton && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-amber-500/10 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-400/20 text-amber-500">
              <FileText className="size-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Hồ Sơ Doanh Nghiệp 3D
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {data.companyProfileUrl || data.brochureUrl ? "Bản gốc doanh nghiệp đính kèm" : "Template chuẩn xác thực CLB CEO 1983"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
              title="Chia sẻ hồ sơ"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#1E40AF] hover:from-[#002b70] hover:to-[#173082] text-white text-[11.5px] font-bold shadow-md shadow-blue-900/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="size-3.5 text-amber-400" />
              <span>{downloading ? "Đang tải..." : "Tải Profile"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 3D WATERMARKED LUXURY ENTERPRISE PROFILE CANVAS ── */}
      <div
        ref={profileRef}
        className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-[#020b1c] via-[#051a3d] to-[#010917] text-white shadow-[0_25px_60px_rgba(0,35,90,0.5)] transition-all duration-300"
      >
        {/* Luxury Hero Banner Cover */}
        <div className="relative h-32 sm:h-40 w-full overflow-hidden border-b border-amber-400/30">
          <img
            src={data.coverUrl || "/bg-crm.png"}
            alt="Cover background"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/Background.png";
            }}
            className="w-full h-full object-cover opacity-80 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b1c] via-black/40 to-transparent" />
          
          {/* Top Header Badge Floating on Cover */}
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-lg border border-amber-300">
              <Sparkles className="size-3" />
              OFFICIAL BUSINESS PROFILE
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-400/40 text-[10.5px] font-bold text-emerald-400 backdrop-blur-md shadow-md">
              <ShieldCheck className="size-3.5" />
              <span>ĐÃ BẢO CHỨNG B2B</span>
            </div>
          </div>
        </div>

        {/* ── WATERMARK CHÌM BACKGROUND (Ảnh chìm CLB CEO 1983) ── */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-8 dark:opacity-12">
          {/* Huge stylized watermark circle */}
          <div className="absolute -right-20 -bottom-20 size-96 rounded-full border-[18px] border-amber-300/30 flex items-center justify-center rotate-[-15deg]">
            <div className="size-72 rounded-full border-4 border-dashed border-amber-300/40 flex flex-col items-center justify-center text-center p-6">
              <span className="text-3xl font-black tracking-widest text-amber-300">CEO 1983</span>
              <span className="text-[11px] font-bold tracking-widest text-amber-200 uppercase mt-1">
                BẢO CHỨNG HIỆP HỘI
              </span>
            </div>
          </div>
          {/* Top-left subtle geometric mesh watermark */}
          <div className="absolute -left-16 -top-16 size-80 rounded-full bg-radial from-blue-500/20 via-amber-500/10 to-transparent blur-3xl" />
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-7 relative z-10 -mt-14 sm:-mt-16">
          {/* Company Identity Hero: Avatar & Logo Duo */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left pb-4">
            {/* Visual Container: Avatar + Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Leader Avatar */}
              <div className="relative size-20 sm:size-24 rounded-2xl p-1 bg-gradient-to-br from-amber-400 via-amber-200 to-yellow-500 shadow-2xl shrink-0">
                <div className="size-full rounded-[14px] overflow-hidden bg-slate-900 border border-amber-300/50 flex items-center justify-center">
                  {data.avatarUrl ? (
                    <img
                      src={data.avatarUrl}
                      alt={leaderName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-amber-300">
                      {leaderName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-md" title="Lãnh đạo Doanh nghiệp">
                  👑
                </div>
              </div>

              {/* Company Logo */}
              <div className="relative size-16 sm:size-20 rounded-2xl p-0.5 bg-gradient-to-br from-blue-400 to-[#003B95] shadow-xl shrink-0">
                <div className="size-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center p-1 border border-white/20">
                  {data.logoUrl ? (
                    <img
                      src={data.logoUrl}
                      alt={companyName}
                      className="size-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-8 text-[#003B95] dark:text-amber-400" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="size-3" />
                </div>
              </div>
            </div>

            {/* Company Name & Tagline */}
            <div className="flex-1 space-y-1.5 min-w-0 pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                  {memberCode}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  {industry}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
                {companyName}
              </h3>
              <p className="text-xs text-amber-300/90 font-medium italic">
                "{tagline}"
              </p>
              <div className="pt-0.5 text-xs text-slate-200">
                Lãnh đạo đại diện: <strong className="text-white font-bold">{leaderName}</strong> ({leaderTitle})
              </div>
            </div>
          </div>

        {/* 4 Pillars Matrix (Quy mô - Thâm niên - Năng lực - Thị trường) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
              <Calendar className="size-3 text-amber-400" /> Năm thành lập
            </span>
            <div className="text-sm font-black text-white">{establishedYear}</div>
            <div className="text-[9.5px] text-emerald-400 font-medium">Hoạt động vững mạnh</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
              <Users className="size-3 text-amber-400" /> Quy mô nhân sự
            </span>
            <div className="text-sm font-black text-white">{companySize}</div>
            <div className="text-[9.5px] text-blue-300 font-medium">Đội ngũ chuyên nghiệp</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
              <Briefcase className="size-3 text-amber-400" /> Năng lực B2B
            </span>
            <div className="text-sm font-black text-white">Đối tác Chiến lược</div>
            <div className="text-[9.5px] text-amber-300 font-medium">Hệ sinh thái 1983</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="size-3 text-amber-400" /> Uy tín tín nhiệm
            </span>
            <div className="text-sm font-black text-amber-400 flex items-center gap-1">
              <span>Hạng AAA</span>
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[9.5px] text-slate-400">Được xác minh pháp lý</div>
          </div>
        </div>

        {/* Core Strengths (Thế mạnh cạnh tranh 3D) */}
        <div className="relative z-10 my-4 space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Award className="size-3.5" />
            <span>NĂNG LỰC CỐT LÕI &amp; THẾ MẠNH CẠNH TRANH</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-amber-400 shrink-0" />
                <span>Tiêu chuẩn Chất lượng</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Quy trình kiểm duyệt chuẩn mực, áp dụng công nghệ chuyển đổi số hiện đại.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-blue-400 shrink-0" />
                <span>Mạng lưới Kết nối B2B</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Liên kết sâu rộng trong CLB Doanh nhân CEO 1983 &amp; Hội Doanh nghiệp trẻ Hà Nội.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Ưu đãi Nội bộ Đặc quyền</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cam kết chính sách chiết khấu và hợp tác tin cậy tối ưu nhất cho hội viên.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Products & Services */}
        <div className="relative z-10 my-4 p-4 rounded-2xl bg-white/[0.04] border border-amber-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              SẢN PHẨM &amp; DỊCH VỤ CHỦ LỰC
            </span>
            <span className="text-[10px] text-slate-400">Bảo chứng CEO 1983</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {featuredProducts}
          </p>
        </div>

        {/* Contact Info Footer Grid */}
        <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="size-3.5" />
            </div>
            <span className="truncate">{address}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Phone className="size-3.5" />
            </div>
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white font-medium">
              Hotline: {phone}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Globe className="size-3.5" />
            </div>
            <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noreferrer" className="hover:text-white font-medium truncate flex items-center gap-1">
              <span>{website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Mail className="size-3.5" />
            </div>
            <a href={`mailto:${email}`} className="hover:text-white font-medium truncate">
              {email}
            </a>
          </div>
        </div>

        {/* Certification Seal Footer */}
        <div className="relative z-10 mt-5 pt-3 border-t border-dashed border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-amber-400" />
            <span>Hồ sơ số được xác thực điện tử bởi CLB Doanh Nhân CEO 1983 (HanoiBA)</span>
          </div>
          <div className="font-mono text-[9px] text-amber-300/80">
            SECURE VERIFICATION HASH: #{memberCode.replace(/[^a-zA-Z0-9]/g, "")}-VBA
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
