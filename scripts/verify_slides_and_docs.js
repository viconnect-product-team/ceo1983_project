const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIRS = [
  { name: 'vione_project/document', path: path.join(ROOT_DIR, '..', 'vione_project', 'document') },
  { name: 'ceo1983_project/document', path: path.join(ROOT_DIR, 'document') },
  { name: 'vione_project/apps/vione_app_fe/public/docs', path: path.join(ROOT_DIR, '..', 'vione_project', 'apps', 'vione_app_fe', 'public', 'docs') },
  { name: 'ceo1983_project/apps/vione_app_fe/public/docs', path: path.join(ROOT_DIR, 'apps', 'vione_app_fe', 'public', 'docs') },
  { name: 'ceo1983_project/apps/ceo1983_app_fe/public/docs', path: path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs') }
];

const MASTER_FILES = [
  // Slides
  'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx',
  'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html',
  'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md',
  'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx',
  'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html',
  'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md',
  // SRS
  'SRS_VIONE_HE_THONG_TOAN_DIEN.docx',
  'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md',
  // BRD
  'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx',
  'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md',
  // HDSD
  'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx',
  'HDSD_HE_THONG_VIONE_TOAN_DIEN.html',
  'HDSD_HE_THONG_VIONE_TOAN_DIEN.md'
];

console.log('=== KIỂM TRA ĐỒNG BỘ 13 TỆP MASTER TOÀN BỘ 5 THƯ MỤC DỰ ÁN ===\n');

let totalMissing = 0;
TARGET_DIRS.forEach(dirObj => {
  console.log(`📂 Kiểm tra thư mục: ${dirObj.name}`);
  if (!fs.existsSync(dirObj.path)) {
    console.log(`   [THƯ MỤC CHƯA TỒN TẠI] ${dirObj.path}`);
    return;
  }
  MASTER_FILES.forEach(file => {
    const fullPath = path.join(dirObj.path, file);
    if (fs.existsSync(fullPath)) {
      const sz = fs.statSync(fullPath).size;
      const szStr = sz > 1024 * 1024 ? `${(sz / (1024 * 1024)).toFixed(2)} MB` : `${(sz / 1024).toFixed(1)} KB`;
      console.log(`   ✓ ${file.padEnd(45)} [${szStr}]`);
    } else {
      console.log(`   ✗ THIẾU TỆP: ${file}`);
      totalMissing++;
    }
  });
  console.log('');
});

console.log(`=== KẾT QUẢ: ${totalMissing === 0 ? 'TẤT CẢ 13 TỆP ĐỒNG BỘ 100% (0 LỖI)' : `CÒN ${totalMissing} TỆP THIẾU`} ===`);
