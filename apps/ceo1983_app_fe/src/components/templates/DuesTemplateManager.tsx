import React, { useState } from "react";
import {
  Wallet,
  QrCode,
  Building2,
  CreditCard,
  Sparkles,
  Save,
  Send,
  CheckCircle2,
  Copy,
  Receipt,
  Download,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export function DuesTemplateManager() {
  const [bankName, setBankName] = useState<string>("VietinBank (Ngân hàng TMCP Công Thương Việt Nam)");
  const [bankBin, setBankBin] = useState<string>("970415");
  const [accountNumber, setAccountNumber] = useState<string>("11319838888");
  const [accountOwner, setAccountOwner] = useState<string>("CLB DOANH NHAN CEO 1983 HANOIBA");

  // Packages of Dues
  const [packages, setPackages] = useState([
    {
      id: "pkg-diamond",
      name: "Hội Viên Kim Cương (VIP Diamond)",
      amount: 50000000,
      description: "Quyền lợi vinh danh đặc biệt, vị trí VIP tại Gala, đối tác chiến lược cấp cao",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "pkg-gold",
      name: "Hội Viên Vàng (Gold Member)",
      amount: 20000000,
      description: "Ưu tiên kết nối giao thương B2B, gian hàng Marketplace, tham dự mọi sự kiện",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    {
      id: "pkg-regular",
      name: "Hội Viên Chính Thức (Standard)",
      amount: 10000000,
      description: "Quyền biểu quyết, tham dự họp ban, danh bạ hội viên 360°, đào tạo chuyên sâu",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    {
      id: "pkg-startup",
      name: "Hội Viên Khởi Nghiệp (Startup & Trẻ)",
      amount: 5000000,
      description: "Hỗ trợ kết nối khởi nghiệp, học hỏi từ các CEO đàn anh, tham gia ban chuyên môn",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
  ]);

  const [selectedPkgId, setSelectedPkgId] = useState<string>("pkg-regular");
  const [customAmount, setCustomAmount] = useState<number>(10000000);
  const [sampleMemberCode, setSampleMemberCode] = useState<string>("CEO1983-088");
  const [sampleMemberName, setSampleMemberName] = useState<string>("NGUYEN VAN TUAN");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[2];

  // Transfer syntax
  const transferSyntax = `CEO1983 ${sampleMemberCode.replace(/[^A-Za-z0-9]/g, "")} ${sampleMemberName.replace(/[^A-Za-z0-9]/g, "")}`.toUpperCase();

  // Dynamic VietQR URL
  const vietQrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?amount=${selectedPkg.amount}&addInfo=${encodeURIComponent(
    transferSyntax
  )}&accountName=${encodeURIComponent(accountOwner)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const handleSaveBankConfig = () => {
    toast.success("Đã lưu cấu hình tài khoản thanh toán hội phí thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Wallet className="size-3.5 text-emerald-500" />
              <span>Cổng Mẫu Thanh Toán Hội Phí &amp; VietQR Dynamic</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quản Lý Mẫu Trang &amp; Thông Báo Thanh Toán Hội Phí
            </h3>
            <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Cấu hình tài khoản ngân hàng thụ hưởng, bảng định mức hội phí theo phân hạng hội viên, mã VietQR thanh toán tự sinh và mẫu thông báo nhắc nộp niên liễm đa kênh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Gửi Thông Báo Hội Phí Đa Kênh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột Trái: Cấu Hình Tài Khoản & Mức Hội Phí (7 Cột) */}
        <div className="lg:col-span-7 space-y-6">
          {/* CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CLB */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building2 className="size-4 text-emerald-500" />
                <span>Tài Khoản Ngân Hàng Thụ Hưởng CLB CEO 1983</span>
              </h4>
              <button
                type="button"
                onClick={handleSaveBankConfig}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Save className="size-3.5" /> Lưu Cấu Hình
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Ngân hàng thụ hưởng
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Số tài khoản (STK)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Tên chủ tài khoản thụ hưởng (In hoa không dấu)
              </label>
              <input
                type="text"
                value={accountOwner}
                onChange={(e) => setAccountOwner(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          {/* BẢNG ĐỊNH MỨC HỘI PHÍ THEO HẠNG */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="size-4 text-emerald-500" />
              <span>Định Mức Niên Liễm Theo Phân Hạng Hội Viên</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    selectedPkgId === pkg.id
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30"
                      : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {pkg.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                      {pkg.id.split("-")[1].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {pkg.amount.toLocaleString("vi-VN")} đ <span className="text-[10px] font-normal text-slate-400">/ năm</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {pkg.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* THỬ NGHIỆM TẠO CÚ PHÁP CHUYỂN KHOẢN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Mô Phỏng Cú Pháp Cho Hội Viên Cụ Thể
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Mã Hội viên</label>
                <input
                  type="text"
                  value={sampleMemberCode}
                  onChange={(e) => setSampleMemberCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={sampleMemberName}
                  onChange={(e) => setSampleMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-900 dark:text-slate-100">
              <span className="font-bold text-amber-600 dark:text-amber-400">{transferSyntax}</span>
              <button
                type="button"
                onClick={() => handleCopy(transferSyntax, "cú pháp chuyển khoản")}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <Copy className="size-3.5" /> Sao chép
              </button>
            </div>
          </div>
        </div>

        {/* Cột Phải: Xem Trước Mẫu Phiếu Thu & Mã VietQR (5 Cột) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Receipt className="size-4 text-emerald-500" />
              <span>Xem Trước Mẫu Thẻ Thanh Toán VietQR</span>
            </h4>
            <span className="text-[11px] text-slate-400">Tự động điền tiền &amp; nội dung</span>
          </div>

          {/* Luxury VietQR Card Frame */}
          <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl p-6 text-white text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/ceo1983-official-logo.png"
                alt="Logo"
                className="h-9 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                }}
              />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                CLB DOANH NHÂN CEO 1983 (HANOIBA)
              </div>
              <h3 className="text-sm font-black text-white uppercase mt-0.5">
                Phiếu Nộp Hội Phí Thường Niên
              </h3>
              <div className="text-xs text-slate-400 mt-1">
                {selectedPkg.name}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl mx-auto w-fit shadow-lg border border-slate-200">
              <img
                src={vietQrUrl}
                alt="VietQR Dues"
                className="size-52 object-contain"
              />
            </div>

            {/* Account Info Details */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-white">VietinBank</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số tài khoản:</span>
                <span className="font-bold text-emerald-400">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-bold text-white truncate max-w-[170px]">{accountOwner}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-black text-amber-400 text-sm">
                  {selectedPkg.amount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBroadcastOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-700 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="size-4" />
              <span>Gửi Mẫu Thông Báo Nộp Phí</span>
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <OmnichannelBroadcastModal
        open={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        invitationData={{
          title: `THÔNG BÁO NỘP NIÊN LIỄM: ${selectedPkg.name}`,
          subtitle: "CLB Doanh Nhân CEO 1983 (HanoiBA)",
          posterUrl: vietQrUrl,
          date: "Kỳ niên liễm thường niên 2026",
          location: "Chuyển khoản trực tiếp qua VietQR tài khoản CLB",
          salutation: "Kính gửi: Quý Anh/Chị Hội viên CLB CEO 1983,",
          bodyText: `Kính mời Quý Anh/Chị thực hiện hoàn tất niên liễm ${selectedPkg.name} (${selectedPkg.amount.toLocaleString("vi-VN")} VNĐ) để duy trì toàn bộ quyền lợi kết nối B2B và tham dự các kỳ sự kiện CLB.`,
        }}
      />
    </div>
  );
}

