// Module sinh nội dung SRS Mobile App chuẩn IEEE 830 toàn diện nhất
// Đầy đủ: Tổng quan, 9 Phân hệ di động chi tiết theo chuẩn 5 mục của 2 ảnh, Phần Phi chức năng (NFR), Tiêu chuẩn nghiệm thu
// Nghiêm cấm dùng từ NFC, thay bằng Thẻ thông minh doanh nhân / Công nghệ chạm thẻ thông minh 1 chạm
function getAppSrsMarkdown() {
  return `# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM ỨNG DỤNG DI ĐỘNG (SRS - MOBILE APP)
## ỨNG DỤNG DI ĐỘNG HỘI VIÊN CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Tiêu chuẩn: IEEE 830-1998 - Phiên bản: 5.0 Hoàn thiện - Phát hành: Tháng 10/2026*

---

# PHẦN 1: GIỚI THIỆU CHUNG & TỔNG QUAN ỨNG DỤNG DI ĐỘNG

### 1.1. Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) này quy định chi tiết toàn bộ các yêu cầu chức năng, yêu cầu phi chức năng, quy tắc kiểm tra hợp lệ dữ liệu, giao diện cảm ứng di động và tương tác nền tảng của Ứng dụng Di động CLB Doanh Nhân CEO 1983 (hoạt động trên cả hai hệ điều hành iOS và Android).

### 1.2. Định vị sản phẩm di động
Ứng dụng di động không đơn thuần là một kênh tra cứu thông tin thông thường, mà được định vị là:
- **Tấm Danh Thiếp Số Quyền Năng**: Đại diện cho phong thái, đẳng cấp và uy tín thương hiệu của từng chủ doanh nghiệp sinh năm Quý Hợi 1983.
- **Văn Phòng Điều Hành Bỏ Túi**: Giúp doanh nhân nhận chỉ đạo, duyệt tiến độ công việc, tham dự sự kiện và giao thương B2B mọi lúc, mọi nơi ngay trên chiếc điện thoại di động.

*Tài liệu cam kết tuân thủ nghiêm ngặt quy định: Chuẩn hóa toàn bộ công nghệ kết nối hội viên bằng cụm từ chính thức: "Thẻ thông minh doanh nhân / Công nghệ chạm thẻ thông minh 1 chạm", sử dụng văn phong quản trị hiệp hội sang trọng.*

---

# PHẦN 2: MÔ TẢ TỔNG QUAN KIẾN TRÚC DI ĐỘNG & ĐỒNG BỘ THỜI GIAN THỰC

### 2.1. Kiến trúc Cầu nối Di động Đa tầng (Hybrid Mobile Bridge)
Ứng dụng kết hợp sức mạnh của giao diện Web siêu mượt mà với tầng Cầu nối Hệ điều hành Native (Android Java / iOS Swift):
- **Tầng Giao diện Cảm ứng**: Tối ưu hóa phản hồi chạm vuốt dưới 0.1 giây, hiệu ứng kính mờ hoàng gia (Glassmorphism) và bảng màu chuẩn thương hiệu HanoiBA CEO 1983.
- **Tầng Dịch vụ Nền Native (Background Services)**: Tích hợp dịch vụ gọi điện hệ điều hành (Android ConnectionService và iOS CallKit) đảm bảo chuông cuộc gọi khẩn cấp đổ vang và hiện giao diện nhận cuộc gọi ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
- **Tầng Nhận diện Giọng nói Tiếng Việt (Dual-Engine Voice AI)**: Tích hợp trợ lý giọng nói thông minh nhận lệnh tiếng Việt tự nhiên và điều hướng màn hình tức thì.

### 2.2. Cơ chế Đồng bộ Hai Chiều với Web CRM
Mọi dữ liệu cá nhân, trạng thái hội phí, nhiệm vụ được giao và vé mời sự kiện đều được đồng bộ hai chiều liên tục với Cổng Quản trị CRM Hiệp hội. Nếu Quản trị viên thay đổi phân quyền của hội viên trên CRM, ứng dụng di động lập tức nhận diện và cập nhật thẩm quyền mà không làm gián đoạn phiên làm việc.

---

# PHẦN 3: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT TỪNG PHÂN HỆ DI ĐỘNG

## 3.1. Phân hệ Đăng Nhập Sinh Trắc Học & Thẻ Thông Minh Doanh Nhân 1 Chạm

### 3.1.1. Thông tin chung
- **Mục tiêu**: Cung cấp giải pháp đăng nhập an toàn, tiện lợi và đẳng cấp cho doanh nhân. Cho phép đăng nhập tức thì thông qua Sinh trắc học vân tay / khuôn mặt (FaceID / Fingerprint), Số điện thoại chính danh kèm mã OTP, hoặc **Công nghệ chạm Thẻ thông minh doanh nhân 1 chạm** vào mặt sau điện thoại.
- **Cơ chế an toàn**: Bảo vệ tài khoản khỏi truy cập trái phép, tự động khóa phiên khi nhập sai mã quá số lần quy định.

### 3.1.2. Màn hình
- **3.1.2.1. Lựa chọn hình thức đăng nhập**: Màn hình chào mừng sang trọng Deep Cobalt Navy kết hợp viền vàng Warm Amber Gold, cho phép chọn phương thức xác thực.
- **3.1.2.2. Danh sách tài khoản đã ghi nhớ**: Danh sách các tài khoản doanh nhân đã lưu trên máy để đăng nhập nhanh.
- **3.1.2.3. Đăng ký tài khoản hội viên mới**: Biểu mẫu ứng tuyển kết nạp ban đầu cho chủ doanh nghiệp.
- **3.1.2.4. Đổi số điện thoại / Thiết lập FaceID**: Cập nhật phương thức bảo mật cá nhân.
- **3.1.2.5. Chỉ định người trợ giúp kích hoạt thẻ**: Nút gọi nhanh hotline hỗ trợ của Ban Thư Ký.
- **3.1.2.6. Lịch sử đăng nhập & Thiết bị**: Bảng kê khai các thiết bị đã từng truy cập tài khoản.
- **3.1.2.7. Đăng xuất an toàn**: Hộp thoại xác nhận đăng xuất và bảo mật dữ liệu lưu trong máy.
- **3.1.2.8. Màn hình Hướng dẫn Chạm Thẻ Thông Minh 1 Chạm**: Hoạt ảnh gợn sóng vàng hướng dẫn đưa tấm thẻ chạm vào lưng điện thoại để đăng nhập trong 0.5 giây.

### 3.1.3. Mô tả chi tiết màn hình
#### 3.1.3.1. Màn hình Lựa chọn Phương thức Xác thực
- Logo câu lạc bộ CEO 1983 mạ vàng dập nổi chính giữa màn hình.
- 3 nút bấm kích thước lớn: [Sinh trắc học FaceID], [Chạm Thẻ thông minh doanh nhân 1 chạm], [Số điện thoại & OTP].

#### 3.1.3.2. Biểu mẫu Đăng nhập & Xác thực Bảo mật
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`loginMethod\` | Phương thức đăng nhập | Chọn một | Có | Sinh trắc học | Sinh trắc học, Chạm thẻ, Số điện thoại | Xem quy tắc giao diện động |
| \`phoneNumber\` | Số điện thoại chính danh | Số điện thoại | Có | Rỗng | 10 số (đầu số 03, 05, 07, 08, 09) | Kiểm tra số di động Việt Nam hợp lệ |
| \`otpCode\` | Mã xác thực bảo mật | Ký tự số | Có | Rỗng | 6 chữ số | Nhận qua tin nhắn SMS trong 60 giây |
| \`smartCardUid\`| Mã định danh thẻ thông minh| Ký tự an toàn | Không | Rỗng | Chuỗi mã hóa độc bản trên thẻ | Đọc tự động qua công nghệ chạm thẻ 1 chạm |
| \`isBiometricOn\`| Kích hoạt FaceID/Vân tay| Bật/Tắt | Có | Bật | Bật hoặc Tắt | Lưu khóa bảo mật trong phân vùng an toàn |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phương thức đăng nhập" = "Chạm Thẻ thông minh doanh nhân"*:
    - Ứng dụng **kích hoạt bộ phận cảm biến chạm thẻ thông minh 1 chạm** của điện thoại.
    - Màn hình hiển thị hoạt ảnh gợn sóng màu vàng Amber Gold hướng dẫn: *"Vui lòng đưa tấm Thẻ thông minh doanh nhân CEO 1983 chạm nhẹ vào phần trên lưng điện thoại..."*.
    - Khi nhận diện chip thành công, máy rung nhẹ 1 nhịp (Haptic feedback), tự động đối soát mã thẻ với máy chủ và chuyển thẳng vào màn hình chính sau 0.5 giây mà không cần nhập mật khẩu.
  - *Khi chọn "Phương thức đăng nhập" = "Sinh trắc học"*:
    - Ứng dụng lập tức gọi giao diện xác thực FaceID hoặc vân tay của hệ điều hành điện thoại. Nếu xác thực thành công, màn hình tự động mở khóa.
  - *Khi chọn "Phương thức đăng nhập" = "Số điện thoại"*:
    - Hiển thị ô nhập số điện thoại; sau khi nhập đủ 10 số hợp lệ, nút *[Gửi mã OTP]* sáng lên màu vàng.
    - Đếm ngược thời gian chờ 60 giây trước khi cho phép yêu cầu gửi lại mã OTP mới.

#### 3.1.3.3. Danh sách tài khoản đã xác thực
- Hiển thị danh sách các hồ sơ doanh nhân đã lưu kèm avatar tròn và tên doanh nghiệp để bấm đăng nhập nhanh.

#### 3.1.3.4. Lịch sử phiên làm việc
- Danh sách thời gian, vị trí đăng nhập (Hà Nội, TP.HCM...) và tên thiết bị di động (iPhone 15 Pro, Samsung Galaxy S24...).

#### 3.1.3.5. Hộp thoại Đăng xuất an toàn
- Hộp thoại hỏi rõ: *"Doanh nhân có muốn đăng xuất khỏi ứng dụng? Dữ liệu danh bạ offline sẽ được bảo mật an toàn"*.

#### 3.1.3.6. Popup Hỗ trợ khẩn cấp
- Cung cấp số điện thoại đường dây nóng của Tổng thư ký và Ban Thư Ký để trợ giúp kích hoạt thẻ.

#### 3.1.3.7. Xem chi tiết thông tin thiết bị
- Kiểm tra tính bảo mật của thiết bị và trạng thái chứng thực của thẻ thông minh doanh nhân.

### 3.1.4. Luồng nghiệp vụ
- **3.1.4.1. Lựa chọn phương thức xác thực**: Doanh nhân chọn Chạm thẻ thông minh, FaceID hoặc OTP.
- **3.1.4.2. Lưu nháp thông tin ứng tuyển kết nạp**: Đăng ký thông tin ban đầu khi nộp đơn vào câu lạc bộ.
- **3.1.4.3. Xác thực & Đăng nhập chính thức**: Chạm thẻ thông minh hoặc nhìn vào màn hình FaceID trong 0.5 giây.
- **3.1.4.4. Đăng xuất an toàn**: Đăng xuất tài khoản khỏi thiết bị.
- **3.1.4.5. Xem chi tiết phiên đăng nhập**: Kiểm tra các thiết bị đang đồng thời đăng nhập tài khoản.
- **3.1.4.6. Xuất nhật ký bảo mật**: Đồng bộ nhật ký an ninh lên máy chủ CRM.

### 3.1.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.1.5.1. Gửi yêu cầu xác thực thẻ thông minh**: Gửi chuỗi mã hóa đọc từ chip thẻ thông minh; Máy chủ xác minh tính hợp lệ và trả về thông tin đăng nhập.
- **3.1.5.2. Gửi mã OTP đăng nhập**: Gửi số điện thoại; Máy chủ kiểm tra danh bạ hội viên chính danh và gửi mã SMS OTP 6 số.
- **3.1.5.3. Xác thực mã OTP**: Gửi mã OTP; Máy chủ xác nhận và trả về mã phiên đăng nhập an toàn.
- **3.1.5.4. Kích hoạt liên kết thẻ thông minh mới**: Ghi nhận mã thẻ thông minh vào hồ sơ hội viên.
- **3.1.5.5. Cập nhật trạng thái sinh trắc học**: Đồng bộ trạng thái bảo mật của thiết bị.
- **3.1.5.6. Làm mới phiên đăng nhập (Refresh Session)**: Tự động duy trì phiên làm việc không bị gián đoạn.
- **3.1.5.7. Hủy phiên làm việc (Đăng xuất)**: Thu hồi mã truy cập trên máy chủ.
- **3.1.5.8. Lấy cấu hình phiên bản ứng dụng**: Kiểm tra phiên bản mới nhất trên Apple App Store và Google Play Store.

---

## 3.2. Phân hệ Danh Thiếp Số Quyền Năng & Công Nghệ Chạm Thẻ Thông Minh 1 Chạm

### 3.2.1. Thông tin chung
- **Mục tiêu**: Biến chiếc điện thoại di động và tấm Thẻ thông minh doanh nhân mạ vàng thành công cụ kết nối giao thương quyền năng số 1. Chỉ cần một thao tác chạm nhẹ lưng điện thoại hoặc thẻ thông minh vào điện thoại đối tác, toàn bộ hồ sơ năng lực doanh nghiệp, website, mã số thuế và thông tin liên hệ được truyền tải trọn vẹn tức thì mà đối tác không cần cài đặt ứng dụng.
- **Chuẩn hóa công nghệ chạm thẻ 1 chạm**: Tích hợp chip thông minh bảo mật cao và mã QR định danh động chống sao chép.

### 3.2.2. Màn hình
- **3.2.2.1. Tìm kiếm mẫu danh thiếp**: Xem trước các phong cách thiết kế danh thiếp doanh nhân sang trọng (Vàng Ánh Kim, Xanh Hoàng Gia, Đen Doanh Nhân).
- **3.2.2.2. Danh sách danh thiếp đã lưu**: Sổ lưu danh thiếp điện tử của các đối tác đã kết nối giao thương.
- **3.2.2.3. Màn hình Trình diễn Danh thiếp Số 3D**: Tấm danh thiếp điện tử 3D chuyển động mượt mà theo góc nghiêng của điện thoại (hiệu ứng con quay hồi chuyển Gyroscope).
- **3.2.2.4. Chỉnh sửa thông tin danh thiếp**: Cập nhật khẩu hiệu kinh doanh, liên kết mạng xã hội (LinkedIn, Zalo, Website).
- **3.2.2.5. Chỉ định thông tin ưu tiên chia sẻ**: Chọn những thông tin được phép công khai khi chạm thẻ với đối tác mới.
- **3.2.2.6. Lịch sử chạm thẻ & Kết nối**: Thống kê số lượt đối tác đã chạm thẻ hoặc quét mã xem danh thiếp của doanh nhân.
- **3.2.2.7. Tạm khóa thẻ thông minh**: Chức năng khóa tức thời chip thẻ thông minh nếu hội viên làm thất lạc thẻ vật lý.
- **3.2.2.8. Màn hình Chạm Thẻ Chia sẻ 1 Chạm**: Màn hình kích hoạt sẵn sàng truyền tải dữ liệu 1 chạm sang điện thoại đối tác.

### 3.2.3. Mô tả chi tiết màn hình
#### 3.2.3.1. Màn hình Trình diễn Danh thiếp Số 3D
- Hiển thị mô phỏng tấm Thẻ thông minh doanh nhân mạ vàng Warm Amber Gold với logo CEO 1983 và họ tên doanh nhân dập nổi.
- Khi nghiêng điện thoại, ánh kim trên thẻ phản chiếu chuyển động chân thực.
- 2 nút bấm nổi bật: *[Chạm Thẻ Chia Sẻ 1 Chạm]* và *[Lưu Vào Danh Bạ Điện Thoại (.vcf)]*.

#### 3.2.3.2. Biểu mẫu Tùy biến Nội dung Danh thiếp
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`cardTheme\` | Phong cách thiết kế thẻ| Chọn một | Có | Vàng Kim HanoiBA | Vàng Kim, Xanh Hoàng Gia, Đen Titan | Xem quy tắc giao diện động |
| \`businessSlogan\`| Khẩu hiệu kinh doanh | Văn bản ngắn | Có | Rỗng | 10 - 150 ký tự | Tự động cắt khoảng trắng thừa |
| \`companyWebsite\`| Trang thông tin công ty | Đường dẫn web | Có | Rỗng | Đường dẫn https:// hợp lệ | Kiểm tra định dạng website |
| \`zaloLink\` | Liên kết Zalo Official | Số điện thoại | Có | Số điện thoại chính | 10 số | Liên kết chat nhanh Zalo |
| \`showTaxId\` | Hiển thị Mã số thuế | Bật/Tắt | Có | Bật | Bật hoặc Tắt | Minh bạch hồ sơ pháp nhân |
| \`showFinanceReport\`| Hiển thị Hồ sơ năng lực | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Xem quy tắc giao diện động |
| \`privacyMode\` | Mức độ riêng tư | Chọn một | Có | Công khai cho hội viên| Công khai toàn bộ, Chỉ hội viên CEO1983| Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phong cách thiết kế thẻ" = "Vàng Kim HanoiBA"*:
    - Thẻ danh thiếp đổi sang tông màu Deep Cobalt Navy kết hợp viền hoa văn vàng mạ Warm Amber Gold sang trọng.
  - *Khi chọn "Mức độ riêng tư" = "Chỉ hội viên CEO1983"*:
    - Hệ thống **tự động ẩn số điện thoại cá nhân** khi người chạm thẻ là khách bên ngoài câu lạc bộ; chỉ hiển thị địa chỉ email và trang web công ty.
  - *Khi bật "Hiển thị Hồ sơ năng lực"* = Bật:
    - Ứng dụng **hiển thị thêm nút bấm**: *[Tải lên Profile Công ty (PDF)]* (tối đa 20MB).

#### 3.2.3.3. Danh sách Đối tác đã chạm thẻ lưu về máy
- Sổ danh thiếp số hiển thị avatar đối tác, công ty, thời gian và địa điểm chạm thẻ.

#### 3.2.3.4. Lịch sử tương tác thẻ
- Biểu đồ thống kê: Lượt chạm thẻ trong tháng, số đối tác đã lưu thông tin vào danh bạ máy.

#### 3.2.3.5. Hộp thoại Khóa thẻ thông minh khẩn cấp
- Cảnh báo vô hiệu hóa chip thẻ thông minh vật lý khi bị thất lạc.

#### 3.2.3.6. Popup Chọn nhóm đối tác phân loại
- Gắn nhãn đối tác vừa chạm thẻ: Khách hàng tiềm năng, Nhà cung cấp, Bạn đồng môn 1983.

#### 3.2.3.7. Xem chi tiết danh thiếp đối tác
- Xem đầy đủ hồ sơ năng lực và các sản phẩm đối tác đang kinh doanh trên sàn B2B.

### 3.2.4. Luồng nghiệp vụ
- **3.2.4.1. Mở danh thiếp số**: Mở ứng dụng di động -> Tấm danh thiếp 3D sẵn sàng chia sẻ.
- **3.2.4.2. Lưu nháp chỉnh sửa danh thiếp**: Nhập tài khoản mạng xã hội mới để xem trước hiển thị.
- **3.2.4.3. Kích hoạt Chạm Thẻ Thông Minh 1 Chạm**: Đưa thẻ hoặc lưng điện thoại chạm nhẹ vào điện thoại đối tác -> Màn hình điện thoại đối tác tự động bật trang danh thiếp đầy đủ.
- **3.2.4.4. Tạm khóa chip thẻ**: Khóa thẻ khi bị rơi mất.
- **3.2.4.5. Xem chi tiết thông tin đối tác**: Lưu đối tác vào danh bạ điện thoại bằng 1 chạm (.vcf).
- **3.2.4.6. Đồng bộ danh bạ hội viên**: Tự động cập nhật danh bạ các doanh nhân mới kết nạp vào máy.

### 3.2.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.2.5.1. Lấy dữ liệu danh thiếp số cá nhân**: Trả về toàn bộ thông tin cá nhân, doanh nghiệp và liên kết mạng xã hội.
- **3.2.5.2. Sinh mã QR định danh động**: Sinh mã bảo mật thay đổi theo từng phút.
- **3.2.5.3. Cập nhật nội dung danh thiếp**: Lưu thông tin chỉnh sửa và đồng bộ tức thì lên đám mây.
- **3.2.5.4. Ghi nhận lượt chạm thẻ thông minh**: Ghi vết thời gian và mã thiết bị chạm thẻ phục vụ báo cáo giao thương.
- **3.2.5.5. Tải tệp danh bạ điện tử (.vcf)**: Trả về tệp danh bạ chuẩn vCard để lưu thẳng vào bộ nhớ máy điện thoại.
- **3.2.5.6. Khóa / Mở khóa thẻ thông minh**: Cập nhật trạng thái an toàn của chip thẻ trên máy chủ.
- **3.2.5.7. Xóa liên kết đối tác**: Xóa danh thiếp đối tác khỏi danh mục lưu trữ.
- **3.2.5.8. Lấy danh mục giao diện mẫu**: Trả về các phong cách thiết kế danh thiếp cao cấp.

---

## 3.3. Phân hệ Quản lý Công Việc, Nhận Việc Phân Cấp & Nộp Hồ Sơ Nghiệm Thu Di Động

### 3.3.1. Thông tin chung
- **Mục tiêu**: Đảm bảo doanh nhân có thể quản lý, theo dõi và xử lý các nhiệm vụ hiệp hội mọi lúc, mọi nơi ngay trên chiếc điện thoại di động. Khi có công việc mới được phân công từ Ban Điều Hành hoặc Trưởng ban, ứng dụng lập tức phát chuông thông báo và đẩy nhiệm vụ lên đầu màn hình.
- **Trải nghiệm di động tối ưu**: Xem trước trực tiếp tệp Word, Excel dự toán và PDF; chụp ảnh hiện trường nghiệm thu bằng camera điện thoại và gửi duyệt ngay tại chỗ.

### 3.3.2. Màn hình
- **3.3.2.1. Tìm kiếm nhiệm vụ**: Lọc theo tab: Việc tôi chủ trì, Việc tôi phối hợp, Việc đã hoàn thành, Việc khẩn cấp.
- **3.3.2.2. Danh sách nhiệm vụ**: Danh sách công việc dạng thẻ cảm ứng trực quan hiển thị tiêu đề, huy hiệu ưu tiên, hạn chót đếm ngược và thanh tiến độ hoàn thành.
- **3.3.2.3. Khởi tạo / Bàn giao việc nhanh**: Biểu mẫu giao nhiệm vụ nhanh dành cho Chủ tịch, Tổng thư ký và Trưởng ban ngay trên điện thoại.
- **3.3.2.4. Cập nhật tiến độ**: Thanh trượt cảm ứng điều chỉnh tỷ lệ % hoàn thành (0% đến 100%) kèm ô nhập nhật ký công việc.
- **3.3.2.5. Chọn người phối hợp**: Danh bạ chọn nhanh thành viên trong ban để cùng tham gia xử lý nhiệm vụ.
- **3.3.2.6. Nhật ký tiến độ & Trao đổi**: Dòng thời gian hiển thị trao đổi chỉ đạo giữa Ban Điều Hành và người thực hiện.
- **3.3.2.7. Hủy bỏ / Từ chối tiếp nhận**: Hộp thoại nêu rõ lý do không thể tiếp nhận nhiệm vụ.
- **3.3.2.8. Màn hình Chi tiết Nhiệm vụ & Nộp Hồ sơ Nghiệm thu**: Màn hình toàn diện xem nội dung chỉ đạo, đọc tệp đính kèm và nút [Gửi Hồ Sơ Nghiệm Thu] / [Phê Duyệt Nghiệm Thu].

### 3.3.3. Mô tả chi tiết màn hình
#### 3.3.3.1. Màn hình Danh sách Nhiệm vụ Đa tab
- Tab 1 Cần làm ngay; Tab 2 Đang triển khai; Tab 3 Chờ nghiệm thu; Tab 4 Đã hoàn thành.

#### 3.3.3.2. Biểu mẫu Báo cáo Tiến độ & Nộp Nghiệm thu Di động
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`completionRate\`| Tỷ lệ hoàn thành (%) | Thanh trượt số | Có | 100% | 1% đến 100% | Kéo thanh trượt cảm ứng mượt mà |
| \`progressNotes\` | Báo cáo chi tiết kết quả| Đoạn văn bản | Có | Rỗng | 10 - 1000 ký tự | Ghi rõ kết quả công việc đạt được |
| \`cameraPhotos\` | Ảnh chụp hiện trường | Chụp ảnh camera | Không | Rỗng | Tối đa 5 ảnh chụp trực tiếp từ camera máy | Khuyến khích chụp sản phẩm nghiệm thu |
| \`attachedDocs\` | Tệp kết quả đính kèm | Tải lên tệp | Không | Rỗng | Tệp Word, Excel, PDF (tối đa 25MB) | Cho phép chọn tệp từ bộ nhớ máy |
| \`requestAccept\`| Đề nghị nghiệm thu chính thức| Bật/Tắt | Có | Bật | Bật hoặc Tắt | Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi kéo "Tỷ lệ hoàn thành (%)" đạt mức 100%*:
    - Hệ thống **tự động bật nút "Đề nghị nghiệm thu chính thức"**.
    - Hiển thị thêm hộp thông báo màu xanh lá: *"Công việc đã sẵn sàng bàn giao. Hãy đính kèm ảnh chụp hiện trường hoặc tệp nghiệm thu để người giao việc phê duyệt"*.
  - *Khi người đăng nhập là "Người giao việc" (Chủ tịch / Trưởng ban) đang xem công việc chờ duyệt*:
    - Ứng dụng **hiển thị 2 nút bấm thao tác lớn**: [Phê Duyệt Nghiệm Thu Đạt] (Xanh lá) và [Yêu Cầu Chỉnh Sửa] (Cam).

#### 3.3.3.3. Danh sách nhiệm vụ dạng thẻ cảm ứng
- Chạm vào thẻ để mở xem chi tiết; vuốt sang trái để thao tác nhanh: Cập nhật tiến độ hoặc Báo cáo khẩn cấp.

#### 3.3.3.4. Nhật ký trao đổi thời gian thực
- Khung trao đổi tương tự tin nhắn: Cho phép gửi tin nhắn thoại ngắn, hình ảnh và icon biểu cảm công việc.

#### 3.3.3.5. Hộp thoại Từ chối nhiệm vụ
- Yêu cầu nhập lý do từ chối để chuyển tiếp tới cán bộ khác trong ban.

#### 3.3.3.6. Popup Chọn người phối hợp trong ban
- Danh sách hội viên trong cùng ban chuyên môn có sẵn số điện thoại để bấm gọi trao đổi nhanh.

#### 3.3.3.7. Xem chi tiết tệp đính kèm di động
- Trình xem trước tệp trực tiếp trong ứng dụng: Hỗ trợ phóng to thu nhỏ bảng tính Excel dự toán và văn bản Word chỉ đạo.

### 3.3.4. Luồng nghiệp vụ
- **3.3.4.1. Nhận thông báo nhiệm vụ mới**: Chuông điện thoại đổ vang -> Chạm mở thông báo xem chi tiết chỉ đạo.
- **3.3.4.2. Lưu nháp báo cáo tiến độ**: Chụp ảnh hiện trường lưu tạm vào máy khi chưa có kết nối mạng.
- **3.3.4.3. Nộp kết quả nghiệm thu chính thức**: Tải ảnh và tệp kết quả lên máy chủ CRM.
- **3.3.4.4. Hủy / Đóng nhiệm vụ**: Đóng công việc đã hoàn thành đưa vào kho lưu trữ.
- **3.3.4.5. Xem chi tiết tiến độ**: Theo dõi tỷ lệ hoàn thành theo thời gian thực.
- **3.3.4.6. Xuất báo cáo công việc**: Đồng bộ dữ liệu sang bảng điều hành CRM.

### 3.3.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.3.5.1. Lấy danh sách nhiệm vụ của tôi**: Trả về các công việc người dùng đang phụ trách hoặc phối hợp.
- **3.3.5.2. Lấy chi tiết công việc và tài liệu**: Tải nội dung công việc và các đường dẫn tệp đính kèm.
- **3.3.5.3. Nộp báo cáo nghiệm thu**: Gửi tiến độ %, nội dung báo cáo và danh sách ảnh chụp hiện trường.
- **3.3.5.4. Lưu nháp tiến độ ngoại tuyến (Offline)**: Lưu tạm dữ liệu vào bộ nhớ máy điện thoại.
- **3.3.5.5. Phê duyệt / Yêu cầu sửa tiến độ**: Gửi kết quả đánh giá của người giao việc.
- **3.3.5.6. Gửi trao đổi / Bình luận công việc**: Gửi tin nhắn trao đổi vào luồng công việc.
- **3.3.5.7. Từ chối nhiệm vụ**: Gửi yêu cầu chuyển giao công việc kèm lý do.
- **3.3.5.8. Lấy danh mục mức độ khẩn cấp**: Trả về cấu hình hiển thị màu sắc ưu tiên.

---

## 3.4. Phân hệ Sàn Giao Thương Doanh Nghiệp B2B & Khớp Nối Cung Cầu Trực Tiếp

### 3.4.1. Thông tin chung
- **Mục tiêu**: Mở ra một sàn thương mại điện tử nội bộ B2B đẳng cấp ngay trên điện thoại của hội viên. Cho phép doanh nhân tìm kiếm nhà cung cấp uy tín, mua sắm sản phẩm với mức giá chiết khấu đặc quyền chỉ dành riêng cho hội viên CEO 1983, và đăng tải sản phẩm của chính doanh nghiệp mình tiếp cận hàng trăm chủ doanh nghiệp khác.
- **Chính sách kết nối giao thương trực tiếp**: Không qua trung gian thương mại, hai chủ doanh nghiệp kết nối trực tiếp với nhau thông qua cuộc gọi mã hóa nội bộ hoặc đặt lịch hẹn cà phê 1-on-1.

### 3.4.2. Màn hình
- **3.4.2.1. Tìm kiếm sản phẩm B2B**: Thanh tìm kiếm thông minh hỗ trợ tìm kiếm bằng giọng nói tiếng Việt, lọc theo 12 nhóm ngành nghề, khoảng giá và vị trí địa lý doanh nghiệp.
- **3.4.2.2. Danh sách sản phẩm nổi bật**: Danh sách sản phẩm hiển thị dạng lưới thẻ 2 cột hiện đại: Ảnh sản phẩm sắc nét, Tên doanh nghiệp thành viên, Giá niêm yết, Giá ưu đãi đặc quyền cho hội viên CEO 1983 và Huy hiệu uy tín.
- **3.4.2.3. Đăng sản phẩm mới từ điện thoại**: Biểu mẫu đăng tải nhanh: Chụp ảnh sản phẩm bằng camera, nhập mức chiết khấu cho hội viên, chọn ngành nghề và gửi Ban Xúc tiến thương mại kiểm duyệt.
- **3.4.2.4. Quản lý gian hàng của tôi**: Màn hình quản lý các sản phẩm của doanh nghiệp mình đang niêm yết trên sàn.
- **3.4.2.5. Chỉ định người phụ trách kinh doanh**: Chọn cán bộ kinh doanh của công ty để tiếp nhận các cuộc gọi hỏi mua hàng.
- **3.4.2.6. Lịch sử yêu cầu báo giá & Giao dịch**: Theo dõi các cơ hội Cung - Cầu đã gửi đi và nhận về.
- **3.4.2.7. Tạm dừng kinh doanh sản phẩm**: Nút gạt bật/tắt tạm ngưng hiển thị sản phẩm khi hết hàng.
- **3.4.2.8. Màn hình Chi tiết Sản phẩm B2B**: Toàn cảnh hình ảnh sản phẩm phóng to, hồ sơ năng lực công ty cung ứng, bảng giá đặc quyền và nút bấm lớn: [Kết Nối Giao Thương 1-on-1] / [Gửi Yêu Cầu Báo Giá] / [Gọi Điện Thoại Nội Bộ].

### 3.4.3. Mô tả chi tiết màn hình
#### 3.4.3.1. Màn hình Sàn Giao thương B2B
- Banner trượt (Carousel) giới thiệu các chương trình xúc tiến thương mại trọng điểm của hiệp hội.
- Thanh lọc danh mục ngành nghề bằng icon tròn vuốt ngang: Xây dựng, Cơ khí, Công nghệ, Nông sản, Dịch vụ, Tài chính...

#### 3.4.3.2. Biểu mẫu Đăng tải Sản phẩm B2B Di động
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`productTitle\` | Tên sản phẩm / Dịch vụ | Văn bản ngắn | Có | Rỗng | 5 - 150 ký tự | Tự động cắt khoảng trắng thừa |
| \`industryId\` | Nhóm ngành nghề | Chọn một | Có | Xây dựng - Vật liệu | 12 nhóm ngành chính thức | Bắt buộc chọn đúng ngành |
| \`regularPrice\` | Giá niêm yết thị trường | Số tiền tệ | Có | 0 | 0 đến 50 tỷ VNĐ | Nhập số tiền VNĐ |
| \`memberPrice\` | Giá đặc quyền cho hội viên| Số tiền tệ | Có | 0 | Phải nhỏ hơn giá thị trường | Xem quy tắc giao diện động |
| \`minOrderQty\` | Số lượng đặt hàng tối thiểu| Văn bản ngắn | Có | 1 | Tối đa 50 ký tự | Ví dụ: 10 cái, 1 container |
| \`productPhotos\`| Ảnh chụp sản phẩm | Chụp ảnh camera | Có | Rỗng | Tối thiểu 1 ảnh, tối đa 8 ảnh | Chụp sản phẩm rõ nét |
| \`warrantyTerm\` | Thời hạn bảo hành / Hỗ trợ| Văn bản ngắn | Không | 12 tháng | Tối đa 100 ký tự | Cam kết uy tín doanh nhân |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi nhập "Giá đặc quyền cho hội viên"*:
    - Hệ thống **tự động tính toán tỷ lệ % chiết khấu** hiển thị ngay bên cạnh.
    - Nếu "Giá đặc quyền" >= "Giá niêm yết thị trường", ô nhập hiện viền đỏ cảnh báo vi phạm quy chế ưu đãi nội bộ.
  - *Khi người xem là Hội viên chính danh đã đăng nhập*:
    - Màn hình sản phẩm hiển thị nổi bật **Mức giá ưu đãi đặc quyền màu vàng Amber Gold** kèm số tiền tiết kiệm được.

#### 3.4.3.3. Danh sách sản phẩm dạng thẻ lưới
- Thẻ sản phẩm có gắn logo doanh nghiệp hội viên mạ vàng, giá bán rõ ràng và biểu tượng ngành nghề.

#### 3.4.3.4. Lịch sử yêu cầu báo giá
- Danh sách các doanh nghiệp đã bấm "Gửi yêu cầu báo giá" kèm số điện thoại để liên hệ chăm sóc.

#### 3.4.3.5. Hộp thoại Tạm dừng kinh doanh
- Gạt tắt công tắc hiển thị sản phẩm khi tạm thời gián đoạn nguồn cung.

#### 3.4.3.6. Popup Chọn đầu mối kinh doanh công ty
- Chỉ định số điện thoại nhân viên phụ trách nhận cuộc gọi tư vấn sản phẩm.

#### 3.4.3.7. Xem chi tiết sản phẩm B2B
- Xem ảnh trượt mượt mà, thông số kỹ thuật, hồ sơ năng lực công ty và nút gọi điện thoại thoại/video nội bộ miễn phí.

### 3.4.4. Luồng nghiệp vụ
- **3.4.4.1. Tìm kiếm sản phẩm B2B**: Nhập từ khóa hoặc ra lệnh bằng giọng nói tiếng Việt.
- **3.4.4.2. Lưu nháp bài đăng sản phẩm**: Chụp ảnh sản phẩm lưu nháp để bổ sung thông số sau.
- **3.4.4.3. Gửi duyệt niêm yết chính thức**: Gửi sản phẩm tới Ban Xúc tiến thương mại phê chuẩn.
- **3.4.4.4. Tạm dừng / Xóa sản phẩm**: Gỡ sản phẩm khỏi sàn B2B.
- **3.4.4.5. Kết nối giao thương Cung - Cầu**: Bấm nút gửi yêu cầu kết nối giao thương tới chủ doanh nghiệp.
- **3.4.4.6. Xuất danh mục sản phẩm**: Chia sẻ liên kết sản phẩm qua Zalo hoặc danh thiếp số.

### 3.4.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.4.5.1. Lấy danh sách sản phẩm B2B**: Trả về sản phẩm theo ngành nghề kèm giá ưu đãi.
- **3.4.5.2. Lấy chi tiết sản phẩm**: Tải toàn bộ catalog hình ảnh và thông số kỹ thuật.
- **3.4.5.3. Đăng tải sản phẩm mới**: Gửi thông tin và ảnh sản phẩm lên hàng đợi kiểm duyệt.
- **3.4.5.4. Lưu nháp sản phẩm**: Lưu sản phẩm ở trạng thái nháp nội bộ.
- **3.4.5.5. Gửi yêu cầu kết nối giao thương**: Gửi thông báo nhu cầu mua hàng tới chủ doanh nghiệp cung cấp.
- **3.4.5.6. Cập nhật sản phẩm**: Chỉnh sửa bảng giá hoặc chiết khấu.
- **3.4.5.7. Tạm dừng kinh doanh**: Bật/tắt trạng thái hiển thị của sản phẩm.
- **3.4.5.8. Lấy danh mục 12 nhóm ngành B2B**: Trả về danh sách ngành nghề chuẩn mực.

---

## 3.5. Phân hệ Danh Bạ Doanh Nhân Chính Danh & Lịch Hẹn Giao Thương 1-on-1

### 3.5.1. Thông tin chung
- **Mục tiêu**: Cung cấp cuốn danh bạ điện tử tin cậy 100% về toàn thể các chủ doanh nghiệp trong hiệp hội. Giúp hội viên dễ dàng tra cứu thông tin đối tác theo ngành hàng, chức vụ hoặc ban chuyên môn.
- **Tính năng Đặt lịch hẹn cà phê 1-on-1**: Cho phép chọn khung giờ rảnh và gửi lời mời kết nối cà phê giao thương 1-on-1; lịch hẹn tự động được ghi nhận vào Lịch công tác của cả hai doanh nhân.

### 3.5.2. Màn hình
- **3.5.2.1. Tìm kiếm hội viên**: Thanh tìm kiếm theo tên, số điện thoại, tên công ty hoặc ngành nghề; bộ lọc theo Ban chuyên môn.
- **3.5.2.2. Danh sách danh bạ hội viên**: Thẻ danh bạ sang trọng có avatar, họ tên, tên doanh nghiệp, chức vụ và 3 nút thao tác: Gọi điện thoại, Nhắn tin, Đặt lịch 1-on-1.
- **3.5.2.3. Tạo lời mời lịch hẹn 1-on-1**: Biểu mẫu thiết lập cuộc hẹn: Chọn đối tác, Thời gian hẹn, Địa điểm, Nội dung kết nối giao thương.
- **3.5.2.4. Đổi lịch hẹn / Gia hạn**: Đề xuất dời thời gian cuộc hẹn nếu có lịch công tác đột xuất.
- **3.5.2.5. Chỉ định địa điểm gặp gỡ**: Bản đồ gợi ý các quán cà phê sang trọng của hiệp hội.
- **3.5.2.6. Lịch sử các cuộc hẹn 1-on-1**: Theo dõi các cuộc hẹn đã diễn ra và ghi chú kết quả hợp tác kinh doanh.
- **3.5.2.7. Hủy lịch hẹn**: Hộp thoại hủy cuộc hẹn kèm lý do xin lỗi đối tác.
- **3.5.2.8. Màn hình Hồ sơ Doanh nhân 360°**: Màn hình xem chi tiết toàn diện: Thông tin cá nhân, Hồ sơ năng lực doanh nghiệp, Gian hàng sản phẩm và Tấm thẻ thông minh mạ vàng.

### 3.5.3. Mô tả chi tiết màn hình
#### 3.5.3.1. Tìm kiếm & Bộ lọc Danh bạ
- Thanh cuộn chọn nhanh theo chữ cái A-Z bên cạnh phải màn hình. Bộ lọc 6 ban chuyên môn.

#### 3.5.3.2. Biểu mẫu Đặt lịch hẹn Giao thương 1-on-1
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`partnerId\` | Doanh nhân đối tác | Chọn một | Có | Đã chọn trước | Danh sách hội viên chính danh | Bắt buộc chọn đúng hội viên |
| \`meetingSubject\`| Chủ đề kết nối giao thương| Văn bản ngắn | Có | Cà phê giao thương 1-on-1 | 5 - 150 ký tự | Nêu rõ mục tiêu hợp tác |
| \`appointmentDate\`| Ngày hẹn gặp | Ngày tháng | Có | Ngày mai | Từ ngày mai trở đi | Không hẹn ngày trong quá khứ |
| \`timeSlot\` | Khung giờ hẹn | Chọn một | Có | 09:00 - 10:30 | 08:00 - 11:30, 14:00 - 17:00 | Chọn khung giờ hành chính |
| \`meetingVenue\` | Địa điểm gặp gỡ | Văn bản ngắn | Có | Trụ sở Hiệp hội HanoiBA | Tối đa 250 ký tự | Ghi rõ tên quán cà phê/địa chỉ |
| \`cooperateField\`| Lĩnh vực mong muốn hợp tác| Chọn một | Có | Kết nối kinh doanh | Mua bán hàng hóa, Đầu tư, Tư vấn | Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi đối tác nhận được lời mời lịch hẹn 1-on-1*:
    - Điện thoại đối tác đổ chuông thông báo và hiện cửa sổ lịch hẹn với 2 nút: [Đồng Ý Hẹn] (Xanh) -> Tự động đồng bộ vào Lịch điện thoại (Apple Calendar / Google Calendar) của cả hai; và [Đề Xuất Giờ Khác / Từ Chối] (Xám).

#### 3.5.3.3. Thẻ danh bạ doanh nhân
- Bo tròn viền mạ vàng trang nhã, hiển thị ảnh đại diện, họ tên, chức vụ công ty và tên doanh nghiệp.

#### 3.5.3.4. Danh sách các cuộc hẹn của tôi
- Danh sách các cuộc hẹn sắp diễn ra kèm đếm ngược thời gian và nút chỉ đường bản đồ.

#### 3.5.3.5. Hộp thoại Hủy lịch hẹn
- Gửi thông báo xin lỗi đối tác và hoàn tác lịch nhắc nhở.

#### 3.5.3.6. Popup Chọn địa điểm kết nối đối tác
- Danh sách không gian cà phê sang trọng tại Hà Nội.

#### 3.5.3.7. Xem chi tiết Hồ sơ Doanh nhân 360°
- Tiểu sử doanh nhân, hành trình lập nghiệp, sản phẩm kinh doanh và đánh giá uy tín.

### 3.5.4. Luồng nghiệp vụ
- **3.5.4.1. Tra cứu danh bạ**: Tìm kiếm hội viên theo ngành nghề.
- **3.5.4.2. Lưu nháp lịch hẹn**: Soạn thảo lời mời hẹn gặp lưu tạm.
- **3.5.4.3. Gửi lời mời lịch hẹn chính thức**: Phát thông báo tới điện thoại đối tác -> Đối tác bấm đồng ý -> Xác nhận cuộc hẹn thành công.
- **3.5.4.4. Hủy lịch hẹn**: Hủy cuộc hẹn khi có việc bận đột xuất.
- **3.5.4.5. Xem chi tiết kết quả cuộc hẹn**: Ghi lại biên bản tóm tắt cơ hội hợp tác sau buổi gặp gỡ.
- **3.5.4.6. Đồng bộ danh bạ máy**: Lưu toàn bộ danh bạ hội viên vào danh bạ điện thoại di động.

### 3.5.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.5.5.1. Tra cứu danh bạ hội viên**: Trả về danh sách hội viên chính danh kèm thông tin liên lạc được phép công khai.
- **3.5.5.2. Lấy hồ sơ chi tiết doanh nhân 360°**: Tải đầy đủ thông tin cá nhân và doanh nghiệp.
- **3.5.5.3. Gửi lời mời lịch hẹn 1-on-1**: Gửi thông tin lời mời tới máy chủ; phát thông báo đẩy tới đối tác.
- **3.5.5.4. Lưu nháp cuộc hẹn**: Lưu dự thảo lịch hẹn.
- **3.5.5.5. Phản hồi lời mời (Đồng ý / Từ chối)**: Cập nhật trạng thái cuộc hẹn và đồng bộ lịch.
- **3.5.5.6. Thay đổi thời gian lịch hẹn**: Gửi đề xuất điều chỉnh giờ gặp.
- **3.5.5.7. Hủy cuộc hẹn**: Hủy lịch hẹn và xóa thông báo nhắc nhở.
- **3.5.5.8. Lấy danh mục địa điểm và khung giờ**: Trả về cấu hình không gian kết nối đối tác.

---

## 3.6. Phân hệ Trải Nghiệm Đại Biểu Sự Kiện, Ví Vé E-Ticket & Soát Vé QR 0.1 Giây

### 3.6.1. Thông tin chung
- **Mục tiêu**: Mang lại trải nghiệm tham dự sự kiện đẳng cấp 5 sao cho từng đại biểu doanh nhân. Toàn bộ vé mời tham dự Đại hội, Gala Dinner hoặc Diễn đàn kinh tế đều được số hóa và lưu trữ trang trọng trong Ví Vé Điện Tử (E-Ticket Wallet) của ứng dụng.
- **Quyền lợi đại biểu VIP**: Xem trước vị trí bàn tiệc tròn và số ghế ngồi VIP; điểm danh vào cửa siêu tốc trong 0.1 giây tại bàn lễ tân; tham gia Vòng quay may mắn (Lucky Draw).

### 3.6.2. Màn hình
- **3.6.2.1. Tìm kiếm sự kiện sắp tới**: Xem danh sách các sự kiện lớn sắp diễn ra kèm đếm ngược ngày khai mạc.
- **3.6.2.2. Ví vé điện tử của tôi**: Danh sách các vé tham dự sự kiện của doanh nhân hiển thị dạng cuống vé máy bay cao cấp mạ vàng.
- **3.6.2.3. Đăng ký vé tham dự mới**: Biểu mẫu đăng ký vé tham dự sự kiện, chọn số lượng vé khách mời đi cùng.
- **3.6.2.4. Đổi vị trí ghế ngồi / Bàn tiệc**: Đề xuất chuyển bàn tiệc để ngồi chung giao thương với đối tác mong muốn.
- **3.6.2.5. Chỉ định khách mời đi kèm**: Hộp thoại nhập thông tin khách mời doanh nhân cùng tham dự.
- **3.6.2.6. Lịch sử tham dự sự kiện**: Bảng lưu trữ cuống vé các đại hội, kỷ niệm thành lập qua các năm.
- **3.6.2.7. Hủy đăng ký vé**: Chức năng hoàn trả vé trước 24 giờ để ban tổ chức nhường ghế cho đại biểu khác.
- **3.6.2.8. Màn hình Cuống Vé VIP & Mã QR Check-in**: Toàn màn hình hiển thị cuống vé mạ vàng, mã QR động độ nét cao, số bàn tiệc, số ghế và chương trình nghị sự chi tiết.

### 3.6.3. Mô tả chi tiết màn hình
#### 3.6.3.1. Màn hình Cuống Vé Điện Tử VIP
- Thiết kế hình tượng cuống vé máy bay hạng Thương gia (Business Class) với đường xé vé răng cưa điện tử tinh xảo.
- Khung định danh vị trí trân trọng: **BÀN VIP 01 - GHẾ SỐ 03** (Viền vàng rực rỡ, chữ in hoa đậm nét).
- Mã QR định danh động tự động tăng độ sáng màn hình lên 100% khi mở vé để máy quét lễ tân đọc được tức thì trong 0.1 giây.

#### 3.6.3.2. Biểu mẫu Đăng ký Tham dự Sự kiện
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`eventId\` | Sự kiện tham gia | Chọn một | Có | Đã chọn trước | Danh sách sự kiện mở đăng ký | Bắt buộc chọn sự kiện hợp lệ |
| \`delegateName\` | Họ và tên đại biểu | Văn bản ngắn | Có | Họ tên doanh nhân | 2 - 100 ký tự | Tự động điền tên hội viên |
| \`ticketClass\` | Hạng vé tham dự | Chọn một | Có | Đại biểu VIP | Đại biểu VIP, Đại biểu Tiêu chuẩn | Xem quy tắc giao diện động |
| \`hasGuest\` | Đăng ký khách mời kèm | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Xem quy tắc giao diện động |
| \`guestName\` | Họ tên khách mời | Văn bản ngắn | Không | Rỗng | 2 - 100 ký tự | Bắt buộc nếu bật đăng ký kèm |
| \`guestCompany\` | Doanh nghiệp khách mời | Văn bản ngắn | Không | Rỗng | Tối đa 200 ký tự | Bắt buộc nếu có khách kèm |
| \`dietNotes\` | Lưu ý tiệc chiêu đãi | Chọn một | Không | Tiệc mặn tiêu chuẩn | Tiệc mặn, Tiệc chay, Dị ứng đồ biển | Phục vụ ẩm thực chu đáo |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi bật "Đăng ký khách mời kèm" = Bật*:
    - Hệ thống **mở rộng biểu mẫu**, hiển thị các ô bắt buộc: *"Họ tên khách mời"*, *"Số điện thoại di động"*, *"Tên công ty khách mời"*.
    - Tự động sinh thêm 1 vé phụ gắn liền với bàn tiệc của đại biểu chính.
  - *Khi quét vé tại cổng lễ tân thành công*:
    - Màn hình cuống vé trên điện thoại doanh nhân **tự động chuyển trạng thái sang "ĐÃ CHECK-IN" kèm huy hiệu xanh lá cây** và kích hoạt quyền tham gia Vòng quay may mắn (Lucky Draw).

#### 3.6.3.3. Danh sách vé sự kiện trong ví
- Thẻ vé hiển thị đếm ngược thời gian diễn ra sự kiện.

#### 3.6.3.4. Lịch trình sự kiện chi tiết
- Dòng thời gian chương trình: Đón khách -> Khai mạc -> Khai tiệc -> Giao lưu -> Quay số may mắn.

#### 3.6.3.5. Hộp thoại Hủy vé sự kiện
- Cho phép hủy vé trước giờ khai mạc tối thiểu 24h để nhường quyền tham dự cho hội viên khác.

#### 3.6.3.6. Popup Chọn bàn tiệc giao thương mong muốn
- Sơ đồ bàn tiệc tròn trực quan cho phép chọn bàn có các doanh nghiệp cùng ngành để tiện trao đổi.

#### 3.6.3.7. Xem chi tiết Vòng quay may mắn (Lucky Draw)
- Màn hình theo dõi trực tiếp kết quả quay số trúng thưởng trên sân khấu.

### 3.6.4. Luồng nghiệp vụ
- **3.6.4.1. Đăng ký vé sự kiện**: Chọn sự kiện -> Xác nhận thông tin đại biểu -> Nhận vé điện tử vào ví.
- **3.6.4.2. Lưu nháp đăng ký vé**: Điền thông tin khách mời lưu tạm.
- **3.6.4.3. Xuất vé chính thức**: Phân bổ bàn tiệc VIP và sinh mã QR định danh duy nhất.
- **3.6.4.4. Hủy vé tham dự**: Hủy đăng ký vé trước 24 giờ.
- **3.6.4.5. Điểm danh cổng 0.1 giây**: Đưa mã QR cuống vé trước camera lễ tân để hoàn tất điểm danh.
- **3.6.4.6. Tham gia quay số may mắn**: Hệ thống tự động đưa mã vé đã check-in vào lồng quay số trúng thưởng.

### 3.6.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.6.5.1. Lấy danh sách sự kiện mở đăng ký**: Trả về các sự kiện sắp diễn ra kèm số vé còn lại.
- **3.6.5.2. Lấy chi tiết cuống vé và mã QR**: Tải thông tin cuống vé, vị trí bàn tiệc và mã QR mã hóa an toàn.
- **3.6.5.3. Đăng ký vé sự kiện chính thức**: Gửi thông tin đăng ký; Máy chủ kiểm tra số lượng chỗ ngồi còn trống và cấp vé.
- **3.6.5.4. Lưu nháp đăng ký vé**: Lưu thông tin đăng ký dự thảo.
- **3.6.5.5. Cập nhật trạng thái điểm danh**: Nhận tín hiệu xác nhận đã vào cửa từ bàn lễ tân.
- **3.6.5.6. Đổi vị trí chỗ ngồi**: Gửi yêu cầu chuyển bàn tiệc.
- **3.6.5.7. Hủy vé sự kiện**: Hủy vé và trả lại chỗ trống cho khán phòng.
- **3.6.5.8. Lấy danh sách trúng thưởng Lucky Draw**: Nhận thông báo trúng thưởng từ ban tổ chức.

---

## 3.7. Phân hệ Đàm Thoại Nội Bộ Bảo Mật, Cuộc Gọi Nền Native & Trợ Lý Giọng Nói (Voice AI)

### 3.7.1. Thông tin chung
- **Mục tiêu**: Cung cấp kênh liên lạc đặc quyền, bảo mật tuyệt đối dành riêng cho các chủ doanh nghiệp CEO 1983. Hỗ trợ đàm thoại thoại (Voice call) và đàm thoại video (Video call) chất lượng cao chuẩn HD, mã hóa đầu cuối bảo vệ bí mật kinh doanh.
- **Dịch vụ thông báo cuộc gọi nền native trên điện thoại**:
  - Khi có cuộc gọi đến, chuông điện thoại đổ vang và hiện giao diện cuộc gọi với 2 nút "Nghe" / "Từ chối" ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
  - Kết thúc cuộc gọi tức thì ở cả hai đầu khi một bên gác máy (0ms trễ), không để chuông ảo đổ tiếp.
- **Trợ lý giọng nói doanh nhân thông minh (Voice AI)**: Cho phép ra lệnh bằng giọng nói tiếng Việt tự nhiên: "Mở danh sách sự kiện", "Xem hội phí", "Tìm doanh nghiệp xây dựng"; hệ thống tự động chuyển hướng màn hình tức thì.

### 3.7.2. Màn hình
- **3.7.2.1. Tìm kiếm hội viên để đàm thoại**: Tìm nhanh bạn đồng môn theo tên hoặc số điện thoại trong danh bạ nội bộ.
- **3.7.2.2. Lịch sử cuộc gọi nội bộ**: Danh sách các cuộc gọi đi, cuộc gọi đến và cuộc gọi nhỡ kèm thời lượng đàm thoại.
- **3.7.2.3. Màn hình Đàm thoại Thoại / Video (Active Call)**: Giao diện đàm thoại toàn màn hình sang trọng Deep Cobalt Navy, hiển thị ảnh đại diện doanh nhân, thời gian kết nối, nút Bật/Tắt Mic, Bật/Tắt Camera, Chuyển loa ngoài và nút Kết thúc cuộc gọi màu đỏ.
- **3.7.2.4. Màn hình Đổ chuông Khóa màn hình (Native Incoming Call)**: Giao diện chuông cuộc gọi nền native trên điện thoại.
- **3.7.2.5. Chỉ định thiết bị âm thanh**: Chọn đàm thoại qua tai nghe Bluetooth, loa thoại hoặc loa ngoài.
- **3.7.2.6. Nhật ký chất lượng cuộc gọi**: Đánh giá chất lượng âm thanh 5 sao sau khi kết thúc cuộc đàm thoại.
- **3.7.2.7. Chặn cuộc gọi làm phiền**: Tùy chọn chỉ nhận cuộc gọi từ các hội viên trong danh bạ chính danh.
- **3.7.2.8. Màn hình Trợ lý Giọng nói Doanh nhân (Voice AI Dialog)**: Màn hình kích hoạt trợ lý AI với quả cầu sóng âm phát sáng ánh kim Warm Amber Gold chuyển động theo giọng nói tiếng Việt.

### 3.7.3. Mô tả chi tiết màn hình
#### 3.7.3.1. Màn hình Đàm thoại Đang kết nối (In-Call UI)
- Avatar đối tác hiển thị kích thước lớn trang trọng ở giữa màn hình kèm tên công ty và huy hiệu CEO 1983.
- Đồng hồ đếm thời gian đàm thoại độ chính xác từng giây. Các nút điều khiển cảm ứng kích thước lớn: [Tắt tiếng (Mute)], [Bật Loa Ngoài (Speaker)], [Bật/Tắt Camera Video], [Gác máy / Kết thúc] (Màu đỏ).

#### 3.7.3.2. Màn hình Trợ lý Giọng nói Doanh nhân (Voice AI)
| Thành phần giao diện | Loại điều khiển | Hành vi tương tác | Phản hồi của hệ thống |
| :--- | :--- | :--- | :--- |
| \`voiceButton\` | Nút micro nổi | Chạm giữ hoặc bấm 1 lần để nói | Quả cầu sóng âm bừng sáng màu vàng Amber Gold, lắng nghe giọng nói |
| \`speechRecognition\`| Bộ nhận diện giọng nói | Nói tiếng Việt tự nhiên | Chuyển giọng nói thành văn bản thời gian thực trên màn hình |
| \`aiResponse\` | Phản hồi trợ lý | Phát âm thanh giọng nữ lịch thiệp | Tự động điều hướng màn hình ngay tức thì theo yêu cầu |

- **Quy tắc điều hướng tức thời của Trợ lý Giọng nói (Voice AI Command Navigation)**:
  - *Khi người dùng nói: "Mở danh sách sự kiện" hoặc "Xem lịch đại hội"*:
    - Trợ lý AI lập tức đáp: *"Dạ, em đang mở danh sách sự kiện sắp tới cho anh/chị"* và **tự động chuyển hướng ngay sang màn hình Danh sách sự kiện** trong 0.2 giây.
  - *Khi người dùng nói: "Xem hội phí của tôi" hoặc "Hội phí năm nay"*:
    - Trợ lý AI tự động chuyển ngay sang màn hình Hóa đơn hội phí & Mã thanh toán VietQR Napas 24/7.
  - *Khi người dùng nói: "Tìm đối tác xây dựng"*:
    - Trợ lý AI tự động mở Sàn giao thương B2B và lọc sẵn từ khóa ngành nghề tương ứng.

#### 3.7.3.3. Màn hình Đổ chuông Màn hình khóa Native (Lock Screen Call)
- Khi máy bị khóa, chuông điện thoại vang to, màn hình sáng bừng hiển thị tên người gọi, chức vụ trong CLB và 2 nút trượt nghe / từ chối.

#### 3.7.3.4. Danh sách Lịch sử Cuộc gọi
- Phân loại rõ ràng: Cuộc gọi đến (Xanh), Cuộc gọi đi (Xanh lá), Cuộc gọi nhỡ (Đỏ) kèm nút gọi lại nhanh 1 chạm.

#### 3.7.3.5. Hộp thoại Đánh giá cuộc gọi
- Khảo sát 5 sao đánh giá độ nét của âm thanh và hình ảnh sau cuộc đàm thoại.

#### 3.7.3.6. Popup Chọn thiết bị âm thanh
- Chuyển đổi nhanh giữa tai nghe Bluetooth trên ô tô và loa điện thoại.

#### 3.7.3.7. Xem chi tiết Hồ sơ người gọi
- Bấm vào tên người gọi để xem lại toàn bộ lịch sử tin nhắn và lịch hẹn 1-on-1 trước đây.

### 3.7.4. Luồng nghiệp vụ
- **3.7.4.1. Khởi tạo cuộc đàm thoại nội bộ**: Chọn bạn đồng môn trong danh bạ -> Bấm nút Gọi thoại hoặc Gọi video.
- **3.7.4.2. Xử lý cuộc gọi đến ở chế độ nền**: Dịch vụ nền native đánh thức điện thoại, phát chuông cuộc gọi khẩn.
- **3.7.4.3. Kết thúc cuộc đàm thoại**: Khi một bên bấm nút Kết thúc màu đỏ, máy chủ lập tức giải phóng kênh truyền thông; đầu dây bên kia ngừng chuông và đóng màn hình cuộc gọi ngay tức thì (0ms trễ).
- **3.7.4.4. Ra lệnh bằng giọng nói (Voice AI)**: Bấm nút micro -> Ra lệnh -> Trợ lý tự động điều hướng màn hình.
- **3.7.4.5. Xem chi tiết cuộc gọi nhỡ**: Nhận thông báo cuộc gọi nhỡ và gọi lại cho đối tác.
- **3.7.4.6. Báo cáo chất lượng đàm thoại**: Gửi dữ liệu độ ổn định đường truyền về trung tâm kỹ thuật.

### 3.7.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.7.5.1. Khởi tạo tín hiệu cuộc gọi**: Gửi yêu cầu thiết lập cuộc gọi thoại/video tới người nhận.
- **3.7.5.2. Nhận tín hiệu trả lời cuộc gọi**: Kết nối luồng âm thanh/hình ảnh mã hóa đầu cuối.
- **3.7.5.3. Bắn tín hiệu ngắt cuộc gọi thời gian thực**: Phát tín hiệu kết thúc cuộc gọi tức thì tới cả hai thiết bị.
- **3.7.5.4. Đẩy thông báo cuộc gọi nền native**: Gửi tín hiệu thông báo ưu tiên cao qua dịch vụ thông báo nền của điện thoại.
- **3.7.5.5. Xử lý nhận dạng câu lệnh giọng nói (Voice AI)**: Phân tích ngữ nghĩa câu lệnh tiếng Việt và trả về đích điều hướng màn hình.
- **3.7.5.6. Lưu nhật ký cuộc đàm thoại**: Ghi vết thời gian bắt đầu, kết thúc và chất lượng kết nối.
- **3.7.5.7. Lấy danh sách cuộc gọi gần đây**: Trả về lịch sử cuộc gọi nội bộ phân trang.
- **3.7.5.8. Lấy cấu hình máy chủ thoại bảo mật**: Thiết lập thông số mã hóa bảo vệ bí mật kinh doanh.

---

## 3.8. Phân hệ Trung Tâm Thông Báo Đẩy Thời Gian Thực & Tin Tức Hiệp Hội

### 3.8.1. Thông tin chung
- **Mục tiêu**: Đảm bảo mọi hội viên không bao giờ bỏ lỡ các thông báo quan trọng, chỉ đạo công việc khẩn hoặc các cơ hội giao thương mới.
- **Kênh thông báo đa tầng**: Thông báo đẩy (Push Notification) hiển thị trên màn hình khóa, âm thanh chuông báo khẩn và danh sách thông báo phân loại trong ứng dụng.

### 3.8.2. Màn hình
- **3.8.2.1. Tìm kiếm thông báo**: Lọc theo phân loại: Thông báo nhiệm vụ, Thông báo tài chính, Thông báo sự kiện, Tin tức chung.
- **3.8.2.2. Danh sách thông báo**: Hiển thị icon phân loại, tiêu đề in đậm, nội dung trích yếu, thời gian nhận và dấu chấm đỏ báo chưa đọc.
- **3.8.2.3. Đánh dấu đã đọc tất cả**: Nút bấm 1 chạm làm sạch thông báo chưa đọc.
- **3.8.2.4. Thiết lập âm thanh chuông báo**: Tùy chỉnh bật/tắt âm thanh cho từng nhóm thông báo.
- **3.8.2.5. Xem chi tiết thông báo**: Chạm vào thông báo để chuyển hướng thẳng tới màn hình đích (sự kiện, việc cần làm, hóa đơn).

### 3.8.3. Mô tả chi tiết màn hình
#### 3.8.3.1. Phân loại thông báo
- Tab 1: Tất cả; Tab 2: Nhiệm vụ; Tab 3: Hội phí; Tab 4: Sự kiện & Vé mời.

#### 3.8.3.2. Cấu hình Nhận Thông Báo
| Tên cấu hình | Kiểu điều khiển | Mặc định | Tác dụng |
| :--- | :--- | :--- | :--- |
| \`allowPushNotification\`| Bật/Tắt | Bật | Nhận thông báo đẩy trên thanh trạng thái |
| \`soundCallUrgent\` | Bật/Tắt | Bật | Đổ chuông báo động cho nhiệm vụ khẩn cấp |
| \`vibrateMode\` | Bật/Tắt | Bật | Rung điện thoại khi có lời mời giao thương mới |

### 3.8.4. Luồng nghiệp vụ
- CRM phát hành thông báo -> Máy chủ gửi tín hiệu đẩy -> Điện thoại rung chuông -> Hội viên chạm mở xem chi tiết.

### 3.8.5. Đặc tả tương tác giao tiếp dữ liệu / API
- Lấy danh sách thông báo phân trang; Cập nhật trạng thái đã đọc; Đăng ký mã thiết bị nhận thông báo đẩy.

---

## 3.9. Phân hệ Hòm Thư Góp Ý & Tâm Thư Trực Tiếp Tới Ban Điều Hành

### 3.9.1. Thông tin chung
- **Mục tiêu**: Xây dựng kênh giao tiếp dân chủ, cởi mở và bảo mật giữa từng hội viên với Chủ tịch và Ban Điều Hành. Cho phép gửi sáng kiến phát triển hiệp hội hoặc phản ánh vướng mắc một cách trân trọng.
- **Bảo mật người gửi**: Cho phép tùy chọn gửi ẩn danh hoặc công khai danh tính.

### 3.9.2. Màn hình
- **3.9.2.1. Soạn thảo tâm thư / góp ý**: Biểu mẫu soạn thảo gồm: Chủ đề góp ý, Ban tiếp nhận (Chủ tịch, Ban Thành Viên, Ban Tài chính), Nội dung, Tệp đính kèm, Tùy chọn gửi ẩn danh.
- **3.9.2.2. Danh sách tâm thư đã gửi**: Theo dõi trạng thái tiếp nhận và phản hồi từ Ban Điều Hành.
- **3.9.2.3. Xem phản hồi từ Lãnh đạo**: Đọc thư hồi đáp chính thức từ Chủ tịch hoặc Tổng thư ký.

### 3.9.3. Mô tả chi tiết màn hình
#### 3.9.3.1. Biểu mẫu Gửi Tâm Thư Lãnh Đạo
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`feedbackTitle\` | Tiêu đề góp ý | Văn bản ngắn | Có | Rỗng | 10 - 200 ký tự | Tự động cắt khoảng trắng |
| \`targetBan\` | Kính gửi Ban lãnh đạo | Chọn một | Có | Chủ tịch & Ban Điều Hành| Chủ tịch, Ban Thành Viên, Ban Tài chính| Chọn ban tiếp nhận |
| \`feedbackContent\`| Nội dung tâm thư | Đoạn văn bản | Có | Rỗng | 20 - 3000 ký tự | Nêu rõ giải pháp, tâm tư |
| \`isAnonymous\` | Gửi dưới dạng ẩn danh | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Bảo vệ danh tính hội viên |

### 3.9.4. Luồng nghiệp vụ
- Hội viên soạn tâm thư -> Bấm gửi -> Chỉ có Chủ tịch và Thư ký được phân công mới có quyền đọc -> Gửi thư hồi đáp lại hội viên.

### 3.9.5. Đặc tả tương tác giao tiếp dữ liệu / API
- Gửi tâm thư bảo mật; Lấy lịch sử phản hồi; Cập nhật trạng thái đã xử lý.

---

# PHẦN 4: ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG ỨNG DỤNG DI ĐỘNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### 4.1. Yêu cầu về Hiệu năng & Trải nghiệm Cảm ứng (Mobile Performance)
1. **Thời gian khởi động ứng dụng (Cold Start Time)**: Dưới **1.5 giây** từ khi chạm vào biểu tượng ứng dụng đến khi hiển thị đầy đủ màn hình chính.
2. **Độ trễ phản hồi cảm ứng (Touch Latency)**: Dưới **0.1 giây** (100ms) cho mọi thao tác chạm, vuốt ngang, cuộn danh sách (Zero Jitter, không giật trễ khung hình, duy trì 60 FPS mượt mà).
3. **Mức tiêu hao tài nguyên pin & bộ nhớ**: Tối ưu hóa các tiến trình chạy ngầm; mức tiêu thụ pin dưới **3% cho 8 giờ hoạt động bình thường**; dung lượng RAM chiếm dụng dưới **150MB**.

### 4.2. Yêu cầu về An toàn thông tin & Bảo mật Di động (Mobile Security)
1. **Lưu trữ Cục bộ An toàn (Secure Enclave / Keychain Storage)**: Toàn bộ mã định danh phiên đăng nhập, khóa bảo mật sinh trắc học bắt buộc lưu trữ trong phân vùng phần cứng an toàn của điện thoại (iOS Keychain và Android EncryptedSharedPreferences).
2. **Xác thực Sinh trắc học Phần cứng (Hardware Biometric Auth)**: Xác thực FaceID/Vân tay thông qua API bảo mật trực tiếp của hệ điều hành; ứng dụng tuyệt đối không lưu trữ dữ liệu vân tay/khuôn mặt của người dùng.
3. **Mã hóa Toàn trình Cuộc gọi Thoại & Video**: Luồng âm thanh và hình ảnh đàm thoại nội bộ được mã hóa đầu cuối theo tiêu chuẩn bảo vệ bí mật kinh doanh cấp cao.

### 4.3. Yêu cầu về Dịch vụ Nền Native (Background Call & Notification Services)
1. **Dịch vụ Đổ chuông Màn hình khóa Native**: Tích hợp tầng Android ConnectionService và iOS CallKit đảm bảo khi có cuộc gọi khẩn cấp đến, điện thoại đổ vang chuông to và hiển thị giao diện trả lời ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
2. **Gác máy Tức thì Không Độ trễ (0ms Latency Hangup)**: Khi một bên gác máy hoặc từ chối cuộc gọi, hệ thống máy chủ lập tức giải phóng kênh và ra lệnh cho thiết bị bên kia dừng chuông và đóng modal ngay tức thì, triệt tiêu hoàn toàn lỗi chuông ảo tiếp tục đổ.

### 4.4. Yêu cầu về Tính sẵn sàng Ngoại tuyến (Offline-First Capability)
1. **Lưu trữ Danh bạ & Danh thiếp Ngoại tuyến**: Thông tin danh bạ hội viên đã kết nối và tấm danh thiếp số cá nhân được lưu trữ an toàn trong bộ nhớ máy, cho phép tra cứu và chạm thẻ chia sẻ ngay cả khi ở trên máy bay hoặc vùng mất sóng di động.
2. **Ví vé Sự kiện Ngoại tuyến**: Mã QR vé sự kiện và thông tin bàn tiệc VIP được lưu sẵn trong ví vé, sẵn sàng xuất trình check-in tại hội trường mà không phụ thuộc vào tốc độ mạng 4G.

### 4.5. Yêu cầu về Thiết kế Giao diện & Trải nghiệm Doanh nhân (Design & UX Standards)
1. **Bảng màu Nhận diện HanoiBA CEO 1983 Sang trọng**:
   - Sử dụng thống nhất: **Deep Cobalt Navy** kết hợp **Warm Amber Gold**.
   - Bo góc mềm mại, viền vàng kim loại và hiệu ứng rung phản hồi chân thực (Haptic Feedback) khi chạm thẻ thông minh.
2. **Quy tắc Tự động Cắt Khoảng Trắng (Auto-trim Whitespace)**: Toàn bộ ô nhập liệu tự động loại bỏ khoảng trắng thừa đầu cuối.
3. **Quy chuẩn Tiền tệ & Ngày tháng**: Hiển thị tiền tệ dấu chấm VNĐ và ngày tháng dd/mm/yyyy.

### 4.6. Yêu cầu về Khả năng tương thích Thiết bị (Device Compatibility)
1. **Hệ điều hành hỗ trợ**: Hoạt động ổn định trên iOS từ phiên bản 15.0 trở lên và Android từ phiên bản 10.0 (API Level 29) trở lên.
2. **Tối ưu hóa các dòng máy**: Thích ứng hoàn hảo với các dòng màn hình có tai thỏ (Notch), Dynamic Island trên iPhone và màn hình nốt ruồi trên Android.

---

# PHẦN 5: MA TRẬN TRUY VẾT & TIÊU CHUẨN NGHIỆM THU ỨNG DỤNG DI ĐỘNG

| Mã tiêu chí | Hạng mục kiểm tra | Tiêu chuẩn đạt nghiệm thu 100% |
| :--- | :--- | :--- |
| **AC-M01** | Toàn vẹn 9 phân hệ di động | 100% các phân hệ từ 3.1 đến 3.9 hoạt động mượt mà, chính xác theo kịch bản. |
| **AC-M02** | Chạm Thẻ thông minh 1 chạm | Đưa thẻ hoặc lưng điện thoại chạm nhẹ đối tác truyền tải hồ sơ tức thì dưới 1 giây mà đối tác không cần cài app. |
| **AC-M03** | Chuông báo nền native cuộc gọi | Đổ chuông màn hình khóa khi app đang đóng; gác máy tức thì 0ms độ trễ cả hai đầu. |
| **AC-M04** | Trợ lý giọng nói Voice AI | Nhận diện tiếng Việt tự nhiên và tự động điều hướng màn hình ngay tức thì. |
| **AC-M05** | Ví vé sự kiện & Check-in 0.1s | Mở vé cuống VIP tăng sáng màn hình; quét QR điểm danh tức thì tại bàn lễ tân. |
| **AC-M06** | Nhận diện thương hiệu & Ngôn ngữ | Chuẩn màu Deep Cobalt Navy & Warm Amber Gold; chuẩn hóa toàn diện phong cách hành văn quản trị hiệp hội sang trọng, không dùng các từ ngữ kỹ thuật khô khan. |
| **AC-M07** | Hiệu năng & Độ mượt cảm ứng | Khởi động dưới 1.5 giây; phản hồi cảm ứng dưới 0.1 giây không giật khung hình. |
| **AC-M08** | Không lỗi mã nguồn | Kiểm tra type check \`tsc --noEmit\` đạt Exit code 0 (0 errors). |

---
`;
}

module.exports = {
  getAppSrsMarkdown,
};
