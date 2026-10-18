import React from "react";
import { Check, Sparkles, MessageSquare, Ticket, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface EventSuccessNoticeModalProps {
  registeredSuccessInfo: any | null;
  onClose: () => void;
  onViewPass: (info: any) => void;
  onGoToMessages: () => void;
}

export const EventSuccessNoticeModal: React.FC<EventSuccessNoticeModalProps> = ({
  registeredSuccessInfo,
  onClose,
  onViewPass,
  onGoToMessages,
}) => {
  if (!registeredSuccessInfo) return null;

  const isFreeOrZero =
    registeredSuccessInfo.isFree || registeredSuccessInfo.totalAmount === 0;

  return (
    <Dialog open={!!registeredSuccessInfo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-[var(--vba-surface,#fff)] text-center space-y-3">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Check className="h-6 w-6 stroke-[3]" />
        </div>
        <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100">
          {isFreeOrZero
            ? "Nhận vé sự kiện miễn phí thành công!"
            : "Đăng ký sự kiện thành công!"}
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Ban Truyền Thông CLB Doanh Nhân CEO 1983 đã tiếp nhận đăng ký tham gia sự kiện{" "}
          <b>"{registeredSuccessInfo.eventTitle}"</b>.
        </DialogDescription>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">
              {isFreeOrZero ? "Mã vé tham dự:" : "Mã hóa đơn:"}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {registeredSuccessInfo.invoiceNo}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Số lượng vé:</span>
            <span className="font-bold">{registeredSuccessInfo.ticketCount} vé</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Tổng phí:</span>
            <span>
              {isFreeOrZero
                ? "0 đ (Miễn phí)"
                : `${new Intl.NumberFormat("vi-VN").format(registeredSuccessInfo.totalAmount)} đ`}
            </span>
          </div>
          {registeredSuccessInfo.luckyNumber && (
            <div className="flex justify-between items-center bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-lg px-2.5 py-1.5 mt-1.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                Số vé may mắn (Quay thưởng):
              </span>
              <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                {registeredSuccessInfo.luckyNumber}
              </span>
            </div>
          )}
        </div>

        {isFreeOrZero ? (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2 text-left">
            <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Vé sự kiện miễn phí của bạn đã được xác nhận tự động. Xuất trình mã QR bên dưới khi đến
              quầy check-in sự kiện!
            </span>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/60 p-3 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2.5 text-left border border-amber-300/60 shadow-xs">
            <MessageSquare className="h-4 w-4 shrink-0 text-[#003B95] dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#003B95] dark:text-amber-300 text-xs">
                ✉️ Đã gửi mã VietQR thanh toán về email!
              </p>
              <p className="leading-relaxed">
                Hệ thống đã tự động gửi mã VietQR thanh toán phí tham dự về hòm thư của bạn. Bạn có thể quét mã VietQR trực tiếp bên dưới hoặc kiểm tra email để thanh toán:
              </p>
            </div>
          </div>
        )}

        {/* Khung hiển thị QR: Nếu có phí hiển thị VietQR, nếu miễn phí hiển thị QR check-in */}
        {!isFreeOrZero ? (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border-2 border-amber-400/80 shadow-md space-y-2 text-center">
            <span className="text-[11px] font-black uppercase text-[#003B95] dark:text-amber-400 tracking-wider block">
              Mã VietQR Thanh Toán Sự Kiện
            </span>
            <img
              src={`https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${registeredSuccessInfo.totalAmount}&addInfo=${encodeURIComponent(
                `${registeredSuccessInfo.invoiceNo} ${registeredSuccessInfo.phone || ""}`.trim()
              )}&accountName=${encodeURIComponent("CLB DOANH NHAN CEO 1983")}`}
              alt="Mã VietQR Thanh Toán"
              className="w-48 h-48 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700 p-1 bg-white"
            />
            <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 py-1 px-2 rounded border border-amber-200 dark:border-amber-800">
              Nội dung CK: {registeredSuccessInfo.invoiceNo} {registeredSuccessInfo.phone || ""}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              MB Bank · STK: <b>1983000000</b> · CLB DOANH NHAN CEO 1983
            </div>
          </div>
        ) : (
          registeredSuccessInfo.qrCodeUrl && (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-dashed border-emerald-500/50 inline-block shadow-sm">
              <img
                src={registeredSuccessInfo.qrCodeUrl}
                alt="QR Check-in"
                className="w-40 h-40 mx-auto rounded-lg object-contain cursor-pointer"
              />
              <div className="text-[11px] font-mono font-black text-slate-800 dark:text-slate-200 mt-1.5">
                MÃ CHECK-IN: {registeredSuccessInfo.invoiceNo}
              </div>
            </div>
          )
        )}

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onViewPass(registeredSuccessInfo)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] border border-amber-400/40 text-white font-bold text-xs shadow-md shadow-[#003B95]/25 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Ticket className="h-3.5 w-3.5 text-amber-400" />
            <span>Xem Thẻ Vé Điện Tử VIP & Phóng To QR</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {!isFreeOrZero && (
            <button
              type="button"
              onClick={onGoToMessages}
              style={{ color: "#ffffff" }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Đến mục Kết nối để thanh toán VietQR</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
