const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DIR = path.resolve(__dirname, '../../vione_project');
const VIONE_DOC_DIR = path.join(VIONE_DIR, 'document');
const VIONE_FE_DOCS_DIR = path.join(VIONE_DIR, 'apps', 'vione_app_fe', 'public', 'docs');
const IMG_DIR = path.join(VIONE_DOC_DIR, 'images', 'evidence');

[VIONE_DOC_DIR, VIONE_FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function getImgSrc(filename) {
  const filePath = path.join(IMG_DIR, filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${b64}`;
  }
  return '';
}

function generateVioneMasterHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tài Liệu Hướng Dẫn Sử Dụng & Vận Hành Hệ Thống ViOne Enterprise CRM & ViOne Connect App</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: #0A0A0B; color: #1E293B; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10.5pt; line-height: 1.6; }
    
    .trn-doc { width: 100%; max-width: 980px; margin: 0 auto; background: #FFFFFF; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    
    /* Cover Page */
    .cover {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, #0A0A0B 0%, #17171C 45%, #241E17 80%, #0D0D10 100%);
      color: #FFFFFF;
      padding: 60px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .cover::before {
      content: "";
      position: absolute;
      top: -100px; right: -100px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(216, 178, 130, 0.2) 0%, rgba(216, 178, 130, 0) 70%);
      border-radius: 50%;
    }
    .cover .accent-bar { width: 80px; height: 5px; background: linear-gradient(90deg, #F6E1C3, #D8B282, #8C653B); border-radius: 3px; margin-bottom: 24px; }
    .cover .header { display: flex; justify-content: space-between; font-size: 10.5pt; color: #A1A1AA; font-weight: 600; letter-spacing: 0.5px; }
    .cover .header span { color: #D8B282; font-weight: 700; }
    .cover .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 30px;
      background: rgba(216, 178, 130, 0.15); border: 1px solid rgba(216, 178, 130, 0.4);
      color: #F6E1C3; font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 24px;
    }
    .cover h1 { font-size: 32pt; font-weight: 900; line-height: 1.15; margin: 0 0 16px 0; color: #FFFFFF; letter-spacing: -0.5px; }
    .cover h1 span { background: linear-gradient(135deg, #F6E1C3 0%, #D8B282 50%, #C29B69 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .cover .sub { font-size: 14pt; color: #D4D4D8; line-height: 1.5; max-width: 780px; margin-bottom: 32px; font-weight: 400; }
    
    .cover .meta-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(216, 178, 130, 0.25);
      border-radius: 16px; padding: 20px 24px; backdrop-filter: blur(10px);
    }
    .cover .meta-item .lbl { font-size: 8.5pt; text-transform: uppercase; color: #A1A1AA; font-weight: 600; letter-spacing: 0.8px; margin-bottom: 4px; }
    .cover .meta-item .val { font-size: 11pt; color: #FFFFFF; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .cover .meta-item .val.highlight { color: #D8B282; }
    .cover .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); }
    .cover .footer-left { font-size: 9pt; color: #71717A; line-height: 1.5; }
    .cover .footer-right { text-align: right; }
    .cover .org-title { font-size: 12pt; font-weight: 800; color: #FFFFFF; }
    .cover .org-sub { font-size: 9pt; color: #D8B282; font-weight: 600; }

    /* Content Layout */
    .content-body { padding: 48px; }
    
    /* Table of Contents */
    .toc-card {
      background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 16px; padding: 32px; margin-bottom: 48px;
      page-break-after: always; break-after: page;
    }
    .toc-card h2 { font-size: 18pt; font-weight: 800; color: #0A0A0B; margin: 0 0 20px 0; border-bottom: 2px solid #D8B282; padding-bottom: 12px; }
    .toc-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .toc-item { display: flex; justify-content: space-between; font-size: 9.5pt; border-bottom: 1px dashed #E4E4E7; padding-bottom: 4px; }
    .toc-item a { color: #18181B; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .toc-item a:hover { color: #B45309; }
    .toc-item span { color: #B45309; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    /* Chapter */
    .chapter { margin-bottom: 56px; page-break-inside: avoid; }
    .chap-header {
      display: flex; align-items: center; gap: 14px;
      background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
      color: #FFFFFF; padding: 14px 20px; border-radius: 12px; margin-bottom: 24px;
      border-left: 6px solid #D8B282;
    }
    .chap-header .num {
      background: linear-gradient(135deg, #F6E1C3 0%, #D8B282 100%);
      color: #18181B; font-weight: 900; font-size: 12pt;
      width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; font-family: 'JetBrains Mono', monospace;
    }
    .chap-header h2 { font-size: 14pt; font-weight: 800; margin: 0; color: #FFFFFF; }
    
    .meta-box {
      background: #F4F4F5; border: 1px solid #E4E4E7; border-radius: 10px;
      padding: 12px 18px; margin-bottom: 20px; display: grid; grid-template-columns: 120px 1fr; gap: 8px 16px;
      font-size: 9.5pt;
    }
    .meta-box .k { font-weight: 700; color: #52525B; text-transform: uppercase; font-size: 8.5pt; }
    .meta-box .v { color: #18181B; font-weight: 600; }
    .meta-box .v code { background: #E4E4E7; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #B45309; font-weight: 700; font-size: 9pt; }

    /* Content elements */
    h3 { font-size: 12pt; font-weight: 800; color: #0A0A0B; margin: 24px 0 12px 0; border-left: 4px solid #D8B282; padding-left: 10px; }
    p { margin: 0 0 12px 0; color: #3F3F46; line-height: 1.6; }
    
    /* Callout Box */
    .callout {
      border-radius: 10px; padding: 14px 18px; margin: 16px 0; font-size: 9.5pt;
      display: flex; gap: 12px; align-items: flex-start;
    }
    .callout.gold { background: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; }
    .callout.blue { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; }
    .callout.green { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
    .callout .icon { font-size: 14pt; line-height: 1; flex-shrink: 0; }
    .callout .text { margin: 0; font-weight: 500; }
    .callout .text strong { font-weight: 800; }

    /* Steps list */
    .step-list { list-style: none; padding: 0; margin: 0 0 20px 0; counter-reset: step-counter; }
    .step-item {
      display: flex; gap: 14px; margin-bottom: 14px; position: relative;
    }
    .step-badge {
      counter-increment: step-counter;
      content: counter(step-counter);
      width: 28px; height: 28px; border-radius: 8px;
      background: #18181B; color: #D8B282; font-weight: 800; font-size: 9.5pt;
      display: grid; place-items: center; flex-shrink: 0; font-family: 'JetBrains Mono', monospace;
    }
    .step-content { flex: 1; padding-top: 2px; }
    .step-content strong { color: #0A0A0B; font-weight: 700; font-size: 10pt; }
    .step-content p { margin: 4px 0 0 0; font-size: 9.5pt; color: #52525B; }

    /* Phone Mockup Frame for Mobile screenshots */
    .shot-mobile-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
      margin: 20px 0; place-items: center;
    }
    .shot-mobile-card {
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .phone-mockup {
      width: 275px;
      border: 8px solid #18181B;
      border-radius: 36px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
      overflow: hidden;
      background: #000000;
      position: relative;
      margin-bottom: 10px;
    }
    .phone-mockup::before {
      content: "";
      position: absolute;
      top: 6px; left: 50%; transform: translateX(-50%);
      width: 80px; height: 18px;
      background: #18181B;
      border-radius: 10px;
      z-index: 10;
    }
    .phone-mockup img {
      width: 100%; height: auto; display: block;
    }
    .shot-caption {
      font-size: 8.5pt; color: #71717A; font-weight: 600; font-style: italic; margin-top: 6px;
    }

    /* Wide Desktop Card for CRM */
    .shot-desktop-container {
      margin: 20px 0; border: 1px solid #E4E4E7; border-radius: 12px;
      overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); background: #FAFAFA;
    }
    .shot-desktop-header {
      background: #F4F4F5; padding: 8px 14px; border-bottom: 1px solid #E4E4E7;
      display: flex; align-items: center; gap: 8px; font-size: 8pt; color: #71717A; font-family: 'JetBrains Mono', monospace;
    }
    .shot-desktop-header .dots { display: flex; gap: 5px; }
    .shot-desktop-header .dot { width: 10px; height: 10px; border-radius: 50%; }
    .shot-desktop-header .dot.red { background: #EF4444; }
    .shot-desktop-header .dot.yellow { background: #F59E0B; }
    .shot-desktop-header .dot.green { background: #10B981; }
    .shot-desktop-container img { width: 100%; height: auto; display: block; }
    .shot-desktop-caption {
      padding: 8px 14px; font-size: 8.5pt; color: #52525B; font-weight: 600; text-align: center; background: #FFFFFF; border-top: 1px solid #F4F4F5;
    }

    /* Data Table */
    .data-table {
      width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 9pt;
      border: 1px solid #E4E4E7; border-radius: 8px; overflow: hidden;
    }
    .data-table th {
      background: #18181B; color: #D8B282; font-weight: 700; text-align: left;
      padding: 10px 14px; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.5px;
    }
    .data-table td {
      padding: 9px 14px; border-bottom: 1px solid #F4F4F5; color: #3F3F46;
    }
    .data-table tr:nth-child(even) td { background: #FAFAFA; }
    .data-table code { background: #F4F4F5; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: #B45309; font-weight: 600; }

    /* Page Footer in Print */
    @page {
      size: A4;
      margin: 18mm 14mm 20mm 14mm;
      @bottom-right {
        content: "Trang " counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #A1A1AA;
      }
    }
    @page:first { margin: 0; }
  </style>
</head>
<body>
<div class="trn-doc">

  <!-- ==================== TRANG BÌA ==================== -->
  <div class="cover">
    <div>
      <div class="header">
        <div>HỆ SINH THÁI DOANH NGHIỆP SỐ · <span>VICONNECT GROUP</span></div>
        <div>MÃ: <span>HDSD-VIONE-MASTER-v3.0</span></div>
      </div>
      <div style="margin-top: 60px;">
        <div class="accent-bar"></div>
        <div class="badge">TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHÍNH THỨC · PHIÊN BẢN V3.0 LUXURY</div>
        <h1>NỀN TẢNG SIÊU ỨNG DỤNG DOANH NGHIỆP<br><span>VIONE ENTERPRISE & VIONE CONNECT</span></h1>
        <div class="sub">
          Cẩm nang hướng dẫn toàn diện cấu hình, khai thác và vận hành 16 phân hệ cốt lõi: Quản trị CRM Doanh nghiệp đa công ty, Pipeline xúc tiến thương mại B2B, Sàn thương mại B2B Marketplace, Tài chính Thu - Chi - Báo cáo, Lịch họp đối tác, Văn bản số hóa, và Ứng dụng di động ViOne Connect (Danh thiếp số Titanium, Moments B2B, Quét chạm thông minh NFC).
        </div>
      </div>
    </div>

    <div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="lbl">Hệ Thống Web CRM</div>
          <div class="val highlight">Port 5445 /auth</div>
        </div>
        <div class="meta-item">
          <div class="lbl">Ứng Dụng Di Động</div>
          <div class="val highlight">/connect-app (Mobile)</div>
        </div>
        <div class="meta-item">
          <div class="lbl">Tiêu Chuẩn Thiết Kế</div>
          <div class="val">Onyx & Champagne Gold</div>
        </div>
        <div class="meta-item">
          <div class="lbl">Đối Tượng Áp Dụng</div>
          <div class="val">BQT, CEO & Doanh Nghiệp</div>
        </div>
        <div class="meta-item">
          <div class="lbl">Cơ Sở Dữ Liệu</div>
          <div class="val">PostgreSQL 15+ Dual-Sync</div>
        </div>
        <div class="meta-item">
          <div class="lbl">Ngày Xuất Bản</div>
          <div class="val">01/10/2026</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-left">
          Lưu hành nội bộ & chuyển giao khách hàng doanh nghiệp đối tác ViOne<br>
          Bảo mật thông tin cấp độ 2 · Nghiêm cấm sao chép khi chưa có văn bản chấp thuận.
        </div>
        <div class="footer-right">
          <div class="org-title">TẬP ĐOÀN CÔNG NGHỆ VIONE</div>
          <div class="org-sub">VIONE ENTERPRISE & BUSINESS CONNECT PLATFORM</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== NỘI DUNG ==================== -->
  <div class="content-body">

    <!-- MỤC LỤC -->
    <div class="toc-card">
      <h2>Mục Lục Hướng Dẫn Vận Hành (16 Chương)</h2>
      <ul class="toc-list">
        <li class="toc-item"><a href="#c1">Chương 1: Kiến Trúc Tổng Quan Nền Tảng ViOne</a><span>Trang 03</span></li>
        <li class="toc-item"><a href="#c2">Chương 2: Đăng Nhập & Phân Quyền Web CRM ViOne</a><span>Trang 05</span></li>
        <li class="toc-item"><a href="#c3">Chương 3: Trung Tâm Điều Hành B2B Dashboard</a><span>Trang 07</span></li>
        <li class="toc-item"><a href="#c4">Chương 4: Quản Lý Mạng Lưới Đối Tác & Thành Viên</a><span>Trang 09</span></li>
        <li class="toc-item"><a href="#c5">Chương 5: Quản Lý Hồ Sơ Doanh Nghiệp Đa Công Ty</a><span>Trang 11</span></li>
        <li class="toc-item"><a href="#c6">Chương 6: Pipeline Cơ Hội Xúc Tiến Thương Mại B2B</a><span>Trang 13</span></li>
        <li class="toc-item"><a href="#c7">Chương 7: Quản Trị Sàn Thương Mại B2B Marketplace</a><span>Trang 15</span></li>
        <li class="toc-item"><a href="#c8">Chương 8: Quản Trị Tài Chính: Thu - Chi - Báo Cáo</a><span>Trang 17</span></li>
        <li class="toc-item"><a href="#c9">Chương 9: Quản Lý Văn Bản, Hợp Đồng & Tài Liệu Số</a><span>Trang 19</span></li>
        <li class="toc-item"><a href="#c10">Chương 10: Quản Lý Lịch Họp Doanh Nghiệp B2B</a><span>Trang 21</span></li>
        <li class="toc-item"><a href="#c11">Chương 11: Quản Trị Danh Thiếp Thông Minh Thẻ Số</a><span>Trang 23</span></li>
        <li class="toc-item"><a href="#c12">Chương 12: Đăng Nhập Ứng Dụng ViOne Connect Mobile</a><span>Trang 25</span></li>
        <li class="toc-item"><a href="#c13">Chương 13: Điều Hành Executive Today & Phím Tắt "V"</a><span>Trang 27</span></li>
        <li class="toc-item"><a href="#c14">Chương 14: Danh Bạ Mạng Lưới Doanh Nhân B2B</a><span>Trang 29</span></li>
        <li class="toc-item"><a href="#c15">Chương 15: Bảng Tin Moments & Trò Chuyện Bảo Mật</a><span>Trang 31</span></li>
        <li class="toc-item"><a href="#c16">Chương 16: Thẻ Số Titanium, Kích Hoạt Thẻ NFC & Me</a><span>Trang 33</span></li>
      </ul>
    </div>

    <!-- CHƯƠNG 1 -->
    <div class="chapter" id="c1">
      <div class="chap-header">
        <div class="num">01</div>
        <h2>Kiến Trúc Tổng Quan Nền Tảng ViOne Enterprise & Connect</h2>
      </div>
      <div class="meta-box">
        <div class="k">Mục tiêu</div><div class="v">Nắm vững kiến trúc 2 phân hệ song hành: Web CRM Quản trị và App Di động ViOne Connect.</div>
        <div class="k">URL CRM</div><div class="v"><code>https://14.225.217.232:5445/auth</code> (Port 5445)</div>
        <div class="k">URL Mobile</div><div class="v"><code>https://14.225.217.232:5445/connect-app</code> (Chế độ Smartphone dọc)</div>
      </div>
      <p>Hệ sinh thái ViOne được thiết kế theo mô hình <strong>Doanh Nghiệp Đa Tầng (Enterprise Multi-Company Architecture)</strong>, kết nối liền mạch giữa bộ máy quản trị điều hành của ban lãnh đạo doanh nghiệp (Web CRM) và không gian giao thương, số hóa danh thiếp dành riêng cho từng doanh nhân (Mobile Connect App).</p>
      
      <div class="callout gold">
        <div class="icon">✨</div>
        <div class="text"><strong>Nguyên tắc đồng bộ dữ liệu thời gian thực:</strong> 100% dữ liệu tạo mới từ Web CRM (công ty, sản phẩm marketplace, cơ hội xúc tiến, lịch họp) lập tức được đẩy xuống App ViOne Connect và lưu trữ bền vững tại PostgreSQL thông qua NestJS RESTful APIs. Tuyệt đối không sử dụng dữ liệu tĩnh (mock/hardcode).</div>
      </div>
    </div>

    <!-- CHƯƠNG 2 -->
    <div class="chapter" id="c2">
      <div class="chap-header">
        <div class="num">02</div>
        <h2>Quản Trị Đăng Nhập & Phân Quyền Web CRM ViOne</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/auth</code> hoặc <code>/auth?portal=crm</code></div>
        <div class="k">Tài khoản</div><div class="v"><code>admin@connect.vn</code> | Mật khẩu: <code>123456</code></div>
      </div>
      <p>Cổng đăng nhập Web CRM ViOne được thiết kế độc lập, bảo mật bằng JWT và mã hóa mật khẩu Bcrypt. Giao diện trang bị bộ lọc bảo mật IP, hỗ trợ ghi nhớ tài khoản và chống tấn công Brute-force.</p>
      
      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/auth — Giao diện Đăng nhập Quản trị CRM ViOne</span>
        </div>
        <img src="${getImgSrc('crm_vione_01_login.png')}" alt="CRM Login Screen" />
        <div class="shot-desktop-caption">Hình 2.1: Màn hình đăng nhập hệ thống quản trị CRM ViOne Enterprise với tông màu trắng - xanh sẫm chuyên nghiệp</div>
      </div>

      <ul class="step-list">
        <li class="step-item">
          <div class="step-badge"></div>
          <div class="step-content">
            <strong>Bước 1: Nhập định danh tài khoản quản trị</strong>
            <p>Điền email hoặc tên đăng nhập chính danh vào ô Email/Username, sau đó nhập mật khẩu bảo mật.</p>
          </div>
        </li>
        <li class="step-item">
          <div class="step-badge"></div>
          <div class="step-content">
            <strong>Bước 2: Xác thực & Điều hướng phiên làm việc</strong>
            <p>Bấm nút <em>Đăng nhập</em>. Hệ thống gửi request xác thực tới <code>POST /api/auth/login</code>, cấp Access Token và chuyển hướng thẳng vào Bảng điều khiển CRM.</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- CHƯƠNG 3 -->
    <div class="chapter" id="c3">
      <div class="chap-header">
        <div class="num">03</div>
        <h2>Trung Tâm Điều Hành B2B Dashboard & Chỉ Số KPI</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/</code> hoặc <code>/dashboard</code></div>
        <div class="k">Chức năng</div><div class="v">Tổng hợp KPI doanh nghiệp, doanh số giao thương, đối tác kết nối và tiến độ cơ hội.</div>
      </div>
      <p>Dashboard B2B của ViOne là bức tranh tổng thể về sức khỏe doanh nghiệp, tập hợp dữ liệu thời gian thực từ tất cả các phân hệ vệ tinh: Số lượng công ty đối tác, quy mô hợp đồng đang triển khai, dòng tiền thu chi và tình trạng thanh toán.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/ — Trung tâm Điều hành Doanh nghiệp ViOne Dashboard</span>
        </div>
        <img src="${getImgSrc('crm_vione_02_dashboard.png')}" alt="CRM Dashboard" />
        <div class="shot-desktop-caption">Hình 3.1: Bảng điều khiển KPI điều hành kinh doanh và chỉ số giao thương B2B</div>
      </div>
    </div>

    <!-- CHƯƠNG 4 -->
    <div class="chapter" id="c4">
      <div class="chap-header">
        <div class="num">04</div>
        <h2>Quản Lý Mạng Lưới Đối Tác Doanh Nghiệp & Hội Viên</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/members</code></div>
        <div class="k">Dữ liệu</div><div class="v">Bảng <code>public.members</code> liên kết <code>public.vione_users</code></div>
      </div>
      <p>Màn hình quản lý đối tác cho phép tra cứu, tìm kiếm theo ngành nghề kinh doanh, tỉnh thành, và trạng thái hồ sơ. Ban điều hành có thể phân nhóm đối tác chiến lược, cấp hạn ngạch giao thương và quản lý thông tin liên hệ đa kênh.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/members — Danh mục Đối tác & Thành viên Doanh nghiệp</span>
        </div>
        <img src="${getImgSrc('crm_vione_03_members_partners.png')}" alt="CRM Members" />
        <div class="shot-desktop-caption">Hình 4.1: Danh sách đối tác doanh nghiệp, tình trạng thẻ thành viên và công ty đại diện</div>
      </div>
    </div>

    <!-- CHƯƠNG 5 -->
    <div class="chapter" id="c5">
      <div class="chap-header">
        <div class="num">05</div>
        <h2>Quản Lý Hồ Sơ Doanh Nghiệp Đa Công Ty (Companies)</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/companies</code></div>
        <div class="k">Tính năng</div><div class="v">Thêm mới công ty, thẩm định hồ sơ pháp lý, cập nhật Mã số thuế & Giấy phép ĐKKD.</div>
      </div>
      <p>Hỗ trợ mô hình tập đoàn đa công ty thành viên. Mỗi doanh nghiệp có hồ sơ pháp lý độc lập, liên kết với ban giám đốc và các sản phẩm dịch vụ niêm yết trên sàn Marketplace.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/companies — Quản trị Danh bạ Công ty Thành viên</span>
        </div>
        <img src="${getImgSrc('crm_vione_04_companies.png')}" alt="CRM Companies" />
        <div class="shot-desktop-caption">Hình 5.1: Danh sách doanh nghiệp thành viên với đầy đủ MST, lĩnh vực hoạt động và quy mô nhân sự</div>
      </div>
    </div>

    <!-- CHƯƠNG 6 -->
    <div class="chapter" id="c6">
      <div class="chap-header">
        <div class="num">06</div>
        <h2>Quản Trị Pipeline Cơ Hội Xúc Tiến Thương Mại B2B</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/opportunities</code></div>
        <div class="k">Quy trình</div><div class="v">Kanban Pipeline: Khởi tạo $\\rightarrow$ Thẩm định $\\rightarrow$ Đàm phán $\\rightarrow$ Ký kết $\\rightarrow$ Hoàn tất.</div>
      </div>
      <p>Phân hệ quản lý cơ hội giao thương B2B giúp kiểm soát tiến trình chốt hợp đồng giữa các đối tác. Phân loại theo ngân sách dự án (VNĐ), đơn vị cung ứng và nhu cầu hợp tác cụ thể.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/opportunities — Phân hệ Pipeline Cơ hội Giao thương B2B</span>
        </div>
        <img src="${getImgSrc('crm_vione_05_opportunities_pipeline.png')}" alt="CRM Opportunities" />
        <div class="shot-desktop-caption">Hình 6.1: Bảng Kanban quản lý trạng thái các thương vụ giao thương và giá trị hợp đồng dự kiến</div>
      </div>
    </div>

    <!-- CHƯƠNG 7 -->
    <div class="chapter" id="c7">
      <div class="chap-header">
        <div class="num">07</div>
        <h2>Quản Trị Sàn Thương Mại Điện Tử B2B Marketplace</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/marketplace</code></div>
        <div class="k">Tính năng</div><div class="v">Kiểm duyệt sản phẩm, phân loại danh mục, kích hoạt chính sách Giá sỉ & Chiết khấu VIP.</div>
      </div>
      <p>Nơi quy tụ hàng nghìn sản phẩm, dịch vụ B2B chất lượng cao từ các doanh nghiệp thành viên. Bộ lọc giá chuẩn xác hỗ trợ phân cách hàng nghìn VNĐ, hình ảnh sản phẩm sắc nét và cơ chế báo giá tự động.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/marketplace — Sàn Giao Dịch Hàng Hóa & Dịch Vụ B2B</span>
        </div>
        <img src="${getImgSrc('crm_vione_06_marketplace_catalog.png')}" alt="CRM Marketplace" />
        <div class="shot-desktop-caption">Hình 7.1: Danh mục sản phẩm B2B với chính sách chiết khấu đối tác và thông số kỹ thuật chi tiết</div>
      </div>
    </div>

    <!-- CHƯƠNG 8 -->
    <div class="chapter" id="c8">
      <div class="chap-header">
        <div class="num">08</div>
        <h2>Quản Trị Tài Chính Doanh Nghiệp: Thu - Chi - Báo Cáo</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/income</code>, <code>/expenses</code>, <code>/finance-report</code></div>
        <div class="k">Phân loại</div><div class="v">Thu doanh thu, Chi chi phí vận hành, Sổ quỹ tiền mặt & Tài khoản ngân hàng.</div>
      </div>
      <p>Hệ thống tài chính 3 tầng minh bạch: Lập phiếu thu $\\rightarrow$ Duyệt phiếu chi ngân sách $\\rightarrow$ Tổng hợp báo cáo kết quả hoạt động kinh doanh (P&L). Hỗ trợ đính kèm chứng từ chuyển khoản và sao kê ngân hàng.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/income — Quản lý Thu Tài Chính & Nguồn Thu Doanh Nghiệp</span>
        </div>
        <img src="${getImgSrc('crm_vione_07_finance_income.png')}" alt="Finance Income" />
        <div class="shot-desktop-caption">Hình 8.1: Sổ theo dõi nguồn thu và trạng thái thanh toán từ các thương vụ hợp tác</div>
      </div>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/finance-report — Báo Cáo Phân Tích Dòng Tiền & Hiệu Quả Tài Chính</span>
        </div>
        <img src="${getImgSrc('crm_vione_09_finance_report.png')}" alt="Finance Report" />
        <div class="shot-desktop-caption">Hình 8.2: Biểu đồ báo cáo phân tích biến động dòng tiền, tỷ trọng chi phí và lợi nhuận ròng</div>
      </div>
    </div>

    <!-- CHƯƠNG 9 -->
    <div class="chapter" id="c9">
      <div class="chap-header">
        <div class="num">09</div>
        <h2>Quản Lý Văn Bản, Hợp Đồng & Tài Liệu Số Hóa</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/documents</code></div>
        <div class="k">Định dạng</div><div class="v">PDF, DOCX, XLSX, Biên bản ghi nhớ (MOU), Hợp đồng phân phối B2B.</div>
      </div>
      <p>Kho lưu trữ tài liệu doanh nghiệp tập trung, tích hợp phân quyền truy cập theo vai trò. Hỗ trợ xem trực tuyến không cần tải về máy, ghi nhận lịch sử chỉnh sửa và phiên bản tài liệu.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/documents — Thư Viện Văn Bản & Hợp Đồng Điện Tử</span>
        </div>
        <img src="${getImgSrc('crm_vione_10_documents_contracts.png')}" alt="CRM Documents" />
        <div class="shot-desktop-caption">Hình 9.1: Kho tài liệu số hóa phân loại theo phòng ban và cấp độ bảo mật</div>
      </div>
    </div>

    <!-- CHƯƠNG 10 -->
    <div class="chapter" id="c10">
      <div class="chap-header">
        <div class="num">10</div>
        <h2>Quản Lý Lịch Họp Doanh Nghiệp & Đối Tác B2B</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/meetings</code></div>
        <div class="k">Hình thức</div><div class="v">Trực tiếp tại văn phòng hub hoặc Trực tuyến qua Zoom / Google Meet / UniWork Meet.</div>
      </div>
      <p>Lên lịch làm việc, thiết lập chương trình họp, gửi thư mời triệu tập tự động tới các thành viên tham gia. Phát hiện xung đột lịch và tích hợp điểm danh thông minh.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/meetings — Lịch Công Tác & Hội Nghị Đối Tác B2B</span>
        </div>
        <img src="${getImgSrc('crm_vione_11_meetings_calendar.png')}" alt="CRM Meetings" />
        <div class="shot-desktop-caption">Hình 10.1: Lịch biểu làm việc tuần/tháng với cơ chế cảnh báo trùng phòng họp tự động</div>
      </div>
    </div>

    <!-- CHƯƠNG 11 -->
    <div class="chapter" id="c11">
      <div class="chap-header">
        <div class="num">11</div>
        <h2>Quản Trị Danh Thiếp Thông Minh & Thẻ Số Doanh Nghiệp</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/business-cards</code></div>
        <div class="k">Tính năng</div><div class="v">Cấp phát thẻ số điện tử, cấu hình tên miền cá nhân hóa, mã hóa chip NFC ntag215.</div>
      </div>
      <p>Trung tâm quản lý toàn bộ danh thiếp số của nhân sự và đối tác thuộc hệ thống ViOne. Cho phép admin cấu hình thông tin đồng bộ, khóa thẻ khi thất lạc và theo dõi lượt chạm/quét danh thiếp thực tế.</p>

      <div class="shot-desktop-container">
        <div class="shot-desktop-header">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <span>https://14.225.217.232:5445/business-cards — Trung Tâm Quản Trị Danh Thiếp Số ViOne</span>
        </div>
        <img src="${getImgSrc('crm_vione_12_business_cards_admin.png')}" alt="CRM Business Cards" />
        <div class="shot-desktop-caption">Hình 11.1: Bảng điều khiển quản lý phôi thẻ, mã số định danh NFC và liên kết thẻ số</div>
      </div>
    </div>

    <!-- CHƯƠNG 12 -->
    <div class="chapter" id="c12">
      <div class="chap-header">
        <div class="num">12</div>
        <h2>Đăng Nhập Ứng Dụng ViOne Connect Mobile</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>https://14.225.217.232:5445/vione/login</code></div>
        <div class="k">Trải nghiệm</div><div class="v">Giao diện Smartphone dọc chuẩn Native Dark Luxury (Nền đen sẫm '#0A0A0B' & chữ đồng '#D8B282').</div>
      </div>
      <p>Cổng đăng nhập chuyên biệt dành cho doanh nhân trên thiết bị di động. Đăng nhập nhanh bằng tài khoản doanh nghiệp hoặc quét danh thiếp thông minh để liên kết phiên làm việc.</p>

      <div class="shot-mobile-grid">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_01_login.png')}" alt="App ViOne Login" />
          </div>
          <div class="shot-caption">Hình 12.1: Màn hình đăng nhập di động ViOne Connect sang trọng</div>
        </div>
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_02_home_agenda.png')}" alt="App ViOne Home Agenda" />
          </div>
          <div class="shot-caption">Hình 12.2: Màn hình trang chủ điều hành công việc hàng ngày</div>
        </div>
      </div>
    </div>

    <!-- CHƯƠNG 13 -->
    <div class="chapter" id="c13">
      <div class="chap-header">
        <div class="num">13</div>
        <h2>Điều Hành Executive Today & Phím Nhanh "V"</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/connect-app</code></div>
        <div class="k">Thao tác</div><div class="v">Phím tròn chữ "V" mạ vàng ở thanh điều hướng dưới cùng để mở menu tác vụ nhanh.</div>
      </div>
      <p>Bảng điều khiển cá nhân dành cho lãnh đạo: Hiển thị lịch hẹn hôm nay, thông báo thương vụ mới, phím tắt quét danh thiếp QR của đối tác và chia sẻ danh thiếp chỉ với 1 chạm.</p>

      <div class="shot-mobile-grid">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_03_quick_action_v.png')}" alt="App ViOne Quick Action V" />
          </div>
          <div class="shot-caption">Hình 13.1: Menu tác vụ nhanh khi bấm nút chữ "V" trung tâm</div>
        </div>
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_04_network_directory.png')}" alt="App ViOne Network Directory" />
          </div>
          <div class="shot-caption">Hình 13.2: Danh bạ mạng lưới kết nối đối tác doanh nhân</div>
        </div>
      </div>
    </div>

    <!-- CHƯƠNG 14 -->
    <div class="chapter" id="c14">
      <div class="chap-header">
        <div class="num">14</div>
        <h2>Danh Bạ Mạng Lưới Doanh Nhân & Kết Nối Giao Thương</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/connect-app/network</code> và <code>/connect-app/community</code></div>
        <div class="k">Tính năng</div><div class="v">Tra cứu đối tác theo nhóm ngành, gửi yêu cầu kết nối 1-1, tìm kiếm cơ hội Cung - Cầu.</div>
      </div>
      <p>Không gian giao lưu kinh doanh chất lượng cao. Mỗi hồ sơ doanh nhân hiển thị đầy đủ chức danh, công ty đại diện, sản phẩm thế mạnh và các kênh liên lạc chính thức.</p>

      <div class="shot-mobile-grid">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_07_community_opportunities.png')}" alt="Community Opportunities" />
          </div>
          <div class="shot-caption">Hình 14.1: Bảng tin cơ hội kinh doanh và nhu cầu hợp tác trong cộng đồng</div>
        </div>
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_06_chat_inbox.png')}" alt="Chat Inbox" />
          </div>
          <div class="shot-caption">Hình 14.2: Hộp thư đàm thoại giao thương trực tiếp 1-1</div>
        </div>
      </div>
    </div>

    <!-- CHƯƠNG 15 -->
    <div class="chapter" id="c15">
      <div class="chap-header">
        <div class="num">15</div>
        <h2>Bảng Tin Moments & Hộp Thư Trò Chuyện B2B Bảo Mật</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/connect-app/moment</code> và <code>/connect-app/inbox</code></div>
        <div class="k">Bảo mật</div><div class="v">Mã hóa tin nhắn End-to-End, lưu trữ lịch sử đàm phán thương mại tin cậy.</div>
      </div>
      <p>Bảng tin Moments là nơi các nhà sáng lập chia sẻ các dấu mốc thành tựu kinh doanh, lễ ký kết hợp đồng và hình ảnh giao thương thực tế, tạo dựng uy tín thương hiệu cá nhân trong mạng lưới.</p>

      <div class="shot-mobile-grid">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_05_moments_feed.png')}" alt="Moments Feed" />
          </div>
          <div class="shot-caption">Hình 15.1: Dòng thời gian Moments ghi nhận các khoảnh khắc giao lưu hợp tác</div>
        </div>
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_10_security_settings.png')}" alt="Security Settings" />
          </div>
          <div class="shot-caption">Hình 15.2: Trung tâm kiểm soát bảo mật và quản lý phiên đăng nhập</div>
        </div>
      </div>
    </div>

    <!-- CHƯƠNG 16 -->
    <div class="chapter" id="c16">
      <div class="chap-header">
        <div class="num">16</div>
        <h2>Trung Tâm Thẻ Số Titanium, Kích Hoạt NFC & Chỉnh Sửa Hồ Sơ</h2>
      </div>
      <div class="meta-box">
        <div class="k">Đường dẫn</div><div class="v"><code>/connect-app/me</code>, <code>/connect-app/me/edit</code>, <code>/connect-app/activate</code></div>
        <div class="k">Công nghệ</div><div class="v">NFC Smart Card (NTAG215) + Dynamic QR Code + Link Bio cá nhân hóa.</div>
      </div>
      <p>Doanh nhân có toàn quyền tùy biến thẻ danh thiếp thông minh Titanium của mình: Cập nhật chức danh, tiểu sử, ảnh đại diện, số điện thoại, mạng xã hội và kích hoạt thẻ vật lý NFC chỉ qua vài giây thao tác.</p>

      <div class="shot-mobile-grid">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_08_digital_card_me.png')}" alt="Me Titanium Digital Card" />
          </div>
          <div class="shot-caption">Hình 16.1: Giao diện thẻ danh thiếp Titanium đẳng cấp của người dùng</div>
        </div>
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_11_identity_edit.png')}" alt="Identity Edit Page" />
          </div>
          <div class="shot-caption">Hình 16.2: Màn hình chỉnh sửa thông tin hồ sơ số hóa cập nhật trực tiếp vào CSDL</div>
        </div>
      </div>

      <div class="shot-mobile-grid" style="grid-template-columns: 1fr; margin-top: 10px;">
        <div class="shot-mobile-card">
          <div class="phone-mockup">
            <img src="${getImgSrc('app_vione_09_nfc_activation.png')}" alt="NFC Activation" />
          </div>
          <div class="shot-caption">Hình 16.3: Quy trình kích hoạt thẻ vật lý thông minh NFC 1 chạm liên kết với danh thiếp số</div>
        </div>
      </div>

      <div class="callout green">
        <div class="icon">✅</div>
        <div class="text"><strong>Hoàn tất chu trình khép kín:</strong> Thông tin lưu từ trang Chỉnh sửa hồ sơ (<code>/connect-app/me/edit</code>) được đồng bộ tức thì vào bảng <code>business_identities</code>, <code>user_profiles</code> và <code>members</code> trong PostgreSQL, đảm bảo hiển thị đồng nhất trên cả Web CRM ViOne và thẻ số cá nhân.</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>`;
}

async function buildVioneMasterUserGuidePdf() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU HDSD VIONE MASTER (HTML & PDF) ===\n');

  const htmlContent = generateVioneMasterHtml();
  
  // 1. Lưu file HTML
  const htmlPath1 = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html');
  const htmlPath2 = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_CONNECT_TOAN_DIEN.html');
  fs.writeFileSync(htmlPath1, htmlContent, 'utf8');
  fs.writeFileSync(htmlPath2, htmlContent, 'utf8');
  console.log(`✓ Đã lưu HTML tại: ${htmlPath1}`);

  // 2. Xuất file PDF bằng Playwright Chromium
  const pdfPath1 = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.pdf');
  const pdfPath2 = path.join(VIONE_DOC_DIR, 'HDSD_HE_THONG_VIONE_CONNECT_TOAN_DIEN.pdf');
  const fePdfPath = path.join(VIONE_FE_DOCS_DIR, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.pdf');

  console.log(`Đang khởi tạo Chromium Playwright để xuất PDF...`);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const pdfBuffer = await page.pdf({
    path: pdfPath1,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '18mm',
      left: '12mm',
      right: '12mm'
    }
  });

  fs.writeFileSync(pdfPath2, pdfBuffer);
  fs.writeFileSync(fePdfPath, pdfBuffer);

  await browser.close();

  const stat = fs.statSync(pdfPath1);
  console.log(`\n🎉 XUẤT BẢN THÀNH CÔNG TÀI LIỆU HDSD VIONE MASTER PDF!`);
  console.log(`  - File: ${pdfPath1}`);
  console.log(`  - Kích thước: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  - Đã đồng bộ sang: ${fePdfPath}`);
}

buildVioneMasterUserGuidePdf().catch(console.error);
