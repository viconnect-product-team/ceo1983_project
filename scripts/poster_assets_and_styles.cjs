/**
 * BUILD_4_POSTERS_AND_HD_SLIDES.JS
 * 
 * Tác vụ:
 * 1. Tách và tái tạo hoàn hảo 4 Poster từ ảnh gốc thành 4 tác phẩm riêng biệt siêu nét:
 *    - Poster 1: ỨNG DỤNG QUẢN LÝ HIỆP HỘI CEO1983 - Nền tảng thẻ thông minh dành cho doanh nhân (Mobile App Overview)
 *    - Poster 2: TOÀN BỘ ĐẶC QUYỀN CỦA DOANH NHÂN TRONG TẦM TAY (Mobile App 4 Đặc Quyền Chi Tiết)
 *    - Poster 3: NỀN TẢNG QUẢN TRỊ HIỆP HỘI CEO1983 - Quản trị cơ hội và điều hành tổ chức chuyên nghiệp, bền vững (Web CRM Overview)
 *    - Poster 4: NỀN TẢNG HỖ TRỢ QUẢN LÝ VÀ ĐIỀU HÀNH DÀNH RIÊNG CHO HIỆP HỘI (Web CRM 4 Phân Hệ Quản Trị Chi Tiết)
 *    - Poster 4-in-1: Ghép 4 poster 2x2 siêu nét như ảnh gốc của người dùng nhưng ở chất lượng Ultra-HD 4K.
 * 2. Tái tạo Bộ Slide PDF Tổng Thể Hệ Sinh Thái CEO 1983 (15 Slides chuẩn 16:9 Vector, không bị vỡ ảnh hay mờ khi zoom to).
 * 3. Xuất toàn bộ file HTML, PDF vector và PNG độ phân giải cực cao (300 DPI / 4K / 8K).
 * 4. Tự động đồng bộ sang thư mục document/ và apps/ceo1983_app_fe/public/docs/.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');
const LIVE_IMG_DIR = path.join(DOC_DIR, 'images/live_captures_fresh');
const BG_DIR = path.join(DOC_DIR, 'images/backgrounds');

[DOC_DIR, FE_DOCS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  }
  return '';
}

// Logo chuẩn
const LOGO_CEO1983 = getBase64Image(path.join(DOC_DIR, 'images/ceo1983-official-logo.png'));
const LOGO_VICONNECT = getBase64Image(path.join(DOC_DIR, 'images/viconnect-logo.png'));

// Backgrounds
const BG_SKYLINE = getBase64Image(path.join(BG_DIR, '08_skyline_night.jpg'));
const BG_SKYLINE_LAKE = getBase64Image(path.join(BG_DIR, '01_skyline_lake.jpg'));
const BG_BOARDROOM = getBase64Image(path.join(BG_DIR, '02_boardroom.jpg'));
const BG_OPERATIONS = getBase64Image(path.join(BG_DIR, '04_operations.jpg'));
const BG_BANQUET = getBase64Image(path.join(BG_DIR, '07_banquet_gala.jpg'));
const BG_SMARTCITY = getBase64Image(path.join(BG_DIR, '03_smartcity.jpg'));

const GUIDE_MOBILE_DIR = path.join(DOC_DIR, 'images/guide_mobile');
const GUIDE_CRM_DIR = path.join(DOC_DIR, 'images/guide_crm');

// Ảnh CRM chi tiết thực tế
const CRM_01 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_01_dashboard_tongquan.png'));
const CRM_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_02_thongke_baocao_bi.png'));
const CRM_03 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_03_quanly_hoivien_360.png'));
const CRM_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_04_quanly_sukien_gala.png'));
const CRM_06 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_06_baocao_taichinh_thuchi.png'));
const CRM_08 = getBase64Image(path.join(LIVE_IMG_DIR, 'crm_08_giaoviec_ban_dieuhanh.png'));

// Ảnh CRM nghiệp vụ chuyên sâu to rõ
const CRM_MEMBERS_TABLE = getBase64Image(path.join(GUIDE_CRM_DIR, '08_quan_ly_hoi_vien.png'));
const CRM_MEMBER_DETAIL = getBase64Image(path.join(GUIDE_CRM_DIR, '09_phe_duyet_chi_tiet_hoi_vien.png'));
const CRM_EVENTS_TABLE = getBase64Image(path.join(GUIDE_CRM_DIR, '10_quan_tri_su_kien.png'));
const CRM_SEATING_CHART = getBase64Image(path.join(GUIDE_CRM_DIR, '12_so_do_khan_phong_ban_tiec.png'));
const CRM_FINANCE_CASHBOOK = getBase64Image(path.join(GUIDE_CRM_DIR, '19_quan_ly_so_quy_thu_chi.png'));
const CRM_FINANCE_INVOICE = getBase64Image(path.join(GUIDE_CRM_DIR, '20_quan_ly_hoi_phi_hoa_don.png'));
const CRM_KANBAN_TASKS = getBase64Image(path.join(GUIDE_CRM_DIR, '17_giao_viec_nhiem_vu_kanban.png'));
const CRM_RBAC_MATRIX = getBase64Image(path.join(GUIDE_CRM_DIR, '07_ma_tran_phan_quyen_rbac.png'));

const APP_01 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_01_trangchu_doanhnhan.png'));
const APP_02 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_02_the_hoivien_so_vip.png'));
const APP_03 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_03_danhthiep_dien_tu.png'));
const APP_04 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_04_san_giaothuong_b2b.png'));
const APP_05 = getBase64Image(path.join(LIVE_IMG_DIR, 'app_05_sukien_ve_dien_tu.png'));

// Ảnh bổ sung chính xác theo bản mẫu Poster thực tế
const APP_HOME_CLEAN = getBase64Image(path.join(GUIDE_MOBILE_DIR, '04_trang_chu_mobile.png'));
const APP_EVENT_LIST = getBase64Image(path.join(GUIDE_MOBILE_DIR, '09_danh_sach_su_kien.png'));
const APP_TICKET_QR = getBase64Image(path.join(GUIDE_MOBILE_DIR, '11_ve_dien_tu_qr_checkin.png'));
const APP_CARD_CLEAN = getBase64Image(path.join(GUIDE_MOBILE_DIR, '05_the_hoi_vien_vip_mat_truoc.png'));
const APP_B2B_MARKET = getBase64Image(path.join(GUIDE_MOBILE_DIR, '12_san_giao_thuong_b2b.png'));
const APP_DEALS = getBase64Image(path.join(GUIDE_MOBILE_DIR, '14_co_hoi_kinh_doanh.png'));

console.log('✓ Đã tải tài nguyên hình ảnh.');

// ViOne Logo Emblem SVG
const VIONE_EMBLEM_SVG = `
<svg class="w-8 h-8 shrink-0" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M35.6221 7.52984C36.147 7.84494 36.6022 8.1127 37.0029 8.34244C37.1206 8.28462 37.2352 8.22679 37.3441 8.17053C38.1543 7.75026 38.9136 7.76539 39.5274 7.92915C39.4661 5.57441 37.5623 3.68457 35.221 3.68457C33.0101 3.68457 31.1891 5.36991 30.9414 7.54032C31.6063 6.67378 32.9641 5.93376 35.6225 7.52984H35.6221Z" fill="#FFFFFF"/>
  <path d="M31.455 10.1682C32.7292 10.1384 35.2895 9.18568 37.0019 8.34282C36.6012 8.11309 36.1461 7.84494 35.6211 7.53023C32.9627 5.93414 31.605 6.67417 30.9401 7.54071C30.9209 7.70679 30.9102 7.87521 30.9102 8.04635C30.9102 8.81664 31.1084 9.54037 31.4546 10.1682H31.455Z" fill="#E2E8F0"/>
  <path d="M37.3432 8.17049C37.2343 8.22715 37.1196 8.28458 37.0019 8.3424C38.1411 8.99628 38.8229 9.33079 39.2872 9.48756C39.4552 9.0021 39.5418 8.47784 39.528 7.93106L39.5265 7.92912C38.9126 7.76497 38.1534 7.74984 37.3432 8.17049Z" fill="#CBD5E1"/>
  <path d="M31.455 10.1682C32.1916 11.5039 33.6012 12.4077 35.2201 12.4077C37.1008 12.4077 38.699 11.188 39.2872 9.48793C38.8229 9.33116 38.1415 8.99626 37.0019 8.34277C35.2891 9.18602 32.7288 10.1383 31.455 10.1682Z" fill="#FFFFFF"/>
  <path d="M32.8344 23.6757L26.7975 23.6699L21.8906 32.2712L24.911 37.5651L32.8344 23.6757Z" fill="#FFFFFF"/>
  <path d="M21.8895 32.2712L16.983 23.6699L10.9453 23.6757L18.8695 37.5655L21.8899 42.8594L24.9099 37.5651L21.8895 32.2712Z" fill="#FFFFFF"/>
  <path d="M2.91033 22.2586C2.91033 11.6239 11.4293 3.00241 21.9375 3.00241C23.9406 3.00241 25.8708 3.31712 27.6838 3.89805C28.1983 2.94381 28.8836 2.09746 29.7007 1.40322C27.3038 0.496715 24.709 0 22 0C9.84986 0 0 9.96844 0 22.2649C0 32.8984 7.36631 41.7896 17.2162 44.0004L15.0539 40.2102C7.94914 37.4178 2.91033 30.4358 2.91033 22.2586Z" fill="#FFFFFF"/>
  <path d="M42.0977 13.1979C41.4532 14.0799 40.6456 14.8324 39.7223 15.4133C40.5222 17.541 40.9643 19.8469 40.9643 22.2587C40.9643 30.373 36.0025 37.3099 28.984 40.145L26.785 44C36.6337 41.7889 43.9996 32.898 43.9996 22.2649C43.9996 19.0354 43.3194 15.9674 42.0974 13.1979H42.0977Z" fill="#FFFFFF"/>
</svg>`;

// Common Styles for Posters
const POSTER_COMMON_HEAD = `
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
      background: #F1F5F9;
      color: #0F172A;
    }
    .poster-canvas {
      width: 1400px;
      height: 1980px;
      min-width: 1400px;
      min-height: 1980px;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin: 0 auto;
    }
    .bg-light-ambient {
      background: linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 35%, #EAF2FE 75%, #DFEDFE 100%);
    }
    .skyline-overlay {
      position: absolute;
      top: 0;
      right: 0;
      width: 60%;
      height: 45%;
      background: radial-gradient(circle at 80% 20%, rgba(13, 148, 255, 0.15), transparent 70%);
      pointer-events: none;
    }
    .building-silhouette {
      position: absolute;
      top: 20px;
      right: 40px;
      width: 480px;
      height: 380px;
      opacity: 0.18;
      background: linear-gradient(135deg, #0A369D, #00D4FF);
      mask-image: radial-gradient(ellipse at 70% 30%, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at 70% 30%, black 40%, transparent 80%);
      pointer-events: none;
    }
    .bottom-wave-banner {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 140px;
      background: linear-gradient(135deg, #072366 0%, #0A389C 50%, #104EB8 100%);
      border-top: 6px solid #FFFFFF;
      box-shadow: 0 -12px 35px rgba(10, 56, 156, 0.25);
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 40;
    }
    .bottom-wave-banner::before {
      content: '';
      position: absolute;
      top: -12px;
      left: 10%;
      right: 10%;
      height: 6px;
      background: linear-gradient(90deg, transparent, #EA580C, #F59E0B, transparent);
      border-radius: 999px;
    }
    .vione-capsule {
      background: linear-gradient(135deg, #133E9A 0%, #1A4FB5 100%);
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3);
      padding: 14px 42px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .phone-mockup-frame {
      border-radius: 52px;
      padding: 10px;
      background: linear-gradient(145deg, #2D3748, #1A202C);
      box-shadow: 0 35px 70px -15px rgba(15, 30, 65, 0.45), 0 0 30px rgba(0, 102, 255, 0.15);
      border: 3.5px solid #CBD5E1;
      position: relative;
    }
    .phone-mockup-inner {
      border-radius: 42px;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
    }
    .phone-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 24px;
      background: #000000;
      border-radius: 20px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
    }
    .phone-lens {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #111827;
      border: 1.5px solid #374151;
    }
    .imac-mockup-frame {
      border-radius: 28px;
      padding: 12px;
      background: linear-gradient(145deg, #E2E8F0, #CBD5E1);
      box-shadow: 0 45px 90px -20px rgba(15, 30, 65, 0.35);
      border: 3px solid #94A3B8;
      position: relative;
    }
    .imac-mockup-inner {
      border-radius: 18px;
      overflow: hidden;
      background: #0F172A;
      border: 2px solid #000000;
      position: relative;
    }
    .imac-stand {
      width: 180px;
      height: 90px;
      margin: 0 auto;
      background: linear-gradient(180deg, #94A3B8 0%, #E2E8F0 100%);
      clip-path: polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%);
      box-shadow: 0 15px 30px rgba(0,0,0,0.25);
    }
    .imac-base {
      width: 320px;
      height: 14px;
      margin: -2px auto 0;
      background: linear-gradient(90deg, #CBD5E1, #F1F5F9, #CBD5E1);
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .podium-stage {
      position: absolute;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      width: 1250px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #E2ECFB 50%, #C9DBF6 80%, rgba(201, 219, 246, 0) 100%);
      box-shadow: 0 30px 60px rgba(10, 40, 100, 0.15);
      z-index: 1;
    }
    .podium-disc {
      position: absolute;
      bottom: 140px;
      left: 50%;
      transform: translateX(-50%);
      width: 1050px;
      height: 180px;
      border-radius: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(225, 238, 255, 0.7) 100%);
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 15px 35px rgba(10, 50, 140, 0.12);
      z-index: 2;
    }
    .feature-pill-badge {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 20px;
      padding: 12px 18px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      width: 250px;
    }
    .grid-feature-card {
      background: #FFFFFF;
      border-radius: 26px;
      border: 1.5px solid #E2E8F0;
      box-shadow: 0 12px 30px rgba(15, 30, 65, 0.07);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
    }
    @page {
      size: 1400px 1980px;
      margin: 0;
    }
  </style>
`;

module.exports = {
  DOC_DIR,
  FE_DOCS_DIR,
  LIVE_IMG_DIR,
  BG_DIR,
  LOGO_CEO1983,
  LOGO_VICONNECT,
  BG_SKYLINE,
  BG_SKYLINE_LAKE,
  BG_BOARDROOM,
  BG_OPERATIONS,
  BG_BANQUET,
  BG_SMARTCITY,
  CRM_01,
  CRM_02,
  CRM_03,
  CRM_04,
  CRM_06,
  CRM_08,
  CRM_MEMBERS_TABLE,
  CRM_MEMBER_DETAIL,
  CRM_EVENTS_TABLE,
  CRM_SEATING_CHART,
  CRM_FINANCE_CASHBOOK,
  CRM_FINANCE_INVOICE,
  CRM_KANBAN_TASKS,
  CRM_RBAC_MATRIX,
  APP_01,
  APP_02,
  APP_03,
  APP_04,
  APP_05,
  APP_HOME_CLEAN,
  APP_EVENT_LIST,
  APP_TICKET_QR,
  APP_CARD_CLEAN,
  APP_B2B_MARKET,
  APP_DEALS,
  VIONE_EMBLEM_SVG,
  POSTER_COMMON_HEAD
};
