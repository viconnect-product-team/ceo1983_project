import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Chức năng phân quyền đã được loại bỏ hoàn toàn khỏi App Mobile CEO 1983
 * và chuyển về Web Quản Trị Hệ Thống Doanh Nghiệp (CRM /permissions).
 */
export const Route = createFileRoute("/association/permissions")({
  beforeLoad: () => {
    throw redirect({ to: "/association" });
  },
  component: () => null,
});
