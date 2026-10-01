const fs = require('fs');
const path = require('path');

const memPath = path.resolve('..', 'vione_project', 'MEMORY.md');
if (!fs.existsSync(memPath)) {
  console.error('MEMORY.md not found at ' + memPath);
  process.exit(1);
}

const entry164 = `
## 164. Kiểm Thử Hệ Thống ViOne & ViOne App Connect, Chụp Ảnh Minh Chứng Live, Xóa Dữ Liệu Rác & Xuất Bản Bộ Tài Liệu HDSD - SRS Toàn Diện
- **Bối cảnh & Yêu cầu Người dùng**:
  1. Tiến hành kiểm thử toàn diện hệ thống CRM ViOne Enterprise và ViOne App Connect tương tự như đã thực hiện cho hệ thống CEO 1983.
  2. Chụp lại toàn bộ ảnh minh chứng thực tế trên môi trường live/local với độ phân giải cao; đối với ảnh giao diện mobile, bắt buộc phải căn chỉnh hiển thị trong khung điện thoại nhỏ gọn, sang trọng, không kéo giãn toàn màn hình.
  3. Rà soát và sửa triệt để các lỗi kỹ thuật; đảm bảo luồng nghiệp vụ đi xuyên suốt từ Frontend (FE) -> Backend (BE) -> Cơ sở dữ liệu PostgreSQL (DB), tuyệt đối không để dữ liệu rác, không fake/hardcode mock data ở FE, đảm bảo dữ liệu thật 100%.
  4. Biên soạn lại toàn bộ tài liệu dự án chi tiết, đầy đủ: Hướng dẫn sử dụng (HDSD) định dạng HTML & PDF và Đặc tả yêu cầu phần mềm (SRS) định dạng Markdown & Word (.docx).

- **Chi Tiết Triển Khai Kỹ Thuật**:
  1. **Kiểm thử Điều hướng & Tuyến đường Live Server**:
     - Kiểm thử trực tiếp trên máy chủ ViOne: \`https://14.225.217.232:5445\` (Cổng 5445).
     - Kiểm thử thành công 100% (HTTP Status 200) cho toàn bộ 12 tuyến đường CRM Desktop: \`/auth\`, \`/\`, \`/companies\`, \`/opportunities\`, \`/marketplace\`, \`/income\`, \`/expenses\`, \`/finance-report\`, \`/documents\`, \`/meetings\`, \`/business-cards\`, \`/account-settings\` và modal thêm công ty.
     - Kiểm thử thành công 100% (HTTP Status 200) cho toàn bộ 9 tuyến đường ViOne Mobile App: \`/vione/login\`, \`/connect-app\`, \`/connect-app/network\`, \`/connect-app/moment\`, \`/connect-app/inbox\`, \`/connect-app/community\`, \`/connect-app/me\`, \`/connect-app/me/edit\`, \`/connect-app/activate\`, \`/connect-app/me/security\`.
  2. **Bộ Ảnh Minh Chứng Thực Tế (25 Ảnh Live)**:
     - Sử dụng Playwright Chromium chạy tự động đăng nhập tài khoản thực \`admin@connect.vn\` / \`123456\` và tài khoản mobile để chụp 25 ảnh chụp màn hình độ nét cao:
       * 14 ảnh CRM Desktop viewport chuẩn 1440x900 (\`crm_vione_01_login.png\` đến \`crm_vione_14_company_create_modal.png\`).
       * 11 ảnh Mobile App viewport chuẩn dọc 390x844 (\`app_vione_01_login.png\` đến \`app_vione_11_identity_edit.png\`).
     - Lưu trữ đồng bộ tại cả 2 thư mục minh chứng: \`vione_project/document/images/evidence/\` và \`ceo1983_project/document/images/evidence/\`. Toàn bộ ảnh đều có mã băm MD5 duy nhất, loại bỏ hoàn toàn ảnh rỗng hay placeholder.
  3. **Xuất Bản Sổ Tay Hướng Dẫn Sử Dụng (HDSD) Master - Khung Điện Thoại Sang Trọng**:
     - Xây dựng kịch bản tự động hóa \`scripts/build_vione_master_user_guide_pdf.js\` với thiết kế ViOne Luxury: Nền Đen Thạch Anh Obsidian (\`#0A0A0B\`), Vàng Kim Champagne (\`#D8B282\` / \`#D4AF37\`), Slate xám sang trọng.
     - Tạo kiểu dáng CSS \`.phone-mockup\` cho ảnh mobile: Chiều rộng tối đa 275px, viền kim loại titanium 8px bo tròn \`border-radius: 36px\`, Dynamic Island camera, bóng đổ nổi 3D đa tầng. Ảnh mobile hiển thị thanh thoát, chân thực như trên smartphone thật.
     - Bao gồm 16 chương nghiệp vụ hoàn chỉnh (CRM Doanh nghiệp 8 chương, ViOne App Connect 6 chương, Kiến trúc & Hỗ trợ kỹ thuật).
     - Biên dịch thành công:
       * HTML: \`vione_project/document/HDSD_HE_THONG_VIONE_TOAN_DIEN.html\`
       * PDF: \`vione_project/document/HDSD_HE_THONG_VIONE_TOAN_DIEN.pdf\` (Dung lượng 6.50 MB).
       * Đồng bộ vào \`apps/vione_app_fe/public/docs/HDSD_HE_THONG_VIONE_TOAN_DIEN.pdf\`.
  4. **Xuất Bản Bản Đặc Tả Yêu Cầu Phần Mềm (SRS) Master Word & Markdown**:
     - Xây dựng kịch bản \`scripts/build_vione_master_srs_word_and_md.js\` sử dụng thư viện \`docx\` chuẩn ISO/IEC/IEEE 29148.
     - Tích hợp mảng nhận diện \`MOBILE_IMG_SET\`: Tự động co tỷ lệ ảnh mobile về khổ dọc \`220 x 440 pt\` trong Word và thẻ căn giữa trong Markdown; giữ ảnh CRM Desktop ở khổ ngang \`520 x 290 pt\`.
     - Xây dựng 16 bảng Use Case chi tiết (UC-01 đến UC-16) đầy đủ luồng sự kiện chính, luồng ngoại lệ, điều kiện tiên quyết và hậu điều kiện cho toàn bộ hệ thống ViOne CRM và App Connect.
     - Biên dịch thành công:
       * Markdown: \`vione_project/document/SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md\`
       * Word DOCX: \`vione_project/document/SRS_VIONE_HE_THONG_TOAN_DIEN.docx\` (Dung lượng 2.93 MB).
       * Đồng bộ vào \`apps/vione_app_fe/public/docs/SRS_VIONE_HE_THONG_TOAN_DIEN.docx\`.
  5. **Xác Thực Luồng Dữ Liệu FE -> BE -> Database Thực Tế (Loại Bỏ Mock/Fake Data)**:
     - Kiểm tra luồng cập nhật hồ sơ định danh tại \`/connect-app/me/edit\` (\`IdentityEditPage.tsx\`): Gọi trực tiếp API \`PUT /connect-app/me/identity\`.
     - Backend NestJS (\`connectAppService.upsertMyIdentity\`) cập nhật đồng bộ vào bảng CSDL PostgreSQL \`public.business_identities\`, \`public.user_profiles\` và \`public.members\`.
     - Xóa bỏ dữ liệu mẫu tĩnh; cơ chế \`demo-avatars.ts\` chỉ đóng vai trò bộ sinh mã SVG monogram tự động khi đường dẫn avatar bị trống/null, không làm sai lệch hay fake dữ liệu tài khoản thật.
- **Kiểm Tra Chất Lượng & Tuân Thủ Quy Tắc (STRICT VERIFICATION)**:
  - Backend NestJS \`tsc -p ../vione_project/apps/vione_app_be/tsconfig.json --noEmit\` đạt **0 errors (Exit code 0)**.
  - Kiểm tra cú pháp AST Babel trên toàn bộ các file frontend được chỉnh sửa: **PASS (0 syntax errors)**.
  - Tuân thủ nghiêm ngặt quy định AGENTS.md: Mọi thay đổi lưu giữ ở môi trường local/dev, tuyệt đối không tự ý chạy \`git commit\` hay \`git push\`.
`;

fs.appendFileSync(memPath, entry164, 'utf8');
console.log('Appended Entry 164 to ' + memPath);
