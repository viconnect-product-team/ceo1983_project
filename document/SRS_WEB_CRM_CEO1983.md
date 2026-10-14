# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM CỔNG QUẢN TRỊ CRM (SRS - WEB CRM)
## HỆ THỐNG QUẢN TRỊ ĐIỀU HÀNH HIỆP HỘI CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Tiêu chuẩn: IEEE 830-1998 - Phiên bản: 5.0 Hoàn thiện - Phát hành: Tháng 10/2026*

---

# PHẦN 1: GIỚI THIỆU CHUNG & TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) này cung cấp bản mô tả toàn diện, chi tiết và có tính chất pháp lý kỹ thuật cho Cổng Quản trị CRM Hiệp hội Doanh nhân CEO 1983, trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).
Tài liệu xác định rõ ràng:
- Toàn bộ các phân hệ nghiệp vụ quản trị, chức năng và các chức năng con.
- Chi tiết từng màn hình, từng trường dữ liệu, kiểu dữ liệu, ràng buộc nhập liệu (Validation) và giá trị mặc định.
- Hành vi tương tác giao diện động theo từng giá trị người dùng lựa chọn tại các ô chọn (Select-State UI Dependencies).
- Luồng xử lý nghiệp vụ lưu nháp, lưu chính thức, chỉnh sửa, xóa và truy xuất tài liệu.
- Cơ chế giao tiếp dữ liệu thời gian thực với máy chủ và ứng dụng di động.
- Toàn bộ các yêu cầu phi chức năng (Non-Functional Requirements) về hiệu năng, bảo mật, độ tin cậy, tính toàn vẹn dữ liệu và tiêu chuẩn thẩm mỹ doanh nhân.

### 1.2. Phạm vi hệ thống
Hệ thống Cổng Quản trị Web CRM đóng vai trò là "Bộ não điều hành số" trung tâm của hiệp hội, kết nối liên thông thời gian thực với Ứng dụng Di động của các hội viên doanh nhân. Hệ thống phục vụ cho các cấp lãnh đạo: Chủ tịch, Admin quản trị, Ban Điều Hành, Tổng thư ký, 5 Trưởng ban chuyên môn (Thành viên, Xúc tiến thương mại, Tài chính, Truyền thông, Thiện nguyện) và Ban Thư ký câu lạc bộ.
- **Tên miền Cổng Quản trị CRM**: `https://crm.ceo1983.viconnect.vn/`
- **Tên miền Ứng dụng Di động Hội viên**: `https://ceo1983.viconnect.vn/`

### 1.3. Định nghĩa thuật ngữ & Từ viết tắt
- **Hiệp hội / Câu lạc bộ**: CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).
- **Hội viên chính danh**: Doanh nhân sinh năm 1983 (Quý Hợi), là người đại diện pháp luật hoặc lãnh đạo cấp cao của doanh nghiệp thành lập hợp pháp, đã được Ban Thành Viên thẩm định và cấp Mã số hội viên dạng `CEO-83xxx`.
- **Thẻ điện tử hội viên & Quét mã QR kết nối động**: Thẻ định danh điện tử 3D VIP mạ vàng độc bản của hội viên tích hợp mã QR kết nối động và liên kết cá nhân hóa; chỉ cần quét mã QR bằng camera điện thoại là truyền tải tức thì hồ sơ doanh nhân, website và thông tin liên hệ trong vòng dưới 1 giây mà đối tác không cần cài ứng dụng.
- **Mã VietQR Napas 24/7**: Chuẩn mã thanh toán chuyển khoản ngân hàng nhanh quốc gia, tích hợp sẵn số tài khoản hiệp hội và cú pháp đối soát tự động.
- **Khán phòng Seating Map**: Sơ đồ chỗ ngồi đại biểu trực quan dạng bàn tiệc tròn (10 người/bàn) hoặc dãy ghế rạp chiếu phim có phân khu bàn VIP cho lãnh đạo và nhà tài trợ.

---

# PHẦN 2: MÔ TẢ TỔNG QUAN KIẾN TRÚC & NGƯỜI DÙNG

### 2.1. Kiến trúc kết nối đồng bộ 2 chiều thời gian thực (Realtime Dual-Sync)
Hệ thống CRM và Ứng dụng Di động chia sẻ chung một cơ sở dữ liệu duy nhất. Mọi biến động trạng thái từ Web CRM (phê duyệt kết nạp, phân bổ nhiệm vụ, ban hành thông báo hội phí, xuất bản sự kiện) lập tức phát tín hiệu đẩy chuông tới điện thoại hội viên. Ngược lại, mọi tương tác từ ứng dụng di động (quét mã VietQR nộp tiền, báo cáo tiến độ bằng ảnh camera hiện trường, quét mã QR check-in tại cổng) lập tức hiển thị lên màn hình Web CRM trong vòng dưới 1 giây.

### 2.2. Cơ cấu phân cấp quản trị 7 cấp bậc (RBAC Matrix)
1. **Cấp 1 - Chủ tịch Hiệp hội (`chu_tich`)**: Toàn quyền phê chuẩn nghị quyết, chỉ đạo liên ban và giám sát toàn diện dữ liệu.
2. **Cấp 2 - Quản trị viên Hệ thống (`admin` / `quan_tri`)**: Toàn quyền quản trị tham số, ma trận phân quyền và bảo mật hệ thống.
3. **Cấp 3 - Ban Điều Hành (`ban_dieu_hanh`)**: Cơ quan thường trực điều hành liên ban, giám sát 5 ban chuyên môn.
4. **Cấp 4 - Tổng thư ký (`tong_thu_ky`)**: Điều hành Văn phòng Ban Thư Ký; thẩm quyền giao việc giới hạn cho Ban Thư Ký.
5. **Cấp 5 - Trưởng các Ban Chuyên môn (`truong_ban_*`)**: Phụ trách độc quyền ban của mình (Thành viên, Xúc tiến, Tài chính, Truyền thông, Thiện nguyện); chỉ giao việc cho thành viên thuộc ban mình phụ trách.
6. **Cấp 6 - Ban Thư ký (`ban_thu_ky`)**: Cán bộ văn phòng thừa hành nhiệm vụ từ Tổng thư ký và Ban Điều Hành.
7. **Cấp 7 - Hội viên Doanh nhân (`member`)**: Thành viên sinh hoạt, nhận nhiệm vụ và kết nối giao thương.

---

# PHẦN 3: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT TỪNG PHÂN HỆ CRM

## 3.1. Phân hệ Bảng Điều Hành Trung Tâm & Đo Lường Tổng Quan (Executive Dashboard)

### 3.1.1. Thông tin chung
- **Mục tiêu**: Cung cấp bức tranh toàn cảnh tức thời (Real-time Snapshot) về sức khỏe tổ chức, quy mô hội viên, tiến độ thu ngân quỹ, tỷ lệ hoàn thành công việc và diễn biến các sự kiện lớn.
- **Phạm vi thẩm quyền**:
  - Chủ tịch, Admin và Ban Điều Hành xem được toàn bộ chỉ số tài chính, hội đồng thành viên và KPI liên ban.
  - Trưởng ban chuyên môn chỉ xem được các thẻ chỉ số KPI thuộc ban mình phụ trách.

### 3.1.2. Màn hình
- **3.1.2.1. Tìm kiếm / Lọc kỳ báo cáo**: Lọc theo Năm tài chính, Quý hoặc Tháng hoạt động.
- **3.1.2.2. Danh sách chỉ số đo lường (KPI Cards)**: 4 thẻ số liệu vàng hoàng gia: Tổng số hội viên chính danh, Tổng thu ngân quỹ niên liễm, Tỷ lệ công việc hoàn thành đúng hạn, Lượt kết nối giao thương B2B.
- **3.1.2.3. Thiết lập mục tiêu năm**: Biểu mẫu nhập kế hoạch chỉ tiêu phát triển hội viên và doanh số giao thương nội bộ.
- **3.1.2.4. Chỉnh sửa chỉ tiêu**: Điều chỉnh chỉ tiêu định kỳ sau phiên họp giữa niên độ.
- **3.1.2.5. Chỉ định người lập báo cáo**: Phân công Thư ký tổng hợp báo cáo quý.
- **3.1.2.6. Lịch sử biến động chỉ số**: Biểu đồ đường thời gian theo dõi tăng trưởng hội viên qua các năm.
- **3.1.2.7. Ẩn / Đặt lại widget**: Tùy biến hiển thị các khối nội dung trên bảng điều hành.
- **3.1.2.8. Xem chi tiết báo cáo phân tích**: Màn hình xem sâu phân bổ hội viên theo ngành nghề kinh doanh và tình trạng đóng hội phí.

### 3.1.3. Mô tả chi tiết màn hình
#### 3.1.3.1. Tìm kiếm & Bộ lọc
- **Bộ lọc Năm tài chính**: Chọn năm hoạt động (2024, 2025, 2026).
- **Bộ lọc Ban chuyên môn**: Xem chỉ số riêng của từng ban hoặc toàn hiệp hội.

#### 3.1.3.2. Biểu mẫu Thiết lập Chỉ tiêu Kế hoạch năm
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `targetYear` | Năm kế hoạch | Chọn một | Có | Năm hiện tại | 2024 - 2030 | Bắt buộc chọn đúng năm |
| `targetMembers`| Chỉ tiêu kết nạp (Hội viên)| Số nguyên | Có | 100 | 10 đến 1.000 | Phải là số dương |
| `targetRevenue`| Chỉ tiêu ngân quỹ (VNĐ) | Số tiền tệ | Có | 1.000.000.000 | 100 triệu đến 50 tỷ | Định dạng dấu chấm hàng nghìn |
| `targetDeals` | Chỉ tiêu cơ hội B2B | Số nguyên | Có | 200 | 20 đến 2.000 | Số lượng giao dịch kết nối |
| `focusSector` | Ngành mũi nhọn ưu tiên | Chọn nhiều | Không | Rỗng | 12 nhóm ngành B2B | Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Năm kế hoạch" là năm đã qua*:
    - Toàn bộ các trường dữ liệu **tự động chuyển sang chế độ Chỉ đọc (Read-only)**, ẩn nút Lưu và hiển thị cảnh báo: *"Chỉ tiêu năm tài chính đã đóng không được phép chỉnh sửa"*.
  - *Khi người đăng nhập là Trưởng ban chuyên môn*:
    - Màn hình tự động ẩn mục chỉ tiêu ngân quỹ toàn hiệp hội, chỉ hiển thị mục tiêu công việc nội bộ ban.

#### 3.1.3.3. Bảng danh sách hoạt động gần đây
- Dòng thời gian hiển thị 10 sự kiện mới nhất: Hội viên mới được kết nạp, Phiếu nộp hội phí thành công, Nhiệm vụ vừa được nghiệm thu đạt.

#### 3.1.3.4. Lịch sử chỉ tiêu
- Bảng đối sánh giữa kế hoạch đề ra và kết quả thực tế đạt được.

#### 3.1.3.5. Đặt lại bố cục giao diện
- Hộp thoại khôi phục bảng điều hành về trạng thái mặc định của hiệp hội.

#### 3.1.3.6. Chọn cán bộ phụ trách báo cáo
- Hộp thoại chọn thành viên Ban Thư Ký xuất báo cáo tổng hợp.

#### 3.1.3.7. Xem chi tiết biểu đồ phân tích
- Biểu đồ tròn cơ cấu hội viên theo ngành, biểu đồ cột thu chi tài chính 12 tháng.

### 3.1.4. Luồng nghiệp vụ
- **3.1.4.1. Xem tổng quan**: Đăng nhập CRM -> Hệ thống hiển thị bảng điều hành tự động cập nhật số liệu.
- **3.1.4.2. Lưu nháp kế hoạch**: Lưu tạm dự thảo chỉ tiêu năm mới.
- **3.1.4.3. Phê duyệt ban hành chỉ tiêu**: Chủ tịch bấm phê duyệt -> Áp dụng chỉ tiêu chính thức.
- **3.1.4.4. Đặt lại chỉ tiêu**: Điều chỉnh chỉ tiêu trong trường hợp có biến động lớn.
- **3.1.4.5. Xem chi tiết chỉ số**: Nhấp vào từng thẻ chỉ số để xem danh sách chi tiết cấu thành.
- **3.1.4.6. Xuất báo cáo điều hành**: Xuất báo cáo tổng quan ra tệp Excel hoặc PDF.

### 3.1.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.1.5.1. Lấy dữ liệu KPI tổng quan**: Trả về số lượng hội viên, quỹ tiền, tiến độ công việc.
- **3.1.5.2. Lấy dữ liệu biểu đồ phân bổ**: Trả về tỷ lệ phần trăm theo ngành và theo ban.
- **3.1.5.3. Lưu chỉ tiêu kế hoạch mới**: Ghi nhận chỉ tiêu vào cơ sở dữ liệu.
- **3.1.5.4. Lưu nháp chỉ tiêu**: Lưu vào bộ nhớ tạm.
- **3.1.5.5. Cập nhật chỉ số thực tế**: Tự động tính toán lại khi có giao dịch tài chính hoặc kết nạp mới.
- **3.1.5.6. Chỉnh sửa chỉ tiêu kế hoạch**: Cập nhật mục tiêu năm tài chính.
- **3.1.5.7. Xóa cấu hình chỉ tiêu**: Khôi phục về mặc định.
- **3.1.5.8. Lấy danh mục cấu hình bảng điều hành**: Trả về danh sách widget được phép hiển thị theo vai trò.

---

## 3.2. Phân hệ Quản trị Phân Quyền & Vai Trò Lãnh Đạo 7 Cấp (/permissions)

### 3.2.1. Thông tin chung
- **Mục tiêu**: Điều phối và giám sát toàn bộ ma trận phân quyền 30 chức năng x 7 cấp bậc vai trò của hiệp hội. Đảm bảo nguyên tắc bảo mật tối cao: Không ai có thể thao tác vượt thẩm quyền.
- **Cơ chế bảo vệ thời gian thực**: Nếu vai trò tài khoản bị thay đổi khi đang thao tác dở, hệ thống máy chủ ném mã chặn và Frontend hiển thị modal cảnh báo trung tâm, tự động tải lại quyền mà không làm mất phiên đăng nhập.

### 3.2.2. Màn hình
- **3.2.2.1. Tìm kiếm**: Khung tìm chức năng theo từ khóa, lọc theo Ban chuyên môn và lọc theo Cấp bậc vai trò.
- **3.2.2.2. Danh sách ma trận quyền**: Bảng ma trận hiển thị 30 dòng chức năng x các cột vai trò kèm ô chọn bật/tắt (Xem, Thêm, Sửa, Xóa, Duyệt).
- **3.2.2.3. Thêm mới vai trò / Gán quyền**: Biểu mẫu gán vai trò lãnh đạo hoặc bổ nhiệm nhân sự mới.
- **3.2.2.4. Chỉnh sửa quyền**: Bật/tắt từng đặc quyền của hội viên.
- **3.2.2.5. Chọn đầu mối phụ trách ban**: Hộp thoại chỉ định Trưởng ban chuyên môn.
- **3.2.2.6. Lịch sử thay đổi quyền (Audit Log)**: Bảng nhật ký ghi vết ai đã sửa quyền của ai, vào thời gian nào và từ địa chỉ mạng nào.
- **3.2.2.7. Thu hồi quyền đặc biệt**: Hộp thoại hoàn trả quyền tài khoản về quyền Hội viên mặc định.
- **3.2.2.8. Xem chi tiết quyền tài khoản**: Cửa sổ kiểm tra toàn bộ các quyền được phép và bị cấm của một hội viên cụ thể.

### 3.2.3. Mô tả chi tiết màn hình
#### 3.2.3.1. Tìm kiếm & Bộ lọc ma trận quyền
- **Ô nhập từ khóa**: Tìm nhanh chức năng (ví dụ: "kết nạp", "sổ quỹ", "soát vé").
- **Dropdown chọn Ban chuyên môn**: Lọc theo 6 ban chuyên môn hoặc hiển thị tất cả.

#### 3.2.3.2. Biểu mẫu Thêm mới / Gán vai trò Lãnh đạo
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `memberId` | Chọn hội viên | Chọn danh sách | Có | Rỗng | Danh sách hội viên chính danh | Phải là hội viên đang hoạt động |
| `systemRole` | Vai trò lãnh đạo | Chọn một | Có | Thành viên | Chủ tịch, Admin, Ban Điều Hành, Tổng thư ký, Trưởng ban, Ban thư ký, Hội viên | Bắt buộc chọn đúng vai trò |
| `department` | Ban chuyên môn | Chọn một | Có | Tùy vai trò | 6 Ban chuyên môn chính thức | Xem quy tắc giao diện động |
| `assignedScope`| Phạm vi phụ trách | Chọn một | Không | Nội bộ ban | Nội bộ ban, Toàn hiệp hội | Xem quy tắc giao diện động |
| `validUntil` | Thời hạn ủy quyền | Ngày tháng | Không | Không thời hạn | Từ ngày hiện tại trở đi | Chuẩn dd/mm/yyyy |
| `reasonNotes` | Căn cứ phê chuẩn | Đoạn văn bản | Có | Rỗng | 10 - 500 ký tự | Ghi rõ số quyết định bổ nhiệm |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Vai trò lãnh đạo" = "Trưởng ban"*:
    - Giao diện **bắt buộc hiển thị Dropdown "Chọn Ban Chuyên Môn Phụ Trách"** (chỉ được chọn 1 trong 5 ban chuyên môn độc quyền).
    - Tự động khóa trường "Phạm vi phụ trách" về "Nội bộ ban", hiển thị nhãn: *"Trưởng ban chỉ có thẩm quyền giao việc cho thành viên thuộc chính ban của mình"*.
  - *Khi chọn "Vai trò lãnh đạo" = "Tổng thư ký"*:
    - Dropdown "Ban chuyên môn" **tự động chuyển và khóa cứng** ở giá trị "Ban Thư Ký".
  - *Khi chọn "Vai trò lãnh đạo" = "Chủ tịch" hoặc "Admin"*:
    - Trường "Phạm vi phụ trách" tự động đổi thành "Toàn quyền hiệp hội", bật sáng huy hiệu vàng Amber Gold cảnh báo quyền tối cao.

#### 3.2.3.3. Bảng ma trận phân quyền phẳng
- Hiển thị các công tắc Toggle màu vàng Amber Gold. Có thanh thông báo thay đổi chưa lưu (Unsaved Changes Warning).

#### 3.2.3.4. Nhật ký Audit Log phân quyền
- Ghi nhận chi tiết: Thời gian, Người thực hiện, Người bị thay đổi, Quyền cũ -> Quyền mới.

#### 3.2.3.5. Hộp thoại Thu hồi quyền
- Cảnh báo chuyển tài khoản về quyền Hội viên cơ bản, yêu cầu nhập lý do thu hồi.

#### 3.2.3.6. Popup Chọn đầu mối Trưởng ban
- Tìm kiếm nhanh hội viên uy tín để gán vào vị trí Trưởng ban.

#### 3.2.3.7. Xem chi tiết quyền hạn
- Bảng trực quan: Xanh lá (Được phép thao tác), Đỏ (Bị cấm thao tác).

### 3.2.4. Luồng nghiệp vụ
- **3.2.4.1. Tìm kiếm quyền**: Lọc theo ban và từ khóa.
- **3.2.4.2. Lưu nháp thay đổi**: Lưu tạm cấu hình vào bộ nhớ máy để kiểm tra trước khi áp dụng.
- **3.2.4.3. Lưu ma trận chính thức**: Ghi nhận vào cơ sở dữ liệu -> Bắn tín hiệu đồng bộ liên máy trạm.
- **3.2.4.4. Thu hồi quyền**: Bỏ các đặc quyền gán thêm.
- **3.2.4.5. Xem chi tiết**: Tra cứu hồ sơ thẩm quyền của tài khoản.
- **3.2.4.6. Xuất ma trận Excel**: Xuất bảng ma trận quyền có chữ ký xác nhận của Ban Điều Hành.

### 3.2.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.2.5.1. Lấy ma trận quyền hiện tại**: Trả về 30 chức năng và quyền của 7 vai trò.
- **3.2.5.2. Lấy danh sách hội viên theo ban**: Trả về hội viên thuộc ban được chọn.
- **3.2.5.3. Cập nhật ma trận quyền chính thức**: Lưu thay đổi và ghi audit log.
- **3.2.5.4. Lưu nháp ma trận**: Lưu tạm cấu hình.
- **3.2.5.5. Cập nhật vai trò hội viên**: Đổi chức danh và cấp bậc tài khoản.
- **3.2.5.6. Chỉnh sửa quyền tài khoản**: Cập nhật các quyền bật/tắt bổ sung.
- **3.2.5.7. Thu hồi quyền đặc biệt**: Đặt lại vai trò mặc định Hội viên.
- **3.2.5.8. Lấy danh mục 7 cấp bậc vai trò**: Trả về hằng số vai trò chuẩn hiệp hội.

---

## 3.3. Phân hệ Quản lý Hội Viên & Thẩm Định Kết Nạp 360° (/members)

### 3.3.1. Thông tin chung
- **Mục tiêu**: Quản trị vòng đời hội viên từ tiếp nhận hồ sơ, thẩm định điều kiện năm sinh 1983 (Quý Hợi), phê duyệt kết nạp, cấp mã số `CEO-83xxx` đến quản lý sinh hoạt hội viên.
- **Thẩm quyền độc quyền**: Ban Thành Viên chịu trách nhiệm chính về thẩm định và kết nạp; Ban Thư Ký không có quyền duyệt kết nạp. Xóa hội viên áp dụng cơ chế Xóa liên thông (Cascade Deletion) sạch sẽ.

### 3.3.2. Màn hình
- **3.3.2.1. Tìm kiếm**: Tìm kiếm đa năng (Tên, Mã hội viên, Số điện thoại, Mã số thuế) và lọc theo Ban, Trạng thái hội phí, Trạng thái sinh hoạt.
- **3.3.2.2. Danh sách dữ liệu**: Bảng danh sách hội viên hiển thị avatar, họ tên, chức vụ, tên công ty, mã số thuế, ban phụ trách, trạng thái thẻ thông minh.
- **3.3.2.3. Tiếp nhận hồ sơ kết nạp mới**: Biểu mẫu đăng ký gồm: Thông tin cá nhân lãnh đạo, Pháp nhân doanh nghiệp, Năng lực cung ứng, Người giới thiệu.
- **3.3.2.4. Chỉnh sửa hồ sơ**: Cập nhật thông tin liên hệ hoặc điều chỉnh phân bổ ban.
- **3.3.2.5. Chỉ định cán bộ thẩm định**: Hộp thoại chọn thành viên Ban Thành Viên đi khảo sát cơ sở thực tế.
- **3.3.2.6. Lịch sử sinh hoạt & Đóng phí**: Theo dõi quá trình tham gia đại hội, nộp hội phí qua các năm.
- **3.3.2.7. Xóa hội viên liên thông**: Hộp thoại xác nhận xóa vĩnh viễn và tự động giải phóng toàn bộ doanh nghiệp, gian hàng B2B và tài khoản liên quan.
- **3.3.2.8. Xem chi tiết hồ sơ 360°**: Toàn cảnh 4 tab: Doanh nhân, Pháp nhân công ty, Gian hàng sản phẩm và Lịch sử cống hiến.

### 3.3.3. Mô tả chi tiết màn hình
#### 3.3.3.1. Tìm kiếm & Bộ lọc
- Tìm kiếm tức thì độ trễ 300ms. Dropdown lọc trạng thái: Đang hoạt động, Chờ thẩm định, Tạm ngưng sinh hoạt.

#### 3.3.3.2. Biểu mẫu Thêm mới / Kết nạp Hội viên
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fullName` | Họ và tên | Văn bản ngắn | Có | Rỗng | 2 - 100 ký tự | Tự động viết hoa, cắt khoảng trắng thừa |
| `birthYear` | Năm sinh | Số nguyên | Có | 1983 | 1983 (Chính thức) | Cảnh báo nếu năm sinh khác 1983 (BR-02) |
| `phoneNumber` | Số điện thoại di động | Số điện thoại | Có | Rỗng | 10 số (đầu số 03, 05, 07, 08, 09) | Kiểm tra định dạng số di động VN |
| `personalEmail`| Thư điện tử | Email | Có | Rỗng | Tối đa 150 ký tự | Định dạng email hợp lệ, duy nhất |
| `companyName` | Tên doanh nghiệp | Văn bản ngắn | Có | Rỗng | 5 - 250 ký tự | Tên công ty theo ĐKKD |
| `taxId` | Mã số thuế | Ký tự số | Có | Rỗng | 10 hoặc 13 số | Kiểm tra hợp lệ theo chuẩn Thuế |
| `memberType` | Phân hạng hội viên | Chọn một | Có | Hội viên Chính thức | Chính thức, Danh dự, Liên kết | Xem quy tắc giao diện động |
| `assignedBan` | Phân bổ Ban chuyên môn | Chọn một | Có | Ban Thành Viên | 6 Ban chuyên môn chính thức | Bắt buộc chọn đúng ban |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phân hạng hội viên" = "Hội viên Chính thức"*:
    - Bắt buộc kiểm tra năm sinh phải bằng 1983. Nếu khác 1983, viền đỏ cảnh báo vi phạm điều lệ hiệp hội.
    - Tự động sinh mã hội viên `CEO-83xxx` tăng dần.
  - *Khi chọn "Phân hạng hội viên" = "Hội viên Danh dự"*:
    - Bỏ qua ràng buộc năm sinh 1983, hiển thị thêm trường nhập: *"Căn cứ quyết định công nhận danh dự"*.

#### 3.3.3.3. Bảng danh sách hội viên
- Hiển thị ảnh đại diện tròn, họ tên in đậm, huy hiệu chức vụ mạ vàng, cột trạng thái xanh lá cây/vàng.

#### 3.3.3.4. Lịch sử hồ sơ
- Ghi nhận mọi lần cập nhật chức vụ hoặc thay đổi người đại diện pháp luật.

#### 3.3.3.5. Hộp thoại Xóa hội viên liên thông
- Cảnh báo cấp cao nhất (Nền đỏ đậm). Yêu cầu nhập lý do xóa và tự động xóa doanh nghiệp, sản phẩm, thẻ thông minh và tài khoản.

#### 3.3.3.6. Popup Chọn cán bộ thẩm định
- Chọn thành viên Ban Thành Viên phụ trách thẩm định hồ sơ.

#### 3.3.3.7. Xem chi tiết hồ sơ 360°
- Tab 1 Doanh nhân & Thẻ thông minh mạ vàng; Tab 2 Doanh nghiệp; Tab 3 Sản phẩm B2B; Tab 4 Lịch sử hội phí & Sự kiện.

### 3.3.4. Luồng nghiệp vụ
- **3.3.4.1. Tìm kiếm hội viên**: Lọc danh bạ nhanh chóng.
- **3.3.4.2. Lưu nháp hồ sơ ứng viên**: Tiếp nhận hồ sơ sơ bộ lưu nháp để chờ bổ sung bản quét Giấy phép ĐKKD.
- **3.3.4.3. Phê duyệt kết nạp chính thức**: Ban Thành Viên thẩm định đạt điều kiện -> Bấm duyệt -> Tự động cấp mã `CEO-83xxx` và khởi tạo tài khoản.
- **3.3.4.4. Xóa liên thông**: Thu hồi tư cách hội viên và xóa cascade dữ liệu liên thông.
- **3.3.4.5. Xem chi tiết 360°**: Tra cứu toàn diện hồ sơ.
- **3.3.4.6. Xuất danh bạ Excel**: Xuất danh bạ gửi Ban Chấp Hành.

### 3.3.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.3.5.1. Tra cứu hội viên**: Lấy danh sách hội viên phân trang.
- **3.3.5.2. Lấy hồ sơ chi tiết 360°**: Trả về dữ liệu 4 khối thông tin.
- **3.3.5.3. Phê duyệt kết nạp mới**: Cấp mã hội viên duy nhất và tạo tài khoản.
- **3.3.5.4. Lưu nháp hồ sơ**: Lưu thông tin ứng viên chưa duyệt.
- **3.3.5.5. Cập nhật hồ sơ hội viên**: Chỉnh sửa thông tin liên lạc.
- **3.3.5.6. Chỉnh sửa hồ sơ nháp**: Bổ sung tài liệu vào bản nháp.
- **3.3.5.7. Xóa hội viên cascade**: Xóa hội viên và các bảng liên quan trong một giao dịch an toàn.
- **3.3.5.8. Lấy danh mục ngành nghề và phân hạng**: Trả về danh mục chuẩn.

---

## 3.4. Phân hệ Quản lý Hồ Sơ Doanh Nghiệp Pháp Nhân (/companies)

### 3.4.1. Thông tin chung
- **Mục tiêu**: Quản trị pháp nhân kinh tế của các doanh nghiệp thành viên CEO 1983. Minh bạch hóa hồ sơ năng lực, vốn điều lệ, quy mô nhân sự, trụ sở và chứng chỉ chất lượng để phục vụ kết nối giao thương nội bộ.
- **Nguyên tắc gắn kết**: Mỗi doanh nghiệp bắt buộc liên kết với ít nhất một hội viên chính danh đại diện pháp luật.

### 3.4.2. Màn hình
- **3.4.2.1. Tìm kiếm**: Tìm doanh nghiệp theo tên, mã số thuế, ngành nghề hoặc địa bàn hoạt động.
- **3.4.2.2. Danh sách dữ liệu**: Bảng danh sách doanh nghiệp thành viên hiển thị logo, tên công ty, mã số thuế, đại diện pháp luật, quy mô nhân sự, lĩnh vực kinh doanh.
- **3.4.2.3. Đăng ký doanh nghiệp mới**: Biểu mẫu nhập thông tin công ty thành viên.
- **3.4.2.4. Chỉnh sửa hồ sơ pháp nhân**: Cập nhật thay đổi vốn điều lệ, trụ sở hoặc logo.
- **3.4.2.5. Chỉ định người đại diện thứ hai**: Gán thêm phó giám đốc hoặc lãnh đạo cấp cao cùng sinh hoạt.
- **3.4.2.6. Lịch sử phát triển doanh nghiệp**: Bảng ghi nhận các giải thưởng, chứng chỉ ISO và thành tựu kinh doanh.
- **3.4.2.7. Tạm dừng hoạt động doanh nghiệp**: Hộp thoại gắn cờ doanh nghiệp tạm ngừng giao thương.
- **3.4.2.8. Xem chi tiết hồ sơ năng lực**: Màn hình xem bản giới thiệu công ty (Company Profile) đính kèm bản quét Giấy phép kinh doanh.

### 3.4.3. Mô tả chi tiết màn hình
#### 3.4.3.1. Tìm kiếm & Bộ lọc doanh nghiệp
- Tìm kiếm theo Mã số thuế (10 hoặc 13 số), tên công ty hoặc lĩnh vực hoạt động.

#### 3.4.3.2. Biểu mẫu Khai báo Hồ sơ Doanh nghiệp
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `companyName` | Tên công ty đầy đủ | Văn bản ngắn | Có | Rỗng | 5 - 250 ký tự | Tên đúng theo Giấy phép ĐKKD |
| `taxId` | Mã số thuế | Ký tự số | Có | Rỗng | 10 hoặc 13 số | Kiểm tra hợp lệ theo chuẩn Thuế |
| `charterCapital`| Vốn điều lệ (VNĐ) | Số tiền tệ | Có | 1.000.000.000 | 100 triệu đến 10.000 tỷ | Định dạng dấu chấm hàng nghìn |
| `employeeCount`| Quy mô nhân sự | Chọn một | Có | Từ 10 - 50 người | Dưới 10, 10-50, 51-200, Trên 200 | Bắt buộc chọn đúng quy mô |
| `headquarters` | Địa chỉ trụ sở chính | Văn bản ngắn | Có | Rỗng | 10 - 300 ký tự | Ghi rõ số nhà, đường, tỉnh/thành |
| `businessCert` | Bản quét ĐKKD (PDF) | Tải lên tệp | Có | Rỗng | Tệp PDF hoặc Ảnh (tối đa 20MB) | Bắt buộc có tài liệu pháp lý |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi nhập "Mã số thuế"*:
    - Hệ thống **tự động kiểm tra trùng lặp trên toàn CSDL**. Nếu mã số thuế đã thuộc về doanh nghiệp khác, ô nhập hiện viền đỏ kèm thông báo lỗi: *"Mã số thuế này đã được đăng ký bởi doanh nghiệp [Tên công ty]"*.
  - *Khi chọn "Quy mô nhân sự" = "Trên 200 người"*:
    - Form **hiển thị thêm trường**: *"Số lượng chi nhánh / Nhà máy sản xuất"* và *"Chứng chỉ năng lực cấp đặc biệt"*.

#### 3.4.3.3. Danh sách doanh nghiệp
- Bảng hiển thị logo công ty sắc nét, tên người đại diện pháp luật và huy hiệu xác thực hồ sơ.

#### 3.4.3.4. Lịch sử doanh nghiệp
- Lưu vết các lần điều chỉnh vốn điều lệ và bổ sung ngành nghề kinh doanh.

#### 3.4.3.5. Hộp thoại Tạm dừng giao thương
- Tạm khóa khả năng đăng tải sản phẩm của công ty trên sàn B2B khi doanh nghiệp đang tái cấu trúc.

#### 3.4.3.6. Popup Gán đại diện pháp luật
- Chọn hội viên CEO 1983 làm đại diện sở hữu doanh nghiệp.

#### 3.4.3.7. Xem chi tiết Profile Công ty
- Xem trực tiếp tệp hồ sơ năng lực PDF và danh sách các sản phẩm đang cung ứng.

### 3.4.4. Luồng nghiệp vụ
- **3.4.4.1. Tìm kiếm doanh nghiệp**: Lọc danh bạ doanh nghiệp thành viên.
- **3.4.4.2. Lưu nháp hồ sơ công ty**: Soạn thảo thông tin công ty lưu nháp.
- **3.4.4.3. Lưu chính thức hồ sơ pháp nhân**: Ban Thành Viên xác thực giấy phép ĐKKD -> Lưu chính thức vào danh bạ hiệp hội.
- **3.4.4.4. Tạm dừng / Xóa doanh nghiệp**: Đình chỉ hoặc xóa hồ sơ doanh nghiệp khi hội viên giải tán công ty.
- **3.4.4.5. Xem chi tiết năng lực**: Đối tác xem hồ sơ năng lực để chuẩn bị ký hợp đồng giao thương.
- **3.4.4.6. Xuất danh bạ doanh nghiệp**: Xuất tệp Excel danh bạ doanh nhân phục vụ đại hội.

### 3.4.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.4.5.1. Tra cứu danh sách doanh nghiệp**: Lấy danh sách doanh nghiệp kèm tên người đại diện.
- **3.4.5.2. Lấy chi tiết pháp nhân**: Tải hồ sơ năng lực, vốn và giấy phép đính kèm.
- **3.4.5.3. Tạo mới doanh nghiệp thành viên**: Lưu hồ sơ pháp nhân vào CSDL.
- **3.4.5.4. Lưu nháp thông tin công ty**: Lưu bản nháp chưa công bố.
- **3.4.5.5. Cập nhật hồ sơ doanh nghiệp**: Chỉnh sửa địa chỉ hoặc logo.
- **3.4.5.6. Chỉnh sửa bản nháp**: Bổ sung giấy tờ vào bản nháp.
- **3.4.5.7. Tạm dừng / Xóa doanh nghiệp**: Cập nhật trạng thái kinh doanh.
- **3.4.5.8. Lấy danh mục quy mô và loại hình doanh nghiệp**: Trả về danh mục chuẩn.

---

## 3.5. Phân hệ Quản lý Công Việc, Giao Việc Phân Cấp Đa Định Dạng (/tasks)

### 3.5.1. Thông tin chung
- **Mục tiêu**: Xóa bỏ hoàn toàn việc trôi tin nhắn hoặc quên việc; số hóa 100% công tác điều hành, giao việc phân cấp có tiêu chí nghiệm thu rõ ràng, thời hạn đếm ngược và dự toán kinh phí.
- **Thẩm quyền phân cấp nghiêm ngặt**:
  - Chủ tịch và Admin toàn quyền giao việc toàn hiệp hội.
  - Tổng thư ký chỉ giao cho Ban Thư Ký.
  - Trưởng ban chuyên môn chỉ giao cho các thành viên trong chính ban của mình phụ trách.
  - Hỗ trợ đính kèm trực tiếp các tệp văn bản Word (.doc, .docx), bảng tính Excel (.xls, .xlsx), PDF và ảnh hiện trường.

### 3.5.2. Màn hình
- **3.5.2.1. Tìm kiếm**: Khung tìm kiếm tiêu đề nhiệm vụ, lọc theo Ban phụ trách, Trạng thái (Chờ tiếp nhận, Đang làm, Chờ nghiệm thu, Hoàn thành, Quá hạn), Độ khẩn cấp.
- **3.5.2.2. Danh sách dữ liệu**: Quản lý nhiệm vụ đa chế độ xem: Bảng danh sách chi tiết (Table), Thẻ Kanban trực quan kéo thả, Lịch biểu tiến độ (Gantt).
- **3.5.2.3. Khởi tạo / Giao việc mới**: Biểu mẫu giao việc gồm: Tiêu đề, Ban chuyên môn, Người chủ trì, Người phối hợp, Mức độ ưu tiên, Hạn chót, Dự toán kinh phí, Tiêu chí nghiệm thu, Tệp đính kèm.
- **3.5.2.4. Chỉnh sửa nhiệm vụ**: Gia hạn thời gian hoàn thành hoặc bổ sung kinh phí.
- **3.5.2.5. Chỉ định người chủ trì**: Hộp thoại chọn người chịu trách nhiệm chính nghiệm thu.
- **3.5.2.6. Lịch sử tiến độ & Trao đổi**: Dòng thời gian ghi nhận các lần báo cáo tiến độ và bình luận chỉ đạo.
- **3.5.2.7. Hủy nhiệm vụ**: Hộp thoại đình chỉ nhiệm vụ kèm lý do.
- **3.5.2.8. Xem chi tiết & Hồ sơ nghiệm thu**: Cửa sổ xem toàn bộ chỉ đạo, xem trước tệp Word/Excel/PDF đính kèm, ảnh chụp hiện trường và 2 nút: [Nghiệm Thu Đạt] / [Yêu Cầu Chỉnh Sửa].

### 3.5.3. Mô tả chi tiết màn hình
#### 3.5.3.1. Tìm kiếm & Bộ lọc công việc
- Tìm kiếm tức thì theo từ khóa. Bộ lọc độ ưu tiên: Khẩn cấp (Đỏ), Cao (Cam), Bình thường (Xanh), Thấp (Xám).

#### 3.5.3.2. Biểu mẫu Giao nhiệm vụ Đa cấp
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `taskTitle` | Tiêu đề nhiệm vụ | Văn bản ngắn | Có | Rỗng | 5 - 200 ký tự | Tự động cắt khoảng trắng thừa |
| `targetDepartment`| Ban phụ trách | Chọn một | Có | Ban của người đăng nhập| 6 Ban chuyên môn | Phụ thuộc quyền hạn người đăng nhập |
| `assigneeId` | Người chịu trách nhiệm chính| Chọn một | Có | Rỗng | Danh sách thành viên trong ban | Bắt buộc chọn đúng nhân sự hợp lệ |
| `collaborators`| Người cùng phối hợp | Chọn nhiều | Không | Rỗng | Danh sách hội viên | Cho phép chọn tối đa 20 người |
| `priorityLevel`| Mức độ ưu tiên | Chọn một | Có | Bình thường | Khẩn cấp, Cao, Bình thường, Thấp | Xem quy tắc giao diện động |
| `dueDate` | Hạn chót hoàn thành | Ngày giờ | Có | +3 ngày | Sau thời điểm hiện tại | Chuẩn dd/mm/yyyy HH:mm |
| `budgetCost` | Dự toán kinh phí (VNĐ) | Số tiền tệ | Không | 0 | 0 đến 50 tỷ VNĐ | Định dạng dấu chấm hàng nghìn |
| `acceptanceNotes`| Tiêu chí nghiệm thu đạt | Đoạn văn bản | Có | Rỗng | 20 - 2000 ký tự | Mô tả rõ sản phẩm đầu ra |
| `attachedFiles` | Tài liệu đính kèm (Word/Excel)| Tải lên tệp | Không | Rỗng | File Word, Excel, PDF, Ảnh (tối đa 25MB) | Cho phép đính kèm nhiều tệp |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi người đăng nhập là Trưởng ban chuyên môn (ví dụ: Trưởng ban Tài chính)*:
    - Dropdown "Ban phụ trách" **tự động khóa cứng** ở giá trị "Ban Tài chính".
    - Danh sách "Người chịu trách nhiệm chính" chỉ hiển thị các thành viên thuộc Ban Tài chính. Hệ thống chặn đứng nếu cố tình giao việc sang ban khác.
  - *Khi chọn "Mức độ ưu tiên" = "Khẩn cấp"*:
    - Hệ thống **bật sáng viền đỏ rực rỡ** trên giao diện biểu mẫu.
    - Kích hoạt tính năng: Khi gửi công việc, máy chủ lập tức phát chuông báo động khẩn cấp tới ứng dụng di động của người nhận việc.
  - *Khi "Dự toán kinh phí" > 0*:
    - Form **hiển thị thêm trường**: *"Nguồn quỹ chi trả"* (Quỹ hoạt động, Quỹ sự kiện, Quỹ thiện nguyện) và *"Yêu cầu lập phiếu tạm ứng tài chính"*.

#### 3.5.3.3. Bảng danh sách công việc (Table & Kanban)
- Thẻ công việc hiển thị rõ: Tiêu đề, Tên người phụ trách kèm avatar tròn, Hạn chót (viền đỏ nếu quá hạn), Thanh tiến độ % hoàn thành, Số lượng tệp đính kèm.

#### 3.5.3.4. Lịch sử tiến độ & Hồ sơ nghiệm thu
- Hội viên nộp báo cáo kết quả kèm ảnh hiện trường và file Word/Excel; người giao việc phản hồi đánh giá.

#### 3.5.3.5. Hộp thoại Hủy nhiệm vụ
- Người giao việc hủy bỏ nhiệm vụ kèm ghi chú lý do.

#### 3.5.3.6. Popup Chọn người chủ trì gói việc
- Chọn nhanh cán bộ có năng lực chuyên môn để giao chủ trì.

#### 3.5.3.7. Xem chi tiết & Phê duyệt nghiệm thu
- Bản xem trước tệp văn bản Word và bảng tính Excel dự toán trực tiếp trên màn hình.
- 2 nút bấm quyết định: [Nghiệm Thu Đạt] (Màu xanh lá) và [Yêu Cầu Chỉnh Sửa] (Màu cam) kèm ô nhập góp ý.

### 3.5.4. Luồng nghiệp vụ
- **3.5.4.1. Tìm kiếm công việc**: Lọc theo ban và mức độ ưu tiên.
- **3.5.4.2. Lưu nháp kế hoạch việc**: Lưu tạm dự thảo kế hoạch để Ban Điều Hành góp ý.
- **3.5.4.3. Ban hành nhiệm vụ chính thức**: Kiểm tra thẩm quyền phân cấp -> Lưu nhiệm vụ -> Bắn thông báo đẩy tức thì tới điện thoại người nhận.
- **3.5.4.4. Hủy nhiệm vụ**: Hủy bỏ công việc khi không còn phù hợp.
- **3.5.4.5. Phê duyệt nghiệm thu**: Đánh giá kết quả công việc sau khi hoàn thành.
- **3.5.4.6. Xuất báo cáo KPI công việc**: Xuất bảng thống kê tỷ lệ hoàn thành công việc của từng ban.

### 3.5.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.5.5.1. Tra cứu danh sách công việc**: Lấy danh sách nhiệm vụ theo ban và trạng thái phân trang.
- **3.5.5.2. Lấy chi tiết công việc và tệp đính kèm**: Tải toàn bộ nội dung, tiêu chí nghiệm thu và đường dẫn tệp.
- **3.5.5.3. Khởi tạo công việc chính thức**: Gửi dữ liệu giao việc; Máy chủ kiểm tra thẩm quyền theo vai trò (BR-19, BR-20, BR-21); nếu hợp lệ, tạo công việc; nếu vượt quyền, từ chối giao việc.
- **3.5.5.4. Lưu nháp công việc**: Lưu tạm công việc ở trạng thái nháp.
- **3.5.5.5. Phê duyệt / Yêu cầu sửa nghiệm thu**: Gửi kết quả đánh giá nghiệm thu.
- **3.5.5.6. Chỉnh sửa công việc nháp**: Cập nhật kế hoạch nháp.
- **3.5.5.7. Hủy nhiệm vụ**: Đình chỉ công việc.
- **3.5.5.8. Lấy danh mục trạng thái và mức độ ưu tiên**: Trả về các hằng số quản trị công việc.

---

## 3.6. Phân hệ Quản lý Sự Kiện, Khán Phòng Seating Map & Soát Vé QR 0.1s (/events, /checkin)

### 3.6.1. Thông tin chung
- **Mục tiêu**: Quản trị chuyên nghiệp các sự kiện lớn của hiệp hội: Đại hội toàn thể, Diễn đàn kinh tế, Gala Doanh nhân 1983, Dạ tiệc giao thương.
- **Đặc điểm nổi bật**:
  - Thiết kế sơ đồ khán phòng trực quan: Sơ đồ bàn tiệc tròn (10 người/bàn) hoặc sơ đồ rạp chiếu phim (Cinema Seating Map).
  - Phân bổ vị trí bàn VIP trân trọng cho Chủ tịch, Ban Điều Hành và Nhà tài trợ Kim Cương/Vàng.
  - Cổng soát vé an ninh QR tốc độ cao tại bàn lễ tân: Quét mã QR thẻ đại biểu trong 0.1 giây, phát âm thanh chào đón và chống vé giả tuyệt đối.
  - Vòng quay may mắn (Lucky Draw) chọn quà tặng ngẫu nhiên cho các đại biểu ĐÃ THỰC TẾ ĐIỂM DANH.

### 3.6.2. Màn hình
- **3.6.2.1. Tìm kiếm**: Tìm sự kiện theo tên, lọc theo loại hình (Đại hội, Gala, Tọa đàm), trạng thái (Sắp diễn ra, Đang diễn ra, Đã kết thúc) và địa điểm.
- **3.6.2.2. Danh sách dữ liệu**: Bảng danh sách sự kiện hiển thị ảnh bìa, tên chương trình, thời gian, địa điểm, số vé đã phát hành, số đại biểu đã điểm danh.
- **3.6.2.3. Tạo sự kiện mới & Thiết kế Khán phòng**: Biểu mẫu thiết lập: Tên sự kiện, Thời gian, Khách sạn/Trung tâm hội nghị, Giới hạn đại biểu, Bố trí sơ đồ bàn tiệc tròn.
- **3.6.2.4. Chỉnh sửa sự kiện**: Thay đổi diễn giả hoặc điều chỉnh vị trí bàn tiệc.
- **3.6.2.5. Chỉ định Trưởng ban Tổ chức**: Hộp thoại chọn cán bộ phụ trách điều hành sự kiện.
- **3.6.2.6. Lịch sử điểm danh cổng**: Bảng theo dõi tiến độ check-in theo thời gian thực tại các cửa lễ tân.
- **3.6.2.7. Hủy sự kiện**: Hộp thoại hủy sự kiện và gửi thông báo xin lỗi đại biểu.
- **3.6.2.8. Màn hình Cổng Soát vé QR Toàn màn hình & Khán phòng 3D**: Giao diện soát vé tối ưu cho máy tính bảng/máy quét lễ tân và sơ đồ bố trí chỗ ngồi.

### 3.6.3. Mô tả chi tiết màn hình
#### 3.6.3.1. Tìm kiếm & Bộ lọc sự kiện
- Lọc theo loại hình: Đại hội toàn thể, Tọa đàm kinh tế, Dạ tiệc Gala Dinner, Khóa đào tạo lãnh đạo.

#### 3.6.3.2. Biểu mẫu Tạo sự kiện & Cấu hình Khán phòng
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `eventTitle` | Tên chương trình sự kiện | Văn bản ngắn | Có | Rỗng | 10 - 250 ký tự | Tự động cắt khoảng trắng thừa |
| `eventType` | Loại hình sự kiện | Chọn một | Có | Diễn đàn kinh tế | Đại hội, Gala Dinner, Tọa đàm, Giao lưu | Xem quy tắc giao diện động |
| `startTime` | Thời gian bắt đầu | Ngày giờ | Có | +7 ngày 18:00 | Lớn hơn thời điểm hiện tại | Chuẩn dd/mm/yyyy HH:mm |
| `endTime` | Thời gian kết thúc | Ngày giờ | Có | +7 ngày 21:30 | Lớn hơn thời gian bắt đầu | Tối thiểu cách bắt đầu 1 giờ |
| `eventLocation`| Địa điểm tổ chức | Văn bản ngắn | Có | Rỗng | 10 - 300 ký tự | Ghi rõ tên khách sạn/trung tâm |
| `capacityLimit`| Sức chứa tối đa (Khách)| Số nguyên | Có | 200 | 10 đến 5.000 người | Giới hạn vé phát hành |
| `seatingLayout`| Kiểu bố trí khán phòng | Chọn một | Có | Bàn tiệc tròn (Gala)| Bàn tròn Gala, Dãy ghế hội trường, Tự do | Xem quy tắc giao diện động |
| `isTicketPaid` | Tính chất vé | Chọn một | Có | Miễn phí cho hội viên| Miễn phí, Có thu phí tham dự | Xem quy tắc giao diện động |
| `bannerImage` | Ảnh bìa sự kiện | Tải lên ảnh | Có | Rỗng | Tệp ảnh JPG/PNG (dưới 5MB, tỉ lệ 16:9) | Bắt buộc có ảnh banner sang trọng |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Kiểu bố trí khán phòng" = "Bàn tiệc tròn (Gala)"*:
    - Hệ thống **kích hoạt công cụ thiết kế Bàn tiệc tròn**.
    - Hiển thị thêm các trường: *"Số lượng bàn tiệc"*, *"Số ghế mỗi bàn (Mặc định: 10 ghế/bàn)"*, *"Danh sách bàn VIP dành riêng cho Ban Điều Hành & Nhà tài trợ"*.
    - Trên sơ đồ trực quan, từng bàn tiệc tròn được hiển thị rõ số bàn (Bàn VIP 1, Bàn VIP 2, Bàn 3...) và tên của từng đại biểu ngồi tại ghế.
  - *Khi chọn "Tính chất vé" = "Có thu phí tham dự"*:
    - Form **hiển thị thêm trường**: *"Giá vé cho Hội viên"* và *"Giá vé cho Khách mời ngoài CLB"*.
    - Tự động tích hợp cổng thanh toán VietQR Napas 24/7: Khách mua vé bắt buộc quét mã thanh toán thành công mới được xuất vé điện tử.
  - *Khi chọn "Tính chất vé" = "Miễn phí cho hội viên"*:
    - Ẩn toàn bộ phần thanh toán; hội viên chỉ cần bấm "Đăng ký tham dự" là hệ thống tự động cấp vé và phân bổ chỗ ngồi.

#### 3.6.3.3. Màn hình Cổng Soát vé QR Tốc độ cao (Check-in Desk)
- Khung quét camera nhận diện mã QR vé trong 0.1 giây.
- **Hành vi hiển thị phản hồi ngay tức thì**:
  - *Nếu vé hợp lệ*: Màn hình chuyển sang màu Xanh lá cây rực rỡ, phát âm thanh "Ting", hiển thị to rõ: Ảnh đại biểu, Họ tên, Chức vụ, Tên công ty, Vị trí bàn tiệc: **Bàn VIP 01 - Ghế số 03**.
  - *Nếu vé đã điểm danh*: Màn hình chuyển sang màu Vàng cam cảnh báo, phát âm thanh cảnh báo, hiển thị: *"Vé này đã được điểm danh vào lúc 18h15 bởi nhân viên Bàn số 2"*.
  - *Nếu vé không hợp lệ*: Màn hình chuyển sang màu Đỏ, phát âm thanh từ chối, hiển thị: *"Vé không thuộc sự kiện này hoặc mã QR không tồn tại"*.

#### 3.6.3.4. Báo cáo tỷ lệ tham dự thời gian thực
- Biểu đồ thời gian thực hiển thị tỷ lệ đại biểu đã đến hội trường (ví dụ: 185/200 đại biểu - 92.5%).

#### 3.6.3.5. Hộp thoại Hủy sự kiện
- Yêu cầu mật khẩu cấp cao của Chủ tịch hoặc Trưởng ban Tổ chức trước khi gửi thông báo hủy.

#### 3.6.3.6. Popup Chọn cán bộ lễ tân
- Phân công cán bộ đón tiếp phụ trách từng cửa soát vé.

#### 3.6.3.7. Xem chi tiết & Quay số may mắn (Lucky Draw)
- Tích hợp màn hình Quay số may mắn trên màn hình chiếu LED hội trường: Hệ thống chỉ quay ngẫu nhiên các mã đại biểu ĐÃ THỰC TẾ CHECK-IN vào cửa.

#### 3.6.3.8. Seating Studio - Sơ Đồ Xếp Chỗ Trực Quan & Di Chuyển Chỗ Ngồi (Seat Reassignment)
- **Truy cập trực quan**: Nút "Sơ Đồ Xếp Chỗ" màu tím/navy trực tiếp trên Header trang Đăng Ký Sự Kiện (`/event-registrations`).
- **Mô hình Khán phòng**: Mô phỏng trực quan dạng rạp chiếu phim (Cinema Seating Map) hoặc Bàn tròn VIP với màn chiếu Stage trung tâm.
- **Trạng thái ghế ngồi**:
  - Ghế trống: Màu xám/slate bo góc, click để gán ngay cho đại biểu đang chọn.
  - Ghế đã có người: Hiển thị tên đại biểu, mã vé, doanh nghiệp và hạng vé.
  - Ghế đang chọn / Đang di chuyển: Viền vàng hổ phách (Amber Gold) nhấp nháy nổi bật.
- **Tính năng Di chuyển & Đổi Ghế (Seat Swapping / Reassigning)**:
  - *Phương thức 1 - Kéo & Thả (HTML5 Drag & Drop)*: Kéo đại biểu từ một ghế đã ngồi và thả vào ghế trống bất kỳ hoặc ghế khác trên sơ đồ.
  - *Phương thức 2 - Chế độ Click-to-Move*: Bấm nút "Di chuyển đại biểu sang ghế khác" trên thanh Inspector hoặc bấm nút "Chuyển" trên bảng danh sách đại biểu đã xếp chỗ. Thanh Banner màu hổ phách (Amber Notification Banner) xuất hiện phía trên sơ đồ: *"Đang di chuyển: [Tên Đại Biểu] (Ghế hiện tại: [Số ghế]). Hãy nhấp vào một ghế trống hoặc ghế khác để chuyển chỗ"*. Người dùng click vào ghế đích -> hệ thống tự động gọi API cập nhật vị trí ghế ngay tức thì.

#### 3.6.3.9. Quy Tắc Xóa Bỏ Hoàn Toàn Đại Biểu Hủy Vé Khỏi Hệ Thống CRM
- Khi đại biểu hủy đăng ký sự kiện từ Mobile App hoặc qua hệ thống:
  - Backend tự động thu hồi và giải phóng ghế (`seat_assignment = NULL`), loại trừ triệt để `status != 'cancelled'` khỏi mọi truy vấn danh sách đăng ký.
  - Giao diện CRM lọc bỏ hoàn toàn các bản ghi có trạng thái `cancelled` khỏi bảng đại biểu, loại bỏ tùy chọn 'cancelled' khỏi dropdown trạng thái và chỉ đếm các đại biểu đang tham gia hợp lệ trong các thẻ thống kê KPI ("Tổng Số Người Đăng Ký", "Đã Thanh Toán Phí", "Đã Xếp Chỗ Ngồi").
  - Đảm bảo thông tin đại biểu đã hủy không làm rối mắt ban tổ chức và không chiếm giữ vị trí chỗ ngồi trong khán phòng.

### 3.6.4. Luồng nghiệp vụ
- **3.6.4.1. Tìm kiếm sự kiện**: Lọc sự kiện theo thời gian và trạng thái.
- **3.6.4.2. Lưu nháp kế hoạch sự kiện**: Lưu dự thảo kế hoạch tổ chức sự kiện để lấy ý kiến Ban Chấp Hành.
- **3.6.4.3. Xuất bản sự kiện chính thức**: Phát hành vé tham dự lên ứng dụng di động của toàn thể hội viên.
- **3.6.4.4. Hủy sự kiện**: Hủy sự kiện và hoàn tiền vé (nếu có).
- **3.6.4.5. Điểm danh soát vé tại cổng**: Quét QR thẻ đại biểu tại bàn lễ tân trong 0.1 giây.
- **3.6.4.6. Xuất danh sách đại biểu**: Xuất tệp Excel danh sách phục vụ công tác đối soát và truyền thông.

### 3.6.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.6.5.1. Tra cứu danh sách sự kiện**: Trả về danh sách sự kiện kèm số lượng vé đã đăng ký.
- **3.6.5.2. Lấy sơ đồ khán phòng và trạng thái chỗ ngồi**: Trả về dữ liệu chi tiết của từng bàn tiệc/ghế ngồi.
- **3.6.5.3. Tạo mới sự kiện chính thức**: Lưu trữ sự kiện và mở cổng đăng ký vé.
- **3.6.5.4. Lưu nháp sự kiện**: Lưu kế hoạch sự kiện chưa công bố.
- **3.6.5.5. Quét soát vé QR đại biểu**: Gửi mã QR; Máy chủ kiểm tra trong 0.1 giây, cập nhật trạng thái đã điểm danh và trả về vị trí ngồi.
- **3.6.5.6. Cập nhật sơ đồ chỗ ngồi**: Điều chỉnh vị trí phân bổ đại biểu.
- **3.6.5.7. Hủy sự kiện**: Đổi trạng thái sự kiện sang Đã hủy và phát thông báo.
- **3.6.5.8. Lấy danh sách trúng thưởng Lucky Draw**: Quay số ngẫu nhiên từ tập hợp các đại biểu đã check-in.

---

## 3.7. Phân hệ Quản trị Tài Chính, Hội Phí Niên Liễm Napas 24/7 & Sổ Quỹ Thu Chi (/fees, /income, /expenses)

### 3.7.1. Thông tin chung
- **Mục tiêu**: Đảm bảo sự minh bạch 100% về dòng tiền của hiệp hội. Tự động hóa quá trình phát hành thông báo hội phí niên liễm, theo dõi tài trợ, quản lý sổ quỹ thu chi và lệnh tạm ứng có phê duyệt đa cấp.
- **Chuẩn hóa thanh toán hiện đại**:
  - Tự động sinh mã chuyển khoản VietQR Napas 24/7 có sẵn số tiền và cú pháp nội dung tự động nhận diện người nộp.
  - Hỗ trợ xuất và nhập khẩu dữ liệu sổ quỹ qua các tệp bảng tính Excel chuẩn mực.

### 3.7.2. Màn hình
- **3.7.2.1. Tìm kiếm**: Lọc chứng từ thu/chi theo khoảng thời gian, loại quỹ (Quỹ hội phí, Quỹ thiện nguyện, Quỹ sự kiện), trạng thái duyệt và đối tượng nộp/nhận.
- **3.7.2.2. Danh sách dữ liệu**: Sổ quỹ tài chính điện tử hiển thị ngày chứng từ, số phiếu thu/chi, phân loại khoản mục, số tiền, hình thức thanh toán, người lập và trạng thái phê duyệt.
- **3.7.2.3. Lập phiếu thu mới**: Biểu mẫu lập khoản thu niên liễm, thu tài trợ hoặc khoản thu giao thương.
- **3.7.2.4. Lập phiếu chi / Đề nghị tạm ứng**: Biểu mẫu đề xuất thanh toán chi phí hoạt động kèm chứng từ hóa đơn kế toán.
- **3.7.2.5. Chọn đối tượng nộp / nhận**: Hộp thoại tìm nhanh hội viên hoặc đối tác cung cấp dịch vụ.
- **3.7.2.6. Lịch sử giao dịch & Đối soát ngân hàng**: Bảng nhật ký đối chiếu biến động số dư tài khoản ngân hàng hiệp hội.
- **3.7.2.7. Hủy phiếu thu chi**: Hộp thoại hủy phiếu tài chính với sự đồng thuận của Trưởng ban Tài chính.
- **3.7.2.8. Xem chi tiết phiếu thu chi & Mã VietQR**: Màn hình hóa đơn điện tử hiển thị mã VietQR thanh toán 24/7 và thông tin kế toán.

### 3.7.3. Mô tả chi tiết màn hình
#### 3.7.3.1. Tìm kiếm & Bộ lọc sổ quỹ
- Thanh chọn khoảng ngày từ ngày... đến ngày...
- Dropdown lọc trạng thái: Đã thanh toán, Chờ duyệt chi, Đã quyết toán, Đã hủy.

#### 3.7.3.2. Biểu mẫu Lập phiếu Thu / Chi
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `voucherType` | Loại phiếu | Chọn một | Có | Phiếu Thu | Phiếu Thu, Phiếu Chi, Đề nghị Tạm ứng | Xem quy tắc giao diện động |
| `fundCategory` | Quỹ trực thuộc | Chọn một | Có | Quỹ hội phí thường niên | Quỹ hội phí, Quỹ thiện nguyện, Quỹ sự kiện, Quỹ hoạt động | Bắt buộc chọn đúng quỹ quản lý |
| `targetMember` | Người nộp / Người nhận | Chọn một | Có | Rỗng | Danh sách hội viên/đối tác | Bắt buộc chọn đối tượng chính danh |
| `amountMoney` | Số tiền (VNĐ) | Số tiền tệ | Có | Rỗng | 1.000 đến 100 tỷ VNĐ | Định dạng dấu chấm hàng nghìn, không số âm |
| `paymentMethod`| Hình thức giao dịch | Chọn một | Có | Chuyển khoản VietQR | Chuyển khoản VietQR, Tiền mặt | Xem quy tắc giao diện động |
| `documentProof`| Chứng từ / Hóa đơn kèm | Tải lên tệp | Có | Rỗng | Tệp ảnh hóa đơn, PDF sao kê | Bắt buộc có chứng từ kế toán |
| `description` | Diễn giải nội dung | Đoạn văn bản | Có | Rỗng | 10 - 500 ký tự | Ghi rõ lý do thu chi |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Loại phiếu" = "Phiếu Thu" và "Quỹ trực thuộc" = "Quỹ hội phí thường niên"*:
    - Hệ thống **tự động điền số tiền niêm yết theo quy chế hiệp hội** (ví dụ: 10.000.000 VNĐ/năm).
    - Tự động sinh mã chuyển khoản VietQR Napas 24/7 có sẵn số tài khoản hiệp hội và cú pháp nội dung: `HOIPHI CEO1983 [Mã hội viên] [Họ tên]`.
    - Sau khi thanh toán thành công, hệ thống tự động cập nhật niên khóa hội viên trên thẻ thông minh doanh nhân.
  - *Khi chọn "Loại phiếu" = "Phiếu Chi" hoặc "Đề nghị Tạm ứng"*:
    - Giao diện **kích hoạt quy trình duyệt 3 cấp**: Cán bộ đề xuất -> Trưởng ban chuyên môn thẩm định -> Trưởng ban Tài chính hoặc Chủ tịch phê duyệt.
    - Hiển thị thêm trường "Thời hạn hoàn ứng" và bắt buộc tải lên chứng từ dự toán đã được duyệt.
  - *Khi chọn "Hình thức giao dịch" = "Chuyển khoản VietQR"*:
    - Hiển thị trực tiếp khung mã VietQR trên màn hình để thủ quỹ hoặc hội viên quét thanh toán tức thì qua ứng dụng ngân hàng.

#### 3.7.3.3. Bảng sổ quỹ tài chính
- Bảng hiển thị tự động tính tổng: Tổng thu, Tổng chi, Số dư quỹ hiện hữu.
- Cột trạng thái có màu sắc rõ ràng: Xanh lá cây (Đã hoàn tất), Vàng (Chờ duyệt), Đỏ (Từ chối).

#### 3.7.3.4. Lịch sử giao dịch & Sao kê
- Bảng đối soát tự động khớp lệnh giữa biến động tài khoản và các phiếu thu trong hệ thống.

#### 3.7.3.5. Hộp thoại Hủy phiếu thu chi
- Yêu cầu nhập mật khẩu cấp cao và lý do hủy chứng từ kế toán.

#### 3.7.3.6. Popup Chọn hội viên nộp tiền
- Tìm kiếm nhanh theo Mã hội viên để tránh thu nhầm tiền của hội viên khác.

#### 3.7.3.7. Xem chi tiết phiếu thu chi
- Bản in phiếu thu/chi chuẩn mực có đầy đủ chữ ký số của Chủ tịch, Kế toán trưởng và Thủ quỹ.

### 3.7.4. Luồng nghiệp vụ
- **3.7.4.1. Tìm kiếm chứng từ**: Lọc sổ quỹ theo thời gian và loại quỹ.
- **3.7.4.2. Lưu nháp phiếu thu chi**: Kế toán lập dự thảo phiếu chi gửi Trưởng ban Tài chính xem xét.
- **3.7.4.3. Phát hành chứng từ chính thức**: Ban hành thông báo đóng hội phí hoặc xác nhận phiếu chi đã giải ngân.
- **3.7.4.4. Hủy phiếu thu chi**: Hủy chứng từ kế toán theo quy chế kiểm toán nội bộ.
- **3.7.4.5. Xem chi tiết phiếu**: Tra cứu hóa đơn và mã giao dịch ngân hàng.
- **3.7.4.6. Xuất sổ quỹ Excel**: Xuất báo cáo tài chính định kỳ hàng tháng cho Ban Chấp Hành.

### 3.7.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.7.5.1. Tra cứu sổ quỹ tài chính**: Lấy danh sách phiếu thu chi theo quỹ và kỳ kế toán.
- **3.7.5.2. Lấy số dư các quỹ**: Trả về số dư khả dụng tức thời của từng quỹ trực thuộc hiệp hội.
- **3.7.5.3. Lập phiếu thu chi chính thức**: Lưu chứng từ tài chính vào sổ cái hệ thống.
- **3.7.5.4. Lưu nháp đề nghị tạm ứng**: Lưu dự thảo đề nghị chi.
- **3.7.5.5. Phê duyệt lệnh chi**: Trưởng ban Tài chính duyệt giải ngân tiền từ quỹ.
- **3.7.5.6. Cập nhật đối soát ngân hàng**: Nhận tín hiệu thanh toán tự động từ ngân hàng đối tác.
- **3.7.5.7. Hủy chứng từ**: Hủy phiếu thu chi và hoàn tác số dư sổ quỹ.
- **3.7.5.8. Sinh mã VietQR động**: Trả về chuỗi mã hóa hình ảnh mã QR Napas 24/7 theo giao dịch.

---

## 3.8. Phân hệ Quản lý Cuộc Họp Ban Điều Hành & Lịch Hẹn Giao Thương 1-on-1 (/meetings)

### 3.8.1. Thông tin chung
- **Mục tiêu**: Quản trị chuyên nghiệp các phiên họp thường kỳ của Ban Chấp Hành, các cuộc họp đột xuất của Ban Thư Ký và điều phối các cuộc hẹn kết nối giao thương 1-on-1 giữa các chủ doanh nghiệp.
- **Đặc điểm nổi bật**: Tự động triệu tập đại biểu, gửi thông báo lịch họp sang ứng dụng di động của từng thành viên, đính kèm tài liệu nghị sự (Word, Excel, PDF), điểm danh bằng mã QR và lưu trữ nghị quyết sau phiên họp.

### 3.8.2. Màn hình
- **3.8.2.1. Tìm kiếm**: Lọc cuộc họp theo ban triệu tập, thời gian tổ chức, hình thức (Trực tiếp / Trực tuyến).
- **3.8.2.2. Danh sách dữ liệu**: Lịch họp hiển thị dạng bảng quản trị hoặc dạng Lịch biểu thời gian (Calendar View) trực quan.
- **3.8.2.3. Tạo cuộc họp mới**: Biểu mẫu thiết lập cuộc họp gồm: Tiêu đề phiên họp, Ban chủ trì, Thời gian, Phòng họp / Đường dẫn trực tuyến, Danh sách triệu tập, Tài liệu nghị sự.
- **3.8.2.4. Chỉnh sửa**: Thay đổi thời gian họp hoặc bổ sung thêm đại biểu tham dự.
- **3.8.2.5. Chỉ định Thư ký phiên họp**: Hộp thoại chọn cán bộ Ban Thư Ký phụ trách ghi biên bản cuộc họp.
- **3.8.2.6. Biên bản & Nghị quyết**: Danh sách tài liệu lưu trữ các nghị quyết đã được biểu quyết thông qua trong cuộc họp.
- **3.8.2.7. Hủy cuộc họp**: Hộp thoại hủy phiên họp và phát thông báo khẩn cấp tới các đại biểu.
- **3.8.2.8. Xem chi tiết cuộc họp**: Toàn cảnh chương trình nghị sự, danh sách đại biểu tham gia, tài liệu biểu quyết và biên bản họp.

### 3.8.3. Mô tả chi tiết màn hình
#### 3.8.3.1. Tìm kiếm & Bộ lọc cuộc họp
- Lọc theo hình thức: Trực tiếp tại trụ sở HanoiBA, Trực tuyến qua phòng họp từ xa.

#### 3.8.3.2. Biểu mẫu Tạo cuộc họp
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `meetingTitle` | Tiêu đề cuộc họp | Văn bản ngắn | Có | Rỗng | 10 - 200 ký tự | Tự động cắt khoảng trắng thừa |
| `meetingType` | Hình thức họp | Chọn một | Có | Trực tiếp tại trụ sở | Trực tiếp, Trực tuyến, Kết hợp cả hai | Xem quy tắc giao diện động |
| `hostingBan` | Ban chủ trì | Chọn một | Có | Ban Điều Hành | 6 Ban chuyên môn chính thức | Bắt buộc chọn đúng ban |
| `meetingStart` | Thời gian bắt đầu | Ngày giờ | Có | +1 ngày 09:00 | Lớn hơn thời điểm hiện tại | Chuẩn dd/mm/yyyy HH:mm |
| `meetingEnd` | Thời gian kết thúc | Ngày giờ | Có | +1 ngày 11:30 | Lớn hơn thời gian bắt đầu | Tối thiểu 30 phút |
| `onlineLink` | Đường dẫn họp trực tuyến | Đường dẫn web | Không | Rỗng | Đường dẫn Zoom / Meet hợp lệ | Xem quy tắc giao diện động |
| `attendeeIds` | Danh sách triệu tập | Chọn nhiều | Có | Rỗng | Danh sách hội viên | Tối thiểu chọn 2 người |
| `agendaDocs` | Tài liệu nghị sự đính kèm | Tải lên tệp | Không | Rỗng | Tệp Word, Excel, PDF (tối đa 25MB) | Cho phép đính kèm nhiều tệp |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Hình thức họp" = "Trực tuyến" hoặc "Kết hợp cả hai"*:
    - Trường "Đường dẫn họp trực tuyến" **chuyển sang trạng thái bắt buộc nhập**. Người dùng phải nhập đường dẫn phòng họp hợp lệ (ví dụ: `https://meet.google.com/...`).
    - Nút bấm *"Tạo phòng họp nhanh"* hiển thị cho phép tạo tự động đường dẫn phòng họp an toàn.
  - *Khi chọn "Hình thức họp" = "Trực tiếp tại trụ sở"*:
    - Ẩn ô nhập đường dẫn trực tuyến; bắt buộc chọn phòng họp thực tế tại trụ sở để tránh trùng phòng với ban khác.

#### 3.8.3.3. Bảng danh sách Lịch họp & Chế độ Lịch biểu
- Lịch biểu hiển thị các khối màu sắc theo từng ban: Ban Điều Hành (Navy), Ban Xúc tiến (Cam), Ban Thành Viên (Xanh lá).

#### 3.8.3.4. Danh sách Nghị quyết cuộc họp
- Bảng lưu trữ số nghị quyết, ngày ban hành, người ký phê chuẩn (Chủ tịch) và tệp văn bản đính kèm.

#### 3.8.3.5. Hộp thoại Hủy cuộc họp
- Người triệu tập hủy phiên họp kèm lý do để thông báo tới điện thoại của đại biểu.

#### 3.8.3.6. Popup Chọn Thư ký phiên họp
- Chọn nhanh 1 cán bộ Ban Thư Ký để phân công quyền nhập biên bản nghị quyết trực tiếp trong khi họp.

#### 3.8.3.7. Xem chi tiết cuộc họp & Điểm danh
- Hiển thị danh sách đại biểu kèm trạng thái điểm danh: Đã có mặt (Xanh lá), Vắng mặt có lý do (Vàng), Chưa phản hồi (Xám).

### 3.8.4. Luồng nghiệp vụ
- **3.8.4.1. Tìm kiếm cuộc họp**: Lọc lịch họp theo tuần hoặc tháng.
- **3.8.4.2. Lưu nháp chương trình họp**: Soạn thảo chương trình nghị sự dự thảo.
- **3.8.4.3. Phát hành thông báo triệu tập chính thức**: Ban hành lịch họp; hệ thống gửi giấy mời họp điện tử tới ứng dụng di động của từng đại biểu.
- **3.8.4.4. Hủy cuộc họp**: Hủy phiên họp và phát thông báo xin lỗi.
- **3.8.4.5. Điểm danh & Ký duyệt biên bản họp**: Thư ký ghi nhận biên bản, Chủ tịch ký duyệt ban hành nghị quyết.
- **3.8.4.6. Xuất biên bản họp**: Xuất biên bản và nghị quyết ra tệp Word hoặc PDF có tiêu đề hiệp hội.

### 3.8.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.8.5.1. Tra cứu lịch họp**: Trả về danh sách cuộc họp theo khoảng thời gian được chọn.
- **3.8.5.2. Lấy chi tiết cuộc họp và tài liệu nghị sự**: Trả về nội dung chương trình, đường dẫn trực tuyến và danh sách tài liệu.
- **3.8.5.3. Tạo mới cuộc họp chính thức**: Lưu cuộc họp và gửi thông báo triệu tập tới các đại biểu.
- **3.8.5.4. Lưu nháp cuộc họp**: Lưu kế hoạch họp dự thảo.
- **3.8.5.5. Cập nhật biên bản và nghị quyết**: Lưu trữ biên bản cuộc họp chính thức.
- **3.8.5.6. Điểm danh đại biểu dự họp**: Ghi nhận đại biểu có mặt vào hệ thống.
- **3.8.5.7. Hủy cuộc họp**: Hủy lịch họp và xóa thông báo triệu tập.
- **3.8.5.8. Lấy danh mục phòng họp và hình thức tổ chức**: Trả về cấu hình phòng họp tại trụ sở.

---

## 3.9. Phân hệ Quản trị Sàn Giao Thương B2B & Khớp Nối Cơ Hội Cung Cầu (/marketplace, /opportunities)

### 3.9.1. Thông tin chung
- **Mục tiêu**: Thúc đẩy tối đa giá trị thặng dư thương mại cho các doanh nghiệp hội viên CEO 1983. Cho phép từng doanh nghiệp sở hữu một gian hàng số B2B giới thiệu các sản phẩm, giải pháp và năng lực mũi nhọn; kết nối trực tiếp cung cầu không qua trung gian.
- **Vai trò thẩm định kiểm duyệt**: Ban Xúc tiến thương mại độc quyền phụ trách kiểm duyệt chất lượng sản phẩm, chứng chỉ tiêu chuẩn và chính sách ưu đãi đặc quyền trước khi niêm yết lên sàn giao thương.

### 3.9.2. Màn hình
- **3.9.2.1. Tìm kiếm**: Khung tìm kiếm sản phẩm/dịch vụ theo từ khóa, lọc theo Phân loại ngành nghề (12 nhóm ngành), Khoảng giá ưu đãi và Trạng thái kiểm duyệt.
- **3.9.2.2. Danh sách dữ liệu**: Bảng quản lý gian hàng B2B hiển thị ảnh đại diện, tên sản phẩm, doanh nghiệp cung cấp, giá niêm yết, giá ưu đãi cho hội viên, số lượng yêu cầu báo giá và trạng thái kiểm duyệt.
- **3.9.2.3. Đăng tải sản phẩm mới**: Biểu mẫu đưa sản phẩm lên sàn B2B gồm: Tên giải pháp, Ngành nghề, Mô tả tính năng, Giá thị trường, Mức chiết khấu đặc quyền cho hội viên CEO 1983, Chứng nhận chất lượng, Ảnh/Video giới thiệu.
- **3.9.2.4. Chỉnh sửa**: Điều chỉnh chính sách khuyến mãi hoặc cập nhật thông số kỹ thuật sản phẩm.
- **3.9.2.5. Chỉ định Cán bộ kiểm duyệt**: Hộp thoại chọn chuyên viên Ban Xúc tiến thương mại thẩm định sản phẩm.
- **3.9.2.6. Lịch sử giao thương & Yêu cầu báo giá**: Bảng theo dõi các cơ hội hợp tác kinh doanh Cung - Cầu được kết nối thành công.
- **3.9.2.7. Gỡ bỏ sản phẩm**: Hộp thoại gỡ bỏ sản phẩm khỏi sàn B2B khi hết hàng hoặc không đạt chuẩn chất lượng.
- **3.9.2.8. Xem chi tiết sản phẩm B2B**: Màn hình xem toàn diện thông tin sản phẩm, hồ sơ năng lực nhà cung cấp và nút bấm [Duyệt Niêm Yết] / [Từ Chối Kiểm Duyệt].

### 3.9.3. Mô tả chi tiết màn hình
#### 3.9.3.1. Tìm kiếm & Bộ lọc sàn B2B
- Tìm kiếm tức thì theo tên sản phẩm hoặc tên doanh nghiệp. Dropdown chọn 12 nhóm ngành kinh tế.

#### 3.9.3.2. Biểu mẫu Đăng tải / Chỉnh sửa Sản phẩm B2B
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `productName` | Tên sản phẩm / Dịch vụ | Văn bản ngắn | Có | Rỗng | 5 - 200 ký tự | Tự động cắt khoảng trắng thừa |
| `categoryCode` | Phân nhóm ngành nghề | Chọn một | Có | Xây dựng - Vật liệu | 12 nhóm ngành kinh tế | Xem quy tắc giao diện động |
| `ownerCompany` | Doanh nghiệp cung ứng | Chọn một | Có | Doanh nghiệp của tôi | Danh sách doanh nghiệp hội viên| Bắt buộc chọn đúng pháp nhân |
| `marketPrice` | Giá niêm yết thị trường | Số tiền tệ | Không | 0 | 0 đến 100 tỷ VNĐ | Định dạng dấu chấm hàng nghìn |
| `memberDiscount`| Chiết khấu đặc quyền (%)| Số phần trăm | Có | 10% | 1% đến 90% | Xem quy tắc giao diện động |
| `supplyCapacity`| Năng lực cung ứng | Văn bản ngắn | Có | Rỗng | Tối đa 200 ký tự | Ví dụ: 10.000 sản phẩm/tháng |
| `qualityCert` | Chứng nhận tiêu chuẩn (ISO)| Tải lên tệp | Không | Rỗng | Tệp ảnh, PDF chứng nhận | Khuyến khích có chứng chỉ |
| `productImages`| Hình ảnh thực tế sản phẩm | Tải lên ảnh | Có | Rỗng | Tối đa 10 ảnh JPG/PNG (dưới 5MB/ảnh) | Tối thiểu phải có 1 ảnh đại diện |
| `fullDescription`| Mô tả chi tiết giải pháp | Đoạn văn bản | Có | Rỗng | 20 - 3000 ký tự | Nêu rõ lợi thế cạnh tranh |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi nhập "Chiết khấu đặc quyền (%)" >= 20%*:
    - Hệ thống **tự động gắn huy hiệu vàng VIP**: *"Ưu đãi đặc biệt dành cho Hội viên CEO 1983"* giúp sản phẩm được ưu tiên hiển thị ở vị trí đầu sàn B2B.
  - *Khi chọn "Phân nhóm ngành nghề" = "Bất động sản - Xây dựng"*:
    - Form **hiển thị thêm trường**: *"Hồ sơ năng lực nhà thầu / Chủ đầu tư"* và *"Chính sách bảo hành công trình"*.
  - *Khi chọn "Phân nhóm ngành nghề" = "Dịch vụ Doanh nghiệp & Pháp lý"*:
    - Bắt buộc tải lên tệp: *"Giấy phép hành nghề / Chứng chỉ năng lực tư vấn"*.
  - *Khi người duyệt là "Trưởng ban Xúc tiến thương mại"*:
    - Hiển thị thanh thao tác kiểm duyệt gồm 2 nút: [Phê Duyệt Niêm Yết] (Màu xanh) và [Từ Chối - Yêu Cầu Bổ Sung] (Màu cam) kèm ô nhập góp ý.

#### 3.9.3.3. Danh sách sản phẩm B2B
- Bảng hiển thị có ảnh thu nhỏ, tên doanh nghiệp, giá thị trường, giá ưu đãi sau chiết khấu và lượt kết nối.

#### 3.9.3.4. Danh sách Yêu cầu báo giá & Cơ hội giao thương
- Bảng tổng hợp các yêu cầu kết nối giao thương giữa các hội viên: Tên doanh nghiệp mua, Nhu cầu cụ thể, Thời gian gửi yêu cầu và trạng thái xử lý.

#### 3.9.3.5. Hộp thoại Gỡ bỏ sản phẩm
- Xác nhận gỡ sản phẩm khỏi sàn B2B khi tạm hết hàng hoặc thay đổi chính sách kinh doanh.

#### 3.9.3.6. Popup Chỉ định cán bộ thẩm định sản phẩm
- Chọn thành viên Ban Xúc tiến thương mại chịu trách nhiệm khảo sát thực tế chất lượng sản phẩm.

#### 3.9.3.7. Xem chi tiết sản phẩm B2B
- Màn hình catalog ảnh phóng to, thông số kỹ thuật và nút bấm *"Gửi yêu cầu kết nối giao thương tức thì"*.

### 3.9.4. Luồng nghiệp vụ
- **3.9.4.1. Tìm kiếm sản phẩm**: Lọc danh mục sản phẩm theo ngành nghề và khoảng giá.
- **3.9.4.2. Lưu nháp bài đăng sản phẩm**: Doanh nghiệp soạn thảo thông tin sản phẩm, lưu nháp để tiếp tục hoàn thiện hình ảnh.
- **3.9.4.3. Gửi duyệt & Niêm yết chính thức**: Gửi sản phẩm tới Ban Xúc tiến thương mại -> Trưởng ban duyệt -> Tự động xuất hiện trên sàn B2B của Web CRM và Mobile App.
- **3.9.4.4. Gỡ bỏ sản phẩm**: Gỡ sản phẩm khỏi danh mục hiển thị khi ngừng kinh doanh.
- **3.9.4.5. Xem chi tiết & Kết nối cơ hội 1-on-1**: Doanh nghiệp quan tâm gửi yêu cầu báo giá -> Hệ thống kết nối cuộc hẹn giao thương giữa 2 chủ doanh nghiệp.
- **3.9.4.6. Xuất báo cáo giao thương**: Xuất bảng thống kê giá trị các cơ hội giao thương đã khớp nối thành công.

### 3.9.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.9.5.1. Tra cứu danh mục sản phẩm B2B**: Trả về danh sách sản phẩm đã được phê duyệt niêm yết.
- **3.9.5.2. Lấy chi tiết sản phẩm và hồ sơ nhà cung cấp**: Trả về toàn bộ thông số, bảng giá và chứng chỉ.
- **3.9.5.3. Gửi đăng tải sản phẩm mới**: Gửi thông tin sản phẩm lên hàng đợi kiểm duyệt của Ban Xúc tiến.
- **3.9.5.4. Lưu nháp sản phẩm**: Lưu sản phẩm ở trạng thái nháp nội bộ của doanh nghiệp.
- **3.9.5.5. Phê duyệt niêm yết sản phẩm**: Ban Xúc tiến duyệt sản phẩm và công khai lên toàn hệ sinh thái.
- **3.9.5.6. Cập nhật thông tin sản phẩm**: Chỉnh sửa bảng giá hoặc chiết khấu ưu đãi.
- **3.9.5.7. Gỡ bỏ sản phẩm**: Chuyển trạng thái sản phẩm sang ngừng kinh doanh.
- **3.9.5.8. Lấy danh mục 12 nhóm ngành nghề B2B**: Trả về danh mục ngành nghề kinh tế chuẩn mực.

---

## 3.10. Phân hệ Quản trị Tin Tức, Văn Bản Pháp Quy, Thư Viện Văn Kiện & Mẫu Thư Điện Tử (/news, /documents)

### 3.10.1. Thông tin chung
- **Mục tiêu**: Cung cấp kênh truyền thông chính thống và kho lưu trữ văn kiện số toàn diện của hiệp hội: Điều lệ câu lạc bộ, Quy chế hoạt động, Các quyết định bổ nhiệm nhân sự, Nghị quyết đại hội, Thư viện biểu mẫu phân theo từng Ban chuyên môn và Hệ thống quản trị mẫu thông báo điện tử gửi hội viên.
- **Thẩm quyền**: Ban Truyền thông và Ban Thư Ký phụ trách biên tập và xuất bản văn kiện dưới sự phê chuẩn của Tổng thư ký hoặc Chủ tịch; Ban Tài chính quản lý mẫu email thông báo hội phí và VietQR tự động.

### 3.10.2. Màn hình
- **3.10.2.1. Tìm kiếm & Phân loại văn bản**: Lọc theo 8 Ban chuyên môn (Ban Điều Hành, Ban Thành Viên, Ban Truyền Thông, Ban Xúc Tiến, Ban Tài Chính, Ban Thiện Nguyện, Ban Thư Ký, Biểu mẫu chung); lọc theo định dạng tệp (Tất cả, PDF, DOCX, XLSX, PPTX); sắp xếp theo thời gian (Mới nhất, Cũ nhất); tìm kiếm tức thì theo từ khóa trích yếu và tác giả.
- **3.10.2.2. Danh sách văn kiện số**: Bảng danh mục hiển thị số hiệu, trích yếu văn bản, phân loại ban chuyên môn, định dạng tệp, ngày ban hành, người ký và nút tải về/đọc trực tiếp.
- **3.10.2.3. Đăng tải văn bản / bài viết mới**: Biểu mẫu soạn thảo bài viết và tải lên văn kiện pháp quy đính kèm.
- **3.10.2.4. Chỉnh sửa văn bản**: Cập nhật văn bản sửa đổi, bổ sung hoặc thay thế tệp đính kèm mới.
- **3.10.2.5. Chỉ định người ký duyệt**: Hộp thoại chọn lãnh đạo ký phê duyệt văn bản (Chủ tịch hoặc Tổng thư ký).
- **3.10.2.6. Lịch sử phiên bản văn bản**: Quản lý lịch sử các bản sửa đổi của Quy chế hiệp hội qua các thời kỳ.
- **3.10.2.7. Hủy bỏ / Hết hiệu lực**: Gắn cờ văn bản hết hiệu lực thi hành kèm số quyết định bãi bỏ.
- **3.10.2.8. Xem chi tiết văn bản & Đọc tệp PDF trực tuyến**: Màn hình xem bài viết và trình đọc tệp văn kiện PDF/Office trực tiếp.
- **3.10.2.9. Quản trị Mẫu Thư Điện Tử & Thông Báo Tự Động (MailTemplateManager)**: Trình quản lý mẫu thông báo niên liễm, giấy mời họp, thông báo kết nạp với giao diện chọn Chip Biến Số trực quan kèm ví dụ trực tiếp thay cho việc gõ mã kỹ thuật; giao diện xem trước phong cách thẻ Doanh Nhân Executive Card nền sáng trang nhã.

### 3.10.3. Mô tả chi tiết màn hình
#### 3.10.3.1. Tìm kiếm & Bộ lọc
- **Lọc theo Ban chuyên môn**: Chọn 1 trong 8 nhóm chuyên trách: Ban Điều Hành, Ban Thành Viên, Ban Truyền Thông, Ban Xúc Tiến Thương Mại, Ban Tài Chính, Ban Thiện Nguyện, Ban Thư Ký, Biểu mẫu chung.
- **Lọc theo Định dạng tệp**: Lọc nhanh qua các pill bấm chọn: Tất cả (All), PDF (`.pdf`), Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`).
- **Sắp xếp thứ tự**: Sắp xếp 2 chiều: Mới nhất trước (Newest), Cũ nhất trước (Oldest).
- **Tìm kiếm tức thì (Live Search)**: Tìm theo số hiệu văn bản (ví dụ: `01/2026/NQ-CEO1983`), từ khóa trích yếu hoặc tên người ban hành.

#### 3.10.3.2. Biểu mẫu Ban hành Văn bản / Đăng tin bài
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `docTitle` | Trích yếu nội dung | Văn bản ngắn | Có | Rỗng | 10 - 300 ký tự | Tự động cắt khoảng trắng |
| `docType` | Phân loại văn bản | Chọn một | Có | Nghị quyết | Nghị quyết, Quyết định, Quy chế, Thông báo, Tin tức, Biểu mẫu | Xem quy tắc giao diện động |
| `committee`| Ban chuyên môn | Chọn một | Có | Ban Điều Hành | 8 Ban chuyên môn chính thức | Bắt buộc chọn đúng ban quản lý |
| `docNumber` | Số hiệu văn bản | Văn bản ngắn | Có | Rỗng | Tối đa 50 ký tự | Định dạng chuẩn văn thư lưu trữ |
| `signerName` | Người ký phê chuẩn | Chọn một | Có | Chủ tịch Hiệp hội | Chủ tịch, Tổng thư ký | Bắt buộc chọn đúng thẩm quyền |
| `effectiveDate`| Ngày có hiệu lực | Ngày tháng | Có | Ngày hôm nay | Định dạng dd/mm/yyyy | Chuẩn ngày Việt Nam |
| `docFile` | Tệp văn bản gốc (PDF/Word/Excel)| Tải lên tệp | Có | Rỗng | PDF, DOCX, XLSX, PPTX (tối đa 30MB) | Bắt buộc có tệp văn bản chính thức |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phân loại văn bản" = "Nghị quyết" hoặc "Quyết định"*:
    - Trường "Người ký phê chuẩn" **khóa cứng ở chức danh "Chủ tịch Hiệp hội"**.
    - Hệ thống yêu cầu tải lên tệp văn bản bắt buộc ở định dạng PDF có con dấu và chữ ký số.
  - *Khi chọn "Phân loại văn bản" = "Tin tức hoạt động"*:
    - Biểu mẫu chuyển sang giao diện **Trình soạn thảo văn bản giàu tính năng (Rich-Text Editor)** cho phép chèn ảnh và định dạng đoạn văn bản đẹp mắt.

#### 3.10.3.3. Bảng thư viện văn kiện số
- Danh mục trực quan hiển thị biểu tượng phân loại màu sắc cho từng định dạng (PDF đỏ, DOCX xanh dương, XLSX xanh lá, PPTX cam), số hiệu, ban phụ trách, ngày ban hành và nút xem/tải về.

#### 3.10.3.4. Lịch sử văn bản
- Bảng tra cứu các văn bản bị thay thế hoặc văn bản sửa đổi bổ sung.

#### 3.10.3.5. Hộp thoại Đánh dấu hết hiệu lực
- Chuyển trạng thái văn kiện sang "Hết hiệu lực thi hành" kèm số quyết định bãi bỏ.

#### 3.10.3.6. Popup Chọn người duyệt xuất bản
- Trình Tổng thư ký duyệt tin tức trước khi phát sóng tới điện thoại hội viên.

#### 3.10.3.7. Xem chi tiết & Tải tệp văn bản
- Đọc văn kiện trực tiếp trên màn hình, hỗ trợ in ấn và tải về máy tính.

#### 3.10.3.8. Quản trị Mẫu Thư Điện Tử Thông Báo Tự Động (MailTemplateManager)
- **Hệ thống Chip Biến Số Trực Quan (Friendly Variable Chips)**:
  - Thay thế việc gõ các mã kỹ thuật `{ten_hoi_vien}` hay `{so_tien}` bằng danh sách các Chip bấm chèn thông minh có chú thích rõ ràng:
    - `[Họ và tên hội viên]`: Ví dụ: *Nguyễn Văn A*
    - `[Tên doanh nghiệp]`: Ví dụ: *Công ty Cổ phần Alpha*
    - `[Số tiền hội phí]`: Ví dụ: *10.000.000 VNĐ*
    - `[Hạn thanh toán]`: Ví dụ: *31/12/2026*
    - `[Mã VietQR tự động]`: Chèn khối mã thanh toán Napas 24/7 đối soát tự động
- **Thiết kế Thẻ Doanh Nhân Executive Card**:
  - Giao diện mẫu thư được thiết kế theo phong cách thẻ sang trọng nền trắng thanh lịch (`bg-white` / `bg-card`), viền thẻ mảnh, huy hiệu nhận diện cam hổ phách cao cấp; loại bỏ hoàn toàn khối nền xanh navy tối màu chói mắt, đảm bảo độ tương phản cao và hiển thị tối ưu trên cả giao diện Sáng và Tối (Light/Dark mode).
  - Trình xem trước tức thời (Live Preview) mô phỏng chính xác nội dung thư gửi đến email hội viên.

### 3.10.4. Luồng nghiệp vụ
- **3.10.4.1. Tìm kiếm & Lọc văn bản**: Tra cứu quy chế, biểu mẫu hoặc nghị quyết đại hội theo ban hoặc định dạng tệp.
- **3.10.4.2. Lưu nháp văn bản**: Ban Thư Ký soạn thảo dự thảo văn kiện lưu nháp.
- **3.10.4.3. Ký duyệt & Xuất bản chính thức**: Chủ tịch ký ban hành -> Tự động phát thông báo tới ứng dụng di động của toàn thể hội viên.
- **3.10.4.4. Hết hiệu lực thi hành**: Cập nhật văn bản thay thế.
- **3.10.4.5. Xem chi tiết & Tải tài liệu**: Hội viên tra cứu và tải tài liệu định dạng Office hoặc PDF.
- **3.10.4.6. Quản trị mẫu email thông báo**: Ban Tài chính hoặc Ban Thư ký chọn mẫu, chèn biến số thông minh, xem trước và lưu cấu hình.

### 3.10.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.10.5.1. Tra cứu danh sách văn bản**: Lấy danh sách văn bản theo loại và kỳ ban hành.
- **3.10.5.2. Lấy chi tiết văn bản và đường dẫn tệp**: Tải nội dung trích yếu và tệp văn kiện.
- **3.10.5.3. Xuất bản văn bản mới**: Ghi nhận văn bản và gửi thông báo tới hội viên.
- **3.10.5.4. Lưu nháp văn bản**: Lưu dự thảo văn thư.
- **3.10.5.5. Cập nhật văn bản**: Chỉnh sửa trích yếu hoặc cập nhật tệp mới.
- **3.10.5.6. Chỉnh sửa bản nháp**: Hoàn thiện dự thảo.
- **3.10.5.7. Hủy bỏ / Hết hiệu lực**: Chuyển trạng thái văn bản.
- **3.10.5.8. Lấy danh mục phân loại văn kiện**: Trả về danh mục văn thư lưu trữ chuẩn mực.

---

## 3.11. Phân hệ Quản trị Phúc Lợi, Đặc Quyền & Đối Tác VIP (/benefits, /perks)

### 3.11.1. Thông tin chung
- **Mục tiêu**: Quản trị hệ thống chính sách ưu đãi, đặc quyền nội bộ và các gói hợp tác chiến lược giữa hiệp hội với các đối tác lớn (Hàng không, Khách sạn 5 sao, Sân Golf, Dịch vụ phòng chờ sân bay VIP, Ngân hàng đối tác).
- **Thẩm quyền**: Ban Xúc tiến thương mại và Ban Điều Hành đàm phán và phê duyệt danh mục đặc quyền dành riêng cho chủ thẻ thông minh doanh nhân CEO 1983.

### 3.11.2. Màn hình
- **3.11.2.1. Tìm kiếm**: Lọc ưu đãi theo ngành nghề dịch vụ (Nghỉ dưỡng, Sân Golf, Hàng không, Ẩm thực cao cấp), mức chiết khấu và đơn vị đối tác.
- **3.11.2.2. Danh sách dữ liệu**: Bảng danh sách đặc quyền hiển thị logo đối tác, tên chương trình ưu đãi, mức giảm giá đặc quyền, điều kiện áp dụng, thời hạn hiệu lực.
- **3.11.2.3. Khởi tạo gói ưu đãi mới**: Biểu mẫu ký kết chương trình đặc quyền với đối tác.
- **3.11.2.4. Chỉnh sửa**: Gia hạn thời gian áp dụng hoặc điều chỉnh chính sách ưu đãi.
- **3.11.2.5. Chỉ định cán bộ phụ trách đối tác**: Hộp thoại phân công đầu mối chăm sóc đối tác chiến lược.
- **3.11.2.6. Lịch sử sử dụng đặc quyền**: Thống kê số lượt hội viên đã kích hoạt mã ưu đãi của từng đối tác.
- **3.11.2.7. Tạm dừng chương trình**: Hộp thoại dừng chương trình ưu đãi khi hết hạn mức đối tác.
- **3.11.2.8. Xem chi tiết đặc quyền VIP**: Toàn văn thỏa thuận hợp tác và mã số kích hoạt ưu đãi.

### 3.11.3. Mô tả chi tiết màn hình
#### 3.11.3.1. Tìm kiếm & Bộ lọc đặc quyền
- Lọc theo phân nhóm: Thể thao Golf, Hàng không - Phòng chờ VIP, Khách sạn - Nghỉ dưỡng, Y tế - Chăm sóc sức khỏe doanh nhân.

#### 3.11.3.2. Biểu mẫu Thiết lập Chương trình Ưu đãi VIP
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `partnerName` | Đơn vị đối tác chiến lược | Văn bản ngắn | Có | Rỗng | 5 - 200 ký tự | Tên thương hiệu đối tác |
| `benefitTitle` | Tên chương trình ưu đãi | Văn bản ngắn | Có | Rỗng | 10 - 250 ký tự | Nêu rõ nội dung đặc quyền |
| `discountRate` | Mức ưu đãi / Giảm giá (%)| Số phần trăm | Có | 15% | 5% đến 100% | Cam kết chiết khấu độc quyền |
| `serviceCategory`| Phân nhóm dịch vụ | Chọn một | Có | Sân Golf & Thể thao | Golf, Khách sạn, Hàng không, Y tế | Xem quy tắc giao diện động |
| `expiryDate` | Thời hạn áp dụng | Ngày tháng | Có | +1 năm | Sau ngày hiện tại | Chuẩn dd/mm/yyyy |
| `howToClaim` | Cách thức nhận đặc quyền | Chọn một | Có | Xuất trình Thẻ điện tử hội viên| Xuất trình thẻ điện tử, Quét mã QR, Đặt qua hotline| Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Cách thức nhận đặc quyền" = "Xuất trình Thẻ điện tử hội viên"*:
    - Hệ thống tự động ghi nhận chính sách: Hội viên chỉ cần xuất trình Thẻ điện tử hội viên CEO 1983 3D mạ vàng hoặc mã QR trên ứng dụng tại quầy lễ tân của đối tác để được áp dụng giảm giá trực tiếp.
  - *Khi chọn "Phân nhóm dịch vụ" = "Sân Golf & Thể thao"*:
    - Form **hiển thị thêm trường**: *"Danh sách sân Golf liên kết"* và *"Khung giờ Tee-off ưu tiên cho hội viên CEO 1983"*.

#### 3.11.3.3. Danh sách đặc quyền hội viên
- Hiển thị các thẻ đặc quyền mạ vàng sang trọng với logo đối tác nổi bật.

#### 3.11.3.4. Báo cáo sử dụng đặc quyền
- Thống kê tổng số tiền hội viên đã tiết kiệm được nhờ chính sách liên kết của hiệp hội.

#### 3.11.3.5. Hộp thoại Đóng chương trình
- Đóng chương trình ưu đãi khi hết hạn hợp đồng đối tác.

#### 3.11.3.6. Popup Chọn cán bộ đầu mối đối tác
- Phân công thành viên Ban Xúc tiến thương mại phụ trách hợp đồng đối tác.

#### 3.11.3.7. Xem chi tiết thỏa thuận hợp tác
- Xem hợp đồng ký kết và quy trình đối soát dịch vụ.

### 3.11.4. Luồng nghiệp vụ
- **3.11.4.1. Tìm kiếm đặc quyền**: Hội viên tra cứu ưu đãi trước khi đặt phòng hoặc đặt sân golf.
- **3.11.4.2. Lưu nháp chương trình**: Ban Xúc tiến soạn thảo thỏa thuận hợp tác lưu nháp.
- **3.11.4.3. Ký kết & Xuất bản chính thức**: Phê duyệt chương trình -> Hiển thị trên mục Đặc quyền hội viên của ứng dụng di động.
- **3.11.4.4. Gia hạn / Kết thúc**: Cập nhật gia hạn thỏa thuận hàng năm.
- **3.11.4.5. Xem chi tiết & Sử dụng**: Hội viên xuất trình thẻ thông minh để nhận ưu đãi tại điểm dịch vụ.
- **3.11.4.6. Xuất báo cáo phúc lợi**: Xuất bảng đánh giá hiệu quả chương trình đối tác.

### 3.11.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.11.5.1. Tra cứu danh sách đặc quyền**: Lấy các chương trình đang có hiệu lực.
- **3.11.5.2. Lấy chi tiết điều kiện sử dụng**: Tải quy chế và hướng dẫn nhận ưu đãi.
- **3.11.5.3. Tạo mới chương trình ưu đãi**: Lưu thỏa thuận đối tác mới.
- **3.11.5.4. Lưu nháp chương trình**: Lưu dự thảo hợp tác.
- **3.11.5.5. Cập nhật thỏa thuận**: Điều chỉnh mức chiết khấu.
- **3.11.5.6. Chỉnh sửa bản nháp**: Bổ sung điều khoản.
- **3.11.5.7. Tạm dừng chương trình**: Vô hiệu hóa mã kích hoạt.
- **3.11.5.8. Lấy danh mục đối tác chiến lược**: Trả về danh sách đối tác liên kết.

---

## 3.12. Phân hệ Cấu Hình Tham Số Hệ Thống & Nhật Ký Ghi Vết An Ninh (/settings, /system-logs)

### 3.12.1. Thông tin chung
- **Mục tiêu**: Cung cấp công cụ quản trị kỹ thuật cấp cao dành riêng cho Admin và Ban Điều Hành. Cho phép quản lý niên khóa hội phí, danh mục ngành nghề, mẫu mã VietQR, cấu hình hạn mức giao dịch và theo dõi toàn bộ nhật ký an ninh hệ thống (Audit Trail).
- **Nguyên tắc an ninh**: Nhật ký ghi vết được lưu trữ trong phân vùng an toàn, không ai (kể cả Admin) có thể xóa hoặc sửa đổi lịch sử hoạt động.

### 3.12.2. Màn hình
- **3.12.2.1. Tìm kiếm nhật ký an ninh**: Tìm theo tài khoản thao tác, loại hành động (Đăng nhập, Thay đổi quyền, Xóa dữ liệu, Giao dịch tài chính) và thời gian.
- **3.12.2.2. Bảng nhật ký an ninh (Audit Trail)**: Hiển thị mốc thời gian chi tiết, tài khoản thực hiện, vai trò, hành vi thao tác, địa chỉ IP mạng, thiết bị và trạng thái kết quả.
- **3.12.2.3. Cấu hình tham số niên khóa & Hội phí**: Biểu mẫu thiết lập mức thu niên liễm hàng năm, số tài khoản nhận tiền và cú pháp VietQR Napas 24/7.
- **3.12.2.4. Cập nhật danh mục hệ thống**: Chỉnh sửa danh mục 12 nhóm ngành nghề kinh tế, danh mục các ban chuyên môn.
- **3.12.2.5. Chỉ định cán bộ an ninh mạng**: Phân công kỹ sư quản trị hệ thống phụ trách sao lưu an toàn.
- **3.12.2.6. Nhật ký sao lưu dữ liệu tự động**: Bảng theo dõi các phiên sao lưu CSDL hàng ngày.
- **3.12.2.7. Thu hồi phiên đăng nhập khẩn cấp**: Chức năng đăng xuất cưỡng bức tất cả các thiết bị khi phát hiện nguy cơ an ninh.
- **3.12.2.8. Xem chi tiết thông số kỹ thuật**: Màn hình kiểm tra trạng thái hoạt động của máy chủ và mức độ sử dụng tài nguyên.

### 3.12.3. Mô tả chi tiết màn hình
#### 3.12.3.1. Tìm kiếm & Lọc nhật ký an ninh
- Bộ lọc loại hành vi: Đăng nhập/Đăng xuất, Gán quyền quản trị, Thay đổi hội phí, Xóa hội viên cascade, Soát vé sự kiện.

#### 3.12.3.2. Biểu mẫu Cấu hình Tham số Toàn hệ thống
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fiscalYear` | Niên khóa hoạt động | Số nguyên | Có | 2026 | 2024 - 2035 | Chuẩn năm 4 số |
| `annualFeeAmount`| Mức thu hội phí thường niên| Số tiền tệ | Có | 10.000.000 | 1 triệu đến 100 triệu | Định dạng dấu chấm hàng nghìn VNĐ |
| `bankAccountNo`| Số tài khoản nhận hội phí| Ký tự số | Có | Rỗng | 8 - 20 chữ số | Số tài khoản ngân hàng chính thức |
| `bankBinCode` | Ngân hàng thụ hưởng | Chọn một | Có | Vietcombank (970436)| Danh mục 50 ngân hàng Napas | Chọn đúng ngân hàng đối tác |
| `vietqrSyntax` | Cú pháp nội dung nộp tiền| Văn bản ngắn | Có | HOIPHI CEO1983 | 5 - 50 ký tự | Chuẩn hóa cú pháp tự động |
| `sessionTimeout`| Thời gian hết hạn phiên làm việc| Số phút | Có | 480 phút (8 giờ)| 30 phút đến 1440 phút | Tự động bảo vệ máy trạm |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi thay đổi "Ngân hàng thụ hưởng" hoặc "Số tài khoản"*:
    - Hệ thống **tự động gọi giao tiếp kiểm tra với ngân hàng đối tác** để xác minh tên chủ tài khoản thụ hưởng (phải trùng khớp tên: `CLB DOANH NHAN CEO 1983`).
    - Hiển thị bản xem trước mẫu mã VietQR Napas 24/7 trực tiếp trên màn hình cấu hình.
  - *Khi kích hoạt chế độ "Bảo trì nâng cấp hệ thống"*:
    - Bật cửa sổ cảnh báo toàn màn hình và tự động gửi thông báo đếm ngược 15 phút tới toàn bộ người dùng đang trực tuyến.

#### 3.12.3.3. Bảng nhật ký an ninh không thể xóa sửa
- Mỗi dòng ghi nhận đầy đủ: Dấu thời gian chính xác tới phần nghìn giây, Tên người dùng, Vai trò, Hành động và Địa chỉ mạng.

#### 3.12.3.4. Lịch sử sao lưu dữ liệu
- Bảng kê khai các bản sao lưu an toàn CSDL lưu trữ tại trung tâm dữ liệu độc lập.

#### 3.12.3.5. Đăng xuất cưỡng bức toàn hệ thống
- Nút bấm an ninh khẩn cấp: Hủy bỏ toàn bộ các phiên làm việc đang mở (trừ tài khoản Chủ tịch).

#### 3.12.3.6. Popup Chỉ định cán bộ kỹ thuật trực ca
- Phân công nhân sự giám sát hệ thống 24/7.

#### 3.12.3.7. Xem chi tiết sức khỏe máy chủ
- Đồng hồ đo tài nguyên CPU, bộ nhớ RAM và tốc độ phản hồi đường truyền mạng.

### 3.12.4. Luồng nghiệp vụ
- **3.12.4.1. Tra cứu nhật ký an ninh**: Quản trị viên kiểm tra các hành vi bất thường.
- **3.12.4.2. Lưu nháp cấu hình tham số**: Soạn thảo thay đổi tham số niên khóa mới.
- **3.12.4.3. Áp dụng tham số chính thức**: Chủ tịch phê chuẩn -> Tham số mới có hiệu lực ngay lập tức trên toàn bộ hệ thống.
- **3.12.4.4. Đăng xuất an toàn khẩn cấp**: Kích hoạt cơ chế đóng băng phiên khi có sự cố an ninh.
- **3.12.4.5. Xem chi tiết sự kiện an ninh**: Bóc tách chi tiết thông tin gói tin giao dịch.
- **3.12.4.6. Xuất nhật ký kiểm toán**: Xuất tệp Excel nhật ký phục vụ công tác thanh tra nội bộ.

### 3.12.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.12.5.1. Lấy danh sách nhật ký an ninh**: Trả về danh sách sự kiện audit log phân trang.
- **3.12.5.2. Lấy cấu hình tham số hiện hành**: Trả về các tham số niên khóa, hội phí và ngân hàng.
- **3.12.5.3. Cập nhật cấu hình tham số chính thức**: Lưu thay đổi cấu hình vào hệ thống.
- **3.12.5.4. Lưu nháp cấu hình**: Lưu tạm tham số dự thảo.
- **3.12.5.5. Kiểm tra thông tin tài khoản ngân hàng**: Giao tiếp xác minh số tài khoản với cổng Napas.
- **3.12.5.6. Kích hoạt sao lưu tức thời**: Khởi tạo bản sao lưu dữ liệu khẩn cấp.
- **3.12.5.7. Thu hồi phiên đăng nhập**: Thu hồi các mã truy cập đang hoạt động.
- **3.12.5.8. Lấy danh mục tham số hệ thống**: Trả về các định nghĩa cấu hình mở rộng.

---

## 3.13. Phân hệ Mạng Lưới Doanh Nhân & Trao Đổi Nghiệp Vụ Nội Bộ CRM (/network)

### 3.13.1. Thông tin chung
- **Mục tiêu**: Xây dựng không gian kết nối và trao đổi thông tin công việc, nghiệp vụ trực tiếp 1-on-1 giữa các cán bộ quản trị, thành viên Ban Điều Hành và toàn thể các doanh nhân hội viên trong CLB Doanh Nhân CEO 1983.
- **Nguyên tắc nghiệp vụ quan trọng**:
  - Tách bạch hoàn toàn kênh trao đổi công việc nội bộ CRM (lưu trữ độc lập tại không gian làm việc Web CRM) với luồng hội thoại kết nối bạn bè trên Ứng dụng Di động (`vba_conversations`).
  - Hỗ trợ khởi tạo hội thoại và gửi tin nhắn trao đổi công việc ngay lập tức qua nút bấm chính "Nhắn tin trao đổi" mà **KHÔNG bắt buộc phải gửi yêu cầu kết nối hay chờ đối tác phê duyệt trước**. Điều này đảm bảo tính thông suốt và khẩn trương trong công tác chỉ đạo và điều hành công việc của hiệp hội.

### 3.13.2. Màn hình
- **3.13.2.1. Tìm kiếm & Lọc mạng lưới**: Bộ lọc nhanh theo 8 Ban chuyên môn (Ban Điều Hành, Ban Thành Viên, Ban Truyền Thông, Ban Xúc Tiến Thương Mại, Ban Tài Chính, Ban Thiện Nguyện, Ban Thư Ký, Ban Cố Vấn); tìm kiếm thời gian thực theo họ tên, doanh nghiệp, ngành nghề và chức vụ.
- **3.13.2.2. Danh sách danh bạ cán bộ & hội viên**: Hiển thị avatar, họ tên, mã hội viên, doanh nghiệp, ngành nghề, chức danh lãnh đạo, huy hiệu Ban chuyên môn và trạng thái kết nối.
- **3.13.2.3. Hộp thoại khởi tạo cuộc trò chuyện công việc (NewChatDialog)**: Cho phép chọn nhanh bất kỳ thành viên nào theo Ban chuyên môn để mở luồng trao đổi công việc 1-on-1.
- **3.13.2.4. Khung hội thoại công việc 1-on-1 (ChatPanel)**: Giao diện chat thời gian thực hiển thị banner thông báo nghiệp vụ CRM, lịch sử trao đổi, ô nhập nội dung với phím tắt gửi Enter, huy hiệu Ban chuyên môn và thông báo phản hồi Sonner Toast khi gửi tin.
- **3.13.2.5. Xem chi tiết hồ sơ hội viên**: Mở modal thông tin doanh nhân 360°, thông tin liên hệ và gian hàng doanh nghiệp.

### 3.13.3. Mô tả chi tiết màn hình
#### 3.13.3.1. Tìm kiếm & Bộ lọc mạng lưới
- **Bộ lọc chip Ban chuyên môn**: Chọn lọc nhanh giữa các ban: Tất cả, Ban Điều Hành, Ban Thành Viên, Ban Truyền Thông, Ban Xúc Tiến, Ban Tài Chính, Ban Thiện Nguyện, Ban Thư Ký, Ban Cố Vấn.
- **Ô tìm kiếm tức thì**: Lọc danh bạ theo tên doanh nhân, tên công ty hoặc ngành nghề kinh doanh.

#### 3.13.3.2. Khung thao tác kết nối & Nhắn tin (ConnectActions)
- **Nút bấm chính [Nhắn tin trao đổi]**: Luôn sẵn sàng cho mọi tài khoản; nhấp chuột sẽ mở ngay luồng chat 1-on-1 với thành viên tương ứng trên CRM mà không cần điều kiện kết bạn.
- **Nút bấm phụ [Kết nối] / [Đang chờ duyệt] / [Đã kết nối]**: Quản lý trạng thái quan hệ đối tác mạng lưới danh bạ, có hỗ trợ hủy kết nối hoặc gửi lại lời mời.

#### 3.13.3.3. Khung hội thoại nghiệp vụ CRM (ChatPanel)
- Header hội thoại: Tên đối tác, chức vụ, tên doanh nghiệp, huy hiệu Ban chuyên môn và trạng thái kết nối đối tác.
- Banner nghiệp vụ: *"Kênh trao đổi nghiệp vụ nội bộ CRM CEO 1983 - Tin nhắn được lưu trữ trong không gian làm việc quản trị"*.
- Lịch sử tin nhắn: Phân biệt rõ tin nhắn gửi đi (Accent Gold) và tin nhắn nhận về (Muted Card), kèm mốc thời gian chi tiết.
- Phản hồi hành động: Hiển thị thông báo Toast xác nhận mỗi khi gửi thành công tin nhắn nghiệp vụ.

### 3.13.4. Luồng nghiệp vụ
- **3.13.4.1. Tìm kiếm nhân sự theo Ban**: Cán bộ quản trị lọc danh sách hội viên theo ban chuyên môn cần trao đổi.
- **3.13.4.2. Khởi tạo hội thoại công việc tức thì**: Nhấp "Nhắn tin trao đổi" hoặc mở "Hội thoại mới" -> Mở ngay khung chat với đối tác.
- **3.13.4.3. Gửi tin nhắn trao đổi nghiệp vụ**: Nhập nội dung, nhấn Enter hoặc bấm Gửi -> Ghi nhận tin nhắn vào cơ sở dữ liệu thời gian thực và phát tín hiệu thông báo.
- **3.13.4.4. Quản lý trạng thái kết nối mạng lưới**: Gửi lời mời kết nối, chấp thuận hoặc hủy liên kết danh bạ đối tác.

### 3.13.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.13.5.1. Lấy danh sách thành viên mạng lưới**: Trả về danh sách cán bộ, hội viên kèm thông tin ban chuyên môn và trạng thái kết nối.
- **3.13.5.2. Lấy danh sách bạn chat (listChatPeers)**: Trả về danh sách các hội viên đã có lịch sử trao đổi công việc.
- **3.13.5.3. Lấy lịch sử tin nhắn 1-on-1 (getThreadMessages)**: Trả về toàn bộ tin nhắn nghiệp vụ giữa hai tài khoản.
- **3.13.5.4. Gửi tin nhắn nghiệp vụ mới (sendMessage)**: Lưu tin nhắn vào kho dữ liệu CRM và cập nhật tức thì trên giao diện.
- **3.13.5.5. Cập nhật trạng thái kết nối mạng lưới**: Gửi/chấp thuận yêu cầu kết nối đối tác doanh nhân.

---

## 3.14. Phân hệ Quản Lý Gói Tài Trợ & Nhà Tài Trợ (/sponsor-packages, /sponsors)

### 3.14.1. Thông tin chung
- **Mục tiêu**: Quản lý độc lập các hạng gói tài trợ (Kim cương, Vàng, Bạc, Đồng, Đồng hành) và hồ sơ các đơn vị tài trợ cho hiệp hội và các kỳ đại hội.
- **Nguyên tắc phân lập & Trải nghiệm chuẩn hóa**:
  - **Gói tài trợ độc lập**: Chỉ định nghĩa tên gói, định mức tài trợ, số lượng phát hành và danh mục quyền lợi; tuyệt đối không tự động gán doanh nghiệp vào gói tài trợ khi tạo.
  - **Tự động bóc tách dữ liệu**: Form tiếp nhận nhà tài trợ (`SponsorModal`) cho phép chọn gói tài trợ sẵn có và tự động điền hạng gói, loại tài trợ (Tiền mặt / Hiện vật), giá trị và mô tả quyền lợi.
  - **Chuẩn hóa tiền tệ**: Toàn bộ các trường giá trị tiền tệ sử dụng `VndCurrencyInput` phân tách dấu chấm hàng trăm nghìn, triệu, tỷ và nhãn đọc số tiếng Việt rõ ràng.
  - **Loại bỏ cơ cấu giải thưởng & Onboard**: Đã gỡ bỏ hoàn toàn mục "Cơ cấu giải thưởng" khỏi gói tài trợ và bỏ nút wizard onboard nhà tài trợ.

### 3.14.2. Màn hình
- **3.14.2.1. Dashboard Gói tài trợ**: 4 thẻ KPI đo lường thời gian thực: Tổng số gói tài trợ, Hạn mức tài trợ tối đa, Số gói đã bán/đã phát hành, Tỷ lệ lấp đầy gói.
- **3.14.2.2. Modal Tạo / Sửa Gói tài trợ**: Khung modal chiều cao an toàn `max-h-[88vh]`, cấu trúc 1 thanh cuộn duy nhất mượt mà, triệt tiêu hoàn toàn lỗi cuộn lồng/vỡ chiều cao; trường nhập giá trị định dạng VND chuẩn.
- **3.14.2.3. Dashboard Nhà tài trợ**: Bảng danh sách nhà tài trợ chuẩn mực: khống chế độ rộng cột doanh nghiệp (`min-w-[240px] max-w-[320px] line-clamp-2`), các cột giá trị và thông tin cấu hình `whitespace-nowrap` giúp bảng gọn gàng, triệt tiêu lỗi dãn dòng quá to.
- **3.14.2.4. Modal Tạo / Sửa Nhà tài trợ**: Dropdown chọn gói tài trợ có sẵn tự động bóc tách thông tin; loại bỏ hoàn toàn trường chọn sự kiện (`events`).

---

## 3.15. Phân hệ Nâng cấp & Hoàn thiện Nghiệp vụ CRM (Sprint 2026-10)

### 3.15.1. UC-CRM-EVT-01: Quét Mã QR Sự Kiện Đón Tiếp & Đăng Ký Đại Biểu Khách Ngoài
- **Mục tiêu**: Cho phép khách mời, đối tác bên ngoài hiệp hội khi quét mã QR đón tiếp tại cổng sự kiện hoặc qua ấn phẩm quảng bá (bằng camera điện thoại, ứng dụng Zalo) có thể mở ngay biểu mẫu đăng ký đại biểu công khai, tự động kiểm tra số lượng chỗ và nhận email xác nhận vé hoặc hướng dẫn nộp phí / thư cảm ơn chuẩn mực.
- **Tác nhân (Actor)**: Khách mời đối tác bên ngoài, Đại biểu chưa phải là hội viên CEO 1983, Cán bộ Lễ tân / Ban Truyền thông.
- **Tiền điều kiện**: Sự kiện đã được kích hoạt và có xuất trình mã QR Đón tiếp (`EventGuestQrPresenterModal` tại `/events/:id`).
- **Luồng sự kiện chính (Main Flow)**:
  1. Khách quét mã QR đón tiếp trên màn hình/ấn phẩm bằng Zalo hoặc Camera điện thoại.
  2. Ứng dụng mở đường link đăng ký công khai: `/events/:eventId/register`.
  3. Giao diện hiển thị biểu mẫu "Bản Đăng Ký Đại Biểu & B2B Matchmaking":
     - Họ và tên đại biểu (Bắt buộc).
     - Địa chỉ Email chính thức (Bắt buộc - dùng nhận vé và thông báo).
     - Số điện thoại liên hệ / Zalo (Bắt buộc).
     - Tên doanh nghiệp & Chức vụ đại biểu (Tùy chọn).
     - Lựa chọn Hạng vé tham dự (Lấy danh sách các loại vé đang phát hành của sự kiện).
  4. Khách bấm nút "Xác nhận Đăng ký Tham dự".
  5. Hệ thống gọi API `POST /events/:id/guest-register`.
  6. Máy chủ kiểm tra số lượng đại biểu đã đăng ký so với giới hạn sức chứa (`capacity`):
     - **Trường hợp Còn chỗ (`registered_count < capacity`)**:
       - *Nếu là Vé Miễn Phí (0đ)*: Hệ thống ghi nhận đăng ký ở trạng thái Xác nhận (`confirmed`), sinh mã vé điện tử định dạng `REG-EV-xxxx`, sinh số may mắn Lucky Draw (`#xxxx`), xếp chỗ ngồi/bàn tiệc ngẫu nhiên. Lập tức kích hoạt tiến trình gửi **Email Vé Điện Tử** kèm mã QR Check-in và vé cuống trang trọng về hòm thư đại biểu.
       - *Nếu là Vé Thu Phí (> 0đ)*: Hệ thống ghi nhận đăng ký ở trạng thái Chờ thanh toán (`pending_payment`). Lập tức kích hoạt tiến trình gửi **Email Thông Báo Thu Phí & Hướng Dẫn Chuyển Khoản** kèm mã VietQR Napas chuẩn, thông tin tài khoản ngân hàng hiệp hội, số tiền và cú pháp nộp phí y hệt luồng hội viên.
     - **Trường hợp Hết chỗ (`registered_count >= capacity` và `capacity > 0`)**:
       - Hệ thống từ chối cấp vé mới, ghi nhận trạng thái từ chối do quá tải.
       - Hệ thống tự động gửi **Email Cảm Ơn Đã Quan Tâm** ("Sự kiện đã đạt số lượng tối đa đại biểu đăng ký... Ban Tổ chức xin chân thành cảm ơn và hẹn gặp Quý Đại biểu tại các sự kiện tiếp theo").
       - Màn hình phản hồi thông báo trang trọng đến khách mời về việc sự kiện đã đủ số lượng tiếp nhận.
- **Đặc tả API**:
  - `GET /events/:id/public-info`: Lấy thông tin công khai sự kiện, danh mục loại vé (`event_tickets`), kiểm tra trạng thái sức chứa.
  - `POST /events/:id/guest-register`:
    - Payload: `{ fullName: string, email: string, phone: string, company?: string, title?: string, ticketTypeId?: string }`
    - Response: `{ success: boolean, status: 'confirmed' | 'pending_payment' | 'sold_out', ticketCode?: string, qrCode?: string, luckyNumber?: string, message: string }`
- **CSDL & Bảng liên kết (Database Schema & Joins)**:
  - Bảng `public.events`: Truy vấn `id`, `title`, `start_time`, `location`, `capacity`, `registered_count`.
  - Bảng `public.event_tickets`: `JOIN event_tickets et ON et.event_id = events.id` để lấy danh sách vé, giá vé (`price`) và số lượng phát hành.
  - Bảng `public.event_registrations`: `INSERT` dữ liệu đăng ký đại biểu gồm `event_id`, `guest_name`, `guest_email`, `guest_phone`, `ticket_code`, `status`, `lucky_draw_number`, `seat_table`, `is_guest = true`.

### 3.15.2. UC-CRM-MEM-02: Đồng Bộ Trạng Thái Xóa Hội Viên Cục Bộ & Loại Bỏ Popup Reload Trang Khi Xóa Tài Khoản
- **Mục tiêu**: Nâng cao trải nghiệm quản trị, triệt tiêu hiện tượng xóa hội viên báo thành công nhưng bảng danh sách vẫn giữ nguyên dòng dữ liệu; loại bỏ hộp thoại xác nhận bắt buộc tải lại trang (`window.location.reload()`) khi xóa tài khoản người dùng.
- **Tác nhân (Actor)**: Cán bộ Quản trị hệ thống, Ban Thư ký.
- **Luồng sự kiện chính**:
  1. **Xóa Hội viên (`/members`)**:
     - Người quản trị nhấp nút Xóa trên dòng hội viên và xác nhận trên modal cảnh báo.
     - Hệ thống gọi API `DELETE /members/:id`.
     - Ngay khi nhận mã trạng thái 200 từ máy chủ, React Hook cập nhật trực tiếp mảng dữ liệu trong state hoặc làm mới cache (`queryClient.invalidateQueries` / `setMembers(prev => prev.filter(m => m.id !== id))`), dòng hội viên lập tức biến mất khỏi giao diện một cách mượt mà không cần người dùng phải bấm F5 tải lại trang.
  2. **Xóa Tài khoản (`/accounts`)**:
     - Người quản trị bấm xóa tài khoản cán bộ/hội viên.
     - Xác nhận xóa trên modal duy nhất.
     - Sau khi API `DELETE /accounts/:id` thực thi thành công, hệ thống hiển thị Toast thông báo và tự động gỡ bỏ tài khoản khỏi danh sách giao diện bằng cách cập nhật local state; tuyệt đối không mở thêm popup thứ hai yêu cầu người dùng xác nhận reload trang.
- **Đặc tả API**:
  - `DELETE /members/:id`: Xóa hội viên và các liên kết doanh nghiệp/thẻ trực thuộc an toàn.
  - `DELETE /accounts/:id`: Xóa tài khoản đăng nhập `vione_users`.
- **CSDL & Bảng liên kết**:
  - `members`, `organizations`, `member_cards`, `vione_users`.

### 3.15.3. UC-CRM-TKT-03: Khắc Phục Nhập Giá Vé Sự Kiện & Hiển Thị Thông Tin Đơn Vị Tài Trợ Trong Chi Tiết Sự Kiện
- **Mục tiêu**: Cho phép cán bộ tổ chức sự kiện nhập trực tiếp giá tiền của loại vé mà không bị kẹt phím; đồng thời hiển thị đầy đủ danh sách các nhà tài trợ đã đồng hành cùng sự kiện tại màn hình xem chi tiết sự kiện.
- **Tác nhân (Actor)**: Ban Truyền thông & Sự kiện, Ban Tài chính.
- **Luồng sự kiện chính**:
  1. **Nhập giá loại vé**:
     - Trong modal tạo/sửa loại vé sự kiện (`TicketTypeModal`), trường `price` được liên kết với bộ lọc số nguyên dương chuẩn `VndCurrencyInput`, cho phép nhập liệu tự do, hiển thị phân tách hàng nghìn tự động và chuyển đổi chuẩn xác sang số nguyên khi lưu trữ.
  2. **Xem chi tiết sự kiện & Nhà tài trợ**:
     - Khi mở chi tiết sự kiện (`/events/:id`), hệ thống hiển thị phân khu "Đơn Vị Tài Trợ & Đồng Hành Sự Kiện".
     - Hiển thị danh sách các doanh nghiệp tài trợ kèm logo, tên doanh nghiệp, gói tài trợ (Kim cương, Vàng, Bạc...) và giá trị đóng góp.
- **Đặc tả API**:
  - `GET /events/:id`: Mở rộng trả về mảng `sponsors` và chi tiết các gói tài trợ liên quan.
  - `POST /events/:id/tickets` & `PUT /events/:id/tickets/:ticketId`: Lưu giá vé dưới dạng số nguyên.
- **CSDL & Bảng liên kết**:
  - `public.events` JOIN `public.sponsors` ON `sponsors.event_id = events.id` LEFT JOIN `public.sponsor_packages` ON `sponsor_packages.id = sponsors.package_id`.

### 3.15.4. UC-CRM-SEC-04: Loại Bỏ Hoàn Toàn Trợ Lý AI Khỏi Giao Diện Web CRM Hiệp Hội
- **Mục tiêu**: Đảm bảo phân hệ Web CRM Hiệp hội CEO 1983 thuần túy là không gian quản trị công việc, kế toán và nhân sự tập trung, triệt tiêu việc hiển thị bong bóng chat hoặc nút Voice AI trôi nổi gây vướng víu tầm nhìn của cán bộ quản trị.
- **Tác nhân**: Toàn bộ cán bộ truy cập Cổng Quản trị CRM (`/members`, `/events`, `/finance`, `/tasks`, `/accounts`,...).
- **Đặc tả logic**:
  - Tại tầng layout gốc (`__root.tsx`, `AppShell.tsx`), cấu hình bộ lọc đường dẫn nghiêm ngặt: Trợ lý giọng nói Voice AI và Chatbot chỉ được phép khởi tạo khi người dùng truy cập ứng dụng di động thành viên (`/association` hoặc `/m`).
  - Nếu `pathname` thuộc CRM quản trị, các component AI bị chặn render 100% khỏi cây DOM.

### 3.15.5. UC-CRM-NAV-05: Gỡ Bỏ Hoàn Toàn Tuyến Đường Dư Thừa `/admin/demo-leads`
- **Mục tiêu**: Làm sạch hệ thống định tuyến, loại bỏ đường dẫn và menu thử nghiệm `admin/demo-leads` không thuộc phạm vi nghiệp vụ hiệp hội.
- **Đặc tả**:
  - Gỡ bỏ định nghĩa route `admin.demo-leads.tsx` khỏi danh mục tuyến đường.
  - Gỡ bỏ mục menu liên kết trong `Sidebar.tsx`. Mọi yêu cầu truy cập trực tiếp vào `/admin/demo-leads` sẽ tự động chuyển hướng về trang chủ `/` hoặc bảng điều khiển `/dashboard`.

---

# PHẦN 4: ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### 4.1. Yêu cầu về Hiệu năng & Tốc độ đáp ứng (Performance Requirements)
1. **Thời gian tải trang ban đầu (Initial Page Load)**: Dưới **1.0 giây** trên mạng băng thông rộng tiêu chuẩn; dưới **1.5 giây** trên mạng di động 4G.
2. **Thời gian phản hồi thao tác người dùng (UI Response Time)**: Phản hồi nhấp chuột, chuyển tab, mở modal dưới **0.1 giây** (100ms) tạo cảm giác mượt mà tuyệt đối.
3. **Thời gian xử lý cổng giao tiếp dữ liệu (API Latency)**: 95% các yêu cầu truy vấn dữ liệu thông thường hoàn tất dưới **0.3 giây** (300ms).
4. **Tốc độ soát vé QR tại bàn lễ tân sự kiện**: Tốc độ nhận diện, xác thực vé và hiển thị kết quả chào đón dưới **0.1 giây** (100ms) mỗi đại biểu, đảm bảo lưu thông 500 khách trong 15 phút mà không gây ùn tắc.
5. **Năng lực chịu tải đồng thời (Concurrency Capacity)**: Hệ thống đáp ứng tối thiểu **10.000 người dùng truy cập đồng thời** (Concurrent Users) và xử lý tối thiểu **1.000 giao dịch/giây** mà không bị nghẽn đường truyền.

### 4.2. Yêu cầu về An toàn thông tin & Bảo mật đa tầng (Security Requirements)
1. **Kiểm soát Phân quyền Thời gian thực từ Cơ sở dữ liệu (Real-time DB Authorization Guard)**:
   - Tại mọi yêu cầu gửi đến máy chủ, hệ thống bắt buộc kiểm tra trực tiếp trạng thái tài khoản và vai trò trong cơ sở dữ liệu thời gian thực; không chỉ dựa vào mã định danh phiên tĩnh.
   - Nếu quyền hạn của tài khoản bị thay đổi giữa chừng, máy chủ lập tức từ chối và ném mã lỗi từ chối thẩm quyền; giao diện người dùng hiển thị hộp thoại cảnh báo trang trọng ở chính giữa màn hình và tự động tải lại quyền mới mà không làm mất phiên đăng nhập.
2. **Mã hóa dữ liệu toàn trình (End-to-End Encryption)**: Toàn bộ đường truyền mạng bắt buộc mã hóa qua giao thức bảo mật cao cấp nhất. Mật khẩu và mã khóa sinh trắc học bắt buộc băm bằng thuật toán an toàn một chiều không thể đảo ngược.
3. **Phòng chống các nguy cơ tấn công mạng tiêu chuẩn OWASP**: Hệ thống được trang bị bộ lọc tự động vô hiệu hóa mọi nỗ lực tiêm mã độc (SQL Injection), tấn công giả mạo (XSS, CSRF) và tấn công từ chối dịch vụ (DDoS Rate Limiting).
4. **Nhật ký an ninh không thể tẩy xóa (Tamper-Proof Audit Trail)**: Mọi thao tác thay đổi quyền, xóa dữ liệu, duyệt chi tài chính đều được ghi vết tự động kèm địa chỉ IP và thời gian chính xác tới mili-giây; nhật ký được bảo vệ tuyệt đối không ai có quyền xóa sửa.

### 4.3. Yêu cầu về Độ tin cậy & Tính sẵn sàng cao (Reliability & Availability)
1. **Chỉ số thời gian hoạt động liên tục (System Uptime)**: Đạt tối thiểu **99.9%** (tổng thời gian gián đoạn bảo trì không vượt quá 8.76 giờ trong cả năm).
2. **Cơ chế Sao lưu Tự động Đa vùng (Automated Multi-Region Backup)**: Dữ liệu CSDL được tự động sao lưu định kỳ hàng ngày và lưu trữ tại 2 trung tâm dữ liệu độc lập; thời gian khôi phục thảm họa (RTO) dưới 30 phút, điểm khôi phục dữ liệu (RPO) dưới 5 phút.
3. **Khả năng Hoạt động Ngoại tuyến (Offline Fallback for Check-in)**: Cổng soát vé QR sự kiện được trang bị bộ nhớ đệm cục bộ an toàn, cho phép tiếp tục quét vé bình thường kể cả khi mất kết nối Internet tạm thời tại hội trường; dữ liệu điểm danh sẽ tự động đồng bộ lên máy chủ ngay khi có mạng trở lại.

### 4.4. Yêu cầu về Tính toàn vẹn dữ liệu & Cơ chế khôi phục (Data Integrity & Safety)
1. **Cơ chế Xóa Liên Thông An Toàn (Cascade Deletion Safety)**: Khi xóa một hội viên, toàn bộ các dữ liệu liên thông trực thuộc (doanh nghiệp, sản phẩm gian hàng B2B, thẻ thông minh doanh nhân, tài khoản đăng nhập) bắt buộc phải được giải phóng đồng bộ trong một giao dịch an toàn (Database Transaction), triệt tiêu hoàn toàn rác dữ liệu.
2. **Xử lý & Bóc tách Lỗi Kiểm tra Dữ liệu Tiếng Việt (Vietnamese Validation Formatting)**: Khi máy chủ phát hiện dữ liệu nhập chưa chuẩn, hệ thống tự động bóc tách các mảng lỗi kỹ thuật thành câu thông báo tiếng Việt mạch lạc, chỉ rõ tên trường và hướng dẫn cách sửa chữa thân thiện, không để lộ thông báo lỗi kỹ thuật khó hiểu.

### 4.5. Yêu cầu về Khả năng tương thích & Môi trường vận hành (Compatibility Requirements)
1. **Khả năng tương thích trình duyệt (Cross-Browser Compatibility)**: Cổng Quản trị CRM hoạt động hoàn hảo 100% trên các trình duyệt hiện đại phổ biến: Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox (các phiên bản trong vòng 3 năm gần nhất).
2. **Khả năng tương thích thiết bị (Responsive Design)**: Giao diện tự động co giãn tối ưu trên mọi kích thước màn hình: Màn hình máy tính để bàn (Desktop 1920x1080, 2K, 4K), máy tính xách tay (Laptop 1366x768, 1440x900), máy tính bảng (Tablet iPad, Galaxy Tab) và điện thoại di động.

### 4.6. Yêu cầu về Trải nghiệm người dùng & Tiêu chuẩn giao diện (Usability & Design Aesthetics)
1. **Bảng màu Nhận diện Thương hiệu HanoiBA CEO 1983 Hoàng Gia**:
   - Màu chủ đạo: **Deep Cobalt Navy** (`#003B95`, `#002B70`, `#0A1A3A`) - Vững chãi, uy quyền, trí tuệ.
   - Màu điểm nhấn: **Warm Amber Gold** (`#F59E0B`, `#D97706`, `#D4AF37`) - Thịnh vượng, đẳng cấp mạ vàng.
   - Tuyệt đối không sử dụng màu tím ViOne hoặc màu đen u ám ở chế độ giao diện sáng.
2. **Quy tắc Tự động Cắt Khoảng Trắng Toàn Cầu (Stream Space / Auto-Trim Whitespace)**: Toàn bộ các ô nhập dữ liệu trên toàn hệ thống bắt buộc tự động loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi khi người dùng hoàn tất nhập liệu hoặc dán văn bản.
3. **Quy chuẩn Định dạng Dữ liệu Tài chính & Thời gian Việt Nam**:
   - Tiền tệ: Dấu chấm phân tách hàng nghìn và đơn vị VNĐ rõ ràng (ví dụ: `10.000.000 VNĐ`).
   - Thời gian: Định dạng chuẩn Việt Nam ngày/tháng/năm (`dd/mm/yyyy` hoặc `dd/mm/yyyy HH:mm`).

### 4.7. Yêu cầu về Khả năng bảo trì & Nâng cấp (Maintainability & Scalability)
1. **Kiến trúc Mã nguồn Module hóa (Modular Architecture)**: Các phân hệ nghiệp vụ độc lập, tách rời tầng hiển thị, tầng xử lý logic và tầng truy cập dữ liệu (Repository Pattern).
2. **Dễ dàng Tích hợp & Mở rộng (Integration Extensibility)**: Hệ thống sẵn sàng mở rộng kết nối với các cổng thanh toán ngân hàng khác, hệ thống hóa đơn điện tử và nền tảng ký số hợp đồng theo chuẩn quốc gia.

---

# PHẦN 5: MA TRẬN TRUY VẾT & TIÊU CHUẨN NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mã tiêu chí | Hạng mục kiểm tra | Tiêu chuẩn đạt nghiệm thu 100% |
| :--- | :--- | :--- |
| **AC-01** | Toàn vẹn 12 phân hệ CRM | 100% các phân hệ từ 3.1 đến 3.12 hoạt động chuẩn xác theo kịch bản đặc tả. |
| **AC-02** | Phân quyền 7 cấp & Realtime Guard | Chặn đứng 100% các hành vi vượt quyền; hiển thị modal cảnh báo trung tâm và reload giữ phiên khi đổi quyền. |
| **AC-03** | Nghiệp vụ Hội viên & Cascade Delete | Năm sinh bắt buộc 1983; cấp mã `CEO-83xxx`; xóa hội viên tự động xóa sạch doanh nghiệp và tài khoản trực thuộc. |
| **AC-04** | Giao việc đa cấp & File Office | Chặn giao việc trái quyền; đính kèm và xem trước trực tiếp file Word, Excel, PDF và ảnh nghiệm thu. |
| **AC-05** | Sự kiện & Soát vé QR 0.1s | Sơ đồ bàn tiệc tròn trực quan; quét mã QR đại biểu điểm danh tức thì trong 0.1 giây tại bàn lễ tân. |
| **AC-06** | Tài chính & VietQR Napas 24/7 | Tự động sinh mã VietQR theo chuẩn Napas; tự động xác nhận số dư tài khoản trong vòng 10 giây; xuất/nhập Excel chuẩn. |
| **AC-07** | Nhận diện thương hiệu & Ngôn ngữ | Chuẩn màu Deep Cobalt Navy & Warm Amber Gold; chuẩn hóa toàn diện phong cách hành văn quản trị hiệp hội sang trọng, không dùng các từ ngữ kỹ thuật khô khan. |
| **AC-08** | Chất lượng mã nguồn không lỗi | Kiểm tra type check `tsc --noEmit` đạt Exit code 0 (0 errors) trên toàn bộ hệ thống. |

---

# PHẦN 6: BỔ SUNG YÊU CẦU ĐIỀU CHỈNH HỆ THỐNG CRM (CẬP NHẬT THÁNG 10/2026)

### 6.1. Tách Biệt Hoàn Toàn Hồ Sơ Quản Trị CRM và App Mobile CEO 1983
1. **Phân lập Dữ liệu Hồ sơ (Profile Decoupling)**:
   - Hồ sơ người dùng tại Cổng Quản trị CRM (Avatar, Họ tên, Chức danh quản trị, Số điện thoại, Email) được lưu trữ hoàn toàn tách biệt độc lập (`crm_admin_profile`, `crm_admin_avatar`).
   - Việc chỉnh sửa thông tin hoặc thay đổi avatar trên Web CRM tuyệt đối không làm thay đổi hay ghi đè lên thẻ hội viên, danh thiếp số công khai (`vba_custom_profile`), hoặc avatar trên App Mobile CEO 1983.

### 6.2. Nâng Cấp Phân Hệ Trao Đổi & Nhắn Tin B2B (/network)
1. **Loại bỏ Hoàn toàn Rào cản Kết nối**:
   - Bỏ quy trình gửi lời mời kết nối và chờ phê duyệt. Toàn bộ hội viên và ban điều hành đều có thể bấm vào nhắn tin trực tiếp với nhau ngay lập tức.
2. **Gửi & Tải Tệp Tin Đa Định Dạng**:
   - Cho phép tải lên và gửi tệp tin đính kèm không giới hạn: hình ảnh (JPG, PNG, WebP), tài liệu văn phòng (PDF, DOCX, XLSX, PPTX) và tệp nén (ZIP, RAR).
   - Hiển thị trực quan icon tệp, dung lượng và nút tải về máy tính mượt mà.
3. **Tính Năng Ghim Tin Nhắn (Pin Message)**:
   - Cho phép ghim các thông báo, số tài khoản, địa chỉ cuộc họp quan trọng lên đầu khung chat để các thành viên dễ dàng tra cứu.
4. **Loại bỏ Lỗi Nhân Đôi Chức Danh (Double Title)**:
   - Loại bỏ triệt để hiện tượng hiển thị trùng lặp chức danh (ví dụ: *"Chủ tịch - Chủ tịch"*, *"Trưởng ban - Trưởng ban"*).

### 6.3. Tùy Biến Tên & Logo Header Sidebar Tại Cài Đặt (/settings)
1. **Cấu hình Thương hiệu Sidebar**:
   - Trong trang Cài đặt Hệ thống (`/settings`), bổ sung tính năng cho phép Quản trị viên thay đổi Tên câu lạc bộ/hiệp hội và tải lên Logo hiển thị tại phần đầu của Sidebar điều hướng.
   - Khi lưu thay đổi, hệ thống phát tín hiệu cập nhật thời gian thực (`crm_system_branding_updated`) để thanh Sidebar cập nhật logo và tiêu đề mới ngay lập tức mà không cần tải lại trang.

### 6.4. Chuẩn Hóa Giao Diện Phân Quyền & Quản Lý Tài Khoản Theo Bộ Nhận Diện CEO 1983
1. **Ma Trận Phân Quyền & Ban Chuyên Môn (`/permissions`)**:
   - Tái cấu trúc giao diện theo thiết kế mới: Thanh tiêu đề với Logo nhận diện CEO 1983 (`image 6.png`), thanh tìm kiếm chức năng bo cong 20px, các nút "Thêm Chức Năng", "Thêm Quyền" màu xanh Deep Cobalt Navy `#003B95`.
   - Bảng phân quyền hiển thị rõ ràng 6 cột vai trò/ban: Quản trị, Chủ tịch, Admin, Tổng thư ký, Trưởng ban Điều hành, Trưởng ban Truyền thông kèm nút "Bỏ chọn hết" / "Chọn tất cả" và các thao tác Xem/Sửa/Xóa.
   - Tích hợp bộ icon chuẩn SVG từ `CEO1983_icon_1`.
2. **Quản Lý Tài Khoản & Phân Quyền Vai Trò (`/accounts`)**:
   - Tái cấu trúc theo thiết kế mới: Bảng 4 thẻ thống kê trực quan (Tổng số tài khoản, Lãnh đạo & Quản trị, Trưởng ban chuyên môn, Đang hoạt động).
   - Bảng danh sách hội viên với các cột: STT, Thông tin tài khoản (Avatar, Tên, Mã định danh), Liên hệ (Email, SĐT), Doanh nghiệp, Phân loại ban, Vai trò và Thao tác.
   - Tích hợp bộ icon chuẩn SVG từ `CEO1983_icon_2`.

### 6.5. Chuẩn Hóa Popup Tạo Sự Kiện 3 Bước (EventWizard)
1. **Khắc phục lỗi tự động bật Popup khi vào trang Sự kiện**:
   - Thêm điều kiện kiểm tra trạng thái mở `if (!open) return null;` tại đầu component `EventWizard.tsx`, đảm bảo popup chỉ hiển thị khi người dùng chủ động bấm vào nút tạo sự kiện.
2. **Hiệu ứng Mờ Kính Che Phủ Nền (Backdrop Blur)**:
   - Sử dụng lớp phủ toàn màn hình `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md` tạo hiệu ứng mờ nền hệ thống chuyên nghiệp, tập trung trải nghiệm vào các bước tạo sự kiện.

### 6.6. Kết Nối Gói Tài Trợ Với CSDL Thực
1. **Loại bỏ Mock Data**:
   - Xóa bỏ hoàn toàn các mảng dữ liệu mẫu hardcode (`FALLBACK_PACKAGES`, `FALLBACK_SPONSORS`).
2. **Đồng bộ với Bảng `public.sponsor_packages` và `public.sponsors`**:
   - Truy vấn và hiển thị 100% dữ liệu thực tế từ cơ sở dữ liệu hệ thống (Bạch Kim, Vàng, Bạc, Đồng...).


---

### Cập nhật 14/10/2026 — Tin nhắn & Trao đổi, Đăng nhập, Tạo sự kiện, Quản lý Tài khoản

- **Tin nhắn & Trao đổi (/network)**: Danh bạ hiển thị TOÀN BỘ tài khoản thuộc 7 Ban (gộp /members/directory + /members + tài khoản tại Quản lý Tài khoản — nguồn chung src/lib/committee-accounts.ts). Mọi tài khoản đều có nút "Nhắn tin trao đổi" (1-1, không cần kết nối trước). Mỗi thẻ hiện tên Ban đúng một lần.
- **Đăng nhập CRM (/auth)**: Nút "Đăng nhập" nền Navy #003B95, chữ trắng (class ceo-login-submit).
- **Tạo sự kiện (/events)**: Popup 3 bước chỉ mở khi bấm "+ Tạo sự kiện"; render qua portal với nền tối mờ (blur) phủ toàn màn hình, khóa cuộn trang nền.
- **Quản lý Tài khoản (/accounts)**: Cột THAO TÁC dùng icon Xem / Sửa / Xóa (Lucide) rõ ràng, có tooltip & aria-label.

---

### Cập nhật 15/10/2026 — QR Sự Kiện, Nhắn Tin Nhóm, Marketplace & Cuộc Gặp 1-on-1

1. **Quét Mã QR Sự Kiện Mở Thẳng Link Đăng Ký HTTPS**:
   - Mã QR hiển thị trên Standee / Popup cổng soát vé (`EventCheckinGatekeeperModal.tsx`) dùng URL HTTPS công khai `${origin}/events/${event.id}/register` (fallback `https://crm.ceo1983.viconnect.vn/events/${event.id}/register`). Khi quét bằng Zalo hoặc Camera điện thoại, trình duyệt mở thẳng trang đăng ký tham gia sự kiện.
2. **Tách Biệt Nghiêm Ngặt 2 Máy Quét QR**:
   - **Máy quét Soát vé Sự kiện (`association.checkin.tsx`)**: Chỉ quét mã trên Thẻ vé điện tử của đại biểu. Bắt buộc từ chối và báo lỗi nếu quét nhầm mã QR sự kiện / form đăng ký.
   - **Máy quét Kết nối Hội viên (`AssociationMemberQrModal.tsx`)**: Quét được cả QR kết nối và QR sự kiện. Khi quét QR sự kiện, hệ thống chuyển hướng sang form đăng ký `/events/:id/register`, không tự động đăng ký ngầm.
3. **Nhắn Tin Nhóm Phân Hệ Network (/network)**:
   - Thêm nút "Tạo nhóm" và modal `NewGroupChatDialog` hỗ trợ đặt tên nhóm, mô tả, lọc hội viên theo 8 ban chuyên môn, tích chọn nhiều hội viên.
   - Thêm bộ lọc xem tin nhắn ("Tất cả", "Nhóm", "Cá nhân"), hỗ trợ đính kèm tệp tin đa định dạng, hiển thị avatar + tên người gửi + ban chuyên môn trên từng tin nhắn nhóm.
4. **Sửa Lỗi Đăng Bán Sản Phẩm Marketplace**:
   - Backend `marketplace.service.ts`: Bổ sung `image_urls` (dạng text array) và `name` (từ `title`) vào câu lệnh SQL raw fallback, triệt tiêu lỗi 500 vi phạm ràng buộc NOT NULL.
   - Frontend `marketplace.functions.ts`: Chuẩn hóa kiểu dữ liệu tùy chọn thành `undefined`, loại bỏ thuộc tính `updatedAt` không tồn tại trong type `Product`.
5. **Khắc Phục Lỗi Màn Hình Trắng Fog Khi Bật Popup Tạo Sự Kiện**:
   - Trong `EventWizard.tsx`, thay thế lớp CSS nền bị xung đột bằng overlay tối bán trong suốt chuẩn `fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs`.
6. **Xem Chi Tiết & Chỉnh Sửa Cuộc Gặp 1-on-1 (/business-connect/meetings)**:
   - Web CRM: Tích hợp `ViewMeetingModal` (xem chi tiết thông tin, người chủ trì, đối tác, địa điểm/link online, ghi chú, trạng thái) và `EditMeetingModal` (sửa toàn bộ thông tin cuộc gặp, gọi API `PATCH /meetings/:id` và đồng bộ realtime).
   - Bổ sung nút "Xem" (icon con mắt) và "Sửa" (icon cây bút) trên cả giao diện Thẻ (Card/Grid) và giao diện Bảng (Table).
   - Backend: Hỗ trợ phân tích cú pháp `target_members` dạng object trong `getConnectionAppointments`, đảm bảo cuộc gặp tạo từ CRM đồng bộ đầy đủ sang ứng dụng di động.
7. **Tối Ưu Logo Sidebar, Modal Lucky Draw Nền Sáng Doanh Nhân & Mã QR Khách Mời Ngoài**:
   - **Logo Sidebar & Tải Tệp Không Lỗi 500**: Loại bỏ card logo trùng lặp tại `/settings`; cơ chế ghi đồng thời ổ đĩa cục bộ trước khi đẩy MinIO kèm timeout guard 800ms và SVG fallback 200 OK triệt tiêu hoàn toàn lỗi 500 khi tải logo hiệp hội.
   - **Modal Cấu Hình Giải Thưởng Vòng Quay May Mắn (Lucky Draw)**: Thiết kế lại toàn diện sang giao diện nền sáng doanh nhân cao cấp (`bg-white`), thay thế ô nhập text URL bằng ô tải file ảnh trực tiếp từ máy (có preview và nút gỡ ảnh), tự động gán icon quà tặng chuẩn, xóa bỏ mọi thuật ngữ mang tính cơ sở dữ liệu.
   - **Mã QR Sự Kiện Cho Khách Mời Ngoài & Dữ Liệu Sự Kiện CRM Động**: Xóa bỏ toàn bộ từ điển template mẫu hardcode (`EVENT_AGENDA`, `FALLBACK_EVENT_SPONSORS`), lấy dữ liệu sự kiện động 100% từ CRM. Bổ sung khối mã QR Zalo cho khách ngoài đăng ký dự sự kiện không cần tài khoản hội viên và hiển thị nổi bật khối huy hiệu Nhà tài trợ khi sự kiện có nhà tài trợ.