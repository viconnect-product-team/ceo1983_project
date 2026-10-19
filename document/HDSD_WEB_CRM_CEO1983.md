# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN TRỊ CRM (HDSD - WEB CRM)
## DÀNH CHO LÃNH ĐẠO, BAN ĐIỀU HÀNH & BAN THƯ KÝ CEO 1983
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026*

---

### BÀI 1: ĐĂNG NHẬP & THIẾT LẬP AN TOÀN TÀI KHOẢN
1. Truy cập đường dẫn Cổng Quản trị CRM.
2. Nhập Email hoặc Tên đăng nhập và Mật khẩu được cấp.
3. Nhận diện chức vụ điều hành và quyền hạn tức thời.

### BÀI 2: QUẢN TRỊ PHÂN QUYỀN MA TRẬN & THEO BAN CHUYÊN MÔN
1. **Phân quyền theo Ban chuyên môn (Tab 1)**:
   - Danh sách hội viên được nhóm trực quan theo 7 Ban: Ban Điều Hành, Ban Thư Ký, Ban Thành Viên, Ban Xúc Tiến Thương Mại, Ban Truyền Thông, Ban Tài Chính, Ban Thiện Nguyện.
   - Khi hội viên được gán vào ban, quyền hạn tương ứng của ban đó tự động được kế thừa tức thời.
   - Thao tác nhanh: Tìm kiếm theo tên/email, lọc nhanh theo ban, đổi ban hoặc vai trò trực tiếp (`PATCH /api/members/:id/role-dept`).
2. **Ma trận Phân quyền Nâng cao (Tab 2)**:
   - Tích chọn hoặc bỏ tích các quyền thao tác cho từng vai trò theo 5 quyền cốt lõi (Xem, Thêm, Sửa, Xóa, Duyệt).
   - Bao quát toàn bộ 10 nhóm tính năng ứng dụng di động: Profile & Thẻ danh thiếp số, Danh bạ hội viên & Tìm kiếm đối tác, Kết nối giao thương 1-on-1, Moments mạng xã hội nội bộ B2B, Tin tức & Thông báo hiệp hội, Sự kiện & Quét vé QR, Họp BCH & Điểm danh Sapphire Hub, Gian hàng Marketplace & Báo giá, Quản lý công việc & Giao việc Kanban, Khảo sát & Biểu quyết số.
3. **Quản lý phòng ban/ban chuyên môn (Tab 3)**:
   - Xem cấu trúc, số lượng thành viên và trưởng ban phụ trách từng ban chuyên trách.

### BÀI 3: QUY TRÌNH GIAO VIỆC & THEO DÕI TIẾN ĐỘ NHIỆM VỤ
1. Bấm nút "+ Giao việc mới":
   - Chọn Tiêu đề và Mục tiêu công việc.
   - Chọn Ban phụ trách (hệ thống tự động khóa theo đúng quyền hạn của bạn).
   - Chọn Người phụ trách và Người phối hợp (chỉ hiển thị những người thuộc ban bạn có quyền giao việc).
   - Tải lên tệp đính kèm: Hỗ trợ tệp Word (.doc, .docx), Excel (.xls, .xlsx), PDF (.pdf) hoặc hình ảnh.
   - Nhập Dự toán kinh phí và các Tiêu chí nghiệm thu công việc.
2. Bấm "Khởi tạo công việc": Người được giao việc sẽ lập tức nhận thông báo trên điện thoại.

### BÀI 4: QUẢN TRỊ HỘI VIÊN CHUẨN & QUY TRÌNH KẾT NẠP AN TOÀN
1. **Quy chuẩn tiếp nhận duy nhất**:
   - Để đảm bảo tính minh bạch và bảo mật dữ liệu, hệ thống **không cho phép tạo hội viên tùy tiện thủ công trong CRM**.
   - 100% hồ sơ hội viên mới phải đăng ký công khai qua Cổng thông tin Hiệp hội (`/register` hoặc `/landing`).
2. **Duyệt hồ sơ & Cấp tài khoản tự động**:
   - Ban Thư Ký và Ban Thành Viên vào danh sách Hội viên duyệt hồ sơ (`approveMemberAndSendCredentials`).
   - Hệ thống tự động khởi tạo tài khoản với cờ `must_change_password = true`, sinh mật khẩu tạm thời ngẫu nhiên an toàn và gửi thư kích hoạt kèm mã QR và hướng dẫn đăng nhập đến email hội viên.

### BÀI 5: XUẤT NHẬP DỮ LIỆU EXCEL BÁO CÁO TÀI CHÍNH & NHÀ TÀI TRỢ
1. **Báo cáo Thu - Chi & Sổ quỹ Tài chính (`/finance-report`)**:
   - **Xuất Excel (.xlsx)**: Xuất toàn bộ phiếu thu/chi, số dư lũy kế chuẩn Sổ quỹ tiền mặt Mẫu S07-DN theo Thông tư 200/2014/TT-BTC kèm đầy đủ 3 chữ ký số lãnh đạo (Người lập, Thủ quỹ, Kế toán trưởng).
   - **Nhập File Excel**: Hỗ trợ nhập tệp `.xlsx` hoặc `.csv`, hệ thống tự động bóc tách ngày chứng từ, mã giao dịch, hạng mục, số tiền, phương thức và ghi nhận trực tiếp vào CSDL.
2. **Quản lý Nhà tài trợ & Báo cáo Tài trợ (`/sponsors` & `/sponsor-report`)**:
   - **Xuất Báo cáo Tài trợ (.xlsx)**: Tự động kết xuất bảng tổng hợp nhà tài trợ theo hạng (Kim Cương, Bạch Kim, Vàng, Bạc, Đồng), giá trị hợp đồng, trạng thái thanh toán và thông tin đầu mối liên hệ.
   - **Nhập Dữ liệu Nhà tài trợ từ Excel**: Sử dụng modal chuyên dụng `SponsorExcelImportModal` với công nghệ bóc tách tự động tên đơn vị, phân hạng tài trợ, gói tài trợ, email, điện thoại, số tiền, ngày bắt đầu và trạng thái; có bảng preview kiểm tra trước khi lưu vào CSDL.

