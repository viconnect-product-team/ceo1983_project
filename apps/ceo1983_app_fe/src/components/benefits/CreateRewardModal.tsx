import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Trophy,
  Upload,
  Trash2,
  Search,
  Check,
  Crown,
  Users,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Building2,
  Medal,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";

export interface MemberOption {
  id: string;
  code?: string;
  name: string;
  company?: string;
  role?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

interface CreateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateRewardModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRewardModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [awardCategory, setAwardCategory] = useState("HONOR");
  const [rewardValue, setRewardValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    members?: string;
    images?: string;
  }>({});

  // Members list & search
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Nạp danh sách hội viên thực tế từ API /members
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const res = await fetchNestApi<any[]>("/members");
        if (isMounted && Array.isArray(res)) {
          setMembers(
            res.map((m: any) => ({
              id: m.id || m.code || m.user_id,
              code: m.code || m.id,
              name: m.contact || m.name || "Hội viên CEO 1983",
              company: m.company_name || m.company || "CLB Doanh Nhân CEO 1983",
              role: m.executive_role || m.role || "Hội viên chính thức",
              department: m.department || "Ban Hội Viên",
              avatar: m.avatar_url || m.avatar || "/ceo1983-emblem-8.png",
              phone: m.phone || "",
              email: m.email || "",
            }))
          );
        }
      } catch (err) {
        console.warn("Failed to load members for reward modal:", err);
      } finally {
        if (isMounted) setLoadingMembers(false);
      }
    }
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Lọc danh sách hội viên theo tìm kiếm
  const filteredMembers = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.company && m.company.toLowerCase().includes(q)) ||
        (m.department && m.department.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q))
    );
  }, [members, memberSearchQuery]);

  // Danh sách hội viên đã chọn
  const selectedMembers = useMemo(() => {
    return members.filter((m) => selectedMemberIds.includes(m.id));
  }, [members, selectedMemberIds]);

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
    if (errors.members) {
      setErrors((prev) => ({ ...prev, members: undefined }));
    }
  };

  const selectAllFiltered = () => {
    const ids = filteredMembers.map((m) => m.id);
    setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...ids])));
    if (errors.members) {
      setErrors((prev) => ({ ...prev, members: undefined }));
    }
  };

  const deselectAll = () => {
    setSelectedMemberIds([]);
  };

  // Xử lý upload ảnh (tối đa 5 ảnh)
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Chỉ được phép đăng tối đa 5 ảnh cho mỗi khen thưởng!");
      return;
    }

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (images.length + newUrls.length >= 5) break;

        // Thử upload qua NestJS backend endpoint
        try {
          const res = await uploadFileToNest(file);
          if (res?.url) {
            newUrls.push(res.url);
            continue;
          }
        } catch {
          // Fallback sang FileReader Base64
        }

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(dataUrl);
      }

      setImages((prev) => [...prev, ...newUrls].slice(0, 5));
      toast.success(`Đã thêm ${newUrls.length} ảnh vào hồ sơ khen thưởng!`);
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      title?: string;
      description?: string;
      members?: string;
      images?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề khen thưởng là bắt buộc (Required)";
    }
    if (!description.trim()) {
      newErrors.description = "Mô tả khen thưởng là bắt buộc (Required)";
    }
    if (selectedMemberIds.length === 0) {
      newErrors.members = "Vui lòng chọn ít nhất 1 người được khen thưởng (Multiselect)";
    }
    if (images.length > 5) {
      newErrors.images = "Tối đa chỉ được đăng 5 ảnh";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    try {
      const awardedNames = selectedMembers.map((m) => m.name).join(", ");
      const awardedCompanies = selectedMembers
        .map((m) => `${m.name} (${m.company || "Doanh nghiệp CLB"})`)
        .join("\n- ");

      const postContent = `${description.trim()}\n\n🏆 Danh sách doanh nhân được vinh danh khen thưởng:\n- ${awardedCompanies}${
        rewardValue ? `\n\n🎁 Phần thưởng / Quyền lợi: ${rewardValue}` : ""
      }`;

      // 1. Đăng bài viết vinh danh lên Feed Mobile (Bảng tin mạng lưới)
      await fetchNestApi("/feed", {
        method: "POST",
        body: JSON.stringify({
          title: `🏆 VINH DANH & KHEN THƯỞNG: ${title.trim()}`,
          content: postContent,
          category: "HONOR",
          department: "Ban Thi Đua Khen Thưởng",
          images: images.slice(0, 5),
        }),
      }).catch((err) => console.warn("Failed to post to feed:", err));

      // 2. Ghi nhận audit log hệ thống
      await fetchNestApi("/admin/audit-logs", {
        method: "POST",
        body: JSON.stringify({
          action: "create_reward_honors",
          targetType: "award",
          targetId: `AWD-${Date.now()}`,
          details: `Tạo khen thưởng: "${title.trim()}" cho ${selectedMembers.length} hội viên: ${awardedNames}`,
          metadata: {
            title: title.trim(),
            description: description.trim(),
            awardedMembers: selectedMembers.map((m) => ({
              id: m.id,
              name: m.name,
              company: m.company,
            })),
            imagesCount: images.length,
            rewardValue,
          },
        }),
      }).catch(() => {});

      // 3. Gửi thông báo tới từng hội viên được khen thưởng
      for (const m of selectedMembers) {
        if (m.id) {
          await fetchNestApi("/admin/notifications", {
            method: "POST",
            body: JSON.stringify({
              title: `Chúc mừng CEO ${m.name} được vinh danh khen thưởng!`,
              body: `Ban Chấp Hành CLB CEO 1983 trân trọng vinh danh bạn trong đợt khen thưởng: "${title.trim()}". Bấm để xem chi tiết!`,
              targetRoute: "/association/messages?tab=feed",
              recipientId: m.id,
              audience: "members",
            }),
          }).catch(() => {});
        }
      }

      toast.success(
        `✓ Đã tạo khen thưởng "${title.trim()}" thành công cho ${selectedMembers.length} hội viên!`
      );

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedMemberIds([]);
      setImages([]);
      setRewardValue("");
      setErrors({});

      onSuccess?.();
      onClose();
      window.dispatchEvent(new CustomEvent("benefits-updated"));
      window.dispatchEvent(new CustomEvent("feed-refresh"));
    } catch (err: any) {
      console.error("Create reward error:", err);
      toast.error("Không thể tạo khen thưởng lúc này. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
              <Trophy className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Tạo Khen Thưởng &amp; Vinh Danh Hội Viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ghi nhận thành tích, vinh danh trực tiếp lên bảng tin và cấp quyền lợi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Tiêu đề khen thưởng (REQUIRED) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Tiêu đề khen thưởng</span>
                <span className="text-red-500 font-black">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Bắt buộc</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Ví dụ: Vinh danh Top 10 Doanh Nhân Hoạt Động Xuất Sắc Quý 4/2026"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition ${
                errors.title
                  ? "border-red-500 ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:ring-[#003B95]/30 focus:border-[#003B95]"
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="size-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* 2. Mô tả khen thưởng (REQUIRED) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Mô tả thành tích / Quyết định khen thưởng</span>
                <span className="text-red-500 font-black">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Bắt buộc</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Mô tả lý do khen thưởng, các đóng góp nổi bật về kết nối, giao thương B2B, phát triển hội viên hoặc tài trợ sự kiện..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 transition ${
                errors.description
                  ? "border-red-500 ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:ring-[#003B95]/30 focus:border-[#003B95]"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="size-3" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Giá trị phần thưởng / Quà tặng (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Medal className="size-3.5 text-amber-500" />
                <span>Phần thưởng / Quà tặng đính kèm</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Tùy chọn</span>
            </label>
            <input
              type="text"
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              placeholder="Ví dụ: Kỷ niệm chương mạ vàng + Voucher nghỉ dưỡng 5.000.000 VNĐ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-[#003B95]/30 focus:border-[#003B95]"
            />
          </div>

          {/* 3. Người được khen thưởng (CHỌN MULTISELECT) */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="size-3.5 text-[#003B95] dark:text-amber-400" />
                <span>Người được khen thưởng (Chọn nhiều người - Multiselect)</span>
                <span className="text-red-500 font-black">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Chọn tất cả ({filteredMembers.length})
                </button>
                {selectedMemberIds.length > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-[11px] font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Ô tìm kiếm hội viên */}
            <div className="relative">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Tìm hội viên theo họ tên, doanh nghiệp, ban chuyên môn..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
              />
            </div>

            {/* Pills danh sách hội viên đã chọn */}
            {selectedMembers.length > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
                <span className="text-[10.5px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                  Đã chọn ({selectedMembers.length} người được khen thưởng):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {selectedMembers.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <img
                        src={m.avatar || "/ceo1983-emblem-8.png"}
                        alt={m.name}
                        className="size-4 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/ceo1983-emblem-8.png";
                        }}
                      />
                      <span className="truncate max-w-[140px]">{m.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleMemberSelection(m.id)}
                        className="text-slate-400 hover:text-red-500 rounded-full p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách scrollable để chọn nhiều hội viên */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loadingMembers ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Đang nạp danh sách hội viên...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Không tìm thấy hội viên phù hợp với từ khóa "{memberSearchQuery}"
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedMemberIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMemberSelection(m.id)}
                      className={`px-3 py-2 flex items-center justify-between gap-3 cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "bg-[#003B95] border-[#003B95] text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                        </div>
                        <img
                          src={m.avatar || "/ceo1983-emblem-8.png"}
                          alt={m.name}
                          className="size-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/ceo1983-emblem-8.png";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {m.company} • {m.department}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {m.role}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {errors.members && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="size-3" />
                <span>{errors.members}</span>
              </p>
            )}
          </div>

          {/* 4. Đăng ảnh tối đa 5 ảnh */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-amber-500" />
                <span>Đăng ảnh vinh danh (Tối đa 5 ảnh)</span>
              </label>
              <span
                className={`text-[11px] font-bold ${
                  images.length >= 5
                    ? "text-red-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {images.length}/5 ảnh
              </span>
            </div>

            {/* Grid preview các ảnh đã chọn */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ảnh khen thưởng ${idx + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition cursor-pointer"
                      title="Gỡ ảnh này"
                    >
                      <Trash2 className="size-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1 rounded bg-black/60 text-white text-[9px] font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Nút bấm chọn thêm ảnh nếu chưa đạt 5 ảnh */}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/20 transition cursor-pointer">
                <Upload className="size-5 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {isUploading ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính / thiết bị"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Định dạng PNG, JPG, JPEG (Còn {5 - images.length} ảnh)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading || images.length >= 5}
                  onChange={handleUploadImages}
                  className="hidden"
                />
              </label>
            )}
            {errors.images && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="size-3" />
                <span>{errors.images}</span>
              </p>
            )}
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trophy className="size-4 text-slate-950" />
            <span>
              {isSubmitting ? "Đang tạo & công bố..." : "Xác Nhận Trao Thưởng & Vinh Danh"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

