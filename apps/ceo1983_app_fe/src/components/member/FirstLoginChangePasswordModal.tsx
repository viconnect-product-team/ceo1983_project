import React from "react";
import { ShieldAlert, KeyRound, LogOut, Lock } from "lucide-react";
import { toast } from "sonner";
import { AccountSecuritySettingsForm } from "./AccountSecuritySettingsForm";
import { clearUserSessionData } from "@/context/AuthContext";

interface FirstLoginChangePasswordModalProps {
  onSuccess?: () => void;
  onLogout?: () => void;
}

export function FirstLoginChangePasswordModal({
  onSuccess,
  onLogout,
}: FirstLoginChangePasswordModalProps) {
  const handlePasswordChangeSuccess = () => {
    try {
      localStorage.removeItem("vba_must_change_password");
      if (typeof window !== "undefined") {
        const rawUser = localStorage.getItem("auth_user");
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            u.mustChangePassword = false;
            u.must_change_password = false;
            localStorage.setItem("auth_user", JSON.stringify(u));
          } catch {}
        }
      }
    } catch {}

    toast.success("✓ Đổi mật khẩu lần đầu thành công!", {
      description: "Vì lý do bảo mật, Quý Anh/Chị vui lòng đăng nhập lại với mật khẩu mới.",
      duration: 5000,
    });

    if (onSuccess) {
      onSuccess();
    }

    // Luôn bắt buộc đăng nhập lại sau khi đổi mật khẩu lần đầu
    setTimeout(() => {
      clearUserSessionData();
      if (typeof window !== "undefined") {
        window.location.replace("/association/login?reason=password_changed");
      }
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300 select-none"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-400 shadow-2xl p-6 sm:p-7 space-y-5 my-auto text-slate-900">
        {/* Header Icon + Title */}
        <div className="text-center space-y-2">
          <div className="size-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-inner">
            <KeyRound className="size-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-widest text-amber-600 uppercase">
              Bảo Mật Tài Khoản Hội Viên
            </span>
            <h2 id="first-login-title" className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              Bắt Buộc Đổi Mật Khẩu Lần Đầu
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed px-1">
            Chào mừng Quý Hội viên đến với CLB Doanh Nhân CEO 1983. Vì lý do an toàn bảo mật, bạn <strong>bắt buộc phải đổi mật khẩu khởi tạo</strong>. Sau khi đổi thành công, hệ thống sẽ yêu cầu bạn <strong>đăng nhập lại</strong> với mật khẩu mới.
          </p>
        </div>

        {/* Form Đổi Mật Khẩu */}
        <div className="pt-1">
          <AccountSecuritySettingsForm
            isRequired={true}
            onSuccess={handlePasswordChangeSuccess}
          />
        </div>

        {/* Nút Đăng xuất nếu không muốn đổi lúc này */}
        <div className="pt-2 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                clearUserSessionData();
                window.location.replace("/association/login");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer py-1 px-3 rounded-lg hover:bg-rose-50"
          >
            <LogOut className="size-3.5" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}

