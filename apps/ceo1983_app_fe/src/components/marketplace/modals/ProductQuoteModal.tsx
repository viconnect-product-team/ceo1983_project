import React from "react";
import { createPortal } from "react-dom";
import { FileText, Phone, Send, X } from "lucide-react";

export interface ProductQuoteModalProps {
  isOpen: boolean;
  quoteProduct: any | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEn?: boolean;
  quoteQty: string;
  setQuoteQty: (val: string) => void;
  quotePhone: string;
  setQuotePhone: (val: string) => void;
  quoteNote: string;
  setQuoteNote: (val: string) => void;
  quoteSubmitting: boolean;
}

export const ProductQuoteModal: React.FC<ProductQuoteModalProps> = ({
  isOpen,
  quoteProduct,
  onClose,
  onSubmit,
  isEn,
  quoteQty,
  setQuoteQty,
  quotePhone,
  setQuotePhone,
  quoteNote,
  setQuoteNote,
  quoteSubmitting,
}) => {
  if (!isOpen || !quoteProduct || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-[420px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
            {isEn ? "Request VIP Quotation" : "Yêu Cầu Báo Giá VIP"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
              <img
                src={quoteProduct.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{quoteProduct.name}</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 truncate">{quoteProduct.company}</p>
                <p className="text-[11px] font-bold text-rose-500">{quoteProduct.price || (isEn ? "Contact for price" : "Giá ưu đãi hội viên")}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Desired Quantity / Scope" : "Số lượng dự kiến / Quy mô nhu cầu"}
              </label>
              <input
                type="text"
                required
                value={quoteQty}
                onChange={(e) => setQuoteQty(e.target.value)}
                placeholder="Ví dụ: 1 gói, 50 bộ, triển khai 1 năm..."
                className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Contact Phone / Zalo" : "Số điện thoại / Zalo liên hệ của bạn *"}
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={quotePhone}
                  onChange={(e) => setQuotePhone(e.target.value)}
                  placeholder="0988 123 456"
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Specific Requirements / Note" : "Yêu cầu chi tiết / Ghi chú"}
              </label>
              <textarea
                rows={2}
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                placeholder={isEn ? "Specific business requirements..." : "Ghi chú thêm về yêu cầu kỹ thuật, thời gian giao hàng..."}
                className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="submit"
              disabled={quoteSubmitting}
              style={{ color: "#ffffff" }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E3192]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{quoteSubmitting ? (isEn ? "Sending request..." : "Đang gửi...") : (isEn ? "Send Quote Request Now" : "Gửi Yêu Cầu Báo Giá")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
