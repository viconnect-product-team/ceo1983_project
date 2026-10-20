import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();

  const [identifier, setIdentifier] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const rawUser = localStorage.getItem("auth_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        return u?.email || u?.username || "";
      }
    } catch {}
    return user?.email || "";
  });

  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("vba_member_phone") || (user as any)?.phone || "";
    } catch {}
    return (user as any)?.phone || "";
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modal xác nhận kích hoạt tài khoản
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [updatedAccountData, setUpdatedAccountData] = useState<any>(null);
  const [confirmActivatingLoading, setConfirmActivatingLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!identifier.trim()) {
      toast.error("Vui lòng nhập email hoặc tài khoản đăng nhập.");
      return;
    }
    if (!cleanCurrent || !cleanNew) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (cleanNew !== cleanConfirm) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (cleanNew.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordLoading(true);
    try {
      let res: any = null;
      const payload = {
        currentPassword: cleanCurrent,
        newPassword: cleanNew,
        email: identifier.trim(),
        phone: phone.trim() || undefined,
        fullName: user?.name,
        sendActivationEmail: true,
      };

      try {
        res = await fetchNestApi("/users/change-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        res = await fetchNestApi("/auth/change-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      // Xóa cờ bắt buộc đổi mật khẩu khi đã đổi thành công
      try {
        localStorage.removeItem("vba_must_change_password");
        sessionStorage.removeItem("vba_password_changed_in_session");
      } catch {}

      const accountSummary = {
        email: res?.updatedAccount?.email || identifier.trim(),
        phone: res?.updatedAccount?.phone || phone.trim() || (user as any)?.phone,
        fullName: res?.updatedAccount?.fullName || user?.name || "Hội viên",
        memberCode: res?.updatedAccount?.memberCode || (user as any)?.code || (user as any)?.memberCode || "M1983-MEMBER",
        companyName: res?.updatedAccount?.companyName || "CLB Doanh Nhân CEO 1983",
        newPassword: newPassword,
        emailUpdated: res?.updatedAccount?.emailUpdated || false,
        emailSent: res?.updatedAccount?.emailSent ?? true,
      };

      setUpdatedAccountData(accountSummary);
      setActivationModalOpen(true);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFinalConfirmActivation = async () => {
    setConfirmActivatingLoading(true);
    try {
      const emailToNotify = updatedAccountData?.email || identifier.trim();
      try {
        await fetchNestApi("/mail/send-dynamic", {
          method: "POST",
          body: JSON.stringify({
            templateCode: "APP_ACCOUNT_ACTIVATED",
            to: emailToNotify,
            variables: {
              full_name: updatedAccountData?.fullName || user?.name || "Hội viên",
              email: emailToNotify,
              phone: updatedAccountData?.phone || "",
              member_code: updatedAccountData?.memberCode || "",
            },
          }),
        }).catch(() => null);
      } catch {}

      toast.success(
        `✓ Đã cập nhật tài khoản thành công! Thông báo đã gửi về email ${emailToNotify}. Quý hội viên vui lòng đăng nhập lại.`,
        { duration: 8000 }
      );

      setActivationModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await signOutSession();
      authLogout?.();
      navigate({
        to: "/association/login" as any,
        search: { reset: "success" } as any,
        replace: true,
      });
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xác nhận kích hoạt.");
    } finally {
      setConfirmActivatingLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {isRequired && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3 shadow-md mb-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-[13px] text-amber-600 dark:text-amber-400 mb-0.5">
              Bảo Mật Bắt Buộc Cho Hội Viên Mới
            </strong>
            Bạn đang sử dụng mật khẩu khởi tạo từ hệ thống. Để bảo vệ dữ liệu hội viên và quyền riêng tư, bắt buộc đổi sang mật khẩu cá nhân mới của bạn. Sau khi đổi thành công, hệ thống sẽ tự động chuyển bạn ra màn hình đăng nhập.
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="size-8 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#003B95] dark:text-amber-400 grid place-items-center border border-blue-100 dark:border-amber-500/30">
            <Lock className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#003B95] dark:text-amber-400 uppercase tracking-wider">
              Đổi thông tin tài khoản &amp; Mật khẩu
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Quản lý định danh đăng nhập và bảo mật tài khoản
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Badge mã tài khoản */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Mã hội viên liên kết:</span>
              </span>
              <span className="text-xs font-mono font-black text-[#003B95] dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-300/50 shadow-2xs">
                {(user as any)?.code || (user as any)?.memberCode || user?.email || "CEO1983-MEMBER"}
              </span>
            </div>
            <p className="text-[10.5px] text-amber-700/90 dark:text-amber-400/80 mt-1">
              Hội viên có thể đăng nhập bằng Mã hội viên, Email hoặc Số điện thoại cùng với mật khẩu của mình.
            </p>
          </div>

          {/* 1. Tên tài khoản / Email đăng nhập */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-500" />
                <span>Tên tài khoản / Email đăng nhập</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                * Nhập email mới nếu muốn đổi
              </span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập địa chỉ email đăng nhập..."
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
            </div>
          </div>

          {/* 2. Số điện thoại đăng nhập liên kết */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <Phone className="h-3.5 w-3.5 text-amber-500" />
              <span>Số điện thoại đăng nhập liên kết</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại (VD: 0983198383)..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
            </div>
          </div>

          {/* 3. Mật khẩu hiện tại */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 4. Mật khẩu mới */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 5. Xác nhận mật khẩu mới */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 pr-10 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nút lưu */}
          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#003B95] to-[#001D4A] hover:brightness-110 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {passwordLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <KeyRound className="h-4 w-4 text-amber-300" />
            )}
            <span>Xác nhận cập nhật thông tin &amp; Đổi mật khẩu</span>
          </button>
        </form>
      </div>

      {/* Modal Popup Tóm Tắt & Kích Hoạt Tài Khoản Thành Công */}
      <Dialog open={activationModalOpen} onOpenChange={() => {}}>
        <DialogContent
          className="w-[92vw] max-w-md p-0 rounded-3xl overflow-hidden border border-amber-500/30 bg-white dark:bg-[#0A1224] shadow-2xl text-slate-900 dark:text-white"
        >
          <div className="relative p-6 bg-gradient-to-br from-[#001D4A] via-[#003B95] to-[#0A1931] text-white text-center overflow-hidden">
            <div className="size-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 grid place-items-center shadow-lg mb-3">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-white">
              Cập Nhật Mật Khẩu Thành Công!
            </DialogTitle>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              Thông tin tài khoản đăng nhập của bạn đã được cập nhật
            </p>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Tài khoản (Email):</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {updatedAccountData?.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Số điện thoại liên kết:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {updatedAccountData?.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Mã hội viên:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {updatedAccountData?.memberCode}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Nhấn <strong>Đăng nhập lại</strong> bên dưới để hoàn tất việc cập nhật và đăng nhập vào ứng dụng với mật khẩu mới.
            </p>

            <button
              type="button"
              onClick={handleFinalConfirmActivation}
              disabled={confirmActivatingLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {confirmActivatingLoading ? (
                <Loader2 className="size-4 animate-spin text-slate-950" />
              ) : (
                <ShieldCheck className="size-4 text-slate-950" />
              )}
              <span>Đăng nhập lại ngay</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default AccountSecuritySettingsForm;
