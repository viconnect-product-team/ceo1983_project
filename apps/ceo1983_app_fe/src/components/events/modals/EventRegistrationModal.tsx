import React from "react";
import {
  Ticket,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Sparkles,
  FileText,
  Info,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface EventRegistrationModalProps {
  registeringEvent: any | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formName: string;
  setFormName: (val: string) => void;
  formPhone: string;
  setFormPhone: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formCompany: string;
  setFormCompany: (val: string) => void;
  formPosition: string;
  setFormPosition: (val: string) => void;
  formTicketCount: number | "";
  setFormTicketCount: React.Dispatch<React.SetStateAction<number | "">>;
  formTicketType: string;
  setFormTicketType: (val: string) => void;
  formNote: string;
  setFormNote: (val: string) => void;
  submittingReg: boolean;
  isEventFree: (e: any) => boolean;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  registeringEvent,
  onClose,
  onSubmit,
  formName,
  setFormName,
  formPhone,
  setFormPhone,
  formEmail,
  setFormEmail,
  formCompany,
  setFormCompany,
  formPosition,
  setFormPosition,
  formTicketCount,
  setFormTicketCount,
  formTicketType,
  setFormTicketType,
  formNote,
  setFormNote,
  submittingReg,
  isEventFree,
}) => {
  if (!registeringEvent) return null;

  const actualCount =
    typeof formTicketCount === "number" && formTicketCount > 0
      ? formTicketCount
      : formTicketCount === 0
      ? 0
      : 1;
  const rawPrice =
    (registeringEvent as any)?.ticketPrice !== undefined &&
    (registeringEvent as any)?.ticketPrice !== null
      ? Number((registeringEvent as any)?.ticketPrice)
      : (registeringEvent as any)?.fee !== undefined
      ? Number((registeringEvent as any)?.fee)
      : 0;
  const isFree = rawPrice === 0;
  const totalCost = isFree ? 0 : rawPrice * actualCount;

  return (
    <Dialog open={!!registeringEvent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)]">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
            <span>Đăng ký tham dự sự kiện</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {registeringEvent.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-3.5 text-xs">
          {/* Họ tên */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
              <User className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
              Họ và tên người tham dự <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Số điện thoại & Email */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                <Phone className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0988xxxxxx"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                <Mail className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                Email nhận vé
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="an.nguyen@company.vn"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Doanh nghiệp & Chức vụ */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                <Building2 className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                Tên Doanh nghiệp
              </label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Tập đoàn An Phát"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                <Briefcase className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                Chức vụ
              </label>
              <input
                type="text"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                placeholder="Tổng Giám Đốc"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Số lượng vé & Hạng vé */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Ticket className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                  Số lượng vé
                </label>
                <span className="text-[10px] text-slate-400">Nhập số cụ thể</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormTicketCount((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                  className="h-8 w-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formTicketCount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setFormTicketCount("");
                    } else {
                      const parsed = parseInt(raw, 10);
                      setFormTicketCount(isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)));
                    }
                  }}
                  className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setFormTicketCount((prev) => Math.min(100, (Number(prev) || 0) + 1))}
                  className="h-8 w-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  +
                </button>
              </div>
              {/* Preset Pills */}
              <div className="mt-1.5 flex items-center gap-1">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormTicketCount(num)}
                    className={`flex-1 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      formTicketCount === num
                        ? "bg-[#2E3192] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {num} vé
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
                Hạng vé
              </label>
              <select
                value={formTicketType}
                onChange={(e) => setFormTicketType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="Standard">Vé Tiêu Chuẩn (Standard)</option>
                <option value="VIP">Vé VIP Danh Dự (VIP)</option>
              </select>
            </div>
          </div>

          {/* Ghi chú / Xuất hóa đơn */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1">
              <FileText className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400" />
              Ghi chú / Yêu cầu xuất hóa đơn VAT
            </label>
            <textarea
              rows={2}
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="Ghi chú thêm thông tin xuất hóa đơn hoặc chế độ ăn kiêng nếu có..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Khối tóm tắt thanh toán */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
            <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>Đơn giá vé:</span>
              <span className={isFree ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                {isFree ? "Miễn phí (0 đ)" : `${new Intl.NumberFormat("vi-VN").format(rawPrice)} đ / vé`}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-sm text-amber-900 dark:text-amber-300 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
              <span>Tổng phí thanh toán:</span>
              <span
                className={`text-base ${
                  isFree ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isFree ? "0 đ (Miễn phí)" : `${new Intl.NumberFormat("vi-VN").format(totalCost)} đ`}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-start gap-1">
              <Info className="h-3.5 w-3.5 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isFree ? (
                  "Sự kiện này hoàn toàn miễn phí. Vé tham dự sẽ được xác nhận ngay khi bạn bấm Đăng ký."
                ) : (
                  <span>
                    Hệ thống CRM sẽ tự động gửi thông tin thanh toán VietQR vào mục <b>Kết nối</b> của bạn ngay
                    sau khi bấm Gửi.
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={submittingReg}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submittingReg}
              style={{ color: "#ffffff" }}
              className="px-5 py-2 rounded-xl bg-[#2E3192] hover:bg-[#19194D] text-white font-bold shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submittingReg ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isEventFree(registeringEvent)
                      ? "Xác nhận đăng ký vé miễn phí (0đ)"
                      : "Xác nhận & Gửi đăng ký"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
