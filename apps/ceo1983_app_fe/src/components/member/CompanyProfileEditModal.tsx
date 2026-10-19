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
  Triangle,
  Diamond,
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingTriangle, setUploadingTriangle] = useState(false);
  const [uploadingHalfDiamond, setUploadingHalfDiamond] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const triangleInputRef = useRef<HTMLInputElement>(null);
  const halfDiamondInputRef = useRef<HTMLInputElement>(null);

  // ── 8 TRƯỜNG THÔNG TIN THEO YÊU CẦU ──
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || DEFAULT_COMPANY_PROFILE.logoUrl || "");
  const [companyName, setCompanyName] = useState(
    initialData.companyName || DEFAULT_COMPANY_PROFILE.companyName
  );
  const [aboutUs, setAboutUs] = useState(
    initialData.aboutUs || DEFAULT_COMPANY_PROFILE.aboutUs
  );
  const [industry, setIndustry] = useState(
    initialData.industry ||
      (initialData.keyServices && initialData.keyServices.length > 0
        ? initialData.keyServices.map((s) => s.title).join(", ")
        : DEFAULT_COMPANY_PROFILE.industry)
  );
  const [personnelCompetence, setPersonnelCompetence] = useState(
    initialData.personnelCompetence || DEFAULT_COMPANY_PROFILE.personnelCompetence
  );
  const [website, setWebsite] = useState(
    initialData.website || DEFAULT_COMPANY_PROFILE.website
  );
  const [hotline, setHotline] = useState(
    initialData.hotline || DEFAULT_COMPANY_PROFILE.hotline
  );
  const [officeAddress, setOfficeAddress] = useState(
    initialData.officeAddress || DEFAULT_COMPANY_PROFILE.officeAddress
  );

  // ── 2 ẢNH HÌNH HỌC TRÊN NỀN TRẮNG ──
  const [triangleImageUrl, setTriangleImageUrl] = useState(
    initialData.triangleImageUrl ||
      initialData.coverUrl ||
      DEFAULT_COMPANY_PROFILE.triangleImageUrl ||
      ""
  );
  const [halfDiamondImageUrl, setHalfDiamondImageUrl] = useState(
    initialData.halfDiamondImageUrl ||
      DEFAULT_COMPANY_PROFILE.halfDiamondImageUrl ||
      ""
  );

  // Handlers for Upload
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFileToNest(file, file.name);
      if (url) {
        setLogoUrl(url);
        toast.success("Tải logo công ty thành công!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải logo");
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadTriangle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTriangle(true);
    try {
      const url = await uploadFileToNest(file, file.name);
      if (url) {
        setTriangleImageUrl(url);
        toast.success("Tải ảnh hình tam giác thành công!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải ảnh");
    } finally {
      setUploadingTriangle(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadHalfDiamond = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHalfDiamond(true);
    try {
      const url = await uploadFileToNest(file, file.name);
      if (url) {
        setHalfDiamondImageUrl(url);
        toast.success("Tải ảnh nửa hình thoi thành công!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải ảnh");
    } finally {
      setUploadingHalfDiamond(false);
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
        // 8 TRƯỜNG CHÍNH
        logoUrl: logoUrl.trim() || null,
        companyName: companyName.trim(),
        aboutUs: aboutUs.trim(),
        industry: industry.trim(),
        personnelCompetence: personnelCompetence.trim(),
        website: website.trim(),
        hotline: hotline.trim(),
        officeAddress: officeAddress.trim(),

        // 2 ẢNH HÌNH HỌC
        triangleImageUrl: triangleImageUrl.trim() || null,
        halfDiamondImageUrl: halfDiamondImageUrl.trim() || null,
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
          industry: updatedProfile.industry,
          about: updatedProfile.aboutUs,
        };
        if (logoUrl) {
          mergedCustom.companyLogo = logoUrl;
          localStorage.setItem("vba_member_company_logo", logoUrl);
        }
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
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[#003B95] border border-blue-200">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase text-[#003B95]">
                Cập nhật Hồ Sơ Năng Lực
              </h3>
              <p className="text-[11px] text-slate-500">
                Chuẩn 8 trường thông tin &amp; 2 hình ảnh khối nghệ thuật
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5">
          {/* 1. Logo & Tên doanh nghiệp */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#003B95]" />
                <span>1. Logo Doanh Nghiệp</span>
              </label>
              <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                <div className="size-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Building2 className="size-8 text-slate-300" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Upload className="size-3 text-[#003B95]" />
                  <span>{uploadingLogo ? "Đang tải..." : "Đổi Logo"}</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#003B95]" />
                <span>2. Tên Doanh Nghiệp *</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ VICONNECT"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#003B95] outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Tên đầy đủ của doanh nghiệp theo đăng ký kinh doanh.
              </p>
            </div>
          </div>

          {/* 3. Giới thiệu doanh nghiệp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              3. Giới thiệu doanh nghiệp
            </label>
            <textarea
              rows={3}
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="Giới thiệu khái quát về lịch sử, sứ mệnh và năng lực nổi bật..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
            />
          </div>

          {/* 4. Lĩnh vực hoạt động */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-[#003B95]" />
              <span>4. Lĩnh vực hoạt động</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="VD: Sản xuất & Phân phối máy móc, Giải pháp chuyển đổi số..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
            />
          </div>

          {/* 5. Nhân sự */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="size-3.5 text-[#003B95]" />
              <span>5. Quy mô &amp; Năng lực nhân sự</span>
            </label>
            <textarea
              rows={2}
              value={personnelCompetence}
              onChange={(e) => setPersonnelCompetence(e.target.value)}
              placeholder="VD: Hơn 50+ nhân sự chất lượng cao, các kỹ sư lành nghề và cố vấn cấp cao..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
            />
          </div>

          {/* 6, 7, 8: Website, Hotline, Địa chỉ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="size-3.5 text-[#003B95]" />
                <span>6. Website</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="size-3.5 text-amber-600" />
                <span>7. Hotline</span>
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="0983 xxx xxx"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-rose-600" />
                <span>8. Địa chỉ văn phòng / trụ sở</span>
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="VD: Tòa nhà CEO 1983 Tower, Cầu Giấy, TP. Hà Nội"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#003B95] outline-none"
              />
            </div>
          </div>

          {/* ── 2 ẢNH HÌNH HỌC (TAM GIÁC VÀ NỬA HÌNH THOI) ── */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider mb-3">
              2 Hình ảnh biểu trưng (Cắt theo hình học chuẩn)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ảnh 1: Hình tam giác */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Triangle className="size-3.5 text-[#003B95]" />
                    Ảnh hình tam giác
                  </span>
                  <input
                    ref={triangleInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadTriangle}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => triangleInputRef.current?.click()}
                    disabled={uploadingTriangle}
                    className="text-[11px] font-bold text-[#003B95] hover:underline cursor-pointer"
                  >
                    {uploadingTriangle ? "Đang tải..." : "Tải ảnh mới"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="size-16 overflow-hidden bg-slate-200 shrink-0"
                    style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                  >
                    {triangleImageUrl ? (
                      <img src={triangleImageUrl} alt="Tam giác" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <input
                    type="text"
                    value={triangleImageUrl}
                    onChange={(e) => setTriangleImageUrl(e.target.value)}
                    placeholder="URL ảnh hình tam giác..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Ảnh 2: Nửa hình thoi */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Diamond className="size-3.5 text-amber-600" />
                    Ảnh nửa hình thoi (ở dưới)
                  </span>
                  <input
                    ref={halfDiamondInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadHalfDiamond}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => halfDiamondInputRef.current?.click()}
                    disabled={uploadingHalfDiamond}
                    className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    {uploadingHalfDiamond ? "Đang tải..." : "Tải ảnh mới"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-12 overflow-hidden bg-slate-200 shrink-0"
                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
                  >
                    {halfDiamondImageUrl ? (
                      <img src={halfDiamondImageUrl} alt="Nửa hình thoi" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <input
                    type="text"
                    value={halfDiamondImageUrl}
                    onChange={(e) => setHalfDiamondImageUrl(e.target.value)}
                    placeholder="URL ảnh nửa hình thoi..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfileEditModal;
