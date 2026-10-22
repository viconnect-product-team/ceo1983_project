import React from "react";
import {
  Sparkles,
  X,
  Calendar,
  MapPin,
  Ticket,
  Users,
  Info,
  ExternalLink,
  MessageSquare,
  QrCode,
  AlertTriangle,
  Lock,
  Handshake,
  Copy,
  Camera,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EventCountdownBanner } from "@/components/events/EventCountdownTimer";
import { EventPosterModal } from "@/components/events/EventPosterModal";
import { isEventFull } from "@/lib/member-app.functions";

export interface EventDetailModalProps {
  selectedEvent: any | null;
  events: any[];
  onClose: () => void;
  defaultEventImages: string[];
  resolveMediaUrl: (url: string) => string | null;
  getEventAgenda: (e: any, idx: number) => any;
  formatDisplayDate: (d?: any) => string;
  isEventFree: (e: any) => boolean;
  getEventPrice: (e: any) => number;
  isRegistered: (e: any) => boolean;
  onViewPass: (e: any) => void;
  onUnregister: (eventId: string, evt: React.MouseEvent) => void;
  onOpenRegister: (event: any, evt: React.MouseEvent) => void;
  busy: string | null;
}

export function isValidDriveUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === "#" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "false" ||
    trimmed.toLowerCase().includes("chưa có") ||
    trimmed.toLowerCase().includes("chua co") ||
    trimmed.toLowerCase().includes("không có") ||
    trimmed.toLowerCase().includes("khong co")
  ) {
    return false;
  }
  return /^https?:\/\//i.test(trimmed);
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  events,
  onClose,
  defaultEventImages,
  resolveMediaUrl,
  getEventAgenda,
  formatDisplayDate,
  isEventFree,
  getEventPrice,
  isRegistered,
  onViewPass,
  onUnregister,
  onOpenRegister,
  busy,
}) => {
  const [posterOpen, setPosterOpen] = React.useState(false);
  if (!selectedEvent) return null;

  const selectedIndex = events.findIndex((x: any) => x.id === selectedEvent.id);
  const rawSelImg = (selectedEvent as any).image;
  const selectedImg =
    (rawSelImg ? resolveMediaUrl(rawSelImg) || rawSelImg : null) ||
    defaultEventImages[(selectedIndex >= 0 ? selectedIndex : 0) % defaultEventImages.length];
  const selectedAgenda = getEventAgenda(selectedEvent, selectedIndex >= 0 ? selectedIndex : 0);

  const rawDriveUrl =
    selectedEvent?.photoGalleryUrl ||
    (selectedEvent as any)?.photo_gallery_url ||
    (selectedEvent as any)?.driveUrl ||
    (selectedAgenda as any)?.photoGalleryUrl;
  const validDriveUrl = isValidDriveUrl(rawDriveUrl) ? String(rawDriveUrl).trim() : null;

  const sponsorList: Array<{ name: string; tier?: string }> = React.useMemo(() => {
    let list = selectedEvent?.sponsors;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list)) return [];
    return list
      .map((s: any) => ({
        name: s.sponsorName || s.name || "",
        tier: s.tier || "bronze",
      }))
      .filter((s) => Boolean(s.name));
  }, [selectedEvent?.sponsors]);

  const eventDesc =
    (selectedEvent.description && selectedEvent.description.trim()) ||
    selectedAgenda?.desc ||
    `Sự kiện "${selectedEvent.title}" do ${selectedEvent.communityName || "CLB Doanh Nhân CEO 1983"} tổ chức tại ${selectedEvent.place || "Hà Nội"}.`;

  const guestRegUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/guest-event-register/${selectedEvent.id}`
      : `https://crm.ceo1983.viconnect.vn/guest-event-register/${selectedEvent.id}`;

  return (
    <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md w-[95vw] h-[90vh] max-h-[90dvh] flex flex-col p-0 rounded-3xl border border-amber-400/40 bg-[var(--vba-surface,#fff)] select-text overflow-hidden shadow-2xl"
      >
        {/* Fixed Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-300 shadow-xs border border-amber-400/50 uppercase shrink-0">
              <Sparkles className="h-3 w-3" />
              {selectedAgenda.category}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
              {selectedEvent.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Event Content Body */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Poster Banner Header with Golden Swoosh Effect */}
          <div className="relative min-h-52 w-full overflow-hidden bg-gradient-to-br from-[#040C20] via-[#091D54] to-[#020714] p-4 text-white flex flex-col justify-between">
            <img
              src={selectedImg}
              alt={selectedEvent.title}
              className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020714] via-[#081B4B]/80 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 px-2.5 py-0.5 text-[10.5px] font-black text-amber-300 shadow-sm border border-amber-400/50 uppercase">
                <Sparkles className="h-3 w-3" />
                {selectedAgenda.category}
              </span>
            </div>

            <div className="relative z-10 mt-3">
              <DialogTitle className="text-[18px] sm:text-[20px] font-black text-white line-clamp-2 leading-tight drop-shadow-md">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-amber-300/90 font-bold tracking-wide uppercase mt-0.5">
                {selectedAgenda.subtitle}
              </DialogDescription>
            </div>

            {/* Countdown Timer on Modal Banner */}
            <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15">
              <EventCountdownBanner event={selectedEvent} index={selectedIndex >= 0 ? selectedIndex : 0} />
            </div>
          </div>

          {/* 3-Column Metadata Strip under Banner */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 text-center border-b border-slate-100 dark:border-white/5">
            <div className="px-1">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Thời gian</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{selectedEvent.time || "—"}</span>
            </div>
            <div className="px-1">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Địa điểm</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                {selectedEvent.place || "—"}
              </span>
            </div>
            <div className="px-1">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Đối tượng</span>
              <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
                {selectedAgenda.audience || "Hội viên & Khách mời"}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4 text-[13px]">
            {/* Headline & Body Context Paragraphs (CRM-driven) */}
            <div className="space-y-2">
              <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedEvent.title}
              </h4>
              <div className="text-slate-600 dark:text-slate-300 text-[12.5px] leading-relaxed whitespace-pre-line space-y-2">
                {eventDesc}
              </div>
            </div>

            {/* ĐẶC BIỆT: Trường Tên Nhà Tài Trợ (Hiển thị khi sự kiện có nhà tài trợ) */}
            {sponsorList.length > 0 && (
              <div className="space-y-2 text-[12.5px] bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Handshake className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Đơn Vị Đồng Hành &amp; Nhà Tài Trợ ({sponsorList.length}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sponsorList.map((sp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-300/70 dark:border-amber-500/50 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs"
                    >
                      <span className="text-amber-500">🤝</span>
                      <span>{sp.name}</span>
                      {sp.tier && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold uppercase">
                          {sp.tier}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

            {/* Highlighted Event Keypoints */}
            <div className="space-y-2 text-[12.5px] bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
              <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                <Calendar className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {selectedEvent.time ? `${selectedEvent.time} | ` : ""}
                  Ngày{" "}
                  {selectedEvent.date
                    ? formatDisplayDate(selectedEvent.date)
                    : `${selectedEvent.day} ${selectedEvent.month}, 2026`}
                </span>
              </div>

              <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                <MapPin className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{selectedEvent.place || "Địa điểm thông báo sau"}</span>
              </div>

              <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                <Ticket className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="font-semibold">
                  Phí tham dự:{" "}
                  <span
                    className={
                      isEventFree(selectedEvent)
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-amber-600 dark:text-amber-400 font-bold"
                    }
                  >
                    {isEventFree(selectedEvent)
                      ? "Miễn phí (0 đ)"
                      : `${new Intl.NumberFormat("vi-VN").format(getEventPrice(selectedEvent))} đ / vé`}
                  </span>
                </span>
              </div>

              {selectedAgenda.offer && (
                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <Users className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Ưu đãi:{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                      {selectedAgenda.offer}
                    </span>
                  </span>
                </div>
              )}

              {/* Link ảnh sự kiện (Google Drive / Cloud storage) dành cho hội viên và ban truyền thông - Ẩn hoàn toàn nếu chưa có link hợp lệ */}
              {validDriveUrl && (
                <div className="pt-2 border-t border-amber-300/40">
                  <a
                    href={validDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Camera className="size-4 text-amber-300" />
                    <span>Xem kho ảnh sự kiện (Google Drive) →</span>
                  </a>
                </div>
              )}
            </div>

            {/* MÃ QR SỰ KIỆN CHO NGƯỜI NGOÀI KHÔNG PHẢI HỘI VIÊN QUÉT ĐĂNG KÝ */}
            <div className="rounded-2xl border-2 border-dashed border-amber-500/50 bg-gradient-to-b from-amber-50/50 to-transparent dark:bg-amber-950/20 p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <QrCode className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Mã QR Đăng Ký Dành Cho Khách Mời (Người Ngoài)</span>
              </div>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Người ngoài không phải hội viên quét mã QR bằng Zalo hoặc Camera điện thoại để mở form đăng ký tham gia sự kiện.
              </p>
              <div className="mx-auto w-40 h-40 p-2 bg-white rounded-2xl border border-amber-300/80 shadow-sm flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestRegUrl)}`}
                  alt="Mã QR Đăng Ký Khách Mời"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(guestRegUrl);
                    toast.success("Đã sao chép link đăng ký dành cho khách mời!");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-600" />
                  <span>Sao chép link</span>
                </button>
                <a
                  href={guestRegUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở trang đăng ký</span>
                </a>
              </div>
            </div>

            {/* Zalo Link Notice Box (chỉ hiện khi có link Zalo thực) */}
            {selectedAgenda.zaloLink && (
              <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 p-3.5 border border-blue-200/60 dark:border-blue-900/60 text-[12px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <Info className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0" />
                  <span>Kênh kết nối &amp; Thảo luận</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Hội viên tham dự vui lòng gia nhập nhóm Zalo để nhận tài liệu diễn giả và cập nhật thông báo:
                </p>
                <div className="pt-1">
                  <a
                    href={selectedAgenda.zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#003B95] dark:text-amber-400 font-bold underline inline-flex items-center gap-1 hover:text-blue-700"
                  >
                    {selectedAgenda.zaloLink}
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </div>
              </div>
            )}

            {/* Lịch trình chi tiết (chỉ hiển thị nếu có schedule thực tế) */}
            {selectedAgenda.schedule && selectedAgenda.schedule.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Chương trình chi tiết</h4>
                <div className="space-y-2 border-l-2 border-[#003B95]/40 pl-3">
                  {selectedAgenda.schedule.map((item: any, i: number) => (
                    <div key={i} className="text-xs">
                      <span className="font-bold text-[#003B95] dark:text-amber-400">{item.time}</span>
                      <p className="text-slate-700 dark:text-slate-300">{item.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diễn giả / Khách mời (chỉ hiển thị nếu có danh sách diễn giả) */}
            {selectedAgenda.speakers && selectedAgenda.speakers.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">Diễn giả &amp; Khách mời</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {selectedAgenda.speakers.map((sp: string, idx: number) => (
                    <li key={idx}>{sp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Buttons Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 z-20">
          <button
            type="button"
            onClick={() => setPosterOpen(true)}
            className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 text-amber-900 dark:text-amber-200 text-xs font-bold transition hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer text-center shrink-0 shadow-2xs"
            title="Xem & Tải Poster Sự Kiện"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Xem Poster</span>
          </button>

          {selectedAgenda.zaloLink ? (
            <a
              href={selectedAgenda.zaloLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold transition hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer text-center shrink-0"
            >
              <MessageSquare className="h-4 w-4 text-amber-500" />
              <span>Nhóm Zalo</span>
            </a>
          ) : null}

          {isRegistered(selectedEvent) ? (
            <div className="flex w-full flex-1 gap-2">
              <button
                type="button"
                onClick={(evt) => {
                  evt.stopPropagation();
                  onViewPass(selectedEvent);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <QrCode className="h-4 w-4" />
                <span>Xem vé & QR</span>
              </button>
              <button
                type="button"
                onClick={(evt) => onUnregister(selectedEvent.id, evt)}
                disabled={busy === selectedEvent.id}
                className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
              >
                {busy === selectedEvent.id ? "..." : "Hủy đăng ký"}
              </button>
            </div>
          ) : isEventFull(selectedEvent) ? (
            <div className="w-full flex-1 py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-400/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 select-none shadow-xs">
              <Lock className="h-4 w-4 text-amber-500" />
              <span>Đã đủ số lượng đại biểu (Hết chỗ)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={(evt) => onOpenRegister(selectedEvent, evt)}
              className="w-full flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 border border-amber-300/60 text-slate-950 text-[13px] font-black shadow-lg shadow-amber-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="h-4 w-4 text-slate-950" />
              <span>Đăng ký tham gia ngay</span>
            </button>
          )}
        </div>
      </DialogContent>

      <EventPosterModal
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        event={selectedEvent}
      />
    </Dialog>
  );
};
