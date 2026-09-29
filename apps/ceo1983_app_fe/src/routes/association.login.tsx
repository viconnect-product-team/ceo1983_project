import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, clearUserSessionData } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import { classifyAuthError, type AuthErrorInfo } from "@/lib/business-connect/mobile/auth-error";
import { AssociationAppSignIn } from "@/components/member/AssociationAppSignIn";
import { AuthCardScanSheet } from "@/components/business-connect/mobile/AuthCardScanSheet";
import { rememberScannedCard } from "@/lib/business-connect/mobile/auth-scan";
import {
  applyRememberPreference,
  getRememberPreference,
  getRememberedEmail,
} from "@/lib/business-connect/mobile/auth-session";

export const Route = createFileRoute("/association/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): {
    redirect?: string;
    reason?: "expired";
    username?: string;
    email?: string;
    registered?: string;
    reset?: string;
  } => ({
    ...(typeof search.redirect === "string" ? { redirect: search.redirect } : {}),
    ...(search.reason === "expired" ? { reason: "expired" as const } : {}),
    ...(typeof search.username === "string" ? { username: search.username } : {}),
    ...(typeof search.email === "string" ? { email: search.email } : {}),
    ...(typeof search.registered === "string" ? { registered: search.registered } : {}),
    ...(typeof search.reset === "string" ? { reset: search.reset } : {}),
  }),
  head: () => ({
    meta: [
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "theme-color", content: "#001D4A" },
      { name: "apple-mobile-web-app-title", content: "CEO 1983" },
      { title: "Đăng nhập — Hiệp hội Doanh nhân CEO 1983" },
    ],
    links: [
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=ceo1983_v3" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon-180x180.png?v=ceo1983_v3" },
      { rel: "apple-touch-icon", sizes: "152x152", href: "/apple-touch-icon-152x152.png?v=ceo1983_v3" },
      { rel: "apple-touch-icon", sizes: "167x167", href: "/apple-touch-icon-167x167.png?v=ceo1983_v3" },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch-icon.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/ceo1983-favicon.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/app-icon-192.png?v=ceo1983_v3" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/app-icon.png?v=ceo1983_v3" },
      { rel: "shortcut icon", href: "/ceo1983-favicon.png?v=ceo1983_v3" },
    ],
  }),
  component: AssociationLoginPage,
});

function safeRedirect(target?: string): string | null {
  if (!target) return null;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const path = url.pathname + url.search + url.hash;
    if (path.includes("/login") || path.startsWith("/auth")) return null;
    return path.startsWith("/") && !path.startsWith("//") ? path : null;
  } catch {
    return null;
  }
}

function AssociationLoginPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo, reason, username, email: searchEmail, registered, reset } = Route.useSearch();
  const { user, logout, setAuthData } = useAuth();

  const [identifier, setIdentifier] = useState(""); // Email or Member Code
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (username) {
      setIdentifier(username);
    } else if (searchEmail) {
      setIdentifier(searchEmail);
    } else {
      setRemember(getRememberPreference());
      const saved = getRememberedEmail();
      if (saved) setIdentifier((v) => v || saved);
    }
  }, [username, searchEmail]);

  useEffect(() => {
    if (registered === "true") {
      toast.success("🎉 Đăng ký thành công! Quý CEO vui lòng nhập mật khẩu để đăng nhập vào App Hiệp Hội.");
    }
  }, [registered]);

  useEffect(() => {
    if (reset === "success") {
      toast.success("✓ Đổi mật khẩu thành công! Quý CEO vui lòng đăng nhập lại bằng mật khẩu mới vừa tạo.", {
        duration: 7000,
      });
    }
  }, [reset]);

  useEffect(() => {
    if (reason === "expired") {
      setAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, [reason]);

  // Nếu đã đăng nhập và người dùng truy cập trang này, chỉ redirect nếu không có yêu cầu đổi tài khoản
  useEffect(() => {
    // Nếu có tham số lý do expired hoặc switch, xóa phiên cũ
    if (reason === "expired") {
      logout?.();
    }
  }, [reason, logout]);

  const handleSubmit = async () => {
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setAuthError("Vui lòng nhập email / mã hội viên và mật khẩu");
      return;
    }

    setLoading(true);
    setAuthError(null);
    setAuthErrorInfo(null);

    try {
      const res = await fetchNestApi<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanId,
          password,
        }),
      });

      if (res?.access_token && res?.user) {
        // Dọn dẹp sạch toàn bộ cache và storage của phiên trước đó
        clearUserSessionData();
        setAuthData(res);
        applyRememberPreference(remember, cleanId);

        if (res.mustChangePassword || res.user?.mustChangePassword) {
          toast.warning("Hội viên mới bắt buộc phải thay đổi mật khẩu khởi tạo trước khi sử dụng ứng dụng.", {
            duration: 6000,
          });
          navigate({
            to: "/association/settings" as any,
            search: { action: "change_password", required: "true" } as any,
            replace: true,
          });
          return;
        }

        const memberWelcomeName = res.user?.name || res.user?.user_metadata?.full_name || cleanId;
        toast.success(`Chào mừng hội viên ${memberWelcomeName} trở lại!`);
        const target = safeRedirect(redirectTo) || "/association";
        navigate({ to: target as any, replace: true });
        return;
      }

      throw new Error("Không nhận được phiên đăng nhập hợp lệ.");
    } catch (err: any) {
      const info = classifyAuthError(err);
      setAuthErrorInfo(info);
      setAuthError(info.raw || err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  async function handleCardScanned(result: any) {
    setScanOpen(false);
    if (result.kind === "email") {
      setIdentifier(result.email);
      rememberScannedCard(result.card);
      toast.success(`Đã nhận diện thẻ của ${result.card?.fullName || "hội viên"}`);
    }
  }

  return (
    <>
      <AssociationAppSignIn
        identifier={identifier}
        password={password}
        loading={loading}
        errorMessage={authError}
        errorHint={authErrorInfo?.hintKey}
        onDismissError={() => setAuthError(null)}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={() => void handleSubmit()}
        onScanCard={() => setScanOpen(true)}
        remember={remember}
        onRememberChange={setRemember}
        currentSessionUser={user ? { name: user.name, email: user.email } : null}
        onSwitchAccount={() => {
          clearUserSessionData();
          logout?.();
          toast.info("Đã xóa phiên làm việc cũ. Quý CEO vui lòng nhập tài khoản mới.");
        }}
      />

      <AuthCardScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={handleCardScanned}
      />
    </>
  );
}
