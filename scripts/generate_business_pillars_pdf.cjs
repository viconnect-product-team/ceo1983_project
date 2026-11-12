const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');
const ARTIFACT_DIR = 'C:/Users/vumik/.gemini/antigravity/brain/0e32a425-b92e-400f-a8ea-9f03becd5214';

function generateComprehensiveHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>BÁO CÁO TOÀN DIỆN LUỒNG NGHIỆP VỤ & PHÂN QUYỀN HỆ SINH THÁI CEO 1983</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 14mm 12mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 9pt;
    }

    .page {
      page-break-after: always;
      position: relative;
      padding-bottom: 6px;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* HEADER BANNER */
    .doc-header {
      border-bottom: 2px solid #003B95;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-size: 12pt;
      font-weight: 900;
      color: #003B95;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sub-brand {
      font-size: 7.5pt;
      color: #b45309;
      font-weight: 700;
      text-transform: uppercase;
    }

    .doc-meta {
      text-align: right;
      font-size: 7.5pt;
      color: #475569;
    }

    /* COVER TITLE */
    .report-title-box {
      background: linear-gradient(135deg, #002255 0%, #003B95 60%, #1e40af 100%);
      color: #ffffff;
      padding: 16px 18px;
      border-radius: 12px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(0, 59, 149, 0.15);
      border-left: 6px solid #f59e0b;
    }

    .report-title-box h1 {
      font-size: 15pt;
      font-weight: 900;
      line-height: 1.3;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .report-title-box p {
      font-size: 8.5pt;
      color: #cbd5e1;
      font-weight: 500;
    }

    .badge-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .pill-badge {
      display: inline-block;
      padding: 2.5px 8px;
      border-radius: 99px;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .pill-gold { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .pill-blue { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .pill-emerald { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
    .pill-red { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .pill-purple { background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }

    /* SECTION STYLES */
    h2 {
      font-size: 11pt;
      font-weight: 800;
      color: #003B95;
      margin: 12px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      border-left: 4px solid #f59e0b;
      padding-left: 8px;
      text-transform: uppercase;
    }

    h3 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 8px 0 4px 0;
    }

    p {
      margin-bottom: 6px;
      text-align: justify;
    }

    /* CARD CONTAINER */
    .pillar-card {
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 5px;
    }

    .card-title {
      font-size: 10pt;
      font-weight: 800;
      color: #003B95;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* PROCESS STEP LIST */
    .step-list {
      list-style: none;
      margin-left: 0;
      padding-left: 0;
      margin-bottom: 6px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 8.5pt;
    }

    .step-number {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #003B95;
      color: #ffffff;
      font-size: 7pt;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-content {
      flex: 1;
    }

    .step-content strong {
      color: #0f172a;
    }

    /* FEATURE GRID */
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .feature-item {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
    }

    .feature-item-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #003B95;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 3px;
    }

    .feature-item-desc {
      font-size: 8pt;
      color: #475569;
      line-height: 1.4;
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 8pt;
    }

    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-align: left;
      padding: 5px 7px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 7.5pt;
    }

    td {
      padding: 5px 7px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* CALLOUT BOX */
    .callout {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #003B95;
      border-radius: 6px;
      padding: 7px 10px;
      margin: 6px 0;
      font-size: 8pt;
    }

    .callout-amber {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
    }

    .callout-emerald {
      background: #ecfdf5;
      border: 1px solid #d1fae5;
      border-left: 4px solid #10b981;
    }

    .callout-title {
      font-weight: 800;
      margin-bottom: 3px;
      font-size: 8.5pt;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .callout-blue .callout-title { color: #003B95; }
    .callout-amber .callout-title { color: #b45309; }
    .callout-emerald .callout-title { color: #047857; }

    /* GRID COLS */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .stat-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      background: #ffffff;
    }

    .stat-val {
      font-size: 12pt;
      font-weight: 900;
      color: #003B95;
    }

    .stat-lbl {
      font-size: 7pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    /* FOOTER SIGNATURE */
    .signature-section {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }

    .sig-box {
      width: 45%;
      text-align: center;
    }

    .sig-box .role {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
    }

    .sig-box .sub {
      font-size: 7.5pt;
      color: #64748b;
      margin-bottom: 40px;
    }

    .sig-box .name {
      font-size: 9.5pt;
      font-weight: 800;
      color: #003B95;
    }
  </style>
</head>
<body>

  <!-- ==================== TRANG 1 ==================== -->
  <div class="page">
    <div class="doc-header">
      <div>
        <div class="brand-title">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="sub-brand">HỘI DOANH NHÂN TRẺ HÀ NỘI • HỆ THỐNG KẾT NỐI KINH DOANH SỐ</div>
      </div>
      <div class="doc-meta">
        <div><strong>Mã tài liệu:</strong> BC-CEO1983-MASTER-OPS</div>
        <div><strong>Thời gian xuất bản:</strong> 12/11/2026</div>
        <div><strong>Phiên bản:</strong> 5.2 (Comprehensive Architecture)</div>
      </div>
    </div>

    <div class="report-title-box">
      <h1>BÁO CÁO ĐẶC TẢ LUỒNG NGHIỆP VỤ TOÀN DIỆN<br/>KẾT NỐI, PHÂN QUYỀN & CHỨC NĂNG HỘI VIÊN CEO 1983</h1>
      <p>Cẩm nang vận hành chi tiết: Sự Kiện, Gặp Gỡ Kết Nối 1-on-1, Trao Cơ Hội B2B, Ưu Đãi Đặc Quyền, Sàn Thương Mại, Ma Trận Phân Quyền RBAC và 10 Quyền Năng Của Hội Viên Khi Đăng Nhập App.</p>
      <div class="badge-bar">
        <span class="pill-badge pill-gold">04 Trụ Cột Vận Hành</span>
        <span class="pill-badge pill-blue">Gặp Gỡ Kết Nối 1-on-1</span>
        <span class="pill-badge pill-emerald">Ma Trận Phân Quyền RBAC</span>
        <span class="pill-badge pill-purple">10 Quyền Năng Hội Viên</span>
        <span class="pill-badge pill-red">Chuẩn 9 Trường Thư Mời</span>
      </div>
    </div>

    <h2>1. TỔNG QUAN CHU TRÌNH GIÁ TRỊ KHÉP KÍN TRONG HỆ SINH THÁI</h2>
    <p>Hệ sinh thái số CLB Doanh Nhân CEO 1983 (HanoiBA) được thiết kế khép kín nhằm thúc đẩy chu chuyển dòng tiền, niềm tin và năng lực giữa các doanh nghiệp hội viên cùng năm sinh 1983. Mọi điểm chạm đều có mục tiêu gia tăng doanh thu và gắn kết bền vững:</p>

    <div class="grid-2">
      <div class="stat-box">
        <div class="stat-val">100+ Doanh Nhân</div>
        <div class="stat-lbl">Hội viên chính thức cùng khóa 1983</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Đa Kênh Tự Động</div>
        <div class="stat-lbl">Realtime Socket.IO & Zalo OA ZBS</div>
      </div>
    </div>

    <div class="callout callout-amber">
      <div class="callout-title">🔄 Chu Trình 5 Bước Tuần Hoàn:</div>
      <p style="margin-bottom:0;">
        <strong>(1) Sự kiện & Họp Ban:</strong> Phễu đón tiếp, gặp gỡ trực tiếp, nhận diện nhu cầu ➔ 
        <strong>(2) Gặp Gỡ 1-on-1:</strong> Kết nối sâu, thấu hiểu năng lực cốt lõi và sản phẩm của nhau ➔ 
        <strong>(3) Trao Cơ Hội B2B:</strong> Chia sẻ gói thầu, nhu cầu mua sắm và tìm kiếm đối tác liên kết ➔ 
        <strong>(4) Sàn TMĐT & Ưu Đãi:</strong> Thẩm định gian hàng số (max 5 SP/DN) và áp dụng voucher chiết khấu độc quyền ➔ 
        <strong>(5) Chốt Deal & Vinh Danh:</strong> Ghi nhận doanh số B2B thực tế trên Bảng Vàng và tái đầu tư vào các sự kiện tiếp theo.
      </p>
    </div>

    <h2>2. TRỤ CỘT 1: LUỒNG NGHIỆP VỤ SỰ KIỆN, HỌP BAN & CHECK-IN VÉ QR</h2>
    <p><strong>Mã Node:</strong> <code>[NODE-CRM-007]</code>, <code>[NODE-CRM-008]</code>, <code>[NODE-APP-003]</code>, <code>[NODE-APP-008]</code>.</p>
    
    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">A. Khởi Tạo Sự Kiện & Phát Thanh Đa Kênh Chuẩn 9 Trường</span>
        <span class="pill-badge pill-blue">Phân hệ Quản trị CRM</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>Tạo Sự Kiện & Upload Banner Thật:</strong> Ban Quản trị mở EventWizard trên CRM, nhập đầy đủ Tên, Chủ đề, Thời gian, Địa điểm, Sức chứa, Hạng vé. Upload banner thật độ nét cao lên máy chủ lưu trữ lâu dài.</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Mẫu thông báo chuẩn đúng 9 trường bắt buộc:</strong> (1) Lời chào; (2) Lời mời; (3) Tên hoạt động; (4) Thông tin chi tiết: Diễn giả, Nội dung chính, Thời gian, Địa điểm, Chi phí, Google Maps, Trang phục, Gửi xe, Lưu ý quan trọng; (5) Link xác nhận; (6) Hotline BTC (0973.205.683 / 0903.205.683 / 0903.203.204); (7) Lời kết.</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Chuyển đổi ngữ cảnh tự động:</strong> Khi chọn loại hình (Sự kiện, Cuộc họp, Cuộc gặp, Chương trình đào tạo), câu chữ trên template tự động chuyển đổi đồng bộ.</div>
        </li>
        <li class="step-item">
          <div class="step-number">4</div>
          <div class="step-content"><strong>Gửi tin đa kênh:</strong> Gửi đồng thời qua Email HTML, Zalo OA ZBS qua SĐT, thông báo đẩy In-App và tự động tạo bài viết đính kèm poster lên Bảng tin Mạng lưới Mobile.</div>
        </li>
      </ul>
    </div>

    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">B. Luồng Đăng Ký Công Khai & Quét Mã QR Cổng Tiếp Đón</span>
        <span class="pill-badge pill-emerald">Khách ngoài & Hội viên</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>Hội viên trong App:</strong> Bấm "Đăng ký 1 chạm" tại banner trang chủ ➔ Cấp ngay vé điện tử kèm mã QR check-in.</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Khách Mời Ngoài (Public Link):</strong> Mở link công khai <code>/guest-event-register/:id</code> (không ép đăng nhập), nhập Họ tên, SĐT, Doanh nghiệp ➔ Nhận vé QR tức thì trên trình duyệt.</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Quét mã QR tại cổng:</strong> Lễ tân quét QR qua camera trên App/Web ➔ Đổi trạng thái "Đã check-in" và nhảy số người tham dự Realtime trên CRM Dashboard.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ==================== TRANG 2 ==================== -->
  <div class="page">
    <div class="doc-header">
      <div>
        <div class="brand-title">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="sub-brand">HỘI DOANH NHÂN TRẺ HÀ NỘI • HỆ THỐNG KẾT NỐI KINH DOANH SỐ</div>
      </div>
      <div class="doc-meta">
        <div><strong>Mã tài liệu:</strong> BC-CEO1983-MASTER-OPS</div>
        <div><strong>Thời gian xuất bản:</strong> 12/11/2026</div>
      </div>
    </div>

    <h2>3. LUỒNG NGHIỆP VỤ GẶP GỠ KẾT NỐI 1-ON-1 & LỊCH HOẠT ĐỘNG THỜI GIAN THỰC</h2>
    <p><strong>Mã Node:</strong> <code>[NODE-APP-008]</code>, <code>[NODE-APP-017]</code>, <code>[NODE-CRM-008]</code>.</p>
    
    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">A. Luồng Đặt Lịch & Xác Nhận Cuộc Gặp 1-on-1 Giữa 2 Doanh Nhân</span>
        <span class="pill-badge pill-purple">Kết nối sâu 1-on-1</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>Khởi xướng cuộc gặp:</strong> Hội viên mở Danh bạ hoặc Trang cá nhân của đồng môn muốn kết nối ➔ Bấm nút "Hẹn gặp 1-on-1".</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Thiết lập thông tin buổi hẹn:</strong> Nhập Chủ đề trao đổi (VD: "Tìm hiểu hợp tác phân phối độc quyền", "Tư vấn cấu trúc thuế công ty mẹ"), Thời gian dự kiến, Địa điểm (Trụ sở CLB CEO 1983, Văn phòng đối tác hoặc Cafe Connect).</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Thông báo & Phê duyệt lịch hẹn:</strong> Đối tác nhận thông báo đẩy và tin nhắn Zalo OA ➔ Chọn "Xác nhận đồng ý", "Đề xuất đổi giờ", hoặc "Từ chối khéo".</div>
        </li>
        <li class="step-item">
          <div class="step-number">4</div>
          <div class="step-content"><strong>Đồng bộ Lịch hoạt động & Nhắc hẹn tự động:</strong> Cuộc gặp tự động đưa vào <code>/association/calendar</code>. Bộ máy <em>Active Reminder Engine</em> tự động thông báo nhắc hẹn trước 1 ngày, 1 giờ và 15 phút.</div>
        </li>
        <li class="step-item">
          <div class="step-number">5</div>
          <div class="step-content"><strong>Chuyển hóa sau cuộc gặp:</strong> Sau buổi gặp, hai bên có thể ghi chú nhật ký kết nối và bấm "Tạo Cơ Hội B2B" nếu phát sinh hợp tác kinh doanh.</div>
        </li>
      </ul>
    </div>

    <h2>4. TRỤ CỘT 2: LUỒNG NGHIỆP VỤ TRAO ĐỔI CƠ HỘI GIAO THƯƠNG B2B</h2>
    <p><strong>Mã Node:</strong> <code>[NODE-CRM-002]</code>, <code>[NODE-APP-005]</code>, <code>[NODE-APP-006]</code>.</p>
    
    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">Chu Trình Khép Kín Của Một Cơ Hội Giao Thương</span>
        <span class="pill-badge pill-gold">Triết lý Cho Là Nhận</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>Đăng cơ hội mới:</strong> Hội viên đăng gói thầu / nhu cầu: Tiêu đề, Giá trị dự kiến (đơn vị Triệu đ / Tỷ đ), Ngành nghề, Thời hạn chào thầu, Yêu cầu năng lực.</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Hiển thị Realtime trên Trang chủ:</strong> Widget <code>HomeOpportunityRowWidget</code> cập nhật 3 chỉ số tài chính: (1) Tổng số cơ hội đang mở, (2) Tổng giá trị cơ hội đang mở, (3) Tổng giá trị Deal đã chốt thành công.</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Nhận kết nối 1 chạm:</strong> Hội viên phù hợp bấm "Nhận kết nối", hệ thống mở kết nối trực tiếp (Chat DM nội bộ, Gọi điện, Mở Zalo đối tác) và tự động tạo lịch hẹn gặp 1-on-1 trong Lịch hoạt động.</div>
        </li>
        <li class="step-item">
          <div class="step-number">4</div>
          <div class="step-content"><strong>Chốt Deal & Đối soát doanh thu:</strong> Khi ký kết hợp đồng, hai bên bấm "Xác nhận chốt Deal thành công" kèm giá trị thực tế. Dữ liệu tự động cộng dồn vào Doanh thu Giao thương CLB và vinh danh Top Giver / Top Receiver.</div>
        </li>
      </ul>
    </div>

    <h2>5. TRỤ CỘT 3: LUỒNG NGHIỆP VỤ ƯU ĐÃI & ĐẶC QUYỀN HỘI VIÊN</h2>
    <p><strong>Mã Node:</strong> <code>[NODE-CRM-009]</code>, <code>[NODE-APP-005]</code>, <code>[NODE-APP-013]</code>.</p>
    
    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">Cơ Chế Vận Hành Ưu Đãi & Voucher QR Động</span>
        <span class="pill-badge pill-emerald">Đặc quyền nội khối</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>2 Nguồn ưu đãi:</strong> (a) Đặc quyền đối tác chiến lược do CLB đàm phán ký kết (Khách sạn 5*, Golf, Hàng không); (b) Ưu đãi nội khối do chính doanh nghiệp hội viên tài trợ chiết khấu chéo cho đồng môn.</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Đăng ưu đãi mới & Đẩy lên đầu slide:</strong> Hội viên mở Modal đăng ưu đãi. Ngay khi lưu thành công, hệ thống phát sự kiện <code>vba:member_custom_perk_created</code> và đẩy ưu đãi mới lên đầu Carousel trang chủ.</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Lưu ưu đãi & Cấp Voucher QR:</strong> Khi hội viên bấm "LƯU", ưu đãi chuyển vào ví cá nhân. Hệ thống tự động mở Modal hiển thị: Mã số voucher độc quyền (<code>CEO1983-PROMO-...</code>), Mã QR động, Điều kiện áp dụng và Nút dẫn đường Google Maps 1 chạm tới cơ sở kinh doanh.</div>
        </li>
        <li class="step-item">
          <div class="step-number">4</div>
          <div class="step-content"><strong>Áp dụng tại điểm bán:</strong> Hội viên xuất trình mã QR hoặc đọc mã voucher tại quầy đối tác để được áp dụng mức giá chiết khấu đã cam kết.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ==================== TRANG 3 ==================== -->
  <div class="page">
    <div class="doc-header">
      <div>
        <div class="brand-title">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="sub-brand">HỘI DOANH NHÂN TRẺ HÀ NỘI • HỆ THỐNG KẾT NỐI KINH DOANH SỐ</div>
      </div>
      <div class="doc-meta">
        <div><strong>Mã tài liệu:</strong> BC-CEO1983-MASTER-OPS</div>
        <div><strong>Thời gian xuất bản:</strong> 12/11/2026</div>
      </div>
    </div>

    <h2>6. TRỤ CỘT 4: LUỒNG NGHIỆP VỤ SÀN THƯƠNG MẠI B2B NỘI BỘ</h2>
    <p><strong>Mã Node:</strong> <code>[NODE-CRM-010]</code>, <code>[NODE-APP-007]</code>.</p>
    
    <div class="pillar-card">
      <div class="card-header">
        <span class="card-title">Mô Hình Gian Hàng Doanh Nghiệp & Quy Định Chống Spam</span>
        <span class="pill-badge pill-red">Giới hạn tối đa 5 SP/DN</span>
      </div>
      <ul class="step-list">
        <li class="step-item">
          <div class="step-number">1</div>
          <div class="step-content"><strong>Quy định khắt khe 5 sản phẩm:</strong> Mỗi doanh nghiệp hội viên chỉ được phép niêm yết tối đa 5 sản phẩm/dịch vụ mũi nhọn nhất. Quy tắc này triệt tiêu tình trạng spam bán hàng, nâng cao chất lượng sàn giao thương.</div>
        </li>
        <li class="step-item">
          <div class="step-number">2</div>
          <div class="step-content"><strong>Thiết lập Gian hàng số:</strong> Hội viên nhập Tên sản phẩm, Ngành nghề, Giá niêm yết, Giá ưu đãi riêng cho CEO 1983, Thông số kỹ thuật, Hồ sơ năng lực PDF và Cam kết bảo hành.</div>
        </li>
        <li class="step-item">
          <div class="step-number">3</div>
          <div class="step-content"><strong>Khám phá & Bộ lọc phân ban:</strong> Hội viên trên toàn mạng lưới lọc sản phẩm theo phân ban ngành nghề. Banner trang chủ hiển thị tổng số lượng sản phẩm và tổng giá trị gói thầu đang niêm yết.</div>
        </li>
        <li class="step-item">
          <div class="step-number">4</div>
          <div class="step-content"><strong>Hỏi mua & Chuyển đổi thành Cơ hội B2B:</strong> Mỗi sản phẩm tích hợp sẵn 3 nút: Gọi điện hotline, Nhắn tin Zalo và Chat bảo mật. Khi thống nhất hợp tác, giao dịch được chuyển thành 1 Cơ hội B2B để quản lý tiến độ hợp đồng.</div>
        </li>
      </ul>
    </div>

    <h2>7. MA TRẬN PHÂN QUYỀN TÀI KHOẢN RBAC & BẢO MẬT HỆ THỐNG</h2>
    <p>Hệ thống CEO 1983 thiết lập ma trận kiểm soát truy cập nghiêm ngặt dựa trên vai trò (Role-Based Access Control):</p>

    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Vai Trò (Role)</th>
          <th style="width: 22%;">Giao Diện & Quyền Hạn</th>
          <th style="width: 32%;">Nghiệp Vụ Được Phép Thực Hiện</th>
          <th style="width: 28%;">Ràng Buộc Bảo Mật</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Chủ Tịch CLB / BQT</strong><br/><code>admin</code>, <code>chu_tich</code></td>
          <td>Web CRM & Mobile App (Toàn quyền hệ thống)</td>
          <td>Duyệt kết nạp hội viên, phê duyệt sự kiện, mở phiên biểu quyết, điều hành ngân sách thu chi, cấu hình Zalo OA ZBS.</td>
          <td>Bảo mật 2 lớp, giám sát mọi hoạt động qua Nhật ký Kiểm toán hệ thống.</td>
        </tr>
        <tr>
          <td><strong>Ban Thư Ký CLB</strong><br/><code>thu_ky</code></td>
          <td>Web CRM Quản Trị & Mobile App</td>
          <td>Soạn thảo thông báo, gửi thư mời đa kênh, quét mã QR check-in tại cổng, điểm danh đại biểu, quản lý tài liệu.</td>
          <td>Không can thiệp vào tài chính duyệt chi hoặc phân quyền tài khoản khác.</td>
        </tr>
        <tr>
          <td><strong>Kế Toán / Kiểm Soát</strong><br/><code>ke_toan</code>, <code>kiem_soat</code></td>
          <td>Web CRM (Phân hệ Tài chính)</td>
          <td>Theo dõi sổ quỹ thu chi niên liễm, quản lý hóa đơn/biên lai, xuất báo cáo tài chính kiểm toán A4/Excel.</td>
          <td>Chỉ có quyền đọc & ghi dữ liệu thu chi, không sửa đổi dữ liệu hội viên.</td>
        </tr>
        <tr>
          <td><strong>Trưởng / Phó Ban Chuyên Môn</strong><br/><code>truong_ban</code></td>
          <td>Web CRM & Mobile App</td>
          <td>Tổ chức cuộc họp phân ban, phê duyệt cơ hội giao thương nội bộ ban, điều phối hoạt động thành viên trong ban.</td>
          <td>Phân quyền theo phạm vi Ban sinh hoạt trực thuộc.</td>
        </tr>
        <tr>
          <td><strong>Hội Viên Chính Thức</strong><br/><code>member</code></td>
          <td>CEO 1983 Mobile App</td>
          <td>Toàn quyền sử dụng 10 tính năng hội viên: Danh thiếp số, Danh bạ, Cơ hội B2B, Ưu đãi, Sàn TMĐT, Lịch hẹn 1-on-1, Biểu quyết.</td>
          <td>Chỉ chỉnh sửa được hồ sơ cá nhân và sản phẩm gian hàng của công ty mình.</td>
        </tr>
        <tr>
          <td><strong>Hội Viên Tạm Khóa / Nợ Phí</strong><br/><code>unpaid</code>, <code>inactive</code></td>
          <td>Mobile App (Hạn chế)</td>
          <td>Chỉ được xem danh bạ và nhận cảnh báo nợ phí niên liễm kèm mã QR Napas247 để đóng tiền.</td>
          <td>Khóa quyền đăng bài sàn thương mại, tạm dừng nhận cơ hội giao thương B2B mới.</td>
        </tr>
        <tr>
          <td><strong>Khách Mời / Đại Biểu Ngoài</strong><br/><code>guest</code></td>
          <td>Trang Web Public</td>
          <td>Đăng ký tham gia sự kiện công khai, quét mã danh thiếp số công khai của hội viên.</td>
          <td>Tuyệt đối không truy cập vào danh bạ nội bộ, SĐT/Email bị ẩn theo quyền riêng tư.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== TRANG 4 ==================== -->
  <div class="page">
    <div class="doc-header">
      <div>
        <div class="brand-title">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="sub-brand">HỘI DOANH NHÂN TRẺ HÀ NỘI • HỆ THỐNG KẾT NỐI KINH DOANH SỐ</div>
      </div>
      <div class="doc-meta">
        <div><strong>Mã tài liệu:</strong> BC-CEO1983-MASTER-OPS</div>
        <div><strong>Thời gian xuất bản:</strong> 12/11/2026</div>
      </div>
    </div>

    <h2>8. ĐẶC TẢ CHI TIẾT 10 QUYỀN NĂNG CỦA HỘI VIÊN KHI ĐĂNG NHẬP APP</h2>
    <p>Khi đăng nhập vào ứng dụng di động <strong>CEO 1983 Mobile App</strong>, hội viên chính thức được trao toàn quyền sử dụng bộ công cụ kết nối kinh doanh toàn năng:</p>

    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-item-title">1. Thẻ Doanh Nhân Số & NFC Thông Minh</div>
        <div class="feature-item-desc">Sở hữu thẻ danh thiếp điện tử mạ vàng tích hợp mã QR định danh duy nhất. Chạm NFC 1 chạm để chia sẻ thông tin. Tùy chọn ẩn/hiện SĐT, Email bảo mật trong Modal Sửa Thẻ.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">2. Trang Chủ Cá Nhân Hóa & Đổi Theme Màu</div>
        <div class="feature-item-desc">Tự do tùy biến 4 phím tắt nhanh mặc định. Đổi màu giao diện theo 5 bộ theme nhận diện thương hiệu (Cam Tiên Phong, Xanh Doanh Nhân Navy, Đỏ Nhiệt Huyết, Vàng Hoàng Gia, Xanh Ngọc).</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">3. Danh Bạ CEO 1983 & Tra Cứu 360°</div>
        <div class="feature-item-desc">Tra cứu hồ sơ hơn 100+ CEO đồng môn theo ngành nghề, phân ban. Xem thông tin công ty, địa chỉ trụ sở có bản đồ GPS dẫn đường, gọi hotline hoặc mở chat Zalo 1 chạm.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">4. Đặt Lịch Hẹn Giao Thương 1-on-1</div>
        <div class="feature-item-desc">Khởi tạo lời mời hẹn gặp 1-on-1 với đồng môn. Tự động đồng bộ lịch vào Lịch hoạt động và gửi thông báo nhắc hẹn trước 15 phút, 1 giờ, 1 ngày qua Push và Zalo.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">5. Đăng & Nhận Cơ Hội Kinh Doanh B2B</div>
        <div class="feature-item-desc">Đăng các gói thầu, nhu cầu tìm đối tác cung ứng. Nhận kết nối trực tiếp từ đồng môn, chốt deal và cộng dồn giá trị hợp đồng vào Bảng Vàng Doanh Thu của CLB.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">6. Sở Hữu Gian Hàng Sàn Thương Mại Nội Bộ</div>
        <div class="feature-item-desc">Niêm yết tối đa 5 sản phẩm/dịch vụ chủ lực kèm chính sách giá ưu đãi độc quyền. Nhận liên hệ hỏi mua và chuyển đổi trực tiếp thành cơ hội hợp đồng B2B.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">7. Trung Tâm Ưu Đãi & Đổi Voucher QR Động</div>
        <div class="feature-item-desc">Đăng ưu đãi độc quyền của công ty mình lên đầu Carousel Trang chủ. Lưu ưu đãi của đối tác vào ví cá nhân, lấy mã QR động sử dụng tại quầy dịch vụ (Golf, Khách sạn...).</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">8. Đăng Ký Sự Kiện & Check-in Vé Điện Tử</div>
        <div class="feature-item-desc">Đăng ký tham gia các sự kiện Gala, tọa đàm chỉ với 1 chạm. Hệ thống cấp vé mời điện tử có mã QR check-in tại cửa và đồng bộ lịch trình Agenda chi tiết.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">9. Tham Gia Biểu Quyết Trực Tuyến (Voting)</div>
        <div class="feature-item-desc">Bỏ phiếu trực tuyến các nghị quyết Đại hội, thông qua báo cáo tài chính, biểu quyết chính sách CLB với tỷ lệ tán thành cập nhật thời gian thực chống gian lận.</div>
      </div>
      <div class="feature-item">
        <div class="feature-item-title">10. Mạng Lưới Feed & Quản Lý Tài Khoản</div>
        <div class="feature-item-desc">Đăng bài chia sẻ kinh doanh, bình luận dạng cây phân cấp, tag tên @ đồng môn. Cập nhật định vị GPS doanh nghiệp, đổi mật khẩu và quản lý thiết bị đăng nhập an toàn.</div>
      </div>
    </div>

    <h2>9. CAM KẾT CHẤT LƯỢNG & KÝ TÊN XÁC NHẬN</h2>
    <p>Toàn bộ 10 quyền năng trên cùng các luồng nghiệp vụ đã được triển khai thực tế trên cả hai phân hệ Cổng Quản Trị Web CRM và CEO 1983 Mobile App, vận hành trên nền CSDL PostgreSQL thật 100%, bảo mật cao và sẵn sàng phục vụ toàn diện hội viên CLB Doanh Nhân CEO 1983 (HanoiBA).</p>

    <div class="signature-section">
      <div class="sig-box">
        <div class="role">ĐẠI DIỆN BAN CÔNG NGHỆ & ĐIỀU HÀNH</div>
        <div class="sub">Hệ thống CEO 1983 Digital Ecosystem</div>
        <div class="name">PHẠM VĂN VŨ</div>
      </div>
      <div class="sig-box">
        <div class="role">TM. BAN QUẢN TRỊ CLB DOANH NHÂN CEO 1983</div>
        <div class="sub">Chủ tịch Hội đồng Quản trị / Điều hành</div>
        <div class="name">BAN QUẢN TRỊ CEO 1983</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}

async function main() {
  console.log('🚀 Đang khởi tạo tiến trình xuất bản PDF Báo Cáo Toàn Diện (4 Trang A4)...');
  
  if (!fs.existsSync(DOC_DIR)) fs.mkdirSync(DOC_DIR, { recursive: true });
  if (!fs.existsSync(FE_DOCS_DIR)) fs.mkdirSync(FE_DOCS_DIR, { recursive: true });
  if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const htmlContent = generateComprehensiveHtml();
  const htmlPath = path.join(DOC_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✓ Đã tạo file HTML:', htmlPath);

  // Khởi động Chrome hệ thống để render PDF
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  const pdfPath = path.join(DOC_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b; width: 100%; text-align: right; padding-right: 12mm;">
        Trang <span class="pageNumber"></span> / <span class="totalPages"></span> • CLB Doanh Nhân CEO 1983 (HanoiBA)
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm',
    },
  });

  await browser.close();
  console.log('✓ Đã xuất bản file PDF thành công:', pdfPath);

  // Đồng bộ sang thư mục public/docs của Frontend
  const fePdfPath = path.join(FE_DOCS_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.pdf');
  const feHtmlPath = path.join(FE_DOCS_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.html');
  fs.copyFileSync(pdfPath, fePdfPath);
  fs.copyFileSync(htmlPath, feHtmlPath);
  console.log('✓ Đã đồng bộ sang thư mục Frontend docs:', fePdfPath);

  // Đồng bộ sang thư mục Artifact của Brain
  const artifactPdfPath = path.join(ARTIFACT_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.pdf');
  const artifactHtmlPath = path.join(ARTIFACT_DIR, 'BAO_CAO_LUONG_NGHIEP_VU_4_TRU_COT_CEO1983.html');
  fs.copyFileSync(pdfPath, artifactPdfPath);
  fs.copyFileSync(htmlPath, artifactHtmlPath);
  console.log('✓ Đã đồng bộ sang Artifacts:', artifactPdfPath);

  const stats = fs.statSync(pdfPath);
  console.log(`🎉 HOÀN THÀNH XUẤT SẮC! Dung lượng PDF: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Lỗi khi xuất bản PDF:', err);
  process.exit(1);
});
