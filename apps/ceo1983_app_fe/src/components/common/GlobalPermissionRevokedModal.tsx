import React from "react";

export interface PermissionRevokedDetail {
  message?: string;
  actionCode?: string;
}

export function isAccountsManagementPage(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return (
    path.startsWith("/accounts") ||
    path.startsWith("/settings/accounts") ||
    path.includes("/accounts")
  );
}

/**
 * Hàm kích hoạt Popup Thông báo Thay đổi Quyền hạn từ bất kỳ đâu trong Frontend.
 * Đã gỡ bỏ hành vi hiển thị popup và tự reload theo yêu cầu hệ thống.
 */
export function triggerPermissionRevokedAlert(_detail?: string | PermissionRevokedDetail) {
  // Không hiển thị popup hay tự động reload trang
}

/**
 * GlobalPermissionRevokedModal
 * Đã gỡ bỏ hoàn toàn popup reload trang trong quản lý phân quyền theo yêu cầu người dùng.
 */
export const GlobalPermissionRevokedModal: React.FC = () => {
  return null;
};
