import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CalendarClock,
  ShieldCheck,
  ExternalLink,
  RotateCw,
  Download,
  Share2,
  MessageCircle,
  Crown,
  Check,
  Facebook,
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { Ceo1983BusinessCardVisit } from "@/components/member/Ceo1983BusinessCardVisit";
import { getPublicCard, type PublicCard } from "@/lib/card.functions";
import { toast } from "sonner";

const appIcon = "/ceo1983-logo.png";

export const Route = createFileRoute("/card/$code")({
  loader: ({ params }) => getPublicCard({ data: { code: params.code } }),
  head: () => ({
    meta: [
      { title: "Danh thiếp & Thẻ hội viên — CLB Doanh nhân CEO 1983" },
      {
        name: "description",
        content: "Xác thực và xem danh thiếp số / thẻ hội viên CLB Doanh nhân CEO 1983.",
      },
    ],
  }),
  component: PublicCardView,
  errorComponent: ({ error }) => (
    <div className="vba-app flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <ShieldCheck className="h-8 w-8 text-amber-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Lỗi truy xuất danh thiếp</h2>
      <p className="text-sm text-slate-400 max-w-sm">{error.message || "Không thể tải thông tin danh thiếp."}</p>
      <Link
        to="/association"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002B70] transition"
      >
        <ArrowLeft className="h-4 w-4" /> Về ứng dụng Hiệp hội
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="vba-app flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <User className="h-8 w-8 text-rose-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Không tìm thấy hội viên</h2>
      <p className="text-sm text-slate-400 max-w-sm">Mã thẻ không tồn tại trên hệ thống CLB Doanh Nhân CEO 1983 hoặc đã hết hạn.</p>
      <Link
        to="/association"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002B70] transition"
      >
        <ArrowLeft className="h-4 w-4" /> Về ứng dụng Hiệp hội
      </Link>
    </div>
  ),
});

type Lang = "vi" | "en";

const T = {
  verified: { vi: "Đã xác thực", en: "Verified" },
  memberCard: { vi: "THẺ HỘI VIÊN CHÍNH THỨC", en: "OFFICIAL MEMBER CARD" },
  company: { vi: "Doanh nghiệp", en: "Company" },
  individual: { vi: "Lãnh đạo", en: "Executive" },
  info: { vi: "Hồ sơ hội viên được xác thực", en: "Verified Member Profile" },
  code: { vi: "Mã hội viên", en: "Member code" },
  status: { vi: "Trạng thái", en: "Status" },
  validUntil: { vi: "Hiệu lực đến", en: "Valid until" },
  joined: { vi: "Gia nhập từ", en: "Member since" },
  title: { vi: "Chức danh", en: "Position" },
  email: { vi: "Email", en: "Email" },
  phone: { vi: "Điện thoại", en: "Phone" },
  industry: { vi: "Ngành nghề", en: "Industry" },
  region: { vi: "Khu vực hoạt động", en: "Region" },
  address: { vi: "Trụ sở / Địa chỉ", en: "Address" },
  website: { vi: "Website doanh nghiệp", en: "Website" },
  back: { vi: "Về App Hiệp Hội", en: "Back to Association App" },
  saveContact: { vi: "Lưu danh bạ", en: "Save Contact" },
  shareCard: { vi: "Chia sẻ", en: "Share" },
  flipCard: { vi: "Lật thẻ", en: "Flip Card" },
  authentic: {
    vi: "Hồ sơ hội viên hợp lệ, được cấp chứng thực điện tử bởi CLB Doanh nhân CEO 1983.",
    en: "Official verified member record, issued by CEO 1983 Business Club.",
  },
  noName: { vi: "Hội viên CLB Doanh Nhân CEO 1983", en: "CEO 1983 Member" },
  noCompany: { vi: "CLB Doanh nhân CEO 1983", en: "CEO 1983 Business Club" },
  noValue: { vi: "—", en: "—" },
} as const;

const INDUSTRY_MAP: Record<string, string> = {
  "ind.it": "Công nghệ thông tin & Chuyển đổi số",
  "ind.fnb": "F&B / Ẩm thực & Chuỗi nhà hàng",
  "ind.finance": "Tài chính & Đầu tư mạo hiểm",
  "ind.realestate": "Bất động sản & Xây dựng cao cấp",
  "ind.logistics": "Logistics & Chuỗi cung ứng",
  "ind.retail": "Bán lẻ & Thương mại dịch vụ",
  "ind.manufacturing": "Sản xuất & Chế biến công nghệ cao",
  "ind.service": "Dịch vụ & Tư vấn chiến lược",
  it: "Công nghệ thông tin & Chuyển đổi số",
};

const REGION_MAP: Record<string, string> = {
  "region.north": "Miền Bắc (Hà Nội)",
  "region.central": "Miền Trung (Đà Nẵng)",
  "region.south": "Miền Nam (TP.HCM)",
  north: "Miền Bắc (Hà Nội)",
  central: "Miền Trung (Đà Nẵng)",
  south: "Miền Nam (TP.HCM)",
};

const STATUS_MAP: Record<string, string> = {
  active: "Chính thức (Active)",
  "memberStatus.active": "Chính thức (Active)",
  pending: "Đang xét duyệt",
  expired: "Hết hạn",
};

function formatDate(val?: string | null): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return val;
  }
}

function PublicCardView() {
  const { code } = Route.useParams();
  const member = Route.useLoaderData() as PublicCard;
  const [lang, setLang] = useState<Lang>("vi");
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = (k: keyof typeof T) => T[k][lang];

  if (!member || (!member.found && !member.name)) {
    return (
      <div className="vba-app flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Không tìm thấy thẻ hội viên</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-1">
          Mã định danh <span className="font-mono text-amber-300 font-bold">{code}</span> chưa được kích hoạt hoặc không tồn tại.
        </p>
        <p className="text-xs text-slate-500 max-w-sm">
          Vui lòng quét lại mã QR chính thức từ CLB Doanh Nhân CEO 1983 hoặc liên hệ Ban Thư ký để được hỗ trợ.
        </p>
        <Link
          to="/association"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#002B70] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Về trang chủ Hiệp hội
        </Link>
      </div>
    );
  }

  const isCompany = member.type === "company";

  // Sanitize person & company names strictly based on real member record
  const primaryName = member.name?.trim() || t("noName");
  let secondaryCompany = member.company?.trim() || t("noCompany");
  if (!member.company?.trim() || secondaryCompany.toLowerCase().includes("platform")) {
    secondaryCompany = "CLB Doanh Nhân CEO 1983";
  }

  const primaryTitle = member.title?.trim() || (isCompany ? "Đại diện Doanh nghiệp" : "Lãnh đạo Doanh nghiệp Hội viên");

  const initials =
    primaryName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(-2)
      .join("")
      .toUpperCase() || "CEO";

  const resolvedPhoto = member.photoUrl || null;
  const formattedValidUntil = formatDate(member.validUntil);
  const formattedJoinedAt = formatDate(member.joinedAt);

  const resolvedIndustry = member.industry
    ? INDUSTRY_MAP[member.industry] || member.industry
    : "Công nghệ thông tin & Đổi mới sáng tạo";

  const resolvedRegion = member.region
    ? REGION_MAP[member.region] || member.region
    : "Miền Bắc (Hà Nội)";

  const resolvedStatus = member.status
    ? STATUS_MAP[member.status] || member.status
    : "Chính thức (Active)";

  const hasPhone = Boolean(member.phone && !member.phone.includes("ẩn"));
  const hasEmail = Boolean(member.email && !member.email.includes("ẩn"));
  const cleanPhone = hasPhone ? member.phone!.replace(/[^0-9+]/g, "") : "";

  // Dynamic vCard download: CHỈ LƯU TÊN VÀ SỐ ĐIỆN THOẠI (Bỏ chức vụ, bỏ mô tả theo yêu cầu)
  const handleDownloadVCard = () => {
    try {
      const vcardContent = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${primaryName}`,
        hasPhone ? `TEL;TYPE=CELL:${cleanPhone || member.phone}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\r\n");

      const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DanhThiep_${primaryName.replace(/\s+/g, "_")}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Đã tải tệp danh bạ! Mở tệp để lưu vào điện thoại.");
    } catch {
      toast.error("Không thể tạo danh thiếp điện tử.");
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://ceo1983club.com/card/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Danh thiếp số: ${primaryName}`,
          text: `${primaryName} — ${primaryTitle} tại ${secondaryCompany} (CLB Doanh Nhân CEO 1983)`,
          url: shareUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Đã sao chép liên kết danh thiếp!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Không thể sao chép liên kết");
      }
    }
  };

  const rows: { icon: typeof Mail; label: string; value?: string | null; isLink?: boolean; href?: string }[] = [
    { icon: ShieldCheck, label: t("status"), value: resolvedStatus },
    { icon: CalendarClock, label: t("joined"), value: formattedJoinedAt },
    { icon: Building2, label: t("industry"), value: resolvedIndustry },
    { icon: MapPin, label: t("region"), value: resolvedRegion },
    { icon: MapPin, label: t("address"), value: member.address || "Trụ sở CLB Doanh Nhân CEO 1983" },
    {
      icon: Globe,
      label: t("website"),
      value: member.website || "https://ceo1983club.com",
      isLink: Boolean(member.website),
      href: member.website || undefined,
    },
    {
      icon: Phone,
      label: t("phone"),
      value: member.phone || "Đã ẩn theo cài đặt riêng tư",
      isLink: hasPhone,
      href: hasPhone ? `tel:${cleanPhone}` : undefined,
    },
    {
      icon: Mail,
      label: t("email"),
      value: member.email || "Đã ẩn theo cài đặt riêng tư",
      isLink: hasEmail,
      href: hasEmail ? `mailto:${member.email}` : undefined,
    },
  ];

  const cardQrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/card/${code}`
      : `https://ceo1983.vn/card/${code}`;

  return (
    <div className="vba-app min-h-[100dvh] bg-slate-50 text-slate-800 antialiased">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[500px] flex-col px-4 pb-16">
        {/* Header navigation & language */}
        <header className="flex items-center justify-between py-4">
          <Link
            to="/association"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#003B95] shadow-xs transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("back")}</span>
          </Link>

          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-[11px] font-semibold shadow-xs"
          >
            {(["vi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`inline-flex h-7 min-w-[44px] items-center justify-center gap-1 rounded-full px-2.5 transition font-bold ${
                  lang === l
                    ? "bg-sky-950 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {l === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </header>

        {/* ── THẺ DANH THIẾP SỐ CEO 1983 EXECUTIVE (CHUẨN 100% GIAO DIỆN THẺ HỘI VIÊN) ── */}
        <div className="my-2">
          <Ceo1983BusinessCardVisit
            name={primaryName}
            title={primaryTitle}
            phone={hasPhone ? member.phone! : ""}
            email={hasEmail ? member.email! : ""}
            company={secondaryCompany}
            companyLogoUrl={(member as any)?.companyLogoUrl || (member as any)?.companyLogo || null}
            website={member.website || "https://ceo1983club.com"}
            clubEmail="info@ceo1983club.com"
            cardCode={code}
            qrValue={cardQrUrl}
            avatarUrl={resolvedPhoto}
            showActions={false}
          />
        </div>

        {/* ── THÔNG TIN KẾT NỐI CHÍNH XUẤT HIỆN NGAY DƯỚI THẺ (Req 10) ── */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {/* Download vCard */}
          <button
            type="button"
            onClick={handleDownloadVCard}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95 text-slate-900 shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-700" />
            <span className="text-[10px] font-bold">{t("saveContact")}</span>
          </button>

          {/* Call / Contact */}
          {hasPhone ? (
            <a
              href={`tel:${cleanPhone}`}
              className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 transition active:scale-95 text-emerald-900 shadow-xs cursor-pointer"
            >
              <Phone className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-bold">Gọi điện</span>
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <Phone className="h-4 w-4 text-slate-300" />
              <span className="text-[10px] font-bold">Gọi điện</span>
            </div>
          )}

          {/* Zalo */}
          {hasPhone ? (
            <a
              href={`https://zalo.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-sky-300/80 bg-sky-50 hover:bg-sky-100 transition active:scale-95 text-sky-900 shadow-xs cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-[#0068FF]" />
              <span className="text-[10px] font-bold">Zalo</span>
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <MessageCircle className="h-4 w-4 text-slate-300" />
              <span className="text-[10px] font-bold">Zalo</span>
            </div>
          )}

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition active:scale-95 text-blue-900 shadow-xs cursor-pointer"
          >
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            <span className="text-[10px] font-bold">Facebook</span>
          </a>
        </div>

        {/* Authenticated Confirmation Banner */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 shadow-xs">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-[12px] font-semibold leading-snug text-emerald-900">
            {t("authentic")}
          </p>
        </div>

        {/* Detailed Verified Profile */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#003B95]">
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>{t("info")}</span>
          </h2>

          <dl className="divide-y divide-slate-100 text-[12.5px]">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-2 text-slate-500 shrink-0">
                  <r.icon className="h-4 w-4 text-amber-500" />
                  <span className="text-[12px] font-medium">{r.label}</span>
                </div>
                <div className="min-w-0 flex-1 text-right font-semibold text-slate-800">
                  {r.isLink && r.href ? (
                    <a
                      href={r.href}
                      target={r.href.startsWith("http") ? "_blank" : undefined}
                      rel={r.href.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-[#003B95] hover:text-[#002766] hover:underline"
                    >
                      <span className="truncate max-w-[220px]">
                        {r.value ? r.value.replace(/^https?:\/\//, "") : "—"}
                      </span>
                      {r.href.startsWith("http") && <ExternalLink className="h-3 w-3 shrink-0" />}
                    </a>
                  ) : (
                    <span className="truncate">{r.value || "—"}</span>
                  )}
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Back to Home action button */}
        <Link
          to="/association"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002766] hover:from-[#002B70] hover:to-[#001D4D] py-3.5 text-[13px] font-bold text-white shadow-lg border border-blue-500/30 transition active:scale-98"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("back")}</span>
        </Link>
      </div>
    </div>
  );
}
