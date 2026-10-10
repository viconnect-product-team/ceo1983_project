# MÔ TẢ LUỒNG XỬ LÝ CHỨC NĂNG CODE FRONTEND (FLOW SPECIFICATION)
## Phân Hệ: Frontend Web & PWA (`apps/ceo1983_app_fe`)

---

### LUỒNG 1: TRANG CHỦ & CẬP NHẬT HỒ SƠ TỨC THÌ (`association.index.tsx`)
1. **Khởi tạo dữ liệu**:
   - Sử dụng `useServerData` gọi TanStack Server Functions: `getMyMember()`, `listMyNews()`, `listMyOpportunities()`.
   - Hiển thị thanh Header hiệp hội chuẩn CEO 1983 kèm thông báo số lượng cơ hội và tin tức nổi bật.
2. **Cập nhật nhanh hồ sơ phong cách Facebook**:
   - Bấm vào ảnh đại diện hoặc nút chỉnh sửa: Mở modal `QuickProfileEditModal`.
   - Người dùng tải logo doanh nghiệp hoặc ảnh đại diện: gọi `uploadFileToNest(file, 'avatars')`, cập nhật vào state và đồng bộ RESTful API.

---

### LUỒNG 2: DANH THIẾP SỐ & KẾT NỐI B2B (`association.card.tsx` & `card.$code.tsx`)
1. **Hiển thị danh thiếp điều hành**:
   - Thẻ `Ceo1983BusinessCardVisit`: Logo doanh nghiệp dập nổi, ảnh đại diện, họ tên, chức vụ, tên công ty, mã QR định danh cá nhân.
   - Nút "Xuất ảnh danh thiếp": Sử dụng `html2canvas-pro` để chụp khung thẻ và tải xuống dạng ảnh PNG chất lượng cao.
2. **Trang quét QR công khai (`/card/:code`)**:
   - Cho phép đối tác bên ngoài quét mã QR để xem danh thiếp điện tử, lưu danh bạ VCF vào điện thoại hoặc gửi đề nghị kết nối.

---

### LUỒNG 3: DANH BẠ HỘI VIÊN & ĐÀM PHÁN 1-1 (`association.members.tsx`)
1. **Tìm kiếm & Lọc hội viên**:
   - Lọc theo Ban chuyên môn (7 Ban) và từ khóa tìm kiếm thời gian thực.
2. **Hành động kết nối**:
   - Bấm icon Nhắn tin: Chuyển hướng sang `/association/messages?peerCode=...`.
   - Bấm icon Bắt tay / Đàm phán: Kích hoạt `BusinessConnectBottomSheet` để gửi lời mời hẹn gặp 1-1 kèm mục đích kinh doanh.

---

### LUỒNG 4: SÀN CƠ HỘI KINH DOANH B2B (`association.opportunities.tsx`)
1. **Thống kê & Danh mục cơ hội**:
   - Thanh thống kê Realtime: Tổng số cơ hội, Tổng giá trị hợp đồng CRM, Tổng sản phẩm.
   - Bộ lọc theo phân loại (Hợp tác B2B, Đầu tư & Vốn, Giao thương, Cung ứng, Xuất nhập khẩu).
2. **Bóc tách Modals chuyên trách**:
   - `OpportunityDetailModal`: Hiển thị chi tiết poster, giá trị hợp đồng, danh sách hội viên đã quan tâm realtime, nút Đàm phán 1-1, Nhắn tin, Quan tâm.
   - `OpportunityCreateModal`: Đăng cơ hội mới kèm ảnh minh họa, khoảng ngân sách min/max bằng `StandardCurrencyInput`, ngành nghề, hạn chót.
   - `OpportunityEditModal`: Chỉnh sửa cơ hội của người đăng hoặc ban quản trị.

---

### LUỒNG 5: CHỢ SẢN PHẨM & BÁO GIÁ VIP (`association.products.tsx`)
1. **Gian hàng sản phẩm & Báo giá**:
   - Bóc tách Modals chuyên trách:
     * `ProductPostModal`: Đăng sản phẩm mới kèm ảnh, giá niêm yết, giá ưu đãi hội viên.
     * `ProductQuoteModal`: Gửi form yêu cầu báo giá VIP cho nhà cung cấp.
     * `ProductQuotesListModal`: Quản lý danh sách các báo giá gửi đi và nhận về.
     * `ProductEditModal`: Chỉnh sửa thông tin sản phẩm.
     * `ProductAdRegistrationModal`: Đăng ký tài trợ vị trí quảng cáo nổi bật.

---

### LUỒNG 6: SỰ KIỆN, ĐẶT VÉ & THẺ VÉ ĐẠI BIỂU SỐ (`association.events.tsx`)
1. **Danh sách sự kiện & Lịch hoạt động**:
   - Đếm ngược tới sự kiện kế tiếp qua `EventCountdownBanner`.
2. **Bóc tách Modals chuyên trách**:
   - `EventDetailModal`: Xem chương trình chi tiết, timeline, diễn giả, bản đồ địa điểm.
   - `EventRegistrationModal`: Đăng ký tham dự vé VIP / Tiêu chuẩn.
   - `EventSuccessNoticeModal`: Thông báo đăng ký thành công kèm thông tin thanh toán.
   - `EventTicketPassModal`: Hiển thị cuống vé số, mã QR vé để soát vé check-in tại bàn đón tiếp.
   - `EventRegisteredTicketsModal`: Quản lý danh sách toàn bộ các vé đã đăng ký của hội viên.

---

### LUỒNG 7: BỐC THĂM MAY MẮN & LANDING BANNER (`association.voting.tsx` & `/lucky-draw`)
1. **Landing Hero Banner Bốc Thăm**:
   - Giao diện hoàng gia chuẩn ClickUp vector icons.
   - Tự động thay đổi nội dung, banner, giải thưởng theo sự kiện được chọn.
2. **Vòng quay số may mắn**:
   - Lấy danh sách đại biểu tham dự từ CSDL PostgreSQL.
   - Quay số ngẫu nhiên thời gian thực và công bố giải thưởng kèm hiệu ứng chúc mừng.

---

### LUỒNG 8: NHẮN TIN 1-1 & B2B MESSENGER (`association.messages.tsx`)
1. **Phân rã mô-đun hóa 7 thành phần**:
   - `ConversationList`: Danh sách hội thoại, tìm kiếm A-Z, lọc tab.
   - `ChatThread`: Cửa sổ chat, tin nhắn thoại, ảnh, đính kèm thẻ cơ hội/cuống vé.
   - `ForwardMessageModal`: Chuyển tiếp tin nhắn cho nhiều hội viên.
   - `MessengerCallModal`: Mô phỏng cuộc gọi thoại/video kết nối nhanh.

---

### LUỒNG 9: PHÂN QUYỀN CRM 2 DẠNG DASHBOARD & MATRIX (`association.permissions.tsx`)
1. **Lọc sạch tài khoản chưa duyệt**:
   - Loại bỏ 100% tài khoản `pending` / `inactive` khỏi DOM và chỉ số thống kê.
2. **Cơ chế Staging Cục Bộ (Draft Buffer)**:
   - Thay đổi quyền được gom vào state draft, làm nổi bật viền hổ phách.
   - Xuất hiện thanh lưu nổi (Floating Save Bar) ở đáy màn hình với nút **"Lưu Vào Database"** để gửi `PUT /api/admin/member-permissions`.
3. **Dual View**: Hỗ trợ chuyển đổi mượt mà giữa Dạng Dashboard (thẻ thống kê + 6 ban) và Dạng Lưới (Matrix Grid đa chiều).

---

### LUỒNG 10: GIAO VIỆC & XEM BẢNG TÍNH EXCEL IN-APP (`association.tasks.tsx`)
1. **Quy trình khép kín**: Giao việc $\rightarrow$ Tiếp nhận / Từ chối $\rightarrow$ Đánh giá tiến độ 4 mức độ & 1-5 sao $\rightarrow$ Nộp file nghiệm thu $\rightarrow$ Nghiệm thu hoàn thành.
2. **Ẩn nút khỏi DOM**: Người nhận việc và người xem không thấy nút phê duyệt; người xem chuyển sang chế độ chỉ đọc.
3. **Trình xem Excel in-app**: Modal `ExcelViewerModal` cho phép đọc trực tiếp file `.xlsx`, `.xls`, `.csv`, chuyển sheet và tìm kiếm ô tính thời gian thực.
