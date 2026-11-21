import React from "react";

interface Ceo1983BrandBannerProps {
  variant?: "light" | "dark";
  className?: string;
  showTimeAndLocation?: boolean;
}

/**
 * Banner Nhận diện Thương hiệu CLB Doanh Nhân CEO 1983 (HanoiBA)
 * Sử dụng 3 màu thương hiệu chuẩn: Đỏ Bordeaux (#8B0000), Xanh Navy (#003B95), Vàng Kim (#D4AF37)
 */
export function Ceo1983BrandBanner({
  variant = "light",
  className = "",
  showTimeAndLocation = false,
}: Ceo1983BrandBannerProps) {
  const isDark = variant === "dark";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Khối Banner Đồ Họa Chuẩn Nhận Diện CLB Doanh Nhân CEO 1983 (HanoiBA) */}
      <div className="inline-flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 flex-wrap">
        {/* Bên trái: HỘI DOANH NHÂN TRẺ HÀ NỘI */}
        <div className="text-right flex flex-col justify-center">
          <span
            className={`text-[10px] sm:text-xs md:text-sm font-black tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-amber-300 drop-shadow-sm" : "text-[#8B0000]"
            }`}
          >
            HANOIBA
          </span>
          <span
            className={`text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-slate-100 drop-shadow-sm" : "text-[#003B95]"
            }`}
          >
            CLB DOANH NHÂN
          </span>
        </div>

        {/* Vạch kẻ phân cách đứng */}
        <div
          className={`h-9 sm:h-12 md:h-14 w-[2px] sm:w-[2.5px] rounded-full self-center ${
            isDark ? "bg-amber-400/80" : "bg-[#D4AF37]"
          }`}
        />

        {/* Số 1983 nổi bật gradient Vàng Kim & Đỏ Bordeaux */}
        <div className="text-3xl sm:text-5xl md:text-6xl font-black leading-none px-1 select-none font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#8B0000] drop-shadow-sm tracking-tight">
          CEO 1983
        </div>

        {/* Bên phải: HÀ NỘI HỘI VIÊN CHÍNH THỨC */}
        <div className="text-left flex flex-col justify-center">
          <span
            className={`text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-slate-200" : "text-[#8B0000]"
            }`}
          >
            HÀ NỘI
          </span>
          <span
            className={`text-xs sm:text-sm md:text-base font-black tracking-tight uppercase leading-tight font-sans ${
              isDark
                ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-300 drop-shadow-md"
                : "text-[#003B95]"
            }`}
          >
            HỘI VIÊN CHÍNH THỨC
          </span>
        </div>
      </div>

      {/* Dòng chữ phụ đề bên dưới: GẮN KẾT - CHIA SẺ - CÙNG PHÁT TRIỂN */}
      <div className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-base font-extrabold text-[#D4AF37] tracking-widest uppercase flex items-center justify-center gap-1.5 font-sans">
        <span>★ GẮN KẾT — CHIA SẺ — CÙNG PHÁT TRIỂN ★</span>
      </div>

      {/* Thời gian và địa điểm rút gọn (nếu cần hiển thị) */}
      {showTimeAndLocation && (
        <div
          className={`mt-4 pt-3 border-t w-full max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs font-semibold ${
            isDark
              ? "border-white/10 text-slate-300"
              : "border-slate-200 text-slate-600"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[#8B0000]">⏱</span>
            <span>Sự Kiện Kết Nối Giao Thương & Hội Nghị Hội Viên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#003B95]">📍</span>
            <span>Hà Nội · CLB Doanh Nhân CEO 1983</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const VienDoanhTriBrandBanner = Ceo1983BrandBanner;
