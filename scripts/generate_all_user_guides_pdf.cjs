const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DOC_DIR = path.resolve(__dirname, '../document');
const OUT_PDF_DIR = path.resolve(__dirname, '../document');

function getImgBase64(imgPath) {
  try {
    let resolved = imgPath;
    if (imgPath.startsWith('./') || imgPath.startsWith('../')) {
      resolved = path.resolve(DOC_DIR, imgPath);
    }
    if (fs.existsSync(resolved)) {
      const ext = path.extname(resolved).toLowerCase();
      const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
      const data = fs.readFileSync(resolved);
      return `data:${mime};base64,${data.toString('base64')}`;
    }
  } catch (e) {
    console.error('Error loading image:', imgPath, e.message);
  }
  return '';
}

function formatInline(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function parseMarkdownToHtml(mdText, title, subtitle, docType) {
  const lines = mdText.split('\n');
  let bodyHtml = '';
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;
  let listType = '';

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

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip top title from markdown if already in cover
    if (i < 5 && (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('*Phiên bản:'))) {
      continue;
    }

    if (line === '---') {
      closeList();
      closeTable();
      bodyHtml += '<div class="divider"></div>\n';
      continue;
    }

    // Markdown Table
    if (line.startsWith('|') && line.endsWith('|')) {
      closeList();
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        tableHeaderParsed = true;
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        bodyHtml += '<div class="table-wrap"><table>\n';
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

    // Unordered list
    const ulMatch = line.match(/^([*-])\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        bodyHtml += '<ul>\n';
      }
      bodyHtml += `<li>${formatInline(ulMatch[2])}</li>\n`;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        bodyHtml += '<ol>\n';
      }
      bodyHtml += `<li>${formatInline(olMatch[2])}</li>\n`;
      continue;
    }

    closeList();

    // Image: ![caption](path)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const caption = imgMatch[1];
      const imgPath = imgMatch[2];
      const base64Data = getImgBase64(imgPath);
      const isMobileImg = imgPath.includes('guide_app') || docType === 'mobile';
      bodyHtml += `
        <div class="img-container ${isMobileImg ? 'img-mobile' : 'img-desktop'}">
          <img src="${base64Data || imgPath}" alt="${caption}" />
          <div class="img-caption">📌 ${formatInline(caption)}</div>
        </div>\n`;
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      bodyHtml += `<h1>${formatInline(line.slice(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      bodyHtml += `<h2>${formatInline(line.slice(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      bodyHtml += `<div class="node-badge-header"><h3>${formatInline(line.slice(4))}</h3></div>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      bodyHtml += `<h4>${formatInline(line.slice(5))}</h4>\n`;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      continue;
    }

    // Normal paragraph
    if (line.length > 0) {
      bodyHtml += `<p>${formatInline(line)}</p>\n`;
    }
  }

  closeList();
  closeTable();

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 20mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* COVER PAGE */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #0F2A66 100%);
      color: #ffffff;
      padding: 40px;
      page-break-after: always;
      border-radius: 12px;
    }
    .cover-badge {
      display: inline-block;
      padding: 6px 20px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid #F59E0B;
      border-radius: 999px;
      font-size: 11pt;
      font-weight: 700;
      color: #FCD34D;
      letter-spacing: 1.5px;
      margin-bottom: 24px;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 24pt;
      font-weight: 900;
      margin: 0 0 16px 0;
      line-height: 1.3;
      color: #ffffff;
      text-transform: uppercase;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: #cbd5e1;
      max-width: 600px;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 20px;
      font-size: 9.5pt;
      color: #94a3b8;
      width: 100%;
      max-width: 500px;
      display: flex;
      justify-content: space-between;
    }

    /* TYPOGRAPHY */
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #001A4D;
      border-bottom: 2.5px solid #003B95;
      padding-bottom: 8px;
      margin-top: 32px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #003B95;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
      page-break-after: avoid;
    }
    .node-badge-header {
      background: #F1F5F9;
      border-left: 4px solid #F59E0B;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin-top: 26px;
      margin-bottom: 12px;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    h4 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 0 0 14px 0;
      padding-left: 22px;
    }
    li {
      margin-bottom: 4px;
    }
    code {
      background: #F1F5F9;
      color: #9E0000;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: Consolas, monospace;
      font-size: 9pt;
      border: 1px solid #E2E8F0;
    }
    .divider {
      height: 1px;
      background: #E2E8F0;
      margin: 24px 0;
    }

    /* TABLES */
    .table-wrap {
      width: 100%;
      margin: 14px 0 20px 0;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    th {
      background: #001A4D;
      color: #ffffff;
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #001A4D;
    }
    td {
      padding: 8px 12px;
      border: 1px solid #CBD5E1;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }

    /* IMAGES */
    .img-container {
      margin: 16px auto 20px auto;
      text-align: center;
      page-break-inside: avoid;
    }
    .img-container img {
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      max-height: 480px;
    }
    .img-desktop img {
      width: 100%;
      max-width: 680px;
      height: auto;
    }
    .img-mobile img {
      width: auto;
      max-width: 320px;
      height: auto;
    }
    .img-caption {
      font-size: 9pt;
      font-style: italic;
      color: #64748B;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-badge">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
    <div class="cover-title">${title}</div>
    <div class="cover-subtitle">${subtitle}</div>
    <div class="cover-meta">
      <span>Đơn vị phát hành: ViConnect Technology</span>
      <span>Phiên bản: 5.0 (Năm 2026)</span>
    </div>
  </div>

  <div class="content-body">
    ${bodyHtml}
  </div>
</body>
</html>
  `;
}

async function generatePdfFromMarkdown(mdFilePath, outPdfPath, title, subtitle, docType) {
  console.log(`\n>>> ĐANG KẾT XUẤT PDF: ${path.basename(outPdfPath)}...`);
  if (!fs.existsSync(mdFilePath)) {
    console.error(`Tệp nguồn không tồn tại: ${mdFilePath}`);
    return;
  }

  const mdText = fs.readFileSync(mdFilePath, 'utf-8');
  const htmlContent = parseMarkdownToHtml(mdText, title, subtitle, docType);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 1600 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle', timeout: 60000 });

  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return;
        return new Promise(resolve => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      })
    );
  });

  await page.waitForTimeout(1000);

  await page.pdf({
    path: outPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '18mm',
      left: '12mm',
      right: '12mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8pt;color:#94a3b8;width:100%;text-align:right;padding-right:12mm;">CLB Doanh Nhân CEO 1983 (HanoiBA) — Cẩm Nang Sử Dụng</div>',
    footerTemplate: '<div style="font-size:8pt;color:#94a3b8;width:100%;text-align:center;">Trang <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  });

  await browser.close();
  console.log(`✔ KẾT XUẤT THÀNH CÔNG: ${outPdfPath} (${(fs.statSync(outPdfPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  console.log('=== BẮT ĐẦU QUY TRÌNH KẾT XUẤT TRỌN BỘ 3 TỆP PDF HDSD CEO 1983 ===');

  // 1. PDF Web CRM
  await generatePdfFromMarkdown(
    path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_WEB_CRM_CHI_TIET.md'),
    path.join(OUT_PDF_DIR, 'HUONG_DAN_SU_DUNG_WEB_CRM_CEO1983.pdf'),
    'CẨM NANG HƯỚNG DẪN SỬ DỤNG CỔNG QUẢN TRỊ WEB CRM',
    'Hệ Thống Điều Hành & Phân Quyền Doanh Nhân CLB CEO 1983 (24 Functional Nodes)',
    'crm'
  );

  // 2. PDF Mobile App
  await generatePdfFromMarkdown(
    path.join(DOC_DIR, 'HUONG_DAN_SU_DUNG_APP_MOBILE_CHI_TIET.md'),
    path.join(OUT_PDF_DIR, 'HUONG_DAN_SU_DUNG_APP_MOBILE_CEO1983.pdf'),
    'CẨM NANG HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN',
    'Hệ Thống Giao Thương B2B, Thẻ VIP Số & Sinh Hoạt Hiệp Hội (17 Functional Nodes)',
    'mobile'
  );

  // 3. PDF Toàn Diện 2 Subdomain
  await generatePdfFromMarkdown(
    path.join(DOC_DIR, 'BO_HUONG_DAN_SU_DUNG_HE_THONG_CEO1983_TOAN_DIEN.md'),
    path.join(OUT_PDF_DIR, 'BO_HUONG_DAN_SU_DUNG_TOAN_DIEN_CEO1983.pdf'),
    'BỘ HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN HỆ SINH THÁI SỐ CEO 1983',
    'Tài Liệu Vận Hành Đồng Bộ 2 Subdomain: Web CRM Quản Trị & Mobile App Hội Viên',
    'both'
  );

  // 4. Đồng bộ sang public/docs/ để người dùng tải trực tiếp trên Web/App
  const PUBLIC_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');
  if (!fs.existsSync(PUBLIC_DOCS_DIR)) fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
  const pdfFiles = [
    'HUONG_DAN_SU_DUNG_WEB_CRM_CEO1983.pdf',
    'HUONG_DAN_SU_DUNG_APP_MOBILE_CEO1983.pdf',
    'BO_HUONG_DAN_SU_DUNG_TOAN_DIEN_CEO1983.pdf'
  ];
  for (const f of pdfFiles) {
    fs.copyFileSync(path.join(OUT_PDF_DIR, f), path.join(PUBLIC_DOCS_DIR, f));
    console.log(`✔ Đồng bộ: ${path.join(PUBLIC_DOCS_DIR, f)}`);
  }

  console.log('\n=== HOÀN TẤT KẾT XUẤT TOÀN BỘ 3 FILE PDF CHUẨN IN ẤN A4 ===');
}

main().catch(console.error);

