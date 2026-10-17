import React, { useState, useRef } from "react";
import {
  X,
  Sparkles,
  Building2,
  FileText,
  Save,
  Award,
  Users,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Upload,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  CompanyProfile2PageData,
  DEFAULT_COMPANY_PROFILE,
} from "./CompanyProfileTwoPages";
import { fetchNestApi, uploadFileToNest } from "../../lib/api-client";

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

  const [activeTab, setActiveTab] = useState<"page1" | "page2">("page1");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── TRANG 1 FIELDS ──
  const [companyName, setCompanyName] = useState(
    initialData.companyName || DEFAULT_COMPANY_PROFILE.companyName
  );
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || "");
  const [slogan, setSlogan] = useState(
    initialData.slogan || DEFAULT_COMPANY_PROFILE.slogan
  );
  const [leaderName, setLeaderName] = useState<string>(
    initialData.leaderName || DEFAULT_COMPANY_PROFILE.leaderName || ""
  );
  const [leaderTitle, setLeaderTitle] = useState<string>(
    initialData.leaderTitle || DEFAULT_COMPANY_PROFILE.leaderTitle || ""
  );
  const [aboutUs, setAboutUs] = useState(
    initialData.aboutUs || DEFAULT_COMPANY_PROFILE.aboutUs
  );

  // 3 Giá trị cốt lõi
  const initialCoreValues =
    initialData.coreValues && initialData.coreValues.length === 3
      ? initialData.coreValues
      : DEFAULT_COMPANY_PROFILE.coreValues;
  const [coreVal1Title, setCoreVal1Title] = useState(initialCoreValues[0].title);
  const [coreVal1Desc, setCoreVal1Desc] = useState(initialCoreValues[0].desc);
  const [coreVal2Title, setCoreVal2Title] = useState(initialCoreValues[1].title);
  const [coreVal2Desc, setCoreVal2Desc] = useState(initialCoreValues[1].desc);
  const [coreVal3Title, setCoreVal3Title] = useState(initialCoreValues[2].title);
  const [coreVal3Desc, setCoreVal3Desc] = useState(initialCoreValues[2].desc);

  // Dịch vụ / Sản phẩm chủ lực
  const [keyServices, setKeyServices] = useState<
    Array<{ title: string; desc: string; isPrimary?: boolean }>
  >(() => {
    if (initialData.keyServices && initialData.keyServices.length > 0) {
      return initialData.keyServices;
    }
    return DEFAULT_COMPANY_PROFILE.keyServices;
  });

  // ── TRANG 2 FIELDS ──
  const [personnelCompetence, setPersonnelCompetence] = useState(
    initialData.personnelCompetence || DEFAULT_COMPANY_PROFILE.personnelCompetence
  );
  const [preferentialPolicy, setPreferentialPolicy] = useState(
    initialData.preferentialPolicy || DEFAULT_COMPANY_PROFILE.preferentialPolicy
  );

  // Quy trình làm việc (4 bước)
  const initialWorkflow =
    initialData.workflowSteps && initialData.workflowSteps.length === 4
      ? initialData.workflowSteps
      : DEFAULT_COMPANY_PROFILE.workflowSteps;
  const [step1, setStep1] = useState(initialWorkflow[0]);
  const [step2, setStep2] = useState(initialWorkflow[1]);
  const [step3, setStep3] = useState(initialWorkflow[2]);
  const [step4, setStep4] = useState(initialWorkflow[3]);

  // Thông tin pháp lý & Liên hệ (Footer)
  const [taxCode, setTaxCode] = useState(
    initialData.taxCode || DEFAULT_COMPANY_PROFILE.taxCode
  );
  const [officeAddress, setOfficeAddress] = useState(
    initialData.officeAddress || DEFAULT_COMPANY_PROFILE.officeAddress
  );
  const [hotline, setHotline] = useState(
    initialData.hotline || DEFAULT_COMPANY_PROFILE.hotline
  );
  const [email, setEmail] = useState(
    initialData.email || DEFAULT_COMPANY_PROFILE.email
  );
  const [website, setWebsite] = useState(
    initialData.website || DEFAULT_COMPANY_PROFILE.website
  );

  // Upload Logo
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

  // Add / Remove Key Service
  const handleAddService = () => {
    setKeyServices([
      ...keyServices,
      {
        title: "Dịch vụ / Sản phẩm mới",
        desc: "Mô tả giải pháp và lợi ích dành cho khách hàng B2B...",
        isPrimary: false,
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    if (keyServices.length <= 1) {
      toast.error("Cần ít nhất 1 dịch vụ hoặc sản phẩm chủ lực!");
      return;
    }
    setKeyServices(keyServices.filter((_, i) => i !== index));
  };

  const handleSetPrimaryService = (index: number) => {
    setKeyServices(
      keyServices.map((srv, i) => ({
        ...srv,
        isPrimary: i === index,
      }))
    );
  };

  // Save all changes
  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Vui lòng nhập tên công ty!");
      setActiveTab("page1");
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: CompanyProfile2PageData = {
        companyName: companyName.trim(),
        slogan: slogan.trim(),
        logoUrl: logoUrl.trim() || null,
        leaderName: leaderName.trim(),
        leaderTitle: leaderTitle.trim(),
        memberCode: initialData.memberCode || "CEO1983-VIP",
        aboutUs: aboutUs.trim(),
        coreValues: [
          { title: coreVal1Title.trim() || "TỐC ĐỘ", desc: coreVal1Desc.trim() },
          { title: coreVal2Title.trim() || "CHẤT LƯỢNG", desc: coreVal2Desc.trim() },
          { title: coreVal3Title.trim() || "MINH BẠCH", desc: coreVal3Desc.trim() },
        ],
        keyServices: keyServices.map((s) => ({
          title: s.title.trim(),
          desc: s.desc.trim(),
          isPrimary: !!s.isPrimary,
        })),
        personnelCompetence: personnelCompetence.trim(),
        preferentialPolicy: preferentialPolicy.trim(),
        workflowSteps: [
          step1.trim() || "Tiếp nhận thông tin",
          step2.trim() || "Tư vấn giải pháp",
          step3.trim() || "Triển khai",
          step4.trim() || "Bàn giao & Bảo hành",
        ],
        taxCode: taxCode.trim(),
        officeAddress: officeAddress.trim(),
        hotline: hotline.trim(),
        email: email.trim(),
        website: website.trim(),
        companyProfileUrl: initialData.companyProfileUrl || null,
        companyProfileName: initialData.companyProfileName || null,
      };

      // 1. Lưu vào localStorage key chuyên biệt của 2-page profile
      localStorage.setItem(
        "vba_company_profile_2pages",
        JSON.stringify(updatedProfile)
      );

      // 2. Đồng bộ các trường tương thích sang vba_custom_profile
      try {
        const existingCustom = JSON.parse(
          localStorage.getItem("vba_custom_profile") || "{}"
        );
        const mergedCustom = {
          ...existingCustom,
          company: updatedProfile.companyName,
          title: updatedProfile.leaderTitle,
          phone: updatedProfile.hotline,
          email: updatedProfile.email,
          address: updatedProfile.officeAddress,
          website: updatedProfile.website,
          taxCode: updatedProfile.taxCode,
          slogan: updatedProfile.slogan,
          featuredProducts: updatedProfile.keyServices.map((s) => s.title).join(", "),
        };
        if (logoUrl) {
          mergedCustom.companyLogo = logoUrl;
          localStorage.setItem("vba_member_company_logo", logoUrl);
        }
        localStorage.setItem("vba_custom_profile", JSON.stringify(mergedCustom));
      } catch {}

      // 3. Dispatch events to notify other components
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

      // 4. Đồng bộ lên NestJS API nếu có session
      await fetchNestApi("/members/me", {
        method: "PATCH",
        body: JSON.stringify({
          company: updatedProfile.companyName,
          address: updatedProfile.officeAddress,
          email: updatedProfile.email,
          website: updatedProfile.website,
          companyLogo: updatedProfile.logoUrl || undefined,
        }),
      }).catch(() => null);

      toast.success("Đã cập nhật hồ sơ doanh nghiệp 2 trang thành công!");
      onSaved(updatedProfile);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu hồ sơ doanh nghiệp");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-400/40 bg-slate-900 text-white shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#001D4D]">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-sm">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase text-amber-300 tracking-wider">
                Chỉnh Sửa Hồ Sơ Năng Lực (Profile 2 Trang)
              </h3>
              <p className="text-[11px] text-slate-300">
                Chuẩn hóa định vị thương hiệu &amp; năng lực cạnh tranh B2B
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Switcher: Trang 1 vs Trang 2 */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/60 border-b border-white/10 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("page1")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "page1"
                ? "bg-amber-400 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>TRANG 1: Định vị &amp; Năng lực cốt lõi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("page2")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "page2"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>TRANG 2: Thế mạnh &amp; Liên hệ</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-200">
          {/* =========================================================================
              TAB 1: TRANG 1
             ========================================================================= */}
          {activeTab === "page1" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Section 1: Header */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="size-4" />
                  <span>1. Phần đầu (Header): Logo, Tên công ty &amp; Slogan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Logo Picker */}
                  <div className="sm:col-span-1 space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Logo công ty
                    </label>
                    <div className="relative size-24 rounded-2xl border-2 border-dashed border-amber-400/50 bg-slate-950 flex flex-col items-center justify-center p-2 text-center group hover:border-amber-400 transition cursor-pointer overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Company Logo"
                          className="size-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <Building2 className="size-8 text-amber-400 mb-1" />
                          <span className="text-[10px]">Chưa có logo</span>
                        </div>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadLogo}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="w-full py-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Upload className="size-3" />
                      <span>{uploadingLogo ? "Đang tải..." : "Tải ảnh Logo"}</span>
                    </button>
                  </div>

                  {/* Company Name & Slogan */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Tên đầy đủ công ty <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ & THƯƠNG MẠI CEO 1983"
                        className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Câu Slogan định vị ngành nghề
                      </label>
                      <input
                        type="text"
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                        placeholder="VD: Giải pháp công nghệ số tối ưu cho doanh nghiệp nhỏ"
                        className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-amber-300 font-semibold focus:border-amber-400 focus:outline-none italic"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                          Người đại diện
                        </label>
                        <input
                          type="text"
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          placeholder="VD: Nguyễn Văn A"
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">
                          Chức vụ
                        </label>
                        <input
                          type="text"
                          value={leaderTitle}
                          onChange={(e) => setLeaderTitle(e.target.value)}
                          placeholder="VD: Chủ tịch / Tổng Giám đốc"
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: About Us */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <FileText className="size-4" />
                    <span>2. Giới thiệu ngắn (About Us): 3–5 câu</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Tránh viết dài dòng về lịch sử
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                  placeholder="Viết từ 3–5 câu ngắn gọn về lý do thành lập và sứ mệnh hướng đến khách hàng..."
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-xs text-white leading-relaxed focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Section 3: Core Values (3 criteria) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Award className="size-4" />
                  <span>3. Giá trị cốt lõi (3 tiêu chí đại diện phong cách làm việc)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Criteria 1 */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                        1
                      </span>
                      <input
                        type="text"
                        value={coreVal1Title}
                        onChange={(e) => setCoreVal1Title(e.target.value)}
                        placeholder="Từ khóa (VD: TỐC ĐỘ)"
                        className="w-full bg-transparent font-black text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={coreVal1Desc}
                      onChange={(e) => setCoreVal1Desc(e.target.value)}
                      placeholder="Mô tả ngắn phong cách..."
                      className="w-full rounded bg-white/5 p-2 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>

                  {/* Criteria 2 */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                        2
                      </span>
                      <input
                        type="text"
                        value={coreVal2Title}
                        onChange={(e) => setCoreVal2Title(e.target.value)}
                        placeholder="Từ khóa (VD: CHẤT LƯỢNG)"
                        className="w-full bg-transparent font-black text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={coreVal2Desc}
                      onChange={(e) => setCoreVal2Desc(e.target.value)}
                      placeholder="Mô tả ngắn phong cách..."
                      className="w-full rounded bg-white/5 p-2 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>

                  {/* Criteria 3 */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                        3
                      </span>
                      <input
                        type="text"
                        value={coreVal3Title}
                        onChange={(e) => setCoreVal3Title(e.target.value)}
                        placeholder="Từ khóa (VD: MINH BẠCH)"
                        className="w-full bg-transparent font-black text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={coreVal3Desc}
                      onChange={(e) => setCoreVal3Desc(e.target.value)}
                      placeholder="Mô tả ngắn phong cách..."
                      className="w-full rounded bg-white/5 p-2 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Key Services / Products (with primary service highlight) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="size-4" />
                    <span>4. Dịch vụ / Sản phẩm chủ lực &amp; Mũi nhọn</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold hover:bg-amber-400/30 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Thêm dịch vụ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {keyServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition ${
                        srv.isPrimary
                          ? "bg-amber-500/10 border-amber-400/60 ring-1 ring-amber-400/30"
                          : "bg-slate-950 border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryService(idx)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                              srv.isPrimary
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : "bg-white/10 text-slate-400 hover:text-white"
                            }`}
                            title="Chọn làm dịch vụ mũi nhọn tự tin cạnh tranh nhất"
                          >
                            <Star className="size-3" />
                            <span>{srv.isPrimary ? "Dịch vụ Mũi nhọn" : "Đặt làm Mũi nhọn"}</span>
                          </button>
                        </div>

                        {keyServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Xóa dịch vụ này"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => {
                            const updated = [...keyServices];
                            updated[idx].title = e.target.value;
                            setKeyServices(updated);
                          }}
                          placeholder="Tên dịch vụ / giải pháp..."
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={srv.desc}
                          onChange={(e) => {
                            const updated = [...keyServices];
                            updated[idx].desc = e.target.value;
                            setKeyServices(updated);
                          }}
                          placeholder="Mô tả giải pháp mũi nhọn giúp bạn tự tin cạnh tranh nhất..."
                          className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-[11px] text-slate-300 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: TRANG 2
             ========================================================================= */}
          {activeTab === "page2" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Section 1: Why Choose Us */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="size-4" />
                  <span>1. Tại sao chọn chúng tôi? (Thế mạnh thay thế cho dự án)</span>
                </div>

                <div className="space-y-3">
                  {/* Personnel Competence */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-400/30 space-y-1.5">
                    <label className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      <span>Năng lực nhân sự chuyên gia:</span>
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Tổng số năm kinh nghiệm gộp lại của đội ngũ sáng lập hoặc các chứng chỉ quốc tế đang sở hữu.
                    </p>
                    <textarea
                      rows={3}
                      value={personnelCompetence}
                      onChange={(e) => setPersonnelCompetence(e.target.value)}
                      placeholder="VD: Đội ngũ sáng lập sở hữu hơn 15+ năm kinh nghiệm thực chiến..."
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-white leading-relaxed focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  {/* Superior Policies */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-400/30 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Award className="size-3.5" />
                      <span>Chính sách ưu việt:</span>
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Cam kết về tiến độ, bảo hành, hoặc mức giá tối ưu cho những khách hàng đầu tiên.
                    </p>
                    <textarea
                      rows={3}
                      value={preferentialPolicy}
                      onChange={(e) => setPreferentialPolicy(e.target.value)}
                      placeholder="VD: Cam kết 100% về tiến độ và chất lượng bàn giao, bảo hành 24/7..."
                      className="w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-white leading-relaxed focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Workflow Steps (4 steps horizontal) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="size-4" />
                    <span>2. Quy trình làm việc (4 bước nhanh gọn)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Sơ đồ ngang tinh gọn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span>Bước 1:</span>
                    </label>
                    <input
                      type="text"
                      value={step1}
                      onChange={(e) => setStep1(e.target.value)}
                      placeholder="Tiếp nhận thông tin"
                      className="w-full rounded bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span>Bước 2:</span>
                    </label>
                    <input
                      type="text"
                      value={step2}
                      onChange={(e) => setStep2(e.target.value)}
                      placeholder="Tư vấn giải pháp"
                      className="w-full rounded bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span>Bước 3:</span>
                    </label>
                    <input
                      type="text"
                      value={step3}
                      onChange={(e) => setStep3(e.target.value)}
                      placeholder="Triển khai"
                      className="w-full rounded bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                    <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span>Bước 4:</span>
                    </label>
                    <input
                      type="text"
                      value={step4}
                      onChange={(e) => setStep4(e.target.value)}
                      placeholder="Bàn giao & Bảo hành"
                      className="w-full rounded bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Legal & Contact Info (Footer) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="size-4" />
                  <span>3. Thông tin pháp lý &amp; Liên hệ (Footer)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="VD: 0108319838"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Hotline
                    </label>
                    <input
                      type="text"
                      value={hotline}
                      onChange={(e) => setHotline(e.target.value)}
                      placeholder="VD: 0983 1983 83"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-emerald-400 focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Địa chỉ văn phòng
                    </label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="VD: Tòa nhà CEO 1983 Tower, Cầu Giấy, TP. Hà Nội"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Email doanh nghiệp
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: lienhe@ceo1983club.com"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="VD: https://ceo1983club.com"
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-blue-300 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-950/80">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Mọi thay đổi sẽ được cập nhật trực tiếp vào thẻ hội viên &amp; mã QR.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfileEditModal;
