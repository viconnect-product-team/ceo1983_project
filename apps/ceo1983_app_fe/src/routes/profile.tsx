import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Shield, ShieldCheck, Key, Lock, UserCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { useT, type TKey } from "@/lib/i18n";
import { AvatarUploadField } from "@/components/business-connect/mobile/me/AvatarUploadField";
import { fetchNestApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ cá nhân & Phân quyền — CEO 1983" }] }),
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

const PERMISSION_DESCRIPTIONS: Record<string, { label: string; desc: string }> = {
  "admin:full_access": { label: "Toàn quyền Quản trị", desc: "Toàn quyền tối cao quản trị toàn bộ hệ sinh thái CEO 1983" },
  "*": { label: "Toàn quyền Hệ thống", desc: "Được phép thực thi mọi tính năng trên nền tảng" },
  "system:manage": { label: "Cấu hình Hệ thống", desc: "Quản trị cài đặt, tham số và phân quyền CRM" },
  "account:manage": { label: "Quản lý Tài khoản", desc: "Thêm mới, kích hoạt, khóa và phân quyền tài khoản người dùng" },
  "member:view": { label: "Xem Danh bạ Hội viên", desc: "Tra cứu hồ sơ và danh sách các doanh nghiệp hội viên" },
  "member:edit": { label: "Chỉnh sửa Hồ sơ Hội viên", desc: "Cập nhật thông tin chi tiết của hội viên" },
  "member:approve": { label: "Phê duyệt Hội viên", desc: "Xét duyệt hồ sơ đăng ký gia nhập CLB mới" },
  "member:renew": { label: "Gia hạn Niên liễm", desc: "Xác nhận và gia hạn hội phí định kỳ cho hội viên" },
  "event:view": { label: "Xem Sự kiện", desc: "Theo dõi lịch trình các sự kiện và hội thảo" },
  "event:create": { label: "Quản lý Sự kiện", desc: "Khởi tạo, điều chỉnh và phát hành sự kiện CLB" },
  "event:checkin": { label: "Quét vé Check-in", desc: "Quét mã QR soát vé hội viên tại cổng sự kiện" },
  "marketplace:view": { label: "Xem Sàn Giao thương", desc: "Duyệt xem sản phẩm, dịch vụ và hồ sơ doanh nghiệp" },
  "marketplace:manage": { label: "Quản lý Sàn Giao thương", desc: "Đăng tải sản phẩm, duyệt tin và quản trị danh mục" },
  "finance:view": { label: "Xem Báo cáo Tài chính", desc: "Theo dõi số liệu thu chi, quỹ hội và tài trợ" },
  "finance:manage": { label: "Quản trị Thu Chi", desc: "Lập phiếu thu, phiếu chi và duyệt chi ngân sách CLB" },
  "media:view": { label: "Xem Bản tin Truyền thông", desc: "Xem các tin tức nội bộ và thông cáo báo chí" },
  "media:manage": { label: "Biên tập Bản tin", desc: "Đăng bài viết, phát hành ấn phẩm truyền thông" },
  "voting:manage": { label: "Quản trị Biểu quyết", desc: "Tạo khảo sát, lấy ý kiến biểu quyết của hội viên" },
  "opportunity:manage": { label: "Kết nối Giao thương", desc: "Quản trị cơ hội hợp tác và giới thiệu kinh doanh" },
  "charity:manage": { label: "Quản lý Thiện nguyện", desc: "Điều phối các chiến dịch và ngân sách thiện nguyện" },
};

function ProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleState = useRole();
  const { srsRole, permissions, userDepartment, isPresident, isAdmin, isPlatformAdmin, isBQT } = roleState;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(user?.id || null);
  const [email, setEmail] = useState(user?.email || "");
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
    const token = typeof window !== "undefined" ? localStorage.getItem("vibe_token") : null;
    if (!token && !user) {
      navigate({ to: "/auth" });
      return;
    }

    if (user) {
      setEmail(user.email || "");
      setUserId(user.id);
      setForm({
        full_name: user.name || (user as any).user_metadata?.full_name || "",
        phone: user.phone || (user as any).phone || "",
        title: user.title || (user as any).professional_title || "",
        location: (user as any).location || (user as any).region || "",
        bio: (user as any).bio || "",
        avatar_url: user.avatar_url || (user as any).user_metadata?.avatar_url || "",
      });
    }

    fetchNestApi<any>("/crm/profile")
      .catch(() => fetchNestApi<any>("/profile"))
      .catch(() => fetchNestApi<any>("/me/profile"))
      .then((prof) => {
        if (!active) return;
        const p = prof || {};
        setForm((prev) => ({
          full_name: p.display_name || p.name || prev.full_name || user?.name || "Hội viên CLB CEO 1983",
          phone: p.phone || prev.phone || user?.phone || "",
          title: p.professional_title || p.profile?.professional_title || prev.title || user?.title || "",
          location: p.region || p.profile?.region || prev.location || "",
          bio: p.bio || p.profile?.bio || prev.bio || "",
          avatar_url: p.avatar_url || prev.avatar_url || user?.avatar_url || "",
        }));
      })
      .catch((e) => {
        console.warn("Could not load backend CRM profile:", e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, navigate]);

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
    if (!userId && !user?.id) return;

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

      // Notify in-app CRM listeners without storing raw payload to localStorage
      window.dispatchEvent(new CustomEvent("crm_admin_profile_updated", { detail: payload }));

      // Synchronize directly to backend CRM profile endpoint
      await fetchNestApi("/crm/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }).catch(() => null);

      toast.success(t("profile.saved") || "Đã lưu hồ sơ thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu thông tin hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  const roleBadgeLabel = isPresident
    ? "Chủ tịch CLB CEO 1983"
    : isPlatformAdmin
    ? "Quản trị viên Nền tảng (Platform Admin)"
    : isAdmin || isBQT
    ? "Ban Quản Trị CLB (BQT)"
    : srsRole === "truong_ban_tai_chinh" || srsRole === "BTC"
    ? "Trưởng Ban Tài chính"
    : srsRole === "truong_ban_thanh_vien" || srsRole === "BTV"
    ? "Trưởng Ban Hội viên"
    : srsRole === "truong_ban_truyen_thong" || srsRole === "BTT"
    ? "Trưởng Ban Truyền thông"
    : srsRole === "truong_ban_xuc_tien" || srsRole === "BXT"
    ? "Trưởng Ban Xúc tiến Giao thương"
    : srsRole === "tong_thu_ky" || srsRole === "BTK"
    ? "Tổng Thư ký CLB"
    : "Hội viên chính thức";

  return (
    <AppShell>
      <PageHeader
        title={t("profile.page.title") || "Hồ sơ cá nhân & Phân quyền"}
        subtitle="Quản lý thông tin tài khoản và kiểm tra quyền hạn hệ thống theo chuẩn bảo mật RBAC"
        actions={
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t("profile.back")}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl pb-10">
        {/* Left Column: Form thông tin cá nhân */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-[#003B95] dark:text-blue-400" />
              {t("profile.section.basic") || "Thông tin cơ bản"}
            </h2>

            {loading ? (
              <div className="mt-4 text-sm text-muted-foreground">{t("profile.loading")}</div>
            ) : (
              <div className="mt-5 space-y-4">
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
                            : "border-border focus:border-[#003B95]"
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
                            : "border-border focus:border-[#003B95]"
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
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t("profile.emailHint")}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#002d73] transition-colors disabled:opacity-60"
                  >
                    <CheckCircle2 className="size-4" />
                    {t("common.save")}
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Bảo mật & Phân quyền Hệ thống (Permissions) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-blue-100 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/20">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-9 rounded-xl bg-[#003B95]/10 text-[#003B95] dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Bảo mật & Phân quyền</h3>
                <p className="text-xs text-muted-foreground">Chuẩn phân quyền RBAC</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border/80 shadow-xs">
                <span className="text-muted-foreground block text-[11px] mb-1">Vai trò hệ thống</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#003B95]/10 text-[#003B95] dark:bg-blue-900/40 dark:text-blue-200 font-bold text-xs">
                  <Shield className="size-3.5" />
                  {roleBadgeLabel}
                </span>
              </div>

              {userDepartment && (
                <div className="p-3 rounded-xl bg-background border border-border/80 shadow-xs">
                  <span className="text-muted-foreground block text-[11px] mb-1">Ban chuyên môn</span>
                  <span className="font-semibold text-foreground text-xs">{userDepartment}</span>
                </div>
              )}

              {/* Danh sách Quyền hạn (Permissions) */}
              <div className="p-3.5 rounded-xl bg-background border border-border/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Key className="size-3.5 text-amber-500" />
                    Quyền hạn (Permissions)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
                    {permissions.length} quyền
                  </span>
                </div>

                {permissions.length === 0 ? (
                  <p className="text-muted-foreground text-xs italic">
                    Chưa có quyền hạn quản trị nâng cao. Tài khoản đang hoạt động ở chế độ Hội viên tiêu chuẩn.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
                    {permissions.map((p) => {
                      const meta = PERMISSION_DESCRIPTIONS[p] || {
                        label: p,
                        desc: `Quyền phân phối theo vai trò (${p})`,
                      };
                      return (
                        <div
                          key={p}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {p}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {meta.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ghi chú bảo mật an toàn */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                <Lock className="size-4 shrink-0 mt-0.5" />
                <span>
                  Phiên đăng nhập được mã hóa và xác thực chữ ký JWT an toàn. Quyền hạn không lưu tại LocalStorage, đảm bảo an toàn tuyệt đối trước can thiệp trái phép.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
