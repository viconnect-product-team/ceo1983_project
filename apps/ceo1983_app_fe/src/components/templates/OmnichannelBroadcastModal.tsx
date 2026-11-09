import React, { useState } from "react";
import {
  X,
  Send,
  Smartphone,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

export interface OmnichannelBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  invitationData: {
    title: string;
    subtitle?: string;
    posterUrl?: string;
    date?: string;
    time?: string;
    location?: string;
    salutation?: string;
    bodyText?: string;
    templateId?: string;
  };
  onSuccess?: () => void;
}

export function OmnichannelBroadcastModal({
  open,
  onClose,
  invitationData,
  onSuccess,
}: OmnichannelBroadcastModalProps) {
  // Checkbox states for 3 channels (user can pick 1, 2, or all 3)
  const [sendToApp, setSendToApp] = useState<boolean>(true);
  const [sendToZalo, setSendToZalo] = useState<boolean>(true);
  const [sendToEmail, setSendToEmail] = useState<boolean>(true);

  // Target audience selection
  const [targetAudience, setTargetAudience] = useState<
    "all" | "executives" | "department" | "registered"
  >("all");
  const [selectedDept, setSelectedDept] = useState<string>("Ban Xúc Tiến Thương Mại");

  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResults, setSendResults] = useState<{
    app?: boolean;
    zalo?: boolean;
    email?: boolean;
  } | null>(null);

  if (!open) return null;

  const totalChannelsSelected =
    (sendToApp ? 1 : 0) + (sendToZalo ? 1 : 0) + (sendToEmail ? 1 : 0);

  const handleSelectAll = () => {
    setSendToApp(true);
    setSendToZalo(true);
    setSendToEmail(true);
  };

  const handleClearAll = () => {
    setSendToApp(false);
    setSendToZalo(false);
    setSendToEmail(false);
  };

  const handleBroadcast = async () => {
    if (totalChannelsSelected === 0) {
      toast.error("Vui lòng tích chọn ít nhất 1 kênh để gửi thư mời!");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        title: invitationData.title,
        subtitle: invitationData.subtitle,
        posterUrl: invitationData.posterUrl,
        date: invitationData.date,
        time: invitationData.time,
        location: invitationData.location,
        salutation: invitationData.salutation,
        bodyText: invitationData.bodyText,
        templateId: invitationData.templateId,
        channels: {
          sendToApp,
          sendToZalo,
          sendToEmail,
        },
        targetAudience,
        departmentId: targetAudience === "department" ? selectedDept : undefined,
      };

      const res = await fetchNestApi<any>("/admin/invitation-templates/broadcast", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSendResults({
        app: sendToApp,
        zalo: sendToZalo,
        email: sendToEmail,
      });

      const channelNames: string[] = [];
      if (sendToApp) channelNames.push("App Mobile");
      if (sendToZalo) channelNames.push("Zalo OA");
      if (sendToEmail) channelNames.push("Email");

      toast.success(
        `Đã áp dụng và phát thư mời thành công qua ${channelNames.join(", ")}!`
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Broadcast invitation error:", err);
      toast.error(err?.message || "Lỗi khi phát thư mời đa kênh");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-linear-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Sparkles className="size-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Áp Dụng &amp; Gửi Thư Mời Đa Kênh
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  CEO 1983
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lựa chọn 1, 2 hoặc tất cả các kênh truyền thông để gửi thư mời tới Hội viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Card Preview Thư Mời */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-4">
            {invitationData.posterUrl ? (
              <img
                src={invitationData.posterUrl}
                alt="Poster preview"
                className="w-20 h-28 object-cover rounded-lg border border-amber-500/30 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-28 rounded-lg border border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-500 shrink-0 text-center p-1">
                <Layers className="size-6 text-amber-500 mb-1" />
                <span className="text-[9px]">Poster Mẫu</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
                {invitationData.subtitle || "CLB Doanh Nhân CEO 1983 (HanoiBA)"}
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {invitationData.title || "Thư Mời Sự Kiện"}
              </h4>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                {invitationData.date && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="size-3.5 text-amber-400 shrink-0" />
                    <span>{invitationData.date} {invitationData.time ? `(${invitationData.time})` : ""}</span>
                  </div>
                )}
                {invitationData.location && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="size-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{invitationData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KHỐI CHỌN 3 KÊNH GỬI (TÍCH CHỌN 1, 2 HOẶC TẤT CẢ) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>Chọn các kênh gửi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-bold">
                  {totalChannelsSelected}/3 kênh được chọn
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-slate-400 hover:text-slate-300 underline font-medium cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* 3 Checkbox Channels */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* KÊNH 1: GỬI VÀO APP */}
              <label
                className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                  sendToApp
                    ? "border-blue-500/80 bg-blue-950/30 ring-1 ring-blue-500/40"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={sendToApp}
                    onChange={(e) => setSendToApp(e.target.checked)}
                    className="size-4.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                      <Smartphone className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-100">
                      1. Gửi vào App Mobile CEO 1983
                    </span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                      In-App &amp; Feed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-6">
                    Bắn thông báo Push Notification tới thiết bị Hội viên &amp; tự động tạo bài viết phát thanh kèm poster lên Bảng tin Mạng lưới Hội viên.
                  </p>
                </div>
              </label>

              {/* KÊNH 2: GỬI VÀO ZALO OA */}
              <label
                className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                  sendToZalo
                    ? "border-cyan-500/80 bg-cyan-950/30 ring-1 ring-cyan-500/40"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={sendToZalo}
                    onChange={(e) => setSendToZalo(e.target.checked)}
                    className="size-4.5 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                      <MessageSquare className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-100">
                      2. Gửi vào Zalo Official Account (Zalo OA / ZNS)
                    </span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                      Zalo ZNS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-6">
                    Gửi tin nhắn Zalo OA trực tiếp tới SĐT / Zalo UID của Hội viên kèm link mở vé tham dự và xác nhận check-in.
                  </p>
                </div>
              </label>

              {/* KÊNH 3: GỬI VÀO EMAIL */}
              <label
                className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                  sendToEmail
                    ? "border-amber-500/80 bg-amber-950/30 ring-1 ring-amber-500/40"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={sendToEmail}
                    onChange={(e) => setSendToEmail(e.target.checked)}
                    className="size-4.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                      <Mail className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-100">
                      3. Gửi vào Email Doanh Nghiệp
                    </span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                      HTML Email
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-6">
                    Gửi thư điện tử trang trọng chuẩn HTML gắn kèm Poster độ phân giải cao và thông tin thời gian, địa điểm, mã QR tham dự.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ĐỐI TƯỢNG NHẬN THƯ */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5 text-amber-400" />
              <span>Đối tượng nhận thư mời</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetAudience("all")}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                  targetAudience === "all"
                    ? "border-amber-500 bg-amber-950/30 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold">Toàn bộ Hội viên CLB</div>
                <div className="text-[10px] text-slate-400">Tất cả hội viên chính thức</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience("executives")}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                  targetAudience === "executives"
                    ? "border-amber-500 bg-amber-950/30 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold">Ban Điều Hành &amp; Trưởng Ban</div>
                <div className="text-[10px] text-slate-400">Lãnh đạo &amp; Thường trực CLB</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience("department")}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                  targetAudience === "department"
                    ? "border-amber-500 bg-amber-950/30 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold">Theo Ban Chuyên Môn</div>
                <div className="text-[10px] text-slate-400">Chỉ gửi cho 1 ban chuyên môn</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience("registered")}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                  targetAudience === "registered"
                    ? "border-amber-500 bg-amber-950/30 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold">Hội viên Đã Đăng Ký</div>
                <div className="text-[10px] text-slate-400">Gửi nhắc hẹn &amp; xác nhận</div>
              </button>
            </div>

            {targetAudience === "department" && (
              <div className="mt-2">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Ban Xúc Tiến Thương Mại">Ban Xúc Tiến Thương Mại</option>
                  <option value="Ban Thành Viên">Ban Thành Viên</option>
                  <option value="Ban Truyền Thông">Ban Truyền Thông</option>
                  <option value="Ban Tài Chính & Tài Trợ">Ban Tài Chính &amp; Tài Trợ</option>
                  <option value="Ban Thiện Nguyện & Cộng Đồng">Ban Thiện Nguyện &amp; Cộng Đồng</option>
                  <option value="Ban Sự Kiện">Ban Sự Kiện</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            {totalChannelsSelected === 0 ? (
              <span className="text-rose-400">Chưa chọn kênh gửi nào</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="size-3.5" /> Sẵn sàng phát tới {totalChannelsSelected} kênh
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isSending || totalChannelsSelected === 0}
              onClick={handleBroadcast}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition shadow-lg cursor-pointer ${
                isSending || totalChannelsSelected === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 hover:brightness-110 shadow-amber-500/20"
              }`}
            >
              <Send className="size-3.5" />
              <span>{isSending ? "Đang phát thư mời..." : "Áp Dụng & Gửi Ngay"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

