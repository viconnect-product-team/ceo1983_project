import React from "react";
import { createPortal } from "react-dom";
import { Megaphone, QrCode, X } from "lucide-react";

export interface ProductAdRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  adCompany: string;
  setAdCompany: (val: string) => void;
  adContactPerson: string;
  setAdContactPerson: (val: string) => void;
  adPhone: string;
  setAdPhone: (val: string) => void;
  adEmail: string;
  setAdEmail: (val: string) => void;
  adDurationMonths: number;
  setAdDurationMonths: (val: number) => void;
  adGoal: string;
  setAdGoal: (val: string) => void;
  adBudget: string;
  setAdBudget: (val: string) => void;
  adProductLink: string;
  setAdProductLink: (val: string) => void;
  adNotes: string;
  setAdNotes: (val: string) => void;
  adSubmitting: boolean;
}

export const ProductAdRegistrationModal: React.FC<ProductAdRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  adCompany,
  setAdCompany,
  adContactPerson,
  setAdContactPerson,
  adPhone,
  setAdPhone,
  adEmail,
  setAdEmail,
  adDurationMonths,
  setAdDurationMonths,
  adGoal,
  setAdGoal,
  adBudget,
  setAdBudget,
  adProductLink,
  setAdProductLink,
  adNotes,
  setAdNotes,
  adSubmitting,
}) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => !adSubmitting && onClose()}
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Đăng Ký Quảng Cáo & Affiliate B2B
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gửi yêu cầu tới Admin Quản trị hệ thống CRM Hiệp hội
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên doanh nghiệp / Công ty <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={adCompany}
              onChange={(e) => setAdCompany(e.target.value)}
              placeholder="VD: Tập Đoàn Công Nghệ ViConnect"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Người đại diện liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={adContactPerson}
                onChange={(e) => setAdContactPerson(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại nhận QR <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={adPhone}
                onChange={(e) => setAdPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email tiếp nhận
              </label>
              <input
                type="email"
                value={adEmail}
                onChange={(e) => setAdEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thời lượng chiến dịch
              </label>
              <select
                value={adDurationMonths}
                onChange={(e) => setAdDurationMonths(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              >
                <option value={1}>1 Tháng (Thử nghiệm)</option>
                <option value={3}>3 Tháng (Khuyên dùng)</option>
                <option value={6}>6 Tháng (Ưu đãi 15%)</option>
                <option value={12}>12 Tháng (Đối tác VIP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mục tiêu quảng cáo
            </label>
            <select
              value={adGoal}
              onChange={(e) => setAdGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
            >
              <option value="Quảng bá sản phẩm / dịch vụ nổi bật tới toàn thể hội viên">
                Quảng bá sản phẩm / dịch vụ nổi bật
              </option>
              <option value="Chiến dịch liên kết Affiliate chia sẻ doanh thu B2B">
                Chiến dịch Affiliate chia sẻ doanh thu B2B
              </option>
              <option value="Banner Top vị trí số 1 Chợ Giao Thương">
                Banner Top vị trí số 1 Chợ Giao Thương
              </option>
              <option value="Ra mắt dòng sản phẩm hoặc dịch vụ thương hiệu mới">
                Ra mắt sản phẩm / dịch vụ mới
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ngân sách dự kiến
              </label>
              <input
                type="text"
                value={adBudget}
                onChange={(e) => setAdBudget(e.target.value)}
                placeholder="VD: 10,000,000 đ"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link sản phẩm / Website
              </label>
              <input
                type="text"
                value={adProductLink}
                onChange={(e) => setAdProductLink(e.target.value)}
                placeholder="https://company.vn/san-pham"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú / Yêu cầu cụ thể
            </label>
            <textarea
              rows={2}
              value={adNotes}
              onChange={(e) => setAdNotes(e.target.value)}
              placeholder="Mô tả thông điệp quảng cáo, khuyến mãi hoặc thời gian muốn kích hoạt..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 p-3 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <QrCode className="h-3.5 w-3.5" />
              <span>Quy trình thanh toán & duyệt tự động:</span>
            </div>
            Sau khi bạn gửi thông tin, Admin quản trị hệ thống CRM sẽ nhận được yêu cầu, liên hệ chốt hợp đồng và gửi mã QR thanh toán VietQR. Sau khi thanh toán thành công, Admin sẽ thiết lập banner có hiệu ứng animation hiển thị ngay tại Chợ B2B!
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={adSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {adSubmitting ? "Đang gửi..." : "Gửi yêu cầu đến Admin CRM"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
