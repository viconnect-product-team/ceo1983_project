import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Printer, Nfc, CalendarDays, MapPin, Users, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { QrCanvas } from "@/components/member/QrCanvas";
import { getCheckinQrEventsFn, type CheckinQrEvent } from "@/lib/checkin-qr.functions";
import { detectNfcCapability } from "@/lib/nfc/capability";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin-qr")({
  ssr: false,
  // Mã QR/NFC phải luôn khớp ID sự kiện mới nhất → không dùng dữ liệu loader cũ.
  staleTime: 0,
  gcTime: 0,
  shouldReload: true,
  loader: () => getCheckinQrEventsFn(),
  component: CheckinQrPage,
  head: () => ({
    meta: [
      { title: "Mã QR check-in sự kiện | CEO 1983" },
      {
        name: "description",
        content: "Hiển thị mã QR để hội viên quét check-in sự kiện hiệp hội nhanh chóng.",
      },
      { property: "og:title", content: "Mã QR check-in sự kiện | CEO 1983" },
      {
        property: "og:description",
        content: "Bảng mã QR/NFC cho toàn bộ sự kiện để check-in tại chỗ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

function EventQrCard({ event }: { event: CheckinQrEvent }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);
  const [writing, setWriting] = useState(false);
  const [qrMode, setQrMode] = useState<"register" | "checkin">("register");

  const registerUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/events/${event.id}/register` 
    : `/events/${event.id}/register`;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(event.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Đã sao chép mã sự kiện: " + event.id);
    } catch {
      toast.error(t("checkinQr.copyFailed"));
    }
  };

  const copyRegisterLink = async () => {
    try {
      await navigator.clipboard.writeText(registerUrl);
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 1600);
      toast.success("Đã sao chép link quét mã đăng ký sự kiện cho khách mới!");
    } catch {
      toast.error("Không thể sao chép liên kết.");
    }
  };

  const writeNfc = async () => {
    if (detectNfcCapability() !== "SUPPORTED_WRITE") {
      toast.info(t("checkinQr.nfcUnsupported"));
      return;
    }
    setWriting(true);
    try {
      const Ctor = (window as unknown as { NDEFReader: new () => { write: (m: unknown) => Promise<void> } })
        .NDEFReader;
      const ndef = new Ctor();
      await ndef.write({ records: [{ recordType: "url", data: registerUrl }] });
      toast.success("Đã ghi thành công link đăng ký vào thẻ NFC!");
    } catch {
      toast.error(t("checkinQr.nfcFailed"));
    } finally {
      setWriting(false);
    }
  };

  const qrValue = qrMode === "register" ? registerUrl : event.id;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm break-inside-avoid">
      <header className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-base font-bold text-foreground">{event.name}</h2>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {event.ticketPrice && Number(event.ticketPrice) > 0 
              ? `${new Intl.NumberFormat("vi-VN").format(Number(event.ticketPrice))} đ` 
              : "Miễn phí (0đ)"}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
            {new Date(event.date).toLocaleDateString("vi-VN")}
          </span>
          {event.location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" />
              <span className="truncate">{event.location}</span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 font-medium">
            <Users aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
            {event.checkedIn}/{event.registered} đã check-in
          </span>
        </p>
      </header>

      {/* Tabs chọn mục đích QR */}
      <div className="flex rounded-lg bg-muted p-1 text-xs font-semibold print:hidden">
        <button
          type="button"
          onClick={() => setQrMode("register")}
          className={`flex-1 rounded-md py-1.5 transition-all cursor-pointer ${
            qrMode === "register"
              ? "bg-card text-primary shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ✦ QR Khách Mới Quét Đăng Ký
        </button>
        <button
          type="button"
          onClick={() => setQrMode("checkin")}
          className={`flex-1 rounded-md py-1.5 transition-all cursor-pointer ${
            qrMode === "checkin"
              ? "bg-card text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          QR Check-in Mã Vé
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl border border-border shadow-sm shrink-0">
          <QrCanvas value={qrValue} size={144} />
        </div>
        <div className="min-w-0 flex-1 text-xs space-y-1.5">
          {qrMode === "register" ? (
            <>
              <span className="inline-block font-bold text-primary">
                Standee / Màn hình đón tiếp
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Người mới không thuộc hiệp hội dùng Camera hoặc Zalo quét mã QR này để mở phiếu đăng ký tham dự.
              </p>
              <code className="mt-1 block truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-primary">
                {registerUrl}
              </code>
            </>
          ) : (
            <>
              <p className="text-muted-foreground font-semibold">Mã sự kiện check-in:</p>
              <code className="block truncate rounded-md bg-muted px-2 py-1 font-mono text-[12px] text-foreground">
                {event.id}
              </code>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Dành cho hội viên đã có tài khoản quét check-in trực tiếp.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <a
          href={registerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Users aria-hidden="true" className="h-3.5 w-3.5" />
          Mở Form Đăng Ký Khách
        </a>
        <button
          type="button"
          onClick={copyRegisterLink}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {copiedReg ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {copiedReg ? "Đã chép Link QR" : "Chép Link Đăng Ký"}
        </button>
        <button
          type="button"
          onClick={copyId}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {copied ? "Đã chép ID" : "Chép ID"}
        </button>
        <button
          type="button"
          onClick={writeNfc}
          disabled={writing}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <Nfc aria-hidden="true" className="h-3.5 w-3.5" />
          {writing ? "Đang ghi NFC..." : "Ghi thẻ NFC"}
        </button>
      </div>
    </article>
  );
}

function CheckinQrPage() {
  const t = useT();
  const router = useRouter();
  const events = Route.useLoaderData();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await router.invalidate();
      toast.success(t("checkinQr.refreshed"));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("checkinQr.title")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("checkinQr.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              <RefreshCw aria-hidden="true" className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? t("checkinQr.refreshing") : t("checkinQr.refresh")}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Printer aria-hidden="true" className="h-4 w-4" />
              {t("checkinQr.print")}
            </button>
          </div>
        </header>


        {events.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">{t("checkinQr.empty")}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((e: any) => (
              <EventQrCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
