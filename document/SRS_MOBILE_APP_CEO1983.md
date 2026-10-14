# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM ỨNG DỤNG DI ĐỘNG (SRS - MOBILE APP)
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
- **Tên miền truy cập Web App Mobile**: `https://ceo1983.viconnect.vn/`

*Tài liệu cam kết tuân thủ nghiêm ngặt quy định: Chuẩn hóa toàn bộ công nghệ kết nối hội viên bằng cụm từ chính thức: "Thẻ điện tử hội viên & Quét mã QR kết nối động", sử dụng văn phong quản trị hiệp hội sang trọng.*

---

# PHẦN 2: MÔ TẢ TỔNG QUAN KIẾN TRÚC DI ĐỘNG & ĐỒNG BỘ THỜI GIAN THỰC

### 2.1. Kiến trúc Cầu nối Di động Đa tầng (Hybrid Mobile Bridge)
Ứng dụng kết hợp sức mạnh của giao diện Web siêu mượt mà với tầng Cầu nối Hệ điều hành Native (Android Java / iOS Swift):
- **Tầng Giao diện Cảm ứng**: Tối ưu hóa phản hồi chạm vuốt dưới 0.1 giây, hiệu ứng kính mờ hoàng gia (Glassmorphism) và bảng màu chuẩn thương hiệu HanoiBA CEO 1983.
- **Tầng Dịch vụ Nền Native (Background Services)**: Tích hợp dịch vụ gọi điện hệ điều hành (Android ConnectionService và iOS CallKit) đảm bảo chuông cuộc gọi khẩn cấp đổ vang và hiện giao diện nhận cuộc gọi ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
- **Tầng Trợ Lý AI Chat Doanh Nhân (OpenRouter AI Assistant)**: Tích hợp trợ lý trí tuệ nhân tạo chuyên sâu thuần Chat (OpenRouter API - mô hình Gemini 2.0 Flash / GPT-4o Mini), giải đáp thông tin sự kiện, kết nối cơ hội giao thương B2B, tra cứu văn kiện và điều phối hội viên; loại bỏ hoàn toàn nhận diện giọng nói (Voice AI) và bảo đảm phân lập tuyệt đối chỉ phục vụ hội viên mobile, không can thiệp vào Web CRM.

### 2.2. Cơ chế Đồng bộ Hai Chiều với Web CRM
Mọi dữ liệu cá nhân, trạng thái hội phí, nhiệm vụ được giao và vé mời sự kiện đều được đồng bộ hai chiều liên tục với Cổng Quản trị CRM Hiệp hội. Nếu Quản trị viên thay đổi phân quyền của hội viên trên CRM, ứng dụng di động lập tức nhận diện và cập nhật thẩm quyền mà không làm gián đoạn phiên làm việc.

---

# PHẦN 3: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT TỪNG PHÂN HỆ DI ĐỘNG

## 3.1. Phân hệ Đăng Nhập Sinh Trắc Học & Thẻ Điện Tử Hội Viên 83

### 3.1.1. Thông tin chung
- **Mục tiêu**: Cung cấp giải pháp đăng nhập an toàn, tiện lợi và đẳng cấp cho doanh nhân. Cho phép đăng nhập tức thì thông qua Sinh trắc học vân tay / khuôn mặt (FaceID / Fingerprint), Số điện thoại chính danh kèm mã OTP, hoặc **Quét Mã QR Đăng Nhập Nhanh** trên Thẻ điện tử hội viên.
- **Cơ chế an toàn**: Bảo vệ tài khoản khỏi truy cập trái phép, tự động khóa phiên khi nhập sai mã quá số lần quy định.

### 3.1.2. Màn hình
- **3.1.2.1. Lựa chọn hình thức đăng nhập**: Màn hình chào mừng sang trọng Deep Cobalt Navy kết hợp viền vàng Warm Amber Gold, cho phép chọn phương thức xác thực.
- **3.1.2.2. Danh sách tài khoản đã ghi nhớ**: Danh sách các tài khoản doanh nhân đã lưu trên máy để đăng nhập nhanh.
- **3.1.2.3. Đăng ký tài khoản hội viên mới**: Biểu mẫu ứng tuyển kết nạp ban đầu cho chủ doanh nghiệp.
- **3.1.2.4. Đổi số điện thoại / Thiết lập FaceID**: Cập nhật phương thức bảo mật cá nhân.
- **3.1.2.5. Chỉ định người trợ giúp kích hoạt thẻ**: Nút gọi nhanh hotline hỗ trợ của Ban Thư Ký.
- **3.1.2.6. Lịch sử đăng nhập & Thiết bị**: Bảng kê khai các thiết bị đã từng truy cập tài khoản.
- **3.1.2.7. Đăng xuất an toàn**: Hộp thoại xác nhận đăng xuất và bảo mật dữ liệu lưu trong máy.
- **3.1.2.8. Màn hình Hướng dẫn Quét Mã QR Thẻ Điện Tử**: Hoạt ảnh quét mã QR sang trọng hướng dẫn sử dụng camera quét mã trên thẻ điện tử để đăng nhập trong 0.5 giây.

### 3.1.3. Mô tả chi tiết màn hình
#### 3.1.3.1. Màn hình Lựa chọn Phương thức Xác thực
- Logo câu lạc bộ CEO 1983 mạ vàng dập nổi chính giữa màn hình.
- 3 nút bấm kích thước lớn: [Sinh trắc học FaceID], [Quét Mã QR Đăng Nhập Nhanh], [Số điện thoại & OTP].

#### 3.1.3.2. Biểu mẫu Đăng nhập & Xác thực Bảo mật
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `loginMethod` | Phương thức đăng nhập | Chọn một | Có | Sinh trắc học | Sinh trắc học, Quét mã QR, Số điện thoại | Xem quy tắc giao diện động |
| `phoneNumber` | Số điện thoại chính danh | Số điện thoại | Có | Rỗng | 10 số (đầu số 03, 05, 07, 08, 09) | Kiểm tra số di động Việt Nam hợp lệ |
| `otpCode` | Mã xác thực bảo mật | Ký tự số | Có | Rỗng | 6 chữ số | Nhận qua tin nhắn SMS trong 60 giây |
| `smartCardUid`| Mã định danh thẻ điện tử | Ký tự an toàn | Không | Rỗng | Chuỗi mã hóa độc bản trên thẻ | Đọc tự động qua quét mã QR động |
| `isBiometricOn`| Kích hoạt FaceID/Vân tay| Bật/Tắt | Có | Bật | Bật hoặc Tắt | Lưu khóa bảo mật trong phân vùng an toàn |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phương thức đăng nhập" = "Quét mã QR"*:
    - Ứng dụng **kích hoạt camera quét mã QR bảo mật** của điện thoại.
    - Màn hình hiển thị khung ngắm quét mã màu vàng Amber Gold hướng dẫn: *"Vui lòng đưa camera quét mã QR định danh trên Thẻ điện tử hội viên CEO 1983..."*.
    - Khi nhận diện mã QR thành công, máy rung nhẹ 1 nhịp (Haptic feedback), tự động đối soát mã thẻ với máy chủ và chuyển thẳng vào màn hình chính sau 0.5 giây mà không cần nhập mật khẩu.
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
- Kiểm tra tính bảo mật của thiết bị và trạng thái chứng thực của thẻ điện tử hội viên.

### 3.1.4. Luồng nghiệp vụ
- **3.1.4.1. Lựa chọn phương thức xác thực**: Doanh nhân chọn Quét mã QR thẻ điện tử, FaceID hoặc OTP.
- **3.1.4.2. Lưu nháp thông tin ứng tuyển kết nạp**: Đăng ký thông tin ban đầu khi nộp đơn vào câu lạc bộ.
- **3.1.4.3. Xác thực & Đăng nhập chính thức**: Quét mã QR thẻ điện tử hoặc nhìn vào màn hình FaceID trong 0.5 giây.
- **3.1.4.4. Đăng xuất an toàn**: Đăng xuất tài khoản khỏi thiết bị.
- **3.1.4.5. Xem chi tiết phiên đăng nhập**: Kiểm tra các thiết bị đang đồng thời đăng nhập tài khoản.
- **3.1.4.6. Xuất nhật ký bảo mật**: Đồng bộ nhật ký an ninh lên máy chủ CRM.

### 3.1.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.1.5.1. Gửi yêu cầu xác thực thẻ điện tử**: Gửi chuỗi mã hóa đọc từ mã QR thẻ điện tử; Máy chủ xác minh tính hợp lệ và trả về thông tin đăng nhập.
- **3.1.5.2. Gửi mã OTP đăng nhập**: Gửi số điện thoại; Máy chủ kiểm tra danh bạ hội viên chính danh và gửi mã SMS OTP 6 số.
- **3.1.5.3. Xác thực mã OTP**: Gửi mã OTP; Máy chủ xác nhận và trả về mã phiên đăng nhập an toàn.
- **3.1.5.4. Kích hoạt liên kết thẻ điện tử mới**: Ghi nhận mã thẻ điện tử vào hồ sơ hội viên.
- **3.1.5.5. Cập nhật trạng thái sinh trắc học**: Đồng bộ trạng thái bảo mật của thiết bị.
- **3.1.5.6. Làm mới phiên đăng nhập (Refresh Session)**: Tự động duy trì phiên làm việc không bị gián đoạn.
- **3.1.5.7. Hủy phiên làm việc (Đăng xuất)**: Thu hồi mã truy cập trên máy chủ.
- **3.1.5.8. Lấy cấu hình phiên bản ứng dụng**: Kiểm tra phiên bản mới nhất trên Apple App Store và Google Play Store.

---

## 3.2. Phân hệ Danh Thiếp Số Quyền Năng & Thẻ Điện Tử Hội Viên 83

### 3.2.1. Thông tin chung
- **Mục tiêu**: Biến chiếc điện thoại di động và Thẻ điện tử hội viên 3D VIP mạ vàng thành công cụ kết nối giao thương quyền năng số 1. Chỉ cần một thao tác quét mã QR động cá nhân hóa hoặc gửi liên kết danh thiếp số sang điện thoại đối tác, toàn bộ hồ sơ năng lực doanh nghiệp, website, mã số thuế và thông tin liên hệ được truyền tải trọn vẹn tức thì mà đối tác không cần cài đặt ứng dụng.
- **Chuẩn hóa công nghệ kết nối động**: Tích hợp mã QR định danh động chống sao chép và liên kết web doanh nhân số độc bản.

### 3.2.2. Màn hình
- **3.2.2.1. Tìm kiếm mẫu danh thiếp**: Xem trước các phong cách thiết kế danh thiếp doanh nhân sang trọng (Vàng Ánh Kim, Xanh Hoàng Gia, Đen Doanh Nhân).
- **3.2.2.2. Danh sách danh thiếp đã lưu**: Sổ lưu danh thiếp điện tử của các đối tác đã kết nối giao thương.
- **3.2.2.3. Màn hình Trình diễn Danh thiếp Số 3D**: Tấm danh thiếp điện tử 3D chuyển động mượt mà theo góc nghiêng của điện thoại (hiệu ứng con quay hồi chuyển Gyroscope).
- **3.2.2.4. Chỉnh sửa thông tin danh thiếp**: Cập nhật khẩu hiệu kinh doanh, liên kết mạng xã hội (LinkedIn, Zalo, Website).
- **3.2.2.5. Chỉ định thông tin ưu tiên chia sẻ**: Chọn những thông tin được phép công khai khi kết nối với đối tác mới.
- **3.2.2.6. Lịch sử kết nối & Quét mã**: Thống kê số lượt đối tác đã quét mã xem danh thiếp của doanh nhân.
- **3.2.2.7. Tạm khóa thẻ điện tử**: Chức năng tạm khóa mã QR danh thiếp nếu hội viên có nhu cầu bảo mật riêng tư.
- **3.2.2.8. Màn hình Chia Sẻ Mã QR Động 1 Chạm**: Màn hình hiển thị mã QR động sẵn sàng quét tức thì sang điện thoại đối tác.

### 3.2.3. Mô tả chi tiết màn hình
#### 3.2.3.1. Màn hình Trình diễn Danh thiếp Số 3D
- Hiển thị mô phỏng Thẻ điện tử hội viên 3D VIP mạ vàng Warm Amber Gold với logo CEO 1983 và họ tên doanh nhân dập nổi.
- Khi nghiêng điện thoại, ánh kim trên thẻ phản chiếu chuyển động chân thực.
- 2 nút bấm nổi bật: *[Quét Mã QR Kết Nối]* và *[Lưu Vào Danh Bạ Điện Thoại (.vcf)]*.

#### 3.2.3.2. Biểu mẫu Tùy biến Nội dung Danh thiếp
| Tên trường | Nhãn hiển thị | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Dải giá trị cho phép | Quy tắc kiểm tra (Validation) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `cardTheme` | Phong cách thiết kế thẻ| Chọn một | Có | Vàng Kim HanoiBA | Vàng Kim, Xanh Hoàng Gia, Đen Titan | Xem quy tắc giao diện động |
| `businessSlogan`| Khẩu hiệu kinh doanh | Văn bản ngắn | Có | Rỗng | 10 - 150 ký tự | Tự động cắt khoảng trắng thừa |
| `companyWebsite`| Trang thông tin công ty | Đường dẫn web | Có | Rỗng | Đường dẫn https:// hợp lệ | Kiểm tra định dạng website |
| `zaloLink` | Liên kết Zalo Official | Số điện thoại | Có | Số điện thoại chính | 10 số | Liên kết chat nhanh Zalo |
| `showTaxId` | Hiển thị Mã số thuế | Bật/Tắt | Có | Bật | Bật hoặc Tắt | Minh bạch hồ sơ pháp nhân |
| `showFinanceReport`| Hiển thị Hồ sơ năng lực | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Xem quy tắc giao diện động |
| `privacyMode` | Mức độ riêng tư | Chọn một | Có | Công khai cho hội viên| Công khai toàn bộ, Chỉ hội viên CEO1983| Xem quy tắc giao diện động |

- **Hành vi tương tác giao diện động theo giá trị chọn (Select-State UI Dependencies)**:
  - *Khi chọn "Phong cách thiết kế thẻ" = "Vàng Kim HanoiBA"*:
    - Thẻ danh thiếp đổi sang tông màu Deep Cobalt Navy kết hợp viền hoa văn vàng mạ Warm Amber Gold sang trọng.
  - *Khi chọn "Mức độ riêng tư" = "Chỉ hội viên CEO1983"*:
    - Hệ thống **tự động ẩn số điện thoại cá nhân** khi người xem danh thiếp là khách bên ngoài câu lạc bộ; chỉ hiển thị địa chỉ email và trang web công ty.
  - *Khi bật "Hiển thị Hồ sơ năng lực"* = Bật:
    - Ứng dụng **hiển thị thêm nút bấm**: *[Tải lên Profile Công ty (PDF)]* (tối đa 20MB).

#### 3.2.3.3. Danh sách Đối tác đã kết nối lưu về máy
- Sổ danh thiếp số hiển thị avatar đối tác, công ty, thời gian và địa điểm kết nối.

#### 3.2.3.4. Lịch sử tương tác thẻ
- Biểu đồ thống kê: Lượt quét mã QR trong tháng, số đối tác đã lưu thông tin vào danh bạ máy.

#### 3.2.3.5. Hộp thoại Khóa mã thẻ khẩn cấp
- Cảnh báo vô hiệu hóa mã QR thẻ điện tử khi cần bảo mật riêng tư.

#### 3.2.3.6. Popup Chọn nhóm đối tác phân loại
- Gắn nhãn đối tác vừa kết nối: Khách hàng tiềm năng, Nhà cung cấp, Bạn đồng môn 1983.

#### 3.2.3.7. Xem chi tiết danh thiếp đối tác
- Xem đầy đủ hồ sơ năng lực và các sản phẩm đối tác đang kinh doanh trên sàn B2B.

### 3.2.4. Luồng nghiệp vụ
- **3.2.4.1. Mở danh thiếp số**: Mở ứng dụng di động -> Tấm danh thiếp 3D sẵn sàng chia sẻ.
- **3.2.4.2. Lưu nháp chỉnh sửa danh thiếp**: Nhập tài khoản mạng xã hội mới để xem trước hiển thị.
- **3.2.4.3. Kích hoạt Quét Mã QR Kết Nối Động**: Mở mã QR động trên ứng dụng -> Đối tác dùng camera điện thoại quét mã -> Màn hình điện thoại đối tác tự động bật trang danh thiếp đầy đủ.
- **3.2.4.4. Tạm khóa mã thẻ**: Khóa mã QR chia sẻ khi có yêu cầu bảo mật.
- **3.2.4.5. Xem chi tiết thông tin đối tác**: Lưu đối tác vào danh bạ điện thoại bằng 1 chạm (.vcf).
- **3.2.4.6. Đồng bộ danh bạ hội viên**: Tự động cập nhật danh bạ các doanh nhân mới kết nạp vào máy.

### 3.2.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.2.5.1. Lấy dữ liệu danh thiếp số cá nhân**: Trả về toàn bộ thông tin cá nhân, doanh nghiệp và liên kết mạng xã hội.
- **3.2.5.2. Sinh mã QR định danh động**: Sinh mã bảo mật thay đổi theo từng phút.
- **3.2.5.3. Cập nhật nội dung danh thiếp**: Lưu thông tin chỉnh sửa và đồng bộ tức thì lên đám mây.
- **3.2.5.4. Ghi nhận lượt quét mã kết nối**: Ghi vết thời gian và mã thiết bị kết nối phục vụ báo cáo giao thương.
- **3.2.5.5. Tải tệp danh bạ điện tử (.vcf)**: Trả về tệp danh bạ chuẩn vCard để lưu thẳng vào bộ nhớ máy điện thoại.
- **3.2.5.6. Khóa / Mở khóa mã thẻ điện tử**: Cập nhật trạng thái an toàn của mã thẻ trên máy chủ.
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
| `completionRate`| Tỷ lệ hoàn thành (%) | Thanh trượt số | Có | 100% | 1% đến 100% | Kéo thanh trượt cảm ứng mượt mà |
| `progressNotes` | Báo cáo chi tiết kết quả| Đoạn văn bản | Có | Rỗng | 10 - 1000 ký tự | Ghi rõ kết quả công việc đạt được |
| `cameraPhotos` | Ảnh chụp hiện trường | Chụp ảnh camera | Không | Rỗng | Tối đa 5 ảnh chụp trực tiếp từ camera máy | Khuyến khích chụp sản phẩm nghiệm thu |
| `attachedDocs` | Tệp kết quả đính kèm | Tải lên tệp | Không | Rỗng | Tệp Word, Excel, PDF (tối đa 25MB) | Cho phép chọn tệp từ bộ nhớ máy |
| `requestAccept`| Đề nghị nghiệm thu chính thức| Bật/Tắt | Có | Bật | Bật hoặc Tắt | Xem quy tắc giao diện động |

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
| `productTitle` | Tên sản phẩm / Dịch vụ | Văn bản ngắn | Có | Rỗng | 5 - 150 ký tự | Tự động cắt khoảng trắng thừa |
| `industryId` | Nhóm ngành nghề | Chọn một | Có | Xây dựng - Vật liệu | 12 nhóm ngành chính thức | Bắt buộc chọn đúng ngành |
| `regularPrice` | Giá niêm yết thị trường | Số tiền tệ | Có | 0 | 0 đến 50 tỷ VNĐ | Nhập số tiền VNĐ |
| `memberPrice` | Giá đặc quyền cho hội viên| Số tiền tệ | Có | 0 | Phải nhỏ hơn giá thị trường | Xem quy tắc giao diện động |
| `minOrderQty` | Số lượng đặt hàng tối thiểu| Văn bản ngắn | Có | 1 | Tối đa 50 ký tự | Ví dụ: 10 cái, 1 container |
| `productPhotos`| Ảnh chụp sản phẩm | Chụp ảnh camera | Có | Rỗng | Tối thiểu 1 ảnh, tối đa 8 ảnh | Chụp sản phẩm rõ nét |
| `warrantyTerm` | Thời hạn bảo hành / Hỗ trợ| Văn bản ngắn | Không | 12 tháng | Tối đa 100 ký tự | Cam kết uy tín doanh nhân |

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
| `partnerId` | Doanh nhân đối tác | Chọn một | Có | Đã chọn trước | Danh sách hội viên chính danh | Bắt buộc chọn đúng hội viên |
| `meetingSubject`| Chủ đề kết nối giao thương| Văn bản ngắn | Có | Cà phê giao thương 1-on-1 | 5 - 150 ký tự | Nêu rõ mục tiêu hợp tác |
| `appointmentDate`| Ngày hẹn gặp | Ngày tháng | Có | Ngày mai | Từ ngày mai trở đi | Không hẹn ngày trong quá khứ |
| `timeSlot` | Khung giờ hẹn | Chọn một | Có | 09:00 - 10:30 | 08:00 - 11:30, 14:00 - 17:00 | Chọn khung giờ hành chính |
| `meetingVenue` | Địa điểm gặp gỡ | Văn bản ngắn | Có | Trụ sở Hiệp hội HanoiBA | Tối đa 250 ký tự | Ghi rõ tên quán cà phê/địa chỉ |
| `cooperateField`| Lĩnh vực mong muốn hợp tác| Chọn một | Có | Kết nối kinh doanh | Mua bán hàng hóa, Đầu tư, Tư vấn | Xem quy tắc giao diện động |

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
| `eventId` | Sự kiện tham gia | Chọn một | Có | Đã chọn trước | Danh sách sự kiện mở đăng ký | Bắt buộc chọn sự kiện hợp lệ |
| `delegateName` | Họ và tên đại biểu | Văn bản ngắn | Có | Họ tên doanh nhân | 2 - 100 ký tự | Tự động điền tên hội viên |
| `ticketClass` | Hạng vé tham dự | Chọn một | Có | Đại biểu VIP | Đại biểu VIP, Đại biểu Tiêu chuẩn | Xem quy tắc giao diện động |
| `hasGuest` | Đăng ký khách mời kèm | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Xem quy tắc giao diện động |
| `guestName` | Họ tên khách mời | Văn bản ngắn | Không | Rỗng | 2 - 100 ký tự | Bắt buộc nếu bật đăng ký kèm |
| `guestCompany` | Doanh nghiệp khách mời | Văn bản ngắn | Không | Rỗng | Tối đa 200 ký tự | Bắt buộc nếu có khách kèm |
| `dietNotes` | Lưu ý tiệc chiêu đãi | Chọn một | Không | Tiệc mặn tiêu chuẩn | Tiệc mặn, Tiệc chay, Dị ứng đồ biển | Phục vụ ẩm thực chu đáo |

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
- **3.6.4.1. Đăng ký vé sự kiện & Kiểm tra sức chứa**: 
  - Chọn sự kiện -> Hệ thống kiểm tra số lượng đại biểu đã đăng ký so với sức chứa tối đa (`capacity > 0 && registeredCount >= capacity`).
  - Nếu đã đủ số lượng (hết chỗ): Khóa toàn bộ form, thay nút đăng ký bằng badge "Đã đủ số lượng đại biểu (Hết chỗ)" kèm biểu tượng khóa, ném lỗi máy chủ chặn hoàn toàn hành vi gửi đơn đăng ký.
  - Nếu còn chỗ: Mở modal đăng ký có cấu trúc cuộn chuẩn di động (Header cố định, Body cuộn mượt độc lập `touch-pan-y`, Footer cố định đáy màn hình `pb-[max(0.75rem,env(safe-area-inset-bottom))]` đảm bảo nút bấm xác nhận luôn hiển thị rõ ràng và người dùng cuộn mượt mà không bị kẹt).
- **3.6.4.2. Lưu nháp đăng ký vé**: Điền thông tin khách mời lưu tạm.
- **3.6.4.3. Xuất vé chính thức**: Phân bổ bàn tiệc VIP và sinh mã QR định danh duy nhất.
- **3.6.4.4. Hủy vé tham dự**: Hủy đăng ký vé trước 24 giờ.
- **3.6.4.5. Điểm danh cổng 0.1 giây & Phân quyền Soát vé Chặt chẽ**: 
  - Đưa mã QR cuống vé trước camera lễ tân để hoàn tất điểm danh.
  - Phân quyền Quét mã QR: Tiện ích "Quét mã QR Check-in sự kiện" trên app mobile CHỈ HIỂN THỊ cho hội viên thuộc Ban Truyền Thông (hoặc Ban Điều Hành / Admin) VÀ ĐỒNG THỜI đã được ban tổ chức chọn vào danh sách người soát vé (`qrScanners` / `qrStaff`) của sự kiện đó. Các hội viên khác không nhìn thấy tính năng soát vé để bảo đảm tính an ninh trật tự.
- **3.6.4.6. Sơ đồ xếp chỗ rạp chiếu tinh gọn**: Giao diện sơ đồ ghế rạp chiếu phim tinh gọn, sang trọng. Toàn bộ ghế đã được xếp chỗ hiển thị trực tiếp mã ghế và TÊN người ngồi ngay trên mặt ghế, kèm danh bạ tìm kiếm nhanh đại biểu và vị trí ngồi bên dưới.
- **3.6.4.7. Tham gia quay số may mắn**: Hệ thống tự động đưa mã vé đã check-in vào lồng quay số trúng thưởng.

### 3.6.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.6.5.1. Lấy danh sách sự kiện mở đăng ký**: Trả về các sự kiện sắp diễn ra kèm số vé còn lại, chỉ số `capacity`, `registeredCount`, `isFull: capacity > 0 && registeredCount >= capacity` và danh sách cán bộ quét mã `qrScanners`.
- **3.6.5.2. Lấy chi tiết cuống vé và mã QR**: Tải thông tin cuống vé, vị trí bàn tiệc và mã QR mã hóa an toàn.
- **3.6.5.3. Đăng ký vé sự kiện chính thức**: Gửi thông tin đăng ký; Máy chủ kiểm tra nghiêm ngặt `capacity > 0 && registeredCount >= capacity`, nếu đã đầy sẽ ném ngoại lệ `BadRequestException('Sự kiện đã đủ số lượng đại biểu đăng ký (Hết chỗ)')`.
- **3.6.5.4. Lưu nháp đăng ký vé**: Lưu thông tin đăng ký dự thảo.
- **3.6.5.5. Cập nhật trạng thái điểm danh**: Nhận tín hiệu xác nhận đã vào cửa từ bàn lễ tân.
- **3.6.5.6. Đổi vị trí chỗ ngồi**: Gửi yêu cầu chuyển bàn tiệc hoặc ghế rạp chiếu.
- **3.6.5.7. Hủy vé sự kiện**: Hủy vé và trả lại chỗ trống cho khán phòng.
- **3.6.5.8. Lấy danh sách trúng thưởng Lucky Draw**: Nhận thông báo trúng thưởng từ ban tổ chức.

---

## 3.7. Phân hệ Đàm Thoại Nội Bộ Bảo Mật, Cuộc Gọi Nền Native & Trợ Lý AI Chat Doanh Nhân (OpenRouter AI Assistant)

### 3.7.1. Thông tin chung
- **Mục tiêu**: Cung cấp kênh liên lạc đặc quyền, bảo mật tuyệt đối dành riêng cho các chủ doanh nghiệp CEO 1983. Hỗ trợ đàm thoại thoại (Voice call) và đàm thoại video (Video call) chất lượng cao chuẩn HD, mã hóa đầu cuối bảo vệ bí mật kinh doanh.
- **Dịch vụ thông báo cuộc gọi nền native trên điện thoại**:
  - Khi có cuộc gọi đến, chuông điện thoại đổ vang và hiện giao diện cuộc gọi với 2 nút "Nghe" / "Từ chối" ngay trên màn hình khóa kể cả khi ứng dụng đang đóng hoàn toàn.
  - Kết thúc cuộc gọi tức thì ở cả hai đầu khi một bên gác máy (0ms trễ), không để chuông ảo đổ tiếp.
- **Trợ lý AI Chat Doanh nhân (OpenRouter AI Assistant)**: 
  - Chatbot trí tuệ nhân tạo chuyên sâu tích hợp trực tiếp trên ứng dụng di động, kết nối OpenRouter API (`google/gemini-2.0-flash-001`, fallback `openai/gpt-4o-mini`).
  - Nắm giữ toàn bộ tri thức thời gian thực về hồ sơ hội viên, danh sách ban chuyên môn, sự kiện sắp diễn ra và cơ hội giao thương B2B.
  - Loại bỏ hoàn toàn nhận diện giọng nói (Voice AI / Speech recognition / Speech synthesis / Voice HUD) để bảo đảm bảo mật tối đa và trải nghiệm văn bản tập trung.
  - Phân vùng hoạt động nghiêm ngặt: Chỉ hoạt động trên Ứng dụng Di động hội viên (`/association/*`, `/m/*`); TUYỆT ĐỐI KHÔNG xuất hiện trên Web CRM.

### 3.7.2. Màn hình
- **3.7.2.1. Tìm kiếm hội viên để đàm thoại**: Tìm nhanh bạn đồng môn theo tên hoặc số điện thoại trong danh bạ nội bộ.
- **3.7.2.2. Lịch sử cuộc gọi nội bộ**: Danh sách các cuộc gọi đi, cuộc gọi đến và cuộc gọi nhỡ kèm thời lượng đàm thoại.
- **3.7.2.3. Màn hình Đàm thoại Thoại / Video (Active Call)**: Giao diện đàm thoại toàn màn hình sang trọng Deep Cobalt Navy, hiển thị ảnh đại diện doanh nhân, thời gian kết nối, nút Bật/Tắt Mic, Bật/Tắt Camera, Chuyển loa ngoài và nút Kết thúc cuộc gọi màu đỏ.
- **3.7.2.4. Màn hình Đổ chuông Khóa màn hình (Native Incoming Call)**: Giao diện chuông cuộc gọi nền native trên điện thoại.
- **3.7.2.5. Chỉ định thiết bị âm thanh**: Chọn đàm thoại qua tai nghe Bluetooth, loa thoại hoặc loa ngoài.
- **3.7.2.6. Nhật ký chất lượng cuộc gọi**: Đánh giá chất lượng âm thanh 5 sao sau khi kết thúc cuộc đàm thoại.
- **3.7.2.7. Chặn cuộc gọi làm phiền**: Tùy chọn chỉ nhận cuộc gọi từ các hội viên trong danh bạ chính danh.
- **3.7.2.8. Màn hình Trợ lý AI Chat Doanh nhân (Ceo1983ChatAssistant Drawer)**: Giao diện trò chuyện tương tác trực tuyến với trợ lý AI, hiển thị câu hỏi gợi ý nhanh, lịch sử hội thoại và bong bóng câu trả lời định dạng markdown chuẩn mực.

### 3.7.3. Mô tả chi tiết màn hình
#### 3.7.3.1. Màn hình Đàm thoại Đang kết nối (In-Call UI)
- Avatar đối tác hiển thị kích thước lớn trang trọng ở giữa màn hình kèm tên công ty và huy hiệu CEO 1983.
- Đồng hồ đếm thời gian đàm thoại độ chính xác từng giây. Các nút điều khiển cảm ứng kích thước lớn: [Tắt tiếng (Mute)], [Bật Loa Ngoài (Speaker)], [Bật/Tắt Camera Video], [Gác máy / Kết thúc] (Màu đỏ).

#### 3.7.3.2. Màn hình Trợ lý AI Chat Doanh nhân (OpenRouter Chat Assistant)
| Thành phần giao diện | Loại điều khiển | Hành vi tương tác | Phản hồi của hệ thống |
| :--- | :--- | :--- | :--- |
| `aiChatButton` | Nút bong bóng AI nổi | Chạm mở cửa sổ chat trợ lý | Hiển thị giao diện Drawer chat trợ lý doanh nhân sang trọng |
| `chatInput` | Ô nhập tin nhắn văn bản | Gõ câu hỏi hoặc chọn câu gợi ý | Hiển thị tin nhắn gửi đi với huy hiệu hội viên chính danh |
| `aiResponseBubble` | Bong bóng câu trả lời AI | Đọc phản hồi định dạng đẹp | Phản hồi chi tiết sự kiện, ban ngành, đối tác trong 1-2 giây |
| `quickPromptChips` | Thẻ câu hỏi nhanh | Chạm vào câu hỏi mẫu | Tự động gửi câu hỏi: "Sự kiện sắp tới?", "Cơ hội giao thương mới?" |

- **Quy tắc phản hồi & phân vùng của Trợ lý AI Chat**:
  - *Khi hội viên hỏi về sự kiện*: Trợ lý AI trích xuất danh sách sự kiện sắp diễn ra gần nhất kèm thời gian, địa điểm và đường dẫn đăng ký vé.
  - *Khi hội viên hỏi về cơ hội giao thương*: AI tổng hợp các nhu cầu mua bán, khớp nối B2B mới nhất của các doanh nghiệp trong hiệp hội.
  - *Khi hội viên hỏi về cơ cấu tổ chức*: AI giải thích rõ ràng chức năng nhiệm vụ của 7 Ban Chuyên Môn và hướng dẫn liên hệ đầu mối phụ trách.
  - *Bảo đảm phân lập*: Tuyệt đối không nhúng trợ lý AI vào các trang điều hành quản trị CRM.

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
- **3.7.4.4. Tương tác với Trợ lý AI Chat**: Bấm nút trợ lý AI nổi góc phải -> Nhập câu hỏi hoặc chọn gợi ý -> Trợ lý phản hồi thông minh dựa trên dữ liệu hiệp hội.
- **3.7.4.5. Xem chi tiết cuộc gọi nhỡ**: Nhận thông báo cuộc gọi nhỡ và gọi lại cho đối tác.
- **3.7.4.6. Báo cáo chất lượng đàm thoại**: Gửi dữ liệu độ ổn định đường truyền về trung tâm kỹ thuật.

### 3.7.5. Đặc tả tương tác giao tiếp dữ liệu / API
- **3.7.5.1. Khởi tạo tín hiệu cuộc gọi**: Gửi yêu cầu thiết lập cuộc gọi thoại/video tới người nhận.
- **3.7.5.2. Nhận tín hiệu trả lời cuộc gọi**: Kết nối luồng âm thanh/hình ảnh mã hóa đầu cuối.
- **3.7.5.3. Bắn tín hiệu ngắt cuộc gọi thời gian thực**: Phát tín hiệu kết thúc cuộc gọi tức thì tới cả hai thiết bị.
- **3.7.5.4. Đẩy thông báo cuộc gọi nền native**: Gửi tín hiệu thông báo ưu tiên cao qua dịch vụ thông báo nền của điện thoại.
- **3.7.5.5. Xử lý truy vấn Trợ lý AI (OpenRouter API)**: Gửi prompt ngữ cảnh hội viên tới OpenRouter endpoint (`google/gemini-2.0-flash-001`), nhận phản hồi streaming hoặc kết quả văn bản tức thời.
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
| `allowPushNotification`| Bật/Tắt | Bật | Nhận thông báo đẩy trên thanh trạng thái |
| `soundCallUrgent` | Bật/Tắt | Bật | Đổ chuông báo động cho nhiệm vụ khẩn cấp |
| `vibrateMode` | Bật/Tắt | Bật | Rung điện thoại khi có lời mời giao thương mới |

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
| `feedbackTitle` | Tiêu đề góp ý | Văn bản ngắn | Có | Rỗng | 10 - 200 ký tự | Tự động cắt khoảng trắng |
| `targetBan` | Kính gửi Ban lãnh đạo | Chọn một | Có | Chủ tịch & Ban Điều Hành| Chủ tịch, Ban Thành Viên, Ban Tài chính| Chọn ban tiếp nhận |
| `feedbackContent`| Nội dung tâm thư | Đoạn văn bản | Có | Rỗng | 20 - 3000 ký tự | Nêu rõ giải pháp, tâm tư |
| `isAnonymous` | Gửi dưới dạng ẩn danh | Bật/Tắt | Có | Tắt | Bật hoặc Tắt | Bảo vệ danh tính hội viên |

### 3.9.4. Luồng nghiệp vụ
- Hội viên soạn tâm thư -> Bấm gửi -> Chỉ có Chủ tịch và Thư ký được phân công mới có quyền đọc -> Gửi thư hồi đáp lại hội viên.

### 3.9.5. Đặc tả tương tác giao tiếp dữ liệu / API
- Gửi tâm thư bảo mật; Lấy lịch sử phản hồi; Cập nhật trạng thái đã xử lý.

---

## 3.10. Phân hệ Nâng cấp & Hoàn thiện Nghiệp vụ Ứng dụng Di động (Sprint 2026-10)

### 3.10.1. UC-MOB-MKT-01: Tính Toán & Hiển Thị Thống Kê Tổng Giá Trị & Số Lượng Marketplace B2B
- **Mục tiêu**: Hiển thị chính xác tổng số lượng sản phẩm đang giao thương và tổng giá trị hàng hóa niêm yết trên gian hàng B2B của hiệp hội tại màn hình Marketplace di động.
- **Màn hình**: `/association/products`.
- **Tác nhân**: Doanh nhân hội viên, Ban Xúc tiến Thương mại.
- **Luồng sự kiện chính**:
  1. Hội viên mở tab "Gian hàng B2B" trên ứng dụng di động.
  2. Hệ thống gọi API lấy danh sách sản phẩm gian hàng: `GET /b2b-products/public` (hoặc `GET /b2b-products/my-products`).
  3. Giao diện thực hiện tổng hợp dữ liệu thời gian thực:
     - **Tổng số lượng sản phẩm**: `products.length` (hoặc tổng `quantity`/`stock` của từng sản phẩm nếu có quản lý tồn kho).
     - **Tổng giá trị thị trường**: Tổng `(price * stock)` hoặc tổng giá trị niêm yết của tất cả mặt hàng, định dạng phân tách hàng nghìn VNĐ rõ ràng (ví dụ: `15.850.000.000 VNĐ`).
     - Hiển thị nổi bật trên 2 thẻ chỉ số thống kê đầu trang, giải quyết triệt để lỗi hiển thị trống, NaN hoặc 0đ.
- **Đặc tả API**:
  - `GET /b2b-products/public?association_id=c1983000-0000-4000-8000-000000001983`: Lấy danh sách sản phẩm gian hàng kèm giá bán (`price`), tồn kho (`stock`), hình ảnh và doanh nghiệp sở hữu.
- **CSDL & Bảng liên kết**:
  - Bảng `public.b2b_products` JOIN `public.organizations` ON `organizations.id = b2b_products.organization_id`.

### 3.10.2. UC-MOB-QRC-02: Chuẩn Hóa Mẫu Vé Điện Tử Check-in & Phân Quyền Nút Quét QR Footer Theo Danh Sách Cán Bộ CRM
- **Mục tiêu**: Đồng bộ thiết kế cuống vé điện tử sự kiện theo chuẩn giao diện VIP (Ảnh 2/3); đồng thời phân quyền bảo mật tuyệt đối cho nút quét mã QR Check-in ở thanh Footer điều hướng (`MemberShell.tsx`), chỉ hiển thị nút này khi tài khoản được Admin tick chọn ủy quyền soát vé tại CRM sự kiện.
- **Màn hình**:
  - Cuống vé sự kiện của hội viên / khách mời: Modal/Trang chi tiết vé sự kiện.
  - Thanh Footer chính của App Mobile (`MemberShell.tsx`).
- **Tác nhân**: Đại biểu tham dự sự kiện, Cán bộ được phân công soát vé sự kiện.
- **Luồng sự kiện chính**:
  1. **Hiển thị Vé Điện Tử & Thẻ Check-in Sự Kiện Chuẩn**:
     - Khi hội viên bấm "Xem vé của tôi" hoặc quét vé, giao diện hiển thị thẻ vé điện tử sang trọng (Khung Deep Cobalt Navy bo góc, viền Warm Amber Gold):
       - Tiêu đề: *VÉ THAM DỰ SỰ KIỆN CHÍNH THỨC* / *VIP EVENT PASS 2026*.
       - Tên sự kiện & Địa điểm tổ chức.
       - Khung mã QR độ nét cao trung tâm, bên dưới hiển thị mã vé: `REG-EV-xxxx` (Ví dụ: `REG-EV-MV7E3`).
       - Thông tin đại biểu: Họ tên, Chức vụ hiệp hội, Tên doanh nghiệp, Thời gian diễn ra sự kiện, Hạng vé.
       - Khung vị trí bàn tiệc (Hệ thống xếp tự động): `Bàn VIP xx - Ghế xx`.
       - Số may mắn (Quay thưởng Lucky Draw): `#xxxx` (nổi bật trên nền vàng hổ phách).
       - Khung lưu ý chỗ ngồi và xuất trình mã QR cho Ban Lễ tân tại hội trường.
  2. **Chuẩn Hóa Nút QR Trung Tâm Thanh Footer (`MemberShell.tsx`)**:
     - *Giao diện Nút QR*: Nút tròn nổi chính giữa thanh điều hướng thiết kế hiệu ứng Gradient Navy `#003B95` kết hợp viền mạ vàng và hào quang phát sáng. TUYỆT ĐỐI KHÔNG để nhãn text "Thẻ 83" bên dưới nút để đảm bảo thẩm mỹ tối giản, sang trọng.
     - *Hành vi khi bấm*: Bấm vào nút QR trung tâm lập tức mở Modal Mã QR định danh & Quét mã QR (`AssociationMemberQrModal`) với 2 tab: "Mã QR của tôi" (hiển thị mã QR hội viên kèm chia sẻ danh thiếp) và "Quét QR" (kích hoạt camera quét đối tác hoặc tải ảnh QR từ máy). Đồng thời điều hướng nền về `/association/card`.
     - *Hành vi khi đóng modal*: Khi người dùng bấm nút "X" trên góc modal, modal đóng lại và màn hình hiển thị trực tiếp giao diện Thẻ hội viên 3D & Danh thiếp số điện tử (`/association/card`) chuẩn mặc định.
     - *Phân quyền Quét QR Check-in Sự Kiện*: Khi tài khoản được phân quyền soát vé sự kiện (nằm trong `qr_staff_ids`), hệ thống tự động kích hoạt tính năng chuyển sang chế độ quét vé đón tiếp đại biểu.
- **Đặc tả API**:
  - `GET /events/:id/my-ticket`: Lấy vé sự kiện của người dùng đăng nhập kèm mã vé, QR, bàn tiệc, số quay thưởng.
  - `GET /events/checkin-permission`: Trả về quyền hạn soát vé của tài khoản (`{ canScan: boolean, activeEventId?: string }`) dựa trên danh sách `qr_staff_ids` của sự kiện đang mở.
- **CSDL & Bảng liên kết**:
  - `public.events`: cột `qr_staff_ids` (UUID array hoặc JSONB array chứa danh sách user ID được cấp phép soát vé).
  - `public.event_registrations`: lưu `ticket_code`, `status`, `lucky_draw_number`, `seat_table`.

### 3.10.3. UC-MOB-NOT-03: Chuẩn Hóa Phân Loại Thông Báo, Dấu Chấm Xanh Chưa Đọc, Rút Gọn Nội Dung & Thao Tác Vuốt Ngang Xóa Thông Báo
- **Mục tiêu**: Sửa triệt để lỗi lẫn lộn nội dung thông báo tin nhắn chat thành thông báo đóng hội phí; thay thế nhãn "MỚI" thô cứng bằng dấu chấm xanh tinh tế; bỏ icon cố định; tối ưu độ dài danh sách và hỗ trợ vuốt ngang sang trái (Swipe Left) để xóa thông báo nhanh chóng.
- **Màn hình**: `/association/notifications`.
- **Tác nhân**: Hội viên sử dụng ứng dụng di động.
- **Luồng sự kiện chính**:
  1. **Phân loại & Nội dung thông báo**:
     - Với thông báo có tin nhắn mới (`type === 'chat'` hoặc `ref_type === 'chat'`): Hiển thị tiêu đề "Tin nhắn mới từ [Tên người gửi]" và nội dung tóm tắt tin nhắn. Tuyệt đối không nhúng mẫu thông báo đóng hội phí hay nhắc nợ tài chính vào thông báo tin nhắn.
     - Với thông báo tài chính/hội phí (`type === 'fee'`): Hiển thị đúng kỳ hội phí, hạn đóng và số tiền cần nộp.
  2. **Giao diện & Trải nghiệm**:
     - *Dấu chấm xanh chưa đọc*: Bỏ chữ "MỚI", thay bằng dấu chấm tròn xanh dương tinh tế (`w-2.5 h-2.5 rounded-full bg-blue-600`) ở góc thông báo chưa đọc.
     - *Bỏ icon cố định*: Loại bỏ các khối icon hộp cứng nhắc theo từng loại, tối ưu hóa không gian cho văn bản.
     - *Rút gọn nội dung*: Hiển thị tối đa 2 dòng văn bản tóm tắt (`line-clamp-2`). Khi hội viên nhấp vào thông báo, ứng dụng mở Modal chi tiết hiển thị toàn văn nội dung và chuyển trạng thái thông báo thành đã đọc.
     - *Vuốt ngang để xóa (Swipe to Delete)*: Người dùng có thể vuốt thẻ thông báo sang trái để lộ nút Xóa màu đỏ và bấm để xóa ngay, hoặc vuốt hết cỡ để xóa tức thì. Bỏ hoàn toàn chức năng "Ẩn thông báo".
- **Đặc tả API**:
  - `GET /member-notifications`: Lấy danh sách thông báo của hội viên.
  - `DELETE /member-notifications/:id`: Xóa vĩnh viễn thông báo.
  - `PATCH /member-notifications/:id/read`: Đánh dấu đã đọc thông báo.
- **CSDL & Bảng liên kết**:
  - Bảng `public.member_notifications`: `id`, `member_id`, `type`, `title`, `content`, `is_read`, `created_at`.

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
1. **Lưu trữ Danh bạ & Danh thiếp Ngoại tuyến**: Thông tin danh bạ hội viên đã kết nối và tấm danh thiếp số cá nhân được lưu trữ an toàn trong bộ nhớ máy, cho phép tra cứu và quét mã chia sẻ ngay cả khi ở trên máy bay hoặc vùng mất sóng di động.
2. **Ví vé Sự kiện Ngoại tuyến**: Mã QR vé sự kiện và thông tin bàn tiệc VIP được lưu sẵn trong ví vé, sẵn sàng xuất trình check-in tại hội trường mà không phụ thuộc vào tốc độ mạng 4G.

### 4.5. Yêu cầu về Thiết kế Giao diện & Trải nghiệm Doanh nhân (Design & UX Standards)
1. **Bảng màu Nhận diện HanoiBA CEO 1983 Sang trọng**:
   - Sử dụng thống nhất: **Deep Cobalt Navy** kết hợp **Warm Amber Gold**.
   - Bo góc mềm mại, viền vàng kim loại và hiệu ứng rung phản hồi chân thực (Haptic Feedback) khi quét mã thành công.
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
| **AC-M02** | Thẻ điện tử & Quét mã QR kết nối động | Quét mã QR động hoặc chia sẻ liên kết truyền tải hồ sơ tức thì dưới 1 giây mà đối tác không cần cài app. |
| **AC-M03** | Chuông báo nền native cuộc gọi | Đổ chuông màn hình khóa khi app đang đóng; gác máy tức thì 0ms độ trễ cả hai đầu. |
| **AC-M04** | Trợ lý giọng nói Voice AI | Nhận diện tiếng Việt tự nhiên và tự động điều hướng màn hình ngay tức thì. |
| **AC-M05** | Ví vé sự kiện & Check-in 0.1s | Mở vé cuống VIP tăng sáng màn hình; quét QR điểm danh tức thì tại bàn lễ tân. |
| **AC-M06** | Nhận diện thương hiệu & Ngôn ngữ | Chuẩn màu Deep Cobalt Navy & Warm Amber Gold; chuẩn hóa toàn diện phong cách hành văn quản trị hiệp hội sang trọng, không dùng các từ ngữ kỹ thuật khô khan. |
| **AC-M07** | Hiệu năng & Độ mượt cảm ứng | Khởi động dưới 1.5 giây; phản hồi cảm ứng dưới 0.1 giây không giật khung hình. |
| **AC-M08** | Không lỗi mã nguồn | Kiểm tra type check `tsc --noEmit` đạt Exit code 0 (0 errors). |

---

# PHẦN 6: BỔ SUNG YÊU CẦU ĐIỀU CHỈNH ĐẶC THÙ (CẬP NHẬT THÁNG 10/2026)

### 6.1. Phân quyền Thao tác Di động theo 6 Ban Chuyên môn & Vai trò Hệ thống
1. **Phân quyền Tin tức Câu Lạc Bộ**:
   - Chỉ tài khoản thuộc các vai trò: **Quản trị (`quan_tri`)**, **Admin (`admin`)**, **Chủ tịch (`chu_tich`)**, hoặc **Trưởng ban chuyên môn (`truong_ban_*`)** mới có quyền Thêm mới, Chỉnh sửa, và Xóa tin tức câu lạc bộ.
   - Hội viên thường (`member`) chỉ có quyền xem tin tức, bình luận, tương tác; tuyệt đối ẩn và chặn mọi nút thao tác chỉnh sửa/xóa tin tức.
2. **Phân quyền Quét mã Check-in Sự kiện**:
   - Thao tác quét mã QR check-in đại biểu tại sự kiện tuân thủ nghiêm ngặt danh sách nhân sự được tích chọn trong phân quyền của CRM Hiệp hội (`qrScanners` / `qrStaff` được gán khi tạo sự kiện).
   - **Ngoại lệ đặc quyền**: Ba vai trò tối cao gồm **Quản trị (`quan_tri`)**, **Chủ tịch (`chu_tich`)**, và **Admin (`admin`)** luôn luôn có toàn quyền quét mã check-in tại tất cả mọi sự kiện mà không cần được phân công trước.

### 6.2. Trợ Lý AI Động (Dynamic Context AI Assistant)
1. **Nạp Dữ liệu Ngữ cảnh Hội viên Trực tiếp (Live Context Ingestion)**:
   - Trợ lý AI tự động truy vấn dữ liệu tài khoản thời gian thực của người dùng đang đăng nhập:
     + Danh sách sự kiện đã đăng ký (`registeredEvents`).
     + Danh sách cơ hội giao thương B2B đang quan tâm (`interestedOpportunities`).
     + Tổng số lượng bạn bè / hội viên kết nối (`connectedMembersCount`).
     + Các cuộc gặp gỡ B2B kết nối 1-on-1 sắp tới hoặc đang chờ xử lý (`b2bMeetings`).
     + Danh sách hóa đơn / niên liễm hội phí cần thanh toán (`pendingInvoices`).
2. **Khả năng Phản hồi Trực tiếp Tức thì**:
   - Khi hội viên hỏi bất kỳ câu hỏi nào liên quan đến tài khoản (ví dụ: *"Tôi đăng ký sự kiện nào không?"*, *"Tôi có quan tâm cơ hội nào không?"*, *"Tôi có bao nhiêu bạn bè?"*, *"Tôi có cuộc gặp kết nối nào không?"*, *"Tôi có hóa đơn nào phải thanh toán?"*), AI phản hồi chính xác, chi tiết với dữ liệu thực tế ngay lập tức.
3. **Cơ chế Dự phòng Đa mô hình (Multi-Model Resilient Fallback)**:
   - Trong trường hợp dịch vụ OpenRouter hoặc OpenAI gặp sự cố / hết hạn ngạch, hệ thống tự động kích hoạt mô hình miễn phí chất lượng cao hàng đầu hiện nay (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`) kết hợp bộ xử lý cục bộ thông minh bảo đảm dịch vụ hoạt động liên tục 24/7.

### 6.3. Quản lý Quyền Thông báo Đẩy Chủ động
1. **Loại bỏ Hộp thoại Yêu cầu Thông báo Tự động Khi Khởi động**:
   - Không tự ý kích hoạt `requestNotificationPermission()` khi người dùng vừa mở ứng dụng.
2. **Chuyển về Trung tâm Cài đặt Cá nhân**:
   - Tích hợp công tắc Bật/Tắt thông báo đẩy bên trong màn hình Hồ sơ cá nhân (`association.profile.tsx`).
   - Đồng bộ chuẩn hóa lề (padding) và phông chữ (typography) trên màn hình cá nhân để đạt độ đồng đều, cao cấp.

### 6.4. Tối Ưu Hóa Giao Diện & Tiết Giảm Sắc Vàng (Gold Hue Refinement)
1. **Giảm độ bão hòa màu vàng**: Tiết chế các mảng màu vàng/amber rực rỡ, ưu tiên nền trắng tinh tế, thẻ xanh Deep Cobalt Navy `#003B95` và viền xám bạc thanh lịch.
2. **Loại bỏ Section "Lịch sử hoạt động & giao dịch"**: Xóa hoàn toàn khối giao diện này ở màn hình trang chủ (`association.index.tsx`) để tối ưu hóa không gian hiển thị và giảm tải thị giác.
3. **Khắc phục Lỗi Padding Tin tức CLB**: Bổ sung phần đệm mép phải (`pr-4` / `after:w-4`) trên thanh cuộn ngang tin tức để thẻ tin cuối cùng không bị dính sát mép màn hình.

### 6.5. Khắc phục Triệt để Ô Nhập Tiền tệ VNĐ (StandardCurrencyInput & VndCurrencyInput)
- Loại bỏ cản trở của cờ soạn thảo bàn phím (`isComposingRef`) đối với các ô nhập liệu số và tiền tệ (`inputMode="numeric"`).
- Đảm bảo hỗ trợ 100% bàn phím số trên Android WebView, iOS và các bộ gõ tiếng Việt (Telex, VNI, EVKey, Unikey).


---

## Bổ sung 2026-10-14: Cài PWA trên iOS, Thông báo, Trợ lý AI theo tài khoản

### A. Luồng cài app trên iPhone/iPad (PWA)
1. Mở Safari → truy cập `/association` → popup hướng dẫn (`IosInstallPrompt`) → Chia sẻ → "Thêm vào MH chính".
2. Icon app: logo CEO1983 trên **nền trắng** (`apple-touch-icon.png` 180×180, không trong suốt). Tên: "CEO 1983".
3. Mở từ màn hình chính: chạy standalone, status bar trong suốt (`black-translucent`), mọi header né tai thỏ/Dynamic Island (`safe-area-inset-top`), thanh tab dưới né home indicator (`safe-area-inset-bottom`), ô nhập 16px để iOS không tự zoom.
4. Nếu đã cài bản cũ (icon nền đen): xóa app khỏi màn hình chính → cài lại (iOS lưu icon lúc cài).

### B. Thông báo đẩy
- App KHÔNG tự hỏi quyền thông báo khi khởi động. Người dùng bật/tắt tại **Cá nhân → Thông báo**.

### C. Trợ lý AI trả lời theo dữ liệu tài khoản
- Hỏi được: "tôi có bao nhiêu bạn bè", "cơ hội tôi đang quan tâm", "lịch hẹn của tôi", "sự kiện tôi đã đăng ký", "hóa đơn chưa thanh toán", "sản phẩm của tôi", "thông báo chưa đọc".
- Dữ liệu lấy realtime: `user_connections`, `opportunity_interests`, `opportunities`, `products`, `business_meetings(+participants)`, `event_registrations`, `invoices`, `member_notifications`.
- Mô hình: Gemini (2.5-flash → 2.0-flash) → OpenRouter model miễn phí (env `OPENROUTER_API_KEY` hoặc app_settings `openrouter_api_key`; `OPENROUTER_FREE_MODELS` để đổi danh sách) → trả lời số liệu chính xác từ DB nếu không có LLM.

### D. Tách biệt bộ quét QR & Quét mở link đăng ký sự kiện
- **Quét kết nối hội viên (`AssociationMemberQrModal.tsx`)**: Hỗ trợ quét cả danh thiếp hội viên và mã QR sự kiện; khi quét mã sự kiện hệ thống tự động đóng modal và điều hướng đến `/events/:id/register` để người dùng điền thông tin, tuyệt đối không tự đăng ký ngầm.
- **Quét soát vé đại biểu (`association.checkin.tsx`)**: Chỉ quét Thẻ vé điện tử của người tham dự. Khi quét nhầm mã QR sự kiện/đăng ký, hệ thống từ chối và báo lỗi yêu cầu xuất trình vé.

### E. Lịch hẹn 1-on-1 di động — Chỉ xuất hiện khi đối tác đồng ý (`association.members.tsx`)
- Tab "Lịch hẹn" phân chia 3 phân loại: **"Đã chốt"** (chỉ hiển thị cuộc gặp mà cả 2 bên đã xác nhận: `status === 'confirmed' || status === 'accepted'`), **"Chờ duyệt"** (các lời mời gửi đến hoặc gửi đi đang chờ phản hồi), và **"Tất cả"**.
- Hiển thị banner cảnh báo nổi bật khi có lời mời đang chờ hội viên phản hồi kèm nút bấm "Đồng ý" / "Từ chối" tiện lợi.

