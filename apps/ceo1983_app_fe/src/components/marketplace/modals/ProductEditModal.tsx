import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, ImagePlus, X, Video } from "lucide-react";
import { toast } from "sonner";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { STANDARD_MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

export interface ProductEditModalProps {
  isOpen: boolean;
  editingProduct: any | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEn?: boolean;
  availableCategories?: string[];
  editPhoto: string;
  setEditPhoto: (val: string) => void;
  editPhotos?: string[];
  setEditPhotos?: (val: string[]) => void;
  editVideoUrl?: string;
  setEditVideoUrl?: (val: string) => void;
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
  availableCategories,
  editPhoto,
  setEditPhoto,
  editPhotos = [],
  setEditPhotos,
  editVideoUrl = "",
  setEditVideoUrl,
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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isCustomCategory, setIsCustomCategory] = React.useState(false);
  const [customCategoryText, setCustomCategoryText] = React.useState("");

  const categoryOptions = React.useMemo(() => {
    const base = availableCategories && availableCategories.length > 0
      ? availableCategories
      : STANDARD_MARKETPLACE_CATEGORIES.map((c) => c.label);
    const set = new Set(base);
    if (editCategory && !set.has(editCategory)) {
      set.add(editCategory);
    }
    return Array.from(set);
  }, [availableCategories, editCategory]);

  React.useEffect(() => {
    if (editCategory && !STANDARD_MARKETPLACE_CATEGORIES.some(c => c.label === editCategory)) {
      // It's a custom category
      setCustomCategoryText(editCategory);
    }
  }, [editCategory]);

  if (!isOpen || !editingProduct || typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!editName.trim()) {
      newErrors.name = isEn ? "Please enter product name" : "Vui lòng nhập tên sản phẩm / giải pháp";
    }
    const cleanPrice = Number(editPrice.replace(/\D/g, ""));
    if (!editPrice.trim() || isNaN(cleanPrice) || cleanPrice <= 0) {
      newErrors.price = isEn ? "Please enter a valid member price (> 0)" : "Vui lòng nhập giá ưu đãi hội viên (> 0 đ)";
    }
    if (!editDesc.trim()) {
      newErrors.desc = isEn ? "Please enter description / specs" : "Vui lòng nhập mô tả / thông số / ưu đãi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(isEn ? "Please complete all required fields (*)" : "Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    setErrors({});
    onSubmit(e);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] h-[90vh] sm:h-auto max-h-[90vh] max-h-[90dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 [scrollbar-width:thin]" data-modal-body>
            {/* Image upload / preview gallery */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Product Images" : "Hình ảnh sản phẩm (Nhiều ảnh)"}
                </label>
                <span className="text-[10.5px] text-slate-400">
                  {editPhotos.length > 0 ? `Đã có ${editPhotos.length} ảnh` : "Tối đa 10 ảnh"}
                </span>
              </div>

              <input
                type="file"
                multiple
                ref={localImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  const tid = toast.loading(`Đang tải ${files.length} ảnh sản phẩm lên MinIO...`);
                  try {
                    const uploadPromises = Array.from(files).map((f) => uploadFileToNest(f, "products"));
                    const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
                    if (uploadedUrls.length > 0) {
                      const merged = [...editPhotos, ...uploadedUrls];
                      if (setEditPhotos) setEditPhotos(merged);
                      if (!editPhoto || editPhotos.length === 0) {
                        setEditPhoto(merged[0]);
                      }
                      toast.success(`Đã tải thành công ${uploadedUrls.length} ảnh lên MinIO!`, { id: tid });
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Tải ảnh sản phẩm thất bại!", { id: tid });
                  } finally {
                    if (e.target) e.target.value = "";
                  }
                }}
              />

              {/* Thumbnails list */}
              {editPhotos.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {editPhotos.map((photoUrl, idx) => (
                      <div
                        key={`${photoUrl}-${idx}`}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-square"
                      >
                        <img
                          src={resolveMediaUrl(photoUrl) || photoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#003B95] text-white text-[9.5px] font-bold shadow-xs">
                            Ảnh chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editPhotos.filter((_, i) => i !== idx);
                            if (setEditPhotos) setEditPhotos(updated);
                            setEditPhoto(updated[0] || "");
                          }}
                          className="absolute top-1.5 right-1.5 size-6 rounded-md bg-black/75 text-white hover:bg-rose-600 grid place-items-center opacity-90 transition cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => localImageInputRef.current?.click()}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ImagePlus className="size-4 text-amber-500" />
                    <span>+ Tải thêm ảnh khác lên MinIO</span>
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
                    {isEn ? "Click to upload product images (multiple)" : "Chọn ảnh từ thiết bị (Cho phép chọn nhiều ảnh)"}
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Lưu trực tiếp MinIO)</span>
                </button>
              )}
            </div>

            {/* Video URL Input */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Video Introduction URL (Optional)" : "Link Video giới thiệu sản phẩm (Tùy chọn)"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Video className="size-4" />
                </div>
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl?.(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... hoặc video MP4 / TikTok"
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-0 focus:ring-1 focus:ring-[#003B95]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Product Name" : "Tên sản phẩm / giải pháp"} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="VD: Dịch vụ tư vấn giải pháp AI..."
                className={`w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none transition ${
                  errors.name ? "ring-2 ring-rose-500" : "ring-0 focus:ring-1 focus:ring-[#003B95]"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.name}
                </p>
              )}
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
                  value={isCustomCategory ? "__custom__" : editCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      setIsCustomCategory(true);
                      if (!customCategoryText) setEditCategory("");
                    } else {
                      setIsCustomCategory(false);
                      setEditCategory(val);
                    }
                  }}
                  className="w-full rounded-xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 cursor-pointer"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom__" className="text-[#003B95] font-bold">
                    Thêm phân loại mới... (Tự điền)
                  </option>
                </select>

                {isCustomCategory && (
                  <div className="mt-2 space-y-1 animate-in fade-in">
                    <input
                      type="text"
                      autoFocus
                      value={customCategoryText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCategoryText(val);
                        setEditCategory(val);
                      }}
                      placeholder="Nhập tên phân loại mới (VD: Dịch vụ pháp lý, Nông sản...)"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-2 ring-[#003B95] dark:ring-blue-500"
                    />
                    <p className="text-[10px] text-[#003B95] dark:text-blue-400 font-medium">
                      Phân loại mới sẽ tự động hiển thị trên thanh danh mục Marketplace!
                    </p>
                  </div>
                )}
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
                  {isEn ? "Member Price" : "Giá ưu đãi hội viên"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <StandardCurrencyInput
                  value={editPrice}
                  onChange={(formatted) => {
                    setEditPrice(formatted);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  placeholder="VD: 35.000.000"
                  unit="đ"
                  className={`w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none transition ${
                    errors.price ? "ring-2 ring-rose-500" : "ring-0 focus:ring-1 focus:ring-[#003B95]"
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? "Description / Specs" : "Mô tả / Thông số / Ưu đãi"} <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => {
                  setEditDesc(e.target.value);
                  if (errors.desc) setErrors((prev) => ({ ...prev, desc: "" }));
                }}
                placeholder="Giới thiệu điểm nổi bật, chính sách bảo hành, hỗ trợ hội viên..."
                className={`w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none resize-none transition ${
                  errors.desc ? "ring-2 ring-rose-500" : "ring-0 focus:ring-1 focus:ring-[#003B95]"
                }`}
              />
              {errors.desc && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.desc}
                </p>
              )}
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
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-[#003B95] border border-[#003B95] py-2.5 text-xs font-bold shadow-xs active:scale-98 transition cursor-pointer disabled:opacity-60"
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
