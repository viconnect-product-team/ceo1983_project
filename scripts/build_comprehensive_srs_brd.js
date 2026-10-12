const fs = require('fs');
const path = require('path');
const {
  DOC_DIR,
  DOCS_DIR,
  FE_DOCS_DIR,
  generateDocxFromMarkdown,
} = require('./docx_generator_helper');

const { getCrmSrsMarkdown } = require('./content_srs_crm');
const { getAppSrsMarkdown } = require('./content_srs_mobile');
const { getCrmBrdMarkdown } = require('./content_brd_crm');
const { getAppBrdMarkdown } = require('./content_brd_mobile');

console.log('=== KHỞI ĐỘNG XÂY DỰNG 4 BỘ TÀI LIỆU CHÍNH THỨC (BRD & SRS CHO CRM VÀ MOBILE APP) ===');

async function buildOfficialDocuments() {
  console.log('1. Khởi tạo nội dung Markdown cho đúng 4 bộ tài liệu chuẩn mực...');
  const crmSrsMd = getCrmSrsMarkdown();
  const appSrsMd = getAppSrsMarkdown();
  const crmBrdMd = getCrmBrdMarkdown();
  const appBrdMd = getAppBrdMarkdown();

  console.log('2. Lưu trữ 4 file Markdown vào document/, docs/ và public/docs/...');
  const filesToSave = [
    { name: 'SRS_WEB_CRM_CEO1983.md', content: crmSrsMd },
    { name: 'SRS_MOBILE_APP_CEO1983.md', content: appSrsMd },
    { name: 'BRD_WEB_CRM_CEO1983.md', content: crmBrdMd },
    { name: 'BRD_MOBILE_APP_CEO1983.md', content: appBrdMd },
  ];

  for (const f of filesToSave) {
    fs.writeFileSync(path.join(DOC_DIR, f.name), f.content, 'utf8');
    fs.writeFileSync(path.join(DOCS_DIR, f.name), f.content, 'utf8');
    fs.writeFileSync(path.join(FE_DOCS_DIR, f.name), f.content, 'utf8');
  }
  console.log('✓ Đã lưu thành công 4 file Markdown.');

  // Dọn dẹp các file master thừa nếu có để chỉ giữ đúng 4 bộ tài liệu theo yêu cầu
  const legacyFiles = [
    'SRS_TONG_THE_HE_THONG_CEO1983.md',
    'SRS_TONG_THE_HE_THONG_CEO1983.docx',
    'BRD_TONG_THE_HE_THONG_CEO1983.md',
    'BRD_TONG_THE_HE_THONG_CEO1983.docx',
  ];
  [DOC_DIR, DOCS_DIR, FE_DOCS_DIR].forEach((dir) => {
    legacyFiles.forEach((file) => {
      const p = path.join(dir, file);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch (err) {
          console.warn(`Lưu ý: Không thể xóa file cũ ${p} (có thể đang được mở hoặc khoá bởi hệ thống): ${err.message}`);
        }
      }
    });
  });

  console.log('3. Chuyển đổi toàn bộ Markdown sang tệp Microsoft Word (.docx) CÓ TRANG BÌA & MỤC LỤC...');
  const docxList = [
    {
      title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM CỔNG QUẢN TRỊ CRM (SRS - WEB CRM)',
      sub: 'HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH HIỆP HỘI CLB DOANH NHÂN CEO 1983 (HANOIBA)',
      md: crmSrsMd,
      outName: 'SRS_WEB_CRM_CEO1983.docx',
    },
    {
      title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM ỨNG DỤNG DI ĐỘNG (SRS - MOBILE APP)',
      sub: 'ỨNG DỤNG DI ĐỘNG HỘI VIÊN CLB DOANH NHÂN CEO 1983 (HANOIBA)',
      md: appSrsMd,
      outName: 'SRS_MOBILE_APP_CEO1983.docx',
    },
    {
      title: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ CỔNG QUẢN TRỊ CRM (BRD - WEB CRM)',
      sub: 'HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH HIỆP HỘI CLB DOANH NHÂN CEO 1983 (HANOIBA)',
      md: crmBrdMd,
      outName: 'BRD_WEB_CRM_CEO1983.docx',
    },
    {
      title: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ ỨNG DỤNG DI ĐỘNG HỘI VIÊN (BRD - MOBILE APP)',
      sub: 'ỨNG DỤNG DI ĐỘNG CLB DOANH NHÂN CEO 1983 (HANOIBA)',
      md: appBrdMd,
      outName: 'BRD_MOBILE_APP_CEO1983.docx',
    },
  ];

  for (const item of docxList) {
    console.log(`Đang sinh tệp Word có Trang Bìa và Mục Lục: ${item.outName}...`);
    await generateDocxFromMarkdown(item.title, item.sub, item.md, item.outName);
  }

  console.log('=== HOÀN TẤT TẤT CẢ ĐÚNG 4 BỘ TÀI LIỆU SRS & BRD (.MD VÀ .DOCX) CÓ TRANG BÌA & MỤC LỤC ===');
}

buildOfficialDocuments().catch((err) => {
  console.error('Lỗi khi sinh tài liệu:', err);
  process.exit(1);
});
