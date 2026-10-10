import React from "react";
import { createPortal } from "react-dom";
import {
  Pencil,
  X,
  Trash2,
  ImagePlus,
  Calendar,
  User,
  Phone,
  Briefcase,
} from "lucide-react";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { formatDisplayDate } from "@/lib/date-format";

export interface OpportunityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editImage: string | null;
  setEditImage: (img: string | null) => void;
  editImageInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  uploadingImage: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  editErrors: Record<string, string>;
  setEditErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editTag: string;
  setEditTag: (t: string) => void;
  editCompany: string;
  setEditCompany: (c: string) => void;
  editBudgetMin: string;
  setEditBudgetMin: (b: string) => void;
  editBudgetMax: string;
  setEditBudgetMax: (b: string) => void;
  editIndustry: string;
  setEditIndustry: (i: string) => void;
  editRegion: string;
  setEditRegion: (r: string) => void;
  editDeadline: string;
  setEditDeadline: (d: string) => void;
  editContactName: string;
  setEditContactName: (n: string) => void;
  editContactPhone: string;
  setEditContactPhone: (p: string) => void;
  editContactTitle: string;
  setEditContactTitle: (t: string) => void;
  editDesc: string;
  setEditDesc: (d: string) => void;
  updating: boolean;
  resolveMediaUrl: (url?: string | null) => string | null;
}

export const OpportunityEditModal: React.FC<OpportunityEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editImage,
  setEditImage,
  editImageInputRef,
  handleImageFileChange,
  uploadingImage,
  editTitle,
  setEditTitle,
  editErrors,
  setEditErrors,
  editTag,
  setEditTag,
  editCompany,
  setEditCompany,
  editBudgetMin,
  setEditBudgetMin,
  editBudgetMax,
  setEditBudgetMax,
  editIndustry,
  setEditIndustry,
  editRegion,
  setEditRegion,
  editDeadline,
  setEditDeadline,
  editContactName,
  setEditContactName,
  editContactPhone,
  setEditContactPhone,
  editContactTitle,
  setEditContactTitle,
  editDesc,
  setEditDesc,
  updating,
  resolveMediaUrl,
}) => {
  if (typeof document === "undefined" || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      style={{ minHeight: "100dvh" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] max-h-[90dvh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <span className="text-[13.5px] font-extrabold text-[#2E3192] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pencil className="h-4 w-4" />
            Chỉnh sửa cơ hội giao thương
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
            {/* Image upload */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hình ảnh minh họa / Poster cơ hội
              </label>
              <input
                type="file"
                ref={editImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFileChange(e, true)}
              />
              {editImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                  <img
                    src={resolveMediaUrl(editImage) || editImage}
                    alt="Hình ảnh cơ hội"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setEditImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => editImageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-4 text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <ImagePlus className="h-6 w-6 text-slate-400" />
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                    {uploadingImage ? "Đang tải ảnh lên..." : "Tải ảnh mới từ thiết bị"}
                  </span>
                </button>
              )}
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tiêu đề cơ hội hợp tác <span className="text-red-500">*</span>
              </label>
              <input
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="VD: Cần tìm đối tác cung ứng dịch vụ phần mềm..."
                className={`w-full rounded-2xl border bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 placeholder:text-slate-400 transition ${
                  editErrors.title
                    ? "border-rose-500 ring-1 ring-rose-500/30"
                    : "border-transparent focus:border-amber-500"
                }`}
              />
              {editErrors.title && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {editErrors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Loại cơ hội
                </label>
                <select
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Hợp tác B2B">Hợp tác B2B</option>
                  <option value="Đầu tư & Vốn">Đầu tư & Vốn</option>
                  <option value="Giao thương">Giao thương</option>
                  <option value="Cung ứng">Cung ứng</option>
                  <option value="Xuất nhập khẩu">Xuất nhập khẩu</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên doanh nghiệp
                </label>
                <input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="VD: Công ty Cổ phần ABC"
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Deal Budget Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ngân sách từ (VNĐ)
                </label>
                <StandardCurrencyInput
                  value={editBudgetMin}
                  onChange={(formatted) => setEditBudgetMin(formatted)}
                  placeholder="VD: 50.000.000"
                  unit="đ"
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-[12.5px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Đến (VNĐ)
                </label>
                <StandardCurrencyInput
                  value={editBudgetMax}
                  onChange={(formatted) => setEditBudgetMax(formatted)}
                  placeholder="VD: 200.000.000"
                  unit="đ"
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-[12.5px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Industry, Region, Deadline */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ngành nghề
                </label>
                <select
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Công nghệ & Số hóa">Công nghệ</option>
                  <option value="Xây dựng & Bất động sản">Xây dựng & BĐS</option>
                  <option value="Sản xuất & Công nghiệp">Sản xuất</option>
                  <option value="Tài chính & Đầu tư">Tài chính</option>
                  <option value="Thương mại & Dịch vụ">Dịch vụ</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Khu vực
                </label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Toàn quốc">Toàn quốc</option>
                  <option value="Hà Nội & Miền Bắc">Miền Bắc</option>
                  <option value="TP. Hồ Chí Minh & Miền Nam">Miền Nam</option>
                  <option value="Miền Trung">Miền Trung</option>
                  <option value="Quốc tế">Quốc tế</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hạn xử lý
                </label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-[12px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
                {editDeadline && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Hạn xử lý: {formatDisplayDate(editDeadline, { withWeekday: true })}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Contact information fields */}
            <div className="rounded-2xl p-3.5 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-500/20 space-y-2.5">
              <p className="text-[11.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Thông tin người đại diện kết nối
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Họ tên người liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border transition ${
                    editErrors.contactName ? "border-rose-500 ring-1 ring-rose-500/30" : "border-slate-200/80 dark:border-white/10"
                  }`}>
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      value={editContactName}
                      onChange={(e) => {
                        setEditContactName(e.target.value);
                        if (editErrors.contactName) setEditErrors((prev) => ({ ...prev, contactName: "" }));
                      }}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
                  {editErrors.contactName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                      {editErrors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border transition ${
                    editErrors.contactPhone ? "border-rose-500 ring-1 ring-rose-500/30" : "border-slate-200/80 dark:border-white/10"
                  }`}>
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      value={editContactPhone}
                      onChange={(e) => {
                        setEditContactPhone(e.target.value);
                        if (editErrors.contactPhone) setEditErrors((prev) => ({ ...prev, contactPhone: "" }));
                      }}
                      placeholder="VD: 0912345678"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
                  {editErrors.contactPhone && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                      {editErrors.contactPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                  Chức vụ / Chức danh
                </label>
                <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    value={editContactTitle}
                    onChange={(e) => setEditContactTitle(e.target.value)}
                    placeholder="VD: Giám đốc kinh doanh / CEO"
                    className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mô tả chi tiết nội dung cơ hội
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Mô tả cụ thể nhu cầu, tiêu chuẩn đối tác, ngân sách hoặc phương án hợp tác..."
                rows={3}
                className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updating}
              style={{ color: "#ffffff" }}
              className="flex-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[12.5px] font-bold text-white transition shadow-md shadow-[#003B95]/25 cursor-pointer disabled:opacity-50"
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
