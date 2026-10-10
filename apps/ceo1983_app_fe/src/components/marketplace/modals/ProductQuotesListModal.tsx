import React from "react";
import { createPortal } from "react-dom";
import { Users, FileText, Phone, MessageSquare, X } from "lucide-react";

export interface ProductQuotesListModalProps {
  isOpen: boolean;
  viewingQuotesProduct: any | null;
  onClose: () => void;
  loadingProductQuotes: boolean;
  productQuotes: any[];
  fmt: { rel: (d?: any) => string };
  onMessage: (buyerIdOrPhone: string) => void;
}

export const ProductQuotesListModal: React.FC<ProductQuotesListModalProps> = ({
  isOpen,
  viewingQuotesProduct,
  onClose,
  loadingProductQuotes,
  productQuotes,
  fmt,
  onMessage,
}) => {
  if (!isOpen || !viewingQuotesProduct || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-[500px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span>Hội viên quan tâm / Báo giá</span>
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{viewingQuotesProduct.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loadingProductQuotes ? (
            <p className="text-xs text-slate-400 text-center py-6">Đang tải danh sách người quan tâm...</p>
          ) : productQuotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Chưa có yêu cầu báo giá nào</p>
              <p className="text-[11px] text-slate-400 mt-1">Khi có hội viên gửi yêu cầu báo giá hoặc bấm quan tâm, thông tin liên hệ sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            productQuotes.map((q: any) => (
              <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#2E3192] text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {q.buyerName ? q.buyerName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{q.buyerName || "Hội viên CLB"}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{q.buyerCompany || "Hội viên CEO 1983"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 shrink-0">
                    {fmt.rel(q.createdAt)}
                  </span>
                </div>

                {q.quantity && (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Số lượng / Quy mô:</strong> {q.quantity}
                  </p>
                )}

                {(q.note || q.message) && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                    "{q.note || q.message}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                  <div className="text-xs text-slate-500">
                    {q.phone && <span>SĐT: <strong className="text-emerald-600 dark:text-emerald-400">{q.phone}</strong></span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {q.phone && (
                      <a
                        href={`tel:${q.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Gọi</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onMessage(q.buyerId || q.phone)}
                      className="px-2.5 py-1 rounded-lg bg-[#2E3192] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#232677] transition cursor-pointer"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Nhắn tin</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
