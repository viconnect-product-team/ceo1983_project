import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight, Plus, QrCode, Ticket, Trash2, X, ImagePlus, Sparkles, MapPin, Users, Award } from "lucide-react";
import { toast } from "sonner";
import {
  QR_FIELDS,
  type EventItem,
  type QrField,
  type EventSponsorItem,
} from "@/lib/events.functions";
import { fetchNestApi, uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { QrCanvas } from "@/components/member/QrCanvas";
import { useT } from "@/lib/i18n";
import { EVENT_TYPE_TEMPLATES, type EventTypeKey } from "@/lib/event-type-templates";
import { EventQrStaffSelector } from "@/components/events/EventQrStaffSelector";
import { EventSponsorPackageSelector } from "@/components/events/EventSponsorPackageSelector";

type EventType = EventItem["type"];
type EventStatus = EventItem["status"];

type TicketDraft = {
  name: string;
  price: string;
  quantity: string;
  description: string;
};

type Info = {
  name: string;
  tagline?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  capacity: string;
  type: EventType;
  status: EventStatus;
  imageUrl?: string;
  photoGalleryUrl?: string;
  description?: string;
  qrStaff: string[];
  sponsors: EventSponsorItem[];
};

const emptyTicket = (): TicketDraft => ({ name: "", price: "", quantity: "", description: "" });

import { VndCurrencyInput, parseVndNumber } from "@/components/dashboard/VndCurrencyInput";
import { StandardDateInput, formatToDdmmyyyy } from "@/components/common/StandardDateInput";
import { GoogleMapAddressPicker } from "@/components/common/GoogleMapAddressPicker";

const TYPE_OPTS: EventType[] = ["forum", "workshop", "networking", "training"];
const STATUS_OPTS: EventStatus[] = ["upcoming", "ongoing", "completed", "cancelled"];

export function EventWizard({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (event: EventItem) => void;
}) {
  // Chỉ render khi người dùng bấm "Tạo sự kiện" (open=true). Mỗi lần mở là 1 phiên mới (state reset).
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <EventWizardDialog onClose={onClose} onCreated={onCreated} />,
    document.body,
  );
}

function EventWizardDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (event: EventItem) => void;
}) {
  const t = useT();

  // Khóa cuộn trang nền khi popup đang mở
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  const defaultTpl = EVENT_TYPE_TEMPLATES.forum;

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<Info>({
    name: "",
    tagline: defaultTpl.tagline,
    date: "",
    startTime: "08:30",
    endTime: "11:30",
    location: "",
    capacity: "",
    type: "forum",
    status: "upcoming",
    imageUrl: defaultTpl.bgImage,
    description: "",
    qrStaff: [],
    sponsors: [],
  });
  const [tickets, setTickets] = useState<TicketDraft[]>([]);
  const [qrFields, setQrFields] = useState<QrField[]>(["registration_code"]);

  const reset = () => {
    setStep(0);
    setInfo({
      name: "",
      tagline: defaultTpl.tagline,
      date: "",
      startTime: "08:30",
      endTime: "11:30",
      location: "",
      capacity: "",
      type: "forum",
      status: "upcoming",
      imageUrl: defaultTpl.bgImage,
      description: "",
      qrStaff: [],
      sponsors: [],
    });
    setTickets([]);
    setQrFields(["registration_code"]);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const qrSample = useMemo(() => {
    const parts: string[] = [];
    if (qrFields.includes("registration_code")) parts.push("REG-XXXXXX");
    if (qrFields.includes("verify_url")) parts.push(`${originSafe()}/verify?c=REG-XXXXXX`);
    if (qrFields.includes("ticket_code")) {
      const activeTicketName =
        tickets.slice().reverse().find((t) => t.name.trim())?.name.trim() ||
        tickets[0]?.name.trim() ||
        "TK-STANDARD";
      parts.push(activeTicketName);
    }
    return parts.join("|") || "REG-XXXXXX";
  }, [qrFields, tickets]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInfo = () => {
    const errs: Record<string, string> = {};
    if (!info.name.trim()) {
      errs.name = "Vui lòng nhập tên sự kiện!";
    }
    if (!info.date.trim()) {
      errs.date = "Vui lòng chọn ngày diễn ra theo định dạng ngày/tháng/năm!";
    }
    if (!info.location.trim()) {
      errs.location = "Vui lòng nhập địa điểm tổ chức sự kiện!";
    }
    if (!info.capacity.trim() || Number(info.capacity) <= 0) {
      errs.capacity = "Vui lòng nhập số lượng đại biểu (sức chứa)!";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc có dấu (*)");
      return false;
    }
    return true;
  };

  const validateTickets = () => {
    const errs: Record<string, string> = {};
    tickets.forEach((tk, idx) => {
      if (!tk.name.trim()) {
        errs[`ticket_${idx}_name`] = "Vui lòng nhập tên hạng vé!";
      }
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Vui lòng nhập tên cho các hạng vé!");
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 0 && !validateInfo()) return;
    if (step === 1 && !validateTickets()) return;
    setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const back = () => setStep((s) => (s - 1) as 0 | 1 | 2);

  const toggleQr = (f: QrField) => {
    setQrFields((prev) => (prev.includes(f) ? prev.filter((x: any) => x !== f) : [...prev, f]));
  };

  const submit = async () => {
    if (!validateInfo() || !validateTickets()) return;
    if (qrFields.length === 0) {
      toast.error(t("ewz.err.qr"));
      return;
    }
    setSubmitting(true);
    try {
      const computedTicketPrice = tickets.length > 0
        ? Math.max(0, ...tickets.map((tk) => parseVndNumber(tk.price)))
        : 0;

      const res = await fetchNestApi<{ event: EventItem }>("/events", {
        method: "POST",
        body: JSON.stringify({
          name: info.name.trim(),
          tagline: (info.tagline || "").trim(),
          date: info.date,
          startTime: (info.startTime || "08:30").trim(),
          endTime: (info.endTime || "11:30").trim(),
          time: `${(info.startTime || "08:30").trim()} - ${(info.endTime || "11:30").trim()}`,
          location: info.location.trim(),
          address: info.location.trim(),
          capacity: Number(info.capacity) || 0,
          type: info.type,
          status: info.status,
          imageUrl: info.imageUrl,
          image: info.imageUrl,
          banner: info.imageUrl,
          photoGalleryUrl: info.photoGalleryUrl || "",
          ticketPrice: computedTicketPrice,
          fee: computedTicketPrice,
          description: info.description || "",
          qrStaff: info.qrStaff,
          qrScanners: info.qrStaff,
          sponsors: info.sponsors,
          qrFields,
          tickets: tickets.map((tk) => ({
            name: tk.name.trim(),
            price: parseVndNumber(tk.price),
            quantity: parseInt(String(tk.quantity).replace(/\D/g, ""), 10) || 0,
            description: tk.description.trim(),
          })),
        }),
      });
      toast.success(t("ewz.created"));
      reset();
      onCreated(res?.event || (res as unknown as EventItem));
    } catch (err: any) {
      console.error("[EventWizard] Create error:", err);
      toast.error(err?.message || t("ewz.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [t("ewz.step.info"), t("ewz.step.tickets"), t("ewz.step.qr")];
  const announcement = submitting
    ? t("ewz.announce.submitting")
    : t("ewz.announce.step", { n: step + 1, total: 3, label: steps[step] });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
    >
      <p className="sr-only" role="status" aria-live="polite" data-testid="ewz-announcement">
        {announcement}
      </p>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("ewz.title")}
        aria-busy={submitting}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + stepper */}
        <div className="border-b border-border bg-slate-50 dark:bg-card/90 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
              <span>{t("ewz.title")}</span>
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={t("ewz.cancel")}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <ol
            className="flex items-center gap-2"
            aria-label={t("ewz.step.of", { n: step + 1, total: 3 })}
          >
            {steps.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    i < step
                      ? "bg-[#003B95] text-white font-bold"
                      : i === step
                        ? "bg-[#003B95]/15 text-[#003B95] ring-2 ring-[#003B95] font-bold dark:text-blue-400 dark:ring-blue-400"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={`truncate text-xs font-medium ${i === step ? "text-[#003B95] dark:text-blue-400 font-bold" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-background text-foreground">
          {step === 0 && <InfoStep info={info} setInfo={setInfo} errors={errors} setErrors={setErrors} />}
          {step === 1 && <TicketStep tickets={tickets} setTickets={setTickets} errors={errors} setErrors={setErrors} />}
          {step === 2 && <QrStep qrFields={qrFields} toggleQr={toggleQr} sample={qrSample} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-slate-50 dark:bg-card/90 p-4">
          <button
            type="button"
            onClick={step === 0 ? close : back}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer"
          >
            {step === 0 ? (
              t("ewz.cancel")
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {t("ewz.back")}
              </>
            )}
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-bold bg-[#003B95] hover:bg-[#002d73] text-white shadow-md shadow-[#003B95]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer transition active:scale-95"
            >
              {t("ewz.next")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-bold bg-[#003B95] hover:bg-[#002d73] text-white shadow-md shadow-[#003B95]/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer transition active:scale-95"
            >
              <Check className="h-4 w-4 text-white" aria-hidden="true" />
              {submitting ? "Đang xử lý..." : t("ewz.create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function originSafe() {
  return typeof window !== "undefined" ? window.location.origin : "https://app";
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-[#003B95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B95]/30 transition";
const labelCls = "mb-1.5 block text-xs font-semibold text-foreground";

function InfoStep({
  info,
  setInfo,
  errors,
  setErrors,
}: {
  info: Info;
  setInfo: (v: Info) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const t = useT();
  const currentTpl = EVENT_TYPE_TEMPLATES[info.type as EventTypeKey] || EVENT_TYPE_TEMPLATES.forum;

  const handleSelectType = (newType: EventTypeKey) => {
    const tpl = EVENT_TYPE_TEMPLATES[newType];
    setInfo({
      ...info,
      type: newType,
      name: tpl.name,
      tagline: tpl.tagline,
      location: tpl.defaultLocation,
      capacity: tpl.defaultCapacity,
      imageUrl: tpl.bgImage,
      description: tpl.description,
    });
    toast.info(`Đã áp dụng bố cục nội dung & banner: ${tpl.label}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{t("ewz.info.heading")}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.info.hint")}</p>
      </div>

      {/* Event Type Grid Selector (Requirement 2: chọn loại sự kiện -> tự động hiện text & banner đúng) */}
      <div>
        <label className={labelCls}>
          Chọn loại sự kiện (Tự động áp dụng bố cục nội dung & banner đặc thù)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["forum", "workshop", "networking", "training"] as EventTypeKey[]).map((key) => {
            const tpl = EVENT_TYPE_TEMPLATES[key];
            const isSelected = info.type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectType(key)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#003B95] bg-blue-50 dark:bg-blue-950/30 ring-2 ring-[#003B95]/30 shadow-xs"
                    : "border-border bg-card hover:bg-muted/50 hover:border-[#003B95]/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className={`text-xs font-bold line-clamp-1 ${isSelected ? "text-[#003B95] dark:text-blue-400" : "text-foreground"}`}>{tpl.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 ml-auto shrink-0" />}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                  {tpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Custom Banner Preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Bố cục Banner xem trước theo loại sự kiện</label>
          <button
            type="button"
            onClick={() => handleSelectType(info.type as EventTypeKey)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Khôi phục nội dung mẫu
          </button>
        </div>
        <div
          className="relative overflow-hidden rounded-2xl p-4 shadow-md text-white min-h-[160px] flex flex-col justify-between border border-white/15"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${info.imageUrl || currentTpl.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs"
              style={{ backgroundColor: currentTpl.badgeBg, color: currentTpl.badgeText }}
            >
              {currentTpl.badge}
            </span>
            <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
              CLB CEO 1983
            </span>
          </div>

          {/* Headline Title & Tagline */}
          <div className="my-2">
            <h4 className="text-sm sm:text-base font-extrabold uppercase leading-tight tracking-tight drop-shadow-md text-white line-clamp-2">
              {info.name || currentTpl.name}
            </h4>
            <p className="mt-1 text-xs font-semibold drop-shadow-sm line-clamp-1" style={{ color: currentTpl.accentColor }}>
              {info.tagline !== undefined && info.tagline !== "" ? info.tagline : currentTpl.tagline}
            </p>
          </div>

          {/* Bottom Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/20 text-[10.5px] text-white/90">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="line-clamp-1 max-w-[220px]">{info.location || currentTpl.defaultLocation}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span>📅 {info.date ? formatToDdmmyyyy(info.date) : "25/09/2026"}</span>
              <span>👥 {info.capacity || currentTpl.defaultCapacity} khách</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div>
        <label className={labelCls} htmlFor="ewz-name">
          {t("ewz.field.name")} <span className="text-destructive font-bold">*</span>
        </label>
        <input
          id="ewz-name"
          className={`${inputCls} ${errors.name ? "border-destructive ring-1 ring-destructive/30" : ""}`}
          placeholder="Nhập tên sự kiện (ví dụ: Gala Doanh Nhân CEO 1983 - Kỷ Niệm 10 Năm)..."
          value={info.name}
          onChange={(e) => {
            setInfo({ ...info, name: e.target.value });
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        {errors.name && (
          <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
            {errors.name}
          </p>
        )}
      </div>

      {/* Trường mới: Khẩu hiệu / Thông điệp phụ trên Banner */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls} htmlFor="ewz-tagline">
            Khẩu hiệu / Thông điệp phụ trên Banner (Tagline / Slogan)
          </label>
          <span className="text-[10px] text-muted-foreground">Hiển thị trực tiếp dưới tiêu đề banner xem trước</span>
        </div>
        <input
          id="ewz-tagline"
          className={inputCls}
          placeholder="Nhập khẩu hiệu banner (ví dụ: Bứt phá tăng trưởng & Kết nối giao thương đa ngành)..."
          value={info.tagline ?? ""}
          onChange={(e) => {
            setInfo({ ...info, tagline: e.target.value });
          }}
        />
      </div>

      {/* Event Banner / Photo Upload */}
      <div>
        <label className={labelCls}>Ảnh nền Banner sự kiện</label>
        {info.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={resolveMediaUrl(info.imageUrl) || info.imageUrl}
              alt="Banner sự kiện"
              className="h-28 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setInfo({ ...info, imageUrl: "" })}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-black/70 text-white hover:bg-rose-600 transition"
              aria-label="Xoá ảnh"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800/60 bg-blue-50 dark:bg-[#001433]/60 p-3 hover:border-blue-400 dark:hover:border-amber-400/60 hover:bg-blue-100 dark:hover:bg-[#001838] transition">
            <ImagePlus className="h-6 w-6 text-blue-400 dark:text-amber-400/80 mb-1" />
            <span className="text-xs font-semibold text-blue-700 dark:text-white">Tải ảnh sự kiện lên</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">PNG, JPG hoặc WEBP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const toastId = toast.loading("Đang tải ảnh sự kiện lên hệ thống...");
                try {
                  const uploadedUrl = await uploadFileToNest(file, `event_${Date.now()}_${file.name}`);
                  setInfo({ ...info, imageUrl: uploadedUrl });
                  toast.success("Đã tải ảnh sự kiện thành công!", { id: toastId });
                } catch (err: any) {
                  toast.error(err?.message || "Lỗi tải ảnh sự kiện", { id: toastId });
                }
              }}
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ewz-date">
            {t("ewz.field.date")} (dd/mm/yyyy) <span className="text-destructive font-bold">*</span>
          </label>
          <StandardDateInput
            id="ewz-date"
            className={`${inputCls} ${errors.date ? "border-destructive ring-1 ring-destructive/30" : ""}`}
            value={info.date}
            placeholder="dd/mm/yyyy (ví dụ: 25/10/2026)"
            onChange={(isoVal) => {
              setInfo({ ...info, date: isoVal });
              if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
            }}
          />
          {errors.date && (
            <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
              {errors.date}
            </p>
          )}
        </div>
        <div>
          <label className={labelCls} htmlFor="ewz-capacity">
            {t("ewz.field.capacity")} <span className="text-destructive font-bold">*</span>
          </label>
          <input
            id="ewz-capacity"
            type="number"
            min={0}
            className={`${inputCls} ${errors.capacity ? "border-destructive ring-1 ring-destructive/30" : ""}`}
            placeholder="Ví dụ: 100 chỗ ngồi"
            value={info.capacity}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              setInfo({ ...info, capacity: e.target.value });
              if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: "" }));
            }}
          />
          {errors.capacity && (
            <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
              {errors.capacity}
            </p>
          )}
        </div>
      </div>

      {/* Thời gian bắt đầu - kết thúc */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ewz-start-time">
            Giờ bắt đầu (VD: 08:30)
          </label>
          <input
            id="ewz-start-time"
            type="text"
            className={inputCls}
            placeholder="08:30"
            value={info.startTime ?? ""}
            onChange={(e) => setInfo({ ...info, startTime: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ewz-end-time">
            Giờ kết thúc (VD: 11:30)
          </label>
          <input
            id="ewz-end-time"
            type="text"
            className={inputCls}
            placeholder="11:30"
            value={info.endTime ?? ""}
            onChange={(e) => setInfo({ ...info, endTime: e.target.value })}
          />
        </div>
      </div>

      <div>
        <GoogleMapAddressPicker
          id="ewz-location"
          label={t("ewz.field.location")}
          required
          value={info.location}
          onChange={(addr, extra) => {
            setInfo({
              ...info,
              location: addr,
              ...(extra?.mapUrl ? { photoGalleryUrl: info.photoGalleryUrl || extra.mapUrl } : {}),
            });
            if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
          }}
          placeholder="Địa chỉ / Khách sạn tổ chức (ví dụ: Trung tâm Hội nghị Quốc gia, Hà Nội)..."
          error={errors.location}
          showQuickLocations={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ewz-type">
            {t("ewz.field.type")}
          </label>
          <select
            id="ewz-type"
            className={inputCls}
            value={info.type}
            onChange={(e) => handleSelectType(e.target.value as EventTypeKey)}
          >
            {TYPE_OPTS.map((o) => (
              <option key={o} value={o}>
                {t(`events.type.${o}` as never)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ewz-status">
            {t("ewz.field.status")}
          </label>
          <select
            id="ewz-status"
            className={inputCls}
            value={info.status}
            onChange={(e) => setInfo({ ...info, status: e.target.value as EventStatus })}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o} value={o}>
                {t(`events.status.${o}` as never)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mô tả / Nội dung chi tiết sự kiện */}
      <div>
        <label className={labelCls} htmlFor="ewz-description">
          Mô tả / Thông tin sự kiện
        </label>
        <textarea
          id="ewz-description"
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-[#003B95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B95]/30 transition"
          value={info.description || ""}
          onChange={(e) => setInfo({ ...info, description: e.target.value })}
          placeholder="Nhập nội dung tóm tắt, lịch trình hoặc lưu ý tham gia..."
        />
      </div>

      {/* Link ảnh sự kiện (Google Drive / Cloud) dành cho Ban Truyền Thông nạp link ảnh sau sự kiện */}
      <div>
        <label className={labelCls} htmlFor="ewz-photo-gallery">
          Link album ảnh sự kiện (Google Drive / Lưu trữ đám mây)
        </label>
        <input
          id="ewz-photo-gallery"
          type="url"
          className={inputCls}
          placeholder="https://drive.google.com/drive/folders/... hoặc liên kết album ảnh"
          value={info.photoGalleryUrl || ""}
          onChange={(e) => setInfo({ ...info, photoGalleryUrl: e.target.value })}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Ban Truyền Thông dán link Google Drive hoặc OneDrive chứa ảnh sự kiện vào đây để hội viên xem và tải ảnh sau khi sự kiện kết thúc.
        </p>
      </div>

      {/* MULTISELECT 1: Chọn người thực hiện quét mã QR (Ban Truyền Thông) */}
      <div className="pt-3 border-t border-border">
        <label className="mb-2 block text-xs font-semibold text-foreground">
          Người thực hiện quét mã QR (Ban Truyền Thông)
        </label>
        <EventQrStaffSelector
          value={info.qrStaff}
          onChange={(staffList) => setInfo({ ...info, qrStaff: staffList })}
        />
      </div>

      {/* MULTISELECT 2: Chọn nhà tài trợ & Gói đồng hành đi kèm */}
      <div className="pt-3 border-t border-border">
        <label className="mb-2 block text-xs font-semibold text-foreground">
          Nhà tài trợ & Gói tài trợ đồng hành đi kèm
        </label>
        <EventSponsorPackageSelector
          value={info.sponsors}
          onChange={(sponsors) => setInfo({ ...info, sponsors })}
        />
      </div>
    </div>
  );
}

function TicketStep({
  tickets,
  setTickets,
  errors,
  setErrors,
}: {
  tickets: TicketDraft[];
  setTickets: (v: TicketDraft[]) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const t = useT();
  const update = (i: number, patch: Partial<TicketDraft>) =>
    setTickets(tickets.map((tk, idx) => (idx === i ? { ...tk, ...patch } : tk)));
  const remove = (i: number) => setTickets(tickets.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Ticket className="h-4 w-4 text-primary" aria-hidden="true" /> {t("ewz.tickets.heading")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.tickets.hint")}</p>
      </div>

      {tickets.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          {t("ewz.tickets.empty")}
        </p>
      )}

      <div className="space-y-3">
        {tickets.map((tk, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 shadow-xs">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex-1">
                <label htmlFor={`ewz-ticket-name-${i}`} className="sr-only">
                  {t("ewz.tickets.name")}
                </label>
                <input
                  id={`ewz-ticket-name-${i}`}
                  className={`${inputCls} font-medium ${errors[`ticket_${i}_name`] ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                  placeholder={t("ewz.tickets.namePh")}
                  aria-label={t("ewz.tickets.name")}
                  value={tk.name}
                  onChange={(e) => {
                    update(i, { name: e.target.value });
                    if (errors[`ticket_${i}_name`]) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy[`ticket_${i}_name`];
                        return copy;
                      });
                    }
                  }}
                />
                {errors[`ticket_${i}_name`] && (
                  <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
                    {errors[`ticket_${i}_name`]}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={t("ewz.tickets.remove")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls} htmlFor={`ewz-ticket-price-${i}`}>
                    {t("ewz.tickets.price")} (VNĐ)
                  </label>
                  {(() => {
                    const num = parseVndNumber(tk.price);
                    return num <= 0 ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        Miễn phí (0đ)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                        Có phí: {num.toLocaleString("vi-VN")} đ
                      </span>
                    );
                  })()}
                </div>
                <VndCurrencyInput
                  id={`ewz-ticket-price-${i}`}
                  placeholder="0 (0 là miễn phí)"
                  className={inputCls}
                  value={parseVndNumber(tk.price)}
                  onChange={(val) => update(i, { price: String(val) })}
                />
                <p className="mt-1 text-[10.5px] text-muted-foreground">
                  {parseVndNumber(tk.price) <= 0
                    ? "Vé 0 đồng = Miễn phí tham dự."
                    : "Từ 1 đ trở lên = Vé có phí bắt buộc thanh toán."}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls} htmlFor={`ewz-ticket-qty-${i}`}>
                    {t("ewz.tickets.qty")}
                  </label>
                  {(() => {
                    const qNum = parseInt(String(tk.quantity).replace(/\D/g, ""), 10) || 0;
                    return qNum > 0 ? (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {qNum.toLocaleString("vi-VN")} suất
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="relative flex items-center w-full">
                  <input
                    id={`ewz-ticket-qty-${i}`}
                    aria-label={t("ewz.tickets.qty")}
                    type="text"
                    inputMode="numeric"
                    placeholder="Ví dụ: 100 vé (để trống: không giới hạn)"
                    className={`${inputCls} pr-12 font-medium`}
                    value={
                      tk.quantity
                        ? (parseInt(String(tk.quantity).replace(/\D/g, ""), 10) || "").toLocaleString("vi-VN")
                        : ""
                    }
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      update(i, { quantity: clean });
                    }}
                  />
                  <span className="absolute right-3 z-10 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                    vé
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <label className={labelCls} htmlFor={`ewz-ticket-desc-${i}`}>
                {t("ewz.tickets.desc")}
              </label>
              <input
                id={`ewz-ticket-desc-${i}`}
                aria-label={t("ewz.tickets.desc")}
                className={inputCls}
                placeholder="Mô tả quyền lợi vé (ví dụ: Bao gồm tiệc tối Gala, tài liệu đại biểu, chỗ ngồi VIP)..."
                value={tk.description}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTickets([...tickets, emptyTicket()])}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/30 py-2.5 text-sm font-semibold text-[#003B95] dark:text-blue-400 hover:bg-muted transition cursor-pointer"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> {t("ewz.tickets.add")}
      </button>
    </div>
  );
}

function QrStep({
  qrFields,
  toggleQr,
  sample,
}: {
  qrFields: QrField[];
  toggleQr: (f: QrField) => void;
  sample: string;
}) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <QrCode className="h-4 w-4 text-primary" aria-hidden="true" /> {t("ewz.qr.heading")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("ewz.qr.hint")}</p>
      </div>

      <fieldset className="space-y-2">
        {QR_FIELDS.map((f) => {
          const checked = qrFields.includes(f);
          return (
            <label
              key={f}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                checked
                  ? "border-[#003B95] bg-blue-50 dark:bg-blue-950/30 text-foreground shadow-xs"
                  : "border-border bg-card hover:bg-muted/50 text-foreground"
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#003B95]"
                checked={checked}
                onChange={() => toggleQr(f)}
              />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">
                  {t(`ewz.qr.${f}` as never)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`ewz.qr.${f}.desc` as never)}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <p className="mb-3 text-xs font-semibold text-[#003B95] dark:text-blue-400">{t("ewz.qr.preview")}</p>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-white shadow-md border border-border">
            <QrCanvas value={sample} size={120} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
              {t("ewz.qr.previewHint")}
            </p>
            <code className="block break-all rounded-md bg-muted px-2 py-1.5 text-[11px] text-foreground border border-border font-mono">
              {sample}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
