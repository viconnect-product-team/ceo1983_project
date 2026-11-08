/**
 * RUN ALL HANDOVER SUITE GENERATOR
 * Generates all 4 Master Documents in 4 Formats: .md, .html, .docx, .pdf
 * Total 16 Handover Files for CEO 1983 Club (HanoiBA)
 */

const fs = require('fs');
const path = require('path');

const { markdownToHtml, renderHtmlToPdf } = require('./convert_html_pdf.cjs');
const { convertMarkdownToDocx } = require('./convert_docx.cjs');

const OUT_DIR_HANDOVER = path.resolve('document/handover');
const OUT_DIR_OUTPUT = path.resolve('document/handover/output');
const OUT_DIR_PUBLIC = path.resolve('apps/ceo1983_app_fe/public/docs');

[OUT_DIR_HANDOVER, OUT_DIR_OUTPUT, OUT_DIR_PUBLIC].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const DOCS_CONFIG = [
  {
    id: '01',
    baseName: '01_BRD_CEO1983_HANOIBA',
    meta: {
      title: 'Tài Liệu Yêu Cầu Nghiệp Vụ Tổng Thể Hệ Thống CLB Doanh Nhân CEO 1983 (HanoiBA)',
      systemName: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TỔNG THỂ DOANH NGHIỆP (BRD)',
      subTitle: 'Tiêu chuẩn IIBA BABOK v3.0 & Nghiệp Vụ Hiệp Hội Doanh Nhân HanoiBA',
      docCode: 'BRD-CEO1983-MASTER-HANOIBA',
      version: 'Phiên Bản 10.0 Enterprise Handover Standard',
      date: '08/11/2026'
    }
  },
  {
    id: '02',
    baseName: '02_SRS_CEO1983_HANOIBA',
    meta: {
      title: 'Tài Liệu Đặc Tả Yêu Cầu Phần Mềm Tổng Thể Hệ Thống CLB Doanh Nhân CEO 1983 (HanoiBA)',
      systemName: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ (SRS)',
      subTitle: 'Chuẩn Quốc Tế IEEE 830-1998 — Toàn Bộ 30 Use Cases Đều Có Biểu Đồ Mermaid Riêng Biệt',
      docCode: 'SRS-IEEE830-CEO1983-MASTER-HANOIBA',
      version: 'Phiên Bản 10.0 Enterprise Handover Standard',
      date: '08/11/2026'
    }
  },
  {
    id: '03',
    baseName: '03_THIET_KE_CSDL_VA_API_CEO1983_HANOIBA',
    meta: {
      title: 'Tài Liệu Thiết Kế Cơ Sở Dữ Liệu PostgreSQL & Đặc Tả REST API Hệ Thống CEO 1983',
      systemName: 'THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & ĐẶC TẢ REST API',
      subTitle: 'Kiến Trúc Pure NestJS 3 Tầng, 16 Bảng PostgreSQL & 50+ REST API Endpoints',
      docCode: 'DB-API-CEO1983-MASTER-HANOIBA',
      version: 'Phiên Bản 10.0 Enterprise Handover Standard',
      date: '08/11/2026'
    }
  },
  {
    id: '04',
    baseName: '04_HUONG_DAN_SU_DUNG_HE_THONG_CEO1983_HANOIBA',
    meta: {
      title: 'Cẩm Nang Hướng Dẫn Sử Dụng Hệ Thống Toàn Diện Web CRM & Mobile App CEO 1983',
      systemName: 'CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN',
      subTitle: 'Đặc Tả Chi Tiết Từng Chức Năng, Thao Tác Nghiệp Vụ & Ảnh Chụp Minh Họa Thực Tế',
      docCode: 'HDSD-CEO1983-MASTER-HANOIBA',
      version: 'Phiên Bản 10.0 Enterprise Handover Standard',
      date: '08/11/2026'
    }
  }
];

async function main() {
  console.log('======================================================================');
  console.log('KHỞI CHẠY TIẾN TRÌNH XUẤT BẢN TRỌN BỘ 4 TÀI LIỆU BÀN GIAO DOANH NGHIỆP');
  console.log('MỖI TÀI LIỆU XUẤT ĐỦ 4 ĐỊNH DẠNG: .MD, .HTML, .DOCX, .PDF (TỔNG CỘNG 16 FILES)');
  console.log('======================================================================\n');

  for (const doc of DOCS_CONFIG) {
    console.log(`\n----------------------------------------------------------------------`);
    console.log(`[ĐANG XỬ LÝ TÀI LIỆU ${doc.id}/04]: ${doc.meta.systemName}`);
    console.log(`----------------------------------------------------------------------`);

    const mdPathSource = path.join(OUT_DIR_HANDOVER, `${doc.baseName}.md`);
    if (!fs.existsSync(mdPathSource)) {
      throw new Error(`Không tìm thấy file nguồn Markdown: ${mdPathSource}`);
    }
    const mdContent = fs.readFileSync(mdPathSource, 'utf8');

    // 1. Sao chép Markdown sang output/
    const mdPathOutput = path.join(OUT_DIR_OUTPUT, `${doc.baseName}.md`);
    fs.copyFileSync(mdPathSource, mdPathOutput);
    console.log(`1. ✓ Đã đồng bộ .md (${(fs.statSync(mdPathSource).size / 1024).toFixed(1)} KB)`);

    // 2. Chuyển đổi sang HTML (.html)
    console.log(`2. Chuyển đổi sang HTML độc lập (.html) có nhúng CSS và Mermaid...`);
    const htmlContent = markdownToHtml(mdContent, doc.meta);
    const htmlPath1 = path.join(OUT_DIR_HANDOVER, `${doc.baseName}.html`);
    const htmlPath2 = path.join(OUT_DIR_OUTPUT, `${doc.baseName}.html`);
    fs.writeFileSync(htmlPath1, htmlContent, 'utf8');
    fs.writeFileSync(htmlPath2, htmlContent, 'utf8');
    console.log(`   ✓ Đã ghi .html (${(Buffer.byteLength(htmlContent, 'utf8') / 1024).toFixed(1)} KB)`);

    // 3. Đóng gói tài liệu Microsoft Word (.docx)
    console.log(`3. Đóng gói tài liệu Microsoft Word (.docx)...`);
    const docxPath1 = path.join(OUT_DIR_HANDOVER, `${doc.baseName}.docx`);
    const docxPath2 = path.join(OUT_DIR_OUTPUT, `${doc.baseName}.docx`);
    const docxPath3 = path.join(OUT_DIR_PUBLIC, `${doc.baseName}.docx`);
    await convertMarkdownToDocx(mdContent, doc.meta, docxPath1);
    fs.copyFileSync(docxPath1, docxPath2);
    fs.copyFileSync(docxPath1, docxPath3);
    console.log(`   ✓ Đã ghi .docx (${(fs.statSync(docxPath1).size / 1024).toFixed(1)} KB)`);

    // 4. Render PDF (.pdf) qua Playwright Chromium
    console.log(`4. Render PDF vector độ phân giải cao (.pdf) qua Playwright Chromium...`);
    const pdfPath1 = path.join(OUT_DIR_HANDOVER, `${doc.baseName}.pdf`);
    const pdfPath2 = path.join(OUT_DIR_OUTPUT, `${doc.baseName}.pdf`);
    const pdfPath3 = path.join(OUT_DIR_PUBLIC, `${doc.baseName}.pdf`);
    await renderHtmlToPdf(htmlPath1, pdfPath1);
    fs.copyFileSync(pdfPath1, pdfPath2);
    fs.copyFileSync(pdfPath1, pdfPath3);
    console.log(`   ✓ Đã ghi .pdf (${(fs.statSync(pdfPath1).size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n======================================================================');
  console.log('KIỂM TRA TÍNH TOÀN VẸN CỦA TOÀN BỘ 16 TỆP BÀN GIAO');
  console.log('======================================================================');

  let allSuccess = true;
  for (const doc of DOCS_CONFIG) {
    const exts = ['.md', '.html', '.docx', '.pdf'];
    console.log(`\n* Tài liệu [${doc.id}]: ${doc.baseName}`);
    for (const ext of exts) {
      const p = path.join(OUT_DIR_HANDOVER, `${doc.baseName}${ext}`);
      if (fs.existsSync(p)) {
        const size = fs.statSync(p).size;
        console.log(`  [OK] ${doc.baseName}${ext.padEnd(5)} | Size: ${(size / 1024).toFixed(1)} KB`);
      } else {
        console.error(`  [FAIL] Missing file: ${p}`);
        allSuccess = false;
      }
    }
  }

  if (allSuccess) {
    console.log('\n>>> XUẤT BẢN THÀNH CÔNG 100% TRỌN BỘ 4 TÀI LIỆU BÀN GIAO (16 TỆP) CHUẨN DOANH NGHIỆP! <<<');
  } else {
    console.error('\n>>> CÓ LỖI XẢY RA TRONG QUÁ TRÌNH TẠO TÀI LIỆU! <<<');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Lỗi khi chạy bộ sinh tài liệu:', err);
  process.exit(1);
});
