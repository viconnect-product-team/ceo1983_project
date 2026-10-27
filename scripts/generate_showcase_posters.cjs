/**
 * GENERATE_SHOWCASE_POSTERS.CJS
 * 
 * Tạo các Poster Showcase toàn cảnh theo đúng phong cách 2 ảnh người dùng cung cấp:
 * 1. POSTER_SHOWCASE_APP_PANORAMA.html: Dàn 4 điện thoại iPhone nằm ngang (chuẩn theo Ảnh 1)
 * 2. POSTER_SHOWCASE_CRM_PANORAMA.html: Dàn 3 màn hình Desktop CMS/CRM nằm ngang (chuẩn theo Ảnh 2)
 * 3. POSTER_MASTER_HE_SINH_THAI_CEO1983.html: Poster Master A3/A2 khổ đứng kết hợp hoàn hảo cả CRM (trên) và App (dưới) với nền nửa xanh nửa trắng.
 */

const fs = require('fs');
const path = require('path');
const assets = require('./poster_assets_and_styles.cjs');

const {
  LOGO_CEO1983,
  LOGO_VICONNECT,
  BG_SKYLINE,
  BG_SKYLINE_LAKE,
  BG_BOARDROOM,
  BG_BANQUET,
  CRM_01,
  CRM_MEMBERS_TABLE,
  CRM_SEATING_CHART,
  CRM_FINANCE_CASHBOOK,
  APP_HOME_CLEAN,
  APP_CARD_CLEAN,
  APP_B2B_MARKET,
  APP_TICKET_QR,
  VIONE_EMBLEM_SVG
} = assets;

// ============================================================================
// 1. POSTER SHOWCASE MOBILE APP (CHUẨN ẢNH 1: DÀN 4 IPHONE NẰM NGANG)
// ============================================================================
function generateShowcaseAppPanoramaHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>POSTER SHOWCASE MOBILE APP CEO 1983 - PANORAMA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Montserrat:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; background: #071329; color: #FFFFFF; }
    .panorama-canvas {
      width: 2560px;
      height: 1440px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      /* NỀN NỬA XANH NỬA TRẮNG / XÁM NGỌC TRAI */
      background: linear-gradient(180deg, #021B4D 0%, #06317E 36%, #E8EEF8 36.1%, #F4F7FC 100%);
    }
    .phone-mockup-p1 {
      width: 480px;
      height: 980px;
      border-radius: 54px;
      background: #020617;
      padding: 13px;
      box-shadow: 0 35px 80px -10px rgba(10, 35, 90, 0.45), 0 0 0 4px #475569, 0 0 0 8px #0F172A;
      position: relative;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .phone-inner-p1 {
      width: 100%;
      height: 100%;
      border-radius: 42px;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
    }
    .phone-island-p1 {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 28px;
      background: #000000;
      border-radius: 20px;
      z-index: 40;
    }
    @page {
      size: 2560px 1440px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="panorama-canvas">
    
    <!-- BACKGROUND CHÂN THỰC NỬA TRÊN -->
    <div class="absolute top-0 left-0 right-0 h-[36%] overflow-hidden pointer-events-none opacity-30">
      <img src="${BG_SKYLINE_LAKE}" class="w-full h-full object-cover object-center" alt="Hanoi Skyline" />
      <div class="absolute inset-0 bg-gradient-to-b from-[#021B4D]/70 via-[#021B4D]/90 to-[#021B4D]"></div>
    </div>

    <!-- HEADER TOP (NỬA XANH) -->
    <div class="relative z-10 px-20 pt-10 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <img src="${LOGO_CEO1983}" class="h-20 object-contain drop-shadow" alt="CEO 1983" />
        <div class="h-12 w-[2px] bg-white/25"></div>
        <div>
          <div class="text-amber-400 font-black text-sm tracking-widest uppercase">HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</div>
          <div class="text-white font-extrabold text-2xl font-['Montserrat'] tracking-tight">HỆ SINH THÁI DOANH NHÂN CLB CEO 1983</div>
        </div>
      </div>

      <div class="text-right">
        <span class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-sm font-black tracking-widest uppercase">
          ★ VĂN PHÒNG DOANH NHÂN BỎ TÚI (MOBILE APP)
        </span>
        <div class="text-blue-100 text-xs font-semibold mt-1">Nền tảng thẻ thông minh, giao thương B2B & check-in sự kiện 1 chạm</div>
      </div>
    </div>

    <!-- DÀN 4 IPHONE NẰM NGANG (CHUẨN ẢNH 1) -->
    <div class="relative z-20 px-16 flex items-center justify-center gap-12 my-auto pt-6">

      <!-- PHONE 1: TRANG CHỦ DOANH NHÂN -->
      <div class="flex flex-col items-center">
        <div class="phone-mockup-p1">
          <div class="phone-inner-p1">
            <div class="phone-island-p1"></div>
            <img src="${APP_HOME_CLEAN}" class="w-full h-full object-cover object-top" alt="Trang chủ doanh nhân" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-blue-700 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">01. Trang Chủ</div>
          <div class="text-slate-900 font-extrabold text-base">Tin tức, Banner Gala &amp; 14 Tính Năng</div>
        </div>
      </div>

      <!-- PHONE 2: THẺ HỘI VIÊN VIP & MÃ QR -->
      <div class="flex flex-col items-center">
        <div class="phone-mockup-p1" style="transform: translateY(-16px); box-shadow: 0 45px 95px -10px rgba(10, 35, 90, 0.55), 0 0 0 4px #F59E0B, 0 0 0 8px #0F172A;">
          <div class="phone-inner-p1">
            <div class="phone-island-p1"></div>
            <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top" alt="Thẻ hội viên VIP" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider mb-1">02. Thẻ Hội Viên VIP</div>
          <div class="text-slate-900 font-extrabold text-base">Định Danh Số, Mã QR &amp; NameDrop NFC</div>
        </div>
      </div>

      <!-- PHONE 3: SÀN GIAO THƯƠNG B2B -->
      <div class="flex flex-col items-center">
        <div class="phone-mockup-p1">
          <div class="phone-inner-p1">
            <div class="phone-island-p1"></div>
            <img src="${APP_B2B_MARKET}" class="w-full h-full object-cover object-top" alt="Sàn giao thương B2B" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-blue-700 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">03. Giao Thương B2B</div>
          <div class="text-slate-900 font-extrabold text-base">Niêm Yết Sản Phẩm &amp; Deal Nội Khối 11 Ngành</div>
        </div>
      </div>

      <!-- PHONE 4: SOÁT VÉ QR & CHECK-IN GALA -->
      <div class="flex flex-col items-center">
        <div class="phone-mockup-p1">
          <div class="phone-inner-p1">
            <div class="phone-island-p1"></div>
            <img src="${APP_TICKET_QR}" class="w-full h-full object-cover object-top" alt="Vé QR check-in" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-blue-700 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">04. Vé Sự Kiện &amp; QR</div>
          <div class="text-slate-900 font-extrabold text-base">Check-in Khán Phòng &amp; Bàn Tiệc VIP 1 Giây</div>
        </div>
      </div>

    </div>

    <!-- FOOTER CHÂN TRANG (NỬA TRẮNG/SÁNG) -->
    <div class="relative z-10 px-20 pb-8 pt-4 flex items-center justify-between border-t border-slate-300 text-slate-600 text-sm font-semibold">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Giải pháp phần mềm độc quyền phát triển bởi <strong>ViConnect Technology</strong></span>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#002B7F] text-white font-bold text-sm shadow">
          ${VIONE_EMBLEM_SVG}
          <span>ViOne - Business Connect</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ============================================================================
// 2. POSTER SHOWCASE WEB CRM (CHUẨN ẢNH 2: DÀN 3 MÀN HÌNH DESKTOP CMS/CRM)
// ============================================================================
function generateShowcaseCrmPanoramaHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>POSTER SHOWCASE WEB CRM CEO 1983 - PANORAMA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Montserrat:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; background: #071329; color: #FFFFFF; }
    .panorama-canvas {
      width: 2560px;
      height: 1440px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      /* NỀN NỬA XANH NỬA TRẮNG / XÁM NGỌC TRAI */
      background: linear-gradient(180deg, #021B4D 0%, #06317E 36%, #E8EEF8 36.1%, #F4F7FC 100%);
    }
    .desktop-frame-p2 {
      width: 740px;
      height: 860px;
      border-radius: 28px;
      background: #FFFFFF;
      padding: 10px;
      box-shadow: 0 35px 80px -10px rgba(10, 35, 90, 0.35), 0 0 0 1px rgba(255,255,255,0.4), 0 0 0 5px #0F172A;
      display: flex;
      flex-direction: column;
    }
    .desktop-topbar-p2 {
      height: 38px;
      background: #F1F5F9;
      border-radius: 18px 18px 0 0;
      border-bottom: 1px solid #CBD5E1;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
    }
    .desktop-inner-p2 {
      flex: 1;
      border-radius: 0 0 18px 18px;
      overflow: hidden;
      background: #FFFFFF;
    }
    @page {
      size: 2560px 1440px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="panorama-canvas">
    
    <!-- BACKGROUND CHÂN THỰC NỬA TRÊN (PHÒNG HỌP & SKYLINE) -->
    <div class="absolute top-0 left-0 right-0 h-[36%] overflow-hidden pointer-events-none opacity-25">
      <img src="${BG_BOARDROOM}" class="w-full h-full object-cover object-center" alt="Boardroom" />
      <div class="absolute inset-0 bg-gradient-to-b from-[#021B4D]/70 via-[#021B4D]/90 to-[#021B4D]"></div>
    </div>

    <!-- HEADER TOP (NỬA XANH) -->
    <div class="relative z-10 px-20 pt-10 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <img src="${LOGO_CEO1983}" class="h-20 object-contain drop-shadow" alt="CEO 1983" />
        <div class="h-12 w-[2px] bg-white/25"></div>
        <div>
          <div class="text-amber-400 font-black text-sm tracking-widest uppercase">HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</div>
          <div class="text-white font-extrabold text-2xl font-['Montserrat'] tracking-tight">CỔNG QUẢN TRỊ TRUNG TÂM WEB CRM CEO 1983</div>
        </div>
      </div>

      <div class="text-right">
        <span class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-sm font-black tracking-widest uppercase">
          ⚡ NỀN TẢNG ĐIỀU HÀNH 6 BAN CHUYÊN MÔN
        </span>
        <div class="text-blue-100 text-xs font-semibold mt-1">Dành cho Chủ Tịch, Ban Điều Hành, Ban Thư Ký &amp; Trưởng/Phó Ban</div>
      </div>
    </div>

    <!-- DÀN 3 MÀN HÌNH DESKTOP WEB CRM NẰM NGANG (CHUẨN ẢNH 2) -->
    <div class="relative z-20 px-16 flex items-center justify-center gap-12 my-auto pt-6">

      <!-- MÀN 1: EXECUTIVE DASHBOARD & BI -->
      <div class="flex flex-col items-center">
        <div class="desktop-frame-p2">
          <div class="desktop-topbar-p2">
            <div class="w-3.5 h-3.5 rounded-full bg-red-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
            <div class="mx-auto text-[11px] font-mono text-slate-500 font-bold">ceo1983.vione.vn/crm/dashboard</div>
          </div>
          <div class="desktop-inner-p2">
            <img src="${CRM_01}" class="w-full h-full object-cover object-top" alt="Executive Dashboard" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-blue-700 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">01. Tổng Quan Điều Hành</div>
          <div class="text-slate-900 font-extrabold text-base">Dashboard 360°, 8 Chỉ Số Sức Khỏe &amp; Doanh Thu</div>
        </div>
      </div>

      <!-- MÀN 2: QUẢN TRỊ 500+ HỘI VIÊN & PHÂN BAN -->
      <div class="flex flex-col items-center">
        <div class="desktop-frame-p2" style="transform: translateY(-16px); box-shadow: 0 45px 95px -10px rgba(10, 35, 90, 0.45), 0 0 0 4px #0284C7, 0 0 0 8px #0F172A;">
          <div class="desktop-topbar-p2">
            <div class="w-3.5 h-3.5 rounded-full bg-red-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
            <div class="mx-auto text-[11px] font-mono text-slate-500 font-bold">ceo1983.vione.vn/crm/members-table</div>
          </div>
          <div class="desktop-inner-p2">
            <img src="${CRM_MEMBERS_TABLE}" class="w-full h-full object-cover object-top" alt="Quản lý hội viên" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-cyan-600 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">02. Quản Trị Hội Viên</div>
          <div class="text-slate-900 font-extrabold text-base">Danh Sách 500+ Doanh Nghiệp, Phân Quyền RBAC 6 Ban</div>
        </div>
      </div>

      <!-- MÀN 3: SƠ ĐỒ BÀN TIỆC GALA & TÀI CHÍNH VIETQR -->
      <div class="flex flex-col items-center">
        <div class="desktop-frame-p2">
          <div class="desktop-topbar-p2">
            <div class="w-3.5 h-3.5 rounded-full bg-red-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
            <div class="mx-auto text-[11px] font-mono text-slate-500 font-bold">ceo1983.vione.vn/crm/seating-chart</div>
          </div>
          <div class="desktop-inner-p2">
            <img src="${CRM_SEATING_CHART}" class="w-full h-full object-cover object-top" alt="Sơ đồ bàn tiệc" />
          </div>
        </div>
        <div class="mt-4 text-center">
          <div class="inline-block px-4 py-1 rounded-full bg-blue-700 text-white font-black text-xs font-mono uppercase tracking-wider mb-1">03. Sắp Bàn Tiệc &amp; Tài Chính</div>
          <div class="text-slate-900 font-extrabold text-base">Khán Phòng Bàn Tròn VIP, Tự Động Hóa Chỗ Ngồi</div>
        </div>
      </div>

    </div>

    <!-- FOOTER CHÂN TRANG (NỬA TRẮNG/SÁNG) -->
    <div class="relative z-10 px-20 pb-8 pt-4 flex items-center justify-between border-t border-slate-300 text-slate-600 text-sm font-semibold">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></span>
        <span>Phát triển trên nền tảng kiến trúc mở chuẩn doanh nghiệp: <strong>NestJS + PostgreSQL + Next.js</strong></span>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#002B7F] text-white font-bold text-sm shadow">
          ${VIONE_EMBLEM_SVG}
          <span>ViOne - Business Connect</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ============================================================================
// 3. POSTER MASTER TOÀN DIỆN (A3/A2 KHỔ ĐỨNG - NỬA XANH NỬA TRẮNG)
// ============================================================================
function generatePosterMasterAllInOneHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>POSTER TỔNG THỂ HỆ SINH THÁI CEO 1983 - MASTER ALL-IN-ONE</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; background: #071329; }
    .master-canvas {
      width: 1400px;
      height: 1980px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      /* NỬA TRÊN XANH NAVY DOANH NHÂN / NỬA DƯỚI TRẮNG SÁNG */
      background: linear-gradient(180deg, #021B4D 0%, #06317E 48%, #FFFFFF 48.1%, #F8FAFC 100%);
    }
    .crm-mini-desktop {
      border-radius: 16px;
      background: #FFFFFF;
      padding: 6px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      flex-direction: column;
    }
    .phone-mini-mockup {
      border-radius: 36px;
      background: #020617;
      padding: 8px;
      box-shadow: 0 20px 45px rgba(10, 30, 80, 0.25), 0 0 0 2px #CBD5E1;
      display: flex;
      flex-direction: column;
    }
    @page {
      size: 1400px 1980px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="master-canvas">

    <!-- BACKGROUND CHÂN THỰC NỬA TRÊN -->
    <div class="absolute top-0 left-0 right-0 h-[48%] overflow-hidden pointer-events-none opacity-25">
      <img src="${BG_BANQUET}" class="w-full h-full object-cover object-center" alt="Gala Banquet" />
      <div class="absolute inset-0 bg-gradient-to-b from-[#021B4D]/75 via-[#021B4D]/85 to-[#06317E]"></div>
    </div>

    <!-- KHỐI 1: NỬA TRÊN - WEB CRM ĐIỀU HÀNH HIỆP HỘI (NỀN XANH) -->
    <div class="relative z-10 px-12 pt-12 pb-6 flex flex-col justify-between h-[48%]">
      
      <!-- HEADER CỦA NỬA TRÊN -->
      <div class="flex items-center justify-between border-b border-white/15 pb-4">
        <div class="flex items-center gap-4">
          <img src="${LOGO_CEO1983}" class="h-16 object-contain drop-shadow" alt="CEO 1983" />
          <div>
            <div class="text-amber-400 font-black text-xs uppercase tracking-wider">HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</div>
            <div class="text-white font-extrabold text-xl font-['Montserrat']">CỔNG QUẢN TRỊ TRUNG TÂM WEB CRM</div>
          </div>
        </div>

        <div class="px-5 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 font-mono font-black text-xs uppercase tracking-wider">
          PHÂN HỆ 01: BAN ĐIỀU HÀNH &amp; 6 BAN
        </div>
      </div>

      <!-- TIÊU ĐỀ NỬA TRÊN -->
      <div class="text-center my-auto">
        <h2 class="text-3xl font-black text-white uppercase font-['Montserrat'] tracking-tight">
          NỀN TẢNG QUẢN TRỊ &amp; ĐIỀU HÀNH HIỆP HỘI TOÀN DIỆN
        </h2>
        <p class="text-cyan-200 text-sm font-semibold mt-1">
          Số hóa 100% nghiệp vụ 500+ Hội viên · Sơ đồ xếp bàn tiệc Gala · Tài chính thu chi VietQR
        </p>
      </div>

      <!-- DÀN 3 MÀN HÌNH CRM (KIỂU ẢNH 2) -->
      <div class="grid grid-cols-3 gap-6 my-auto">
        
        <!-- MÀN 1: DASHBOARD BI -->
        <div class="flex flex-col items-center">
          <div class="crm-mini-desktop w-full h-[220px]">
            <div class="w-full flex-1 rounded-lg overflow-hidden bg-slate-100">
              <img src="${CRM_01}" class="w-full h-full object-cover object-top" alt="Dashboard CRM" />
            </div>
          </div>
          <span class="text-xs font-black text-cyan-300 mt-2">1. Dashboard Executive BI</span>
        </div>

        <!-- MÀN 2: HỘI VIÊN -->
        <div class="flex flex-col items-center">
          <div class="crm-mini-desktop w-full h-[220px] ring-2 ring-amber-400">
            <div class="w-full flex-1 rounded-lg overflow-hidden bg-slate-100">
              <img src="${CRM_MEMBERS_TABLE}" class="w-full h-full object-cover object-top" alt="Hội viên 360" />
            </div>
          </div>
          <span class="text-xs font-black text-amber-400 mt-2">2. Quản Trị 500+ Hội Viên</span>
        </div>

        <!-- MÀN 3: BÀN TIỆC GALA -->
        <div class="flex flex-col items-center">
          <div class="crm-mini-desktop w-full h-[220px]">
            <div class="w-full flex-1 rounded-lg overflow-hidden bg-slate-100">
              <img src="${CRM_SEATING_CHART}" class="w-full h-full object-cover object-top" alt="Bàn tiệc Gala" />
            </div>
          </div>
          <span class="text-xs font-black text-cyan-300 mt-2">3. Sơ Đồ Bàn Tiệc Gala VIP</span>
        </div>

      </div>

    </div>

    <!-- DẢI PHÂN CÁCH TRUNG TÂM SANG TRỌNG -->
    <div class="relative z-20 -my-4 flex items-center justify-center">
      <div class="px-8 py-2 rounded-full bg-[#002B7F] border-2 border-amber-400 shadow-xl flex items-center gap-3">
        <span class="text-amber-400 font-black text-sm">⚡ ĐỒNG BỘ REAL-TIME</span>
        <div class="w-4 h-[2px] bg-white/40"></div>
        <span class="text-white font-extrabold text-sm font-['Montserrat']">KẾT NỐI KHÉP KÍN GIỮA QUẢN TRỊ &amp; HỘI VIÊN</span>
      </div>
    </div>

    <!-- KHỐI 2: NỬA DƯỚI - ỨNG DỤNG DI ĐỘNG HỘI VIÊN (NỀN TRẮNG SÁNG) -->
    <div class="relative z-10 px-12 pt-6 pb-8 flex flex-col justify-between h-[48%]">
      
      <!-- HEADER CỦA NỬA DƯỚI -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-blue-600"></span>
          <div class="text-[#002B7F] font-black text-base font-['Montserrat']">VĂN PHÒNG DOANH NHÂN BỎ TÚI (MOBILE APP)</div>
        </div>

        <div class="px-5 py-1.5 rounded-full bg-blue-100 text-blue-900 font-mono font-black text-xs uppercase tracking-wider">
          PHÂN HỆ 02: 500+ DOANH NHÂN HỘI VIÊN
        </div>
      </div>

      <!-- TIÊU ĐỀ NỬA DƯỚI -->
      <div class="text-center my-auto">
        <h2 class="text-3xl font-black text-[#002B7F] uppercase font-['Montserrat'] tracking-tight">
          TOÀN BỘ ĐẶC QUYỀN HỘI VIÊN TRONG TẦM TAY
        </h2>
        <p class="text-slate-600 text-sm font-semibold mt-1">
          Thẻ danh thiếp số 1 chạm · Sàn B2B nội khối · Vé sự kiện Gala &amp; Check-in QR 1 giây
        </p>
      </div>

      <!-- DÀN 4 IPHONE NẰM NGANG (KIỂU ẢNH 1) -->
      <div class="grid grid-cols-4 gap-6 my-auto">
        
        <!-- PHONE 1: TRANG CHỦ -->
        <div class="flex flex-col items-center">
          <div class="phone-mini-mockup w-full h-[250px]">
            <div class="w-full flex-1 rounded-[24px] overflow-hidden bg-white">
              <img src="${APP_HOME_CLEAN}" class="w-full h-full object-cover object-top" alt="Trang chủ" />
            </div>
          </div>
          <span class="text-xs font-extrabold text-slate-800 mt-2">Trang Chủ Số</span>
        </div>

        <!-- PHONE 2: THẺ VIP -->
        <div class="flex flex-col items-center">
          <div class="phone-mini-mockup w-full h-[250px] ring-2 ring-amber-500">
            <div class="w-full flex-1 rounded-[24px] overflow-hidden bg-white">
              <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top" alt="Thẻ VIP" />
            </div>
          </div>
          <span class="text-xs font-black text-amber-600 mt-2">Thẻ VIP &amp; QR</span>
        </div>

        <!-- PHONE 3: GIAO THƯƠNG B2B -->
        <div class="flex flex-col items-center">
          <div class="phone-mini-mockup w-full h-[250px]">
            <div class="w-full flex-1 rounded-[24px] overflow-hidden bg-white">
              <img src="${APP_B2B_MARKET}" class="w-full h-full object-cover object-top" alt="Sàn B2B" />
            </div>
          </div>
          <span class="text-xs font-extrabold text-slate-800 mt-2">Sàn Giao Thương</span>
        </div>

        <!-- PHONE 4: SOÁT VÉ QR -->
        <div class="flex flex-col items-center">
          <div class="phone-mini-mockup w-full h-[250px]">
            <div class="w-full flex-1 rounded-[24px] overflow-hidden bg-white">
              <img src="${APP_TICKET_QR}" class="w-full h-full object-cover object-top" alt="Vé sự kiện" />
            </div>
          </div>
          <span class="text-xs font-extrabold text-slate-800 mt-2">Vé Gala &amp; Check-in</span>
        </div>

      </div>

      <!-- FOOTER DƯỚI CÙNG -->
      <div class="pt-4 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500 font-semibold">
        <div>Đơn vị phát triển công nghệ: <strong>ViConnect Technology</strong></div>
        <div class="flex items-center gap-2">
          ${VIONE_EMBLEM_SVG}
          <span class="font-extrabold text-slate-800">ViOne - Nền tảng kết nối số doanh nghiệp Việt Nam</span>
        </div>
      </div>

    </div>

  </div>
</body>
</html>`;
}

module.exports = {
  generateShowcaseAppPanoramaHtml,
  generateShowcaseCrmPanoramaHtml,
  generatePosterMasterAllInOneHtml
};
