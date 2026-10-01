const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'build_all_master_slides.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove login slide from CRM_FEATURE_SLIDES
// The slide is: { eyebrow: 'CHỨC NĂNG QUẢN TRỊ 01', title: 'Cổng Đăng Nhập CRM Quản Trị & Phân Quyền Bảo Mật' ... }
code = code.replace(/\{\s*eyebrow:\s*'CHỨC NĂNG QUẢN TRỊ 01',\s*title:\s*'Cổng Đăng Nhập CRM Quản Trị & Phân Quyền Bảo Mật'[\s\S]*?\},(?=\s*\{\s*eyebrow:\s*'CHỨC NĂNG QUẢN TRỊ 02')/, '');

// Renumber CRM slides: 02 -> 01, 03 -> 02, ..., 17 -> 16
for (let i = 2; i <= 17; i++) {
  const oldNum = i < 10 ? `0${i}` : `${i}`;
  const newNum = (i - 1) < 10 ? `0${i - 1}` : `${i - 1}`;
  code = code.replace(`eyebrow: 'CHỨC NĂNG QUẢN TRỊ ${oldNum}'`, `eyebrow: 'CHỨC NĂNG QUẢN TRỊ ${newNum}'`);
}

// Clean technical jargon in CRM:
code = code.replace(
  "subtitle: 'Ban Thường Vụ độc quyền duyệt cấp mã CEO-83xxx; Ban Thư Ký bị chặn HTTP 403 Forbidden',",
  "subtitle: 'Ban Thường Vụ độc quyền duyệt cấp mã CEO-83xxx; Cơ chế bảo vệ phân quyền chặt chẽ',"
);
code = code.replace(
  "{ title: 'Chặn Chéo Ban Thư Ký (HTTP 403)', desc: 'Backend kiểm soát nghiêm ngặt, chặn mọi thao tác duyệt trái thẩm quyền của tài khoản Thư Ký.' },",
  "{ title: 'Tách Biệt Thẩm Quyền Phê Duyệt', desc: 'Hệ thống kiểm soát nghiêm ngặt theo thẩm quyền Ban Thường Vụ, tự động từ chối thao tác ngoài thẩm quyền.' },"
);
code = code.replace(
  "subtitle: 'Trang chi tiết hội viên (/members/$memberId), chấm điểm gắn kết KPI, đặt lại mật khẩu và khóa',",
  "subtitle: 'Trang chi tiết hồ sơ hội viên toàn diện, chấm điểm gắn kết KPI, đặt lại mật khẩu và phân quyền',"
);

// 2. Remove login slide from APP_FEATURE_SLIDES
// The slide is: { eyebrow: 'CHỨC NĂNG HỘI VIÊN 02', title: 'Đăng Nhập & Định Danh Doanh Nhân Bảo Mật' ... }
code = code.replace(/\{\s*eyebrow:\s*'CHỨC NĂNG HỘI VIÊN 02',\s*title:\s*'Đăng Nhập & Định Danh Doanh Nhân Bảo Mật'[\s\S]*?\},(?=\s*\{\s*eyebrow:\s*'CHỨC NĂNG HỘI VIÊN 03')/, '');

// Renumber APP slides: 03 -> 02, 04 -> 03, ..., 21 -> 20
for (let i = 3; i <= 21; i++) {
  const oldNum = i < 10 ? `0${i}` : `${i}`;
  const newNum = (i - 1) < 10 ? `0${i - 1}` : `${i - 1}`;
  code = code.replace(`eyebrow: 'CHỨC NĂNG HỘI VIÊN ${oldNum}'`, `eyebrow: 'CHỨC NĂNG HỘI VIÊN ${newNum}'`);
}

// 3. Update comments in generateCrmPptx and generateAppPptx
code = code.replace('// ADD TẤT CẢ 17 FEATURE SLIDES CRM', '// ADD TẤT CẢ 16 FEATURE SLIDES CRM');
code = code.replace('// ADD TẤT CẢ 21 FEATURE SLIDES APP', '// ADD TẤT CẢ 20 FEATURE SLIDES APP');

// 4. Update HTML CSS for mobile device wrapper to make it look like a luxury Titanium iPhone mockup
const oldCss = `.mobile-device-wrapper { width: 280px; background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 24px; padding: 12px; }
    .mobile-screen-box { width: 100%; height: 420px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
    .mobile-badge { margin-top: 10px; background: #EFF6FF; border: 1px solid #BAE6FD; padding: 6px; text-align: center; font-size: 11px; font-weight: 700; color: #003B95; border-radius: 6px; }`;

const newCss = `.mobile-device-wrapper {
      position: relative;
      width: 270px;
      height: 520px;
      background: #0F172A;
      border: 3px solid #334155;
      border-radius: 38px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 2px #1E293B;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .mobile-device-wrapper::before {
      content: '';
      position: absolute;
      top: 12px;
      width: 65px;
      height: 12px;
      background: #000000;
      border-radius: 8px;
      z-index: 10;
    }
    .mobile-device-wrapper::after {
      content: '';
      position: absolute;
      bottom: 12px;
      width: 85px;
      height: 4px;
      background: rgba(255,255,255,0.7);
      border-radius: 4px;
      z-index: 10;
    }
    .mobile-screen-box {
      width: 100%;
      height: 100%;
      background: #0F172A;
      border-radius: 30px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mobile-screen-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .mobile-badge {
      display: none;
    }`;

code = code.replace(oldCss, newCss);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✓ Successfully updated build_all_master_slides.js!');
