const fs = require('fs');
const path = require('path');

const rulesPath = path.resolve('..', 'vione_project', '.cursorrules');
if (!fs.existsSync(rulesPath)) {
  console.error('.cursorrules not found at ' + rulesPath);
  process.exit(1);
}

const ruleSection = `
- **Chuẩn Hóa Bộ Tài Liệu HDSD & SRS Toàn Diện ViOne (Phone Mockup & ISO Use Cases)**:
  - Tài liệu Hướng Dẫn Sử Dụng (\`document/HDSD_HE_THONG_VIONE_TOAN_DIEN.html\` & \`.pdf\`): Sử dụng phong cách thiết kế ViOne Luxury tone Đen Thạch Anh Obsidian (\`#0A0A0B\`), Vàng Kim Champagne (\`#D8B282\` / \`#D4AF37\`) và viền titanium. Mọi ảnh chụp giao diện Mobile App bắt buộc phải đặt trong khung mô phỏng điện thoại \`.phone-mockup\` (chiều rộng tối đa 275px, viền kim loại 8px bo góc tròn \`36px\`, notch camera Dynamic Island và bóng đổ 3D mềm mại), tuyệt đối không kéo giãn ảnh dọc sang khổ ngang tràn màn hình.
  - Bản Đặc Tả Yêu Cầu Phần Mềm SRS (\`document/SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md\` & \`.docx\`): Tuân thủ chuẩn ISO/IEC/IEEE 29148 với đầy đủ 16 Use Case (UC-01 đến UC-16), ảnh mobile tự động co tỷ lệ dọc chuẩn \`220 x 440 pt\` và ảnh CRM desktop tỷ lệ ngang \`520 x 290 pt\`.
  - Luồng Dữ Liệu Thực Tế Xuyên Suốt (FE -> BE -> DB): Mọi thao tác người dùng (hồ sơ định danh, doanh nghiệp, cơ hội kinh doanh, giao dịch thu/chi, tài liệu, lịch họp) bắt buộc kết nối trực tiếp API Backend NestJS và lưu trữ đồng bộ vào cơ sở dữ liệu PostgreSQL (\`business_identities\`, \`user_profiles\`, \`members\`, \`transactions\`). Tuyệt đối cấm sử dụng dữ liệu rác, mock tĩnh hay fake profile trên giao diện production.
`;

const content = fs.readFileSync(rulesPath, 'utf8');
if (!content.includes('Chuẩn Hóa Bộ Tài Liệu HDSD & SRS Toàn Diện ViOne')) {
  fs.appendFileSync(rulesPath, ruleSection, 'utf8');
  console.log('Appended rule section to ' + rulesPath);
} else {
  console.log('Rule section already exists in ' + rulesPath);
}
