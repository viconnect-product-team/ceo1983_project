# TÀI LIỆU YÊU CẦU NGHIỆP VỤ HỆ THỐNG QUẢN TRỊ HIỆP HỘI (BRD - WEB CRM)
## HỆ SINH THÁI DOANH NHÂN CLB CEO 1983 (TRỰC THUỘC HANOIBA)
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026 - Ngôn ngữ: Tiếng Việt (Doanh nghiệp chuẩn)*

---

### LỜI MỞ ĐẦU & TÔN CHỈ VẬN HÀNH
Tài liệu Yêu cầu Nghiệp vụ (Business Requirements Document - BRD) này đặc tả toàn diện các quy trình vận hành, thẩm quyền lãnh đạo, luồng công việc và trải nghiệm quản trị trên Cổng Quản trị CRM của CLB Doanh Nhân CEO 1983. Hệ thống được thiết kế hướng tới mục tiêu tối thượng: **Số hóa toàn diện dữ liệu hội viên, chuẩn hóa quy trình điều hành minh bạch, thúc đẩy giao thương B2B hiệu quả và bảo vệ an toàn thông tin doanh nghiệp**.

Tài liệu được biên soạn bằng văn phong quản trị kinh doanh thực tiễn, loại bỏ hoàn toàn các thuật ngữ công nghệ nặng nề để Chủ tịch, Ban Điều Hành, Tổng thư ký và các Trưởng ban chuyên môn dễ dàng thấu suốt và chỉ đạo triển khai.

---

### CHƯƠNG 1: TỔNG QUAN HỆ THỐNG QUẢN TRỊ CRM HIỆP HỘI
1. **Mục tiêu sứ mệnh**:
   - Cung cấp bức tranh toàn cảnh 360 độ về sức khỏe tổ chức, quy mô hội viên và dòng tiền hiệp hội.
   - Chấm dứt tình trạng lưu trữ dữ liệu phân tán trên file Excel rời rạc hoặc sổ tay truyền thống.
   - Tự động hóa các nghiệp vụ định kỳ: nhắc hội phí niên liễm, gửi thông báo họp, cấp vé mời sự kiện.
2. **Đối tượng sử dụng chính**:
   - **Chủ tịch Hiệp hội**: Giám sát bao quát mọi hoạt động, phê duyệt định hướng và giao việc trọng tâm.
   - **Ban Điều Hành (trước đây là Ban Quản trị)**: Cơ quan điều phối liên ban, chỉ đạo chuyên môn trực tiếp.
   - **Quản trị viên Hệ thống (Admin)**: Thiết lập cấu hình ma trận phân quyền, quản lý bảo mật và tích hợp.
   - **Tổng thư ký**: Điều hành Văn phòng thư ký, truyền đạt thông báo và giám sát tiến độ nghị quyết.
   - **Trưởng các Ban Chuyên môn**: Trưởng ban Thành viên, Ban Xúc tiến thương mại, Ban Tài chính, Ban Truyền thông, Ban Thiện nguyện.
   - **Ban Thư ký**: Soạn thảo văn bản, tiếp nhận hồ sơ, gửi hóa đơn và hỗ trợ hội viên.

---

### CHƯƠNG 2: CƠ CẤU TỔ CHỨC & PHÂN CẤP THẨM QUYỀN 7 CẤP BẬC
Cơ cấu tổ chức hiệp hội được chuẩn hóa thành 7 cấp bậc thứ tự từ trên xuống dưới:
1. **Cấp 1 - Chủ tịch Hiệp hội (`chu_tich`)**: Cấp quyền cao nhất, toàn quyền giao việc cho bất kỳ ai trên toàn hiệp hội, giám sát toàn diện dữ liệu đa ban.
2. **Cấp 2 - Quản trị viên Hệ thống (`admin` / `quan_tri`)**: Toàn quyền cấu hình tham số, phân quyền ma trận chức năng, khởi tạo tài khoản và hỗ trợ kỹ thuật.
3. **Cấp 3 - Ban Điều Hành (`ban_dieu_hanh`)**: Thay thế hoàn toàn thuật ngữ "Ban Quản trị" cũ. Lãnh đạo liên ban, giám sát toàn bộ hoạt động chuyên môn của các ban.
4. **Cấp 4 - Tổng thư ký (`tong_thu_ky`)**: Điều phối Ban Thư Ký; thẩm quyền giao việc giới hạn cho nhân sự thuộc Ban Thư Ký.
5. **Cấp 5 - Trưởng ban Chuyên môn (`truong_ban_*`)**:
   - Trưởng ban Truyền thông: Quản lý truyền thông, hình ảnh, bài viết sự kiện.
   - Trưởng ban Thành viên: Quản lý thẩm định, phê duyệt và chăm sóc hội viên.
   - Trưởng ban Xúc tiến thương mại: Quản lý cơ hội giao thương B2B, gian hàng sản phẩm.
   - Trưởng ban Tài chính: Quản lý ngân quỹ, hội phí niên liễm, thu chi và tạm ứng.
   - Trưởng ban Thiện nguyện: Quản lý các chương trình an sinh xã hội, cứu trợ cộng đồng.
   - *Thẩm quyền giao việc: Chỉ được phép giao việc cho thành viên thuộc chính ban của mình.*
6. **Cấp 6 - Ban Thư ký (`ban_thu_ky`)**: Thực thi nhiệm vụ do Tổng thư ký và Ban Điều Hành phân công.
7. **Cấp 7 - Hội viên Doanh nhân (`member`)**: Thành viên câu lạc bộ, tham gia sinh hoạt, giao thương và kết nối.

---

### CHƯƠNG 3: CƠ CHẾ BẢO MẬT & THÔNG BÁO THAY ĐỔI QUYỀN THỜI GIAN THỰC
1. **Xử lý tình huống thay đổi quyền trong lúc thao tác**:
   - Khi tài khoản B đang mở biểu mẫu chỉnh sửa, thêm mới hoặc xóa dữ liệu mà chưa kịp bấm Lưu.
   - Tài khoản A (Quản trị viên/Chủ tịch) thay đổi quyền hoặc thu hồi quyền thao tác của tài khoản B.
   - Khi tài khoản B bấm nút Lưu, Xóa hoặc Chỉnh sửa: Hệ thống lập tức chặn hành động và **bật cửa sổ thông báo trang trọng ở chính giữa màn hình**:
     > **"Quyền hạn của bạn đã bị thay đổi bởi Quản trị viên. Hệ thống sẽ tải lại để áp dụng cấu hình phân quyền mới nhất."**
   - Sau đó hệ thống tự động làm mới trang (reload) sau 4 giây hoặc ngay khi người dùng bấm nút xác nhận, giữ nguyên phiên đăng nhập để người dùng làm việc tiếp với đúng quyền mới.
2. **Chuẩn hóa màn hình đăng nhập**:
   - Góc trái: Biểu tượng logo thương hiệu chính thức của CEO 1983 đồng bộ với tab trình duyệt.
   - Khối đăng nhập trung tâm: Loại bỏ hoàn toàn dòng chữ phụ đề thừa để giao diện tập trung và sang trọng.
3. **Quy chuẩn Lưu trữ & Đồng bộ Phân quyền Tài khoản CSDL PostgreSQL (`/accounts`)**:
   - Mọi thao tác gán vai trò (`chu_tich`, `ban_dieu_hanh`, `truong_ban_*`, `admin`, `member`) và gán ban chuyên môn (`Ban Điều Hành`, `Ban Thư Ký`, `Ban Thành Viên`, `Ban Xúc Tiến Thương Mại`, `Ban Truyền Thông`, `Ban Tài Chính`, `Ban Thiện Nguyện`) phải được ghi nhận tức thời vào cơ sở dữ liệu PostgreSQL thông qua API `PATCH /api/members/:id/role-dept`.
   - Cơ sở dữ liệu đồng bộ song song cả 2 bảng `public.members` (cột `executive_role`, `department`) và `public.user_roles`/`public.memberships`.
   - Cơ chế Database-First khi tải trang: Khi tải lại trang (`F5`), hệ thống nạp dữ liệu từ backend và ghi đè toàn bộ danh sách tài khoản quản lý, chấm dứt hoàn toàn tình trạng mất cấu hình phân quyền hoặc bị đè bởi danh sách mặc định cục bộ.
   - Ưu tiên vai trò thực tế: Hệ thống phân quyền xác định quyền hạn của người dùng dựa trên vai trò thực tế lưu trong CSDL; loại bỏ cơ chế gán cứng quyền admin theo địa chỉ email nhằm đảm bảo tính linh hoạt khi phân công nhiệm vụ.


---

### CHƯƠNG 4: QUẢN TRỊ HỒ SƠ HỘI VIÊN 360° & DOANH NGHIỆP THÀNH VIÊN
1. **Quy trình tiếp nhận & phê duyệt hồ sơ**:
   - Tiếp nhận đăng ký trực tuyến từ Cổng thông tin công khai.
   - Ban Thành viên thẩm định tiêu chí: Doanh nhân sinh năm Quý Hợi 1983, người đại diện pháp luật hoặc chủ sở hữu doanh nghiệp.
   - Phê duyệt và tự động phát thư chúc mừng kèm thông tin đăng nhập tài khoản.
2. **Hồ sơ hội viên đa chiều**:
   - Thông tin cá nhân: Họ tên, ngày sinh, số điện thoại, chức vụ, ảnh thẻ đại diện, câu châm ngôn kinh doanh.
   - Doanh nghiệp trực thuộc: Tên công ty, mã số thuế, địa chỉ trụ sở, lĩnh vực hoạt động, quy mô nhân sự, liên kết website.
   - Ban chuyên môn phụ trách và lịch sử đóng hội phí theo từng niên khóa.

---

### CHƯƠNG 5: QUẢN LÝ TÀI CHÍNH, HỘI PHÍ NIÊN LIỄM & THU CHI TẠM ỨNG
1. **Quản lý hội phí niên liễm**:
   - Phát hành biểu phí niên khóa tự động (mặc định 6.000.000 VNĐ/năm).
   - Mã QR thanh toán VietQR Napas 24/7 gắn sẵn mã giao dịch định danh, tự động gạch nợ tức thì khi tiền về tài khoản hiệp hội.
2. **Quản lý khoản thu & khoản chi tạm ứng**:
   - Ghi nhận chi tiết từng khoản thu tài trợ, thu sự kiện, thu thiện nguyện, thu đột xuất tiền mặt tại bàn tiếp đón và chuyển khoản ngân hàng.
   - Đề xuất và giải ngân tạm ứng cho các ban triển khai sự kiện, đối soát hoàn ứng tiền thừa và quyết toán thực chi minh bạch.
   - **Bộ công cụ Xuất file Excel Thu - Chi Sổ Quỹ Nội Bộ chuẩn Thông tư 200/2014/TT-BTC (Mẫu S07-DN) & Thông tư 133/2016/TT-BTC (Mẫu S04a-DNN)**:
     + Tiêu đề chuẩn Bộ Tài chính: Đơn vị CLB DOANH NHÂN CEO 1983 (HANOIBA), Mẫu số S07-DN, Thông tư số 200/2014/TT-BTC, Loại quỹ, Đơn vị tính VNĐ.
     + Đầy đủ các cột nghiệp vụ kế toán: STT, Mã chứng từ (PT/PC), Ngày ghi sổ, Đối tác / Người nộp / Người nhận, Danh mục phân loại, Diễn giải nội dung, Hình thức (Tiền mặt / Chuyển khoản), Tài khoản đối ứng (111 / 112), Số tiền phát sinh (VNĐ), và các cột Tạm ứng / Hoàn ứng / Thực chi cho Sổ Chi.
     + Hàng tổng cộng, số tiền viết bằng chữ tự động (`numberToVietnameseWords`), ghi chú lưu sổ ("- Sổ này có ... trang, đánh số từ trang 01 đến trang ...", "- Ngày mở sổ: 01/01/2026") và 3 chữ ký trách nhiệm (Người lập biểu, Thủ quỹ/Kế toán trưởng, Chủ tịch/Đại diện BQT).
     + Hỗ trợ xuất Multi-Sheet: Sheet 1 Sổ quỹ chi tiết; Sheet 2 Bảng tổng hợp theo danh mục thu/chi (số lượng món và tỷ trọng %); Sheet 3 Mẫu phiếu thu/chi đóng dấu (Mẫu số 01-TT / 02-TT).
   - **Đồng bộ dữ liệu thời gian thực giữa Web CRM (Port 5443) và Mobile App (Port 5444)**:
     + Cùng chia sẻ 100% cơ sở dữ liệu PostgreSQL `ceo1983-postgres-prod:5432/vione_app`.
     + Mọi giao dịch thu chi, hóa đơn, sự kiện và hội viên tạo trên CRM hiển thị tức thời trên Mobile App và ngược lại.
   - Bộ công cụ **Nhập file Excel hàng loạt (Import Excel)** phục vụ kế toán hiệp hội.

---

### CHƯƠNG 6: TỔ CHỨC SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & SOÁT VÉ QR
1. **Lập kế hoạch sự kiện**:
   - Khởi tạo sự kiện định kỳ: Họp Ban Chấp Hành, Gala thường niên, Caravan xúc tiến thương mại, Giải Golf CEO 1983.
   - Cấu hình hạng vé: Vé VIP Ban Điều Hành, Vé Hội viên chính thức, Vé Khách mời danh dự.
2. **Sơ đồ khán phòng tương tác (Seating Map)**:
   - Thiết kế sơ đồ bàn tiệc trực quan: Vị trí bàn VIP trung tâm, bàn các ban chuyên môn, bàn khách mời.
   - Gán chỗ ngồi chính xác cho từng hội viên kèm số may mắn quay thưởng.
3. **Cổng soát vé điện tử QR Check-in**:
   - Ban Thư ký sử dụng máy ảnh hoặc điện thoại quét mã QR vé đại biểu, hiển thị tức thời thông tin doanh nhân, chức vụ và số bàn tiệc.
   - Chương trình quay số may mắn **Lucky Draw** trực tiếp trên màn hình LED lớn tại đêm tiệc.

---

### CHƯƠNG 7: LUỒNG GIAO VIỆC & PHÂN PHỐI NHIỆM VỤ ĐA CẤP (DYNAMIC TASK)
1. **Phân cấp giao việc nghiêm ngặt**:
   - Chủ tịch & Admin: Toàn quyền giao việc cho bất kỳ cá nhân hay ban chuyên môn nào.
   - Tổng thư ký: Chỉ được phép giao việc cho thành viên thuộc Ban Thư Ký.
   - Trưởng ban chuyên môn: Chỉ được phép giao việc cho các thành viên thuộc chính ban của mình.
   - *Hệ thống tự động tra cứu danh sách nhân sự được phép nhận việc theo quyền hạn người lập.*
2. **Đính kèm tài liệu đa định dạng**:
   - Hỗ trợ tải lên trực tiếp văn bản Word (`.doc`, `.docx`), bảng tính Excel (`.xls`, `.xlsx`), tài liệu PDF (`.pdf`) và hình ảnh minh họa.
   - Người nhận việc có thể tải về nghiên cứu hoặc nộp tệp báo cáo hoàn thành.
3. **Mô hình công việc động**:
   - Phân loại danh mục công việc: Chiến lược, Sự kiện, Tài chính, Truyền thông, Hội viên, Xúc tiến, Thiện nguyện.
   - Dự toán ngân sách và tiêu chí nghiệm thu hoàn thành định lượng rõ ràng.
   - Danh sách công việc con (Subtasks) và cuộc họp trực tuyến Google Meet gắn kèm.
4. **Phân quyền bảo mật dữ liệu công việc**:
   - Cấp Chủ tịch, Admin và Ban Điều Hành: Xem toàn bộ công việc toàn hiệp hội.
   - Tổng thư ký & Trưởng ban: Xem công việc ban mình và việc liên quan trực tiếp.
   - Hội viên: Chỉ xem các công việc mình được giao, phối hợp hoặc tự tạo.

---

### CHƯƠNG 8: HỆ SINH THÁI GIAO THƯƠNG & XÚC TIẾN THƯƠNG MẠI B2B
1. **Sàn sản phẩm & ưu đãi nội bộ**:
   - Doanh nghiệp hội viên giới thiệu các sản phẩm, giải pháp tiêu biểu kèm chính sách chiết khấu độc quyền cho thành viên CEO 1983.
2. **Quản trị cơ hội giao thương (B2B Deals)**:
   - Ghi nhận và theo dõi các thương vụ kết nối kinh doanh từ bước khởi xướng, trao đổi đến ký kết hợp đồng thành công.
   - Thống kê tổng giá trị dòng tiền giao thương nội bộ mang lại cho hội viên.

---

### CHƯƠNG 9: BIỂU QUYẾT ĐIỆN TỬ & KHẢO SÁT ĐẠI HỘI
1. **Biểu quyết nghị quyết trực tuyến**:
   - Ban Điều Hành khởi tạo các phiên biểu quyết thông qua quy chế, kế hoạch tài chính hoặc nhân sự.
   - Hội viên bỏ phiếu minh bạch, hệ thống tính toán tỷ lệ đồng thuận theo thời gian thực.
2. **Khảo sát chất lượng sinh hoạt**:
   - Thu thập ý kiến đóng góp của hội viên sau mỗi kỳ sinh hoạt để cải tiến chất lượng tổ chức.

---

### CHƯƠNG 10: TRỢ LÝ ĐIỀU HÀNH TRÍ TUỆ NHÂN TẠO (AI ASSISTANT)
- Được nạp toàn diện tri thức về điều lệ, quy chế và các số liệu hoạt động của hiệp hội.
- Hỗ trợ lãnh đạo tra cứu tức thì thông tin hội viên, chỉ số tài chính, tiến độ sự kiện.
- Tự động điều hướng nhanh đến màn hình chức năng khi người dùng yêu cầu hướng dẫn.

---

### CHƯƠNG 11: TIÊU CHUẨN AN TOÀN, BẢO MẬT & HẠ TẦNG KỸ THUẬT SIÊU TỐC
- **Bảo mật dữ liệu hội viên**: 100% dữ liệu danh bạ doanh nhân, chức vụ và số điện thoại được bảo vệ nghiêm ngặt qua JWT Auth và DataScope phân quyền.
- **Hạ tầng Mạng Docker kép nội bộ (Dual Docker Network)**: Web CRM kết nối trực tiếp đến PostgreSQL nội bộ (`ceo1983-postgres-prod:5432`) qua `ceo1983-network` và đồng thời tiếp nhận lưu lượng HTTPS an toàn từ Nginx Proxy (`vione-network`), triệt tiêu độ trễ mạng và loại bỏ hoàn toàn hiện tượng timeout/treo API.
- **Hiệu năng phản hồi thần tốc**: Toàn bộ API nghiệp vụ (Sự kiện, Danh bạ hội viên, Sổ quỹ hóa đơn) phản hồi tức thì dưới 100ms (đo kiểm thực tế 40ms - 59ms), cam kết trải nghiệm điều hành mượt mà cho Ban Lãnh Đạo.
- **Định danh Ngữ cảnh Hiệp hội Chuẩn hóa**: Mọi giao dịch và dữ liệu sự kiện, hội viên, kế toán đều được gán nhãn ngữ cảnh chuẩn hóa (`c1983000-0000-4000-8000-000000001983`), tự động phòng vệ truy vấn và sẵn sàng cho kiến trúc liên kết mở rộng.
- **Sao lưu & Tự phục hồi**: Cơ sở dữ liệu lưu trữ bền vững trên volume độc lập, kiểm tra trạng thái tự động và sẵn sàng khôi phục thảm họa 24/7.
