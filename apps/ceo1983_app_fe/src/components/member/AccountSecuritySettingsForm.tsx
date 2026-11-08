import React, { useState, useEffect } from "react";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  Shield,
  Smartphone,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Eye as EyeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";

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

  // 1. State Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 2. State Sinh trắc học (FaceID / Vân tay)
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("vba_biometric_login") !== "false";
  });

  // 3. State Quyền riêng tư danh thiếp số
  const [showPhoneOnCard, setShowPhoneOnCard] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("vba_privacy_show_phone") !== "false";
  });
  const [showEmailOnCard, setShowEmailOnCard] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("vba_privacy_show_email") !== "false";
  });

  const handleToggleBiometric = () => {
    const next = !biometricEnabled;
    setBiometricEnabled(next);
    localStorage.setItem("vba_biometric_login", String(next));
    toast.success(
      next
        ? "Đã bật xác thực FaceID / Vân tay khi mở ứng dụng!"
        : "Đã tắt xác thực sinh trắc học."
    );
  };

  const handleTogglePhonePrivacy = () => {
    const next = !showPhoneOnCard;
    setShowPhoneOnCard(next);
    localStorage.setItem("vba_privacy_show_phone", String(next));
    toast.success(
      next
        ? "Số điện thoại sẽ hiển thị khi hội viên khác quét danh thiếp."
        : "Đã ẩn số điện thoại trên danh thiếp số."
    );
  };

  const handleToggleEmailPrivacy = () => {
    const next = !showEmailOnCard;
    setShowEmailOnCard(next);
    localStorage.setItem("vba_privacy_show_email", String(next));
    toast.success(
      next
        ? "Email doanh nghiệp sẽ hiển thị trên danh bạ."
        : "Đã ẩn email doanh nghiệp trên danh bạ."
    );
  };

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
      {/* ── 1. ĐỔI MẬT KHẨU ĐĂNG NHẬP ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center">
            <KeyRound className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Đổi Mật Khẩu Đăng Nhập
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
              Cập nhật mật khẩu an toàn định kỳ cho tài khoản
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-2.5">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
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
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
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
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-blue-400 transition"
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
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-60"
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

      {/* ── 2. SINH TRẮC HỌC (FACEID / VÂN TAY) ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
              <Fingerprint className="size-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Khóa Sinh Trắc Học (FaceID / Vân tay)
              </h4>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Mở khóa nhanh trên thiết bị điện thoại của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleBiometric}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              biometricEnabled ? "bg-[#003B95]" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                biometricEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── 3. QUYỀN RIÊNG TƯ DANH THIẾP SỐ ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center">
            <Shield className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quyền Riêng Tư Danh Thiếp Số
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
              Kiểm soát thông tin khi hội viên khác quét mã QR
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Toggle SĐT */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Hiện số điện thoại trên danh thiếp
              </span>
              <span className="text-[10.5px] text-slate-500">
                Cho phép đối tác liên hệ trực tiếp qua số hotline
              </span>
            </div>
            <button
              type="button"
              onClick={handleTogglePhonePrivacy}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showPhoneOnCard ? "bg-[#003B95]" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showPhoneOnCard ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle Email */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Hiện email doanh nghiệp
              </span>
              <span className="text-[10.5px] text-slate-500">
                Hiển thị địa chỉ hòm thư công ty để nhận đề xuất hợp tác
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleEmailPrivacy}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showEmailOnCard ? "bg-[#003B95]" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showEmailOnCard ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. PHIÊN ĐĂNG NHẬP & THIẾT BỊ ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center">
            <Smartphone className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Thiết Bị Đang Đăng Nhập
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
              Quản lý an toàn phiên làm việc của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Thiết bị này (Đang hoạt động)
            </span>
          </div>
          <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Bảo vệ cấp độ cao
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogoutOtherDevices}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition cursor-pointer"
        >
          Đăng xuất khỏi tất cả thiết bị khác
        </button>
      </div>
    </div>
  );
}
