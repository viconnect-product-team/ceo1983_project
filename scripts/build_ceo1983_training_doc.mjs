import fs from 'fs';
import path from 'path';

console.log('>>> BẮT ĐẦU TẠO TÀI LIỆU HDSD CHUẨN HÓA CEO 1983 PLAYBOOK 18 (CẬP NHẬT ĐẦY ĐỦ CÁC USE CASE & LOẠI BỎ NFC/3D)...');

const outputFile = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CLB DOANH NHÂN CEO 1983 · HƯỚNG DẪN SỬ DỤNG VÀ ĐÀO TẠO VẬN HÀNH TOÀN DIỆN · HDSD-CEO1983 v6.0</title>
  <meta name="description" content="Tài liệu Hướng dẫn sử dụng và Đào tạo Vận hành Toàn diện Hệ sinh thái Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA): Chi tiết phân hệ Di động (Mobile App/PWA) và Cổng Quản trị Hiệp hội (CRM Web Portal).">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html { scroll-behavior: smooth; }
    body { background: #0A1128; font-family: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1E293B; line-height: 1.6; }
    
    .trn-doc { width: 100%; max-width: 980px; margin: 0 auto; background: #FFFFFF; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
    
    /* COVER PAGE - Chuẩn A4 210mm x 297mm full bleed */
    .cover {
      width: 100%;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      background: linear-gradient(135deg, #001233 0%, #002255 40%, #003B95 75%, #001A4D 100%);
      color: #FFFFFF;
      padding: 44px 52px;
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
      top: -120px; right: -120px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 70%);
      border-radius: 50%;
    }
    .cover .accent-bar { width: 80px; height: 6px; background: linear-gradient(90deg, #F59E0B, #FBBF24); border-radius: 3px; margin-bottom: 16px; }
    .cover .header { display: flex; justify-content: space-between; font-size: 9.5pt; color: #94A3B8; font-weight: 600; letter-spacing: 0.5px; }
    .cover .header span { color: #F59E0B; font-weight: 700; }
    .cover .divider { height: 1px; background: rgba(255, 255, 255, 0.15); margin: 16px 0 20px; }
    
    .cover .main { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 2; }
    .cover .badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #FBBF24;
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 18px;
      width: fit-content;
    }
    .cover .project-title { font-size: 25pt; font-weight: 900; line-height: 1.25; margin: 0 0 14px 0; color: #FFFFFF; }
    .cover .project-title .gold { color: #F59E0B; text-shadow: 0 0 25px rgba(245, 158, 11, 0.4); }
    .cover .project-title .sub { display: block; font-size: 14pt; font-weight: 600; color: #93C5FD; margin-top: 10px; }
    .cover .subtitle { font-size: 10.5pt; color: #CBD5E1; line-height: 1.65; max-width: 840px; margin-bottom: 22px; }
    
    .cover .meta-info { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 18px 24px; margin-top: 10px; backdrop-filter: blur(10px); }
    .cover .meta-info table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    .cover .meta-info td { padding: 6px 0; color: #E2E8F0; }
    .cover .meta-info td.label { color: #94A3B8; width: 190px; font-weight: 500; }
    .cover .meta-info td strong { color: #FFFFFF; }
    .cover .footer { display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 14px; margin-top: 16px; }
    
    /* FLOW SECTIONS */
    .trn-section { padding: 36px 52px; border-bottom: 1px solid #E2E8F0; position: relative; }
    .trn-tag { display: inline-block; background: #003B95; color: #FFFFFF; font-size: 8.5pt; font-weight: 800; padding: 4px 14px; border-radius: 6px; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase; }
    .trn-h2 { font-size: 16.5pt; font-weight: 900; color: #001A4D; margin: 0 0 6px 0; line-height: 1.3; }
    .trn-h3 { display: block; font-size: 10.5pt; font-weight: 600; color: #475569; margin-bottom: 16px; }
    .trn-goal { background: #F0F7FF; border-left: 4px solid #003B95; padding: 12px 18px; border-radius: 0 10px 10px 0; margin-bottom: 16px; font-size: 10pt; color: #1E3A8A; line-height: 1.55; }
    .trn-path { background: #F8FAFC; border: 1px dashed #CBD5E1; padding: 9px 15px; border-radius: 8px; font-size: 9pt; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace; color: #0F172A; }
    .trn-path strong { color: #003B95; }
    
    .trn-sec-title { font-size: 12pt; font-weight: 800; color: #002255; margin: 24px 0 10px 0; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; }
    ol.trn-steps, ul.trn-steps { padding-left: 22px; margin: 10px 0 16px 0; }
    ol.trn-steps li, ul.trn-steps li { margin-bottom: 8px; font-size: 10pt; color: #334155; }
    ol.trn-steps li strong, ul.trn-steps li strong { color: #0F172A; }
    
    .box-blue { background: #EFF6FF; border: 1px solid #BFDBFE; border-left: 4px solid #2563EB; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #1E3A8A; margin: 16px 0; line-height: 1.55; }
    .box-warn { background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #D97706; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #92400E; margin: 16px 0; line-height: 1.55; }
    .box-green { background: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #16A34A; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #14532D; margin: 16px 0; line-height: 1.55; }
    .box-blue strong, .box-warn strong, .box-green strong { display: block; margin-bottom: 4px; font-size: 9pt; letter-spacing: 0.5px; text-transform: uppercase; }

    /* TABLES */
    table.tb { width: 100%; border-collapse: collapse; margin: 14px 0 20px; font-size: 9.5pt; }
    table.tb th { background: #001A4D; color: #FFFFFF; font-weight: 700; text-align: left; padding: 8px 12px; border: 1px solid #CBD5E1; }
    table.tb td { padding: 8px 12px; border: 1px solid #CBD5E1; color: #334155; vertical-align: top; }
    table.tb tr:nth-child(even) { background: #F8FAFC; }
    table.tb td code { background: #E2E8F0; padding: 2px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt; color: #0F172A; }
    table.tb td.req { color: #DC2626; font-weight: 700; text-align: center; }

    /* DESKTOP FULL SCREENSHOTS */
    .shot-wrap { page-break-inside: avoid; break-inside: avoid; margin: 18px 0; }
    .shot { border: 1px solid #CBD5E1; border-radius: 10px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 16px rgba(0,0,0,0.08); margin-bottom: 12px; }
    .shot img { width: 100%; height: auto; display: block; }
    .shot figcaption { font-size: 9pt; color: #475569; padding: 8px 14px; background: #F8FAFC; border-top: 1px solid #E2E8F0; line-height: 1.45; }
    .shot figcaption strong { color: #003B95; }
    
    /* MOBILE PHONE MOCKUP */
    .shot-mobile-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      justify-content: center;
      align-items: flex-start;
      margin: 20px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .shot-mobile-card {
      width: 285px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 14px;
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
      font-size: 8.5pt;
      color: #475569;
      margin-top: 8px;
      text-align: center;
      line-height: 1.4;
    }
    .phone-caption strong { color: #003B95; }

    /* TOC */
    .toc-title { font-size: 20pt; font-weight: 900; color: #001A4D; margin: 4px 0 12px; padding-bottom: 10px; border-bottom: 3px solid #003B95; }
    .toc-subtitle { font-size: 10.5pt; color: #475569; margin-bottom: 18px; }
    .toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .toc-item { display: flex; gap: 12px; padding: 10px 14px; border-radius: 10px; text-decoration: none; color: #1E293B; border: 1px solid #E2E8F0; background: #F8FAFC; transition: all 0.2s ease; }
    .toc-item:hover { border-color: #003B95; background: #EFF6FF; }
    .toc-index { min-width: 26px; font-size: 10pt; font-weight: 800; color: #003B95; }
    .toc-text { font-size: 9.5pt; line-height: 1.45; }
    .toc-text b { color: #001A4D; display: block; margin-bottom: 2px; }

    .doc-end { padding: 24px 52px; background: #F8FAFC; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 9pt; color: #64748B; }

    /* PRINT RULES */
    @page { size: A4 portrait; margin: 16mm 12mm 18mm 12mm; }
    @page :first { margin: 0; }
    @media print {
      body { background: #FFFFFF !important; }
      .trn-doc { width: 100% !important; max-width: none !important; box-shadow: none !important; margin: 0 !important; }
      .cover { width: 210mm !important; height: 297mm !important; max-height: 297mm !important; margin: 0 !important; page-break-after: always !important; break-after: page !important; }
      .trn-section { page-break-before: always !important; break-before: page !important; padding: 18mm 12mm !important; }
      #toc { page-break-after: always !important; break-after: page !important; }
      .shot-wrap, .shot-mobile-grid, table.tb, .box-blue, .box-warn, .box-green { page-break-inside: avoid !important; break-inside: avoid !important; }
      .doc-end { page-break-before: always !important; break-before: page !important; }
    }
  </style>
</head>
<body>

<article class="trn-doc">

  <!-- BÌA TÀI LIỆU COVER A4 -->
  <section class="cover" id="cover">
    <div>
      <div class="accent-bar"></div>
      <div class="header">
        <div>MÃ TÀI LIỆU: <span>HDSD-CEO1983-v6.0</span></div>
        <div>HỆ THỐNG ĐIỀU HÀNH & KẾT NỐI DOANH NHÂN CEO 1983</div>
      </div>
      <div class="divider"></div>
    </div>

    <div class="main">
      <div class="badge">TÀI LIỆU ĐÀO TẠO VẬN HÀNH CHUẨN HÓA</div>
      <h1 class="project-title">
        HỆ SINH THÁI DOANH NHÂN <span class="gold">CEO 1983</span>
        <span class="sub">HƯỚNG DẪN SỬ DỤNG CHI TIẾT ỨNG DỤNG DI ĐỘNG & CỔNG QUẢN TRỊ HIỆP HỘI (CRM)</span>
      </h1>
      <p class="subtitle">
        Cẩm nang chuẩn hóa nghiệp vụ dành riêng cho Ban Chấp hành, Ban Thư ký, Ban Chuyên môn và toàn thể Hội viên Hiệp Hội Doanh Nhân CEO 1983 (trực thuộc Hội Doanh nghiệp Trẻ Hà Nội - HanoiBA). Hướng dẫn từng bước thao tác, đặc tả chi tiết 100% trường dữ liệu, biểu mẫu, quy trình duyệt và hình ảnh chụp màn hình thực tế từ hệ thống đang vận hành.
      </p>

      <div class="meta-info">
        <table>
          <tr>
            <td class="label">Đơn vị chủ quản:</td>
            <td><strong>CLB Doanh Nhân CEO 1983 (HanoiBA)</strong></td>
          </tr>
          <tr>
            <td class="label">Phân hệ tài liệu:</td>
            <td><strong>02 Phân hệ: Ứng dụng Di động Hội viên (App PWA) & Cổng Quản trị CRM Hiệp hội</strong></td>
          </tr>
          <tr>
            <td class="label">Đối tượng thụ hưởng:</td>
            <td><strong>Chủ tịch, Phó Chủ tịch, Ban Chuyên môn, Ban Thư ký và Toàn thể Hội viên Doanh nhân</strong></td>
          </tr>
          <tr>
            <td class="label">Đơn vị phát triển công nghệ:</td>
            <td><strong>VIBE TEAM · CEO VIONE PLATFORM (Kiến trúc v6.0 Chuẩn Hóa)</strong></td>
          </tr>
          <tr>
            <td class="label">Phiên bản & Ngày hiệu chỉnh:</td>
            <td><strong>Phiên bản 6.0 · Tháng 10/2026 (Bộ ảnh giao diện thực tế 100% không loading)</strong></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="footer">
      <div>Bản quyền © 2026 CLB Doanh Nhân CEO 1983 (HanoiBA). Bảo lưu mọi quyền.</div>
      <div>Tài liệu lưu hành nội bộ & Hướng dẫn sử dụng chính thức</div>
    </div>
  </section>

  <!-- MỤC LỤC TỔNG QUAN (TOC) -->
  <section class="trn-section" id="toc">
    <h2 class="toc-title">MỤC LỤC TÀI LIỆU</h2>
    <p class="toc-subtitle">Tài liệu bao gồm 24 Chương chuyên đề, bao quát 100% tính năng của Hệ sinh thái CEO 1983 từ bước tiếp cận đầu tiên của Hội viên đến quy trình điều hành tối cao của Ban Chấp hành.</p>

    <div class="toc-grid">
      <!-- Cột 1: Mobile App -->
      <div>
        <div style="font-size:11pt; font-weight:800; color:#001A4D; margin-bottom:8px; border-bottom:2px solid #F59E0B; padding-bottom:4px;">PHẦN I: ỨNG DỤNG DI ĐỘNG HỘI VIÊN (APP PWA)</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <a class="toc-item" href="#app-c1"><span class="toc-index">01</span><span class="toc-text"><b>Cài đặt PWA & Đăng ký Gia nhập</b>Landing Page tiếp nhận hồ sơ Doanh nhân</span></a>
          <a class="toc-item" href="#app-c2"><span class="toc-index">02</span><span class="toc-text"><b>Đăng nhập & Xác thực Hội viên</b>Cơ chế xác thực bảo mật & Phục hồi tài khoản</span></a>
          <a class="toc-item" href="#app-c3"><span class="toc-index">03</span><span class="toc-text"><b>Trang chủ & Bảng tin Hiệp hội</b>Thông báo, tương tác mạng lưới Doanh nhân</span></a>
          <a class="toc-item" href="#app-c4"><span class="toc-index">04</span><span class="toc-text"><b>Thẻ Hội viên Smart VIP Card</b>Thẻ 2 mặt, mã QR định danh & vCard thông minh</span></a>
          <a class="toc-item" href="#app-c5"><span class="toc-index">05</span><span class="toc-text"><b>Danh bạ Hội viên & Tra cứu B2B</b>Tìm kiếm đối tác, ngành nghề kinh doanh</span></a>
          <a class="toc-item" href="#app-c6"><span class="toc-index">06</span><span class="toc-text"><b>Hệ thống Tin nhắn & Chat Nội bộ</b>Kết nối hội thoại 1-1 và phòng ban chuyên môn</span></a>
          <a class="toc-item" href="#app-c7"><span class="toc-index">07</span><span class="toc-text"><b>Sàn Cơ hội Kinh doanh B2B</b>Đăng tải nhu cầu hợp tác, deal thương mại</span></a>
          <a class="toc-item" href="#app-c8"><span class="toc-index">08</span><span class="toc-text"><b>Chợ Sản phẩm & Dịch vụ Hội viên</b>Gian hàng điện tử, ưu đãi nội bộ CLB</span></a>
          <a class="toc-item" href="#app-c9"><span class="toc-index">09</span><span class="toc-text"><b>Sự kiện Hiệp hội & Vé mời Điện tử</b>Đăng ký, lịch trình & Check-in QR Gate</span></a>
          <a class="toc-item" href="#app-c10"><span class="toc-index">10</span><span class="toc-text"><b>Khảo sát & Biểu quyết Trực tiếp</b>Bầu cử Ban Chấp hành, biểu quyết nghị quyết</span></a>
          <a class="toc-item" href="#app-c11"><span class="toc-index">11</span><span class="toc-text"><b>Đóng Niên liễm & Thanh toán VietQR</b>Nộp hội phí tự động đối soát chuẩn ngân hàng</span></a>
          <a class="toc-item" href="#app-c12"><span class="toc-index">12</span><span class="toc-text"><b>Quản lý Hồ sơ Cá nhân & Doanh nghiệp</b>Cập nhật hồ sơ, giấy phép, sản phẩm chủ lực</span></a>
        </div>
      </div>

      <!-- Cột 2: CRM Web -->
      <div>
        <div style="font-size:11pt; font-weight:800; color:#001A4D; margin-bottom:8px; border-bottom:2px solid #003B95; padding-bottom:4px;">PHẦN II: CỔNG QUẢN TRỊ HIỆP HỘI (CRM WEB PORTAL)</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <a class="toc-item" href="#crm-c13"><span class="toc-index">13</span><span class="toc-text"><b>Đăng nhập & Dashboard Tổng quan</b>Báo cáo chỉ số KPI, tài chính & hội viên</span></a>
          <a class="toc-item" href="#crm-c14"><span class="toc-index">14</span><span class="toc-text"><b>Quản lý Cơ cấu Ban Chuyên môn</b>Thiết lập 6 ban nòng cốt & Ban Chấp hành</span></a>
          <a class="toc-item" href="#crm-c15"><span class="toc-index">15</span><span class="toc-text"><b>Quản trị Tài khoản & Phân quyền RBAC</b>Ma trận quyền hạn 6 vai trò bảo mật cấp cao</span></a>
          <a class="toc-item" href="#crm-c16"><span class="toc-index">16</span><span class="toc-text"><b>Quản lý & Phê duyệt Hồ sơ Hội viên</b>Quy trình thẩm định 3 bước & Cấp thẻ VIP</span></a>
          <a class="toc-item" href="#crm-c17"><span class="toc-index">17</span><span class="toc-text"><b>Quản trị Sự kiện & Sơ đồ Ghế Rạp phim</b>Tạo sự kiện, thiết kế Cinema Seating Map</span></a>
          <a class="toc-item" href="#crm-c18"><span class="toc-index">18</span><span class="toc-text"><b>Cổng Check-in Sự kiện Tự động</b>Quét mã QR siêu tốc, thống kê điểm danh</span></a>
          <a class="toc-item" href="#crm-c19"><span class="toc-index">19</span><span class="toc-text"><b>Quản lý Công việc & Dự án (Kanban)</b>Phân công nhiệm vụ, theo dõi tiến độ công việc</span></a>
          <a class="toc-item" href="#crm-c20"><span class="toc-index">20</span><span class="toc-text"><b>Quản trị Cuộc họp & Điểm danh</b>Tổ chức đại hội, lịch sinh hoạt & biên bản họp</span></a>
          <a class="toc-item" href="#crm-c21"><span class="toc-index">21</span><span class="toc-text"><b>Quản lý Tài chính & Quỹ Niên liễm</b>Sổ quỹ thu chi, hóa đơn & quản lý đóng phí</span></a>
          <a class="toc-item" href="#crm-c22"><span class="toc-index">22</span><span class="toc-text"><b>Quản lý Chợ B2B & Duyệt Sản phẩm</b>Kiểm duyệt hàng hóa, gian hàng của hội viên</span></a>
          <a class="toc-item" href="#crm-c23"><span class="toc-index">23</span><span class="toc-text"><b>Quản trị Khảo sát & Bầu cử (Voting)</b>Tạo cuộc thăm dò, quản lý tỷ lệ phiếu hợp lệ</span></a>
          <a class="toc-item" href="#crm-c24"><span class="toc-index">24</span><span class="toc-text"><b>Kho Tài liệu & Biểu mẫu Pháp lý</b>Lưu trữ quy chế, nghị quyết & hồ sơ nhiệm kỳ</span></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- PHẦN I: HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG (MOBILE PWA / APP) -->
  <!-- ========================================================================= -->

  <!-- CHƯƠNG 1 -->
  <section class="trn-section" id="app-c1">
    <span class="trn-tag">CHƯƠNG 01 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Cài Đặt PWA & Đăng Ký Gia Nhập CLB CEO 1983</h2>
    <span class="trn-h3">Tiếp cận Landing Page, cài đặt ứng dụng không cần App Store và nộp hồ sơ hội viên trực tuyến</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp các Doanh nhân sinh năm 1983 (Quý Hợi) hoặc các Doanh nhân yêu mến hiệp hội tiếp cận thông tin giới thiệu, tiến hành cài đặt ứng dụng trực tiếp lên màn hình điện thoại (Add to Home Screen) và nộp đơn đăng ký gia nhập kèm hồ sơ doanh nghiệp một cách thuận tiện, nhanh chóng.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/landing</code> hoặc quét mã QR tuyển quân CLB.
    </div>

    <div class="trn-sec-title">1. Hướng dẫn Quy trình Thao tác:</div>
    <ol class="trn-steps">
      <li><strong>Cài đặt App lên điện thoại (iOS / Android):</strong> Truy cập đường dẫn, trình duyệt sẽ tự động phát hiện thiết bị. Trên iPhone: Bấm nút <em>Chia sẻ (Share)</em> của trình duyệt Safari -> Chọn <em>"Thêm vào Màn hình chính" (Add to Home Screen)</em>. Trên Android: Bấm thông báo <em>"Cài đặt ứng dụng"</em> hoặc dấu 3 chấm góc phải -> <em>"Cài đặt ứng dụng"</em>. Biểu tượng ứng dụng CEO 1983 sẽ xuất hiện trực tiếp ngoài màn hình chính.</li>
      <li><strong>Tìm hiểu thông tin CLB:</strong> Đọc các giá trị cốt lõi, cơ cấu Ban Chấp hành, quyền lợi khi trở thành Hội viên chính thức tại trang Landing Page.</li>
      <li><strong>Kéo xuống biểu mẫu "Đăng ký gia nhập CLB":</strong> Nhập đầy đủ và chính xác các trường thông tin theo bảng đặc tả bên dưới.</li>
      <li><strong>Xác nhận & Nộp hồ sơ:</strong> Tải lên ảnh chân dung doanh nhân rõ nét, tích chọn đồng ý Điều lệ CLB và bấm <strong>"Gửi Đơn Đăng Ký Gia Nhập"</strong>. Hệ thống sẽ cấp mã hồ sơ và chuyển tự động sang CRM để Ban Thư ký thẩm định.</li>
    </ol>

    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Dữ liệu trong Biểu mẫu Đăng ký:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 18%;">Tên trường dữ liệu</th>
          <th style="width: 10%;">Bắt buộc</th>
          <th style="width: 14%;">Kiểu dữ liệu</th>
          <th style="width: 28%;">Hướng dẫn nhập liệu</th>
          <th style="width: 30%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Họ và tên</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Nhập đầy đủ họ tên có dấu (Ví dụ: Nguyễn Văn Tuấn).</td>
          <td>In lên Thẻ Hội viên VIP và hiển thị trên toàn hệ thống danh bạ B2B.</td>
        </tr>
        <tr>
          <td><strong>Số điện thoại</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Phone (10 số)</code></td>
          <td>Nhập số di động chính chủ đang sử dụng Zalo (Ví dụ: 0988123456).</td>
          <td>Dùng làm Tên đăng nhập mặc định và phương thức liên hệ khẩn cấp từ Ban Thư ký.</td>
        </tr>
        <tr>
          <td><strong>Địa chỉ Email</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Email</code></td>
          <td>Nhập email hợp lệ (Ví dụ: tuan.nguyen@company.vn).</td>
          <td>Nhận thông báo kích hoạt tài khoản, hóa đơn đóng hội phí và thư mời sự kiện.</td>
        </tr>
        <tr>
          <td><strong>Tên Doanh nghiệp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Nhập tên đầy đủ của công ty/tập đoàn đang điều hành.</td>
          <td>Định danh năng lực hội viên, quảng bá doanh nghiệp trong hệ sinh thái.</td>
        </tr>
        <tr>
          <td><strong>Chức vụ điều hành</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text / Select</code></td>
          <td>Chọn hoặc nhập: Chủ tịch HĐQT, Tổng Giám đốc, Giám đốc điều hành...</td>
          <td>Thẩm định tư cách lãnh đạo doanh nghiệp theo đúng điều lệ Hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Ngành nghề kinh doanh</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select</code></td>
          <td>Chọn ngành nghề chính: Xây dựng, Công nghệ, Bất động sản, Tài chính, Y tế...</td>
          <td>Phân bổ vào Ban Chuyên môn tương ứng để xúc tiến giao thương chéo hiệu quả.</td>
        </tr>
        <tr>
          <td><strong>Ảnh chân dung cá nhân</strong></td>
          <td class="req">Có (*)</td>
          <td><code>File (JPG/PNG)</code></td>
          <td>Tải lên ảnh chụp rõ mặt, trang phục lịch sự, dung lượng dưới 5MB.</td>
          <td>Làm ảnh đại diện avatar hồ sơ và hiển thị trên thẻ hội viên điện tử.</td>
        </tr>
      </tbody>
    </table>

    <div class="box-blue">
      <strong>LƯU Ý NGHIỆP VỤ QUAN TRỌNG:</strong>
      Sau khi gửi đơn đăng ký thành công, hồ sơ của Quý Doanh nhân sẽ nằm ở trạng thái "Chờ duyệt" (Pending Approval). Ban Thư ký CLB sẽ đối soát thông tin pháp lý doanh nghiệp trong vòng 24 - 48 giờ làm việc và kích hoạt tài khoản đăng nhập.
    </div>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_01_landing.png" alt="Landing Page CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 1.1:</strong> Giao diện Landing Page giới thiệu CLB CEO 1983 trên di động</div>
      </div>
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_01_landing_form.png" alt="Biểu mẫu đăng ký hội viên">
        </div>
        <div class="phone-caption"><strong>Hình 1.2:</strong> Biểu mẫu tiếp nhận hồ sơ Doanh nhân gia nhập CLB</div>
      </div>
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_01_landing_form_filled.png" alt="Biểu mẫu đăng ký hội viên điền đầy đủ dữ liệu">
        </div>
        <div class="phone-caption"><strong>Hình 1.3:</strong> Hồ sơ Doanh nhân được điền đầy đủ dữ liệu chuẩn bị gửi phê duyệt</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 2 -->
  <section class="trn-section" id="app-c2">
    <span class="trn-tag">CHƯƠNG 02 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Đăng Nhập & Xác Thực Hội Viên Doanh Nhân</h2>
    <span class="trn-h3">Truy cập không gian hội viên an toàn, hỗ trợ ghi nhớ đăng nhập và phục hồi tài khoản</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Đảm bảo chỉ những Hội viên chính thức đã được phê duyệt mới được cấp quyền truy cập vào kho dữ liệu danh bạ B2B, quyền lợi biểu quyết, đăng bài giao thương và nhận vé mời tham dự sự kiện kín của CLB.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/login</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Thao tác:</div>
    <ol class="trn-steps">
      <li>Mở ứng dụng CEO 1983 từ màn hình chính hoặc truy cập liên kết đăng nhập.</li>
      <li>Nhập <strong>Tài khoản / Số điện thoại / Email</strong> đã được cấp phép khi phê duyệt hội viên.</li>
      <li>Nhập <strong>Mật khẩu bảo mật</strong> (Tối thiểu 6 ký tự).</li>
      <li>Tích chọn <em>"Ghi nhớ đăng nhập"</em> để không phải nhập lại mật khẩu trong các phiên sau.</li>
      <li>Bấm nút <strong>"Đăng Nhập"</strong> để vào Bảng điều khiển Hội viên.</li>
      <li><em>Trường hợp quên mật khẩu:</em> Bấm <em>"Quên mật khẩu?"</em> -> Nhập Email hoặc Số điện thoại để nhận mã xác thực OTP cấp lại mật khẩu.</li>
    </ol>

    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Giao diện Đăng nhập:</div>
    <table class="tb">
      <thead>
        <tr>
          <th>Tên trường / Phần tử</th>
          <th>Bắt buộc</th>
          <th>Kiểu dữ liệu</th>
          <th>Hướng dẫn thao tác</th>
          <th>Mục đích nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tài khoản / Số điện thoại</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Nhập số điện thoại đã đăng ký (Ví dụ: 0912345678) hoặc Email.</td>
          <td>Định danh chính xác hồ sơ hội viên trong cơ sở dữ liệu.</td>
        </tr>
        <tr>
          <td><strong>Mật khẩu truy cập</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Password</code></td>
          <td>Nhập mật khẩu bí mật cá nhân (Hỗ trợ icon ẩn/hiện mật khẩu).</td>
          <td>Bảo mật dữ liệu thương mại và hồ sơ tài chính cá nhân.</td>
        </tr>
        <tr>
          <td><strong>Nút "Đăng Nhập"</strong></td>
          <td>—</td>
          <td><code>Button Action</code></td>
          <td>Nhấp chuột hoặc chạm vào nút màu xanh viền vàng nổi bật.</td>
          <td>Gửi yêu cầu xác thực JWT Token và chuyển hướng vào Trang chủ.</td>
        </tr>
      </tbody>
    </table>

    <div class="box-warn">
      <strong>CẢNH BÁO AN TOÀN TÀI KHOẢN:</strong>
      Tuyệt đối không cung cấp mật khẩu truy cập cho người ngoài. Hệ thống áp dụng chính sách tự động khóa tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp để bảo vệ tài khoản khỏi tấn công brute-force.
    </div>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_02_login.png" alt="Màn hình đăng nhập mobile">
        </div>
        <div class="phone-caption"><strong>Hình 2.1:</strong> Màn hình Đăng nhập an toàn trên Ứng dụng Di động CEO 1983</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 3 -->
  <section class="trn-section" id="app-c3">
    <span class="trn-tag">CHƯƠNG 03 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Bảng Tin Trang Chủ & Tương Tác Mạng Lưới Doanh Nhân</h2>
    <span class="trn-h3">Trung tâm kết nối thông tin, tin tức sự kiện, sinh nhật hội viên và thao tác nhanh</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Cung cấp cái nhìn toàn cảnh về dòng chảy sự kiện, hoạt động của các ban chuyên môn, chúc mừng sinh nhật các doanh nhân thành viên trong ngày và truy cập nhanh 1 chạm vào các tiện ích nòng cốt.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Khai thác Tính năng Trang chủ:</div>
    <ol class="trn-steps">
      <li><strong>Xem lời chào & Banner chào mừng:</strong> Nắm bắt thông điệp chỉ đạo, khẩu hiệu hành động nhiệm kỳ của Ban Thường trực.</li>
      <li><strong>Khối Tiện ích 1-chạm (Quick Actions):</strong> Truy cập nhanh vào Thẻ VIP, Danh bạ, Đăng deal B2B, Điểm danh sự kiện bằng các nút icon tròn trực quan.</li>
      <li><strong>Chuyên mục Sinh nhật Doanh nhân:</strong> Xem danh sách các Hội viên có sinh nhật trong tuần để gửi tin nhắn chúc mừng, thắt chặt tình đoàn kết.</li>
      <li><strong>Bảng tin Hoạt động & Thông báo Thường trực:</strong> Đọc các văn bản chỉ đạo, lịch trình họp ban, hoạt động thiện nguyện mới nhất.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_03_home.png" alt="Trang chủ Hội viên">
        </div>
        <div class="phone-caption"><strong>Hình 3.1:</strong> Trang chủ điều hành và Bảng tin Mạng lưới Hội viên CEO 1983</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 4 -->
  <section class="trn-section" id="app-c4">
    <span class="trn-tag">CHƯƠNG 04 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Thẻ Hội Viên Điện Tử Smart VIP Card & Chia Sẻ QR Code / vCard</h2>
    <span class="trn-h3">Danh thiếp điện tử thông minh 2 mặt, tích hợp mã QR định danh và xuất danh bạ 1 chạm</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Thay thế hoàn toàn danh thiếp giấy truyền thống; cung cấp công cụ nhận diện thương hiệu cá nhân đẳng cấp cho Doanh nhân CEO 1983 khi tham dự hội nghị, giao lưu đối tác quốc tế hoặc check-in sự kiện nội bộ.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/card</code>
    </div>

    <div class="trn-sec-title">1. Hướng dẫn Thao tác Sử dụng Thẻ VIP:</div>
    <ol class="trn-steps">
      <li><strong>Xem Thẻ mặt trước (Front Card):</strong> Thể hiện Logo mạ vàng CEO 1983, Ảnh đại diện dập nổi, Họ tên, Chức vụ, Tên Doanh nghiệp, Mã số hội viên độc bản (Ví dụ: CEO-1983-007) và Hạng thẻ VIP.</li>
      <li><strong>Lật Thẻ mặt sau (Back Card):</strong> Chạm nhẹ vào thân thẻ hoặc nút <em>"Lật thẻ"</em> để xem Mặt sau. Mặt sau chứa <strong>Mã QR Code động</strong> chứa link danh thiếp công khai của doanh nhân.</li>
      <li><strong>Chia sẻ thông tin nhanh:</strong> Đưa mã QR cho đối tác quét bằng camera điện thoại. Đối tác sẽ mở ngay trang hồ sơ cá nhân và có thể bấm nút <em>"Lưu vào Danh bạ" (.vcf)</em> để lưu toàn bộ số điện thoại, email, địa chỉ công ty vào danh bạ điện thoại chỉ sau 1 giây.</li>
    </ol>

    <div class="box-green">
      <strong>TÍNH NĂNG CHIA SẺ DANH THIẾP ĐIỆN TỬ VÀ LƯU DANH BẠ 1 CHẠM (vCard):</strong>
      Thẻ VIP điện tử của CEO 1983 cho phép đối tác quét mã QR trực tiếp bằng Camera điện thoại hoặc ứng dụng Zalo. Toàn bộ hồ sơ doanh nhân, website, số điện thoại và email sẽ được nhập thẳng vào sổ danh bạ điện thoại của đối tác một cách chuyên nghiệp và chính xác tuyệt đối.
    </div>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_04_card_front.png" alt="Thẻ VIP mặt trước">
        </div>
        <div class="phone-caption"><strong>Hình 4.1:</strong> Thẻ Hội viên VIP CEO 1983 Mặt trước sang trọng</div>
      </div>
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_05_card_back.png" alt="Thẻ VIP mặt sau mã QR">
        </div>
        <div class="phone-caption"><strong>Hình 4.2:</strong> Mặt sau Thẻ VIP tích hợp Mã QR Code định danh</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 5 -->
  <section class="trn-section" id="app-c5">
    <span class="trn-tag">CHƯƠNG 05 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Danh Bạ Hội Viên Doanh Nghiệp & Tra Cứu Đối Tác B2B</h2>
    <span class="trn-h3">Bộ lọc đa chiều theo ngành nghề, ban chuyên môn và kết nối trực tiếp với lãnh đạo công ty</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Phá vỡ khoảng cách giữa các doanh nghiệp trong hiệp hội; tạo nền tảng kết nối giao thương tin cậy 100% khi người tìm kiếm và người cung cấp đều là Hội viên chính thức đã được CLB xác minh pháp lý.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/members</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Tìm kiếm & Kết nối:</div>
    <ol class="trn-steps">
      <li>Nhập từ khóa tìm kiếm (Họ tên doanh nhân, Tên công ty hoặc Sản phẩm/Dịch vụ) vào thanh tìm kiếm.</li>
      <li>Sử dụng thanh lọc nhanh theo <strong>Ban Chuyên môn</strong> (Ban Xúc tiến Thương mại, Ban Pháp chế, Ban Đào tạo...) hoặc theo <strong>Ngành nghề</strong>.</li>
      <li>Chạm vào thẻ thông tin của Doanh nhân để mở trang Hồ sơ chi tiết (Profile).</li>
      <li>Thực hiện các thao tác kết nối: Bấm <strong>"Gọi điện"</strong>, <strong>"Gửi tin nhắn"</strong> hoặc <strong>"Xem gian hàng sản phẩm"</strong> của hội viên đó.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_06_members.png" alt="Danh bạ hội viên">
        </div>
        <div class="phone-caption"><strong>Hình 5.1:</strong> Danh bạ Doanh nhân & Hệ thống Lọc ngành nghề B2B</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 6 -->
  <section class="trn-section" id="app-c6">
    <span class="trn-tag">CHƯƠNG 06 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Hệ Thống Tin Nhắn & Chat Nội Bộ Doanh Nghiệp</h2>
    <span class="trn-h3">Kênh giao tiếp thời gian thực, bảo mật tuyệt đối dành riêng cho Hội đồng Doanh nhân</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Trao đổi công việc, đàm phán hợp đồng, thảo luận nghị quyết ban chấp hành tức thời với tốc độ cao, hỗ trợ gửi hình ảnh, tệp đính kèm và thông báo đẩy (Push Notifications).
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/messages</code>
    </div>

    <div class="trn-sec-title">1. Thao tác Trò chuyện & Kết nối:</div>
    <ol class="trn-steps">
      <li>Vào mục <strong>Tin nhắn</strong> từ thanh điều hướng dưới đáy màn hình.</li>
      <li>Chọn một hội thoại đã có hoặc bấm nút <em>"Tạo tin nhắn mới"</em> để chọn Doanh nhân cần kết nối.</li>
      <li>Nhập nội dung văn bản, đính kèm ảnh dự án hoặc tệp tài liệu hợp đồng và bấm nút <strong>Gửi</strong>.</li>
      <li>Trạng thái tin nhắn hiển thị trực quan: <em>Đã gửi, Đã nhận, Đã xem</em>.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_07_messages.png" alt="Hệ thống tin nhắn">
        </div>
        <div class="phone-caption"><strong>Hình 6.1:</strong> Giao diện Phòng chat & Hội thoại Trực tuyến giữa các Hội viên</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 7 -->
  <section class="trn-section" id="app-c7">
    <span class="trn-tag">CHƯƠNG 07 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Sàn Cơ Hội Kinh Doanh & Đăng Tải Deal B2B</h2>
    <span class="trn-h3">Khai thác và chia sẻ nguồn việc, thầu phụ, gọi vốn và hợp tác thương mại nội bộ</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Hiện thực hóa khẩu hiệu "Kết nối cơ hội - Hợp tác cùng phát triển". Cho phép hội viên đăng tải nhu cầu tìm nhà thầu, đối tác cung ứng hoặc tìm kiếm khách hàng với chính sách ưu đãi đặc biệt cho thành viên CEO 1983.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/opportunities</code>
    </div>

    <div class="trn-sec-title">1. Hướng dẫn Đăng tải & Tương tác Deal:</div>
    <ol class="trn-steps">
      <li><strong>Xem dòng tin Cơ hội (Feed):</strong> Lướt xem các nhu cầu hợp tác mới nhất của các doanh nghiệp bạn bè.</li>
      <li><strong>Bấm nút "+ Đăng Cơ Hội Mới":</strong> Nhập Tiêu đề cơ hội, Giá trị hợp đồng ước tính, Mô tả yêu cầu kỹ thuật và Hạn chót nhận hồ sơ.</li>
      <li><strong>Tương tác tiếp nhận:</strong> Bấm nút <strong>"Quan tâm / Kết nối Deal"</strong> để mở kênh trò chuyện riêng trực tiếp với chủ deal.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_08_opportunities.png" alt="Sàn cơ hội kinh doanh">
        </div>
        <div class="phone-caption"><strong>Hình 7.1:</strong> Sàn Cơ hội Kinh doanh B2B & Chia sẻ Dự án nội bộ</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 8 -->
  <section class="trn-section" id="app-c8">
    <span class="trn-tag">CHƯƠNG 08 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Chợ Sản Phẩm & Dịch Vụ Doanh Nghiệp Hội Viên</h2>
    <span class="trn-h3">Gian hàng thương mại điện tử B2B nội bộ, ưu đãi độc quyền cho thành viên hiệp hội</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Trưng bày các sản phẩm, giải pháp công nghệ, vật liệu xây dựng, dịch vụ tư vấn của công ty hội viên; khuyến khích người CEO 1983 ưu tiên sử dụng sản phẩm của nhau trước khi mua ngoài thị trường.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/products</code>
    </div>

    <div class="trn-sec-title">1. Thao tác Khai thác Chợ B2B:</div>
    <ol class="trn-steps">
      <li>Duyệt danh mục sản phẩm theo lưới hiển thị 2 cột chuẩn thiết kế di động hiện đại.</li>
      <li>Xem hình ảnh sắc nét, giá niêm yết và mức chiết khấu riêng dành cho thành viên CLB.</li>
      <li>Bấm vào sản phẩm để xem chi tiết thông số kỹ thuật, catalogue và thông tin liên hệ nhà sản xuất.</li>
      <li>Bấm <strong>"Đăng ký nhận báo giá / Mua hàng"</strong> để kết nối đơn hàng trực tiếp.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_09_products.png" alt="Chợ sản phẩm B2B">
        </div>
        <div class="phone-caption"><strong>Hình 8.1:</strong> Gian hàng Sản phẩm & Giải pháp Doanh nghiệp Hội viên</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 9 -->
  <section class="trn-section" id="app-c9">
    <span class="trn-tag">CHƯƠNG 09 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Sự Kiện Hiệp Hội, Vé Mời Điện Tử & Trung Tâm Mã QR Gate</h2>
    <span class="trn-h3">Đăng ký tham dự hội nghị, thẻ vé mời điện tử và trung tâm mã QR soát vé Zalo/Web</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Chuyển đổi số toàn diện công tác tổ chức sự kiện; loại bỏ vé giấy, giúp hội viên nắm rõ lịch trình chương trình, địa điểm tổ chức, tài liệu hội thảo, nhận thẻ vé điện tử và cung cấp mã QR cho khách mời quét qua Zalo/Web.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/events</code> và <code>https://ceo1983.viconnect.vn/association/checkin</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Đăng ký & Sử dụng Vé mời:</div>
    <ol class="trn-steps">
      <li>Truy cập mục <strong>Sự kiện</strong> để xem danh sách các sự kiện sắp diễn ra (Gala sinh nhật, Caravan kết nối, Tọa đàm kinh tế...).</li>
      <li>Bấm <strong>"Đăng ký tham dự"</strong> -> Nhận <strong>Thẻ Vé Điện Tử (Event Pass)</strong> chứa Mã QR Check-in độc nhất và số ghế cụ thể.</li>
      <li>Khi đến hội trường sự kiện: Mở ứng dụng, xuất trình mã QR tại Cổng Check-in để máy quét ghi nhận điểm danh thành công sau 0.5 giây.</li>
      <li><strong>Mã QR Sự kiện dành cho Khách mời (Zalo/Web):</strong> Vào mục Check-in -> Chuyển sang tab <em>"Mã QR Sự Kiện"</em> để lấy mã QR công khai cho đối tác ngoài quét bằng Zalo đăng ký vé trực tiếp.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_10_events.png" alt="Sự kiện hiệp hội">
        </div>
        <div class="phone-caption"><strong>Hình 9.1:</strong> Danh sách Sự kiện & Thẻ Vé Tham dự Điện tử</div>
      </div>
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_10_event_qr_hub.png" alt="Trung tâm Mã QR Sự kiện trên Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 9.2:</strong> Trung tâm Mã QR Sự kiện gồm Thẻ vé Hội viên và Mã QR Zalo Khách mời</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 10 -->
  <section class="trn-section" id="app-c10">
    <span class="trn-tag">CHƯƠNG 10 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Khảo Sát Ý Kiến & Biểu Quyết Bầu Cử Trực Tiếp (Live Voting)</h2>
    <span class="trn-h3">Thực hiện quyền làm chủ của hội viên, minh bạch kết quả biểu quyết theo thời gian thực</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Phục vụ các kỳ Đại hội nhiệm kỳ bầu Ban Chấp hành, lấy ý kiến sửa đổi Điều lệ hoặc biểu quyết các quyết sách quan trọng của Hiệp hội với độ bảo mật tuyệt đối, chống gian lận và thống kê tự động.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/voting</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Biểu quyết Trực tuyến:</div>
    <ol class="trn-steps">
      <li>Mở mục <strong>Biểu quyết</strong> khi Ban Tổ chức kích hoạt phiên bỏ phiếu trực tiếp.</li>
      <li>Đọc kỹ nội dung nghị quyết hoặc danh sách các ứng viên trong hòm phiếu.</li>
      <li>Tích chọn phương án biểu quyết: <em>Đồng ý, Không đồng ý, Ý kiến khác</em> hoặc tích chọn danh sách ứng viên.</li>
      <li>Bấm <strong>"Xác Nhận Bỏ Phiếu"</strong>. Hệ thống khóa quyền biểu quyết của tài khoản để chống bầu trùng lặp và cập nhật biểu đồ tỷ lệ phần trăm trực tiếp lên màn hình hội trường.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_11_voting.png" alt="Biểu quyết trực tuyến">
        </div>
        <div class="phone-caption"><strong>Hình 10.1:</strong> Giao diện Biểu quyết Nghị quyết & Bầu cử Ban Chấp hành</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 11 -->
  <section class="trn-section" id="app-c11">
    <span class="trn-tag">CHƯƠNG 11 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Đóng Niên Liễm Hội Viên & Thanh Toán VietQR Tự Động</h2>
    <span class="trn-h3">Nộp hội phí hàng năm tiện lợi, tự động khớp lệnh thanh toán chuẩn Napas 24/7</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Minh bạch hóa nguồn thu niên liễm của hiệp hội, loại bỏ việc chuyển khoản thủ công phải chụp màn hình gửi kế toán; hệ thống tự động sinh mã VietQR động có sẵn số tiền và cú pháp chuẩn, gạch nợ tức thì khi tiền về tài khoản hiệp hội.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/renew</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Đóng Phí Tự Động:</div>
    <ol class="trn-steps">
      <li>Vào mục <strong>Đóng Niên Liễm</strong> từ Trang chủ hoặc Hồ sơ cá nhân.</li>
      <li>Xem kỳ niên liễm hiện tại, hạn nộp phí và số tiền cần thanh toán theo quy định (Ví dụ: 10,000,000 VNĐ/Năm).</li>
      <li>Màn hình hiển thị <strong>Mã VietQR Chuyển Khoản Động</strong>.</li>
      <li>Mở ứng dụng Ngân hàng bất kỳ trên điện thoại -> Quét mã VietQR (Toàn bộ Số tài khoản, Ngân hàng thụ hưởng, Số tiền và Cú pháp định danh đã được điền sẵn 100%).</li>
      <li>Bấm xác nhận chuyển khoản. Hệ thống Webhook ngân hàng sẽ tự động xác nhận trong vòng 3 - 5 giây và gia hạn Thẻ Hội viên sang niên khóa tiếp theo.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_12_renew.png" alt="Đóng phí hội viên VietQR">
        </div>
        <div class="phone-caption"><strong>Hình 11.1:</strong> Màn hình Thanh toán Niên liễm tích hợp VietQR Tự Động</div>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 12 -->
  <section class="trn-section" id="app-c12">
    <span class="trn-tag">CHƯƠNG 12 · PHÂN HỆ DI ĐỘNG</span>
    <h2 class="trn-h2">Quản Lý Hồ Sơ Cá Nhân & Doanh Nghiệp Hội Viên</h2>
    <span class="trn-h3">Chỉnh sửa thông tin doanh nghiệp, đổi mật khẩu và tùy biến quyền riêng tư</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Cho phép Hội viên chủ động cập nhật các thành tựu mới, đổi ảnh đại diện, bổ sung số điện thoại phụ, địa chỉ văn phòng đại diện hoặc quản lý các tùy chọn bảo mật cá nhân trên hệ thống.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://ceo1983.viconnect.vn/association/profile</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Cập nhật Hồ sơ:</div>
    <ol class="trn-steps">
      <li>Chạm vào tab <strong>Hồ sơ</strong> ở góc phải thanh điều hướng dưới.</li>
      <li>Bấm nút <strong>"Chỉnh sửa thông tin"</strong>.</li>
      <li>Cập nhật các mục: Giới thiệu bản thân, Lĩnh vực thế mạnh, Liên kết Website/Fanpage công ty.</li>
      <li>Bấm <strong>"Lưu Thay Đổi"</strong> để đồng bộ tức thì lên Danh bạ B2B toàn hệ thống.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="screenshots/app_13_profile.png" alt="Quản lý hồ sơ hội viên">
        </div>
        <div class="phone-caption"><strong>Hình 12.1:</strong> Trung tâm Quản trị Hồ sơ Cá nhân & Doanh nghiệp Hội viên</div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- PHẦN II: HƯỚNG DẪN CỔNG QUẢN TRỊ HIỆP HỘI (CRM WEB PORTAL) -->
  <!-- ========================================================================= -->

  <!-- CHƯƠNG 13 -->
  <section class="trn-section" id="crm-c13">
    <span class="trn-tag">CHƯƠNG 13 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Đăng Nhập Quản Trị & Bảng Điều Khiển Tổng Quan (Dashboard)</h2>
    <span class="trn-h3">Trung tâm chỉ huy số, thống kê trực quan toàn bộ chỉ số KPI vận hành hiệp hội</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Dành riêng cho Chủ tịch, Ban Thường trực và Ban Thư ký theo dõi bức tranh tài chính, số lượng hội viên mới gia nhập, tỷ lệ hoàn thành công việc của các ban chuyên môn và tiến độ thu niên liễm trong thời gian thực.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/auth</code> và <code>https://crm.ceo1983.viconnect.vn/</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Thao tác:</div>
    <ol class="trn-steps">
      <li>Truy cập Cổng CRM trên máy tính (Khuyến nghị dùng Google Chrome, độ phân giải từ 1440x900 trở lên).</li>
      <li>Đăng nhập bằng tài khoản quản trị được phân quyền (Ví dụ: <code>admin@connect.vn</code>).</li>
      <li>Quan sát các <strong>Khối Thẻ Chỉ Số (KPI Stat Cards)</strong> trên cùng: <em>Tổng hội viên chính thức, Số hồ sơ chờ duyệt, Tổng quỹ niên liễm thực thu, Tỷ lệ nhiệm vụ hoàn thành</em>.</li>
      <li>Phân tích biểu đồ tăng trưởng hội viên theo tháng và biểu đồ phân bổ ngành nghề kinh doanh.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_01_login.png" alt="Cổng đăng nhập CRM">
        <figcaption><strong>Hình 13.1:</strong> Cổng Đăng nhập Quản trị CRM Hiệp hội CEO 1983 (Chuẩn Logo thương hiệu mới)</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_02_dashboard.png" alt="Executive Dashboard CRM">
        <figcaption><strong>Hình 13.2:</strong> Bảng điều khiển Trung tâm Chỉ huy Điều hành Hiệp hội (Executive Dashboard)</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 14 -->
  <section class="trn-section" id="crm-c14">
    <span class="trn-tag">CHƯƠNG 14 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Lý Cơ Cấu Ban Chuyên Môn & Ban Chấp Hành</h2>
    <span class="trn-h3">Thiết lập 6 ban chức năng nòng cốt, cơ cấu nhân sự lãnh đạo và phân bổ nhiệm vụ</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Chuẩn hóa mô hình tổ chức của CLB CEO 1983 theo đúng Điều lệ Hội HanoiBA, phân chia 6 ban nòng cốt (Ban Thường trực, Ban Xúc tiến Thương mại, Ban Sự kiện, Ban Hội viên, Ban Tài chính, Ban Truyền thông) và chỉ định Trưởng/Phó ban phụ trách.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/departments</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Thêm & Quản lý Ban Chuyên môn:</div>
    <ol class="trn-steps">
      <li>Vào menu <strong>Ban Chuyên Môn</strong> trên thanh Menu điều hướng bên trái.</li>
      <li>Xem danh sách các ban hiện hành, số lượng thành viên và người đứng đầu từng ban.</li>
      <li>Bấm nút <strong>"+ Thêm Ban Mới"</strong> để mở hộp thoại cấu hình.</li>
      <li>Nhập Tên ban, Mã ban, Chọn Trưởng ban từ danh sách hội viên, nhập chức năng nhiệm vụ.</li>
      <li>Bấm <strong>"Lưu Thay Đổi"</strong> để kích hoạt cấu trúc tổ chức mới.</li>
    </ol>

    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Hộp thoại Thêm Ban Mới:</div>
    <table class="tb">
      <thead>
        <tr>
          <th>Tên trường dữ liệu</th>
          <th>Bắt buộc</th>
          <th>Kiểu dữ liệu</th>
          <th>Hướng dẫn nhập liệu</th>
          <th>Mục đích nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tên Ban Chuyên Môn</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Ban Xúc tiến Thương mại & Đầu tư.</td>
          <td>Định danh chính thức tên ban trên toàn bộ hệ thống báo cáo.</td>
        </tr>
        <tr>
          <td><strong>Mã ký hiệu</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Code (Viết hoa)</code></td>
          <td>Ví dụ: <code>BAN_XTTM</code>, <code>BAN_HOIVIEN</code>.</td>
          <td>Dùng làm khóa phân quyền và tiền tố sinh mã văn bản nội bộ.</td>
        </tr>
        <tr>
          <td><strong>Trưởng ban phụ trách</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn từ danh sách Hội viên đã kích hoạt.</td>
          <td>Gán quyền Quản trị viên cấp ban để điều hành công việc nội bộ.</td>
        </tr>
        <tr>
          <td><strong>Mô tả nhiệm vụ trọng tâm</strong></td>
          <td>Không</td>
          <td><code>Textarea</code></td>
          <td>Mô tả phạm vi quyền hạn và mục tiêu KPI của ban.</td>
          <td>Làm cơ sở đánh giá thi đua khen thưởng cuối nhiệm kỳ.</td>
        </tr>
      </tbody>
    </table>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_03_departments.png" alt="Quản lý ban chuyên môn">
        <figcaption><strong>Hình 14.1:</strong> Danh sách Cơ cấu các Ban Chuyên môn Hiệp hội CEO 1983</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_03_department_create_modal.png" alt="Modal thêm ban chuyên môn">
        <figcaption><strong>Hình 14.2:</strong> Hộp thoại Thiết lập Cơ cấu & Bổ nhiệm Trưởng Ban Chuyên môn mới</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 15 -->
  <section class="trn-section" id="crm-c15">
    <span class="trn-tag">CHƯƠNG 15 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Trị Tài Khoản Vận Hành & Ma Trận Phân Quyền RBAC</h2>
    <span class="trn-h3">Phân bổ 6 vai trò bảo mật: Super Admin, President, Head Dept, Secretary, Treasurer, Member</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Thực thi nguyên tắc an toàn thông tin tối cao; đảm bảo đúng người đúng việc, mỗi chức danh chỉ được nhìn thấy và thao tác trên những dữ liệu được Hội đồng Quản trị phê chuẩn.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/accounts</code> và <code>https://crm.ceo1983.viconnect.vn/permissions</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Cấp Tài khoản & Gán Quyền:</div>
    <ol class="trn-steps">
      <li>Vào mục <strong>Tài khoản Vận hành</strong> -> Bấm <strong>"+ Thêm Tài Khoản"</strong>.</li>
      <li>Nhập Email công vụ, Mật khẩu ban đầu và chọn <strong>Vai trò (Role)</strong> tương ứng.</li>
      <li>Chuyển sang tab <strong>Ma Trận Phân Quyền (RBAC Matrix)</strong>: Tại đây hiển thị lưới phân quyền giữa 6 vai trò và hơn 40 quyền hạn nghiệp vụ chi tiết (Xem, Thêm, Sửa, Xóa, Duyệt chi, Phê duyệt hội viên).</li>
      <li>Tích chọn hoặc bỏ tích các ô quyền tương ứng và bấm <strong>"Cập Nhật Ma Trận Quyền"</strong>.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_04_accounts.png" alt="Danh sách tài khoản">
        <figcaption><strong>Hình 15.1:</strong> Danh sách Tài khoản Vận hành Hệ thống CRM</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_04_account_create_modal.png" alt="Modal thêm tài khoản">
        <figcaption><strong>Hình 15.2:</strong> Hộp thoại Tạo mới Tài khoản và Gán vai trò vận hành</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_05_permissions.png" alt="Ma trận phân quyền RBAC">
        <figcaption><strong>Hình 15.3:</strong> Ma trận Phân quyền Vai trò Bảo mật Cấp cao (Role-Based Access Control) với 2 cột cố định</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 16 -->
  <section class="trn-section" id="crm-c16">
    <span class="trn-tag">CHƯƠNG 16 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Lý Hồ Sơ & Quy Trình Thẩm Định Phê Duyệt Hội Viên</h2>
    <span class="trn-h3">Thẩm tra lý lịch doanh nghiệp 3 bước, phê chuẩn tư cách hội viên và cấp mã số thẻ VIP</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Đảm bảo 100% hội viên gia nhập đáp ứng đúng tiêu chuẩn Điều lệ (Độ tuổi 1983, tư cách đạo đức tốt, doanh nghiệp hoạt động hợp pháp, đóng góp tích cực cho phong trào doanh nhân thủ đô).
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/members</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Thẩm định 3 Bước:</div>
    <ol class="trn-steps">
      <li><strong>Bước 1 - Tiếp nhận hồ sơ:</strong> Lọc danh sách hội viên theo trạng thái <em>"Chờ phê duyệt"</em>. Bấm vào tên hội viên để xem toàn bộ thông tin đăng ký và ảnh chân dung.</li>
      <li><strong>Bước 2 - Thẩm tra thông tin:</strong> Kiểm tra mã số thuế doanh nghiệp, thẩm định uy tín và liên hệ phỏng vấn sơ bộ nếu cần.</li>
      <li><strong>Bước 3 - Ra quyết định phê chuẩn:</strong>
        <ul>
          <li>Nếu đạt chuẩn: Bấm nút <strong>"Phê Duyệt Hội Viên"</strong>. Hệ thống tự động cấp Mã hội viên, sinh Thẻ VIP điện tử và gửi email chúc mừng kèm thông tin đăng nhập cho Doanh nhân.</li>
          <li>Nếu không đạt: Bấm nút <strong>"Từ Chối"</strong> và nhập rõ lý do để hệ thống gửi thư phản hồi lịch sự.</li>
        </ul>
      </li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_06_members.png" alt="Quản lý hội viên CRM">
        <figcaption><strong>Hình 16.1:</strong> Danh sách Cơ sở Dữ liệu Toàn bộ Hội viên Hiệp hội CEO 1983</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 17 -->
  <section class="trn-section" id="crm-c17">
    <span class="trn-tag">CHƯƠNG 17 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Trị Sự Kiện, Sơ Đồ Ghế Ngồi Rạp Phim & Đăng Ký Khách Mời</h2>
    <span class="trn-h3">Khởi tạo sự kiện 3 bước, sơ đồ ghế Cinema Seating Studio, form đăng ký khách mời & email xác nhận</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Phục vụ các sự kiện đại hội, hội nghị thường niên tổ chức tại các trung tâm hội nghị hoặc rạp chiếu phim cao cấp; cho phép xếp chỗ danh dự theo hàng ghế (VIP, Kim Cương, Vàng), gán tên đại biểu vào từng ghế ngồi, cung cấp trang đăng ký khách mời ngoài và tự động gửi email thông báo vé mời điện tử E-Ticket kèm số may mắn Lucky Draw.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/events</code> và <code>https://crm.ceo1983.viconnect.vn/event-registrations</code>
    </div>

    <div class="trn-sec-title">1. Hướng dẫn Khởi tạo & Vận hành Sự Kiện Toàn Diện:</div>
    <ol class="trn-steps">
      <li><strong>Tạo Sự kiện mới (3 Bước):</strong> Tại trang Sự kiện, bấm nút <strong>"+ Tạo Sự Kiện Mới"</strong> -> Nhập Tên sự kiện, Thời gian, Địa điểm, Ảnh bìa, Số lượng khách mời và cấu hình vé.</li>
      <li><strong>Sơ đồ Ghế ngồi Rạp chiếu phim (Cinema Seating Studio):</strong> Vào mục <em>"Đăng ký sự kiện"</em> -> Bấm nút to bản <strong>"Sơ Đồ Xếp Chỗ"</strong>. Giao diện Studio mở ra hiển thị toàn cảnh rạp: Màn hình sân khấu (Screen), các hàng ghế A, B, C, D... Chạm vào từng ghế để đổi chỗ hoặc gán tên đại biểu VIP.</li>
      <li><strong>Trang Đăng ký dành cho Khách mời Ngoài (Zalo / Web):</strong> Gửi liên kết công khai <code>/events/:eventId/register?source=zalo_guest</code> cho đối tác. Khách mời điền thông tin Họ tên, Số điện thoại, Email, Doanh nghiệp và chọn số lượng vé.</li>
      <li><strong>Màn hình Xác nhận Đăng ký Thành công & Gửi Email Tự động:</strong> Sau khi nộp đơn, hệ thống hiển thị trang chúc mừng với Thẻ vé điện tử E-Ticket, Mã QR điểm danh, Số may mắn Lucky Draw và thông báo: <em>"Email xác nhận chi tiết đã được gửi tới hòm thư của Quý khách"</em>.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_07_events.png" alt="Quản trị sự kiện CRM">
        <figcaption><strong>Hình 17.1:</strong> Trung tâm Quản trị Sự kiện & Báo cáo Lượng vé đăng ký</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_08_cinema_seating_studio.png" alt="Sơ đồ xếp chỗ rạp chiếu phim Cinema Seating Studio">
        <figcaption><strong>Hình 17.2:</strong> Giao diện Sơ đồ Xếp Chỗ Rạp Chiếu Phim (Cinema Seating Studio) với các hàng ghế VIP và sân khấu</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_07_guest_event_register_form.png" alt="Form đăng ký sự kiện cho khách mời ngoài">
        <figcaption><strong>Hình 17.3:</strong> Biểu mẫu Đăng ký Tham dự Sự kiện Trực tuyến dành riêng cho Khách mời ngoài (Zalo / Web)</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_07_event_register_success_email.png" alt="Xác nhận đăng ký thành công có gửi email">
        <figcaption><strong>Hình 17.4:</strong> Màn hình Xác nhận Đăng ký Thành công, Thẻ vé điện tử E-Ticket, Số Lucky Draw & Email Thông báo</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 18 -->
  <section class="trn-section" id="crm-c18">
    <span class="trn-tag">CHƯƠNG 18 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Cổng Check-in Tự Động & Hộp Thoại Soát Vé Standee Zalo</h2>
    <span class="trn-h3">Quét mã QR qua Webcam/Máy quét chuyên dụng, in Standee Zalo đón tiếp đại biểu</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giải quyết triệt để tình trạng ùn tắc tại bàn lễ tân khi đón tiếp hàng trăm doanh nhân tham dự; nhận diện đại biểu chính xác, hiển thị ngay vị trí ghế ngồi trên màn hình lễ tân và cung cấp Standee mã QR cho khách mời quét bằng Zalo.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/checkin</code> và hộp thoại <em>"+ Quét QR / Thêm người tham gia"</em>
    </div>

    <div class="trn-sec-title">1. Quy trình Vận hành Cổng Check-in:</div>
    <ol class="trn-steps">
      <li>Lễ tân chọn sự kiện cần điểm danh trong danh sách xổ xuống.</li>
      <li>Kích hoạt Camera/Máy quét mã vạch (Barcode/QR Scanner).</li>
      <li>Khi đại biểu xuất trình vé trên Mobile App: Hướng camera vào mã QR.</li>
      <li>Màn hình ngay lập tức phát âm thanh báo thành công, hiện to rõ: <strong>Họ tên đại biểu, Đơn vị công tác, Vị trí ghế ngồi (Ví dụ: Ghế VIP C12)</strong>.</li>
      <li><strong>Hộp thoại Soát Vé & Standee Zalo:</strong> Bấm nút <em>"+ Quét QR / Thêm người tham gia"</em> tại trang Đăng ký sự kiện. Lễ tân có thể chọn tab <em>"Mã QR Standee Sự Kiện"</em> để in Standee A4/Roll-up đặt tại sảnh đón tiếp.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_09_checkin.png" alt="Cổng check-in sự kiện">
        <figcaption><strong>Hình 18.1:</strong> Giao diện Cổng Check-in Điểm danh Sự kiện Tự Động (QR Gate)</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_08_event_qr_gatekeeper_modal.png" alt="Hộp thoại soát vé Gatekeeper và Standee Zalo">
        <figcaption><strong>Hình 18.2:</strong> Hộp thoại Quét QR Soát Vé & Quản lý Mã QR Standee Zalo dành cho Khách mời ngoài</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 19 -->
  <section class="trn-section" id="crm-c19">
    <span class="trn-tag">CHƯƠNG 19 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Lý Công Việc & Dự Án Ban Chấp Hành (Kanban Board)</h2>
    <span class="trn-h3">Bảng trực quan hóa tiến độ theo 4 cột trạng thái: Cần làm, Đang làm, Đang kiểm tra, Hoàn thành</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Theo dõi toàn diện các nhiệm vụ được giao trong các kỳ họp Ban Chấp hành; gắn trách nhiệm cụ thể cho từng cá nhân, thiết lập hạn chót (Deadline) và thông báo nhắc việc tự động.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/tasks</code>
    </div>

    <div class="trn-sec-title">1. Thao tác Quản trị Công việc Kanban:</div>
    <ol class="trn-steps">
      <li>Bấm <strong>"+ Thêm Công Việc Mới"</strong> để mở hộp thoại phân việc.</li>
      <li>Nhập Tiêu đề công việc, Mô tả chi tiết, Chọn Ban chuyên môn thực hiện, Người phụ trách chính, Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình) và Hạn hoàn thành.</li>
      <li>Bấm <strong>"Tạo Công Việc"</strong>. Thẻ việc xuất hiện tại cột <em>"Cần làm" (To Do)</em>.</li>
      <li>Kéo thả (Drag & Drop) thẻ việc giữa các cột: Khi bắt đầu làm kéo sang <em>"Đang làm" (In Progress)</em>; khi hoàn tất kéo sang <em>"Hoàn thành" (Completed)</em>.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_10_tasks_kanban.png" alt="Bảng Kanban công việc">
        <figcaption><strong>Hình 19.1:</strong> Bảng Quản trị Tiến độ Công việc Ban Chấp hành (Kanban Board)</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_11_task_create_modal.png" alt="Modal tạo công việc mới">
        <figcaption><strong>Hình 19.2:</strong> Hộp thoại Khởi tạo và Phân công Nhiệm vụ Trọng tâm</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 20 -->
  <section class="trn-section" id="crm-c20">
    <span class="trn-tag">CHƯƠNG 20 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Lý Cuộc Họp Ban, Lịch Biểu & Điểm Danh Hội Nghị</h2>
    <span class="trn-h3">Tổ chức sinh hoạt định kỳ, gửi giấy mời họp tự động và lưu trữ biên bản cuộc họp</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Chuyên nghiệp hóa công tác chuẩn bị cuộc họp của Ban Thư ký; quản lý lịch họp Ban Thường trực, Đại hội toàn thể, ghi nhận tỷ lệ hiện diện của các Ủy viên Ban Chấp hành.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/meetings</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Tổ chức Cuộc họp:</div>
    <ol class="trn-steps">
      <li>Bấm <strong>"+ Tạo Cuộc Họp Mới"</strong> -> Nhập Chủ đề cuộc họp, Thời gian, Hình thức (Trực tiếp tại văn phòng hoặc Online qua Zoom/Meet kèm link).</li>
      <li>Chọn danh sách thành viên bắt buộc tham dự -> Bấm <strong>"Phát Giấy Mời"</strong>. Hệ thống đẩy thông báo nhắc lịch lên ứng dụng di động của từng đại biểu.</li>
      <li>Trong cuộc họp: Sử dụng tính năng <strong>Điểm danh</strong> để đánh dấu hiện diện / vắng mặt có lý do.</li>
      <li>Kết thúc cuộc họp: Tải lên tệp <strong>Biên bản cuộc họp (PDF/DOCX)</strong> có chữ ký Chủ tọa để lưu kho lưu trữ số.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_12_meetings.png" alt="Quản lý cuộc họp">
        <figcaption><strong>Hình 20.1:</strong> Sổ Quản trị Lịch biểu Cuộc họp & Tiến độ Sinh hoạt Ban Chuyên môn</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_12_meeting_create_modal.png" alt="Modal tạo cuộc họp">
        <figcaption><strong>Hình 20.2:</strong> Hộp thoại Thiết lập Chương trình Cuộc họp & Phát hành Giấy Mời</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 21 -->
  <section class="trn-section" id="crm-c21">
    <span class="trn-tag">CHƯƠNG 21 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Trị Tài Chính, Sổ Quỹ Thu Chi & Niên Liễm Hiệp Hội</h2>
    <span class="trn-h3">Kiểm soát dòng tiền minh bạch, tự động đối soát giao dịch và xuất báo cáo tài chính</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp Ban Tài chính và Ban Kiểm soát theo dõi chặt chẽ nguồn kinh phí hoạt động; quản lý chi tiết danh sách hội viên đã đóng hoặc còn nợ niên liễm, lập phiếu thu chi và xuất báo cáo kiểm toán rõ ràng.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/fees</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Quản trị Tài chính:</div>
    <ol class="trn-steps">
      <li>Xem bảng theo dõi <strong>Niên Liễm Hội Viên</strong> theo từng năm tài chính (Đã đóng / Chưa đóng / Hết hạn).</li>
      <li>Bấm nút <em>"Gửi nhắc phí"</em> để hệ thống tự động gửi thông báo lịch sự kèm mã VietQR đến những hội viên đến hạn đóng phí.</li>
      <li>Ghi nhận phiếu thu/chi thủ công (cho các khoản tài trợ kim cương, chi phí thuê hội trường sự kiện, hoạt động thiện nguyện...).</li>
      <li>Bấm <strong>"Xuất Báo Cáo Excel"</strong> để phục vụ công tác báo cáo trước Đại hội thường niên.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_13_fees.png" alt="Quản lý niên liễm tài chính">
        <figcaption><strong>Hình 21.1:</strong> Bảng Quản trị Dòng tiền, Quỹ Niên liễm & Trạng thái Đóng phí Hội viên</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 22 -->
  <section class="trn-section" id="crm-c22">
    <span class="trn-tag">CHƯƠNG 22 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Lý Chợ Giao Thương B2B & Phê Duyệt Sản Phẩm</h2>
    <span class="trn-h3">Kiểm soát chất lượng hàng hóa, gian hàng điện tử và kết nối cung cầu chuỗi giá trị</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Bảo đảm uy tín của sàn thương mại nội bộ CLB; Ban Xúc tiến Thương mại có thẩm quyền duyệt hoặc từ chối các sản phẩm không đạt tiêu chuẩn chất lượng, hàng nhái hoặc không phù hợp với văn hóa hiệp hội.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/marketplace</code>
    </div>

    <div class="trn-sec-title">1. Thao tác Kiểm duyệt Hàng hóa:</div>
    <ol class="trn-steps">
      <li>Vào mục <strong>Chợ Giao Thương (Marketplace)</strong>.</li>
      <li>Xem danh sách các sản phẩm do hội viên gửi lên ở trạng thái <em>"Chờ duyệt"</em>.</li>
      <li>Kiểm tra hình ảnh, giá niêm yết, chứng từ kiểm định chất lượng sản phẩm.</li>
      <li>Bấm <strong>"Duyệt Đăng Tải"</strong> để đưa sản phẩm lên ứng dụng di động cho toàn bộ hội viên nhìn thấy; hoặc bấm <strong>"Từ Chối"</strong> kèm ghi chú yêu cầu bổ sung thông tin.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_14_marketplace.png" alt="Quản trị chợ B2B">
        <figcaption><strong>Hình 22.1:</strong> Bảng Kiểm duyệt Sản phẩm & Điều phối Giao thương B2B</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 23 -->
  <section class="trn-section" id="crm-c23">
    <span class="trn-tag">CHƯƠNG 23 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Quản Trị Khảo Sát & Thiết Lập Cuộc Bầu Cử Trực Tuyến (Voting Polls)</h2>
    <span class="trn-h3">Khởi tạo hòm phiếu điện tử, cấu hình thời gian mở/đóng và xuất biên bản kiểm phiếu</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Phục vụ Ban Kiểm phiếu trong các kỳ Đại hội; thiết lập các hòm phiếu kín hoặc công khai, chỉ định danh sách ứng cử viên, ấn định thời gian mở cổng và đóng cổng bầu cử chính xác từng giây.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/voting</code>
    </div>

    <div class="trn-sec-title">1. Hướng dẫn Khởi tạo & Điều hành Hòm phiếu:</div>
    <ol class="trn-steps">
      <li>Bấm <strong>"+ Tạo Cuộc Thăm Dò / Bầu Cử Mới"</strong>.</li>
      <li>Nhập Tiêu đề bầu cử, Mô tả thể lệ, Thời gian bắt đầu và kết thúc bỏ phiếu.</li>
      <li>Thêm danh sách các lựa chọn hoặc hồ sơ ứng viên (Kèm ảnh và trích ngang lý lịch).</li>
      <li>Bấm <strong>"Mở Bỏ Phiếu"</strong> khi Chủ tọa tuyên bố bắt đầu.</li>
      <li>Khi hết giờ: Bấm <strong>"Khóa Hòm Phiếu"</strong> và bấm <strong>"Xuất Biên Bản Kiểm Phiếu"</strong> để trình ký biên bản trước Đại hội.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_15_voting.png" alt="Quản trị biểu quyết voting">
        <figcaption><strong>Hình 23.1:</strong> Trung tâm Thiết lập & Giám sát Kết quả Biểu quyết Bầu cử Trực tuyến</figcaption>
      </div>
    </div>
  </section>

  <!-- CHƯƠNG 24 -->
  <section class="trn-section" id="crm-c24">
    <span class="trn-tag">CHƯƠNG 24 · PHÂN HỆ QUẢN TRỊ CRM</span>
    <h2 class="trn-h2">Kho Tài Liệu, Biểu Mẫu Pháp Lý & Văn Bản Hiệp Hội</h2>
    <span class="trn-h3">Lưu trữ số hóa toàn diện quy chế hoạt động, nghị quyết nhiệm kỳ và biểu mẫu chuẩn</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Xây dựng thư viện tri thức và pháp lý vững chắc cho hiệp hội; giúp mọi hội viên và ban lãnh đạo có thể dễ dàng tra cứu Điều lệ CLB, Quy chế tài chính, Mẫu đơn đăng ký, Hợp đồng hợp tác chuẩn mẫu bất cứ lúc nào.
    </div>

    <div class="trn-path">
      <strong>Đường dẫn truy cập:</strong> <code>https://crm.ceo1983.viconnect.vn/documents</code>
    </div>

    <div class="trn-sec-title">1. Quy trình Lưu trữ & Khai thác Tài liệu:</div>
    <ol class="trn-steps">
      <li>Xem cây danh mục tài liệu phân cấp: <em>Quy chế & Điều lệ</em>, <em>Nghị quyết Ban Chấp hành</em>, <em>Biểu mẫu & Hợp đồng mẫu</em>, <em>Kỷ yếu Đại hội</em>.</li>
      <li>Tải lên tệp tài liệu mới (Hỗ trợ PDF, Word, Excel, PowerPoint dung lượng tối đa 50MB/tệp).</li>
      <li>Phân quyền xem tài liệu: <em>Công khai toàn thể hội viên</em> hoặc <em>Chỉ dành riêng cho Ủy viên Ban Chấp hành</em>.</li>
      <li>Hội viên có thể bấm <strong>"Tải về"</strong> hoặc <strong>"Xem trực tuyến"</strong> ngay trên trình duyệt mà không cần cài đặt phần mềm ngoài.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="screenshots/crm_16_documents.png" alt="Kho tài liệu số">
        <figcaption><strong>Hình 24.1:</strong> Kho Lưu trữ Số hóa Văn bản Pháp lý & Biểu mẫu Hoạt động Hiệp hội</figcaption>
      </div>
    </div>
  </section>

  <!-- PHẦN KẾT THÚC TÀI LIỆU -->
  <div class="doc-end">
    <div><strong>CLB DOANH NHÂN CEO 1983 (HanoiBA)</strong> · Hướng dẫn sử dụng chuẩn hóa v6.0</div>
    <div>Biên soạn & Thiết kế kỹ thuật bởi VIBE TEAM · Trang cuối tài liệu</div>
  </div>

</article>

</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent, 'utf-8');
console.log('>>> ĐÃ XUẤT THÀNH CÔNG TÀI LIỆU HDSD CHUẨN HÓA VÀO: ' + outputFile);
