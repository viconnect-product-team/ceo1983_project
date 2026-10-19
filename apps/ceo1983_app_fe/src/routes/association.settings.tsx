import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Lock,
  Bell,
  Sun,
  Moon,
  Contrast,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  KeyRound,
  Sparkles,
  AlertTriangle,
  X,
  Info,
  User,
  Phone,
  CheckCircle2,
  Mail,
  Send,
  Eye,
  EyeOff,
  Bot,
  BookOpen,
  Download,
  ExternalLink,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, type MyMember } from "@/lib/member-app.functions";
import { useTheme, type Theme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestNotificationPermission, sendCallNotification } from "@/lib/notification-permissions";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import {
  isVoiceAiEnabled,
  setVoiceAiEnabled,
  VOICE_AI_EVENT_NAME,
} from "@/components/ai/Ceo1983ChatAssistant";

export const Route = createFileRoute("/association/settings")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): {
    action?: string;
    required?: string;
  } => ({
    ...(typeof search.action === "string" ? { action: search.action } : {}),
    ...(typeof search.required === "string" ? { required: search.required } : {}),
  }),
  component: AssociationSettingsScreen,
});

function AssociationSettingsScreen() {
  const navigate = useNavigate();
  const { action, required } = Route.useSearch();
  const { user, logout: authLogout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang } = useLang();
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);

  // Form states for password change
  const [identifier, setIdentifier] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const rawUser = localStorage.getItem("auth_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        return u?.email || u?.username || "";
      }
    } catch {}
    return "";
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("vba_member_phone") || "";
    } catch {}
    return "";
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Account activation summary popup modal
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [updatedAccountData, setUpdatedAccountData] = useState<any>(null);
  const [confirmActivatingLoading, setConfirmActivatingLoading] = useState(false);

  // Track if password was changed in the active session
  const [passwordChangedInSession, setPasswordChangedInSession] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("vba_password_changed_in_session") === "true";
  });

  // Account deactivation states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Preferences states
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [aiEnabled, setAiEnabledState] = useState(() => isVoiceAiEnabled());
  const [userGuideOpen, setUserGuideOpen] = useState(false);

  useEffect(() => {
    const handleSyncAi = () => {
      setAiEnabledState(isVoiceAiEnabled());
    };
    window.addEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
    window.addEventListener("ceo1983_ai_toggle", handleSyncAi);
    window.addEventListener("storage", handleSyncAi);
    return () => {
      window.removeEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
      window.removeEventListener("ceo1983_ai_toggle", handleSyncAi);
      window.removeEventListener("storage", handleSyncAi);
    };
  }, []);

  const handleToggleAi = (checked: boolean) => {
    setAiEnabledState(checked);
    setVoiceAiEnabled(checked);
    toast.success(checked ? "Đã bật Trợ lý AI CEO 1983" : "Đã tắt Trợ lý AI CEO 1983");
  };

  // Sync initial identifier from user or member data when loaded
  useEffect(() => {
    if (!identifier && (user?.email || member?.email)) {
      setIdentifier(user?.email || member?.email || "");
    }
    if (!phone && (user?.phone || member?.phone)) {
      setPhone(user?.phone || member?.phone || "");
    }
  }, [user, member]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Vui lòng nhập email hoặc tài khoản đăng nhập.");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordLoading(true);
    try {
      let res: any = null;
      const payload = {
        currentPassword,
        newPassword,
        email: identifier.trim(),
        phone: phone.trim() || undefined,
        fullName: member?.name || user?.name,
        sendActivationEmail: true,
      };

      try {
        res = await fetchNestApi("/users/change-password", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (firstErr: any) {
        // Fallback to /auth/change-password if /users/change-password failed
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

      setPasswordChangedInSession(true);

      const accountSummary = {
        email: res?.updatedAccount?.email || identifier.trim(),
        phone: res?.updatedAccount?.phone || phone.trim() || member?.phone,
        fullName: res?.updatedAccount?.fullName || member?.name || user?.name || "Hội viên",
        memberCode: res?.updatedAccount?.memberCode || member?.code || "M1983-MEMBER",
        companyName: res?.updatedAccount?.companyName || (member as any)?.company || "CLB Doanh Nhân CEO 1983",
        newPassword: newPassword,
        emailUpdated: res?.updatedAccount?.emailUpdated || false,
        emailSent: res?.updatedAccount?.emailSent ?? true,
      };

      setUpdatedAccountData(accountSummary);
      setActivationModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFinalConfirmActivation = async () => {
    setConfirmActivatingLoading(true);
    try {
      // Bắn email thông báo kích hoạt tài khoản thành công về email hội viên
      const emailToNotify = updatedAccountData?.email || identifier.trim();
      try {
        await fetchNestApi("/mail/send-dynamic", {
          method: "POST",
          body: JSON.stringify({
            templateCode: "APP_ACCOUNT_ACTIVATED",
            to: emailToNotify,
            variables: {
              full_name: updatedAccountData?.fullName || member?.name || "Hội viên",
              email: emailToNotify,
              phone: updatedAccountData?.phone || "",
              member_code: updatedAccountData?.memberCode || "",
            },
          }),
        }).catch(() => null);
      } catch {}

      toast.success(
        `✓ Đã kích hoạt tài khoản thành công! Thông báo đã được gửi về email ${emailToNotify}. Quý hội viên vui lòng đăng nhập lại.`,
        { duration: 8000 },
      );

      setActivationModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Đăng xuất phiên cũ để người dùng đăng nhập lại với thông tin mới
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

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeactivateLoading(true);
    try {
      await fetchNestApi("/users/deactivate", {
        method: "POST",
        body: JSON.stringify({ password: deactivatePassword }),
      });
      toast.info("Tài khoản đã được vô hiệu hóa thành công.");
      setDeactivateModalOpen(false);
      await signOutSession();
      authLogout?.();
      navigate({ to: "/association/login" as any, replace: true });
    } catch (err: any) {
      toast.error(err.message || "Không thể vô hiệu hóa tài khoản. Vui lòng kiểm tra lại mật khẩu.");
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!passwordChangedInSession) {
      toast.warning("Vui lòng đổi mật khẩu thành công ít nhất một lần để đảm bảo an toàn trước khi đăng xuất.");
      return;
    }
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  };

  return (
    <div className="vba-animate pb-28 min-h-screen bg-slate-50 dark:bg-[#070D1A] text-slate-900 dark:text-white">
      <MemberHeader
        title="Bảo mật & Cài đặt"
        subtitle="Hiệp hội Doanh nhân CEO 1983"
        back={required !== "true"}
      />

      <div className="mx-4 mt-4 space-y-4">
        {/* CEO 1983 Association Badge Header */}
        <div className="p-4 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-[#00224F] via-[#003B95] to-[#0A1A3A] text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/60">
              <img src="/ceo1983-logo.png" alt="CEO 1983" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                CLB DOANH NHÂN 1983
              </div>
              <h2 className="text-[16px] font-black text-white leading-snug truncate">
                {member?.name || "Hội viên Doanh nhân"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-300 border border-amber-400/40">
                  <ShieldCheck className="h-3 w-3 text-amber-300" /> {member?.code || "M1983-MEMBER"}
                </span>
                <span className="text-[11px] text-blue-100 truncate">
                  {member?.title || "Hội viên chính thức"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Change Password Section */}
        {required === "true" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3 shadow-md mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-[13px] text-amber-600 dark:text-amber-400 mb-0.5">
                Bảo Mật Bắt Buộc Cho Hội Viên Mới
              </strong>
              Bạn đang sử dụng mật khẩu khởi tạo từ hệ thống. Để bảo vệ dữ liệu hội viên và quyền riêng tư, bắt buộc đổi sang mật khẩu cá nhân mới của bạn. Sau khi đổi thành công, hệ thống sẽ tự động chuyển bạn ra màn hình đăng nhập để đăng nhập lại.
            </div>
          </div>
        )}

        <section id="password-section" className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
            <Lock className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" /> Thiết lập tài khoản & Đổi mật khẩu
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {/* Trường Tài Khoản Đăng Nhập / Mã Hội Viên Hệ Thống Cấp */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 mb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-600" />
                  <span>Tài khoản đăng nhập:</span>
                </span>
                <span className="text-xs font-mono font-black text-[#003B95] dark:text-amber-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-amber-300/50 shadow-2xs">
                  {user?.code || (user as any)?.memberCode || member?.code || user?.email || "CEO1983-MEMBER"}
                </span>
              </div>
              <p className="text-[10.5px] text-amber-700 dark:text-amber-400/90 mt-1">
                Tài khoản chính thức được cấp theo Mã số hội viên &amp; Email. Quý hội viên có thể dùng Mã này, Email hoặc Số điện thoại để đăng nhập.
              </p>
            </div>

            {/* Trường Email tài khoản đăng nhập */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-amber-500" />
                  <span>Tài khoản đăng nhập (Email nhận tin &amp; kích hoạt)</span>
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                  * Nhập email mới nếu muốn đổi mail nhận tin
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

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Phone className="h-3 w-3 text-amber-500" />
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
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                Hội viên có thể đăng nhập bằng <strong>Email</strong> hoặc <strong>Số điện thoại</strong> này cùng với mật khẩu mới.
              </p>
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Mật khẩu hiện tại (mật khẩu được cấp ở mail)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#003B95]/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003B95] to-[#001D4A] hover:brightness-110 py-3 text-xs font-bold text-white shadow-md shadow-blue-900/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              style={{ color: "#ffffff" }}
            >
              {passwordLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <KeyRound className="h-3.5 w-3.5 text-white" />
              )}
              <span className="text-white font-bold">Xác nhận cập nhật tài khoản & Đổi mật khẩu</span>
            </button>
          </form>
        </section>

        {required !== "true" && (
          <>
            {/* 2. Theme Preferences */}
            <section className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" /> {lang === "en" ? "Appearance" : "Giao diện hiển thị"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { mode: "light" as Theme, icon: Sun, label: lang === "en" ? "Light" : "Sáng" },
                  { mode: "dark" as Theme, icon: Moon, label: lang === "en" ? "Dark" : "Tối" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      theme === mode
                        ? "border-[#003B95] dark:border-amber-500 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-[12px]">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 4. Notification Settings */}
            <section className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                      Thông báo nợ phí, Tin nhắn & Cuộc gọi
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Nhận chuông và tin nhắn thông báo ngay cả khi thoát/ẩn ứng dụng
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifEnabled}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setNotifEnabled(checked);
                    if (checked) {
                      await requestNotificationPermission();
                    }
                    toast.success(checked ? "Đã bật thông báo nền & cuộc gọi" : "Đã tắt thông báo");
                  }}
                  className="h-5 w-5 accent-[#003B95] rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kiểm tra chuông gọi đến & rung ngoài màn hình khóa:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestNotificationPermission();
                    if (granted !== "granted") {
                      toast.error("Vui lòng cấp quyền thông báo trên trình duyệt / thiết bị!");
                      return;
                    }
                    toast.info("Đang kích hoạt chuông gọi sau 2.5s. Hãy nhấn phím HOME hoặc ẩn ứng dụng ngay để trải nghiệm thông báo ngoài màn hình!", {
                      duration: 5000,
                    });
                    setTimeout(() => {
                      sendCallNotification(
                        "CEO Nguyễn Văn A",
                        "https://vba-storage.s3.ap-southeast-1.amazonaws.com/avatars/default.png",
                        "call-test-room-1983"
                      );
                    }, 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold hover:bg-blue-100 transition cursor-pointer shrink-0"
                >
                  Test chuông gọi nền
                </button>
              </div>
            </section>

            {/* 3. AI Assistant Settings */}
            <section className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Trợ lý AI CEO 1983</span>
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        AI 5.0
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hiển thị nút trợ lý AI nổi trên màn hình để hỗ trợ tìm kiếm đối tác & tra cứu nghiệp vụ CLB
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => handleToggleAi(e.target.checked)}
                  className="h-5 w-5 accent-[#003B95] rounded cursor-pointer"
                />
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                {aiEnabled
                  ? "✓ Trợ lý AI đang hoạt động: Bạn có thể chạm vào biểu tượng robot ở góc màn hình để hỏi thông tin, kết nối hội viên và điều hướng nhanh."
                  : "✕ Đã tắt nút Trợ lý AI: Màn hình sẽ thông thoáng hơn và không xuất hiện bóng chat robot."}
              </p>
            </section>

            {/* 4. Help & User Guide (Dành riêng cho App CEO 1983) */}
            <section className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 flex items-center justify-center text-[#003B95] dark:text-sky-400 shrink-0">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Hướng dẫn sử dụng App CEO 1983</span>
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                        Chỉ Dành Cho App
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sổ tay thao tác 10 màn hình, chạm thẻ NFC, quét card AI & tài liệu di động chính thức
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setUserGuideOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white py-2.5 px-3 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Mở Hướng Dẫn 10 Chức Năng</span>
                </button>

                <a
                  href="/docs/HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf"
                  download="HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải Sổ Tay PDF App CEO 1983</span>
                </a>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                * Chỉ hiển thị hướng dẫn thao tác trên ứng dụng di động Hiệp hội CEO 1983 (không hiển thị Web CRM quản trị).
              </p>
            </section>

            {/* 5. Account Deactivation Section */}
            <section className="p-4 rounded-2xl bg-white dark:bg-[#131a27] border border-rose-200/80 dark:border-rose-950/50 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" /> Vô hiệu hóa tài khoản
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Tạm dừng hoạt động tài khoản hội viên của bạn. Hồ sơ và danh thiếp sẽ tạm ẩn khỏi danh bạ cho đến khi bạn yêu cầu mở lại qua Ban Thư Ký.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeactivateModalOpen(true)}
                  className="shrink-0 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold hover:bg-rose-100 transition active:scale-95 cursor-pointer"
                >
                  Vô hiệu hóa
                </button>
              </div>
            </section>

            {/* 6. Conditional Logout Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={!passwordChangedInSession}
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all shadow-sm ${
                  passwordChangedInSession
                    ? "bg-[#003B95] hover:bg-[#002B70] text-white active:scale-[0.99] cursor-pointer"
                    : "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>

              {/* Conditional Note */}
              <p className="text-[11px] text-center leading-snug px-2">
                {!passwordChangedInSession ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>
                      Để đảm bảo an toàn tài khoản, vui lòng đổi mật khẩu thành công ít nhất một lần để kích hoạt quyền Đăng xuất.
                    </span>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <span>✅</span>
                    <span>Mật khẩu đã được cập nhật trong phiên. Bạn có thể đăng xuất bất cứ lúc nào.</span>
                  </span>
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Account Deactivation Modal */}
      {deactivateModalOpen && (
        <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl !bg-white dark:!bg-[#0F172A] border border-rose-200 dark:border-rose-900/60 p-5 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle className="text-sm font-bold">Xác nhận vô hiệu hóa tài khoản</DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDeactivateAccount} className="space-y-3.5 pt-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tài khoản của bạn sẽ tạm dừng quyền truy cập vào các tính năng của CLB CEO 1983. Vui lòng nhập mật khẩu xác nhận để tiếp tục:
              </p>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Mật khẩu tài khoản
                </label>
                <input
                  type="password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  placeholder="Nhập mật khẩu để xác nhận"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeactivateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={deactivateLoading || !deactivatePassword}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {deactivateLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : null}
                  <span>Xác nhận</span>
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Popup Thông tin tài khoản mới & Xác nhận kích hoạt tài khoản thành công */}
      {activationModalOpen && updatedAccountData && (
        <Dialog open={activationModalOpen} onOpenChange={() => {}}>
          <DialogContent
            className="w-[calc(100%-2rem)] max-w-md rounded-3xl !bg-white dark:!bg-[#0D1527] border-2 border-amber-400/60 p-6 text-slate-900 dark:text-white shadow-2xl relative overflow-hidden"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            {/* Ambient luxury glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#003B95]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center mb-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500/40 flex items-center justify-center mb-3 shadow-md">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <span className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-400/40 mb-1.5">
                ✦ THIẾT LẬP TÀI KHOẢN THÀNH CÔNG ✦
              </span>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Thông Tin Tài Khoản Mới
              </DialogTitle>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Chúc mừng Anh/Chị <strong>{updatedAccountData.fullName}</strong>. Mật khẩu mới và thông tin đăng nhập đã sẵn sàng.
              </p>
            </div>

            {/* Account Credentials Card */}
            <div className="relative z-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-4 space-y-2.5 text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-amber-500" /> Tên đăng nhập (Email):
                </span>
                <span className="font-mono font-bold text-[#003B95] dark:text-amber-400 truncate max-w-[200px]">
                  {updatedAccountData.email}
                </span>
              </div>

              {updatedAccountData.phone && (
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 text-amber-500" /> Số điện thoại đăng nhập:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {updatedAccountData.phone}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" /> Mật khẩu mới:
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50">
                  {updatedAccountData.newPassword}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Mã hội viên:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {updatedAccountData.memberCode}
                </span>
              </div>
            </div>

            {/* Email Dispatch Notice */}
            <div className="relative z-10 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11.5px] leading-relaxed text-blue-900 dark:text-blue-200">
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  {updatedAccountData.emailUpdated ? (
                    <span>
                      Hệ thống đã nhận diện <strong>Email mới</strong> và đã tự động gửi toàn bộ thông tin tài khoản kèm hướng dẫn truy cập về hộp thư: <strong>{updatedAccountData.email}</strong>.
                    </span>
                  ) : (
                    <span>
                      Thông tin bảo mật tài khoản đã được đồng bộ. Bấm nút xác nhận bên dưới để gửi email xác nhận kích hoạt tài khoản chính thức về hộp thư <strong>{updatedAccountData.email}</strong>.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Confirm Activation Action Button */}
            <div className="relative z-10 pt-4">
              <button
                type="button"
                onClick={handleFinalConfirmActivation}
                disabled={confirmActivatingLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 active:scale-98 transition cursor-pointer disabled:opacity-50"
              >
                {confirmActivatingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-slate-950" />
                )}
                <span>Xác nhận & Gửi thông báo kích hoạt tài khoản</span>
              </button>
              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2">
                Sau khi xác nhận, hệ thống sẽ gửi email kích hoạt và đưa bạn ra màn hình đăng nhập để bắt đầu trải nghiệm App.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Hướng Dẫn Sử Dụng App CEO 1983 */}
      <UserGuideModal
        open={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
      />
    </div>
  );
}
