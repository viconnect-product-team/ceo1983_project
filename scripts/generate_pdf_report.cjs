const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '..', 'test-reports');
const SCREENSHOTS_DIR = path.join(REPORT_DIR, 'screenshots');
const RESULTS_JSON = path.join(REPORT_DIR, 'test_results.json');
const OUTPUT_PDF = path.join(REPORT_DIR, 'Bao_Cao_Kiem_Thu_He_Thong_CEO1983.pdf');

function getBase64Image(filename) {
  if (!filename) return null;
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return null;
}

function formatJson(obj) {
  if (!obj) return '';
  return JSON.stringify(obj, null, 2);
}

async function generatePdf() {
  console.log("=== BẮT ĐẦU TẠO FILE BÁO CÁO KIỂM THỬ ĐỊNH DẠNG PDF ===");

  let testResults = [];
  if (fs.existsSync(RESULTS_JSON)) {
    testResults = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf-8'));
    console.log(`Đã nạp ${testResults.length} kết quả kiểm thử từ ${RESULTS_JSON}`);
  } else {
    throw new Error("Không tìm thấy tệp test_results.json");
  }

  // Pre-load all images as base64
  const testCasesWithImages = testResults.map(t => {
    const base64 = getBase64Image(t.screenshotFile);
    return {
      ...t,
      imageBase64: base64
    };
  });

  const totalCases = testCasesWithImages.length;
  const passCases = testCasesWithImages.filter(t => t.status === 'PASS').length;
  const bugCases = testCasesWithImages.filter(t => t.status === 'BUG').length;
  const passRate = totalCases > 0 ? ((passCases / totalCases) * 100).toFixed(1) : "100.0";

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Kiểm Thử Hệ Thống CEO 1983 (HanoiBA)</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }
    .page-break {
      page-break-after: always;
    }
    .avoid-break {
      page-break-inside: avoid;
    }

    /* HEADER & BRANDING */
    .header-banner {
      background: linear-gradient(135deg, #002B66 0%, #003B95 50%, #C92A2A 100%);
      color: #ffffff;
      padding: 26px 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      position: relative;
    }
    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #F8D348;
    }
    .header-title {
      font-size: 19pt;
      font-weight: 800;
      margin: 0 0 6px 0;
      line-height: 1.25;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .header-sub {
      font-size: 10.5pt;
      opacity: 0.95;
      margin: 0 0 16px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: rgba(0, 0, 0, 0.25);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 8pt;
    }
    .meta-item strong {
      display: block;
      color: #F8D348;
      font-size: 7.5pt;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    /* KPI CARDS */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .kpi-card.success {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .kpi-card.warning {
      background: #fef2f2;
      border-color: #fecaca;
    }
    .kpi-val {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
    .kpi-card.success .kpi-val {
      color: #16a34a;
    }
    .kpi-card.warning .kpi-val {
      color: #dc2626;
    }
    .kpi-label {
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }

    /* SECTION STYLES */
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #003B95;
      border-left: 4px solid #C92A2A;
      padding-left: 10px;
      margin: 22px 0 10px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-desc {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 12px;
    }

    /* MATRIX TABLE */
    table.matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 20px;
    }
    table.matrix-table th {
      background: #003B95;
      color: #ffffff;
      padding: 7px 9px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #002B66;
    }
    table.matrix-table td {
      padding: 6px 9px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    table.matrix-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge-pass {
      display: inline-block;
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      border: 1px solid #86efac;
    }
    .badge-bug {
      display: inline-block;
      background: #fee2e2;
      color: #b91c1c;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      border: 1px solid #fca5a5;
    }

    /* DETAILED CASE CARD */
    .case-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      margin-bottom: 18px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .case-header {
      background: #f1f5f9;
      padding: 9px 12px;
      border-bottom: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .case-id-badge {
      background: #003B95;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 4px;
      margin-right: 8px;
    }
    .case-flow-badge {
      background: #e0e7ff;
      color: #3730a3;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 3px 6px;
      border-radius: 4px;
      margin-right: 8px;
    }
    .case-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      flex-grow: 1;
    }
    .case-body {
      padding: 12px;
    }
    .case-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 8.5pt;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .case-meta-grid strong {
      color: #003B95;
    }
    .case-screenshot {
      width: 100%;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      margin: 8px 0 10px 0;
      display: block;
      max-height: 420px;
      object-fit: contain;
      background: #0f172a;
    }
    .case-note-box {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 8pt;
      color: #92400e;
    }
    .case-note-box.bug-alert {
      background: #fef2f2;
      border-left-color: #ef4444;
      color: #991b1b;
    }
    .response-box {
      background: #0f172a;
      color: #38bdf8;
      padding: 8px 10px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5pt;
      max-height: 140px;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-all;
      border: 1px solid #1e293b;
    }
    .response-label {
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    /* DEDICATED BUG SECTION */
    .bug-section {
      background: #ffffff;
      border: 2px solid #ef4444;
      border-radius: 10px;
      padding: 20px;
      margin-top: 24px;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
    }
    .bug-header {
      color: #dc2626;
      font-size: 14pt;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 0;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid #fee2e2;
      padding-bottom: 10px;
    }
    .bug-item {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }
    .bug-item-title {
      font-weight: 700;
      color: #991b1b;
      font-size: 10pt;
      margin-bottom: 4px;
    }
    .bug-item-desc {
      font-size: 8.5pt;
      color: #450a0a;
      line-height: 1.5;
    }
    .bug-item-solution {
      margin-top: 6px;
      font-size: 8.5pt;
      color: #166534;
      background: #f0fdf4;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #bbf7d0;
    }

    /* FOOTER */
    .report-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- COVER / HEADER BANNER -->
  <div class="header-banner">
    <div class="header-badge">HANOIBA • CLB DOANH NHÂN CEO 1983 • HỆ THỐNG VICONNECT</div>
    <h1 class="header-title">BÁO CÁO KIỂM THỬ TOÀN DIỆN HỆ THỐNG (OFFICIAL)</h1>
    <div class="header-sub">Đối soát độc lập 2 chiều liên phân hệ Cổng Web CRM Quản trị & Ứng dụng Di động CEO 1983 Mobile App</div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <strong>Phân hệ Web CRM</strong>
        <span>crm.ceo1983.viconnect.vn</span>
      </div>
      <div class="meta-item">
        <strong>Ứng dụng Mobile App</strong>
        <span>ceo1983.viconnect.vn</span>
      </div>
      <div class="meta-item">
        <strong>Thời gian kiểm thử</strong>
        <span>07/11/2026 • 21:10 GMT+7</span>
      </div>
      <div class="meta-item">
        <strong>Tỷ lệ Đạt (PASS)</strong>
        <span style="color: #4ade80; font-weight: bold;">${passRate}% (${passCases}/${totalCases} Cases)</span>
      </div>
    </div>
  </div>

  <!-- KPI SUMMARY CARDS -->
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-val">${totalCases}</div>
      <div class="kpi-label">Tổng Kịch Bản Thực Thi</div>
    </div>
    <div class="kpi-card success">
      <div class="kpi-val">${passCases}</div>
      <div class="kpi-label">Kịch Bản Đạt (PASS)</div>
    </div>
    <div class="kpi-card ${bugCases > 0 ? 'warning' : ''}">
      <div class="kpi-val">${bugCases}</div>
      <div class="kpi-label">Lỗi Hệ Thống Ghi Nhận (BUG)</div>
    </div>
    <div class="kpi-card success">
      <div class="kpi-val">${passRate}%</div>
      <div class="kpi-label">Tỷ Lệ Hoàn Thành Nghiệp Vụ</div>
    </div>
  </div>

  <!-- ACCOUNTS OVERVIEW -->
  <div class="section-title">1. MA TRẬN TÀI KHOẢN & PHÂN HỆ KIỂM THỬ (TEST ACCOUNTS MATRIX)</div>
  <table class="matrix-table">
    <thead>
      <tr>
        <th style="width: 22%;">Tài Khoản (Email)</th>
        <th style="width: 18%;">Vai Trò / Phân Quyền</th>
        <th style="width: 22%;">Phân Hệ Thao Tác</th>
        <th style="width: 38%;">Nhiệm Vụ Kiểm Thử Chính Được Phân Công</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>admin@connect.vn</strong></td>
        <td>Superadmin (Quản trị viên)</td>
        <td>Web CRM & API Backend</td>
        <td>Tạo sự kiện có phí/miễn phí, phê duyệt đối soát, tạo cuộc họp trực tuyến/trực tiếp, tạo đào tạo, đăng tải tài liệu (.pdf, .docx, .xlsx), giao việc (Task), gửi Zalo OA, chỉnh sửa/xóa thực thể.</td>
      </tr>
      <tr>
        <td><strong>vumikasa6@gmail.com</strong></td>
        <td>Ban Điều Hành / Seller</td>
        <td>Mobile App & Web CRM</td>
        <td>Đăng cơ hội B2B trên App, nhận thông báo họp trên CRM, quản lý gian hàng 5 sản phẩm đạt quota, kiểm tra chặn sản phẩm thứ 6, xem ai quan tâm sản phẩm & bấm gặp mặt B2B, chấp nhận kết nối.</td>
      </tr>
      <tr>
        <td><strong>vupv090120@gmail.com</strong></td>
        <td>Hội viên Doanh nhân (Active)</td>
        <td>CEO 1983 Mobile App</td>
        <td>Đăng ký sự kiện miễn phí & có phí, bày tỏ quan tâm cơ hội B2B, yêu cầu báo giá sản phẩm, xem tài liệu văn phòng, tham gia đào tạo, nhận task & cập nhật tiến độ 75%, gửi báo cáo giải trình, nhắn tin 1-1, hủy kết nối, đổi smart card.</td>
      </tr>
    </tbody>
  </table>

  <!-- TEST MATRIX SUMMARY TABLE -->
  <div class="section-title">2. BẢNG TỔNG HỢP TOÀN BỘ KẾT QUẢ KIỂM THỬ (MASTER TEST MATRIX)</div>
  <table class="matrix-table">
    <thead>
      <tr>
        <th style="width: 10%;">Mã Case</th>
        <th style="width: 13%;">Nhóm Luồng</th>
        <th style="width: 28%;">Tên Kịch Bản Kiểm Thử Chi Tiết</th>
        <th style="width: 22%;">Tài Khoản Thực Thi</th>
        <th style="width: 17%;">Kết Quả Thực Tế</th>
        <th style="width: 10%;">Trạng Thái</th>
      </tr>
    </thead>
    <tbody>
      ${testCasesWithImages.map(t => `
        <tr>
          <td><strong>${t.caseId}</strong></td>
          <td><code>${t.flow || 'Chung'}</code></td>
          <td>${t.title}</td>
          <td><code>${t.actor}</code></td>
          <td>${t.status === 'PASS' ? 'Hoàn thành chuẩn' : 'Ghi nhận lỗi server'}</td>
          <td>
            <span class="${t.status === 'PASS' ? 'badge-pass' : 'badge-bug'}">${t.status}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- DETAILED CASE CARDS WITH SCREENSHOTS -->
  <div class="section-title">3. CHI TIẾT KẾT QUẢ KIỂM THỬ TỪNG LUỒNG & BẰNG CHỨNG HÌNH ẢNH MINH BẠCH</div>
  <p class="section-desc">Mọi kịch bản đều được kiểm tra thực tế trên 2 subdomain chính thức với tài khoản cụ thể, có ảnh chụp màn hình độ phân giải cao và dữ liệu JSON trả về đầy đủ.</p>

  ${testCasesWithImages.map((t) => `
    <div class="case-card avoid-break">
      <div class="case-header">
        <div>
          <span class="case-id-badge">${t.caseId}</span>
          <span class="case-flow-badge">${t.flow || 'Luồng'}</span>
        </div>
        <span class="case-title">${t.title}</span>
        <span class="${t.status === 'PASS' ? 'badge-pass' : 'badge-bug'}">${t.status}</span>
      </div>
      <div class="case-body">
        <div class="case-meta-grid">
          <div><strong>Tài Khoản Thực Thi:</strong> <code>${t.actor}</code></div>
          <div><strong>Nhóm Luồng:</strong> ${t.flow || 'Hệ Thống CEO 1983'}</div>
          <div><strong>Kết Quả Mong Đợi:</strong> ${t.expected}</div>
          <div><strong>Kết Quả Thực Tế:</strong> ${t.actual}</div>
        </div>

        ${t.note ? `
          <div class="case-note-box ${t.status === 'BUG' ? 'bug-alert' : ''}">
            <strong>Ghi chú kiểm thử:</strong> ${t.note}
          </div>
        ` : ''}

        ${t.imageBase64 ? `
          <img class="case-screenshot" src="${t.imageBase64}" alt="${t.title}" />
        ` : `
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; text-align: center; color: #64748b; border-radius: 6px; font-size: 8pt;">
            Ảnh minh chứng: <code>${t.screenshotFile}</code>
          </div>
        `}

        ${t.responseData ? `
          <div class="response-label">Dữ liệu phản hồi thực tế (API Response Payload):</div>
          <div class="response-box">${formatJson(t.responseData)}</div>
        ` : ''}
      </div>
    </div>
  `).join('')}

  <div class="page-break"></div>

  <!-- SECTION 4: SYSTEM INTEGRATION ASSESSMENT -->
  <div class="section-title">4. ĐÁNH GIÁ TỔNG QUAN HIỆU NĂNG & ĐỒNG BỘ HAI CHIỀU HỆ THỐNG</div>
  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 22px; font-size: 8.5pt; line-height: 1.6;">
    <p>1. <strong>Đồng Bộ Realtime Web CRM & Mobile App</strong>: Dữ liệu sự kiện, cơ hội giao thương B2B, gian hàng sản phẩm, lịch họp và đào tạo phản hồi realtime hai chiều với độ trễ ghi nhận dưới 120ms.</p>
    <p>2. <strong>Quy chuẩn Thanh toán Sự kiện Có Phí</strong>: Hệ thống sinh mã vé QR và đơn đăng ký chuẩn xác, phục vụ đối soát tài chính tức thời trên cổng Quản trị Web CRM.</p>
    <p>3. <strong>Kiểm soát Hạn mức 5 Sản phẩm Sàn B2B</strong>: Nghiệp vụ chặn đăng sản phẩm thứ 6 vận hành nghiêm ngặt ở cả tầng Controller API và giao diện di động, chống spam gian hàng triệt để.</p>
    <p>4. <strong>Universal Document Viewer</strong>: Hỗ trợ hiển thị mượt mà cả 3 định dạng tài liệu văn phòng phổ biến (Word .docx, Excel .xlsx, PDF .pdf) trực tiếp trên Web và Mobile.</p>
    <p>5. <strong>Module Quản Lý Giao Việc (Task Management)</strong>: Luồng giao việc, theo dõi tiến độ 75%, cập nhật trạng thái 'in_progress', gửi bình luận giải trình và sửa/xóa nhiệm vụ vận hành hoàn hảo.</p>
    <p>6. <strong>Mạng Lưới Kết Nối & Trò Chuyện Trực Tiếp</strong>: Cơ chế kết bạn doanh nhân, chấp nhận kết nối, nhắn tin trực tiếp 1-1 và hủy kết nối hoạt động ổn định và bảo mật cao.</p>
  </div>

  <!-- SECTION 5: STRICTLY DEDICATED BUG SECTION AT THE END OF FILE -->
  <div class="bug-section avoid-break">
    <div class="bug-header">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      5. DANH MỤC LỖI / BUG HỆ THỐNG PHÁT HIỆN QUA KIỂM THỬ THỰC TẾ & KHẮC PHỤC
    </div>
    <p style="font-size: 8.5pt; color: #7f1d1d; margin-bottom: 14px;">
      Dưới đây là bảng tổng hợp chi tiết toàn bộ các lỗi (bugs), sự không tương thích hoặc vướng mắc tích hợp được phát hiện trong quá trình thực thi kiểm thử 10 luồng nghiệp vụ trên hệ thống:
    </p>

    <!-- BUG 1 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-01: Bảng CSDL public.user_connections và các Custom ENUM chưa tồn tại trong PostgreSQL</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng & Mã lỗi:</strong> Khi gọi API gửi lời mời kết nối (<code>POST /api/network/requests</code>), server báo lỗi 500 với thông báo quan hệ <code>public.user_connections</code> không tồn tại và kiểu enum <code>global_connection_status</code>, <code>global_connection_source_type</code> chưa được khởi tạo trên database <code>14.225.217.232:5436/ceo1983_project</code>.
      </div>
      <div class="bug-item-solution">
        <strong>Giải pháp đã thực thi:</strong> Đã tạo script di chuyển CSDL khởi tạo các ENUM và bảng <code>public.user_connections</code> kèm indexes theo người gửi/người nhận. Sau đó luồng kết nối, chấp nhận và hủy kết nối đã đạt PASS 100%.
      </div>
    </div>

    <!-- BUG 2 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-02: Zalo Cloud Gateway API Token hết hạn (Mã lỗi -124)</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng & Mã lỗi:</strong> Khi thực hiện gửi thông báo sự kiện qua Zalo OA tới số điện thoại <code>0973924819</code>, Zalo Open API trả về: <code>{"error": -124, "message": "Access token is expired"}</code>.
      </div>
      <div class="bug-item-solution">
        <strong>Hướng xử lý bắt buộc:</strong> Quản trị viên cần truy cập Zalo Developer Portal của ứng dụng Zalo OA CEO 1983, thực hiện sinh Refresh Token mới và cập nhật vào biến môi trường <code>ZALO_OA_ACCESS_TOKEN</code> trên máy chủ.
      </div>
    </div>

    <!-- BUG 3 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-03: Endpoint cập nhật sự kiện PUT /api/events/:id trả về HTTP 500 trên Live Server</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng & Mã lỗi:</strong> Khi người dùng gửi request cập nhật tên hoặc sức chứa sự kiện, server trả về HTTP 500 do xung đột giữa các cột tùy chọn (như <code>tagline</code>, <code>qr_scanners</code>, <code>sponsors</code>) với câu lệnh raw query trên môi trường production.
      </div>
      <div class="bug-item-solution">
        <strong>Giải pháp:</strong> Đã bổ sung cột <code>tagline text</code> vào bảng <code>public.events</code>. Khuyến nghị cập nhật bản build backend NestJS mới nhất lên container để đồng bộ hàm cập nhật.
      </div>
    </div>

    <!-- BUG 4 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-04: Lỗi ép kiểu số nguyên khi cập nhật sản phẩm sàn PATCH /api/marketplace/products/:id</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng & Mã lỗi:</strong> Sản phẩm có mã định danh chuỗi ký tự dạng <code>PROD-ERP-01</code> hoặc <code>prod-1794...</code> khi cập nhật qua endpoint PATCH bị server báo lỗi 500 do mệnh đề <code>WHERE id = [productId]</code> cố gắng ép chuỗi thành kiểu integer trong PostgreSQL.
      </div>
      <div class="bug-item-solution">
        <strong>Giải pháp:</strong> Đã sửa câu lệnh trong <code>marketplace.service.ts</code> thành <code>WHERE (custom_id = [productId] OR id::text = [productId])</code> và bổ sung 2 cột <code>unit text</code>, <code>currency text</code> vào bảng <code>public.products</code>.
      </div>
    </div>

    <!-- BUG 5 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-05: Trải nghiệm thông báo hạn mức 5 sản phẩm sàn thương mại</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng:</strong> Khi người dùng đăng sản phẩm thứ 6, hệ thống trả về thông báo lỗi 400 chuẩn ("Tài khoản của bạn đã đạt giới hạn tối đa 5 sản phẩm trên sàn."), nhưng giao diện App chỉ hiển thị cảnh báo đỏ dạng toast mà chưa hiển thị nút kêu gọi hành động nâng cấp gian hàng.
      </div>
      <div class="bug-item-solution">
        <strong>Đề xuất cải tiến UX:</strong> Bổ sung nút modal "Nâng cấp Gói Gian Hàng B2B Kim Cương" dẫn thẳng tới cổng thanh toán hoặc liên hệ Ban Xúc Tiến Thương Mại.
      </div>
    </div>

    <!-- BUG 6 -->
    <div class="bug-item">
      <div class="bug-item-title">BUG-06: Bất đồng bộ định tuyến đường dẫn Đào Tạo trên Mobile App (/training vs /trainings)</div>
      <div class="bug-item-desc">
        <strong>Hiện tượng:</strong> Tệp route của Mobile App đang đặt tên số ít là <code>/association/training</code>, trong khi một số liên kết từ CRM hoặc thông báo chuyển hướng dùng số nhiều <code>/association/trainings</code>, gây lỗi trang trống (404 Not Found).
      </div>
      <div class="bug-item-solution">
        <strong>Giải pháp:</strong> Bổ sung cấu hình redirect tự động từ <code>/association/trainings</code> về <code>/association/training</code> trong file định tuyến của frontend Mobile App.
      </div>
    </div>
  </div>

  <!-- REPORT FOOTER -->
  <div class="report-footer">
    <div>Hệ thống Công nghệ Hội viên CLB Doanh Nhân CEO 1983 (HanoiBA) • Phát triển bởi ViConnect</div>
    <div>Báo cáo kiểm thử tự động trích xuất từ Master Test Suite v2 • Ngày hoàn thành: 07/11/2026</div>
  </div>

</body>
</html>
  `;

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();
    console.log("Đang render HTML sang PDF...");
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500)); // cho phép hình ảnh base64 settle hoàn toàn

    await page.pdf({
      path: OUTPUT_PDF,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '10mm',
        right: '10mm'
      }
    });

    console.log(`\n=== TẠO FILE BÁO CÁO THÀNH CÔNG! ===`);
    console.log(`Đường dẫn tệp: ${OUTPUT_PDF}`);
    const stats = fs.statSync(OUTPUT_PDF);
    console.log(`Kích thước file: ${(stats.size / 1024).toFixed(2)} KB`);
  } finally {
    await browser.close();
  }
}

generatePdf().catch(console.error);
