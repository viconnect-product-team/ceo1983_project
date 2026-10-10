import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";

export interface ProductEditModalProps {
  isOpen: boolean;
  editingProduct: any | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEn?: boolean;
  editPhoto: string;
  setEditPhoto: (val: string) => void;
  editName: string;
  setEditName: (val: string) => void;
  editCompany: string;
  setEditCompany: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editOriginalPrice: string;
  setEditOriginalPrice: (val: string) => void;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  updatingProduct: boolean;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
  isEn,
  editPhoto,
  setEditPhoto,
  editName,
  setEditName,
  editCompany,
  setEditCompany,
  editCategory,
  setEditCategory,
  editOriginalPrice,
  setEditOriginalPrice,
  editPrice,
  setEditPrice,
  editDesc,
  setEditDesc,
  updatingProduct,
}) => {
  const localImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !editingProduct || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
            {isEn ? "Edit Product / Service" : "Chỉnh Sửa Sản Phẩm / Dịch Vụ"}
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
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 [scrollbar-width:thin]">
            {/* Image upload / preview */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Product Image" : "Hình ảnh đại diện sản phẩm"}
              </label>
              <input
                type="file"
                ref={localImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const tid = toast.loading("Đang tải ảnh sản phẩm lên MinIO...");
                  try {
                    const uploadedUrl = await uploadFileToNest(file, "products");
                    if (uploadedUrl) {
                      setEditPhoto(uploadedUrl);
                      toast.success("Đã tải ảnh sản phẩm lên MinIO thành công!", { id: tid });
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Tải ảnh sản phẩm thất bại!", { id: tid });
                  } finally {
                    if (e.target) e.target.value = "";
                  }
                }}
              />
              {editPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={resolveMediaUrl(editPhoto) || editPhoto}
                    alt="Preview"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setEditPhoto("")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow cursor-pointer transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => localImageInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-4 text-center hover:border-amber-500/50 hover:bg-amber-50/5 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <ImagePlus className="h-6 w-6 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {isEn ? "Click to upload new image" : "Chọn ảnh từ thiết bị (JPG, PNG, WebP)"}
                  </span>
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Product Name *" : "Tên sản phẩm / giải pháp *"}
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="VD: Dịch vụ tư vấn giải pháp AI..."
                className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Company" : "Tên doanh nghiệp"}
                </label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="VD: Công ty TNHH ABC"
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Category" : "Ngành hàng"}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                >
                  <option value="Công nghệ & Phần mềm">Công nghệ & Phần mềm</option>
                  <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                  <option value="Sản xuất & Công nghiệp">Sản xuất & Công nghiệp</option>
                  <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                  <option value="Dịch vụ & Du lịch">Dịch vụ & Du lịch</option>
                  <option value="Hàng tiêu dùng & Bán lẻ">Hàng tiêu dùng & Bán lẻ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Original Price" : "Giá niêm yết (VNĐ)"}
                </label>
                <StandardCurrencyInput
                  value={editOriginalPrice}
                  onChange={(formatted) => setEditOriginalPrice(formatted)}
                  placeholder="VD: 50.000.000"
                  unit="đ"
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Member Price *" : "Giá ưu đãi hội viên *"}
                </label>
                <StandardCurrencyInput
                  required
                  value={editPrice}
                  onChange={(formatted) => setEditPrice(formatted)}
                  placeholder="VD: 35.000.000"
                  unit="đ"
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Description / Specs" : "Mô tả / Thông số / Ưu đãi"}
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Giới thiệu điểm nổi bật, chính sách bảo hành, hỗ trợ hội viên..."
                className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? "Cancel" : "Hủy"}
            </button>
            <button
              type="submit"
              disabled={updatingProduct}
              style={{ color: "#ffffff" }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E3192]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
            >
              <span>{updatingProduct ? (isEn ? "Saving..." : "Đang lưu...") : (isEn ? "Save Changes" : "Lưu Thay Đổi")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
