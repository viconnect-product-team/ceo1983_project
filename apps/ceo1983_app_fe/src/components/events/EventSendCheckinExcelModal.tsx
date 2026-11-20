import React, { useState } from "react";
import {
  Mail,
  X,
  Send,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

interface EventSendCheckinExcelModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  totalAttendees?: number;
}

export function EventSendCheckinExcelModal({
  open,
  onClose,
  eventId,
  eventName,
  totalAttendees = 0,
}: EventSendCheckinExcelModalProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    setSending(true);
    try {
      const res = await fetchNestApi<any>(
        `/events/${eventId}/send-checkin-excel-email`,
        {
          method: "POST",
          body: JSON.stringify({ targetEmail: cleanEmail }),
        }
      );

      if (res && res.ok) {
        setSuccess(true);
        toast.success(`Đã gửi file Excel danh sách check-in tới ${cleanEmail}!`);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      } else {
        toast.error(res?.message || "Không thể gửi file Excel qua email");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi gửi email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B0000] to-[#991b1b] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#8B0000] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Gửi File Excel Danh Sách Check-in</h3>
              <p className="text-[11px] text-amber-200 line-clamp-1">{eventName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Gửi Báo Cáo Thành Công!</h4>
            <p className="text-xs text-slate-600">
              File Excel danh sách đại biểu check-in đã được gửi kèm vào hòm thư:{" "}
              <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Báo cáo tự động từ CSDL Viện Doanh Trí & CEO 1983
              </p>
              <p>
                File Excel sẽ bao gồm đầy đủ danh sách khách mời, chức danh, công ty, thời điểm check-in và phân loại Đúng giờ (trong 30 phút) vs Check-in muộn.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">
                Địa chỉ Email nhận file Excel: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="viendoanhtri@gmail.com, ceo@company.vn..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B0000] text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#991b1b] hover:from-[#700000] hover:to-[#8B0000] text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xuất & gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi File Excel Ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
