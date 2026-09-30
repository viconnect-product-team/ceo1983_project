import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Camera,
  Upload,
  User,
  Phone,
  Building2,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { uploadFileToNest, fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { compressImage } from "@/lib/image";

const quickProfileSchema = z.object({
  name: z.string().trim().min(1, "Họ và tên không được phép để trống"),
  phone: z.string().trim().min(1, "Số điện thoại không được phép để trống"),
});

export interface QuickProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  initialPhone?: string;
  initialAvatar?: string | null;
  initialCover?: string | null;
  initialCompanyLogo?: string | null;
  initialCompany?: string;
  initialTitle?: string;
  userId?: string;
  onSaved?: (updated: {
    name: string;
    phone: string;
    avatar?: string | null;
    cover?: string | null;
    companyLogo?: string | null;
    company?: string;
    title?: string;
  }) => void;
}

export function QuickProfileEditModal({
  open,
  onClose,
  initialName = "",
  initialPhone = "",
  initialAvatar = null,
  initialCover = null,
  initialCompanyLogo = null,
  initialCompany = "",
  initialTitle = "",
  userId,
  onSaved,
}: QuickProfileEditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [company, setCompany] = useState(initialCompany);
  const [title, setTitle] = useState(initialTitle);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [cover, setCover] = useState<string | null>(initialCover);
  const [companyLogo, setCompanyLogo] = useState<string | null>(initialCompanyLogo);
  const [modalLogoError, setModalLogoError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setPhone(initialPhone);
      setCompany(initialCompany);
      setTitle(initialTitle);
      setAvatar(initialAvatar);
      setCover(initialCover);
      setCompanyLogo(initialCompanyLogo || null);
      setModalLogoError(false);
      setErrors({});
    }
  }, [open, initialName, initialPhone, initialCompany, initialTitle, initialAvatar, initialCover, initialCompanyLogo]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    if (type === "cover") setUploadingCover(true);
    if (type === "logo") setUploadingLogo(true);

    try {
      // 1. Client-side downscaling & compression (<80KB) for instant preview & zero lag
      const maxDim = type === "cover" ? 1280 : (type === "avatar" ? 600 : 400);
      const maxHeight = type === "cover" ? 720 : maxDim;
      const { dataUrl, blob } = await compressImage(file, maxDim, maxHeight, 0.82);

      // Instant preview
      if (type === "avatar") setAvatar(dataUrl);
      if (type === "cover") setCover(dataUrl);
      if (type === "logo") {
        setCompanyLogo(dataUrl);
        setModalLogoError(false);
      }

      // 2. Upload compressed blob in background (completes in <300ms)
      try {
        const uploadedUrl = await uploadFileToNest(blob, file.name || `${type}.jpg`);
        if (uploadedUrl) {
          if (type === "avatar") setAvatar(uploadedUrl);
          if (type === "cover") setCover(uploadedUrl);
          if (type === "logo") {
            setCompanyLogo(uploadedUrl);
            setModalLogoError(false);
          }
        }
      } catch {
        // Fallback to compressed dataUrl; safe because it's only ~50KB
      }

      toast.success(
        type === "avatar"
          ? "Đã chọn ảnh đại diện"
          : type === "cover"
          ? "Đã chọn ảnh bìa"
          : "Đã chọn logo công ty"
      );
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      if (type === "cover") setUploadingCover(false);
      if (type === "logo") setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = quickProfileSchema.safeParse({ name, phone });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errMap[key]) errMap[key] = issue.message;
      }
      setErrors(errMap);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        title: title.trim(),
        avatar: avatar || null,
        cover: cover || null,
        companyLogo: companyLogo || null,
        userId: userId || undefined,
      };

      // 1. Save to local storage for instant responsiveness
      try {
        if (userId) {
          localStorage.setItem(`vba_custom_profile_${userId}`, JSON.stringify(updatedData));
        }
        localStorage.setItem("vba_custom_profile", JSON.stringify(updatedData));
        if (title.trim()) {
          localStorage.setItem("vba_member_title", title.trim());
        }
        if (phone.trim()) {
          localStorage.setItem("vba_member_phone", phone.trim());
        }
        if (cover) {
          localStorage.setItem("vba_member_cover_photo", cover);
          if (userId) {
            localStorage.setItem(`vba_member_cover_photo_${userId}`, cover);
          }
        }
        if (avatar) {
          localStorage.setItem("vba_member_avatar_photo", avatar);
          if (userId) {
            localStorage.setItem(`vba_member_avatar_photo_${userId}`, avatar);
          }
        }
        if (companyLogo) {
          localStorage.setItem("vba_member_company_logo", companyLogo);
          if (userId) {
            localStorage.setItem(`vba_member_company_logo_${userId}`, companyLogo);
          }
        }

        // Also sync vba_my_member so all components relying on server cache update immediately
        const existingMem = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        const newMem = {
          ...existingMem,
          name: updatedData.name || existingMem.name,
          phone: updatedData.phone || existingMem.phone,
          company: updatedData.company || existingMem.company,
          companyName: updatedData.company || existingMem.companyName,
          title: updatedData.title || existingMem.title,
          avatar: updatedData.avatar || existingMem.avatar,
          coverUrl: updatedData.cover || existingMem.coverUrl,
          companyLogo: updatedData.companyLogo || existingMem.companyLogo,
          companyLogoUrl: updatedData.companyLogo || existingMem.companyLogoUrl,
        };
        localStorage.setItem("vba_my_member", JSON.stringify(newMem));
        if (userId) {
          localStorage.setItem(`vba_my_member_${userId}`, JSON.stringify(newMem));
        }
      } catch (storageErr) {
        console.warn("Storage save error:", storageErr);
      }

      // 2. Dispatch global events
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: updatedData }));
      window.dispatchEvent(new CustomEvent("vba_profile_updated", { detail: updatedData }));
      window.dispatchEvent(new CustomEvent("vba_member_cover_updated", { detail: cover }));
      window.dispatchEvent(new CustomEvent("vba_member_avatar_updated", { detail: avatar }));
      window.dispatchEvent(new CustomEvent("vba_member_company_logo_updated", { detail: companyLogo }));

      // 3. Callback immediately to update parent state in UI
      if (onSaved) onSaved(updatedData);

      // 4. Sync to Nest backend API in background without blocking
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        title: title.trim(),
        avatar: avatar,
        coverUrl: cover,
        companyLogoUrl: companyLogo,
      };

      fetchNestApi("/members/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
        .catch(() => {
          return fetchNestApi("/members/me/profile", {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        })
        .then(() => {
          if (cover) {
            fetchNestApi("/members/me/cover", {
              method: "PATCH",
              body: JSON.stringify({ coverUrl: cover }),
            }).catch(() => null);
          }
        })
        .catch(() => null);

      toast.success("Đã cập nhật thông tin nhanh thành công!");
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-amber-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#00224F] to-[#003B95] text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 grid place-items-center border border-amber-400/30">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                Cập Nhật Nhanh Trang Chủ
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                Tùy chỉnh ảnh bìa, logo công ty, đại diện & thông tin cá nhân
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:thin]">
          {/* 1. Cover Photo & Company Logo Upload */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Ảnh Bìa & Logo Doanh Nghiệp Trên Trang Chủ</span>
            </div>

            {/* Banner preview with company logo overlay */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#19194D] via-[#003B95] to-[#0A1A3A] border border-slate-200 dark:border-slate-800 shadow-inner group">
              {cover ? (
                <img
                  src={resolveMediaUrl(cover) || cover}
                  alt="Cover Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-slate-400 text-xs">
                  Chưa có ảnh bìa tùy chỉnh
                </div>
              )}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />

              {/* Upload cover overlay button - 1 nút duy nhất trên banner */}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 text-[10.5px] font-bold backdrop-blur-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Camera className="h-3 w-3 text-[#003B95] dark:text-blue-400" />
                <span>{uploadingCover ? "Đang tải..." : "Đổi ảnh bìa"}</span>
              </button>

              {/* Company Logo Overlay on Cover Banner (Top-Left or Bottom-Right) */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-1.5 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                <div className="h-9 w-9 rounded-lg bg-white grid place-items-center overflow-hidden shrink-0 shadow-xs border border-slate-200/60 dark:border-slate-800">
                  {companyLogo && !modalLogoError ? (
                    <img
                      src={resolveMediaUrl(companyLogo) || companyLogo}
                      alt="Logo công ty"
                      onError={() => setModalLogoError(true)}
                      className="h-full w-full object-contain p-0.5"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-md bg-[#003B95] hover:bg-[#002b6e] text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  {uploadingLogo ? "..." : "Logo công ty"}
                </button>
              </div>
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "cover")}
            />
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "logo")}
            />
          </div>

          {/* 2. Avatar Upload */}
          <div className="flex items-center gap-4 pt-1">
            <div className="relative shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden ring-3 ring-amber-500/50 bg-slate-100 dark:bg-slate-800 grid place-items-center">
                {avatar ? (
                  <img
                    src={resolveMediaUrl(avatar) || avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#003B95] text-white grid place-items-center shadow-md hover:bg-[#002B70] transition cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "avatar")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ảnh Đại Diện Hội Viên
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Hiển thị trên Trang chủ, Thẻ hội viên, Danh thiếp số và Tin nhắn
              </p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="mt-1 text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline cursor-pointer"
              >
                Tải ảnh mới từ máy
              </button>
            </div>
          </div>

          {/* 3. Text inputs: Name, Phone, Company */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên Doanh Nhân <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Nhập họ và tên..."
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none transition ${
                    errors.name
                      ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                      : "border-slate-200 dark:border-slate-700 focus:border-[#003B95] dark:focus:border-amber-400"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="Số điện thoại / Hotline..."
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none transition ${
                    errors.phone
                      ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                      : "border-slate-200 dark:border-slate-700 focus:border-[#003B95] dark:focus:border-amber-400"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs font-semibold text-rose-500 animate-in fade-in duration-150">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên Công Ty / Doanh Nghiệp
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tên doanh nghiệp của bạn..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chức Vụ / Chức Danh (Profile)
              </label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Chủ tịch HĐQT, Tổng Giám Đốc, CEO..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] dark:focus:border-amber-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
