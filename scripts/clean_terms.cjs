const fs = require('fs');
const path = require('path');

function cleanTerms(text) {
  return text
    // Replace "thẻ VIP" and variations
    .replace(/thẻ\s+danh\s+thiếp\s+VIP\s+QR\s+3D/gi, 'Thẻ Doanh Nhân Số 3D Gyroscope')
    .replace(/thẻ\s+danh\s+thiếp\s+VIP/gi, 'thẻ danh thiếp doanh nhân số')
    .replace(/Thẻ\s+Danh\s+Thiếp\s+VIP/gi, 'Thẻ Danh Thiếp Doanh Nhân Số')
    .replace(/thẻ\s+hội\s+viên\s+VIP/gi, 'thẻ hội viên điện tử')
    .replace(/Thẻ\s+Hội\s+Viên\s+VIP/gi, 'Thẻ Hội Viên Điện Tử')
    .replace(/thẻ\s+thành\s+viên\s+VIP/gi, 'thẻ hội viên điện tử')
    .replace(/Thẻ\s+Thành\s+Viên\s+VIP/gi, 'Thẻ Hội Viên Điện Tử')
    .replace(/thẻ\s+VIP\s+3D/gi, 'thẻ doanh nhân số 3D')
    .replace(/Thẻ\s+VIP\s+3D/gi, 'Thẻ Doanh Nhân Số 3D')
    .replace(/THẺ\s+VIP\s+3D/gi, 'THẺ DOANH NHÂN SỐ 3D')
    .replace(/Thẻ\s+VIP/g, 'Thẻ Doanh Nhân Số')
    .replace(/thẻ\s+VIP/g, 'thẻ doanh nhân số')
    .replace(/THẺ\s+VIP/g, 'THẺ DOANH NHÂN SỐ')
    .replace(/thẻ\s+vip/g, 'thẻ doanh nhân số')
    .replace(/the_vip/g, 'the_doanh_nhan_so')
    .replace(/the-vip/g, 'the-doanh-nhan-so')

    // Replace "VietQR" and variations
    .replace(/Sổ\s+quỹ\s+VietQR/gi, 'Sổ quỹ mã QR ngân hàng')
    .replace(/sổ\s+quỹ\s+VietQR/gi, 'sổ quỹ mã QR ngân hàng')
    .replace(/VietQR\s+Napas247/gi, 'Mã QR Ngân Hàng Napas247')
    .replace(/vietqr\s+napas247/gi, 'mã QR ngân hàng Napas247')
    .replace(/cổng\s+VietQR/gi, 'cổng thanh toán QR ngân hàng')
    .replace(/Cổng\s+VietQR/gi, 'Cổng thanh toán QR ngân hàng')
    .replace(/mã\s+VietQR/gi, 'mã QR ngân hàng')
    .replace(/Mã\s+VietQR/gi, 'Mã QR Ngân Hàng')
    .replace(/chuẩn\s+VietQR/gi, 'chuẩn QR ngân hàng tự động')
    .replace(/VietQR/g, 'Mã QR Ngân Hàng')
    .replace(/vietqr/g, 'mã QR ngân hàng')
    .replace(/VIETQR/g, 'MÃ QR NGÂN HÀNG')
    .replace(/viet_qr/g, 'qr_ngan_hang')
    .replace(/viet-qr/g, 'qr-ngan-hang');
}

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walk(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const targetFiles = [
  ...walk('document/handover'),
  ...walk('document/notebooklm'),
  ...walk('document/sub_specs'),
  'document/BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.md',
  'document/BANG_UOC_LUONG_CONG_VIEC_CEO1983.md',
  'document/BAO_CAO_DOI_SOAT_SECURITY_PENTEST_SONARQUBE.md',
  'document/BAO_CAO_NGHIEM_THU_TIEN_DO_XU_LY_Y_KIEN_HOP_CEO1983.md',
  'document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.md',
  'document/BO_CUC_SLIDE_VA_KICH_BAN_DEMO_THU_4_CEO1983.md',
  'document/BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.md',
  'document/BRD_CEO1983_MASTER_CHINH_THUC.md',
  'document/BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md',
  'document/BRD_WEB_CRM_CEO1983.md',
  'document/HDSD_MOBILE_APP_CEO1983.md',
  'document/HDSD_WEB_CRM_CEO1983.md',
  'document/KICH_BAN_VA_SLIDE_THUYET_TRINH_THU_4_CEO1983.md',
  'document/PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.md',
  'document/PROFILE_HE_SINH_THAI_CEO1983.md',
  'document/SLIDE_APP_HIEP_HOI_CEO1983.md',
  'document/SLIDE_CRM_QUAN_TRI_CEO1983.md',
  'document/SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md',
  'document/SRS_01_Web_CRM_CEO1983.md',
  'document/SRS_02_App_Hiep_Hoi_CEO1983.md',
  'document/SRS_CEO1983_HE_THONG_TOAN_DIEN.md',
  'document/SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.md',
  'document/SRS_CEO1983_MASTER_CHINH_THUC.md',
  'document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md',
  'document/SRS_IEEE830_CEO1983_TOAN_DIEN.md',
  'document/TEST_CASES_MOBILE_APP_CEO1983.md',
  'document/TEST_CASES_TONG_THE_CEO1983.md',
  'document/TEST_CASES_WEB_CRM_CEO1983.md',
  'document/UOC_LUONG_CONG_VIEC_VA_KE_HOACH_XU_LY_Y_KIEN_HOP_CEO1983.md',
  '.cursorrules',
  'MEMORY.md'
];

let modifiedCount = 0;
for (const f of targetFiles) {
  if (fs.existsSync(f)) {
    const original = fs.readFileSync(f, 'utf8');
    const cleaned = cleanTerms(original);
    if (cleaned !== original) {
      fs.writeFileSync(f, cleaned, 'utf8');
      modifiedCount++;
      console.log('Cleaned:', f);
    }
  }
}
console.log('Finished cleaning terms in', modifiedCount, 'files.');

