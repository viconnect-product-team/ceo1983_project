import fs from 'fs';
import path from 'path';

console.log('>>> BỔ SUNG BẢNG ĐẶC TẢ CHI TIẾT TRƯỜNG DỮ LIỆU CHO CHƯƠNG 13, 15, 16...');

const filePath = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');
let html = fs.readFileSync(filePath, 'utf8');

// Bảng Chương 13: Đăng nhập CRM & Bảng điều khiển Tổng quan (Dashboard)
const tableC13 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Dữ liệu Đăng Nhập & Chỉ Số Điều Hành Dashboard:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu / Chỉ số</th>
          <th style="width: 12%;">Bắt buộc / Hiển thị</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập / Giá trị mẫu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ trong vận hành</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Email Tài khoản Quản trị</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Email</code></td>
          <td>Ví dụ: <code>admin@connect.vn</code> hoặc <code>president@ceo1983.vn</code>.</td>
          <td>Định danh tài khoản quản trị được phân quyền truy cập Cổng điều hành CRM.</td>
        </tr>
        <tr>
          <td><strong>Mật khẩu Xác thực</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Password</code></td>
          <td>Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.</td>
          <td>Bảo mật truy cập, chống xâm nhập trái phép vào cơ sở dữ liệu nội bộ hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Mã Xác thực Hai Lớp (MFA/OTP)</strong></td>
          <td>Tùy chọn cấu hình</td>
          <td><code>Number (6 số)</code></td>
          <td>Mã 6 chữ số sinh tự động từ ứng dụng Google Authenticator.</td>
          <td>Bảo vệ cấp cao cho tài khoản Chủ tịch, Tổng Thư ký và Ban Tài chính.</td>
        </tr>
        <tr>
          <td><strong>Chỉ số Tổng Hội viên Chính thức</strong></td>
          <td>Hiển thị tự động</td>
          <td><code>Counter (Số nguyên)</code></td>
          <td>Ví dụ: 128 Hội viên (Tăng trưởng +12% so với cùng kỳ năm trước).</td>
          <td>Giám sát quy mô và sức mạnh kết nối của mạng lưới doanh nhân CEO 1983.</td>
        </tr>
        <tr>
          <td><strong>Chỉ số Hồ sơ Chờ Thẩm định</strong></td>
          <td>Hiển thị tự động (Cảnh báo)</td>
          <td><code>Counter Badge</code></td>
          <td>Ví dụ: 5 hồ sơ mới nộp trực tuyến cần duyệt.</td>
          <td>Đôn đốc Ban Hội viên thẩm tra thông tin kịp thời, không để tồn đọng hồ sơ.</td>
        </tr>
        <tr>
          <td><strong>Chỉ số Tổng Quỹ Niên Liễm Đã Thu</strong></td>
          <td>Hiển thị tự động</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>Ví dụ: 1.250.000.000 VNĐ (Đạt 85% kế hoạch ngân sách năm).</td>
          <td>Kiểm soát dòng tiền thực tế phục vụ các chương trình xúc tiến thương mại và an sinh.</td>
        </tr>
        <tr>
          <td><strong>Chỉ số Tỷ lệ Hoàn thành KPI Ban</strong></td>
          <td>Hiển thị tự động</td>
          <td><code>Percentage (%)</code></td>
          <td>Ví dụ: 94.2% nhiệm vụ hoàn thành đúng hạn.</td>
          <td>Đo lường năng suất làm việc của 6 ban chuyên môn và các chi hội trực thuộc.</td>
        </tr>
        <tr>
          <td><strong>Bộ lọc Kỳ báo cáo & Ban/Chi hội</strong></td>
          <td>Tùy chọn lọc</td>
          <td><code>Select Dropdown</code></td>
          <td>Tùy chọn: Hôm nay, Tháng này, Quý này, Năm tài chính; Lọc theo từng Ban.</td>
          <td>Hỗ trợ Ban Thường trực phân tích dữ liệu chuyên sâu để ra quyết định điều hành.</td>
        </tr>
      </tbody>
    </table>
`;

// Bảng Chương 15: Quản trị Tài khoản Vận hành & Ma trận Phân quyền RBAC
const tableC15 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Hộp thoại Cấp Tài Khoản & Ma Trận Phân Quyền RBAC:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập / Giá trị mẫu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ trong vận hành</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Họ và Tên Nhân sự Vận hành</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Hoàng Tuấn Anh (Ban Thư ký).</td>
          <td>Định danh cá nhân cán bộ trực tiếp thực thi thao tác trên hệ thống.</td>
        </tr>
        <tr>
          <td><strong>Email Đăng nhập Công vụ</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Email</code></td>
          <td>Ví dụ: <code>thuky@ceo1983.vn</code>.</td>
          <td>Tài khoản định danh duy nhất dùng để đăng nhập và nhận thông báo công việc.</td>
        </tr>
        <tr>
          <td><strong>Mật khẩu Khởi tạo Ban đầu</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Password</code></td>
          <td>Mật khẩu tạm cấp lần đầu, hệ thống yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.</td>
          <td>Đảm bảo tính bảo mật và quyền kiểm soát tài khoản của cá nhân cán bộ.</td>
        </tr>
        <tr>
          <td><strong>Số Điện thoại Liên lạc Khẩn cấp</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Phone (10 số)</code></td>
          <td>Ví dụ: <code>0912345678</code>.</td>
          <td>Gửi mã OTP xác thực và liên lạc trực tiếp khi phát sinh cảnh báo bảo mật.</td>
        </tr>
        <tr>
          <td><strong>Vai trò Vận hành (Role)</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Super Admin, President, Head Dept, Secretary, Treasurer, Member.</td>
          <td>Quy định mức độ phân quyền và các tính năng nghiệp vụ được phép thao tác.</td>
        </tr>
        <tr>
          <td><strong>Đơn vị / Ban Chuyên môn Trực thuộc</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn Ban Thường trực, Ban Xúc tiến TM, Ban Sự kiện, Ban Hội viên...</td>
          <td>Giới hạn phạm vi dữ liệu cán bộ được phép xem và xử lý theo đúng chức năng.</td>
        </tr>
        <tr>
          <td><strong>Trạng thái Tài khoản</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Toggle Switch</code></td>
          <td>Hoạt động (Active) / Tạm khóa (Suspended).</td>
          <td>Cho phép đóng/mở quyền truy cập ngay lập tức khi cán bộ thay đổi vị trí công tác.</td>
        </tr>
        <tr>
          <td><strong>Ma trận Quyền Chi tiết (RBAC Matrix)</strong></td>
          <td>Cấu hình động</td>
          <td><code>Checkbox Grid (40+ quyền)</code></td>
          <td>Tích chọn quyền: Xem, Thêm mới, Chỉnh sửa, Xóa, Duyệt chi, Xuất file Excel...</td>
          <td>Phân quyền sâu 2 cột cố định (Mã quyền & Tên tính năng), chống chồng chéo quyền hạn.</td>
        </tr>
      </tbody>
    </table>
`;

// Bảng Chương 16: Quản lý Hồ sơ & Quy trình Thẩm định Phê duyệt Hội viên
const tableC16 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Hồ Sơ Doanh Nhân & Tiêu Chí Thẩm Định Hội Viên:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập / Giá trị mẫu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ trong vận hành</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Mã Số Hội Viên Định Danh</strong></td>
          <td>Sinh tự động (*)</td>
          <td><code>Code</code></td>
          <td>Định dạng: <code>CEO1983-HN-0088</code> (Gồm tiền tố hiệp hội + số thứ tự).</td>
          <td>Mã số duy nhất toàn quốc, gắn liền với Thẻ VIP điện tử và mã QR vCard cá nhân.</td>
        </tr>
        <tr>
          <td><strong>Họ và Tên Doanh nhân</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Nguyễn Văn Hưng. Viết hoa chuẩn tiếng Việt có dấu.</td>
          <td>Định danh cá nhân hội viên trong danh bạ, kỷ yếu và giấy chứng nhận hội viên.</td>
        </tr>
        <tr>
          <td><strong>Năm Sinh & Giới tính</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Year + Radio</code></td>
          <td>Năm sinh: 1983 (Tuổi Quý Hợi). Giới tính: Nam / Nữ.</td>
          <td>Thẩm định điều kiện tiên quyết về độ tuổi đồng niên theo đúng Tôn chỉ Hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Tên Doanh nghiệp & Mã Số Thuế</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Text + MST</code></td>
          <td>Ví dụ: Công ty Cổ phần Công nghệ ABC Việt Nam - MST: <code>0108999888</code>.</td>
          <td>Xác thực pháp nhân doanh nghiệp đang hoạt động hợp pháp, đóng thuế đầy đủ.</td>
        </tr>
        <tr>
          <td><strong>Chức vụ Quản trị Cao nhất</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chủ tịch HĐQT, Tổng Giám đốc, Giám đốc điều hành, Sáng lập viên...</td>
          <td>Đảm bảo tư cách lãnh đạo doanh nghiệp đủ thẩm quyền ra quyết định hợp tác kinh tế.</td>
        </tr>
        <tr>
          <td><strong>Lĩnh vực Ngành nghề Trọng tâm</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Bất động sản, Xây dựng, Công nghệ, Y tế, Giáo dục, Sản xuất, Xuất nhập khẩu...</td>
          <td>Phân loại nhóm ngành phục vụ kết nối giao thương B2B và giới thiệu cơ hội đầu tư.</td>
        </tr>
        <tr>
          <td><strong>Ảnh Chân dung Doanh nhân</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>File (JPG/PNG)</code></td>
          <td>Ảnh chân dung chụp chuyên nghiệp, trang phục veston lịch lãm, nền sáng màu.</td>
          <td>In trên Thẻ VIP Doanh nhân điện tử và danh bạ B2B toàn hệ sinh thái.</td>
        </tr>
        <tr>
          <td><strong>Quyết định Phê duyệt Tư cách</strong></td>
          <td class="req">Bắt buộc (*)</td>
          <td><code>Action Buttons</code></td>
          <td>Nút: <em>[Phê Duyệt Chính Thức]</em> hoặc <em>[Từ Chối Kèm Lý Do]</em>.</td>
          <td>Ban Hội viên chốt kết quả thẩm tra; hệ thống tự động gửi email thông báo chúc mừng.</td>
        </tr>
        <tr>
          <td><strong>Ghi chú Nhận xét Thẩm tra</strong></td>
          <td>Tùy chọn</td>
          <td><code>Textarea</code></td>
          <td>Ghi chú quá trình xác minh, người bảo lãnh trong hiệp hội (nếu có).</td>
          <td>Lưu vết hồ sơ thẩm định làm cơ sở biểu quyết kết nạp của Ban Chấp hành.</td>
        </tr>
      </tbody>
    </table>
`;

// Chèn tableC13 vào trước đoạn shot-wrap của crm-c13
html = html.replace(
  '<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_01_login.png"',
  tableC13 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_01_login.png"'
);

// Chèn tableC15 vào trước đoạn shot-wrap của crm-c15
html = html.replace(
  '<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_04_accounts.png"',
  tableC15 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_04_accounts.png"'
);

// Chèn tableC16 vào trước đoạn shot-wrap của crm-c16
html = html.replace(
  '<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_06_members.png"',
  tableC16 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_06_members.png"'
);

fs.writeFileSync(filePath, html, 'utf8');
console.log('>>> ĐÃ CẬP NHẬT XONG BẢNG ĐẶC TẢ CHO CHƯƠNG 13, 15, 16 VÀO FILE HTML!');
