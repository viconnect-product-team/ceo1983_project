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
  Users,
} from "lucide-react";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { formatDisplayDate } from "@/lib/date-format";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export interface OpportunityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newImage: string | null;
  setNewImage: (img: string | null) => void;
  newImages?: string[];
  setNewImages?: (imgs: string[]) => void;
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
  newReferrer?: string;
  setNewReferrer?: (v: string) => void;
  newCommissionPercent?: string;
  setNewCommissionPercent?: (v: string) => void;
  selectedRecipientIds?: string[];
  setSelectedRecipientIds?: (ids: string[]) => void;
}

export const OpportunityCreateModal: React.FC<OpportunityCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newImage,
  setNewImage,
  newImages = [],
  setNewImages,
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
  newReferrer: propReferrer,
  setNewReferrer: propSetReferrer,
  newCommissionPercent: propCommission,
  setNewCommissionPercent: propSetCommission,
  selectedRecipientIds: propRecipientIds,
  setSelectedRecipientIds: propSetRecipientIds,
}) => {
  const [recipientType, setRecipientType] = React.useState<"all" | "by_department" | "friends">("all");
  const [friendsScope, setFriendsScope] = React.useState<"all" | "selective">("all");
  const [selectedDept, setSelectedDept] = React.useState<string>("");
  const [deptList, setDeptList] = React.useState<any[]>([]);
  const [loadingDepts, setLoadingDepts] = React.useState<boolean>(false);

  const [localReferrer, setLocalReferrer] = React.useState("");
  const [localCommission, setLocalCommission] = React.useState("");
  const [localRecipientIds, setLocalRecipientIds] = React.useState<string[]>([]);

  const newReferrer = propReferrer !== undefined ? propReferrer : localReferrer;
  const setNewReferrer = propSetReferrer || setLocalReferrer;
  const newCommissionPercent = propCommission !== undefined ? propCommission : localCommission;
  const setNewCommissionPercent = propSetCommission || setLocalCommission;
  const selectedRecipientIds = propRecipientIds !== undefined ? propRecipientIds : localRecipientIds;
  const setSelectedRecipientIds = propSetRecipientIds || setLocalRecipientIds;

  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingDepts(true);
    fetchNestApi<any[]>("/members/by-department")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setDeptList(res);
          setSelectedDept((prev) => prev || res[0]?.department || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
  }, [isOpen]);

  const activeDeptMembers = React.useMemo(() => {
    if (!deptList || deptList.length === 0) return [];
    const found = deptList.find((d) => d.department === selectedDept);
    return found?.members || deptList[0]?.members || [];
  }, [deptList, selectedDept]);

  const allFlattenedMembers = React.useMemo(() => {
    if (!deptList || deptList.length === 0) return [];
    return deptList.flatMap((d) => d.members || []);
  }, [deptList]);

  if (typeof document === "undefined" || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] max-h-[90dvh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <span className="text-[13.5px] font-extrabold text-[#003B95] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
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

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" data-modal-body>
            {/* Image upload gallery */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block">
                  Hình ảnh minh họa / Poster cơ hội (Nhiều ảnh)
                </label>
                <span className="text-[10.5px] text-slate-400">
                  {newImages.length > 0 ? `Đã chọn ${newImages.length} ảnh` : "Tối đa 10 ảnh"}
                </span>
              </div>
              <input
                type="file"
                multiple
                ref={imageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {newImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {newImages.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="relative group rounded-xl overflow-hidden border border-amber-500/30 bg-slate-900/10 aspect-square"
                      >
                        <img
                          src={resolveMediaUrl(imgUrl) || imgUrl}
                          alt="Hình ảnh cơ hội"
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#003B95] text-white text-[9px] font-bold shadow-xs">
                            Ảnh bìa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newImages.filter((_, i) => i !== idx);
                            if (setNewImages) setNewImages(updated);
                            setNewImage(updated[0] || null);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer transition"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-amber-500 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    ) : (
                      <ImagePlus className="h-4 w-4 text-amber-500" />
                    )}
                    <span>+ Tải thêm ảnh khác từ thiết bị</span>
                  </button>
                </div>
              ) : newImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                  <img
                    src={resolveMediaUrl(newImage) || newImage}
                    alt="Hình ảnh cơ hội"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewImage(null);
                      if (setNewImages) setNewImages([]);
                    }}
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
                        Tải lên hình ảnh dự án / cơ hội (Chọn nhiều ảnh)
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
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Thông tin người đại diện / Người nhận cơ hội
                </p>
                {loadingDepts && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
              </div>

              {/* 1. Chọn Người Nhận Cơ Hội (Req 5) */}
              <div className="rounded-xl bg-white/80 dark:bg-black/30 p-2.5 border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1F3864] dark:text-amber-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-500" /> Người nhận cơ hội
                  </span>
                  {selectedRecipientIds.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Đã chọn {selectedRecipientIds.length} người
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientType("all");
                      setSelectedRecipientIds([]);
                    }}
                    className={`py-1.5 px-1.5 rounded-lg font-bold text-center border transition cursor-pointer text-[10.5px] leading-tight ${
                      recipientType === "all"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Tất cả hội viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType("by_department")}
                    className={`py-1.5 px-1.5 rounded-lg font-bold text-center border transition cursor-pointer text-[10.5px] leading-tight ${
                      recipientType === "by_department"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Theo từng ban
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType("friends")}
                    className={`py-1.5 px-1.5 rounded-lg font-bold text-center border transition cursor-pointer text-[10.5px] leading-tight ${
                      recipientType === "friends"
                        ? "bg-[#1F3864] text-white border-[#1F3864] shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    Bạn bè đã kết nối
                  </button>
                </div>

                {/* Recipient Type: Tất cả hội viên */}
                {recipientType === "all" && (
                  <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-200">
                    Cơ hội này sẽ được hiển thị công khai cho toàn thể hội viên CLB Doanh Nhân CEO 1983.
                  </div>
                )}

                {/* Recipient Type: Theo từng ban (Req 5: Chọn từng ban call API hiện cụ thể thành viên, tích ai thì hiện cho người đó) */}
                {recipientType === "by_department" && (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                        Chọn ban công tác:
                      </label>
                      {activeDeptMembers.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const deptIds = activeDeptMembers.map((m: any) => String(m.id));
                              const merged = Array.from(new Set([...selectedRecipientIds, ...deptIds]));
                              setSelectedRecipientIds(merged);
                            }}
                            className="text-[#003B95] dark:text-amber-400 font-bold hover:underline cursor-pointer"
                          >
                            Chọn tất cả
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              const deptIds = new Set(activeDeptMembers.map((m: any) => String(m.id)));
                              setSelectedRecipientIds(selectedRecipientIds.filter((id) => !deptIds.has(id)));
                            }}
                            className="text-slate-500 hover:text-rose-500 font-medium cursor-pointer"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      )}
                    </div>

                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[12px] font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {deptList.map((d: any) => (
                        <option key={d.department} value={d.department}>
                          {d.department} ({d.count || d.members?.length || 0} thành viên)
                        </option>
                      ))}
                    </select>

                    {/* Member checklist */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      {activeDeptMembers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          {loadingDepts ? "Đang tải danh sách thành viên..." : "Chưa có thành viên trong ban này"}
                        </div>
                      ) : (
                        activeDeptMembers.map((mem: any) => {
                          const memId = String(mem.id);
                          const isChecked = selectedRecipientIds.includes(memId);
                          return (
                            <label
                              key={memId}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                                isChecked
                                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-[#B8860B] text-slate-900 dark:text-white font-medium"
                                  : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRecipientIds([...selectedRecipientIds, memId]);
                                  } else {
                                    setSelectedRecipientIds(selectedRecipientIds.filter((id) => id !== memId));
                                  }
                                }}
                                className="size-3.5 accent-[#1F3864]"
                              />
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {mem.avatar ? (
                                  <img
                                    src={resolveMediaUrl(mem.avatar) || mem.avatar}
                                    alt={mem.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (mem.name || "U").charAt(0)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[11.5px] truncate">{mem.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {mem.title || mem.executiveRole || "Hội viên"} {mem.company ? `• ${mem.company}` : ""}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Recipient Type: Bạn bè đã kết nối (Req 5: Bạn bè chọn tất cả thì hiện cho tất cả, chọn từng người sẽ hiện cho từng người) */}
                {recipientType === "friends" && (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setFriendsScope("all");
                          setSelectedRecipientIds([]);
                        }}
                        className={`py-1.5 px-2 rounded-lg font-bold text-center border transition cursor-pointer text-[10.5px] ${
                          friendsScope === "all"
                            ? "bg-[#1F3864] text-white border-[#1F3864]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        Tất cả bạn bè
                      </button>
                      <button
                        type="button"
                        onClick={() => setFriendsScope("selective")}
                        className={`py-1.5 px-2 rounded-lg font-bold text-center border transition cursor-pointer text-[10.5px] ${
                          friendsScope === "selective"
                            ? "bg-[#1F3864] text-white border-[#1F3864]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        Chọn từng người
                      </button>
                    </div>

                    {friendsScope === "all" ? (
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300">
                        Cơ hội này sẽ tự động hiển thị với tất cả các CEO và bạn bè đã kết nối với bạn.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Tích chọn từng người bạn muốn hiển thị cơ hội:
                        </label>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                          {allFlattenedMembers.map((mem: any) => {
                            const memId = String(mem.id);
                            const isChecked = selectedRecipientIds.includes(memId);
                            return (
                              <label
                                key={memId}
                                className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                                  isChecked
                                    ? "bg-amber-50/80 dark:bg-amber-950/40 border-[#B8860B] text-slate-900 dark:text-white font-medium"
                                    : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecipientIds([...selectedRecipientIds, memId]);
                                    } else {
                                      setSelectedRecipientIds(selectedRecipientIds.filter((id) => id !== memId));
                                    }
                                  }}
                                  className="size-3.5 accent-[#1F3864]"
                                />
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  {mem.avatar ? (
                                    <img
                                      src={resolveMediaUrl(mem.avatar) || mem.avatar}
                                      alt={mem.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (mem.name || "U").charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[11.5px] truncate">{mem.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {mem.department} {mem.company ? `• ${mem.company}` : ""}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {/* Người giới thiệu & % Hoa hồng (Req 5: không bắt buộc) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Người giới thiệu <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                    <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <input
                      value={newReferrer}
                      onChange={(e) => setNewReferrer(e.target.value)}
                      placeholder="VD: Anh Nam - Ban Điều Hành"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Chia sẻ % hoa hồng <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                    <Handshake className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <input
                      value={newCommissionPercent}
                      onChange={(e) => setNewCommissionPercent(e.target.value)}
                      placeholder="VD: 5% hoặc 10%"
                      className="w-full bg-transparent text-[12.5px] text-slate-900 dark:text-white outline-none border-0 p-0"
                    />
                  </div>
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

          <div className="flex gap-2.5 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
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
