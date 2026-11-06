import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983FullLandingWeb } from "@/components/landing/Ceo1983FullLandingWeb";

export const Route = createFileRoute("/landing/")({
  head: () => ({
    meta: [
      { title: "CLB Doanh Nhân CEO 1983 (HanoiBA) — Cổng Thông Tin & Kết Nối Giao Thương" },
      {
        name: "description",
        content:
          "Cổng thông tin chính thức CLB Doanh Nhân CEO 1983 thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA). Nơi quy tụ các chủ doanh nghiệp thế hệ 1983 kết nối giao thương và hợp tác phát triển.",
      },
      { property: "og:title", content: "CLB Doanh Nhân CEO 1983 (HanoiBA) — Kết Nối & Đồng Hành" },
      { property: "og:description", content: "Hệ sinh thái kết nối giao thương B2B dành riêng cho các lãnh đạo doanh nhân sinh năm 1983." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return <Ceo1983FullLandingWeb />;
}
