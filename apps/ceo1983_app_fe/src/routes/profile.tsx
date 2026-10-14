import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useT, type TKey } from "@/lib/i18n";
import { AvatarUploadField } from "@/components/business-connect/mobile/me/AvatarUploadField";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ cá nhân — CEO 1983" }] }),
  component: ProfilePage,
});

type Form = {
  full_name: string;
  phone: string;
  title: string;
  location: string;
  bio: string;
  avatar_url: string;
};

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Họ và tên không được phép để trống"),
  phone: z.string().trim().min(1, "Số điện thoại không được phép để trống"),
  title: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
});

const FIELDS: {
  key: keyof Form;
  labelKey: TKey;
  placeholder: string;
  required?: boolean;
  type?: "textarea";
}[] = [
  { key: "full_name", labelKey: "profile.fullName", placeholder: "Nhập họ và tên...", required: true },
  { key: "phone", labelKey: "profile.phone", placeholder: "Nhập số điện thoại...", required: true },
  { key: "title", labelKey: "profile.titleField", placeholder: "Nhập chức danh (VD: Giám đốc, Tổng giám đốc...)" },
  { key: "location", labelKey: "profile.location", placeholder: "Nhập địa điểm làm việc / khu vực..." },
  { key: "bio", labelKey: "profile.bio", placeholder: "Giới thiệu ngắn gọn về bản thân hoặc doanh nghiệp...", type: "textarea" },
];

function ProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [form, setForm] = useState<Form>({
    full_name: "",
    phone: "",
    title: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    let active = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('vibe_token') : null;
    if (!token) {
      navigate({ to: "/auth" });
      return;
    }

    let decodedUser: any = null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      decodedUser = JSON.parse(window.atob(base64));
      setEmail(decodedUser.username || "");
      setUserId(decodedUser.sub);
    } catch (e) {
      navigate({ to: "/auth" });
      return;
    }

    // Decoupled CRM Profile: prioritize crm_admin_profile and crm_admin_avatar
    let savedCrmProf: any = null;
    try {
      const raw = localStorage.getItem("crm_admin_profile");
      if (raw) savedCrmProf = JSON.parse(raw);
    } catch {}

    const savedCrmAvatar = typeof window !== "undefined" ? localStorage.getItem("crm_admin_avatar") : null;

    if (savedCrmProf) {
      setForm({
        full_name: savedCrmProf.full_name || savedCrmProf.display_name || savedCrmProf.name || "",
        phone: savedCrmProf.phone || "",
        title: savedCrmProf.title || savedCrmProf.professional_title || "",
        location: savedCrmProf.location || savedCrmProf.region || "",
        bio: savedCrmProf.bio || "",
        avatar_url: savedCrmAvatar || savedCrmProf.avatar_url || "",
      });
      setLoading(false);
    }

    fetchNestApi("/crm/profile")
      .catch(() => fetchNestApi("/profile"))
      .catch(() => fetchNestApi("/me/profile"))
      .then((prof) => {
        if (!active) return;
        const p = prof || {};
        // If we already had savedCrmProf, keep local priority
        if (!savedCrmProf) {
          setForm({
            full_name: p.display_name || p.name || decodedUser.name || "Ban Quản Trị Hệ Thống",
            phone: p.phone || "0988 198 300",
            title: p.professional_title || p.profile?.professional_title || "Quản trị viên CRM",
            location: p.region || p.profile?.region || "Hà Nội",
            bio: p.bio || p.profile?.bio || "Quản trị viên hệ thống & ban chuyên môn CEO 1983",
            avatar_url: savedCrmAvatar || p.avatar_url || "",
          });
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading CRM profile:", e);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function save() {
    if (!userId) return;

    // Validate using Zod schema
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof Form, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof Form;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        display_name: form.full_name.trim(),
        name: form.full_name.trim(),
        phone: form.phone.trim(),
        title: form.title.trim(),
        professional_title: form.title.trim() || null,
        location: form.location.trim(),
        region: form.location.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
      };

      // Decoupled Storage: Save strictly to crm_admin_profile & crm_admin_avatar
      localStorage.setItem("crm_admin_profile", JSON.stringify(payload));
      if (payload.avatar_url) {
        localStorage.setItem("crm_admin_avatar", payload.avatar_url);
      } else {
        localStorage.removeItem("crm_admin_avatar");
      }

      // Notify CRM components
      window.dispatchEvent(new CustomEvent("crm_admin_profile_updated", { detail: payload }));

      // Synchronize to backend CRM profile endpoint if available
      await fetchNestApi("/crm/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }).catch(() => null);

      toast.success(t("profile.saved") || "Đã lưu hồ sơ quản trị CRM độc lập thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu thông tin hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={t("profile.page.title")}
        subtitle={t("profile.page.subtitle")}
        actions={
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("profile.back")}
          </button>
        }
      />

      <Card className="max-w-2xl p-5">
        <h2 className="text-base font-semibold text-foreground">{t("profile.section.basic")}</h2>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">{t("profile.loading")}</div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Avatar upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("profile.avatar")}
              </label>
              <AvatarUploadField
                value={form.avatar_url}
                onChange={(url) => set("avatar_url", url)}
                disabled={saving}
              />
            </div>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t(f.labelKey)} {f.required && <span className="text-destructive">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className={`w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors ${
                      errors[f.key]
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-ring"
                    }`}
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors ${
                      errors[f.key]
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-ring"
                    }`}
                  />
                )}
                {errors[f.key] && (
                  <p className="mt-1 text-xs font-medium text-destructive animate-in fade-in duration-150">
                    {errors[f.key]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {t("profile.email")}
              </label>
              <input
                value={email}
                disabled
                placeholder="Địa chỉ email đăng nhập"
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("profile.emailHint")}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );
}

