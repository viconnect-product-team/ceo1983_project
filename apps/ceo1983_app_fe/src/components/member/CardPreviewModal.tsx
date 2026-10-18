import { useMemo, useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Download,
  Share2,
  MessageCircle,
  Facebook,
  Star,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import { Ceo1983BusinessCardVisit } from "@/components/member/Ceo1983BusinessCardVisit";
import { CompanyProfileTwoPages } from "@/components/member/CompanyProfileTwoPages";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyBusinessCardFn,
  setPrimaryBusinessCardFn,
  type CardKind,
  type BusinessCard,
} from "@/lib/business-card.functions";

export interface CardPreviewModalProps {
  cardId?: string | null;
  slug: string;
  name: string;
  title?: string;
  company?: string;
  avatarUrl?: string | null;
  themeId?: string | null;
  published?: boolean;
  cardKind?: CardKind;
  draft?: any;
  onClose: () => void;
  onPrimarySet?: () => void;
}

export function CardPreviewModal({
  cardId,
  slug,
  name,
  title,
  company,
  avatarUrl,
  published = true,
  cardKind = "primary",
  draft,
  onClose,
  onPrimarySet,
}: CardPreviewModalProps) {
  const getCardFn = useServerFn(getMyBusinessCardFn);
  const setPrimaryFn = useServerFn(setPrimaryBusinessCardFn);

  const [cardDetails, setCardDetails] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load detailed card if cardId is available and draft is not provided
  useEffect(() => {
    if (draft) return;
    if (!cardId) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getCardFn({ data: { id: cardId! } });
        if (!cancelled) {
          setCardDetails(res);
        }
      } catch {
        // Fallback gracefully to summary props
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cardId, draft]);

  // Merge draft / fetched details / fallback props
  const effectiveKind = draft?.cardKind || cardDetails?.cardKind || cardKind;
  const effectiveName = draft?.displayName || cardDetails?.displayName || name || "Hội viên CLB CEO 1983";
  const effectiveTitle = draft?.professionalTitle || cardDetails?.professionalTitle || title || "Hội viên chính thức CLB CEO 1983";
  const effectiveCompany = draft?.companyName || cardDetails?.companyName || company || "CLB Doanh Nhân CEO 1983";
  const effectivePhone = draft?.workPhone || cardDetails?.workPhone || "";
  const effectiveEmail = draft?.workEmail || cardDetails?.workEmail || "";
  const effectiveAddress = draft?.address || cardDetails?.address || "Trụ sở CLB Doanh Nhân CEO 1983, Hà Nội";
  const effectiveWebsite = draft?.website || cardDetails?.website || "https://ceo1983club.com";
  const effectiveBio = draft?.bio || cardDetails?.bio || "";
  const effectiveFacebook = draft?.facebookUrl || cardDetails?.facebookUrl || "";
  const effectiveZalo = draft?.zaloUrl || cardDetails?.zaloUrl || "";

  const cachedCardAvatar =
    typeof window !== "undefined" && (cardId || slug)
      ? localStorage.getItem(`vba_card_avatar_${cardId || slug}`) ||
        localStorage.getItem(`vba_secondary_card_avatar_${cardId || slug}`) ||
        (effectiveKind === "primary" ? localStorage.getItem("vba_member_avatar_photo") : null)
      : null;

  const rawAvatar = draft?.avatarUrl || cardDetails?.avatarUrl || avatarUrl || cachedCardAvatar || null;
  const resolvedAvatar = rawAvatar
    ? (rawAvatar.startsWith("data:") || rawAvatar.startsWith("blob:")
        ? rawAvatar
        : resolveMediaUrl(rawAvatar) || rawAvatar)
    : null;

  // Visibility flags
  const vis = draft?.visibility || cardDetails?.visibilitySettings || {};
  const showContact = vis.showContact !== false;
  const showSocial = vis.showSocial !== false;
  const showPhone = showContact && vis.showPhone !== false && Boolean(effectivePhone);
  const showEmail = showContact && vis.showEmail !== false && Boolean(effectiveEmail);
  const showAddress = showContact && vis.showAddress !== false && Boolean(effectiveAddress);
  const showCompany = vis.showCompany !== false;
  const showServices = vis.showServices !== false;
  const showNeeds = vis.showNeeds !== false;

  const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, "") : "";

  const publicUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.vn";
    return `${origin}/card/${slug}`;
  }, [slug]);

  const handleDownloadVCard = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${effectiveName}`,
      showCompany ? `ORG:${effectiveCompany}` : "",
      `TITLE:${effectiveTitle}`,
      showPhone && cleanPhone ? `TEL;TYPE=CELL:${cleanPhone}` : "",
      showEmail && effectiveEmail ? `EMAIL:${effectiveEmail}` : "",
      showCompany && effectiveWebsite ? `URL:${effectiveWebsite}` : "",
      showAddress && effectiveAddress ? `ADR;TYPE=WORK:;;${effectiveAddress};;;;` : "",
      "NOTE:Hội viên CLB Doanh Nhân CEO 1983",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "ceo1983"}-card.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Đang tải danh bạ về máy!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Danh thiếp số: ${effectiveName}`,
          text: `${effectiveName} — ${effectiveTitle} tại ${effectiveCompany}`,
          url: publicUrl,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast.success("Đã sao chép liên kết danh thiếp!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Không thể sao chép liên kết");
      }
    }
  };

  const handleSetPrimary = async () => {
    const targetId = cardId || slug;
    if (!targetId) return;
    setSettingPrimary(true);
    try {
      await setPrimaryFn({ data: { id: targetId } });
      toast.success("Đã đặt danh thiếp này làm Danh thiếp chính!");
      onPrimarySet?.();
      onClose();
    } catch {
      toast.error("Không thể đặt làm danh thiếp chính");
    } finally {
      setSettingPrimary(false);
    }
  };

  const servicesList = draft?.services || cardDetails?.services || [];
  const needsList = draft?.needs || cardDetails?.needs || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước danh thiếp số"
    >
      <div
        className="relative my-auto flex max-h-[94vh] w-full max-w-[500px] flex-col overflow-hidden rounded-3xl bg-slate-50 text-slate-800 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${
                effectiveKind === "primary"
                  ? "bg-blue-100 text-[#003B95] border border-blue-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {effectiveKind === "primary" ? (
                <>
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>Danh thiếp chính</span>
                </>
              ) : (
                <span>Danh thiếp phụ</span>
              )}
            </span>
            <span className="truncate text-xs font-semibold text-slate-500">
              Xem trước
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {effectiveKind !== "primary" && (
              <button
                type="button"
                disabled={settingPrimary}
                onClick={() => void handleSetPrimary()}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {settingPrimary ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Star className="h-3.5 w-3.5 fill-white" />
                )}
                <span>Đặt làm chính</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Card Kind Status Notification */}
          {effectiveKind === "primary" ? (
            <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50/90 border border-blue-200 p-3 text-xs leading-relaxed text-blue-950">
              <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-[#003B95]">Đây là Danh thiếp chính của bạn</p>
                <p className="text-slate-600 mt-0.5 text-[11.5px]">
                  Khi bất kỳ ai quét mã QR thẻ hội viên của bạn, thông tin và các trường tùy chọn bên dưới sẽ được hiển thị công khai.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 p-3 text-xs leading-relaxed text-amber-950">
              <span className="text-sm">💼</span>
              <div>
                <p className="font-bold text-amber-900">Đây là Danh thiếp phụ</p>
                <p className="text-slate-600 mt-0.5 text-[11.5px]">
                  Chỉ bạn thấy danh thiếp này cho đến khi bạn bấm{" "}
                  <strong className="text-amber-800 font-bold">&quot;Đặt làm danh thiếp chính&quot;</strong> để kích hoạt cho người quét mã QR.
                </p>
              </div>
            </div>
          )}

          {/* ── THẺ DANH THIẾP SỐ CEO 1983 EXECUTIVE (GIAO DIỆN CHUẨN THẺ HỘI VIÊN) ── */}
          <div className="rounded-2xl overflow-hidden shadow-md">
            <Ceo1983BusinessCardVisit
              name={effectiveName}
              title={effectiveTitle}
              phone={showPhone ? effectivePhone : ""}
              email={showEmail ? effectiveEmail : ""}
              company={showCompany ? effectiveCompany : "CLB Doanh Nhân CEO 1983"}
              companyLogoUrl={null}
              website={showCompany ? effectiveWebsite : "https://ceo1983club.com"}
              clubEmail="info@ceo1983club.com"
              cardCode={slug}
              qrValue={publicUrl}
              avatarUrl={resolvedAvatar}
              showActions={false}
            />
          </div>

          {/* ── 4 NÚT HÀNH ĐỘNG KẾT NỐI (GIỐNG THẺ HỘI VIÊN) ── */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadVCard}
              className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95 text-slate-900 shadow-2xs cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-700" />
              <span className="text-[10px] font-bold">Lưu danh bạ</span>
            </button>

            {showPhone && cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 transition active:scale-95 text-emerald-900 shadow-2xs cursor-pointer"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-bold">Gọi điện</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold">Đã ẩn số</span>
              </div>
            )}

            {showPhone && cleanPhone ? (
              <a
                href={`https://zalo.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-sky-300/80 bg-sky-50 hover:bg-sky-100 transition active:scale-95 text-sky-900 shadow-2xs cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-[#0068FF]" />
                <span className="text-[10px] font-bold">Zalo</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold">Đã ẩn Zalo</span>
              </div>
            )}

            {showSocial && effectiveFacebook ? (
              <a
                href={effectiveFacebook}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition active:scale-95 text-blue-900 shadow-2xs cursor-pointer"
              >
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                <span className="text-[10px] font-bold">Facebook</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <Facebook className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold">Facebook</span>
              </div>
            )}
          </div>

          {/* Quick Share Banner */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 bg-white text-[#003B95] hover:bg-blue-50 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-amber-500" />
              <span>{copied ? "Đã sao chép liên kết" : "Chia sẻ liên kết danh thiếp"}</span>
            </button>
          </div>

          {/* Authentic Confirmation Banner */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2.5 shadow-2xs">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-[11.5px] font-semibold leading-snug text-emerald-900">
              Hồ sơ hợp lệ, được cấp chứng thực điện tử bởi CLB Doanh nhân CEO 1983.
            </p>
          </div>

          {/* ── BẢNG THÔNG TIN HỘI VIÊN ĐƯỢC XÁC THỰC (THEO ĐÚNG TÙY CHỌN ẨN/HIỆN CỦA THẺ NÀY) ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[#003B95] uppercase tracking-wider">
              <Building2 className="h-4 w-4 text-amber-500" />
              <span>Thông tin hiển thị cho người quét</span>
            </h2>

            <dl className="divide-y divide-slate-100 text-[12px]">
              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-500 font-medium">Trạng thái</span>
                <span className="font-semibold text-emerald-600">Chính thức (Active)</span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-500 font-medium">Chức danh</span>
                <span className="font-semibold text-slate-800 text-right">{effectiveTitle}</span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-500 font-medium">Doanh nghiệp</span>
                <span className="font-semibold text-slate-800 text-right">
                  {showCompany ? effectiveCompany : "Đã ẩn theo cài đặt riêng tư"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Phone className="h-3.5 w-3.5 text-amber-500" />
                  <span>Điện thoại</span>
                </div>
                <span className={`font-semibold text-right ${showPhone ? "text-slate-800" : "text-slate-400 italic"}`}>
                  {showPhone ? effectivePhone : "Đã ẩn theo cài đặt riêng tư"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Mail className="h-3.5 w-3.5 text-amber-500" />
                  <span>Email</span>
                </div>
                <span className={`font-semibold text-right ${showEmail ? "text-slate-800" : "text-slate-400 italic"}`}>
                  {showEmail ? effectiveEmail : "Đã ẩn theo cài đặt riêng tư"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span>Địa chỉ</span>
                </div>
                <span className={`font-semibold text-right max-w-[240px] truncate ${showAddress ? "text-slate-800" : "text-slate-400 italic"}`}>
                  {showAddress ? effectiveAddress : "Đã ẩn theo cài đặt riêng tư"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Globe className="h-3.5 w-3.5 text-amber-500" />
                  <span>Website</span>
                </div>
                {showCompany && effectiveWebsite ? (
                  <a
                    href={effectiveWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#003B95] font-semibold hover:underline truncate max-w-[220px]"
                  >
                    <span>{effectiveWebsite.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic font-semibold">Đã ẩn</span>
                )}
              </div>
            </dl>

            {effectiveBio ? (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Giới thiệu
                </p>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {effectiveBio}
                </p>
              </div>
            ) : null}

            {showServices && servicesList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Sản phẩm & Dịch vụ chính
                </p>
                <div className="space-y-1.5">
                  {servicesList.map((s: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-slate-50 p-2 text-xs">
                      <p className="font-bold text-slate-900">{s.title}</p>
                      {s.description && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showNeeds && needsList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nhu cầu kết nối & Hợp tác
                </p>
                <div className="space-y-1.5">
                  {needsList.map((n: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-amber-50/60 p-2 text-xs">
                      <p className="font-bold text-amber-950">{n.title}</p>
                      {n.description && (
                        <p className="text-[11px] text-amber-800 mt-0.5">{n.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── PROFILE DOANH NGHIỆP 2 TRANG XUẤT HIỆN BÊN DƯỚI (CHUẨN THEO THẺ HỘI VIÊN) ── */}
          <div className="pt-1">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#003B95] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-amber-500" />
                <span>Profile doanh nghiệp bên dưới thẻ</span>
              </h3>
            </div>
            <CompanyProfileTwoPages
              data={{
                companyName: showCompany ? effectiveCompany : "CLB Doanh Nhân CEO 1983",
                leaderName: effectiveName,
                leaderTitle: effectiveTitle,
                memberCode: slug,
                officeAddress: showAddress ? effectiveAddress : undefined,
                hotline: showPhone ? effectivePhone : undefined,
                email: showEmail ? effectiveEmail : undefined,
                website: showCompany ? effectiveWebsite : undefined,
                avatarUrl: resolvedAvatar || null,
              }}
            />
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="border-t border-slate-200 bg-white p-3.5 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            Đóng xem trước
          </button>

          {effectiveKind !== "primary" ? (
            <button
              type="button"
              disabled={settingPrimary}
              onClick={() => void handleSetPrimary()}
              className="flex-[1.5] inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#002766] hover:from-[#002B70] hover:to-[#001D4D] py-2.5 text-xs font-bold text-white shadow-md transition active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              {settingPrimary ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              )}
              <span>Đặt làm danh thiếp chính</span>
            </button>
          ) : (
            <a
              href={`/card/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-[1.5] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-xs font-bold text-white shadow-md transition active:scale-98 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Xem trang quét thực tế</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
