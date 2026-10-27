import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Handshake,
  Users,
  Search,
  Upload,
  Video,
  MapPin,
  Phone,
  Sparkles,
  Link as LinkIcon,
  Check,
  ChevronDown,
  Building2,
  Trash2,
  ExternalLink,
  Loader2,
  FileVideo,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi, resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { listMembers, listMyOpportunities, type DirectoryMember, type MyOpportunity } from "@/lib/member-app.functions";

export interface CreateConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedMember?: DirectoryMember | null;
  onCreated?: (newConn: any) => void;
}

export function CreateConnectionModal({
  isOpen,
  onClose,
  preSelectedMember,
  onCreated,
}: CreateConnectionModalProps) {
  const { user } = useAuth();

  // 1. Người tạo kết nối (Current User)
  const creatorName = user?.name || (user as any)?.user_metadata?.full_name || "Tôi (Doanh nhân CEO 1983)";
  const creatorCompany = (user as any)?.company || (user as any)?.user_metadata?.company || "Doanh nghiệp CLB CEO 1983";
  const creatorPhone = (user as any)?.phone || user?.phone || "";
  const creatorAvatar = (user as any)?.avatar || (user as any)?.avatarUrl || "/ceo1983-emblem-8.png";

  // 2. Người muốn kết nối (Partner Selection)
  const [membersList, setMembersList] = useState<DirectoryMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<DirectoryMember | null>(preSelectedMember || null);

  // 3. Tiêu đề kết nối & Gắn liền với cơ hội
  const [title, setTitle] = useState("");
  const [isLinkedToOpportunity, setIsLinkedToOpportunity] = useState(false);
  const [opportunitiesList, setOpportunitiesList] = useState<MyOpportunity[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MyOpportunity | null>(null);

  // 4. Upload ảnh / video (Tối đa 5 files)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<{ url: string; file?: File; type: "image" | "video"; name: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // 5. Hình thức: Online vs Offline
  const [venueType, setVenueType] = useState<"online" | "offline">("online");
  const [onlineMeetingLink, setOnlineMeetingLink] = useState("");
  const [offlineAddress, setOfflineAddress] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:30");

  // 6. Số điện thoại & Zalo
  const [phone, setPhone] = useState(creatorPhone);
  const [submitting, setSubmitting] = useState(false);

  // Sync pre-selected member
  useEffect(() => {
    if (preSelectedMember) {
      setSelectedPartner(preSelectedMember);
      if (preSelectedMember.phone && !phone) {
        setPhone(preSelectedMember.phone);
      }
    }
  }, [preSelectedMember]);

  // Load members for connection dropdown
  useEffect(() => {
    if (isOpen) {
      setLoadingMembers(true);
      listMembers()
        .then((items) => {
          if (Array.isArray(items)) {
            // Loại bỏ chính mình khỏi danh sách
            const filtered = items.filter((m) => {
              if (m.userId && user?.id && m.userId === user.id) return false;
              if (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase()) return false;
              return true;
            });
            setMembersList(filtered);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMembers(false));
    }
  }, [isOpen, user]);

  // Load opportunities if linked
  useEffect(() => {
    if (isLinkedToOpportunity && opportunitiesList.length === 0) {
      setLoadingOpps(true);
      listMyOpportunities()
        .then((items) => {
          if (Array.isArray(items)) {
            setOpportunitiesList(items);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOpps(false));
    }
  }, [isLinkedToOpportunity, opportunitiesList.length]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!partnerSearch.trim()) return membersList.slice(0, 10);
    const q = partnerSearch.toLowerCase();
    return membersList.filter((m) => {
      const name = (m.contact || m.personName || m.name || "").toLowerCase();
      const comp = (m.name || m.companyName || "").toLowerCase();
      const code = (m.code || "").toLowerCase();
      return name.includes(q) || comp.includes(q) || code.includes(q);
    }).slice(0, 15);
  }, [membersList, partnerSearch]);

  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  // Handle media selection (up to 5 files)
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - mediaFiles.length;
    if (remainingSlots <= 0) {
      toast.warning("Bạn chỉ có thể tải lên tối đa 5 ảnh hoặc video");
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const newMediaItems = filesToAdd.map((file) => {
      const isVideo = file.type.startsWith("video/");
      return {
        url: URL.createObjectURL(file),
        file,
        type: (isVideo ? "video" : "image") as "image" | "video",
        name: file.name,
      };
    });

    setMediaFiles((prev) => [...prev, ...newMediaItems]);
    if (e.target) e.target.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Google Maps GPS Geolocation helper
  const handleGetLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      toast.info("Đang lấy tọa độ vị trí hiện tại...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          setOfflineAddress(`Vị trí định vị GPS (${lat}, ${lng}) - Tòa nhà CEO 1983`);
          toast.success("Đã cập nhật vị trí GPS thành công!");
        },
        () => {
          setOfflineAddress("Tòa nhà CEO 1983 Tower, Cầu Giấy, Hà Nội");
          toast.success("Đã chọn vị trí Trụ sở CLB CEO 1983!");
        },
        { timeout: 6000 }
      );
    } else {
      setOfflineAddress("Tòa nhà CEO 1983 Tower, Cầu Giấy, Hà Nội");
      toast.info("Đã điền địa chỉ mặc định trụ sở CLB CEO 1983");
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartner) {
      toast.error("Vui lòng chọn người muốn kết nối!");
      return;
    }

    const finalTitle = title.trim() || (selectedOpportunity ? `Kết nối hợp tác: ${selectedOpportunity.title}` : `Gặp gỡ kết nối B2B với ${selectedPartner.contact || selectedPartner.name}`);

    setSubmitting(true);
    try {
      // 1. Upload files nếu có
      const uploadedMediaUrls: string[] = [];
      for (const item of mediaFiles) {
        if (item.file) {
          try {
            const url = await uploadFileToNest(item.file, "connect_media");
            if (url) uploadedMediaUrls.push(url);
          } catch {
            uploadedMediaUrls.push(item.url);
          }
        } else {
          uploadedMediaUrls.push(item.url);
        }
      }

      // 2. Tạo đối tượng cuộc hẹn kết nối
      const newAppointment = {
        id: `meet-${Date.now()}`,
        title: finalTitle,
        hostName: creatorName,
        hostCompany: creatorCompany,
        hostPhone: creatorPhone,
        hostAvatar: creatorAvatar,
        partnerName: selectedPartner.contact || selectedPartner.name,
        partnerCompany: selectedPartner.name || selectedPartner.companyName || "Doanh nghiệp CLB",
        partnerPhone: phone || selectedPartner.phone || "",
        partnerCode: selectedPartner.code || "",
        partnerAvatar: selectedPartner.avatar || null,
        date,
        time,
        venueType,
        venue: venueType === "offline" ? (offlineAddress || "Starbucks Coffee - Tòa Keangnam Landmark 72, Hà Nội") : "Phòng họp trực tuyến",
        onlineUrl: venueType === "online" ? (onlineMeetingLink.trim() || `https://meet.jit.si/CEO1983_B2B_${Date.now()}`) : undefined,
        notes: isLinkedToOpportunity && selectedOpportunity ? `Cơ hội liên kết: ${selectedOpportunity.title}` : "",
        mediaUrls: uploadedMediaUrls,
        status: "confirmed",
        isUserHost: true,
        createdAt: new Date().toISOString(),
      };

      // 3. Gọi API NestJS
      await fetchNestApi("/meetings/connection-appointments", {
        method: "POST",
        body: JSON.stringify(newAppointment),
      }).catch(() => null);

      // Lưu cục bộ phòng fallback
      try {
        const stored = localStorage.getItem("vba_connection_appointments");
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem("vba_connection_appointments", JSON.stringify([newAppointment, ...list]));
        window.dispatchEvent(new Event("vba.meeting.changed"));
      } catch {}

      toast.success("Đã tạo lời mời kết nối B2B thành công!");
      if (onCreated) onCreated(newAppointment);
      onClose();
    } catch {
      toast.error("Không thể hoàn tất tạo kết nối lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[440px] max-h-[92dvh] rounded-3xl bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-amber-500/30 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-amber-50/20 dark:from-slate-900 dark:via-[#0B132B] dark:to-amber-950/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#003B95] text-amber-300 shadow-xs">
              <Handshake className="size-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                TẠO KẾT NỐI B2B
              </h2>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Gặp gỡ 1-on-1 &amp; Xúc tiến thương mại CLB CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 text-xs [scrollbar-width:none]">
          {/* 1. NGƯỜI TẠO KẾT NỐI (Current User Card) */}
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#003B95] dark:text-blue-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="size-3.5" />
                <span>Người tạo kết nối</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] bg-[#003B95] text-white font-extrabold">
                BẠN
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="size-9 rounded-full object-cover border border-blue-300 dark:border-blue-700 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                  {creatorName}
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  {creatorCompany}
                </p>
              </div>
            </div>
          </div>

          {/* 2. NGƯỜI MUỐN KẾT NỐI (CALL API HỘI VIÊN BẠN BÈ) */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Hội viên muốn kết nối <span className="text-red-500">*</span></span>
              {selectedPartner && (
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Chọn người khác
                </button>
              )}
            </label>

            {selectedPartner ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedPartner.avatar ? resolveMediaUrl(selectedPartner.avatar) || selectedPartner.avatar : "/ceo1983-emblem-8.png"}
                    alt={selectedPartner.contact || selectedPartner.name}
                    className="size-9 rounded-full object-cover border border-amber-400/60 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                    }}
                  />
                  <div className="min-w-0">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate">
                      {selectedPartner.contact || selectedPartner.name}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">
                      {selectedPartner.name || selectedPartner.companyName || "Doanh nghiệp CLB"}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9.5px] shrink-0">
                  ✓ Đã chọn
                </span>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:border-[#003B95] dark:focus-within:border-amber-400">
                  <Search className="size-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={(e) => {
                      setPartnerSearch(e.target.value);
                      setPartnerDropdownOpen(true);
                    }}
                    onFocus={() => setPartnerDropdownOpen(true)}
                    placeholder="Tìm tên hoặc công ty hội viên..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden"
                  />
                  {loadingMembers && <Loader2 className="size-3.5 text-amber-500 animate-spin shrink-0" />}
                </div>

                {partnerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 space-y-1">
                    {filteredMembers.length === 0 ? (
                      <p className="p-3 text-center text-slate-400 text-[11px]">
                        Không tìm thấy hội viên phù hợp
                      </p>
                    ) : (
                      filteredMembers.map((m) => (
                        <div
                          key={(m as any).id || m.code}
                          onClick={() => {
                            setSelectedPartner(m);
                            setPartnerDropdownOpen(false);
                            if (m.phone && !phone) setPhone(m.phone);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                        >
                          <img
                            src={m.avatar ? resolveMediaUrl(m.avatar) || m.avatar : "/ceo1983-emblem-8.png"}
                            alt={m.contact || m.name}
                            className="size-7 rounded-full object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/ceo1983-emblem-8.png";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                              {m.contact || m.personName || m.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {m.name || m.companyName}
                            </span>
                          </div>
                          {m.code && (
                            <span className="text-[9.5px] font-mono text-amber-600 dark:text-amber-400 shrink-0">
                              {m.code}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. TIÊU ĐỀ KẾT NỐI (TỰ NHẬP HOẶC GẮN VỚI CƠ HỘI) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Tiêu đề kết nối <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLinkedToOpportunity}
                  onChange={(e) => {
                    setIsLinkedToOpportunity(e.target.checked);
                    if (!e.target.checked) setSelectedOpportunity(null);
                  }}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Gắn với cơ hội B2B</span>
              </label>
            </div>

            {isLinkedToOpportunity && (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <span className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 block">
                  Chọn cơ hội kinh doanh để tự động điền tiêu đề:
                </span>
                {loadingOpps ? (
                  <div className="flex items-center gap-2 text-slate-400 py-1">
                    <Loader2 className="size-3.5 animate-spin text-amber-500" />
                    <span>Đang nạp danh sách cơ hội...</span>
                  </div>
                ) : (
                  <select
                    value={selectedOpportunity?.id || ""}
                    onChange={(e) => {
                      const opp = opportunitiesList.find((o) => o.id === e.target.value);
                      if (opp) {
                        setSelectedOpportunity(opp);
                        setTitle(`Hợp tác cơ hội: ${opp.title}`);
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">-- Chọn một cơ hội kinh doanh --</option>
                    {opportunitiesList.map((opp) => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title} ({opp.value || "Thương lượng"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trao đổi hợp tác phân phối độc quyền quý 4/2026..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#003B95] dark:focus:border-amber-400 outline-hidden"
              required
            />
          </div>

          {/* 4. UPLOAD ẢNH / VIDEO (TỐI ĐA 5 FILES) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Ảnh / Video tài liệu ({mediaFiles.length}/5)
              </label>
              <span className="text-[10px] text-slate-400">Tối đa 5 file ảnh hoặc video</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              multiple
              onChange={handleSelectFiles}
              className="hidden"
            />

            {/* Thumbnail Preview Grid */}
            <div className="grid grid-cols-5 gap-2">
              {mediaFiles.map((m, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-amber-500/30 group">
                  {m.type === "video" ? (
                    <div className="size-full flex flex-col items-center justify-center bg-slate-900 text-amber-400 p-1">
                      <FileVideo className="size-5" />
                      <span className="text-[8px] text-white truncate max-w-full">Video</span>
                    </div>
                  ) : (
                    <img src={m.url} alt="upload" className="size-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {mediaFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition cursor-pointer bg-slate-50 dark:bg-slate-800/40"
                  title="Thêm ảnh hoặc video"
                >
                  <Upload className="size-4 mb-0.5" />
                  <span className="text-[9px] font-bold">+ Thêm</span>
                </button>
              )}
            </div>
          </div>

          {/* 5. HÌNH THỨC KẾT NỐI: ONLINE vs OFFLINE */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="uppercase text-slate-700 dark:text-slate-200">Hình thức gặp gỡ</span>
              <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setVenueType("online")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    venueType === "online"
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-white"
                  }`}
                >
                  Trực tuyến (Online)
                </button>
                <button
                  type="button"
                  onClick={() => setVenueType("offline")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    venueType === "offline"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-white"
                  }`}
                >
                  Gặp trực tiếp (Offline)
                </button>
              </div>
            </div>

            {/* If ONLINE: Dán link Zoom hoặc Uiwork */}
            {venueType === "online" ? (
              <div className="space-y-1 pt-1">
                <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Video className="size-3.5 text-[#003B95] dark:text-blue-400" />
                  <span>Dán link phòng họp Zoom, Uiwork hoặc Google Meet:</span>
                </label>
                <div className="flex items-center px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-[#003B95] dark:focus-within:border-amber-400">
                  <LinkIcon className="size-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="url"
                    value={onlineMeetingLink}
                    onChange={(e) => setOnlineMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/... hoặc https://meet.uiwork.vn/..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden font-mono"
                  />
                </div>
              </div>
            ) : (
              /* If OFFLINE: Trường địa chỉ tự nhập + nút chọn theo định vị Google Maps */
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="size-3.5 text-red-500" />
                    <span>Địa chỉ hẹn gặp trực tiếp:</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Định vị Google Map</span>
                    <ExternalLink className="size-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={offlineAddress}
                  onChange={(e) => setOfflineAddress(e.target.value)}
                  placeholder="VD: Tòa Keangnam Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-amber-400 outline-hidden"
                />
              </div>
            )}

            {/* Ngày và Giờ */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ngày gặp</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 6. SỐ ĐIỆN THOẠI & LINK ZALO */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Số điện thoại liên hệ</span>
              {cleanPhone && (
                <a
                  href={`https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0068FF] hover:underline"
                >
                  <span className="size-3.5 rounded-full bg-[#0068FF] text-white text-[8px] font-black grid place-items-center">Z</span>
                  <span>Mở Zalo trực tiếp</span>
                  <ExternalLink className="size-2.5" />
                </a>
              )}
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:border-[#003B95] dark:focus-within:border-amber-400">
              <Phone className="size-4 text-emerald-600 mr-2 shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden font-mono font-bold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-[#003B95] via-[#002B70] to-[#001D4A] hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Handshake className="size-4 text-amber-300" />
                  <span>Xác nhận kết nối</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
