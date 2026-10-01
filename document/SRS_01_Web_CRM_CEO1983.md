# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ CƠ SỞ DỮ LIỆU

## CỔNG QUẢN TRỊ TRUNG TÂM CLB DOANH NHÂN CEO 1983 (WEB CRM & PORTAL)

*Phiên bản: Version 4.5 - Master Specification Chuẩn Hóa Bàn Giao Kỹ Thuật Toàn Diện*

## MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)

| Mục | Phần / Phân Hệ Chức Năng | Phạm Vi Nghiệp Vụ | Trạng Thái |
| --- | --- | --- | --- |
| PHẦN 1 | Giải Thích Bình Dân Các Khái Niệm Kỹ Thuật Cốt Lõi & Mô Hình Tòa Nhà Chỉ Huy | Nền tảng kiến trúc | Hoàn tất 100% |
| PHẦN 2 | Ma Trận Phân Quyền 5 Cấp Bậc & Cây Phân Cấp Thao Tác Chi Tiết (Dynamic RBAC Tree) | Bảo mật & Cấp phép | Hoàn tất 100% |
| PHẦN 3 | Quy Trình Đăng Nhập, Xác Thực JWT Admin & Bảo Mật Phiên Làm Việc Xanh-Trắng | Xác thực & Bảo mật | Hoàn tất 100% |
| PHẦN 4 | Hồ Sơ Hội Viên 360°, Quy Trình Thẩm Định Kết Nạp & Quản Trị Vòng Đời Hội Phí Thường Niên | Quản trị Hội viên | Hoàn tất 100% |
| PHẦN 5 | Quản Trị Sự Kiện, Phát Hành Vé Mời QR & Phân Công Soát Vé Check-in Thời Gian Thực | Sự kiện & Vé mời | Hoàn tất 100% |
| PHẦN 6 | Điều Hành Cuộc Họp, Tích Hợp Phòng Họp (Zoom/Meet/UniWork) & Luồng Quản Trị Duyệt | Cuộc họp & Phòng họp | Hoàn tất 100% |
| PHẦN 7 | Sàn Giao Thương B2B Marketplace Shopee Style, Đánh Giá Sản Phẩm & Điểm Sao Công Ty | Sàn B2B Shopee | Hoàn tất 100% |
| PHẦN 8 | Sổ Quỹ Tài Chính Hiệp Hội, Quản Lý Hóa Đơn & Cổng Thanh Toán VietQR Tự Động | Tài chính & Kế toán | Hoàn tất 100% |
| PHẦN 9 | Bầu Cử Đại Hội Hiệp Hội, Biểu Quyết Trực Tuyến & Mini-game Lucky Draw | Đại hội & Dân chủ | Hoàn tất 100% |
| PHẦN 10 | Danh Thiếp Thông Minh NFC (Smart Business Card) & Nhật Ký Truy Vết Audit Trail | Định danh số & Audit | Hoàn tất 100% |
| PHẦN 11 | Thiết Kế Cơ Sở Dữ Liệu PostgreSQL Chuẩn ACID, Từ Điển Dữ Liệu & Danh Mục API Endpoints | Database & API Schema | Hoàn tất 100% |


## PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI

> **HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU:**
> 1. **Cơ sở dữ liệu (Database):** Giống như Phòng Lưu Trữ Hồ Sơ Trung Tâm tuyệt mật của hiệp hội.
> 2. **Bảng (Table):** Là các Ngăn Tủ Hồ Sơ chuyên biệt (members, events, event_registrations, invoices, chat_messages).
> 3. **Khóa chính (Primary Key - PK):** Giống như Số CCCD duy nhất của từng hồ sơ, không bao giờ trùng lặp.
> 4. **Khóa ngoại (Foreign Key - FK):** Dòng ghi chú liên kết (cuống vé này của ai, cuộc họp này do ai chủ trì).
> 5. **Phân quyền (RBAC):** Thẻ từ thông minh mở cửa từng phòng ban chuyên môn theo đúng chức danh.
> 6. **Phép JOIN:** Thư ký kẹp ghim cuống vé với sơ yếu lý lịch để xuất báo cáo đầy đủ thông tin đại biểu.
> 7. **API:** Nhân viên chuyển phát nhanh chuyển dữ liệu đồng bộ tức thì giữa Web CRM và App di động.

## PHẦN 2: QUY CHẾ PHÂN QUYỀN HỆ THỐNG (RBAC - 5 VAI TRÒ CỐT LÕI)

| Vai Trò (Role Code) | Tên Vai Trò Chuẩn Hóa | Phạm Vi Quyền Hạn | Trách Nhiệm Nghiệp Vụ |
| --- | --- | --- | --- |
| QUẢN_TRỊ | Quản Trị Viên Tối Cao (Super Admin) | Full Quyền Tối Cao Hệ Thống | Toàn quyền phê duyệt cuộc họp, cấu hình ma trận phân quyền, cấp quyền tài khoản, duyệt hội viên mới và giám sát log kiểm toán. |
| ADMIN | Admin Hệ Thống (Ban Thư Ký Điều Hành) | Toàn Quyền Nghiệp Vụ Hiệp Hội | Phê duyệt cuộc họp, khởi tạo sự kiện & Gala, xuất bản tin tức, quản lý hợp đồng tài trợ, đối soát tài chính và gạch nợ hóa đơn. |
| TỔNG_THƯ_KÝ | Tổng Thư Ký CLB CEO 1983 | Thường Trực Điều Hành & Tạo Cuộc Họp | Khởi tạo cuộc họp toàn thể / liên ban (chờ Quản trị duyệt), quản lý hồ sơ hội viên, điều phối công tác phối hợp giữa các ban. |
| TRƯỞNG_BAN | Trưởng Các Ban Chuyên Môn | Quản Trị Chuyên Sâu Ban & Tạo Cuộc Họp Ban | Khởi tạo cuộc họp ban chuyên trách (chờ Quản trị duyệt), quản lý nhân sự thuộc ban, thẩm định hồ sơ hội viên / tin tức / tài chính theo ban. |
| THÀNH_VIÊN | Hội Viên Doanh Nhân Chính Thức | Xem Danh Mục Chung + Thao Tác Dữ Liệu Cá Nhân | Xem lịch họp & bấm xác nhận tham dự (RSVP); Xem danh bạ hội viên 360°; Đăng ký sự kiện; Trao đổi cơ hội B2B; Quản lý danh thiếp số cá nhân. |


## PHẦN 3: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC & THAO TÁC CHI TIẾT

| Nhóm Sidebar | Chức Năng Sidebar | Thao Tác Cụ Thể | Quản Trị | Admin | Tổng Thư Ký | Trưởng Ban | Thành Viên |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Tổng Quan | Dashboard Điều Hành | Xem chỉ số KPI tổng quan, biểu đồ tăng trưởng, doanh thu | Có | Có | Có | Có | Không |
| 1. Tổng Quan | Báo Cáo Hoạt Động | Xuất báo cáo tổng hợp tiến độ hiệp hội | Có | Có | Có | Ban mình | Không |
| 2. Hội Viên | Danh Sách Hội Viên | Tra cứu danh bạ 360°, lọc ngành nghề, xuất Excel | Có | Có | Có | Có | Chỉ xem chung |
| 2. Hội Viên | Hồ Sơ Chờ Duyệt | Thẩm định hồ sơ đăng ký từ Web Landing Page | Có | Có | Có | Ban TV duyệt | Không |
| 2. Hội Viên | Phê Duyệt Kết Nạp | Duyệt cấp mã M1983-xxx & tự động gửi email chào mừng | Có | Có | Không | Đề xuất | Không |
| 2. Hội Viên | Gia hạn hội phí | Gia hạn thẻ hội viên +365 ngày sau khi đóng hội phí | Có | Có | Không | Ban TV duyệt | Không |
| 2. Hội Viên | Bản Đồ Hội Viên | Xem phân bố địa lý doanh nghiệp trên bản đồ số | Có | Có | Có | Có | Chỉ xem |
| 2. Hội Viên | Danh Thiếp Số Thông Minh | Cấp mã slug /card/:code, tạo danh thiếp doanh nhân | Có | Có | Có | Có | Của chính mình |
| 3. Sự Kiện & Hoạt Động | Danh Sách Sự Kiện | Xem chi tiết lịch trình gala, đại hội, hội thảo | Có | Có | Có | Có | Chỉ xem |
| 3. Sự Kiện & Hoạt Động | Khởi Tạo Sự Kiện Mới | Tạo sự kiện, cấu hình vé điện tử, sơ đồ bàn VIP | Có | Có | Có | Ban SK duyệt | Không |
| 3. Sự Kiện & Hoạt Động | Phân Công & Soát Vé QR | Chỉ định nhân sự quét QR, kiểm soát đại biểu vào cửa | Có | Có | Có | Khi được gán | Không |
| 3. Sự Kiện & Hoạt Động | Vòng Quay Lucky Draw | Cấu hình giải thưởng, kích hoạt quay số may mắn | Có | Có | Không | Ban SK duyệt | Chỉ xem |
| 4. Nhà Tài Trợ | Danh Sách Nhà Tài Trợ | Xem hồ sơ đơn vị tài trợ kim cương, vàng, bạc | Có | Có | Có | Có | Chỉ xem |
| 4. Nhà Tài Trợ | Hợp Đồng & Quyền Lợi | Theo dõi tiến độ giải ngân, kiểm soát trả quyền lợi | Có | Có | Có | Ban TC duyệt | Không |
| 4. Nhà Tài Trợ | Quản Lý Gói Tài Trợ | Khởi tạo gói tài trợ sự kiện, định mức kinh phí | Có | Có | Có | Ban TC duyệt | Không |
| 5. Tài Chính & Quỹ | Tổng Quan Thu Chi Quỹ | Theo dõi số dư tài khoản quỹ, dòng tiền thực tế | Có | Có | Có | Ban TC duyệt | Không |
| 5. Tài Chính & Quỹ | Sổ Quỹ Thu Chi | Lập phiếu thu, phiếu chi, lưu chứng từ thanh toán | Có | Có | Không | Ban TC duyệt | Không |
| 5. Tài Chính & Quỹ | Hóa Đơn & VietQR | Tạo hóa đơn hội phí, đối soát gạch nợ tự động 24/7 | Có | Có | Không | Ban TC duyệt | Hóa đơn mình |
| 5. Tài Chính & Quỹ | Báo Cáo Tài Chính | Xuất báo cáo tài chính đại hội, quyết toán sự kiện | Có | Có | Không | Ban TC duyệt | Không |
| 6. Truyền Thông | Bài Viết & Tin Tức CLB | Soạn thảo tin tức, tải ảnh banner, bài phóng sự | Có | Có | Có | Ban TT duyệt | Chỉ đọc |
| 6. Truyền Thông | Kiểm Duyệt Xuất Bản | Phê duyệt tin tức hiển thị lên App Mobile & Landing | Có | Có | Không | Ban TT duyệt | Không |
| 6. Truyền Thông | Danh Mục Tin Tức | Quản lý cây danh mục chuyên trang hoạt động | Có | Có | Không | Ban TT duyệt | Không |
| 6. Truyền Thông | Bảng Tin Nội Bộ | Đăng thông báo nội bộ, thông điệp ban điều hành | Có | Có | Có | Đăng tin ban | Chỉ đọc |
| 7. Giao Thương & Kết Nối | Cuộc Họp & Giao Ban | Tạo họp (4 role), Duyệt (Quản trị), Dropdown phòng họp | Có (Duyệt) | Có (Duyệt) | Tạo (Chờ duyệt) | Tạo (Chờ duyệt) | Tham gia (RSVP) |
| 7. Giao Thương & Kết Nối | Hẹn Gặp Bàn Tròn 1-1 | Đặt lịch hẹn giao thương, gửi thiệp mời kết nối | Có | Có | Có | Có | Lịch hẹn mình |
| 7. Giao Thương & Kết Nối | Sàn Thương Mại B2B | Kiểm duyệt bài đăng mua bán, quản lý gian hàng B2B | Có | Có | Có | Ban XT duyệt | Đăng bài mình |
| 7. Giao Thương & Kết Nối | Biểu Quyết & Bầu Cử | Khởi tạo phiên bầu cử đại hội, mở hòm phiếu điện tử | Có | Có | Có | Không | Bỏ phiếu 1 lần |
| 8. Hệ Thống & Điều Hành | Phân Quyền 5 Vai Trò | Cấu hình ma trận phân quyền, phân bổ quyền tài khoản | Có | Có | Không | Không | Không |
| 8. Hệ Thống & Điều Hành | Quản Trị Tài Khoản | Cấp tài khoản, đổi mật khẩu, kích hoạt/khóa nick | Có | Có | Không | Không | Không |
| 8. Hệ Thống & Điều Hành | Cấu Hình Hệ Thống | Cài đặt tham số CLB, cấu hình cổng VietQR, thông báo | Có | Có | Không | Không | Không |
| 8. Hệ Thống & Điều Hành | Nhật Ký Kiểm Toán (Audit) | Truy vết IP, thời gian, lịch sử sửa/xóa dữ liệu | Có | Có | Không | Không | Không |


## PHẦN 4: BẢN ĐỒ NGHIỆP VỤ & CÁC LUỒNG XỬ LÝ DỮ LIỆU CHI TIẾT

### 4.1 Luồng Xét Duyệt Hội Viên Mới Từ Web Landing (Không Còn Mục Doanh Thu)
• Mục tiêu nghiệp vụ: Tiếp nhận hồ sơ đăng ký gia nhập CLB CEO 1983 trực tuyến từ Web Landing, thẩm định tư cách doanh nhân và kích hoạt tự động tài khoản.
• Tác nhân tham gia (Actors): Ứng viên mới, Ban Thành Viên (Thẩm định), Ban Quản Trị / Super Admin (Phê duyệt).
• Điều kiện tiên quyết (Preconditions): Ứng viên truy cập Web Landing Page chính thức của CLB.
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Ứng viên mở form đăng ký tại Landing Page, điền đầy đủ các thông tin bắt buộc: Họ và Tên, Số điện thoại / Zalo, Email liên hệ, Tên doanh nghiệp đại diện, Chức vụ trong doanh nghiệp, Ngành nghề lĩnh vực hoạt động, Nhu cầu kết nối giao thương. (Lưu ý: Đã loại bỏ hoàn toàn trường doanh thu công ty để tối ưu hóa tỷ lệ chuyển đổi).
  - Bước 2: Ứng viên bấm "Gửi Đơn Đăng Ký". Hệ thống gọi API POST /api/members/apply. Dữ liệu được ghi nhận vào bảng members với trạng thái status = "pending".
  - Bước 3: Hồ sơ mới xuất hiện tại danh sách "Hồ sơ chờ duyệt" trên Web CRM. Ban Thành Viên kiểm tra tính xác thực của số điện thoại và pháp nhân doanh nghiệp qua Tổng cục Thuế.
  - Bước 4: Ban Thành Viên chuyển trạng thái hồ sơ sang "verified" (Đã thẩm định) và trình Ban Quản Trị xem xét.
  - Bước 5: Ban Quản Trị hoặc Admin bấm nút "Phê Duyệt Kết Nạp" (Approve):
    + Hệ thống cập nhật members.status = "active".
    + Tự động sinh mã hội viên độc quyền theo cú pháp chuẩn: M1983-xxx (Ví dụ: M1983-099).
    + Tự động tạo bản ghi tài khoản người dùng trong bảng vione_users với mật khẩu ngẫu nhiên an toàn (được băm mã hóa bcrypt).
    + Tự động khởi tạo Danh thiếp số thông minh trong bảng member_business_cards với mã slug /card/:code.
    + Tự động kích hoạt dịch vụ Mailer gửi thư chúc mừng kết nạp kèm thông tin tài khoản và mật khẩu đăng nhập App di động.
• Luồng ngoại lệ (Exception Flow):
  - Nếu hồ sơ không đạt tiêu chuẩn (doanh nghiệp giải thể, thông tin giả mạo), Ban Quản Trị bấm nút "Từ chối" kèm lý do. Hệ thống cập nhật status = "rejected" và gửi email thông báo từ chối lịch sự đến ứng viên.
• Kết quả đầu ra (Postconditions): Hội viên mới có mã M1983, có tài khoản hoạt động và nhận được email hướng dẫn tải App di động.

### 4.2 Luồng Phân Công & Kiểm Soát Soát Vé QR Sự Kiện
• Mục tiêu nghiệp vụ: Đảm bảo an ninh trật tự và tính chuẩn xác tại cửa đón tiếp đại biểu của các đại hội, gala lớn; ngăn chặn việc nhân sự không có phận sự tự ý soát vé.
• Tác nhân tham gia (Actors): Ban Quản Trị (Phân công), Nhân sự Ban Truyền Thông (Thực hiện quét QR), Đại biểu tham dự.
• Điều kiện tiên quyết (Preconditions): Sự kiện đã được khởi tạo trên Web CRM và đang ở trạng thái công bố (published).
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Ban Quản Trị hoặc Admin mở trang chi tiết sự kiện trên Web CRM, chuyển sang tab "Phân công Soát vé".
  - Bước 2: Hệ thống truy vấn danh sách thành viên có vai trò BAN_TRUYEN_THONG. BQT tích chọn các thành viên cụ thể được giao nhiệm vụ trực cổng và bấm "Lưu Phân Công".
  - Bước 3: Dữ liệu được ghi vào bảng event_scanners với status = "active".
  - Bước 4: Ứng dụng di động của các nhân sự được chỉ định tự động xuất hiện tiện ích "Soát vé sự kiện" tại Trang chủ (/association). Đối với tất cả hội viên và tài khoản khác, tiện ích này hoàn toàn bị ẩn.
  - Bước 5: Khi đại biểu đến cửa, nhân sự mở camera quét mã QR trên vé của khách. Hệ thống gọi API GET /api/events/checkin/lookup để kiểm tra tính hợp lệ của vé, số bàn VIP và ghế ngồi.
  - Bước 6: Nhân sự bấm "Xác nhận vào cửa". Hệ thống cập nhật bảng event_registrations: is_checked_in = true, lưu thời điểm check-in và scanned_by_user_id, đồng thời phát WebSocket cập nhật realtime số lượng khách đã đến lên màn hình Dashboard của Ban Tổ Chức trên Web CRM.
• Luồng ngoại lệ (Exception Flow):
  - Trường hợp vé đã được quét trước đó: Hệ thống cảnh báo đỏ "Vé này đã được check-in lúc [HH:mm] bởi [Nhân sự]".
  - Trường hợp vé không tồn tại hoặc sai sự kiện: Hệ thống cảnh báo "Mã vé không hợp lệ".
• Kết quả đầu ra (Postconditions): Đại biểu được hướng dẫn vào đúng bàn tiệc; Ban Tổ Chức nắm bắt chính xác 100% tỷ lệ tham dự theo thời gian thực.

### 4.3 Luồng Gia hạn hội phí Hội Viên (+365 Ngày)
• Mục tiêu nghiệp vụ: Quản lý vòng đời thẻ hội viên hàng năm theo quy chế CLB CEO 1983.
• Quyền thực hiện: Chỉ có Ban Thành Viên và Super Admin mới có quyền bấm nút gia hạn.
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Ban Thành Viên lọc danh sách hội viên sắp đến hạn hoặc đã quá hạn thẻ (status = "expired") trên Web CRM.
  - Bước 2: Khi hội viên đóng hội phí năm mới (được Ban Tài Chính đối soát hoặc hệ thống VietQR gạch nợ tự động), Ban Thành Viên mở hồ sơ hội viên và bấm nút "Gia hạn hội phí".
  - Bước 3: Hệ thống mở popup xác nhận kỳ hạn mới. Ban Thành Viên kiểm tra số tiền và bấm "Xác Nhận Gia Hạn".
  - Bước 4: Hệ thống tạo bản ghi mới trong bảng memberships, cập nhật start_date = ngày gia hạn, expires_at = ngày hiện tại + 365 ngày (hoặc ngày hết hạn cũ + 365 ngày nếu gia hạn sớm).
  - Bước 5: Hóa đơn liên quan trong bảng invoices được cập nhật status = "paid".
  - Bước 6: Thẻ hội viên trên App di động của CEO lập tức chuyển trạng thái sang "Đang hoạt động" với dải băng màu vàng kim sang trọng, đồng thời mở lại toàn bộ quyền lợi VIP.
• Kết quả đầu ra (Postconditions): Thời hạn thẻ được cộng thêm 1 năm; dữ liệu tài chính ghi nhận doanh thu hội phí.

### 4.4 Luồng Khởi Tạo & Điều Hành Cuộc Họp Online / Offline (Quy Trình Mới)
• Mục tiêu nghiệp vụ: Tổ chức các cuộc họp Ban Quản Trị, Họp Thường trực, Đại hội thành viên hoặc họp giao ban các ban ngành chuyên môn với cơ chế kiểm soát tập trung, chống trùng lịch phòng họp.
• Tác nhân tham gia (Actors):
  - Tác nhân khởi tạo: Chỉ có 4 vai trò có thẩm quyền tạo cuộc họp gồm Quản trị, Admin, Tổng thư ký, Trưởng ban. Thành viên thông thường tuyệt đối không có quyền tạo cuộc họp.
  - Tác nhân phê duyệt: Quản trị (Super Admin / Platform Admin).
  - Tác nhân tham dự: Toàn bộ đại biểu được triệu tập (Xác nhận tham gia / Báo vắng).
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Người dùng có thẩm quyền (Quản trị, Admin, Tổng thư ký, Trưởng ban) truy cập phân hệ "Quản lý cuộc họp" trên Web CRM và nhấn "Tạo Cuộc Họp Mới". Người dùng chọn vai trò khởi tạo tương ứng.
  - Bước 2: Điền thông tin cuộc họp và lựa chọn nền tảng / phòng họp thông qua Dropdown duy nhất (Hệ thống đã gộp toàn bộ việc đăng ký phòng họp vào form tạo cuộc họp, không còn chức năng đăng ký phòng họp riêng biệt):
    + Tiêu đề cuộc họp và nội dung chương trình nghị sự (Agenda chi tiết).
    + Thời gian: Ngày họp, giờ bắt đầu và giờ kết thúc dự kiến.
    + Nền tảng & Phòng họp (Dropdown tích hợp): Lựa chọn một trong các phương án:
      * "Zoom Meetings": Nhập liên kết phòng Zoom và Passcode bảo mật.
      * "Google Meet": Nhập URL phòng họp Google Meet chính thức.
      * "UniWork Meet": Tích hợp nền tảng họp trực tuyến bảo mật nội bộ UniWork.
      * "Phòng Họp Trực Tiếp - Sapphire UniWork Hub": Phòng họp vật lý tại trụ sở hiệp hội (Sức chứa 40 đại biểu, trang bị màn hình LED P2 và hệ thống micro hội nghị).
      * "Địa Điểm Offline Khác": Nhập địa chỉ cụ thể, tên phòng họp và liên kết bản đồ Google Maps.
    + Thành phần triệu tập: Chọn "Toàn bộ CLB", "Ban Quản Trị", hoặc "Ban chuyên môn cụ thể".
  - Bước 3: Phân luồng phê duyệt tự động theo thẩm quyền:
    + Trường hợp 1: Nếu người tạo là Quản trị hoặc Admin, cuộc họp tự động được duyệt ngay lập tức (status = "upcoming" - Sắp diễn ra).
    + Trường hợp 2: Nếu người tạo là Tổng thư ký hoặc Trưởng ban, cuộc họp được lưu với trạng thái status = "pending_approval" ("Chờ Quản trị duyệt") và hiển thị trong danh sách chờ duyệt của Quản trị viên.
  - Bước 4: Phê duyệt cuộc họp bởi Quản trị (Super Admin):
    + Quản trị viên truy cập màn hình Cuộc họp, lọc danh sách "Chờ Quản trị duyệt" (hoặc xem thẻ KPI Chờ duyệt).
    + Quản trị viên xem xét nội dung, kiểm tra xung đột phòng họp và nhấn nút "Duyệt Cuộc Họp" (chuyển sang status = "upcoming") hoặc "Từ chối" kèm lý do phản hồi.
  - Bước 5: Kích hoạt thông báo tự động khi cuộc họp được phê duyệt:
    + Cơ chế 1: Bắn thông báo đẩy (Push Notification) đến App di động của tất cả đại biểu có tên trong danh sách triệu tập.
    + Cơ chế 2: Tự động gửi tin nhắn trực tiếp từ tài khoản Hệ thống [CEO1983_SYSTEM] vào hộp thư chat cá nhân của từng đại biểu, ghi rõ tiêu đề, thời gian, hình thức phòng họp và liên kết truy cập/bản đồ chỉ đường.
  - Bước 6: Đại biểu mở App di động, bấm nút "Xác nhận tham gia (RSVP)" hoặc "Báo vắng có lý do".
  - Bước 7: Ban Thư Ký và Quản trị viên theo dõi danh sách điểm danh realtime trên Web CRM để chốt số lượng đại biểu.
• Luồng ngoại lệ (Exception Flow):
  - Nếu cuộc họp bị Quản trị từ chối phê duyệt: Trạng thái chuyển sang "cancelled", người tạo (Tổng thư ký/Trưởng ban) nhận thông báo lý do để điều chỉnh lại lịch họp.
• Kết quả đầu ra (Postconditions): Cuộc họp được ban hành chuẩn xác, kiểm soát 100% việc sử dụng phòng họp và thông báo đồng bộ đến toàn bộ đại biểu.

### 4.5 Luồng Quản Trị Sàn Giao Thương B2B, Kiểm Duyệt Sản Phẩm & Banner Tài Trợ
• Mục tiêu nghiệp vụ: Xúc tiến thương mại nội khối giữa các doanh nghiệp hội viên CEO 1983, đảm bảo chất lượng hàng hóa dịch vụ uy tín và an toàn.
• Tác nhân tham gia (Actors): Doanh nghiệp hội viên (Đăng sản phẩm/quảng cáo), Ban Quản Trị / Ban Xúc Tiến Thương Mại (Kiểm duyệt).
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Doanh nghiệp hội viên đăng sản phẩm hoặc gửi hồ sơ đăng ký quảng cáo banner trên App di động.
  - Bước 2: Dữ liệu được chuyển về phân hệ "Quản lý Sàn B2B" trên Web CRM với trạng thái status = "pending".
  - Bước 3: Cán bộ Ban Xúc Tiến kiểm tra nội dung hình ảnh, giá ưu đãi B2B dành riêng cho hội viên CLB, và chứng nhận pháp lý sản phẩm.
  - Bước 4: Ban Quản Trị bấm "Phê duyệt" (Approve):
    + Sản phẩm chuyển status = "approved", lập tức xuất hiện trang trọng trên sàn Marketplace của App di động.
    + Đối với gói tài trợ quảng cáo banner: Sau khi đối soát phí tài trợ, banner được kích hoạt hiển thị ở Top Carousel đầu trang sàn thương mại với huy hiệu "Được Tài Trợ / Sponsored" màu vàng ánh kim.
  - Bước 5: Hội viên trên App có thể bấm nút "Liên hệ người bán" để mở ngay luồng chat B2B trao đổi thương thảo hợp đồng.
• Luồng ngoại lệ (Exception Flow):
  - Nếu sản phẩm vi phạm quy chế hoặc hình ảnh kém chất lượng: Quản trị viên bấm "Từ chối" kèm ghi chú chỉnh sửa. Người bán nhận được thông báo để cập nhật lại.
• Kết quả đầu ra (Postconditions): Sản phẩm chất lượng cao được lưu thông an toàn trong hệ sinh thái doanh nhân CEO 1983.

### 4.6 Luồng Tổ Chức Bầu Cử Đại Hội & Biểu Quyết Trực Tuyến
• Mục tiêu nghiệp vụ: Thực hiện dân chủ, minh bạch trong các kỳ đại hội hiệp hội, bầu cử nhân sự Ban Chấp hành hoặc biểu quyết các nghị quyết quan trọng.
• Tác nhân tham gia (Actors): Ban Quản Trị (Tạo phiên biểu quyết), Toàn thể Hội viên chính thức (Bỏ phiếu).
• Quy trình thực hiện chi tiết (Step-by-step Flow):
  - Bước 1: Ban Quản Trị tạo phiên biểu quyết trên Web CRM: Tiêu đề phiên họp, danh sách ứng viên hoặc các phương án biểu quyết (Đồng ý / Không đồng ý / Ý kiến khác), thời gian mở và đóng hòm phiếu điện tử.
  - Bước 2: BQT bấm "Mở Phiếu Bầu". Hệ thống phát tín hiệu realtime đến toàn bộ App di động của hội viên.
  - Bước 3: Hội viên mở tab Biểu quyết, xem thông tin và tích chọn phương án -> Bấm "Xác nhận bỏ phiếu".
  - Bước 4: Hệ thống ghi nhận lá phiếu vào bảng ballots, kiểm tra tính hợp lệ và chặn việc bỏ phiếu lần 2 (mỗi hội viên chỉ bỏ phiếu 1 lần duy nhất).
  - Bước 5: Màn hình Web CRM hiển thị biểu đồ tỷ lệ % phiếu bầu theo thời gian thực và tự động khóa hòm phiếu khi hết giờ quy định.
• Kết quả đầu ra (Postconditions): Kết quả bầu cử minh bạch, có thể trích xuất biên bản kiểm phiếu PDF ngay tại đại hội.

## PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & TỪ ĐIỂN DỮ LIỆU

| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Khóa chính, định danh duy nhất của hội viên. |
| member_code | VARCHAR(20) | Có | UNIQUE | Mã hội viên độc quyền (Ví dụ: M1983-001, M1983-099). |
| user_id | UUID | Không | FK -> vione_users.id | Liên kết tài khoản đăng nhập hệ thống. |
| full_name | VARCHAR(150) | Có | None | Họ và tên đầy đủ của doanh nhân. |
| phone | VARCHAR(20) | Có | UNIQUE | Số điện thoại di động chính thức, nhận OTP và thông báo. |
| email | VARCHAR(100) | Không | None | Email công việc dùng để nhận tài khoản và thư mời họp. |
| company_name | VARCHAR(255) | Có | None | Tên doanh nghiệp / pháp nhân đại diện. |
| position | VARCHAR(100) | Có | None | Chức vụ lãnh đạo (Chủ tịch HĐQT, CEO, Tổng Giám đốc). |
| industry | VARCHAR(100) | Có | None | Ngành nghề lĩnh vực hoạt động sản xuất kinh doanh. |
| tax_code | VARCHAR(30) | Không | None | Mã số thuế doanh nghiệp phục vụ xuất hóa đơn VAT. |
| connection_needs | TEXT | Không | None | Nhu cầu kết nối giao thương B2B trong CLB. |
| status | VARCHAR(30) | Có | None | Trạng thái: "pending" (Chờ duyệt), "active" (Hoạt động), "expired" (Hết hạn), "suspended" (Tạm khóa). |
| avatar_url | TEXT | Không | None | Đường dẫn ảnh đại diện chất lượng cao của CEO. |
| cover_url | TEXT | Không | None | Đường dẫn ảnh bìa trang cá nhân. |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm đăng ký hồ sơ vào hệ thống. |


| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã sự kiện duy nhất. |
| title | VARCHAR(255) | Có | None | Tên sự kiện (Ví dụ: Gala Doanh Nhân CEO 1983 - Hội Tụ Tinh Hoa). |
| description | TEXT | Không | None | Nội dung chi tiết, kịch bản chương trình và quyền lợi đại biểu. |
| banner_url | TEXT | Không | None | Ảnh banner chính tràn viền của sự kiện (16:9). |
| event_date | TIMESTAMPTZ | Có | None | Ngày giờ khai mạc chính thức của sự kiện. |
| location | VARCHAR(255) | Có | None | Địa chỉ địa điểm tổ chức (Khách sạn, Trung tâm hội nghị). |
| map_link | TEXT | Không | None | Link Google Maps định vị chính xác dẫn đường. |
| dresscode | VARCHAR(100) | Không | None | Quy định trang phục đại biểu tham dự. |
| status | VARCHAR(30) | Có | None | Trạng thái: "draft" (Bản nháp), "published" (Đã công bố), "completed" (Đã xong). |
| created_by | UUID | Có | FK -> vione_users.id | Người tạo sự kiện (Admin hoặc BQT). |


| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã cuống vé điện tử duy nhất. |
| event_id | UUID | Có | FK -> events.id | Liên kết đến sự kiện tham dự. |
| member_id | UUID | Có | FK -> members.id | Hội viên đăng ký vé. |
| ticket_code | VARCHAR(30) | Có | UNIQUE | Mã vé QR duy nhất (Ví dụ: TIK-8319-099). |
| ticket_type | VARCHAR(50) | Có | None | Hạng vé: "STANDARD", "VIP", "VVIP Khách Mời". |
| table_number | VARCHAR(20) | Không | None | Số bàn tiệc phân bổ (Ví dụ: Bàn VIP 01). |
| seat_number | VARCHAR(20) | Không | None | Số ghế ngồi danh dự (Ví dụ: Ghế 08). |
| lucky_number | VARCHAR(20) | Không | None | Mã số quay thưởng may mắn bốc thăm đêm gala. |
| is_checked_in | BOOLEAN | Có | None | Trạng thái điểm danh (true: Đã vào cửa, false: Chưa đến). |
| checked_in_at | TIMESTAMPTZ | Không | None | Thời điểm quét mã QR soát vé thành công. |
| scanned_by_user_id | UUID | Không | FK -> vione_users.id | Nhân sự Ban Truyền Thông đã thực hiện quét vé. |


| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã bản ghi phân công soát vé. |
| event_id | UUID | Có | FK -> events.id | Sự kiện được phân công nhiệm vụ trực cổng. |
| user_id | UUID | Có | FK -> vione_users.id | Nhân sự Ban Truyền Thông được Ban Quản Trị chỉ định. |
| assigned_by | UUID | Có | FK -> vione_users.id | Lãnh đạo Ban Quản Trị đã thực hiện phân công. |
| status | VARCHAR(20) | Có | None | Trạng thái: "active" (Đang có quyền quét), "revoked" (Thu hồi quyền). |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm gán quyền soát vé cho nhân sự. |


| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã hóa đơn thu phí duy nhất. |
| invoice_code | VARCHAR(50) | Có | UNIQUE | Mã giao dịch kế toán (Ví dụ: INV-CEO1983-2026-088). |
| member_id | UUID | Có | FK -> members.id | Hội viên có nghĩa vụ đóng phí. |
| amount | NUMERIC(15,2) | Có | None | Số tiền hội phí niêm yết (Ví dụ: 10,000,000 VNĐ/năm). |
| type | VARCHAR(50) | Có | None | Loại phí: "ANNUAL_MEMBERSHIP" (Hội phí thường niên), "EVENT_SPONSOR" (Tài trợ), "AD_BANNER" (Quảng cáo). |
| vietqr_code | TEXT | Không | None | Chuỗi mã VietQR Napas 24/7 sinh tự động chứa nội dung chuyển khoản. |
| status | VARCHAR(30) | Có | None | Trạng thái: "pending" (Chờ thanh toán), "paid" (Đã thanh toán), "cancelled" (Hủy). |
| paid_at | TIMESTAMPTZ | Không | None | Thời điểm ngân hàng gạch nợ thành công qua Webhook hoặc đối soát tay. |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm lập hóa đơn thu phí. |


| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | BIGSERIAL | Có | PK | Mã định danh nhật ký kiểm toán tăng tự động. |
| user_id | UUID | Không | FK -> vione_users.id | Tài khoản người dùng đã thực hiện hành động. |
| action | VARCHAR(100) | Có | None | Tên hành động: "MEMBER_APPROVE", "MEMBER_RENEW", "SCANNER_ASSIGN", "DELETE_PRODUCT". |
| target_table | VARCHAR(50) | Có | None | Bảng CSDL bị tác động (members, events, invoices). |
| target_id | VARCHAR(100) | Không | None | ID của bản ghi bị tác động. |
| ip_address | VARCHAR(50) | Không | None | Địa chỉ IP truy cập của người thực hiện. |
| user_agent | TEXT | Không | None | Thông tin trình duyệt và hệ điều hành của thiết bị. |
| details | JSONB | Không | None | Dữ liệu trước và sau khi thay đổi (Before/After snapshot). |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm chính xác diễn ra thao tác kiểm toán. |


## PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT)

| Mã TC | Tên Nghiệp Vụ | Vai Trò Thực Hiện | Thao Tác Thực Hiện | Kỳ Vọng Kỹ Thuật (API/DB) | Kỳ Vọng Giao Diện (UI) |
| --- | --- | --- | --- | --- | --- |
| TC_CRM_01 | Đăng ký Landing không có doanh thu | Ứng viên mới | Điền đơn gia nhập trên Landing web | API POST /api/members/apply không gửi trường revenue; CSDL lưu status = pending | Hiển thị popup thông báo Nộp đơn thành công, chờ thẩm định |
| TC_CRM_02 | BQT / Admin phê duyệt kết nạp | Ban Quản Trị / Admin | Nhấn nút "Phê duyệt" tại hồ sơ pending | status = active, sinh mã M1983-xxx, tạo user bcrypt, gửi mail qua mailer | Thẻ đổi sang màu xanh Hoạt động, hiển thị mã hội viên mới |
| TC_CRM_03 | Chỉ định nhân sự quét QR sự kiện | Ban Quản Trị | Chọn sự kiện, gán nhân sự Ban Truyền thông | Lưu bản ghi vào bảng event_scanners với status active | Nhân sự BTT mở app thấy nút Soát vé; Hội viên thường không thấy |
| TC_CRM_04 | Ban Thành viên gia hạn hội viên | Ban Thành Viên | Bấm nút "Gia hạn" trên hồ sơ hội viên | Thêm 365 ngày vào memberships.expires_at, hóa đơn đổi paid | Thời hạn thẻ tự động cập nhật đến năm tiếp theo |
| TC_CRM_05 | Tạo cuộc họp Offline gửi tin nhắn | Ban Quản Trị / Admin | Tạo họp Offline -> Bấm Ban hành | Hệ thống push notification và insert tin nhắn vào chat_messages | Hội viên nhận thông báo đẩy và tin nhắn địa chỉ, ngày giờ họp |
| TC_CRM_06 | Phân quyền phân hệ Tài chính | Hội viên thường | Cố gắng truy cập menu Tài chính | Hệ thống chặn quyền (HTTP 403 Forbidden) | Menu Tài chính bị ẩn hoàn toàn trên thanh điều hướng |
| TC_CRM_07 | Nhắn tin B2B trên Web CRM | Hội viên chính thức | Mở chat CRM, gửi tin nhắn cho hội viên khác | Lưu vào chat_messages, phát socket thời gian thực | Tin nhắn hiển thị ngay trong bong bóng chat của người nhận |
| TC_CRM_08 | Kiểm duyệt sản phẩm Sàn B2B | Ban Quản Trị | Vào danh sách sản phẩm pending, bấm Duyệt | Cập nhật products.status = approved, xuất bản lên App | Sản phẩm xuất hiện trên sàn Marketplace di động |
| TC_CRM_09 | Tạo phiên biểu quyết đại hội | Ban Quản Trị | Khởi tạo câu hỏi bầu cử và mở bình chọn | Lưu bảng votes status = active, phát Socket.io | Hội viên mở tab Biểu quyết trên App thấy câu hỏi ngay |
| TC_CRM_10 | Truy vết an ninh Audit Log | Super Admin | Thực hiện thao tác nhạy cảm, mở trang Audit Log | CSDL ghi nhận bản ghi mới vào audit_logs kèm IP và User | Bảng Audit Log hiển thị dòng log mới nhất ở đầu trang |


