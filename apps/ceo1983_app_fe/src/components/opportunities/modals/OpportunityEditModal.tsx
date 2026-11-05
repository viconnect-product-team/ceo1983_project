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
  Loader2,
  Users,
  Globe,
  Handshake,
  Check,
} from "lucide-react";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { formatDisplayDate } from "@/lib/date-format";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export interface OpportunityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editImage: string | null;
  setEditImage: (img: string | null) => void;
  editImages?: string[];
  setEditImages?: (imgs: string[]) => void;
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
  editReferrer?: string;
  setEditReferrer?: (v: string) => void;
  editCommissionPercent?: string;
  setEditCommissionPercent?: (v: string) => void;
  editSelectedRecipientIds?: string[];
  setEditSelectedRecipientIds?: (ids: string[]) => void;
  editExternalLink?: string;
  setEditExternalLink?: (v: string) => void;
  editRecipientType?: "all" | "by_department" | "friends";
  setEditRecipientType?: (v: "all" | "by_department" | "friends") => void;
}

export function OpportunityEditModal({
  isOpen,
  onClose,
  onSubmit,
  editImage,
  setEditImage,
  editImages = [],
  setEditImages,
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
  editReferrer: propReferrer,
  setEditReferrer: propSetReferrer,
  editCommissionPercent: propCommission,
  setEditCommissionPercent: propSetCommission,
  editSelectedRecipientIds: propRecipientIds,
  setEditSelectedRecipientIds: propSetRecipientIds,
  editExternalLink: propExternalLink,
  setEditExternalLink: propSetExternalLink,
  editRecipientType: propRecipientType,
  setEditRecipientType: propSetRecipientType,
}: OpportunityEditModalProps): React.ReactElement | null {
  const [localRecipientType, setLocalRecipientType] = React.useState<"all" | "by_department" | "friends">("all");
  const recipientType = propRecipientType !== undefined ? propRecipientType : localRecipientType;
  const setRecipientType = propSetRecipientType || setLocalRecipientType;

  const [friendsList, setFriendsList] = React.useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = React.useState<boolean>(false);
  const [friendsScope, setFriendsScope] = React.useState<"all" | "selective">("all");
  const [selectedDept, setSelectedDept] = React.useState<string>("");
  const [deptList, setDeptList] = React.useState<any[]>([]);
  const [loadingDepts, setLoadingDepts] = React.useState<boolean>(false);

  const [localReferrer, setLocalReferrer] = React.useState("");
  const [localCommission, setLocalCommission] = React.useState("");
  const [localRecipientIds, setLocalRecipientIds] = React.useState<string[]>([]);
  const [localExternalLink, setLocalExternalLink] = React.useState("");

  const editReferrer = propReferrer !== undefined ? propReferrer : localReferrer;
  const setEditReferrer = propSetReferrer || setLocalReferrer;
  const editCommissionPercent = propCommission !== undefined ? propCommission : localCommission;
  const setEditCommissionPercent = propSetCommission || setLocalCommission;
  const selectedRecipientIds = propRecipientIds !== undefined ? propRecipientIds : localRecipientIds;
  const setSelectedRecipientIds = propSetRecipientIds || setLocalRecipientIds;
  const editExternalLink = propExternalLink !== undefined ? propExternalLink : localExternalLink;
  const setEditExternalLink = propSetExternalLink || setLocalExternalLink;

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

  React.useEffect(() => {
    if (!isOpen) return;
    if (recipientType === "friends") {
      setLoadingFriends(true);
      fetchNestApi<any[]>("/network/connections")
        .then((res) => {
          if (Array.isArray(res)) {
            setFriendsList(res);
          } else {
            setFriendsList([]);
          }
        })
        .catch(() => setFriendsList([]))
        .finally(() => setLoadingFriends(false));
    }
  }, [isOpen, recipientType]);

  const activeDeptMembers = React.useMemo(() => {
    if (!deptList || deptList.length === 0) return [];
    const found = deptList.find((d) => d.department === selectedDept);
    return found?.members || deptList[0]?.members || [];
  }, [deptList, selectedDept]);

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

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" data-modal-body>
            {/* Image upload gallery */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block">
                  Hình ảnh minh họa / Poster cơ hội (Nhiều ảnh)
                </label>
                <span className="text-[10.5px] text-slate-400">
                  {editImages.length > 0 ? `Đã chọn ${editImages.length} ảnh` : "Tối đa 10 ảnh"}
                </span>
              </div>
              <input
                type="file"
                multiple
                ref={editImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFileChange(e, true)}
              />

              {editImages.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {editImages.map((imgUrl, idx) => (
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
                            const updated = editImages.filter((_, i) => i !== idx);
                            if (setEditImages) setEditImages(updated);
                            setEditImage(updated[0] || null);
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
                    onClick={() => editImageInputRef.current?.click()}
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
              ) : editImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 max-h-44 bg-slate-900/10">
                  <img
                    src={resolveMediaUrl(editImage) || editImage}
                    alt="Hình ảnh cơ hội"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditImage(null);
                      if (setEditImages) setEditImages([]);
                    }}
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
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="Ví dụ: Tìm đối tác cung ứng bao bì giấy số lượng lớn..."
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

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phân loại cơ hội
                </label>
                <select
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
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
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
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
                  value={editBudgetMin}
                  onChange={(formatted) => setEditBudgetMin(formatted)}
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
                  value={editBudgetMax}
                  onChange={(formatted) => setEditBudgetMax(formatted)}
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
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
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
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
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
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                />
                {editDeadline && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Hạn chót: {formatDisplayDate(editDeadline, { withWeekday: true })}
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

              {/* 1. Chọn Người Nhận Cơ Hội (Yêu cầu 1: Giống hệt Tạo mới) */}
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

                {/* Recipient Type: Theo từng ban */}
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
                              const allDeptIds = activeDeptMembers.map((m: any) => String(m.id));
                              const merged = Array.from(new Set([...selectedRecipientIds, ...allDeptIds]));
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
                              const toRemoveDeptIds = new Set(activeDeptMembers.map((m: any) => String(m.id)));
                              setSelectedRecipientIds(selectedRecipientIds.filter((id) => !toRemoveDeptIds.has(id)));
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

                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      {activeDeptMembers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          {loadingDepts ? "Đang tải danh sách thành viên..." : "Chưa có thành viên trong ban này"}
                        </div>
                      ) : (
                        activeDeptMembers.map((mem: any) => {
                          const memId = String(mem.id);
                          const isDeptMemChecked = selectedRecipientIds.includes(memId);
                          return (
                            <label
                              key={memId}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                                isDeptMemChecked
                                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-[#B8860B] text-slate-900 dark:text-white font-medium"
                                  : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDeptMemChecked}
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

                {/* Recipient Type: Bạn bè đã kết nối */}
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

                    {loadingFriends ? (
                      <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Loader2 className="size-4 animate-spin text-[#003B95]" />
                        <span>Đang tải danh bạ bạn bè đã kết nối...</span>
                      </div>
                    ) : friendsList.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-700/50 text-center space-y-1.5">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Chưa có kết nối bạn bè nào
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Bạn chưa có bạn bè đã kết nối trong danh bạ CEO 1983. Vui lòng kết nối giao thương trước khi chia sẻ cơ hội riêng tư, hoặc chọn &quot;Tất cả hội viên&quot;.
                        </p>
                      </div>
                    ) : friendsScope === "all" ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-emerald-600" />
                        <span>Cơ hội này sẽ hiển thị với tất cả <strong>{friendsList.length}</strong> CEO bạn bè đã kết nối trong danh bạ của bạn.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Tích chọn từng người bạn muốn hiển thị cơ hội:
                        </label>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200/70 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                          {friendsList.map((friend: any) => {
                            const friendId = String(friend.counterpartUserId || friend.id);
                            const isFriendChecked = selectedRecipientIds.includes(friendId);
                            const friendName = friend.displayName || friend.name || "Hội viên CEO 1983";
                            const friendAvatar = friend.avatarUrl || friend.avatar;
                            const friendCompany = friend.companyName || friend.company || friend.headline || "";
                            return (
                              <label
                                key={friendId}
                                className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                                  isFriendChecked
                                    ? "bg-amber-50/80 dark:bg-amber-950/40 border-[#B8860B] text-slate-900 dark:text-white font-medium"
                                    : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isFriendChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecipientIds([...selectedRecipientIds, friendId]);
                                    } else {
                                      setSelectedRecipientIds(selectedRecipientIds.filter((id) => id !== friendId));
                                    }
                                  }}
                                  className="size-3.5 accent-[#1F3864]"
                                />
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  {friendAvatar ? (
                                    <img
                                      src={resolveMediaUrl(friendAvatar) || friendAvatar}
                                      alt={friendName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    friendName.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[11.5px] truncate">{friendName}</p>
                                  {friendCompany && (
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {friendCompany}
                                    </p>
                                  )}
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

              {/* Thông tin liên hệ */}
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

              {/* Người giới thiệu & % Hoa hồng (Yêu cầu 1: Giống hệt Tạo mới) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                    Người giới thiệu <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                  </label>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-black/20 px-3 py-2 border border-slate-200/80 dark:border-white/10">
                    <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <input
                      value={editReferrer}
                      onChange={(e) => setEditReferrer(e.target.value)}
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
                      value={editCommissionPercent}
                      onChange={(e) => setEditCommissionPercent(e.target.value)}
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
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Mô tả cụ thể nhu cầu, tiêu chuẩn đối tác, ngân sách hoặc phương án hợp tác..."
                rows={3}
                className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Link bài viết Fanpage / Website doanh nghiệp (Yêu cầu 1: Giống hệt Tạo mới) */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Globe className="size-3.5 text-blue-500" />
                Link bài viết Fanpage / Website doanh nghiệp (Tùy chọn)
              </label>
              <input
                type="url"
                value={editExternalLink}
                onChange={(e) => setEditExternalLink(e.target.value)}
                placeholder="VD: https://facebook.com/fanpage/posts/... hoặc https://company.vn/co-hoi-b2b"
                className="w-full rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 text-[13px] text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 placeholder:text-slate-400"
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
}
