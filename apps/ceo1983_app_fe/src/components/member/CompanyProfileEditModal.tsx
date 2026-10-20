import React, { useState, useRef } from "react";
import {
  X,
  Sparkles,
  Building2,
  Save,
  Users,
  MapPin,
  Phone,
  Globe,
  Upload,
  Briefcase,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  CompanyProfile2PageData,
  DEFAULT_COMPANY_PROFILE,
} from "./CompanyProfileTwoPages";
import { uploadFileToNest } from "../../lib/api-client";

interface CompanyProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Partial<CompanyProfile2PageData>;
  onSaved: (newData: CompanyProfile2PageData) => void;
}

export function CompanyProfileEditModal({
  open,
  onClose,
  initialData,
  onSaved,
}: CompanyProfileEditModalProps) {
  if (!open) return null;

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [companyName, setCompanyName] = useState(
    initialData.companyName || DEFAULT_COMPANY_PROFILE.companyName
  );

  const [geoImageUrl, setGeoImageUrl] = useState(
    initialData.geoImageUrl ||
      initialData.triangleImageUrl ||
      initialData.coverUrl ||
      DEFAULT_COMPANY_PROFILE.geoImageUrl ||
      ""
  );

  const [metric1Val, setMetric1Val] = useState(
    initialData.metric1Val ||
      (initialData.personnelCompetence && initialData.personnelCompetence.length <= 15
        ? initialData.personnelCompetence
        : DEFAULT_COMPANY_PROFILE.metric1Val || "50+")
  );
  const [metric1Label, setMetric1Label] = useState(
    initialData.metric1Label || DEFAULT_COMPANY_PROFILE.metric1Label || "Nhân sự Chuyên gia"
  );

  const [metric2Val, setMetric2Val] = useState(
    initialData.metric2Val ||
      (initialData.industry && initialData.industry.length <= 15
        ? initialData.industry
        : DEFAULT_COMPANY_PROFILE.metric2Val || "10+ Năm")
  );
  const [metric2Label, setMetric2Label] = useState(
    initialData.metric2Label || DEFAULT_COMPANY_PROFILE.metric2Label || "Kinh nghiệm Thực chiến"
  );

  const [aboutUs, setAboutUs] = useState(
    initialData.aboutUs || DEFAULT_COMPANY_PROFILE.aboutUs || ""
  );

  const [website, setWebsite] = useState(
    initialData.website || DEFAULT_COMPANY_PROFILE.website || ""
  );
  const [hotline, setHotline] = useState(
    initialData.hotline || DEFAULT_COMPANY_PROFILE.hotline || ""
  );
  const [officeAddress, setOfficeAddress] = useState(
    initialData.officeAddress || DEFAULT_COMPANY_PROFILE.officeAddress || ""
  );

  // Upload geometric photo
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFileToNest(file, file.name);
      if (url) {
        setGeoImageUrl(url);
        toast.success("Tải ảnh biểu trưng thành công!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải ảnh");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Vui lòng nhập tên doanh nghiệp!");
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: CompanyProfile2PageData = {
        ...initialData,
        companyName: companyName.trim(),
        geoImageUrl: geoImageUrl.trim() || null,
        triangleImageUrl: geoImageUrl.trim() || null, // Sync backward compatibility
        metric1Val: metric1Val.trim(),
        metric1Label: metric1Label.trim(),
        metric2Val: metric2Val.trim(),
        metric2Label: metric2Label.trim(),
        personnelCompetence: metric1Val.trim(),
        industry: metric2Val.trim(),
        aboutUs: aboutUs.trim(),
        website: website.trim(),
        hotline: hotline.trim(),
        officeAddress: officeAddress.trim(),
      };

      // 1. Lưu vào localStorage
      localStorage.setItem(
        "vba_company_profile_2pages",
        JSON.stringify(updatedProfile)
      );

      // 2. Đồng bộ các trường tương thích
      try {
        const existingCustom = JSON.parse(
          localStorage.getItem("vba_custom_profile") || "{}"
        );
        const mergedCustom = {
          ...existingCustom,
          company: updatedProfile.companyName,
          companyName: updatedProfile.companyName,
          phone: updatedProfile.hotline,
          address: updatedProfile.officeAddress,
          website: updatedProfile.website,
          about: updatedProfile.aboutUs,
        };
        localStorage.setItem("vba_custom_profile", JSON.stringify(mergedCustom));
      } catch {}

      // 3. Dispatch events
      window.dispatchEvent(
        new CustomEvent("profile-updated", { detail: updatedProfile })
      );
      window.dispatchEvent(
        new CustomEvent("vba_profile_updated", { detail: updatedProfile })
      );
      window.dispatchEvent(
        new CustomEvent("vba_company_profile_2pages_updated", {
          detail: updatedProfile,
        })
      );

      toast.success("Lưu hồ sơ năng lực doanh nghiệp thành công!");
      onSaved(updatedProfile);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể lưu: " + (err?.message || "Lỗi không xác định"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase text-[#003B95] dark:text-amber-400">
                Chỉnh Sửa Hồ Sơ Doanh Nghiệp
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cập nhật thông tin hiển thị trên thẻ hồ sơ CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
          {/* Tên doanh nghiệp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="size-3.5 text-[#003B95] dark:text-amber-400" />
              <span>Tên Doanh Nghiệp *</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ VICONNECT"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-none"
            />
          </div>

          {/* Ảnh biểu trưng hình học */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Ảnh Biểu Trưng Kiến Trúc &amp; Năng Lực (Cắt Ngũ Giác)</span>
              </span>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Upload className="size-3" />
                <span>{uploadingImage ? "Đang tải..." : "Tải ảnh từ máy"}</span>
              </button>
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div
                className="size-16 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                style={{
                  clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                }}
              >
                {geoImageUrl ? (
                  <img src={geoImageUrl} alt="Biểu trưng" className="size-full object-cover" />
                ) : null}
              </div>
              <input
                type="text"
                value={geoImageUrl}
                onChange={(e) => setGeoImageUrl(e.target.value)}
                placeholder="Nhập hoặc dán link ảnh biểu trưng..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#003B95] dark:focus:border-amber-400"
              />
            </div>
          </div>

          {/* 2 Khối Chỉ Số / Điểm Nổi Bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Metric 1 */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="size-3.5 text-amber-500" />
                <span>Chỉ số 1 (Quy mô nhân sự)</span>
              </span>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={metric1Val}
                  onChange={(e) => setMetric1Val(e.target.value)}
                  placeholder="Giá trị (VD: 50+)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={metric1Label}
                  onChange={(e) => setMetric1Label(e.target.value)}
                  placeholder="Nhãn (VD: Nhân sự Chuyên gia)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-amber-500" />
                <span>Chỉ số 2 (Kinh nghiệm thực chiến)</span>
              </span>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={metric2Val}
                  onChange={(e) => setMetric2Val(e.target.value)}
                  placeholder="Giá trị (VD: 10+ Năm)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={metric2Label}
                  onChange={(e) => setMetric2Label(e.target.value)}
                  placeholder="Nhãn (VD: Kinh nghiệm Thực chiến)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Giới thiệu & Điểm nổi bật */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Giải Pháp &amp; Năng Lực Nổi Bật (Mỗi dòng là một mục đánh dấu)
            </label>
            <textarea
              rows={3}
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="Giải pháp Công nghệ B2B & Chuyển đổi số doanh nghiệp.&#10;Xúc tiến thương mại & Tối ưu chi phí vận hành."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-none"
            />
          </div>

          {/* Website, Hotline, Địa chỉ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="size-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Website</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://ceo1983club.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="size-3.5 text-amber-500" />
                <span>Hotline</span>
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="0983 1983 83"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-rose-500" />
                <span>Địa chỉ trụ sở / văn phòng</span>
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Tòa nhà CEO 1983 Tower, Cầu Giấy, Hà Nội"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#001D4A] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-blue-900/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="size-3.5" />
              <span>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfileEditModal;
