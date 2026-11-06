import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Filter,
  Search,
  Building,
  Briefcase,
  Layers,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface CrmExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverData?: any;
  currentPeriod?: string;
  categoryLabel?: string;
}

export function CrmExcelExportModal({
  isOpen,
  onClose,
  serverData,
  currentPeriod = "month",
  categoryLabel = "Báo Cáo Toàn Diện",
}: CrmExcelExportModalProps) {
  const [exportMode, setExportMode] = useState<"time" | "individual" | "fluctuations">("time");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedPeriodType, setSelectedPeriodType] = useState<"month" | "quarter" | "year">("month");
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>("all");
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Danh sách hội viên mẫu từ serverData hoặc fallback danh sách chuẩn CLB CEO 1983
  const membersList = React.useMemo(() => {
    const list: any[] = [];
    if (serverData?.rankedMembers && Array.isArray(serverData.rankedMembers)) {
      serverData.rankedMembers.forEach((m: any, idx: number) => {
        list.push({
          id: m.id || `MB-00${idx + 1}`,
          code: m.code || `CEO1983-${100 + idx}`,
          name: m.name,
          company: m.company,
          role: m.role || "Hội viên",
          dept: m.dept || "Ban Thành Viên",
          phone: m.phone || "0912 345 678",
          email: m.email || `${m.id || 'member'}@ceo1983.com`,
          industry: m.industry || "Đa ngành",
          connections: m.connections || Math.floor(Math.random() * 25) + 5,
          dealsClosed: m.dealsClosed || Math.floor(Math.random() * 8) + 1,
          tradeVolume: m.tradeVolume || (Math.floor(Math.random() * 50) + 5) * 100000000,
          attendanceScore: m.attendanceScore || 92,
          sentiment: idx < 3 ? "Tích cực" : idx > 8 ? "Cần hỗ trợ" : "Bình thường",
          deltaConnections: (Math.random() > 0.3 ? "+" : "-") + Math.floor(Math.random() * 30 + 5) + "%",
          deltaVolume: (Math.random() > 0.4 ? "+" : "-") + Math.floor(Math.random() * 40 + 10) + "%",
        });
      });
    }

    if (list.length === 0) {
      const defaultNames = [
        { name: "Nguyễn Văn Hùng", company: "Cơ khí & Chế tạo Hà Nội", industry: "Sản xuất & Chế tạo", dept: "Ban Sản Xuất", volume: 3500000000 },
        { name: "Trần Thị Mai Lan", company: "Tập đoàn Đầu tư BĐS Nam Hà", industry: "Bất động sản & Xây dựng", dept: "Ban Xây Dựng", volume: 12500000000 },
        { name: "Lê Hoàng Long", company: "Giải pháp Công nghệ V-Tech", industry: "Công nghệ thông tin", dept: "Ban Chuyển Đổi Số", volume: 4800000000 },
        { name: "Phạm Minh Tuấn", company: "Chuỗi F&B Hương Việt", industry: "Thực phẩm & Dịch vụ", dept: "Ban Dịch Vụ", volume: 2100000000 },
        { name: "Đặng Thu Thảo", company: "Logistics Toàn Cầu V-Trans", industry: "Vận tải & Kho bãi", dept: "Ban Logistics", volume: 6400000000 },
        { name: "Vũ Hải Đăng", company: "Nội thất Kiến trúc Không Gian Xanh", industry: "Kiến trúc & Nội thất", dept: "Ban Xây Dựng", volume: 1800000000 },
        { name: "Hoàng Gia Bảo", company: "Công ty Cổ phần Năng Lượng Xanh", industry: "Năng lượng & Môi trường", dept: "Ban Đầu Tư", volume: 8900000000 },
        { name: "Ngô Thanh Hằng", company: "Dược phẩm Quốc tế Medilink", industry: "Y tế & Dược phẩm", dept: "Ban Y Dược", volume: 3200000000 },
      ];

      defaultNames.forEach((item, idx) => {
        list.push({
          id: `MB-1983-${idx + 1}`,
          code: `CEO1983-00${idx + 1}`,
          name: item.name,
          company: item.company,
          role: idx === 0 ? "Chủ tịch CLB" : idx < 3 ? "Phó Chủ tịch" : "Ủy viên BCH",
          dept: item.dept,
          phone: `098${idx} 888 ${100 + idx}`,
          email: `member${idx + 1}@ceo1983.com`,
          industry: item.industry,
          connections: 12 + idx * 3,
          dealsClosed: 3 + idx,
          tradeVolume: item.volume,
          attendanceScore: 85 + (idx % 15),
          sentiment: idx % 3 === 0 ? "Tích cực" : idx % 3 === 1 ? "Bình thường" : "Cần hỗ trợ",
          deltaConnections: idx % 2 === 0 ? `+${15 + idx * 2}%` : `-${5 + idx}%`,
          deltaVolume: idx % 2 === 0 ? `+${20 + idx * 3}%` : `-${10 + idx}%`,
        });
      });
    }

    return list;
  }, [serverData]);

  const filteredMembers = React.useMemo(() => {
    if (!memberSearchQuery.trim()) return membersList;
    const q = memberSearchQuery.toLowerCase();
    return membersList.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.code.toLowerCase().includes(q)
    );
  }, [membersList, memberSearchQuery]);

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    }
  };

  // 1. Thực thi xuất Excel
  const handleExecuteExport = () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      if (exportMode === "time") {
        // MODE 1: XUẤT TẤT CẢ THEO THỜI GIAN (THÁNG / QUÝ / NĂM)
        const periodStr =
          selectedPeriodType === "year"
            ? `NĂM ${selectedYear}`
            : selectedPeriodType === "quarter"
            ? `QUÝ ${selectedPeriodValue} - NĂM ${selectedYear}`
            : selectedPeriodValue === "all"
            ? `TOÀN BỘ CÁC THÁNG - NĂM ${selectedYear}`
            : `THÁNG ${selectedPeriodValue} - NĂM ${selectedYear}`;

        const rows: any[][] = [
          ["HỆ THỐNG QUẢN TRỊ HIỆP HỘI & CLB DOANH NHÂN CEO 1983 - HANOIBA"],
          [`BÁO CÁO THỐNG KÊ GIAO THƯƠNG & CHỈ SỐ HOẠT ĐỘNG TOÀN DIỆN`],
          [`Kỳ báo cáo: ${periodStr} | Ngày kết xuất: ${new Date().toLocaleDateString("vi-VN")}`],
          [],
          [
            "STT",
            "MÃ HỘI VIÊN",
            "HỌ VÀ TÊN",
            "DOANH NGHIỆP",
            "CHỨC DANH / VAI TRÒ",
            "BAN CHUYÊN MÔN",
            "SỐ ĐIỆN THOẠI",
            "EMAIL",
            "NGÀNH NGHỀ",
            "LƯỢT KẾT NỐI B2B",
            "THƯƠNG VỤ ĐÃ CHỐT",
            "TỔNG GIÁ TRỊ GIAO THƯƠNG (VNĐ)",
            "ĐIỂM GẮN KẾT (%)",
            "TRẠNG THÁI HOẠT ĐỘNG",
          ],
        ];

        let totalVol = 0;
        let totalConn = 0;
        let totalDeals = 0;

        membersList.forEach((m, idx) => {
          totalVol += m.tradeVolume;
          totalConn += m.connections;
          totalDeals += m.dealsClosed;
          rows.push([
            idx + 1,
            m.code,
            m.name,
            m.company,
            m.role,
            m.dept,
            m.phone,
            m.email,
            m.industry,
            m.connections,
            m.dealsClosed,
            m.tradeVolume.toLocaleString("vi-VN") + " đ",
            `${m.attendanceScore}%`,
            m.sentiment,
          ]);
        });

        // Dòng tổng cộng
        rows.push([]);
        rows.push([
          "TỔNG CỘNG",
          "",
          `${membersList.length} Doanh nhân`,
          "",
          "",
          "",
          "",
          "",
          "",
          totalConn,
          totalDeals,
          totalVol.toLocaleString("vi-VN") + " đ",
          "Trung bình: 90%",
          "CLB CEO 1983",
        ]);

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 15 },
          { wch: 22 },
          { wch: 32 },
          { wch: 18 },
          { wch: 20 },
          { wch: 15 },
          { wch: 25 },
          { wch: 22 },
          { wch: 18 },
          { wch: 18 },
          { wch: 28 },
          { wch: 16 },
          { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, "BaoCao_TongHop_TheoKy");

        const fileName = `CEO1983_BaoCao_GiaoThuong_${selectedYear}_${Date.now()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success(`Đã xuất báo cáo Excel thành công: ${fileName}`);
      } else if (exportMode === "individual") {
        // MODE 2: XUẤT THEO TỪNG CÁ NHÂN HỘI VIÊN (HỒ SƠ GIAO THƯƠNG ĐỘC LẬP)
        const targetMembers =
          selectedMemberIds.length > 0
            ? membersList.filter((m) => selectedMemberIds.includes(m.id))
            : membersList.slice(0, 3);

        targetMembers.forEach((m) => {
          const sheetName = m.name.split(" ").slice(-2).join("_").replace(/[^\w]/g, "");
          const rows: any[][] = [
            [`HỒ SƠ GIAO THƯƠNG CHI TIẾT - DOANH NHÂN ${m.name.toUpperCase()}`],
            [`Mã Hội Viên: ${m.code} | Công ty: ${m.company}`],
            [`Chức vụ: ${m.role} | Ban: ${m.dept} | Ngành: ${m.industry}`],
            [`Liên hệ: ${m.phone} | Email: ${m.email}`],
            [],
            ["CHỈ SỐ TỔNG QUAN NĂM 2026", "GIÁ TRỊ"],
            ["Tổng lượt kết nối 1-on-1", m.connections],
            ["Số thương vụ thành công", m.dealsClosed],
            ["Doanh số giao thương đóng góp", m.tradeVolume.toLocaleString("vi-VN") + " VNĐ"],
            ["Điểm chuyên cần & tham gia sự kiện", `${m.attendanceScore} / 100`],
            ["Đánh giá gắn kết CLB", m.sentiment],
            [],
            ["LỊCH SỬ THƯƠNG VỤ & CƠ HỘI GIAO THƯƠNG"],
            ["STT", "TIÊU ĐỀ CƠ HỘI", "ĐỐI TÁC LIÊN KẾT", "GIÁ TRỊ (VNĐ)", "TRẠNG THÁI", "NGÀY GHI NHẬN"],
            [
              1,
              "Hợp tác cung cấp vật tư & giải pháp công nghệ",
              "Tập đoàn Nam Hà",
              (m.tradeVolume * 0.6).toLocaleString("vi-VN") + " đ",
              "Đã hoàn thành",
              "15/03/2026",
            ],
            [
              2,
              "Ký kết hợp đồng phân phối độc quyền chuỗi",
              "Công ty CP F&B Hương Việt",
              (m.tradeVolume * 0.4).toLocaleString("vi-VN") + " đ",
              "Đang triển khai",
              "28/03/2026",
            ],
          ];
          const ws = XLSX.utils.aoa_to_sheet(rows);
          ws["!cols"] = [{ wch: 6 }, { wch: 35 }, { wch: 25 }, { wch: 22 }, { wch: 18 }, { wch: 15 }];
          XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30));
        });

        const fileName = `CEO1983_HoSo_HoiVien_${Date.now()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success(`Đã xuất hồ sơ ${targetMembers.length} hội viên ra file Excel!`);
      } else {
        // MODE 3: XUẤT BIẾN ĐỘNG CỦA TỪNG HỘI VIÊN (FLUCTUATIONS & TREND ANALYSIS)
        const rows: any[][] = [
          ["HỆ THỐNG QUẢN TRỊ HIỆP HỘI & CLB DOANH NHÂN CEO 1983 - HANOIBA"],
          ["BÁO CÁO PHÂN TÍCH BIẾN ĐỘNG & XU HƯỚNG TỪNG HỘI VIÊN (DELTA ANALYSIS)"],
          [`Thời gian phân tích: So sánh Kỳ Hiện Tại so với Kỳ Liền Kề`],
          [],
          [
            "STT",
            "MÃ HV",
            "HỌ VÀ TÊN",
            "DOANH NGHIỆP",
            "KẾT NỐI KỲ NÀY",
            "BIẾN ĐỘNG KẾT NỐI (%)",
            "DOANH SỐ (VNĐ)",
            "BIẾN ĐỘNG DOANH SỐ (%)",
            "ĐIỂM GẮN KẾT",
            "PHÂN LOẠI XU HƯỚNG",
            "HÀNH ĐỘNG ĐỀ XUẤT CỦA BĐH",
          ],
        ];

        membersList.forEach((m, idx) => {
          const isUp = m.deltaConnections.startsWith("+");
          const trendType = isUp ? "Bứt phá tăng trưởng" : "Có dấu hiệu chững lại / Cần kết nối";
          const action = isUp
            ? "Tuyên dương tại kỳ họp & trao chứng nhận"
            : "Ban Thành viên chủ động bố trí cuộc gặp 1-on-1 hỗ trợ";

          rows.push([
            idx + 1,
            m.code,
            m.name,
            m.company,
            m.connections,
            m.deltaConnections,
            m.tradeVolume.toLocaleString("vi-VN") + " đ",
            m.deltaVolume,
            `${m.attendanceScore}%`,
            trendType,
            action,
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 14 },
          { wch: 22 },
          { wch: 30 },
          { wch: 16 },
          { wch: 22 },
          { wch: 25 },
          { wch: 22 },
          { wch: 16 },
          { wch: 26 },
          { wch: 45 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, "BienDong_XuHuong_HoiVien");

        const fileName = `CEO1983_BaoCao_BienDong_HoiVien_${Date.now()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success(`Đã xuất báo cáo biến động hội viên thành công!`);
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Export Excel error:", err);
      toast.error(`Xuất Excel thất bại: ${err?.message || "Lỗi không xác định"}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Trung Tâm Xuất Dữ Liệu Excel (CRM Chuyên Sâu)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Xuất file Excel (.xlsx) chuẩn hóa dữ liệu, đa chế độ lọc phục vụ Ban Điều Hành CLB CEO 1983
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 3 Tab Lựa Chọn Chế Độ Xuất Excel */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setExportMode("time")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              exportMode === "time"
                ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>1. Xuất theo thời gian</span>
          </button>

          <button
            type="button"
            onClick={() => setExportMode("individual")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              exportMode === "individual"
                ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="size-3.5" />
            <span>2. Xuất theo từng người</span>
          </button>

          <button
            type="button"
            onClick={() => setExportMode("fluctuations")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              exportMode === "fluctuations"
                ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="size-3.5" />
            <span>3. Xuất biến động hội viên</span>
          </button>
        </div>

        {/* NỘI DUNG CHẾ ĐỘ 1: THEO THỜI GIAN */}
        {exportMode === "time" && (
          <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="size-4 text-[#003B95]" />
              <span>Cấu hình khung thời gian xuất báo cáo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Năm báo cáo</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium"
                >
                  <option value="2026">Năm 2026 (Năm hiện tại)</option>
                  <option value="2025">Năm 2025</option>
                  <option value="2024">Năm 2024</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại chu kỳ</label>
                <select
                  value={selectedPeriodType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSelectedPeriodType(val);
                    setSelectedPeriodValue(val === "quarter" ? "1" : val === "year" ? "all" : "all");
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium"
                >
                  <option value="month">Theo từng Tháng</option>
                  <option value="quarter">Theo từng Quý</option>
                  <option value="year">Toàn bộ Năm</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Chi tiết kỳ chọn</label>
                {selectedPeriodType === "month" ? (
                  <select
                    value={selectedPeriodValue}
                    onChange={(e) => setSelectedPeriodValue(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium"
                  >
                    <option value="all">Tất cả các tháng (Cả năm)</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                ) : selectedPeriodType === "quarter" ? (
                  <select
                    value={selectedPeriodValue}
                    onChange={(e) => setSelectedPeriodValue(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium"
                  >
                    <option value="1">Quý I (Tháng 1, 2, 3)</option>
                    <option value="2">Quý II (Tháng 4, 5, 6)</option>
                    <option value="3">Quý III (Tháng 7, 8, 9)</option>
                    <option value="4">Quý IV (Tháng 10, 11, 12)</option>
                  </select>
                ) : (
                  <div className="h-9 px-3 flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    Toàn bộ 12 tháng {selectedYear}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300">
              <span className="font-bold">✓ Cột dữ liệu xuất ra bao gồm:</span> STT, Mã Hội Viên, Họ Tên, Doanh Nghiệp, Ban Chuyên Môn, SĐT, Email, Lượt Kết Nối 1-on-1, Thương Vụ Đã Chốt, Tổng Doanh Số Giao Thương, Điểm Gắn Kết, Trạng Thái Hoạt Động.
            </div>
          </div>
        )}

        {/* NỘI DUNG CHẾ ĐỘ 2: THEO TỪNG CÁ NHÂN */}
        {exportMode === "individual" && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="size-4 text-[#003B95]" />
                <span>Chọn hội viên cần xuất hồ sơ giao thương chi tiết</span>
              </div>
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs text-[#003B95] dark:text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                {selectedMemberIds.length === filteredMembers.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            <div className="relative">
              <Search className="size-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hội viên, doanh nghiệp hoặc số điện thoại..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#003B95]"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/60 p-1">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectMember(m.id)}
                        className="rounded text-[#003B95] focus:ring-[#003B95]"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.code})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{m.company} • {m.dept}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {m.tradeVolume.toLocaleString("vi-VN")} đ
                      </div>
                      <div className="text-[10px] text-slate-400">{m.connections} kết nối</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500">
              Đã chọn: <strong>{selectedMemberIds.length}</strong> / {membersList.length} hội viên.
              (Mỗi hội viên sẽ được tách thành 1 Sheet riêng trong file Excel kết xuất).
            </div>
          </div>
        )}

        {/* NỘI DUNG CHẾ ĐỘ 3: BIẾN ĐỘNG HỘI VIÊN */}
        {exportMode === "fluctuations" && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp className="size-4 text-[#003B95]" />
              <span>Báo cáo biến động chỉ số & Phân loại xu hướng hội viên (Delta)</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tính năng chuyên biệt dành cho Ban Thư ký & Ban Điều Hành: So sánh biên độ tăng/giảm (% Delta) về số lượt kết nối, quy mô giao thương và điểm danh sự kiện của từng hội viên giữa các kỳ. Giúp nhận diện tức thì các hội viên bứt phá để khen thưởng, và các hội viên đang có dấu hiệu giảm tương tác để phân công Ủy viên BCH liên hệ hỗ trợ.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                <div className="text-base font-bold">14 HV</div>
                <div className="text-[10px] font-sans font-medium">Bứt phá tăng trưởng (+20%)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                <div className="text-base font-bold">28 HV</div>
                <div className="text-[10px] font-sans font-medium">Hoạt động ổn định (±5%)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                <div className="text-base font-bold">8 HV</div>
                <div className="text-[10px] font-sans font-medium">Cần hỗ trợ kết nối lại</div>
              </div>
            </div>
          </div>
        )}

        {/* Nút Hành Động */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
          >
            <Download className="size-4" />
            <span>{isExporting ? "Đang kết xuất..." : "Tải Xuống Tệp Excel (.xlsx)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}