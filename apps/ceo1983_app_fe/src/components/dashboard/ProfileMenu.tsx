import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut, User as UserIcon, UserCog } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/lib/i18n";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function ProfileMenu() {
  const t = useT();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(user?.id || null);
  const [email, setEmail] = useState<string>(user?.email || "");
  const [fullName, setFullName] = useState<string>(user?.name || user?.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || user?.user_metadata?.avatar_url || "");
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || (user as any).user_metadata?.full_name || "");
      setAvatarUrl(user.avatar_url || (user as any).user_metadata?.avatar_url || "");
      setUserId(user.id);
      setEmail(user.email || "");
    }

    // Call API /users/me để tải avatar và thông tin mới nhất trực tiếp từ cơ sở dữ liệu
    async function loadFreshProfile() {
      try {
        const res = await fetchNestApi<any>("/users/me");
        if (res) {
          if (res.name) setFullName(res.name);
          const freshAvatar = res.avatar_url || res.avatar || res.profile?.avatar_url;
          if (freshAvatar) setAvatarUrl(freshAvatar);
          if (res.email) setEmail(res.email);
          if (res.id) setUserId(res.id);
        }
      } catch {}
    }
    loadFreshProfile();

    const handleCrmUpdate = (e: any) => {
      if (e?.detail) {
        if (e.detail.name || e.detail.full_name) setFullName(e.detail.name || e.detail.full_name);
        if (e.detail.avatar_url) setAvatarUrl(e.detail.avatar_url);
      }
    };

    window.addEventListener("crm_admin_profile_updated", handleCrmUpdate);
    return () => {
      window.removeEventListener("crm_admin_profile_updated", handleCrmUpdate);
    };
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = fullName || email || "—";

  async function handleLogout() {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_refresh_token');
    document.cookie = `sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `sb-refresh-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    toast.success(t("profile.loggedOut"));
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    } else {
      navigate({ to: "/auth", replace: true });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-primary-foreground"
          style={avatarUrl ? undefined : { background: "var(--gradient-primary)" }}
        >
          {avatarUrl ? (
            <img
              src={resolveMediaUrl(avatarUrl) || avatarUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            initials(displayName)
          )}
        </div>
        <div className="hidden leading-tight text-left sm:block">
          <div className="max-w-[140px] truncate text-xs font-semibold text-foreground">
            {displayName}
          </div>
          <div className="max-w-[140px] truncate text-[11px] text-muted-foreground">{email}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          <button
            onClick={() => {
              setOpen(false);
              navigate({ to: "/profile" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            <UserIcon className="h-4 w-4 text-muted-foreground" /> {t("profile.menu.profile")}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate({ to: "/account-settings" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            <UserCog className="h-4 w-4 text-muted-foreground" /> {t("nav.account")}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setPwdOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" /> {t("profile.menu.password")}
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> {t("profile.menu.logout")}
          </button>
        </div>
      )}

      {profileOpen && (
        <ProfileModal
          userId={userId}
          email={email}
          fullName={fullName}
          avatarUrl={avatarUrl}
          onAvatarUpdated={(url) => setAvatarUrl(url)}
          onSaved={(n) => setFullName(n)}
          onClose={() => setProfileOpen(false)}
        />
      )}
      {pwdOpen && <PasswordModal onClose={() => setPwdOpen(false)} />}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ProfileModal({
  userId,
  email,
  fullName,
  avatarUrl,
  onAvatarUpdated,
  onSaved,
  onClose,
}: {
  userId: string | null;
  email: string;
  fullName: string;
  avatarUrl: string;
  onAvatarUpdated: (url: string) => void;
  onSaved: (n: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(fullName);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchNestApi<any>("/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const newUrl = res?.url || res?.avatar_url || res?.avatar;
      if (newUrl) {
        setCurrentAvatar(newUrl);
        onAvatarUpdated(newUrl);
        window.dispatchEvent(
          new CustomEvent("crm_admin_profile_updated", { detail: { avatar_url: newUrl } })
        );
        toast.success("Tải lên ảnh đại diện thành công!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Tải lên ảnh đại diện thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    try {
      await fetchNestApi("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      onSaved(name.trim());
      toast.success(t("profile.saved"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu thông tin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={t("profile.title")} onClose={onClose}>
      <div className="space-y-4">
        {/* Avatar Upload Preview */}
        <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl border border-border">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-muted flex items-center justify-center">
            {currentAvatar ? (
              <img
                src={resolveMediaUrl(currentAvatar) || currentAvatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-lg font-bold text-muted-foreground">
                {initials(name || email)}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
            >
              {uploading ? "Đang tải lên..." : "Đổi ảnh đại diện"}
            </button>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hỗ trợ PNG, JPG, WEBP tối đa 5MB
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("profile.fullName")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("profile.email")}
          </label>
          <input
            value={email}
            disabled
            className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 cursor-pointer"
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [currentPwd, setCurrentPwd] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (pwd.length < 6) {
      toast.error(t("profile.pwd.tooShort"));
      return;
    }
    if (pwd !== confirm) {
      toast.error(t("profile.pwd.mismatch"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetchNestApi('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: pwd,
        }),
      });

      if (res && res.error) {
        toast.error(res.message || res.error || "Không thể đổi mật khẩu");
        return;
      }

      toast.success(t("profile.pwd.saved"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={t("profile.pwd.title")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu hiện tại nếu có"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("profile.pwd.new")}
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            {t("profile.pwd.confirm")}
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
