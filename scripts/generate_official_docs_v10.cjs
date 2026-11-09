/**
 * MASTER OFFICIAL DOCS GENERATOR V10.0
 * Generates official BRD, SRS, and Database/API Specification
 * in .md, .docx, and .html formats with zero diagram errors.
 */

const fs = require('fs');
const path = require('path');
const { convertMarkdownToDocx } = require('./handover_builder/convert_docx.cjs');
const { markdownToHtml } = require('./handover_builder/convert_html_pdf.cjs');

const DOCS = [
  {
    sourceMd: 'document/notebooklm/07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.md',
    baseName: '01_BRD_CEO1983_HANOIBA',
    notebooklmCopy: 'document/notebooklm/07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.docx',
    meta: {
      title: 'Tài Liệu Yêu Cầu Nghiệp Vụ Tổng Thể Hệ Thống CLB Doanh Nhân CEO 1983 (HanoiBA)',
      systemName: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TỔNG THỂ DOANH NGHIỆP (BRD)',
      subTitle: 'Tiêu chuẩn IIBA BABOK v3.0 & Nghiệp Vụ Hiệp Hội Doanh Nhân HanoiBA',
      docCode: 'BRD-CEO1983-MASTER-V10.0',
      version: 'Phiên Bản 10.0 Toàn Diện',
      date: '09/11/2026'
    }
  },
  {
    sourceMd: 'document/notebooklm/08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.md',
    baseName: '02_SRS_CEO1983_HANOIBA',
    notebooklmCopy: 'document/notebooklm/08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.docx',
    meta: {
      title: 'Tài Liệu Đặc Tả Yêu Cầu Phần Mềm Tổng Thể Hệ Thống CLB Doanh Nhân CEO 1983 (HanoiBA)',
      systemName: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ (SRS)',
      subTitle: 'Chuẩn Quốc Tế IEEE 830-1998 — Ma Trận 30 Use Cases & Bảng Quy Trình Sắc Nét',
      docCode: 'SRS-CEO1983-MASTER-V10.0',
      version: 'Phiên Bản 10.0 Toàn Diện',
      date: '09/11/2026'
    }
  },
  {
    sourceMd: 'document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.md',
    baseName: '03_THIET_KE_CSDL_VA_API_CEO1983_HANOIBA',
    notebooklmCopy: 'document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.docx',
    meta: {
      title: 'Tài Liệu Thiết Kế Cơ Sở Dữ Liệu PostgreSQL & Đặc Tả REST API Hệ Thống CEO 1983',
      systemName: 'THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & ĐẶC TẢ REST API',
      subTitle: 'Kiến Trúc Pure NestJS 3 Tầng, PostgreSQL Enterprise 113.20.107.184:6432 & 620+ Endpoints',
      docCode: 'DB-API-CEO1983-MASTER-V10.0',
      version: 'Phiên Bản 10.0 Toàn Diện',
      date: '09/11/2026'
    }
  }
];

const TARGET_DIRS = [
  path.resolve('document/handover'),
  path.resolve('document/handover/output'),
  path.resolve('apps/ceo1983_app_fe/public/docs'),
  path.resolve('document/notebooklm')
];

TARGET_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function run() {
  console.log('======================================================================');
  console.log('TIẾN TRÌNH XUẤT BẢN BỘ TÀI LIỆU MASTER V10.0 (BRD, SRS, DB & API)');
  console.log('Chuẩn Doanh Nghiệp, Không Lỗi Sơ Đồ, Tương Thích Hoàn Hảo Microsoft Word');
  console.log('======================================================================\n');

  for (const item of DOCS) {
    console.log(`\n>>> Xử lý tài liệu: ${item.baseName} (${item.meta.systemName})`);
    const mdContent = fs.readFileSync(item.sourceMd, 'utf8');

    // 1. Sao chép sang document/handover/
    const handoverMd = path.join('document/handover', `${item.baseName}.md`);
    fs.writeFileSync(handoverMd, mdContent, 'utf8');
    console.log(`1. ✓ Đồng bộ Markdown: ${handoverMd} (${(mdContent.length / 1024).toFixed(1)} KB)`);

    // 2. Xuất bản HTML
    const htmlContent = markdownToHtml(mdContent, item.meta);
    const handoverHtml = path.join('document/handover', `${item.baseName}.html`);
    const outputHtml = path.join('document/handover/output', `${item.baseName}.html`);
    fs.writeFileSync(handoverHtml, htmlContent, 'utf8');
    fs.writeFileSync(outputHtml, htmlContent, 'utf8');
    console.log(`2. ✓ Xuất bản HTML sắc nét: ${handoverHtml}`);

    // 3. Xuất bản DOCX (Word)
    const handoverDocx = path.join('document/handover', `${item.baseName}.docx`);
    const publicDocx = path.join('apps/ceo1983_app_fe/public/docs', `${item.baseName}.docx`);
    const outputDocx = path.join('document/handover/output', `${item.baseName}.docx`);
    
    await convertMarkdownToDocx(mdContent, item.meta, handoverDocx);
    fs.copyFileSync(handoverDocx, publicDocx);
    fs.copyFileSync(handoverDocx, outputDocx);
    fs.copyFileSync(handoverDocx, item.notebooklmCopy);
    console.log(`3. ✓ Đồng bộ DOCX sang public/docs & notebooklm: ${item.notebooklmCopy}`);
  }

  // Also sync document/03_DAC_TA_BACKEND_API_VA_CO_SO_DU_LIEU_POSTGRESQL.md with 09
  fs.copyFileSync(
    'document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.md',
    'document/03_DAC_TA_BACKEND_API_VA_CO_SO_DU_LIEU_POSTGRESQL.md'
  );
  console.log('\n✓ Đã đồng bộ document/03_DAC_TA_BACKEND_API_VA_CO_SO_DU_LIEU_POSTGRESQL.md');

  console.log('\n======================================================================');
  console.log('✓ TOÀN BỘ 3 TÀI LIỆU MASTER V10.0 ĐÃ ĐƯỢC XUẤT BẢN THÀNH CÔNG!');
  console.log('======================================================================');
}

run().catch(e => {
  console.error('Lỗi khi xuất tài liệu:', e);
  process.exit(1);
});

