import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  Layers,
  Smartphone,
  Check,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Copy,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { MailTemplateManager } from "@/components/documents/MailTemplateManager";
import { ReplyTemplatesEditor } from "@/components/dashboard/ReplyTemplatesEditor";
import { getNestApiUrl, getAuthToken } from "@/lib/api-client";

export function OmnichannelTemplatesSection() {
  const [activeSubTab, setActiveSubTab] = useState<"email" | "zalo" | "replies">("email");

  // State phục vụ Bắn Thông Báo Đa Kênh (Email + Zalo OA)
  const [omniChannel, setOmniChannel] = useState<"both" | "email" | "zalo">("both");
  const [targetType, setTargetType] = useState<"unpaid" | "all" | "single">("unpaid");
  const [singlePhone, setSinglePhone] = useState("0973924819");
  const [singleName, setSingleName] = useState("Phạm Văn Vũ");
  const [singleEmail, setSingleEmail] = useState("ceo.member1@ceo1983.com");
  const [selectedTopic, setSelectedTopic] = useState("fee_annual");
  const [isSendingOmni, setIsSendingOmni] = useState(false);

  const getAuthHeaders = () => {
    const token =
      getAuthToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("vibe_token") ||
          localStorage.getItem("access_token")
        : null) ||
      "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleSendOmnichannel = async () => {
    setIsSendingOmni(true);
    const channelLabels = {
      both: "Đa Kênh (Email Mail Server & Zalo OA)",
      email: "Email Mail Server",
      zalo: "Zalo Official Account",
    };

    try {
      // 1. Nếu có kênh Zalo OA:
      if (omniChannel === "both" || omniChannel === "zalo") {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("vba_zalo_access_token") || ""
            : "";
        if (storedToken) {
          try {
            await fetch(getNestApiUrl("/zalo/send-message"), {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                accessToken: storedToken,
                targetPhone: singlePhone,
                targetName: singleName,
                message: `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO ĐA KÊNH]
Kính gửi Hội viên: ${singleName} (SĐT: ${singlePhone})
Hệ thống quản trị CEO 1983 thông báo kỳ hoàn tất hội phí niên liễm thường niên 2026.
💰 Số tiền: 10.000.000 VNĐ.
🏦 MB Bank: 1983000000 - CLB DOANH NHAN CEO 1983
Trân trọng cảm ơn Anh/Chị!`,
              }),
            });
          } catch {
            /* non-blocking */
          }
        }
      }

      // 2. Nếu có kênh Email:
      if (omniChannel === "both" || omniChannel === "email") {
        try {
          await fetch(getNestApiUrl("/mail/send-dynamic"), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              templateCode: "FEE_NOTICE_ANNUAL",
              recipientEmail: singleEmail,
              variables: {
                full_name: singleName,
                member_code: "M1983-088",
                company_name: "Doanh Nghiệp Hội Viên CEO 1983",
                fee_year: "2026",
                fee_amount: "10,000,000",
                due_date: "31/12/2026",
                bank_name: "MB Bank (Ngân hàng TMCP Quân Đội)",
                bank_account: "1983000000",
                bank_owner: "CLB DOANH NHAN CEO 1983",
                transfer_content: "HP1983 M1983-088 " + singlePhone,
              },
            }),
          });
        } catch {
          /* non-blocking */
        }
      }

      toast.success(`🎉 ĐÃ BẮN THÔNG BÁO ĐA KÊNH THÀNH CÔNG!`, {
        description: `Đã gửi qua ${channelLabels[omniChannel]} tới: ${singleName} (${singlePhone} - ${singleEmail})`,
      });
    } catch (err: any) {
      toast.error(`Lỗi gửi đa kênh: ${err.message}`);
    } finally {
      setIsSendingOmni(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER ĐA KÊNH */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl dark:border-blue-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Trung Tâm Mẫu Thông Báo &amp; Phản Hồi Đa Kênh</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Hệ Thống Mẫu Thông Báo Hợp Nhất (Email CRM + Zalo OA)
            </h3>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300">
              Quản lý tập trung toàn diện các mẫu Email HTML Dynamic, mẫu tin nhắn Zalo OA / ZNS chính thức và bộ mẫu phản hồi nhanh cho Hội viên CLB Doanh Nhân CEO 1983.
            </p>
          </div>

          {/* Quick Omnichannel Dispatch Box */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Bắn Thông Báo Nhanh:</span>
              <span className="text-[11px] text-amber-300">{omniChannel.toUpperCase()}</span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-900/80 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setOmniChannel("both")}
                className={`rounded-lg py-1 transition ${
                  omniChannel === "both" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Cả 2 Kênh
              </button>
              <button
                type="button"
                onClick={() => setOmniChannel("email")}
                className={`rounded-lg py-1 transition ${
                  omniChannel === "email" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Chỉ Email
              </button>
              <button
                type="button"
                onClick={() => setOmniChannel("zalo")}
                className={`rounded-lg py-1 transition ${
                  omniChannel === "zalo" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Chỉ Zalo OA
              </button>
            </div>
            <button
              type="button"
              onClick={handleSendOmnichannel}
              disabled={isSendingOmni}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>{isSendingOmni ? "Đang Gửi Đa Kênh..." : "Bắn Thông Báo Thật Ngay"}</span>
            </button>
          </div>
        </div>

        {/* 3 SUB-TABS CHÍNH */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab("email")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === "email"
                ? "bg-white text-slate-950 shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <Mail className="size-4" />
            <span>1. Mẫu Template Email CRM (Dynamic Visual)</span>
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-900">
              5 Mẫu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("zalo")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === "zalo"
                ? "bg-emerald-400 text-slate-950 shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <MessageSquare className="size-4" />
            <span>2. Mẫu Tin Nhắn Zalo OA (ZNS Dynamic)</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-900">
              4 Mẫu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("replies")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === "replies"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <MessageCircle className="size-4" />
            <span>3. Mẫu Phản Hồi Nhanh (Quick Replies)</span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG TỪNG SUB-TAB */}
      {activeSubTab === "email" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Mail className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Quản Lý Mẫu Template Email CRM (Chuyển Giao Từ Chức Năng Tài Liệu Vào Cấu Hình Hệ Thống)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Hỗ trợ Visual Block Designer, Iframe Preview &amp; Gửi Thật
            </span>
          </div>
          <MailTemplateManager />
        </div>
      )}

      {activeSubTab === "zalo" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Danh Mục 4 Mẫu Tin Nhắn Zalo OA Đã Được Cấp Quyền Kèm Biến Động</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                OA ID: 437444346010531505 (CLB CEO 1983)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Hội phí niên liễm */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 uppercase">
                  Tài Chính &amp; Hội Phí
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Đang kích hoạt</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Thông Báo Đóng Phí Hội Viên Niên Liễm
              </h4>
              <p className="text-xs text-slate-500 line-clamp-3 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                [CLB DOANH NHÂN CEO 1983] Kính gửi Hội viên: &#123;ho_ten&#125; (Mã HV: &#123;ma_hoi_vien&#125;). Trân trọng thông báo hoàn tất hội phí niên liễm 2026. Số tiền: &#123;so_tien&#125; VNĐ. Hạn nộp: &#123;han_nop&#125;...
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["{ho_ten}", "{ma_hoi_vien}", "{so_tien}", "{han_nop}"].map((v) => (
                  <span key={v} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Sự kiện */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 uppercase">
                  Sự Kiện &amp; Diễn Đàn
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Đang kích hoạt</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Giấy Mời &amp; Vé Tham Dự Sự Kiện Hiệp Hội
              </h4>
              <p className="text-xs text-slate-500 line-clamp-3 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                [CEO 1983] Kính gửi Anh/Chị: &#123;ho_ten&#125;. Trân trọng kính mời Anh/Chị tham dự: &#123;ten_su_kien&#125;. Thời gian: &#123;thoi_gian&#125;. Địa điểm: &#123;dia_diem&#125;. Mã vé check-in: &#123;ma_ve&#125;...
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["{ho_ten}", "{ten_su_kien}", "{thoi_gian}", "{dia_diem}", "{ma_ve}"].map((v) => (
                  <span key={v} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Khóa Đào Tạo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 uppercase">
                  Đào Tạo &amp; Workshop
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Đang kích hoạt</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Xác Nhận Tham Gia Khóa Huấn Luyện Doanh Chủ
              </h4>
              <p className="text-xs text-slate-500 line-clamp-3 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                [CEO 1983] Chúc mừng Anh/Chị &#123;ho_ten&#125; đã hoàn tất đăng ký khóa đào tạo: &#123;ten_khoa_hoc&#125;. Giảng viên: &#123;giang_vien&#125;. Phòng đào tạo: &#123;phong_hoc&#125;...
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["{ho_ten}", "{ten_khoa_hoc}", "{giang_vien}", "{phong_hoc}"].map((v) => (
                  <span key={v} className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 4: Họp BCH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 uppercase">
                  Ban Điều Hành &amp; Họp
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Đang kích hoạt</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Triệu Tập Cuộc Họp Ban Thường Trực / Ban Điều Hành
              </h4>
              <p className="text-xs text-slate-500 line-clamp-3 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                [CEO 1983] Kính gửi Thành viên BĐH: &#123;ho_ten&#125;. Chủ tịch triệu tập phiên họp: &#123;tieu_de_hop&#125;. Thời gian: &#123;thoi_gian&#125;. Phòng họp Sapphire: &#123;link_hop&#125;...
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["{ho_ten}", "{tieu_de_hop}", "{thoi_gian}", "{link_hop}"].map((v) => (
                  <span key={v} className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "replies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
              <MessageCircle className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Quản Lý Mẫu Phản Hồi Nhanh (Email, Hotline/Điện Thoại &amp; Ghi Chú)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Đồng bộ dữ liệu đa kênh tới ban thư ký
            </span>
          </div>
          <ReplyTemplatesEditor />
        </div>
      )}
    </div>
  );
}

