const fs = require('fs');
const path = require('path');

const memoryPath = path.resolve(__dirname, '../MEMORY.md');
const content = `

## 26. Thẩm Định Toàn Diện Hệ Thống CEO 1983 Với BRD, Xuất Bản SRS Chuẩn Quốc Tế IEEE 830 & Bộ Tài Liệu HDSD Training HTML/PDF Chuẩn UNICOM

### 26.1. Thẩm Định Nghiệp Vụ & Báo Cáo GAP Analysis Đối Chiếu Codebase vs BRD
- **Kết quả thẩm định 100% Khớp (Match):**
  - Cơ cấu tổ chức 6 Ban chuyên môn: Ban Quản Trị (\`admin@connect.vn\`), Ban Thư Ký (\`ceo.tongthuky@ceo1983.com\`), Ban Thành Viên (\`ceo.thanhvien@ceo1983.com\`), Ban Thiện Nguyện (\`ceo.thiennguyen@ceo1983.com\`), Ban Truyền Thông (\`ceo.truyenthong@ceo1983.com\`), Ban Xúc Tiến Thương Mại (\`ceo.xuctien@ceo1983.com\`).
  - Quy tắc phân quyền thẩm định: Ban Thành Viên (BTV) độc quyền thẩm định và duyệt hồ sơ kết nạp hội viên; Ban Thư Ký (BTK) tuyệt đối không có quyền duyệt kết nạp.
  - Luồng Onboarding trực tuyến từ Landing Page cấp mã \`CEO-83xxx\` và phát hành mật khẩu qua SMTP Mailer Gmail.
  - Sơ đồ ghế Cinema Seating Map (\`/events/seating\`) phân bổ bàn tiệc VIP 10 chỗ.
  - Cổng an ninh soát vé Gate Check-in QR (\`/checkin\`) phản hồi xanh lục < 0.2s và cảnh báo đỏ vé trùng/vé giả.
  - Quản trị công việc phân cấp đa dạng 5 chế độ xem (Tasks: Table, Kanban với Zoom kích thước 3 cấp, Calendar, Statistics Chart, Org Tree).
  - Điều hành cuộc họp tích hợp Zoom / Google Meet / UniWork, xử lý khẩn cấp (\`isUrgent\`) và chống trùng phòng Sapphire Hub.
  - Thẻ hội viên VIP 3D chìm logo doanh nghiệp, danh thiếp thông minh NFC và trang danh thiếp công khai (\`/card/:code\`).
  - Hộp thư doanh nhân Messenger chuẩn #0084FF kèm thẻ giao dịch Zalo OA ghim trên cùng.
- **Báo cáo trung thực hiện trạng kết nối bên thứ 3 (GAP Analysis):**
  - *VietQR & Đối soát gạch nợ:* Đã có mã QR động Napas 24/7 chứa thông tin số tài khoản MB Bank và cú pháp chuẩn, nhưng chưa có Webhook Open API ngân hàng tự động gạch nợ. Ban Kế toán / Thủ quỹ đối soát sao kê và bấm duyệt gạch nợ thủ công trong CRM (\`/fees\`).
  - *Google & Apple OAuth:* Đã có nút bấm giao diện, chưa cấu hình OAuth 2.0 Client ID chính thức, luồng thực tế dùng SĐT/Email + Mật khẩu.
  - *Họp trực tuyến:* Đang mở link hội nghị ngoài, chưa nhúng WebRTC SDK / Zoom Meeting SDK trực tiếp trong app.
  - *Bản đồ & SMS OTP:* Đang dùng mã OTP kiểm thử nội bộ (bypass/dev), chưa kết nối tổng đài viễn thông SMS Brandname.

### 26.2. Xuất Bản Tài Liệu SRS Chuẩn Quốc Tế IEEE 830 (\`docs/SRS_IEEE830_CEO1983_TOAN_DIEN.md\`)
- Biên soạn theo cấu trúc IEEE 830 với 5 phần tiêu chuẩn:
  1. Giới thiệu chung: Mục đích, phạm vi, thuật ngữ & viết tắt.
  2. Mô tả tổng quan: Ma trận phân quyền 5 cấp bậc, 5 User Journeys hoàn chỉnh (Onboarding, Hội phí, Sự kiện Gala & QR Pass, Giao thương B2B, Biểu quyết đại hội), môi trường hoạt động.
  3. Yêu cầu chức năng chi tiết: 16 Modules MECE phân rã từ Epic đến Feature/Sub-feature, mỗi chức năng gồm ID, Tên, Actor, Input, Logic xử lý, Output, Luồng ngoại lệ.
  4. Yêu cầu phi chức năng: Hiệu năng API P95 < 200ms, Check-in < 0.2s, Bảo mật TLS 1.3, bcrypt, JWT tokens, Usability Executive Cobalt Navy & Champagne Gold, Reliability ACID PostgreSQL, Backup tự động.
  5. Yêu cầu giao tiếp hệ thống: VietQR Napas, SMTP Mailer, MinIO S3, Nginx Reverse Proxy, Realtime WebSocket.

### 26.3. Xuất Bản Bộ Tài Liệu HDSD Đào Tạo HTML/PDF (\`docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html\`)
- Tuân thủ nghiêm ngặt Playbook 18 & UNICOM System:
  - Trang bìa Cover đúng chuẩn 1 trang A4 (210x297mm) khi in.
  - Định dạng dải dài \`.trn-doc\`, mỗi chương lớn bắt đầu trang mới khi in (\`page-break-before: always\`).
  - **Quy chuẩn hiển thị ảnh screenshot:**
    - Desktop Web CRM: Hiển thị full-width sắc nét (\`.shot img\`).
    - App Di Động CEO 1983: Hiển thị chuẩn theo kích thước dọc của điện thoại thông minh (\`.shot-mobile-card\` / \`.phone-mockup\` rộng 275px, viền máy điện thoại bo tròn góc, Dynamic Island), không kéo dãn vỡ tỉ lệ.
  - Tích hợp đầy đủ các minh chứng hình ảnh thực tế từ CSDL ảnh \`images/evidence/\` chụp từ dev server \`https://14.225.217.232:5443\` và \`https://14.225.217.232:5444\`.
`;

fs.appendFileSync(memoryPath, content, 'utf8');
console.log('Đã cập nhật MEMORY.md thành công.');
