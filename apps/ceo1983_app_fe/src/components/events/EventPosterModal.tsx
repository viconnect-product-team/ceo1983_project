import React from "react";
import { X, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventPoster } from "./EventPoster";
import { type EventItem } from "@/lib/events.functions";

export interface EventPosterModalProps {
  open: boolean;
  onClose: () => void;
  event: EventItem | any;
  onBannerChange?: (newUrl: string) => void;
  canEditBanner?: boolean;
}

export const EventPosterModal: React.FC<EventPosterModalProps> = ({
  open,
  onClose,
  event,
  onBannerChange,
  canEditBanner = false,
}) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[96vw] max-h-[95vh] p-0 rounded-3xl bg-transparent border-0 shadow-none overflow-hidden flex flex-col">
        {/* Floating Close Button */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-t-3xl border-b border-white/10 text-white z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Poster Giới Thiệu &amp; Điểm Danh Sự Kiện
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Poster Container */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-black/80 backdrop-blur-lg rounded-b-3xl">
          <EventPoster
            event={event}
            canEditBanner={canEditBanner}
            onBannerChange={onBannerChange}
            showActions={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
