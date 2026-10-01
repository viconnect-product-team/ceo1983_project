import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Pencil,
  Trash2,
  QrCode,
  Ticket,
  ClipboardList,
  Share2,
  Building2,
  Tag,
  CheckCircle2,
  Sparkles,
  Download,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";

import { CrudModal, type CrudField, type CrudValues } from "@/components/dashboard/CrudModal";
import { EventRegistrationPanel } from "@/components/dashboard/EventRegistrationPanel";
import { EventCheckinPanel } from "@/components/dashboard/EventCheckinPanel";
import { EventAttendees } from "@/components/dashboard/EventAttendees";
import { EventAgenda } from "@/components/dashboard/EventAgenda";
import { EventSponsors } from "@/components/dashboard/EventSponsors";
import { EventFeed } from "@/components/dashboard/EventFeed";
import { EventQrConfigModal } from "@/components/dashboard/EventQrConfigModal";
import { EventCheckinGatekeeperModal } from "@/components/events/EventCheckinGatekeeperModal";
import { EventSponsorPackageSelector } from "@/components/events/EventSponsorPackageSelector";
import { EventQrStaffSelector } from "@/components/events/EventQrStaffSelector";
import { EventGuestQrPresenterModal } from "@/components/events/EventGuestQrPresenterModal";
import {
  type EventItem,
  type Registration,
  type TicketType,
  type QrField,
} from "@/lib/events.functions";
import { fetchNestApi } from "@/lib/api-client";
import { useRole } from "@/hooks/use-role";
import { useFmt, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/events/$eventId")({
  ssr: false,
  loader: async ({ params }) => {
    const [event, tickets, registrations] = await Promise.all([
      fetchNestApi<EventItem>(`/events/${params.eventId}`).catch(() => null),
      fetchNestApi<TicketType[]>(`/events/${params.eventId}/tickets`).catch(() => []),
      fetchNestApi<Registration[]>(`/events/registrations?eventId=${params.eventId}`).catch(() => []),
    ]);

    let resolvedEvent = event;
    if (!resolvedEvent) {
      const allEvents = await fetchNestApi<any[]>('/events').catch(() => []);
      if (Array.isArray(allEvents)) {
        resolvedEvent = allEvents.find((e: any) => e.id === params.eventId || e.slug === params.eventId) || null;
      }
    }

    if (!resolvedEvent) throw notFound();
    const finalRegistrations = Array.isArray(registrations) ? registrations : [];

    return {
      event: resolvedEvent,
      registrations: finalRegistrations,
      tickets: Array.isArray(tickets) ? tickets : [],
    };
  },
  component: EventDetailPage,
  notFoundComponent: NotFoundView,
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error.message}
      </div>
    </AppShell>
  ),
});

const STATUS_TONE: Record<EventItem["status"], { bg: string; fg: string }> = {
  upcoming: { bg: "oklch(0.93 0.05 255)", fg: "oklch(0.45 0.16 265)" },
  ongoing: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.40 0.16 155)" },
  completed: { bg: "oklch(0.94 0.005 260)", fg: "oklch(0.50 0.02 260)" },
  cancelled: { bg: "oklch(0.94 0.06 25)", fg: "oklch(0.50 0.20 25)" },
};
const STATUS_KEY: Record<EventItem["status"], TKey> = {
  upcoming: "events.status.upcoming",
  ongoing: "events.status.ongoing",
  completed: "events.status.completed",
  cancelled: "events.status.cancelled",
};
const TYPE_KEY: Record<EventItem["type"], TKey> = {
  forum: "events.type.forum",
  workshop: "events.type.workshop",
  networking: "events.type.networking",
  training: "events.type.training",
};
const TYPE_COVER: Record<EventItem["type"], string> = {
  forum: "linear-gradient(135deg, oklch(0.55 0.18 265), oklch(0.62 0.16 300))",
  workshop: "linear-gradient(135deg, oklch(0.55 0.15 195), oklch(0.60 0.14 235))",
  networking: "linear-gradient(135deg, oklch(0.58 0.16 330), oklch(0.60 0.16 20))",
  training: "linear-gradient(135deg, oklch(0.55 0.15 155), oklch(0.60 0.14 195))",
};

function NotFoundView() {
  const t = useT();
  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <h2 className="mb-2 text-xl font-bold text-foreground">404</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t("edetail.notFound")}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("edetail.back")}
        </Link>
      </div>
    </AppShell>
  );
}

/** Countdown segments to a future date; null when the event is not upcoming. */
function useCountdown(dateIso: string, status: EventItem["status"]) {
  return useMemo(() => {
    if (status === "cancelled" || status === "completed") return null;
    const diff = new Date(dateIso).getTime() - Date.now();
    if (Number.isNaN(diff)) return null;
    if (diff <= 0) return status === "ongoing" ? "live" : "ended";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return { days, hours, mins } as const;
  }, [dateIso, status]);
}

function EventDetailPage() {
  const { event, registrations, tickets } = Route.useLoaderData() as {
    event: EventItem;
    registrations: Registration[];
    tickets: TicketType[];
  };
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const { isAdmin, isPlatformAdmin } = useRole();
  const canManage = isAdmin || isPlatformAdmin;

  const [editOpen, setEditOpen] = useState(false);
  const [gatekeeperOpen, setGatekeeperOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundPolicy, setRefundPolicy] = useState(
    "Hoàn tiền 100% cho đại biểu qua tài khoản ngân hàng trong vòng 3 - 5 ngày làm việc."
  );
  const [cancelling, setCancelling] = useState(false);
  const [guestQrOpen, setGuestQrOpen] = useState(false);

  const countdown = useCountdown(event.date, event.status);
  const s = STATUS_TONE[event.status] ?? STATUS_TONE.upcoming;
  const cancelled = event.status === "cancelled";

  const isPaidEvent = useMemo(() => {
    if (tickets && tickets.some((tk) => Number(tk.price || 0) > 0)) return true;
    if (registrations && registrations.some((r) => Number(r.paymentAmount || 0) > 0)) return true;
    return false;
  }, [tickets, registrations]);

  const onCancelEvent = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy sự kiện");
      return;
    }
    setCancelling(true);
    try {
      await fetchNestApi(`/events/${event.id}/cancel-event`, {
        method: "POST",
        body: JSON.stringify({
          reason: cancelReason.trim(),
          refundPolicy: isPaidEvent ? refundPolicy.trim() : undefined,
        }),
      });
      toast.success("Đã hủy sự kiện và gửi thông báo, tin nhắn đến tất cả người tham dự!");
      setCancelModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      console.error("[EventDetail] Cancel error:", err);
      toast.error(err?.message || "Không thể hủy sự kiện. Vui lòng thử lại!");
    } finally {
      setCancelling(false);
    }
  };

  const fields: CrudField[] = [
    { name: "name", label: t("events.col.event"), type: "text", required: true },
    { name: "image", label: "Ảnh banner sự kiện (URL / Upload)", type: "image" },
    { name: "date", label: t("events.col.date"), type: "date", required: true },
    { name: "location", label: t("events.col.location"), type: "text" },
    { name: "capacity", label: t("events.kpi.capacity"), type: "number" },
    {
      name: "qrStaff",
      label: "Người thực hiện quét mã QR (Ban Truyền Thông)",
      type: "custom",
      render: (val, onChange) => (
        <EventQrStaffSelector value={val || []} onChange={onChange} />
      ),
    },
    { name: "description", label: "Mô tả / Thông tin sự kiện", type: "textarea" },
    {
      name: "sponsors",
      label: "Nhà tài trợ & Gói đồng hành",
      type: "custom",
      render: (val, onChange) => (
        <EventSponsorPackageSelector eventId={event?.id} value={val || []} onChange={onChange} />
      ),
    },
    {
      name: "type",
      label: t("events.col.type"),
      type: "select",
      options: [
        { value: "forum", label: t("events.type.forum") },
        { value: "workshop", label: t("events.type.workshop") },
        { value: "networking", label: t("events.type.networking") },
        { value: "training", label: t("events.type.training") },
      ],
    },
    {
      name: "status",
      label: t("events.col.status"),
      type: "select",
      options: [
        { value: "upcoming", label: t("events.status.upcoming") },
        { value: "ongoing", label: t("events.status.ongoing") },
        { value: "completed", label: t("events.status.completed") },
        { value: "cancelled", label: t("events.status.cancelled") },
      ],
    },
  ];

  const onSubmit = async (v: CrudValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...v,
        capacity: v.capacity ? Number(v.capacity) : 0,
        imageUrl: v.image || (v as any).imageUrl,
        qrStaff: v.qrStaff || [],
        qrScanners: v.qrStaff || [],
        description: v.description || (v as any).description,
      };
      await fetchNestApi(`/events/${event.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success(t("common.updated"));
      setEditOpen(false);
      await router.invalidate();
    } catch (err: any) {
      console.error("[EventDetail] Update error:", err);
      toast.error(err?.message || t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t("events.deleteConfirm", { name: event.name }))) return;
    setDeleting(true);
    try {
      await fetchNestApi(`/events/${event.id}`, { method: "DELETE" });
      toast.success(t("events.deleted"));
      await router.invalidate();
    } catch (err: any) {
      console.error("[EventDetail] Delete error:", err);
      toast.error(err?.message || t("events.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("edetail.shareCopied"));
    } catch {
      /* ignore */
    }
  };

  const overview = t("edetail.overview.fallback", {
    type: t(TYPE_KEY[event.type]),
    location: event.location || "—",
  });

  return (
    <AppShell>
      {/* Back link */}
      <Link
        to="/events"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("edetail.back")}
      </Link>

      {/* Cancellation Alert Banner */}
      {cancelled && (
        <div className="mb-5 rounded-2xl border-2 border-red-500/50 bg-red-50 dark:bg-red-950/40 p-4 text-red-900 dark:text-red-200 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-red-900 dark:text-red-200">
              Sự kiện này đã bị hủy bỏ bởi Ban Tổ Chức
            </h4>
            {(event as any).cancelReason && (
              <p className="text-xs text-red-800 dark:text-red-300">
                <span className="font-semibold">Lý do hủy:</span> {(event as any).cancelReason}
              </p>
            )}
            {(event as any).refundPolicy && (
              <p className="text-xs text-red-700 dark:text-red-400">
                <span className="font-semibold">Chính sách hoàn tiền:</span> {(event as any).refundPolicy}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)] min-w-0 w-full">
        <div className="relative min-h-[240px] md:min-h-[300px] p-5 md:p-10 flex flex-col justify-end">
          {(() => {
            const typeFallbacks: Record<string, string> = {
              forum: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
              workshop: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
              networking: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
              training: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80",
            };
            const fallback = typeFallbacks[event.type] || typeFallbacks.forum;
            const cover = (event as any).imageUrl || (event as any).image || (event as any).bannerUrl || (event as any).coverUrl || fallback;
            return (
              <>
                <img
                  src={cover}
                  alt={event.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(ev) => {
                    const target = ev.target as HTMLImageElement;
                    if (target.src !== fallback) target.src = fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/35" />
              </>
            );
          })()}
          <div className="relative z-10">
            <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: s.bg, color: s.fg }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.fg }}
                  aria-hidden="true"
                />
                {t(STATUS_KEY[event.status])}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground backdrop-blur">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" /> {t(TYPE_KEY[event.type])}
              </span>
              {(event as any).qrStaff && (Array.isArray((event as any).qrStaff) ? (event as any).qrStaff.length > 0 : true) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" /> Gatekeeper: {Array.isArray((event as any).qrStaff) ? (event as any).qrStaff.join(", ") : (event as any).qrStaff}
                </span>
              )}
            </div>
            <h1 className="max-w-3xl text-xl font-bold text-white drop-shadow-md sm:text-2xl md:text-4xl break-words">
              {event.name}
            </h1>
            <div className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-white/90 sm:flex-row sm:flex-wrap sm:gap-4 md:mt-4">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />{" "}
                {fmt.date(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />{" "}
                <span className="truncate max-w-xs">{event.location || "—"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" /> {event.registered}/
                {event.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Hero action band */}
        <div className="flex flex-col gap-4 border-t border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
          {/* Countdown / status */}
          <div className="min-w-0">
            {countdown === null || countdown === "ended" ? (
              <p className="text-sm font-medium text-muted-foreground">
                {t("edetail.countdown.ended")}
              </p>
            ) : countdown === "live" ? (
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> {t("edetail.countdown.live")}
              </p>
            ) : (
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("edetail.countdown.title")}
                </p>
                <div className="flex items-center gap-3">
                  <CountUnit value={countdown.days} label={t("edetail.countdown.days")} />
                  <CountUnit value={countdown.hours} label={t("edetail.countdown.hours")} />
                  <CountUnit value={countdown.mins} label={t("edetail.countdown.mins")} />
                </div>
              </div>
            )}
          </div>

          {/* CTAs (desktop) */}
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{" "}
              {t("edetail.share")}
            </button>
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => setGuestQrOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  QR Đón Tiếp & Thanh Toán (BTT)
                </button>
                <button
                  type="button"
                  onClick={() => setGatekeeperOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-500/20 transition"
                >
                  <QrCode className="h-4 w-4" aria-hidden="true" />
                  Quản lý QR Gatekeeper
                </button>
                <Link
                  to="/checkin"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <QrCode className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{" "}
                  {t("edetail.cta.checkin")}
                </Link>
                <Link
                  to="/event-registrations"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{" "}
                  {t("edetail.cta.manageReg")}
                </Link>
                {!cancelled && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20 transition cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Hủy sự kiện
                    </button>
                    <button
                      onClick={onDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> {t("events.delete")}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" /> {t("edetail.cta.edit")}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.datetime")}
          value={fmt.date(event.date)}
        />
        <SummaryCard
          icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.location")}
          value={event.location || "—"}
        />
        <SummaryCard
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.registration")}
          value={`${event.registered}/${event.capacity}`}
        />
        <SummaryCard
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.capacity")}
          value={String(event.capacity)}
        />
        <SummaryCard
          icon={<QrCode className="h-4 w-4 text-amber-500" aria-hidden="true" />}
          label="Phụ trách QR Cổng"
          value={
            Array.isArray((event as any).qrStaff)
              ? (event as any).qrStaff.length > 0
                ? (event as any).qrStaff.join(", ")
                : "Chưa phân công"
              : (event as any).qrStaff || "Chưa phân công"
          }
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.status")}
          value={t(STATUS_KEY[event.status])}
        />
        <SummaryCard
          icon={<Tag className="h-4 w-4" aria-hidden="true" />}
          label={t("edetail.summary.type")}
          value={t(TYPE_KEY[event.type])}
        />
      </div>

      {/* Main content */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr] min-w-0 w-full overflow-hidden">
        {/* Left: overview + attendees */}
        <div className="space-y-5 min-w-0 w-full overflow-hidden">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              {t("edetail.overview.title")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{overview}</p>
          </section>

          <TicketsSection tickets={tickets} event={event} canManage={canManage} />

          <EventAgenda event={event} />

          <EventSponsors sponsors={event.sponsors as any} />

          <EventAttendees registrations={registrations} canManage={canManage} />

          <EventFeed event={event} registrations={registrations} canManage={canManage} />
        </div>

        {/* Right: registration + check-in panels */}
        <aside className="space-y-5 min-w-0 w-full overflow-hidden">
          <EventRegistrationPanel
            event={event}
            registrations={registrations}
            canManage={canManage}
          />
          <EventCheckinPanel event={event} registrations={registrations} canManage={canManage} />
        </aside>
      </div>

      {/* Sticky mobile action bar (sits above the bottom tab bar) */}
      {canManage && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-2 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setGatekeeperOpen(true)}
            aria-label="Quản lý QR Gatekeeper"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 transition active:scale-95"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link
            to="/event-registrations"
            aria-label={t("edetail.cta.manageReg")}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border text-foreground transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            to="/checkin"
            aria-label={t("edetail.cta.checkin")}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border text-foreground transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            onClick={() => setEditOpen(true)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" /> {t("edetail.cta.edit")}
          </button>
        </div>
      )}
      {canManage && <div className="h-20 md:hidden" />}

      <CrudModal
        open={editOpen}
        title={t("common.editTitle")}
        fields={fields}
        initial={({
          ...event,
          sponsors: event.sponsors || [],
          qrStaff: (event as any).qrStaff || (event as any).qrScanners || [],
        }) as unknown as CrudValues}
        submitting={submitting}
        submitLabel={t("common.save")}
        cancelLabel={t("common.cancel")}
        onSubmit={onSubmit}
        onClose={() => setEditOpen(false)}
      />

      <EventCheckinGatekeeperModal
        open={gatekeeperOpen}
        event={event}
        onClose={() => setGatekeeperOpen(false)}
        onUpdateEvent={() => router.invalidate()}
      />

      {/* Event Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold">Xác nhận hủy sự kiện</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Khi hủy sự kiện, trạng thái sự kiện sẽ chuyển thành <b>Đã hủy (Cancelled)</b>. Hệ thống sẽ tự động{" "}
              <b>gửi thông báo đẩy (push notifications)</b> và <b>gửi tin nhắn trực tiếp vào hộp thư (inbox messages)</b> đến
              toàn bộ đại biểu / người đã đăng ký tham dự.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Lý do hủy sự kiện <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do chi tiết để thông báo cho người tham dự (VD: Thay đổi kế hoạch của Ban Điều Hành, lý do bất khả kháng...)"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-destructive focus:outline-none"
              />
            </div>

            {isPaidEvent && (
              <div className="space-y-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Chính sách hoàn tiền (Sự kiện có thu phí)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sự kiện này có người tham gia có phí. Theo quy chế của Hiệp hội, các khoản phí đã thanh toán sẽ được
                  hoàn trả trong vòng 3 - 5 ngày làm việc.
                </p>
                <input
                  type="text"
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-400/50 bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={cancelling || !cancelReason.trim()}
                onClick={onCancelEvent}
                className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground py-2.5 text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? "Đang xử lý..." : "Xác nhận hủy sự kiện"}
              </button>
            </div>
          </div>
        </div>
      )}

      <EventGuestQrPresenterModal
        open={guestQrOpen}
        onClose={() => setGuestQrOpen(false)}
        event={{
          id: event.id,
          name: event.name,
          date: event.date ? fmt.date(event.date) : undefined,
          location: event.location,
          ticketPrice: (event as any).ticketPrice ?? (event as any).ticket_price ?? (event as any).fee,
          fee: (event as any).fee,
        }}
      />
    </AppShell>
  );
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="min-w-[2.5rem] rounded-xl bg-secondary px-2 py-1.5 text-lg font-bold tabular-nums text-foreground">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TicketsSection({
  tickets,
  event,
  canManage,
}: {
  tickets: TicketType[];
  event: EventItem;
  canManage: boolean;
}) {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [savingQr, setSavingQr] = useState(false);

  const handleDownload = async (tk: TicketType, kind: "png" | "pdf") => {
    setBusy(`${tk.id}-${kind}`);
    try {
      const { downloadTicketQrPng, downloadTicketQrPdf } = await import("@/lib/ticket-qr");
      if (kind === "png") {
        await downloadTicketQrPng(event, tk);
      } else {
        await downloadTicketQrPdf(event, tk);
      }
      toast.success(t("edetail.tickets.qrReady", { name: tk.name }));
    } catch {
      toast.error(t("edetail.tickets.qrError"));
    } finally {
      setBusy(null);
    }
  };

  const applyQrFields = async (fields: QrField[]) => {
    setSavingQr(true);
    try {
      await fetchNestApi(`/events/${event.id}/qr-fields`, {
        method: "PUT",
        body: JSON.stringify({ qrFields: fields }),
      });
      toast.success(t("edetail.qr.saved"));
      setQrOpen(false);
      await router.invalidate();
    } catch (err: any) {
      console.error("[EventDetail] Save QR fields error:", err);
      toast.error(err?.message || t("edetail.qr.saveError"));
    } finally {
      setSavingQr(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Ticket className="h-4 w-4 text-primary" aria-hidden="true" />{" "}
          {t("edetail.tickets.title")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            {event.qrFields.map((f) => t(`ewz.qr.${f}` as never)).join(" · ")}
          </span>
          {canManage && (
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              {t("edetail.qr.configure")}
            </button>
          )}
        </div>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("edetail.tickets.free")}</p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((tk) => (
            <li
              key={tk.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{tk.name}</p>
                {tk.description && (
                  <p className="truncate text-xs text-muted-foreground">{tk.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {tk.price > 0 ? fmt.num(tk.price) : t("edetail.tickets.freePrice")}
                  </p>
                  {tk.quantity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("edetail.tickets.qty", { n: tk.quantity })}
                    </p>
                  )}
                </div>
                <div
                  className="flex shrink-0 items-center gap-1.5"
                  role="group"
                  aria-label={t("edetail.tickets.qrAria", { name: tk.name })}
                >
                  <button
                    type="button"
                    onClick={() => handleDownload(tk, "png")}
                    disabled={busy !== null}
                    aria-label={t("edetail.tickets.downloadPng")}
                    title={t("edetail.tickets.downloadPng")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(tk, "pdf")}
                    disabled={busy !== null}
                    aria-label={t("edetail.tickets.downloadPdf")}
                    title={t("edetail.tickets.downloadPdf")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    PDF
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <EventQrConfigModal
        open={qrOpen}
        initial={event.qrFields}
        submitting={savingQr}
        onClose={() => setQrOpen(false)}
        onSubmit={applyQrFields}
      />
    </section>
  );
}
