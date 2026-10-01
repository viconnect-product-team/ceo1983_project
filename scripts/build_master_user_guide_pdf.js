const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
const IMG_DIR = path.join(DOC_DIR, 'images', 'evidence');

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

function generateMasterHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tài Liệu Hướng Dẫn Sử Dụng & Vận Hành Hệ Thống CLB Doanh Nhân CEO 1983</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: #0A1128; color: #1E293B; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11pt; line-height: 1.6; }
    
    .trn-doc { width: 100%; max-width: 960px; margin: 0 auto; background: #FFFFFF; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    
    /* Cover Page */
    .cover {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, #001233 0%, #002255 45%, #003B95 80%, #001A4D 100%);
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
      width: 450px; height: 450px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0) 70%);
      border-radius: 50%;
    }
    .cover .accent-bar { width: 70px; height: 5px; background: linear-gradient(90deg, #FFD700, #FFA500); border-radius: 3px; margin-bottom: 24px; }
    .cover .header { display: flex; justify-content: space-between; font-size: 10.5pt; color: #94A3B8; font-weight: 600; letter-spacing: 0.5px; }
    .cover .header span { color: #FFD700; font-weight: 700; }
    .cover .divider { height: 1px; background: rgba(255, 255, 255, 0.15); margin: 24px 0 36px; }
    
    .cover .badge {
      display: inline-block;
      background: rgba(255, 215, 0, 0.12);
      border: 1px solid rgba(255, 215, 0, 0.4);
      color: #FFD700;
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 9.5pt;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .cover .project-title { font-size: 27pt; font-weight: 900; line-height: 1.25; margin: 0 0 16px 0; color: #FFFFFF; }
    .cover .project-title .gold { color: #FFD700; text-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
    .cover .project-title .sub { display: block; font-size: 16pt; font-weight: 600; color: #93C5FD; margin-top: 10px; }
    .cover .subtitle { font-size: 11pt; color: #CBD5E1; line-height: 1.65; max-width: 820px; margin-bottom: 30px; }
    
    .cover .meta-info { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; padding: 22px 28px; margin-top: 15px; }
    .cover .meta-info table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    .cover .meta-info td { padding: 6px 0; color: #E2E8F0; }
    .cover .meta-info td.label { color: #94A3B8; width: 190px; font-weight: 500; }
    .cover .meta-info td strong { color: #FFFFFF; }
    .cover .footer { display: flex; justify-content: space-between; font-size: 9pt; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 18px; margin-top: 30px; }
    
    /* Document Body & Typography */
    .trn-section { padding: 42px 48px; border-bottom: 1px solid #E2E8F0; position: relative; }
    .trn-tag { display: inline-block; background: #003B95; color: #FFFFFF; font-size: 8.5pt; font-weight: 800; padding: 3px 12px; border-radius: 6px; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase; }
    .trn-h2 { font-size: 18pt; font-weight: 900; color: #001A4D; margin: 0 0 6px 0; line-height: 1.3; }
    .trn-h3 { display: block; font-size: 11pt; font-weight: 600; color: #475569; margin-bottom: 18px; }
    .trn-goal { background: #F0F7FF; border-left: 4px solid #003B95; padding: 12px 18px; border-radius: 0 10px 10px 0; margin-bottom: 18px; font-size: 10pt; color: #1E3A8A; line-height: 1.55; }
    .trn-path { background: #F8FAFC; border: 1px dashed #CBD5E1; padding: 10px 16px; border-radius: 8px; font-size: 9.5pt; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; color: #0F172A; }
    .trn-path strong { color: #003B95; }
    
    .trn-sec-title { font-size: 12.5pt; font-weight: 800; color: #002255; margin: 24px 0 10px 0; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; }
    ol.trn-steps, ul.trn-steps { padding-left: 22px; margin: 10px 0 18px 0; }
    ol.trn-steps li, ul.trn-steps li { margin-bottom: 8px; font-size: 10.5pt; color: #334155; }
    ol.trn-steps li strong, ul.trn-steps li strong { color: #0F172A; }
    
    .box-blue { background: #EFF6FF; border: 1px solid #BFDBFE; border-left: 4px solid #2563EB; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #1E3A8A; margin: 16px 0; line-height: 1.55; }
    .box-warn { background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #D97706; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #92400E; margin: 16px 0; line-height: 1.55; }
    .box-green { background: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #16A34A; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #14532D; margin: 16px 0; line-height: 1.55; }

    table.tb { width: 100%; border-collapse: collapse; margin: 14px 0 20px; font-size: 9.5pt; }
    table.tb th { background: #001A4D; color: #FFFFFF; font-weight: 700; text-align: left; padding: 9px 12px; border: 1px solid #CBD5E1; }
    table.tb td { padding: 8px 12px; border: 1px solid #CBD5E1; color: #334155; }
    table.tb tr:nth-child(even) { background: #F8FAFC; }
    
    /* Desktop Full Screenshots */
    .shot-wrap { page-break-inside: avoid; break-inside: avoid; margin: 18px 0; }
    .shot { border: 1px solid #CBD5E1; border-radius: 10px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .shot img { width: 100%; height: auto; display: block; }
    .shot figcaption { font-size: 9pt; color: #475569; padding: 8px 14px; background: #F8FAFC; border-top: 1px solid #E2E8F0; line-height: 1.45; }
    .shot figcaption strong { color: #003B95; }
    
    /* MOBILE PHONE MOCKUP (Crucial Improvement: Prevent oversized/stretched screenshots) */
    .shot-mobile-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 22px;
      justify-content: center;
      align-items: flex-start;
      margin: 20px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .shot-mobile-card {
      width: 275px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 12px;
    }
    .phone-mockup {
      width: 100%;
      background: #0B1329;
      border: 8px solid #1E293B;
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    .phone-mockup::before {
      content: "";
      display: block;
      width: 90px;
      height: 16px;
      background: #000000;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      z-index: 10;
    }
    .phone-mockup img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 26px;
      background: #FFFFFF;
    }
    .phone-caption {
      font-size: 8.8pt;
      color: #475569;
      text-align: center;
      margin-top: 10px;
      line-height: 1.4;
      padding: 0 6px;
    }
    .phone-caption strong { color: #003B95; }
    
    /* TOC */
    .toc-title { font-size: 20pt; font-weight: 900; margin: 8px 0 10px; padding-bottom: 8px; border-bottom: 3px solid #003B95; color: #001A4D; }
    .toc-subtitle { font-size: 10pt; color: #64748B; margin-bottom: 18px; }
    .toc-list { display: flex; flex-direction: column; gap: 7px; }
    .toc-item { display: flex; align-items: center; gap: 12px; padding: 9px 14px; border-radius: 8px; text-decoration: none; color: #001A4D; border: 1px solid #E2E8F0; background: #FFFFFF; }
    .toc-index { min-width: 28px; font-size: 10.5pt; font-weight: 800; color: #003B95; }
    .toc-text { font-size: 10.5pt; font-weight: 600; flex: 1; }
    .toc-page { font-size: 9pt; font-weight: 700; color: #64748B; }
    
    /* End Page */
    .doc-end { padding: 24px 48px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 9pt; color: #64748B; }

    /* Print Styles A4 */
    @page { size: A4; margin: 16mm 12mm 18mm 12mm; }
    @page :first { margin: 0; }
    @media print {
      html, body { background: #FFF !important; margin: 0; padding: 0; }
      .trn-doc { width: auto; max-width: none; margin: 0; box-shadow: none; }
      .cover { width: 210mm !important; height: 297mm !important; margin: 0 !important; page-break-after: always; break-after: page; }
      .trn-section { page-break-before: always; break-before: page; padding-bottom: 6mm; }
      #toc { page-break-after: always; break-after: page; }
      .shot-wrap, .trn-sec-title, .trn-goal, .box-blue, .box-warn, .box-green, .shot-mobile-grid { page-break-inside: avoid; break-inside: avoid; }
      a { color: inherit !important; text-decoration: none !important; }
    }
  </style>
</head>
<body>

<article class="trn-doc">

  <!-- ==================== COVER PAGE ==================== -->
  <section class="cover" id="cover">
    <div class="accent-bar"></div>
    <div class="header">
      <div>Mã tài liệu: <span>HDSD-CEO1983-V3.0</span></div>
      <div>Hội Doanh Nhân Trẻ Hà Nội (HanoiBA) · CLB Doanh Nhân CEO 1983</div>
    </div>
    <div class="divider"></div>
    
    <div class="main">
      <div class="badge">CẨM NANG HƯỚNG DẪN THAO TÁC & VẬN HÀNH THỰC TẾ TOÀN DIỆN</div>
      <h1 class="project-title">
        HỆ SINH THÁI SỐ HÓA HIỆP HỘI<br>
        <span class="gold">CLB DOANH NHÂN CEO 1983</span>
        <span class="sub">TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHI TIẾT CRM & MOBILE APP</span>
      </h1>
      <p class="subtitle">
        Tài liệu đào tạo và vận hành chuẩn mực trên toàn hệ sinh thái số hóa (bao gồm <a href="https://14.225.217.232:5444/landing?apply=%22true%22" target="_blank" style="color: #FFD700; text-decoration: underline; font-weight: 700;">Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến</a>, Cổng Quản Trị Trung Tâm Web CRM và Ứng Dụng Di Động Hội Viên PWA). Hướng dẫn chi tiết đầy đủ 16 phân hệ: Tiếp nhận nộp đơn gửi email ngay (<code>vuvp090120@gmail.com</code>), Admin duyệt cấp mã CEO-83xxx, Khách ngoài (<code>thuylt313@gmail.com</code>) đăng ký vé miễn phí / có phí VietQR 1.500.000đ, Hội viên đăng ký vé VIP giữ ghế Cinema Seating Map, Soát vé an ninh QR, Thẻ VIP NFC 3D, Chợ B2B Marketplace, Bảng tin Cung - Cầu 1-on-1, Banner Marketing, Quản lý Lịch họp, Biểu quyết trực tuyến và Sổ quỹ Thu - Chi Cashbook.
      </p>
      
      <div class="meta-info">
        <table>
          <tr>
            <td class="label">Đơn vị chủ quản:</td>
            <td><strong>CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)</strong></td>
          </tr>
          <tr>
            <td class="label">Môi trường kiểm thử:</td>
            <td><strong>Localhost (BE :4000, FE :5173) & Máy chủ Quản Trị Trung Tâm (Web CRM / Mobile App)</strong></td>
          </tr>
          <tr>
            <td class="label">Cấu hình Mailer:</td>
            <td><strong>Gmail SMTP Server (vumikasa6@gmail.com / Port 465 SSL) — Đã đối soát gửi thành công</strong></td>
          </tr>
          <tr>
            <td class="label">Đối tượng sử dụng:</td>
            <td><strong>Ban Điều Hành, Ban Thư Ký, 7 Ban Chuyên Môn, Hội Viên VIP & Khách Mời Doanh Nhân</strong></td>
          </tr>
          <tr>
            <td class="label">Phiên bản tài liệu:</td>
            <td><strong>V3.0 (Cập nhật toàn diện ảnh Mockup Mobile tinh gọn & Bổ sung đầy đủ tính năng CRM)</strong></td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <div>© 2026 CLB Doanh Nhân CEO 1983 · HanoiBA. All rights reserved.</div>
      <div>Bản quyền công nghệ thuộc về CLB Doanh Nhân CEO 1983 & ViConnect Platform</div>
    </div>
  </section>

  <!-- ==================== TABLE OF CONTENTS ==================== -->
  <section class="trn-section" id="toc">
    <h2 class="toc-title">MỤC LỤC TÀI LIỆU HƯỚNG DẪN VẬN HÀNH</h2>
    <p class="toc-subtitle">Tra cứu quy trình chuẩn hóa theo 16 phân hệ nghiệp vụ xuyên suốt giữa CRM và Mobile App.</p>
    
    <div class="toc-list">
      <a class="toc-item" href="#sec-01"><span class="toc-index">01</span><span class="toc-text">Tổng Quan Hệ Sinh Thái Đa Nền Tảng (Web CRM & Mobile App) & Ma Trận Vai Trò RBAC</span><span class="toc-page">Chương 01</span></a>
      <a class="toc-item" href="#sec-02"><span class="toc-index">02</span><span class="toc-text">Quy Trình Gia Nhập: Nộp Đơn Bắn Mail Ngay (vuvp090120@gmail.com) & Phê Duyệt Cấp Mã M1983-089</span><span class="toc-page">Chương 02</span></a>
      <a class="toc-item" href="#sec-03"><span class="toc-index">03</span><span class="toc-text">Đăng Nhập Lần Đầu, Quy Trình Onboarding & Cập Nhật Hồ Sơ Doanh Nhân VIP Trên App</span><span class="toc-page">Chương 03</span></a>
      <a class="toc-item" href="#sec-04"><span class="toc-index">04</span><span class="toc-text">Sự Kiện Luồng 1: Khách Ngoài (thuylt313@gmail.com) Đăng Ký Vé Miễn Phí (Mã E-Ticket & QR Mail)</span><span class="toc-page">Chương 04</span></a>
      <a class="toc-item" href="#sec-05"><span class="toc-index">05</span><span class="toc-text">Sự Kiện Luồng 2: Khách Ngoài (thuylt313@gmail.com) Đăng Ký Vé Có Phí (VietQR Napas 1.500.000đ)</span><span class="toc-page">Chương 05</span></a>
      <a class="toc-item" href="#sec-06"><span class="toc-index">06</span><span class="toc-text">Sự Kiện Luồng 3: Hội Viên Chính Thức (Đã Đăng Nhập) Đăng Ký Vé VIP & Giữ Chỗ Tự Động</span><span class="toc-page">Chương 06</span></a>
      <a class="toc-item" href="#sec-07"><span class="toc-index">07</span><span class="toc-text">Sơ Đồ Chỗ Ngồi Cinema Seating Map & Phân Khu Xếp Bàn Tiệc Gala VIP Trên Cổng CRM</span><span class="toc-page">Chương 07</span></a>
      <a class="toc-item" href="#sec-08"><span class="toc-index">08</span><span class="toc-text">Soát Vé An Ninh Check-in Cổng Thông Minh (Xanh Hợp Lệ 0.5s / Đỏ Cảnh Báo Trùng Vé)</span><span class="toc-page">Chương 08</span></a>
      <a class="toc-item" href="#sec-09"><span class="toc-index">09</span><span class="toc-text">Thẻ Hội Viên VIP 3D Hoàng Gia, Danh Thiếp Số Độc Bản & Kết Nối Chạm Chạm NFC 1-Giây</span><span class="toc-page">Chương 09</span></a>
      <a class="toc-item" href="#sec-10"><span class="toc-index">10</span><span class="toc-text">Sàn Giao Thương B2B Shopee-Style: Hội Viên Đăng Bán & CRM Phê Duyệt Xuất Bản Sản Phẩm</span><span class="toc-page">Chương 10</span></a>
      <a class="toc-item" href="#sec-11"><span class="toc-index">11</span><span class="toc-text">Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu & Đặt Lịch Hẹn Giao Thương 1-on-1 Meeting</span><span class="toc-page">Chương 11</span></a>
      <a class="toc-item" href="#sec-12"><span class="toc-index">12</span><span class="toc-text">Phân Hệ Marketing, Quản Trị Banner Carousel Tự Động & Gói Tài Trợ Kim Cương/Vàng/Bạc</span><span class="toc-page">Chương 12</span></a>
      <a class="toc-item" href="#sec-13"><span class="toc-index">13</span><span class="toc-text">Điều Hành Lịch Họp Giao Ban Tập Trung, Chống Trùng Phòng Họp & Điểm Danh QR Code</span><span class="toc-page">Chương 13</span></a>
      <a class="toc-item" href="#sec-14"><span class="toc-index">14</span><span class="toc-text">Biểu Quyết Trực Tuyến & Bầu Cử Đại Hội Ban Chấp Hành (Nguyên Tắc 1 Người 1 Phiếu Bảo Mật)</span><span class="toc-page">Chương 14</span></a>
      <a class="toc-item" href="#sec-15"><span class="toc-index">15</span><span class="toc-text">Quản Trị Sổ Quỹ Thu - Chi (Cashbook 3 Cấp) & Tự Động Khớp Hội Phí Thường Niên Qua VietQR 24/7</span><span class="toc-page">Chương 15</span></a>
      <a class="toc-item" href="#sec-16"><span class="toc-index">16</span><span class="toc-text">Ma Trận Phân Quyền RBAC 10 Nhóm Vai Trò, Cài Đặt Hệ Thống & Nhật Ký Kiểm Toán (Audit)</span><span class="toc-page">Chương 16</span></a>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 01 ==================== -->
  <section class="trn-section" id="sec-01">
    <span class="trn-tag">CHƯƠNG 01</span>
    <h2 class="trn-h2">Tổng Quan Hệ Sinh Thái Đa Nền Tảng & Ma Trận Phân Quyền RBAC</h2>
    <span class="trn-h3">Kiến trúc kết nối thời gian thực giữa Cổng Quản Trị Web CRM và Ứng Dụng Di Động Hội Viên PWA</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Nắm vững cấu trúc kết nối đa nền tảng giữa Web CRM dành cho Ban Quản Trị và Mobile App dành cho Hội viên, cùng ma trận phân định quyền hạn 10 nhóm vai trò (RBAC) để vận hành chính xác, tránh chồng chéo thẩm quyền.
    </div>

    <div class="trn-path">
      <strong>ĐỊA CHỈ TRUY CẬP HỆ THỐNG:</strong> Cổng Quản Trị Trung Tâm (Web CRM) · Ứng Dụng Di Động CEO 1983 (Mobile App PWA) · <a href="https://14.225.217.232:5444/landing?apply=%22true%22" target="_blank" style="color: #003B95; font-weight: bold; text-decoration: underline;">Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến</a>.
    </div>
    
    <div class="trn-sec-title">1. Hai Cấu Phần Nền Tảng Trong Hệ Sinh Thái CEO 1983</div>
    <ul class="trn-steps">
      <li><strong>Cổng Quản Trị Trung Tâm (Web CRM):</strong> Dành riêng cho Ban Điều Hành, Ban Thư Ký và Ban Quản Trị. Cung cấp bộ công cụ thẩm định hồ sơ kết nạp, cấu hình vé sự kiện, thiết kế sơ đồ ghế Cinema Seating Map, quản lý sổ quỹ thu - chi 3 cấp, mở đợt biểu quyết đại hội và giám sát an ninh.</li>
      <li><strong>Ứng Dụng Di Động Hội Viên (CEO 1983 Mobile App):</strong> Văn phòng số bỏ túi cho từng chủ doanh nghiệp: Thẻ hội viên VIP 3D, danh thiếp số chạm NFC, chợ B2B Shopee-style, bảng tin cơ hội cung - cầu, đặt lịch hẹn 1-on-1, nhận vé sự kiện điện tử và biểu quyết trực tuyến.</li>
    </ul>
    
    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_04_crm_login_screen.png')}" alt="Màn hình đăng nhập Cổng Quản trị Trung tâm Web CRM">
        <figcaption><strong>Hình 1.1:</strong> Màn hình Đăng nhập Cổng Quản trị Trung tâm Web CRM với chứng thực JWT và cơ chế chống Brute Force.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_05_crm_dashboard_overview.png')}" alt="Dashboard Tổng quan Web CRM">
        <figcaption><strong>Hình 1.2:</strong> Dashboard Trung tâm Chỉ huy Web CRM tổng hợp các chỉ số KPI: Tổng số hội viên, Hội viên hoạt động, Doanh số giao thương B2B và Sổ quỹ hội phí thường niên theo thời gian thực.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_35_crm_rbac_roles_permissions.png')}" alt="Ma trận phân quyền RBAC trên Web CRM">
        <figcaption><strong>Hình 1.3:</strong> Ma trận Phân quyền & Vai trò (RBAC) trên Cổng Quản trị CRM phân định chi tiết quyền hạn theo từng vai trò cụ thể.</figcaption>
      </figure>
    </div>

    <div class="trn-sec-title">2. Ma Trận Phân Quyền Vai Trò Nghiệp Vụ (RBAC Matrix)</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 15%;">Mã Quyền</th>
          <th style="width: 25%;">Chức Danh / Bộ Phận</th>
          <th style="width: 42%;">Phạm Vi Quyền Hạn Nghiệp Vụ</th>
          <th style="width: 18%;">Môi Trường</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>QUAN_TRI</strong></td>
          <td>Ban Quản Trị Tối Cao (Super Admin)</td>
          <td>Toàn quyền hệ thống: Cấu hình RBAC, phê duyệt cuộc họp, duyệt chi ngân sách cấp 3, mở biểu quyết đại hội.</td>
          <td>Web CRM (Full)</td>
        </tr>
        <tr>
          <td><strong>THANH_VIEN_BAN</strong></td>
          <td>Ban Thành Viên (BTV)</td>
          <td><strong>Thẩm định hồ sơ kết nạp, kiểm duyệt hội viên, cấp mã M1983 và kích hoạt tài khoản</strong> (Đơn vị duy nhất có thẩm quyền duyệt).</td>
          <td>CRM & Mobile App</td>
        </tr>
        <tr>
          <td><strong>THU_KY</strong></td>
          <td>Ban Thư Ký CLB (BTK)</td>
          <td>Điều phối lịch họp giao ban, chống trùng phòng họp, điểm danh QR, soạn thảo biên bản họp (Không có quyền duyệt kết nạp).</td>
          <td>CRM & Mobile App</td>
        </tr>
        <tr>
          <td><strong>XUC_TIEN</strong></td>
          <td>Ban Xúc Tiến Thương Mại (BXT)</td>
          <td>Kiểm duyệt sản phẩm Sàn B2B, thẩm định bài đăng Cung - Cầu, kết nối doanh nhân và tổ chức gian hàng hội chợ.</td>
          <td>CRM & Mobile App</td>
        </tr>
        <tr>
          <td><strong>THIEN_NGUYEN</strong></td>
          <td>Ban Thiện Nguyện (BTN)</td>
          <td>Quản trị Quỹ Thiện Nguyện, theo dõi sổ quỹ thu - chi từ thiện, tiếp nhận quyên góp và báo cáo giải ngân minh bạch.</td>
          <td>CRM & Mobile App</td>
        </tr>
        <tr>
          <td><strong>TRUYEN_THONG</strong></td>
          <td>Ban Truyền Thông & Sự Kiện (BTT)</td>
          <td>Cấu hình Banner Carousel, quản lý gói tài trợ Kim Cương/Vàng, soát vé an ninh QR cổng sự kiện và phát hành tin tức số.</td>
          <td>CRM & Mobile App</td>
        </tr>
        <tr>
          <td><strong>HOI_VIEN</strong></td>
          <td>Hội Viên Doanh Nhân Chính Thức</td>
          <td>Sở hữu Thẻ VIP 3D, danh thiếp số công khai, đăng bán B2B, đăng cơ hội Cung - Cầu, đặt hẹn 1-1, bỏ phiếu bầu cử.</td>
          <td>Mobile App</td>
        </tr>
      </tbody>
    </table>

    <div class="trn-sec-title">2. Danh Sách 6 Tài Khoản Đại Diện 6 Ban Chuyên Môn Vận Hành Hệ Thống</div>
    <p style="font-size: 10pt; color: #475569; margin-bottom: 12px;">Hệ thống phân định rạch ròi 6 Ban Chuyên Môn chính thức, mỗi ban được cấp tài khoản điều hành riêng biệt để vận hành nghiệp vụ trên Cổng CRM (<code>http://localhost:5173</code> / <code>http://localhost:5137</code>):</p>
    <table class="trn-table">
      <thead>
        <tr>
          <th style="width: 130px;">Ban Chuyên Môn</th>
          <th style="width: 200px;">Email Đăng Nhập</th>
          <th style="width: 80px;">Mật Khẩu</th>
          <th style="width: 70px;">Mã Ban</th>
          <th>Phạm Vi Thẩm Quyền & Nhiệm Vụ Trọng Tâm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Ban Quản Trị</strong></td>
          <td><code>admin@connect.vn</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BQT</span></td>
          <td>Toàn quyền hệ thống: Cấu hình RBAC, phê duyệt chi ngân sách cấp 3, mở biểu quyết đại hội, kiểm soát an ninh tối cao.</td>
        </tr>
        <tr>
          <td><strong>Ban Thư Ký</strong></td>
          <td><code>ceo.tongthuky@ceo1983.com</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BTK</span></td>
          <td>Điều phối lịch họp giao ban, chống trùng phòng họp, điểm danh QR, văn bản hành chính (<strong>TUYỆT ĐỐI KHÔNG duyệt hội viên</strong>).</td>
        </tr>
        <tr>
          <td><strong>Ban Thành Viên</strong></td>
          <td><code>ceo.thanhvien@ceo1983.com</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BTV</span></td>
          <td><strong>THẨM ĐỊNH & PHÊ DUYỆT HỘI VIÊN KẾT NẠP</strong>, cấp mã M1983, tự động kích hoạt tài khoản và gửi email mật khẩu cho tân hội viên.</td>
        </tr>
        <tr>
          <td><strong>Ban Thiện Nguyện</strong></td>
          <td><code>ceo.thiennguyen@ceo1983.com</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BTN</span></td>
          <td>Quản trị Quỹ Thiện Nguyện & An sinh xã hội, giải ngân chương trình nhân đạo, theo dõi sổ quỹ thu - chi minh bạch.</td>
        </tr>
        <tr>
          <td><strong>Ban Truyền Thông</strong></td>
          <td><code>ceo.truyenthong@ceo1983.com</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BTT</span></td>
          <td>Cấu hình Banner Carousel tiếp thị, kiểm soát Cổng soát vé sự kiện QR, phát hành tin tức, điều phối nhà tài trợ Kim Cương/Vàng.</td>
        </tr>
        <tr>
          <td><strong>Ban Xúc Tiến</strong></td>
          <td><code>ceo.xuctien@ceo1983.com</code></td>
          <td><code>123456</code></td>
          <td><span class="role-badge role-admin">BXT</span></td>
          <td>Kiểm duyệt Sàn Chợ B2B Shopee-style, thẩm định bài đăng Cơ hội Cung - Cầu, kết nối doanh nhân và xúc tiến thương mại 1-on-1.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- ==================== CHƯƠNG 02 ==================== -->
  <section class="trn-section" id="sec-02">
    <span class="trn-tag">CHƯƠNG 02</span>
    <h2 class="trn-h2">Quy Trình Gia Nhập: Nộp Đơn Bắn Mail Ngay & Ban Thành Viên Kiểm Duyệt Cấp Tài Khoản</h2>
    <span class="trn-h3">Toàn trình từ nộp đơn trên Landing Page, tự động gửi email tiếp nhận, đến Ban Thành Viên thẩm định phê duyệt cấp mã M1983</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Đảm bảo ứng viên khi nộp đơn gia nhập trên Landing Page ngay lập tức nhận được Email xác nhận tiếp nhận hồ sơ tại <code>vuvp090120@gmail.com</code>; đồng thời trên CRM, <strong>Ban Thành Viên</strong> (tài khoản <code>ceo.thanhvien@ceo1983.com</code> hoặc Ban Quản Trị) kiểm tra đối soát hồ sơ doanh nghiệp, nhấp duyệt kết nạp và hệ thống tự động bắn Email cấp tài khoản & mật khẩu ngẫu nhiên cho tân hội viên. Ban Thư Ký và các ban khác không có quyền duyệt kết nạp.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> <a href="https://14.225.217.232:5444/landing?apply=%22true%22" target="_blank" style="color: #003B95; font-weight: bold; text-decoration: underline;">Cổng Đăng Ký Gia Nhập Trực Tuyến</a> ➔ Web CRM: <code>/members</code> (Đăng nhập: <code>ceo.thanhvien@ceo1983.com</code> / <code>123456</code> ➔ Tab Chờ Thẩm Định ➔ Phê Duyệt Kết Nạp) ➔ Email nhận: <code>vuvp090120@gmail.com</code>.
    </div>
    
    <div class="trn-sec-title">Thao Tác 1: Ứng Viên Điền Form Đăng Ký Trên Cổng Thông Tin Trực Tuyến</div>
    <ol class="trn-steps">
      <li>Ứng viên truy cập <a href="https://14.225.217.232:5444/landing?apply=%22true%22" target="_blank" style="color: #003B95; font-weight: bold; text-decoration: underline;">Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến</a>.</li>
      <li>Cuộn xuống mục <strong>"Đăng Ký Gia Nhập Hiệp Hội"</strong> và hoàn tất các trường thông tin bắt buộc:
        <ul style="margin-top: 4px; padding-left: 20px;">
          <li><strong>Họ và tên:</strong> Vũ Văn Phúc</li>
          <li><strong>Số điện thoại:</strong> 0983 1983 83</li>
          <li><strong>Email nhận thông báo:</strong> <code>vuvp090120@gmail.com</code></li>
          <li><strong>Tên Doanh nghiệp:</strong> Công ty Cổ phần Công nghệ ViConnect Global</li>
          <li><strong>Chức vụ:</strong> Tổng Giám Đốc</li>
          <li><strong>Mã số thuế:</strong> 0108991983</li>
          <li><strong>Ban nguyện vọng tham gia:</strong> Ban Thành Viên & Kết Nối Giao Thương</li>
        </ul>
      </li>
      <li>Nhấp nút <strong>"Gửi Hồ Sơ Đăng Ký Gia Nhập"</strong>.</li>
    </ol>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_01_landing_ceo1983_hero.png')}" alt="Landing Page CLB Doanh Nhân CEO 1983">
        <figcaption><strong>Hình 2.1:</strong> <a href="https://14.225.217.232:5444/landing?apply=%22true%22" target="_blank" style="color: #003B95; font-weight: bold; text-decoration: underline;">Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến</a>.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_02_member_registration_form_filled.png')}" alt="Form điền thông tin đăng ký gia nhập">
        <figcaption><strong>Hình 2.2:</strong> Form đăng ký trực tuyến đã điền đầy đủ thông tin ứng viên Vũ Văn Phúc (Email: <code>vuvp090120@gmail.com</code>, Doanh nghiệp: ViConnect Global).</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_03_member_registration_submitted_success.png')}" alt="Thông báo gửi hồ sơ đăng ký thành công">
        <figcaption><strong>Hình 2.3:</strong> Màn hình phản hồi hồ sơ đăng ký gia nhập đã được tiếp nhận thành công, đang chờ thẩm định từ Ban Thư Ký.</figcaption>
      </figure>
    </div>

    <div class="box-green">
      <strong>KẾT QUẢ ĐẨY MAIL TIẾP NHẬN TỰ ĐỘNG:</strong>
      Ngay khi ứng viên bấm nộp hồ sơ, hàm <code>publicRegister</code> gọi dịch vụ <code>mailService.sendRegistrationReceivedEmail</code> qua SMTP Google (Port 465 SSL). Email xác nhận tiếp nhận hồ sơ với tiêu đề <code>[CLB CEO 1983] Xác Nhận Tiếp Nhận Hồ Sơ Đăng Ký Gia Nhập — Anh/Chị Vũ Văn Phúc</code> được gửi ngay vào hộp thư <code>vuvp090120@gmail.com</code> trong vòng 3 giây!
    </div>

    <div class="trn-sec-title">Thao Tác 2: Ban Thẩm Định Phê Duyệt Hồ Sơ Trên Cổng CRM</div>
    <ol class="trn-steps">
      <li>Cán bộ Ban Quản Trị đăng nhập Cổng Web CRM, vào phân hệ <strong>"Quản Lý Hội Viên"</strong> (<code>/members</code>).</li>
      <li>Chọn bộ lọc trạng thái <strong>"Chờ Thẩm Định"</strong> để thấy hồ sơ của ứng viên Vũ Văn Phúc.</li>
      <li>Nhấp vào bản ghi để mở ngăn kéo chi tiết (Drawer Detail), thẩm định hồ sơ pháp lý công ty.</li>
      <li>Nhấp nút <strong>"Phê Duyệt Kết Nạp"</strong>. Hệ thống kích hoạt cấp mã hội viên chính thức <code>M1983-089</code>, sinh mật khẩu khởi tạo ngẫu nhiên, tạo tài khoản trong <code>vione_users</code> và kích hoạt email cấp thông tin tài khoản.</li>
    </ol>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_06_crm_members_pending_list.png')}" alt="Danh sách hội viên chờ duyệt trên CRM">
        <figcaption><strong>Hình 2.4:</strong> Danh sách hội viên trên Cổng Web CRM (Địa chỉ: <code>/</code>) hiển thị hồ sơ ứng viên Vũ Văn Phúc ở trạng thái chờ thẩm định.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_07_crm_member_detail_drawer.png')}" alt="Ngăn kéo chi tiết hồ sơ hội viên">
        <figcaption><strong>Hình 2.5:</strong> Cửa sổ Drawer hiển thị chi tiết hồ sơ thẩm định doanh nghiệp của ứng viên Vũ Văn Phúc.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_08_crm_member_approved_credentials_toast.png')}" alt="Thông báo phê duyệt kết nạp thành công">
        <figcaption><strong>Hình 2.6:</strong> Thao tác phê duyệt hồ sơ thành công, hệ thống cấp mã hội viên <code>M1983-089</code> và thông báo toast thành công.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_09_email_template_credentials_sent_vu.png')}" alt="Email template chúc mừng kết nạp gửi về vuvp090120@gmail.com">
        <figcaption><strong>Hình 2.7:</strong> Giao diện Email Template chào mừng hội viên mới gửi về hòm thư <code>vuvp090120@gmail.com</code> kèm mã hội viên <code>M1983-089</code> và mật khẩu khởi tạo an toàn.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 03 ==================== -->
  <section class="trn-section" id="sec-03">
    <span class="trn-tag">CHƯƠNG 03</span>
    <h2 class="trn-h2">Đăng Nhập Lần Đầu, Onboarding & Cập Nhật Hồ Sơ Doanh Nhân VIP</h2>
    <span class="trn-h3">Kích hoạt tài khoản trên ứng dụng di động, đổi mật khẩu khởi tạo và thiết lập danh thiếp số</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn hội viên mới sử dụng tài khoản được cấp trong email để đăng nhập App CEO 1983, trải qua luồng Onboarding bắt buộc đổi mật khẩu an toàn và hoàn thiện hồ sơ danh thiếp số.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Mobile App: <code>/</code> ➔ Luồng Đổi Mật Khẩu Onboarding ➔ Trang Cá Nhân <code>/association/profile</code>.
    </div>
    
    <div class="trn-sec-title">Thao Tác Kích Hoạt Tài Khoản Trên Ứng Dụng Di Động</div>
    <ol class="trn-steps">
      <li>Mở trình duyệt trên điện thoại hoặc App di động tại <code>/</code>.</li>
      <li>Nhập Email <code>vuvp090120@gmail.com</code> và mật khẩu khởi tạo được cấp trong email.</li>
      <li>Hệ thống nhận diện tài khoản đăng nhập lần đầu và tự động chuyển hướng sang màn hình <strong>Onboarding Đổi Mật Khẩu</strong>.</li>
      <li>Nhập mật khẩu mới (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt).</li>
      <li>Cập nhật ảnh đại diện chân dung doanh nhân, ảnh logo doanh nghiệp và hoàn tất thiết lập hồ sơ VIP.</li>
    </ol>

    <!-- Mobile Mockup Grid (Gọn gàng, sang trọng, đúng tỷ lệ smartphone) -->
    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_11_app_login_screen.png')}" alt="Màn hình đăng nhập App CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 3.1:</strong> Màn hình Đăng nhập App di động (Địa chỉ: <code>/association/login</code>).</div>
      </div>
      
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_12_app_onboarding_reset_password.png')}" alt="Màn hình Onboarding đổi mật khẩu">
        </div>
        <div class="phone-caption"><strong>Hình 3.2:</strong> Luồng Onboarding bắt buộc đổi mật khẩu khởi tạo an toàn ở lần đầu đăng nhập.</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_13_app_onboarding_fill_profile.png')}" alt="Cập nhật hồ sơ cá nhân">
        </div>
        <div class="phone-caption"><strong>Hình 3.3:</strong> Thiết lập ảnh đại diện và hồ sơ doanh nhân số VIP.</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_10_app_home_feed.png')}" alt="Trang chủ App CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 3.4:</strong> Giao diện Trang chủ App sau khi kích hoạt thành công.</div>
      </div>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 04 ==================== -->
  <section class="trn-section" id="sec-04">
    <span class="trn-tag">CHƯƠNG 04</span>
    <h2 class="trn-h2">Sự Kiện Luồng 1: Khách Ngoài Đăng Ký Vé Miễn Phí (thuylt313@gmail.com)</h2>
    <span class="trn-h3">Quy trình đăng ký vé tham dự sự kiện mở, sinh mã số quay thưởng Lucky Number và gửi mã QR Check-in qua Email</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn khách mời ngoài hiệp hội (chị Lê Thị Thùy, email: <code>thuylt313@gmail.com</code>) đăng ký tham dự sự kiện mở miễn phí, hệ thống cấp vé E-Ticket có mã số quay thưởng may mắn và tự động gửi mã QR Check-in về email.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Cổng đăng ký sự kiện công khai: <code>/</code> ➔ Nhận vé E-Ticket & Email: <code>thuylt313@gmail.com</code>.
    </div>
    
    <div class="trn-sec-title">Quy Trình Khách Ngoài Đăng Ký Vé Miễn Phí</div>
    <ol class="trn-steps">
      <li>Khách mời nhấp vào link sự kiện được chia sẻ hoặc quét mã QR thư mời để mở cổng đăng ký trực tuyến.</li>
      <li>Điền đầy đủ thông tin đại biểu tham dự:
        <ul style="margin-top: 4px; padding-left: 20px;">
          <li><strong>Họ và tên đại biểu:</strong> Lê Thị Thùy</li>
          <li><strong>Số điện thoại:</strong> 0913 313 198</li>
          <li><strong>Hòm thư nhận vé:</strong> <code>thuylt313@gmail.com</code></li>
          <li><strong>Doanh nghiệp:</strong> Công ty TNHH Thời Trang & Xuất Nhập Khẩu Thùy Linh</li>
          <li><strong>Chức vụ:</strong> Giám Đốc Kinh Doanh</li>
          <li><strong>Ghi chú:</strong> Mong muốn kết nối đối tác chuỗi bán lẻ</li>
        </ul>
      </li>
      <li>Nhấp <strong>"Xác Nhận Đăng Ký Vé Tham Dự (Miễn Phí)"</strong>.</li>
      <li>Màn hình hiển thị Thẻ Vé Điện Tử (E-Ticket) với mã định danh vé <code>REG-EV01-THUYLT</code>, số quay thưởng may mắn <strong>Lucky #198</strong> và Mã QR Check-in chuẩn quốc tế.</li>
      <li>Đồng thời, hệ thống tự động gửi Email vé sự kiện có mã QR check-in về hòm thư <code>thuylt313@gmail.com</code>.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_15_mobile_event_landing_form.png')}" alt="Form đăng ký sự kiện miễn phí trên mobile">
        </div>
        <div class="phone-caption"><strong>Hình 4.1:</strong> Form đăng ký sự kiện miễn phí trên di động của khách mời Lê Thị Thùy.</div>
      </div>
      
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_16_mobile_event_ticket_success.png')}" alt="Vé điện tử có mã QR check-in">
        </div>
        <div class="phone-caption"><strong>Hình 4.2:</strong> Thẻ vé điện tử E-Ticket hiển thị mã QR Check-in và số may mắn Lucky Draw #198.</div>
      </div>
    </div>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_17_email_template_event_ticket_free_thuy.png')}" alt="Email vé tham dự sự kiện miễn phí gửi về thuylt313@gmail.com">
        <figcaption><strong>Hình 4.3:</strong> Giao diện Email Template vé điện tử gửi về hòm thư <code>thuylt313@gmail.com</code> có đính kèm mã QR Check-in sẵn sàng quét tại bàn đón tiếp.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 05 ==================== -->
  <section class="trn-section" id="sec-05">
    <span class="trn-tag">CHƯƠNG 05</span>
    <h2 class="trn-h2">Sự Kiện Luồng 2: Khách Ngoài Đăng Ký Vé Có Phí (thuylt313@gmail.com)</h2>
    <span class="trn-h3">Quy trình đăng ký vé hội thảo cao cấp, sinh hóa đơn VietQR Napas 24/7 (1.500.000đ) và tự động đối soát gửi vé VIP</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn khách ngoài đăng ký sự kiện chuyên đề có thu phí (1.500.000 VNĐ), hệ thống sinh mã thanh toán VietQR động kèm cú pháp chuyển khoản chính xác, đẩy email hướng dẫn thanh toán và tự động kích hoạt vé VIP sau khi nhận được tiền.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Cổng đăng ký sự kiện có phí: <code>/</code> ➔ Thanh toán VietQR Napas 24/7 ➔ Email nhận: <code>thuylt313@gmail.com</code>.
    </div>
    
    <div class="trn-sec-title">Quy Trình Khách Ngoài Đăng Ký Vé Có Phí & Thanh Toán VietQR</div>
    <ol class="trn-steps">
      <li>Khách mời truy cập trang đăng ký sự kiện có phí (Ví dụ: Gala Doanh Nhân & Kết Nối Giao Thương Mùa Thu 2026).</li>
      <li>Chọn loại vé <strong>Vé VIP Đại Biểu</strong> (Đơn giá: 1.500.000 VNĐ), nhập thông tin đại biểu Lê Thị Thùy (<code>thuylt313@gmail.com</code>).</li>
      <li>Nhấp nút <strong>"Tiếp Tục Thanh Toán VietQR"</strong>.</li>
      <li>Hệ thống sinh mã hóa đơn <code>EV-GALA-8892</code> và tạo Mã VietQR chuẩn Napas 24/7 với thông tin:
        <ul style="margin-top: 4px; padding-left: 20px;">
          <li><strong>Ngân hàng thụ hưởng:</strong> MB Bank (Ngân hàng Quân Đội)</li>
          <li><strong>Số tài khoản:</strong> <code>1983000000</code></li>
          <li><strong>Chủ tài khoản:</strong> CLB DOANH NHÂN CEO 1983</li>
          <li><strong>Số tiền chính xác:</strong> <code>1.500.000 đ</code></li>
          <li><strong>Cú pháp bắt buộc:</strong> <code>EV8892 0913313198</code></li>
        </ul>
      </li>
      <li>Khách mời mở ứng dụng ngân hàng bất kỳ quét mã QR thanh toán trong 5 giây. Hệ thống bắt webhook Napas, tự động gạch nợ hóa đơn và gửi email vé VIP chính thức có mã QR vào cửa.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_19_mobile_event_paid_form.png')}" alt="Form đăng ký sự kiện có phí trên mobile">
        </div>
        <div class="phone-caption"><strong>Hình 5.1:</strong> Form chọn gói vé VIP và thông tin thanh toán 1.500.000đ trên di động.</div>
      </div>
      
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_20_mobile_event_vietqr_invoice.png')}" alt="Mã VietQR thanh toán phí tham dự">
        </div>
        <div class="phone-caption"><strong>Hình 5.2:</strong> Hóa đơn VietQR động chuẩn Napas 24/7 với mã chuyển khoản tự động khớp lệnh.</div>
      </div>
    </div>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_21_email_template_event_paid_vietqr_thuy.png')}" alt="Email hướng dẫn thanh toán VietQR gửi về thuylt313@gmail.com">
        <figcaption><strong>Hình 5.3:</strong> Email hướng dẫn thanh toán VietQR gửi về <code>thuylt313@gmail.com</code> có mã QR thanh toán ngân hàng và thông tin tài khoản thụ hưởng.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_22_email_template_event_paid_success_ticket_thuy.png')}" alt="Email vé VIP chính thức sau khi thanh toán thành công">
        <figcaption><strong>Hình 5.4:</strong> Email vé VIP chính thức được kích hoạt tự động gửi về <code>thuylt313@gmail.com</code> ngay sau khi đối soát thành công 1.500.000 VNĐ.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 06 ==================== -->
  <section class="trn-section" id="sec-06">
    <span class="trn-tag">CHƯƠNG 06</span>
    <h2 class="trn-h2">Sự Kiện Luồng 3: Hội Viên Chính Thức Đăng Ký Vé VIP & Giữ Chỗ Tự Động</h2>
    <span class="trn-h3">Quy trình hội viên đã đăng nhập nhận đặc quyền miễn phí vé hội viên, chọn vị trí ngồi và lưu vé vào Ví App</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn hội viên chính thức của CLB (đã đăng nhập vào App CEO 1983) đăng ký tham gia sự kiện nội bộ: Hệ thống tự động nhận diện tư cách hội viên, áp dụng chính sách miễn phí 100% hoặc giá ưu đãi nội bộ, chọn ghế VIP trên sơ đồ và lưu vé vào Ví vé điện tử trong App.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Mobile App: <code>/association/events</code> ➔ Chọn Sự Kiện ➔ Nhấp "Đăng Ký Vé Hội Viên VIP" ➔ Chọn Ghế Trên Sơ Đồ ➔ Ví Vé Điện Tử <code>/association/events/my-tickets</code>.
    </div>
    
    <div class="trn-sec-title">Các Bước Hội Viên Đăng Ký Vé Sự Kiện Trên Mobile App</div>
    <ol class="trn-steps">
      <li>Hội viên mở App CEO 1983, vào mục <strong>"Sự Kiện"</strong> (<code>/association/events</code>).</li>
      <li>Chọn sự kiện mong muốn (Ví dụ: Diễn Đàn Doanh Nhân CEO 1983 & Gala Kết Nối Giao Thương).</li>
      <li>Hệ thống tự động hiển thị nhãn <strong>"Đặc Quyền Hội Viên: Miễn Phí 100%"</strong> (tiết kiệm 1.500.000đ so với khách ngoài).</li>
      <li>Hội viên chọn số lượng vé (1 vé chính thức + vé mời đối tác nếu có), bấm nút <strong>"Chọn Ghế Ngồi VIP"</strong>.</li>
      <li>Giao diện Cinema Seating Map mở ra, hội viên chọn vị trí tại Bàn Chủ Tịch / Dãy Ghế VIP Hàng A.</li>
      <li>Nhấp <strong>"Xác Nhận Đặt Vé & Ghế"</strong>. Vé được phát hành tức thì, lưu trực tiếp vào Ví vé trên ứng dụng và gửi email xác nhận kèm mã QR check-in về email hội viên (<code>vuvp090120@gmail.com</code>).</li>
    </ol>

    <div class="box-blue">
      <strong>ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC:</strong>
      Vé của hội viên được gán trực tiếp với Mã định danh hội viên <code>M1983-089</code>. Khi quét check-in tại cổng, hệ thống sẽ phát âm báo VIP đặc biệt và tự động kích hoạt lời chào mừng hiển thị trên màn hình LED sảnh chính đón tiếp!
    </div>
  </section>

  <!-- ==================== CHƯƠNG 07 ==================== -->
  <section class="trn-section" id="sec-07">
    <span class="trn-tag">CHƯƠNG 07</span>
    <h2 class="trn-h2">Sơ Đồ Chỗ Ngồi Cinema Seating Map & Phân Khu Xếp Bàn Tiệc Gala Trên Cổng CRM</h2>
    <span class="trn-h3">Bộ công cụ thiết kế trực quan: Kéo thả dãy ghế rạp chiếu phim, định vị bàn tròn VIP và chỉ định đại biểu danh dự</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Ban Thư Ký thiết kế sơ đồ hội trường trực quan bằng công cụ Cinema Seating Map trên CRM: phân chia Dãy A-VIP, B-Tiêu Chuẩn, khu vực Bàn Tiệc Tròn 10 người, chỉ định ghế ngồi cho diễn giả và đại biểu danh dự.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> ➔ Chọn Sự Kiện ➔ Tab "Sơ Đồ Ghế Ngồi (Cinema Map)" ➔ Cấu hình layout rạp / bàn tròn.
    </div>
    
    <div class="trn-sec-title">Quy Trình Thiết Lập Sơ Đồ Ghế Ngồi Hội Trường</div>
    <ol class="trn-steps">
      <li>Trên Cổng Web CRM, vào mục <strong>"Quản Lý Sự Kiện"</strong> (<code>/events</code>) và chọn sự kiện cần xếp chỗ.</li>
      <li>Nhấp tab <strong>"Cinema Seating Map"</strong>.</li>
      <li>Chọn mẫu sơ đồ:
        <ul style="margin-top: 4px; padding-left: 20px;">
          <li><strong>Layout Rạp Chiếu Phim / Hội Nghị:</strong> Dãy A (Hàng 1 - VIP Lãnh đạo), Dãy B-C (Hội viên chính thức), Dãy D-F (Đại biểu khách mời).</li>
          <li><strong>Layout Tiệc Gala Bàn Tròn:</strong> Bàn Danh Dự VIP 01, Bàn 02-10 (Bàn tròn 10 người theo Ban Chuyên Môn).</li>
        </ul>
      </li>
      <li>Gán màu sắc trạng thái: <strong>Màu Vàng (VIP đã chọn)</strong>, <strong>Màu Xanh (Ghế còn trống)</strong>, <strong>Màu Xám (Ghế khóa kỹ thuật)</strong>.</li>
      <li>Nhấp vào ghế bất kỳ để gán đích danh đại biểu (Ví dụ: Gán Ghế A-08 cho đại biểu Vũ Văn Phúc). Bấm <strong>"Lưu & Xuất Bản Sơ Đồ Ghế"</strong>.</li>
    </ol>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_31_crm_event_cinema_seating_map.png')}" alt="Sơ đồ chỗ ngồi Cinema Seating Map trên Web CRM">
        <figcaption><strong>Hình 7.1:</strong> Giao diện Thiết kế Sơ đồ Chỗ ngồi Cinema Seating Map trên Web CRM (Địa chỉ: <code>/</code>) cho phép xếp chỗ ngồi trực quan theo từng phân khu VIP.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 08 ==================== -->
  <section class="trn-section" id="sec-08">
    <span class="trn-tag">CHƯƠNG 08</span>
    <h2 class="trn-h2">Soát Vé An Ninh Check-in Cổng Thông Minh (Xanh Hợp Lệ / Đỏ Cảnh Báo)</h2>
    <span class="trn-h3">Vận hành máy quét an ninh tại sảnh đón tiếp: Tốc độ nhận diện 0.5s, cơ chế chống gian lận dùng trùng vé</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Đào tạo Ban Lễ Tân và An ninh sử dụng giao diện Quét mã QR Check-in trên CRM/App để soát vé vào cổng sự kiện: Nhận diện chính xác vé hợp lệ (màn hình Xanh), phát hiện và chặn đứng vé đã dùng hoặc vé giả mạo (màn hình Đỏ).
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> hoặc Mobile App Lễ Tân: <code>/association/checkin</code>.
    </div>
    
    <div class="trn-sec-title">Thao Tác Soát Vé Tại Bàn Tiếp Đón Sự Kiện</div>
    <ol class="trn-steps">
      <li>Nhân viên lễ tân mở Cổng Soát Vé An Ninh tại địa chỉ <code>/</code> hoặc mở tính năng Quét QR trên App.</li>
      <li>Đại biểu xuất trình mã QR trên vé điện tử (trên màn hình điện thoại hoặc thư in).</li>
      <li>Đưa mã QR vào khung ngắm camera:
        <ul style="margin-top: 4px; padding-left: 20px;">
          <li><strong>Trường hợp Hợp Lệ (Màn hình Xanh Lá + Âm Bíp Vui Tươi):</strong> Hệ thống hiển thị: <em>"✓ CHECK-IN THÀNH CÔNG: Đại biểu Lê Thị Thùy - Giám Đốc Kinh Doanh, Doanh nghiệp: Thời Trang Thùy Linh, Vị trí ghế: Bàn VIP 03 - Ghế 05, Số may mắn: Lucky #198"</em>. Tự động lệnh máy in nhãn in thẻ đeo đại biểu.</li>
          <li><strong>Trường hợp Cảnh Báo Trùng Vé (Màn hình Đỏ Rực + Còi Báo Động):</strong> Hệ thống cảnh báo: <em>"⚠ CẢNH BÁO: VÉ ĐÃ ĐƯỢC CHECK-IN TRƯỚC ĐÓ VÀO LÚC 08:15:22 TẠI CỔNG 1!"</em>. Ngăn chặn tuyệt đối tình trạng một vé chụp ảnh gửi cho nhiều người vào cửa.</li>
        </ul>
      </li>
    </ol>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_18_crm_event_checkin_valid_green.png')}" alt="Màn hình Check-in thành công Xanh lá trên Web CRM">
        <figcaption><strong>Hình 8.1:</strong> Màn hình Soát vé An ninh Xanh lá hợp lệ trên Cổng Web CRM (Địa chỉ: <code>/</code>) hiển thị đầy đủ thông tin đại biểu và số may mắn quay thưởng.</figcaption>
      </figure>
      <figure class="shot">
        <img src="${getImgSrc('live_23_crm_event_checkin_duplicate_red.png')}" alt="Màn hình Check-in cảnh báo vé trùng Đỏ trên Web CRM">
        <figcaption><strong>Hình 8.2:</strong> Màn hình Cảnh báo Đỏ phát hiện vé đã được check-in trước đó, ngăn chặn gian lận vé vào cửa sự kiện.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 09 ==================== -->
  <section class="trn-section" id="sec-09">
    <span class="trn-tag">CHƯƠNG 09</span>
    <h2 class="trn-h2">Thẻ Hội Viên VIP 3D Hoàng Gia, Danh Thiếp Số Độc Bản & Kết Nối Chạm NFC</h2>
    <span class="trn-h3">Danh thiếp điện tử thông minh: Chạm thẻ NFC 1-giây truyền dữ liệu doanh nghiệp và mã QR nhận diện đẳng cấp</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn hội viên kích hoạt và khai thác Thẻ Doanh Nhân Số VIP 3D Hoàng Gia: Lật mặt trước/mặt sau thẻ 3D, chia sẻ danh thiếp công khai chuẩn Web (SEO-ready) và chạm thẻ NFC vật lý vào smartphone của đối tác để trao đổi danh thiếp không chạm trong 1 giây.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Mobile App: <code>/association/card</code> (Thẻ VIP 3D) ➔ Link chia sẻ công khai: <code>/</code>.
    </div>
    
    <div class="trn-sec-title">Tính Năng Danh Thiếp Số Độc Bản & Thẻ VIP 3D</div>
    <ul class="trn-steps">
      <li><strong>Mặt Trước Thẻ VIP 3D:</strong> Thiết kế nền xanh bóng đêm kết hợp hoa văn mạ vàng dập nổi, hiển thị Họ tên Doanh nhân, Chức danh, Tên Doanh nghiệp, Mã số hội viên <code>M1983-089</code> và Logo HanoiBA.</li>
      <li><strong>Mặt Sau Thẻ VIP 3D:</strong> Hiển thị Mã QR định danh cá nhân độc bản, tích hợp chip NFC ảo giúp đối tác chỉ cần quét camera là tự động lưu toàn bộ danh bạ (VCF Contact) vào điện thoại mà không cần gõ phím.</li>
      <li><strong>Trang Danh Thiếp Số Công Khai:</strong> Được tối ưu hiển thị mượt mà trên mọi trình duyệt web máy tính và điện thoại, tích hợp đầy đủ nút gọi điện thoại, nhắn tin Zalo, mở vị trí bản đồ công ty và liên kết gian hàng B2B.</li>
    </ul>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_24_app_vip_card_front.png')}" alt="Mặt trước Thẻ Hội Viên VIP 3D trên Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 9.1:</strong> Mặt trước Thẻ Doanh Nhân VIP 3D Hoàng Gia của Hội viên Vũ Văn Phúc (Mã: M1983-089).</div>
      </div>
      
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_25_app_vip_card_back.png')}" alt="Mặt sau Thẻ Hội Viên VIP 3D trên Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 9.2:</strong> Mặt sau Thẻ VIP tích hợp Mã QR Chạm kết nối NFC 1-giây lưu danh bạ tức thì.</div>
      </div>
    </div>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_26_public_digital_card_web.png')}" alt="Trang Danh thiếp số công khai trên Web">
        <figcaption><strong>Hình 9.3:</strong> Giao diện Danh thiếp số công khai hiển thị trên trình duyệt (Địa chỉ: <code>/</code>) với đầy đủ thông tin kết nối đa kênh.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 10 ==================== -->
  <section class="trn-section" id="sec-10">
    <span class="trn-tag">CHƯƠNG 10</span>
    <h2 class="trn-h2">Sàn Giao Thương B2B Shopee-Style: Hội Viên Đăng Bán & CRM Kiểm Duyệt</h2>
    <span class="trn-h3">Mô hình chợ thương mại nội bộ: Đăng tải sản phẩm ưu đãi thành viên, thẩm định pháp lý và xuất bản lên Sàn</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn hội viên đưa sản phẩm, dịch vụ của doanh nghiệp mình lên Sàn Giao Thương B2B nội bộ; và hướng dẫn Ban Xúc Tiến Thương Mại trên CRM kiểm duyệt chất lượng, gán nhãn chứng nhận "Đã Thẩm Định CEO 1983" và xuất bản lên chợ.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Mobile App: <code>/association/products</code> (Đăng bán sản phẩm) ➔ Web CRM: <code>/</code> (Kiểm duyệt & Xuất bản).
    </div>
    
    <div class="trn-sec-title">Thao Tác 1: Hội Viên Đăng Tải Sản Phẩm Lên Gian Hàng Nội Bộ</div>
    <ol class="trn-steps">
      <li>Hội viên vào mục <strong>"Gian Hàng B2B"</strong> trên App (<code>/association/products</code>), chọn <strong>"Đăng Sản Phẩm Mới"</strong>.</li>
      <li>Tải lên hình ảnh sản phẩm độ phân giải cao, nhập tên sản phẩm, danh mục ngành nghề (Vật liệu xây dựng, Công nghệ, Thời trang, F&B, Tư vấn pháp lý...).</li>
      <li>Nhập giá niêm yết thị trường và <strong>Mức giá ưu đãi độc quyền dành riêng cho Hội viên CLB CEO 1983</strong> (Ví dụ: Chiết khấu 15% - 25%).</li>
      <li>Nhập cam kết chất lượng, bảo hành và chính sách hoa hồng giới thiệu khách hàng (Referral Commission). Bấm <strong>"Gửi Duyệt Sản Phẩm"</strong>.</li>
    </ol>

    <div class="trn-sec-title">Thao Tác 2: Ban Xúc Tiến Thương Mại Thẩm Định & Xuất Bản Trên CRM</div>
    <ol class="trn-steps">
      <li>Cán bộ Ban Xúc Tiến đăng nhập CRM, vào mục <strong>"Sàn Giao Thương"</strong> (<code>/marketplace</code>).</li>
      <li>Mở danh sách sản phẩm chờ duyệt, kiểm tra hồ sơ công bố chất lượng và chứng nhận kinh doanh.</li>
      <li>Nhấp nút <strong>"Phê Duyệt & Gán Nhãn Đã Xác Thực CLB CEO 1983"</strong>. Sản phẩm lập tức hiển thị nổi bật trên đầu Trang chủ App di động.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_28_app_b2b_marketplace_feed.png')}" alt="Sàn giao thương B2B Shopee-Style trên Mobile App">
        </div>
        <div class="phone-caption"><strong>Hình 10.1:</strong> Giao diện Sàn Giao Thương B2B Shopee-Style trên App di động hiển thị sản phẩm hội viên.</div>
      </div>
      
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_29_app_b2b_product_detail.png')}" alt="Chi tiết sản phẩm B2B có ưu đãi hội viên">
        </div>
        <div class="phone-caption"><strong>Hình 10.2:</strong> Chi tiết sản phẩm B2B hiển thị giá ưu đãi hội viên và nút "Liên hệ báo giá B2B".</div>
      </div>
    </div>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_27_crm_b2b_marketplace_management.png')}" alt="Quản trị Sàn Giao Thương B2B trên Web CRM">
        <figcaption><strong>Hình 10.3:</strong> Phân hệ Quản trị Sàn Giao Thương B2B trên Cổng Web CRM (Địa chỉ: <code>/</code>) cho phép thẩm định và xuất bản sản phẩm.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 11 ==================== -->
  <section class="trn-section" id="sec-011">
    <span class="trn-tag">CHƯƠNG 11</span>
    <h2 class="trn-h2">Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu & Đặt Lịch Hẹn Giao Thương 1-on-1</h2>
    <span class="trn-h3">Mạng lưới kết nối giao thương: Chia sẻ nhu cầu mua/bán, ghim tin tiêu biểu và đặt lịch hẹn 1-on-1 meeting</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn hội viên đăng tin Cần Mua (Cầu) hoặc Cần Bán (Cung), lưu bài viết quan tâm (Bookmark) và sử dụng công cụ Đặt lịch hẹn 1-on-1 Business Meeting trực tiếp qua Bottom Sheet để chốt hợp đồng.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Mobile App: <code>/association/opportunities</code> (Bảng tin Cung - Cầu) ➔ Nút "Đặt Lịch Hẹn 1-on-1" ➔ Web CRM: <code>/opportunities</code> (Quản lý kết nối).
    </div>
    
    <div class="trn-sec-title">Quy Trình Đăng Tin Cung - Cầu & Hẹn Gặp 1-1</div>
    <ol class="trn-steps">
      <li>Hội viên vào mục <strong>"Cơ Hội Giao Thương"</strong> (<code>/association/opportunities</code>) trên App.</li>
      <li>Chọn loại tin: <strong>[CẦN MUA]</strong> (Ví dụ: <em>Cần tìm tổng thầu xây dựng nhà xưởng 5.000m2 tại KCN Quế Võ, ngân sách 35 tỷ</em>) hoặc <strong>[CUNG CẤP]</strong> (Ví dụ: <em>Cung ứng giải pháp bao bì carton xuất khẩu chuẩn ISO</em>).</li>
      <li>Đăng tải thông tin chi tiết kèm hình ảnh catalogue.</li>
      <li>Hội viên khác khi đọc tin, nhấp nút <strong>"Hẹn Gặp 1-1 (1-on-1 Meeting)"</strong>.</li>
      <li>Một cửa sổ Bottom Sheet mở lên cho phép chọn: Ngày gặp, Khung giờ (09:00 - 10:30), Địa điểm (Văn phòng CLB CEO 1983 hoặc Họp trực tuyến Google Meet), và Lời nhắn hợp tác.</li>
      <li>Hệ thống gửi thông báo đẩy in-app và email đến đối tác, tự động đưa lịch hẹn vào Lịch công tác của hai bên.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_30_app_opportunities_feed.png')}" alt="Bảng tin cơ hội kinh doanh Cung - Cầu trên Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 11.1:</strong> Bảng tin Kết nối Cơ hội Cung - Cầu trên App di động hiển thị các nhu cầu giao thương thực tế.</div>
      </div>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 12 ==================== -->
  <section class="trn-section" id="sec-12">
    <span class="trn-tag">CHƯƠNG 12</span>
    <h2 class="trn-h2">Phân Hệ Marketing, Quản Trị Banner Carousel & Gói Tài Trợ Đa Cấp</h2>
    <span class="trn-h3">Khai thác truyền thông thương hiệu: Cấu hình banner tự động chuyển động 4s, quản lý quyền lợi nhà tài trợ</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Ban Truyền Thông & Quản Trị CRM cấu hình Banner Slider trên đầu Trang Chủ và Sàn B2B, quản lý các Gói tài trợ sự kiện (Kim Cương, Vàng, Bạc) và đo lường lượt nhấp chuột vào thương hiệu nhà tài trợ.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> (Quản lý Nhà tài trợ & Banner) ➔ Hiển thị trên App: <code>/association</code>.
    </div>
    
    <div class="trn-sec-title">Các Bước Cấu Hình Banner & Nhà Tài Trợ Trên CRM</div>
    <ol class="trn-steps">
      <li>Trên Web CRM, vào phân hệ <strong>"Marketing & Nhà Tài Trợ"</strong> (<code>/sponsors</code>).</li>
      <li>Tạo gói tài trợ mới: Chọn cấp bậc (Kim Cương - 500 triệu, Vàng - 200 triệu, Bạc - 100 triệu, Đồng Hành - 30 triệu).</li>
      <li>Tải lên Logo doanh nghiệp tài trợ, liên kết website chính thức và tài liệu giới thiệu sản phẩm.</li>
      <li>Trong mục <strong>"Banner Ads Manager"</strong>: Tải lên ảnh banner tỷ lệ 16:9 hoặc 21:9 chuẩn HD.</li>
      <li>Thiết lập thời gian hiển thị: Chọn thời lượng chuyển slide tự động (mặc định 4.0 giây), chọn trang đích xuất hiện (Trang chủ App, Đầu trang Sàn B2B, Trang chi tiết sự kiện).</li>
      <li>Bấm <strong>"Kích Hoạt Banner"</strong>: Hệ thống đồng bộ thời gian thực qua WebSocket, banner hiển thị ngay lập tức trên điện thoại của toàn bộ hội viên.</li>
    </ol>

    <div class="box-green">
      <strong>ĐO LƯỜNG HIỆU QUẢ MARKETING TRỰC QUAN:</strong>
      Cổng CRM tự động thống kê lượt hiển thị (Impressions), tỷ lệ nhấp chuột (CTR %) và lượt dẫn về website doanh nghiệp nhà tài trợ, giúp Ban Thư Ký xuất báo cáo quyền lợi minh bạch gửi đối tác tài trợ sau sự kiện.
    </div>
  </section>

  <!-- ==================== CHƯƠNG 13 ==================== -->
  <section class="trn-section" id="sec-13">
    <span class="trn-tag">CHƯƠNG 13</span>
    <h2 class="trn-h2">Điều Hành Lịch Họp Giao Ban Tập Trung, Chống Trùng Lịch & Điểm Danh QR</h2>
    <span class="trn-h3">Văn phòng họp số: Quản lý lịch họp Ban Thường Trực, 7 Ban Chuyên Môn và điểm danh thông minh qua mã QR</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Ban Thư Ký và các Trưởng Ban lên lịch họp định kỳ, áp dụng thuật toán kiểm tra và ngăn chặn trùng phòng họp (Room Conflict Detector), phát mã QR điểm danh đầu buổi họp và lưu biên bản họp số.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> ➔ Khởi tạo cuộc họp ➔ Quét QR điểm danh.
    </div>
    
    <div class="trn-sec-title">Quy Trình Khởi Tạo & Điều Hành Cuộc Họp</div>
    <ol class="trn-steps">
      <li>Trưởng Ban hoặc Thư Ký vào mục <strong>"Quản Lý Cuộc Họp"</strong> (<code>/meetings</code>) trên CRM.</li>
      <li>Nhấp <strong>"Thêm Lịch Họp Mới"</strong>: Nhập tiêu đề (Ví dụ: <em>Họp Giao Ban Thường Trực Tháng 10/2026</em>), chọn phòng họp (Phòng Họp VIP HanoiBA hoặc Trực tuyến Zoom/Meet), chọn thời gian bắt đầu và kết thúc.</li>
      <li>Hệ thống chạy thuật toán <strong>Conflict Detection</strong>: Nếu phòng họp đã có ban khác đăng ký trong khung giờ đó, hệ thống sẽ cảnh báo đỏ và yêu cầu đổi giờ hoặc đổi phòng.</li>
      <li>Chọn danh sách thành viên triệu tập họp. Hệ thống tự động bắn thông báo nhắc hẹn trước 24h và trước 2h.</li>
      <li>Khi cuộc họp diễn ra: Chiếu mã QR Điểm danh lên màn hình máy chiếu. Đại biểu dùng App CEO 1983 quét mã trong 1 giây để ghi nhận có mặt.</li>
      <li>Kết thúc cuộc họp: Tải lên file PDF Biên bản họp có chữ ký số để toàn thể thành viên ban tra cứu.</li>
    </ol>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_32_crm_meetings_schedule_management.png')}" alt="Quản trị Lịch họp giao ban trên Web CRM">
        <figcaption><strong>Hình 13.1:</strong> Phân hệ Quản trị Lịch họp & Điều phối Ban Chuyên Môn trên Web CRM (Địa chỉ: <code>/</code>) có cảnh báo chống trùng lịch.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 14 ==================== -->
  <section class="trn-section" id="sec-14">
    <span class="trn-tag">CHƯƠNG 14</span>
    <h2 class="trn-h2">Biểu Quyết Trực Tuyến & Bầu Cử Đại Hội (Nguyên Tắc 1 Người 1 Phiếu)</h2>
    <span class="trn-h3">Phòng bỏ phiếu số hóa: Kiểm soát tỷ lệ đại biểu tối thiểu, mã hóa phiếu bầu bảo mật và đếm phiếu thời gian thực</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Ban Quản Trị thiết lập đợt biểu quyết / bầu cử Ban Chấp Hành trên CRM; và hướng dẫn hội viên truy cập hòm phiếu trên App di động để thực hiện quyền dân chủ với cơ chế bảo mật tuyệt đối 1 người 1 phiếu.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> (Tạo đợt biểu quyết) ➔ Mobile App: <code>/association/voting</code> (Bỏ phiếu số).
    </div>
    
    <div class="trn-sec-title">Thao Tác Thiết Lập Bầu Cử & Bỏ Phiếu Số</div>
    <ol class="trn-steps">
      <li>Ban Quản Trị vào mục <strong>"Biểu Quyết & Bầu Cử"</strong> (<code>/voting</code>) trên CRM, nhấp <strong>"Tạo Đợt Biểu Quyết Mới"</strong>.</li>
      <li>Nhập tiêu đề (Ví dụ: <em>Bầu Cử Bổ Sung Ban Chấp Hành Nhiệm Kỳ 2026 - 2029</em>), danh sách ứng cử viên, tỷ lệ biểu quyết tối thiểu (Ví dụ: 50% hoặc 66%).</li>
      <li>Thiết lập thời gian mở hòm phiếu và thời gian khóa hòm phiếu. Nhấp <strong>"Phát Lệnh Mở Hòm Phiếu"</strong>.</li>
      <li>Hội viên mở App CEO 1983 vào mục <strong>"Bỏ Phiếu"</strong> (<code>/association/voting</code>): Xem danh sách ứng viên, lựa chọn phương án và nhấp <strong>"Xác Nhận Bỏ Phiếu"</strong>.</li>
      <li>Sau khi xác nhận, hệ thống khóa vĩnh viễn quyền bỏ phiếu của tài khoản đó cho đợt này (One-Member One-Vote Lock), chống hoàn toàn việc bỏ phiếu hai lần.</li>
      <li>Kết quả kiểm phiếu được trực quan hóa bằng biểu đồ cột thời gian thực trên màn hình hội trường lớn và tự động xuất biên bản kiểm phiếu PDF chuẩn pháp lý đại hội.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="${getImgSrc('live_34_app_voting_ballot_active.png')}" alt="Giao diện hòm phiếu biểu quyết trên Mobile App">
        </div>
        <div class="phone-caption"><strong>Hình 14.1:</strong> Màn hình Bỏ phiếu biểu quyết trực tuyến trên App CEO 1983 đảm bảo nguyên tắc 1 người 1 phiếu.</div>
      </div>
    </div>

    <div class="shot-wrap">
      <figure class="shot">
        <img src="${getImgSrc('live_33_crm_voting_elections_dashboard.png')}" alt="Dashboard Quản trị Bầu cử & Đếm phiếu trên Web CRM">
        <figcaption><strong>Hình 14.2:</strong> Dashboard Quản trị Biểu quyết trên Web CRM (Địa chỉ: <code>/</code>) cập nhật kết quả đếm phiếu thời gian thực.</figcaption>
      </figure>
    </div>
  </section>

  <!-- ==================== CHƯƠNG 15 ==================== -->
  <section class="trn-section" id="sec-15">
    <span class="trn-tag">CHƯƠNG 15</span>
    <h2 class="trn-h2">Quản Trị Sổ Quỹ Thu - Chi (Cashbook 3 Cấp) & Tự Động Khớp Hội Phí Thường Niên VietQR</h2>
    <span class="trn-h3">Kế toán hiệp hội minh bạch: Tự động đối soát hội phí thường niên và quy trình ký duyệt phiếu chi ngân sách 3 cấp</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Ban Tài Chính & Kế Toán vận hành Sổ Quỹ Thu Chi (Cashbook): Phát hành hội phí thường niên hội phí có mã VietQR động tự động gạch nợ trong 3 giây; và quy trình duyệt phiếu chi ngân sách 3 cấp bảo mật cao.
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> (Hội phí thường niên) ➔ <code>/expenses</code> (Phiếu chi) ➔ <code>/income</code> (Phiếu thu).
    </div>
    
    <div class="trn-sec-title">1. Quản Lý Hội Phí Thường Niên Hội Viên Tự Động Qua VietQR</div>
    <ul class="trn-steps">
      <li>Vào mục <strong>"Quản Lý Hội Phí"</strong> (<code>/fees</code>) trên CRM: Tạo đợt thu hội phí thường niên năm 2026 (Mức phí: 10.000.000 VNĐ / hội viên).</li>
      <li>Hệ thống tự động phát hành hóa đơn điện tử cho toàn bộ hội viên, gắn kèm mã VietQR Napas 24/7 với cú pháp <code>HP[MãHộiViên]</code> (Ví dụ: <code>HPM1983-089</code>).</li>
      <li>Hội viên mở App vào mục <strong>"Gia Hạn Hội Phí"</strong> (<code>/association/renew</code>), quét mã chuyển khoản. Hệ thống tự động gạch nợ sang trạng thái <strong>"Đã Thanh Toán"</strong> sau 3 giây, tự động gia hạn quyền lợi hội viên thêm 365 ngày.</li>
    </ul>

    <div class="trn-sec-title">2. Quy Trình Phê Duyệt Phiếu Chi Ngân Sách 3 Cấp (Cashbook)</div>
    <ol class="trn-steps">
      <li><strong>Cấp 1 - Lập Đề Xuất Chi:</strong> Cán bộ phụ trách lập phiếu chi trên CRM (Ví dụ: <em>Chi thuê hội trường khách sạn Melia tổ chức Đại hội</em>), nhập số tiền và đính kèm hóa đơn VAT, hợp đồng kinh tế.</li>
      <li><strong>Cấp 2 - Thẩm Định Kế Toán:</strong> Kế toán trưởng kiểm tra dự toán ngân sách trong năm, đối chiếu tính hợp lệ của chứng từ và ký xác nhận.</li>
      <li><strong>Cấp 3 - Chủ Tịch / Trưởng Ban Tài Chính Ký Duyệt:</strong> Chủ tịch nhận thông báo, mở CRM duyệt chi. Quỹ hội ghi nhận giảm trừ số dư tức thì và tự động cập nhật vào Báo Cáo Tài Chính Tháng.</li>
    </ol>

    <div class="box-blue">
      <strong>TÍNH NĂNG XUẤT BÁO CÁO KIỂM TOÁN:</strong>
      Phân hệ Sổ quỹ hỗ trợ xuất toàn bộ bảng kê Thu - Chi sang định dạng Excel và PDF có đóng dấu thời gian để phục vụ công tác kiểm toán của Ban Kiểm Soát định kỳ hàng quý.
    </div>
  </section>

  <!-- ==================== CHƯƠNG 16 ==================== -->
  <section class="trn-section" id="sec-16">
    <span class="trn-tag">CHƯƠNG 16</span>
    <h2 class="trn-h2">Ma Trận Phân Quyền RBAC 10 Nhóm Vai Trò, Cài Đặt Hệ Thống & Nhật Ký Kiểm Toán</h2>
    <span class="trn-h3">Bảo mật và toàn vẹn dữ liệu: Cấu hình phân quyền đến từng API endpoint, thiết lập SMTP Mailer và tra cứu Audit Trail</span>
    
    <div class="trn-goal">
      <strong>MỤC TIÊU NGHIỆP VỤ:</strong> Hướng dẫn Quản Trị Viên Tối Cao phân quyền chi tiết cho 10 nhóm vai trò theo ma trận RBAC, cấu hình các dịch vụ tích hợp nền tảng (SMTP Mailer, MinIO S3 Storage, VietQR Napas) và tra cứu nhật ký hoạt động (Audit Trail).
    </div>

    <div class="trn-path">
      <strong>ĐƯỜNG DẪN THAO TÁC:</strong> Web CRM: <code>/</code> ➔ <code>/settings</code> (Cài đặt hệ thống) ➔ <code>/activity</code> (Nhật ký kiểm toán).
    </div>
    
    <div class="trn-sec-title">1. Cấu Hình Ma Trận Phân Quyền RBAC Chi Tiết</div>
    <p>Hệ thống cho phép gán quyền hạn chính xác đến từng nút bấm và từng API endpoint của Backend NestJS:</p>
    <ul class="trn-steps">
      <li><code>MEM_APPROVE</code> (<code>POST /api/members/:id/approve-and-send-credentials</code>): Phê duyệt kết nạp và cấp mật khẩu.</li>
      <li><code>EREG_APPROVE</code> (<code>PATCH /api/event-registrations/:id/approve</code>): Xác nhận duyệt vé đại biểu tham dự.</li>
      <li><code>MKT_APPROVE</code> (<code>PATCH /api/marketplace/:id/approve</code>): Phê duyệt sản phẩm lên Sàn B2B.</li>
      <li><code>EXP_APPROVE</code> (<code>PATCH /api/expenses/:id/approve</code>): Phê duyệt phiếu chi ngân sách.</li>
      <li><code>SPN_APPROVE</code> (<code>PATCH /api/sponsors/:id/approve</code>): Phê duyệt banner và logo nhà tài trợ.</li>
    </ul>

    <div class="trn-sec-title">2. Cấu Hình Dịch Vụ Nền Tảng (Settings)</div>
    <ul class="trn-steps">
      <li><strong>SMTP Mailer:</strong> Cấu hình máy chủ <code>smtp.gmail.com</code>, cổng <code>465 SSL</code>, tài khoản <code>vumikasa6@gmail.com</code> đảm bảo tỷ lệ gửi thư vào Inbox đạt 100%.</li>
      <li><strong>MinIO Cloud Storage:</strong> Lưu trữ phân tán tài liệu nội bộ, ảnh đại diện, ảnh sản phẩm B2B và video sự kiện.</li>
      <li><strong>VietQR Napas Gateway:</strong> Kết nối API đối soát Napas 24/7 với tài khoản MB Bank <code>1983000000</code>.</li>
    </ul>

    <div class="trn-sec-title">3. Nhật Ký Hoạt Động & Kiểm Toán An Ninh (Audit Trail)</div>
    <p>Mọi hành động nhạy cảm trong hệ thống (duyệt hồ sơ, thay đổi quyền hạn, sửa hóa đơn, xóa dữ liệu) đều được ghi nhận vào bảng <code>activity_log</code> với các trường:</p>
    <ul class="trn-steps">
      <li><strong>Thời điểm thao tác:</strong> Dấu thời gian chính xác đến từng mili-giây.</li>
      <li><strong>Tài khoản thực hiện:</strong> User ID, Tên người dùng và vai trò tại thời điểm thực thi.</li>
      <li><strong>Địa chỉ IP & Trình duyệt:</strong> Ghi nhận IP thực tế và User-Agent để phát hiện truy cập bất thường.</li>
      <li><strong>Dữ liệu trước và sau thay đổi:</strong> Lưu trữ dạng JSON diff để có thể khôi phục khi cần thiết.</li>
    </ul>

    <div class="box-warn">
      <strong>QUY TẮC AN TOÀN BẢO MẬT:</strong>
      Bảng nhật ký kiểm toán Audit Trail được cấu hình ở chế độ chỉ ghi (Append-Only), không ai (kể cả Super Admin) có quyền xóa hoặc chỉnh sửa lịch sử kiểm toán để đảm bảo tính pháp lý tuyệt đối cho Hiệp hội!
    </div>
  </section>

  <!-- ==================== FOOTER END ==================== -->
  <footer class="doc-end">
    <div><strong>HỆ SINH THÁI SỐ HÓA HIỆP HỘI CLB DOANH NHÂN CEO 1983</strong> — HANOIBA</div>
    <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Website: ceo1983.com · Email: btk@ceo1983.com</div>
  </footer>

</article>

</body>
</html>`;
}

async function renderPdf(htmlContent, outputPath) {
  console.log(`Đang khởi tạo Chromium Playwright để xuất PDF: ${outputPath}...`);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load', timeout: 120000 });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div style="width: 100%; font-size: 8pt; color: #64748B; font-family: 'Segoe UI', sans-serif; padding: 0 12mm; display: flex; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 4px;">
        <span>Bản quyền tài liệu © 2026 CLB Doanh Nhân CEO 1983 (HanoiBA)</span>
        <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '16mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  const sizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Xuất bản thành công: ${outputPath} (${sizeMb} MB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU TẠO TÀI LIỆU HDSD CEO1983 NÂNG CẤP V3.0 (HTML & PDF) ===');
  const htmlContent = generateMasterHtml();

  // 1. Lưu file HTML
  const outHtmlPath = path.join(DOC_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.html');
  fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
  console.log(`✓ Đã lưu HTML: ${outHtmlPath}`);

  // 2. Lưu file HTML sang public/docs của frontend
  if (!fs.existsSync(FE_DOCS_DIR)) {
    fs.mkdirSync(FE_DOCS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.html'), htmlContent, 'utf8');

  // 3. Xuất file PDF
  const outPdfPath = path.join(DOC_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.pdf');
  await renderPdf(htmlContent, outPdfPath);

  // 4. Copy PDF sang FE public docs
  fs.copyFileSync(outPdfPath, path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.pdf'));
  console.log(`✓ Đã đồng bộ sang: ${path.join(FE_DOCS_DIR, 'HDSD_HE_THONG_CEO1983_TOAN_DIEN.pdf')}`);

  console.log('=== HOÀN TẤT XUẤT BẢN HDSD HTML & PDF THÀNH CÔNG 100%! ===');
}

main().catch(err => {
  console.error('[LỖI]', err);
  process.exit(1);
});
