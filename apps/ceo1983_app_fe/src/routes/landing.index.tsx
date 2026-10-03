import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983MemberRegistrationForm } from "@/components/landing/Ceo1983MemberRegistrationForm";

export const Route = createFileRoute("/landing/")({
  head: () => ({
    meta: [
      { title: "Đăng Ký Gia Nhập CLB Doanh Nhân CEO 1983 — ceo1983.com" },
      {
        name: "description",
        content:
          "Đơn đăng ký gia nhập CLB Doanh Nhân CEO 1983. Điền thông tin doanh nghiệp để kết nối giao thương và gia nhập cộng đồng doanh nhân 1983.",
      },
      { property: "og:title", content: "Đăng Ký Gia Nhập CLB Doanh Nhân CEO 1983" },
    ],
  }),
  component: MemberRegistrationPage,
});

function MemberRegistrationPage() {
  return <Ceo1983MemberRegistrationForm />;
}
