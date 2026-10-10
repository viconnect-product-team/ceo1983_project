import React from "react";
import { createPortal } from "react-dom";
import {
  Handshake,
  X,
  Trash2,
  Loader2,
  ImagePlus,
  Calendar,
  User,
  Phone,
  Briefcase,
} from "lucide-react";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { formatDisplayDate } from "@/lib/date-format";

export interface OpportunityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newImage: string | null;
  setNewImage: (img: string | null) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  newTitle: string;
  setNewTitle: (t: string) => void;
  newErrors: Record<string, string>;
  setNewErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  newTag: string;
  setNewTag: (t: string) => void;
  newCompany: string;
  setNewCompany: (c: string) => void;
  newBudgetMin: string;
  setNewBudgetMin: (b: string) => void;
  newBudgetMax: string;
  setNewBudgetMax: (b: string) => void;
  newIndustry: string;
  setNewIndustry: (i: string) => void;
  newRegion: string;
  setNewRegion: (r: string) => void;
  newDeadline: string;
  setNewDeadline: (d: string) => void;
  newContactName: string;
  setNewContactName: (n: string) => void;
  newContactPhone: string;
  setNewContactPhone: (p: string) => void;
  newContactTitle: string;
  setNewContactTitle: (t: string) => void;
  newDesc: string;
  setNewDesc: (d: string) => void;
  creating: boolean;
  resolveMediaUrl: (url?: string | null) => string | null;
}

export const OpportunityCreateModal: React.FC<OpportunityCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newImage,
  setNewImage,
  imageInputRef,
  handleImageFileChange,
  uploadingImage,
  newTitle,
  setNewTitle,
  newErrors,
  setNewErrors,
  newTag,
  setNewTag,
  newCompany,
  setNewCompany,
  newBudgetMin,
  setNewBudgetMin,
  newBudgetMax,
  setNewBudgetMax,
  newIndustry,
  setNewIndustry,
  newRegion,
  setNewRegion,
  newDeadline,
  setNewDeadline,
  newContactName,
  setNewContactName,
  newContactPhone,
  setNewContactPhone,
  newContactTitle,
  setNewContactTitle,
  newDesc,
  setNewDesc,
  creating,
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
            <Handshake className="h-4 w-4" />
            Đăng cơ hội hợp tác mới
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
                ref={imageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
              {newImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                  <img
                    src={resolveMediaUrl(newImage) || newImage}
                    alt="Hình ảnh cơ hội"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNewImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition bg-slate-50 dark:bg-white/[0.02] cursor-pointer"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                      <span className="text-[12px] font-medium">Đang tải ảnh lên...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6 text-amber-500" />
                      <span className="text-[12.5px] font-semibold">
                        Tải lên hình ảnh dự án / cơ hội
                      </span>
                      <span className="text-[10.5px] text-slate-400">
                        JPG, PNG, WebP (Tối đa 10MB)
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tiêu đề cơ hội <span className="text-red-500">*</span>
              </label>
              <input
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (newErrors.title) setNewErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="Ví dụ: Tìm đối tác cung ứng bao bì giấy số lượng lớn..."
                className={`w-full rounded-2xl border bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 placeholder:text-slate-400 transition ${
                  newErrors.title
                    ? "border-rose-500 ring-1 ring-rose-500/30"
                    : "border-transparent focus:border-amber-500"
                }`}
              />
              {newErrors.title && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {newErrors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phân loại cơ hội
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Hợp tác B2B">Hợp tác B2B</option>
                  <option value="Đầu tư & Vốn">Đầu tư & Vốn</option>
                  <option value="Giao thương">Giao thương</option>
                  <option value="Cung ứng">Cung ứng & Phân phối</option>
                  <option value="Xuất nhập khẩu">Xuất nhập khẩu</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Doanh nghiệp
                </label>
                <input
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Tên doanh nghiệp..."
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* CRM Deal Fields: Budget Min/Max */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ngân sách tối thiểu (VNĐ)
                </label>
                <StandardCurrencyInput
                  value={newBudgetMin}
                  onChange={(formatted) => setNewBudgetMin(formatted)}
                  placeholder="VD: 500.000.000"
                  unit="đ"
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ngân sách tối đa (VNĐ)
                </label>
                <StandardCurrencyInput
                  value={newBudgetMax}
                  onChange={(formatted) => setNewBudgetMax(formatted)}
                  placeholder="VD: 2.000.000.000"
                  unit="đ"
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Industry & Region & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ngành nghề
                </label>
                <select
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Công nghệ & Số hóa">Công nghệ & Số hóa</option>
                  <option value="Xây dựng & Bất động sản">Xây dựng & BĐS</option>
                  <option value="Sản xuất & Công nghiệp">Sản xuất & Chế tạo</option>
                  <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                  <option value="Thương mại & Dịch vụ">Thương mại & Dịch vụ</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Khu vực
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Toàn quốc">Toàn quốc</option>
                  <option value="Hà Nội & Miền Bắc">Hà Nội & Miền Bắc</option>
                  <option value="TP. Hồ Chí Minh & Miền Nam">TP.HCM & Miền Nam</option>
                  <option value="Miền Trung">Miền Trung</option>
                  <option value="Quốc tế">Quốc tế</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hạn chót
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
                {newDeadline && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Hạn chót: {formatDisplayDate(newDeadline, { withWeekday: true })}
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
                    newErrors.contactName ? "border-rose-500 ring-1 ring-rose-500/30" : "border-slate-200/80 dark:border-white/10"
                  }`}>
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      value={newContactName}
                      onChange={(e) => {
                        setNewContactName(e.target.value);
                        if (newErrors.contactName) setNewErrors((prev) => ({ ...prev, contactName: "" }));
                      }}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
                  {newErrors.contactName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                      {newErrors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border transition ${
                    newErrors.contactPhone ? "border-rose-500 ring-1 ring-rose-500/30" : "border-slate-200/80 dark:border-white/10"
                  }`}>
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      value={newContactPhone}
                      onChange={(e) => {
                        setNewContactPhone(e.target.value);
                        if (newErrors.contactPhone) setNewErrors((prev) => ({ ...prev, contactPhone: "" }));
                      }}
                      placeholder="VD: 0912345678"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
                  {newErrors.contactPhone && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                      {newErrors.contactPhone}
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
                    value={newContactTitle}
                    onChange={(e) => setNewContactTitle(e.target.value)}
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
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
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
              disabled={creating}
              style={{ color: "#ffffff" }}
              className="flex-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] py-2.5 text-[12.5px] font-bold text-white transition shadow-md shadow-[#003B95]/25 cursor-pointer disabled:opacity-50"
            >
              {creating ? "Đang đăng..." : "Đăng cơ hội ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
