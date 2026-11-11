// Cổng Tiếp Nhận Đơn Đăng Ký Gia Nhập Hiệp Hội CLB Doanh Nhân CEO 1983 (/association/register)
// Tách biệt hoàn toàn, độc lập 100% khỏi ViOne và các hệ thống bên ngoài.

import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983MemberRegistrationForm } from "@/components/landing/Ceo1983MemberRegistrationForm";

export const Route = createFileRoute("/association/register")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { email?: string; ref?: string } => ({
    ...(typeof search.email === "string" ? { email: search.email } : {}),
    ...(typeof search.ref === "string" ? { ref: search.ref } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Đăng Ký Gia Nhập — CLB Doanh Nhân CEO 1983" },
      {
        name: "description",
        content:
          "Cổng tiếp nhận hồ sơ gia nhập Hiệp Hội Doanh Nghiệp CLB Doanh Nhân CEO 1983. Kết nối đồng niên, gắn kết thương trường, mở rộng giao thương doanh nghiệp.",
      },
      { property: "og:title", content: "Đăng Ký Gia Nhập — CLB Doanh Nhân CEO 1983" },
      {
        property: "og:description",
        content:
          "Cổng tiếp nhận hồ sơ gia nhập Hiệp Hội Doanh Nghiệp CLB Doanh Nhân CEO 1983. Kết nối đồng niên, gắn kết thương trường.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssociationRegisterPage,
});

function AssociationRegisterPage() {
  const { email, ref } = Route.useSearch();
  return <Ceo1983MemberRegistrationForm initialEmail={email} referrerCodeProp={ref} />;
}

