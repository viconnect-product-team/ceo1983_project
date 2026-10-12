import React, { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export interface PermissionRevokedDetail {
  message?: string;
  actionCode?: string;
}

/**
 * Hàm kích hoạt Popup Thông báo Thay đổi Quyền hạn từ bất kỳ đâu trong Frontend.
 */
export function triggerPermissionRevokedAlert(detail?: string | PermissionRevokedDetail) {
  if (typeof window === "undefined") return;
  const payload = typeof detail === "string" ? { message: detail } : detail || {};
  window.dispatchEvent(
    new CustomEvent("vba:permission_revoked", {
      detail: payload,
    })
  );
}

/**
 * GlobalPermissionRevokedModal
 *
 * Xử lý tình huống phân quyền thời gian thực:
 * Giả sử tài khoản B đang thao tác nhưng chưa lưu, chưa xóa, mà tài khoản A (có quyền quản trị)
 * vừa thay đổi quyền thao tác của tài khoản B.
 * Khi tài khoản B bấm Lưu, Xóa, hoặc Chỉnh sửa, hệ thống sẽ chặn thao tác và hiển thị
 * Popup thông báo trang trọng ở CHÍNH GIỮA MÀN HÌNH thông báo quyền hạn đã bị thay đổi,
 * sau đó tự động reload lại trang để hiển thị chính xác các quyền mới đã được cập nhật.
 */
export const GlobalPermissionRevokedModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    // 1. Lắng nghe CustomEvent từ API Client hoặc các nút thao tác
    const handleRevoked = (e: Event) => {
      const customEvt = e as CustomEvent<PermissionRevokedDetail>;
      const msg =
        customEvt.detail?.message ||
        "Quyền hạn của bạn đã bị thay đổi bởi Quản trị viên. Hệ thống sẽ tải lại để áp dụng cấu hình phân quyền mới nhất.";
      setMessage(msg);
      setIsOpen(true);
      setCountdown(4);
    };

    // 2. Lắng nghe sự kiện BroadcastChannel giữa các tab/cửa sổ khi admin lưu quyền
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("vba_permission_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "PERMISSION_CHANGED") {
            const currentUserId =
              localStorage.getItem("vba_user_id") ||
              localStorage.getItem("userId") ||
              "";
            // Nếu người bị ảnh hưởng là tài khoản hiện tại hoặc thay đổi ma trận toàn hệ thống
            if (
              !event.data.targetUserId ||
              event.data.targetUserId === currentUserId
            ) {
              setMessage(
                event.data.message ||
                  "Quyền hạn của bạn đã bị thay đổi bởi Quản trị viên. Hệ thống sẽ tải lại để áp dụng phân quyền mới."
              );
              setIsOpen(true);
              setCountdown(4);
            }
          }
        };
      }
    } catch {
      // ignore
    }

    // 3. Lắng nghe Storage event từ localStorage giữa các tab cùng origin
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "vba_permission_last_updated" ||
        e.key === "vba_user_role" ||
        e.key === "vba_current_role"
      ) {
        // Có sự thay đổi quyền từ tab quản trị
        setMessage(
          "Cấu hình quyền hạn tài khoản của bạn vừa được cập nhật. Hệ thống sẽ tải lại trang để đồng bộ quyền mới."
        );
        setIsOpen(true);
        setCountdown(4);
      }
    };

    window.addEventListener("vba:permission_revoked", handleRevoked);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("vba:permission_revoked", handleRevoked);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Bộ đếm ngược tự động tải lại trang khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    if (countdown <= 0) {
      window.location.reload();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="perm-revoked-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 text-center text-white shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Shield Icon Badge */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 shadow-inner">
          <ShieldAlert className="h-9 w-9 text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <h3
          id="perm-revoked-title"
          className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2"
        >
          Quyền hạn của bạn đã bị thay đổi
        </h3>

        {/* Message */}
        <p className="text-sm leading-relaxed text-slate-300 font-medium mb-6">
          {message ||
            "Quản trị viên vừa thay đổi quyền thao tác cho tài khoản của bạn. Các thao tác chưa lưu sẽ được hủy bỏ để cập nhật phân quyền mới nhất."}
        </p>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-3.5 px-5 font-bold text-white shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Tải lại trang ngay ({countdown}s)</span>
          </button>
          <p className="text-xs text-slate-400">
            Hệ thống sẽ tự động làm mới trang sau {countdown} giây...
          </p>
        </div>
      </div>
    </div>
  );
};
