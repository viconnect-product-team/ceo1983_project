import React from "react";
import { createPortal } from "react-dom";
import { PackageCheck, Store, ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { uploadFileToNest, resolveMediaUrl } from "@/lib/api-client";
import { STANDARD_MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

export interface ProductPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEn?: boolean;
  availableCategories?: string[];
  formCompany: string;
  setFormCompany: (val: string) => void;
  formCompanySize: string;
  setFormCompanySize: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formCompanyIntro: string;
  setFormCompanyIntro: (val: string) => void;
  formPhoto: string;
  setFormPhoto: (val: string) => void;
  formName: string;
  setFormName: (val: string) => void;
  formOriginalPrice: string;
  setFormOriginalPrice: (val: string) => void;
  formPrice: string;
  setFormPrice: (val: string) => void;
  formUnit: string;
  setFormUnit: (val: string) => void;
  formCurrency: string;
  setFormCurrency: (val: string) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
}

export const ProductPostModal: React.FC<ProductPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEn,
  availableCategories,
  formCompany,
  setFormCompany,
  formCompanySize,
  setFormCompanySize,
  formCategory,
  setFormCategory,
  formCompanyIntro,
  setFormCompanyIntro,
  formPhoto,
  setFormPhoto,
  formName,
  setFormName,
  formOriginalPrice,
  setFormOriginalPrice,
  formPrice,
  setFormPrice,
  formUnit,
  setFormUnit,
  formCurrency,
  setFormCurrency,
  formDesc,
  setFormDesc,
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isCustomCategory, setIsCustomCategory] = React.useState(false);
  const [customCategoryText, setCustomCategoryText] = React.useState("");

  const categoryOptions = React.useMemo(() => {
    const base = availableCategories && availableCategories.length > 0
      ? availableCategories
      : STANDARD_MARKETPLACE_CATEGORIES.map((c) => c.label);
    return Array.from(new Set(base));
  }, [availableCategories]);

  React.useEffect(() => {
    if (formCategory && !categoryOptions.includes(formCategory)) {
      setIsCustomCategory(true);
      setCustomCategoryText(formCategory);
    }
  }, [formCategory, categoryOptions]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formCompany.trim()) {
      newErrors.company = isEn ? "Please enter company / brand name" : "Vui lòng nhập tên doanh nghiệp / thương hiệu";
    }
    if (!formName.trim()) {
      newErrors.name = isEn ? "Please enter product name" : "Vui lòng nhập tên sản phẩm / dịch vụ";
    }
    if (!formCategory.trim()) {
      newErrors.category = isEn ? "Please enter or select category" : "Vui lòng chọn hoặc nhập phân loại ngành hàng";
    }
    const cleanPrice = Number(formPrice.replace(/\D/g, ""));
    if (!formPrice.trim() || isNaN(cleanPrice) || cleanPrice <= 0) {
      newErrors.price = isEn ? "Please enter a valid price (> 0)" : "Vui lòng nhập giá ưu đãi hội viên (> 0 đ)";
    }
    if (!formDesc.trim()) {
      newErrors.desc = isEn ? "Please enter product description" : "Vui lòng nhập mô tả sản phẩm & cam kết chất lượng";
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
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-[#003B95] dark:text-amber-400" />
            {isEn ? "Post New Product / Service" : "Đăng Sản Phẩm / Dịch Vụ Mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:thin]">
            {/* ── PHẦN 1: THÔNG TIN DOANH NGHIỆP & GIAN HÀNG ── */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#003B95] dark:text-amber-400">
                <Store className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                <span>1. Thông tin Doanh Nghiệp & Gian Hàng</span>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Company / Brand Name" : "Tên Doanh Nghiệp / Thương Hiệu"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => {
                    setFormCompany(e.target.value);
                    if (errors.company) setErrors((prev) => ({ ...prev, company: "" }));
                  }}
                  placeholder={isEn ? "Company name" : "Ví dụ: Công ty Cổ phần Công nghệ ABC"}
                  className={`w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition ${
                    errors.company ? "ring-2 ring-rose-500" : "ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#003B95]"
                  }`}
                />
                {errors.company && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.company}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Employee Scale" : "Quy mô nhân sự"}
                  </label>
                  <select
                    value={formCompanySize}
                    onChange={(e) => setFormCompanySize(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                  >
                    <option value="Dưới 10 nhân sự">Dưới 10 nhân sự</option>
                    <option value="10 - 50 nhân sự">10 - 50 nhân sự</option>
                    <option value="50 - 200 nhân sự">50 - 200 nhân sự</option>
                    <option value="200 - 500 nhân sự">200 - 500 nhân sự</option>
                    <option value="Trên 500 nhân sự">Trên 500 nhân sự</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Industry" : "Lĩnh vực chính"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
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

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Company Bio / Intro" : "Giới thiệu ngắn về doanh nghiệp"}
                </label>
                <textarea
                  rows={2}
                  value={formCompanyIntro}
                  onChange={(e) => setFormCompanyIntro(e.target.value)}
                  placeholder="Giới thiệu năng lực cung ứng, giấy phép hoặc kinh nghiệm thị trường..."
                  className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700 resize-none"
                />
              </div>
            </div>

            {/* ── PHẦN 2: THÔNG TIN SẢN PHẨM / DỊCH VỤ ── */}
            <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <PackageCheck className="h-4 w-4" />
                <span>2. Thông tin Sản Phẩm / Dịch Vụ</span>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Product Image" : "Ảnh sản phẩm (Rõ nét)"}
                </label>
                {formPhoto ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <img
                      src={resolveMediaUrl(formPhoto) || formPhoto}
                      alt="Ảnh sản phẩm"
                      className="h-36 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPhoto("")}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/75 text-white hover:bg-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/70 transition">
                    <ImagePlus className="h-6 w-6 text-[#003B95] dark:text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {isEn ? "Click to upload product image" : "Chọn ảnh sản phẩm tải lên (Lưu MinIO)"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const tid = toast.loading("Đang tải ảnh sản phẩm lên MinIO...");
                        try {
                          const uploadedUrl = await uploadFileToNest(file, "products");
                          if (uploadedUrl) {
                            setFormPhoto(uploadedUrl);
                            toast.success("Đã tải ảnh sản phẩm lên MinIO thành công!", { id: tid });
                          }
                        } catch (err: any) {
                          toast.error(err?.message || "Tải ảnh sản phẩm thất bại!", { id: tid });
                        } finally {
                          if (e.target) e.target.value = "";
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Product / Service Name" : "Tên sản phẩm / Dịch vụ"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder={isEn ? "e.g. Enterprise Cloud Solution..." : "Ví dụ: Gói giải pháp chuyển đổi số doanh nghiệp..."}
                  className={`w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition ${
                    errors.name ? "ring-2 ring-rose-500" : "ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#003B95]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Category / Industry Classification" : "Danh mục / Phân loại ngành hàng"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={isCustomCategory ? "__custom__" : formCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      setIsCustomCategory(true);
                      if (!customCategoryText) {
                        setFormCategory("");
                      }
                    } else {
                      setIsCustomCategory(false);
                      setFormCategory(val);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                    }
                  }}
                  className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#003B95] cursor-pointer"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom__" className="text-[#003B95] font-bold">
                    + Thêm phân loại mới... (Tự điền)
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
                        setFormCategory(val);
                        if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                      }}
                      placeholder="Nhập tên phân loại mới (VD: Dịch vụ pháp lý, Nông sản chất lượng cao...)"
                      className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-2 ring-[#003B95] dark:ring-blue-500"
                    />
                    <p className="text-[10.5px] text-[#003B95] dark:text-blue-400 font-medium">
                      Phân loại mới sẽ tự động hiển thị trên thanh danh mục Marketplace sau khi đăng!
                    </p>
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Listed Price (Original)" : "Giá niêm yết (Gốc)"}
                  </label>
                  <StandardCurrencyInput
                    value={formOriginalPrice}
                    onChange={(formatted) => setFormOriginalPrice(formatted)}
                    placeholder="Ví dụ: 20.000.000 đ"
                    unit="đ"
                    className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "VIP Member Price" : "Giá ưu đãi Hội viên"} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <StandardCurrencyInput
                    value={formPrice}
                    onChange={(formatted) => {
                      setFormPrice(formatted);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    placeholder="Ví dụ: 15.000.000 đ"
                    unit="đ"
                    className={`w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition ${
                      errors.price ? "ring-2 ring-rose-500" : "ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#003B95]"
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                      {errors.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Unit" : "Đơn vị tính"}
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Gói / Chiếc / Tháng"
                    className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Currency" : "Tiền tệ"}
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer"
                  >
                    <option value="VND">VNĐ</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Description & Quality Commitment" : "Mô tả sản phẩm & Cam kết chất lượng"} <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => {
                    setFormDesc(e.target.value);
                    if (errors.desc) setErrors((prev) => ({ ...prev, desc: "" }));
                  }}
                  placeholder={isEn ? "Describe specs, warranty, exclusive member discounts..." : "Mô tả thông số, chính sách bảo hành, ưu đãi riêng cho hội viên CEO 1983..."}
                  className={`w-full rounded-xl border-0 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none transition ${
                    errors.desc ? "ring-2 ring-rose-500" : "ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#003B95]"
                  }`}
                />
                {errors.desc && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500 animate-in fade-in duration-150">
                    {errors.desc}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="submit"
              className="w-full rounded-xl bg-white hover:bg-slate-50 text-[#003B95] border border-[#003B95] py-2.5 text-xs font-bold shadow-xs active:scale-98 transition cursor-pointer"
            >
              {isEn ? "Publish Product to Marketplace" : "Đăng Sản Phẩm Lên Gian Hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
