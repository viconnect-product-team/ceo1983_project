import React, { useState } from "react";
import {
  Mail,
  X,
  Send,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Download,
  FileCheck,
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
  const [selectedFormat, setSelectedFormat] = useState<"all" | "excel" | "word" | "pdf">("all");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
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
        `/events/${eventId}/send-checkin-report-email`,
        {
          method: "POST",
          body: JSON.stringify({
            targetEmail: cleanEmail,
            format: selectedFormat,
          }),
        }
      );

      if (res && res.ok) {
        setSuccess(true);
        toast.success(`Đã gửi file danh sách check-in (${selectedFormat.toUpperCase()}) tới ${cleanEmail}!`);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      } else {
        toast.error(res?.message || "Không thể gửi file báo cáo qua email");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi gửi email");
    } finally {
      setSending(false);
    }
  };

  const handleDirectDownload = async (fmt: "excel" | "word" | "pdf") => {
    setDownloading(fmt);
    try {
      const res = await fetch(`/api/events/${eventId}/export-checkin-file?format=${fmt}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Tải file thất bại");

      const blob = await res.blob();
      const ext = fmt === "word" ? "docx" : fmt === "pdf" ? "pdf" : "xlsx";
      const filename = `Danh_Sach_CheckIn_Vien_Doanh_Tri_${Date.now()}.${ext}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Đã tải xuống file ${fmt.toUpperCase()} thành công!`);
    } catch (err: any) {
      toast.error(err?.message || `Lỗi khi tải file ${fmt.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Viện Doanh Trí */}
        <div className="bg-gradient-to-r from-[#7A0000] via-[#8B0000] to-[#991b1b] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-[#7A0000] flex items-center justify-center font-black text-sm shadow-sm">
              DT
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                VIỆN DOANH TRÍ
              </div>
              <h3 className="text-sm font-bold text-white">Xuất & Gửi Danh Sách Check-in</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Gửi Báo Cáo Thành Công!</h4>
            <p className="text-xs text-slate-600">
              File danh sách đại biểu check-in đã được gửi đính kèm vào hòm thư:{" "}
              <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {/* Info Box */}
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Hỗ trợ đầy đủ 3 định dạng: Word, PDF, Excel
              </p>
              <p className="text-[11px] text-slate-500">
                Tất cả các file đều có cột Thời gian check-in chi tiết, phân loại Đúng giờ (trong 30 phút đầu) vs Check-in muộn, và màu sắc trình bày trang nhã, chuyên nghiệp.
              </p>
            </div>

            {/* Format Selection Pills */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">
                Chọn định dạng file gửi email:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("all")}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedFormat === "all"
                      ? "bg-[#8B0000] text-white border-[#8B0000] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Cả 3 File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("excel")}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedFormat === "excel"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("word")}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedFormat === "word"
                      ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("pdf")}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedFormat === "pdf"
                      ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>PDF (.pdf)</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">
                Địa chỉ Email nhận báo cáo: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bantieptan@doanhtri.vn, daibieu@company.vn..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B0000] text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Direct Download Options */}
            <div className="pt-1 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 mb-2">
                Hoặc tải trực tiếp về máy tính:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectDownload("excel")}
                  disabled={!!downloading}
                  className="flex-1 py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloading === "excel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Tải Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDownload("word")}
                  disabled={!!downloading}
                  className="flex-1 py-2 px-3 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloading === "word" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Tải Word</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDownload("pdf")}
                  disabled={!!downloading}
                  className="flex-1 py-2 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloading === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#991b1b] hover:from-[#700000] hover:to-[#8B0000] text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Báo Cáo Về Mail</span>
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
