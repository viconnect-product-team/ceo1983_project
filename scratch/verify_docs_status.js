const fs = require('fs');
const path = require('path');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/document';
const targets = [
  'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx',
  'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html',
  'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx',
  'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html',
  'SRS_VIONE_HE_THONG_TOAN_DIEN.docx',
  'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.docx',
  'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md',
  'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx',
  'HDSD_HE_THONG_VIONE_TOAN_DIEN.html',
  'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx',
  'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md',
  'TEST_CASES_HE_THONG_VIONE.xlsx',
  'TEST_CASES_HE_THONG_VIONE.md',
  'TIEN_DO_CONG_VIEC_VIONE.xlsx',
  'TIEN_DO_CONG_VIEC_VIONE.md'
];

console.log('=== VIONE MASTER DOCUMENTATION SUITE STATUS ===');
for (const t of targets) {
  const full = path.join(p, t);
  if (fs.existsSync(full)) {
    const s = fs.statSync(full);
    const sizeStr = s.size >= 1024 * 1024 ? (s.size / (1024 * 1024)).toFixed(2) + ' MB' : (s.size / 1024).toFixed(1) + ' KB';
    console.log(`[PASS] ${t.padEnd(45)} : ${sizeStr.padStart(10)} (Modified: ${s.mtime.toLocaleTimeString()})`);
  } else {
    console.error(`[FAIL] MISSING: ${t}`);
  }
}
