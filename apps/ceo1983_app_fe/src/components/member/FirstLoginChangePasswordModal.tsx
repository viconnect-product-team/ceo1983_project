import React from "react";
import { ShieldAlert, KeyRound, LogOut } from "lucide-react";
import { AccountSecuritySettingsForm } from "./AccountSecuritySettingsForm";

interface FirstLoginChangePasswordModalProps {
  onSuccess: () => void;
  onLogout?: () => void;
}

export function FirstLoginChangePasswordModal({
  onSuccess,
  onLogout,
}: FirstLoginChangePasswordModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-amber-300/80 shadow-2xl p-6 sm:p-7 space-y-5 my-auto text-slate-900">
        {/* Header Icon + Title */}
        <div className="text-center space-y-2">
          <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-inner">
            <KeyRound className="size-7 stroke-[2.5]" />
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
            Chào mừng Quý Hội viên đến với CLB Doanh Nhân CEO 1983. Vì lý do an toàn bảo mật, bạn bắt buộc phải thay đổi mật khẩu khởi tạo trước khi bắt đầu sử dụng các tính năng của ứng dụng.
          </p>
        </div>

        {/* Form Đổi Mật Khẩu */}
        <div className="pt-1">
          <AccountSecuritySettingsForm
            isRequired={true}
            onSuccess={() => {
              onSuccess();
            }}
          />
        </div>

        {/* Nút Đăng xuất nếu không muốn đổi lúc này */}
        {onLogout && (
          <div className="pt-2 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer py-1 px-3 rounded-lg hover:bg-rose-50"
            >
              <LogOut className="size-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

