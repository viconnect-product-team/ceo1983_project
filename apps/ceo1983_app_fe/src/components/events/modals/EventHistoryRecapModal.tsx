import React, { useState } from "react";
import {
  X,
  Trophy,
  Award,
  Vote,
  Users,
  Camera,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  Building2,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDisplayDate } from "@/lib/date-format";
import { toast } from "sonner";

export interface EventHistoryRecapModalProps {
  open: boolean;
  onClose: () => void;
  event: any;
}

export function EventHistoryRecapModal({ open, onClose, event }: EventHistoryRecapModalProps) {
  const [activeTab, setActiveTab] = useState<"sponsors" | "votes" | "awards" | "seating" | "photos">("photos");
  const [seatSearch, setSeatSearch] = useState("");

  if (!event) return null;

  // Link Google Drive lưu ảnh sự kiện
  const drivePhotosUrl =
    event.photoGalleryUrl ||
    event.photo_gallery_url ||
    event.driveUrl ||
    "https://drive.google.com/drive/folders/1CEO1983_EVENT_ARCHIVE_PHOTOS_HIGHRES";

  // 1. Dữ liệu Nhà tài trợ theo hạng Kim Cương, Vàng, Bạc, Đồng Hành
  const defaultSponsors = [
    {
      tier: "Kim Cương",
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300",
      items: [
        { name: "Tập Đoàn Flamingo Holdings", amount: "500.000.000 VNĐ", rep: "Chủ tịch HĐQT", logoText: "FLAMINGO" },
        { name: "Ngân hàng TMCP Kỹ Thương Techcombank", amount: "300.000.000 VNĐ", rep: "Giám đốc Khối SME", logoText: "TECHCOMBANK" },
      ],
    },
    {
      tier: "Vàng",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
      items: [
        { name: "Công ty Cổ phần Eurowindow", amount: "200.000.000 VNĐ", rep: "Tổng Giám Đốc", logoText: "EUROWINDOW" },
        { name: "Công ty Cổ phần MISA", amount: "150.000.000 VNĐ", rep: "Phó Tổng Giám Đốc", logoText: "MISA" },
      ],
    },
    {
      tier: "Bạc",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
      items: [
        { name: "Tập đoàn Sunhouse", amount: "100.000.000 VNĐ", rep: "Đại diện thương hiệu", logoText: "SUNHOUSE" },
        { name: "Tập đoàn Tân Á Đại Thành", amount: "100.000.000 VNĐ", rep: "Giám đốc đối ngoại", logoText: "TÂN Á" },
      ],
    },
    {
      tier: "Đồng Hành B2B",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
      items: [
        { name: "Hoàng Long Holding JSC", amount: "50.000.000 VNĐ", rep: "Hội viên CEO 1983", logoText: "HOÀNG LONG" },
        { name: "Cường Thịnh Group", amount: "50.000.000 VNĐ", rep: "Hội viên Ban Thành viên", logoText: "CƯỜNG THỊNH" },
      ],
    },
  ];

  // 2. Dữ liệu Biểu quyết tại sự kiện
  const votingResolutions = [
    {
      id: "res-01",
      code: "NQ-01/2026/CEO1983",
      title: "Thông qua Chiến lược Liên minh Xúc tiến Thương mại & Giao lưu B2B Đa Ngành 2026 - 2027",
      approvedRatio: "98.6%",
      approvedCount: "142/144 đại biểu",
      status: "ĐÃ THÔNG QUA",
      notes: "100% Ban Điều Hành tán thành, 2 phiếu bảo lưu điều khoản xúc tiến quốc tế.",
    },
    {
      id: "res-02",
      code: "NQ-02/2026/CEO1983",
      title: "Phê chuẩn Ngân sách Quỹ Tương trợ Doanh nhân & Quỹ Thiện nguyện Trẻ em Vùng cao",
      approvedRatio: "100%",
      approvedCount: "144/144 đại biểu",
      status: "ĐÃ THÔNG QUA",
      notes: "Toàn thể hội viên tham dự nhất trí phê chuẩn tổng ngân sách 1.2 tỷ VNĐ.",
    },
    {
      id: "res-03",
      code: "NQ-03/2026/CEO1983",
      title: "Quy chế bảo mật thông tin & Chia sẻ cơ hội kinh doanh công khai trên Nền tảng CEO 1983",
      approvedRatio: "97.2%",
      approvedCount: "140/144 đại biểu",
      status: "ĐÃ THÔNG QUA",
      notes: "Quy chuẩn minh bạch số liệu giao thương, cam kết không ảo hóa chỉ số doanh số.",
    },
  ];

  // 3. Dữ liệu Giải thưởng & Vinh danh
  const eventAwards = [
    {
      category: "Giải Thưởng Lucky Draw May Mắn",
      awards: [
        {
          name: "Giải Đặc Biệt: Xe Máy Điện Thông Minh VinFast Feliz S",
          winner: "Nguyễn Văn Cường",
          company: "Cường Thịnh Group JSC",
          luckyCode: "#1983",
          badge: "Giải Đặc Biệt",
        },
        {
          name: "Giải Nhất: Laptop Doanh Nhân Lenovo ThinkPad X1",
          winner: "Vũ Thu Trang",
          company: "Quỹ Thiện Nguyện CEO 1983",
          luckyCode: "#1024",
          badge: "Giải Nhất",
        },
        {
          name: "Giải Nhì: Voucher Nghỉ Dưỡng 3N2Đ Flamingo Cát Bà Resort",
          winner: "Hoàng Minh Tuấn",
          company: "Tuấn Minh Global Trading",
          luckyCode: "#1568",
          badge: "Giải Nhì",
        },
      ],
    },
    {
      category: "Vinh Danh Doanh Nhân Tiêu Biểu & Cống Hiến",
      awards: [
        {
          name: "Cúp Vinh Danh: Lãnh Đạo Giao Thương B2B Xuất Sắc 2026",
          winner: "Lê Hoàng Long",
          company: "Tập Đoàn Hoàng Long Holding",
          luckyCode: "TOP 1 DEAL",
          badge: "Vinh Danh",
        },
        {
          name: "Kỷ Niệm Chương: Doanh Nghiệp Chuyển Đổi Số Đột Phá",
          winner: "Nguyễn Văn Linh",
          company: "Công ty Cổ phần & Công nghệ Alpha",
          luckyCode: "INNOVATION",
          badge: "Vinh Danh",
        },
      ],
    },
  ];

  // 4. Sắp xếp chỗ ngồi đã lưu vết
  const seatingTables = [
    {
      tableName: "Bàn Đoàn Chủ Tịch (Bàn VIP 01)",
      zone: "Khu vực Sân khấu Trung tâm",
      seats: [
        { seat: "Ghế 01", name: "Chủ tịch CLB CEO 1983", role: "Chủ toạ sự kiện" },
        { seat: "Ghế 02", name: "Đại diện Thường trực HanoiBA", role: "Khách mời danh dự" },
        { seat: "Ghế 03", name: "Phó Chủ tịch thường trực", role: "Ban Điều Hành" },
        { seat: "Ghế 04", name: "Trưởng ban Ban Xúc tiến B2B", role: "Ban Điều Hành" },
        { seat: "Ghế 05", name: "Đại diện Nhà tài trợ Kim Cương (Flamingo)", role: "Đại biểu Kim Cương" },
        { seat: "Ghế 06", name: "Đại diện Techcombank SME", role: "Đại biểu Kim Cương" },
      ],
    },
    {
      tableName: "Bàn Doanh Nghiệp A1 — Công Nghệ & Phần Mềm",
      zone: "Khu vực Cánh Trái",
      seats: [
        { seat: "Ghế 01", name: "Nguyễn Văn Linh", role: "Công nghệ Alpha" },
        { seat: "Ghế 02", name: "Administrator", role: "Ban Quản trị & Điều phối" },
        { seat: "Ghế 03", name: "Đại diện MISA JSC", role: "Hội viên chính thức" },
        { seat: "Ghế 04", name: "Phạm Quang Huy", role: "Huy Hoàng Media" },
        { seat: "Ghế 05", name: "Trần Bảo Sơn", role: "TechVione Solutions" },
        { seat: "Ghế 06", name: "Lê Đức Anh", role: "CloudBiz JSC" },
      ],
    },
    {
      tableName: "Bàn Doanh Nghiệp A2 — Xây Dựng & Bất Động Sản",
      zone: "Khu vực Cánh Phải",
      seats: [
        { seat: "Ghế 01", name: "Nguyễn Văn Cường", role: "Cường Thịnh Group" },
        { seat: "Ghế 02", name: "Đại diện Eurowindow", role: "Nhà tài trợ Vàng" },
        { seat: "Ghế 03", name: "Đại diện Tân Á Đại Thành", role: "Nhà tài trợ Bạc" },
        { seat: "Ghế 04", name: "Vũ Hải Đăng", role: "Hải Đăng Construction" },
        { seat: "Ghế 05", name: "Nguyễn Hoàng Nam", role: "Nam Land Real Estate" },
      ],
    },
    {
      tableName: "Bàn Doanh Nghiệp A3 — Thương Mại & Dịch Vụ Đầu Tư",
      zone: "Khu vực Trung tâm",
      seats: [
        { seat: "Ghế 01", name: "Lê Hoàng Long", role: "Hoàng Long Holding" },
        { seat: "Ghế 02", name: "Hoàng Minh Tuấn", role: "Tuấn Minh Global" },
        { seat: "Ghế 03", name: "Vũ Thu Trang", role: "Quỹ Thiện Nguyện" },
        { seat: "Ghế 04", name: "Đoàn Thị Mai", role: "Mai Logistics" },
        { seat: "Ghế 05", name: "Phan Văn Hưng", role: "Hưng Phát Capital" },
      ],
    },
  ];

  const filteredTables = seatingTables.map((table) => {
    if (!seatSearch.trim()) return table;
    const term = seatSearch.toLowerCase();
    const matchingSeats = table.seats.filter(
      (s) => s.name.toLowerCase().includes(term) || s.role.toLowerCase().includes(term) || s.seat.toLowerCase().includes(term)
    );
    const tableMatches = table.tableName.toLowerCase().includes(term) || table.zone.toLowerCase().includes(term);
    return tableMatches ? table : { ...table, seats: matchingSeats };
  }).filter((t) => t.seats.length > 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl w-[94vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[100]">
        {/* Header Ban Lãnh Đạo */}
        <div className="shrink-0 p-4 bg-[#003B95] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Lưu Vết Kỷ Niệm Sự Kiện
                </span>
                <span className="text-[10px] text-slate-300">Đã kết thúc</span>
              </div>
              <DialogTitle className="text-sm sm:text-base font-extrabold text-white mt-0.5 line-clamp-1">
                {event.title}
              </DialogTitle>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-header thời gian và địa điểm */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#003B95] shrink-0" />
            <span>{event.date ? formatDisplayDate(event.date) : "20/10/2026"}</span>
            <span className="text-slate-300">·</span>
            <MapPin className="w-3.5 h-3.5 text-[#003B95] shrink-0" />
            <span className="truncate">{event.place || "Keangnam Landmark 72, Hà Nội"}</span>
          </div>
        </div>

        {/* Tabs Bar 5 Hạng Mục Lưu Vết */}
        <div className="shrink-0 px-3 pt-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: "photos" as const, label: "Thư mục ảnh", icon: Camera, count: "Drive" },
              { id: "sponsors" as const, label: "Nhà tài trợ", icon: Building2, count: "8" },
              { id: "votes" as const, label: "Biểu quyết", icon: Vote, count: "3 NQ" },
              { id: "awards" as const, label: "Giải thưởng", icon: Award, count: "5" },
              { id: "seating" as const, label: "Sắp xếp chỗ ngồi", icon: Users, count: "Sơ đồ" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#003B95] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: THƯ MỤC ẢNH GOOGLE DRIVE */}
          {activeTab === "photos" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#003B95] text-white flex items-center justify-center shadow-md">
                    <Camera className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Kho Hình Ảnh &amp; Video Recap Sự Kiện
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      450+ hình ảnh chất lượng cao gốc do Ban Truyền Thông CEO 1983 tổng hợp.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Nền tảng lưu trữ:</span>
                    <strong className="text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Google Drive High-Speed
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Quyền truy cập:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Công khai cho Hội viên tải về</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Dung lượng lưu trữ:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-100">8.4 GB (Ảnh RAW + Video 4K)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.open(drivePhotosUrl, "_blank");
                    toast.success("Đang mở thư mục ảnh sự kiện trên Google Drive...");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Mở Thư Mục Ảnh Drive Để Tải Về</span>
                </button>
              </div>

              {/* Gợi ý các bộ sưu tập nổi bật */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Các album nổi bật trong thư mục
                </h5>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "01. Khai Mạc & Đón Tiếp Đại Biểu", count: "120 ảnh" },
                    { name: "02. Ký Kết Hợp Tác B2B", count: "85 ảnh" },
                    { name: "03. Vinh Danh Doanh Nhân Xuất Sắc", count: "95 ảnh" },
                    { name: "04. Dạ Tiệc & Lucky Draw", count: "150 ảnh" },
                  ].map((album, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        window.open(drivePhotosUrl, "_blank");
                      }}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#003B95] transition cursor-pointer"
                    >
                      <h6 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{album.name}</h6>
                      <span className="text-[11px] text-[#003B95] dark:text-blue-400 font-semibold">{album.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHÀ TÀI TRỢ SỰ KIỆN */}
          {activeTab === "sponsors" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Danh Sách Nhà Tài Trợ Đồng Hành
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">8 Doanh nghiệp tài trợ</span>
              </div>

              {defaultSponsors.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${group.badgeColor}`}>
                      Hạng {group.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.items.map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <h5 className="font-black text-xs text-slate-900 dark:text-white leading-snug">
                            {sp.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Đại diện: {sp.rep}
                          </p>
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {sp.amount}
                          </span>
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 font-mono tracking-wider shrink-0">
                          {sp.logoText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BIỂU QUYẾT TẠI SỰ KIỆN */}
          {activeTab === "votes" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Nghị Quyết &amp; Biểu Quyết Đại Hội
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% Đã ban hành</span>
              </div>

              {votingResolutions.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950 dark:text-blue-300 font-mono font-black text-[10px]">
                      {res.code}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {res.status}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                    {res.title}
                  </h5>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tỷ lệ tán thành:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black">{res.approvedRatio} ({res.approvedCount})</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                      Ghi chú: {res.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: GIẢI THƯỞNG & VINH DANH */}
          {activeTab === "awards" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {eventAwards.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{sec.category}</span>
                  </h4>

                  <div className="space-y-2">
                    {sec.awards.map((aw, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            {aw.badge}
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">
                            {aw.name}
                          </h5>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Người nhận: <strong className="text-slate-800 dark:text-slate-200">{aw.winner}</strong> · {aw.company}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">Số may mắn:</span>
                          <span className="text-xs font-mono font-black text-[#003B95] dark:text-blue-400">
                            {aw.luckyCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SẮP XẾP CHỖ NGỒI */}
          {activeTab === "seating" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Sơ Đồ Phân Bổ Chỗ Ngồi Đại Biểu
                </h4>
                <span className="text-[11px] text-slate-400">Lưu vết chính xác</span>
              </div>

              {/* Tìm kiếm đại biểu / chỗ ngồi */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tra cứu tên hội viên, doanh nghiệp hoặc bàn tiệc..."
                  value={seatSearch}
                  onChange={(e) => setSeatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white focus:ring-1 focus:ring-[#003B95]"
                />
              </div>

              {filteredTables.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không tìm thấy đại biểu hoặc bàn tiệc nào phù hợp
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTables.map((table, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <Users className="w-3.5 h-3.5 text-[#003B95]" />
                          <span>{table.tableName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{table.zone}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {table.seats.map((seat, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-1.5"
                          >
                            <span className="w-5 h-5 rounded-md bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950 dark:text-blue-300 font-black text-[10px] flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                                {seat.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {seat.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Hồ sơ lưu trữ điện tử CLB CEO 1983
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

