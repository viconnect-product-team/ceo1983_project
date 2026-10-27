/**
 * GENERATE_HD_PRESENTATION_SLIDES.CJS
 * 
 * Bộ Slide Trình Chiếu Hệ Sinh Thái Số Toàn Diện CEO 1983 (15 Slides Chuẩn 16:9 Vector Siêu Nét).
 * Thiết kế mới:
 * 1. NỀN NỬA XANH NỬA TRẮNG (Dual-Tone Corporate Split Layout):
 *    - Nửa trái: Xanh Navy Doanh Nhân đậm, phủ ảnh background chân thực (Skyline Hà Nội, Dạ tiệc Gala, Phòng họp).
 *    - Nửa phải: Nền trắng tinh khiết/xám ngọc trai, giúp ảnh chụp màn hình CRM & App nổi bần bật, rõ ràng 100%.
 * 2. CÁC CHỨC NĂNG CRM HIỂN THỊ TO RÕ, ĐẦY ĐỦ:
 *    - Dashboard BI 360, Bảng 500+ Hội viên, Sơ đồ xếp bàn tiệc Gala, Tài chính VietQR, Bảng giao việc Kanban.
 */

const assets = require('./poster_assets_and_styles.cjs');
const {
  LOGO_CEO1983,
  LOGO_VICONNECT,
  CRM_01,
  CRM_MEMBERS_TABLE,
  CRM_SEATING_CHART,
  CRM_FINANCE_CASHBOOK,
  CRM_KANBAN_TASKS,
  APP_HOME_CLEAN,
  APP_CARD_CLEAN,
  APP_B2B_MARKET,
  APP_TICKET_QR,
  APP_EVENT_LIST,
  BG_SKYLINE,
  BG_SKYLINE_LAKE,
  BG_BOARDROOM,
  BG_BANQUET,
  BG_OPERATIONS,
  VIONE_EMBLEM_SVG
} = assets;

function generateHdSlideDeckHtml() {
  const commonHead = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        margin: 0;
        padding: 0;
        background: #0F172A;
        color: #0F172A;
      }
      @page {
        size: 1920px 1080px;
        margin: 0;
      }
      .slide-page {
        width: 1920px;
        height: 1080px;
        min-width: 1920px;
        min-height: 1080px;
        page-break-after: always;
        page-break-inside: avoid;
        position: relative;
        overflow: hidden;
        display: flex;
        /* NỀN NỬA XANH NỬA TRẮNG CHUẨN DOANH NGHIỆP */
        background: #FFFFFF;
      }
      /* NỬA TRÁI XANH DOANH NHÂN */
      .slide-left-panel {
        width: 720px;
        height: 100%;
        background: linear-gradient(145deg, #021B4D 0%, #002B7F 50%, #082E6E 100%);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 54px;
        color: #FFFFFF;
        z-index: 10;
        box-shadow: 20px 0 50px rgba(0, 20, 60, 0.25);
      }
      .slide-left-bg {
        position: absolute;
        inset: 0;
        opacity: 0.22;
        object-fit: cover;
        pointer-events: none;
      }
      .slide-left-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(2,27,77,0.85) 0%, rgba(0,43,127,0.92) 100%);
      }
      /* NỬA PHẢI TRẮNG SÁNG SHOWCASE */
      .slide-right-stage {
        flex: 1;
        height: 100%;
        background: #F8FAFC;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 50px 60px;
        overflow: hidden;
      }
      /* MAC BROWSER WINDOW MOCKUP */
      .mac-browser-window {
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: #FFFFFF;
        box-shadow: 0 25px 60px -15px rgba(15, 30, 65, 0.15), 0 0 0 1px #E2E8F0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .mac-titlebar {
        height: 42px;
        background: #F1F5F9;
        border-bottom: 1px solid #E2E8F0;
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 8px;
        font-family: monospace;
        font-size: 12px;
        color: #64748B;
      }
      /* IPHONE MOCKUP */
      .phone-stage-card {
        border-radius: 46px;
        background: #020617;
        padding: 10px;
        box-shadow: 0 25px 60px -10px rgba(10, 30, 80, 0.3), 0 0 0 3px #CBD5E1;
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .phone-stage-card .island {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 24px;
        background: #000;
        border-radius: 20px;
        z-index: 30;
      }
    </style>
  `;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <title>BỘ SLIDE TỔNG THỂ HỆ SINH THÁI CEO 1983 - ULTRA HD 16:9</title>
  ${commonHead}
</head>
<body>

  <!-- ========================================================================= -->
  <!-- SLIDE 1: BÌA BÁO CÁO (COVER SLIDE - NỀN XANH SANG TRỌNG + BACKGROUND CHÂN THỰC) -->
  <!-- ========================================================================= -->
  <div class="slide-page" style="background: linear-gradient(135deg, #021B4D 0%, #002B7F 45%, #0B3A82 70%, #031842 100%); color: #FFFFFF;">
    <!-- Background chân thực mờ ảo phía sau -->
    <div class="absolute inset-0 opacity-25 pointer-events-none">
      <img src="${BG_SKYLINE_LAKE}" class="w-full h-full object-cover" alt="Hanoi Skyline" />
      <div class="absolute inset-0 bg-gradient-to-r from-[#021B4D]/90 via-[#002B7F]/80 to-[#031842]/95"></div>
    </div>

    <div class="relative z-10 w-full h-full flex flex-col justify-between p-20">
      <!-- Top header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <img src="${LOGO_CEO1983}" class="h-24 object-contain drop-shadow" alt="CEO 1983" />
          <div class="h-12 w-[2px] bg-white/20"></div>
          <div>
            <div class="text-amber-400 font-black text-sm tracking-widest uppercase">HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</div>
            <div class="text-white font-extrabold text-2xl font-['Montserrat']">CLB DOANH NHÂN CEO 1983</div>
          </div>
        </div>

        <div class="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-black tracking-widest uppercase">
          BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ TOÀN DIỆN 2026
        </div>
      </div>

      <!-- Center content -->
      <div class="max-w-5xl space-y-6 my-auto">
        <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-sm font-black tracking-wide">
          <span>⚡</span> HỆ SINH THÁI ĐIỀU HÀNH &amp; KẾT NỐI DOANH NHÂN ĐỘC QUYỀN
        </div>

        <h1 class="text-6xl font-black text-white tracking-tight uppercase leading-tight font-['Montserrat']">
          GIẢI PHÁP QUẢN TRỊ HIỆP HỘI<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300">
            &amp; KẾT NỐI DOANH THƯƠNG B2B
          </span>
        </h1>

        <p class="text-xl text-blue-100 font-medium leading-relaxed max-w-4xl">
          Sự kết hợp hoàn hảo giữa <strong>Cổng Điều Hành Web CRM Trung Tâm</strong> (phục vụ Ban Lãnh Đạo, Ban Thư Ký &amp; 6 Ban Chuyên Môn) và <strong>Ứng Dụng Di Động Thông Minh</strong> (Văn phòng bỏ túi cho 500+ Doanh nhân hội viên).
        </p>

        <!-- 4 Badges số liệu -->
        <div class="grid grid-cols-4 gap-6 pt-4">
          <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div class="text-4xl font-black text-amber-400 font-mono">500+</div>
            <div class="text-xs font-bold text-slate-200 mt-1 uppercase">Hội Viên Doanh Nhân</div>
          </div>
          <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div class="text-4xl font-black text-cyan-400 font-mono">06</div>
            <div class="text-xs font-bold text-slate-200 mt-1 uppercase">Ban Chuyên Môn</div>
          </div>
          <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div class="text-4xl font-black text-emerald-400 font-mono">100%</div>
            <div class="text-xs font-bold text-slate-200 mt-1 uppercase">Số Hóa Nghiệp Vụ</div>
          </div>
          <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div class="text-4xl font-black text-blue-300 font-mono">01 Giây</div>
            <div class="text-xs font-bold text-slate-200 mt-1 uppercase">Check-in Thẻ QR</div>
          </div>
        </div>
      </div>

      <!-- Bottom footer -->
      <div class="flex items-center justify-between border-t border-white/15 pt-6 text-sm text-slate-300">
        <div>Đơn vị nghiên cứu &amp; phát triển công nghệ: <strong>ViConnect Technology</strong></div>
        <div class="flex items-center gap-2">
          ${VIONE_EMBLEM_SVG}
          <span class="font-bold text-white">ViOne - Business Connect</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 2: BỨC TRANH KIẾN TRÚC KÉP (NỬA XANH NỬA TRẮNG)                     -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <!-- NỬA TRÁI (XANH) -->
    <div class="slide-left-panel">
      <img src="${BG_BOARDROOM}" class="slide-left-bg" alt="Boardroom" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs uppercase">
          SLIDE 02 / 15
        </span>
        <h2 class="text-4xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          KIẾN TRÚC KÉP<br><span class="text-amber-300">TƯƠNG HỖ KHÉP KÍN</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Mô hình liên hoàn 2 phân hệ độc lập về mặt trải nghiệm nhưng dùng chung cơ sở dữ liệu PostgreSQL thời gian thực.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <div class="text-cyan-300 font-black text-sm uppercase">1. Web CRM Quản Trị</div>
          <div class="text-xs text-slate-200 mt-1 leading-normal">
            Bảng điều khiển trung tâm cho Ban Điều Hành: quản lý hội viên, duyệt hồ sơ, xếp bàn tiệc Gala, đối soát tài chính VietQR.
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <div class="text-amber-300 font-black text-sm uppercase">2. CEO 1983 Mobile App</div>
          <div class="text-xs text-slate-200 mt-1 leading-normal">
            Văn phòng số bỏ túi cho 500+ CEO: Thẻ thông minh 1 chạm, sàn B2B, vé sự kiện QR check-in và lịch trình nhắc hẹn.
          </div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đồng bộ thời gian thực 100% qua Socket.IO &amp; RESTful API
      </div>
    </div>

    <!-- NỬA PHẢI (TRẮNG SÁNG) -->
    <div class="slide-right-stage">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 class="text-2xl font-black text-[#002B7F] font-['Montserrat'] uppercase">
          SỰ PHỐI HỢP NHỊP NHÀNG GIỮA QUẢN LÝ VÀ HỘI VIÊN
        </h3>
        <span class="text-xs font-mono font-bold text-slate-500">LIVE SYSTEM PREVIEW</span>
      </div>

      <div class="grid grid-cols-2 gap-8 my-auto h-[660px]">
        <!-- Card 1: CRM Preview -->
        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 font-black text-xs">CỔNG WEB CRM</span>
              <span class="text-xs text-slate-500 font-mono">DESKTOP / LAPTOP</span>
            </div>
            <h4 class="text-xl font-black text-slate-900 mt-3">Trung Tâm Điều Hành 6 Ban</h4>
            <p class="text-slate-600 text-xs mt-1">Dành cho Chủ Tịch, Phó Chủ Tịch, Thư Ký &amp; Ban Chuyên Môn.</p>
          </div>
          <div class="rounded-xl overflow-hidden border border-slate-200 h-[450px] shadow-sm bg-slate-50">
            <img src="${CRM_01}" class="w-full h-full object-cover object-top" alt="CRM Overview" />
          </div>
        </div>

        <!-- Card 2: App Preview -->
        <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs">MOBILE APP</span>
              <span class="text-xs text-slate-500 font-mono">iOS / ANDROID</span>
            </div>
            <h4 class="text-xl font-black text-slate-900 mt-3">Văn Phòng Số Bỏ Túi</h4>
            <p class="text-slate-600 text-xs mt-1">Dành cho 500+ Doanh nhân hội viên chính thức.</p>
          </div>
          <div class="flex items-center justify-center gap-4 h-[450px]">
            <div class="w-48 h-full rounded-3xl overflow-hidden border-2 border-slate-300 shadow-md">
              <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top" alt="Thẻ VIP" />
            </div>
            <div class="w-48 h-full rounded-3xl overflow-hidden border-2 border-slate-300 shadow-md">
              <img src="${APP_TICKET_QR}" class="w-full h-full object-cover object-top" alt="Vé QR" />
            </div>
          </div>
        </div>
      </div>

      <div class="text-xs text-slate-500 flex items-center justify-between pt-2">
        <span>Bảo mật dữ liệu tuyệt đối theo tiêu chuẩn phân quyền RBAC đa cấp bậc</span>
        <span class="text-blue-600 font-bold">Hệ sinh thái công nghệ CEO 1983 (HanoiBA)</span>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 3: SHOWCASE POSTER 1 (PANORAMA 4 IPHONE THEO ĐÚNG ẢNH 1)            -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_SKYLINE}" class="slide-left-bg" alt="Skyline" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-mono font-black text-xs uppercase">
          SLIDE 03 / 15 · SHOWCASE POSTER
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          TOÀN CẢNH MOBILE APP<br><span class="text-amber-300">DÀN 4 IPHONE SIÊU NÉT</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Showcase toàn bộ hành trình trải nghiệm hội viên: Khám phá Trang chủ -> Định danh Thẻ VIP -> Giao thương B2B -> Soát vé Gala.
        </p>
      </div>

      <div class="relative z-10 space-y-3.5 my-auto">
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-cyan-300">1. Trang chủ số:</strong> Tin tức, sự kiện sắp tới &amp; 14 tính năng CLB.
        </div>
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-amber-300">2. Thẻ hội viên VIP:</strong> Định danh số, mã QR &amp; NameDrop NFC.
        </div>
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-cyan-300">3. Sàn giao thương B2B:</strong> Niêm yết sản phẩm &amp; ưu đãi 11 ngành.
        </div>
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-emerald-300">4. Vé sự kiện Gala:</strong> Check-in bàn tiệc VIP tự động 1 giây.
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        File Poster Panorama: POSTER_SHOWCASE_APP_PANORAMA.pdf
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="w-full h-full rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white">
        <img src="./POSTER_SHOWCASE_APP_PANORAMA.png" class="w-full h-full object-contain" alt="Poster Mobile App Panorama" />
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 4: SHOWCASE POSTER 2 (PANORAMA 3 MÀN HÌNH CRM THEO ĐÚNG ẢNH 2)       -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BOARDROOM}" class="slide-left-bg" alt="Boardroom" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-mono font-black text-xs uppercase">
          SLIDE 04 / 15 · SHOWCASE POSTER
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          TOÀN CẢNH WEB CRM<br><span class="text-cyan-300">DÀN 3 MÀN HÌNH ĐIỀU HÀNH</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Showcase toàn bộ sức mạnh điều hành hiệp hội: Dashboard Executive BI -> Quản trị 500+ Hội viên -> Sơ đồ bàn tiệc Gala &amp; Tài chính VietQR.
        </p>
      </div>

      <div class="relative z-10 space-y-3.5 my-auto">
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-cyan-300">1. Executive Dashboard BI:</strong> 8 chỉ số sức khỏe, dòng tiền &amp; tăng trưởng.
        </div>
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-amber-300">2. Bảng 500+ Hội viên:</strong> Lọc theo ban, phân quyền RBAC &amp; thẩm định.
        </div>
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          <strong class="text-emerald-300">3. Sơ đồ bàn tiệc Gala:</strong> Trực quan bố trí bàn VIP &amp; check-in tự động.
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        File Poster Panorama: POSTER_SHOWCASE_CRM_PANORAMA.pdf
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="w-full h-full rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white">
        <img src="./POSTER_SHOWCASE_CRM_PANORAMA.png" class="w-full h-full object-contain" alt="Poster Web CRM Panorama" />
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 5: SHOWCASE POSTER MASTER TỔNG HỢP HỆ SINH THÁI (A3/A2 KHỔ ĐỨNG)   -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BANQUET}" class="slide-left-bg" alt="Banquet" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs uppercase">
          SLIDE 05 / 15 · MASTER POSTER
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          POSTER MASTER<br><span class="text-amber-300">TỔNG THỂ HỆ SINH THÁI</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Tác phẩm poster tổng lực kết hợp trọn vẹn cả 3 màn hình CRM quản trị và 4 điện thoại Mobile App hội viên trên nền nửa xanh nửa trắng sang trọng.
        </p>
      </div>

      <div class="relative z-10 space-y-3 my-auto">
        <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          ✓ Tái hiện hoàn chỉnh bố cục hệ sinh thái kết nối 500+ Doanh nhân.
        </div>
        <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          ✓ Chuẩn in ấn chất lượng cao 300 DPI (3500 × 4950 px) cho Standee, Catalog.
        </div>
        <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
          ✓ Tích hợp đầy đủ nhận diện thương hiệu HanoiBA và ViOne.
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        File Poster Master: POSTER_MASTER_HE_SINH_THAI_CEO1983.pdf
      </div>
    </div>

    <div class="slide-right-stage p-6 flex items-center justify-center">
      <div class="h-full rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white">
        <img src="./POSTER_MASTER_HE_SINH_THAI_CEO1983.png" class="h-full w-auto object-contain" alt="Poster Master All in One" />
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 6: BỘ 4 POSTER ĐẶC TẢ CHI TIẾT                                      -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_OPERATIONS}" class="slide-left-bg" alt="Operations" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-mono font-black text-xs uppercase">
          SLIDE 06 / 15 · CÁC ẤN PHẨM TRUYỀN THÔNG
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          BỘ 4 POSTER<br><span class="text-cyan-300">CHUYÊN SÂU TỪNG MẢNG</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          4 ấn phẩm độc lập phục vụ truyền thông, đào tạo hội viên và giới thiệu giải pháp cho Đại hội &amp; Gala thường niên.
        </p>
      </div>

      <div class="relative z-10 space-y-2.5 my-auto text-xs text-slate-200">
        <div class="p-3 rounded-xl bg-white/10"><strong>Poster 1:</strong> Tổng quan ứng dụng di động</div>
        <div class="p-3 rounded-xl bg-white/10"><strong>Poster 2:</strong> 4 Đặc quyền hội viên trong tầm tay</div>
        <div class="p-3 rounded-xl bg-white/10"><strong>Poster 3:</strong> Nền tảng quản trị Web CRM trung tâm</div>
        <div class="p-3 rounded-xl bg-white/10"><strong>Poster 4:</strong> 4 Phân hệ điều hành dành riêng CLB</div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        File tập hợp: BO_4_POSTER_HE_SINH_THAI_CEO1983.pdf
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="w-full h-full rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white">
        <img src="./POSTER_4IN1_HE_SINH_THAI_CEO1983.png" class="w-full h-full object-contain" alt="Poster 4 in 1" />
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 7: CHỨC NĂNG CRM 1 - DASHBOARD EXECUTIVE BI 360° (PHÓNG TO CỰC NÉT)   -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BOARDROOM}" class="slide-left-bg" alt="Boardroom" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-blue-400/20 border border-blue-400/40 text-blue-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG CRM 01 · SLIDE 07 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          DASHBOARD EXECUTIVE BI<br><span class="text-cyan-300">BẢO HIỂM CHỈ SỐ 360°</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Màn hình đầu tiên khi đăng nhập CRM dành cho Chủ Tịch và Ban Thường Trực nắm bắt toàn bộ nhịp đập CLB theo thời gian thực.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">8 Chỉ Số Trọng Yếu</div>
          <div class="text-slate-200 text-xs mt-1">Tổng hội viên, Hội viên mới tháng, Hóa đơn chưa thu, Sự kiện sắp tới, Cơ hội mở.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Biểu Đồ Tài Chính Recharts</div>
          <div class="text-slate-200 text-xs mt-1">Trực quan hóa doanh thu thu phí, tốc độ kết nạp hội viên qua 6 tháng liên tiếp.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Bộ Lọc Phân Tách 6 Ban</div>
          <div class="text-slate-200 text-xs mt-1">Chỉ 1 click để xem riêng số liệu của từng ban chuyên môn.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đường dẫn CRM: /crm/dashboard
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="mac-browser-window">
        <div class="mac-titlebar">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="ml-4 font-mono">https://crm.ceo1983.vn/dashboard - Executive BI Center</span>
        </div>
        <div class="flex-1 overflow-hidden bg-white">
          <img src="${CRM_01}" class="w-full h-full object-cover object-top" alt="CRM Dashboard BI" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 8: CHỨC NĂNG CRM 2 - QUẢN TRỊ 500+ HỘI VIÊN & THẨM ĐỊNH HỒ SƠ 360°    -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_OPERATIONS}" class="slide-left-bg" alt="Operations" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG CRM 02 · SLIDE 08 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          QUẢN TRỊ HỘI VIÊN 360°<br><span class="text-amber-300">THẨM ĐỊNH &amp; PHÂN BAN</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Hệ thống cơ sở dữ liệu lớn quản lý toàn diện hồ sơ năng lực 500+ doanh nghiệp hội viên, thẩm định tư cách và phân công ban sinh hoạt.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Bảng Dữ Liệu Excel Thông Minh</div>
          <div class="text-slate-200 text-xs mt-1">Xem chi tiết họ tên, mã hội viên, công ty, ngành nghề, chức vụ trong CLB và trạng thái hoạt động.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Quy Trình Phê Duyệt 3 Cấp</div>
          <div class="text-slate-200 text-xs mt-1">Ban Thư Ký tiếp nhận -> Ban Hội Viên thẩm định -> Ban Thường Trực phê duyệt cấp thẻ.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Xuất Báo Cáo Excel Tức Thì</div>
          <div class="text-slate-200 text-xs mt-1">Trích xuất danh bạ, xuất danh sách gửi thiệp chúc mừng, thông báo kỳ họp.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đường dẫn CRM: /crm/members
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="mac-browser-window">
        <div class="mac-titlebar">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="ml-4 font-mono">https://crm.ceo1983.vn/members - 500+ Members Management</span>
        </div>
        <div class="flex-1 overflow-hidden bg-white">
          <img src="${CRM_MEMBERS_TABLE}" class="w-full h-full object-cover object-top" alt="CRM Members Table" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 9: CHỨC NĂNG CRM 3 - SƠ ĐỒ BỐ TRÍ BÀN TIỆC GALA KHÁN PHÒNG TỰ ĐỘNG     -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BANQUET}" class="slide-left-bg" alt="Banquet Gala" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG CRM 03 · SLIDE 09 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          QUẢN TRỊ SỰ KIỆN GALA<br><span class="text-cyan-300">SƠ ĐỒ BÀN TIỆC THÔNG MINH</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Tính năng độc quyền số hóa hoàn toàn sơ đồ khán phòng khách sạn 5 sao: gán chỗ ngồi VIP, hiển thị số bàn và định vị đại biểu 1 giây.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Visual Seating Chart</div>
          <div class="text-slate-200 text-xs mt-1">Mô phỏng trực quan từng bàn tròn 10 người, phân biệt bàn VIP Lãnh đạo, VIP Khách mời, bàn Doanh nhân theo màu sắc.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Đồng Bộ Vé QR Hội Viên</div>
          <div class="text-slate-200 text-xs mt-1">Khi xếp bàn trên CRM, vé điện tử trên app điện thoại của hội viên sẽ tự động cập nhật số bàn và vị trí ngồi.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Điểm Danh &amp; Soát Vé Real-Time</div>
          <div class="text-slate-200 text-xs mt-1">Báo cáo trực tiếp tỷ lệ bàn đã đủ khách, bàn còn trống để điều phối lễ tân linh hoạt.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đường dẫn CRM: /crm/events/seating-chart
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="mac-browser-window">
        <div class="mac-titlebar">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="ml-4 font-mono">https://crm.ceo1983.vn/events/seating - Gala Seating Chart Visualizer</span>
        </div>
        <div class="flex-1 overflow-hidden bg-white">
          <img src="${CRM_SEATING_CHART}" class="w-full h-full object-cover object-top" alt="CRM Seating Chart" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 10: CHỨC NĂNG CRM 4 - TÀI CHÍNH THU CHI & GẠCH NỢ VIETQR TỰ ĐỘNG     -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BOARDROOM}" class="slide-left-bg" alt="Boardroom" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG CRM 04 · SLIDE 10 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          TÀI CHÍNH SỔ QUỸ<br><span class="text-emerald-300">GẠCH NỢ VIETQR REAL-TIME</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Giải pháp kế toán hiệp hội tự động hóa: Quản lý thu phí niên liễm, tài trợ sự kiện, minh bạch sổ quỹ thu chi với ngân hàng.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">VietQR Chuyển Khoản Tự Động</div>
          <div class="text-slate-200 text-xs mt-1">Mỗi hội viên quét mã QR chứa nội dung cú pháp chuẩn, tiền về tài khoản là hệ thống tự động gạch nợ tức thì.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Sổ Quỹ Thu Chi Minh Bạch</div>
          <div class="text-slate-200 text-xs mt-1">Báo cáo kiểm toán dòng tiền chi tiết theo từng hạng mục sự kiện, sinh nhật, thăm hỏi hội viên.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Gửi Hóa Đơn &amp; Nhắc Phí Tự Động</div>
          <div class="text-slate-200 text-xs mt-1">Tự động gửi email/Zalo nhắc kỳ hạn hội phí niên liễm kèm hóa đơn điện tử.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đường dẫn CRM: /crm/finance/cashbook
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="mac-browser-window">
        <div class="mac-titlebar">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="ml-4 font-mono">https://crm.ceo1983.vn/finance/cashbook - Finance &amp; VietQR Reconciliation</span>
        </div>
        <div class="flex-1 overflow-hidden bg-white">
          <img src="${CRM_FINANCE_CASHBOOK}" class="w-full h-full object-cover object-top" alt="CRM Finance Cashbook" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 11: CHỨC NĂNG CRM 5 - GIAO VIỆC KANBAN & PHÂN QUYỀN RBAC 6 BAN      -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_OPERATIONS}" class="slide-left-bg" alt="Operations" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-blue-400/20 border border-blue-400/40 text-blue-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG CRM 05 · SLIDE 11 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          GIAO VIỆC KANBAN<br><span class="text-cyan-300">ĐIỀU HÀNH 6 BAN CHUYÊN MÔN</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Công cụ phối hợp tác chiến giữa Ban Chủ tịch, Ban Thư Ký và các Ban Hội viên, Sự kiện, Tài chính, Đào tạo, Truyền thông, Đối ngoại.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Bảng Kanban Trực Quan</div>
          <div class="text-slate-200 text-xs mt-1">Kéo thả nhiệm vụ theo các cột: Cần làm -> Đang xử lý -> Chờ duyệt -> Hoàn thành.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Ma Trận Phân Quyền RBAC Chặt Chẽ</div>
          <div class="text-slate-200 text-xs mt-1">Trưởng ban chỉ xem và điều hành trong phạm vi ban của mình; Ban Chủ tịch xem toàn quyền 360°.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Đo Lường KPI Ban Chuyên Môn</div>
          <div class="text-slate-200 text-xs mt-1">Báo cáo tỷ lệ hoàn thành công việc đúng hạn, chấm điểm thi đua cuối năm minh bạch.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Đường dẫn CRM: /crm/tasks/kanban
      </div>
    </div>

    <div class="slide-right-stage p-6">
      <div class="mac-browser-window">
        <div class="mac-titlebar">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span class="ml-4 font-mono">https://crm.ceo1983.vn/tasks/kanban - 6 Committees Task Management</span>
        </div>
        <div class="flex-1 overflow-hidden bg-white">
          <img src="${CRM_KANBAN_TASKS}" class="w-full h-full object-cover object-top" alt="CRM Kanban Tasks" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 12: CHỨC NĂNG APP 1 - THẺ HỘI VIÊN VIP & TRAO ĐỔI DANH THIẾP NFC 1 CHẠM -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_SKYLINE}" class="slide-left-bg" alt="Skyline" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG APP 01 · SLIDE 12 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          THẺ HỘI VIÊN VIP<br><span class="text-amber-300">NAMEDROP NFC 1 CHẠM</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Biến chiếc điện thoại thành danh thiếp số quyền lực. Chạm nhẹ 2 điện thoại để trao đổi thông tin doanh nghiệp ngay lập tức.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Nhận Diện Chính Danh HanoiBA</div>
          <div class="text-slate-200 text-xs mt-1">Logo CLB CEO 1983, ảnh chân dung lãnh đạo, chức vụ, mã hội viên và hotline xác thực.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Công Nghệ Chạm Không Tiếp Xúc</div>
          <div class="text-slate-200 text-xs mt-1">Hỗ trợ chip NFC thông minh và mã QR động lưu trực tiếp danh thiếp vào danh bạ điện thoại.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Hồ Sơ Năng Lực Doanh Nghiệp</div>
          <div class="text-slate-200 text-xs mt-1">Giới thiệu sản phẩm, website, catalog và video doanh nghiệp đi kèm thẻ.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Mobile Route: /association/profile/card
      </div>
    </div>

    <div class="slide-right-stage p-6 flex items-center justify-center">
      <div class="phone-stage-card w-[380px] h-[780px]">
        <div class="island"></div>
        <div class="w-full h-full rounded-[38px] overflow-hidden bg-white">
          <img src="${APP_CARD_CLEAN}" class="w-full h-full object-cover object-top" alt="Thẻ Hội Viên VIP" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 13: CHỨC NĂNG APP 2 - SÀN GIAO THƯƠNG B2B & DEAL NỘI KHỐI             -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_SKYLINE_LAKE}" class="slide-left-bg" alt="Skyline" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-blue-400/20 border border-blue-400/40 text-blue-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG APP 02 · SLIDE 13 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          SÀN GIAO THƯƠNG B2B<br><span class="text-cyan-300">KẾT NỐI 11 NHÓM NGÀNH</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Môi trường kết nối kinh doanh nội bộ tin cậy: Đăng tải nhu cầu mua bán, mở cơ hội hợp tác và hưởng ưu đãi dành riêng cho hội viên.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">11 Ngành Nghề Kinh Doanh</div>
          <div class="text-slate-200 text-xs mt-1">Xây dựng, Bất động sản, Công nghệ, Y tế, Giáo dục, Sản xuất, Dịch vụ, Tài chính...</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Deal Ưu Đãi Độc Quyền</div>
          <div class="text-slate-200 text-xs mt-1">Các doanh nghiệp hội viên cam kết chiết khấu ưu đãi từ 10% - 30% cho các thành viên CLB.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Chat &amp; Hẹn Gặp 1-on-1</div>
          <div class="text-slate-200 text-xs mt-1">Bấm nút liên hệ trực tiếp qua Zalo, gọi điện hoặc đặt lịch hẹn giao lưu kết nối doanh thương.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Mobile Route: /association/marketplace
      </div>
    </div>

    <div class="slide-right-stage p-6 flex items-center justify-center">
      <div class="phone-stage-card w-[380px] h-[780px]">
        <div class="island"></div>
        <div class="w-full h-full rounded-[38px] overflow-hidden bg-white">
          <img src="${APP_B2B_MARKET}" class="w-full h-full object-cover object-top" alt="Sàn B2B" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 14: CHỨC NĂNG APP 3 - VÉ SỰ KIỆN GALA & CHECK-IN QR BÀN TIỆC 1 GIÂY -->
  <!-- ========================================================================= -->
  <div class="slide-page">
    <div class="slide-left-panel">
      <img src="${BG_BANQUET}" class="slide-left-bg" alt="Banquet" />
      <div class="slide-left-overlay"></div>

      <div class="relative z-10 space-y-3">
        <span class="px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono font-black text-xs uppercase">
          CHỨC NĂNG APP 03 · SLIDE 14 / 15
        </span>
        <h2 class="text-3xl font-black text-white font-['Montserrat'] uppercase tracking-tight mt-4">
          VÉ ĐIỆN TỬ VIP<br><span class="text-emerald-300">CHECK-IN BÀN TIỆC 1 GIÂY</span>
        </h2>
        <p class="text-blue-100 text-sm leading-relaxed font-medium">
          Giải quyết dứt điểm cảnh xếp hàng chờ đợi check-in trong các đêm Dạ tiệc Gala 500 khách: Quét mã QR, tự động hiển thị số bàn tiệc.
        </p>
      </div>

      <div class="relative z-10 space-y-4 my-auto">
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-emerald-300 font-bold text-xs uppercase">Mã Vé QR Cá Nhân Hóa</div>
          <div class="text-slate-200 text-xs mt-1">Mỗi vé đại biểu sinh mã QR mã hóa an toàn, phân hạng vé VIP, Ban Chấp hành, Hội viên.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-cyan-300 font-bold text-xs uppercase">Định Vị Số Bàn &amp; Chỗ Ngồi</div>
          <div class="text-slate-200 text-xs mt-1">Ngay khi quét mã, màn hình điện thoại hiện rõ: "Bạn ngồi Bàn VIP 02 - Ghế số 5" kèm bản đồ lối đi.</div>
        </div>
        <div class="p-4 rounded-xl bg-white/10 border border-white/15">
          <div class="text-amber-300 font-bold text-xs uppercase">Kích Hoạt Quay Số May Mắn</div>
          <div class="text-slate-200 text-xs mt-1">Hội viên check-in thành công sẽ được tự động đưa số may mắn vào phần mềm quay giải Gala.</div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-300 font-semibold border-t border-white/15 pt-4">
        Mobile Route: /association/events/ticket
      </div>
    </div>

    <div class="slide-right-stage p-6 flex items-center justify-center">
      <div class="phone-stage-card w-[380px] h-[780px]">
        <div class="island"></div>
        <div class="w-full h-full rounded-[38px] overflow-hidden bg-white">
          <img src="${APP_TICKET_QR}" class="w-full h-full object-cover object-top" alt="Vé QR Check-in" />
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SLIDE 15: KẾT LUẬN & CAM KẾT ĐỒNG HÀNH CHUYỂN ĐỔI SỐ                      -->
  <!-- ========================================================================= -->
  <div class="slide-page" style="background: linear-gradient(135deg, #021B4D 0%, #002B7F 45%, #0B3A82 70%, #031842 100%); color: #FFFFFF;">
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <img src="${BG_SKYLINE_LAKE}" class="w-full h-full object-cover" alt="Skyline" />
      <div class="absolute inset-0 bg-gradient-to-r from-[#021B4D]/90 via-[#002B7F]/80 to-[#031842]/95"></div>
    </div>

    <div class="relative z-10 w-full h-full flex flex-col justify-between p-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <img src="${LOGO_CEO1983}" class="h-20 object-contain drop-shadow" alt="CEO 1983" />
          <div class="h-10 w-[2px] bg-white/20"></div>
          <div>
            <div class="text-amber-400 font-black text-xs uppercase tracking-widest">HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)</div>
            <div class="text-white font-extrabold text-xl font-['Montserrat']">LỘ TRÌNH ĐỒNG HÀNH VÀ BÀN GIAO CÔNG NGHỆ</div>
          </div>
        </div>

        <span class="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-cyan-300 font-mono font-black text-xs">
          SLIDE 15 / 15 · KẾT LUẬN
        </span>
      </div>

      <div class="max-w-5xl my-auto space-y-6">
        <h2 class="text-5xl font-black text-white uppercase font-['Montserrat'] tracking-tight">
          SẴN SÀNG VẬN HÀNH THỰC TẾ<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300">
            KIẾN TẠO CỘNG ĐỒNG DOANH NHÂN HÙNG CƯỜNG
          </span>
        </h2>

        <p class="text-lg text-blue-100 font-medium leading-relaxed max-w-4xl">
          ViConnect Technology cam kết đồng hành cùng Ban Chấp Hành CLB Doanh Nhân CEO 1983 trong toàn bộ quá trình: Triển khai hạ tầng máy chủ độc lập, đào tạo hướng dẫn 6 ban chuyên môn và hỗ trợ kỹ thuật 24/7.
        </p>

        <div class="grid grid-cols-3 gap-6 pt-4">
          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div class="text-amber-400 font-black text-lg">1. Độc Quyền Dữ Liệu</div>
            <p class="text-xs text-slate-200 leading-relaxed">
              Toàn bộ cơ sở dữ liệu hội viên, tài chính và giao thương lưu trữ trên hạ tầng máy chủ riêng của Hiệp hội, cam kết bảo mật 100%.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div class="text-cyan-400 font-black text-lg">2. Hỗ Trợ Kỹ Thuật 24/7</div>
            <p class="text-xs text-slate-200 leading-relaxed">
              Đội ngũ kỹ sư túc trực hỗ trợ check-in sự kiện Gala thực địa, đảm bảo vận hành mượt mà không xảy ra sự cố.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div class="text-emerald-400 font-black text-lg">3. Nâng Cấp Liên Tục</div>
            <p class="text-xs text-slate-200 leading-relaxed">
              Cập nhật định kỳ các tính năng Trợ lý AI kết nối giao thương thông minh, bốc thăm may mắn và sàn thương mại điện tử B2B.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-white/15 pt-6 text-sm text-slate-300">
        <div>Trân trọng cảm ơn Ban Lãnh Đạo &amp; Toàn thể Quý Anh/Chị Doanh Nhân CLB CEO 1983!</div>
        <div class="flex items-center gap-3">
          ${VIONE_EMBLEM_SVG}
          <span class="font-extrabold text-white">ViConnect Technology &amp; ViOne Ecosystem</span>
        </div>
      </div>
    </div>
  </div>

</body>
</html>`;
}

module.exports = {
  generateHdSlideDeckHtml
};
