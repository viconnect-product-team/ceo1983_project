import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useServerData } from "@/hooks/use-server-data";
import { listLandingWebsFn } from "@/lib/landing-webs.functions";
import {
  TimedCardsOpeningLanding,
  type LandingWebConfig,
} from "@/components/landing/TimedCardsOpeningLanding";
import { StartupMobileShowcaseLanding } from "@/components/landing/StartupMobileShowcaseLanding";
import { ForgeLuxuryAtelierLanding } from "@/components/landing/ForgeLuxuryAtelierLanding";
import {
  DEFAULT_TIMED_CARDS_TEMPLATE,
  DEFAULT_STARTUP_MOBILE_TEMPLATE,
  DEFAULT_FORGE_LUXURY_ATELIER_TEMPLATE,
} from "@/routes/admin.landing-webs";

export const Route = createFileRoute("/landing/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { apply?: string; ref?: string } => ({
    apply: typeof search.apply === "string" ? search.apply : undefined,
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "CLB Doanh Nhân CEO 1983 (HanoiBA) — Cổng Thông Tin & Kết Nối Giao Thương" },
      {
        name: "description",
        content:
          "Cổng thông tin chính thức CLB Doanh Nhân CEO 1983 thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA). Nơi quy tụ các chủ doanh nghiệp thế hệ 1983 kết nối giao thương và hợp tác phát triển.",
      },
      { property: "og:title", content: "CLB Doanh Nhân CEO 1983 (HanoiBA) — Kết Nối & Đồng Hành" },
      {
        property: "og:description",
        content: "Hệ sinh thái kết nối giao thương B2B dành riêng cho các lãnh đạo doanh nhân sinh năm 1983.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { apply, ref } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (apply === "true") {
      navigate({
        to: "/register",
        search: ref ? { ref } : undefined,
        replace: true,
      });
    }
  }, [apply, ref, navigate]);

  const listFn = useServerFn(listLandingWebsFn);
  const { data: landingWebs = [] } = useServerData<LandingWebConfig[]>(() => listFn(), []);

  // Tìm bản Landing Web đang được áp dụng (isPublished: true)
  const activeLanding = (() => {
    // 1. Kiểm tra cache localStorage nếu người dùng vừa xuất bản hoặc chỉnh sửa gần nhất
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("vba_landing_webs_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const pub = parsed.find((w: LandingWebConfig) => w.isPublished);
            if (pub) return pub;
          }
        }
      } catch {}
    }

    // 2. Kiểm tra từ danh sách CSDL trả về
    if (landingWebs && landingWebs.length > 0) {
      const pub = landingWebs.find((w) => w.isPublished);
      if (pub) return pub;
      return landingWebs[0];
    }

    // 3. Mặc định: Bản Mẫu 2 Startup Mobile Showcase đang áp dụng
    return DEFAULT_STARTUP_MOBILE_TEMPLATE;
  })();

  if (activeLanding.template === "forge_luxury_atelier") {
    return <ForgeLuxuryAtelierLanding config={activeLanding} />;
  }

  if (activeLanding.template === "startup_mobile_showcase") {
    return <StartupMobileShowcaseLanding config={activeLanding} />;
  }

  if (activeLanding.template === "timed_cards_opening") {
    return <TimedCardsOpeningLanding config={activeLanding} />;
  }

  return <StartupMobileShowcaseLanding config={activeLanding} />;
}
