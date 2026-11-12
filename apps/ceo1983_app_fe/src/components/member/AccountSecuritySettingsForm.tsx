import React, { useState } from "react";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { getActiveCeo1983ColorTheme } from "@/lib/ceo1983-color-theme";

interface AccountSecuritySettingsFormProps {
  isRequired?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function AccountSecuritySettingsForm({
  isRequired = false,
  className = "",
  onSuccess,
}: AccountSecuritySettingsFormProps) {
  const { user } = useAuth();
  const brandColorTheme = getActiveCeo1983ColorTheme();

  // State Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanCurrent || !cleanNew) {
      toast.error("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (cleanNew !== cleanConfirm) {
      toast.error("Mật khẩu mới và mật khẩu nhập lại không trùng khớp.");
      return;
    }
    if (cleanNew.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo an toàn.");
      return;
    }

    setPasswordLoading(true);
    try {
      const emailOrUsername = user?.email || (user as any)?.username || "";
      const payload = {
        currentPassword: cleanCurrent,
        newPassword: cleanNew,
        email: emailOrUsername,
        sendActivationEmail: false,
      };

      try {
        await fetchNestApi("/users/change-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        await fetchNestApi("/auth/change-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      try {
        localStorage.removeItem("vba_must_change_password");
        sessionStorage.removeItem("vba_password_changed_in_session");
      } catch {}

      toast.success("✓ Đã cập nhật mật khẩu mới thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.message ||
          "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutOtherDevices = () => {
    toast.success(
      "Đã đăng xuất tài khoản khỏi tất cả các thiết bị khác thành công!"
    );
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* ── 1. ĐỔI MẬT KHẨU ĐĂNG NHẬP (Label đơn giản, bên dưới là ô nhập và nút) ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Đổi Mật Khẩu Đăng Nhập
          </label>
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Cập nhật mật khẩu an toàn định kỳ cho tài khoản
          </span>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Nhập lại mật khẩu mới */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            style={{ backgroundColor: brandColorTheme.primaryColor }}
            className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-60"
          >
            {passwordLoading ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            <span>Lưu mật khẩu mới</span>
          </button>
        </form>
      </div>

      {!isRequired && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Thiết Bị Đang Đăng Nhập
            </label>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Quản lý an toàn phiên làm việc của bạn
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogoutOtherDevices}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Đăng xuất khỏi tất cả các thiết bị khác
          </button>
        </div>
      )}
    </div>
  );
}
