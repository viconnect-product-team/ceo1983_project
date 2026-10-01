import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/lib/i18n";
import { LuxuryLangSwitcher } from "@/components/LuxuryLangSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  X,
  Lock,
  Mail,
} from "lucide-react";
import { classifyAuthError, type AuthErrorInfo } from "@/lib/business-connect/mobile/auth-error";
import {
  applyRememberPreference,
  getRememberPreference,
  getRememberedEmail,
} from "@/lib/business-connect/mobile/auth-session";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    redirect?: string;
    m?: "1";
    reason?: "expired";
    portal?: "association" | "crm" | "admin";
  } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
    ...(search.m === "1" ? { m: "1" as const } : {}),
    ...(search.reason === "expired" ? { reason: "expired" as const } : {}),
    ...(search.portal === "association" ? { portal: "association" as const } : {}),
    ...(search.portal === "crm" || search.portal === "admin" ? { portal: "crm" as const } : {}),
  }),
  head: () => ({
    meta: [{ title: "Đăng nhập Hệ thống CRM | CLB Doanh nhân CEO 1983" }],
  }),
  component: CrmAdminAuthPage,
});

function safeRedirect(target?: string): string | null {
  if (!target) return null;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const path = url.pathname + url.search + url.hash;
    if (path.startsWith("/auth") || path.includes("/login")) return null;
    return path.startsWith("/") && !path.startsWith("//") ? path : null;
  } catch {
    return null;
  }
}

function CrmAdminAuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect: redirectTo, reason, portal: searchPortal } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [remember, setRemember] = useState(true);
  const { user, setAuthData } = useAuth();

  const destPath = safeRedirect(redirectTo) ?? "";

  // Tách biệt portal: nếu truy cập sang cổng khác, chuyển về route chuyên biệt
  useEffect(() => {
    if (searchPortal === "crm" || searchPortal === "admin") {
      return;
    }
    if (searchPortal === "association" || (destPath.startsWith("/association") || destPath.startsWith("/m"))) {
      navigate({
        to: "/association/login" as any,
        search: { redirect: redirectTo } as any,
        replace: true,
      });
      return;
    }
  }, [searchPortal, destPath, redirectTo, navigate]);

  async function goPostLogin() {
    const target = safeRedirect(redirectTo);
    if (target && !target.startsWith("/auth") && !target.startsWith("/association/login")) {
      navigate({ to: target as any, replace: true });
      return;
    }
    navigate({ to: "/", replace: true });
  }

  useEffect(() => {
    if (reason !== "expired") return;
    setAuthErrorInfo(null);
    toast.error(t("auth.sessionExpired"));
  }, [reason, t]);

  useEffect(() => {
    const pref = getRememberPreference();
    setRemember(pref);
    const saved = getRememberedEmail();
    if (saved) setEmail((v) => v || saved);
  }, []);

  useEffect(() => {
    if (user) {
      void goPostLogin();
    }
  }, [user]);

  async function submit() {
    if (!email.trim()) {
      setAuthError("Vui lòng nhập địa chỉ email hoặc tên đăng nhập");
      return;
    }
    if (!password) {
      setAuthError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);

    try {
      const res = await fetchNestApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res?.access_token) {
        throw new Error("Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
      }
      setAuthData(res);
      applyRememberPreference(remember, email.trim());
      await goPostLogin();
    } catch (e: any) {
      const info = classifyAuthError(e, { provider: "password" });
      setAuthErrorInfo(info);
      const msg = t(info.messageKey as Parameters<typeof t>[0]) || e?.message || "Đăng nhập thất bại";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ── LEFT PANEL: HERO & BRANDING BANNER (Per CEO 1983 Ecosystem) ────────── */}
      <section className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-[#003B95] via-[#002B70] to-[#0A1A3A] text-white">
        {/* Ambient subtle glow overlay */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-400/15 blur-[100px]" />

        {/* Top: Monogram App Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md">
            <span className="text-xl font-black text-[#003B95] tracking-tight">V</span>
          </div>
          <div className="text-sm font-bold tracking-wider uppercase text-blue-100">
            CLB Doanh nhân CEO 1983
          </div>
        </div>

        {/* Center: Main Headline & Description tailored to CEO 1983 */}
        <div className="relative z-10 max-w-xl my-auto py-10 space-y-5">
          <h1 className="text-3xl xl:text-4xl 2xl:text-[42px] font-extrabold leading-[1.25] tracking-tight text-white">
            Nền tảng Quản trị & Kết nối Giao thương Doanh nhân CEO 1983
          </h1>
          <p className="text-base xl:text-lg leading-relaxed text-blue-100/90 font-normal">
            Hội tụ tinh hoa cộng đồng doanh nhân bản lĩnh. Số hóa hồ sơ hội viên, mở rộng xúc tiến thương mại B2B, quản trị cơ hội và điều hành tổ chức chuyên nghiệp, bền vững.
          </p>
        </div>

        {/* Bottom: Modern Glassmorphism Analytics Card */}
        <div className="relative z-10 max-w-md rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs xl:text-sm font-semibold text-white/95 tracking-wide">
              Chỉ số kết nối & giao thương hội viên
            </span>
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
              <TrendingUp className="h-3 w-3" />
              <span>+45.2%</span>
            </div>
          </div>

          {/* Minimalist Bar Chart Graphic */}
          <div className="flex h-20 items-end gap-3 pt-2">
            <div className="w-8 rounded-t-lg bg-white/30 h-[40%] transition-all duration-300" title="Sự kiện CLB" />
            <div className="w-8 rounded-t-lg bg-white/50 h-[65%] transition-all duration-300" title="Hội viên kết nối" />
            <div className="w-8 rounded-t-lg bg-white/40 h-[50%] transition-all duration-300" title="Giao thương B2B" />
            <div className="w-8 rounded-t-lg bg-white/60 h-[80%] transition-all duration-300" title="Cơ hội xúc tiến" />
            <div className="w-8 rounded-t-lg bg-white h-[100%] shadow-md transition-all duration-300" title="Hiệu quả điều hành" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-blue-200/90 pt-1 border-t border-white/10 font-medium">
            <span>500+ Doanh nghiệp hội viên</span>
            <span>100% Kết nối chính danh</span>
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL: AUTHENTICATION FORM ────────────────────────────────────────── */}
      <section className="flex-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white dark:bg-slate-950 relative">
        {/* Top bar: Theme & Language switchers */}
        <div className="flex items-center justify-end gap-2 pb-2">
          <ThemeSwitcher />
          <LuxuryLangSwitcher />
        </div>

        {/* Central Auth Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Logo CEO 1983 */}
          <div className="flex flex-col items-center justify-center text-center mb-7">
            <img
              src="/ceo1983-official-logo.png"
              alt="CLB Doanh nhân CEO 1983"
              className="h-16 w-auto object-contain mb-3 drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Đăng nhập Hệ thống
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cổng quản trị thông tin CRM Hiệp hội Doanh nghiệp CEO 1983
            </p>
          </div>

          {/* Error Message Box */}
          {authError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-600 dark:text-red-400 leading-relaxed"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-medium">{authError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            {/* Field: Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@connect.vn hoặc email@domain.com"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all focus:border-[#003B95] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#003B95]/15"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all focus:border-[#003B95] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#003B95]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Action Row: Ghi nhớ tài khoản + Quên mật khẩu */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRemember(checked);
                    applyRememberPreference(checked, email.trim());
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-[#003B95] focus:ring-[#003B95]/30 cursor-pointer accent-[#003B95]"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                  Ghi nhớ tài khoản
                </span>
              </label>

              <Link
                to="/forgot-password"
                search={{ email: email.trim() || undefined }}
                className="text-xs font-semibold text-[#003B95] dark:text-sky-400 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Primary Action Button: STRICTLY CEO 1983 Blue `#003B95` - NO YELLOW */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#003B95] hover:bg-[#002B70] active:scale-[0.99] text-white text-sm font-bold transition-all duration-200 shadow-md shadow-blue-900/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Đang đăng nhập...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Đăng nhập vào Hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Bottom subtle copyright note */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-600 pt-4">
          © {new Date().getFullYear()} CLB Doanh nhân CEO 1983. Bảo lưu mọi quyền.
        </div>
      </section>
    </main>
  );
}
