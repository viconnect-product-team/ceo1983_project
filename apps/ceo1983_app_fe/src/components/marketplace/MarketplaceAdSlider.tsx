import { useState, useEffect, useRef } from "react";
import { Megaphone, ExternalLink, Play, Sparkles, ChevronRight } from "lucide-react";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { isVideoMedia } from "@/components/marketplace/MarketplaceAdsManager";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface ActiveAdCampaign {
  id: string;
  requestId?: string;
  title: string;
  companyName: string;
  badgeText: string;
  bannerUrl: string;
  targetUrl: string;
  animation?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  impressions?: number;
  clicks?: number;
  companyAvatar?: string;
  description?: string;
}

const DEFAULT_SAMPLE_ADS: ActiveAdCampaign[] = [
  {
    id: "ad_active_001",
    title: "Giải pháp ERP Toàn diện & Số hóa Doanh nghiệp CEO 1983",
    companyName: "Công ty Cổ phần Công nghệ ABC",
    badgeText: "ĐỐI TÁC CHIẾN LƯỢC",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    targetUrl: "https://ceo1983.vn/marketplace",
    animation: "gradient-wave",
    status: "active",
  },
  {
    id: "ad_active_002",
    title: "Hệ sinh thái Nội thất Văn phòng & Biệt thự Cao cấp Hoàng Gia",
    companyName: "Tập đoàn Đầu tư & Xây dựng An Phát",
    badgeText: "TÀI TRỢ KIM CƯƠNG",
    bannerUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    targetUrl: "https://ceo1983.vn/marketplace",
    animation: "gold-shimmer",
    status: "active",
  },
];

export interface MarketplaceAdSliderProps {
  onSelectCompany?: (company: { name: string; avatarUrl?: string | null; bio?: string }) => void;
}

export function MarketplaceAdSlider({ onSelectCompany }: MarketplaceAdSliderProps = {}) {
  const navigate = useNavigate();
  const [ads, setAds] = useState<ActiveAdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchAds = async () => {
    try {
      const res = await fetchNestApi<ActiveAdCampaign[]>("/advertisements?activeOnly=true");
      if (Array.isArray(res) && res.length > 0) {
        setAds(res);
        try {
          localStorage.setItem("ceo1983_marketplace_ads", JSON.stringify(res));
        } catch {}
      } else {
        // Fallback from localStorage or sample
        const cached = localStorage.getItem("ceo1983_marketplace_ads");
        if (cached) {
          const parsed = JSON.parse(cached);
          const activeOnly = parsed.filter((a: any) => a.status === "active");
          setAds(activeOnly.length > 0 ? activeOnly : DEFAULT_SAMPLE_ADS);
        } else {
          setAds(DEFAULT_SAMPLE_ADS);
        }
      }
    } catch {
      const cached = localStorage.getItem("ceo1983_marketplace_ads");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const activeOnly = parsed.filter((a: any) => a.status === "active");
          setAds(activeOnly.length > 0 ? activeOnly : DEFAULT_SAMPLE_ADS);
        } catch {
          setAds(DEFAULT_SAMPLE_ADS);
        }
      } else {
        setAds(DEFAULT_SAMPLE_ADS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    const handleUpdate = () => fetchAds();
    window.addEventListener("ceo1983:ads-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ceo1983:ads-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Track active slide on scroll
  const handleScroll = () => {
    if (!sliderRef.current || ads.length <= 1) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.8));
    setActiveIndex(Math.min(Math.max(0, index), ads.length - 1));
  };

  const handleAdClick = (ad: ActiveAdCampaign) => {
    // Report click to backend
    fetchNestApi(`/advertisements/${ad.id}/click`, { method: "POST" }).catch(() => {});

    // Khi người dùng bấm Khám phá hoặc click quảng cáo, dẫn ngay vào gian hàng B2B của công ty chạy quảng cáo đó trong Chợ giao thương
    if (ad.companyName) {
      if (onSelectCompany) {
        onSelectCompany({
          name: ad.companyName,
          avatarUrl: ad.companyAvatar || ad.bannerUrl,
          bio: ad.description,
        });
        return;
      }
      window.dispatchEvent(
        new CustomEvent("vba:view_company_storefront", {
          detail: {
            name: ad.companyName,
            avatarUrl: ad.companyAvatar || ad.bannerUrl,
            bio: ad.description,
          },
        })
      );
      if (typeof window !== "undefined" && !window.location.pathname.includes("/association/products")) {
        navigate({
          to: "/association/products",
          search: { company: ad.companyName } as any,
        });
      }
      return;
    }

    if (ad.targetUrl && (ad.targetUrl.startsWith("http://") || ad.targetUrl.startsWith("https://"))) {
      window.open(ad.targetUrl, "_blank");
    } else {
      toast.info(`Quảng cáo từ ${ad.companyName}: ${ad.title}`);
    }
  };

  if (loading && ads.length === 0) {
    return null;
  }

  if (ads.length === 0) {
    return null;
  }

  const isSingle = ads.length === 1;

  return (
    <div className="w-full space-y-2.5">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-500/20 text-amber-500 text-[11px]">
            <Megaphone className="h-3 w-3" />
          </span>
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
            <span>Đối Tác Chiến Lược & Tài Trợ</span>
            <Sparkles className="h-3 w-3 text-amber-500" />
          </h3>
        </div>
        {ads.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {activeIndex + 1}/{ads.length}
            </span>
          </div>
        )}
      </div>

      {/* Slider Vuốt Ngang (Horizontal Carousel) tương tự giao diện Sự Kiện */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory overscroll-x-contain"
      >
        {ads.map((ad, idx) => {
          const mediaUrl = resolveMediaUrl(ad.bannerUrl) || ad.bannerUrl;
          const isVideo = isVideoMedia(mediaUrl);

          return (
            <div
              key={ad.id || idx}
              onClick={() => handleAdClick(ad)}
              className={`group flex flex-col transition active:scale-98 shrink-0 snap-start cursor-pointer ${
                isSingle ? "w-full" : "w-[290px] max-w-[85%] min-w-[250px]"
              }`}
            >
              {/* Media Card */}
              <div className="relative h-[135px] w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-sm group-hover:shadow-md transition-all group-hover:border-amber-400/60">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={ad.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Badges Top Left & Right */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    {ad.badgeText || "ĐỐI TÁC CHIẾN LƯỢC"}
                  </span>
                  {isVideo && (
                    <span className="flex items-center gap-0.5 rounded bg-blue-600/90 text-white text-[9px] font-bold px-1 py-0.5 shadow-xs">
                      <Play className="h-2.5 w-2.5 fill-white" />
                      <span>VIDEO</span>
                    </span>
                  )}
                </div>

                {/* Bottom Content info */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 z-10 flex flex-col gap-0.5 text-white pointer-events-none">
                  <div className="text-[10px] text-amber-300 font-semibold truncate">
                    {ad.companyName}
                  </div>
                  <div className="text-xs font-bold leading-tight line-clamp-1 group-hover:text-amber-200 transition-colors">
                    {ad.title}
                  </div>
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-300">
                    <span className="text-slate-400 text-[9px] truncate max-w-[130px]">CEO 1983 B2B Sàn giao thương</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdClick(ad);
                      }}
                      className="pointer-events-auto font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/40 transition active:scale-95 cursor-pointer"
                    >
                      <span>Khám phá</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {ads.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {ads.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (!sliderRef.current) return;
                const width = sliderRef.current.clientWidth * 0.82;
                sliderRef.current.scrollTo({ left: i * width, behavior: "smooth" });
                setActiveIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-5 bg-amber-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
              }`}
              aria-label={`Chuyển tới quảng cáo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
