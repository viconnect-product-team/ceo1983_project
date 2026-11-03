const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md');
let content = fs.readFileSync(filePath, 'utf8');

const addition = `
### 9.19. Quản Lý Đội Ngũ Nhân Sự Doanh Nghiệp Trực Thuộc (CRM & API Nested Personnel)
* **Bối cảnh & Tầm quan trọng**: Doanh nghiệp hội viên CEO 1983 thường cử cán bộ quản lý cấp cao, trợ lý hoặc nhân sự chuyên trách phối hợp cùng hiệp hội trong các hoạt động xúc tiến, đào tạo và sự kiện. Do đó, hệ thống mở rộng tính năng quản lý đội ngũ nhân sự trực thuộc tại chi tiết doanh nghiệp hội viên (\`/members/:id\`).
* **Đặc tả API & Dữ liệu**:
  - \`GET /members/:id/personnel\`: Trả về danh sách nhân sự trực thuộc doanh nghiệp gồm: \`id\`, \`name\`, \`position\` (Chức vụ: Phó Giám Đốc, Trợ Lý, Kế Toán Trưởng,...), \`phone\`, \`email\`, \`role_description\`, \`is_primary_contact\` (Đầu mối liên hệ chính), \`status\` (\`ACTIVE\`, \`INACTIVE\`), \`created_at\`.
  - \`POST /members/:id/personnel\`: Thêm mới nhân sự cho doanh nghiệp với validation hợp lệ về số điện thoại và email.
  - \`PUT /members/:id/personnel/:personnelId\`: Cập nhật thông tin nhân sự hoặc trạng thái công tác.
  - \`DELETE /members/:id/personnel/:personnelId\`: Thu hồi / xóa nhân sự khỏi danh sách quản lý.
* **Giao diện Tab "Đội Ngũ Nhân Sự"**: Tích hợp trực tiếp dưới trang chi tiết hội viên/doanh nghiệp, hiển thị dạng danh sách thẻ Card hoặc bảng mini, có nút "Thêm nhân sự mới" mở Drawer/Modal thao tác nhanh, hỗ trợ gán cờ "Người liên hệ chính" để nhận thông báo từ Ban Thư Ký.

### 9.20. Trung Tâm Thông Báo Quản Trị Hệ Thống, Menu Tree Sidebar & Quét Cảnh Báo Hội Phí Tự Động
* **Tái cấu trúc Sidebar Menu Tree**:
  - Tách menu "Thông báo" trên Sidebar CRM thành cấu trúc Menu Tree phân cấp rõ ràng gồm:
    + **Tất cả thông báo**: Xem dòng thời gian toàn bộ thông báo hệ thống.
    + **Cảnh báo hội phí & Tài chính**: Danh sách hội viên sắp đến hạn hội phí (trong vòng 15-30 ngày) và hội viên quá hạn cần đôn đốc.
    + **Hồ sơ hội viên chờ duyệt**: Cảnh báo tức thì khi có doanh nhân nộp đơn gia nhập mới qua landing page.
    + **Thông báo sự kiện & Đào tạo**: Cảnh báo về các lớp học hoặc sự kiện sắp diễn ra, danh sách đại biểu đăng ký mới.
    + **Cấu hình & Tự động hóa**: Thiết lập chu kỳ quét cảnh báo và mẫu thông báo đẩy.
* **Cơ chế Quét Tự Động Hội Phí & Cảnh Báo Role Admin**:
  - Hệ thống tự động kích hoạt Service quét định kỳ (Cron / Schedule Check) trạng thái hạn hội phí của tất cả hội viên.
  - Khi phát hiện hội viên sắp hết hạn (trước 30 ngày) hoặc quá hạn, hệ thống tự động sinh thông báo cảnh báo đẩy vào Notification Center cho các tài khoản mang vai trò Admin Quản Trị (\`admin\`, \`chu_tich\`, \`pho_chu_tich\`, \`ban_tai_chinh\`, \`ban_thu_ky\`).
  - Khắc phục triệt để lỗi mạng Service Worker tại endpoint \`/notifications\`, tích hợp bộ đệm an toàn và tự động retry khi mất kết nối tạm thời.

### 9.21. Tái Cấu Trúc Nhóm Quản Lý Công Việc Điều Hành: 5 Chức Năng Con Nghiệp Vụ Cụ Thể
* **Chuyển đổi từ Menu Tree hiển thị sang 5 Chức Năng Con Nghiệp Vụ**:
  - Trước đây: Nhóm công việc bị phân chia theo các dạng hiển thị (Bảng, Kanban, Lịch, Cây phòng ban) gây khó khăn trong phân công tác nghiệp.
  - Chuẩn hóa mới: Nhóm Quản Lý Công Việc (\`/tasks\`) được tổ chức thành **5 chức năng con nghiệp vụ cụ thể**:
    1. **Công việc của tôi (\`my_tasks\`)**: Chỉ hiển thị các đầu việc được giao trực tiếp cho tài khoản đang đăng nhập hoặc các việc do chính người dùng tạo.
    2. **Việc Ban Điều Hành giao (\`assigned_by_leadership\`)**: Danh sách các nhiệm vụ, chỉ đạo trọng điểm từ Chủ tịch hoặc Ban Thường trực giao cho các Ban chuyên môn.
    3. **Việc theo Ban chuyên môn (\`by_department\`)**: Phân nhóm công việc theo từng Ban (Sự kiện, Xúc tiến, Tài chính, Truyền thông, Hội viên, Thiện nguyện) với cây thư mục (Tree View) rõ ràng.
    4. **Công việc ưu tiên & Quá hạn (\`urgent_overdue\`)**: Bộ lọc tự động tập trung các đầu việc gắn cờ "Gấp", "Khẩn cấp" hoặc đã vượt quá Deadline cần xử lý ngay.
    5. **Tất cả công việc hiệp hội (\`all_tasks\`)**: Toàn cảnh các chương trình hành động của CLB CEO 1983, cho phép lọc đa chiều theo tiến độ, người phụ trách và ngày hoàn thành.
* **Tách bạch Bộ Chuyển Chế Độ Xem (View Mode Switcher)**:
  - 4 Chế độ hiển thị (Dạng Thẻ Kanban, Dạng Bảng Danh Sách, Dạng Lịch Tuần/Tháng, Dạng Cây Phòng Ban) được đưa lên thanh công cụ phía trên (\`ViewModeSwitch\`), hoạt động độc lập và áp dụng linh hoạt cho cả 5 chức năng con nghiệp vụ nêu trên.

### 9.22. Cấu Hình Gửi Tin Zalo OA Liên Kết API Dữ Liệu Thực Tế CSDL & Mã QR Check-in Điện Tử
* **Liên kết API Dữ Liệu Thực Tế (Không Hardcode Mock Data)**:
  - Khi cấu hình gửi thông báo Zalo OA (Zalo Official Account) cho các chiến dịch sự kiện hoặc đào tạo, hệ thống tự động gọi API nghiệp vụ tương ứng (\`GET /events\` hoặc \`GET /trainings\`) để nạp danh sách thực tế từ CSDL PostgreSQL.
  - Người dùng chọn trực tiếp Sự kiện hoặc Khóa đào tạo từ danh sách thực tế; hệ thống tự động điền các tham số: Tên chương trình, Thời gian bắt đầu, Địa điểm tổ chức, Giảng viên / Chủ trì, Đường dẫn tham dự trực tuyến.
* **Cơ Chế Sinh Đường Dẫn QR Check-in Điện Tử Trực Tiếp**:
  - Trong nội dung tin nhắn Zalo gửi đến từng hội viên, hệ thống không chỉ gửi thông tin văn bản thuần túy mà tự động đính kèm đường dẫn mã QR Check-in cá nhân hóa:
    \`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MÃ_HỘI_VIÊN%7CTICKET%3AMÃ_VÉ%7CPHONE%3ASĐT\`
  - Hội viên chỉ cần mở tin nhắn Zalo tại bàn lễ tân sự kiện để ban tổ chức quét mã check-in tức thì và in thẻ đại biểu tự động.

### 9.23. Chuẩn Hóa Bảng Dữ Liệu CustomTable Toàn Hệ Thống CRM: Sắp Xếp 3 Trạng Thái & 4 Thẻ KPI Gradient Figma
* **Chuẩn Hóa Component Dùng Chung \`CustomTable\`**:
  - Áp dụng chuẩn thiết kế Dashboard từ màn hình Quản lý Tài khoản (\`/accounts\`) thay thế đồng bộ cho toàn bộ các màn hình bảng biểu của CRM (Hội viên, Doanh nghiệp, Đào tạo, Sự kiện, Giao dịch B2B, Lịch hẹn, Phân quyền).
  - Tích hợp 4 Thẻ KPI Gradient Figma đặc trưng ở đầu bảng: Thẻ Xanh Navy Tổng số lượng, Thẻ Xanh Emerald Đang hoạt động, Thẻ Vàng Amber Chờ phê duyệt/Sắp diễn ra, Thẻ Xám/Đỏ Quá hạn/Cần xử lý.
* **Cơ Chế Sắp Xếp 3 Trạng Thái Trên Toàn Bộ Các Cột (Tri-State Sorting)**:
  - Mọi cột trong bảng dữ liệu đều hỗ trợ chu kỳ sắp xếp 3 bước tuần hoàn:
    1. **Tăng dần (Ascending - \`asc\`)**: Mũi tên hướng lên ▲.
    2. **Giảm dần (Descending - \`desc\`)**: Mũi tên hướng xuống ▼.
    3. **Không sắp xếp / Mặc định (None / Default)**: Hai mũi tên xám nhạt ▲▼, khôi phục thứ tự mặc định của CSDL.
  - Cơ chế này thay thế hoàn toàn tình trạng sắp xếp 2 trạng thái cũ, mang lại trải nghiệm chuẩn mực và nhất quán như phần mềm bảng tính cao cấp.
`;

if (!content.includes('### 9.19. Quản Lý Đội Ngũ Nhân Sự Doanh Nghiệp')) {
  content = content.trimEnd() + '\n' + addition + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Appended sections 9.19 to 9.23 successfully! Total length:', content.length);
} else {
  console.log('Sections 9.19 to 9.23 already present.');
}

