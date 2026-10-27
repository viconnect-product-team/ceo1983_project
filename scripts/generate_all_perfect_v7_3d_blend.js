/**
 * GENERATE_ALL_PERFECT_V7_3D_BLEND.JS
 * 
 * Nâng cấp tối thượng:
 * 1. 3 Ảnh nền đan xen mờ tạo cảm giác hòa quyện vào nhau, làm nổi bật background rực rỡ, không bị chìm hay tối đen:
 *    - Trái: Skyline đêm thành phố hiện đại (08_skyline_night.jpg)
 *    - Giữa: Trung tâm điều hành công nghệ số (04_operations.jpg)
 *    - Phải: Đại tiệc Gala sự kiện & giao lưu doanh nhân (07_banquet_gala.jpg)
 *    - Kết hợp mask-image gradient đan xen mờ và blend modes đa tầng
 * 2. Thiết kế 3D siêu chân thực, chuyên nghiệp đẳng cấp cao:
 *    - Sân khấu bục kính Acrylic 3D phát sáng viền neon (Showcase Stage Podium)
 *    - MacBook Pro 16" 3D và iPhone 16 Pro Max 3D với góc nghiêng, bóng gương phản chiếu mặt sàn
 *    - 5 Cửa sổ giao diện CRM bay phối cảnh 3D perspective đa tầng
 * 3. Logo CEO 1983 & ViConnect chuẩn gốc 100%
 * 4. Đồng bộ Slide 1 và toàn bộ 10 Slide kèm Footer rực rỡ đúc kết chiến lược
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');
const LIVE_IMG_DIR = path.join(DOC_DIR, 'images/live_captures_fresh');
const BG_DIR = path.join(DOC_DIR, 'images/backgrounds');

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  }
  return '';
}

// Logo gốc chuẩn
const LOGO_CEO1983 = getBase64Image(path.join(DOC_DIR, 'images/ceo1983-official-logo.png'));
const LOGO_VICONNECT = getBase64Image(path.join(DOC_DIR, 'images/viconnect-logo.png'));

// 3 Ảnh nền đan xen mờ
const BG_SKYLINE_NIGHT = getBase64Image(path.join(BG_DIR, '08_skyline_night.jpg'));
const BG_OPERATIONS = getBase64Image(path.join(BG_DIR, '04_operations.jpg'));
const BG_BANQUET_GALA = getBase64Image(path.join(BG_DIR, '07_banquet_gala.jpg'));
const BG_MOBILE_NETWORK = getBase64Image(path.join(BG_DIR, '05_mobile_network.jpg'));
const BG_SMARTCITY = getBase64Image(path.join(BG_DIR, '03_smartcity.jpg'));

// Ảnh chụp CRM Live
const CRM_01 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_01_dashboard_tongquan.png'));
const CRM_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_02_thongke_baocao_bi.png'));
const CRM_03 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_03_quanly_hoivien_360.png'));
const CRM_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_04_quanly_sukien_gala.png'));
const CRM_05 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_05_chuongtrinh_daotao.png'));
const CRM_06 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_06_baocao_taichinh_thuchi.png'));
const CRM_07 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_07_quanly_hoiphi_vietqr.png'));
const CRM_08 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_08_giaoviec_ban_dieuhanh.png'));

// Ảnh chụp App Live
const APP_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_02_the_hoivien_so_vip.png'));
const APP_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_04_san_giaothuong_b2b.png'));
const APP_05 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_05_sukien_ve_dien_tu.png'));

console.log('✓ Đã nạp thành công toàn bộ tài nguyên hình ảnh.');

// =========================================================================
// [1] HTML PROFILE CRM QUẢN TRỊ 3D (3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT)
// =========================================================================
function generateProfileCrmHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>PROFILE 3D CỔNG QUẢN TRỊ TRUNG TÂM WEB CRM CEO 1983</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: #010614;
      color: #fff;
    }
    .profile-container {
      width: 1920px;
      min-height: 1080px;
      margin: 0 auto;
      position: relative;
      background: #010614;
      overflow: hidden;
    }
    
    /* 3 ẢNH NỀN ĐAN XEN MỜ HÒA QUYỆN NỔI BẬT */
    .bg-blend-layer {
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-part-left {
      position: absolute;
      inset-y: 0;
      left: 0;
      width: 55%;
      background-image: url('${BG_SKYLINE_NIGHT}');
      background-size: cover;
      background-position: center left;
      mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.68;
      filter: contrast(130%) saturate(125%);
    }
    .bg-part-center {
      position: absolute;
      inset: 0;
      background-image: url('${BG_OPERATIONS}');
      background-size: cover;
      background-position: center;
      mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.62;
      filter: contrast(125%) saturate(120%);
    }
    .bg-part-right {
      position: absolute;
      inset-y: 0;
      right: 0;
      width: 55%;
      background-image: url('${BG_BANQUET_GALA}');
      background-size: cover;
      background-position: center right;
      mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%);
      opacity: 0.70;
      filter: contrast(130%) saturate(125%);
    }
    .bg-color-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(130% 90% at 50% 30%, rgba(8, 36, 99, 0.4) 0%, rgba(2, 10, 30, 0.75) 60%, rgba(1, 6, 20, 0.95) 100%);
      mix-blend-mode: multiply;
    }
    .bg-glow-aurora {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(0, 102, 255, 0.18) 0%, transparent 40%, rgba(0, 229, 255, 0.22) 70%, rgba(255, 183, 3, 0.15) 100%);
      mix-blend-mode: screen;
    }

    /* BỤC SÂN KHẤU 3D ACRYLIC PHÁT SÁNG */
    .podium-stage {
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      width: 1000px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(0, 229, 255, 0.35) 0%, rgba(10, 50, 140, 0.25) 50%, transparent 75%);
      box-shadow: 
        0 0 80px rgba(0, 229, 255, 0.5),
        inset 0 0 40px rgba(255, 255, 255, 0.4);
      border: 2px solid rgba(0, 229, 255, 0.6);
      z-index: 10;
      filter: blur(1px);
    }

    /* KHUNG MACBOOK PRO 16" 3D CHÂN THỰC */
    .macbook-wrapper {
      position: relative;
      z-index: 25;
      perspective: 1400px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .macbook-screen-lid {
      width: 760px;
      background: #1e2638;
      border-radius: 20px 20px 0 0;
      padding: 12px 12px 0 12px;
      box-shadow: 
        0 25px 80px -15px rgba(0, 0, 0, 0.95),
        0 0 50px rgba(0, 229, 255, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.5);
      border: 2px solid #3c4f70;
      border-bottom: none;
      transform: rotateX(2deg);
    }
    .macbook-display {
      background: #000;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      aspect-ratio: 16 / 10;
      position: relative;
      border: 2px solid #000;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
    }
    .macbook-base {
      width: 860px;
      height: 18px;
      background: linear-gradient(to bottom, #d1d5db 0%, #9ca3af 45%, #4b5563 100%);
      border-radius: 0 0 16px 16px;
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.9),
        0 0 30px rgba(0, 229, 255, 0.3);
      position: relative;
      margin: 0 auto;
    }
    .macbook-notch-cut {
      width: 130px;
      height: 6px;
      background: #374151;
      border-radius: 0 0 6px 6px;
      margin: 0 auto;
    }
    .macbook-mirror-reflection {
      width: 760px;
      height: 100px;
      margin-top: -5px;
      background: linear-gradient(to bottom, rgba(0, 229, 255, 0.25) 0%, rgba(0, 102, 255, 0.1) 40%, transparent 100%);
      transform: scaleY(-1);
      opacity: 0.35;
      filter: blur(3px);
      pointer-events: none;
      mask-image: linear-gradient(to bottom, black 0%, transparent 80%);
      -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 80%);
    }

    /* 5 CỬA SỔ PHỐI CẢNH 3D PERSPECTIVE GLASS */
    .floating-window-3d {
      background: rgba(255, 255, 255, 0.96);
      color: #0f172a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 30px 60px -12px rgba(0, 0, 0, 0.85),
        0 0 35px rgba(0, 229, 255, 0.35),
        inset 0 1px 1px rgba(255, 255, 255, 0.9);
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      transition: all 0.4s ease;
      transform-style: preserve-3d;
    }
    .window-header-mac {
      padding: 7px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .window-dots {
      display: flex;
      gap: 5px;
    }
    .window-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
  </style>
</head>
<body class="flex items-center justify-center p-0 m-0">

  <div class="profile-container p-12 flex flex-col justify-between">
    
    <!-- 3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT RỰC RỠ -->
    <div class="bg-blend-layer">
      <div class="bg-part-left"></div>
      <div class="bg-part-center"></div>
      <div class="bg-part-right"></div>
      <div class="bg-color-overlay"></div>
      <div class="bg-glow-aurora"></div>
    </div>

    <!-- BỤC SÂN KHẤU 3D PHÁT SÁNG -->
    <div class="podium-stage"></div>

    <!-- ==================== HEADER LOGO GỐC CHUẨN XỊN 100% ==================== -->
    <header class="relative z-30 flex items-center justify-between border-b border-white/20 pb-5 backdrop-blur-xl bg-white/[0.04] px-8 py-4 rounded-3xl border border-white/15 shadow-2xl">
      <!-- Cụm logo kép chuẩn gốc -->
      <div class="flex items-center gap-6">
        <div class="h-14 px-5 py-2 rounded-2xl bg-white/95 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white">
          <img src="${LOGO_CEO1983}" class="h-10 w-auto object-contain" alt="Logo CEO 1983 Chuẩn" />
        </div>
        <div class="h-8 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
        <div class="h-14 px-5 py-2 rounded-2xl bg-white/95 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white">
          <img src="${LOGO_VICONNECT}" class="h-9 w-auto object-contain" alt="Logo ViConnect Chuẩn" />
        </div>
      </div>

      <div class="text-center">
        <div class="inline-flex items-center gap-2 px-5 py-1 rounded-full bg-cyan-500/25 text-cyan-300 font-extrabold text-xs uppercase tracking-widest border border-cyan-400/50 shadow-inner">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          SHOWROOM CÔNG NGHỆ QUẢN TRỊ 3D
        </div>
        <h1 class="text-2xl font-black text-white mt-1 drop-shadow-md">CỔNG ĐIỀU HÀNH WEB CRM CLB CEO 1983</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <div class="text-[11px] font-bold text-slate-300">PHÂN QUYỀN VẬN HÀNH</div>
          <div class="text-xs font-black text-cyan-300 font-mono">11 CẤP ĐỘ BẢO MẬT (RBAC)</div>
        </div>
        <div class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xs uppercase shadow-xl border border-cyan-300/40">
          BAN ĐIỀU HÀNH
        </div>
      </div>
    </header>

    <!-- ==================== KHÔNG GIAN SHOWROOM 3D & 5 CỬA SỔ BAY ==================== -->
    <div class="relative z-30 my-auto grid grid-cols-12 gap-6 items-center pt-2">
      
      <!-- CỘT TRÁI: 2 CỬA SỔ PHỐI CẢNH 3D (HỘI VIÊN 360 & SỰ KIỆN GALA) -->
      <div class="col-span-3 space-y-6" style="perspective: 1200px;">
        <!-- Window 1: Hội Viên 360 (Nghiêng 3D quay vào tâm) -->
        <div class="floating-window-3d" style="transform: rotateY(14deg) rotateX(4deg) translateZ(40px);">
          <div class="window-header-mac">
            <div class="window-dots">
              <div class="window-dot bg-red-400"></div>
              <div class="window-dot bg-amber-400"></div>
              <div class="window-dot bg-green-400"></div>
            </div>
            <div class="text-[11px] font-extrabold text-blue-900 tracking-wide uppercase">01. HỒ SƠ HỘI VIÊN 360°</div>
            <span class="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded font-bold">500+ CEO</span>
          </div>
          <div class="p-2 bg-slate-100">
            <img src="${CRM_03}" class="w-full h-36 object-cover object-top rounded-xl border border-slate-200" alt="Hội viên 360" />
          </div>
          <div class="p-3 bg-white">
            <div class="text-xs font-black text-slate-900">Quản Trị Hồ Sơ Doanh Nghiệp Toàn Diện</div>
            <div class="text-[11px] text-slate-600 mt-0.5 font-medium">Tra cứu ngành nghề, phân khúc, phê duyệt hội viên mới 2 lớp.</div>
          </div>
        </div>

        <!-- Window 2: Sự Kiện & Bàn Tiệc (Nghiêng 3D quay vào tâm) -->
        <div class="floating-window-3d" style="transform: rotateY(16deg) rotateX(-4deg) translateZ(20px);">
          <div class="window-header-mac">
            <div class="window-dots">
              <div class="window-dot bg-red-400"></div>
              <div class="window-dot bg-amber-400"></div>
              <div class="window-dot bg-green-400"></div>
            </div>
            <div class="text-[11px] font-extrabold text-blue-900 tracking-wide uppercase">02. SỰ KIỆN GALA & BÀN TIỆC</div>
            <span class="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">VIP TABLE</span>
          </div>
          <div class="p-2 bg-slate-100">
            <img src="${CRM_04}" class="w-full h-36 object-cover object-top rounded-xl border border-slate-200" alt="Sự kiện Gala" />
          </div>
          <div class="p-3 bg-white">
            <div class="text-xs font-black text-slate-900">Sơ Đồ Bàn Tiệc Động & QR Check-in</div>
            <div class="text-[11px] text-slate-600 mt-0.5 font-medium">Xếp chỗ khoa học theo ban ngành, điểm danh tự động chống trùng lặp.</div>
          </div>
        </div>
      </div>

      <!-- CỘT GIỮA: MACBOOK PRO 16" 3D TRUNG TÂM (DASHBOARD & THỐNG KÊ BI) -->
      <div class="col-span-6 flex flex-col items-center justify-center">
        <!-- Badge Tiêu Điểm -->
        <div class="px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl mb-3 border border-cyan-300/50 flex items-center gap-2">
          <span>📊</span> TRUNG TÂM ĐIỀU HÀNH & THỐNG KÊ BI TOÀN CẢNH
        </div>

        <!-- Khung MacBook Pro 3D -->
        <div class="macbook-wrapper">
          <div class="macbook-screen-lid">
            <div class="macbook-display">
              <img src="${CRM_02}" class="w-full h-full object-cover object-top" alt="Dashboard BI Thống Kê" />
            </div>
          </div>
          <div class="macbook-base">
            <div class="macbook-notch-cut"></div>
          </div>
          <div class="macbook-mirror-reflection"></div>
        </div>

        <!-- Thông điệp kết nối -->
        <div class="mt-2 flex items-center justify-between w-[760px] px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-xs text-blue-100 font-medium shadow-xl">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
            Dữ liệu đồng bộ trực tiếp với Mobile App theo thời gian thực
          </span>
          <span class="font-mono text-cyan-300 font-bold">https://crm.ceo1983.viconnect.vn</span>
        </div>
      </div>

      <!-- CỘT PHẢI: 3 CỬA SỔ PHỐI CẢNH 3D (TÀI CHÍNH, ĐÀO TẠO, GIAO VIỆC) -->
      <div class="col-span-3 space-y-4" style="perspective: 1200px;">
        <!-- Window 3: Tài Chính & VietQR (Nghiêng 3D) -->
        <div class="floating-window-3d" style="transform: rotateY(-14deg) rotateX(4deg) translateZ(40px);">
          <div class="window-header-mac">
            <div class="window-dots">
              <div class="window-dot bg-red-400"></div>
              <div class="window-dot bg-amber-400"></div>
              <div class="window-dot bg-green-400"></div>
            </div>
            <div class="text-[10px] font-extrabold text-blue-900 tracking-wide uppercase">03. HỘI PHÍ VIETQR & THU CHI</div>
            <span class="text-[9px] font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">AUTO SYNC</span>
          </div>
          <div class="p-1.5 bg-slate-100">
            <img src="${CRM_07}" class="w-full h-24 object-cover object-top rounded-lg border border-slate-200" alt="VietQR" />
          </div>
          <div class="p-2.5 bg-white">
            <div class="text-xs font-black text-slate-900">Gạch Nợ Tức Thì Qua Webhook</div>
            <div class="text-[10px] text-slate-600 mt-0.5 font-medium">Mã QR động từng hội viên, minh bạch sổ quỹ hiệp hội.</div>
          </div>
        </div>

        <!-- Window 4: Đào Tạo Doanh Nhân (Nghiêng 3D) -->
        <div class="floating-window-3d" style="transform: rotateY(-15deg) translateZ(45px);">
          <div class="window-header-mac">
            <div class="window-dots">
              <div class="window-dot bg-red-400"></div>
              <div class="window-dot bg-amber-400"></div>
              <div class="window-dot bg-green-400"></div>
            </div>
            <div class="text-[10px] font-extrabold text-blue-900 tracking-wide uppercase">04. ĐÀO TẠO & TRI THỨC SỐ</div>
            <span class="text-[9px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">HYBRID</span>
          </div>
          <div class="p-1.5 bg-slate-100">
            <img src="${CRM_05}" class="w-full h-24 object-cover object-top rounded-lg border border-slate-200" alt="Đào tạo" />
          </div>
          <div class="p-2.5 bg-white">
            <div class="text-xs font-black text-slate-900">Lớp Học Trực Tuyến & Form Đăng Ký</div>
            <div class="text-[10px] text-slate-600 mt-0.5 font-medium">Phòng Zoom/Jitsi, QR tuyển sinh, bắn bài xuống App.</div>
          </div>
        </div>

        <!-- Window 5: Giao Việc Kanban (Nghiêng 3D) -->
        <div class="floating-window-3d" style="transform: rotateY(-16deg) rotateX(-4deg) translateZ(20px);">
          <div class="window-header-mac">
            <div class="window-dots">
              <div class="window-dot bg-red-400"></div>
              <div class="window-dot bg-amber-400"></div>
              <div class="window-dot bg-green-400"></div>
            </div>
            <div class="text-[10px] font-extrabold text-blue-900 tracking-wide uppercase">05. GIAO VIỆC 6 BAN KANBAN</div>
            <span class="text-[9px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">REAL-TIME</span>
          </div>
          <div class="p-1.5 bg-slate-100">
            <img src="${CRM_08}" class="w-full h-24 object-cover object-top rounded-lg border border-slate-200" alt="Giao việc" />
          </div>
          <div class="p-2.5 bg-white">
            <div class="text-xs font-black text-slate-900">Điều Hành 6 Ban Chuyên Môn</div>
            <div class="text-[10px] text-slate-600 mt-0.5 font-medium">Phân quyền Trưởng ban/Thư ký, đo lường tiến độ tự động.</div>
          </div>
        </div>
      </div>

    </div>

    <!-- ==================== FOOTER ĐẲNG CẤP ==================== -->
    <footer class="relative z-30 pt-4 border-t border-white/20 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-lg">
          <span>🏛️</span> NỀN TẢNG ĐIỀU HÀNH CHUYÊN NGHIỆP
        </div>
        <div class="text-xs text-blue-200 font-medium">
          Tối ưu hóa năng lực lãnh đạo, chuẩn hóa quy trình và lưu trữ dữ liệu tập trung cho Ban Điều Hành CLB CEO 1983.
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-xs text-cyan-300 font-mono">ĐƠN VỊ PHÁT TRIỂN HỆ THỐNG</div>
          <div class="text-xs font-extrabold text-white">VICONNECT TECHNOLOGY · HÀ NỘI 2026</div>
        </div>
        <div class="h-8 w-px bg-white/20"></div>
        <div class="font-mono text-xs text-amber-300 font-black">
          CLB DOANH NHÂN CEO 1983
        </div>
      </div>
    </footer>

  </div>

</body>
</html>`;
}

// =========================================================================
// [2] HTML POSTER APP CEO 1983 (3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT + 3D SHOWCASE)
// =========================================================================
function generatePosterAppHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>POSTER 3D VĂN PHÒNG DOANH NHÂN BỎ TÚI - CEO 1983 APP</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: #020712;
      color: #fff;
    }
    .poster-container {
      width: 1400px;
      min-height: 1980px;
      margin: 0 auto;
      position: relative;
      background: #020712;
      overflow: hidden;
    }
    
    /* 3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT */
    .bg-blend-layer {
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-part-top-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 70%;
      height: 60%;
      background-image: url('${BG_SKYLINE_NIGHT}');
      background-size: cover;
      background-position: top left;
      mask-image: radial-gradient(circle at 20% 20%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%);
      -webkit-mask-image: radial-gradient(circle at 20% 20%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%);
      opacity: 0.65;
      filter: contrast(130%) saturate(120%);
    }
    .bg-part-center {
      position: absolute;
      top: 25%;
      left: 0;
      right: 0;
      height: 55%;
      background-image: url('${BG_MOBILE_NETWORK}');
      background-size: cover;
      background-position: center;
      mask-image: radial-gradient(ellipse 80% 65% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 65% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%);
      opacity: 0.60;
      filter: contrast(125%) saturate(125%);
    }
    .bg-part-bottom-right {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 70%;
      height: 55%;
      background-image: url('${BG_SMARTCITY}');
      background-size: cover;
      background-position: bottom right;
      mask-image: radial-gradient(circle at 80% 80%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%);
      -webkit-mask-image: radial-gradient(circle at 80% 80%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%);
      opacity: 0.65;
      filter: contrast(130%) saturate(120%);
    }
    .bg-color-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(120% 80% at 50% 25%, rgba(10, 37, 102, 0.45) 0%, rgba(4, 18, 56, 0.75) 45%, rgba(2, 7, 18, 0.95) 100%);
      mix-blend-mode: multiply;
    }
    .bg-glow-aurora {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, transparent 40%, rgba(0, 229, 255, 0.25) 65%, rgba(255, 183, 3, 0.15) 100%);
      mix-blend-mode: screen;
    }

    /* BỤC SÂN KHẤU 3D PHÁT SÁNG CHO 3 ĐIỆN THOẠI */
    .podium-stage-app {
      position: absolute;
      bottom: 220px;
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(0, 229, 255, 0.35) 0%, rgba(10, 50, 140, 0.2) 55%, transparent 80%);
      box-shadow: 
        0 0 100px rgba(0, 229, 255, 0.6),
        inset 0 0 50px rgba(255, 255, 255, 0.4);
      border: 2px solid rgba(0, 229, 255, 0.65);
      z-index: 10;
      filter: blur(1px);
    }

    /* 3D Phone Mockup Styling */
    .phone-mockup-3d {
      position: relative;
      border-radius: 54px;
      padding: 12px;
      background: linear-gradient(145deg, #536785 0%, #1c273a 40%, #0a101d 100%);
      box-shadow: 
        0 40px 100px -20px rgba(0, 0, 0, 0.95),
        0 0 50px rgba(0, 212, 255, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.5),
        inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      transition: all 0.5s ease;
    }
    .phone-inner {
      border-radius: 44px;
      overflow: hidden;
      position: relative;
      background: #000;
      border: 3px solid #000;
    }
    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 24px;
      background: #000;
      border-radius: 14px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
    }
    .phone-camera {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #141b2d;
      border: 1.5px solid #2a3754;
    }
    .perspective-stage {
      perspective: 1600px;
      transform-style: preserve-3d;
    }
  </style>
</head>
<body class="flex items-center justify-center p-0 m-0">

  <div class="poster-container p-16 flex flex-col justify-between">
    
    <!-- 3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT -->
    <div class="bg-blend-layer">
      <div class="bg-part-top-left"></div>
      <div class="bg-part-center"></div>
      <div class="bg-part-bottom-right"></div>
      <div class="bg-color-overlay"></div>
      <div class="bg-glow-aurora"></div>
    </div>

    <!-- BỤC SÂN KHẤU 3D PHÁT SÁNG CHO 3 ĐIỆN THOẠI -->
    <div class="podium-stage-app"></div>

    <!-- ==================== HEADER VỚI LOGO GỐC CHUẨN XỊN 100% ==================== -->
    <header class="relative z-30 flex items-center justify-between border-b border-white/20 pb-8 backdrop-blur-xl bg-white/[0.04] px-8 py-5 rounded-3xl border border-white/15 shadow-2xl">
      <!-- Cụm logo kép chuẩn gốc -->
      <div class="flex items-center gap-6">
        <div class="h-16 px-5 py-2 rounded-2xl bg-white/95 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white">
          <img src="${LOGO_CEO1983}" class="h-12 w-auto object-contain" alt="Logo CLB CEO 1983 Chuẩn" />
        </div>
        <div class="h-10 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
        <div class="h-16 px-5 py-2 rounded-2xl bg-white/95 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white">
          <img src="${LOGO_VICONNECT}" class="h-10 w-auto object-contain" alt="Logo ViConnect Chuẩn" />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <div class="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">NỀN TẢNG SỐ HỘI VIÊN</div>
          <div class="text-sm font-black text-white">PHIÊN BẢN DOANH NHÂN 2026</div>
        </div>
        <div class="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-2">
          <span>👑</span> HANOIBA OFFICIAL
        </div>
      </div>
    </header>

    <!-- ==================== TIÊU ĐỀ POSTER SANG TRỌNG ==================== -->
    <div class="relative z-30 text-center my-6 space-y-4 max-w-5xl mx-auto">
      <div class="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-inner">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        HỆ SINH THÁI KẾT NỐI KHÔNG BIÊN GIỚI CHO HƠN 500 DOANH NHÂN
      </div>

      <h1 class="text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
        VĂN PHÒNG DOANH NHÂN BỎ TÚI <br/>
        <span class="text-white">CEO 1983 MOBILE APP</span>
      </h1>

      <p class="text-base text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow">
        Giải pháp chuyển đổi số toàn diện: Định danh số hội viên VIP, khớp lệnh giao thương B2B bảo mật và quản lý sự kiện thông minh ngay trên chiếc điện thoại thông minh.
      </p>
    </div>

    <!-- ==================== 3 MÀN HÌNH CHÍNH 3D TRƯNG BÀY NỔI BẬT ==================== -->
    <div class="relative z-30 perspective-stage my-4 flex items-center justify-center gap-8 px-4">
      
      <!-- CỘT 1: THẺ HỘI VIÊN VIP (NGHIÊNG TRÁI 3D) -->
      <div class="relative flex flex-col items-center" style="transform: rotateY(16deg) rotateZ(-2deg) translateZ(-30px);">
        <div class="absolute -top-7 z-50 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-yellow-200 flex items-center gap-2">
          <span>💳</span> 01. THẺ HỘI VIÊN SỐ VIP
        </div>

        <div class="phone-mockup-3d w-[360px] h-[730px]">
          <div class="phone-inner w-full h-full">
            <div class="phone-notch"><div class="phone-camera"></div></div>
            <img src="${APP_02}" class="w-full h-full object-cover object-top" alt="Thẻ Hội Viên VIP" />
          </div>
        </div>

        <div class="mt-5 text-center bg-white/95 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-white max-w-[340px]">
          <div class="text-xs font-black uppercase text-blue-900 tracking-wide">Định Danh Quyền Lực & QR Cá Nhân</div>
          <div class="text-[11px] text-slate-600 font-medium mt-1">Thay thế danh thiếp giấy, chia sẻ hồ sơ doanh nghiệp 1 chạm</div>
        </div>
      </div>

      <!-- CỘT 2: SÀN GIAO THƯƠNG B2B (CHÍNH GIỮA, NỔI BẬT CAO NHẤT) -->
      <div class="relative flex flex-col items-center z-40" style="transform: scale(1.08) translateZ(70px);">
        <div class="absolute -top-8 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 text-white font-black text-sm uppercase tracking-wider shadow-2xl border-2 border-cyan-200 flex items-center gap-2">
          <span>🤝</span> 02. SÀN GIAO THƯƠNG B2B NỘI KHỐI
        </div>

        <div class="phone-mockup-3d w-[370px] h-[750px] shadow-[0_0_90px_rgba(0,212,255,0.55)] border-2 border-cyan-300">
          <div class="phone-inner w-full h-full">
            <div class="phone-notch"><div class="phone-camera"></div></div>
            <img src="${APP_04}" class="w-full h-full object-cover object-top" alt="Sàn Giao Thương B2B" />
          </div>
        </div>

        <div class="mt-6 text-center bg-gradient-to-r from-cyan-500/30 to-blue-600/30 backdrop-blur-2xl text-white px-6 py-3.5 rounded-2xl border border-cyan-300/60 shadow-2xl max-w-[360px]">
          <div class="text-sm font-black text-cyan-300 uppercase tracking-wide">Khớp Nối Cung Cầu & Deal Flow</div>
          <div class="text-xs text-blue-50 font-medium mt-1">Đăng nhu cầu hợp tác, kết nối đối tác uy tín trong cộng đồng 500 CEO</div>
        </div>
      </div>

      <!-- CỘT 3: SỰ KIỆN GALA & VÉ ĐIỆN TỬ (NGHIÊNG PHẢI 3D) -->
      <div class="relative flex flex-col items-center" style="transform: rotateY(-16deg) rotateZ(2deg) translateZ(-30px);">
        <div class="absolute -top-7 z-50 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-blue-300 flex items-center gap-2">
          <span>🎟️</span> 03. VÉ GALA & ĐIỂM DANH QR
        </div>

        <div class="phone-mockup-3d w-[360px] h-[730px]">
          <div class="phone-inner w-full h-full">
            <div class="phone-notch"><div class="phone-camera"></div></div>
            <img src="${APP_05}" class="w-full h-full object-cover object-top" alt="Sự Kiện Vé Điện Tử" />
          </div>
        </div>

        <div class="mt-5 text-center bg-white/95 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-white max-w-[340px]">
          <div class="text-xs font-black uppercase text-blue-900 tracking-wide">Check-in 1 Giây & Sơ Đồ Bàn Tiệc</div>
          <div class="text-[11px] text-slate-600 font-medium mt-1">Tra cứu vị trí bàn VIP, vé vào cổng thông minh không lo thất lạc</div>
        </div>
      </div>

    </div>

    <!-- ==================== FOOTER ĐẲNG CẤP & THÔNG TIN TẢI APP ==================== -->
    <footer class="relative z-30 pt-6 border-t border-white/20 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <div class="w-14 h-14 rounded-2xl bg-white text-slate-900 p-2 shadow-xl flex items-center justify-center font-black text-2xl border border-cyan-400">
          📱
        </div>
        <div>
          <div class="text-sm font-black text-white">TRẢI NGHIỆM TRỰC TIẾP TRÊN MỌI THIẾT BỊ DI ĐỘNG</div>
          <div class="text-xs text-cyan-300 font-mono mt-0.5">Truy cập ngay: https://ceo1983.viconnect.vn</div>
        </div>
      </div>

      <div class="flex items-center gap-8">
        <div class="text-right">
          <div class="text-xs text-blue-200">ĐƠN VỊ PHÁT TRIỂN HỆ THỐNG</div>
          <div class="text-sm font-black text-white">VICONNECT TECHNOLOGY · HÀ NỘI 2026</div>
        </div>
        <div class="h-10 w-[2px] bg-white/20"></div>
        <div class="text-left font-mono text-xs text-cyan-300">
          <div>CLB DOANH NHÂN CEO 1983</div>
          <div class="text-white font-bold">HANOIBA ASSOCIATION</div>
        </div>
      </div>
    </footer>

  </div>

</body>
</html>`;
}

async function run() {
  console.log('=====================================================================');
  console.log('BẮT ĐẦU GENERATE BẢN V7: 3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT & 3D SHOWROOM');
  console.log('=====================================================================');

  const profileHtml = generateProfileCrmHtml();
  const posterHtml = generatePosterAppHtml();

  const profilePath = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.html');
  const posterPath = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.html');

  fs.writeFileSync(profilePath, profileHtml, 'utf8');
  fs.writeFileSync(posterPath, posterHtml, 'utf8');

  console.log('✓ Đã cập nhật file HTML Profile và Poster.');

  console.log('>>> Đang mở Edge Playwright để render Ultra-HD...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Render PROFILE CRM
  console.log('>>> [1/2] Render PROFILE_CRM_QUAN_TRI_CEO1983...');
  const pageProfile = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2.0
  });
  await pageProfile.setContent(profileHtml, { waitUntil: 'networkidle' });
  await pageProfile.waitForTimeout(1000);

  const profilePng = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.png');
  const profilePdf = path.join(DOC_DIR, 'PROFILE_CRM_QUAN_TRI_CEO1983.pdf');
  await pageProfile.screenshot({ path: profilePng, fullPage: true });
  await pageProfile.pdf({
    path: profilePdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageProfile.close();
  console.log('✓ Đã xuất PROFILE_CRM_QUAN_TRI_CEO1983.png và .pdf');

  // Render POSTER APP
  console.log('>>> [2/2] Render POSTER_APP_CEO1983_3D...');
  const pagePoster = await browser.newPage({
    viewport: { width: 1400, height: 1980 },
    deviceScaleFactor: 2.0
  });
  await pagePoster.setContent(posterHtml, { waitUntil: 'networkidle' });
  await pagePoster.waitForTimeout(1000);

  const posterPng = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.png');
  const posterPdf = path.join(DOC_DIR, 'POSTER_APP_CEO1983_3D.pdf');
  await pagePoster.screenshot({ path: posterPng, fullPage: true });
  await pagePoster.pdf({
    path: posterPdf,
    width: '1400px',
    height: '1980px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pagePoster.close();
  console.log('✓ Đã xuất POSTER_APP_CEO1983_3D.png và .pdf');

  await browser.close();

  // Đồng bộ sang public/docs
  [
    'PROFILE_CRM_QUAN_TRI_CEO1983.png',
    'PROFILE_CRM_QUAN_TRI_CEO1983.pdf',
    'PROFILE_CRM_QUAN_TRI_CEO1983.html',
    'POSTER_APP_CEO1983_3D.png',
    'POSTER_APP_CEO1983_3D.pdf',
    'POSTER_APP_CEO1983_3D.html'
  ].forEach(f => {
    const src = path.join(DOC_DIR, f);
    const dest = path.join(FE_DOCS_DIR, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
  });
  console.log('✓ Đã đồng bộ sang apps/ceo1983_app_fe/public/docs/');

  console.log('=====================================================================');
  console.log('HOÀN TẤT NÂNG CẤP V7 VỚI 3 ẢNH NỀN ĐAN XEN MỜ NỔI BẬT & 3D SHOWROOM!');
  console.log('=====================================================================');
}

run().catch(err => {
  console.error('LỖI:', err);
  process.exit(1);
});
