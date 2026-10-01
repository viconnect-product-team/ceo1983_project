const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const { getGuide1Content } = require('./guide1_web_crm_ceo1983');
const { getGuide2Content } = require('./guide2_app_ceo1983');
const { getGuide3Content } = require('./guide3_web_crm_vione');
const { getGuide4Content } = require('./guide4_app_vione');

const OUT_DIRS = [
  path.resolve(__dirname, '../document'),
  path.resolve(__dirname, '../../vione_project/document'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs'),
  path.resolve(__dirname, '../../vione_project/apps/vione_app_fe/public/docs'),
];

OUT_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const EVIDENCE_DIR = path.resolve(__dirname, '../document/images/evidence');

function getBase64Image(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  console.warn(`[WARN] Image not found: ${filename}`);
  return '';
}

function markdownToHtml(mdText, docInfo) {
  // Convert images to base64 inline cards
  let htmlText = mdText.replace(/!\[(.*?)\]\((.*?)\)\n\*(.*?)\*/gim, (match, alt, imgPath, caption) => {
    const fname = path.basename(imgPath);
    const b64 = getBase64Image(fname);
    if (b64) {
      return `<div class="img-card">
        <div class="img-wrapper"><img src="${b64}" alt="${alt}" /></div>
        <p class="img-caption">${caption || alt}</p>
      </div>`;
    }
    return `<div class="img-placeholder">[Hình ảnh minh họa: ${alt}]</div>`;
  });

  htmlText = htmlText.replace(/!\[(.*?)\]\((.*?)\)/gim, (match, alt, imgPath) => {
    const fname = path.basename(imgPath);
    const b64 = getBase64Image(fname);
    if (b64) {
      return `<div class="img-card">
        <div class="img-wrapper"><img src="${b64}" alt="${alt}" /></div>
        <p class="img-caption">${alt}</p>
      </div>`;
    }
    return `<div class="img-placeholder">[Hình ảnh minh họa: ${alt}]</div>`;
  });

  const lines = htmlText.split('\n');
  let bodyHtml = '';
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;
  let listType = '';
  let inCallout = false;
  let calloutType = '';
  let calloutLines = [];

  function closeList() {
    if (inList) {
      bodyHtml += listType === 'ol' ? '</ol>\n' : '</ul>\n';
      inList = false;
      listType = '';
    }
  }

  function closeTable() {
    if (inTable) {
      bodyHtml += '</tbody></table></div>\n';
      inTable = false;
      tableHeaderParsed = false;
    }
  }

  function flushCallout() {
    if (inCallout) {
      let icon = 'ℹ️';
      let title = 'LƯU Ý QUAN TRỌNG';
      if (calloutType === 'IMPORTANT') { icon = '⭐'; title = 'THÔNG TIN BẮT BUỘC'; }
      if (calloutType === 'CAUTION' || calloutType === 'WARNING') { icon = '⚠️'; title = 'CẢNH BÁO AN TOÀN'; }
      if (calloutType === 'TIP') { icon = '💡'; title = 'MẸO VẬN HÀNH'; }

      bodyHtml += `<div class="callout callout-${calloutType.toLowerCase()}">
        <div class="callout-header"><span class="callout-icon">${icon}</span> <span class="callout-title">${title}</span></div>
        <div class="callout-body">${calloutLines.map(l => formatInline(l)).join('<br/>')}</div>
      </div>\n`;
      inCallout = false;
      calloutType = '';
      calloutLines = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Callout detection: > [!IMPORTANT]
    const calloutMatch = line.match(/^>\s*\[!(IMPORTANT|NOTE|TIP|CAUTION|WARNING)\]/i);
    if (calloutMatch) {
      closeList();
      closeTable();
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1].toUpperCase();
      continue;
    }

    if (inCallout) {
      if (line.startsWith('>')) {
        calloutLines.push(line.replace(/^>\s?/, ''));
        continue;
      } else {
        flushCallout();
      }
    }

    // Dividers
    if (line.trim() === '---') {
      closeList();
      closeTable();
      bodyHtml += '<hr class="doc-divider" />\n';
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeaderParsed = true;
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        bodyHtml += '<div class="table-container"><table class="doc-table">\n';
      }
      if (!tableHeaderParsed) {
        bodyHtml += '<thead><tr>' + cells.map(c => `<th>${formatInline(c)}</th>`).join('') + '</tr></thead><tbody>\n';
      } else {
        bodyHtml += '<tr>' + cells.map(c => `<td>${formatInline(c)}</td>`).join('') + '</tr>\n';
      }
      continue;
    } else {
      closeTable();
    }

    // Unordered lists (* or -)
    const ulMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        bodyHtml += '<ul class="doc-list">\n';
      }
      bodyHtml += `<li>${formatInline(ulMatch[2])}</li>\n`;
      continue;
    }

    // Ordered lists (1., 2.)
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        bodyHtml += '<ol class="doc-list">\n';
      }
      bodyHtml += `<li>${formatInline(olMatch[2])}</li>\n`;
      continue;
    }

    closeList();

    // Headings
    if (line.startsWith('# ')) {
      bodyHtml += `<h1 class="heading-1">${formatInline(line.substring(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      bodyHtml += `<h2 class="heading-2">${formatInline(line.substring(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      bodyHtml += `<h3 class="heading-3">${formatInline(line.substring(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      bodyHtml += `<h4 class="heading-4">${formatInline(line.substring(5))}</h4>\n`;
      continue;
    }

    // Existing html blocks (img-card, etc)
    if (line.trim().startsWith('<div') || line.trim().startsWith('</div') || line.trim().startsWith('<p class="img-caption"')) {
      bodyHtml += line + '\n';
      continue;
    }

    // Paragraph
    if (line.trim().length > 0) {
      bodyHtml += `<p class="doc-para">${formatInline(line)}</p>\n`;
    }
  }

  flushCallout();
  closeList();
  closeTable();

  return wrapHtmlDocument(bodyHtml, docInfo);
}

function formatInline(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="doc-link">$1</a>');
}

function wrapHtmlDocument(bodyHtml, docInfo) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${docInfo.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

    :root {
      --primary: ${docInfo.primaryColor || '#003B95'};
      --accent: ${docInfo.accentColor || '#D97706'};
      --text: #1e293b;
      --text-muted: #64748b;
      --bg-card: #f8fafc;
      --border: #e2e8f0;
    }

    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text);
      line-height: 1.65;
      font-size: 13.5px;
      margin: 0;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print Setup */
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: "Trang " counter(page);
        font-size: 10px;
        color: #94a3b8;
      }
      @bottom-left {
        content: "${docInfo.docCode} — ${docInfo.title}";
        font-size: 10px;
        color: #94a3b8;
      }
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* Luxury Cover Page */
    .cover-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double var(--primary);
      outline: 1px solid var(--accent);
      padding: 40px;
      margin: 0 auto;
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      page-break-after: always;
      break-after: page;
    }

    .cover-header {
      text-align: center;
      border-bottom: 2px solid var(--accent);
      padding-bottom: 20px;
    }
    .cover-badge {
      display: inline-block;
      padding: 6px 18px;
      background: var(--primary);
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 30px;
      margin-bottom: 12px;
    }
    .cover-sub-badge {
      font-size: 13px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cover-body {
      text-align: center;
      padding: 40px 10px;
    }
    .cover-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1.35;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .cover-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 30px auto;
      font-style: italic;
    }

    .cover-meta-table {
      width: 100%;
      max-width: 550px;
      margin: 0 auto;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .cover-meta-table th {
      background: #f1f5f9;
      color: #334155;
      padding: 9px 14px;
      font-weight: 600;
      width: 35%;
      border-bottom: 1px solid var(--border);
    }
    .cover-meta-table td {
      padding: 9px 14px;
      color: #0f172a;
      border-bottom: 1px solid var(--border);
    }

    .cover-footer {
      border-top: 1px solid var(--border);
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Headings */
    .heading-1 {
      color: var(--primary);
      font-size: 20px;
      font-weight: 800;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 6px;
      margin-top: 36px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      page-break-after: avoid;
    }
    .heading-2 {
      color: #1e3a8a;
      font-size: 16px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      border-left: 4px solid var(--accent);
      padding-left: 10px;
      page-break-after: avoid;
    }
    .heading-3 {
      color: #334155;
      font-size: 14px;
      font-weight: 700;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    .doc-para {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: justify;
    }

    .doc-divider {
      border: none;
      border-top: 1px dashed #cbd5e1;
      margin: 25px 0;
    }

    .code-inline {
      background: #f1f5f9;
      color: #b91c1c;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      border: 1px solid #e2e8f0;
    }

    .doc-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    /* Lists */
    .doc-list {
      margin-top: 4px;
      margin-bottom: 14px;
      padding-left: 24px;
    }
    .doc-list li {
      margin-bottom: 6px;
    }

    /* Tables */
    .table-container {
      width: 100%;
      margin: 16px 0;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .doc-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
    }
    .doc-table td {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    .doc-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Callouts */
    .callout {
      border-radius: 8px;
      padding: 14px 18px;
      margin: 18px 0;
      page-break-inside: avoid;
      border-left: 4px solid;
    }
    .callout-important {
      background: #eff6ff;
      border-color: #3b82f6;
    }
    .callout-caution {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    .callout-tip {
      background: #f0fdf4;
      border-color: #10b981;
    }
    .callout-header {
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .callout-important .callout-header { color: #1d4ed8; }
    .callout-caution .callout-header { color: #b45309; }
    .callout-tip .callout-header { color: #047857; }
    .callout-body {
      font-size: 12.5px;
      line-height: 1.55;
    }

    /* Image Cards */
    .img-card {
      margin: 20px auto;
      text-align: center;
      page-break-inside: avoid;
      max-width: 95%;
    }
    .img-wrapper {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px;
      background: #f8fafc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      display: inline-block;
      max-width: 100%;
    }
    .img-card img {
      max-width: 100%;
      height: auto;
      max-height: 380px;
      border-radius: 4px;
      display: block;
      margin: 0 auto;
    }
    .img-caption {
      font-size: 11.5px;
      font-style: italic;
      color: #64748b;
      margin-top: 6px;
      text-align: center;
    }
    .img-placeholder {
      padding: 20px;
      background: #f1f5f9;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      text-align: center;
      color: #64748b;
      margin: 15px 0;
      font-style: italic;
    }
  </style>
</head>
<body>

  <!-- TRANG BÌA CHUYÊN NGHIỆP -->
  <div class="cover-container">
    <div class="cover-header">
      <div class="cover-badge">${docInfo.organization}</div>
      <div class="cover-sub-badge">${docInfo.subHeader}</div>
    </div>

    <div class="cover-body">
      <h1 class="cover-title">${docInfo.systemName}</h1>
      <p class="cover-subtitle">${docInfo.subTitle}</p>

      <table class="cover-meta-table">
        <tr>
          <th>Mã Tài Liệu</th>
          <td><strong>${docInfo.docCode}</strong></td>
        </tr>
        <tr>
          <th>Phiên Bản</th>
          <td>${docInfo.version}</td>
        </tr>
        <tr>
          <th>Địa Chỉ Server Dev</th>
          <td><code class="code-inline">${docInfo.serverUrl}</code></td>
        </tr>
        <tr>
          <th>Đối Tượng Áp Dụng</th>
          <td>${docInfo.targetAudience}</td>
        </tr>
        <tr>
          <th>Tác Giả & Phụ Trách</th>
          <td>${docInfo.author}</td>
        </tr>
        <tr>
          <th>Ngày Ban Hành</th>
          <td>${docInfo.issueDate}</td>
        </tr>
        <tr>
          <th>Trạng Thái Tài Liệu</th>
          <td><span style="color:#059669; font-weight:700;">✓ ĐÃ PHÊ DUYỆT & NGHIỆM THU</span></td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      <div>© 2026 ${docInfo.organization}. All Rights Reserved.</div>
      <div>Bảo mật nội bộ — Nghiêm cấm sao chép trái phép</div>
    </div>
  </div>

  <!-- NỘI DUNG TÀI LIỆU -->
  <div class="doc-content">
    ${bodyHtml}
  </div>

</body>
</html>`;
}

async function saveFile(filename, content) {
  for (const dir of OUT_DIRS) {
    fs.writeFileSync(path.join(dir, filename), content);
  }
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN 4 BỘ TÀI LIỆU HƯỚNG DẪN SỬ DỤNG (PDF, HTML, MD) ===\n');

  const docs = [
    // 1. Quản trị Hiệp hội CEO 1983
    {
      id: '01',
      fileBase: 'HUONG_DAN_SU_DUNG_HE_THONG_QUAN_TRI_HIỆP_HỘI_CEO1983',
      aliasBase: 'HUONG_DAN_SU_DUNG_CRM',
      getter: getGuide1Content,
      meta: {
        title: 'Hướng Dẫn Sử Dụng Web CRM Quản Trị Hiệp Hội CLB CEO 1983',
        systemName: 'HỆ THỐNG QUẢN TRỊ HIỆP HỘI CLB DOANH NHÂN CEO 1983',
        subTitle: 'Đặc tả chi tiết từng chức năng, quy trình vận hành & ảnh chụp minh họa thực tế từ máy chủ Dev',
        docCode: 'HDSD-CRM-CEO1983-V4.0',
        version: 'Version 4.0 — Master Production Manual',
        serverUrl: 'https://14.225.217.232:5443',
        organization: 'CLB DOANH NHÂN CEO 1983 & VIONE PLATFORM',
        subHeader: 'HỆ ĐIỀU HÀNH HIỆP HỘI DOANH NGHIỆP THÔNG MINH',
        targetAudience: 'Ban Quản trị, Ban Thư ký, Kế toán, Trưởng 6 Ban chuyên môn',
        author: 'Phạm Văn Vũ & ViOne Architecture Board',
        issueDate: '01/10/2026',
        primaryColor: '#003B95',
        accentColor: '#D97706'
      }
    },
    // 2. App CEO 1983
    {
      id: '02',
      fileBase: 'HUONG_DAN_SU_DUNG_APP_CEO1983',
      aliasBase: 'HUONG_DAN_SU_DUNG_APP_HIEP_HOI',
      getter: getGuide2Content,
      meta: {
        title: 'Hướng Dẫn Sử Dụng App Hội Viên CLB Doanh Nhân CEO 1983',
        systemName: 'ỨNG DỤNG DI ĐỘNG HỘI VIÊN CLB DOANH NHÂN CEO 1983',
        subTitle: 'Danh bạ đồng niên, Thẻ VIP 3D Gyroscope, Nộp hội phí VietQR & Sàn giao thương Shopee Style',
        docCode: 'HDSD-APP-CEO1983-V4.0',
        version: 'Version 4.0 — Master Production Manual',
        serverUrl: 'https://14.225.217.232:5444/association',
        organization: 'CLB DOANH NHÂN CEO 1983',
        subHeader: 'KẾT NỐI ĐỒNG NIÊN — GẮN KẾT THƯƠNG TRƯỜNG',
        targetAudience: 'Toàn thể Hội viên chính thức CLB Doanh Nhân CEO 1983',
        author: 'Phạm Văn Vũ & ViOne Mobile Product Team',
        issueDate: '01/10/2026',
        primaryColor: '#002B70',
        accentColor: '#F59E0B'
      }
    },
    // 3. Web CRM ViOne
    {
      id: '03',
      fileBase: 'HUONG_DAN_SU_DUNG_HE_THONG_QUAN_TRI_VIONE',
      aliasBase: 'HUONG_DAN_SU_DUNG_CRM_VIONE',
      getter: getGuide3Content,
      meta: {
        title: 'Hướng Dẫn Sử Dụng Hệ Điều Hành Doanh Nghiệp ViOne Enterprise CRM',
        systemName: 'HỆ ĐIỀU HÀNH QUẢN TRỊ DOANH NGHIỆP VIONE ENTERPRISE CRM',
        subTitle: 'Kiến trúc Đa Doanh Nghiệp (Multi-Tenant 163 Bảng), Phễu Bán Hàng B2B & Quản Trị Dòng Tiền Thuần',
        docCode: 'HDSD-CRM-VIONE-V4.0',
        version: 'Version 4.0 — Master Enterprise Edition',
        serverUrl: 'https://14.225.217.232:5445',
        organization: 'VIONE ENTERPRISE PLATFORM',
        subHeader: 'TỔNG HÀNH DINH ĐIỀU HÀNH DOANH SỐ DOANH NGHIỆP B2B',
        targetAudience: 'Chủ tịch, Tổng Giám Đốc (CEO), Giám Đốc Kinh Doanh (CCO), Đội ngũ Sales B2B',
        author: 'Phạm Văn Vũ & ViOne Enterprise Architecture Board',
        issueDate: '01/10/2026',
        primaryColor: '#0F172A',
        accentColor: '#3B82F6'
      }
    },
    // 4. App ViOne
    {
      id: '04',
      fileBase: 'HUONG_DAN_SU_DUNG_APP_VIONE',
      aliasBase: 'HUONG_DAN_SU_DUNG_APP_VIONE_CONNECT',
      getter: getGuide4Content,
      meta: {
        title: 'Hướng Dẫn Sử Dụng Mạng Lưới Giao Thương & Danh Thiếp Số ViOne Connect',
        systemName: 'ỨNG DỤNG MẠNG LƯỚI GIAO THƯƠNG & DANH THIẾP SỐ VIONE CONNECT',
        subTitle: 'Danh thiếp Titanium NFC 1-chạm, Ghép cặp AI Matchmaking, Thu thập Leads B2B & Mạng xã hội Doanh nhân',
        docCode: 'HDSD-APP-VIONE-V4.0',
        version: 'Version 4.0 — Master Production Manual',
        serverUrl: 'https://14.225.217.232:5445/connect-app',
        organization: 'VIONE CONNECT ECOSYSTEM',
        subHeader: 'TRỢ LÝ GIAO THƯƠNG SỐ & DANH THIẾP VẠN NĂNG',
        targetAudience: 'Chủ tịch, CEO Doanh nghiệp B2B, Giám đốc Kinh doanh (CCO), Nhà đầu tư',
        author: 'Phạm Văn Vũ & ViOne Mobile Product Team',
        issueDate: '01/10/2026',
        primaryColor: '#18181B',
        accentColor: '#D8B282'
      }
    }
  ];

  console.log('Khởi chạy Chromium headless để in PDF độ phân giải cao...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  for (const item of docs) {
    console.log(`\n-------------------------------------------------------------`);
    console.log(`[Đang xử lý ${item.id}/4] ${item.meta.systemName}...`);

    const mdContent = item.getter();
    const htmlContent = markdownToHtml(mdContent, item.meta);

    // 1. Lưu Markdown
    await saveFile(`${item.fileBase}.md`, mdContent);
    if (item.aliasBase) await saveFile(`${item.aliasBase}.md`, mdContent);
    console.log(`  ✓ Đã lưu Markdown: ${item.fileBase}.md (${(Buffer.byteLength(mdContent, 'utf8') / 1024).toFixed(1)} KB)`);

    // 2. Lưu HTML
    await saveFile(`${item.fileBase}.html`, htmlContent);
    if (item.aliasBase) await saveFile(`${item.aliasBase}.html`, htmlContent);
    console.log(`  ✓ Đã lưu HTML: ${item.fileBase}.html (${(Buffer.byteLength(htmlContent, 'utf8') / 1024).toFixed(1)} KB)`);

    // 3. Render PDF qua Playwright
    console.log(`  ⏳ Đang chuyển đổi sang PDF qua Chromium Print Engine...`);
    const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2000);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '18mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `<div style="font-size: 8.5px; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; font-family: sans-serif;">
        <span>${item.meta.docCode} — ${item.meta.title}</span>
        <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`
    });

    await page.close();

    // Lưu PDF
    await saveFile(`${item.fileBase}.pdf`, pdfBuffer);
    if (item.aliasBase) await saveFile(`${item.aliasBase}.pdf`, pdfBuffer);
    console.log(`  ✓ ĐÃ XUẤT BẢN PDF THÀNH CÔNG: ${item.fileBase}.pdf (${(pdfBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  }

  await browser.close();
  console.log('\n=============================================================');
  console.log('=== TẤT CẢ 4 BỘ TÀI LIỆU HƯỚNG DẪN ĐÃ XUẤT BẢN RA PDF 100%! ===');
  console.log('=============================================================\n');
}

main().catch(err => {
  console.error('Lỗi khi biên dịch PDF tài liệu:', err);
  process.exit(1);
});
