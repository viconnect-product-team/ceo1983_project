import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Users,
  Building2,
  Handshake,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Globe,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";

export const Route = createFileRoute("/share/$type/$id")({
  ssr: false,
  component: PublicSharePage,
  head: () => ({
    meta: [
      { title: "CEO 1983 — Bản Xem Trước Chia Sẻ Công Khai" },
      { name: "description", content: "Chia sẻ bài viết, sự kiện và cơ hội kết nối giao thương CLB Doanh Nhân CEO 1983 (HanoiBA)." },
      { property: "og:title", content: "CEO 1983 — Kết Nối Giao Thương Doanh Nhân" },
      { property: "og:type", content: "article" },
    ],
  }),
});

interface ShareItemData {
  id: string;
  type: "event" | "opportunity" | "post";
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  date?: string;
  time?: string;
  place?: string;
  authorName?: string;
  authorAvatar?: string;
  authorCompany?: string;
  tag?: string;
  value?: number;
  externalLink?: string;
}

export function detectExternalPlatform(): string {
  if (typeof window === "undefined") return "Web";
  try {
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get("source") || params.get("utm_source");
    if (sourceParam) {
      if (sourceParam.toLowerCase().includes("face") || sourceParam.toLowerCase() === "fb") return "Facebook";
      if (sourceParam.toLowerCase().includes("zalo")) return "Zalo";
      if (sourceParam.toLowerCase().includes("tele")) return "Telegram";
      return sourceParam;
    }

    const ua = navigator.userAgent || "";
    if (ua.includes("FBAN") || ua.includes("FBAV")) return "Facebook";
    if (ua.includes("Zalo")) return "Zalo";
    if (ua.includes("Telegram")) return "Telegram";
    if (ua.includes("MicroMessenger")) return "WeChat";

    const ref = document.referrer ? document.referrer.toLowerCase() : "";
    if (ref.includes("facebook.com") || ref.includes("fb.me")) return "Facebook";
    if (ref.includes("zalo.me") || ref.includes("chat.zalo")) return "Zalo";
    if (ref.includes("t.me") || ref.includes("telegram")) return "Telegram";
  } catch {}
  return "Web / Trình duyệt ngoài";
}

export function recordExternalShareClick(
  itemId: string,
  itemType: string,
  itemTitle: string,
  platform: string,
  converted = false
) {
  if (typeof window === "undefined") return;
  const clickRecord = {
    id: `clk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    itemId,
    itemType,
    itemTitle,
    platform,
    converted,
    userAgent: navigator.userAgent.slice(0, 100),
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem("vba_external_share_clicks") || "[]";
    const clicks = JSON.parse(raw);
    clicks.unshift(clickRecord);
    localStorage.setItem("vba_external_share_clicks", JSON.stringify(clicks.slice(0, 200)));
    window.dispatchEvent(new CustomEvent("vba_share_clicks_updated"));
  } catch {}

  // Gửi API backend nếu khả dụng
  fetchNestApi("/analytics/share-click", {
    method: "POST",
    body: JSON.stringify(clickRecord),
  }).catch(() => {});
}

function PublicSharePage() {
  const { type, id } = Route.useParams();
  const navigate = useNavigate();
  const [platform] = useState(() => detectExternalPlatform());
  const [item, setItem] = useState<ShareItemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const qTitle = searchParams.get("title");
        const qDesc = searchParams.get("desc") || searchParams.get("snippet");
        const qImage = searchParams.get("image");
        const qCompany = searchParams.get("company");
        const qPrice = searchParams.get("price") || searchParams.get("value");

        if (type === "event") {
          // Thử tải event từ backend
          const single = await fetchNestApi<any>(`/events/${id}`).catch(() => null);
          const found = single || (await fetchNestApi<any[]>("/events").catch(() => [])).find((e: any) => String(e.id) === String(id));
          if (found && isMounted) {
            setItem({
              id: found.id,
              type: "event",
              title: found.title,
              subtitle: found.category || "Sự kiện CLB CEO 1983",
              content: found.description || found.content || "Chương trình sự kiện trọng điểm của CLB CEO 1983 - HanoiBA.",
              image: found.cover_image || found.banner_url || found.image || "/skyline_perspective_dark.jpg",
              date: found.event_date || found.date,
              time: found.time,
              place: found.location || found.place,
              externalLink: found.fanpageUrl || found.webArticleUrl,
            });
            recordExternalShareClick(found.id, "event", found.title, platform, false);
            return;
          }
        } else if (type === "opportunity") {
          const single = await fetchNestApi<any>(`/opportunities/${id}`).catch(() => null);
          const found = single || (await fetchNestApi<any[]>("/opportunities").catch(() => [])).find((o: any) => String(o.id) === String(id));
          if (found && isMounted) {
            setItem({
              id: found.id,
              type: "opportunity",
              title: found.title,
              subtitle: found.industry || "Cơ hội giao thương B2B",
              content: found.description || found.desc || "Cơ hội kinh doanh và tìm kiếm đối tác cung ứng trong hiệp hội.",
              image: found.image || (Array.isArray(found.images) ? found.images[0] : undefined),
              authorName: found.contact_name || found.posterName || found.authorName,
              authorCompany: found.company,
              value: Number(found.budget_max || found.budgetMax || found.budget_min || found.value) || undefined,
              externalLink: found.externalLink || found.fanpageUrl,
            });
            recordExternalShareClick(found.id, "opportunity", found.title, platform, false);
            return;
          }
        } else if (type === "product" || (type as string) === "marketplace") {
          const single = await fetchNestApi<any>(`/products/${id}`).catch(() => null);
          const found = single || (await fetchNestApi<any[]>("/products").catch(() => [])).find((p: any) => String(p.id) === String(id));
          if (found && isMounted) {
            setItem({
              id: found.id,
              type: "opportunity",
              title: found.name || found.title || "Sản phẩm B2B",
              subtitle: found.category || "Sàn Thương Mại CEO 1983",
              content: found.description || "Sản phẩm / Dịch vụ tiêu biểu từ Hội viên Doanh nhân CEO 1983.",
              image: found.image_url || found.imageUrl || (Array.isArray(found.image_urls) ? found.image_urls[0] : undefined),
              authorCompany: found.company,
              value: Number(found.member_price || found.price) || undefined,
            });
            recordExternalShareClick(found.id, "product", found.name || found.title, platform, false);
            return;
          }
        } else if (type === "post" || (type as string) === "feed") {
          const single = await fetchNestApi<any>(`/feed/${id}`).catch(() => null);
          const found = single || (await fetchNestApi<any[]>("/feed").catch(() => [])).find((p: any) => String(p.id) === String(id));
          if (found && isMounted) {
            setItem({
              id: found.id,
              type: "post",
              title: found.title || `Bài viết từ ${found.authorName || "Hội viên CEO 1983"}`,
              subtitle: "Diễn đàn & Mạng lưới CEO 1983",
              content: found.content || "",
              image: Array.isArray(found.images) && found.images.length > 0 ? found.images[0] : undefined,
              authorName: found.authorName,
              authorAvatar: found.authorAvatar,
              authorCompany: found.department || found.authorCompany,
              externalLink: found.externalLink,
            });
            recordExternalShareClick(found.id, "post", found.title || found.content.slice(0, 30), platform, false);
            return;
          }
        }

        // Nếu có query params truyền từ link share, ưu tiên render ngay lập tức
        if (qTitle && isMounted) {
          setItem({
            id,
            type: (type as any) || "opportunity",
            title: qTitle,
            subtitle: qCompany ? `Doanh nghiệp: ${qCompany}` : "Hệ Sinh Thái Doanh Nhân CEO 1983",
            content: qDesc || "Bấm vào để xem chi tiết và kết nối trực tiếp với hội viên CEO 1983.",
            image: qImage || undefined,
            authorCompany: qCompany || undefined,
            value: qPrice ? Number(qPrice) : undefined,
          });
          recordExternalShareClick(id, type, qTitle, platform, false);
          return;
        }

        // Fallback demo data nếu không có bất kỳ thông tin nào
        if (isMounted) {
          const fallbackTitle =
            type === "event"
              ? "Diễn Đàn Doanh Nhân CEO 1983: Tiên Phong Đổi Mới 2026"
              : type === "opportunity"
              ? "Cơ Hội Hợp Tác Chuỗi Cung Ứng Vật Liệu Xây Dựng & B2B"
              : "Bản Tin Kinh Doanh & Chia Sẻ Kết Nối Giao Thương Tuần";

          setItem({
            id,
            type: (type as any) || "event",
            title: fallbackTitle,
            subtitle: "Hệ Sinh Thái Doanh Nhân CEO 1983 - HanoiBA",
            content:
              "Chào mừng Quý Anh/Chị đối tác và đại biểu doanh nhân. Đây là nội dung kết nối chính thức từ CLB Doanh Nhân CEO 1983 (Hiệp hội Doanh nghiệp Trẻ Hà Nội - HanoiBA).",
            image: "/skyline_perspective_dark.jpg",
            date: "2026-11-20",
            time: "08:30 - 17:00",
            place: "Trung Tâm Hội Nghị Quốc Gia, Hà Nội",
            authorName: "Ban Điều Hành CLB CEO 1983",
            authorCompany: "CLB Doanh Nhân CEO 1983",
          });
          recordExternalShareClick(id, type, fallbackTitle, platform, false);
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [type, id, platform]);

  const handleNavigateToLogin = () => {
    if (!item) return;
    // Ghi nhận chuyển đổi thành công
    recordExternalShareClick(item.id, item.type, item.title, platform, true);

    try {
      sessionStorage.setItem("vba_external_source", platform);
      sessionStorage.setItem("vba_external_redirect_item", JSON.stringify(item));
    } catch {}

    const targetUrl =
      item.type === "event"
        ? `/association/events`
        : item.type === "opportunity"
        ? `/association/opportunities`
        : `/association/messages?tab=feed`;

    toast.info("Đang chuyển tiếp đến màn hình đăng nhập...", {
      description: `Nguồn chia sẻ: ${platform}`,
    });

    navigate({
      to: "/association/login",
      search: {
        redirect: targetUrl,
      },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết xem trước!");
  };

  return (
    <div className="min-h-screen bg-[#070D1A] text-white flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Banner Branding */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070D1A]/90 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#003B95] to-[#001D4A] border border-amber-400/40 p-2 shadow-lg grid place-items-center">
              <span className="text-amber-400 font-black text-sm">83</span>
            </div>
            <div>
              <div className="text-[13px] font-black tracking-wide text-white flex items-center gap-1.5">
                <span>CLB DOANH NHÂN CEO 1983</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30 font-bold">
                  HanoiBA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Hệ Sinh Thái Kết Nối &amp; Giao Thương Số</p>
            </div>
          </div>
          <div className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Globe className="size-3" />
            <span>Nguồn: {platform}</span>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 mx-auto w-full max-w-xl p-4 sm:p-5 space-y-4">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="size-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Đang chuẩn bị bản xem trước...</p>
          </div>
        ) : item ? (
          <div className="rounded-3xl border border-white/10 bg-[#0E172A] overflow-hidden shadow-2xl space-y-4">
            {/* Banner/Poster Image */}
            <div className="relative min-h-52 w-full overflow-hidden bg-gradient-to-br from-[#001D4A] to-[#003B95] flex flex-col justify-end p-5">
              {item.image && (
                <img
                  src={resolveMediaUrl(item.image) || item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E172A] via-[#0E172A]/70 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase">
                  <Sparkles className="size-3.5" />
                  {item.type === "event" ? "Sự kiện hiệp hội" : item.type === "opportunity" ? "Cơ hội B2B" : "Bài viết mạng lưới"}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
                  {item.title}
                </h1>
                {item.subtitle && (
                  <p className="text-xs text-amber-300 font-semibold">{item.subtitle}</p>
                )}
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="px-5 space-y-3">
              {item.type === "event" && (
                <div className="rounded-2xl bg-white/[0.04] p-3.5 border border-white/5 space-y-2 text-xs">
                  {item.date && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="size-4 text-amber-400 shrink-0" />
                      <span>Thời gian: <strong className="text-white">{item.time ? `${item.time} | ` : ""}{item.date}</strong></span>
                    </div>
                  )}
                  {item.place && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="size-4 text-amber-400 shrink-0" />
                      <span>Địa điểm: <strong className="text-white">{item.place}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {item.type === "opportunity" && item.value && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent p-3.5 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Quy mô ngân sách</span>
                    <span className="text-base font-black text-amber-400">
                      {new Intl.NumberFormat("vi-VN").format(item.value)} VNĐ
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    Xác thực bởi CEO 1983
                  </span>
                </div>
              )}

              {/* Author Strip */}
              {item.authorName && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="size-10 rounded-full bg-[#003B95] border border-amber-400/40 text-amber-300 font-bold grid place-items-center text-sm shrink-0">
                    {item.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.authorName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.authorCompany || "Hội viên CLB CEO 1983"}</p>
                  </div>
                </div>
              )}

              {/* Summary Snippet */}
              <div className="text-slate-300 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line py-1">
                {item.content}
              </div>

              {/* Link Fanpage nếu có */}
              {item.externalLink && (
                <div className="pt-1">
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition text-xs font-bold"
                  >
                    <Globe className="size-3.5" />
                    <span>Xem bài viết gốc trên Fanpage / Website</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}

              {/* Event Registration / Protected Notice Banner */}
              {item.type === "event" ? (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="size-4 text-emerald-400" />
                    <span>Cổng Đăng Ký Công Khai Mở Rộng</span>
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Sự kiện chào đón Quý Khách mời và Doanh nhân tham dự. Bấm nút bên dưới để điền thông tin nhận vé điện tử và mã QR check-in ngay mà không cần tải hay đăng nhập app!
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="size-4 text-amber-400" />
                    <span>Khu Vực Dành Riêng Cho Hội Viên Doanh Nhân</span>
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Để xem toàn bộ tài liệu đính kèm, danh sách đại biểu tham gia hoặc liên hệ trực tiếp với tác giả, vui lòng bấm nút bên dưới để đăng nhập vào ứng dụng Hiệp hội.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 pb-5">
                {item.type === "event" ? (
                  <>
                    <Link
                      to="/guest-event-register/$eventId"
                      params={{ eventId: item.id }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
                    >
                      <Ticket className="size-4 stroke-[2.5]" />
                      <span>ĐĂNG KÝ THAM DỰ SỰ KIỆN (DÀNH CHO KHÁCH MỜI)</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleNavigateToLogin}
                      className="w-full py-2.5 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Hội viên CLB CEO 1983? Đăng nhập app tại đây</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNavigateToLogin}
                    className="w-full py-3.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-sm shadow-xl active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Xem Chi Tiết Bài Viết (Đăng Nhập)</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    <span>Sao chép liên kết</span>
                  </button>

                  <a
                    href="https://ceo1983.brandbook.vn/"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="size-3.5" />
                    <span>Về CLB CEO 1983</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-3">
            <p className="text-sm text-slate-400">Không tìm thấy bài viết hoặc sự kiện này.</p>
            <Link to="/association/login" className="inline-block text-xs font-bold text-amber-400 underline">
              Về trang đăng nhập
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070D1A] py-4 text-center text-[11px] text-slate-500">
        © 2026 CLB Doanh Nhân CEO 1983 — HanoiBA. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}
