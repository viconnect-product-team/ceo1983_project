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

### BÀI 6: QUY TRÌNH QUẢN LÝ NHÀ TÀI TRỢ, GÓI TÀI TRỢ & BẮN EMAIL VIETQR TỰ ĐỘNG
1. **Phân Định 3 Hình Thức Đóng Góp Riêng Biệt**:
   - **🏦 Chuyển khoản (VietQR)**: Đóng góp qua tài khoản ngân hàng của CLB với mã VietQR định danh tự động.
   - **💵 Tiền mặt**: Thu nộp tiền mặt trực tiếp tại văn phòng hiệp hội hoặc quầy lễ tân sự kiện.
   - **🎁 Hiện vật**: Đóng góp sản phẩm, dịch vụ, voucher, trang thiết bị; có quy đổi giá trị VNĐ và ghi chú chi tiết quà tặng.
2. **Quản Trị Danh Mục Gói Tài Trợ (`/sponsor-packages`)**:
   - Thiết lập các gói tài trợ mẫu theo 4 hạng: Kim Cương, Vàng, Bạc, Đồng.
   - Định nghĩa hình thức đóng góp (Chuyển khoản / Tiền mặt / Hiện vật), mức giá niêm yết và danh sách quyền lợi chi tiết (benefits).
3. **Quy Trình Tạo Mới Nhà Tài Trợ (`/sponsors` -> "+ Thêm Nhà Tài Trợ")**:
   - **Bước 1 - Chọn Hạng & Hình Thức Đóng Góp**: Chọn một trong 3 hình thức (Chuyển khoản, Tiền mặt, Hiện vật).
   - **Bước 2 - Chọn Gói Tài Trợ Thực Tế**:
     * Hệ thống tự động gọi API lấy danh sách các gói tài trợ thực tế thuộc hạng và hình thức đã chọn.
     * *Trường hợp chưa có gói trong hệ thống*: Hiển thị thông báo màu vàng trực quan "Chưa có gói tài trợ nào thuộc hạng này" kèm nút bấm **[+ Tạo Gói Mới Ngay]**. Nhấp nút sẽ mở popup tạo gói nhanh, lưu xong hệ thống tự động chọn ngay gói mới tạo vào form.
   - **Bước 3 - Nhập Giá Trị Thực Tế Theo Số Tiền Nhà Tài Trợ Muốn**:
     * Hệ thống tự động điền gợi ý giá niêm yết của gói đã chọn.
     * Tuy nhiên, người quản trị có toàn quyền **nhập tự do giá trị tài trợ thực tế** theo mong muốn hoặc thỏa thuận riêng với nhà tài trợ mà không bị ép buộc theo giá niêm yết.
   - **Bước 4 - Khai Báo Đầu Mối & Lưu Dữ Liệu**: Nhập tên doanh nghiệp, người đại diện, số điện thoại và email nhận thông báo.
4. **Cơ Chế Bắn Email Tri Ân Kèm Mã VietQR Tự Động**:
   - Ngay khi bấm "Thêm Mới Nhà Tài Trợ", Backend NestJS sẽ lập tức tạo và gửi một email HTML trang trọng đến hòm thư đối tác:
     * **Mã VietQR Động Chuẩn Quốc Gia**: Được sinh tự động theo đúng số tiền tài trợ thực tế đã khai báo:
       `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount={Số_Tiền}&addInfo=TT%20{Mã_NT}%20{Tên_Doanh_Nghiệp}`
     * **Thông Tin Ngân Hàng Thụ Hưởng**: MB Bank (Ngân hàng TMCP Quân Đội), STK: `1983000000`, Chủ tài khoản: `CLB DOANH NHAN CEO 1983`.
     * **Nội dung tri ân & Bảng quyền lợi**: Lời cảm ơn chính thức từ Ban Chủ Nhiệm Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA) và tóm tắt toàn bộ quyền lợi truyền thông được thụ hưởng.
   - Hỗ trợ nút icon ✉️ ("Gửi lại thư tri ân") trên từng dòng dữ liệu để gửi lại email kèm mã VietQR bất kỳ lúc nào nếu nhà tài trợ cần.

### BÀI 7: QUẢN TRỊ ĐĂNG KÝ SỰ KIỆN, ĐỐI SOÁT & KÍCH HOẠT VÉ QR BẮN EMAIL E-TICKET
1. **Quy Trình Kiểm Soát Vé Sự Kiện Có Phí**:
   - Khi hội viên hoặc khách mời đăng ký tham dự sự kiện có phí qua App hoặc Web, hệ thống chỉ ghi nhận đăng ký tạm thời với trạng thái chưa thanh toán (`registered: false`).
   - Lúc này hệ thống **tuyệt đối không sinh mã QR vé check-in** nhằm phòng ngừa gian lận hoặc check-in nhầm; người dùng chỉ nhận được mã VietQR thanh toán tài khoản MB Bank 1983000000 kèm cú pháp chuyển khoản.
2. **Thao Tác Của Ban Truyền Thông / Kế Toán Tại Web CRM (`/event-registrations`)**:
   - **Nút [✓ Đã thanh toán]**: Khi đối soát thấy tiền đã vào tài khoản, quản trị viên nhấp nút `[✓ Đã thanh toán]`. Hệ thống lập tức:
     * Cập nhật trạng thái thanh toán sang `paid` và kích hoạt vé chính thức (`registered: true`).
     * Tự động sinh mã QR vé tham dự theo chuẩn `makeTicketQrUrl(...)` chứa đầy đủ thông tin hội viên, doanh nghiệp, hạng vé và chỗ ngồi.
     * Backend NestJS tự động tạo và gửi email E-ticket HTML cao cấp kèm mã QR vé check-in đến địa chỉ email của người tham gia.
   - **Nút [🔍 Đối soát]**: Mở modal đối soát chi tiết dòng tiền, xem mã hóa đơn, mã tham chiếu ngân hàng, số tiền thực nhận và thời điểm đối soát.

### BÀI 8: MẠNG XÃ HỘI DOANH NHÂN WEB CRM & LÊN LỊCH GẶP 1-ON-1 TRỰC TIẾP (`/network`)
1. **Cấu Trúc 3 Tab Chuyên Biệt Màn Kết Nối**:
   - 📰 **Tab 1: Bảng tin (Feed)**: Dòng thời gian tổng hợp các bài đăng thời gian thực từ cộng đồng hội viên:
     * Sản phẩm & Dịch vụ tiêu biểu mới đăng tải.
     * Cơ hội hợp tác kinh doanh, chào mua / chào bán B2B.
     * Tin tức, thông báo và phóng sự hoạt động từ Hiệp hội.
   - 💬 **Tab 2: Nhắn tin (Messages)**: Hệ thống hội thoại công việc, phân loại chat cá nhân 1-on-1 và chat nhóm chuyên môn.
   - 👥 **Tab 3: Kết nối (Thành viên theo Ban chuyên môn)**: Danh bạ doanh nhân với bộ lọc theo 7 Ban chuyên môn, hiển thị chức vụ, doanh nghiệp và số lượng nhân sự từng ban.
2. **Tính Năng Lên Lịch Gặp 1-on-1 Trực Tiếp Trên Web CRM**:
   - Trên mỗi bài đăng ở Bảng tin, quản trị viên hoặc hội viên có thể bấm nút **[🤝 Lên lịch cuộc gặp 1-on-1]**.
   - Popup `ScheduleMeetingModal` mở ra trực tiếp trên Web CRM cho phép chọn ngày, giờ, hình thức gặp (Trực tiếp tại văn phòng hiệp hội / Quán cafe / Online Google Meet / Zoom), địa điểm và nội dung trao đổi.
   - Sau khi xác nhận, hệ thống tự động khởi tạo thread tin nhắn 1-on-1 và gửi lời mời lịch hẹn trang trọng kèm thông điệp chi tiết đến đối tác.

### BÀI 9: QUẢN LÝ ĐA PHƯƠNG TIỆN SẢN PHẨM, CƠ HỘI B2B, TIN TỨC & TẢI NHIỀU TÀI LIỆU
1. **Sản Phẩm Marketplace Đa Ảnh & Video**:
   - Cho phép tải lên và cập nhật danh sách nhiều ảnh (`imageUrls`) cho từng sản phẩm.
   - Hỗ trợ gắn đường dẫn video giới thiệu sản phẩm (`videoUrl`), xem video trực quan trong modal chi tiết.
2. **Cơ Hội Hợp Tác B2B Đa Ảnh**:
   - Hỗ trợ tải lên nhiều hình ảnh thực tế của cơ hội (`images`), trình diễn album ảnh phóng to sắc nét.
3. **Đăng Tin Tức Nhiều Ảnh**:
   - Hệ thống CrudModal hỗ trợ trường `type: "multi-image"` giúp ban biên tập đăng tải chùm ảnh sự kiện, hội nghị.
4. **Tải Lên Nhiều Tài Liệu Cùng Lúc (`/documents`)**:
   - Input chọn tệp hỗ trợ chế độ đa tệp (`multiple`), cho phép Ban Thư Ký tải lên đồng thời nhiều văn bản, quy chế, biểu mẫu chỉ với một lần chọn tệp.


