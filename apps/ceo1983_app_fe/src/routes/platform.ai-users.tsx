import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  RotateCcw,
  Plus,
  Lock,
  Unlock,
  SlidersHorizontal,
  Bot,
  Sparkles,
  ExternalLink,
  RefreshCw,
  X,
  Building,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { Card, PageHeader, StatCard, Pill } from "@/components/dashboard/PageKit";
import { useRole } from "@/hooks/use-role";
import { useT } from "@/lib/i18n";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/platform/ai-users")({
  component: PlatformAiUsersPage,
});

export interface UserAiUsageItem {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  position?: string;
  memberCode?: string;
  usedCount: number;
  maxLimit: number;
  extraGranted: number;
  totalLimit: number;
  remaining: number;
  isExceeded: boolean;
  isBlocked: boolean;
  lastQuestion?: string | null;
  lastRequestedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiUsageStats {
  totalUsers: number;
  totalQuestions: number;
  exceededUsers: number;
  warningUsers: number;
  normalUsers: number;
  limitPerAccount: number;
}

type FilterStatus = "all" | "normal" | "warning" | "exceeded" | "blocked";

function PlatformAiUsersPage() {
  const t = useT();
  const { isPlatformAdmin, loading: roleLoading } = useRole();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserAiUsageItem[]>([]);
  const [stats, setStats] = useState<AiUsageStats>({
    totalUsers: 0,
    totalQuestions: 0,
    exceededUsers: 0,
    warningUsers: 0,
    normalUsers: 0,
    limitPerAccount: 50,
  });

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  // Adjustment Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAiUsageItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalResetCount, setModalResetCount] = useState(false);
  const [modalExtraGranted, setModalExtraGranted] = useState<number>(0);
  const [modalMaxLimit, setModalMaxLimit] = useState<number>(50);
  const [modalUnblock, setModalUnblock] = useState(true);

  // Fetch list from backend
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await fetchNestApi<{ data: UserAiUsageItem[]; stats: AiUsageStats }>(
        `/ai/admin/users${queryStr}`,
      );

      if (res && res.data) {
        setUsers(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error("Failed to load AI users:", err);
      toast.error(err?.message || "Không thể tải danh sách người dùng AI");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isPlatformAdmin) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlatformAdmin, statusFilter]);

  // Handle enter key in search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Quick action: Reset user usage counter to 0
  const handleQuickReset = async (user: UserAiUsageItem) => {
    if (!confirm(`Bạn có chắc chắn muốn đặt lại lượt dùng về 0 cho tài khoản "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      setActionLoading(true);
      await fetchNestApi("/ai/admin/users/reset", {
        method: "POST",
        body: {
          userId: user.userId,
          resetCount: true,
          unblock: true,
        },
      });
      toast.success(`Đã đặt lại lượt dùng về 0 cho tài khoản ${user.name}`);
      await loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đặt lại hạn mức");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick action: Grant +50 additional questions
  const handleQuickGrant50 = async (user: UserAiUsageItem) => {
    try {
      setActionLoading(true);
      await fetchNestApi("/ai/admin/users/reset", {
        method: "POST",
        body: {
          userId: user.userId,
          extraGranted: (user.extraGranted || 0) + 50,
          unblock: true,
        },
      });
      toast.success(`Đã cấp thêm +50 câu hỏi cho tài khoản ${user.name}`);
      await loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cấp thêm câu hỏi");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick action: Toggle block user AI access
  const handleToggleBlock = async (user: UserAiUsageItem) => {
    const nextState = !user.isBlocked;
    const actionText = nextState ? "khóa quyền truy cập AI" : "mở khóa quyền truy cập AI";
    if (!confirm(`Bạn có chắc muốn ${actionText} đối với tài khoản "${user.name}"?`)) {
      return;
    }
    try {
      setActionLoading(true);
      await fetchNestApi("/ai/admin/users/block", {
        method: "POST",
        body: {
          userId: user.userId,
          isBlocked: nextState,
        },
      });
      toast.success(`Đã ${actionText} cho tài khoản ${user.name}`);
      await loadData(true);
    } catch (err: any) {
      toast.error(err?.message || `Lỗi khi ${actionText}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open full adjustment modal
  const openAdjustmentModal = (user: UserAiUsageItem) => {
    setSelectedUser(user);
    setModalResetCount(false);
    setModalExtraGranted(user.extraGranted || 0);
    setModalMaxLimit(user.maxLimit || 50);
    setModalUnblock(user.isBlocked);
    setModalOpen(true);
  };

  // Save changes from modal
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await fetchNestApi("/ai/admin/users/reset", {
        method: "POST",
        body: {
          userId: selectedUser.userId,
          resetCount: modalResetCount,
          extraGranted: Number(modalExtraGranted) || 0,
          maxLimit: Number(modalMaxLimit) || 50,
          unblock: modalUnblock,
        },
      });
      toast.success(`Đã cập nhật hạn mức AI cho tài khoản ${selectedUser.name}`);
      setModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu hạn mức");
    } finally {
      setActionLoading(false);
    }
  };

  // Access check
  if (!roleLoading && !isPlatformAdmin) {
    return (
      <PlatformShell>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          {t("platform.forbidden")}
        </Card>
      </PlatformShell>
    );
  }

  // Format date helper
  const fmtTime = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <PlatformShell>
      {/* Page Header */}
      <PageHeader
        title="Quản Lý Hạn Mức & Người Dùng AI"
        subtitle="Kiểm soát lượng người dùng AI, thiết lập giới hạn 50 câu hỏi/tài khoản và điều chỉnh hạn mức độc lập"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Làm mới
            </button>
            <Link
              to="/platform/ai-audit"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              <Bot className="h-3.5 w-3.5 text-primary" />
              Nhật ký AI (Audit)
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chính sách: Giới hạn 50 câu/tài khoản</span>
            </div>
          </div>
        }
      />

      {/* Metrics Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng Người Dùng AI"
          value={stats.totalUsers}
          hint="Tài khoản từng đặt câu hỏi"
          tone="primary"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Tổng Câu Hỏi Đã Hỏi"
          value={stats.totalQuestions}
          hint="Toàn bộ câu hỏi gửi qua AI"
          tone="info"
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          label="Đạt Mốc 50 Câu (Hết Hạn)"
          value={stats.exceededUsers}
          hint="Đã chạm trần 50 câu hỏi"
          tone={stats.exceededUsers > 0 ? "danger" : undefined}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Còn Hạn Mức Hoạt Động"
          value={stats.normalUsers + stats.warningUsers}
          hint={`Bình thường: ${stats.normalUsers} | Cảnh báo (>=40): ${stats.warningUsers}`}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Policy Explanation Banner */}
      <div className="mb-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 p-4 sm:p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-foreground">
            <div className="font-semibold text-foreground">
              Quy tắc Hạn Mức Tự Động: 50 câu hỏi / 1 tài khoản
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Mỗi tài khoản hội viên/người dùng khi tương tác với Trợ lý AI sẽ có hạn mức mặc định tối đa là{" "}
              <strong className="text-foreground">50 câu hỏi</strong>. Khi chạm ngưỡng 50 câu, hệ thống sẽ tự động
              khóa tính năng đặt câu hỏi để tránh lạm dụng chi phí token API. Quản trị viên nền tảng có thể:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-2.5 py-1 font-medium border border-border">
                <RotateCcw className="h-3 w-3 text-amber-500" /> 1-Click: Đặt lại số câu về 0
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-2.5 py-1 font-medium border border-border">
                <Plus className="h-3 w-3 text-emerald-500" /> 1-Click: Cấp thêm +50 lượt
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-2.5 py-1 font-medium border border-border">
                <Lock className="h-3 w-3 text-rose-500" /> Khóa / Mở khóa truy cập tức thời
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-2.5 py-1 font-medium border border-border">
                <SlidersHorizontal className="h-3 w-3 text-primary" /> Tùy chỉnh hạn mức riêng biệt từng user
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, công ty, mã hội viên..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadData();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Status filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "all", label: "Tất cả", count: stats.totalUsers },
                { id: "normal", label: "Bình thường (<40)", count: stats.normalUsers },
                { id: "warning", label: "Cảnh báo (40-49)", count: stats.warningUsers },
                { id: "exceeded", label: "Đã hết 50/50", count: stats.exceededUsers },
                { id: "blocked", label: "Bị khóa AI", count: users.filter((u) => u.isBlocked).length },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Users Usage Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Người Dùng / Hội Viên</th>
                <th className="px-4 py-3.5">Hạn Mức & Tiến Độ (50 câu)</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5">Câu Hỏi Gần Nhất</th>
                <th className="px-4 py-3.5 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      Đang tải danh sách người dùng AI...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const percent = Math.min(Math.round((u.usedCount / Math.max(u.totalLimit, 1)) * 100), 100);
                  const isWarning = u.usedCount >= 40 && u.usedCount < u.totalLimit;
                  const isExceeded = u.isExceeded;

                  // Progress bar color
                  let progressColor = "bg-emerald-500";
                  if (u.isBlocked || isExceeded) {
                    progressColor = "bg-rose-500";
                  } else if (isWarning) {
                    progressColor = "bg-amber-500";
                  }

                  return (
                    <tr
                      key={u.userId}
                      className="group transition-colors hover:bg-muted/40"
                    >
                      {/* User Profile */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold overflow-hidden">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Fallback to initial
                                  (e.currentTarget as any).style.display = "none";
                                }}
                              />
                            ) : (
                              u.name?.charAt(0)?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-semibold text-foreground">
                                {u.name || "Chưa cập nhật"}
                              </span>
                              {u.memberCode && (
                                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                                  {u.memberCode}
                                </span>
                              )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {u.email || "—"}
                            </div>
                            {u.companyName && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 truncate mt-0.5">
                                <Building className="h-3 w-3 shrink-0" />
                                <span className="truncate">{u.companyName}</span>
                                {u.position && <span>• {u.position}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quota Progress */}
                      <td className="px-4 py-3.5">
                        <div className="w-56 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {u.usedCount} <span className="font-normal text-muted-foreground">/ {u.totalLimit} câu</span>
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isExceeded
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isWarning
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isExceeded ? "Hết lượt" : `Còn ${u.remaining}`}
                            </span>
                          </div>

                          {/* Visual progress bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          {/* Extra info badge if extra granted */}
                          {u.extraGranted > 0 && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              (Đã cộng thêm: +{u.extraGranted} câu)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.isBlocked ? (
                          <Pill tone="danger">
                            <Lock className="h-3 w-3" /> Đã Khóa AI
                          </Pill>
                        ) : isExceeded ? (
                          <Pill tone="danger">
                            <AlertTriangle className="h-3 w-3" /> Hết 50/50 câu
                          </Pill>
                        ) : isWarning ? (
                          <Pill tone="warning">
                            <AlertTriangle className="h-3 w-3" /> Sắp hết ({u.usedCount}/50)
                          </Pill>
                        ) : (
                          <Pill tone="success">
                            <CheckCircle2 className="h-3 w-3" /> Bình thường
                          </Pill>
                        )}
                      </td>

                      {/* Last Question Snippet */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {u.lastQuestion ? (
                          <div className="space-y-0.5">
                            <div
                              className="truncate text-xs font-medium text-foreground"
                              title={u.lastQuestion}
                            >
                              "{u.lastQuestion}"
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {fmtTime(u.lastRequestedAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa đặt câu hỏi</span>
                        )}
                      </td>

                      {/* Administrative Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Reset to 0 */}
                          <button
                            type="button"
                            title="Đặt lại số câu về 0"
                            disabled={actionLoading || u.usedCount === 0}
                            onClick={() => handleQuickReset(u)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 disabled:opacity-40"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Grant +50 */}
                          <button
                            type="button"
                            title="Cấp thêm +50 lượt hỏi"
                            disabled={actionLoading}
                            onClick={() => handleQuickGrant50(u)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>

                          {/* Toggle Lock / Unlock */}
                          <button
                            type="button"
                            title={u.isBlocked ? "Mở khóa AI" : "Khóa AI"}
                            disabled={actionLoading}
                            onClick={() => handleToggleBlock(u)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition disabled:opacity-40 ${
                              u.isBlocked
                                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            }`}
                          >
                            {u.isBlocked ? (
                              <Unlock className="h-3.5 w-3.5" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Detailed Settings Modal Trigger */}
                          <button
                            type="button"
                            title="Tùy chỉnh hạn mức chi tiết"
                            disabled={actionLoading}
                            onClick={() => openAdjustmentModal(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/80 px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>Chỉnh</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Custom Adjustment Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Điều Chỉnh Hạn Mức AI
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tài khoản: <strong className="text-foreground">{selectedUser.name}</strong> ({selectedUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-4">
              {/* Current Status Box */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/50 p-3 text-center text-xs">
                <div>
                  <div className="text-muted-foreground">Đã Dùng</div>
                  <div className="text-base font-bold text-foreground">{selectedUser.usedCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tổng Hạn Mức</div>
                  <div className="text-base font-bold text-foreground">{selectedUser.totalLimit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Còn Lại</div>
                  <div
                    className={`text-base font-bold ${
                      selectedUser.isExceeded ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {selectedUser.remaining}
                  </div>
                </div>
              </div>

              {/* Option 1: Reset counter to 0 */}
              <div className="rounded-xl border border-border p-3.5 flex items-center justify-between">
                <div>
                  <label htmlFor="reset-counter" className="text-sm font-semibold text-foreground cursor-pointer">
                    Đặt lại số câu đã dùng về 0
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Xóa bỏ số câu hỏi đã dùng, cho phép người dùng bắt đầu tính lại từ 0.
                  </p>
                </div>
                <input
                  id="reset-counter"
                  type="checkbox"
                  checked={modalResetCount}
                  onChange={(e) => setModalResetCount(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              {/* Option 2: Extra granted questions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Số Lượt Hỏi Cấp Thêm (Extra Granted)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={modalExtraGranted}
                    onChange={(e) => setModalExtraGranted(Number(e.target.value))}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setModalExtraGranted((prev) => prev + 20)}
                    className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    +20
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalExtraGranted((prev) => prev + 50)}
                    className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    +50
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalExtraGranted((prev) => prev + 100)}
                    className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    +100
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cộng thêm trực tiếp vào tổng hạn mức (Tổng = Hạn mức gốc + Cấp thêm).
                </p>
              </div>

              {/* Option 3: Max base limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Hạn Mức Gốc (Mặc định 50 câu)
                </label>
                <input
                  type="number"
                  min={1}
                  value={modalMaxLimit}
                  onChange={(e) => setModalMaxLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Option 4: Unblock checkbox if blocked */}
              {selectedUser.isBlocked && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                  <div>
                    <label htmlFor="unblock-user" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                      Mở khóa tài khoản ngay lập tức
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Tài khoản đang bị khóa AI. Tích chọn để cho phép sử dụng lại.
                    </p>
                  </div>
                  <input
                    id="unblock-user"
                    type="checkbox"
                    checked={modalUnblock}
                    onChange={(e) => setModalUnblock(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {actionLoading ? "Đang lưu..." : "Lưu Hạn Mức Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
