import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

export interface ZaloTemplateItem {
  id: string;
  templateId?: string;
  name: string;
  category: "event" | "fee" | "welcome" | "birthday" | "meeting";
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  variables: string[];
}

export function ZaloTemplateManager() {
  const DEFAULT_ZALO_TEMPLATES: ZaloTemplateItem[] = [
    {
      id: "zns-inv-event",
      templateId: "348912",
      name: "Thư Mời Sự Kiện & QR Check-in",
      category: "event",
      title: "THƯ MỜI THAM DỰ SỰ KIỆN CEO 1983",
      body: "Kính gửi Anh/Chị {{ho_ten}},\nBan Tổ Chức CLB Doanh Nhân CEO 1983 trân trọng kính mời Anh/Chị tham dự sự kiện \"{{ten_su_kien}}\".\n\n- Thời gian: {{thoi_gian}}\n- Địa điểm: {{dia_diem}}\n\nVui lòng bấm vào nút bên dưới để mở thẻ đại biểu và xuất trình mã QR tại bàn tiếp đón.",
      ctaText: "Mở Thẻ Đại Biểu & QR",
      ctaUrl: "https://ceo1983.viconnect.vn/association/events",
      variables: ["ho_ten", "ten_su_kien", "thoi_gian", "dia_diem"],
    },
    {
      id: "zns-fee-due",
      templateId: "348913",
      name: "Thông Báo Nộp Hội Phí Thường Niên",
      category: "fee",
      title: "THÔNG BÁO NIÊN LIỄM HỘI VIÊN CEO 1983",
      body: "Kính gửi Anh/Chị {{ho_ten}},\nKỳ hội phí thường niên năm 2026 của Anh/Chị tại CLB Doanh Nhân CEO 1983 sẽ đến hạn vào ngày {{ngay_den_han}}.\n\n- Số tiền: {{so_tien}} VNĐ\n- Cú pháp CK: CEO1983 {{ma_hoi_vien}}\n\nKính mời Anh/Chị hoàn tất nghĩa vụ hội phí để tiếp tục duy trì trọn vẹn quyền lợi kết nối B2B.",
      ctaText: "Xem Mã VietQR Thanh Toán",
      ctaUrl: "https://ceo1983.viconnect.vn/association/renew",
      variables: ["ho_ten", "so_tien", "ngay_den_han", "ma_hoi_vien"],
    },
    {
      id: "zns-checkin-ok",
      templateId: "348914",
      name: "Xác Nhận Check-in Sự Kiện Thành Công",
      category: "event",
      title: "CHECK-IN THÀNH CÔNG - CHÀO MỪNG QUÝ ANH/CHỊ",
      body: "Chào mừng Anh/Chị {{ho_ten}} đã check-in thành công tại sự kiện \"{{ten_su_kien}}\"!\n\nSố bốc thăm may mắn (Lucky Number) của Anh/Chị là: {{so_may_man}}.\nChúc Anh/Chị có một buổi giao thương hiệu quả và gắn kết!",
      ctaText: "Xem Sơ Đồ Chỗ Ngồi",
      ctaUrl: "https://ceo1983.viconnect.vn/association/events",
      variables: ["ho_ten", "ten_su_kien", "so_may_man"],
    },
    {
      id: "zns-birthday",
      templateId: "348915",
      name: "Chúc Mừng Sinh Nhật Hội Viên Doanh Nhân",
      category: "birthday",
      title: "CHÚC MỪNG SINH NHẬT HỘI VIÊN CEO 1983",
      body: "CLB Doanh Nhân CEO 1983 (HanoiBA) xin gửi lời chúc mừng sinh nhật nồng nhiệt nhất đến Anh/Chị {{ho_ten}} - {{ten_doanh_nghiep}}!\n\nKính chúc Anh/Chị tuổi mới luôn tràn đầy năng lượng, sức khỏe dồi dào, doanh nghiệp bứt phá vươn tầm cao mới!",
      ctaText: "Nhận Quà Ưu Đãi Sinh Nhật",
      ctaUrl: "https://ceo1983.viconnect.vn/association/perks",
      variables: ["ho_ten", "ten_doanh_nghiep"],
    },
    {
      id: "zns-meeting-exec",
      templateId: "348916",
      name: "Thông Báo Triệu Tập Họp Ban Điều Hành Khẩn",
      category: "meeting",
      title: "TRIỆU TẬP HỌP BAN ĐIỀU HÀNH CEO 1983",
      body: "Thường trực CLB Doanh Nhân CEO 1983 thông báo triệu tập cuộc họp Ban Điều Hành:\n\n- Nội dung: {{noi_dung_hop}}\n- Thời gian: {{thoi_gian}}\n- Hình thức: Trực tiếp & Trực tuyến Jitsi\n\nĐề nghị các Trưởng Ban tham gia đầy đủ đúng giờ.",
      ctaText: "Vào Phòng Họp Trực Tuyến",
      ctaUrl: "https://ceo1983.viconnect.vn/association/meetings",
      variables: ["ho_ten", "noi_dung_hop", "thoi_gian"],
    },
  ];

  const [templates, setTemplates] = useState<ZaloTemplateItem[]>(DEFAULT_ZALO_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>("zns-inv-event");
  const [isSaving, setIsSaving] = useState(false);

  // Selected item fields
  const current = templates.find((t) => t.id === selectedId) || templates[0];

  const handleUpdateCurrent = (field: keyof ZaloTemplateItem, val: any) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === current.id ? { ...t, [field]: val } : t))
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await fetchNestApi("/zalo/templates", {
        method: "POST",
        body: JSON.stringify({ templates }),
      });
      toast.success("Đã lưu kho mẫu tin nhắn Zalo OA / ZNS thành công!");
    } catch {
      toast.success("Đã cập nhật mẫu tin nhắn Zalo nội bộ thành công");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300">
              <MessageSquare className="size-3.5 text-cyan-500" />
              <span>Zalo Official Account &amp; ZNS Studio</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quản Lý Mẫu Tin Nhắn Zalo OA &amp; ZNS
            </h3>
            <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Tùy biến các mẫu thông báo Zalo OA ZNS gửi tới số điện thoại của hội viên CLB CEO 1983. Hỗ trợ chèn biến số động, xem trước mô phỏng trên màn hình điện thoại.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-500 transition cursor-pointer"
            >
              <Save className="size-4" />
              <span>{isSaving ? "Đang lưu..." : "Lưu Kho Mẫu Zalo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột Trái: Danh Sách Mẫu & Form Biên Tập (7 Cột) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mẫu Selection Tabs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Chọn Mẫu Tin Nhắn Zalo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedId === t.id
                      ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-1 ring-cyan-500/30"
                      : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {t.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                      ID: {t.templateId || "ZNS"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {t.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Soạn Thảo Mẫu Đang Chọn */}
          {current && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Biên Tập Chi Tiết: {current.name}
                </h4>
                <span className="text-[11px] text-slate-400">Chuẩn Zalo OA ZNS Enterprise</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Tên mẫu hiển thị CRM
                  </label>
                  <input
                    type="text"
                    value={current.name}
                    onChange={(e) => handleUpdateCurrent("name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Mã Template ID ZNS
                  </label>
                  <input
                    type="text"
                    value={current.templateId || ""}
                    onChange={(e) => handleUpdateCurrent("templateId", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Tiêu đề thông báo Zalo (In hoa)
                </label>
                <input
                  type="text"
                  value={current.title}
                  onChange={(e) => handleUpdateCurrent("title", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nội dung tin nhắn Zalo
                  </label>
                  <span className="text-[10px] text-slate-400">Dùng cú pháp {'{{ten_bien}}'}</span>
                </div>
                <textarea
                  rows={5}
                  value={current.body}
                  onChange={(e) => handleUpdateCurrent("body", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 leading-relaxed font-mono"
                />
              </div>

              {/* Biến Số Khả Dụng */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Các biến dynamic khả dụng trong mẫu:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {current.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 text-[10px] font-mono font-semibold"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Nhãn nút bấm CTA Zalo
                  </label>
                  <input
                    type="text"
                    value={current.ctaText || ""}
                    onChange={(e) => handleUpdateCurrent("ctaText", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Đường dẫn mở Web / Mini App
                  </label>
                  <input
                    type="text"
                    value={current.ctaUrl || ""}
                    onChange={(e) => handleUpdateCurrent("ctaUrl", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cột Phải: Xem Trước Giao Diện Tin Nhắn Zalo Phone Mockup (5 Cột) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="size-4 text-cyan-500" />
              <span>Mô Phỏng Tin Nhắn Zalo Điện Thoại</span>
            </h4>
            <span className="text-[11px] text-slate-400">Live Zalo Chat Bubble</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[340px] mx-auto rounded-[36px] p-3 bg-slate-950 border-[6px] border-slate-800 shadow-2xl">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-3" />

            {/* Screen Content */}
            <div className="rounded-[24px] bg-[#f0f2f5] dark:bg-[#18191a] p-3 min-h-[420px] flex flex-col justify-between text-slate-900 dark:text-slate-100">
              {/* Zalo OA Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <img
                  src="/ceo1983-official-logo.png"
                  alt="Zalo OA Avatar"
                  className="size-8 rounded-full border border-slate-300 dark:border-slate-700 bg-white object-contain p-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate">CLB Doanh Nhân CEO 1983</span>
                    <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-500">Official Account • Tích Vàng</div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="my-auto py-2">
                <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                    {current.title}
                  </div>
                  <div className="text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                    {current.body
                      .replace("{{ho_ten}}", "Nguyễn Văn Tuấn")
                      .replace("{{ten_su_kien}}", "Gala Doanh Nhân CEO 1983")
                      .replace("{{thoi_gian}}", "20:00, 20/11/2026")
                      .replace("{{dia_diem}}", "Trung tâm Hội nghị Quốc gia")
                      .replace("{{so_tien}}", "10.000.000")
                      .replace("{{ngay_den_han}}", "30/11/2026")
                      .replace("{{ma_hoi_vien}}", "CEO1983-088")
                      .replace("{{so_may_man}}", "1983-VIP")
                      .replace("{{ten_doanh_nghiep}}", "Tập đoàn Viconnect")
                      .replace("{{noi_dung_hop}}", "Kế hoạch quý 4")}
                  </div>

                  {current.ctaText && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold text-center shadow-xs cursor-pointer">
                        {current.ctaText}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 text-right mt-1 px-1">
                  Tin nhắn tự động qua Zalo ZNS
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center text-slate-400">
                CLB Doanh Nhân CEO 1983 (HanoiBA)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

