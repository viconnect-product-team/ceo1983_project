import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Calendar,
  Users,
  Image as ImageIcon,
  Upload,
  Check,
  Sparkles,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  MapPin,
  Ticket,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bell,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { fetchNestApi, uploadFileToNest } from "@/lib/api-client";
import {
  getEventAttendeesPreviewFn,
  sendEventAttendeeReminderFn,
} from "@/lib/notifications.functions";
import { EventPosterStudioModal } from "./EventPosterStudioModal";

interface EventReminderPosterModalProps {
  open: boolean;
  onClose: () => void;
  initialEventId?: string;
  onSuccess?: () => void;
}

export function EventReminderPosterModal({
  open,
  onClose,
  initialEventId,
  onSuccess,
}: EventReminderPosterModalProps) {
  const getPreviewFn = useServerFn(getEventAttendeesPreviewFn);
  const sendReminderFn = useServerFn(sendEventAttendeeReminderFn);

  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);

  // Form state
  const [targetFilter, setTargetFilter] = useState<"all_registered" | "confirmed_only">("all_registered");
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showAttendeesList, setShowAttendeesList] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [previewPosterFull, setPreviewPosterFull] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load active events list when modal opens
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingEvents(true);

    fetchNestApi<any[]>("/events")
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        setEventsList(list);

        // Auto select first event if none selected
        if (!selectedEventId && list.length > 0) {
          const firstEv = initialEventId || list[0].id;
          setSelectedEventId(firstEv);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingEvents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, initialEventId]);

  useEffect(() => {
    if (initialEventId) {
      setSelectedEventId(initialEventId);
    }
  }, [initialEventId]);

  // 2. Load attendee preview and default poster whenever selected event changes
  useEffect(() => {
    if (!open || !selectedEventId) return;
    let isMounted = true;
    setLoadingPreview(true);

    getPreviewFn({ data: { eventId: selectedEventId } })
      .then((res: any) => {
        if (!isMounted) return;
        if (res?.event) {
          setEventData(res.event);
          setAttendees(res.attendees || []);
          setTotalCount(res.totalCount || 0);
          setConfirmedCount(res.confirmedCount || 0);

          // Populate poster from event if current poster is empty
          if (res.event.posterUrl || res.event.bannerUrl) {
            setPosterUrl(res.event.posterUrl || res.event.bannerUrl);
          }

          // Generate default title & body if empty
          const evName = res.event.name || "Sự kiện CEO 1983";
          const dStr = res.event.date
            ? new Date(res.event.date).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sắp diễn ra";

          setTitle(`[NHẮC LỊCH SỰ KIỆN] ${evName}`);
          setBody(
            `Kính chúc Anh/Chị một ngày tràn đầy năng lượng!\n\nBan Tổ Chức CLB Doanh Nhân CEO 1983 xin trân trọng nhắc lịch tham dự chương trình "${evName}".\n\n📌 Quý Anh/Chị vui lòng đến đúng giờ để tham gia phiên kết nối giao thương và chuẩn bị mã QR Check-in trên ứng dụng để nhận thẻ đại biểu và tham gia chương trình bốc thăm may mắn!`,
          );
        }
      })
      .catch((err) => {
        console.warn("Failed loading event preview:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, selectedEventId]);

  // 3. Handle Poster Upload
  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP)");
      return;
    }

    setIsUploadingPoster(true);
    try {
      const url = await uploadFileToNest(file, `event_poster_${Date.now()}_${file.name}`);
      if (url) {
        setPosterUrl(url);
        toast.success("Tải lên tấm poster sự kiện thành công!");
      }
    } catch {
      toast.error("Không thể tải lên hình ảnh poster lúc này");
    } finally {
      setIsUploadingPoster(false);
      if (e.target) e.target.value = "";
    }
  };

  // 4. Quick message templates
  const applyTemplate = (type: "24h" | "2h" | "vip") => {
    const evName = eventData?.name || "Sự kiện CEO 1983";
    const loc = eventData?.location || "Trung tâm Hội nghị CEO 1983";

    if (type === "24h") {
      setTitle(`[NHẮC LỊCH 24H] ${evName} - Sẵn sàng tham dự`);
      setBody(
        `Chỉ còn 24 giờ nữa chương trình "${evName}" sẽ chính thức diễn ra!\n\nBan Tổ Chức xin gửi thông tin nhắc nhở:\n• Địa điểm: ${loc}\n• Trang phục (Dress Code): Doanh nhân lịch thiệp (Vest/Áo dài/Thương hiệu CEO 1983).\n• Hãy chuẩn bị sẵn danh thiếp và mở mã QR Check-in trên Mobile App để vào cổng VIP nhanh chóng!`,
      );
    } else if (type === "2h") {
      setTitle(`[KHẨN - NHẮC TRƯỚC 2H] ${evName} - Bàn đón tiếp đã mở`);
      setBody(
        `Bàn đón tiếp đại biểu sự kiện "${evName}" đã chính thức mở cửa tại ${loc}!\n\nKính mời Quý Anh/Chị có mặt sớm để:\n1. Thưởng thức trà tiệc giao lưu Networking trước giờ G.\n2. Quét QR Check-in nhận số may mắn Lucky Draw.\n3. Nhận vị trí bàn tiệc VIP dành riêng cho doanh nghiệp!`,
      );
    } else {
      setTitle(`[ĐẶC QUYỀN VIP & VỊ TRÍ BÀN] ${evName}`);
      setBody(
        `Trân trọng kính gửi Quý Hội viên đã đăng ký thành công chương trình "${evName}".\n\nBan Tổ Chức đã chuẩn bị sẵn sơ đồ vị trí bàn tiệc và hồ sơ giao thương kết nối 1-on-1 theo ngành nghề của Quý Anh/Chị. Chi tiết vị trí ghế ngồi và mã vé đại biểu đã được cập nhật trực tiếp trong tin nhắn này.`,
      );
    }
    toast.info("Đã áp dụng mẫu tin nhắn mẫu!");
  };

  // 5. Submit reminder broadcast
  const handleSendReminder = async () => {
    if (!selectedEventId) {
      toast.error("Vui lòng chọn sự kiện cần bắn tin nhắc!");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tin nhắn nhắc nhở!");
      return;
    }
    if (!body.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn!");
      return;
    }

    const recipientCount = targetFilter === "confirmed_only" ? confirmedCount : totalCount;
    if (recipientCount === 0) {
      toast.error("Sự kiện này chưa có người đăng ký nào phù hợp để gửi tin!");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendReminderFn({
        data: {
          eventId: selectedEventId,
          title: title.trim(),
          body: body.trim(),
          posterUrl: posterUrl.trim() || undefined,
          targetFilter,
        },
      });

      if (res?.ok) {
        toast.success(`Bắn tin nhắc sự kiện kèm poster thành công!`, {
          description: `Đã gửi thông báo và poster tới ${res.recipientCount} hội viên đã đăng ký sự kiện "${res.eventName}".`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Không thể gửi thông báo lúc này.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Đã xảy ra lỗi khi gửi tin nhắn nhắc sự kiện");
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  const filteredAttendees = attendees.filter((a) => {
    if (targetFilter === "confirmed_only") {
      const isConfirmed = a.status === "confirmed" || a.paymentStatus === "paid" || a.paymentStatus === "free";
      if (!isConfirmed) return false;
    }
    if (!attendeeSearch.trim()) return true;
    const q = attendeeSearch.toLowerCase();
    return (
      (a.name || "").toLowerCase().includes(q) ||
      (a.code || "").toLowerCase().includes(q) ||
      (a.company || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q)
    );
  });

  const activeRecipientsCount = targetFilter === "confirmed_only" ? confirmedCount : totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 grid place-items-center border border-amber-400/30">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-foreground">
                  Bắn Tin Nhắc Sự Kiện Kèm Poster Cho Hội Viên
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Targeted Broadcast
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gửi thông báo đẩy và tin nhắn trực tiếp kèm hình ảnh poster tới các hội viên đã đăng ký sự kiện thành công
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-xl grid place-items-center text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* 1. Chọn sự kiện mục tiêu */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Ticket className="size-4 text-amber-500" />
                <span>1. Chọn Sự Kiện Cần Bắn Tin Nhắc</span>
              </label>
              {loadingEvents && <span className="text-[11px] text-muted-foreground animate-pulse">Đang tải sự kiện...</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name || ev.title || "Sự kiện không tên"}
                    </option>
                  ))}
                </select>
              </div>

              {eventData && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80 text-xs">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <Clock className="size-3 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {eventData.date
                          ? new Date(eventData.date).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "Chưa định ngày"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <MapPin className="size-3 text-rose-500 shrink-0" />
                      <span className="truncate">{eventData.location || "Hà Nội"}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs inline-block">
                      {totalCount} Đăng ký
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Đối tượng nhận & Thống kê hội viên */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="size-4 text-amber-500" />
                <span>2. Hội Viên Nhận Tin ({activeRecipientsCount} người)</span>
              </label>

              {/* Bộ lọc người nhận */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetFilter("all_registered")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    targetFilter === "all_registered"
                      ? "bg-amber-500 text-white shadow-xs font-bold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả đăng ký ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFilter("confirmed_only")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    targetFilter === "confirmed_only"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Chỉ người đã xác nhận ({confirmedCount})
                </button>
              </div>
            </div>

            {/* Collapsible Attendee Preview List */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/20">
              <button
                type="button"
                onClick={() => setShowAttendeesList(!showAttendeesList)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-muted/40 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-500" />
                  <span>Danh sách {filteredAttendees.length} đại biểu sẽ nhận được tin nhắn nhắc lịch</span>
                </span>
                {showAttendeesList ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>

              {showAttendeesList && (
                <div className="p-3 border-t border-border space-y-2 max-h-48 overflow-y-auto">
                  <div className="relative">
                    <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      placeholder="Tìm theo tên, công ty, SĐT..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredAttendees.slice(0, 30).map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/70 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-foreground truncate">{att.name}</div>
                          <div className="text-[10.5px] text-muted-foreground truncate">{att.company || "CEO 1983"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-amber-500 font-semibold block">
                            {att.seat || att.ticketCode || "VIP"}
                          </span>
                          <span
                            className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                              att.status === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {att.status === "confirmed" ? "Đã duyệt" : "Chờ duyệt"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredAttendees.length > 30 && (
                    <div className="text-center text-[11px] text-muted-foreground pt-1">
                      ...và còn {filteredAttendees.length - 30} đại biểu khác trong danh sách
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Tải Lên & Xem Trước Poster Sự Kiện */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-4 text-amber-500" />
                <span>3. Tấm Poster Sự Kiện Kèm Theo (Hình Ảnh Đính Kèm)</span>
              </label>
              {posterUrl && (
                <button
                  type="button"
                  onClick={() => setPosterUrl("")}
                  className="text-[11px] text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Controls */}
              <div className="sm:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUploadPoster}
                  />
                  <button
                    type="button"
                    disabled={isUploadingPoster}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="size-3.5" />
                    <span>{isUploadingPoster ? "Đang tải ảnh..." : "Tải Ảnh Từ Máy"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Thiết Kế Thư Mời (Studio)</span>
                  </button>
                  <span className="text-[11px] text-muted-foreground">hoặc dán đường dẫn ảnh:</span>
                </div>

                <input
                  type="text"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://... dán link ảnh poster sự kiện (PNG, JPG)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-400 flex items-start gap-2">
                  <Sparkles className="size-4 shrink-0 text-blue-500 mt-0.5" />
                  <span>
                    Tấm poster này sẽ được đính kèm vào tin nhắn cá nhân của từng hội viên và hiển thị nổi bật trong trung tâm thông báo của Mobile App CEO 1983.
                  </span>
                </div>
              </div>

              {/* Live Poster Preview */}
              <div className="sm:col-span-5 flex flex-col items-center">
                {posterUrl ? (
                  <div className="relative group w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-lg bg-slate-900">
                    <img
                      src={posterUrl}
                      alt="Poster sự kiện"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPosterFull(true)}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition cursor-pointer"
                        title="Xem toàn màn hình"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 inset-x-2 text-center text-[10px] font-bold text-white bg-black/60 rounded px-1 py-0.5 backdrop-blur-xs">
                      Poster đính kèm
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-[200px] aspect-[3/4] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-3 text-muted-foreground hover:border-amber-500/50 hover:bg-muted/20 transition cursor-pointer"
                  >
                    <ImageIcon className="size-8 text-muted-foreground/60 mb-1" />
                    <span className="text-xs font-semibold">Chưa có poster</span>
                    <span className="text-[10px] mt-0.5">Bấm để tải ảnh lên</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Soạn Nội Dung Tin Nhắn Nhắc Nhở */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="size-4 text-amber-500" />
                <span>4. Nội Dung Tin Nhắn Nhắc Lịch</span>
              </label>

              {/* Mẫu soạn sẵn 1 chạm */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground">Mẫu nhanh:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate("24h")}
                  className="px-2 py-0.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-[11px] font-semibold text-foreground transition cursor-pointer"
                >
                  ⏰ Nhắc trước 24H
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("2h")}
                  className="px-2 py-0.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-[11px] font-semibold text-foreground transition cursor-pointer"
                >
                  ⚡ Nhắc trước 2H &amp; QR
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("vip")}
                  className="px-2 py-0.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-[11px] font-semibold text-foreground transition cursor-pointer"
                >
                  👑 Vị trí VIP
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tiêu đề thông báo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: [NHẮC LỊCH SỰ KIỆN] Gala Doanh Nhân CEO 1983"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Nội dung chi tiết lời nhắc</label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Nhập nội dung nhắc nhở ngày giờ, địa điểm, lưu ý trang phục, đón tiếp..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-normal leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Bell className="size-4 text-emerald-500" />
            <span>
              Sẽ gửi đến: <strong className="text-foreground">{activeRecipientsCount} hội viên</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSending || activeRecipientsCount === 0}
              onClick={handleSendReminder}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="size-3.5" />
              <span>{isSending ? "Đang bắn tin nhắc..." : `BẮN TIN NHẮC KÈM POSTER (${activeRecipientsCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Poster Fullscreen Viewer Modal */}
      {previewPosterFull && posterUrl && (
        <div
          onClick={() => setPreviewPosterFull(false)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[90vh]">
            <img src={posterUrl} alt="Poster sự kiện lớn" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            <button
              type="button"
              onClick={() => setPreviewPosterFull(false)}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-white text-black grid place-items-center shadow-lg"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Poster Studio Modal */}
      <EventPosterStudioModal
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        event={eventData}
        onSavePoster={(url) => setPosterUrl(url)}
        onBroadcastReminder={(url) => setPosterUrl(url)}
      />
    </div>
  );
}
