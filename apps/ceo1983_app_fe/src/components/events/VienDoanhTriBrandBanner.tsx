import React from "react";

interface VienDoanhTriBrandBannerProps {
  variant?: "light" | "dark";
  className?: string;
  showTimeAndLocation?: boolean;
}

export function VienDoanhTriBrandBanner({
  variant = "light",
  className = "",
  showTimeAndLocation = false,
}: VienDoanhTriBrandBannerProps) {
  const isDark = variant === "dark";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Khối Banner Đồ Họa Chuẩn Nhận Diện Viện Doanh Trí (Ảnh 1) */}
      <div className="inline-flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 flex-wrap">
        {/* Bên trái: CHƯƠNG TRÌNH KỶ NIỆM */}
        <div className="text-right flex flex-col justify-center">
          <span
            className={`text-xs sm:text-base md:text-lg font-black tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-slate-100 drop-shadow-sm" : "text-[#0A2540]"
            }`}
          >
            CHƯƠNG TRÌNH
          </span>
          <span
            className={`text-xs sm:text-base md:text-lg font-black tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-slate-100 drop-shadow-sm" : "text-[#0A2540]"
            }`}
          >
            KỶ NIỆM
          </span>
        </div>

        {/* Vạch kẻ phân cách đứng */}
        <div
          className={`h-9 sm:h-12 md:h-14 w-[2px] sm:w-[2.5px] rounded-full self-center ${
            isDark ? "bg-amber-400/60" : "bg-slate-300"
          }`}
        />

        {/* Số 4 to khổng lồ gradient xanh lá cây thương hiệu Viện Doanh Trí */}
        <div className="text-4xl sm:text-6xl md:text-7xl font-black leading-none px-1 select-none font-sans bg-clip-text text-transparent bg-gradient-to-b from-[#22C55E] via-[#16A34A] to-[#15803D] drop-shadow-xs">
          4
        </div>

        {/* Bên phải: NĂM THÀNH LẬP VIỆN DOANH TRÍ */}
        <div className="text-left flex flex-col justify-center">
          <span
            className={`text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase leading-tight font-sans ${
              isDark ? "text-slate-200" : "text-[#003B73]"
            }`}
          >
            NĂM THÀNH LẬP
          </span>
          <span
            className={`text-sm sm:text-lg md:text-2xl font-black tracking-tight uppercase leading-tight font-sans ${
              isDark
                ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-300 drop-shadow-md"
                : "text-[#002B62]"
            }`}
          >
            VIỆN DOANH TRÍ
          </span>
        </div>
      </div>

      {/* Dòng chữ phụ đề bên dưới: & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11 */}
      <div className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-base font-extrabold text-[#008A44] tracking-wider uppercase flex items-center justify-center gap-1 font-sans">
        <span>&amp; TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11</span>
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
            <span className="text-[#00A859]">⏱</span>
            <span>14h30 - 17h30, Thứ 7, 21/11/2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#00A859]">📍</span>
            <span>Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy</span>
          </div>
        </div>
      )}
    </div>
  );
}
