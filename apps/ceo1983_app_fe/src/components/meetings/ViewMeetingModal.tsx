import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Building2,
  FileText,
  X,
  ExternalLink,
  Edit,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { ConnectionMeetingItem } from "@/routes/business-connect.meetings.index";

export interface ViewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (meeting: ConnectionMeetingItem) => void;
  meeting: ConnectionMeetingItem | null;
}

export function ViewMeetingModal({
  isOpen,
  onClose,
  onEdit,
  meeting,
}: ViewMeetingModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !meeting) return null;

  const isOnline =
    meeting.venueType === "online" ||
    Boolean(meeting.onlineUrl) ||
    meeting.venue.toLowerCase().includes("online") ||
    meeting.venue.toLowerCase().includes("http");

  const meetingUrl = meeting.onlineUrl || (isOnline && meeting.venue.startsWith("http") ? meeting.venue : undefined);

  const handleCopyLink = () => {
    if (!meetingUrl) return;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    toast.success("Đã sao chép liên kết phòng họp!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đã hoàn tất
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Đã hủy
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            Sắp diễn ra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Đã lên lịch
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 px-6 py-4.5 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Chi Tiết Cuộc Gặp 1-on-1
                </span>
                {getStatusBadge(meeting.status)}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 mt-0.5">
                {meeting.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Host */}
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                <User className="h-3.5 w-3.5" />
                <span>Người Chủ Trì (Host)</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {meeting.hostName}
                </p>
                {meeting.hostCompany && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{meeting.hostCompany}</span>
                  </p>
                )}
                {meeting.hostPhone && (
                  <a
                    href={`tel:${meeting.hostPhone}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-1 font-mono font-medium"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{meeting.hostPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Partner */}
            <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <User className="h-3.5 w-3.5" />
                <span>Đối Tác Kết Nối (Partner)</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {meeting.partnerName}
                </p>
                {meeting.partnerCompany && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{meeting.partnerCompany}</span>
                  </p>
                )}
                {meeting.partnerPhone && (
                  <a
                    href={`tel:${meeting.partnerPhone}`}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 mt-1 font-mono font-medium"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{meeting.partnerPhone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Time & Format */}
          <div className="rounded-2xl border border-border bg-slate-50/60 dark:bg-slate-900/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Thời gian diễn ra</p>
                <p className="font-bold text-foreground">
                  {meeting.time} — {meeting.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                  isOnline
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hình thức họp</p>
                <p className="font-bold text-foreground">
                  {isOnline
                    ? meeting.onlinePlatform === "uniwork"
                      ? "Trực tuyến Uniwork Meet"
                      : "Trực tuyến (Online)"
                    : "Trực tiếp (Offline)"}
                </p>
              </div>
            </div>
          </div>

          {/* Location / Meeting Room */}
          <div className="rounded-2xl border border-border p-4 bg-card space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isOnline ? <Video className="h-3.5 w-3.5 text-indigo-500" /> : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
              <span>{isOnline ? "Phòng họp trực tuyến" : "Địa điểm gặp gỡ"}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {meeting.venue || (isOnline ? "Uniwork Online Meeting" : "Văn phòng Hiệp hội CEO 1983")}
            </p>

            {isOnline && meetingUrl && (
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <a
                  href={meetingUrl.startsWith("http") ? meetingUrl : `https://${meetingUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Tham gia phòng họp</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Đã chép link" : "Sao chép link"}</span>
                </button>
              </div>
            )}

            {!isOnline && (
              <div className="pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.venue)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Xem vị trí trên Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Notes / Agenda */}
          {meeting.notes && (
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                <span>Nội dung / Ghi chú kết nối</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed italic">
                "{meeting.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
          >
            Đóng
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(meeting);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer transition bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950"
            >
              <Edit className="h-3.5 w-3.5 text-slate-950" />
              <span>Chỉnh Sửa Cuộc Gặp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
