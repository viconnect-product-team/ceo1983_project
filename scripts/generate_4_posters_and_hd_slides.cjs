/**
 * GENERATE_4_POSTERS_AND_HD_SLIDES.CJS
 * 
 * Tạo 4 Poster riêng biệt độc lập và Bộ Slide HD 16:9 không bị vỡ ảnh.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const assets = require('./poster_assets_and_styles.cjs');

const {
  DOC_DIR,
  FE_DOCS_DIR,
  LOGO_CEO1983,
  CRM_01,
  CRM_02,
  CRM_03,
  CRM_04,
  CRM_06,
  CRM_08,
  APP_01,
  APP_02,
  APP_04,
  APP_05,
  APP_EVENT_LIST,
  APP_TICKET_QR,
  APP_CARD_CLEAN,
  VIONE_EMBLEM_SVG,
  POSTER_COMMON_HEAD
} = assets;

// ============================================================================
// 1. POSTER 1: ỨNG DỤNG QUẢN LÝ HIỆP HỘI CEO1983 (OVERVIEW MOBILE APP)
// ============================================================================
function generatePoster01Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>POSTER 1 - ỨNG DỤNG QUẢN LÝ HIỆP HỘI CEO1983</title>
  ${POSTER_COMMON_HEAD}
</head>
<body>
  <div class="poster-canvas bg-light-ambient">
    <div class="skyline-overlay"></div>
    <div class="building-silhouette"></div>

    <!-- HEADER -->
    <div class="relative z-20 pt-12 px-12 text-center">
      <img src="${LOGO_CEO1983}" class="h-24 mx-auto object-contain drop-shadow" alt="CEO 1983" />
      <h1 class="text-[54px] font-black tracking-tight uppercase leading-tight font-['Montserrat'] mt-4">
        <span class="text-[#0A369D]">ỨNG DỤNG QUẢN LÝ </span><span class="text-[#EA580C]">HIỆP HỘI CEO1983</span>
      </h1>
      <p class="text-2xl font-bold text-slate-700 tracking-wide mt-2">
        Nền tảng thẻ thông minh dành cho doanh nhân
      </p>

      <!-- 4 TIỆN ÍCH DẠNG THẺ PILL HÀNG NGANG -->
      <div class="flex items-center justify-center gap-6 mt-8">
        <!-- Pill 1 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Kết nối hội viên<br>thông minh</span>
        </div>

        <!-- Pill 2 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Tham gia sự kiện<br>đặc quyền VIP</span>
        </div>

        <!-- Pill 3 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Hợp tác kết nối<br>giao thương B2B</span>
        </div>

        <!-- Pill 4 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Điều hành, hỗ trợ<br>với trợ lý AI</span>
        </div>
      </div>
    </div>

    <!-- SHOWCASE 3 ĐIỆN THOẠI TRÊN BỤC 3D -->
    <div class="relative z-10 flex-1 flex items-center justify-center -mt-6">
      <div class="podium-stage"></div>
      <div class="podium-disc"></div>

      <div class="relative z-10 flex items-center justify-center gap-8 px-6">
        <!-- ĐIỆN THOẠI 1 (TRÁI - NGHIÊNG) -->
        <div class="w-[360px] h-[780px] phone-mockup-frame" style="transform: perspective(1200px) rotateY(16deg) rotateX(4deg) translateY(20px);">
          <div class="phone-mockup-inner w-full h-full">
            <div class="phone-island"><div class="phone-lens"></div></div>
            <img src="${APP_01}" class="w-full h-full object-cover object-top" alt="Trang Chủ Doanh Nhân" />
          </div>
        </div>

        <!-- ĐIỆN THOẠI 2 (CHÍNH GIỮA - THẺ HỘI VIÊN TO RÕ) -->
        <div class="w-[410px] h-[870px] phone-mockup-frame z-30" style="transform: scale(1.08) translateY(-25px); box-shadow: 0 45px 90px -10px rgba(10, 40, 100, 0.55), 0 0 40px rgba(0, 102, 255, 0.2);">
          <div class="phone-mockup-inner w-full h-full">
            <div class="phone-island"><div class="phone-lens"></div></div>
            <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top" alt="Thẻ Hội Viên VIP" />
          </div>
        </div>

        <!-- ĐIỆN THOẠI 3 (PHẢI - NGHIÊNG) -->
        <div class="w-[360px] h-[780px] phone-mockup-frame" style="transform: perspective(1200px) rotateY(-16deg) rotateX(4deg) translateY(20px);">
          <div class="phone-mockup-inner w-full h-full">
            <div class="phone-island"><div class="phone-lens"></div></div>
            <img src="${APP_EVENT_LIST}" class="w-full h-full object-cover object-top" alt="Sự Kiện Gala" />
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER WAVE VIONE -->
    <div class="bottom-wave-banner">
      <div class="vione-capsule">
        ${VIONE_EMBLEM_SVG}
        <span class="text-white text-3xl font-black font-['Montserrat'] tracking-wide">ViOne</span>
        <span class="text-white/90 text-3xl font-semibold tracking-wide">- Business Connect</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 2. POSTER 2: TOÀN BỘ ĐẶC QUYỀN CỦA DOANH NHÂN TRONG TẦM TAY
// ============================================================================
function generatePoster02Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>POSTER 2 - TOÀN BỘ ĐẶC QUYỀN CỦA DOANH NHÂN TRONG TẦM TAY</title>
  ${POSTER_COMMON_HEAD}
</head>
<body>
  <div class="poster-canvas bg-light-ambient pb-12">
    <!-- HEADER -->
    <div class="pt-16 pb-8 text-center">
      <h2 class="text-4xl font-extrabold text-[#002B7F] tracking-tight uppercase font-['Montserrat']">
        TOÀN BỘ ĐẶC QUYỀN CỦA DOANH NHÂN
      </h2>
      <h1 class="text-6xl font-black text-[#002B7F] tracking-tight uppercase font-['Montserrat'] mt-2">
        TRONG TẦM TAY
      </h1>
      <div class="w-36 h-2 bg-gradient-to-r from-blue-600 via-amber-500 to-blue-600 rounded-full mx-auto mt-4"></div>
    </div>

    <!-- LƯỚI 4 ĐẶC QUYỀN (2x2 GRID) -->
    <div class="px-14 grid grid-cols-2 gap-8 my-auto">
      
      <!-- CARD 01: THẺ THÔNG MINH -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">01</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Thẻ Thông Minh<br><span class="font-bold text-slate-600 text-xl">Cho Mọi Doanh Nhân</span>
          </div>
        </div>
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-inner flex items-center justify-center p-3 relative">
          <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top rounded-xl shadow-lg" alt="Thẻ thông minh" />
        </div>
      </div>

      <!-- CARD 02: TRAO ĐỔI DANH THIẾP 1 CHẠM -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">02</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Trao đổi danh thiếp,<br><span class="font-bold text-slate-600 text-xl">kết nối nhanh gọn</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-6 relative">
          <!-- HÌNH 2 ĐIỆN THOẠI CHẠM NHAU 1 CHẠM (NAMEDROP / NFC TAP) -->
          <div class="relative w-full h-[380px] flex items-center justify-center">
            <!-- VÒNG PHÁT QUANG NFC -->
            <div class="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-cyan-400/60 animate-pulse pointer-events-none"></div>
            <div class="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-amber-400/80 pointer-events-none"></div>
            <div class="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-400/30 backdrop-blur-md flex items-center justify-center text-cyan-700 font-black text-xs">
              ⚡ NFC
            </div>

            <!-- ĐIỆN THOẠI TRÁI -->
            <div class="absolute left-10 top-8 w-44 h-72 rounded-3xl bg-slate-900 border-4 border-slate-400 shadow-2xl p-2" style="transform: rotate(28deg);">
              <div class="w-full h-full rounded-2xl overflow-hidden bg-blue-900/60 p-2 text-white text-[10px]">
                <div class="w-10 h-10 rounded-full bg-amber-400/80 mx-auto mt-3 flex items-center justify-center font-bold text-slate-950">CEO</div>
                <div class="font-bold text-center mt-2 text-white">Trần Tuấn Anh</div>
                <div class="text-[9px] text-center text-blue-200">ViConnect Holdings</div>
              </div>
            </div>

            <!-- ĐIỆN THOẠI PHẢI -->
            <div class="absolute right-10 top-8 w-44 h-72 rounded-3xl bg-slate-900 border-4 border-slate-400 shadow-2xl p-2" style="transform: rotate(-28deg);">
              <div class="w-full h-full rounded-2xl overflow-hidden bg-slate-800/80 p-2 text-white text-[10px]">
                <div class="w-10 h-10 rounded-full bg-cyan-400/80 mx-auto mt-3 flex items-center justify-center font-bold text-slate-950">CEO</div>
                <div class="font-bold text-center mt-2 text-white">Đỗ Minh Thành</div>
                <div class="text-[9px] text-center text-slate-300">Công ty CP Tech</div>
              </div>
            </div>
          </div>

          <!-- HAI CHIP HỘI VIÊN KẾT NỐI -->
          <div class="w-full flex items-center justify-between gap-3 mt-4 pt-2">
            <div class="flex-1 p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">MT</div>
              <div class="truncate">
                <div class="text-xs font-black text-slate-900 truncate">Đỗ Minh Thành</div>
                <div class="text-[10px] text-slate-500 truncate">CEO Công ty CP Tech</div>
              </div>
            </div>
            <div class="text-blue-600 font-black text-base shrink-0">⇄</div>
            <div class="flex-1 p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">AT</div>
              <div class="truncate">
                <div class="text-xs font-black text-slate-900 truncate">Nguyễn Anh Tuấn</div>
                <div class="text-[10px] text-slate-500 truncate">ĐD Cty Cổ phần VICS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 03: CHECK IN SỰ KIỆN -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">03</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Check In sự kiện<br><span class="font-bold text-slate-600 text-xl">với đặc quyền VIP</span>
          </div>
        </div>
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-inner flex items-center justify-center p-3 relative">
          <img src="${APP_TICKET_QR}" class="w-full h-full object-cover object-top rounded-xl shadow-lg" alt="Check In Sự Kiện" />
        </div>
      </div>

      <!-- CARD 04: CHIA SẺ CƠ HỘI VÀ KẾT NỐI -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">04</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Chia sẻ cơ hội và<br><span class="font-bold text-slate-600 text-xl">kết nối hợp tác</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-amber-50/50 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-6 relative">
          <!-- MINH HỌA 3D B2B KẾT NỐI KINH DOANH -->
          <div class="w-full flex-1 flex flex-col items-center justify-center relative">
            <!-- ĐỒ THỊ TĂNG TRƯỞNG & BIỂU TƯỢNG BẮT TAY -->
            <div class="relative w-64 h-64 flex items-center justify-center">
              <svg class="w-full h-full" viewBox="0 0 200 200" fill="none">
                <!-- Bar charts -->
                <rect x="35" y="110" width="22" height="60" rx="6" fill="#3B82F6" />
                <rect x="65" y="85" width="22" height="85" rx="6" fill="#2563EB" />
                <rect x="95" y="65" width="22" height="105" rx="6" fill="#1D4ED8" />
                <rect x="125" y="45" width="22" height="125" rx="6" fill="#0A369D" />
                <rect x="155" y="25" width="22" height="145" rx="6" fill="#EA580C" />
                <!-- Trend line -->
                <path d="M40 100 L75 80 L105 60 L135 40 L165 20" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
                <circle cx="165" cy="20" r="7" fill="#F59E0B" />
              </svg>

              <!-- NÚT 3D AVATAR NETWORK -->
              <div class="absolute -top-3 left-6 w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-500 shadow-md flex items-center justify-center text-xl">
                👔
              </div>
              <div class="absolute -top-2 right-6 w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 shadow-md flex items-center justify-center text-xl">
                🤝
              </div>
              <div class="absolute -bottom-2 left-10 w-12 h-12 rounded-full bg-cyan-100 border-2 border-cyan-500 shadow-md flex items-center justify-center text-xl">
                📈
              </div>
              <div class="absolute -bottom-2 right-10 w-12 h-12 rounded-full bg-purple-100 border-2 border-purple-500 shadow-md flex items-center justify-center text-xl">
                🌐
              </div>
            </div>

            <!-- CHIP BẮT TAY TRUNG TÂM -->
            <div class="mt-6 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center gap-3">
              <span class="text-2xl">🤝</span>
              <div>
                <div class="text-sm font-black text-[#002B7F]">Cơ Hội Giao Thương B2B</div>
                <div class="text-xs text-slate-500 font-semibold">11 Nhóm ngành hợp tác nội khối</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- LOGO CHÂN TRANG -->
    <div class="pt-6 pb-2 text-center">
      <img src="${LOGO_CEO1983}" class="h-20 mx-auto object-contain drop-shadow" alt="CEO 1983" />
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 3. POSTER 3: NỀN TẢNG QUẢN TRỊ HIỆP HỘI CEO1983 (OVERVIEW WEB CRM)
// ============================================================================
function generatePoster03Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>POSTER 3 - NỀN TẢNG QUẢN TRỊ HIỆP HỘI CEO1983</title>
  ${POSTER_COMMON_HEAD}
</head>
<body>
  <div class="poster-canvas bg-light-ambient">
    <div class="skyline-overlay"></div>
    <div class="building-silhouette"></div>

    <!-- HEADER -->
    <div class="relative z-20 pt-12 px-12 text-center">
      <img src="${LOGO_CEO1983}" class="h-24 mx-auto object-contain drop-shadow" alt="CEO 1983" />
      <h1 class="text-[54px] font-black tracking-tight uppercase leading-tight font-['Montserrat'] mt-4">
        <span class="text-[#0A369D]">NỀN TẢNG QUẢN TRỊ </span><span class="text-[#EA580C]">HIỆP HỘI CEO1983</span>
      </h1>
      <p class="text-2xl font-bold text-slate-700 tracking-wide mt-2">
        Quản trị cơ hội và điều hành tổ chức chuyên nghiệp, bền vững.
      </p>

      <!-- 4 TIỆN ÍCH DẠNG THẺ PILL HÀNG NGANG -->
      <div class="flex items-center justify-center gap-6 mt-8">
        <!-- Pill 1 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Quản lý cơ cấu<br>hội viên thông minh</span>
        </div>

        <!-- Pill 2 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Kết nối kinh doanh<br>giao thương B2B</span>
        </div>

        <!-- Pill 3 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Báo cáo, quản lý<br>tài chính nhanh gọn</span>
        </div>

        <!-- Pill 4 -->
        <div class="feature-pill-badge">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-800 leading-snug">Quản lý &amp; xây dựng<br>truyền thông</span>
        </div>
      </div>
    </div>

    <!-- SHOWCASE MÀN HÌNH IMAC 3D NẰM TRÊN BỤC -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center -mt-4">
      <div class="podium-stage"></div>
      <div class="podium-disc"></div>

      <!-- IMAC MOCKUP TO RÕ SIÊU NÉT -->
      <div class="relative z-20 w-[1140px]">
        <div class="imac-mockup-frame">
          <div class="imac-mockup-inner w-full h-[650px]">
            <img src="${CRM_01}" class="w-full h-full object-cover object-top" alt="CRM Dashboard Tổng Quan" />
          </div>
        </div>
        <!-- Chân đế iMac nhôm nguyên khối -->
        <div class="imac-stand"></div>
        <div class="imac-base"></div>
      </div>
    </div>

    <!-- FOOTER WAVE VIONE -->
    <div class="bottom-wave-banner">
      <div class="vione-capsule">
        ${VIONE_EMBLEM_SVG}
        <span class="text-white text-3xl font-black font-['Montserrat'] tracking-wide">ViOne</span>
        <span class="text-white/90 text-3xl font-semibold tracking-wide">- Business Connect</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 4. POSTER 4: NỀN TẢNG HỖ TRỢ QUẢN LÝ VÀ ĐIỀU HÀNH DÀNH RIÊNG CHO HIỆP HỘI
// ============================================================================
function generatePoster04Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>POSTER 4 - NỀN TẢNG HỖ TRỢ QUẢN LÝ VÀ ĐIỀU HÀNH DÀNH RIÊNG CHO HIỆP HỘI</title>
  ${POSTER_COMMON_HEAD}
</head>
<body>
  <div class="poster-canvas bg-light-ambient pb-12">
    <!-- HEADER -->
    <div class="pt-16 pb-8 text-center">
      <h2 class="text-4xl font-extrabold text-[#002B7F] tracking-tight uppercase font-['Montserrat']">
        NỀN TẢNG HỖ TRỢ QUẢN LÝ VÀ ĐIỀU HÀNH
      </h2>
      <h1 class="text-6xl font-black text-[#EA580C] tracking-tight uppercase font-['Montserrat'] mt-2">
        DÀNH RIÊNG CHO HIỆP HỘI
      </h1>
      <div class="w-36 h-2 bg-gradient-to-r from-blue-600 via-amber-500 to-blue-600 rounded-full mx-auto mt-4"></div>
    </div>

    <!-- LƯỚI 4 TÍNH NĂNG CRM (2x2 GRID) -->
    <div class="px-14 grid grid-cols-2 gap-8 my-auto">
      
      <!-- CARD 01: QUẢN LÝ & PHÂN QUYỀN HỘI VIÊN -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">01</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Quản lí &amp; phân quyền<br><span class="font-bold text-slate-600 text-xl">cho mỗi hội viên</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-3 relative">
          <!-- IMAC MINI MOCKUP -->
          <div class="w-full flex-1 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-white">
            <img src="${CRM_03}" class="w-full h-full object-cover object-top" alt="Quản trị hội viên 360" />
          </div>
          <!-- 3D USER AVATAR BADGE FLOATING -->
          <div class="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center justify-center text-3xl border-2 border-white">
            👥
          </div>
        </div>
      </div>

      <!-- CARD 02: CẬP NHẬT, THEO DÕI TIẾN TRÌNH SỰ KIỆN -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">02</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Cập nhật, theo dõi<br><span class="font-bold text-slate-600 text-xl">tiến trình sự kiện</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-3 relative">
          <!-- IMAC MINI MOCKUP -->
          <div class="w-full flex-1 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-white">
            <img src="${CRM_04}" class="w-full h-full object-cover object-top" alt="Quản lý sự kiện Gala" />
          </div>
          <!-- 3D CALENDAR CLOCK FLOATING BADGE -->
          <div class="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-cyan-600 text-white shadow-xl flex items-center justify-center text-3xl border-2 border-white">
            📅
          </div>
        </div>
      </div>

      <!-- CARD 03: BÁO CÁO TÀI CHÍNH, DOANH THU TỔNG THỂ -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">03</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Báo cáo tài chính,<br><span class="font-bold text-slate-600 text-xl">doanh thu tổng thể</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-3 relative">
          <!-- IMAC MINI MOCKUP -->
          <div class="w-full flex-1 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-white">
            <img src="${CRM_06}" class="w-full h-full object-cover object-top" alt="Báo cáo tài chính thu chi" />
          </div>
          <!-- 3D FINANCE INVOICE BADGE -->
          <div class="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-center text-3xl border-2 border-white">
            📊
          </div>
        </div>
      </div>

      <!-- CARD 04: KẾT NỐI KINH DOANH, HẸN GẶP ĐỐI TÁC -->
      <div class="grid-feature-card h-[680px]">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-black text-[#002B7F] font-['Montserrat']">04</span>
          <div class="text-2xl font-black text-slate-800 leading-tight">
            Kết nối kinh doanh,<br><span class="font-bold text-slate-600 text-xl">hẹn gặp đối tác</span>
          </div>
        </div>
        
        <div class="flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-3 relative">
          <!-- IMAC MINI MOCKUP -->
          <div class="w-full flex-1 rounded-xl overflow-hidden border-2 border-slate-300 shadow-md bg-white">
            <img src="${CRM_08}" class="w-full h-full object-cover object-top" alt="Giao thương và điều hành" />
          </div>
          <!-- 3D HANDSHAKE BADGE -->
          <div class="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-blue-700 text-white shadow-xl flex items-center justify-center text-3xl border-2 border-white">
            🤝
          </div>
        </div>
      </div>

    </div>

    <!-- LOGO CHÂN TRANG -->
    <div class="pt-6 pb-2 text-center">
      <img src="${LOGO_CEO1983}" class="h-20 mx-auto object-contain drop-shadow" alt="CEO 1983" />
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 5. POSTER 4-IN-1 COMPOSITE: GHÉP 4 POSTER TRÊN 1 KHỔ GIẤY 2x2 CỰC NÉT
// ============================================================================
function generatePoster4in1Html() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>BỘ 4 POSTER TỔNG THỂ HỆ SINH THÁI CEO 1983</title>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; background: #0F172A; }
    .quad-grid {
      width: 2800px;
      height: 3960px;
      display: grid;
      grid-template-columns: 1400px 1400px;
      grid-template-rows: 1980px 1980px;
      background: #E2E8F0;
      gap: 0;
    }
    .poster-item {
      width: 1400px;
      height: 1980px;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  <div class="quad-grid">
    <img class="poster-item" src="./POSTER_01_APP_TONG_QUAN.png" alt="Poster 1" />
    <img class="poster-item" src="./POSTER_02_APP_DAC_QUYEN.png" alt="Poster 2" />
    <img class="poster-item" src="./POSTER_03_CRM_TONG_QUAN.png" alt="Poster 3" />
    <img class="poster-item" src="./POSTER_04_CRM_DIEU_HANH.png" alt="Poster 4" />
  </div>
</body>
</html>`;
}

module.exports = {
  generatePoster01Html,
  generatePoster02Html,
  generatePoster03Html,
  generatePoster04Html,
  generatePoster4in1Html
};
