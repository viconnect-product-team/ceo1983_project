import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983MemberRegistrationForm } from "@/components/landing/Ceo1983MemberRegistrationForm";

const TITLE = "Đăng Ký Gia Nhập CLB Doanh Nhân CEO 1983 — ceo1983.com";
const DESC = "Đơn đăng ký gia nhập CLB Doanh Nhân CEO 1983. Điền thông tin doanh nghiệp để kết nối giao thương và gia nhập cộng đồng doanh nhân 1983.";

export const Route = createFileRoute("/landing/ceo/v1")({
  ssr: true,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:site_name", content: "CLB CEO 1983" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: Ceo1983CinematicRoute,
});

function Ceo1983CinematicRoute() {
  return <Ceo1983MemberRegistrationForm />;
}

