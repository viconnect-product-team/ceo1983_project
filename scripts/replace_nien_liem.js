const fs = require('fs');
const path = require('path');

const TARGET_FILES = [
  'document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md',
  'document/SRS_01_Web_CRM_CEO1983.md',
  'document/SRS_02_App_Hiep_Hoi_CEO1983.md',
  'document/HDSD_HE_THONG_CEO1983_TOAN_DIEN.html',
  'document/HDSD_HE_THONG_CEO1983_TOAN_DIEN.md',
  'document/TESTCASE_CHI_TIET_CEO1983_QA_LEADER.md',
  'document/TIEN_DO_CONG_VIEC_APP_HIEP_HOI_CHI_TIET.md',
  'document/TIEN_DO_CONG_VIEC_WEB_CRM.md',
  'document/TIEN_DO_CONG_VIEC_APP_HIEP_HOI.md',
  'document/TAI_LIEU_PHAN_TICH_NGHIEP_VU_TOAN_DIEN_VICONNECT_CEO1983_VIONE.md',
  'document/TAI_LIEU_NGHIEP_VU_APP_HIEP_HOI_CEO1983.md',
  'document/QUY_CHUAN_GIAO_DIEN_WEB_CRM_CEO1983.md',
  'document/tai-lieu-huong-dan-su-dung.md',
  'scripts/build_master_srs_word_and_md.js',
  'scripts/doc1_web_crm_ceo1983.js',
  'scripts/doc2_app_hiep_hoi_ceo1983.js',
  'scripts/build_master_user_guide_pdf.js'
];

let totalReplaced = 0;

for (const relPath of TARGET_FILES) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  const countBefore = (content.match(/hội phí thường niên/gi) || []).length;
  if (countBefore === 0) continue;

  // Replacements preserving context
  content = content
    .replace(/hội phí thường niên/gi, 'hội phí thường niên')
    .replace(/hội phí thường niên/g, 'Hội Phí Thường Niên')
    .replace(/hội phí thường niên/g, 'HỘI PHÍ THƯỜNG NIÊN')
    .replace(/đóng hội phí thường niên/gi, 'đóng hội phí thường niên')
    .replace(/đóng hội phí thường niên/g, 'Đóng Hội Phí Thường Niên')
    .replace(/đóng hội phí thường niên/g, 'ĐÓNG HỘI PHÍ THƯỜNG NIÊN')
    .replace(/hạn hội phí/gi, 'hạn hội phí')
    .replace(/hạn hội phí/g, 'Hạn Hội Phí')
    .replace(/kỳ hội phí/gi, 'kỳ hội phí')
    .replace(/kỳ hội phí/g, 'Kỳ Hội Phí')
    .replace(/Hội phí thường niên/g, 'Hội phí thường niên')
    .replace(/hội phí thường niên/g, 'hội phí thường niên')
    .replace(/HỘI PHÍ THƯỜNG NIÊN/g, 'HỘI PHÍ THƯỜNG NIÊN');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Replaced ${countBefore} occurrences in ${relPath}`);
  totalReplaced += countBefore;
}

console.log(`\nTổng số lượt thay thế thành công: ${totalReplaced} từ "hội phí thường niên" -> "hội phí / hội phí thường niên"!`);
