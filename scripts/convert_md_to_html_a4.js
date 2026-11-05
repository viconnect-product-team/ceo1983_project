/**
 * CONVERT MARKDOWN TO PERFECT A4 HTML REPORT
 * Chuẩn hóa tài liệu theo cấu trúc và thẩm mỹ đỉnh cao của BRD_BusinessConnect_v1.0.html
 * Bao gồm:
 * - Khổ giấy A4 chuẩn in ấn @page { size: A4; margin: 12mm 14mm; }
 * - Font chữ Google Font "Be Vietnam Pro"
 * - Trang bìa (Cover page) chuyên nghiệp có logo, gradient bar và metadata
 * - Trang Mục lục (Table of Contents) với link neo clickable
 * - Hỗ trợ render biểu đồ Mermaid (Sequence, Flowchart, Use Case, ERD) qua CDN Mermaid 10.9.1
 * - Bảng biểu sắc nét, viền mảnh, alternating row shading
 * - Callout boxes, badge trạng thái, typography đẳng cấp
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(FE_DOCS_DIR)) fs.mkdirSync(FE_DOCS_DIR, { recursive: true });

function parseMarkdownToHtmlContent(md) {
  // Chuẩn hóa line endings
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inTable = false;
  let tableLines = [];
  let inMermaid = false;
  let mermaidLines = [];
  let inCode = false;
  let codeLines = [];
  let inList = false;

  function flushTable() {
    if (!inTable || tableLines.length === 0) return;
    const validRows = tableLines.filter(l => !l.match(/^\|\s*[:\-\s|]+\|$/));
    if (validRows.length > 0) {
      let html = '<div class="table-container"><table>\n';
      validRows.forEach((rowStr, idx) => {
        const cells = rowStr.split('|').slice(1, -1).map(c => c.trim());
        const tag = idx === 0 ? 'th' : 'td';
        html += '  <tr>' + cells.map(c => `<${tag}>${formatInline(c)}</${tag}>`).join('') + '</tr>\n';
      });
      html += '</table></div>\n';
      out.push(html);
    }
    tableLines = [];
    inTable = false;
  }

  function flushMermaid() {
    if (!inMermaid) return;
    out.push(`<pre class="mermaid">\n${mermaidLines.join('\n')}\n</pre>\n`);
    mermaidLines = [];
    inMermaid = false;
  }

  function flushCode() {
    if (!inCode) return;
    out.push(`<pre class="code-block"><code>${codeLines.map(escapeHtml).join('\n')}</code></pre>\n`);
    codeLines = [];
    inCode = false;
  }

  function flushList() {
    if (inList) {
      out.push('</ul>\n');
      inList = false;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatInline(str) {
    if (!str) return '';
    let res = str;
    // Code inline
    res = res.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    // Bold italic
    res = res.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Links
    res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return res;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check mermaid block
    if (line.trim().startsWith('```mermaid')) {
      flushTable();
      flushList();
      flushCode();
      inMermaid = true;
      mermaidLines = [];
      continue;
    }
    if (inMermaid) {
      if (line.trim().startsWith('```')) {
        flushMermaid();
      } else {
        mermaidLines.push(line);
      }
      continue;
    }

    // Check code block
    if (line.trim().startsWith('```')) {
      flushTable();
      flushList();
      if (inCode) {
        flushCode();
      } else {
        inCode = true;
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Check table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      inTable = true;
      tableLines.push(line);
      continue;
    } else {
      flushTable();
    }

    // Check list item
    if (line.match(/^(\s*)[-*+]\s+(.*)$/)) {
      const match = line.match(/^(\s*)[-*+]\s+(.*)$/);
      if (!inList) {
        out.push('<ul class="doc-list">\n');
        inList = true;
      }
      out.push(`  <li>${formatInline(match[2])}</li>\n`);
      continue;
    } else {
      flushList();
    }

    // Check Headings
    if (line.startsWith('# ')) {
      const title = line.replace(/^#\s+/, '').trim();
      out.push(`<h1 class="doc-h1">${formatInline(title)}</h1>\n`);
      continue;
    }
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s+/, '').trim();
      out.push(`<h2 class="doc-h2">${formatInline(title)}</h2>\n`);
      continue;
    }
    if (line.startsWith('### ')) {
      const title = line.replace(/^###\s+/, '').trim();
      out.push(`<h3 class="doc-h3">${formatInline(title)}</h3>\n`);
      continue;
    }
    if (line.startsWith('#### ')) {
      const title = line.replace(/^####\s+/, '').trim();
      out.push(`<h4 class="doc-h4">${formatInline(title)}</h4>\n`);
      continue;
    }

    // Check Blockquote / Callout
    if (line.startsWith('> ')) {
      const quoteText = line.replace(/^>\s+/, '').trim();
      out.push(`<blockquote class="doc-callout">${formatInline(quoteText)}</blockquote>\n`);
      continue;
    }

    // Check Divider
    if (line.trim() === '---' || line.trim() === '***') {
      out.push('<hr class="doc-divider" />\n');
      continue;
    }

    // Check HTML anchor div
    if (line.trim().startsWith('<div id="') && line.trim().endsWith('"></div>')) {
      out.push(`${line.trim()}\n`);
      continue;
    }

    // Normal paragraph
    if (line.trim().length > 0) {
      out.push(`<p class="doc-p">${formatInline(line.trim())}</p>\n`);
    }
  }

  flushTable();
  flushList();
  flushCode();
  flushMermaid();

  return out.join('\n');
}

function buildHtmlA4Document(options) {
  const {
    docCode,
    version,
    date,
    title,
    subtitle,
    organization,
    author,
    classification,
    contentHtml,
    tocItems = []
  } = options;

  const tocHtml = tocItems.map(item => {
    const levelClass = item.level === 3 ? ' level-3' : '';
    return `<a class="toc-item${levelClass}" href="${item.href}">
      <span class="toc-index">${item.index}</span>
      <span class="toc-text">${item.text}</span>
    </a>`;
  }).join('\n');

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — ${version} — CLB CEO 1983</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap");

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        background: #d8dee8;
        font-family: "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 11.5px;
        color: #0f172a;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      .doc-page {
        width: 210mm;
        min-height: 297mm;
        margin: 10mm auto;
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
        position: relative;
        display: flex;
        flex-direction: column;
        page-break-after: always;
        break-after: page;
      }

      @media print {
        @page {
          size: A4;
          margin: 12mm 14mm;
        }
        body {
          background: #ffffff;
          font-size: 10.5px;
        }
        .doc-page {
          width: 100%;
          min-height: auto !important;
          height: auto !important;
          margin: 0;
          box-shadow: none;
          page-break-after: auto;
          break-after: auto;
        }
        .doc-page.cover {
          height: 273mm !important;
          max-height: 273mm !important;
          overflow: hidden !important;
          page-break-after: always;
          break-after: page;
        }
        .doc-page.toc-page {
          page-break-after: always;
          break-after: page;
        }
        .inner-header, .inner-divider, .inner-footer {
          display: none !important;
        }
        .content-area {
          padding: 6px 4px !important;
        }
        .table-container table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        thead {
          display: table-header-group;
        }
        .mermaid, blockquote {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }

      /* COVER PAGE */
      .doc-page.cover {
        padding: 0;
        background: radial-gradient(circle at 80% 20%, #f0f7ff 0%, #ffffff 60%);
      }
      .accent-bar {
        height: 8px;
        background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #d97706 100%);
      }
      .cover-header {
        padding: 24px 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9.5px;
        color: #475569;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .cover-header span {
        color: #1e3a8a;
        font-weight: 700;
      }
      .cover-divider {
        margin: 0 50px;
        height: 1px;
        background: #e2e8f0;
      }
      .cover-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 50px 60px;
        text-align: center;
      }
      .cover-logo-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: #0f172a;
        color: #ffffff;
        padding: 10px 24px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        margin-bottom: 30px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
      }
      .cover-logo-badge .badge-gold {
        color: #f59e0b;
      }
      .cover-pill {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #2563eb;
        background: #eff6ff;
        padding: 6px 18px;
        border-radius: 20px;
        border: 1px solid #bfdbfe;
        margin-bottom: 24px;
      }
      .cover-title {
        font-size: 34px;
        font-weight: 900;
        color: #0f172a;
        line-height: 1.25;
        letter-spacing: -0.5px;
        max-width: 650px;
        margin-bottom: 18px;
      }
      .cover-title .highlight {
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cover-subtitle {
        font-size: 12.5px;
        color: #475569;
        max-width: 580px;
        line-height: 1.6;
        margin-bottom: 36px;
      }
      .cover-meta {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px 28px;
        font-size: 10.5px;
        line-height: 1.85;
        color: #334155;
        text-align: left;
        width: 100%;
        max-width: 540px;
      }
      .cover-meta strong {
        color: #0f172a;
        font-weight: 600;
      }
      .cover-footer {
        padding: 18px 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #e2e8f0;
        font-size: 9.5px;
        color: #64748b;
      }

      /* TOC PAGE */
      .inner-header {
        padding: 18px 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9.5px;
        color: #64748b;
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
      }
      .inner-header span {
        color: #1e3a8a;
      }
      .inner-footer {
        padding: 14px 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9.5px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        margin-top: auto;
      }
      .content-area {
        padding: 24px 48px;
        flex: 1;
      }
      .toc-title {
        font-size: 22px;
        font-weight: 900;
        color: #0f172a;
        margin-bottom: 8px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 8px;
      }
      .toc-subtitle {
        font-size: 11px;
        color: #64748b;
        margin-bottom: 20px;
      }
      .toc-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .toc-item {
        display: flex;
        align-items: baseline;
        text-decoration: none;
        color: #1e293b;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.15s ease;
      }
      .toc-item:hover {
        background: #f1f5f9;
        color: #2563eb;
      }
      .toc-item.level-3 {
        padding-left: 24px;
        color: #475569;
        font-size: 10.5px;
      }
      .toc-index {
        font-weight: 700;
        width: 32px;
        color: #2563eb;
        flex-shrink: 0;
      }
      .toc-text {
        flex: 1;
      }

      /* CONTENT TYPOGRAPHY */
      .doc-h1 {
        font-size: 20px;
        font-weight: 900;
        color: #0f172a;
        margin: 24px 0 14px;
        padding-bottom: 8px;
        border-bottom: 2px solid #1e3a8a;
      }
      .doc-h2 {
        font-size: 15.5px;
        font-weight: 800;
        color: #1e3a8a;
        margin: 20px 0 10px;
        padding: 6px 12px;
        background: linear-gradient(90deg, #eff6ff 0%, transparent 100%);
        border-left: 4px solid #2563eb;
        border-radius: 0 4px 4px 0;
      }
      .doc-h3 {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        margin: 14px 0 6px;
      }
      .doc-h4 {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        margin: 10px 0 4px;
      }
      .doc-p {
        margin: 6px 0;
        color: #1e293b;
        line-height: 1.65;
        text-align: justify;
      }
      .doc-list {
        margin: 6px 0 8px;
        padding-left: 20px;
      }
      .doc-list li {
        margin: 3px 0;
        line-height: 1.55;
        color: #1e293b;
      }
      .doc-callout {
        margin: 12px 0;
        padding: 10px 16px;
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        font-size: 11px;
      }
      .doc-divider {
        border: none;
        border-top: 1px dashed #cbd5e1;
        margin: 18px 0;
      }
      .inline-code {
        background: #f1f5f9;
        color: #0f172a;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        border: 1px solid #e2e8f0;
      }
      .code-block {
        background: #0f172a;
        color: #e2e8f0;
        padding: 12px 16px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        margin: 10px 0;
        overflow-x: auto;
        line-height: 1.5;
      }

      /* TABLES */
      .table-container {
        width: 100%;
        margin: 10px 0 14px;
        overflow-x: auto;
      }
      .table-container table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10.5px;
      }
      .table-container th, .table-container td {
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        vertical-align: top;
        text-align: left;
      }
      .table-container th {
        background: #1e3a8a;
        color: #ffffff;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .table-container tr:nth-child(even) td {
        background: #f8fafc;
      }

      /* MERMAID DIAGRAMS */
      .mermaid {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 14px;
        margin: 14px 0;
        text-align: center;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>

    <!-- TRANG BÌA -->
    <div class="doc-page cover">
      <div class="accent-bar"></div>
      <div class="cover-header">
        <div>Mã tài liệu: <span>${docCode}</span></div>
        <div>Phiên bản ${version} &nbsp;•&nbsp; ${date} &nbsp;•&nbsp; CLB CEO 1983</div>
      </div>
      <div class="cover-divider"></div>
      <div class="cover-main">
        <div class="cover-logo-badge">
          <span>CEO 1983</span>
          <span class="badge-gold">★ HANOIBA</span>
        </div>
        <div class="cover-pill">TÀI LIỆU CHÍNH THỨC</div>
        <h1 class="cover-title">
          <span class="highlight">${title}</span>
        </h1>
        <p class="cover-subtitle">${subtitle}</p>
        <div class="cover-meta">
          <strong>Cơ quan ban hành:</strong> ${organization}<br />
          <strong>Đơn vị thực hiện:</strong> ${author}<br />
          <strong>Phân loại:</strong> ${classification}<br />
          <strong>Ngày ban hành:</strong> ${date} &nbsp;|&nbsp; <strong>Phiên bản:</strong> ${version}
        </div>
      </div>
      <div class="cover-footer">
        <div>CEO 1983 — Hệ Sinh Thái Số Hóa Doanh Nhân — Bảo Mật Nội Bộ</div>
        <div>© 2026 ViConnect & CLB Doanh Nhân CEO 1983</div>
      </div>
    </div>

    <!-- TRANG MỤC LỤC -->
    <div class="doc-page toc-page">
      <div class="inner-header">
        <div>Mã tài liệu: <span>${docCode}</span></div>
        <div>Mục lục &nbsp;•&nbsp; Phiên bản ${version}</div>
      </div>
      <div class="content-area">
        <h2 class="toc-title">Mục lục</h2>
        <p class="toc-subtitle">Nhấp vào từng mục để di chuyển nhanh đến nội dung tương ứng.</p>
        <div class="toc-list">
          ${tocHtml}
        </div>
      </div>
      <div class="inner-footer">
        <div>${docCode} — Bảo mật nội bộ</div>
        <div>Trang 2</div>
      </div>
    </div>

    <!-- NỘI DUNG CHÍNH -->
    <div class="doc-page">
      <div class="inner-header">
        <div>Mã tài liệu: <span>${docCode}</span></div>
        <div>${title} &nbsp;•&nbsp; Phiên bản ${version}</div>
      </div>
      <div class="content-area">
        ${contentHtml}
      </div>
      <div class="inner-footer">
        <div>${organization} — Bảo mật nội bộ</div>
        <div>${version}</div>
      </div>
    </div>

    <!-- MERMAID SCRIPT LOADER -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#eff6ff",
          primaryTextColor: "#0f172a",
          primaryBorderColor: "#2563eb",
          lineColor: "#475569",
          secondaryColor: "#f8fafc",
          tertiaryColor: "#ffffff",
          fontFamily: "Be Vietnam Pro, Segoe UI, Roboto, sans-serif",
          fontSize: "12px",
        },
        sequence: { diagramMarginX: 12, diagramMarginY: 12, actorMargin: 40, messageMargin: 24 },
        flowchart: { useMaxWidth: true, htmlLabels: true },
      });
      mermaid.run({ querySelector: ".mermaid" });
    </script>
  </body>
</html>`;
}

// Convert BRD V7.md to HTML
function convertBrdV7() {
  const mdPath = path.join(DOC_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.md');
  if (!fs.existsSync(mdPath)) {
    console.error('Không tìm thấy tệp:', mdPath);
    return;
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const contentHtml = parseMarkdownToHtmlContent(md);

  const tocItems = [
    { index: '0', text: 'Bảng từ viết tắt và thuật ngữ nghiệp vụ', href: '#sec-0', level: 2 },
    { index: '1', text: 'Tóm tắt điều hành (Executive Summary)', href: '#sec-1', level: 2 },
    { index: '1.1', text: 'Bối cảnh & Sự cần thiết đầu tư', href: '#sec-1-1', level: 3 },
    { index: '1.2', text: 'Tầm nhìn chiến lược', href: '#sec-1-2', level: 3 },
    { index: '1.3', text: 'Mục tiêu kinh doanh cốt lõi', href: '#sec-1-3', level: 3 },
    { index: '1.4', text: 'Các chỉ số đo lường hiệu quả (KPIs & OKRs)', href: '#sec-1-4', level: 3 },
    { index: '2', text: 'Phạm vi sản phẩm (Product Scope)', href: '#sec-2', level: 2 },
    { index: '2.1', text: 'Phân hệ trong phạm vi (In-Scope V7.0)', href: '#sec-2-1', level: 3 },
    { index: '2.2', text: 'Phân hệ ngoài phạm vi (Out-of-Scope V7.0)', href: '#sec-2-2', level: 3 },
    { index: '2.3', text: 'Ranh giới dữ liệu & Phân vùng an toàn', href: '#sec-2-3', level: 3 },
    { index: '2.4', text: 'Sơ đồ kiến trúc tổng thể hệ sinh thái', href: '#sec-2-4', level: 3 },
    { index: '3', text: 'Đối tượng sử dụng & Ma trận phân công trách nhiệm (RACI Matrix)', href: '#sec-3', level: 2 },
    { index: '3.1', text: 'Chân dung người dùng (Actor Profiles)', href: '#sec-3-1', level: 3 },
    { index: '3.2', text: 'Ma trận phân công trách nhiệm RACI', href: '#sec-3-2', level: 3 },
    { index: '4', text: 'Đặc tả yêu cầu nghiệp vụ chi tiết theo 11 phân hệ', href: '#sec-4', level: 2 },
    { index: '4.1', text: 'Định danh Hội viên, Thẻ VIP Số & NFC Tap-to-Connect', href: '#sec-4-1', level: 3 },
    { index: '4.2', text: 'Sàn Giao thương B2B, Chia sẻ Cơ hội & Deal Chào giá đúng người đăng', href: '#sec-4-2', level: 3 },
    { index: '4.3', text: 'Quản lý Sự kiện, Gala Dinner, Sơ đồ bàn tiệc & Check-in QR 1 Giây', href: '#sec-4-3', level: 3 },
    { index: '4.4', text: 'Danh bạ Doanh nhân 1983 & Bộ lọc Kết nối 2 Cấp', href: '#sec-4-4', level: 3 },
    { index: '4.5', text: 'Trợ lý AI Điều hành Toàn diện CRM & Xuất Báo cáo con', href: '#sec-4-5', level: 3 },
    { index: '4.6', text: 'Cấu hình Hệ thống AI Đa hãng, Quota Token & Cảnh báo Sắp hết Model', href: '#sec-4-6', level: 3 },
    { index: '4.7', text: 'Landing Web Giới thiệu Chính thức & Đăng ký Gia nhập Online', href: '#sec-4-7', level: 3 },
    { index: '4.8', text: 'Kho Tài liệu Số Đồng bộ Google Drive 2 Chiều', href: '#sec-4-8', level: 3 },
    { index: '4.9', text: 'Chia sẻ Mạng Xã hội Đa kênh với Thẻ OpenGraph Preview Động', href: '#sec-4-9', level: 3 },
    { index: '4.10', text: 'Quản lý Tài chính, Thu Chi & Hội phí VietQR Động', href: '#sec-4-10', level: 3 },
    { index: '4.11', text: 'Quản trị Cấu hình Hệ thống, Tên miền, Theme Studio & Phân quyền RBAC', href: '#sec-4-11', level: 3 },
    { index: '5', text: 'Yêu cầu về trải nghiệm người dùng & Giao diện (UI/UX)', href: '#sec-5', level: 2 },
    { index: '5.1', text: 'Hệ thống bảng màu thương hiệu 3 cấp độ', href: '#sec-5-1', level: 3 },
    { index: '5.2', text: 'Chuẩn trải nghiệm Responsive Desktop & Mobile First', href: '#sec-5-2', level: 3 },
    { index: '6', text: 'Yêu cầu phi chức năng (Non-Functional Requirements)', href: '#sec-6', level: 2 },
    { index: '6.1', text: 'Hiệu năng & Tải đồng thời', href: '#sec-6-1', level: 3 },
    { index: '6.2', text: 'An toàn dữ liệu & Sao lưu dự phòng', href: '#sec-6-2', level: 3 },
    { index: '6.3', text: 'Bảo mật & Tuân thủ pháp lý (Nghị định 13/2023/NĐ-CP)', href: '#sec-6-3', level: 3 },
    { index: '6.4', text: 'Độ tin cậy & Tính sẵn sàng cao', href: '#sec-6-4', level: 3 },
    { index: '7', text: 'Kế hoạch nghiệm thu & Chuyển giao hệ thống', href: '#sec-7', level: 2 },
    { index: '7.1', text: 'Tiêu chí nghiệm thu kỹ thuật', href: '#sec-7-1', level: 3 },
    { index: '7.2', text: 'Quy trình đào tạo & Bàn giao 6 Ban', href: '#sec-7-2', level: 3 },
    { index: '8', text: 'Phụ lục (Appendices)', href: '#sec-8', level: 2 },
    { index: '8.A', text: 'Phụ lục A: Ma trận truy vết 37 Functional Node ID', href: '#sec-8-a', level: 3 },
    { index: '8.B', text: 'Phụ lục B: 6 Biểu đồ tuần tự nghiệp vụ chuyên sâu', href: '#sec-8-b', level: 3 },
  ];

  const html = buildHtmlA4Document({
    docCode: 'CEO1983/BRD-ALL-V7.0',
    version: '7.0',
    date: '05/11/2026',
    title: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)',
    subtitle: 'Hệ Sinh Thái Số Hóa Toàn Diện Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) — Cổng Quản Trị Web CRM & Ứng Dụng Di Động CEO 1983',
    organization: 'Ban Chấp Hành CLB Doanh Nhân CEO 1983 (HanoiBA)',
    author: 'ViConnect Technology Solutions Co., Ltd',
    classification: 'Bảo Mật Nội Bộ — Văn Kiện Căn Cứ Nghiệp Vụ & Nghiệm Thu Kỹ Thuật',
    contentHtml,
    tocItems
  });

  const outDoc = path.join(DOC_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.html');
  const outFe = path.join(FE_DOCS_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.html');
  fs.writeFileSync(outDoc, html, 'utf8');
  fs.writeFileSync(outFe, html, 'utf8');
  console.log('✓ Đã xuất thành công BRD HTML:');
  console.log('  -', outDoc);
  console.log('  -', outFe);
}

// Convert SRS V7.md to HTML
function convertSrsV7() {
  const mdPath = path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.md');
  if (!fs.existsSync(mdPath)) {
    console.error('Không tìm thấy tệp:', mdPath);
    return;
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const contentHtml = parseMarkdownToHtmlContent(md);

  const tocItems = [
    { index: '1', text: 'GIỚI THIỆU (INTRODUCTION)', href: '#1-gioi-thieu-introduction', level: 2 },
    { index: '1.1', text: 'Mục đích (Purpose)', href: '#11-muc-dich-purpose', level: 3 },
    { index: '1.2', text: 'Phạm vi dự án (Scope)', href: '#12-pham-vi-du-an-scope', level: 3 },
    { index: '1.3', text: 'Thuật ngữ & Từ viết tắt', href: '#13-thuat-ngu-tu-viet-tat-definitions-acronyms-and-abbreviations', level: 3 },
    { index: '1.4', text: 'Tài liệu tham khảo (References)', href: '#14-tai-lieu-tham-khao-references', level: 3 },
    { index: '1.5', text: 'Tổng quan tài liệu (Overview)', href: '#15-tong-quan-tai-lieu-overview', level: 3 },
    { index: '2', text: 'MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)', href: '#2-mo-ta-tong-quan-overall-description', level: 2 },
    { index: '2.1', text: 'Góc nhìn hệ thống (Product Perspective)', href: '#21-goc-nhin-he-thong-product-perspective', level: 3 },
    { index: '2.2', text: 'Chức năng sản phẩm (Product Functions Summary)', href: '#22-chuc-nang-san-pham-product-functions-summary', level: 3 },
    { index: '2.3', text: 'Đặc điểm người dùng (User Classes)', href: '#23-dac-diem-nguoi-dung-user-classes-and-characteristics', level: 3 },
    { index: '2.4', text: 'Môi trường vận hành (Operating Environment)', href: '#24-moi-truong-van-hanh-operating-environment', level: 3 },
    { index: '2.5', text: 'Giới hạn và ràng buộc (Constraints)', href: '#25-gioi-han-va-rang-buoc-design-and-implementation-constraints', level: 3 },
    { index: '3', text: 'CÁC YÊU CẦU VỀ GIAO DIỆN BÊN NGOÀI', href: '#3-cac-yeu-cau-ve-giao-dien-ben-ngoai-external-interface-requirements', level: 2 },
    { index: '3.1', text: 'Giao diện người dùng (User Interfaces - UI)', href: '#31-giao-dien-nguoi-dung-user-interfaces---ui', level: 3 },
    { index: '3.2', text: 'Giao diện phần cứng (Hardware Interfaces)', href: '#32-giao-dien-phan-cung-hardware-interfaces', level: 3 },
    { index: '3.3', text: 'Giao diện phần mềm (Software Interfaces)', href: '#33-giao-dien-phan-mem-software-interfaces', level: 3 },
    { index: '3.4', text: 'Giao diện giao tiếp (Communications Interfaces)', href: '#34-giao-dien-giao-tiep-communications-interfaces', level: 3 },
    { index: '4', text: 'CÁC YÊU CẦU CHỨC NĂNG CHI TIẾT (11 MODULES)', href: '#4-cac-yeu-cau-chuc-nang-chi-tiet-system-features', level: 2 },
    { index: '4.1', text: 'Module 4.1: Định danh Hội viên, Thẻ VIP Số & NFC', href: '#module-41-quan-ly-dinh-danh-hoi-vien-the-vip-so-nfc-tap-to-connect', level: 3 },
    { index: '4.2', text: 'Module 4.2: Sàn Giao thương B2B & Deal Chào giá', href: '#module-42-san-giao-thuong-b2b-chia-se-co-hoi-kinh-doanh-deal-chao-gia', level: 3 },
    { index: '4.3', text: 'Module 4.3: Quản lý Sự kiện & Check-in QR 1 Giây', href: '#module-43-quan-ly-su-kien-dien-dan-diem-danh-check-in-qr-1-giay-vi-dien-tu', level: 3 },
    { index: '4.4', text: 'Module 4.4: Danh bạ Doanh nhân & Kết nối 2 Cấp', href: '#module-44-danh-ba-doanh-nhan-1983-ket-noi-ban-be-2-cap', level: 3 },
    { index: '4.5', text: 'Module 4.5: Trợ lý AI Điều hành & Báo cáo con', href: '#module-45-tro-ly-ai-dieu-hanh-toan-dien-crm-xuat-bao-cao-con', level: 3 },
    { index: '4.6', text: 'Module 4.6: Cấu hình AI Đa hãng & Token Quota', href: '#module-46-cau-hinh-he-thong-ai-da-hang-do-luong-quota-token-canh-bao-sap-het-model', level: 3 },
    { index: '4.7', text: 'Module 4.7: Landing Web & Đăng ký Gia nhập Online', href: '#module-47-landing-web-gioi-thieu-chinh-thuc-intro-dang-ky-gia-nhap-online', level: 3 },
    { index: '4.8', text: 'Module 4.8: Kho Tài liệu Đồng bộ Google Drive 2 Chiều', href: '#module-48-kho-tai-lieu-so-dong-bo-google-drive-2-chieu-crm-mobile-app', level: 3 },
    { index: '4.9', text: 'Module 4.9: Chia sẻ Mạng Xã hội Thẻ OpenGraph Động', href: '#module-49-chia-se-mang-xa-hoi-da-kenh-voi-the-opengraph-preview-dong', level: 3 },
    { index: '4.10', text: 'Module 4.10: Quản lý Tài chính, Thu Chi & Hội phí', href: '#module-410-quan-ly-tai-chinh-thu-chi-hoi-phi-nien-liem', level: 3 },
    { index: '4.11', text: 'Module 4.11: Quản trị Cấu hình Hệ thống & RBAC', href: '#module-411-quan-tri-cau-hinh-he-thong-ten-mien-theme-studio-phan-quyen-rbac', level: 3 },
    { index: '5', text: 'YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)', href: '#5-yeu-cau-phi-chuc-nang-non-functional-requirements', level: 2 },
    { index: '5.1', text: 'Hiệu năng (Performance Requirements)', href: '#51-yeu-cau-ve-hieu-nang-performance-requirements', level: 3 },
    { index: '5.2', text: 'An toàn dữ liệu (Safety & Recovery)', href: '#52-yeu-cau-ve-an-toan-phuc-hoi-du-lieu-safety-disaster-recovery', level: 3 },
    { index: '5.3', text: 'Bảo mật (Security Requirements)', href: '#53-yeu-cau-ve-bao-mat-security-requirements', level: 3 },
    { index: '5.4', text: 'Thuộc tính chất lượng (Quality Attributes)', href: '#54-thuoc-tinh-chat-luong-phan-mem-software-quality-attributes', level: 3 },
    { index: '6', text: 'CÁC YÊU CẦU KHÁC & PHỤ LỤC (APPENDICES)', href: '#6-cac-yeu-cau-khac-phu-luc-other-requirements-appendices', level: 2 },
    { index: '6.A', text: 'Phụ lục A: Mô hình ERD CSDL', href: '#phu-luc-a-mo-hinh-hoa-du-lieu-thuc-the-data-model-erd-diagram', level: 3 },
    { index: '6.B', text: 'Phụ lục B: 6 Biểu đồ tuần tự Sequence Diagrams', href: '#phu-luc-b-cac-bieu-do-tuan-tu-nghiep-vu-cot-loi-sequence-diagrams', level: 3 },
    { index: '6.C', text: 'Phụ lục C: Ma trận truy vết 37 Functional Node ID', href: '#phu-luc-c-ma-tran-truy-vet-yeu-cau-nghiem-thu-37-functional-node-id', level: 3 }
  ];

  const html = buildHtmlA4Document({
    docCode: 'CEO1983/SRS-ALL-V7.0',
    version: '7.0',
    date: '05/11/2026',
    title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)',
    subtitle: 'Software Requirements Specification — Hệ Sinh Thái Số Hóa Toàn Diện Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA)',
    organization: 'Ban Chấp Hành CLB Doanh Nhân CEO 1983 (HanoiBA)',
    author: 'ViConnect Technology Solutions Co., Ltd',
    classification: 'Bảo Mật Nội Bộ — Văn Kiện Căn Cứ Lập Trình & Kiểm Thử Phần Mềm',
    contentHtml,
    tocItems
  });

  const outDoc = path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.html');
  const outFe = path.join(FE_DOCS_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.html');
  fs.writeFileSync(outDoc, html, 'utf8');
  fs.writeFileSync(outFe, html, 'utf8');
  console.log('✓ Đã xuất thành công SRS HTML:');
  console.log('  -', outDoc);
  console.log('  -', outFe);
}

console.log('Đang chuyển đổi tài liệu sang HTML A4...');
convertBrdV7();
convertSrsV7();
console.log('--- HOÀN TẤT XUẤT BẢN HTML A4 CHUẨN IN ẤN VÀ HIỂN THỊ TRÌNH DUYỆT! ---');

